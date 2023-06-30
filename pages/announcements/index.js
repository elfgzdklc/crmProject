import React, {useState, useEffect} from 'react';
import {Table, CustomProvider, Pagination} from "rsuite";
import {Breadcrumbs} from "@mui/material";
import Link from "@mui/material/Link";
import axios from "axios";
import {useForm} from "react-hook-form";
import askDelete from "../../components/askDelete";
import {locale} from "../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import moment from "moment";
import Title from "../../components/head";
import Modal from "react-bootstrap/Modal";


export async function getServerSideProps(context) {
    const token = context.req.cookies['__Crm-next-auth.session-token']
    if (token) {
        return {
            props: {
                token: token
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function Announcement(props) {
    const {
        watch: watchAnnoun
    } = useForm();
    const {
        register: registerAnnounDet,
        setValue: setValueAnnounDet,
    } = useForm();
    const {data: session} = useSession()
    const [announ, setAnnoun] = useState([]);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [u_id, setID] = useState(session.user.id);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");
    const [departments, setDepartments] = useState([]);
    const [showDetail, setShowDetail] = useState(false);

    async function getDepartments() {
        await axios({
            method: 'post',
            url: '/api/users/departments/get-departments',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                user_permission_id: session.user.permission_id
            }),
        }).then(function (response) {
            setDepartments(response.data);
        }).catch(function (error) {
            console.log(error);
        })
    }

    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const handleAnnouncements = async (announcement_id) => {
        await axios({
            method: 'POST',
            url: `/api/announcements/changer-read-status-announcements/`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                id: announcement_id
            }),
        }).then(function (res) {
            getAnnoun()
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleDeleteAnnoun = (id) => {
        let token = props.token;
        askDelete(`/api/announcements/user-announcement-delete/${id}`, token, function () {
            getAnnoun();
        })
    }

    async function getAnnoun() {
        setLoading(true);
        await axios({
            method: 'POST',
            url: '/api/announcements/get-user-announcements-list',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search,
                user_id: u_id
            }),
        }).then(function (response) {
            setAnnoun(response.data.data);
            setLoading(false);
        }).catch(function (error) {
                console.log(error);
            }
        )
    }

    useEffect(() => {
        getAnnoun();
        getDepartments();
    }, [limit, page, sortColumn, sortType, search, watchAnnoun]);

    return (
        <div>
            <Title title="Duyurular"/>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/staffManagement/staffManagement">
                        Duyurular
                    </Link>
                </Breadcrumbs>
                {/* start: Header */}
                <div className="px-3 py-2 bg-white rounded shadow  d-flex align-items-center justify-content-end">
                    <h5 className="fw-bold mb-0 ">
                        <div className="d-flex" role="search">
                            <input className="form-control form-control-sm  me-2" type="search" placeholder="Arama"
                                   aria-label="Arama"
                                   onChange={(e) => setSearch(e.target.value)}/>
                            <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                        </div>
                    </h5>
                </div>
                {/* end: Header */}
            </div>
            <div className={`px-3 mt-2 py-2 bg-white rounded shadow`}>
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            cellBordered={true}
                            hover={true}
                            bordered={true}
                            sortColumn={sortColumn}
                            sortType={sortType}
                            data={announ}
                            rowClassName={(row) => {
                                if (row?.status === 1) {
                                    return 'colorChange';
                                }
                            }}
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}>
                            <Table.Column width={150}>
                                <Table.HeaderCell>Tarih</Table.HeaderCell>

                                <Table.Cell
                                    dataKey="announcement.created_at">{rowData => moment(rowData.created_at).format('DD.MM.YYYY')}</Table.Cell>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Konu</Table.HeaderCell>
                                <Table.Cell dataKey="announcement.subject"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Açıklama</Table.HeaderCell>
                                <Table.Cell dataKey="announcement.message"/>
                            </Table.Column>
                            <Table.Column width={150} align="center" resizable>
                                <Table.HeaderCell>
                                    İşlemler
                                </Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                handleAnnouncements(rowData.id);
                                                setValueAnnounDet('id', rowData.id);
                                                setValueAnnounDet('created_at', moment(rowData.announcement.created_at).format('DD.MM.YYYY'));
                                                setValueAnnounDet('subject', rowData.announcement.subject);
                                                setValueAnnounDet('message', rowData.announcement.message);
                                                handleShowDetail();
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            <a className="cursor-pointer" title="Sil" onClick={() => {
                                                handleDeleteAnnoun(rowData.id)
                                            }}>
                                                <i className="fal fa-trash-alt me-2"></i>
                                            </a>
                                        </>
                                    )}
                                </Table.Cell>
                            </Table.Column>
                        </Table>
                        <Pagination className="mt-2"
                                    prev
                                    next
                                    first
                                    last
                                    ellipsis
                                    boundaryLinks
                                    maxButtons={5}
                                    size="xs"
                                    layout={['-', 'limit', '|', 'pager', 'skip']}
                                    limitOptions={[5, 10, 20, 50, 100]}
                                    limit={limit}
                                    activePage={page}
                                    onChangePage={setPage}
                                    onChangeLimit={handleChangeLimit}/>
                    </CustomProvider>
                </div>
            </div>

            {/*********Detail************/}
            <Modal show={showDetail} onHide={handleCloseDetail}>
                <Modal.Header>
                    <p className="modal-title fs-6 fw-semibold">
                        Duyuru Bilgileri
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12">
                            <label className="pt-2 pb-2">Tarih</label>
                            <input
                                className="form-control form-control-sm "  {...registerAnnounDet("created_at")}
                                readOnly/>
                            <label className="pt-2 pb-2">Konu</label>
                            <input
                                className="form-control form-control-sm "  {...registerAnnounDet("subject")}
                                readOnly/>
                            <label className="pt-2 pb-2">Açıklama </label>
                            <input
                                className="form-control form-control-sm " {...registerAnnounDet("message")}
                                readOnly/>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}

Announcement.auth = true;
export default Announcement;