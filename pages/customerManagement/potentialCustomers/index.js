import React, {useEffect, useState} from 'react';
import NumberFormat from "react-number-format";
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useForm, Controller} from 'react-hook-form';
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper, Badge, Button} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import deleteSwal from "../../../components/askDelete";
import alertSwal from "../../../components/alert";
import {ExportExcel} from "../../../components/exportExcel";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";

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

function PotentialCustomer(props) {
    const [potentialCustomers, setPotentialCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const {register, handleSubmit, setValue, reset, control, formState: {errors}, watch} = useForm();
    const [sheetDataPotentialCustomer, setsheetDataPotentialCustomer] = useState([]); // export işlemi için
    const fileName = "potansiyel_firmalar";
    const [defaultOptions, setDefaultOptions] = useState();
    const [defaultOptionsEmployee, setDefaultOptionsEmployee] = useState();
    const [defaultOptionsCustomerOfficial, setDefaultOptionsCustomerOfficial] = useState();

    const [showUserCustomerModal, setShowUserCustomerModal] = useState(false);
    const handleCloseUserCustomerModal = () => setShowUserCustomerModal(false);
    const handleShowUserCustomerModal = () => setShowUserCustomerModal(true);

    const [showMeeting, setShowMeeting] = useState(false);
    const handleCloseMeeting = () => setShowMeeting(false);
    const handleShowMeeting = () => setShowMeeting(true);

    const [inputValues, setValues] = useState('');
    const [inputValuesEmployee, setValuesEmplooye] = useState('');
    const [inputValuesCustomerOfficial, setValuesCustomerOfficial] = useState('');

    const [defaultOptionsEmployeeRequest, setDefaultOptionsEmployeeRequest] = useState();
    const [defaultOptionsCustomerRequest, setDefaultOptionsCustomerRequest] = useState();

    const [inputValuesEmployeeRequest, setValuesEmployeeRequest] = useState('');

    const [employeeId, setEmployeeId] = useState();
    const [userCustomers, setUserCustomers] = useState();

    const [inputValuesOfficial, setValuesOfficial] = useState('');
    const [defaultOptionsOfficial, setDefaultOptionsOfficial] = useState();

    const {
        register: registerMeeting,
        handleSubmit: handleSubmitMeeting,
        setValue: setValueMeeting,
        reset: resetMeeting,
        control: controlMeeting,
        formState: {errors: errorsMeeting},
    } = useForm();

    const {data: session} = useSession();
    const router = useRouter();
    const [customerCategories, setCustomerCategories] = useState([]);
    const [countries, setCountry] = useState([]);
    const [provinces, setProvince] = useState([]);
    const [districtes, setDistrict] = useState([]);
    const [countryId, setCountryId] = useState(null);
    const [provinceId, setProvinceId] = useState(null);
    const [districtId, setDistrictId] = useState(null);
    const [userLiable, setUserLiable] = useState("");
    let successRateArray = [];
    const [officialDetail, setOfficialDetail] = useState([]);
    const [meetingTime, setMeetingTime] = useState([]);

    const [officials, setOfficials] = useState([]);

    const {
        handleSubmit: handleSubmitAssignment,
        reset: resetAssignment,
        control: controlAssignment,
        formState: {errors: errorsAssignment},
    } = useForm();   //atama işlemleri

    const {
        register: registerRequest,
        handleSubmit: handleSubmitRequest,
        setValue: setValueRequest,
        control: controlRequest,
        reset: resetRequest,
        formState: {errors: errorsRequest},
    } = useForm();   //talep oluşturma işlemleri

    const {
        handleSubmit: handleSubmitCustomerOfficial,
        setValue: setValueCustomerOfficial,
        reset: resetCustomerOfficial,
        control: controlCustomerOfficial,
        formState: {errors: errorsCustomerOfficial},
    } = useForm();   // yetkili kişiler için

    const [defaultOptionsCountry, setDefaultOptionsCountry] = useState();
    const [defaultOptionsProvince, setDefaultOptionsProvince] = useState();
    const [defaultOptionsDistrict, setDefaultOptionsDistrict] = useState();

    const [showPotentialCustomers, setShowPotentialCustomers] = useState(false);
    const handleClosePotentialCustomers = () => setShowPotentialCustomers(false);
    const handleShowPotentialCustomers = () => setShowPotentialCustomers(true);

    const [showPotentialCustomerDetail, setShowPotentialCustomerDetail] = useState(false);
    const handleClosePotentialCustomerDetail = () => setShowPotentialCustomerDetail(false);
    const handleShowPotentialCustomerDetail = () => setShowPotentialCustomerDetail(true);

    const [showCustomerOfficial, setShowCustomerOfficial] = useState(false);
    const handleCloseCustomerOfficial = () => setShowCustomerOfficial(false);
    const handleShowCustomerOfficial = () => setShowCustomerOfficial(true);

    const [showUserCustomerModalDetail, setShowUserCustomerModalDetail] = useState(false);
    const handleCloseUserCustomerModalDetail = () => setShowUserCustomerModalDetail(false);
    const handleShowUserCustomerModalDetail = () => setShowUserCustomerModalDetail(true);

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const [showDetailNotOfficial, setShowDetailNotOfficial] = useState(false);
    const handleCloseDetailNotOfficial = () => setShowDetailNotOfficial(false);
    const handleShowDetailNotOfficial = () => setShowDetailNotOfficial(true);


    const handleInputChangeCustomerOfficial = value => {   // talep için personel seçimi
        setValuesCustomerOfficial(value);
    }

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
            if (response.data[0] === undefined || response.data[0].potential_customers === 0) {
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
                getPotentialCustomers();
                getPotentialCustomersExcel();
                getUserLiable();
            }
        }).catch(function (error) {
            console.log(error);
        });
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
                handleShowDetail();
                setOfficialDetail(response.data)
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getPotentialCustomers() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/customer-management/potential-customers/get-potential-customers',
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
            setPotentialCustomers(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    for (let i = 0; i < potentialCustomers.length; i++) {
        successRateArray.push({successRate: "% " + ((potentialCustomers[i].countMeet * 100) / 12).toFixed()});
    }

    let allPotentialCustomers = potentialCustomers.map((customer, i) => Object.assign({}, customer, successRateArray[i]));

    async function getPotentialCustomersExcel() {
        await axios({
            method: 'post', url: '/api/customer-management/potential-customers/get-potential-customers-excel',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }, data: JSON.stringify({
                search: search
            }),
        }).then(function (response) {
            let jsonData = [];
            for (let i = 0; i < response.data.data.length; i++) {
                jsonData.push({
                    "Firma Kategorisi": response.data.data[i].customerCategory != null ? customerCategory : "-",
                    "Firma Kodu": response.data.data[i].customer_code != null ? response.data.data[i].customer_code : "-",
                    "Firma Adı": response.data.data[i].trade_name != null ? response.data.data[i].trade_name : "-",
                    "Vergi Dairesi": response.data.data[i].tax_administration != null ? response.data.data[i].tax_administration : "-",
                    "Vergi Numarası": response.data.data[i].tax_number != null ? response.data.data[i].tax_number : "-",
                    "Ülke": response.data.data[i].customerContact.country_name != null ? response.data.data[i].customerContact.country_name : "-",
                    "İl": response.data.data[i].customerContact.province_name != null ? response.data.data[i].customerContact.province_name : "-",
                    "İlçe": response.data.data[i].customerContact.district_name != null ? response.data.data[i].customerContact.district_name : "-",
                    "Posta Kodu": response.data.data[i].customerContact.zip_code != null ? response.data.data[i].customerContact.zip_code : "-",
                    "Adres": response.data.data[i].customerContact.address != null ? response.data.data[i].customerContact.address : "-",
                })
                setsheetDataPotentialCustomer(jsonData);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomerCategories() {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/get-customer-categories',
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

    const onSubmitCustomerOfficial = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/customers/add-customers-official/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseCustomerOfficial();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                setLoading(false);
                getPotentialCustomers();
                getPotentialCustomersExcel();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const handleInputChangeEmployee = value => {
        setValuesEmplooye(value);
    };   //atama için personel seçimi

    const handleInputChangeCustomers = value => {      // atama için müşteri seçimi
        setValues(value);
    };

    const handleInputChangeEmployeeRequest = value => {   // talep için personel seçimi
        setValuesEmployeeRequest(value);
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
            url: `/api/custom/get-potential-customers?query=${inputValues}`,
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
            url: `/api/customer-management/potential-customers/get-potential-customers-to-users?id=${employeeId}&query=${inputValuesCustomersToUser}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        setUserCustomers(res.data)
    };

    const asyncGetPotentialCustomerOfficial = async (customerId, inputValuesCustomerOffical) => {
        const res = await axios({
            method: 'get',
            url: `/api/customer-management/potential-customers/get-potential-customers-to-official?id=${customerId}&query=${inputValuesCustomerOffical}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        setOfficials(res.data)
    };

    const onSubmit = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/potential-customers/add-edit-potential-customer',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleClosePotentialCustomers();
            getPotentialCustomers();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    };

    const onSubmitMeeting = async (data) => {
        const formData = new FormData();
        formData.append("meeting_user_id", data.meeting_user.value)
        formData.append("meeting_user_name", data.meeting_user.label)

        for (let value in data.meeting_file) {
            if (value != "length" && value != "item") {
                formData.append("meeting_file", data.meeting_file[value]);
            }
        }
        for (let value in data) {
            if (value != "meeting_file" && value != "meeting_user") {
                formData.append(value, data[value]);
            }
        }
        await axios({
            method: 'post',
            url: '/api/customer-management/potential-customers/add-customer-meeting',
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            handleCloseMeeting();
            getPotentialCustomers();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    };

    const deleteCustomer = async (id) => {
        let getToken = props.token;
        deleteSwal(`/api/customer-management/potential-customers/delete-potential-customer/${id}`, getToken, () => {
            getPotentialCustomers();
        });
    }

    const deleteCustomerOfficial = async (customer_id, id, official_id) => {
        let getToken = props.token;
        deleteSwal(`/api/customer-management/delete-customer-official?id=${id}&customerId=${customer_id}&officialId=${official_id}`, getToken, () => {
            handleCloseDetail();
            getCustomerOfficialDetail(customer_id);
        });
    }

    const onSubmitAssignment = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/potential-customers/add-user-potential-customers-assignment',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            setLoading(false);
            handleCloseUserCustomerModal();
            getPotentialCustomers();
            getPotentialCustomersExcel();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetAssignment();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmitRequest = async (data) => {
        await axios({
            method: 'post',
            url: '/api/customer-management/potential-customers/add-user-potential-customers-request',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseUserCustomerModalDetail();
            setLoading(false);
            getPotentialCustomers();
            getPotentialCustomersExcel();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetRequest();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const importExcel = async (e) => {
        let fileObj = e.target.files[0];
        const formData = new FormData();
        formData.append("excel", fileObj);
        setLoading(true);
        await axios({
            method: 'post',
            url: "/api/customer-management/potential-customers/excel-create/",
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            if (response.data.status === "success") {
                setLoading(false);
                alertSwal(response.data.title, response.data.message, response.data.status, () => {
                    getPotentialCustomers();
                    getPotentialCustomersExcel();
                    document.getElementById('uploadFile').value = "";   //onChange işlemi için reset görevi görüyor
                })
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    async function getUserLiable() {
        await axios({
            method: 'post',
            url: '/api/custom/get-user-liable/',
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

    async function getMeetingTime() {
        await axios({
            method: 'post',
            url: '/api/custom/get-meeting-time/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setMeetingTime(response.data.meeting_time)
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
        getCustomerCategories();
        getMeetingTime();
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
            <Title title="Potansiyel Firmalar"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-md-7 p-2">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link
                            underline="none"
                            color="inherit"
                            href="/customerManagement/potentialCustomers"
                        >
                            Potansiyel Firmalar
                        </Link>
                    </Breadcrumbs>
                </div>
                <div className="col-md-5 d-flex justify-content-end">
                    <label className="custom-file-upload border rounded me-2 p-2 fw-semibold cursor-pointer">
                        <input type="file" className="btn btn-sm" onChange={importExcel} id="uploadFile" hidden/>
                        <i className="fa fa-cloud-upload cursor-pointer"></i> Yükle
                    </label>
                    <ExportExcel excelData={sheetDataPotentialCustomer} fileName={fileName}/>
                </div>
            </div>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row  w-100">
                    <div className="col-md-8 col-12 mb-2 mb-md-0">
                        <h5 className="fw-bold mb-0">
                            <Button variant="outlined" className="text-capitalize btn-tk  mb-2 mb-md-0"
                                    onClick={() => {
                                        reset();
                                        setValue("id", 0);
                                        setValue("category_id", "");
                                        setValue("trade_name", "");
                                        setValue("tax_administration", "");
                                        setValue("tax_number", "");
                                        setValue("customer_code", "");
                                        setValue("country_id", "");
                                        setValue("province_id", "");
                                        setValue("district_id", "");
                                        setCountryId(null);
                                        setProvinceId(null);
                                        setDistrictId(null);
                                        setValue("zip_code", "");
                                        setValue("address", "");
                                        handleShowPotentialCustomers()
                                    }}>
                                <i className="fas fa-plus me-1"></i> Yeni Potansiyel Firma
                            </Button>
                            {
                                userLiable === 1 ? (
                                    <Button variant="outlined"
                                            className="text-capitalize btn-tk mx-2 mb-2 mb-md-0 mbl-ms-0"
                                            onClick={() => {
                                                resetAssignment();
                                                asyncGetCustomers("")
                                                handleShowUserCustomerModal();
                                            }}>
                                        <i className="far fa-users-cog me-1 "></i> Kullanıcı İşlemleri
                                    </Button>) : null
                            }
                            {
                                userLiable === 1 ? (
                                    <Button variant="outlined" className="text-capitalize btn-tk  mb-2 mb-md-0"
                                            onClick={() => {
                                                resetRequest();
                                                setValueRequest("description", " ");
                                                handleShowUserCustomerModalDetail();

                                            }}>
                                        <i className="far fa-file-signature me-1"></i> Talep Oluştur
                                    </Button>) : null
                            }
                        </h5>
                        {/*<div className="d-flex">*/}
                        {/*    <select className="form-select form-select-sm  me-2" name="color" onChange={(e) => {*/}
                        {/*        getColorPotentialCustomer(e.target.value)*/}
                        {/*    }}>*/}
                        {/*        <option value="0">Seçiniz</option>*/}
                        {/*        <option value="red">Kırmızı</option>*/}
                        {/*        <option value="normal">Normal</option>*/}
                        {/*    </select>*/}
                        {/*</div>*/}
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
                            data={allPotentialCustomers}
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
                            <Table.Column width={100} sortable={true}>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                                <Table.Cell dataKey="last_meeting_time">
                                    {rowData => {
                                        if (rowData?.countMeet === 0) {
                                            return (
                                                <i className="fas fa-flag colorPotentialCustomer"></i>
                                            )
                                        }
                                        if (rowData?.countMeet !== 0 && rowData?.countMeet < 12 && (moment(moment().format("YYYY-MM-DD")).diff(moment(rowData?.last_meeting_time).format("YYYY-MM-DD"), 'days') >= meetingTime)) {
                                            return (
                                                <i className="fas fa-flag colorMeetTime"></i>
                                            )
                                        }
                                        if (rowData?.countMeet >= 12) {
                                            return (
                                                <i className="fas fa-flag colorSuccessRate"></i>
                                            )
                                        } else {
                                            return (
                                                <i className="fas fa-flag colorCheck"></i>
                                            )
                                        }
                                    }}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Firma Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="customer_code"/>
                            </Table.Column>
                            <Table.Column flexGrow={2} sortable={true}>
                                <Table.HeaderCell>Firma Adı</Table.HeaderCell>
                                <ActionCell dataKey="trade_name"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Vergi Numarası</Table.HeaderCell>
                                <Table.Cell dataKey="tax_number"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Kategori</Table.HeaderCell>
                                <Table.Cell dataKey="customerCategory.category_name"/>
                            </Table.Column>
                            <Table.Column width={150}>
                                <Table.HeaderCell align={"center"}>Görüşmeler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (<>
                                        <a className="cursor-pointer" key={rowData.id}
                                           href={'/customerManagement/potentialCustomers/customerMeeting/' + rowData.id}
                                           title="Görüşmeler">
                                            <i className="far fa-people-arrows"></i>
                                        </a>
                                        <a className="cursor-pointer" title="Görüşme Ekle" onClick={() => {
                                            resetMeeting();
                                            setValueMeeting('customer_id', rowData.id);
                                            asyncGetPotentialCustomerOfficial(rowData.id, "");
                                            handleShowMeeting();
                                        }}>
                                            <i className="far fa-calendar-plus mx-2"></i>
                                        </a>
                                    </>)}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={230}>
                                <Table.HeaderCell align={"center"}>Süreç</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <Badge className="me-4" color="cyan" content={rowData.countMeet}>
                                                <Button size="xs">Görüşme</Button>
                                            </Badge>
                                            <Badge content={rowData.successRate} color="cyan">
                                                <Button size="xs">Başarı</Button>
                                            </Badge>
                                        </>
                                    )}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={150}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                setValue('id', rowData.id);
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
                                                handleShowPotentialCustomerDetail()
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            <a className="cursor-pointer" title="Düzenle"
                                               onClick={() => {
                                                   reset();
                                                   setValue('id', rowData.id);
                                                   setValue('customer_code', rowData.customer_code);
                                                   setValue('trade_name', rowData.trade_name);
                                                   setValue('tax_administration', rowData.tax_administration);
                                                   setValue('tax_number', rowData.tax_number);
                                                   setValue('category_id', rowData.customerCategory ? rowData.customerCategory.id : "");
                                                   setValue('category_name', rowData.customerCategory ? rowData.customerCategory.category_name : "");
                                                   setValue('zip_code', rowData.customerContact ? rowData.customerContact.zip_code : "");
                                                   setValue('address', rowData.customerContact ? rowData.customerContact.address : "");
                                                   setCountryId(rowData.customerContact ? rowData.customerContact.country_id : "");
                                                   setProvinceId(rowData.customerContact ? rowData.customerContact.province_id : "");
                                                   setDistrictId(rowData.customerContact ? rowData.customerContact.district_id : "");
                                                   setDefaultOptionsCountry(rowData.customerContact ? rowData.customerContact.country_id : "");
                                                   setDefaultOptionsProvince(rowData.customerContact ? rowData.customerContact.province_id : "");
                                                   setDefaultOptionsDistrict(rowData.customerContact ? rowData.customerContact.district_id : "");
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
                                                   handleShowPotentialCustomers();
                                               }}>
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
                                            <a className="cursor-pointer"
                                               title="Yetkili Kişi Ekleme"
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
                <div className="card mt-2">
                    <div className="card-body">
                        <div className="col-12">
                            <div className="row">
                                <div className="col-3">
                                    <i className="fas fa-flag colorPotentialCustomer"></i>
                                    <span className="tableInfoText"> : Görüşme yapılmamış firmalar</span>
                                </div>
                                <div className="col-3">
                                    <i className="fas fa-flag colorCheck"></i>
                                    <span className="tableInfoText"> : Görüşmesi devam eden firmalar</span>
                                </div>
                                <div className="col-4 px-0">
                                    <i className="fas fa-flag colorMeetTime"></i>
                                    <span
                                        className="tableInfoText"> : Son görüşme tarihi üzerinden zaman geçen firmalar</span>
                                </div>
                                <div className="col-2 px-0">
                                    <i className="fas fa-flag colorSuccessRate"></i>
                                    <span className="tableInfoText"> : Başarılı olunamayan firmalar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showPotentialCustomerDetail} onHide={handleClosePotentialCustomerDetail} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Potansiyel Firma Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <div className="card">
                                <div className="card-header">
                                    Firma Bilgileri
                                </div>
                                <div className="card-body  pt-1">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <label className="pt-2 pb-2">Firma Kategorisi</label>
                                            <input
                                                className="form-control form-control-sm "  {...register("category_name")}
                                                readOnly/>
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
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    Adres Bilgileri
                                </div>
                                <div className="card-body pt-1">
                                    <div className="row">
                                        <div className="col-md-12">
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
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm"
                            onClick={handleClosePotentialCustomerDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={showPotentialCustomers} onHide={handleClosePotentialCustomers} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Potansiyel Firma {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="card">
                                    <div className="card-header">
                                        Firma Bilgileri
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <label className="pt-2 pb-2">Firma
                                                    Kategorisi</label>
                                                <select {...register("category_id")}
                                                        className={"form-select form-select-sm " + (errors.category_id ? "is-invalid" : "")}
                                                        autoFocus={true}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {customerCategories.map((customerCategory, index) => {
                                                        return (<option key={customerCategory.id}
                                                                        value={customerCategory.id}>{customerCategory.category_name}</option>)
                                                    })}
                                                </select>
                                                {errors.category_id &&
                                                    <div className="invalid-feedback text-start">Bu
                                                        alan
                                                        zorunlu.</div>}
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
                                                       className={"form-control form-control-sm "}
                                                       name="trade_name"
                                                       {...register("tax_administration")}/>
                                                <label className="pt-2 pb-2">Vergi Numarası </label>
                                                <span className="registerTitle text-danger fw-bold"> *</span>
                                                <Controller
                                                    control={control}
                                                    name="tax_number"
                                                    render={({
                                                                 field: {
                                                                     onChange, tax_number, value,
                                                                 }
                                                             }) => (<NumberFormat
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
                                                            value: true, message: "Bu alan zorunlu."
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
                                <div className="card">
                                    <div className="card-header">
                                        Adres Bilgileri
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <label className="pt-2 pb-2">Ülke</label>
                                                <Controller
                                                    control={control}
                                                    name="country"
                                                    defaultValue=""
                                                    render={({field: {onChange, name, value}}) => (
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
                                                {errors.country &&
                                                    <div
                                                        className="registerTitle text-danger"> {errors.country.message}</div>}
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
                                                <label className="pt-2 pb-2">Posta Kodu </label>
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
                                onClick={handleClosePotentialCustomers}>Vazgeç
                        </button>
                        <button type="submit"
                                className="btn btn-tk-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showMeeting} onHide={handleCloseMeeting} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Görüşme Ekle
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitMeeting(onSubmitMeeting)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12 mb-2">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="pb-2">Görüşme Tipi</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <select name="meeting_type"
                                                {...registerMeeting("meeting_type", {required: true})}
                                                className={"form-select form-select-sm " + (errorsMeeting.meeting_type ? "is-invalid" : "")}>
                                            <option value="">Seçiniz</option>
                                            <option value="Mail">Mail</option>
                                            <option value="Telefon">Telefon</option>
                                            <option value="Whatsapp">Whatsapp</option>
                                        </select>
                                        {errorsMeeting.meeting_type &&
                                            <div className="invalid-feedback text-start">Bu alan
                                                zorunlu.</div>}
                                        <label className="pb-2 pt-3">Görüşme Konusu</label>
                                        <input
                                            className="form-control form-control-sm " type="text"
                                            name="meeting_subject" {...registerMeeting("meeting_subject")}/>

                                        <label className="pb-2 pt-3">Görüşülen Kişi</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <Controller
                                            control={controlMeeting}
                                            name="meeting_user"
                                            defaultValue=""
                                            render={({field: {onChange, name, value, ref}}) => (
                                                <Select
                                                    name="meeting_user"
                                                    value={value}
                                                    defaultValue={defaultOptionsOfficial}
                                                    noOptionsMessage={() => 'Kayıt bulunamadı'}
                                                    options={officials}
                                                    placeholder="Seçiniz"
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    onChange={(option) => {
                                                        setValuesOfficial(option.value)
                                                        onChange(option)
                                                    }}
                                                />
                                            )}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Bu alan zorunlu."
                                                }
                                            }}
                                        />
                                        {errorsMeeting.meeting_user && <div
                                            className="registerTitle text-danger"> {errorsMeeting.meeting_user.message}</div>}
                                        <label className="pb-2 pt-2">Dosya</label>
                                        <input className="form-control form-control-sm "
                                               type="file"
                                               name="meeting_file"
                                               tabIndex={2}
                                               {...registerMeeting("meeting_file")}
                                               multiple
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label>Görüşme</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <textarea
                                            rows={8}
                                            name="meeting_description"
                                            className={"form-control form-control-sm  " + (errorsMeeting.meeting_description ? "is-invalid" : "")}
                                            {...registerMeeting("meeting_description", {required: true})}
                                        />
                                        {errorsMeeting.meeting_description &&
                                            <div className="invalid-feedback text-start">Bu alan
                                                zorunlu.</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseMeeting}>Vazgeç
                        </button>
                        <button type="submit" className="btn btn-tk-save btn-sm">Kaydet
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
                                render={({field: {onChange, name, value, ref}}) => (
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions={true}
                                        value={value}
                                        ref={ref}
                                        defaultValue={defaultOptionsEmployee}
                                        filterOption={() => (true)}
                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                        loadOptions={asyncGetEmployees}
                                        placeholder={'Personel Seçiniz'}
                                        name="assigned_user_id"
                                        onFocus={() => {
                                            asyncGetEmployees('')
                                        }}
                                        loadingMessage={() => "Yükleniyor..."}
                                        onInputChange={handleInputChangeEmployee}
                                        onChange={(option) => {
                                            setDefaultOptionsEmployee(option)
                                            onChange(option)
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
                                render={({field: {onChange, name, value, ref}}) => (
                                    <AsyncSelect
                                        cacheOptions
                                        value={value}
                                        defaultOptions
                                        ref={ref}
                                        filterOption={() => (true)}
                                        defaultValue={defaultOptions}
                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                        loadOptions={asyncGetCustomers}
                                        placeholder={'Firma Seçiniz'}
                                        name="customer_id"
                                        onFocus={() => {
                                            asyncGetCustomers('')
                                        }}
                                        isMulti
                                        onInputChange={handleInputChangeCustomers}
                                        loadingMessage={() => "Yükleniyor..."}
                                        onChange={(option) => {
                                            setDefaultOptions(value => option.map(item => item.value))
                                            onChange(option)
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
                            {errorsAssignment.customer_id &&
                                <div
                                    className="registerTitle text-danger"> {errorsAssignment.customer_id.message}</div>}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseUserCustomerModal}>Vazgeç
                        </button>
                        <button type="submit" form="2" className="btn btn-tk-save btn-sm">Kaydet
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
                                name="errorsAssignment.customer_id"
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
                                    className="registerTitle text-danger">  {errorsRequest.assigned_user_id.message}</div>}
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
                                <div className="registerTitle text-danger"> {errorsRequest.customer_id.message}</div>}
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
                                className="btn btn-tk-save btn-sm" {...register("id")}>Kaydet
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
                                    className="registerTitle text-danger">  {errorsCustomerOfficial.customer_official.message}</div>}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseCustomerOfficial}>Vazgeç
                        </button>
                        <button type="submit" form="4" className="btn btn-tk-save btn-sm">Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" id="eventAddModalLabel">
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
                                    session.user.permission_id === 1 ? (
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
                                            <tr>
                                                <th scope="row">{index + 1}</th>
                                                <td>{item.customerOfficial.name} {item.customerOfficial.surname}</td>
                                                <td>{item.customerOfficial.phone}</td>
                                                <td>{item.customerOfficial.email}</td>
                                                <td>
                                                    {
                                                        session.user.permission_id === 1 ? (
                                                            <a className="cursor-pointer" title="Sil" onClick={() => {
                                                                deleteCustomerOfficial(item.customer_id, item.id, item.customerOfficial.id)
                                                            }}>
                                                                <i className="fal fa-trash-alt mt-2"></i>
                                                            </a>
                                                        ) : null
                                                    }
                                                </td>

                                            </tr>
                                        </>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal"
                                onClick={handleCloseDetail}>Vazgeç
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={showDetailNotOfficial} onHide={handleCloseDetailNotOfficial}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" id="eventAddModalLabel">
                        Yetkili Kişiler Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-danger py-1 px-2" role="alert">
                        <i className="fas fa-exclamation-square me-1"></i>Firmaya ait yetkili kişi bulunmamaktadır.
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal"
                                onClick={handleCloseDetailNotOfficial}>Vazgeç
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

PotentialCustomer.auth = true;

export default PotentialCustomer;
