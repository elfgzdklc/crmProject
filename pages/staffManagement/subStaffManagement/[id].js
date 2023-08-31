import React, { useState, useEffect } from 'react';
import { Table, CustomProvider, Pagination } from "rsuite";
import { Breadcrumbs, Button } from "@mui/material";
import Link from 'next/link';
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import askDelete from "../../../components/askDelete";
import alert from "../../../components/alert";
import NumberFormat from "react-number-format";
import { locale } from "../../../public/rsuite/locales/tr_TR";
import { useSession } from "next-auth/react";
import Title from "../../../components/head";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Modal from "react-bootstrap/Modal";

export async function getServerSideProps(context) {
    const id = context.query.id;
    const token = context.req.cookies['__Crm-next-auth.session-token']
    if (token) {
        return {
            props: {
                token: token,
                id
            },
        }
    }
    else {
        context.res.writeHead(302, { Location: `${process.env.NEXT_PUBLIC_URL}` });
    }
}

function SubStaffManagement({ id, token }) {
    const { data: session } = useSession();
    const [staff, setStaff] = useState();
    const [user_department_id, setUserDepartmentId] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState();
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");
    const [hide, setHide] = useState(false);
    const [hideAgain, setHideAgain] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showPassModal, setShowPassModal] = useState(false);

    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    const handleClosePassModal = () => setShowPassModal(false);
    const handleShowPassModal = () => setShowPassModal(true);
    async function getDepartments() {
        await axios({
            method: 'post',
            url: `/api/users/departments/get-departments`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                id: id
            }
        }).then(function (response) {
            setUserDepartmentId(response.data[0]);
        }).catch(function (error) {
            console.log(error);
        })
    }

    async function getDepartmentUser() {
        await axios({
            method: 'post',
            url: `/api/users/liable-staff-department`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                id: id
            }
        }).then(function (response) {
            setUserDepartmentId(response.data[0]);
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
                AuthToken: token
            }
        }).then(function (response) {
            setPermissions(response.data);
        }).catch(function (error) {
            console.log(error);
        })
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const handleDeleteStaff = (id) => {
        askDelete(`/api/users/delete-user/${id}`, token, function () {
            getStaff()
        }
        );
    }

    async function getStaff() {
        await axios({
            method: 'POST',
            url: `/api/users/get-sub-staff`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: JSON.stringify({
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search,
                id: id
            }
            ),
        }).then(function (response) {
            setStaff(response.data.data);
            setDepartments(response.data.data);
            setTotal(response.data.total);
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

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: `/api/users/add-edit-sub-staff/${id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: JSON.stringify(data),
        }).then(function (res) {
            handleCloseAddModal()
            alert(res.data.title, res.data.message, res.data.status, () => {
                getStaff()
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
                AuthToken: token
            },
            data: JSON.stringify(data)
        }).then(function (res) {
            handleCloseAddModal()
            alert(res.data.title, res.data.message, res.data.status, () => {
                getStaff()
                reset()
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const { register, handleSubmit, setValue, getValue, reset, watch, formState: { errors }, control } = useForm();
    const {
        register: registerPass,
        handleSubmit: handleSubmitPass,
        setValue: setValuePass,
        reset: resetPass,
        watch: watchPass,
        formState: { errors: errorsPass }
    } = useForm();
    const password = watchPass('password')
    useEffect(() => {
        getStaff();
        getDepartments();
        getPermissions();
        getDepartmentUser()
    }, [limit, page, sortColumn, sortType, search, watch]);

    return (
        <div>
            <Title title="Personeller" />
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    {
                        session.user.permission_id == 1 ? (
                            <Link underline="none" color="inherit" href="/dashboard">
                                Ana Sayfa
                            </Link>
                        ) : (
                            <Link underline="none" color="inherit" href="/userDashboard">
                                Ana Sayfa
                            </Link>
                        )
                    }
                    <Link underline="none" color="inherit" href="/staffManagement/staffManagement">
                        Personel Yönetimi
                    </Link>
                    <Link href={`/staffManagement/subStaffManagement/${id}`}>
                        <a>Personeller</a>
                    </Link>
                </Breadcrumbs>
                {/* start: Header */}
                <div className="ps-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                    <div className="row w-100">
                        <div className="col-md-4 col-12 mb-2 mb-md-0">
                            <h5 className="fw-bold mb-0">
                                <Button variant="outlined" className="text-capitalize btn-custom"
                                    onClick={() => {
                                        reset();
                                        setValue("id", 0);
                                        setValue('identity_number', "");
                                        setValue('title', "");
                                        setValue('name', "");
                                        setValue('surname', "");
                                        setValue('phone', "");
                                        setValue('email', "");
                                        setValue('department_id', user_department_id.id);
                                        setValue('department_name', user_department_id.name);
                                        setValue('permission_name', 0);
                                        setValue('personel_code', "");
                                        handleShowAddModal()
                                    }}>
                                    <i className="fas fa-plus me-1"></i> Yeni Personel
                                </Button>
                            </h5>
                        </div>
                        <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                            <h5 className="fw-bold mb-0">
                                <div className="d-flex" role="search">
                                    <input className="form-control form-control-sm me-2" type="search" placeholder="Arama"
                                        aria-label="Arama"
                                        onChange={(e) => setSearch(e.target.value)} />
                                    <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
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
                            data={staff}>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Adı</Table.HeaderCell>
                                <Table.Cell dataKey="name" />
                            </Table.Column>
                            <Table.Column flexGrow={1}>
                                <Table.HeaderCell>Soyadı</Table.HeaderCell>
                                <Table.Cell dataKey="surname" />
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>E-Posta</Table.HeaderCell>
                                <Table.Cell dataKey="email" />
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Departman</Table.HeaderCell>
                                <Table.Cell dataKey="department.department_name" />
                            </Table.Column>
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
                                                handleShowDetail()
                                            }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            <a title="Düzenle" className="cursor-pointer"
                                                onClick={() => {
                                                    reset();
                                                    setValue('id', rowData.id);
                                                    setValue('identity_number', rowData.identity_number);
                                                    setValue('title', rowData.title);
                                                    setValue('name', rowData.name);
                                                    setValue('surname', rowData.surname);
                                                    setValue('phone', rowData.phone);
                                                    setValue('email', rowData.email);
                                                    setValue('department_id', rowData.department.id);
                                                    setValue('department_name', rowData.department.department_name);
                                                    setValue('permission_name', rowData.permission.id);
                                                    handleShowAddModal();
                                                }}>
                                                <i className="fal fa-edit me-1"></i>
                                            </a>
                                            {
                                                session.user.permission_id == 1 ? (
                                                    <a className="cursor-pointer ms-1"
                                                        title="Şifre Belirle"

                                                        onClick={() => {
                                                            resetPass()
                                                            setValuePass('id', rowData.id);
                                                            setValuePass('name', rowData.name);
                                                            setValuePass('surname', rowData.surname);
                                                            handleShowPassModal()
                                                        }}>
                                                        <i className="fal fa-light fa-key me-2"></i>
                                                    </a>
                                                ) : (
                                                    <>
                                                    </>
                                                )
                                            }
                                            <a className="cursor-pointer me-2" title="Personel Firma Listesi"
                                                href={'/staffManagement/staffManagement/staffToCustomer/' + rowData.id}>
                                                <i className="far fa-list-ul"></i>
                                            </a>
                                            {
                                                session.user.permission_id === 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        handleDeleteStaff(rowData.id)
                                                    }}>
                                                        <i className="fal fa-trash-alt"></i>
                                                    </a>) : null
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
                            onChangeLimit={handleChangeLimit} />
                    </CustomProvider>

                </div>
            </div>

            {/*Detail Modal*/}
            <Modal show={showDetail} onHide={handleCloseDetail} size="xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        {watch('name')} {watch('surname')}
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6 p-3">
                            <div className="card shadow">
                                <div className="card-body pt-1">
                                    <div className="col-md-12">
                                        <label className="pt-2 pb-2">Tc Kimlik No</label>
                                        <input
                                            className="form-control form-control-sm"  {...register("identity_number")}
                                            readOnly />
                                        <label className="pt-2 pb-2">Email </label>
                                        <input
                                            className="form-control form-control-sm" {...register("email")}
                                            readOnly />
                                        <label className="pt-2 pb-2">Telefon </label>
                                        <input
                                            className="form-control form-control-sm" {...register("phone")}
                                            readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 p-3">
                            <div className="card shadow">
                                <div className="card-body pt-1">
                                    <div className="col-md-12">
                                        <label className="pt-2 pb-2">Unvan</label>
                                        <input
                                            className="form-control form-control-sm"  {...register("title")}
                                            readOnly />
                                        <label className="pt-2 pb-2">Departman </label>
                                        <input
                                            className="form-control form-control-sm" {...register("department_name")}
                                            readOnly />
                                        <div className="row">
                                            <div className="col-6">
                                                <label className="pt-2 pb-2">Yetki </label>
                                                <input
                                                    className="form-control form-control-sm " {...register("permission_name")}
                                                    readOnly />
                                            </div>
                                            <div className="col-6">
                                                <label className="pt-2 pb-2">Personel Kodu </label>
                                                <input
                                                    className="form-control form-control-sm " {...register("personel_code")}
                                                    readOnly />
                                            </div>
                                        </div>
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

            {/*Edit-Add Modal*/}
            <Modal show={showAddModal} onHide={handleCloseAddModal} size="xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" >
                        Personel {watch("id") ? 'Düzenle' : 'Ekle'}
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
                                        render={({ field: { onChange, identity_number, value } }) => (
                                            <NumberFormat
                                                format="###########"
                                                name={identity_number}
                                                value={value}
                                                onChange={onChange}
                                                className={"form-control form-control-sm " + (errors.identity_number ? "is-invalid" : "")}
                                            />
                                        )}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^[0-9]{11}$/
                                            }
                                        }}                                        
                                    />
                                </div>
                                {errors.identity_number?.type === "required" &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                                {errors.identity_number?.type === "pattern" &&
                                    <span className="text-danger">Kimlik formatını kontrol ediniz.</span>}
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Unvan</label>
                                <input className="form-control form-control-sm" {...register("title")} />
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm " + (errors.name ? "is-invalid" : "")}
                                    autoFocus={true} {...register("name", { required: true })} />
                                {errors.name && <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Soyadı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm " + (errors.surname ? "is-invalid" : "")}
                                    autoFocus={true} {...register("surname", { required: true })} />
                                {errors.surname &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Telefon</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <div className="input-group has-validation">
                                    <Controller
                                        control={control}
                                        name="phone"
                                        render={
                                            ({ field: { onChange, name, value } }) => (
                                                <NumberFormat
                                                    placeholder="0xxx xxx xx xx"
                                                    format="0### ### ## ##"
                                                    mask={"_"}
                                                    name={name}
                                                    value={value}
                                                    onChange={onChange}
                                                    className={"form-control form-control-sm w-100 " + (errors.name ? "is-invalid" : "")}
                                                />
                                            )
                                        }
                                        rules={{ required: true }}
                                    />
                                    {errors.phone?.type === "required" &&
                                        <p className="text-danger">Bu alan zorunlu.</p>}
                                </div>
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">E-Posta</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm " + (errors.email ? "is-invalid" : "")}
                                    autoFocus={true} {...register("email",
                                        {
                                            required: true,
                                            pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                        })} />
                                {errors.email?.type === "required" &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                                {errors.email?.type === "pattern" &&
                                    <span className="text-danger">Email formatında veri giriniz.</span>}
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Departman</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input className="form-control form-control-sm"
                                    value={user_department_id.id} {...register("department_name")} disabled
                                    hidden />
                                <input className="form-control form-control-sm"
                                    value={user_department_id.department_name} disabled />
                                {errors.department_name &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Yetki</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                {/*<input className="form-control form-control-sm" autoFocus={true} {...register("permission_name", {required: true})}/>*/}
                                <select
                                    className="form-select form-select-sm" {...register("permission_name", { required: true })}>
                                    <option value="">Seçiniz</option>
                                    {permissions.map(permission => (
                                        <option key={permission.id}
                                            value={permission.id}>{permission.permission_name}</option>
                                    ))}
                                </select>
                                {errors.permission_name &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                            <div className="col-md-6 col-12">
                                <label className="my-1">Personel Kodu</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm " + (errors.personel_code ? "is-invalid" : "")}
                                    autoFocus={true} {...register("personel_code", { required: true })} />
                                {errors.personel_code &&
                                    <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseAddModal}>Vazgeç
                        </button>
                        <button type="submit" className="btn btn-custom-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/*Password Modal*/}
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

                                <label className="pb-2 mt-2">Şifre</label>
                                <div className="input-group">
                                    <input type={!hide ? "password" : "text"}
                                        className={"form-control form-control-sm border-end-0 " + (errorsPass.password ? "is-invalid" : "")}
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
                                    {errorsPass.password &&
                                        <div
                                            className="invalid-feedback text-start">{errorsPass.password.message}</div>}
                                    <i className="icon input-group-text bg-white border-start-0 passwordIcon"
                                        onClick={toggle}>
                                        {hide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                    </i>
                                </div>
                                <label className="pt-2 pb-2">Şifre Tekrarı </label>
                                <div className="input-group">
                                    <input type={!hideAgain ? "password" : "text"}
                                        className={"form-control form-control-sm  border-end-0 " + (errorsPass.password_confirm ? "is-invalid" : "")}
                                        onPaste={(e) => {
                                            e.preventDefault()
                                            return false;
                                        }} {...registerPass("password_confirm", {
                                            required: 'Bu alan zorunludur.',
                                            validate: (valuePass) =>
                                                valuePass === password || "Şifreler eşleşmiyor",
                                        })}
                                    />
                                    {errorsPass.password_confirm &&
                                        <span
                                            className="invalid-feedback text-start">{errorsPass.password_confirm.message}</span>}
                                    <i className="icon input-group-text bg-white border-start-0 passwordIcon"
                                        onClick={toggleAgain}>
                                        {hideAgain ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                    </i>
                                </div>
                                <div className="alert alert-primary py-2 mt-3" role="alert">
                                    <span className="alertText">Şifre en az iki büyük bir küçük harf [Türkçe karakterler hariç], bir sayısal değer ve bir özel karakter içermelidir.</span>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                            onClick={handleClosePassModal}>Vazgeç
                        </button>
                        <button type="submit" className="btn btn-custom-save btn-sm" {...registerPass("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

SubStaffManagement.auth = true;
export default SubStaffManagement;
