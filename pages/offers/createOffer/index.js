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
import {Button, Modal} from "react-bootstrap";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import alertAuthority from "../../../components/alertAuthority";
import pdfDocument from "../../../components/pdf/PdfDocumentOuotation";
import Swal from "sweetalert2";
import Quotation from "../../../components/pdf/Quotation";

export async function getServerSideProps(context) {
    const startDate = moment().format("DD-MM-YYYY");
    const response = await axios.get(`https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.S-TP.DK.EUR.S-TP.DK.RUB.S-TP.DK.GBP.S-TP.DK.INR&startDate=${startDate}&endDate=${startDate}&type=json&key=5eRbZPPvSY`)
    const foreign_currency = response.data;
    const token = context.req.cookies['__Crm-next-auth.session-token']
    if (token) {
        return {
            props: {
                token: token,
                foreignCurrency: foreign_currency,
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }

}

function CreateOffer(props) {
    const {register, handleSubmit, setValue, setFocus, getValues, reset, control, formState: {errors}} = useForm({
        defaultValues: {
            bank: '1',
            products: [{
                product: '',
                quantity: '1',
                unit: 'adet',
                unit_price: '',
                availability_time: '',
                availability_range: '',
                vat: '0',
                vat_amount: '0.00',
                discount: '',
                discount_type: '',
                discount_amount: '',
                subtotal: '',
                total: '0.00',
                description: ''
            }]
        }
    });

    const {fields, prepend, remove} = useFieldArray({control, name: "products"});

    const [customers, setCustomers] = useState([]);
    const [customerContacts, setCustomerContacts] = useState([]);
    const [products, setProducts] = useState([]);
    const [productSales, setProductSales] = useState([]);
    const [productID, setProductID] = useState(0);
    const [productName, setProductName] = useState();
    const [productPrice, setProductPrice] = useState();
    const [productSalePrice, setProductSalePrice] = useState();
    const [productStock, setProductStock] = useState();
    const [quantity, setQuantity] = useState();
    const [unitPrice, setUnitPrice] = useState();
    const [availability, setAvailability] = useState();
    const [availabilityRange, setAvailabilityRange] = useState();
    const [vat, setVat] = useState();
    const [discount, setDiscount] = useState();
    const [discountType, setDiscountType] = useState();
    const [val, setVal] = useState();
    const [valProduct, setValProduct] = useState();
    const [shippingCost, setShippingCost] = useState();
    const [shippingPercent, setShippingPercent] = useState();
    const [offer, setOffer] = useState()
    const [offerDetails, setOfferDetails] = useState([]);
    const [settings, setSettings] = useState()
    const [settingsDetails, setSettingsDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);
    const [offerConfirmationUser, setOfferConfirmationUser] = useState([]);
    let [pdfTitle, setPdfTitle] = useState("");

    const [banks, setBanks] = useState([]);
    const {data: session} = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    let settingArray = [];

    let now = new Date();
    let overallTotalArray = [];
    let vatTotalArray = [];
    let discountTotalArray = [];
    let subtotalArray = [];
    let gross = 0;
    let net = 0;
    let total_gross = 0;
    let total_net = 0;
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
            if (response.data[0] === undefined || response.data[0].create_offer === 0) {
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
        let shipping_percent = getValues("shipping_percent")
        let shipping_percentage_amount = parseFloat((shipping_cost * shipping_percent) / 100)
        let shipping_total_cost = "";
        if (shipping_percentage_amount) {
            shipping_total_cost = parseFloat(shipping_cost) + shipping_percentage_amount
        } else {
            shipping_total_cost = 0
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

        setValue("overall_total", overall_total + shipping_total_cost)
        setValue("vat_total", vat_total)
        setValue("discount_total", discount_total)
        setValue("subtotal", subtotal)
        setValue("shipping_percentage_amount", shipping_percentage_amount)
        setValue("shipping_total_cost", shipping_total_cost)
        setValue("foreign_currency", JSON.stringify(props.foreignCurrency.items[0]))
    }

    async function productOptions() {
        await axios({
            method: 'POST',
            url: '/api/offers/get-products',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
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

    async function getProductSales(product_id) {
        await axios({
            method: 'post',
            url: `/api/offers/get-product-sales/${product_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setProductSales(response.data)
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
            console.log(response.data)
            if (response.data.length === 1) {
                setValue("invoice_address", response.data[0].id)
                setValue("shipment_address", response.data[0].id)
            } else {
                for (let i = 0; i < response.data.length; i++) {
                    if (response.data[i].address_type === 0) {
                        setValue("invoice_address", response.data[i].id)
                    }
                    if (response.data[i].address_type === 1) {
                        setValue("shipment_address", response.data[i].id)
                    }
                }
            }
            setCustomerContacts(response.data)

        }).catch(function (error) {
            console.log(error)
        })
    }

    const createPDF = async (offer_id, bankDetails, pdfTitle) => {
        await axios({
            method: 'get',
            url: `/api/offers/get-offer/${offer_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            pdfDocument(response.data, settings, bankDetails, pdfTitle, `${pdfTitle}-${response.data.offer_code + "-" + (response.data.created_at).split("T")[0]
            }`).then(() => {
                Swal.close();
            });
        }).catch(function (error) {
            console.log(error)
        })
    }

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => {
        reset()
        setValue('customer', '')
        setValue('invoice_address', '')
        setValue('shipment_address', '')
        setValue('delivery_time', '')
        setValue('maturity_time', '')
        setValue('number_of_packages', '')
        document.getElementById("formValue").reset();
        setShow(false);
    }

    const [showProduct, setShowProduct] = useState(false);
    const handleShowProduct = () => setShowProduct(true);
    const handleCloseProduct = () => setShowProduct(false);

    async function getOffer(offer_id) {
        await axios({
            method: 'get',
            url: `/api/offers/get-offer/${offer_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setOffer(response.data)
            setOfferDetails(response.data.offerDetails)
            setSettingsDetails(settings.settings)
            settings.banks.map((i, index) => {
                if (response.data.bank_id === i.id) {
                    setBankDetails(i)
                }
            })
            handleShow()
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
        if (data.quotation === false) {
            setPdfTitle("PROFORMA");
        } else {
            setPdfTitle("QUOTATION")
        }
        await axios({
            method: 'POST',
            url: '/api/offers/add-offer',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: data,
        }).then(function (res) {
            alert(res.data.title, res.data.message, res.data.status, () => {
                if (res.data.status === "success") {
                    getOffer(res.data.offer)
                }
            })
        }).catch(function (error) {
            console.log(error)
        })
    }

    const filterCustomers = (val) => {
        return customers.filter((i) =>
            i.label && i.label.toLowerCase().includes(val.toLowerCase())
        );
    };

    const customerOptions = async () => {
        await axios({
            method: 'POST',
            url: '/api/offers/get-customers',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            const options = []
            response.data.map((customers, index) => {
                options.push({
                    label: customers.trade_name,
                    value: customers.id,
                    code: customers.customer_code
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
                return "Tarafınıza yapılmış bir atama bulunamadı!"
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
    const nOMP = () => {
        if (!valProduct) {
            return "En az üç karakter giriniz..."
        } else {
            if (!result_filter_product) {
                return "Kayıtlı ürün bulunamadı!"
            }
        }
    }
    const handleClick = (index) => {
        remove(index);
        getVatAmount()
    };

    async function getSettings() {
        await axios({
            method: 'post',
            url: '/api/settings/get-settings',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setSettings(response.data)
            setBanks(response.data.banks)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getOfferConfirmationUser() {
        await axios({
            method: 'post',
            url: '/api/definitions/authority-management/get-offer-confirmation',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setOfferConfirmationUser(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    useEffect(() => {
        getPermissionDetail();
        getVatAmount()
        customerOptions()
        productOptions()
        getProductSales(productID)
        getSettings()
        getOfferConfirmationUser();
    }, [quantity, unitPrice, availability, availabilityRange, vat, discount, discountType, val, productID, shippingCost, shippingPercent, reset]);

    return (
        <>
            <Title title="Teklif Oluşturma"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link underline="none" color="inherit" href="pages/productManagement/brands">
                    Teklif Oluştur
                </Link>
            </Breadcrumbs>
            <form onSubmit={handleSubmit(onSubmit)} id="formValue">
                <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <div className="row">
                                <div className="col-12 col-lg-12 mb-2">
                                    <label className="pt-1 pb-1">Müşteri</label>
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
                                                          placeholder={"Müşteri ara..."}
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
                                        {customerContacts.map((i, index) => (
                                            <option key={index} value={i.id}
                                                    selected={i.address_type === 0}>{i.address}/{i.district_name}/{i.province_name}/{i.country_name}</option>
                                        ))}
                                    </select>
                                    {errors.invoice_address &&
                                        <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                                <div className="col-6 col-lg-6 mb-2">
                                    <label className="pt-1 pb-1">Sevkiyat Adresi</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <select
                                        {...register("shipment_address", {required: true})}
                                        className={"form-select form-select-sm " + (errors.shipment_address ? "is-invalid" : "")}
                                    >
                                        {customerContacts.map((i, index) => (
                                            <option key={index} value={i.id}
                                                    selected={i.address_type === 1}>{i.address}/{i.district_name}/{i.province_name}/{i.country_name}</option>
                                        ))}

                                    </select>
                                    {errors.shipment_address &&
                                        <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                                <div className="col-12 col-lg-12 mb-2">
                                    <label className="pt-1 pb-1">Teklif Konusu</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input type="text"
                                           autoComplete="off"
                                           className={"form-control form-control-sm " + (errors.subject ? "is-invalid" : "")}
                                           {...register("subject", {required: true})} />
                                    {errors.subject &&
                                        <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                                <div className="row pe-0">
                                    <div className="col-4 col-lg-4 mb-2">
                                        <label className="pt-1 pb-1">Sevk Eden</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <input type="text"
                                               autoComplete="off"
                                               defaultValue="DHL Express / Cargo"
                                               className={"form-control form-control-sm " + (errors.shipped_by ? "is-invalid" : "")}
                                               {...register("shipped_by", {required: true})} />
                                        {errors.shipped_by &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>
                                    <div className="col-4 col-lg-4 mb-2">
                                        <label className="pt-1 pb-1">Teslimat Şekli</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <input type="text"
                                               autoComplete="off"
                                               className={"form-control form-control-sm " + (errors.delivery_term ? "is-invalid" : "")}
                                               {...register("delivery_term", {required: true})} />
                                        {errors.delivery_term &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>
                                    <div className="col-4 col-lg-4 mb-2 pe-0">
                                        <label className="pt-1 pb-1 ">Menşei</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <input type="text"
                                               autoComplete="off"
                                               defaultValue="Turkey"
                                               className={"form-control form-control-sm " + (errors.origin ? "is-invalid" : "")}
                                               {...register("origin", {required: true})} />
                                        {errors.origin &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>
                                    <div className="col-4 col-lg-4 mb-2">
                                        <label className="pt-1 pb-1">Gönderim Şekli</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <input type="text"
                                               autoComplete="off"
                                               defaultValue="DHL / AIR CARGO"
                                               className={"form-control form-control-sm " + (errors.transport ? "is-invalid" : "")}
                                               {...register("transport", {required: true})} />
                                        {errors.transport &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>

                                    <div className="col-4 col-lg-4 mb-2">
                                        <label className="pt-1 pb-1">Ambalaj Türü</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <input type="text"
                                               autoComplete="off"
                                               defaultValue="Box"
                                               className={"form-control form-control-sm " + (errors.type_of_packaging ? "is-invalid" : "")}
                                               {...register("type_of_packaging", {required: true})} />
                                        {errors.type_of_packaging &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>
                                    <div className="col-4 col-lg-4 mb-2 pe-0">
                                        <label className="pt-1 pb-1">Geçerlik</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <input type="text"
                                               autoComplete="off"
                                               {...register("validity", {required: true})}
                                               className={"form-control form-control-sm " + (errors.validity ? "is-invalid" : "")}
                                               defaultValue="7 Days"
                                        />
                                        {errors.validity &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>
                                    <div className="col-4 col-lg-4 mb-2 pe-0">
                                        <label className="pt-1 pb-1 ">Banka Bilgileri</label>
                                        <span className="registerTitle text-danger fw-bold"> *</span>
                                        <select
                                            className={"form-select form-select-sm w-100 me-2"} {...register("bank")}>
                                            {
                                                banks.map(function (bank, index) {
                                                        if (bank.bank_name) {
                                                            return (
                                                                <>
                                                                    <option key={bank.id}
                                                                            value={bank.id}
                                                                            selected={bank.id === 1}>{bank.bank_name}</option>
                                                                </>
                                                            )
                                                        }
                                                    }
                                                )
                                            }
                                        </select>
                                    </div>
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
                                            {errors.delivery_range &&
                                                <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
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
                                                        className={"form-control form-control-sm  mb-2 mb-md-0 " + (errors.maturity_time ? "is-invalid" : "")}
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
                                            {errors.maturity_range &&
                                                <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-6 mb-2">
                                    <label className="pt-1 pb-1">Ödeme</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <input type="text"
                                           autoComplete="off"
                                           defaultValue="Cash in Advance"
                                           className={"form-control form-control-sm " + (errors.payment ? "is-invalid" : "")}
                                           {...register("payment", {required: true})} />
                                    {errors.payment &&
                                        <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                                <div className="col-6 col-lg-6 mb-2">
                                    <label className="pt-1 pb-1">Para Birimi</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <select
                                        {...register(`currency_unit`, {required: true})}
                                        className={"form-select form-select-sm " + (errors.currency_unit ? "is-invalid" : "")}
                                    >
                                        <option value="">Seçiniz...</option>
                                        <option value="€">EURO</option>
                                        <option value="$">USD</option>
                                        <option value="₺">TL</option>

                                    </select>
                                    {errors.currency_unit &&
                                        <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                </div>
                                <div className="col-6 col-lg-6 mb-2">
                                    <label className="pt-1 pb-1">Paket Sayısı</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <Controller
                                        control={control}
                                        name="number_of_packages"
                                        render={({field: {onChange, name, value}}) => (
                                            <NumberFormat
                                                autoComplete="off"
                                                className={"form-control form-control-sm  " + (errors.number_of_packages ? "is-invalid" : "")}
                                                name={name}
                                                value={value}
                                                maxLength={3}
                                                allowNegative={false}
                                                onChange={onChange}
                                            />
                                        )}
                                        rules={{required: true}}
                                    />
                                    {errors.number_of_packages &&
                                        <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-12">
                            <div className="row">
                                <div className="col-12 col-lg-12 mb-3 pt-3 ">
                                    <Controller
                                        control={control}
                                        name="offer_date"
                                        render={({
                                                     field: {onChange, name, value},
                                                     fieldState: {error, invalid}
                                                 }) => (
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                                <DatePicker
                                                    label="Teklif Tarihi"
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
                                        name="end_date"
                                        render={({
                                                     field: {onChange, name, value},
                                                     fieldState: {error, invalid}
                                                 }) => (
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                                <DatePicker
                                                    label="Son Geçerlilik Tarihi"
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
                                        <th className="table-th text-center" style={{width: "15%"}}>Mevcutluk</th>
                                        <th className="table-th">KDV %</th>
                                        <th className="table-th-number">KDV Tutarı</th>
                                        <th className="table-th-number">İskonto</th>
                                        <th className="table-th">İsk Tipi</th>
                                        <th className="table-th-number" style={{width: "10%"}}>Toplam</th>
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
                                                               onKeyUp={(e) => {
                                                                   if (parseInt(e.target.value) < parseInt(getValues(`products.${index}.stock`))) {
                                                                       setValue(`products.${index}.availability`, "Stock")
                                                                       setAvailability("Stock")
                                                                   }
                                                               }}
                                                        />

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
                                                                       required: false,
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
                                                                                <span className="input-group-text"
                                                                                      id="basic-addon">
                                                                                    <a className="cursor-pointer small"
                                                                                       title="İncele"
                                                                                       onClick={() => {
                                                                                           setProductID(getValues(`products.${index}.id`));
                                                                                           setProductName(getValues(`products.${index}.name`));
                                                                                           setProductPrice(getValues(`products.${index}.price`));
                                                                                           setProductSalePrice(getValues(`products.${index}.sale_price`));
                                                                                           setProductStock(getValues(`products.${index}.stock`));
                                                                                           getProductSales(productID);
                                                                                           handleShowProduct()
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
                                                        <Modal size="xl" show={showProduct} onHide={handleCloseProduct}
                                                               backdrop="static" keyboard={false}
                                                               aria-labelledby="example-modal-sizes-title-xl">
                                                            <Modal.Header closeButton>
                                                                <p className="modal-title fs-6 fw-semibold">
                                                                    Ürüne Ait Satış Detayı
                                                                </p>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <div className="row">
                                                                    <div className="col-12">
                                                                        <div className="row col-6">
                                                                            <label className="col-sm-5 col-form-label">Ürün
                                                                                Adı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productName}</p>
                                                                            </div>
                                                                            <label className="col-sm-5 col-form-label">Ürün
                                                                                Satış Fiyatı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productPrice}</p>
                                                                            </div>
                                                                            <label className="col-sm-5 col-form-label">Ürün
                                                                                İndirimli Satış
                                                                                Fiyatı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productSalePrice}</p>
                                                                            </div>
                                                                            <label className="col-sm-5 col-form-label">Ürün
                                                                                Stok Miktarı:</label>
                                                                            <div className="col-sm-7">
                                                                                <p className="col-sm-10 col-form-label">{productStock}</p>
                                                                            </div>
                                                                        </div>
                                                                        <hr/>
                                                                        <div
                                                                            className="alert alert-ks p-0 fade show mt-3 text-center"
                                                                            role="alert">
                                                                            <i className="fas fa-exclamation-circle"></i> Ürüne
                                                                            ait geçmiş
                                                                            satışlar listelenmektedir !
                                                                        </div>
                                                                        <div className="table-responsive">
                                                                            <table className="table">
                                                                                <thead>
                                                                                <tr>
                                                                                    <th scope="col">#</th>
                                                                                    <th scope="col">Ürün</th>
                                                                                    <th scope="col">Miktar</th>
                                                                                    <th scope="col">Birim Fiyat</th>
                                                                                    <th scope="col">KDV Tutarı</th>
                                                                                    <th scope="col">İskonto Tutarı</th>
                                                                                    <th scope="col">Toplam</th>
                                                                                    <th scope="col">Müşteri</th>
                                                                                    <th scope="col">Tarih</th>
                                                                                </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                {productSales.length > 0 ? (
                                                                                        productSales.map((i, index) => (
                                                                                            <>
                                                                                                <tr key={index + "q"}>
                                                                                                    <th scope="row">{index + 1}</th>
                                                                                                    <td>{i.product_name}</td>
                                                                                                    <td>{Math.abs(i.quantity)}</td>
                                                                                                    <td>{i.unit_price} ( {i.unit} )</td>
                                                                                                    <td>{i.vat_amount} (
                                                                                                        %{i.vat} )
                                                                                                    </td>
                                                                                                    <td>{i.discount_amount} ( {(i.discount_type === "yuzde") ? "%" + i.discount : i.discount + i.currency_unit} ind.
                                                                                                        )
                                                                                                    </td>
                                                                                                    <td>{i.total} {i.currency_unit}</td>
                                                                                                    <td>{(i.sale) ? i.sale.customer_trade_name : ""}</td>
                                                                                                    <td>{moment((i.created_at).substring(0, 10)).format("DD.MM.YYYY")}</td>
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
                                                                                                ait
                                                                                                geçmiş
                                                                                                satış bulunmamaktadır !
                                                                                            </div>
                                                                                        </th>
                                                                                    </tr>
                                                                                }
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <hr/>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="secondary btn-sm"
                                                                        onClick={handleCloseProduct}>
                                                                    Kapat
                                                                </Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                    </td>
                                                    <td>
                                                        <div className="row">
                                                            {getValues(`products.${index}.availability_range`) === 'Stock' ?
                                                                (
                                                                    <div className="col-md-4">
                                                                        {
                                                                            setValue(`products.${index}.availability_time`, "")
                                                                        }
                                                                    </div>
                                                                ) : (
                                                                    <div className="col-md-4">
                                                                        <input type="text"
                                                                               autoComplete="off"
                                                                               required={getValues(`products.${index}.availability_range`) ? true : false}
                                                                               title={errors?.['products']?.[index]?.['availability_time']?.['message']}
                                                                               {...register(`products.${index}.availability_time`, {
                                                                                   pattern: {
                                                                                       value: /^[0-9]+$/,
                                                                                       message: "Sadece sayı girişi yapılabilir!"
                                                                                   },
                                                                                   maxLength: 20
                                                                               })}
                                                                               className="form-control form-control-sm"
                                                                               onChange={(e) => {
                                                                                   setAvailability(e.target.value)
                                                                                   setValue(`products.${index}.availability_time`, e.target.value)
                                                                               }}
                                                                        />
                                                                    </div>
                                                                )}

                                                            <div className="col-md-8">
                                                                <select
                                                                    {...register(`products.${index}.availability_range`)}
                                                                    className={"form-select form-select-sm " + (errors.availability_range ? "is-invalid" : "")}
                                                                    required={getValues(`products.${index}.availability_time`) ? true : false}

                                                                    onChange={(e) => {
                                                                        setAvailabilityRange(e.target.value)
                                                                        setValue(`products.${index}.availability_range`, e.target.value)
                                                                        setFocus(`products.${index}.availability_time`)
                                                                    }}
                                                                >
                                                                    <option value="">Seçiniz...</option>
                                                                    {getValues(`products.${index}.availability_time`) > 1 ? (
                                                                        <>
                                                                            <option value="Stock">Stokta</option>
                                                                            <option value="Days">Gün</option>
                                                                            <option value="Weeks">Hafta</option>
                                                                            <option value="Months">Ay</option>
                                                                            <option value="Years">Yıl</option>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <option value="Stock">Stokta</option>
                                                                            <option value="Day">Gün</option>
                                                                            <option value="Week">Hafta</option>
                                                                            <option value="Month">Ay</option>
                                                                            <option value="Year">Yıl</option>
                                                                        </>

                                                                    )
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/*{(getValues(`products.${index}.stock`) < getValues(`products.${index}.quantity`)) ? (*/}
                                                        {/*        <div className="row">*/}
                                                        {/*            <div className="col-md-4">*/}
                                                        {/*                <input type="text"*/}
                                                        {/*                       autoComplete="off"*/}
                                                        {/*                       title={errors?.['products']?.[index]?.['availability_time']?.['message']}*/}
                                                        {/*                       {...register(`products.${index}.availability_time`, {*/}
                                                        {/*                           required: true,*/}
                                                        {/*                           pattern: {*/}
                                                        {/*                               value: /^[0-9]+$/,*/}
                                                        {/*                               message: "Sadece sayı girişi yapılabilir!"*/}
                                                        {/*                           },*/}
                                                        {/*                           maxLength: 20*/}
                                                        {/*                       })}*/}
                                                        {/*                       className="form-control form-control-sm"*/}
                                                        {/*                       onChange={(e) => {*/}
                                                        {/*                           setAvailability(e.target.value)*/}
                                                        {/*                           setValue(`products.${index}.availability_time`, e.target.value)*/}
                                                        {/*                       }}*/}
                                                        {/*                />*/}
                                                        {/*            </div>*/}
                                                        {/*            <div className="col-md-8">*/}
                                                        {/*                <select*/}
                                                        {/*                    {...register(`products.${index}.availability_range`, {required: true})}*/}
                                                        {/*                    className={"form-select form-select-sm " + (errors.availability_range ? "is-invalid" : "")}*/}
                                                        {/*                >*/}
                                                        {/*                    <option value="">Seçiniz...</option>*/}
                                                        {/*                    {getValues(`products.${index}.availability_time`) > 1 ? (*/}
                                                        {/*                        <>*/}
                                                        {/*                            <option value="Days">Gün</option>*/}
                                                        {/*                            <option value="Weeks">Hafta</option>*/}
                                                        {/*                            <option value="Months">Ay</option>*/}
                                                        {/*                            <option value="Years">Yıl</option>*/}
                                                        {/*                        </>*/}
                                                        {/*                    ) : (*/}
                                                        {/*                        <>*/}
                                                        {/*                            <option value="Day">Gün</option>*/}
                                                        {/*                            <option value="Week">Hafta</option>*/}
                                                        {/*                            <option value="Month">Ay</option>*/}
                                                        {/*                            <option value="Year">Yıl</option>*/}
                                                        {/*                        </>*/}

                                                        {/*                    )*/}
                                                        {/*                    }*/}
                                                        {/*                </select>*/}
                                                        {/*            </div>*/}
                                                        {/*        </div>*/}
                                                        {/*    ) :*/}
                                                        {/*    (*/}
                                                        {/*        <input type="text"*/}
                                                        {/*               autoComplete="off"*/}
                                                        {/*               {...register(`products.${index}.availability`, {*/}
                                                        {/*                   required: false,*/}
                                                        {/*               })}*/}
                                                        {/*               readOnly*/}
                                                        {/*               className="form-control form-control-sm text-center"*/}
                                                        {/*               defaultValue={getValues(`products.${index}.availability`)}/>*/}

                                                        {/*    )*/}
                                                        {/*}*/}
                                                    </td>
                                                    <td>
                                                        <select
                                                            {...register(`products.${index}.vat`, {required: true})}
                                                            className={"form-select form-select-sm "}
                                                            disabled={(getValues(`products.${index}.unit_price`)) ? "" : true}
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
                                                               defaultValue="0"
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
                                                            disabled={(getValues(`products.${index}.discount`)) ? "" : true}
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
                                                <i className="fas fa-exclamation-circle"></i> Teklif için ekleme
                                                yapınız!
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
                                        <th colSpan="10" className="text-end">Kargo Ücreti
                                            <span className="registerTitle text-danger fw-bold"> *</span></th>
                                        <td colSpan="2" className="text-start">
                                            <input type="text"
                                                   autoComplete="off"
                                                   {...register("shipping_cost", {
                                                       required: true,
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
                                        <th colSpan="10" className="text-end">Kargo Yüzdesi
                                            <span className="registerTitle text-danger fw-bold"> *</span></th>
                                        <td colSpan="1" className="text-start">
                                            <input type="text"
                                                   autoComplete="off"
                                                   {...register("shipping_percent", {
                                                       required: true,
                                                       pattern: {
                                                           value: /^[0-9.]+$/,
                                                           message: "Sadece sayı girişi yapılabilir!"
                                                       },
                                                       maxLength: 20
                                                   })}
                                                   className="form-control form-control-sm"
                                                   onChange={(e) => {
                                                       setValue("shipping_percent", e.target.value)
                                                       setShippingPercent(e.target.value)
                                                       getVatAmount()
                                                   }}
                                            />
                                        </td>
                                        <td colSpan="1" className="text-start">
                                            <input type="text"
                                                   {...register("shipping_percentage_amount", {required: true})}
                                                   readOnly
                                                   value={parseFloat(isNaN(getValues("shipping_percentage_amount")) ? 0 : getValues("shipping_percentage_amount")).format(2, 3, '.', ',')}
                                                   className="form-control form-control-sm"/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" className="text-end">Kargo Toplamı</th>
                                        <td colSpan="2" className="text-start">
                                            <input type="text"
                                                   {...register("shipping_total_cost", {required: true})}
                                                   readOnly
                                                   value={parseFloat(isNaN(getValues("shipping_total_cost")) ? 0 : getValues("shipping_total_cost")).format(2, 3, '.', ',')}
                                                   className="form-control form-control-sm"/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" className="text-end">Toplam Tutar:</th>
                                        <th colSpan="2"
                                            className="text-start">{parseFloat(isNaN(getValues("overall_total")) ? "0" : getValues("overall_total")).format(2, 3, '.', ',')}</th>
                                    </tr>
                                    </tfoot>
                                </table>
                                <table className="d-flex justify-content-end">
                                    {
                                        offerConfirmationUser.map((item, index) => {
                                            return (
                                                <>
                                                    <tr key={index} className="one input-group">
                                                        <td className="ps-2 pe-2">
                                                            <input className="pt-3"
                                                                   type="checkbox" {...register(`${item.fullName}`)}/>
                                                        </td>
                                                        <td>{item.fullName}</td>
                                                    </tr>
                                                </>
                                            )
                                        })
                                    }
                                    <tr className="one">
                                        <td className="ps-2 pe-2">
                                            <input type="checkbox" className="input-group" {...register("completed")}/>
                                        </td>
                                        <td>Tamamlandı</td>
                                    </tr>
                                    <tr className="one">
                                        <td className="ps-2 pe-2">
                                            <input type="checkbox" className="input-group" {...register("quotation")}/>
                                        </td>
                                        <td>Quotation</td>
                                    </tr>
                                </table>
                                <div className="d-flex justify-content-end pt-3">
                                    <button type="submit" className="btn btn-tk-save btn-sm">Kaydet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {offer ? (
                <Modal size="xl" show={show} onHide={handleClose} backdrop="static" keyboard={false}
                       aria-labelledby="example-modal-sizes-title-xl">
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="quotation">
                            <div className="row px-3">
                                <div className="col-md-4 col-12">
                                    <table style={{marginTop: "1em"}}>
                                        <tbody>
                                        <tr>
                                            <img className="img-fluid" src="/public/logo.png" alt="crm"/>
                                        </tr>
                                        <tr>
                                            <th>Committed to Quality...</th>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-8 col-12">
                                    <div>
                                        <table className="table table-bordered ">
                                            <tbody>
                                            <tr>
                                                <th colSpan="2" className="text-center table-secondary"> {pdfTitle}</th>
                                            </tr>
                                            <tr>
                                                <th>Date</th>
                                                <td>{moment(offer.offer_date).format('DD.MM.YYYY')}</td>
                                            </tr>
                                            <tr>
                                                <th>{pdfTitle === 'QUOTATION' ? 'Quotation' : 'Proforma'} No</th>
                                                <td>{offer.offer_code}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <tbody>
                                            <tr>
                                                <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                            </tr>
                                            <tr className="table-secondary">
                                                <th colSpan="5">Company Information</th>
                                                <th colSpan="5">Payment and Shipping Details</th>
                                            </tr>
                                            <tr>
                                                <th colSpan="2" style={{width: "20%"}}>Company Name</th>
                                                <td colSpan="3" style={{width: "25%"}}>{offer.customer_trade_name}</td>
                                                <th colSpan="2" style={{width: "20%"}}>Payment Term</th>
                                                <td colSpan="3">{offer.payment}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Contact Person</th>
                                                <td colSpan="3">{offer.customer.customerToOfficials[0].customerOfficial.name + " " + offer.customer.customerToOfficials[0].customerOfficial.surname}</td>
                                                <th colSpan="2">Shipped by</th>
                                                <td colSpan="3">{offer.shipped_by}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Address (Line1)</th>
                                                <td colSpan="3">{offer.customerContactsInvoice.address}</td>
                                                <th colSpan="2">Delivery Term</th>
                                                <td colSpan="3">{offer.delivery_term}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Address (Line2)</th>
                                                <td colSpan="3">{offer.customerContactsInvoice.district_name == null ? "-" : offer.customerContactsInvoice.district_name + "/ " + offer.customerContactsInvoice.province_name + "/ " + offer.customerContactsInvoice.country_name}</td>
                                                <th colSpan="2">Origin</th>
                                                <td colSpan="3">{offer.origin}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Phone</th>
                                                <td colSpan="3">{offer.customer.customerToOfficials[0].customerOfficial.phone}</td>
                                                <th colSpan="2">Validity</th>
                                                <td colSpan="3">{offer.validity}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Sales Person</th>
                                                <td colSpan="3">{offer.customer.customerToUsers[0].user.name + " " + offer.customer.customerToUsers[0].user.surname}</td>
                                                <th colSpan="2">Currency</th>
                                                <td colSpan="3">
                                                    {(() => {
                                                        if (offer.currency_unit == "₺") {
                                                            return (
                                                                <>TL</>
                                                            )
                                                        } else if (offer.currency_unit == "$") {
                                                            return (
                                                                <>USD</>
                                                            )
                                                        } else if (offer.currency_unit == "€") {
                                                            return (
                                                                <>EURO</>
                                                            )
                                                        }
                                                    })()}

                                                </td>
                                            </tr>
                                            <tr>
                                                <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                            </tr>
                                            <tr className="table-secondary text-center">
                                                <th>No</th>
                                                <th>Part No</th>
                                                <th colSpan="3">Decription</th>
                                                <th>Origin</th>
                                                <th>Availability</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Total</th>
                                            </tr>
                                            {offerDetails.map((i, index) => {
                                                gross = parseFloat((i.products[0].kilogram) * (i.quantity));
                                                net = parseFloat(gross - ((gross * 10) / 100));
                                                total_gross += gross;
                                                total_net += net;
                                                return (
                                                    <>
                                                        <tr key={index + "w"}>
                                                            <th>{index + 1}</th>
                                                            <td>{i.products[0].product_code}</td>
                                                            <td colSpan="3">{i.products[0].product_desc}</td>
                                                            <td>{i.products[0]["brand"].brand_name}</td>
                                                            <td>{i.availability}</td>
                                                            <td>{Math.abs(i.quantity)}</td>
                                                            <td>{i.currency_unit} {((parseFloat(i.unit_price) - (parseFloat(i.discount_amount) / parseFloat(Math.abs(i.quantity)))) + (parseFloat(i.vat_amount) / parseFloat(Math.abs(i.quantity)))).format(2, 3, '.', ',')}</td>
                                                            <td> {i.currency_unit} {parseFloat(i.total).format(2, 3, '.', ',')}</td>
                                                        </tr>
                                                    </>
                                                )
                                            })}

                                            <tr className="table-secondary">
                                                <th colSpan="2" style={{fontSize: "13px"}}>Mode of Transport</th>
                                                <th style={{fontSize: "12.7px"}}>Number of Packages</th>
                                                <th colSpan="2" style={{fontSize: "13px"}}>Total Gross Weight</th>
                                                <th colSpan="2">Type of Packaging</th>
                                                <th colSpan="2" className="text-end">SUBTOTAL</th>
                                                <th>{offer.currency_unit} {parseFloat(offer.subtotal).format(2, 3, '.', ',')}</th>
                                            </tr>
                                            <tr>
                                                <td colSpan="2">{offer.transport}</td>
                                                <td>{offer.number_of_packages}</td>
                                                <td colSpan="2">{total_gross.toFixed(2)} kg</td>
                                                <td colSpan="2">{offer.type_of_packaging}</td>
                                                <th colSpan="2" className="text-end table-secondary"
                                                    style={{borderTop: "1px solid", borderBottom: "1px solid"}}>SHIPPING
                                                    COST
                                                </th>
                                                <th className="table-secondary" style={{
                                                    borderTop: "1px solid",
                                                    borderBottom: "1px solid"
                                                }}>{offer.currency_unit} {parseFloat(offer.shipping_total_cost).format(2, 3, '.', ',')}</th>
                                            </tr>

                                            <tr>
                                                <th colSpan="7"></th>
                                                <th colSpan="2" className="text-end table-secondary">TOTAL</th>
                                                <th className="table-secondary">{offer.currency_unit} {parseFloat(offer.overall_total).format(2, 3, '.', ',')}</th>
                                            </tr>
                                            <tr>
                                                <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                            </tr>
                                            <tr className="table-secondary text-center">
                                                <th colSpan="10">{settingsDetails.trade_name} (www.crmlimited.com)</th>
                                            </tr>
                                            <tr style={{height: "100px"}}>
                                                <td colSpan="3" style={{width: "25%"}}>
                                                    <div className="row mb-2">
                                                        <label
                                                            className="col-sm-5 col-form-label fw-bold">Address:</label>
                                                        <p className="col-sm-12 col-form-label">{settingsDetails.address}</p>
                                                        <label
                                                            className="col-sm-5 col-form-label fw-bold">Phone:</label>
                                                        <p>{settingsDetails.first_phone} / {settingsDetails.second_phone}
                                                            <br/>{settingsDetails.email}</p>
                                                    </div>

                                                </td>
                                                <td colSpan="4" style={{width: "45%"}}>
                                                    <div className="row">
                                                        <label className="col-sm-4 col-form-label fw-bold">Bank
                                                            Name:</label>
                                                        <div className="col-sm-8">
                                                            <p className="col-sm-12 col-form-label">{bankDetails.bank_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <label className="col-sm-4 col-form-label fw-bold">Bank
                                                            Branch:</label>
                                                        <div className="col-sm-8">
                                                            <p className="col-sm-12 col-form-label">{bankDetails.bank_branch}</p>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <label className="col-sm-4 col-form-label fw-bold">Swift
                                                            Code:</label>
                                                        <div className="col-sm-8">
                                                            <p className="col-sm-12 col-form-label">{bankDetails.swift_code}</p>
                                                        </div>
                                                    </div>
                                                    <div className="row ">
                                                        <label className="col-sm-4 col-form-label fw-bold"
                                                               style={{fontSize: "13px"}}>USD IBAN
                                                            NO:</label>
                                                        <div className="col-sm-8">
                                                            <p className="col-sm-12 col-form-label">{bankDetails.usd_iban_no}</p>
                                                        </div>
                                                    </div>
                                                    <div className="row ">
                                                        <label className="col-sm-4 col-form-label fw-bold"
                                                               style={{fontSize: "13px"}}>EURO IBAN
                                                            NO:</label>
                                                        <div className="col-sm-8">
                                                            <p className="col-sm-12 col-form-label">{bankDetails.euro_iban_no}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <th colSpan="3" style={{width: "30%", paddingTop: "5%"}}>
                                                    <img className="img-fluid"
                                                         src={`/public/${settingsDetails.signature}`}
                                                         alt="signature"/>
                                                </th>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary btn-sm" onClick={handleClose}>
                            Kapat
                        </Button>
                        <a className="btn btn-tk-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(offer.id, bankDetails, pdfTitle)}>
                            PDF
                        </a>
                    </Modal.Footer>
                </Modal>
            ) : <></>}
        </>)
}

CreateOffer.auth = true;
export default CreateOffer;
