import React, {useState, useEffect} from 'react';
import {Table, CustomProvider, Pagination} from "rsuite";
import {Breadcrumbs, Button} from "@mui/material";
import Link from "@mui/material/Link";
import axios from "axios";
import {useForm, Controller} from "react-hook-form";
import askDelete from "../../../components/askDelete";
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import alert from "../../../components/alert";
import moment from "moment";
import Title from "../../../components/head";
import Modal from "react-bootstrap/Modal";
import AsyncSelect from "react-select/async";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import Select from "react-select";

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

function AnnouncementManagement(props) {
    const {
        register: registerAnnoun,
        handleSubmit: handleSubmitAnnoun,
        setValue: setValueAnnoun,
        getValues: getValuesAnnoun,
        reset: resetAnnoun,
        watch: watchAnnoun,
        formState: {errors: errorsAnnoun},
        control: controlAnnoun
    } = useForm();

    const {register: registerAnnounDet, setValue: setValueAnnounDet,} = useForm();
    const {data: session} = useSession()
    const [announ, setAnnoun] = useState([]);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [u_id, setID] = useState(session.user.id);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState();
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");
    const [departments, setDepartments] = useState([]);
    const [defaultOptionsDepartments, setDefaultOptionsDepartments] = useState([]);
    const [inputValuesDepartments, setValuesDepartments] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const router = useRouter();

    async function getPermissionDetail() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/custom/get-user-permission/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                user_permission_id: session.user.permission_id
            }),
        }).then(function (response) {
            setLoading(false)
            console.log(response.data[0])
            if (response.data[0] === undefined || response.data[0].announcement_management === 0) {
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
                getAnnoun();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    //async function getDepartments() {
    //    await axios({
    //        method: 'post',
    //        url: '/api/users/departments/get-departments',
    //        headers: {
    //            'Content-Type': 'application/json',
    //            AuthToken: props.token
    //        },
    //        data: JSON.stringify({
    //            user_permission_id: session.user.permission_id
    //        }),
    //    }).then(function (response) {
    //        setDepartments(response.data);
    //    }).catch(function (error) {
    //        console.log(error);
    //    })
    //}


    const asyncGetDepartments = async (inputValuesEmployee) => {
        const res = await axios({
            method: 'get',
            url: `/api/users/departments/get-select-departments?query=${inputValuesEmployee}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        });
        setDepartments(res.data)
    };

    const handleInputChangeDepartments = value => {
        setValuesDepartments(value);
    };

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/announcements/add-user-announcements',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (res) {
            handleCloseAddModal();
            getAnnoun();
            alert(res.data.title, res.data.message, res.data.status, () => {
                resetAnnoun();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleDeleteAnnoun = (id) => {
        let token = props.token
        askDelete(`/api/announcements/management-announcement-delete/${id}`, token, function () {
            getAnnoun();
        })
    }

    async function getAnnoun() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/announcements/get-management-announcements-list',
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
            setTotal(response.data.total);
        }).catch(function (error) {
                console.log(error);
            }
        )
    }

    let departmentArray = [];
    let jsonAllDepartment = {
        "id": "345436546",
        "department_name": "Tüm Departmanlar"
    };
    departmentArray = departments.concat(jsonAllDepartment)
    const selectDepartment = departmentArray.map((department, index) => (
        {value: [department.id], label: [department.department_name]}
    ))

    useEffect(() => {
        getPermissionDetail();
        asyncGetDepartments("");
        //getDepartments();
    }, [limit, page, sortColumn, sortType, search, watchAnnoun]);

    return (
        <div>
            <Title title="Duyuru Yönetimi"/>
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
                <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                    <div className="row w-100">
                        <div className="col-md-4 col-12 mb-2 mb-md-0">
                            <h5 className="fw-bold mb-0">
                                <Button variant="outlined" className="text-capitalize btn-tk"
                                        onClick={() => {
                                            resetAnnoun();
                                            setValueAnnoun('id', 0);
                                            setValueAnnoun('department_id', "");
                                            setValueAnnoun('subject', "");
                                            setValueAnnoun('message', "");
                                            handleShowAddModal();
                                        }}
                                >
                                    <i className="fas fa-plus me-1"></i> Yeni Duyuru
                                </Button>

                            </h5>
                        </div>
                        <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                            <h5 className="fw-bold mb-0">
                                <div className="d-flex" role="search">
                                    <input className="form-control form-control-sm me-2" type="search"
                                           placeholder="Arama"
                                           aria-label="Arama"
                                           onChange={(e) => setSearch(e.target.value)}/>
                                    <button className="btn btn-outline-secondary"><i className="fal fa-search"></i>
                                    </button>
                                </div>
                            </h5>
                        </div>
                    </div>
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
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}>
                            <Table.Column width={150}>
                                <Table.HeaderCell>Tarih</Table.HeaderCell>

                                <Table.Cell
                                    dataKey="created_at">{rowData => moment(rowData.created_at).format('DD.MM.YYYY')}</Table.Cell>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Ekleyen</Table.HeaderCell>
                                <Table.Cell dataKey="user.email"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Departman</Table.HeaderCell>
                                <Table.Cell dataKey="department_name"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Konu</Table.HeaderCell>
                                <Table.Cell dataKey="subject"/>
                            </Table.Column>
                            <Table.Column width={200} align="center" resizable>
                                <Table.HeaderCell>
                                    İşlemler
                                </Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                setValueAnnounDet('id', rowData.id);
                                                setValueAnnounDet('department_id', rowData.department_id);
                                                setValueAnnounDet('subject', rowData.subject);
                                                setValueAnnounDet('message', rowData.message);
                                                setValueAnnounDet('department_name', rowData.department_name);
                                                handleShowDetail()
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            <a title="Düzenle"
                                               className="cursor-pointer text-decoration-none"
                                               onClick={() => {
                                                   resetAnnoun();
                                                   setValueAnnoun('id', rowData.id);
                                                   setValueAnnoun('department_id', {
                                                       value: rowData.department_id,
                                                       label: rowData.department_name
                                                   });
                                                   setDefaultOptionsDepartments(rowData.department_id);
                                                   setValueAnnoun('subject', rowData.subject);
                                                   setValueAnnoun('message', rowData.message);
                                                   handleShowAddModal()
                                               }}> <i className="fal fa-edit me-2"></i>
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
                                    layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                                    total={total}
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
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Duyuru Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6">
                            <label className="pb-2">Departman </label>
                            <input
                                className="form-control form-control-sm " {...registerAnnounDet("department_name")}
                                readOnly/>
                        </div>
                        <div className="col-md-6">
                            <label className="pb-2">Konu</label>
                            <input
                                className="form-control form-control-sm "  {...registerAnnounDet("subject")}
                                readOnly/>
                        </div>
                        <div className="col-md-12">
                            <label className="pt-2 pb-2">Açıklama </label>
                            <textarea
                                className="form-control form-control-sm " {...registerAnnounDet("message")}
                                readOnly/>
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm"
                            onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            {/*********Add************/}
            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header>
                    <p className="modal-title fs-6 fw-semibold">
                        Duyuru {watchAnnoun("id") && watchAnnoun("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitAnnoun(onSubmit)} id="form-department">
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <label className="my-1">Departman</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={controlAnnoun}
                                    name="department_id"
                                    defaultValue=""
                                    render={({field: {onChange, value}}) => (
                                        <Select
                                            isMulti
                                            name="department_id"
                                            value={value}
                                            defaultValue={defaultOptionsDepartments}
                                            noOptionsMessage={() => 'Aradığınız değer bulunamadı.'}
                                            options={departments}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            placeholder={'Departman Seçiniz'}
                                            onChange={(option) => {
                                                setDefaultOptionsDepartments(value => option.map(item => item.value))
                                                onChange(option)
                                            }}
                                            form="form-department"
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errorsAnnoun.department_id &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}

                            </div>
                            <div className="col-md-6">
                                <label className="my-1">Konu</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm " + (errorsAnnoun.subject ? "is-invalid" : "")}
                                    autoFocus={true} {...registerAnnoun("subject", {required: true})} />
                                {errorsAnnoun.subject &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                            <div className="col-12 mt-2">
                                <label className="my-1">Açıklama</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <textarea
                                    className={"form-control form-control-sm " + (errorsAnnoun.message ? "is-invalid" : "")}
                                    autoFocus={true} {...registerAnnoun("message", {required: true})} />
                                {errorsAnnoun.message &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseAddModal}>
                            Vazgeç
                        </button>
                        <button type="submit"
                                className="btn btn-tk-save btn-sm" {...registerAnnoun("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

        </div>
    );
}

AnnouncementManagement.auth = true;
export default AnnouncementManagement;