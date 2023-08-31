import React, {useState} from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {getCsrfToken, useSession, signIn, getSession} from "next-auth/react"
import {useRouter} from "next/router";
import {Spinner} from "react-bootstrap";
import Title from "../components/head";
import {Controller, useForm} from "react-hook-form";
import {Input, Button} from "rsuite";
import Image from "next/image";

const localIpAddress = require("local-ip-address")

export async function getServerSideProps(context) {
    return {
        props: {
            csrfToken: await getCsrfToken(context),
            ipAddress: localIpAddress()
        }
    }
}

export default function SignInSide({csrfToken, ipAddress}) {
    const router = useRouter();
    const {data: session, status} = useSession();
    const {register, handleSubmit, setValue, watch, control, formState: {errors}} = useForm();
    const [loading, setLoading] = useState(false);
    const [errorLogin, setErrorLogin] = useState('');

    const onSubmit = async (data) => {
        setLoading(true);
        data['redirect'] = false;
        const res = await signIn('credentials', data)
        if (!res.success) {
            if (res.status == 401) {
                setErrorLogin("E-mail veya şifre hatalı. Kontrol edip tekrar deneyiniz!")
            } else {
                setErrorLogin("Beklenmeyen bir hata gerçekleşti. Lütfen daha sonra tekrar deneyiniz!")
            }
        }
        setLoading(false);
    }

    if (status === "loading") {
        return <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div className="text-center">
                <Spinner animation="border" className="mb-3" variant="primary"/>
                <h5>Yükleniyor...</h5>
            </div>
        </div>
    }
    if (session) {
        if (session.user.permission_id == 1) {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/userDashboard";
        }
    } else {
        return (
            <>
                <Title title="Giriş Yap"/>
                <section className="vh-100">
                    <div className="container-fluid h-custom">
                        <div className="row d-flex justify-content-center align-items-center h-100">
                            <div className="col-md-9 col-lg-6 col-xl-5">
                                <img
                                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                                    className="img-fluid" alt="Sample image"/>
                            </div>
                            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                                <div
                                    className="d-flex flex-row align-items-center justify-content-center mb-5">
                                    <Image src="/assets/img/logo.png" priority width="300" height="100"
                                           className="img-fluid"
                                           alt=""/>
                                </div>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <input name="csrfToken" type="hidden" defaultValue={csrfToken}/>
                                    <input name="ipAddress" type="hidden" defaultValue={ipAddress}/>
                                    <div className="form-outline mb-4">
                                        <Controller
                                            name="email"
                                            control={control}
                                            defaultValue=""
                                            render={({field: {onChange, name, value}, ref}) => (
                                                <Input value={value} size="lg" autoComplete={false} name={name}
                                                       ref={ref}
                                                       onChange={(e) => {
                                                           onChange(e)
                                                           setErrorLogin("")
                                                       }}
                                                       className={(errors.email ? "form-control is-invalid" : "form-control")}
                                                       autoFocus
                                                       placeholder="Email"
                                                />
                                            )}
                                            rules={{
                                                required: {
                                                    value: true, message: "Bu alan zorunlu."
                                                }
                                            }}
                                        />
                                        {errors.email ? (
                                            <p className="text-danger small py-1">{errors.email.message}</p>) : ""}
                                    </div>
                                    <div className="form-outline mb-3">
                                        <Controller
                                            name="password"
                                            control={control}
                                            defaultValue=""
                                            render={({field: {onChange, name, value}, ref}) => (
                                                <Input type="password" size="lg" autoComplete={false}
                                                       value={value} name={name} ref={ref}
                                                       onChange={onChange}
                                                       className={(errors.password ? "form-control is-invalid" : "form-control ")}
                                                       placeholder="Şifre"
                                                />)}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Bu alan zorunlu."
                                                }
                                            }}
                                        />
                                        {errors.password ? (
                                            <p className="text-danger small py-1">{errors.password.message}</p>) : ""}
                                    </div>
                                    {errorLogin ? (<p className="text-danger small py-1"
                                                      data-cy="error-message">{errorLogin}</p>) : ""}

                                    {/*<div className="d-flex justify-content-between align-items-center">*/}
                                    {/*    <div className="form-check mb-0">*/}
                                    {/*        <input className="form-check-input me-2" type="checkbox" value=""*/}
                                    {/*               id="form2Example3"/>*/}
                                    {/*        <label className="form-check-label" htmlFor="form2Example3">*/}
                                    {/*            Remember me*/}
                                    {/*        </label>*/}
                                    {/*    </div>*/}
                                    {/*    <a href="#!" className="text-body">Forgot password?</a>*/}
                                    {/*</div>*/}

                                    <div className="text-center text-lg-end mt-4 pt-2">
                                        <Button type="submit" size="sm" className="btn btn-custom-save btn-lg"
                                                style={{
                                                    paddingLeft: "2.5rem",
                                                    paddingRight: "2.5rem"
                                                }}> {(loading) ? 'Bekleyiniz...' : 'Giriş'}
                                        </Button>
                                        {/*<p className="small fw-bold mt-2 pt-1 mb-0">Don't have an account?*/}
                                        {/*    <a href="#!" className="link-danger">Register</a>*/}
                                        {/*</p>*/}
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                    <div
                        className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
                        <div className="text-white mb-3 mb-md-0">
                            Copyright ©  {new Date().getFullYear()}. All rights reserved.
                        </div>
                        <div>
                            <a href="#!" className="text-white me-4">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#!" className="text-white me-4">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#!" className="text-white me-4">
                                <i className="fab fa-google"></i>
                            </a>
                            <a href="#!" className="text-white">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                        </div>
                    </div>
                </section>
            </>
        );
    }
}
