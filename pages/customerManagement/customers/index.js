import React, {useEffect, useState} from 'react';
import NumberFormat from "react-number-format";
import {Breadcrumbs, Button} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useForm, Controller} from 'react-hook-form';
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import deleteSwal from "../../../components/askDelete";
import alertSwal from "../../../components/alert";
import {ExportExcel} from "../../../components/exportExcel";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import {Modal} from "react-bootstrap";
import Title from "../../../components/head";
import {useRouter} from "next/router";
import alertAuthority from "../../../components/alertAuthority";
import NoData from "../../../components/NoData";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const customers = await axios.post(`${path}api/customer-management/customers/get-customers`, {
//         limit: 10, page: 1, sortColumn: 'id', sortType: 'desc', search: '', userLiable: '', userId: '',
//     });
//     return {
//         props: {
//             customers: customers.data
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

function Customers(props) {
    const [customers, setCustomers] = useState([]);
    const [userLiable, setUserLiable] = useState("");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const [defaultOptions, setDefaultOptions] = useState();
    const {data: session} = useSession();
    const router = useRouter();
    const [userId, setUserId] = useState(session.user.id);
    const [customerCategories, setCustomerCategories] = useState([]);
    const [countries, setCountry] = useState([]);
    const [provinces, setProvince] = useState([]);
    const [districtes, setDistrict] = useState([]);
    const [countryId, setCountryId] = useState(null);
    const [provinceId, setProvinceId] = useState(null);
    const [districtId, setDistrictId] = useState(null);
    const [sheetDataCustomer, setSheetDataCustomer] = useState([]); // export işlemi için
    const fileName = 'firmalar';
    const [defaultOptionsEmployee, setDefaultOptionsEmployee] = useState();
    const [inputValues, setValues] = useState('');
    const [inputValuesEmployee, setValuesEmplooye] = useState('');
    const [defaultOptionsEmployeeRequest, setDefaultOptionsEmployeeRequest] = useState();
    const [defaultOptionsCustomerRequest, setDefaultOptionsCustomerRequest] = useState();
    const [defaultOptionsCustomerOfficial, setDefaultOptionsCustomerOfficial] = useState();
    const [inputValuesEmployeeRequest, setValuesEmployeeRequest] = useState('');
    const [inputValuesCustomerOfficial, setValuesCustomerOfficial] = useState('');
    const [shipmentAddress, setShipmentAddress] = useState([])
    const [officialDetail, setOfficialDetail] = useState([]);
    const [employeeId, setEmployeeId] = useState();

    const [defaultOptionsCountry, setDefaultOptionsCountry] = useState();
    const [defaultOptionsProvince, setDefaultOptionsProvince] = useState();
    const [defaultOptionsDistrict, setDefaultOptionsDistrict] = useState();

    const [showCustomerDetail, setShowCustomerDetail] = useState(false);
    const handleCloseCustomerDetail = () => setShowCustomerDetail(false);
    const handleShowCustomerDetail = () => setShowCustomerDetail(true);

    const [showCustomers, setShowCustomers] = useState(false);
    const handleCloseCustomers = () => setShowCustomers(false);
    const handleShowCustomers = () => setShowCustomers(true);

    const [showUserCustomerModal, setShowUserCustomerModal] = useState(false);
    const handleCloseUserCustomerModal = () => setShowUserCustomerModal(false);
    const handleShowUserCustomerModal = () => setShowUserCustomerModal(true);

    const [showUserCustomerModalDetail, setShowUserCustomerModalDetail] = useState(false);
    const handleCloseUserCustomerModalDetail = () => setShowUserCustomerModalDetail(false);
    const handleShowUserCustomerModalDetail = () => setShowUserCustomerModalDetail(true);

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const [showDetailNotOfficial, setShowDetailNotOfficial] = useState(false);
    const handleCloseDetailNotOfficial = () => setShowDetailNotOfficial(false);
    const handleShowDetailNotOfficial = () => setShowDetailNotOfficial(true);

    const [showShippingAddress, setShowShippingAddress] = useState(false);
    const handleCloseShippingAddress = () => setShowShippingAddress(false);
    const handleShowShippingAddress = () => setShowShippingAddress(true);

    const [showCustomerOfficial, setShowCustomerOfficial] = useState(false);
    const handleCloseCustomerOfficial = () => setShowCustomerOfficial(false);
    const handleShowCustomerOfficial = () => setShowCustomerOfficial(true);

    const {register, handleSubmit, setValue, reset, control, formState: {errors}, watch} = useForm();
    const {
        handleSubmit: handleSubmitAssignment,
        reset: resetAssignment,
        setValue: setValueAssignment,
        control: controlAssignment,
        formState: {errors: errorsAssignment},
    } = useForm();   //atama işlemleri

    const {
        register: registerRequest,
        handleSubmit: handleSubmitRequest,
        setValue: setValueRequest,
        reset: resetRequest,
        control: controlRequest,
        formState: {errors: errorsRequest},
    } = useForm();   //talep oluşturma işlemleri

    const {
        handleSubmit: handleSubmitCustomerOfficial,
        setValue: setValueCustomerOfficial,
        reset: resetCustomerOfficial,
        control: controlCustomerOfficial,
        formState: {errors: errorsCustomerOfficial},
    } = useForm();   // yetkili kişiler için


    const {
        register: registerShippingAddress,
        handleSubmit: handleSubmitShippingAddress,
        setValue: setValueShippingAddress,
        formState: {errors: errorsShippingAddress},
        watch: watchShippingAddress,
        control: controlShippingAddress,
        reset: resetShippingAddress,
    } = useForm(); //sevkiyat adresi

    const [userCustomers, setUserCustomers] = useState();

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
            if (response.data[0] === undefined || response.data[0].customers === 0) {
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
                getCustomers();
                getCustomersExcel();
                getUserLiable();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getUserLiable() {
        await axios({
            method: 'post',
            url: '/api/custom/get-user-liable',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setUserLiable(response.data[0].user_liable);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleInputChangeEmployee = value => {
        setValuesEmplooye(value);
    };   //atama için personel seçimi

    const handleInputChangeEmployeeRequest = value => {   // talep için personel seçimi
        setValuesEmployeeRequest(value);
    }

    const handleInputChangeCustomerOfficial = value => {   // talep için personel seçimi
        setValuesCustomerOfficial(value);
    }

    const asyncGetEmployees = async (inputValuesEmployee) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/get-employees?query=${inputValuesEmployee}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        return (res.data)
    };

    const asyncGetCustomers = async (inputValues) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/get-customers?query=${inputValues}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        return (res.data)
    };

    const asyncGetCustomersToUser = async (employeeId, inputValuesCustomersToUser) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/get-customers-to-users?id=${employeeId}&query=${inputValuesCustomersToUser}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        setUserCustomers(res.data);
    };

    const asyncGetCustomersOfficial = async (inputValuesCustomerOffical) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/all-get-customer-official?query=${inputValuesCustomerOffical}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        return (res.data)
    };

    async function getCustomers() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/get-customers',
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
            }),
        }).then(function (response) {
            setCustomers(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomersExcel() {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/get-customers-excel',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                search: search
            }),
        }).then(function (response) {
            let jsonData = [];
            for (let i = 0; i < response.data.data.length; i++) {
                jsonData.push({
                    "Firma / Tedarikçi": response.data.data[i].type == 0 ? "Firma" : "Tedarikçi",
                    "Firma Kategorisi": response.data.data[i].customerCategory && response.data.data[i].customerCategory != null ? customerCategory : "-",
                    "Firma Kodu": response.data.data[i].customer_code != null ? response.data.data[i].customer_code : "-",
                    "Firma Adı": response.data.data[i].trade_name != null ? response.data.data[i].trade_name : "-",
                    "Vergi Dairesi": response.data.data[i].tax_administration != null ? response.data.data[i].tax_administration : "-",
                    "Vergi Numarası": response.data.data[i].tax_number != null ? response.data.data[i].tax_number : "-",
                    "Ülke": response.data.data[i].customerContact && response.data.data[i].customerContact.country_name != null ? response.data.data[i].customerContact.country_name : "-",
                    "İl": response.data.data[i].customerContact && response.data.data[i].customerContact.province_name != null ? response.data.data[i].customerContact.province_name : "-",
                    "İlçe": response.data.data[i].customerContact && response.data.data[i].customerContact.district_name != null ? response.data.data[i].customerContact.district_name : "-",
                    "Posta Kodu": response.data.data[i].customerContact && response.data.data[i].customerContact.zip_code != null ? response.data.data[i].customerContact.zip_code : "-",
                    "Adres": response.data.data[i].customerContact && response.data.data[i].customerContact.address != null ? response.data.data[i].customerContact.address : "-",
                })
                setSheetDataCustomer(jsonData);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomerCateories() {
        await axios({
            method: 'post', url: '/api/customer-management/customers/get-customer-categories',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setCustomerCategories(response.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const asyncGetCountries = async (inputValuesCountry) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/get-countries?query=${inputValuesCountry}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        setCountry(res.data)
    };

    const asyncGetProvinces = async (id, inputValuesProvince) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/get-provinces?id=${id}&query=${inputValuesProvince}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        setProvince(res.data)
    };

    const asyncGetDistricts = async (id, inputValuesDistricts) => {
        const res = await axios({
            method: 'get',
            url: `/api/custom/get-district?id=${id}&query=${inputValuesDistricts}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        setDistrict(res.data)
    };

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const onSubmit = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/add-edit-customer',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseCustomers();
            getCustomers();
            getCustomersExcel();
            asyncGetCustomers("");
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    };

    const onSubmitAssignment = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/add-user-customers-assignment',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            setLoading(false);
            handleCloseUserCustomerModal();
            getCustomers();
            getCustomersExcel();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetAssignment()
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmitRequest = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/add-user-customers-request',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseUserCustomerModalDetail();
            setLoading(false);
            getCustomers();
            getCustomersExcel();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetRequest();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmitCustomerOfficial = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/add-customers-official',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseCustomerOfficial();
            setLoading(false);
            getCustomers();
            getCustomersExcel();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetCustomerOfficial();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const deleteCustomer = async (id) => {
        let getToken = props.token;
        deleteSwal(`/api/customer-management/customers/delete-customer/${id}`, getToken, () => {
            getCustomers();
        });
    }

    const deleteCustomerOfficial = async (customer_id, id, official_id) => {
        let getToken = props.token;
        deleteSwal(`/api/customer-management/delete-customer-official?id=${id}&customerId=${customer_id}&officialId=${official_id}`, getToken, () => {
            handleCloseDetail();
            getCustomerOfficialDetail(customer_id);
        });
    }

    const importExcel = async (e) => {
        let fileObj = e.target.files[0];
        const formData = new FormData();
        formData.append("excel", fileObj);
        setLoading(true);
        await axios({
            method: 'post',
            url: "/api/customer-management/customers/excel-create",
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            if (response.data.status === "success") {
                alertSwal(response.data.title, response.data.message, response.data.status, () => {
                    setLoading(false);
                    getCustomers();
                    getCustomersExcel();
                })
            }
            document.getElementById('uploadFile').value = "";   //onChange işlemi için reset görevi görüyor
        }).catch(function (error) {
            console.log(error);
        })
    }

    async function getCustomerOfficialDetail(customer_id) {
        await axios({
            method: 'post',
            url: '/api/custom/get-customer-official-detail',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                customer_id: customer_id
            }
        }).then(function (response) {
            if (response.data.length == 0) {
                handleShowDetailNotOfficial();
            } else {
                setOfficialDetail(response.data)
                handleShowDetail();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getShippingAddress(customer_id) {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/customer-shipping-address',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                customer_id: customer_id
            }
        }).then(function (response) {
            if (response.data.length == 0) {
                resetShippingAddress()
                handleShowShippingAddress();
                setValueShippingAddress("id", 0);
                setValueShippingAddress('customerId', customer_id);
                setCountryId(null);
                setProvinceId(null);
                setDistrictId(null);
            } else {
                console.log(response.data)
                setValueShippingAddress("id", customer_id);
                setValueShippingAddress('customerId', customer_id);
                setValueShippingAddress('zip_code', response.data[0].zip_code);
                setValueShippingAddress('address', response.data[0].address);
                setCountryId(response.data[0].country_id);
                setProvinceId(response.data[0].province_id);
                setDistrictId(response.data[0].district_id);
                setValueShippingAddress('country', {
                    value: response.data[0].country_id,
                    label: response.data[0].country_name
                });
                if (response.data[0].country_id === 232) {
                    setValueShippingAddress('province', {
                        value: response.data[0].province_id,
                        label: response.data[0].province_name
                    });
                    setValueShippingAddress('district', {
                        value: response.data[0].district_id,
                        label: response.data[0].district_name
                    });
                } else {
                    setValueShippingAddress('province', response.data[0].province_name);
                    setValueShippingAddress('district', response.data[0].district_name);
                }
                handleShowShippingAddress();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getShippingAddressToCustomer(customer_id) {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/customer-shipping-address',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                customer_id: customer_id
            }
        }).then(function (response) {
            setShipmentAddress(response.data[0])
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmitShippingAddress = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/add-edit-customer-shipping-address',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseShippingAddress();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetShippingAddress();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        asyncGetCountries("");
        asyncGetProvinces(countryId, "");
        asyncGetDistricts(provinceId, "");
    }, [countryId, provinceId, districtId])

    useEffect(() => {
        getPermissionDetail();
        getCustomerCateories();
        asyncGetCustomers("");
    }, [limit, page, sortColumn, sortType, search, watch]);

    const ActionCell = ({rowData, dataKey, ...props}) => {
        const speaker = (
            <Popover>
                <p>
                    {`${rowData.trade_name}`}
                </p>
            </Popover>
        );
        return (
            <Table.Cell {...props}>
                <Whisper placement="top" speaker={speaker}>
                    <a>{rowData[dataKey].toLocaleString()}</a>
                </Whisper>
            </Table.Cell>
        );
    };

    return (
        <div>
            <Title title="Firmalar"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-md-7 p-2">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link
                            underline="none"
                            color="inherit"
                            href="/customerManagement/customers"
                        >
                            Firmalar
                        </Link>
                    </Breadcrumbs>
                </div>
                <div className="col-md-5 d-flex justify-content-end">
                    <label className="custom-file-upload border rounded me-2 p-2 fw-semibold cursor-pointer">
                        <input type="file" onChange={importExcel} id="uploadFile" hidden/>
                        <i className="fa fa-cloud-upload cursor-pointer"></i> Yükle
                    </label>
                    <ExportExcel excelData={sheetDataCustomer} fileName={fileName}/>
                </div>
            </div>

            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row  w-100">
                    <div className="col-md-8 col-12 mb-2 mb-md-0">
                        <h5 className="fw-bold mb-0">
                            <Button variant="outlined" className="text-capitalize btn-custom btn-sm mb-2 mb-md-0"
                                    onClick={() => {
                                        reset();
                                        setValue("id", 0);
                                        setValue("type", "");
                                        setValue("category_id", "");
                                        setValue("trade_name", "");
                                        setValue("tax_administration", "");
                                        setValue("tax_number", "");
                                        setValue("customer_code", "");
                                        setValue("country_id", null);
                                        setValue("province_id", null);
                                        setValue("district_id", null);
                                        setCountryId(null);
                                        setProvinceId(null);
                                        setDistrictId(null);
                                        setValue("zip_code", "");
                                        setValue("address", "");
                                        handleShowCustomers()
                                        asyncGetCountries("")
                                    }}>
                                <i className="fas fa-plus me-1"></i> Yeni Firma / Tedarikçi
                            </Button>
                            {
                                userLiable === 1 ? (
                                    <Button variant="outlined" type="button"
                                            className="text-capitalize btn-custom btn-sm mx-2  mb-2 mb-md-0 mbl-ms-0"
                                            onClick={() => {
                                                resetAssignment();
                                                asyncGetCustomers("")
                                                handleShowUserCustomerModal();
                                            }}>
                                        <i className="far fa-users-cog me-1 "></i>Kullanıcı İşlemleri
                                    </Button>) : null
                            }
                            {
                                userLiable === 1 ? (
                                    <Button variant="outlined" className="text-capitalize btn-custom btn-sm  mb-2 mb-md-0"
                                            onClick={() => {
                                                resetRequest();
                                                setValueRequest("description", "");
                                                handleShowUserCustomerModalDetail();
                                            }}>
                                        <i className="far fa-file-signature me-1"></i> Talep Oluştur
                                    </Button>) : null
                            }
                        </h5>
                    </div>
                    <div className="col-md-4 col-12 d-flex justify-content-end pe-0">
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
                            data={customers}
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
                                <Table.HeaderCell>Firma Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="customer_code"/>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Firma / Tedarikçi</Table.HeaderCell>
                                <Table.Cell dataKey="type">
                                    {rowData => rowData.type == 0 ? "Firma" : "Tedarikçi"}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column flexGrow={2} sortable={true}>
                                <Table.HeaderCell>Firma Adı</Table.HeaderCell>
                                <ActionCell dataKey="trade_name"/>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Vergi Numarası</Table.HeaderCell>
                                <Table.Cell dataKey="tax_number"/>
                            </Table.Column>
                            <Table.Column>
                                <Table.HeaderCell>Kategori</Table.HeaderCell>
                                <Table.Cell dataKey="customerCategory.category_name"/>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (<>
                                        <a className="cursor-pointer" title="Detay" onClick={() => {
                                            getShippingAddressToCustomer(rowData.id)
                                            setValue('id', rowData.id);
                                            setValue('type', rowData.type == 0 ? "Firma" : "Tedarikçi");
                                            setValue('customer_code', rowData.customer_code);
                                            setValue('trade_name', rowData.trade_name);
                                            setValue('tax_administration', rowData.tax_administration);
                                            setValue('tax_number', rowData.tax_number);
                                            setValue('category_name', rowData.customerCategory ? rowData.customerCategory.category_name : "");
                                            setValue('country_name', rowData.customerContact ? rowData.customerContact.country_name : "");
                                            setValue('province_name', rowData.customerContact ? rowData.customerContact.province_name : "");
                                            setValue('district_name', rowData.customerContact ? rowData.customerContact.district_name : "");
                                            setValue('zip_code', rowData.customerContact ? rowData.customerContact.zip_code : "");
                                            setValue('address', rowData.customerContact ? rowData.customerContact.address : "");
                                            handleShowCustomerDetail()
                                        }}>
                                            <i className="fal fa-info-circle me-2"></i>
                                        </a>
                                        <a className="cursor-pointer" title="Düzenle"
                                           onClick={() => {
                                               reset();
                                               setValue('id', rowData.id);
                                               setValue('customer_code', rowData.customer_code);
                                               setValue('trade_name', rowData.trade_name);
                                               setValue('type', rowData.type);
                                               setValue('tax_administration', rowData.tax_administration);
                                               setValue('tax_number', rowData.tax_number);
                                               setValue('category_id', rowData.customerCategory ? rowData.customerCategory.id : "");
                                               setValue('category_name', rowData.customerCategory ? rowData.customerCategory.category_name : "");
                                               setValue('zip_code', rowData.customerContact ? rowData.customerContact.zip_code : "");
                                               setValue('address', rowData.customerContact ? rowData.customerContact.address : "");
                                               setValue('country', {
                                                   value: rowData.customerContact ? rowData.customerContact.country_id : "",
                                                   label: rowData.customerContact ? rowData.customerContact.country_name : ""
                                               });
                                               if (rowData.customerContact && rowData.customerContact.country_id === 232) {
                                                   setValue('province', {
                                                       value: rowData.customerContact ? rowData.customerContact.province_id : "",
                                                       label: rowData.customerContact ? rowData.customerContact.province_name : ""
                                                   });
                                                   setValue('district', {
                                                       value: rowData.customerContact ? rowData.customerContact.district_id : "",
                                                       label: rowData.customerContact ? rowData.customerContact.district_name : ""
                                                   });
                                               } else {
                                                   setValue('province', rowData.customerContact ? rowData.customerContact.province_name : "");
                                                   setValue('district', rowData.customerContact ? rowData.customerContact.district_name : "");
                                               }
                                               setCountryId(rowData.customerContact ? rowData.customerContact.country_id : "");
                                               setProvinceId(rowData.customerContact ? rowData.customerContact.province_id : "");
                                               setDistrictId(rowData.customerContact ? rowData.customerContact.district_id : "");
                                               setDefaultOptionsCountry(rowData.customerContact ? rowData.customerContact.country_id : "");
                                               setDefaultOptionsProvince(rowData.customerContact ? rowData.customerContact.province_id : "");
                                               setDefaultOptionsDistrict(rowData.customerContact ? rowData.customerContact.district_id : "");
                                               handleShowCustomers()
                                           }
                                           }>
                                            <i className="fal fa-edit me-2"></i>
                                        </a>
                                        {
                                            session.user.permission_id === 1 ? (
                                                <a className="cursor-pointer" title="Sil" onClick={() => {
                                                    deleteCustomer(rowData.id)
                                                }}>
                                                    <i className="fal fa-trash-alt me-2"></i>
                                                </a>
                                            ) : null
                                        }
                                        <a className="cursor-pointer" title="Yetkili Kişi Ekleme"
                                           onClick={() => {
                                               resetCustomerOfficial();
                                               setValueCustomerOfficial("customer_id", rowData.id)
                                               handleShowCustomerOfficial();
                                           }}>
                                            <i className="fal fa-user-plus me-2"></i>
                                        </a>
                                        <a className="cursor-pointer"
                                           title="Yetkili Kişi Listeleme"
                                           onClick={() => {
                                               getCustomerOfficialDetail(rowData.id);
                                           }}>
                                            <i className="fal fa-user-shield me-2"></i>
                                        </a>
                                        <a className="cursor-pointer" title="Sevkiyat Adresi"
                                           onClick={() => {
                                               getShippingAddress(rowData.id)
                                           }}>
                                            <i className="fal fa-dolly-flatbed-alt me-2"></i>
                                        </a>
                                    </>)}
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

            <Modal show={showCustomerDetail} onHide={handleCloseCustomerDetail} size="xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Firma Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-4 mb-3 mb-md-0">
                            <div className="card shadow">
                                <div className="card-header">
                                    Firma Bilgileri
                                </div>
                                <div className="card-body pt-1">
                                    <div className="row">
                                        <div className="col-md-12 p-3 pt-1">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label className="pt-2 pb-2">Firma /
                                                        Tedarikçi</label>
                                                    <input
                                                        className="form-control form-control-sm "  {...register("type")}
                                                        readOnly/>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="pt-2 pb-2">Firma
                                                        Kategorisi</label>
                                                    <input
                                                        className="form-control form-control-sm "  {...register("category_name")}
                                                        readOnly/>
                                                </div>
                                            </div>
                                            <label className="pt-2 pb-2">Firma Kodu</label>
                                            <input
                                                className="form-control form-control-sm "  {...register("customer_code")}
                                                readOnly/>
                                            <label className="pt-2 pb-2">Firma Adı </label>
                                            <input
                                                className="form-control form-control-sm" {...register("trade_name")}
                                                readOnly/>
                                            <label className="pt-2 pb-2">Vergi Dairesi </label>
                                            <input
                                                className="form-control form-control-sm" {...register("tax_administration")}
                                                readOnly/>
                                            <label className="pt-2 pb-2">Vergi Numarası </label>
                                            <input
                                                className="form-control form-control-sm" {...register("tax_number")}
                                                readOnly/>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow">
                                <div className="card-header">
                                    Adres Bilgileri
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <label className="pt-2 pb-2">Ülke</label>
                                            <input
                                                className="form-control form-control-sm " {...register("country_name")}
                                                readOnly/>

                                            <label className="pt-2 pb-2">İl </label>
                                            <input
                                                className="form-control form-control-sm " {...register("province_name")}
                                                readOnly/>

                                            <label className="pt-2 pb-2">İlçe </label>
                                            <input
                                                className="form-control form-control-sm " {...register("district_name")}
                                                readOnly/>
                                            <label className="pt-2 pb-2">Posta Kodu </label>
                                            <input
                                                className="form-control form-control-sm " {...register("zip_code")}
                                                readOnly/>
                                            <label className="pt-2 pb-2">Adres</label>
                                            <input
                                                className="form-control form-control-sm " {...register("address")}
                                                readOnly/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow">
                                <div className="card-header">
                                    Sevkiyat Adres Bilgileri
                                </div>
                                {shipmentAddress ? (
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-12">
                                                <label className="pt-2 pb-2">Ülke</label>
                                                <input
                                                    className="form-control form-control-sm "
                                                    value={shipmentAddress.country_name}
                                                    readOnly/>

                                                <label className="pt-2 pb-2">İl </label>
                                                <input
                                                    className="form-control form-control-sm "
                                                    value={shipmentAddress.province_name}
                                                    readOnly/>

                                                <label className="pt-2 pb-2">İlçe </label>
                                                <input
                                                    className="form-control form-control-sm "
                                                    value={shipmentAddress.district_name}
                                                    readOnly/>
                                                <label className="pt-2 pb-2">Posta Kodu </label>
                                                <input
                                                    className="form-control form-control-sm "
                                                    value={shipmentAddress.zip_code}
                                                    readOnly/>
                                                <label className="pt-2 pb-2">Adres</label>
                                                <input
                                                    className="form-control form-control-sm "
                                                    value={shipmentAddress.address}
                                                    readOnly/>
                                            </div>
                                        </div>
                                    </div>
                                ) : <NoData message={"Sevkiyat Adresi Bulunamadı"}/>}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm"
                            onClick={handleCloseCustomerDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCustomers} onHide={handleCloseCustomers} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Firma {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="card shadow">
                                    <div className="card-header">
                                        Firma Bilgileri
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="pt-2 pb-2">Firma / Tedarikçi </label>
                                                        <span
                                                            className="registerTitle text-danger fw-bold"> *</span>
                                                        <select {...register("type", {required: true})}
                                                                className={"form-select form-select-sm " + (errors.type ? "is-invalid" : "")}
                                                                autoFocus={true}
                                                        >
                                                            <option value="">Seçiniz</option>
                                                            <option value="0">Firma</option>
                                                            <option value="2">Tedarikçi</option>

                                                        </select>
                                                        {errors.type &&
                                                            <div
                                                                className="invalid-feedback text-start">Bu
                                                                alan
                                                                zorunlu.</div>}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="pt-2 pb-2">Firma
                                                            Kategorisi</label>
                                                        <select {...register("category_id")}
                                                                className={"form-select form-select-sm "}
                                                        >
                                                            <option value="">Seçiniz
                                                            </option>
                                                            {customerCategories.map((customerCategory, index) => {
                                                                return (<option
                                                                    key={customerCategory.id}
                                                                    value={customerCategory.id}>{customerCategory.category_name}</option>)
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                                <label className="pt-2 pb-2">Firma Kodu</label>
                                                <span
                                                    className="registerTitle text-danger fw-bold"> *</span>
                                                <input type="text"
                                                       className={"form-control form-control-sm " + (errors.customer_code ? "is-invalid" : "")}
                                                       name="customer_code"
                                                       {...register("customer_code", {required: true})}/>
                                                {errors.customer_code &&
                                                    <div className="invalid-feedback text-start">Bu
                                                        alan
                                                        zorunlu.</div>}
                                                <label className="pt-2 pb-2">Firma Adı </label>
                                                <span
                                                    className="registerTitle text-danger fw-bold"> *</span>
                                                <input type="text"
                                                       className={"form-control form-control-sm " + (errors.trade_name ? "is-invalid" : "")}
                                                       name="trade_name"
                                                       {...register("trade_name", {required: true})}/>
                                                {errors.trade_name &&
                                                    <div className="invalid-feedback text-start">Bu
                                                        alan
                                                        zorunlu.</div>}
                                                <label className="pt-2 pb-2">Vergi Dairesi </label>
                                                <input type="text"
                                                       className={"form-control form-control-sm " + (errors.tax_administration ? "is-invalid" : "")}
                                                       name="tax_administration"
                                                       {...register("tax_administration")}/>
                                                <label className="pt-2 pb-2">Vergi Numarası </label>
                                                <span
                                                    className="registerTitle text-danger fw-bold"> *</span>
                                                <Controller
                                                    control={control}
                                                    name="tax_number"
                                                    render={({
                                                                 field: {
                                                                     onChange, tax_number, value,
                                                                 }
                                                             }) => (
                                                        <NumberFormat
                                                            name={tax_number}
                                                            minLength={10}
                                                            maxLength={11}
                                                            value={value}
                                                            onChange={onChange}
                                                            allowLeadingZeros={true}
                                                            className={"form-control form-control-sm " + (errors.tax_number ? "is-invalid" : "")}
                                                        />)}
                                                    rules={{
                                                        required: {
                                                            value: true,
                                                            message: "Bu alan zorunlu."
                                                        }, pattern: {
                                                            value: /^[0-9]{10,11}$/,
                                                            message: "Vergi numarası e az 10 en fazla 11 karakterden oluşmalıdır."
                                                        }
                                                    }}
                                                />
                                                {errors.tax_number && <div
                                                    className="invalid-feedback text-start">{errors.tax_number.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card shadow">
                                    <div className="card-header">
                                        Adres Bilgileri
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <label className="pt-1 pb-1">Ülke</label>
                                                <Controller
                                                    control={control}
                                                    name="country"
                                                    defaultValue=""
                                                    render={({field: {onChange, value}}) => (
                                                        <Select
                                                            name="country"
                                                            value={value}
                                                            defaultValue={defaultOptionsCountry}
                                                            noOptionsMessage={() => 'Kayıt bulunamadı'}
                                                            options={countries}
                                                            className="basic-multi-select"
                                                            classNamePrefix="select"
                                                            placeholder={'Ülke Seçiniz'}
                                                            onChange={(option) => {
                                                                setValue("province", "");
                                                                setValue("district", "");
                                                                setDefaultOptionsCountry(option.value)
                                                                setCountryId(option.value)
                                                                onChange(option)
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            {(() => {
                                                if (countryId && countryId == 232) {
                                                    return (
                                                        <>
                                                            <div className="col-md-12">
                                                                <label className="pt-2 pb-2">İl </label>
                                                                <Controller
                                                                    control={control}
                                                                    defaultValue=""
                                                                    name="province"
                                                                    render={({field: {onChange, name, value}}) => (
                                                                        <Select
                                                                            name="province"
                                                                            value={value}
                                                                            defaultValue={defaultOptionsProvince}
                                                                            noOptionsMessage={() => 'Kayıt bulunamadı'}
                                                                            options={provinces}
                                                                            className="basic-multi-select"
                                                                            classNamePrefix="select"
                                                                            placeholder={'İl Seçiniz'}
                                                                            onChange={(option) => {
                                                                                setDefaultOptionsProvince(option.value)
                                                                                setProvinceId(option.value)
                                                                                onChange(option)
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className="col-md-12">
                                                                <label className="pt-2 pb-2">İlçe </label>
                                                                <Controller
                                                                    control={control}
                                                                    defaultValue=""
                                                                    name="district"
                                                                    render={({field: {onChange, name, value}}) => (
                                                                        <Select
                                                                            name="district"
                                                                            value={value}
                                                                            defaultValue={defaultOptionsDistrict}
                                                                            noOptionsMessage={() => 'Kayıt bulunamadı'}
                                                                            options={districtes}
                                                                            className="basic-multi-select"
                                                                            classNamePrefix="select"
                                                                            placeholder={'İlçe Seçiniz'}
                                                                            onChange={(option) => {
                                                                                setDefaultOptionsDistrict(option.value)
                                                                                setDistrict(option.value)
                                                                                onChange(option)
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        </>
                                                    )
                                                }
                                                if (countryId && countryId != 232) {
                                                    return (
                                                        <>
                                                            <div className="col-md-12">
                                                                <label className="pt-2 pb-2">İl </label>
                                                                <input className="form-control form-control-sm"
                                                                       name="province"
                                                                       {...register("province")}/>
                                                            </div>
                                                            <div className="col-md-12">
                                                                <label className="pt-2 pb-2">İlçe </label>
                                                                <input className="form-control form-control-sm"
                                                                       name="district"
                                                                       {...register("district")}/>
                                                            </div>
                                                        </>
                                                    )
                                                }
                                            })()}
                                            <div className="col-md-12">
                                                <label className="pt-2 pb-2">Posta Kodu</label>
                                                <Controller
                                                    control={control}
                                                    name="zip_code"
                                                    render={({
                                                                 field: {
                                                                     onChange,
                                                                     value
                                                                 }
                                                             }) => (
                                                        <NumberFormat
                                                            name="zip_code"
                                                            value={value}
                                                            onChange={onChange}
                                                            allowLeadingZeros={true}
                                                            className={"form-control form-control-sm "}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="pt-2 pb-2">Adres</label>
                                                <span className="registerTitle text-danger fw-bold"> *</span>
                                                <input
                                                    className={"form-control form-control-sm " + (errors.address ? "is-invalid" : "")}
                                                    {...register("address", {required: true})}/>
                                                {errors.address &&
                                                    <div className="invalid-feedback text-start">Bu
                                                        alan
                                                        zorunlu.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseCustomers}>Vazgeç
                        </button>
                        <button type="submit"
                                className="btn btn-custom-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showUserCustomerModal} onHide={handleCloseUserCustomerModal}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Kullanıcıya Firma Atama İşlemleri
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitAssignment(onSubmitAssignment)} id="2">
                    <Modal.Body>
                        <div className="col-12">
                            <label className="mb-2">Personel Seçiniz
                                <span className="registerTitle text-danger fw-bold m-1"> *</span></label>
                            <Controller
                                control={controlAssignment}
                                name="assigned_user_id"
                                defaultValue=""
                                render={({field: {onChange, ref, value}}) => (
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions={true}
                                        value={value}
                                        defaultValue={defaultOptionsEmployee}
                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                        loadOptions={asyncGetEmployees}
                                        placeholder={'Personel Seçiniz'}
                                        name="assigned_user_id"
                                        ref={ref}
                                        onFocus={() => {
                                            asyncGetEmployees('')
                                        }}
                                        loadingMessage={() => "Yükleniyor..."}
                                        onInputChange={handleInputChangeEmployee}
                                        onChange={(option) => {
                                            setDefaultOptionsEmployee(option)
                                            onChange(option)
                                            setValueAssignment("customer_id", "");
                                        }}
                                        form="2"
                                        isClearable
                                    />
                                )}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Bu alan zorunlu."
                                    }
                                }}
                            />
                            {errorsAssignment.assigned_user_id &&
                                <div
                                    className="registerTitle text-danger"> {errorsAssignment.assigned_user_id.message}</div>}
                        </div>
                        <div className="col-12">
                            <label className="mb-2 mt-3">Firma Seçiniz
                                <span className="registerTitle text-danger fw-bold m-1"> *</span></label>
                            <Controller
                                control={controlAssignment}
                                name="customer_id"
                                defaultValue=""
                                render={({field: {onChange, name, ref, value}}) => (
                                    <AsyncSelect
                                        name={name}
                                        cacheOptions
                                        defaultOptions
                                        isClearable
                                        value={value}
                                        loadOptions={asyncGetCustomers}
                                        onInputChange={asyncGetCustomers}
                                        onChange={(option) => {
                                            onChange(option)
                                            setDefaultOptions(value => option.map(item => item.value))
                                        }}
                                        ref={ref}
                                        loadingMessage={() => "Yükleniyor..."}
                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                        placeholder={'Firma Seçiniz'}
                                        isMulti
                                        form="2"
                                    />
                                )}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Bu alan zorunlu."
                                    }
                                }}
                            />
                            {errorsAssignment.customer_id &&
                                <div
                                    className="registerTitle text-danger"> {errorsAssignment.customer_id.message}</div>}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseUserCustomerModal}>Vazgeç
                        </button>
                        <button type="submit" form="2" className="btn btn-custom-save btn-sm">Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showUserCustomerModalDetail} onHide={handleCloseUserCustomerModalDetail}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Talep Oluştur
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitRequest(onSubmitRequest)} id="3">
                    <Modal.Body>
                        <div className="col-12">
                            <label className="mb-2">Personel Seçiniz</label>
                            <span className="registerTitle text-danger fw-bold"> *</span>
                            <Controller
                                control={controlRequest}
                                name="assigned_user_id"
                                defaultValue=""
                                render={({field: {onChange, name, value}}) => (
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions={true}
                                        value={value}
                                        defaultValue={defaultOptionsEmployeeRequest}
                                        noOptionsMessage={() => "Aramanıza uygun değer bulunamadı"}
                                        loadOptions={asyncGetEmployees}
                                        placeholder={'Personel Seçiniz'}
                                        name="assigned_user_id"
                                        onInputChange={handleInputChangeEmployeeRequest}
                                        onChange={(option) => {
                                            setDefaultOptionsEmployeeRequest(option)
                                            asyncGetCustomersToUser(option.value, "")
                                            setEmployeeId(option.value)
                                            onChange(option)
                                        }}
                                        form="3"
                                    />
                                )}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Bu alan zorunlu."
                                    }
                                }}
                            />
                            {errorsRequest.assigned_user_id &&
                                <div
                                    className="registerTitle text-danger"> {errorsRequest.assigned_user_id.message}</div>}
                        </div>
                        <div className="col-12">
                            <label className="mb-2 mt-3">Firma Seçiniz</label>
                            <span className="registerTitle text-danger fw-bold"> *</span>
                            <Controller
                                control={controlRequest}
                                name="customer_id"
                                defaultValue=""
                                render={({field: {onChange, name, value}}) => (
                                    <Select
                                        isMulti
                                        name="customer_id"
                                        value={value}
                                        defaultValue={defaultOptionsCustomerRequest}
                                        noOptionsMessage={() => 'Aramanıza uygun değer bulunamadı'}
                                        options={userCustomers}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        placeholder={'Firma Seçiniz'}
                                        onChange={(option) => {
                                            setDefaultOptionsCustomerRequest(value => option.map(item => item.value))
                                            onChange(option)
                                        }}
                                        form="3"
                                    />
                                )}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Bu alan zorunlu."
                                    }
                                }}
                            />
                            {errorsRequest.customer_id &&
                                <div className="registerTitle text-danger">{errorsRequest.customer_id.message}</div>}
                        </div>
                        <div className="col-12">
                            <label className="mb-2 my-3">Açıklama</label>
                            <span className="registerTitle text-danger fw-bold"> *</span>
                            <textarea
                                className={"form-control form-control-sm " + (errorsRequest.description ? "is-invalid" : "")}
                                {...registerRequest("description", {required: true})}/>
                            {errorsRequest.description &&
                                <div className="invalid-feedback text-start">Bu alan
                                    zorunlu.</div>}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseUserCustomerModalDetail}>Vazgeç
                        </button>
                        <button type="submit"
                                className="btn btn-custom-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showCustomerOfficial} onHide={handleCloseCustomerOfficial}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Yetkili Kişi Ekleme
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitCustomerOfficial(onSubmitCustomerOfficial)} id="4">
                    <Modal.Body>
                        <div className="col-12">
                            <label className="mb-2">Yetkili Kişi Seçiniz</label>
                            <span className="registerTitle text-danger fw-bold"> *</span>
                            <Controller
                                control={controlCustomerOfficial}
                                name="customer_official"
                                defaultValue=""
                                render={({field: {onChange, name, value}}) => (
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions={true}
                                        value={value}
                                        defaultValue={defaultOptionsCustomerOfficial}
                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                        loadOptions={asyncGetCustomersOfficial}
                                        loadingMessage={() => "Yükleniyor..."}
                                        placeholder={'Yetkili Kişi Seçiniz'}
                                        name="customer_official"
                                        isMulti
                                        onInputChange={handleInputChangeCustomerOfficial}
                                        onChange={(option) => {
                                            setDefaultOptionsCustomerOfficial(value => option.map(item => item.value))
                                            onChange(option)
                                        }}
                                        form="4"
                                    />
                                )}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Bu alan zorunlu."
                                    }
                                }}
                            />
                            {errorsCustomerOfficial.customer_official &&
                                <div
                                    className="registerTitle text-danger"> {errorsCustomerOfficial.customer_official.message}</div>}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseCustomerOfficial}>Vazgeç
                        </button>
                        <button type="submit" form="4" className="btn btn-custom-save btn-sm">Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showShippingAddress} onHide={handleCloseShippingAddress} size="medium">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Sevkiyat
                        Adresi {watchShippingAddress("id") && watchShippingAddress("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitShippingAddress(onSubmitShippingAddress)} id="5">
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12 col-lg-12">
                                <label className="pt-1 pb-1">Ülke</label>
                                <Controller
                                    control={controlShippingAddress}
                                    name="country"
                                    defaultValue=""
                                    render={({field: {onChange, value}}) => (
                                        <Select
                                            name="country"
                                            value={value}
                                            defaultValue={defaultOptionsCountry}
                                            noOptionsMessage={() => 'Kayıt bulunamadı'}
                                            options={countries}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            placeholder={'Ülke Seçiniz'}
                                            onChange={(option) => {
                                                setValueShippingAddress("province", "")
                                                setValueShippingAddress("district", "")
                                                setDefaultOptionsCountry(option.value)
                                                setCountryId(option.value)
                                                onChange(option)
                                            }}
                                            form="5"
                                        />
                                    )}
                                />
                            </div>
                            {(() => {
                                if (countryId && countryId == 232) {
                                    return (
                                        <>
                                            <div className="col-12 col-lg-12">
                                                <label className="pt-2 pb-2">İl </label>
                                                <Controller
                                                    control={controlShippingAddress}
                                                    name="province"
                                                    defaultValue=""
                                                    render={({field: {onChange, name, value}}) => (
                                                        <Select
                                                            name="province"
                                                            value={value}
                                                            defaultValue={defaultOptionsProvince}
                                                            noOptionsMessage={() => 'Kayıt bulunamadı'}
                                                            options={provinces}
                                                            className="basic-multi-select"
                                                            classNamePrefix="select"
                                                            placeholder={'İl Seçiniz'}
                                                            onChange={(option) => {
                                                                setDefaultOptionsProvince(option.value)
                                                                setProvinceId(option.value)
                                                                onChange(option)
                                                            }}
                                                            form="5"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-12 col-lg-12">
                                                <label className="pt-2 pb-2">İlçe </label>
                                                <Controller
                                                    control={controlShippingAddress}
                                                    name="district"
                                                    defaultValue=""
                                                    render={({field: {onChange, name, value}}) => (
                                                        <Select
                                                            name="district"
                                                            value={value}
                                                            defaultValue={defaultOptionsDistrict}
                                                            noOptionsMessage={() => 'Kayıt bulunamadı'}
                                                            options={districtes}
                                                            className="basic-multi-select"
                                                            classNamePrefix="select"
                                                            placeholder={'İlçe Seçiniz'}
                                                            onChange={(option) => {
                                                                setDefaultOptionsDistrict(option.value)
                                                                setDistrict(option.value)
                                                                onChange(option)
                                                            }}
                                                            form="5"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </>
                                    )
                                }
                                if (countryId && countryId != 232) {
                                    return (
                                        <>
                                            <div className="col-md-12">
                                                <label className="pt-2 pb-2">İl </label>
                                                <input className="form-control form-control-sm"
                                                       name="province"
                                                       {...registerShippingAddress("province")}/>
                                            </div>
                                            <div className="col-md-12">
                                                <label className="pt-2 pb-2">İlçe </label>
                                                <input className="form-control form-control-sm"
                                                       name="district"
                                                       {...registerShippingAddress("district")}/>
                                            </div>
                                        </>
                                    )
                                }
                            })()}

                            <div className="col-12 col-lg-12">
                                <label className="pt-2 pb-2">Posta Kodu</label>
                                <Controller
                                    control={controlShippingAddress}
                                    name="zip_code"
                                    render={({
                                                 field: {
                                                     onChange,
                                                     value
                                                 }
                                             }) => (
                                        <NumberFormat
                                            name="zip_code"
                                            value={value}
                                            onChange={onChange}
                                            allowLeadingZeros={true}
                                            className={"form-control form-control-sm "}
                                        />
                                    )}
                                    form="5"
                                />
                            </div>
                            <div className="col-12 col-lg-12">
                                <label className="pt-2 pb-2">Adres</label>
                                <span
                                    className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm " + (errorsShippingAddress.address ? "is-invalid" : "")}
                                    form="5"
                                    {...registerShippingAddress("address", {required: true})}/>
                                {errorsShippingAddress.address &&
                                    <div className="invalid-feedback text-start">Bu
                                        alan
                                        zorunlu.</div>}
                                <input name="customerId" {...registerShippingAddress("customerId")} form="5"
                                       hidden/>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseShippingAddress}>Vazgeç
                        </button>
                        <button type="submit" form="5"
                                className="btn btn-custom-save btn-sm" {...registerShippingAddress("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Yetkili Kişiler Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Ad Soyad</th>
                                <th>Telefon</th>
                                <th>Email</th>
                                {
                                    session.user.permission_id == 1 ? (
                                        <th>İşlem</th>
                                    ) : null
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                officialDetail.map((item, index) => {
                                    return (
                                        <>
                                            <tr key={index}>
                                                <th scope="row">{index + 1}</th>
                                                <td>{item.customerOfficial.name} {item.customerOfficial.surname}</td>
                                                <td>{item.customerOfficial.phone}</td>
                                                <td>{item.customerOfficial.email}</td>
                                                {
                                                    session.user.permission_id == 1 ? (
                                                        <td>
                                                            <a className="cursor-pointer" title="Sil" onClick={() => {
                                                                deleteCustomerOfficial(item.customer_id, item.id, item.customerOfficial.id)
                                                            }}>
                                                                <i className="fal fa-trash-alt mt-2"></i>
                                                            </a>
                                                        </td>
                                                    ) : null
                                                }
                                            </tr>
                                        </>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm  float-end "
                            onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDetailNotOfficial} onHide={handleCloseDetailNotOfficial}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Yetkili Kişiler Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-danger py-1 px-2" role="alert">
                        <i className="fas fa-exclamation-square me-1"></i>Firmaya ait yetkili kişi bulunmamaktadır.
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm float-end"
                            onClick={handleCloseDetailNotOfficial}>Vazgeç
                    </button>
                </Modal.Body>
            </Modal>
        </div>
    )
        ;
}

Customers.auth = true;

export default Customers;
