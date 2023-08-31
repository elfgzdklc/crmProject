import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import axios from 'axios';
import 'moment/locale/tr';
import {useSession} from "next-auth/react";
import Title from "../../../components/head";
import {Controller, useForm} from "react-hook-form";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import Link from "@mui/material/Link";
import AsyncSelect from "react-select/async";
import moment from "moment";
import Select from "react-select";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {MobileDatePicker} from '@mui/x-date-pickers/MobileDatePicker';
import Stack from '@mui/material/Stack';
import TextField from "@mui/material/TextField";
import localeDateTr from "dayjs/locale/tr";
import alertSwal from "../../../components/alert";

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

function CreateAfterSalesService(props) {
    const {data: session} = useSession()
    const [loading, setLoading] = useState(false);
    const [defaultOptionsProduct, setDefaultOptionsProduct] = useState();
    const [defaultOptionsInvoice, setDefaultOptionsInvoice] = useState();
    const [inputValuesInvoice, setValuesInvoice] = useState('');
    const [salesDetails, setSalesDetails] = useState([]);
    const [valueDate, setValueDate] = useState(new Date(moment().format('YYYY-MM-DD HH:mm').toString()).toISOString());
    const [salesDetailInvoice, setSalesDetailInvoice] = useState([]);
    const router = useRouter();

    const {register, handleSubmit, setValue, watch, formState: {errors}, control, reset} = useForm();

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
            if (response.data[0] === undefined ||  response.data[0].create_after_sales_services === 0) {
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
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleInputChangeInvoice = value => {
        setValuesInvoice(value);
    };

    const asyncGetInvoice = async (inputValuesInvoice) => {
        const res = await axios({
            method: 'get',
            url: `/api/after-sales-service/get-after-sales-service-invoice?query=${inputValuesInvoice}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        });
        return (res.data)
    };

    const getInvoiceDetailsProduct = async (salesId, inputValuesProduct) => {
        setSalesDetails("");
        await axios({
            method: 'get',
            url: `/api/after-sales-service/get-after-sales-service-invoice-detail-product?id=${salesId}&query=${inputValuesProduct}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setSalesDetails(response.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const getInvoiceDetails = async (data) => {
        await axios({
            method: 'post',
            url: '/api/after-sales-service/get-after-sales-service-invoice-detail/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                sales_id: data.value
            }
        }).then(function (response) {
            setValue("customer_trade_name", response.data[0].customer_trade_name)
            setValue("sales_owner", response.data[0].offer.user.fullName)
        }).catch(function (error) {
            console.log(error);
        });
    }


    const getInvoiceDetailsSalesService = async (data) => {
        await axios({
            method: 'post',
            url: '/api/after-sales-service/get-after-sales-service-invoice-detail-sales-service/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                invoice_no: data.label
            }
        }).then(function (response) {
            if (response.data.length > 0) {
                document.getElementById("tableDiv").classList.remove("d-none");
                setSalesDetailInvoice(response.data)
            } else {
                document.getElementById("tableDiv").classList.add("d-none");
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmit = async (data) => {
        let productArray = [];
        let products = "";

        const formData = new FormData();
        formData.append("invoice_no", data.invoice_no.label)

        for (let i = 0; i < data.product.length; i++) {
            productArray.push(data.product[i]["label"])
        }
        products = productArray.join(',')
        formData.append("product", products)
        formData.append("date", valueDate)


        for (let value in data.file) {
            if (value != "length" && value != "item") {
                formData.append("file", data.file[value]);
            }
        }
        for (let value in data) {
            if (value != "file" && value != "invoice_no" && value != "product" && value != "date") {
                formData.append(value, data[value]);
            }
        }
        await axios({
            method: 'post',
            url: '/api/after-sales-service/add-service',
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                document.getElementById("tableDiv").classList.add("d-none");
                reset();
                getPermissionDetail();
                asyncGetInvoice("");
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        getPermissionDetail();
        asyncGetInvoice("");
    }, []);


    return (
        <div>
            <Title title="Hizmet Oluştur"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link underline="none" color="inherit" href="/afterSalesService/createAfterSalesService">
                    Hizmet Oluştur
                </Link>
            </Breadcrumbs>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                    <div className="row">
                        <div className="col-md-8 col-12">
                            <div className="row my-1 ">
                                <div className="col-md-12 mb-2 px-2 me-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1">Fatura Numarası</label>
                                            <Controller
                                                control={control}
                                                name="invoice_no"
                                                defaultValue=""
                                                render={({field: {onChange, name, value}}) => (
                                                    <AsyncSelect
                                                        cacheOptions
                                                        defaultOptions={true}
                                                        value={value}
                                                        defaultValue={defaultOptionsInvoice}
                                                        noOptionsMessage={() => "Kayıt bulunamadı"}
                                                        loadOptions={asyncGetInvoice}
                                                        placeholder={'Fatura Seçiniz'}
                                                        name="invoice_no"
                                                        loadingMessage={() => "Yükleniyor..."}
                                                        onInputChange={handleInputChangeInvoice}
                                                        onChange={(option) => {
                                                            setDefaultOptionsInvoice(option)
                                                            onChange(option)
                                                            getInvoiceDetailsProduct(option.value, "")
                                                            getInvoiceDetails(option)
                                                            getInvoiceDetailsSalesService(option)
                                                            setValue("product", "")
                                                        }}
                                                    />
                                                )}
                                                rules={{required: true}}
                                            />
                                            {errors.invoice_no &&
                                                <div className="registerTitle text-danger"> Bu alan zorunlu</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1">Tarih</label>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}
                                                                  adapterLocale={localeDateTr}>
                                                <Stack>
                                                    <MobileDatePicker
                                                        label=" "
                                                        value={valueDate}
                                                        onChange={(newValue) => {
                                                            setValueDate(newValue);
                                                        }}
                                                        componentsProps={{
                                                            actionBar: {
                                                                actions: [""]
                                                            }
                                                        }}
                                                        renderInput={(params) => <TextField
                                                            {...params}
                                                            sx={{
                                                                '.MuiInputBase-input': {padding: .92, marginBottom: 0}
                                                            }}
                                                            {...register("date")}
                                                        />}
                                                    />
                                                </Stack>
                                            </LocalizationProvider>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-md-12  me-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1">Ürün</label>
                                            <Controller
                                                control={control}
                                                name="product"
                                                defaultValue=""
                                                render={({field: {onChange, name, value}}) => (
                                                    <Select
                                                        isMulti
                                                        name="product"
                                                        value={value}
                                                        defaultValue={defaultOptionsProduct}
                                                        noOptionsMessage={() => 'Aramanıza uygun değer bulunamadı'}
                                                        options={salesDetails}
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                        placeholder={'Ürün Seçiniz'}
                                                        onChange={(option) => {
                                                            setDefaultOptionsProduct(value => option.map(item => item.value))
                                                            onChange(option)
                                                        }}
                                                        form="3"
                                                    />
                                                )}
                                                rules={{required: true}}
                                            />
                                            {errors.invoice_no &&
                                                <div className="registerTitle text-danger"> Bu alan zorunlu</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1"> Problem</label>
                                            <textarea
                                                className="form-control form-control-sm textareaHeight" {...register("problem")}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-md-12 mb-2 me-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1">Firma Adı</label>
                                            <input
                                                className="form-control form-control-sm " {...register("customer_trade_name")}
                                                readOnly/>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1">Çözüm</label>
                                            <textarea
                                                className="form-control form-control-sm textareaHeightSolution" {...register("solution")}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-md-12 mb-2 me-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1">Satış Sahibi</label>
                                            <input
                                                className="form-control form-control-sm " {...register("sales_owner")}
                                                readOnly/>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="pt-1 pb-1"> Resim</label>
                                            <input type="file"
                                                   id="file" name="file"
                                                   className="form-control form-control-sm" {...register("file")}
                                                   multiple/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-12">
                            <label className="pt-1 pb-2"> Açıklama</label>
                            <textarea
                                className="form-control form-control-sm textareaHeightDescription" {...register("description")}/>
                        </div>
                        <div className="d-flex justify-content-end mb-2 mt-2">
                            <button type="submit" className="btn btn-custom-save btn-sm">Kaydet</button>
                        </div>
                    </div>
                </div>
            </form>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow d-none" id="tableDiv">
                <div className="row">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Tarih</th>
                                <th>Ürün</th>
                                <th>Problem</th>
                                <th>Çözüm</th>
                                <th>Açıklama</th>
                            </tr>
                            </thead>
                            <tbody>
                            {salesDetailInvoice.map((item, index) => {
                                return (
                                    <>
                                        <tr key={index + 1}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{moment(item.date).format("DD.MM.YYYY")}</td>
                                            <td><span className="tableWord" title={item.product}>
                                            {item.product}</span></td>
                                            <td><span className="tableWord" title={item.problem}>
                                            {item.problem}</span></td>
                                            <td><span className="tableWord" title={item.solution}>
                                            {item.solution}</span></td>
                                            <td><span className="tableWord" title={item.description}>
                                            {item.description}</span></td>
                                        </tr>
                                    </>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

CreateAfterSalesService.auth = true;

export default CreateAfterSalesService;
