 import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import axios from 'axios';
import 'moment/locale/tr';
import {useSession} from "next-auth/react";
import Title from "../../components/head";
import {Controller, useForm} from "react-hook-form";
import NumberFormat from "react-number-format";
import alertAuthority from "../../components/alertAuthority";
import {useRouter} from "next/router";
import alertSwal from "../../components/alert";

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

function CompanySettings(props) {
    const {data: session} = useSession()
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {register, handleSubmit, setValue, watch, formState: {errors}, control} = useForm();
    const [banks, setBanks] = useState([]);

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
            if (response.data[0] === undefined || response.data[0].company_settings === 0) {
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
                getSettings();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getSettings() {
        let array = [];
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/settings/get-settings',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setBanks(response.data.banks);
            setValue('logo', response.data.settings.logo);
            setValue('signature', response.data.settings.signature);
            setValue('favicon', response.data.settings.favicon);
            setValue('favicon32', response.data.settings.favicon32);
            setValue('trade_name', response.data.settings.trade_name);
            setValue('first_phone', response.data.settings.first_phone);
            setValue('second_phone', response.data.settings.second_phone);
            setValue('email', response.data.settings.email);
            setValue('address', response.data.settings.address);
            setValue('meeting_time', response.data.settings.meeting_time);

            for (let i = 0; i < response.data.banks.length; i++) {
                setValue(`bank_name_${i}`, response.data.banks[i].bank_name);
                setValue(`bank_branch_${i}`, response.data.banks[i].bank_branch);
                setValue(`swift_code_${i}`, response.data.banks[i].swift_code);
                setValue(`usd_iban_no_${i}`, response.data.banks[i].usd_iban_no);
                setValue(`euro_iban_no_${i}`, response.data.banks[i].euro_iban_no);
            }
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmit = async (data) => {
        const formData = new FormData();

        if (data.logo != "[object FileList]") {
            formData.append("logo", data.logo);
        } else {
            formData.append("logo", data.logo[0]);
        }

        if (data.signature != "[object FileList]") {
            formData.append("signature", data.signature)
        } else {
            formData.append("signature", data.signature[0]);
        }

        if (data.favicon != "[object FileList]") {
            formData.append("favicon", data.favicon)
        } else {
            formData.append("favicon", data.favicon[0]);
        }

        if (data.favicon32 != "[object FileList]") {
            formData.append("favicon32", data.favicon32)
        } else {
            formData.append("favicon32", data.favicon32[0]);
        }

        for (let value in data) {
            if (value != "logo" && value != "signature" && value != "favicon" && value != "favicon32") {
                formData.append(value, data[value]);
            }
        }
        await axios({
            method: 'post',
            url: '/api/settings/update-settings',
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                if (session.user.permission_id === 1) {
                    router.push("/dashboard")
                } else {
                    router.push("/userDashboard")
                }
            })
        }).catch(function (error) {
            console.log(error);
        });
    };


    useEffect(() => {
        getPermissionDetail();
    }, []);


    return (
        <div>
            <Title title="Şirket Bilgileri"/>
            <div>
                {/* start: Header */}
                <div className="ps-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                    <Breadcrumbs aria-label="breadcrumb" className="bg-white p-3 rounded">
                        <h5>Şirket Bilgileri</h5>
                    </Breadcrumbs>
                </div>
                {/* end: Header */}
            </div>
            <div className={`px-3 mt-2 py-2 bg-white rounded shadow`}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row py-2 m-0">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active text-secondary" id="generalInformation-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#generalInformation" type="button" role="tab"
                                        aria-controls="generalInformation"
                                        aria-selected="true">
                                    <h6 className="modal-title  fw-semibold" id="passwordModalLabel">Genel Bilgiler</h6>
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link text-secondary" id="bankInformation-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#bankInformation"
                                        type="button" role="tab" aria-controls="bankInformation"
                                        aria-selected="false">
                                    <h6 className="modal-title fw-semibold" id="passwordModalLabel">Banka Bilgileri</h6>
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link text-secondary" id="generalDefinitions-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#generalDefinitions"
                                        type="button" role="tab" aria-controls="generalDefinitions"
                                        aria-selected="false">
                                    <h6 className="modal-title fw-semibold" id="passwordModalLabel">Genel Tanımlar</h6>
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="generalInformation" role="tabpanel"
                                 aria-labelledby="generalInformation-tab">
                                <div className="px-1 mt-2 pb-4">
                                    <div className="row px-3 ">
                                        <div className="col-12 col-md-12">
                                            <label className="my-2 fw-semibold">Şirket Ünvanı</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <input type="text" form="1"
                                                   className={"form-control form-control-sm " + (errors.trade_name ? "is-invalid" : "")}
                                                   name="trade_name"
                                                   {...register("trade_name", {required: true})} />
                                            {errors.trade_name && <div
                                                className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="my-2 fw-semibold">Logo</label>
                                            <input
                                                className={"form-control form-control-sm "}
                                                type="file"
                                                id="logo"
                                                name="logo"
                                                {...register("logo")}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="my-2 fw-semibold">İmza</label>
                                            <input
                                                className={"form-control form-control-sm "}
                                                type="file"
                                                id="signature"
                                                name="signature"
                                                {...register("signature")}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="my-2 fw-semibold">Favicon 1</label>
                                            <input
                                                className={"form-control form-control-sm "}
                                                type="file"
                                                id="favicon"
                                                name="favicon"
                                                {...register("favicon")}
                                            />
                                            <span className="selectAlertText ms-1 mt-1">32*32 boyutunda ve .ico uzantılı olmalıdır.</span>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="my-2 fw-semibold">Favicon 2</label>
                                            <input
                                                className={"form-control form-control-sm "}
                                                type="file"
                                                id="favicon32"
                                                name="favicon32"
                                                {...register("favicon32")}
                                            />
                                            <span className="selectAlertText ms-1 mt-1">32*32 boyutunda ve .png uzantılı olmalıdır.</span>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pt-2 pb-2 fw-semibold">Telefon 1</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <Controller
                                                control={control}
                                                name="first_phone"
                                                render={({
                                                             field: {
                                                                 onChange, value
                                                             }
                                                         }) => (<NumberFormat
                                                    format="0### ### ## ##"
                                                    mask={"_"}
                                                    name="first_phone"
                                                    value={value}
                                                    onChange={onChange}
                                                    className={"form-control form-control-sm " + (errors.first_phone ? "is-invalid" : "")}
                                                />)}

                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Bu alan zorunlu."
                                                    },
                                                    pattern: {
                                                        value: /^[0-9 ]{14}$/,
                                                        message: "Telefon numarası 11 haneli olmalıdır."
                                                    }
                                                }}
                                            />
                                            {errors.first_phone && <div
                                                className="invalid-feedback text-start">{errors.first_phone.message}</div>}
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pt-2 pb-2 fw-semibold">Telefon 2</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <Controller
                                                control={control}
                                                name="second_phone"
                                                render={({
                                                             field: {
                                                                 onChange, value
                                                             }
                                                         }) => (<NumberFormat
                                                    format="0### ### ## ##"
                                                    mask={"_"}
                                                    name="second_phone"
                                                    value={value}
                                                    onChange={onChange}
                                                    className={"form-control form-control-sm " + (errors.second_phone ? "is-invalid" : "")}
                                                />)}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Bu alan zorunlu."
                                                    }, pattern: {
                                                        value: /^[0-9 ]{14}$/,
                                                        message: "Telefon numarası 11 haneli olmalıdır."
                                                    }
                                                }}
                                            />
                                            {errors.second_phone && <div
                                                className="invalid-feedback text-start">{errors.second_phone.message}</div>}
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pt-2 pb-2 fw-semibold">Email</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <input type="email" name="email"
                                                   className={"form-control form-control-sm " + (errors.email ? "is-invalid" : "")}
                                                   {...register("email", {required: true})} />
                                            {errors.email && <div
                                                className="invalid-feedback text-start">Bu
                                                alan zorunlu.</div>}
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pt-2 pb-2 fw-semibold">Adres</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <input
                                                className={"form-control form-control-sm " + (errors.address ? "is-invalid" : "")}
                                                {...register("address", {required: true})} />
                                            {errors.address && <div
                                                className="invalid-feedback text-start">Bu
                                                alan zorunlu.</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="bankInformation" role="tabpanel"
                                 aria-labelledby="bankInformation-tab">
                                <div className="row">
                                    {banks.map((item, index) => {
                                        return (
                                            <>
                                                <div className="px-1 py-2 mt-2 pb-4 col-md-4" key={index}>
                                                    <div className="card shadow">
                                                        <div className="card-body">
                                                            <div className="row px-3 ">
                                                                <div className="col-12 col-md-12">
                                                                    <label className="my-2 fw-semibold">Banka
                                                                        Adı</label>
                                                                    <input type="text" form="1"
                                                                           className={"form-control form-control-sm " + (errors.bank_name ? "is-invalid" : "")}
                                                                           name={`bank_name_${index}`}
                                                                           {...register(`bank_name_${index}`)} />
                                                                </div>
                                                                <div className="col-12 col-md-12">
                                                                    <label className="my-2 fw-semibold">Banka
                                                                        Şubesi</label>
                                                                    <input type="text" form="1"
                                                                           className={"form-control form-control-sm " + (errors.bank_branch ? "is-invalid" : "")}
                                                                           name={`bank_branch_${index}`}
                                                                           {...register(`bank_branch_${index}`)} />
                                                                </div>
                                                                <div className="col-12 col-md-12">
                                                                    <label className="my-2 fw-semibold">Swift
                                                                        Kodu</label>
                                                                    <input type="text" form="1"
                                                                           className={"form-control form-control-sm " + (errors.swift_code ? "is-invalid" : "")}
                                                                           name={`swift_code_${index}`}
                                                                           {...register(`swift_code_${index}`)} />

                                                                </div>
                                                                <div className="col-12 col-md-12">
                                                                    <label className="my-2 fw-semibold">USD İban
                                                                        Numarası</label>
                                                                    <Controller
                                                                        control={control}
                                                                        name={`usd_iban_no_${index}`}
                                                                        render={({
                                                                                     field: {
                                                                                         onChange, name, value
                                                                                     }
                                                                                 }) => (<NumberFormat
                                                                            format="TR## #### #### #### #### #### ##"
                                                                            mask={"_"}
                                                                            name={name}
                                                                            value={value}
                                                                            onChange={onChange}
                                                                            className={"form-control form-control-sm "}
                                                                        />)}
                                                                    />
                                                                </div>
                                                                <div className="col-12 col-md-12">
                                                                    <label className="my-2 fw-semibold">EURO İban
                                                                        Numarası</label>
                                                                    <Controller
                                                                        control={control}
                                                                        name={`euro_iban_no_${index}`}
                                                                        render={({
                                                                                     field: {
                                                                                         onChange, name, value
                                                                                     }
                                                                                 }) => (<NumberFormat
                                                                            format="TR## #### #### #### #### #### ##"
                                                                            mask={"_"}
                                                                            name={name}
                                                                            value={value}
                                                                            onChange={onChange}
                                                                            className={"form-control form-control-sm "}
                                                                        />)}
                                                                    />
                                                                </div>
                                                                <input name={`bank_id_${index}`} value={index + 1} {...register(`bank_id_${index}`)}
                                                                       hidden/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="tab-pane fade" id="generalDefinitions" role="tabpanel"
                                 aria-labelledby="generalDefinitions-tab">
                                <div className="col-12 bg-white rounded shadow">
                                    <div className="px-3 mt-2 py-4">
                                        <div className="row">
                                            <div className="col-12 col-md-12">
                                                <label className="pt-2 pb-2 fw-semibold">Potansiyel Firma Görüşme
                                                    Süresi</label>
                                                <span className="registerTitle text-danger fw-bold"> *</span>
                                                <input
                                                    className={"form-control form-control-sm " + (errors.meeting_time ? "is-invalid" : "")}
                                                    {...register("meeting_time", {required: true})} />
                                                <span className="registerTitle text-danger"> Not : Belirtilen süre gün şeklinde hesaplanacaktır.</span>

                                                {errors.meeting_time && <div
                                                    className="invalid-feedback text-start">Bu
                                                    alan zorunlu.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 text-end mt-3">
                            <button type="submit" className="btn btn-tk-save btn-sm">Güncelle
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

CompanySettings.auth = true;

export default CompanySettings;
