import React, {useEffect, useState} from 'react';
import {Image} from "react-bootstrap";
import axios from "axios";
import {useForm, Controller} from "react-hook-form";
import alert from "../../../components/alert";
import {useRouter} from 'next/router'
import Loading from "../../../components/loading";
import {AiFillEyeInvisible, AiFillEye} from "react-icons/ai";
import {signOut} from "next-auth/react";


export async function getServerSideProps(context) {
    const code = context.query.index;
    return {
        props: {
            code
        }
    }
}

function StaffPassword({code}) {
    const {register, handleSubmit, watch, setValue, getValues, reset, control, formState: {errors}} = useForm({
        mode: 'onTouched'
    });
    const id = (code.split('-')).pop()
    const [userCode, setUserCode] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const [passwordEye, setPasswordEye] = useState(false);
    const [confirmPasswordEye, setConfirmPasswordEye] = useState(false);
    const password = watch('password')

    const handlePasswordClick = () => {
        setPasswordEye(!passwordEye);
    };
    const handleConfirmPasswordClick = () => {
        setConfirmPasswordEye(!confirmPasswordEye);
    };

    async function getUserCode() {
        await axios({
            method: 'POST',
            url: '/api/staff/staffManagement/get-user-code',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {id: id}
        }).then(function (response) {
            setUserCode((response.data) + "-" + id)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
            if (userCode == code) {
            await axios({
                method: 'POST',
                url: '/api/staff/staffManagement/create-password',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    id: id,
                    password: data.password
                }
            }).then(function (res) {
                alert(res.data.title, res.data.message, res.data.status, () => {
                    reset()
                    setLoading(true)
                    setTimeout(function () {
                        router.push("/")
                        signOut({callbackUrl: `${process.env.NEXT_PUBLIC_URL}`})
                    }, 1000)
                })
                setLoading(false)
            }).catch(function (error) {
                console.log(error)
            })
        } else {
            alert("Başarısız!", "Erişim sağlanamadı.", "error", () => {
                reset()
                setLoading(true)
                setTimeout(function () {
                    router.push("/")
                }, 1000)
            })
            setLoading(false)
        }
    }
    useEffect(() => {
        getUserCode()
    }, []);

    return (
        <>
            {loading ? (
                <Loading/>
            ) : (
                <div className="mt-5">
                    <div className="mt-5">
                        <div className="row mx-0 d-flex justify-content-center">
                            <div className="col-12 d-flex justify-content-center">
                                <img src="/public/logo.png" style={{width: "17%"}} className="img-fluid"
                                     layout={"raw"}
                                     alt={"Logo"}/>
                            </div>
                            <div className="col-5 pt-5">
                                <div className="card pt-4 pb-5 shadow">
                                    <div className="card-body text-center">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <h5 className="text-left mb-3 fs-5">
                                                Şifre Belirleme
                                            </h5>
                                            <div className="d-flex justify-content-center px-5 ">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="input-group mb-3">
                                                            <input type={passwordEye === false ? "password" : "text"}
                                                                   className={"form-control form-control-sm  rounded-start rounded-0 " + (errors.password ? "is-invalid" : "")}
                                                                   autoFocus={true}
                                                                   placeholder="Şifre"
                                                                   {...register("password", {
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
                                                                   })}/>
                                                            <div className="input-group-text">
                                                                {passwordEye === false ? (
                                                                    <AiFillEyeInvisible onClick={handlePasswordClick}/>
                                                                ) : (
                                                                    <AiFillEye onClick={handlePasswordClick}/>
                                                                )}
                                                            </div>
                                                            {errors.password && <div
                                                                className="invalid-feedback text-start">{errors.password.message}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-12 my-3">
                                                        <div className="input-group mb-3">
                                                            <input
                                                                type={confirmPasswordEye === false ? "password" : "text"}
                                                                className={"form-control form-control-sm  rounded-start rounded-0 " + (errors.password ? "is-invalid" : "")}
                                                                onPaste={(e) => {
                                                                    e.preventDefault()
                                                                    return false;
                                                                }}
                                                                placeholder="Şifre Tekrar"
                                                                {...register("confirmPassword", {
                                                                    required: 'Bu alan zorunludur.',
                                                                    validate: (value) =>
                                                                        value === password || "Şifreler eşleşmiyor",
                                                                })}/>
                                                            <div className="input-group-text">
                                                                {passwordEye === false ? (
                                                                    <AiFillEyeInvisible
                                                                        onClick={handleConfirmPasswordClick}/>
                                                                ) : (
                                                                    <AiFillEye onClick={handleConfirmPasswordClick}/>
                                                                )}
                                                            </div>
                                                            {errors.confirmPassword &&
                                                                <span
                                                                    className="invalid-feedback text-start">{errors.confirmPassword.message}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-12 mt-3">
                                                        <button type="submit"
                                                                className="btn btn-primary btn-block rounded-2 w-100">
                                                            Şifre Oluştur
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )} </>
    );
}

export default StaffPassword;