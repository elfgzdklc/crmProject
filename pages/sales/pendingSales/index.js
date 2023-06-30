import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {Controller, useForm} from 'react-hook-form';
import 'moment/locale/tr';
import {Pagination, Table, CustomProvider} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import moment from "moment";
import alert from "../../../components/alert";
import Title from "../../../components/head";
import {Button, Modal} from "react-bootstrap";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import alertAuthority from "../../../components/alertAuthority";
import pdfDocument from "../../../components/pdf/PdfDocumentCommercialInvoice";
import Swal from "sweetalert2";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import trLocale from "date-fns/locale/tr";
import TextField from "@mui/material/TextField";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const sales = await axios.post(`${path}api/sales/get-pending-sales`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//     return {
//         props: {
//             sales: sales.data,
//         },
//     }
// }

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

function PandingSales(props) {
    const {
        register,
        handleSubmit,
        watch,
        resetField,
        setValue,
        getValues,
        control,
        formState: {errors}
    } = useForm();

    const {data: session} = useSession()
    const router = useRouter();
    const [sales, setSales] = useState([])
    const [sortColumn, setSortColumn] = useState("created_at")
    const [sortType, setSortType] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [offerDetails, setOfferDetails] = useState([]);
    const [salesOnly, setSalesOnly] = useState()
    const [salesDetails, setSalesDetails] = useState([]);
    const [settings, setSettings] = useState()
    const [settingsDetails, setSettingsDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);

    const [offers, setOffers] = useState([])

    var ourDate = new Date();
    var pastDate = ourDate.getDate() - 7;
    ourDate.setDate(pastDate);

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
            if (response.data[0] === undefined || response.data[0].pending_sales === 0) {
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
                getSales();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getSales() {
        setLoading(true);
        await axios({
            method: 'POST',
            url: '/api/sales/get-pending-sales',
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
            setSales(response.data.data)
            setTotal(response.data.total)
            setLoading(false)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getSalesOnly(sales_id) {
        await axios({
            method: 'get',
            url: `/api/sales/get-sales/${sales_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setSalesOnly(response.data)
            setSalesDetails(response.data.salesDetails)
            setSettingsDetails(settings.settings)
            settings.banks.map((i, index) => {
                if (response.data.bank_id === i.id) {
                    setBankDetails(i)
                }
            })
            handleShow()
            handleCloseSales()
            getSales()
            resetField("invoice_no")
            resetField("invoice_date")
            resetField("note")
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/sales/add-sales',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: data,
        }).then(function (res) {
            alert(res.data.title, res.data.message, res.data.status, () => {
                getSalesOnly(res.data.sales)
            })
        }).catch(function (error) {
            console.log(error)
        })
    }
    const handleChangeLimit = dataKey => {
        setPage(1)
        setLimit(dataKey)
    }

    const createPDF = async (sales_id, bankDetails) => {
        await axios({
            method: 'get',
            url: `/api/sales/get-sales/${sales_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            pdfDocument(response.data, settings, bankDetails, `COMMERCIAL-INVOICE-${response.data.invoice_no + "-" + (response.data.created_at).split("T")[0]
            }`).then(() => {
                Swal.close();
            });
        }).catch(function (error) {
            console.log(error)
        })
    }

    const [showSales, setShowSales] = useState(false);
    const handleShowSales = () => setShowSales(true);
    const handleCloseSales = () => setShowSales(false);

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

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

    useEffect(() => {
        getPermissionDetail();
        getSettings()
    }, [page, search, limit, sortColumn, sortType, watch]);

    return (
        <>
            <Title title="Bekleyen Satışlar"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-md-7 p-2">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link
                            underline="none"
                            color="inherit"
                            href="/sales/pendingSales"
                        >
                            Bekleyen Satışlar
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
                            data={sales}
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
                                    {rowData => rowData.currency_unit + " " + parseFloat(rowData.overall_total).format(2, 3, '.', ',')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer"
                                               title="Detay"
                                               onClick={() => {
                                                   setValue("offer_id", rowData.id)
                                                   setValue("bank_id", rowData.bank_id)
                                                   setValue("offer_code", rowData.offer_code)
                                                   setValue("revised_code", rowData.revised_code)
                                                   setValue("customer_id", rowData.customer_id)
                                                   setValue("customer_trade_name", rowData.customer_trade_name)
                                                   setValue("customer_tax_number", rowData.customer.tax_number)
                                                   setValue("customer_tax_administration", rowData.customer.tax_administration)
                                                   setValue("authorized_person", rowData.customer.customerToOfficials[0] ? rowData.customer.customerToOfficials[0].customerOfficial.name + " " + rowData.customer.customerToOfficials[0].customerOfficial.surname : "")
                                                   setValue("authorized_person_phone", rowData.customer.customerToOfficials[0] ? rowData.customer.customerToOfficials[0].customerOfficial.phone : "")
                                                   setValue("authorized_person_email", rowData.customer.customerToOfficials[0] ? rowData.customer.customerToOfficials[0].customerOfficial.email : "")
                                                   setValue("related_person", rowData.customer.customerToUsers[0] ? rowData.customer.customerToUsers[0].user.name + " " + rowData.customer.customerToUsers[0].user.surname : "")
                                                   setValue("related_person_phone", rowData.customer.customerToUsers[0] ? rowData.customer.customerToUsers[0].user.phone : "")
                                                   setValue("offer_date_show", moment(rowData.offer_date).format('DD.MM.YYYY'))
                                                   setValue("maturity_date_show", moment(rowData.maturity_date).format('DD.MM.YYYY'))
                                                   setValue("end_date_show", moment(rowData.end_date).format('DD.MM.YYYY'))
                                                   setValue("offer_date", rowData.offer_date)
                                                   setValue("maturity_date", rowData.maturity_date)
                                                   setValue("end_date", rowData.end_date)
                                                   setValue("invoice_address", rowData.customerContactsInvoiceSales.address + " / " +
                                                       (rowData.customerContactsInvoiceSales.district_name == null ? "-" : rowData.customerContactsInvoiceSales.district_name + " / " + rowData.customerContactsInvoiceSales.province_name + " / " + rowData.customerContactsInvoiceSales.country_name))
                                                   setValue("shipment_address", rowData.customerContactsShipmentSales.address + " / " + (rowData.customerContactsShipmentSales.district_name == null ? "-" : rowData.customerContactsShipmentSales.district_name + " / " + rowData.customerContactsShipmentSales.province_name + " / " + rowData.customerContactsShipmentSales.country_name))
                                                   setValue('invoice_address_id', rowData.invoice_address)
                                                   setValue('shipment_address_id', rowData.shipment_address)
                                                   setValue("currency_unit", rowData.currency_unit)
                                                   setValue("delivery_time", rowData.delivery_time)
                                                   setValue("maturity_time", rowData.maturity_time)
                                                   setValue("subject", rowData.subject)
                                                   setValue("shipped_by", rowData.shipped_by)
                                                   setValue("number_of_packages", rowData.number_of_packages)
                                                   setValue("payment", rowData.payment)
                                                   setValue("transport", rowData.transport)
                                                   setValue("type_of_packaging", rowData.type_of_packaging)
                                                   setValue("delivery_term", rowData.delivery_term)
                                                   setValue("origin", rowData.origin)
                                                   setValue("subtotal", rowData.subtotal)
                                                   setValue("vat_total", rowData.vat_total)
                                                   setValue("discount_total", rowData.discount_total)
                                                   setValue("shipping_cost", rowData.shipping_cost)
                                                   setValue("shipping_percent", rowData.shipping_percent)
                                                   setValue("shipping_total_cost", rowData.shipping_total_cost)
                                                   setValue("overall_total", rowData.overall_total)
                                                   setValue("sales_code", "STS" + new Date().valueOf())
                                                   setOfferDetails(rowData.offerDetails)
                                                   handleShowSales()
                                               }}>
                                                <i className="fal fa-info-circle me-2"></i>
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
            <Modal size="xl" show={showSales} onHide={handleCloseSales} backdrop="static" keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <h5 className="modal-title" id="exampleModalLabel"> Bekleyen Satış Detay </h5>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-4 col-6">
                                <div className="row mb-2">
                                    <label className="col-sm-5 col-form-label fw-semibold">Firma Adı:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("customer_trade_name")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">Firma V.N./V.D.:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("customer_tax_number")}/{watch("customer_tax_administration")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">Yetkili Kişi Adı:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("authorized_person")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">Yetkili Kişi Telefon:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("authorized_person_phone")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">Yetkili Kişi Email:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("authorized_person_email")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">ilgili Kişi Adı:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("related_person")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">ilgili Kişi Telefon:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-10 col-form-label">{watch("related_person_phone")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">Fatura Adresi:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-12 col-form-label">{watch("invoice_address")}</p>
                                    </div>
                                    <label className="col-sm-5 col-form-label fw-semibold">Sevkiyat Adresi:</label>
                                    <div className="col-sm-7">
                                        <p className="col-sm-12 col-form-label">{watch("shipment_address")}</p>
                                    </div>
                                    <label className="col-md-5 col-form-label fw-semibold">Teklif Konusu:</label>
                                    <div className="col-md-7">
                                        <p className="col-sm-12 col-form-label">{watch("subject")}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-6">
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
                            <div className="col-md-4 col-6">
                                <div className="row mb-2">
                                    <label className="col-sm-6 col-form-label fw-semibold">Teklif Numarası:</label>
                                    <div className="col-sm-6">
                                        <p className="col-sm-12 col-form-label pb-0">{watch("offer_code")}{watch("revised_code") ? "-" + watch("revised_code") : ""}</p>
                                    </div>
                                    <label className="col-sm-6 col-form-label fw-semibold">Teklif Tarihi:</label>
                                    <div className="col-sm-6">
                                        <p className="col-sm-12 col-form-label">{watch("offer_date_show")}</p>
                                    </div>
                                    <label className="col-sm-6 col-form-label fw-semibold">Vade Tarihi:</label>
                                    <div className="col-sm-6">
                                        <p className="col-sm-12 col-form-label">{watch("maturity_date_show")}</p>
                                    </div>
                                    <label className="col-sm-6 col-form-label fw-semibold">Son Geçerlilik Tarihi:</label>
                                    <div className="col-sm-6">
                                        <p className="col-sm-12 col-form-label">{watch("end_date_show")}</p>
                                    </div>
                                    <div className="col-12 col-lg-12 pt-3 ">
                                        <Controller
                                            control={control}
                                            name="invoice_date"
                                            render={({
                                                         field: {onChange, name, value},
                                                         fieldState: {error, invalid}
                                                     }) => (
                                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                                    <DatePicker
                                                        label="Fatura Tarihi"
                                                        name={name}
                                                        value={value}
                                                        minDate={ourDate}
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
                                    <label className="col-sm-6 col-form-label fw-semibold">Fatura No
                                    </label>
                                    <div className="col-sm-9">
                                        <input type="text"
                                               autoComplete="off"
                                               className={"form-control form-control-sm " + (errors.invoice_no ? "is-invalid" : "")}
                                               {...register("invoice_no", {required: false})} />
                                        {errors.invoice_no &&
                                            <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                                    </div>
                                    <label className="col-sm-6 col-form-label fw-semibold">Satışa Dair Not</label>
                                    <div className="col-sm-9">
                                        <textarea className="form-control  form-control-sm  w-100"  {...register("note")}></textarea>
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
                                    <th scope="col">Stoktaki Miktar</th>
                                    <th scope="col">Mevcutluk</th>
                                    <th scope="col">Birim Fiyat</th>
                                    <th scope="col">KDV Tutarı</th>
                                    <th scope="col">İskonto Tutarı</th>
                                    <th scope="col">Toplam</th>
                                    <th scope="col">Açıklama</th>
                                </tr>
                                </thead>
                                <tbody>
                                {offerDetails.map((i, index) => (
                                    <>
                                        {setValue(`products.${index}.product_id`, i.product_id)}
                                        {setValue(`products.${index}.product_name`, i.product_name)}
                                        {setValue(`products.${index}.quantity`, i.quantity)}
                                        {setValue(`products.${index}.stock`, i.product.stock)}
                                        {setValue(`products.${index}.availability`, i.availability)}
                                        {setValue(`products.${index}.unit`, i.unit)}
                                        {setValue(`products.${index}.unit_price`, i.unit_price)}
                                        {setValue(`products.${index}.vat_amount`, i.vat_amount)}
                                        {setValue(`products.${index}.discount`, i.discount)}
                                        {setValue(`products.${index}.discount_amount`, i.discount_amount)}
                                        {setValue(`products.${index}.discount_type`, i.discount_type)}
                                        {setValue(`products.${index}.currency_unit`, i.currency_unit)}
                                        {setValue(`products.${index}.vat`, i.vat)}
                                        {setValue(`products.${index}.vat_amount`, i.vat_amount)}
                                        {setValue(`products.${index}.subtotal`, i.subtotal)}
                                        {setValue(`products.${index}.total`, i.total)}
                                        {setValue(`products.${index}.description`, i.description)}
                                        <tr key={index + "j"}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{i.product_name}</td>
                                            <td>{Math.abs(i.quantity)}</td>
                                            {Math.abs(i.quantity) > i.product.stock ? <td className="text-danger">{i.product.stock}</td> :
                                                <td>{i.product.stock}</td>}
                                            <td>{i.availability}</td>
                                            <td>{parseFloat(i.unit_price).format(2, 3, '.', ',')} {i.currency_unit} ( {i.unit} )</td>
                                            <td>{parseFloat(i.vat_amount).format(2, 3, '.', ',')} {i.currency_unit} ( %{i.vat} )</td>
                                            <td>{parseFloat(i.discount_amount).format(2, 3, '.', ',')} {i.currency_unit} ({(i.discount_type === "yuzde") ? "%" + i.discount : parseFloat(i.discount).format(2, 3, '.', ',') + i.currency_unit} ind.)</td>
                                            <td>{parseFloat(i.total).format(2, 3, '.', ',')} {i.currency_unit}</td>
                                            <td>{i.description}</td>
                                        </tr>
                                    </>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <th colSpan="8" className="text-end">Ara Tutar:</th>
                                    <th colSpan="2" className="text-start">{parseFloat(getValues("subtotal")).format(2, 3, '.', ',')}</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" className="text-end">İskonto:</th>
                                    <th colSpan="2" className="text-start">{parseFloat(getValues("discount_total")).format(2, 3, '.', ',')}</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" className="text-end">KDV:</th>
                                    <th colSpan="2" className="text-start">{parseFloat(getValues("vat_total")).format(2, 3, '.', ',')}</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" className="text-end">Kargo Ücreti:</th>
                                    <th colSpan="2" className="text-start">{parseFloat(getValues("shipping_cost")).format(2, 3, '.', ',')}</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" className="text-end">Kargo Yüzdesi:</th>
                                    <th colSpan="2" className="text-start">% {getValues("shipping_percent")}</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" className="text-end">Kargo Toplamı:</th>
                                    <th colSpan="2" className="text-start">{parseFloat(getValues("shipping_total_cost")).format(2, 3, '.', ',')}</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" className="text-end">Toplam Tutar:</th>
                                    <th colSpan="2" className="text-start">{parseFloat(getValues("overall_total")).format(2, 3, '.', ',')}</th>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                        <input type="hidden" value={watch("bank_id")}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary btn-sm" onClick={handleCloseSales}>
                            Kapat
                        </Button>
                        <Button variant="btn btn-tk-save btn-sm" type="submit">Satışı Onayla</Button>
                    </Modal.Footer>
                </form>
            </Modal>
            {/*satış yapıldıktan sonra gelen pdf alma modalı*/}
            {salesOnly ? (
                <Modal size="xl" show={show} onHide={handleClose} backdrop="static" keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="commercial-invoice">
                            <div className="row">
                                <div className="col-md-4 col-12">
                                    <table>
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
                                                <th>Invoice Date</th>
                                                <td>{salesOnly.invoice_date ? moment(salesOnly.invoice_date).format('DD.MM.YYYY') : "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>Invoice No</th>
                                                <td>{salesOnly.invoice_no ? salesOnly.invoice_no : "-"}</td>
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
                                                <th colSpan="10" style={{border: "none"}}><h3 className="text-center">COMMERCIAL INVOICE</h3></th>
                                            </tr>
                                            <tr className="table-secondary">
                                                <th colSpan="5">Company Information</th>
                                                <th colSpan="5">Consignee (Ship to)</th>
                                            </tr>
                                            <tr>
                                                <th colSpan="2" style={{width: "20%"}}>Company Name</th>
                                                <td colSpan="3" style={{width: "25%"}}>{salesOnly.customer_trade_name}</td>
                                                <th colSpan="2" style={{width: "20%"}}>Company Name</th>
                                                <td colSpan="3">{salesOnly.customer_trade_name}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Contact Person</th>
                                                <td colSpan="3">{salesOnly.authorized_person}</td>
                                                <th colSpan="2">Contact Person</th>
                                                <td colSpan="3">{salesOnly.authorized_person}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Address (Line1)</th>
                                                <td colSpan="3">{salesOnly.customerContactsInvoice.address}</td>
                                                <th colSpan="2">Address (Line1)</th>
                                                <td colSpan="3">{salesOnly.customerContactsShipment.address}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Address (Line2)</th>
                                                <td colSpan="3">{salesOnly.customerContactsInvoice.district_name == null ? "-" : salesOnly.customerContactsInvoice.district_name + "/ " + salesOnly.customerContactsInvoice.province_name + "/ " + salesOnly.customerContactsInvoice.country_name}</td>
                                                <th colSpan="2">Address (Line2)</th>
                                                <td colSpan="3">{salesOnly.customerContactsShipment.district_name == null ? "-" : salesOnly.customerContactsShipment.district_name + "/ " + salesOnly.customerContactsShipment.province_name + "/ " + salesOnly.customerContactsShipment.country_name}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="2">Phone</th>
                                                <td colSpan="3">{salesOnly.authorized_person_phone}</td>
                                                <th colSpan="2">Phone</th>
                                                <td colSpan="3">{salesOnly.authorized_person_phone}</td>
                                            </tr>
                                            <tr>
                                                <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                            </tr>
                                            <tr className="table-secondary text-center">
                                                <th>No</th>
                                                <th>Part No</th>
                                                <th colSpan="3" style={{width: "25%"}}>Decription</th>
                                                <th>Origin</th>
                                                <th>Availability</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Total</th>
                                            </tr>
                                            {salesDetails.map((i, index) => {
                                                gross = parseFloat((i.products[0].kilogram) * (Math.abs(i.quantity)))
                                                net = parseFloat(gross - ((gross * 10) / 100))
                                                total_gross += gross
                                                total_net += net
                                                return (
                                                    <>
                                                        <tr key={index + "r"}>
                                                            <th>{index + 1}</th>
                                                            <td>{i.products[0].product_code}</td>
                                                            <td colSpan="3">{i.products[0].product_desc}</td>
                                                            <td>{i.products[0].brand.brand_name}</td>
                                                            <td>{i.availability}</td>
                                                            <td>{Math.abs(i.quantity)}</td>
                                                            <td>{i.currency_unit} {((parseFloat(i.unit_price) - (parseFloat(i.discount_amount) / parseFloat(Math.abs(i.quantity)))) + (parseFloat(i.vat_amount) / parseFloat(Math.abs(i.quantity)))).format(2, 3, '.', ',')}</td>
                                                            <td> {i.currency_unit} {parseFloat(i.total).format(2, 3, '.', ',')}</td>
                                                        </tr>
                                                    </>
                                                )
                                            })}
                                            <tr className="table-secondary">
                                                <th colSpan="2" style={{fontSize: "12px"}}>Type of Transport</th>
                                                <th style={{fontSize: "12px"}}>Number of Packages</th>
                                                <th style={{fontSize: "12px"}}>Gross Weight</th>
                                                <th style={{fontSize: "12px"}}>Net Weight</th>
                                                <th colSpan="2" style={{fontSize: "12px"}}>Type of Packaging</th>
                                                <th colSpan="2" rowSpan="2" className="text-end">SUBTOTAL</th>
                                                <th rowSpan="2">{salesOnly.currency_unit} {parseFloat(salesOnly.subtotal).format(2, 3, '.', ',')}</th>
                                            </tr>
                                            <tr>
                                                <td colSpan="2" style={{fontSize: "12px"}}>{salesOnly.transport}</td>
                                                <td>{salesOnly.number_of_packages}</td>
                                                <td>{total_gross.toFixed(2)} kg</td>
                                                <td>{total_net.toFixed(2)} kg</td>
                                                <td colSpan="2">{salesOnly.type_of_packaging}</td>
                                            </tr>
                                            <tr className="table-secondary">
                                                <th colSpan="2">Payment Term</th>
                                                <th colSpan="2">Delivery Term</th>
                                                <th colSpan="3">Country of Origin</th>
                                                <th colSpan="2" rowSpan="2" className="text-end"
                                                    style={{borderTop: "1px solid", borderBottom: "1px solid"}}>SHIPPING
                                                    COST
                                                </th>
                                                <th rowSpan="2" style={{
                                                    borderTop: "1px solid",
                                                    borderBottom: "1px solid"
                                                }}>{salesOnly.currency_unit} {parseFloat(salesOnly.shipping_total_cost).format(2, 3, '.', ',')}</th>
                                            </tr>
                                            <tr>
                                                <td colSpan="2" style={{fontSize: "12px"}}>{salesOnly.payment}</td>
                                                <td colSpan="2">{salesOnly.delivery_term}</td>
                                                <td colSpan="3">{salesOnly.origin}</td>
                                            </tr>
                                            <tr className="table-secondary">
                                                <th colSpan="7"></th>
                                                <th colSpan="2" className="text-end">GRAND TOTAL</th>
                                                <th>{salesOnly.currency_unit} {parseFloat(salesOnly.overall_total).format(2, 3, '.', ',')}</th>
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
                        <Button variant="secondary btn-sm" onClick={handleClose}>
                            Kapat
                        </Button>
                        <a className="btn btn-tk-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(salesOnly.id, bankDetails)}>
                            PDF
                        </a>
                    </Modal.Footer>
                </Modal>
            ) : <></>
            }

        </>
    )
}

PandingSales.auth = true;
export default PandingSales;