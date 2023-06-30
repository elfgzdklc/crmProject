import React, {useState, useEffect} from 'react';
import {Breadcrumbs} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import NumberFormat from "react-number-format";
import {useSession} from "next-auth/react";
import axios from "axios";
import alert from "../../components/alert";
import Title from "../../components/head";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';


export async function getServerSideProps(context) {
    const token = context.req.cookies['__Crm-next-auth.session-token'] ?? ''
    const path = process.env.NEXTAUTH_URL;
    const id = context.query.id;
    const users = await axios.post(`${path}api/profile/users/get-profile-info/`, {
        id: id
    }, {
        headers: {
            AuthToken: token
        }
    });

    if (token) {
        return {
            props: {
                users: users.data,
                id,
                token: token
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function Profile(props) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
        control,
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
    } = useForm();
    const {data: session} = useSession();
    const [u_id, setID] = useState(props.id);
    const [image, setImage] = useState(null);
    const [createObjectURL, setCreateObjectURL] = useState(null);
    const [infoProfile, setInfoProfile] = useState(props.users.data);
    const [hide, setHide] = useState(false);
    const [hideNew, setNewHide] = useState(false);
    const [hideNewAgain, setNewHideAgain] = useState(false);

    const toggle = () => {
        setHide((prev) => !prev);
    };
    const toggleNew = () => {
        setNewHide((prev) => !prev);
    };
    const toggleAgain = () => {
        setNewHideAgain((prev) => !prev);
    };

    async function getInfo() {
        await axios({
            method: 'post',
            url: '/api/profile/users/get-profile-info/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                id: u_id
            }),
        }).then(function (res) {
            setInfoProfile(res.data.data);
        }).catch(function (error) {
                console.log(error);
            }
        );
    }

    const uploadToClient = (event) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0];
            setImage(i);
            setCreateObjectURL(URL.createObjectURL(i));
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        if (data.id != 0) {
            if (data.avatar != "[object FileList]") {
                formData.append("avatar", data.avatar);
            } else {
                for (let v in data.avatar) {
                    if (v != "length" && v != "item") {
                        formData.append("avatar", data.avatar[v]);
                    }
                }
            }

        } else {
            for (let v in data.avatar) {
                if (v != "length" && v != "item") {
                    formData.append("avatar", data.avatar[v]);
                }
            }
        }
        for (let value in data) {
            if (value != "avatar") {
                formData.append(value, data[value]);
            }
        }
        await axios({
            method: 'POST',
            url: '/api/profile/users/edit-profile-info',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (res) {
            alert(res.data.title, res.data.message, res.data.status, () => {
                if (res.data.status === 'success') {
                    getInfo();
                }
            })
        }).catch(function (error) {
            console.log(error);
        });
    }
    const onSubmit2 = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/profile/users/edit-profile-password',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (res) {
                alert(res.data.title, res.data.message, res.data.status, () => {
                    if (res.data.status === 'success') {
                        console.log("success");
                    }
                })
            }
        ).catch(function (error) {
                console.log(error);
            }
        );
    }
    useEffect(() => {
        getInfo();
        setValue('name', infoProfile.name);
        setValue('surname', infoProfile.surname);
        setValue('email', infoProfile.email);
        setValue('phone', infoProfile.phone);
        setValue('avatar', infoProfile.avatar);
        setValue('identity_number', infoProfile.identity_number);
    }, []);
    return (
        <div>
            <Title title="Kullanıcı Bilgileri"/>
            <div>
                {/* start: Header */}
                <div className="ps-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                    <Breadcrumbs aria-label="breadcrumb" className="bg-white p-3 rounded">
                        <h5>Hesabım {session.user.name_surname}</h5>
                    </Breadcrumbs>
                </div>
                {/* end: Header */}
            </div>
            <div className="row py-2 m-0">
                <div className="col-md-8 col-12 ps-0">
                    <div className="card bg-white rounded shadow">
                        <div className="card-body">
                            <div className="px-1 mt-2 pb-4">
                                <form onSubmit={handleSubmit(onSubmit)} method="POST">
                                    <div className="row px-3 ">
                                        <div className="col-12">
                                            <h5 className="modal-title" id="passwordModalLabel">Kişisel Bilgiler</h5>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="my-2 fw-semibold">Profil Resmi</label>
                                            <input className="form-control form-control-sm "
                                                   type="file"
                                                   id="avatar"
                                                   name="avatar"
                                                   accept='image/png, image/jpeg, image/svg'
                                                   {...register("avatar")}
                                                   multiple
                                                   onChange={uploadToClient}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="my-2 fw-semibold">T.C. Kimlik Numarası</label>
                                            <Controller
                                                name="identity_number"
                                                control={control}
                                                render={({field: {onChange, identity_number, value}, ref}) => (
                                                    <NumberFormat
                                                        format="###########"
                                                        value={value}
                                                        name="identity_number"
                                                        onChange={onChange}
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
                                        <div className="col-12 col-md-6">
                                            <div className="form-group">
                                                <label className="my-2 fw-semibold">Ad</label>
                                                <input type="text" className="form-control form-control-sm"
                                                       name="name"   {...register("name",)} />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="form-group">
                                                <label className="my-2 fw-semibold">Soyad</label>
                                                <input type="text" className="form-control form-control-sm"
                                                       name="surname"  {...register("surname")} />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="form-group">
                                                <label className="my-2 fw-semibold">E-Posta</label>
                                                <span className="registerTitle text-danger fw-bold"> *</span>
                                                <input name="email"
                                                       className={"form-control form-control-sm for" +
                                                           "m-control-sm " + (errors.email ? "is-invalid" : "")}
                                                       {...register("email",
                                                           {
                                                               pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                                           })} />
                                                {errors.email?.type === "required" &&
                                                    <span className="text-danger">Bu alan zorunlu.</span>}
                                                {errors.email?.type === "pattern" &&
                                                    <span className="text-danger">Email formatında veri giriniz.</span>}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="form-group">
                                                <label className="my-2 fw-semibold">Telefon</label>
                                                <span className="registerTitle text-danger fw-bold"> *</span>
                                                <div className="input-group has-validation">
                                                    <Controller
                                                        control={control}
                                                        render={({
                                                                     field: {
                                                                         onChange, name, value
                                                                     }
                                                                 }) => (<NumberFormat
                                                            format="0### ### ## ##"
                                                            mask={"_"}
                                                            name={name}
                                                            value={value}
                                                            onChange={onChange}
                                                            className={"form-control form-control-sm " + (errors.phone ? "is-invalid" : "")}
                                                        />)}
                                                        {...register("phone", {
                                                            required: {
                                                                value: true,
                                                                message: "Bu alan zorunlu."
                                                            }, pattern: {
                                                                value: /^[0-9 ]{14}$/,
                                                                message: "Telefon numarası 11 haneli olmalıdır."
                                                            }
                                                        })}
                                                    />
                                                    {errors.phone && <div
                                                        className="invalid-feedback text-start">{errors.phone.message}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 mt-4 text-end">
                                            <button type="submit" className="btn btn-tk-save btn-sm me-2">Güncelle
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="col-md-4 col-12 ps-0 mt-3 mt-md-0">
                    <div className="bg-white rounded shadow pb-3">
                        <div className="px-3 py-4">
                            <form onSubmit={handleSubmit2(onSubmit2)}>
                                <div className="row">
                                    <div className="col-12">
                                        <h5 className="modal-title" id="passwordModalLabel">Şifre İşlemleri</h5>
                                    </div>
                                    <div className="col-12">
                                        <label className="my-2 fw-semibold">Eski Şifre</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm border-end-0"
                                                   placeholder="**********"
                                                   {...register2("oldPassword")} type={!hide ? "password" : "text"}/>
                                            <i className="icon input-group-text bg-white border-start-0 passwordIcon"
                                               onClick={toggle}>
                                                {hide ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                                            </i>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="my-2 fw-semibold">Yeni Şifre</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm  border-end-0" required
                                                   name="newPassword"
                                                   {...register2("newPassword")} type={!hideNew ? "password" : "text"}/>
                                            <i className="icon input-group-text bg-white border-start-0 passwordIcon"
                                               onClick={toggleNew}>
                                                {hideNew ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                                            </i>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="my-2 fw-semibold">Yeni Şifre Tekrar</label>
                                        <div className="input-group">
                                            <input className="form-control form-control-sm border-end-0"
                                                   name="newPassword2"
                                                   type={!hideNewAgain ? "password" : "text"} {...register2("newPassword2")} />
                                            <i className="icon input-group-text bg-white border-start-0 passwordIcon"
                                               onClick={toggleAgain}>
                                                {hideNewAgain ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                                            </i>
                                        </div>


                                    </div>
                                    <div className="col-12 mt-4 text-end">
                                        <button type="submit" className="btn btn-tk-save btn-sm me-2">Değiştir</button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}

Profile.auth = true;
export default Profile;

