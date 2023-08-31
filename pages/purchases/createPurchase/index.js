import {useForm, useFieldArray, useWatch, Controller} from "react-hook-form";
import React, {useEffect, useState} from 'react';
import alert from "../../../components/alert";
import axios from 'axios';
import Link from "@mui/material/Link";
import {Breadcrumbs, FormControl, MenuItem, Select} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import NumberFormat from "react-number-format";
import AsyncSelect from "react-select/async";
import trLocale from "date-fns/locale/tr";
import moment from "moment";
import Title from "../../../components/head";
import {useRouter} from "next/router";
import {useSession} from "next-auth/react";
import alertAuthority from "../../../components/alertAuthority";
import {Button, Modal} from "react-bootstrap";

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

function CreatePurchase(props) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setFocus,
        getValues,
        reset,
        resetField,
        control,
        formState: {errors}
    } = useForm({
        defaultValues: {
            products: [{
                product: '',
                quantity: '',
                unit: '',
                unit_price: '',
                vat: '',
                vat_amount: '',
                discount: '',
                discount_type: '',
                discount_amount: '',
                subtotal: '',
                total: '',
                description: ''
            }]
        }
    });
    const {
        register: registerProduct,
        handleSubmit: handleSubmitProduct,
        watch: watchProduct,
        setValue: setValueProduct,
        getValues: getValuesProduct,
        reset: resetProduct,
        resetField: resetFieldProduct,
        control: controlProduct,
        formState: {errors: errorsProduct}
    } = useForm();
    const {fields, prepend, remove} = useFieldArray({control, name: "products"});

    const [customers, setCustomers] = useState([]);
    const [customerContacts, setCustomerContacts] = useState([]);
    const [products, setProducts] = useState([]);
    const [productPurchase, setProductPurchase] = useState([]);
    const [productID, setProductID] = useState(0);
    const [productName, setProductName] = useState();
    const [productPrice, setProductPrice] = useState();
    const [productSalePrice, setProductSalePrice] = useState();
    const [productStock, setProductStock] = useState();
    const [productUnitPrice, setProductUnitPrice] = useState();
    const [quantity, setQuantity] = useState();
    const [unitPrice, setUnitPrice] = useState();
    const [vat, setVat] = useState();
    const [discount, setDiscount] = useState();
    const [discountType, setDiscountType] = useState();
    const [val, setVal] = useState();
    const [valProduct, setValProduct] = useState();
    const [shippingCost, setShippingCost] = useState();

    const [brands, setBrands] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [loading, setLoading] = useState(false);
    const {data: session} = useSession()
    const router = useRouter();

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const [showDetail, setShowDetail] = useState(false);
    const handleShowDetail = () => setShowDetail(true);
    const handleCloseDetail = () => setShowDetail(false);

    let now = new Date();
    let overallTotalArray = [];
    let vatTotalArray = [];
    let discountTotalArray = [];
    let subtotalArray = [];
    //para formatı
    Number.prototype.format = function (n, x, s, c) {
        let re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
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
            if (response.data[0] === undefined || response.data[0].create_purchase === 0) {
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


    async function getVatAmount() {

        for (let index = 0; index < fields.length; index++) {
            if (getValues(`products.${index}`)) {
                let quantity = getValues(`products.${index}.quantity`)
                let unitPrice = getValues(`products.${index}.unit_price`)
                let discount = getValues(`products.${index}.discount`)
                let vat = getValues(`products.${index}.vat`)
                let discountType = getValues(`products.${index}.discount_type`)
                let subtotal = "";
                let vat_amount = "";
                let row_total = "";
                let discount_amount = "";
                if (!discountType) {
                    subtotal = quantity * unitPrice
                    vat_amount = (subtotal * vat) / 100
                    discount_amount = 0
                } else if (discountType === "tutar") {
                    subtotal = (quantity * unitPrice) - discount
                    vat_amount = (subtotal * vat) / 100
                    discount_amount = discount
                } else if (discountType === "yuzde") {
                    subtotal = ((quantity * unitPrice) - (((quantity * unitPrice) * discount) / 100))
                    vat_amount = (subtotal * vat) / 100
                    discount_amount = ((quantity * unitPrice) * discount) / 100
                }

                row_total = subtotal + vat_amount
                setValue(`products.${index}.total`, row_total.toFixed(2))
                setValue(`products.${index}.vat_amount`, vat_amount.toFixed(2))
                setValue(`products.${index}.discount_amount`, discount_amount)
                setValue(`products.${index}.subtotal`, subtotal.toFixed(2))
            }
        }
        let shipping_cost = getValues("shipping_cost")
        if (!shipping_cost) {
            shipping_cost = 0
        }
        getValues("products").map((product, index) => {
                overallTotalArray.push(parseFloat(product.total))
                vatTotalArray.push(parseFloat(product.vat_amount))
                discountTotalArray.push(parseFloat(product.discount_amount))
                subtotalArray.push(parseFloat(product.subtotal))
            }
        )
        let overall_total = overallTotalArray.reduce((total, arg) => total + arg, 0);
        let vat_total = vatTotalArray.reduce((total, arg) => total + arg, 0);
        let discount_total = discountTotalArray.reduce((total, arg) => total + arg, 0);
        let subtotal = subtotalArray.reduce((total, arg) => total + arg, 0);

        setValue("overall_total", overall_total + parseFloat(shipping_cost))
        setValue("vat_total", vat_total)
        setValue("discount_total", discount_total)
        setValue("subtotal", subtotal)
        setValue("purchase_code", "ALS" + new Date().valueOf())

    }

    async function productOptions() {
        await axios({
            method: 'POST',
            url: '/api/offers/get-products',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            const options = []
            response.data.map((products, index) => {
                options.push({
                    label: products.product_code + " || " + products.product_name,
                    value: products.id,
                    code: products.product_code,
                    price: products.price,
                    sale_price: products.sale_price,
                    stock: products.stock
                })
            })
            setProducts(options);
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getProductPurchase(product_id) {
        await axios({
            method: 'post',
            url: `/api/purchases/purchase/get-product-purchase/${product_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setProductPurchase(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getCustomerContacts(customerId) {
        await axios({
            method: 'POST',
            url: '/api/offers/get-customer-contacts/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {customer: customerId}
        }).then(function (response) {
            setCustomerContacts(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/purchases/purchase/add-purchase',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: data,
        }).then(function (res) {
            alert(res.data.title, res.data.message, res.data.status, () => {
                if (res.data.status === "success") {
                    reset()
                    window.location.href = "/purchases/allPurchases"
                }
            })
        }).catch(function (error) {
            console.log(error)
        })
    }
    const filterCustomers = (val) => {
        return customers.filter((i) =>
            i.label.toLowerCase().includes(val.toLowerCase())
        );
    };
    const customerOptions = async () => {
        await axios({
            method: 'POST',
            url: '/api/purchases/purchase/get-customers',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            const options = []
            response.data.map((customers, index) => {
                options.push({
                    label: customers.trade_name,
                    value: customers.id
                })
            })
            setCustomers(options);
        }).catch(function (error) {
            console.log(error)
        })
    }
    let result_filter = "";
    const loadOptions = (val, callback) => {
        setTimeout(() => {
            result_filter = callback(filterCustomers(val));
        }, 1000);
    };
    const handleInputChange = (value) => {
        setVal(value.replace(/\W/g, ''));
        return val;
    };
    const nOMC = () => {
        if (!val) {
            return "En az üç karakter giriniz..."
        } else {
            if (!result_filter) {
                return "Kayıtlı firma bulunamadı!"
            }
        }
    }
    const filterProducts = (val) => {
        return products.filter((i) =>
            i.code && i.code.toLowerCase().includes(val.toLowerCase())
        );
    };
    let result_filter_product = "";
    const loadOptionsProduct = (val, callback) => {
        setTimeout(() => {
            result_filter_product = callback(filterProducts(val));
        }, 1000);
    };
    const handleInputChangeProduct = (value) => {
        setValProduct(value.replace(/\W/g, ''));
        return valProduct;
    };
    const nOMPElement =
        <div>
            <p>Kayıtlı ürün bulunamadı!</p>
            <a className="btn-sm btn-light cursor-pointer small" onClick={() => {
                handleShow()
            }}>
                <i className="fal fa-plus me-1">Yeni Ürün Ekle</i>
            </a>
        </div>
    const nOMP = () => {
        if (!valProduct) {
            return "En az üç karakter giriniz..."
        } else {
            if (!result_filter_product) {
                return nOMPElement;
            }
        }
    }
    const handleClick = (index) => {
        remove(index);
        getVatAmount()
    };

    //addProduct
    async function getBrands() {
        await axios({
            method: 'POST',
            url: '/api/productManagement/products/get-brands',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setBrands(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getProductCategories() {
        await axios({
            method: 'POST',
            url: '/api/productManagement/products/get-product-categories',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
        }).then(function (response) {
            setProductCategories(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    ///file limit start///
    const handleUploadFiles = files => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files.map((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file);
                if (uploaded.length > 6) {
                    alert('Uyarı!', `En fazla 6 dosya yükleyebilirsiniz.`, 'warning', () => {
                        getBrands()
                        resetField('product_image')
                    })
                    limitExceeded = true;
                    return true;
                }
            }
        })
        if (!limitExceeded) setUploadedFiles(uploaded)
    }
    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)
        handleUploadFiles(chosenFiles);
    }
    ///file limit end///
    const onSubmitProduct = async (data) => {
        const formData = new FormData();
        if (data.product_image.length == 1) {
            alert('Uyarı', 'En az iki resim yüklenmelidir.', 'warning', () => {
                getBrands()
            })
        } else {//update kontrolü
            if (data.id != 0) {
                //update içinde dosya değişikliği yapılıp yapılmadığı kontrolü
                if (data.product_image != "[object FileList]") {
                    formData.append("product_image", data.product_image);
                } else {
                    for (let v in data.product_image) {
                        if (v != "length" && v != "item") {
                            formData.append("product_image", data.product_image[v]);
                        }
                    }
                }
            } else {
                for (let v in data.product_image) {
                    if (v != "length" && v != "item") {
                        formData.append("product_image", data.product_image[v]);
                    }
                }
            }
            for (let value in data) {
                if (value != "product_image") {
                    formData.append(value, data[value]);
                }
            }

            await axios({
                method: 'POST',
                url: '/api/productManagement/products/add-edit-product',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    AuthToken: props.token
                },
                data: formData,
            }).then(function (res) {
                handleClose();
                alert(res.data.title, res.data.message, res.data.status, () => {
                    productOptions()
                    resetProduct()
                    setValueProduct("desi", "")
                    setValueProduct("kilogram", "")
                    setValueProduct("price", "")
                    setValueProduct("sale_price", "")
                })
            }).catch(function (error) {
                console.log(error)
            })
        }
    }


    useEffect(() => {
        getPermissionDetail();
        getVatAmount()
        customerOptions()
        productOptions()
        getBrands()
        getProductCategories()
        getProductPurchase(productID)
    }, [quantity, unitPrice, vat, discount, discountType, val, productID, shippingCost]);

    return (
        <>
            <Title title="Satın Alma"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link underline="none" color="inherit" href="/purchases/createPurchase">
                    Alış Oluştur
                </Link>
            </Breadcrumbs>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <div className="row">
                                <div className="col-12 col-lg-12 mb-2">
                                    <label className="pt-1 pb-1">Firma</label>
                                    <Controller
                                        control={control}
                                        name="customer"
                                        render={({
                                                     field,
                                                     fieldState: {error, invalid}
                                                 }) => (
                                            <AsyncSelect  {...field}
                                                          cacheOptions
                                                          value={getValues("customer")}
                                                          defaultOptions
                                                          placeholder={"Firma ara..."}
                                                          loadingMessage={() => "Yükleniyor..."}
                                                          noOptionsMessage={nOMC}
                                                          loadOptions={loadOptions}
                                                          onInputChange={handleInputChange}
                                                          onChange={(value, action) => {
                                                              setValue("customer", value, {
                                                                  shouldDirty: true,
                                                                  shouldValidate: true
                                                              });
                                                              getCustomerContacts(value.value)
                                                          }}

                                                          renderInput={(params) =>
                                                              <TextField
                                                                  helperText={invalid ? "Bu alan zorunludur." : null}
                                                                  {...params}
                                                                  error={invalid}
                                                              />}
                                            />
                                        )}
                                        rules={{required: true}}
                                    />
                                </div>

                                <div className="col-6 col-lg-6 mb-2">
                                    <label className="pt-1 pb-1">Fatura Adresi</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <select
                                        {...register("invoice_address", {required: true})}
                                        className={"form-select form-select-sm " + (errors.invoice_address ? "is-invalid" : "")}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {customerContacts.map((i, index) => (
                                            <option key={index} value={i.id}>{i.address}/{i.district_name}/{i.province_name}/{i.country_name}</option>
                                        ))}
                                    </select>
                                    {errors.invoice_address && <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                                <div className="col-6 col-lg-6 mb-2">
                                    <label className="pt-1 pb-1">Belge Numarası</label>
                                    <input type="text"
                                           autoComplete="off"
                                           className="form-control form-control-sm"
                                           {...register("document_number", {required: false})} />
                                </div>
                                <div className="col-12 col-lg-12 mb-2">
                                    <label className="pt-1 pb-1">Alış Konusu</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input type="text"
                                           autoComplete="off"
                                           className={"form-control form-control-sm " + (errors.subject ? "is-invalid" : "")}
                                           {...register("subject", {required: false})} />
                                    {errors.subject && <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-12">
                            <div className="row">
                                <div className="col-6 col-lg-12 mb-2">
                                    <label className="pt-1 pb-1">Teslim Süresi</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Controller
                                                control={control}
                                                name="delivery_time"
                                                render={({field: {onChange, name, value}}) => (
                                                    <NumberFormat
                                                        autoComplete="off"
                                                        className={"form-control form-control-sm mb-2 mb-md-0 " + (errors.delivery_time ? "is-invalid" : "")}
                                                        name={name}
                                                        value={value}
                                                        maxLength={3}
                                                        allowNegative={false}
                                                        onChange={onChange}
                                                    />
                                                )}
                                                rules={{required: true}}
                                            />
                                            {errors.delivery_time &&
                                                <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <select
                                                {...register("delivery_range", {required: true})}
                                                className={"form-select form-select-sm " + (errors.delivery_range ? "is-invalid" : "")}
                                            >
                                                <option value="">Seçiniz...</option>
                                                <option value="Gün">Gün</option>
                                                <option value="Hafta">Hafta</option>
                                                <option value="Ay">Ay</option>
                                                <option value="Yıl">Yıl</option>
                                            </select>
                                            {errors.delivery_range && <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-12 mb-2 ">
                                    <label className="pt-1 pb-1">Vade Süresi</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Controller
                                                control={control}
                                                name="maturity_time"
                                                render={({field: {onChange, name, value}}) => (
                                                    <NumberFormat
                                                        autoComplete="off"
                                                        className={"form-control form-control-sm mb-2 mb-md-0 " + (errors.maturity_time ? "is-invalid" : "")}
                                                        name={name}
                                                        value={value}
                                                        maxLength={3}
                                                        allowNegative={false}
                                                        onChange={onChange}
                                                    />
                                                )}
                                                rules={{required: true}}
                                            />
                                            {errors.maturity_time &&
                                                <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <select
                                                {...register("maturity_range", {required: true})}
                                                className={"form-select form-select-sm " + (errors.maturity_range ? "is-invalid" : "")}
                                            >
                                                <option value="">Seçiniz...</option>
                                                <option value="Gün">Gün</option>
                                                <option value="Hafta">Hafta</option>
                                                <option value="Ay">Ay</option>
                                                <option value="Yıl">Yıl</option>
                                            </select>
                                            {errors.maturity_range && <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-12">
                            <div className="row">
                                <div className="col-12 col-lg-12 mb-3 pt-3 ">
                                    <Controller
                                        control={control}
                                        name="purchase_date"
                                        render={({
                                                     field: {onChange, name, value},
                                                     fieldState: {error, invalid}
                                                 }) => (
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                                <DatePicker
                                                    label="Alış Tarihi"
                                                    name={name}
                                                    value={value}
                                                    minDate={now}
                                                    onChange={onChange}
                                                    renderInput={(params) =>
                                                        <TextField
                                                            size="small"
                                                            margin="dense"
                                                            helperText={invalid ? "Bu alan zorunludur." : null}
                                                            {...params}
                                                            error={invalid}
                                                            inputProps={{
                                                                ...params.inputProps,
                                                                placeholder: "__.__.____",
                                                                readOnly: true
                                                            }}
                                                        />}
                                                />
                                            </LocalizationProvider>
                                        )}
                                        rules={{required: false}}
                                    />
                                </div>
                                <div className="col-12 col-lg-12 mb-3">
                                    <Controller
                                        control={control}
                                        name="maturity_date"
                                        render={({
                                                     field: {onChange, name, value},
                                                     fieldState: {error, invalid}
                                                 }) => (
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                                <DatePicker
                                                    label="Vade Başlangıç Tarihi"
                                                    name={name}
                                                    value={value}
                                                    minDate={now}
                                                    onChange={onChange}
                                                    renderInput={(params) =>
                                                        <TextField
                                                            size="small"
                                                            margin="dense"
                                                            helperText={invalid ? "Bu alan zorunludur." : null}
                                                            {...params}
                                                            error={invalid}
                                                            inputProps={{
                                                                ...params.inputProps,
                                                                placeholder: "__.__.____",
                                                                readOnly: true
                                                            }}
                                                        />}/>
                                            </LocalizationProvider>
                                        )}
                                        rules={{required: false}}
                                    />
                                </div>
                                <div className="col-12 col-lg-12 mb-2">
                                    <Controller
                                        control={control}
                                        name="delivery_date"
                                        render={({
                                                     field: {onChange, name, value},
                                                     fieldState: {error, invalid}
                                                 }) => (
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                                <DatePicker
                                                    label="Teslim Tarihi"
                                                    name={name}
                                                    value={value}
                                                    minDate={now}
                                                    onChange={onChange}
                                                    renderInput={(params) =>
                                                        <TextField
                                                            size="small"
                                                            margin="dense"
                                                            helperText={invalid ? "Bu alan zorunludur." : null}
                                                            {...params}
                                                            error={invalid}
                                                            inputProps={{
                                                                ...params.inputProps,
                                                                placeholder: "__.__.____",
                                                                readOnly: true
                                                            }}
                                                        />}/>
                                            </LocalizationProvider>
                                        )}
                                        rules={{required: false}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                    <div className="row py-4">
                        <div className="col-12">
                            <div className="table-responsive">
                                <table className="table table-bordered w-100">
                                    <thead className="table-light">
                                    <tr>
                                        <th>
                                            <button className="btn btn-outline-success" type="button" onClick={() => {
                                                prepend();
                                            }}><i className="fas fa-plus"></i>
                                            </button>
                                        </th>
                                        <th className="table-th" style={{width: "15%"}}>Ürün</th>
                                        <th className="table-th-number">Miktar</th>
                                        <th className="table-th">Birim</th>
                                        <th className="table-th-number" style={{width: "10%"}}>Birim Fiyat</th>
                                        <th className="table-th">Para Birimi</th>
                                        <th className="table-th">KDV %</th>
                                        <th className="table-th-number">KDV Tutarı</th>
                                        <th className="table-th-number">İskonto</th>
                                        <th className="table-th">İsk Tipi</th>
                                        <th className="table-th-number">Toplam</th>
                                        <th className="table-th-number">Açıklama</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {fields.length > 0 ? (
                                        fields.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <button className="btn btn-outline-danger" onClick={(e) => {
                                                            handleClick(index)
                                                        }}><i className="fas fa-times"></i>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <Controller
                                                            control={control}
                                                            name={`products.${index}.product`}
                                                            render={({field}) => (
                                                                <AsyncSelect  {...field}
                                                                              autoComplete="off"
                                                                              cacheOptions
                                                                              value={getValues(`products.${index}.product`)}
                                                                              defaultOptions
                                                                              placeholder={"Ürün ara..."}
                                                                              loadingMessage={() => "Yükleniyor..."}
                                                                              noOptionsMessage={nOMP}
                                                                              loadOptions={loadOptionsProduct}
                                                                              onInputChange={handleInputChangeProduct}
                                                                              onChange={(value, action) => {
                                                                                  setValue(`products.${index}.product`, value, {
                                                                                      shouldDirty: true,
                                                                                      shouldValidate: true
                                                                                  });
                                                                                  setValue(`products.${index}.id`, getValues(`products.${index}.product.value`))
                                                                                  setValue(`products.${index}.name`, getValues(`products.${index}.product.label`))
                                                                                  setValue(`products.${index}.price`, getValues(`products.${index}.product.price`))
                                                                                  setValue(`products.${index}.sale_price`, getValues(`products.${index}.product.sale_price`))
                                                                                  setValue(`products.${index}.stock`, getValues(`products.${index}.product.stock`))
                                                                              }}
                                                                />
                                                            )}
                                                            rules={{required: true}}
                                                        />

                                                    </td>
                                                    <td>
                                                        <div>
                                                            <input type="text"
                                                                   autoComplete="off"
                                                                   title={errors?.['products']?.[index]?.['quantity']?.['message']}
                                                                   {...register(`products.${index}.quantity`, {
                                                                       required: true,
                                                                       pattern: {
                                                                           value: /^[0-9]+$/,
                                                                           message: "Sadece sayı girişi yapılabilir!"
                                                                       },
                                                                       maxLength: 20
                                                                   })}
                                                                   readOnly={(getValues(`products.${index}.product`)) ? "" : true}
                                                                   className="form-control form-control-sm"
                                                                   onChange={(e) => {
                                                                       setQuantity(e.target.value)
                                                                       setValue(`products.${index}.quantity`, e.target.value)
                                                                   }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select
                                                            {...register(`products.${index}.unit`, {required: true})}
                                                            className={"form-select form-select-sm "}
                                                        >
                                                            <option value="">Seçiniz...</option>
                                                            <option value="adet">Adet</option>
                                                            <option value="kilogram">Kilogram</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <div className="input-group input-group-sm">
                                                            <input type="text"
                                                                   autoComplete="off"
                                                                   title={errors?.['products']?.[index]?.['unit_price']?.['message']}
                                                                   {...register(`products.${index}.unit_price`, {
                                                                       required: true,
                                                                       pattern: {
                                                                           value: /^[0-9.]+$/,
                                                                           message: "Sadece sayı girişi yapılabilir!"
                                                                       },
                                                                       maxLength: 20
                                                                   })}
                                                                   placeholder={getValues(`products.${index}.last_unit_price`)}
                                                                   className="form-control form-control-sm"
                                                                   onChange={(e) => {
                                                                       setUnitPrice(e.target.value)
                                                                       setValue(`products.${index}.unit_price`, e.target.value)
                                                                   }}
                                                            />
                                                            {(() => {
                                                                if (getValues(`products.${index}.id`)) {
                                                                    return (
                                                                        <>
                                                                                <span className="input-group-text" id="basic-addon">
                                                                                    <a className="cursor-pointer small" title="İncele"
                                                                                       onClick={() => {
                                                                                           setProductID(getValues(`products.${index}.id`));
                                                                                           setProductName(getValues(`products.${index}.name`));
                                                                                           setProductPrice(getValues(`products.${index}.price`));
                                                                                           setProductSalePrice(getValues(`products.${index}.sale_price`));
                                                                                           setProductStock(getValues(`products.${index}.stock`));
                                                                                           getProductPurchase(productID);
                                                                                           handleShowDetail()
                                                                                       }}
                                                                                    >
                                                                                        <i className="fal fa-info-circle"></i>
                                                                                    </a>
                                                                                </span>
                                                                        </>
                                                                    )
                                                                }
                                                            })()}

                                                        </div>

                                                        <Modal size="xl" show={showDetail} onHide={handleCloseDetail} backdrop="static" keyboard={false}
                                                               aria-labelledby="example-modal-sizes-title-xl">
                                                            <Modal.Header closeButton>
                                                                <p className="modal-title fs-6 fw-semibold">
                                                                    Ürüne Ait Alış Detayı
                                                                </p>
                                                            </Modal.Header>
                                                            <hr/>
                                                            <Modal.Body>
                                                                <div className="row">
                                                                    <div className="col-12">
                                                                        <div className="row col-6">
                                                                            <label
                                                                                className="col-sm-5 col-form-label">Ürün
                                                                                Adı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productName}</p>
                                                                            </div>
                                                                            <label
                                                                                className="col-sm-5 col-form-label">Ürün
                                                                                Satış Fiyatı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productPrice}</p>
                                                                            </div>
                                                                            <label
                                                                                className="col-sm-5 col-form-label">Ürün
                                                                                İndirimli Satış Fiyatı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productSalePrice}</p>
                                                                            </div>
                                                                            <label
                                                                                className="col-sm-5 col-form-label">Ürün
                                                                                Stok Miktarı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productStock}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className="alert alert-ks p-0 fade show mt-3 text-center"
                                                                            role="alert">
                                                                            <i className="fas fa-exclamation-circle"></i> Ürüne
                                                                            ait geçmiş
                                                                            alışlar listelenmektedir !
                                                                        </div>
                                                                        <hr/>
                                                                        <div className="table-responsive">
                                                                            <table className="table">
                                                                                <thead>
                                                                                <tr>
                                                                                    <th scope="col">#</th>
                                                                                    <th scope="col">Ürün</th>
                                                                                    <th scope="col">Miktar</th>
                                                                                    <th scope="col">Birim Fiyat</th>
                                                                                    <th scope="col">KDV Tutarı</th>
                                                                                    <th scope="col">İskonto Tutarı
                                                                                    </th>
                                                                                    <th scope="col">Toplam</th>
                                                                                    <th scope="col">Firma</th>
                                                                                    <th scope="col">Tarih</th>
                                                                                </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                {productPurchase.length > 0 ? (
                                                                                        productPurchase.map((i, index) => (
                                                                                            <>
                                                                                                <tr>
                                                                                                    <th scope="row">{index + 1}</th>
                                                                                                    <td key={index}>{i.product_name}</td>
                                                                                                    <td key={index}>{Math.abs(i.quantity)}</td>
                                                                                                    <td key={index}>{i.unit_price} ( {i.unit} )</td>
                                                                                                    <td key={index}>{i.vat_amount} (
                                                                                                        %{i.vat} )
                                                                                                    </td>
                                                                                                    <td key={index}>{i.discount_amount} ( {(i.discount_type === "yuzde") ? "%" + i.discount : i.discount + i.currency_unit} ind.
                                                                                                        )
                                                                                                    </td>
                                                                                                    <td key={index}>{i.total} {i.currency_unit}</td>
                                                                                                    <td key={index}>{i.purchase.customer_trade_name}</td>
                                                                                                    <td key={index}>{i.created_at}</td>
                                                                                                </tr>
                                                                                            </>
                                                                                        ))) :
                                                                                    <tr>
                                                                                        <th colSpan="9"
                                                                                            className="text-center">
                                                                                            <div
                                                                                                className="alert alert-ks p-0 fade show mt-3 text-center"
                                                                                                role="alert">
                                                                                                <i className="fas fa-exclamation-circle"></i> Ürüne
                                                                                                ait geçmiş
                                                                                                alış bulunmamaktadır
                                                                                                !
                                                                                            </div>
                                                                                        </th>
                                                                                    </tr>
                                                                                }
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="secondary btn-sm" onClick={handleCloseDetail}>
                                                                    Kapat
                                                                </Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                    </td>
                                                    <td>
                                                        <select
                                                            {...register(`products.${index}.currency_unit`, {required: true})}
                                                            className={"form-select form-select-sm "}
                                                        >
                                                            <option value="">Seçiniz...</option>
                                                            <option value="₺">₺</option>
                                                            <option value="€">€</option>
                                                            <option value="$">$</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            {...register(`products.${index}.vat`, {required: true})}
                                                            className={"form-select form-select-sm "}
                                                            onChange={(e) => {
                                                                setVat(e.target.value)
                                                                setValue(`products.${index}.vat`, e.target.value)
                                                                getVatAmount()
                                                                setTimeout(function () {
                                                                    setFocus(`products.${index}.vat_amount`)
                                                                    setFocus(`products.${index}.total`)
                                                                }, 100)

                                                            }}
                                                        >
                                                            <option value="">Seçiniz...</option>
                                                            <option value={0}>0</option>
                                                            <option value={1}>1</option>
                                                            <option value={8}>8</option>
                                                            <option value={18}>18</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               {...register(`products.${index}.vat_amount`, {required: true})}
                                                               readOnly
                                                               value={isNaN(getValues(`products.${index}.vat_amount`)) ? "0" : getValues(`products.${index}.vat_amount`)}
                                                               className="form-control form-control-sm"/></td>
                                                    <td>
                                                        <input type="text"
                                                               autoComplete="off"
                                                               title={errors?.['products']?.[index]?.['discount']?.['message']}
                                                               {...register(`products.${index}.discount`, {
                                                                   required: false,
                                                                   pattern: {
                                                                       value: /^[0-9.]+$/,
                                                                       message: "Sadece sayı girişi yapılabilir!"
                                                                   },
                                                                   maxLength: 20
                                                               })}
                                                               className="form-control form-control-sm"
                                                               onChange={(e) => {
                                                                   setValue(`products.${index}.discount`, e.target.value)
                                                                   setDiscount(e.target.value)
                                                               }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            {...register(`products.${index}.discount_type`, {required: false})}
                                                            className={"form-select form-select-sm "}
                                                            onChange={(e) => {
                                                                setValue(`products.${index}.discount_type`, e.target.value)
                                                                setDiscountType(e.target.value)
                                                                getVatAmount()
                                                                setTimeout(function () {
                                                                    setFocus(`products.${index}.vat_amount`)
                                                                    setFocus(`products.${index}.total`)
                                                                }, 100)
                                                            }}
                                                        >
                                                            <option value="">Seçiniz...</option>
                                                            <option value="yuzde">Yüzde</option>
                                                            <option value="tutar">Tutar</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className="form-control form-control-sm"
                                                               {...register(`products.${index}.total`, {required: true})}
                                                               value={isNaN(getValues(`products.${index}.total`)) ? "0" : getValues(`products.${index}.total`)}
                                                               readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               autoComplete="off"
                                                               {...register(`products.${index}.description`)}
                                                               className="form-control form-control-sm"/>
                                                    </td>
                                                </tr>)
                                        })) : <tr>
                                        <th colSpan="10" className="text-center">
                                            <div className="alert alert-ks p-0 fade show mt-3 text-center" role="alert">
                                                <i className="fas fa-exclamation-circle"></i> Teklif için ekleme yapınız!
                                            </div>
                                        </th>
                                        {reset(setValue())}
                                    </tr>}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <th colSpan="10" className="text-end">Ara Tutar:</th>
                                        <th colSpan="2"
                                            className="text-start">{parseFloat(isNaN(getValues("subtotal")) ? "0" : getValues("subtotal")).format(2, 3, '.', ',')}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" className="text-end">İskonto:</th>
                                        <th colSpan="2"
                                            className="text-start">{parseFloat(isNaN(getValues("discount_total")) ? "0" : getValues("discount_total")).format(2, 3, '.', ',')}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" className="text-end">KDV:</th>
                                        <th colSpan="2"
                                            className="text-start">{parseFloat(isNaN(getValues("vat_total")) ? "0" : getValues("vat_total")).format(2, 3, '.', ',')}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" className="text-end">Kargo Ücreti</th>
                                        <td colSpan="2" className="text-start">
                                            <input type="text" style={{width: "47%"}}
                                                   autoComplete="off"
                                                   {...register("shipping_cost", {
                                                       required: false,
                                                       pattern: {
                                                           value: /^[0-9.]+$/,
                                                           message: "Sadece sayı girişi yapılabilir!"
                                                       },
                                                       maxLength: 20
                                                   })}
                                                   className="form-control form-control-sm"
                                                   onChange={(e) => {
                                                       setValue("shipping_cost", e.target.value)
                                                       setShippingCost(e.target.value)
                                                       getVatAmount()
                                                   }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" className="text-end">Toplam Tutar:</th>
                                        <th colSpan="2"
                                            className="text-start">{parseFloat(isNaN(getValues("overall_total")) ? "0" : getValues("overall_total")).format(2, 3, '.', ',')}</th>
                                    </tr>
                                    </tfoot>
                                </table>
                                <div className="d-flex justify-content-end">
                                    <button type="submit" className="btn btn-custom-save btn-sm">Kaydet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <Modal size="xl" show={show} onHide={handleClose} backdrop="static" keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Ürün Ekle
                    </p>
                </Modal.Header>
                <hr/>
                <form onSubmit={handleSubmitProduct(onSubmitProduct)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Ürün Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm  " + (errorsProduct.product_name ? "is-invalid" : "")}
                                    maxLength={50}
                                    autoComplete="off"
                                    {...registerProduct("product_name", {required: true})} />
                                {errorsProduct.product_name &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Ürün Kodu</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm  " + (errorsProduct.product_code ? "is-invalid" : "")}
                                    maxLength={50}
                                    autoComplete="off"
                                    {...registerProduct("product_code", {required: true})}
                                />
                                {errorsProduct.product_code &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Stok</label>
                                <input type="text"
                                       {...registerProduct("stock")}
                                       readOnly
                                       value="0"
                                       className="form-control form-control-sm"/>

                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Markası</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <select
                                    {...registerProduct("brand_id", {required: true})}
                                    className={"form-select form-select-sm " + (errorsProduct.brand_id ? "is-invalid" : "")}
                                >
                                    <option value="">Seçiniz...</option>
                                    {brands.map((i, index) => (
                                        <option key={index} value={i.id}>{i.brand_name}</option>
                                    ))}
                                </select>
                                {errorsProduct.brand_id &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Desi</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={controlProduct}
                                    name="desi"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errorsProduct.desi ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            autoComplete="off"
                                            maxLength={10}
                                            allowNegative={false}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errorsProduct.desi &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Kilogram</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={controlProduct}
                                    name="kilogram"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errorsProduct.kilogram ? "is-invalid" : "")}
                                            name={name}
                                            autoComplete="off"
                                            value={value}
                                            maxLength={10}
                                            allowNegative={false}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errorsProduct.kilogram &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Kategorisi</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <select
                                    {...registerProduct("product_category_id", {required: true})}
                                    className={"form-select form-select-sm " + (errorsProduct.product_category_id ? "is-invalid" : "")}
                                >
                                    <option value="">Seçiniz...</option>
                                    {productCategories.map((i, index) => (
                                        <option key={index} value={i.id}>{i.category_name}</option>
                                    ))}
                                </select>
                                {errorsProduct.brand_id &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Fiyat</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={controlProduct}
                                    name="price"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errorsProduct.price ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            autoComplete="off"
                                            maxLength={15}
                                            thousandSeparator={"."}
                                            decimalSeparator={","}
                                            allowNegative={false}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errorsProduct.price &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>İndirimli Fiyat</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={controlProduct}
                                    name="sale_price"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errorsProduct.sale_price ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            autoComplete="off"
                                            maxLength={15}
                                            thousandSeparator={"."}
                                            decimalSeparator={","}
                                            allowNegative={false}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errorsProduct.sale_price &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Ürün Resim</label>
                                <input className="form-control form-control-sm "
                                       type="file"
                                       id="formFile"
                                       autoComplete="off"
                                       accept='image/png, image/jpeg, image/svg'
                                       tabIndex={2}
                                       {...registerProduct("product_image")}
                                       onChange={handleFileEvent}
                                       multiple
                                />
                                <div className="bg-white mt-1 ps-1 tableInfoText" role="alert">
                                    <p className="mb-0">* Dosya seçilmeden ilerlenebilir, güncelleme ekranında
                                        işleme devam edilebilir.</p>
                                    <p className="mt-0">* Görsel eklenecek ise <strong> en az
                                        iki</strong> görsel seçilmelidir.</p>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Ürün Açıklaması</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <textarea
                                    maxLength={150}
                                    className={"form-control form-control-sm  " + (errorsProduct.product_desc ? "is-invalid" : "")}
                                    {...registerProduct("product_desc", {required: true})}
                                />
                                {errorsProduct.product_desc &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary btn-sm" onClick={handleClose}>
                            Vazgeç
                        </Button>
                        <Button variant="outline" className="btn-custom-save btn-sm" type="submit" {...registerProduct('id')}>Kaydet</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>)
}

CreatePurchase.auth = true;
export default CreatePurchase;