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
import NumberFormat from "react-number-format";
import Modal from "react-bootstrap/Modal";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {userAgent} from "next/server";

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

function StaffManagements(props) {
    const {register, handleSubmit, setValue, reset, watch, formState: {errors}, control} = useForm();
    const {
        register: registerPass,
        handleSubmit: handleSubmitPass,
        setValue: setValuePass,
        reset: resetPass,
        watch: watchPass,
        formState: {errors: errorsPass}
    } = useForm();
    const {data: session} = useSession()
    const [staffs, setStaffs] = useState([]);
    const [permission_id, setPermissionId] = useState("");
    const [departments, setDepartments] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [userLiableList, setUserLiableList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [u_id, setID] = useState(session.user.id);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState();
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");
    const password = watchPass('password')
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showPassModal, setShowPassModal] = useState(false);
    const [hide, setHide] = useState(false);
    const [hideAgain, setHideAgain] = useState(false);
    const [userLiable, setUserLiable] = useState();
    const router = useRouter();

    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    const handleClosePassModal = () => setShowPassModal(false);
    const handleShowPassModal = () => setShowPassModal(true);

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
            if (response.data[0] === undefined || response.data[0].staff_management === 0) {
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
                getStaff();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    const toggle = () => {
        setHide((prev) => !prev);
    };

    const toggleAgain = () => {
        setHideAgain((prev) => !prev);
    };

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

    async function getPermissions() {
        await axios({
            method: 'post',
            url: '/api/users/permissions/get-permissions',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setPermissions(response.data);
        }).catch(function (error) {
            console.log(error);
        })
    }

    async function getUserLiable() {
        await axios({
            method: 'post',
            url: '/api/users/get-user-liable-list',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setUserLiableList(response.data.data);
        }).catch(function (error) {
            console.log(error);
        })
    }

    async function getPermissionUser() {
        await axios({
            method: 'post',
            url: '/api/users/get-permission',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setPermissionId(response.data[0].permission_id);
        }).catch(function (error) {
            console.log(error);
        })
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    async function getStaff() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/users/get-permission',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            const permission = response.data[0].permission_id;
            axios({
                method: 'post',
                url: "/api/users/get-users",
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
                    permission_id: permission,
                    user_id: u_id
                }),
            }).then(function (response) {
                setStaffs(response.data.data);
                setLoading(false);
                setTotal(response.data.total);
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log(error);
        })
    }

    const handleDeleteStaff = (id) => {
        let token = props.token;
        askDelete(`/api/users/delete-user/${id}`, token, function () {
                getStaff()
            }
        );
    }

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/users/add-edit-user',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (res) {
            handleCloseAddModal();
            getStaff()
            alert(res.data.title, res.data.message, res.data.status, () => {
                reset()
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmitPass = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/staff/staffManagement/update-password',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data)
        }).then(function (res) {
            handleClosePassModal()
            alert(res.data.title, res.data.message, res.data.status, () => {
                getStaff()
                reset()
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        getPermissionDetail();
        getDepartments();
        getPermissions();
        getPermissionUser();
        getUserLiable();
    }, [limit, page, sortColumn, sortType, search, watch, userLiable]);

    return (
        <div>
            <Title title="Personel Yönetimi"/>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/staffManagement/staffManagement">
                        Personel Yönetimi
                    </Link>
                </Breadcrumbs>
                {/* start: Header */}
                <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                    <div className="row w-100">
                        <div className="col-md-4 col-12 mb-2 mb-md-0">
                            <h5 className="fw-bold mb-0">

                                {
                                    permission_id == 1 ? (
                                        <Button variant="outlined" className="text-capitalize btn-tk"
                                                onClick={() => {
                                                    reset();
                                                    setValue("id", 0);
                                                    setValue('identity_number', "");
                                                    setValue('title', "");
                                                    setValue('name', "");
                                                    setValue('surname', "");
                                                    setValue('phone', "");
                                                    setValue('email', "");
                                                    setValue('department_name', "");
                                                    setValue('permission_name', "");
                                                    setValue('user_liable', "");
                                                    setValue('parent_id', "");
                                                    setValue('personel_code', "");
                                                    handleShowAddModal();

                                                }}>
                                            <i className="fas fa-plus me-1"></i> Yeni Personel
                                        </Button>
                                    ) : (
                                        <a className="cursor-pointer" hidden>
                                            <i className="far fa-user me-2"></i>
                                        </a>
                                    )
                                }
                            </h5>
                        </div>
                        <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                            <h5 className="fw-bold mb-0">
                                <div className="d-flex" role="search">
                                    <input className="form-control form-control-sm  me-2" type="search"
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
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
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
                            data={staffs}
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Adı</Table.HeaderCell>
                                <Table.Cell dataKey="name"/>
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Soyadı</Table.HeaderCell>
                                <Table.Cell dataKey="surname"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>E-Posta</Table.HeaderCell>
                                <Table.Cell dataKey="email"/>
                            </Table.Column>
                            <Table.Column width={200} flexGrow={1}>
                                <Table.HeaderCell>Departman</Table.HeaderCell>
                                <Table.Cell dataKey="department.department_name"/>
                            </Table.Column>
                            {(() => {
                                if (session.user.permission_id === 1) {
                                    return (
                                        <>
                                            <Table.Column width={200} flexGrow={1}>
                                                <Table.HeaderCell>Yetkili Kişi</Table.HeaderCell>
                                                <Table.Cell dataKey="user.fullName">
                                                    {
                                                        rowData => {
                                                            if (rowData.user_liable === 1) {
                                                                return (
                                                                    <i className="far fa-check me-1 fs-5"
                                                                       title="Yetkili Kişi"></i>
                                                                )
                                                            } else {
                                                                return (
                                                                    <label>{rowData.user.fullName}</label>
                                                                )
                                                            }
                                                        }
                                                    }
                                                </Table.Cell>
                                            </Table.Column>
                                        </>
                                    )
                                } else {
                                    return (<></>)
                                }
                            })()}

                            <Table.Column width={200} align="center" resizable>
                                <Table.HeaderCell>
                                    İşlemler
                                </Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>

                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                setValue('id', rowData.id);
                                                setValue('name', rowData.name);
                                                setValue('surname', rowData.surname);
                                                setValue('email', rowData.email);
                                                setValue('phone', rowData.phone);
                                                setValue('title', rowData.title);
                                                setValue('identity_number', rowData.identity_number);
                                                setValue('department_name', rowData.department.department_name);
                                                setValue('permission_name', rowData.permission.permission_name);
                                                setValue('personel_code', rowData.personel_code);
                                                handleShowDetail();
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>

                                            {
                                                permission_id == 1 ? (
                                                    <a className="cursor-pointer"
                                                       title="Şifre Belirle"
                                                       onClick={() => {
                                                           resetPass()
                                                           setValuePass('id', rowData.id);
                                                           setValuePass('name', rowData.name);
                                                           setValuePass('surname', rowData.surname);
                                                           handleShowPassModal()
                                                       }}>
                                                        <i className="fal fa-key me-2"></i>
                                                    </a>
                                                ) : (
                                                    <>
                                                    </>
                                                )
                                            }

                                            <a title="Düzenle"
                                               className="cursor-pointer"
                                               onClick={() => {
                                                   reset();
                                                   setValue('id', rowData.id);
                                                   setValue('identity_number', rowData.identity_number);
                                                   setValue('title', rowData.title);
                                                   setValue('name', rowData.name);
                                                   setValue('surname', rowData.surname);
                                                   setValue('phone', rowData.phone);
                                                   setValue('email', rowData.email);
                                                   setValue('department_name', rowData.department.id);
                                                   setValue('permission_name', rowData.permission.id);
                                                   setValue('parent_id', rowData.parent_id);
                                                   setValue('personel_code', rowData.personel_code);
                                                   setValue('user_liable', rowData.user_liable);
                                                   handleShowAddModal();
                                               }}>
                                                <i className="fal fa-edit me-2"></i>
                                            </a>
                                            {
                                                permission_id == 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        handleDeleteStaff(rowData.id)
                                                    }}>
                                                        <i className="fal fa-trash-alt me-2"></i>
                                                    </a>
                                                ) : (
                                                    <a className="cursor-pointer" hidden>
                                                        <i className="fal fa-user-check me-2"></i>
                                                    </a>
                                                )
                                            }
                                            <a className="cursor-pointer" title="Personel Firma Listesi"
                                               href={'/staffManagement/staffManagement/staffToCustomer/' + rowData.id}>
                                                <i className="far fa-list-ul"></i>
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

            <Modal show={showDetail} onHide={handleCloseDetail}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        {watch('name')} {watch('surname')}
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="col-md-12">
                                <label className="pb-2">Unvan</label>
                                <input
                                    className="form-control form-control-sm mb-2"  {...register("title")}
                                    readOnly/>
                                <label className="pb-2">Tc Kimlik No</label>
                                <input
                                    className="form-control form-control-sm mb-2"  {...register("identity_number")}
                                    readOnly/>
                                <label className="pb-2">Email </label>
                                <input
                                    className="form-control form-control-sm mb-2" {...register("email")}
                                    readOnly/>
                                <label className="pb-2">Telefon </label>
                                <input
                                    className="form-control form-control-sm " {...register("phone")}
                                    readOnly/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="col-md-12">
                                <div className="col-12">
                                    <label className="pb-2">Personel
                                        Kodu </label>
                                    <input
                                        className="form-control form-control-sm mb-2" {...register("personel_code")}
                                        readOnly/>
                                </div>
                                <label className="pb-2">Departman </label>
                                <input
                                    className="form-control form-control-sm mb-2" {...register("department_name")}
                                    readOnly/>
                                <div className="row">
                                    <div className="col-12">
                                        <label className="pb-2">Yetki </label>
                                        <input
                                            className="form-control form-control-sm mb-2" {...register("permission_name")}
                                            readOnly/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={showPassModal} onHide={handleClosePassModal}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Şifre Belirle
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitPass(onSubmitPass)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                <h5 className="modal-title">
                                    {watchPass('name')} {watchPass('surname')}
                                </h5>
                            </div>
                            <div className="col-md-12">
                                <label className="mt-2 pb-2">Şifre</label>
                                <div className="input-group">
                                    <input type={!hide ? "password" : "text"}
                                           className={"form-control form-control-sm " + (errorsPass.password ? "is-invalid" : "")}
                                           {...registerPass("password", {
                                               required: 'Bu alan zorunludur.',
                                               pattern: {
                                                   value: /^(\S)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])[a-zA-Z0-9~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]{8,20}$/,
                                                   message: 'Şifre en az iki büyük bir küçük harf [Türkçe karakterler hariç], bir sayısal' +
                                                       ' değer ve bir özel karakter içermelidir.'
                                               },
                                               minLength: {
                                                   value: 8,
                                                   message: "Minimum Gerekli uzunluk 8'dir."
                                               },
                                               maxLength: {
                                                   value: 20,
                                                   message: "Maksimum Gerekli uzunluk 20'dir.",
                                               },
                                           })}
                                    />
                                    <i className="icon input-group-text bg-white passwordIcon"
                                       onClick={toggle}>
                                        {hide ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                                    </i>
                                    {errorsPass.password &&
                                        <div
                                            className="invalid-feedback text-start">{errorsPass.password.message}</div>}
                                </div>
                                <label className="pt-2 pb-2">Şifre Tekrarı </label>
                                <div className="input-group">
                                    <input type={!hideAgain ? "password" : "text"}
                                           className={"form-control form-control-sm " + (errorsPass.password_confirm ? "is-invalid" : "")}
                                           onPaste={(e) => {
                                               e.preventDefault()
                                               return false;
                                           }} {...registerPass("password_confirm", {
                                        required: 'Bu alan zorunludur.',
                                        validate: (valuePass) =>
                                            valuePass === password || "Şifreler eşleşmiyor",
                                    })}
                                    />
                                    <i className="icon input-group-text bg-white passwordIcon"
                                       onClick={toggleAgain}>
                                        {hideAgain ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                                    </i>
                                    {errorsPass.password_confirm &&
                                        <span
                                            className="invalid-feedback text-start">{errorsPass.password_confirm.message}</span>}
                                </div>
                                <div className="alert alert-primary py-2 mt-3" role="alert">
                                    <span className="alertText">Şifre en az iki büyük bir küçük harf [Türkçe karakterler hariç], bir sayısal değer ve bir özel karakter içermelidir.</span>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleClosePassModal}>Vazgeç
                        </button>
                        <button type="submit" className="btn btn-tk-save btn-sm" {...registerPass("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>

            </Modal>

            <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Personel {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6 col-12">
                                <div>
                                    <label className="my-1">TC Kimlik Numarası</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <Controller
                                        control={control}
                                        name="identity_number"
                                        render={({field: {onChange, identity_number, value, ref}}) => (
                                            <NumberFormat autoFocus={true}
                                                          format="###########"
                                                          name={identity_number}
                                                          value={value}
                                                          onChange={onChange}
                                                          minLength={11}
                                                          ref={ref}
                                                          className={"form-control form-control-sm " + (errors.identity_number ? "is-invalid" : "")}
                                            />
                                        )}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^[0-9]{11}$/i,
                                                message: "Kimlik numaranız doğru formatta değil"
                                            }
                                        }}
                                    />
                                </div>
                                {errors.identity_number?.type === "required" &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                                {errors.identity_number?.type === "pattern" &&
                                    <span className="text-danger">Kimlik formatını kontrol ediniz.</span>}
                                <div className="mt-1">
                                    <label className="my-1">Adı</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input
                                        className={"form-control form-control-sm " + (errors.name ? "is-invalid" : "")}
                                        {...register("name", {required: true})}/>
                                    {errors.name && <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>
                                <div className="mt-1">
                                    <label className="my-1">Telefon</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <div className="input-group has-validation">
                                        <Controller
                                            control={control}
                                            name="phone"
                                            render={
                                                ({field: {onChange, name, value, ref}}) => (
                                                    <NumberFormat
                                                        format="0### ### ## ##"
                                                        mask={"_"}
                                                        name={name}
                                                        value={value}
                                                        onChange={onChange}
                                                        ref={ref}
                                                        minLength={11}
                                                        className={"form-control form-control-sm w-100 " + (errors.phone ? "is-invalid" : "")}
                                                    />
                                                )
                                            }
                                            rules={{
                                                required: true,
                                            }}
                                        />
                                        {errors.phone?.type === "required" &&
                                            <p className="text-danger">Bu alan zorunlu.</p>}
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <label className="my-1">Departman</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <select
                                        className={"form-select form-select-sm  " + (errors.department_name ? "is-invalid" : "")} {...register("department_name", {required: true})}>
                                        <option value="">Seçiniz</option>
                                        {departments.map((department, index) => (
                                            <option key={department.id}
                                                    value={department.id}>{department.department_name}</option>
                                        ))}
                                    </select>
                                    {errors.department_name &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>
                                <div className="mt-1">
                                    <label className="my-1">Sorumlu</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <select
                                        className="form-select form-select-sm" {...register("user_liable", {required: true})}
                                        onChange={(e) => {
                                            setUserLiable(e.target.value)
                                        }}
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="1">Evet</option>
                                        <option value="2">Hayır</option>

                                    </select>
                                    {errors.user_liable &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>
                                <div className="mt-1">
                                    <label className="my-1">Personel Kodu</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input
                                        className={"form-control form-control-sm " + (errors.personel_code ? "is-invalid" : "")}
                                        {...register("personel_code", {required: true})}/>
                                    {errors.personel_code &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>

                            </div>
                            <div className="col-md-6 col-12">
                                <div>
                                    <label className="my-1">Unvan</label>
                                    <input className="form-control form-control-sm" {...register("title")}/>

                                </div>
                                <div className="mt-1">
                                    <label className="my-1">Soyadı</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input
                                        className={"form-control form-control-sm " + (errors.surname ? "is-invalid" : "")}
                                        {...register("surname", {required: true})}/>
                                    {errors.surname &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>
                                <div className="mt-1">
                                    <label className="my-1">E-Posta</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input
                                        className={"form-control form-control-sm " + (errors.email ? "is-invalid" : "")}
                                        {...register("email",
                                            {
                                                required: true,
                                                pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                            })}/>
                                    {errors.email?.type === "required" &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                    {errors.email?.type === "pattern" &&
                                        <span className="text-danger">Email formatında veri giriniz.</span>}
                                </div>
                                <div className="mt-1">
                                    <label className="my-1">Yetki</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <select
                                        className="form-select form-select-sm" {...register("permission_name", {required: true})}>
                                        <option value="">Seçiniz</option>
                                        {permissions.map(permission => (
                                            <option key={permission.id}
                                                    value={permission.id}>{permission.permission_name}</option>
                                        ))}
                                    </select>
                                    {errors.permission_name &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>
                                {userLiable == 2 ? (
                                    <>
                                        <div className="mt-1">
                                            <label className="my-1">Sorumlu Kişisi</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <select
                                                className={"form-select form-select-sm  "} {...register("parent_id", {required: true})}>
                                                <option value="">Seçiniz</option>
                                                {userLiableList.map((userLiable, index) => (
                                                    <option key={index}
                                                            value={userLiable.id}>{userLiable.name} {userLiable.surname}</option>
                                                ))}
                                            </select>
                                            {errors.parent_id &&
                                                <span className="text-danger">Bu alan zorunlu.</span>}
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseAddModal}
                        >Vazgeç
                        </button>
                        <button type="submit" className="btn btn-tk-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>

            </Modal>
        </div>
    );

}

StaffManagements.auth = true;
export default StaffManagements;


