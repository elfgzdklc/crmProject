import React, {useEffect, useState} from 'react';
import {Breadcrumbs, Button} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper, Badge} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useForm} from "react-hook-form";
import moment from "moment";
import alertSwal from "../../../components/alert";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {Modal} from "react-bootstrap";
import NumberFormat from "react-number-format";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const requests = await axios.post(`${path}api/definitions/requests/get-requests`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//     return {
//         props: {
//             requests: requests.data
//         }, // will be passed to the page component as props
//     }
// }
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

function Requests(props) {
    const {data: session} = useSession()
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("created_at");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const [assignedUser, setAssignedUser] = useState();
    const router = useRouter();
    const {register, watch, setValue, reset} = useForm();

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    async function getPermissionDetail() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/custom/get-user-permission',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                user_permission_id: session.user.permission_id
            }),
        }).then(function (response) {
            setLoading(false)
            if (response.data[0] === undefined || response.data[0].requests === 0) {
                if (session.user.permission_id === 1) {
                    alertAuthority(() => {
                        setTimeout(function () {
                            router.push("/dashboard")
                        }, 1000)
                    })
                } else {
                    alertAuthority(() => {
                        setTimeout(function () {
                            router.push("/userDashboard")
                        }, 1000)
                    })
                }
            } else {
                getRequests();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getRequests() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/definitions/requests/get-requests',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search
            }),
        }).then(function (response) {
            setRequests(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getAssignedUser(id) {
        await axios({
            method: 'post',
            url: '/api/definitions/requests/get-assigned-user',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                id: id
            }),
        }).then(function (response) {
            setAssignedUser(response.data.fullName)
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function acceptRequest(request_id, customer_id, trade_name, assignedUser) {
        await axios({
            method: 'post',
            url: '/api/definitions/requests/accept-request',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                request_id: request_id,
                customer_id: customer_id,
                trade_name: trade_name,
                assignedUser: assignedUser
            }),
        }).then(function (response) {
            handleCloseDetail();
            getRequests();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function rejectionRequest(request_id, customer_id, trade_name, assignedUser) {
        await axios({
            method: 'post',
            url: '/api/definitions/requests/rejection-request',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                request_id: request_id,
                customer_id: customer_id,
                trade_name: trade_name,
                assignedUser: assignedUser
            }),
        }).then(function (response) {
            handleCloseDetail();
            getRequests();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };


    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search]);

    const ActionCell = ({rowData, dataKey, ...props}) => {
        const speaker = (
            <Popover>
                <p>
                    {`${rowData.user.email}`}
                </p>
            </Popover>
        );
        return (
            <Table.Cell {...props}>
                <Whisper placement="top" speaker={speaker}>
                    <a>{rowData.user.email.toLocaleString()}</a>
                </Whisper>
            </Table.Cell>
        );
    };

    return (
        <div>
            <Title title="Talepler"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    href="/definitions/requests"
                >
                    Talepler
                </Link>
            </Breadcrumbs>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">
                </h5>
                <h5 className="fw-bold mb-0">
                    <div className="d-flex" role="search">
                        <input className="form-control form-control-sm  me-2" type="search" placeholder="Arama"
                               aria-label="Arama"
                               onChange={(e) => setSearch(e.target.value)}/>
                        <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                    </div>
                </h5>
            </div>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={requests}
                            cellBordered={true}
                            hover={true}
                            bordered={true}
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}
                            sortColumn={sortColumn}
                            sortType={sortType}
                        >
                            <Table.Column sortable={true} width={200}>
                                <Table.HeaderCell>Talep Oluşturma Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="created_at">
                                    {rowData => moment(rowData.created_at).format("DD.MM.YYYY")}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} width={150}>
                                <Table.HeaderCell>Firma Türü</Table.HeaderCell>
                                <Table.Cell dataKey="customer_type"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Firma Adı</Table.HeaderCell>
                                <Table.Cell dataKey="customer.trade_name"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Talebi Oluşturan Kişi</Table.HeaderCell>
                                <ActionCell dataKey="user.email"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={150}>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                                <Table.Cell dataKey="status">
                                    {
                                        rowData => {
                                            if (rowData.status === 0) {
                                                return (
                                                    <span className="waitBg ps-2 ">
                                                        <i className="far fa-clock waitBg"></i>


                                                    </span>
                                                )
                                            } else if (rowData.status === 1) {
                                                return (
                                                    <span className="confirmBg ps-2">
                                                        <i className="far fa-check-circle"></i>
                                                        <Badge className="me-2 bg-transparent"
                                                               content=" Onaylandı"/></span>
                                                )
                                            } else {
                                                return (
                                                    <span className="rejectionBg ps-2">
                                                        <i className=" fal fa-times-circle"></i>
                                                        <Badge className="me-2 bg-transparent"
                                                               content=" Reddedildi"/></span>
                                                )
                                            }
                                        }
                                    }
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Onayla/Reddet" onClick={() => {
                                                getAssignedUser(rowData.assigned_user_id);
                                                setValue("request_id", rowData.id);
                                                setValue("description", rowData.description);
                                                setValue("request_user", rowData.user.email);
                                                setValue("customer_type", rowData.customer_type);
                                                setValue("customer_id", rowData.customer.id);
                                                setValue("customer_trade_name", rowData.customer.trade_name);
                                                setValue("status", rowData.status);
                                                handleShowDetail();
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
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
                                    layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                                    total={total}
                                    limitOptions={[5, 10, 20, 50, 100]}
                                    limit={limit}
                                    activePage={page}
                                    onChangePage={setPage}
                                    onChangeLimit={handleChangeLimit}
                        />
                    </CustomProvider>
                </div>
            </div>

            <Modal show={showDetail} onHide={handleCloseDetail}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Talep Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="pb-2">Talep Oluşturan Personel</label>
                                    <input
                                        className="form-control form-control-sm mb-2" {...register("request_user")}
                                        readOnly/>
                                </div>
                                <div className="col-md-6">
                                    <label className=" pb-2">Talep Oluşturulan
                                        Personel</label>
                                    <input
                                        className="form-control form-control-sm mb-2"
                                        value={assignedUser}
                                        readOnly/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="pt-2 pb-2">Firma Türü</label>
                                    <input
                                        className="form-control form-control-sm " {...register("customer_type")}
                                        readOnly/>
                                </div>
                                <div className="col-md-6">
                                    <label className="pt-2 pb-2">Firma Adı</label>
                                    <input
                                        className="form-control form-control-sm" {...register("customer_trade_name")}
                                        readOnly/>
                                </div>
                            </div>
                            <input name="customer_id" value={watch("customer_id")}
                                   hidden/>
                            <div className="row">
                                <div className="col-md-12">
                                    <label className="pt-2 pb-2"> Açıklama</label>
                                    <textarea
                                        className="form-control  form-control-sm  w-100 mb-2"  {...register("description")}
                                        readOnly/>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {
                        watch("status") == 0 ? (
                            <a className="btn btn-sm text-success border-success  text-decoration-none"
                               title="Onayla"
                               onClick={() => {
                                   acceptRequest(watch("request_id"), watch("customer_id"), watch("customer_trade_name"), assignedUser)
                               }}>
                                <i className="far fa-check-circle text-success"></i> Onayla
                            </a>
                        ) : null
                    }
                    {
                        watch("status") == 0 ? (
                            <a className="btn btn-sm text-danger border-danger  text-decoration-none"
                               title="Reddet"
                               onClick={() => {
                                   rejectionRequest(watch("request_id"), watch("customer_id"), watch("customer_trade_name"), assignedUser)
                               }}>
                                <i className="far fa-ban text-danger"></i> Reddet
                            </a>
                        ) : null
                    }
                    <a className="btn btn-sm text-secondary border-secondary text-decoration-none"
                       title="Vazgeç"
                       onClick={() => {
                           handleCloseDetail();
                       }}>
                        <i className="far fa-times-circle text-secondary"></i> Vazgeç
                    </a>
                </Modal.Footer>
            </Modal>

        </div>
    );
}

Requests.auth = true;

export default Requests;
