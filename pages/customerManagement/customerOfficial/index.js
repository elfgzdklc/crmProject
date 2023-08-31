import React, {useEffect, useState} from 'react';
import NumberFormat from "react-number-format";
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useForm, Controller} from 'react-hook-form';
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Button} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import deleteSwal from "../../../components/askDelete";
import alertSwal from "../../../components/alert";
import AsyncSelect from "react-select/async";
import {useSession} from "next-auth/react";
import Title from "../../../components/head";
import {useRouter} from "next/router";
import alertAuthority from "../../../components/alertAuthority";
import {Modal} from "react-bootstrap";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const customer_official = await axios.post(`${path}api/customer-management/customer-offical/get-customer-offical`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//     return {
//         props: {
//             customer_official: customer_official.data
//         },
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


function CustomerOfficial(props) {
    const [customerOfficial, setCustomerOfficial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const {register, handleSubmit, setValue, reset, control, formState: {errors}, watch} = useForm();
    const [defaultOptionsCustomers, setDefaultOptionsCustomers] = useState();
    const [inputValuesCustomers, setValuesCustomers] = useState('');
    const {data: session} = useSession();
    const router = useRouter();

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const [showOfficialCustomer, setShowOfficialCustomer] = useState(false);
    const handleCloseOfficialCustomer = () => setShowOfficialCustomer(false);
    const handleShowOfficialCustomer = () => setShowOfficialCustomer(true);

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
            if (response.data[0] === undefined ||  response.data[0].official_persons === 0) {
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
                getCustomerOfficial();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomerOfficial() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/customer-management/customer-official/get-customer-official',
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
            setCustomerOfficial(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const handleInputChangeCustomers = value => {
        setValuesCustomers(value);
    };

    const asyncGetCustomers = async (inputValuesEmployee) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/all-get-customers?query=${inputValuesEmployee}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        return (res.data)
    };

    const onSubmit = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customer-official/add-edit-customer-official',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseOfficialCustomer();
            getCustomerOfficial();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    };

    const deleteCustomerOfficial = async (id) => {
        let getToken = props.token;
        deleteSwal(`/api/customer-management/customer-official/delete-customer-official/${id}`, getToken, () => {
            getCustomerOfficial();
        });
    }

    const importExcel = async (e) => {
        let fileObj = e.target.files[0];
        const formData = new FormData();
        formData.append("excel", fileObj);
        setLoading(true);
        await axios({
            method: 'post',
            url: "/api/customer-management/customer-official/excel-create",
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            if (response.data.status === "success") {
                alertSwal(response.data.title, response.data.message, response.data.status, () => {
                    setLoading(false);
                    getCustomerOfficial();
                    document.getElementById('uploadFile').value = "";   //onChange işlemi için reset görevi görüyor
                })
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    const importExcelCustomerOfficial = async (e) => {
        let fileObj = e.target.files[0];
        const formData = new FormData();
        formData.append("excel", fileObj);
        setLoading(true);
        await axios({
            method: 'post',
            url: "/api/customer-management/customer-official/excel-create-customer-official",
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            if (response.data.status === "success") {
                alertSwal(response.data.title, response.data.message, response.data.status, () => {
                    setLoading(false);
                    getCustomerOfficial();
                    document.getElementById('uploadFile').value = "";   //onChange işlemi için reset görevi görüyor
                })
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search, watch, defaultOptionsCustomers]);


    return (
        <div>
            <Title title="Yetkili Kişiler"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-md-7 p-2">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link
                            underline="none"
                            color="inherit"
                            href="/customerManagement/customerOfficial"
                        >
                            Yetkili Kişiler
                        </Link>
                    </Breadcrumbs>
                </div>
                <div className="col-md-5 d-flex justify-content-end">
                    <label className="custom-file-upload border rounded me-2 p-2 fw-semibold cursor-pointer">
                        <input type="file" onChange={importExcel} id="uploadFile" hidden/>
                        <i className="fa fa-cloud-upload cursor-pointer"></i> Yükle
                    </label>
                    <label className="custom-file-upload border rounded me-2 p-2 fw-semibold cursor-pointer">
                        <input type="file" onChange={importExcelCustomerOfficial} id="uploadFile" hidden/>
                        <i className="fa fa-cloud-upload cursor-pointer"></i> Firma - Yetkili Kişi
                    </label>
                </div>
            </div>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row w-100">
                    <div className="col-md-4 col-12 mb-2 mb-md-0">
                        <h5 className="fw-bold mb-0">
                            <Button variant="outlined" className="text-capitalize btn-custom"
                                    onClick={() => {
                                        reset();
                                        setValue("id", 0);
                                        setValue('customer', '');
                                        setValue('name', '');
                                        setValue('title', '');
                                        setValue('surname', '');
                                        setValue('email', '');
                                        setValue('phone', '');
                                        setDefaultOptionsCustomers([]);
                                        handleShowOfficialCustomer();
                                    }}>
                                <i className="fas fa-plus me-1"></i> Yeni Kişi
                            </Button>
                        </h5>
                    </div>
                    <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                        <h5 className="fw-bold mb-0">
                            <div className="d-flex" role="search">
                                <input className="form-control form-control-sm  me-2" type="search" placeholder="Arama"
                                       aria-label="Arama"
                                       onChange={(e) => setSearch(e.target.value)}/>
                                <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                            </div>
                        </h5>
                    </div>
                </div>
            </div>

            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={customerOfficial}
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
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Id</Table.HeaderCell>
                                <Table.Cell dataKey="id"/>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Ad</Table.HeaderCell>
                                <Table.Cell dataKey="name"/>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Soyad</Table.HeaderCell>
                                <Table.Cell dataKey="surname"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Telefon</Table.HeaderCell>
                                <Table.Cell dataKey="phone"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Email</Table.HeaderCell>
                                <Table.Cell dataKey="email"/>
                            </Table.Column>
                            <Table.Column width={150}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                setValue('id', rowData.id);
                                                setValue('name', rowData.name);
                                                setValue('title', rowData.title);
                                                setValue('surname', rowData.surname);
                                                setValue('email', rowData.email);
                                                setValue('phone', rowData.phone);
                                                handleShowDetail()
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            <a className="cursor-pointer" title="Düzenle"
                                               onClick={() => {
                                                   reset();
                                                   setValue('id', rowData.id);
                                                   setValue('name', rowData.name);
                                                   setValue('title', rowData.title);
                                                   setValue('surname', rowData.surname);
                                                   setValue('email', rowData.email);
                                                   setValue('phone', rowData.phone);
                                                   handleShowOfficialCustomer();
                                               }}>
                                                <i className="fal fa-edit me-2"></i>
                                            </a>
                                            {
                                                session.user.permission_id === 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        deleteCustomerOfficial(rowData.id)
                                                    }}>
                                                        <i className="fal fa-trash-alt"></i>
                                                    </a>
                                                ) : null
                                            }
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
                        Yetkili Kişi Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12">
                            <label className="pb-2">Ünvan</label>
                            <input
                                className="form-control form-control-sm "  {...register("title")}
                                readOnly/>
                        </div>
                        <div className="col-md-6">
                            <label className="pt-2 pb-2">Ad</label>
                            <input
                                className="form-control form-control-sm "  {...register("name")}
                                readOnly/>
                        </div>
                        <div className="col-md-6">
                            <label className="pt-2 pb-2">Soyad </label>
                            <input
                                className="form-control form-control-sm" {...register("surname")}
                                readOnly/>
                        </div>
                        <div className="col-md-6">
                            <label className="pt-2 pb-2">Email </label>
                            <input
                                className="form-control form-control-sm" {...register("email")}
                                readOnly/>
                        </div>
                        <div className="col-md-6">
                            <label className="pt-2 pb-2">Telefon </label>
                            <input
                                className="form-control form-control-sm" {...register("phone")}
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

            <Modal show={showOfficialCustomer} onHide={handleCloseOfficialCustomer}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Kişi {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)} id="1">
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12 col-lg-12">
                                {
                                    watch("id") == 0 ? (
                                        <>
                                            <label className="mb-2">Firma Seçiniz</label>
                                            <Controller
                                                control={control}
                                                defaultValue
                                                name="customer"
                                                render={({field: {onChange, name, value}}) => (
                                                    <AsyncSelect
                                                        cacheOptions
                                                        defaultOptions
                                                        value={defaultOptionsCustomers}
                                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                                        loadingMessage={() => "Yükleniyor..."}
                                                        loadOptions={asyncGetCustomers}
                                                        placeholder={'Firma Seçiniz'}
                                                        name="customer"
                                                        onInputChange={handleInputChangeCustomers}
                                                        onChange={(option) => {
                                                            setDefaultOptionsCustomers(option)
                                                            onChange(option)
                                                        }}
                                                        form="1"
                                                    />
                                                )}
                                            />
                                        </>) : null
                                }
                            </div>
                            <div className="col-12 col-lg-12">
                                <label className="pt-2 pb-2">Ünvan</label>
                                <input type="text" form="1"
                                       className={"form-control form-control-sm "}
                                       name="title"
                                       {...register("title")}/>
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="pt-2 pb-2">Ad</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input type="text" form="1"
                                       className={"form-control form-control-sm " + (errors.name ? "is-invalid" : "")}
                                       name="name"
                                       {...register("name", {required: true})}/>
                                {errors.name &&
                                    <div className="invalid-feedback text-start">Bu
                                        alan
                                        zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="pt-2 pb-2">Soyad</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input type="text" form="1"
                                       className={"form-control form-control-sm " + (errors.surname ? "is-invalid" : "")}
                                       name="surname"
                                       {...register("surname", {required: true})}/>
                                {errors.surname &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="pt-2 pb-2">Telefon </label>
                                <input name="phone"
                                       className={"form-control form-control-sm "}
                                       {...register("phone")}/>
                            </div>
                            <div className="col-12 col-lg-6">
                                <label className="pt-2 pb-2">Email</label>
                                <input type="email" name="email"
                                       className={"form-control form-control-sm "}
                                       {...register("email")}/>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseOfficialCustomer}>Vazgeç
                        </button>
                        <button type="submit" form="1"
                                className="btn btn-custom-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

        </div>
    )
        ;
}

CustomerOfficial.auth = true;

export default CustomerOfficial;
