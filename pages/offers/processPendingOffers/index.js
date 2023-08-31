import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import 'moment/locale/tr';
import {Pagination, Table, CustomProvider} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import alert from "../../../components/alert";
import moment from "moment";
import Title from "../../../components/head";
import {Button, Modal} from "react-bootstrap";
import alertAuthority from "../../../components/alertAuthority";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import pdfDocument from "../../../components/pdf/PdfDocumentOuotation";
import Swal from "sweetalert2";
import NumberFormat from "react-number-format";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import trLocale from "date-fns/locale/tr";
import TextField from "@mui/material/TextField";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const offers = await axios.post(`${path}api/offers/get-pending-offers`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//     return {
//         props: {
//             offers: offers.data,
//         },
//     }
// }
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

function PendingOffers(props) {
    const {
        register, handleSubmit, watch, setValue, getValues, setFocus, reset, resetField, control, formState: {errors}
    } = useForm();

    const [offers, setOffers] = useState([])
    const [sortColumn, setSortColumn] = useState("created_at")
    const [sortType, setSortType] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [offer, setOffer] = useState()
    const [offerDetails, setOfferDetails] = useState([]);
    const [settings, setSettings] = useState()
    const [customerContacts, setCustomerContacts] = useState([]);
    const {fields, remove} = useFieldArray({control, name: "products"});
    const [subtotalRevised, setSubtotalRevised] = useState()
    const [vatTotalRevised, setVatTotalRevised] = useState()
    const [discountTotalRevised, setDiscountTotalRevised] = useState()
    const [shippingCostRevised, setShippingCostRevised] = useState()
    const [shippingPercentRevised, setShippingPercentRevised] = useState()
    const [shippingPercentageAmountRevised, setShippingPercentageAmountRevised] = useState()
    const [shippingTotalCostRevised, setShippingTotalCostRevised] = useState()
    const [overalTotalRevised, setOveralTotalRevised] = useState()
    const [offerDetailsRevised, setOfferDetailsRevised] = useState([]);
    const [settingsDetails, setSettingsDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);

    const [unitPrice, setUnitPrice] = useState();
    const [quantity, setQuantity] = useState();
    const [availability, setAvailability] = useState();
    const [availabilityRange, setAvailabilityRange] = useState();
    const [vat, setVat] = useState();
    const [discount, setDiscount] = useState();
    const [discountType, setDiscountType] = useState();
    const [shippingCost, setShippingCost] = useState();
    const [shippingPercent, setShippingPercent] = useState();

    const {data: session} = useSession()
    const router = useRouter();
    let now = new Date();
    let range = "";
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
            if (response.data[0] === undefined || response.data[0].pending_offers === 0) {
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
                getOffers();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getOffers() {
        setLoading(true);
        await axios({
            method: 'POST',
            url: '/api/offers/get-process-pending-offers',
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
            setOffers(response.data.data)
            setTotal(response.data.total)
            setLoading(false)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const handleChangeLimit = dataKey => {
        setPage(1)
        setLimit(dataKey)
    }

    async function processOffer(id, value, offer_code) {
        await axios({
            method: 'POST',
            url: '/api/offers/process_offer',
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: {
                offer_id: id,
                process: value,
                offer_code: offer_code
            },
        }).then(function (res) {
            handleCloseDetail();
            alert(res.data.title, res.data.message, res.data.status, () => {
                getOffers()
                reset()
            })
        }).catch(function (error) {
            console.log(error)
        })
    }

    const createPDF = async (offer_id,bankDetails, pdfTitle) => {
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
    const handleClose = () => setShow(false);

    const [showDetail, setShowDetail] = useState(false);
    const handleShowDetail = () => setShowDetail(true);
    const handleCloseDetail = () => setShowDetail(false);

    const [showRevised, setShowRevised] = useState(false);
    const handleShowRevised = () => setShowRevised(true);
    const handleCloseRevised = () => {
        reset()
        setShowRevised(false);
    }
    const [showRevisedQuotation, setShowRevisedQuotation] = useState(false);
    const handleShowRevisedQuotation = () => setShowRevisedQuotation(true);
    const handleCloseRevisedQuotation = () => setShowRevisedQuotation(false);

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
        }).catch(function (error) {
            console.log(error)
        })
    }
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
            handleShowRevisedQuotation()
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
        await axios({
            method: 'POST', url: '/api/offers/revised-offer',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }, data: data,
        }).then(function (res) {
            alert(res.data.title, res.data.message, res.data.status, () => {
                if (res.data.status === "success") {
                    handleCloseRevised()
                    getOffers()
                    if (res.data.status === "success") {
                        getOffer(res.data.offer)
                    }
                }
            })
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getCustomerContacts(customer_id) {
        await axios({
            method: 'POST', url: '/api/offers/get-customer-contacts/', headers: {
                'Content-Type': 'application/json', AuthToken: props.token
            }, data: {customer: customer_id}
        }).then(function (response) {
            setCustomerContacts(response.data)
        }).catch(function (error) {
            console.log(error)
        })
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
        })
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

    useEffect(() => {
        getPermissionDetail();
        getSettings()
        getVatAmount();
    }, [page, search, limit, sortColumn, sortType, watch, quantity, unitPrice, availability, availabilityRange, vat, discount, discountType, shippingCost, shippingPercent]);

    return (
        <div>
            <Title title="İşlem Bekleyen Teklifler"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-md-7 p-2">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link
                            underline="none"
                            color="inherit"
                            href="/offers/processPendingOffers"
                        >
                            İşlem Bekleyen Teklifler
                        </Link>
                    </Breadcrumbs></div>
            </div>
            {/* start: Header */}
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0"/>
                <h5 className="fw-bold mb-0">
                    <div className="d-flex" role="search">
                        <input className="form-control form-control-sm  me-2" type="search" placeholder="Arama"
                               aria-label="Arama" onChange={(e) => setSearch(e.target.value)}/>
                        <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                    </div>
                </h5>
            </div>
            {/*end: Header*/}
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={offers}
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
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Teklif Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="offer_code">
                                    {rowData => rowData.offer_code + (rowData.revised_code ? "-" + rowData.revised_code : "")}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} width={150} resizable>
                                <Table.HeaderCell>Firma Adı</Table.HeaderCell>
                                <Table.Cell dataKey="customer_trade_name"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={150} resizable>
                                <Table.HeaderCell>Teklif Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="offer_date">
                                    {rowData => moment(rowData.offer_date).format('DD.MM.YYYY')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} width={150} resizable>
                                <Table.HeaderCell>Son Geçerlilik Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="end_date">
                                    {rowData => moment(rowData.end_date).format('DD.MM.YYYY')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} width={150} resizable>
                                <Table.HeaderCell>Ödeme Yöntemi</Table.HeaderCell>
                                <Table.Cell dataKey="payment"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={125} resizable>
                                <Table.HeaderCell>Toplam Tutar</Table.HeaderCell>
                                <Table.Cell dataKey="overall_total">
                                    {rowData => parseFloat(rowData.overall_total).format(2, 3, '.', ',')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay"
                                               onClick={() => {
                                                   setValue("id", rowData.id)
                                                   setValue("user_id", rowData.user_id)
                                                   setValue("offer_code", rowData.offer_code)
                                                   setValue("revised_code", rowData.revised_code)
                                                   setValue("customer_trade_name", rowData.customer_trade_name)
                                                   setValue("authorized_person", (rowData.customer.customerToOfficials).length > 0 ? rowData.customer.customerToOfficials[0].customerOfficial.name + " " + rowData.customer.customerToOfficials[0].customerOfficial.surname : "")
                                                   setValue("authorized_person_phone", (rowData.customer.customerToOfficials).length > 0 ? rowData.customer.customerToOfficials[0].customerOfficial.phone : "")
                                                   setValue("authorized_person_email", (rowData.customer.customerToOfficials).length > 0 ? rowData.customer.customerToOfficials[0].customerOfficial.email : "")
                                                   setValue("related_person", (rowData.customer.customerToUsers).length > 0 ? rowData.customer.customerToUsers[0].user.name + " " + rowData.customer.customerToUsers[0].user.surname : "")
                                                   setValue("related_person_phone", (rowData.customer.customerToUsers).length > 0 ? rowData.customer.customerToUsers[0].user.phone : "")
                                                   setValue("offer_date", moment(rowData.offer_date).format('DD.MM.YYYY'))
                                                   setValue("maturity_date", moment(rowData.maturity_date).format('DD.MM.YYYY'))
                                                   setValue("end_date", moment(rowData.end_date).format('DD.MM.YYYY'))
                                                   setValue("invoice_address", rowData.customerContactsInvoice.address + " / " + (rowData.customerContactsInvoice.district_name == null ? "-" : rowData.customerContactsInvoice.district_name + " / " + rowData.customerContactsInvoice.province_name + " / " + rowData.customerContactsInvoice.country_name))
                                                   setValue("shipment_address", rowData.customerContactsShipment.address + " / " + (rowData.customerContactsShipment.district_name == null ? "-" : rowData.customerContactsShipment.district_name + " / " + rowData.customerContactsShipment.province_name + " / " + rowData.customerContactsShipment.country_name))
                                                   setValue("delivery_time", rowData.delivery_time)
                                                   setValue("maturity_time", rowData.maturity_time)
                                                   setValue("subject", rowData.subject)
                                                   setValue("subtotal", parseFloat(rowData.subtotal).format(2, 3, '.', ','))
                                                   setValue("vat_total", parseFloat(rowData.vat_total).format(2, 3, '.', ','))
                                                   setValue("discount_total", parseFloat(rowData.discount_total).format(2, 3, '.', ','))
                                                   setValue("shipping_cost", parseFloat(rowData.shipping_cost).format(2, 3, '.', ','))
                                                   setValue("shipping_percent", rowData.shipping_percent)
                                                   setValue("shipping_total_cost", parseFloat(rowData.shipping_total_cost).format(2, 3, '.', ','))
                                                   setValue("overall_total", parseFloat(rowData.overall_total).format(2, 3, '.', ','))
                                                   setValue("currency_unit", rowData.currency_unit)
                                                   setValue("shipped_by", rowData.shipped_by)
                                                   setValue("transport", rowData.transport)
                                                   setValue("number_of_packages", rowData.number_of_packages)
                                                   setValue("payment", rowData.payment)
                                                   setValue("type_of_packaging", rowData.type_of_packaging)
                                                   setValue("delivery_term", rowData.delivery_term)
                                                   setValue("origin", rowData.origin)
                                                   setValue("status", rowData.status)
                                                   setOfferDetails(rowData.offerDetails)
                                                   handleShowDetail()
                                               }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            {(() => {
                                                if (rowData.sales_status == 1) {
                                                    return (<>
                                                        <a className="cursor-pointer"
                                                           title="Revize" onClick={() => {
                                                            alert('Uyarı!', 'Teklif satış aşamasında olduğundan revize edilemez!', 'warning', () => {
                                                                getOffers()
                                                            })
                                                        }}
                                                        ><i className="fal fa-pen me-2"></i></a>
                                                    </>)
                                                } else if (rowData.revised == 1) {
                                                    return (<>
                                                        <a className="cursor-pointer"
                                                           title="Revize" onClick={() => {
                                                            alert('Uyarı!', 'Teklif revizeye gönderildi, tekrar revize edilemez!', 'warning', () => {
                                                                getOffers()
                                                            })
                                                        }}
                                                        ><i className="fal fa-pen me-2"></i></a>
                                                    </>)
                                                } else {
                                                    return (<>
                                                        <a className="cursor-pointer"
                                                           title="Revize"
                                                           onClick={() => {
                                                               setValue("id", rowData.id)
                                                               setValue("bank_id", rowData.bank_id)
                                                               setValue("offer_code", rowData.offer_code)
                                                               setValue("revised_code", rowData.revised_code)
                                                               setValue("currency_unit", rowData.currency_unit)
                                                               setValue('customer_id', rowData.customer_id)
                                                               setValue('customer_trade_name', rowData.customer_trade_name)
                                                               setValue('invoice_address', rowData.invoice_address)
                                                               setValue('shipment_address', rowData.shipment_address)
                                                               setValue('subject', rowData.subject)
                                                               setValue('shipped_by', rowData.shipped_by)
                                                               setValue('delivery_term', rowData.delivery_term)
                                                               setValue('origin', rowData.origin)
                                                               setValue('number_of_packages', rowData.number_of_packages)
                                                               setValue('type_of_packaging', rowData.type_of_packaging)
                                                               setValue('validity', rowData.validity)
                                                               setValue('delivery_time', (rowData.delivery_time).split(" ")[0])
                                                               setValue('delivery_range', (rowData.delivery_time).split(" ")[1])
                                                               setValue('maturity_time', (rowData.maturity_time).split(" ")[0])
                                                               setValue('maturity_range', (rowData.maturity_time).split(" ")[1])
                                                               setValue('payment', rowData.payment)
                                                               setValue("transport", rowData.transport)
                                                               setValue('offer_date', rowData.offer_date)
                                                               setValue('maturity_date', rowData.maturity_date)
                                                               setValue('end_date', rowData.end_date)
                                                               setValue('subtotal', rowData.subtotal)
                                                               setValue('vat_total', rowData.vat_total)
                                                               setValue('discount_total', rowData.discount_total)
                                                               setValue('shipping_cost', rowData.shipping_cost)
                                                               setValue('shipping_percent', rowData.shipping_percent)
                                                               setValue('shipping_percentage_amount', rowData.shipping_percentage_amount)
                                                               setValue('shipping_total_cost', rowData.shipping_total_cost)
                                                               setValue('overall_total', rowData.overall_total)
                                                               setValue('products', rowData.offerDetails)
                                                               setSubtotalRevised(rowData.subtotal)
                                                               setVatTotalRevised(rowData.vat_total)
                                                               setDiscountTotalRevised(rowData.discount_total)
                                                               setShippingCostRevised(rowData.shipping_cost)
                                                               setShippingPercentRevised(rowData.shipping_percent)
                                                               setShippingPercentageAmountRevised(rowData.shipping_percentage_amount)
                                                               setShippingTotalCostRevised(rowData.shipping_total_cost)
                                                               setOveralTotalRevised(rowData.overall_total)
                                                               setOfferDetailsRevised(rowData.offerDetails)
                                                               getCustomerContacts(watch('customer_id'))
                                                               handleShowRevised()
                                                           }}
                                                        ><i className="fal fa-pen me-2"></i></a>
                                                    </>)
                                                }
                                            })()}

                                            <a className="cursor-pointer" title="quotation/proforma"
                                               onClick={() => {
                                                   setValue("id", rowData.id)
                                                   setValue("user_id", rowData.user_id)
                                                   setValue("offer_code", rowData.offer_code)
                                                   setValue("revised_code", rowData.revised_code)
                                                   setValue("customer_trade_name", rowData.customer_trade_name)
                                                   setValue("authorized_person", (rowData.customer.customerToOfficials).length > 0 ? rowData.customer.customerToOfficials[0].customerOfficial.name + " " + rowData.customer.customerToOfficials[0].customerOfficial.surname : "")
                                                   setValue("authorized_person_phone", (rowData.customer.customerToOfficials).length > 0 ? rowData.customer.customerToOfficials[0].customerOfficial.phone : "")
                                                   setValue("related_person", (rowData.customer.customerToUsers).length > 0 ? rowData.customer.customerToUsers[0].user.name + " " + rowData.customer.customerToUsers[0].user.surname : "")
                                                   setValue("related_person_phone", (rowData.customer.customerToUsers).length > 0 ? rowData.customer.customerToUsers[0].user.phone : "")
                                                   setValue("offer_date", moment(rowData.offer_date).format('DD.MM.YYYY'))
                                                   setValue("payment", rowData.payment)
                                                   setValue("transport", rowData.transport)
                                                   setValue("shipped_by", rowData.shipped_by)
                                                   setValue("delivery_term", rowData.delivery_term)
                                                   setValue("origin", rowData.origin)
                                                   setValue("validity", rowData.validity)
                                                   setValue("currency_unit", rowData.currency_unit)
                                                   setValue("invoice_address_line1", rowData.customerContactsInvoice.address)
                                                   setValue("invoice_address_line2", rowData.customerContactsInvoice.district_name == null ? "-" : rowData.customerContactsInvoice.district_name + "/ " + rowData.customerContactsInvoice.province_name + "/ " + rowData.customerContactsInvoice.country_name)
                                                   setValue("number_of_packages", rowData.number_of_packages)
                                                   setValue("type_of_packaging", rowData.type_of_packaging)
                                                   setValue("subtotal", (parseFloat(rowData.subtotal) + parseFloat(rowData.vat_total)).format(2, 3, '.', ','))
                                                   setValue("shipping_total_cost", parseFloat(rowData.shipping_total_cost).format(2, 3, '.', ','))
                                                   setValue("overall_total", parseFloat(rowData.overall_total).format(2, 3, '.', ','))
                                                   setOfferDetails(rowData.offerDetails)
                                                   setSettingsDetails(settings.settings)
                                                   settings.banks.map((i, index) => {
                                                       if (rowData.bank_id === i.id) {
                                                           setBankDetails(i)
                                                       }
                                                   })
                                                   handleShow()
                                               }}>
                                                <i className="fal fa-file-pdf me-2"></i>
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
            </div>

            <Modal size="xl" show={showDetail} onHide={handleCloseDetail} keyboard={false}
                   aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        İşlem Bekleyen Teklif Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-4 col-12">
                            <div className="row mb-2">
                                <label className="col-sm-5 col-form-label fw-semibold">Firma
                                    Adı:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("customer_trade_name")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Yetkili Kişi Adı:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("authorized_person")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Yetkili Kişi
                                    Telefon:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("authorized_person_phone")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Yetkili Kişi
                                    Email:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("authorized_person_email")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">ilgili Kişi Adı:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("related_person")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">ilgili Kişi
                                    Telefon:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("related_person_phone")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Fatura Adresi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("invoice_address")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Sevkiyat Adresi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("shipment_address")}</p>
                                </div>
                                <label className="col-md-5 col-form-label fw-semibold">Teklif Konusu:</label>
                                <div className="col-md-7">
                                    <p className="col-sm-10 col-form-label">{watch("subject")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-12">
                            <div className="row mb-2">
                                <label className="col-sm-5 col-form-label fw-semibold">Teslim Süresi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("delivery_time")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Vade Süresi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("maturity_time")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Para Birimi:</label>
                                <div className="col-sm-7">
                                    {(() => {
                                        if (watch('currency_unit') == "₺") {
                                            return (
                                                <> <p className="col-sm-12 col-form-label">TL</p></>
                                            )
                                        } else if (watch('currency_unit') == "$") {
                                            return (
                                                <> <p className="col-sm-12 col-form-label">USD</p></>
                                            )
                                        } else if (watch('currency_unit') == "€") {
                                            return (
                                                <> <p className="col-sm-12 col-form-label">EURO</p></>
                                            )
                                        }
                                    })()}
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Sevk Eden:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("shipped_by")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Gönderim Şekli:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("transport")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Paket Sayısı:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("number_of_packages")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Ödeme Yöntemi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("payment")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Ambalaj Türü:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("type_of_packaging")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Teslimat terimi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("delivery_term")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Menşei:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-12 col-form-label">{watch("origin")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-12">
                            <div className="row mb-2">
                                <label className="col-sm-6 col-form-label fw-semibold">Teklif Numarası:</label>
                                <div className="col-sm-6 px-0 d-flex align-items-center">
                                    <p className="col-sm-12 col-form-label">{watch("offer_code")}{watch("revised_code") ? "-" + watch("revised_code") : ""}</p>
                                </div>
                                <label className="col-sm-6 col-form-label fw-semibold">Teklif Tarihi:</label>
                                <div className="col-sm-6 ps-0">
                                    <p className="col-sm-10 col-form-label">{watch("offer_date")}</p>
                                </div>
                                <label className="col-sm-6 col-form-label fw-semibold">Vade Tarihi:</label>
                                <div className="col-sm-6 ps-0">
                                    <p className="col-sm-10 col-form-label">{watch("maturity_date")}</p>
                                </div>
                                <label className="col-sm-6 col-form-label fw-semibold">Son Geçerlilik
                                    Tarihi:</label>
                                <div className="col-sm-6 ps-0">
                                    <p className="col-sm-10 col-form-label">{watch("end_date")}</p>
                                </div>
                            </div>
                        </div>
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
                                <th scope="col">Mevcutluk</th>
                                <th scope="col">KDV Tutarı</th>
                                <th scope="col">İskonto Tutarı</th>
                                <th scope="col">Toplam</th>
                                <th scope="col">Açıklama</th>
                            </tr>
                            </thead>
                            <tbody>
                            {offerDetails.map((i, index) => (
                                <>
                                    <tr key={index + "o"}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{i.product_name}</td>
                                        <td>{Math.abs(i.quantity)}</td>
                                        <td>{parseFloat(i.unit_price).format(2, 3, '.', ',')} {i.currency_unit} ( {i.unit} )</td>
                                        <td>{i.availability}</td>
                                        <td>{parseFloat(i.vat_amount).format(2, 3, '.', ',')} {i.currency_unit} (
                                            %{i.vat} )
                                        </td>
                                        <td>{parseFloat(i.discount_amount).format(2, 3, '.', ',')} {i.currency_unit} ({(i.discount_type === "yuzde") ? "%" + i.discount : parseFloat(i.discount).format(2, 3, '.', ',') + i.currency_unit} ind.)</td>
                                        <td>{parseFloat(i.total).format(2, 3, '.', ',')} {i.currency_unit}</td>
                                        <td>{i.description}</td>
                                    </tr>
                                </>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                                <th colSpan="7" className="text-end">Ara Tutar:</th>
                                <th colSpan="2" className="text-start">{getValues("subtotal")}</th>
                            </tr>
                            <tr>
                                <th colSpan="7" className="text-end">İskonto:</th>
                                <th colSpan="2" className="text-start">{getValues("discount_total")}</th>
                            </tr>
                            <tr>
                                <th colSpan="7" className="text-end">KDV:</th>
                                <th colSpan="2" className="text-start">{getValues("vat_total")}</th>
                            </tr>
                            <tr>
                                <th colSpan="7" className="text-end">Kargo Ücreti:</th>
                                <th colSpan="2" className="text-start">{(getValues("shipping_cost"))}</th>
                            </tr>
                            <tr>
                                <th colSpan="7" className="text-end">Kargo Yüzdesi:</th>
                                <th colSpan="2" className="text-start">% {getValues("shipping_percent")}</th>
                            </tr>
                            <tr>
                                <th colSpan="7" className="text-end">Kargo Toplamı:</th>
                                <th colSpan="2" className="text-start">{getValues("shipping_total_cost")}</th>
                            </tr>
                            <tr>
                                <th colSpan="7" className="text-end">Toplam Tutar:</th>
                                <th colSpan="2" className="text-start">{(getValues("overall_total"))}</th>
                            </tr>

                            </tfoot>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <a className="btn text-success btn-sm border-success text-decoration-none " title="Onayla"
                       onClick={() => {
                           processOffer(watch('id'), 1, watch('offer_code'))
                       }}>
                        <i className="far fa-check-circle me-1 text-success"></i>Onayla
                    </a>
                    <a className="btn text-danger btn-sm border-danger text-decoration-none " title="Reddet"
                       onClick={() => {
                           processOffer(watch('id'), 2, watch('offer_code'))
                       }}>
                        <i className="far fa-ban me-1 text-danger"></i>Reddet
                    </a>
                    <a className="btn text-secondary btn-sm border-secondary text-decoration-none "
                       title="İptal Et" onClick={() => {
                        processOffer(watch('id'), 3, watch('offer_code'))
                    }}>
                        <i className="far fa-times-circle me-1 text-secondary"></i>İptal Et
                    </a>
                    <a className='btn text-secondary btn-sm border-secondary text-decoration-none'
                       onClick={handleCloseDetail}>
                        <i className="far fa-undo me-1 text-secondary small"></i>Vazgeç
                    </a>
                </Modal.Footer>
            </Modal>

            <Modal dialogClassName="my-modal" show={showRevised} onHide={handleCloseRevised} backdrop="static"
                   keyboard={false}
                   aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <label>Teklif
                        Numarası: {getValues("offer_code")}{watch('revised_code') ? "-" + watch('revised_code') : ""}</label>
                </Modal.Header>
                <hr/>
                <form onSubmit={handleSubmit(onSubmit)} id="revised">
                    <Modal.Body>
                        <div className="px-3 mt-2 py-2 bg-white rounded">
                            <div className="row">
                                <div className="col-md-6 col-12">
                                    <div className="row">
                                        <div className="col-12 col-lg-12 mb-2">
                                            <label className="pt-1 pb-1">Firma</label>
                                            <input type="text"
                                                   className={"form-control form-control-sm "}
                                                   readOnly
                                                   {...register("customer_trade_name")} />
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
                                                    <option key={index} value={i.id}
                                                            selected={getValues("invoice_address") === i.id}>{i.address}/{i.district_name}/{i.province_name}/{i.country_name}</option>))}
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
                                                <option value="">Seçiniz...</option>
                                                {customerContacts.map((i, index) => (
                                                    <option key={index} value={i.id}
                                                            selected={getValues("shipment_address") === i.id}>{i.address}/{i.district_name}/{i.province_name}/{i.country_name}</option>))}
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
                                                       className={"form-control form-control-sm " + (errors.shipped_by ? "is-invalid" : "")}
                                                       {...register("shipped_by", {required: true})} />
                                                {errors.shipped_by &&
                                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                            </div>
                                            <div className="col-4 col-lg-4 mb-2">
                                                <label className="pt-1 pb-1">Teslimat Terimi</label>
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
                                                />
                                                {errors.validity &&
                                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
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
                                                        render={({field: {onChange, name, value}}) => (<NumberFormat
                                                            autoComplete="off"
                                                            className={"form-control form-control-sm mb-2 mb-md-0 " + (errors.delivery_time ? "is-invalid" : "")}
                                                            name={name}
                                                            value={value}
                                                            maxLength={3}
                                                            allowNegative={false}
                                                            onChange={onChange}
                                                        />)}
                                                        rules={{required: true}}
                                                    />
                                                    {errors.delivery_time &&
                                                        <div className="invalid-feedback text-start">Bu alan
                                                            zorunlu.</div>}
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
                                                        <div className="invalid-feedback text-start">Bu alan
                                                            zorunlu.</div>}
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
                                                        render={({field: {onChange, name, value}}) => (<NumberFormat
                                                            autoComplete="off"
                                                            className={"form-control form-control-sm mb-2 mb-md-0 " + (errors.maturity_time ? "is-invalid" : "")}
                                                            name={name}
                                                            value={value}
                                                            maxLength={3}
                                                            allowNegative={false}
                                                            onChange={onChange}
                                                        />)}
                                                        rules={{required: true}}
                                                    />
                                                    {errors.maturity_time &&
                                                        <div className="invalid-feedback text-start">Bu alan
                                                            zorunlu.</div>}
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
                                                        <div className="invalid-feedback text-start">Bu alan
                                                            zorunlu.</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-lg-6 mb-2">
                                            <label className="pt-1 pb-1">Ödeme</label>
                                            <span className="registerTitle text-danger fw-bold"> *</span>
                                            <input type="text"
                                                   autoComplete="off"
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
                                                render={({field: {onChange, name, value}}) => (<NumberFormat
                                                    autoComplete="off"
                                                    className={"form-control form-control-sm  " + (errors.number_of_packages ? "is-invalid" : "")}
                                                    name={name}
                                                    value={value}
                                                    maxLength={3}
                                                    allowNegative={false}
                                                    onChange={onChange}
                                                />)}
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
                                                         }) => (<LocalizationProvider dateAdapter={AdapterDateFns}
                                                                                      adapterLocale={trLocale}>
                                                    <DatePicker
                                                        readOnly
                                                        label="Teklif Tarihi"
                                                        name={name}
                                                        value={value}
                                                        minDate={now}
                                                        onChange={onChange}
                                                        renderInput={(params) => <TextField
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
                                                </LocalizationProvider>)}
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
                                                         }) => (<LocalizationProvider dateAdapter={AdapterDateFns}
                                                                                      adapterLocale={trLocale}>
                                                    <DatePicker
                                                        readOnly
                                                        label="Vade Başlangıç Tarihi"
                                                        name={name}
                                                        value={value}
                                                        minDate={now}
                                                        onChange={onChange}
                                                        renderInput={(params) => <TextField
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
                                                </LocalizationProvider>)}
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
                                                         }) => (<LocalizationProvider dateAdapter={AdapterDateFns}
                                                                                      adapterLocale={trLocale}>
                                                    <DatePicker
                                                        readOnly
                                                        label="Son Geçerlilik Tarihi"
                                                        name={name}
                                                        value={value}
                                                        minDate={now}
                                                        onChange={onChange}
                                                        renderInput={(params) => <TextField
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
                                                </LocalizationProvider>)}
                                                rules={{required: false}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-3 mt-2 py-2 bg-white rounded">
                            <div className="row py-4">
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table className="table table-bordered w-100">
                                            <thead className="table-light">
                                            <tr>
                                                <th></th>
                                                <th className="table-th" style={{width: "15%"}}>Ürün</th>
                                                <th className="table-th-number">Miktar</th>
                                                <th className="table-th">Birim</th>
                                                <th className="table-th-number" style={{width: "10%"}}>Birim Fiyat</th>
                                                <th className="table-th text-center" style={{width: "15%"}}>Mevcutluk
                                                </th>
                                                <th className="table-th">KDV %</th>
                                                <th className="table-th-number">KDV Tutarı</th>
                                                <th className="table-th-number">İskonto</th>
                                                <th className="table-th">İsk Tipi</th>
                                                <th className="table-th-number">Toplam</th>
                                                <th className="table-th-number">Açıklama</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {fields.length > 0 ? (fields.map((item, index) => {
                                                range = getValues(`products.${index}.availability`) === "Stock" ? getValues(`products.${index}.availability`) : getValues(`products.${index}.availability`).split(" ")[1]
                                                return (<tr key={index}>
                                                    <td>
                                                        <button className="btn btn-outline-danger" onClick={(e) => {
                                                            handleClick(index)
                                                        }}><i className="fas fa-times"></i>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               readOnly
                                                               {...register(`products.${index}.product_name`)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               autoComplete="off"
                                                               defaultValue={getValues(`products.${index}.quantity`)}
                                                               title={errors?.['products']?.[index]?.['quantity']?.['message']}
                                                               {...register(`products.${index}.quantity`, {
                                                                   required: true, pattern: {
                                                                       value: /^[0-9]+$/,
                                                                       message: "Sadece sayı girişi yapılabilir!"
                                                                   }, maxLength: 20
                                                               })}
                                                               readOnly={(getValues(`products.${index}.product_name`)) ? "" : true}
                                                               className="form-control form-control-sm"
                                                               onChange={(e) => {
                                                                   setQuantity(e.target.value)
                                                                   setValue(`products.${index}.quantity`, e.target.value)
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
                                                                       required: true, pattern: {
                                                                           value: /^[0-9.]+$/,
                                                                           message: "Sadece sayı girişi yapılabilir!"
                                                                       }, maxLength: 20
                                                                   })}
                                                                   placeholder={getValues(`products.${index}.last_unit_price`)}
                                                                   className="form-control form-control-sm"
                                                                   onChange={(e) => {
                                                                       setUnitPrice(e.target.value)
                                                                       setValue(`products.${index}.unit_price`, e.target.value)
                                                                   }}
                                                            />
                                                        </div>
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
                                                                               defaultValue={getValues(`products.${index}.availability`) === "Stock" ? "" : getValues(`products.${index}.availability`).split(" ")[0]}
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
                                                                    }}
                                                                >
                                                                    <option value="">Seçiniz...</option>
                                                                    {getValues(`products.${index}.availability_time`) > 1 ? (
                                                                        <>
                                                                            <option value="Stock"
                                                                                    selected={range == "Stock"}>Stokta
                                                                            </option>
                                                                            <option value="Days"
                                                                                    selected={range == "Days"}>Gün
                                                                            </option>
                                                                            <option value="Weeks"
                                                                                    selected={range == "Weeks"}>Hafta
                                                                            </option>
                                                                            <option value="Months"
                                                                                    selected={range == "Months"}>Ay
                                                                            </option>
                                                                            <option value="Years"
                                                                                    selected={range == "Years"}>Yıl
                                                                            </option>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <option value="Stock"
                                                                                    selected={range == "Stock"}>Stokta
                                                                            </option>
                                                                            <option value="Day"
                                                                                    selected={range == "Day"}>Gün
                                                                            </option>
                                                                            <option value="Week"
                                                                                    selected={range == "Week"}>Hafta
                                                                            </option>
                                                                            <option value="Month"
                                                                                    selected={range == "Month"}>Ay
                                                                            </option>
                                                                            <option value="Year"
                                                                                    selected={range == "Year"}>Yıl
                                                                            </option>
                                                                        </>

                                                                    )
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        {/*{(getValues(`products.${index}.stock`) < getValues(`products.${index}.quantity`)) ? (<div className="row">*/}
                                                        {/*    <div className="col-md-4">*/}
                                                        {/*        <input type="text"*/}
                                                        {/*               autoComplete="off"*/}
                                                        {/*               title={errors?.['products']?.[index]?.['availability_time']?.['message']}*/}
                                                        {/*               {...register(`products.${index}.availability_time`, {*/}
                                                        {/*                   required: true, pattern: {*/}
                                                        {/*                       value: /^[0-9]+$/, message: "Sadece sayı girişi yapılabilir!"*/}
                                                        {/*                   }, maxLength: 20*/}
                                                        {/*               })}*/}
                                                        {/*               className="form-control form-control-sm"*/}
                                                        {/*               onChange={(e) => {*/}
                                                        {/*                   setAvailability(e.target.value)*/}
                                                        {/*                   setValue(`products.${index}.availability_time`, e.target.value)*/}
                                                        {/*               }}*/}
                                                        {/*        />*/}
                                                        {/*    </div>*/}
                                                        {/*    <div className="col-md-8">*/}
                                                        {/*        <select*/}
                                                        {/*            {...register(`products.${index}.availability_range`, {required: true})}*/}
                                                        {/*            className={"form-select form-select-sm " + (errors.availability_range ? "is-invalid" : "")}*/}
                                                        {/*        >*/}
                                                        {/*            <option value="">Seçiniz...</option>*/}
                                                        {/*            {getValues(`products.${index}.availability_time`) > 1 ? (<>*/}
                                                        {/*                <option value="Days">Gün</option>*/}
                                                        {/*                <option value="Weeks">Hafta</option>*/}
                                                        {/*                <option value="Months">Ay</option>*/}
                                                        {/*                <option value="Years">Yıl</option>*/}
                                                        {/*            </>) : (<>*/}
                                                        {/*                    <option value="Day">Gün</option>*/}
                                                        {/*                    <option value="Week">Hafta</option>*/}
                                                        {/*                    <option value="Month">Ay</option>*/}
                                                        {/*                    <option value="Year">Yıl</option>*/}
                                                        {/*                </>*/}

                                                        {/*            )}*/}
                                                        {/*        </select>*/}
                                                        {/*    </div>*/}
                                                        {/*</div>) : (<input type="text"*/}
                                                        {/*                  autoComplete="off"*/}
                                                        {/*                  {...register(`products.${index}.availability`, {*/}
                                                        {/*                      required: false,*/}
                                                        {/*                  })}*/}
                                                        {/*                  readOnly*/}
                                                        {/*                  className="form-control form-control-sm text-center"*/}
                                                        {/*/>)}*/}
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
                                                            <option value="0.00">0</option>
                                                            <option value="1.00">1</option>
                                                            <option value="8.00">8</option>
                                                            <option value="18.00">18</option>
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
                                                                   required: false, pattern: {
                                                                       value: /^[0-9.]+$/,
                                                                       message: "Sadece sayı girişi yapılabilir!"
                                                                   }, maxLength: 20
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
                                                <th colSpan="12" className="text-center">
                                                    <div className="alert alert-ks p-0 fade show mt-3 text-center"
                                                         role="alert">
                                                        <button className="btn btn-outline-danger btn-sm"
                                                                onClick={(e) => {
                                                                    setValue('products', offerDetailsRevised)
                                                                    setValue('subtotal', subtotalRevised)
                                                                    setValue('vat_total', vatTotalRevised)
                                                                    setValue('discount_total', discountTotalRevised)
                                                                    setValue('shipping_cost', shippingCostRevised)
                                                                    setValue('shipping_percent', shippingPercentRevised)
                                                                    setValue('shipping_percentage_amount', shippingPercentageAmountRevised)
                                                                    setValue('shipping_total_cost', shippingTotalCostRevised)
                                                                    setValue('overall_total', overalTotalRevised)
                                                                }}><i className="fas fa-exclamation-circle"></i> Tümünü
                                                            Geri Al!
                                                        </button>
                                                    </div>
                                                </th>
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
                                                               required: true, pattern: {
                                                                   value: /^[0-9.]+$/,
                                                                   message: "Sadece sayı girişi yapılabilir!"
                                                               }, maxLength: 20
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
                                                <th colSpan="10" className="text-end">Kargo Yüzdesi</th>
                                                <td colSpan="1" className="text-start">
                                                    <input type="text"
                                                           autoComplete="off"
                                                           {...register("shipping_percent", {
                                                               required: true, pattern: {
                                                                   value: /^[0-9.]+$/,
                                                                   message: "Sadece sayı girişi yapılabilir!"
                                                               }, maxLength: 20
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
                                                    <input type="text" style={{width: "47%"}}
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

                                    </div>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" value={getValues('bank_id')}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseRevised}>
                            Vazgeç
                        </Button>
                        <Button variant="outline" className="btn-custom-save"
                                type="submit" {...register('id')}>Kaydet</Button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal size="xl" show={show} onHide={handleClose} keyboard={false}
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
                                        <img className="img-fluid" src="/public/assets/img/logo.png" alt="crm"/>
                                    </tr>
                                    <tr>
                                        <th>Committed to Quality...</th>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-8 col-12">
                                <table className="table table-bordered ">
                                    <tbody>
                                    <tr>
                                        <th colSpan="2" className="text-center table-secondary"> QUOTATION / PROFORMA</th>
                                    </tr>
                                    <tr>
                                        <th>DATE</th>
                                        <td>{getValues('offer_date')}</td>
                                    </tr>
                                    <tr>
                                        <th>QUOTATION NO/ PROFORMA NO</th>
                                        <td>{getValues('offer_code')}{getValues('revised_code') ? "-" + getValues('revised_code') : ""}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-12">
                                <div className="table-responsive">
                                    <table className="table table-bordered w-100">
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
                                            <td colSpan="3"
                                                style={{width: "25%"}}>{getValues('customer_trade_name')}</td>
                                            <th colSpan="2" style={{width: "20%"}}>Payment Term</th>
                                            <td colSpan="3">{getValues('payment')}</td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Contact Person</th>
                                            <td colSpan="3">{getValues("authorized_person")}</td>
                                            <th colSpan="2">Shipped by</th>
                                            <td colSpan="3">{getValues('shipped_by')}</td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Address (Line1)</th>
                                            <td colSpan="3">{getValues('invoice_address_line1')}</td>
                                            <th colSpan="2">Delivery Term</th>
                                            <td colSpan="3">{getValues('delivery_term')}</td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Address (Line2)</th>
                                            <td colSpan="3">{getValues('invoice_address_line2')}</td>
                                            <th colSpan="2">Origin</th>
                                            <td colSpan="3">{getValues('origin')}</td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Phone</th>
                                            <td colSpan="3">{getValues("authorized_person_phone")}</td>
                                            <th colSpan="2">Validity</th>
                                            <td colSpan="3">{getValues('validity')}</td>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">Sales Person</th>
                                            <td colSpan="3">{getValues('related_person')}</td>
                                            <th colSpan="2">Currency</th>
                                            <td colSpan="3">
                                                {(() => {
                                                    if (getValues('currency_unit') == "₺") {
                                                        return (
                                                            <>TL</>
                                                        )
                                                    } else if (getValues('currency_unit') == "$") {
                                                        return (
                                                            <>USD</>
                                                        )
                                                    } else if (getValues('currency_unit') == "€") {
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
                                            gross = parseFloat((i.products[0].kilogram) * (i.quantity))
                                            net = parseFloat(gross - ((gross * 10) / 100))
                                            total_gross += gross
                                            total_net += net
                                            return (
                                                <>
                                                    <tr key={index + "p"}>
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
                                            <th colSpan="2">Mode of Transport</th>
                                            <th>Number of Packages</th>
                                            <th colSpan="2" style={{fontSize: "13px"}}>Total Gross Weight</th>
                                            <th colSpan="2">Type pf Packaging</th>
                                            <th colSpan="2" className="text-end">SUBTOTAL</th>
                                            <th>{getValues('currency_unit')} {getValues('subtotal')}</th>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">{getValues('transport')}</td>
                                            <td>{getValues('number_of_packages')}</td>
                                            <td colSpan="2">{total_gross.toFixed(2)} kg</td>
                                            <td colSpan="2">{getValues('type_of_packaging')}</td>
                                            <th colSpan="2" className="text-end table-secondary"
                                                style={{borderTop: "1px solid", borderBottom: "1px solid"}}>SHIPPING
                                                COST
                                            </th>
                                            <th className="table-secondary" style={{
                                                borderTop: "1px solid",
                                                borderBottom: "1px solid"
                                            }}>{getValues('currency_unit')} {getValues('shipping_total_cost')}</th>
                                        </tr>

                                        <tr>
                                            <th colSpan="7"></th>
                                            <th colSpan="2" className="text-end table-secondary">TOTAL</th>
                                            <th className="table-secondary">{getValues('currency_unit')} {getValues('overall_total')}</th>
                                        </tr>
                                        <tr>
                                            <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                        </tr>
                                        <tr className="table-secondary text-center">
                                            <th colSpan="10">{settingsDetails.trade_name}(www.crmlimited.com)</th>
                                        </tr>
                                        <tr style={{height: "100px"}}>
                                            <td colSpan="3" style={{width: "25%"}}>
                                                <div className="row mb-2">
                                                    <label className="col-sm-5 col-form-label fw-bold">Address:</label>
                                                    <p className="col-sm-12 col-form-label">{settingsDetails.address}</p>
                                                    <label className="col-sm-5 col-form-label fw-bold">Phone:</label>
                                                    <p>{settingsDetails.first_phone} / {settingsDetails.second_phone}
                                                        <br/>{settingsDetails.email}</p>
                                                </div>

                                            </td>
                                            <td colSpan="4" style={{width: "45%"}}>
                                                <div className="row">
                                                    <label className="col-sm-4 col-form-label fw-bold">Bank
                                                        Name:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label"
                                                        >{bankDetails.bank_name}</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <label className="col-sm-4 col-form-label fw-bold">Bank
                                                        Branch:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label"
                                                        >{bankDetails.bank_branch}</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <label className="col-sm-4 col-form-label fw-bold">Swift
                                                        Code:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label"
                                                        >{bankDetails.swift_code}</p>
                                                    </div>
                                                </div>
                                                <div className="row ">
                                                    <label className="col-sm-4 col-form-label fw-bold"
                                                           style={{fontSize: "13px"}}>USD IBAN
                                                        NO:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label"
                                                           style={{}}>{bankDetails.usd_iban_no}</p>
                                                    </div>
                                                </div>
                                                <div className="row ">
                                                    <label className="col-sm-4 col-form-label fw-bold"
                                                           style={{fontSize: "13px"}}>EURO IBAN
                                                        NO:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label"
                                                           style={{}}>{bankDetails.euro_iban_no}</p>
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
                    <a className="btn btn-custom-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(getValues('id'), bankDetails, "QUOTATION")}>
                        QUOTATION PDF
                    </a>
                    <a className="btn btn-custom-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(getValues('id'), bankDetails, "PROFORMA")}>
                        PROFORMA PDF
                    </a>
                </Modal.Footer>
            </Modal>

            {/*revize sonrası teklif görünümü*/}
            {offer ? (<Modal size="xl" show={showRevisedQuotation} onHide={handleCloseRevisedQuotation} backdrop="static" keyboard={false}
                             aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <div id="quotation">
                        <div className="row">
                            <div className="col-md-4 col-12">
                                <table>
                                    <tbody>
                                    <tr>
                                        <img className="img-fluid" src="/public/assets/img/logo.png" alt="crm"/>
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
                                            <th colSpan="2" className="text-center table-secondary"> QUOTATION / PROFORMA</th>
                                        </tr>
                                        <tr>
                                            <th>DATE</th>
                                            <td>{moment(offer.offer_date).format('DD.MM.YYYY')}</td>
                                        </tr>
                                        <tr>
                                            <th>QUOTATION NO/ PROFORMA NO</th>
                                            <td>{offer.offer_code}{offer.revised_code ? "-" + offer.revised_code : ""}</td>
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
                                                        return (<>TL</>)
                                                    } else if (offer.currency_unit == "$") {
                                                        return (<>USD</>)
                                                    } else if (offer.currency_unit == "€") {
                                                        return (<>EURO</>)
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
                                            return (<>
                                                <tr key={index + "z"}>
                                                    <th>{index + 1}</th>
                                                    <td>{i.products[0].product_code}</td>
                                                    <td colSpan="3">{i.products[0].product_desc}</td>
                                                    <td>{i.products[0]["brand"].brand_name}</td>
                                                    <td>{i.availability}</td>
                                                    <td>{Math.abs(i.quantity)}</td>
                                                    <td>{i.currency_unit} {((parseFloat(i.unit_price) - (parseFloat(i.discount_amount) / parseFloat(Math.abs(i.quantity)))) + (parseFloat(i.vat_amount) / parseFloat(Math.abs(i.quantity)))).format(2, 3, '.', ',')}</td>
                                                    <td> {i.currency_unit} {parseFloat(i.total).format(2, 3, '.', ',')}</td>
                                                </tr>
                                            </>)
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
                                                borderTop: "1px solid", borderBottom: "1px solid"
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
                                                    <label className="col-sm-5 col-form-label fw-bold">Address:</label>
                                                    <p className="col-sm-12 col-form-label">{settingsDetails.address}</p>
                                                    <label className="col-sm-5 col-form-label fw-bold">Phone:</label>
                                                    <p>{settingsDetails.first_phone} / {settingsDetails.second_phone} <br/>{settingsDetails.email}</p>
                                                </div>
                                            </td>
                                            <td colSpan="4" style={{width: "45%"}}>
                                                <div className="row">
                                                    <label className="col-sm-4 col-form-label fw-bold">Bank Name:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label">{bankDetails.bank_name}</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <label className="col-sm-4 col-form-label fw-bold">Bank Branch:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label">{bankDetails.bank_branch}</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <label className="col-sm-4 col-form-label fw-bold">Swift Code:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label">{bankDetails.swift_code}</p>
                                                    </div>
                                                </div>
                                                <div className="row ">
                                                    <label className="col-sm-4 col-form-label fw-bold" style={{fontSize: "13px"}}>USD IBAN
                                                        NO:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label">{bankDetails.usd_iban_no}</p>
                                                    </div>
                                                </div>
                                                <div className="row ">
                                                    <label className="col-sm-4 col-form-label fw-bold" style={{fontSize: "13px"}}>EURO IBAN
                                                        NO:</label>
                                                    <div className="col-sm-8">
                                                        <p className="col-sm-12 col-form-label">{bankDetails.euro_iban_no}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <th colSpan="3" style={{width: "30%", paddingTop: "5%"}}>
                                                <img className="img-fluid" src={`/public/${settingsDetails.signature}`}
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
                    <Button variant="secondary btn-sm" onClick={handleCloseRevisedQuotation}>
                        Kapat
                    </Button>
                    <a className="btn btn-custom-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(offer.id, bankDetails, "QUOTATION")}>
                        QUOTATION PDF
                    </a>
                    <a className="btn btn-custom-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(offer.id, bankDetails, "PROFORMA")}>
                        PROFORMA PDF
                    </a>
                </Modal.Footer>
            </Modal>) : <></>}
        </div>
    );
}

PendingOffers.auth = true;
export default PendingOffers;
