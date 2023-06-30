import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useFieldArray, useForm} from 'react-hook-form';
import 'moment/locale/tr';
import {Pagination, Table, CustomProvider} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import moment from "moment";
import Title from "../../../components/head";
import {Button, Modal} from "react-bootstrap";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import alertAuthority from "../../../components/alertAuthority";
import pdfDocumentCommercialInvoice from "../../../components/pdf/PdfDocumentCommercialInvoice";
import pdfDocumentPackingList from "../../../components/pdf/PdfDocumentPackingList";
import Swal from "sweetalert2";
import alert from "../../../components/alert";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const sales = await axios.post(`${path}api/sales/get-realized-sales`, {
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

function RealizedSalaes(props) {

    const {register, handleSubmit, watch, setValue, getValues, resetField, control, formState: {errors}} = useForm();
    const {fields, remove} = useFieldArray({control, name: "products"});
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
    const [salesDetails, setSalesDetails] = useState([]);
    const [settings, setSettings] = useState()
    const [settingsDetails, setSettingsDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);

    let gross = 0;
    let net = 0;
    let sumQuantity = "";
    let arrQuantity = [];
    let total_gross = 0;
    let total_net = 0;
    let total_grossP = 0;
    let total_netP = 0;
    //para formatı
    Number.prototype.format = function (n, x, s, c) {
        let re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')', num = this.toFixed(Math.max(0, ~~n));
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
            if (response.data[0] === undefined || response.data[0].realized_sales === 0) {
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
            url: '/api/sales/get-realized-sales',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                limit: limit, page: page, sortColumn: sortColumn, sortType: sortType, search: search
            }),
        }).then(function (response) {
            setSales(response.data.data)
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
    const createPDF = async (sales_id, file_name) => {
        await axios({
            method: 'get',
            url: `/api/sales/get-sales/${sales_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            if (file_name == "COMMERCIAL-INVOICE-") {
                pdfDocumentCommercialInvoice(response.data, settings, bankDetails, `${file_name}${response.data.invoice_no + "-" + (response.data.created_at).split("T")[0]}`).then(() => {
                    Swal.close();
                });
            } else if (file_name == "PACKING-LIST-") {
                pdfDocumentPackingList(response.data, settings, bankDetails, `${file_name}${response.data.invoice_no + "-" + (response.data.created_at).split("T")[0]}`).then(() => {
                    Swal.close();
                });
            }

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

    const [showPackingCreate, setShowPackingCreate] = useState(false);
    const handleShowPackingCreate = () => setShowPackingCreate(true);
    const handleClosePackingCreate = () => {
        resetField('container_no', "")
        resetField('vessel_name', "")
        resetField('delivery_type', "")
        setShowPackingCreate(false);
    }

    const [showPackingList, setShowPackingList] = useState(false);
    const handleShowPackingList = () => setShowPackingList(true);
    const handleClosePackingList = () => setShowPackingList(false);

    async function getSalesOnly(sales_id) {
        await axios({
            method: 'get',
            url: `/api/sales/get-sales/${sales_id}`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (response) {
            setValue('container_no', response.data.container_no)
            setValue('vessel_name', response.data.vessel_name)
            setValue('delivery_type', response.data.delivery_type)
            setSalesDetails(response.data.salesDetails)
            handleShowPackingList()
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/sales/add-packing-list',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: data,
        }).then(function (res) {
            alert(res.data.title, res.data.message, res.data.status, () => {
                if (res.data.status === "success") {
                    handleClosePackingCreate()
                    getSales()
                    if (res.data.status === "success") {
                        getSalesOnly(res.data.sales)
                    }
                }
            })
        }).catch(function (error) {
            console.log(error)
        })

    }

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
        getSettings();
    }, [page, search, limit, sortColumn, sortType, watch]);

    return (<>
        <Title title="Gerçekleşen Satışlar"/>
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
                        Gerçekleşen Satışlar
                    </Link>
                </Breadcrumbs>
            </div>
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
                            <Table.HeaderCell>Fatura Numarası</Table.HeaderCell>
                            <Table.Cell dataKey="invoice_no"/>
                        </Table.Column>
                        <Table.Column sortable={true} width={150} resizable>
                            <Table.HeaderCell>Satış Kodu</Table.HeaderCell>
                            <Table.Cell dataKey="sales_code"/>
                        </Table.Column>
                        <Table.Column sortable={true} width={300} resizable>
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
                            <Table.HeaderCell>Satış Tarihi</Table.HeaderCell>
                            <Table.Cell dataKey="end_date">
                                {rowData => moment(rowData.created_at).format('DD.MM.YYYY')}
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
                                {rowData => (<>
                                    <a className="cursor-pointer" title="Detay"
                                       onClick={() => {
                                           setValue("sales_id", rowData.id)
                                           setValue("offer_code", rowData.offer_code)
                                           setValue("revised_code", rowData.revised_code)
                                           setValue("customer_id", rowData.customer_id)
                                           setValue("customer_trade_name", rowData.customer_trade_name)
                                           setValue("customer_tax_number", rowData.customer.tax_number)
                                           setValue("customer_tax_administration", rowData.customer.tax_administration)
                                           setValue("authorized_person", rowData.authorized_person)
                                           setValue("authorized_person_phone", rowData.authorized_person_phone)
                                           setValue("authorized_person_email", rowData.authorized_person_email)
                                           setValue("related_person", (rowData.customer.customerToUsers).length > 0 ? rowData.customer.customerToUsers[0].user.name + " " + rowData.customer.customerToUsers[0].user.surname : "")
                                           setValue("related_person_phone", (rowData.customer.customerToUsers).length > 0 ? rowData.customer.customerToUsers[0].user.phone : "")
                                           setValue("offer_date_show", moment(rowData.offer_date).format('DD.MM.YYYY'))
                                           setValue("maturity_date_show", moment(rowData.maturity_date).format('DD.MM.YYYY'))
                                           setValue("note", rowData.note)
                                           setValue("offer_date", rowData.offer_date)
                                           setValue("maturity_date", rowData.maturity_date)
                                           setValue("end_date", rowData.end_date)
                                           setValue("invoice_address", rowData.customerContactsInvoice.address + " / " + (rowData.customerContactsInvoice.district_name == null ? "-" : rowData.customerContactsInvoice.district_name + " / " + rowData.customerContactsInvoice.province_name + " / " + rowData.customerContactsInvoice.country_name))
                                           setValue("shipment_address", rowData.customerContactsShipment.address + " / " + (rowData.customerContactsShipment.district_name == null ? "-" : rowData.customerContactsShipment.district_name + " / " + rowData.customerContactsShipment.province_name + " / " + rowData.customerContactsShipment.country_name))
                                           setValue("delivery_time", rowData.delivery_time)
                                           setValue("maturity_time", rowData.maturity_time)
                                           setValue("currency_unit", rowData.currency_unit)
                                           setValue("subject", rowData.subject)
                                           setValue("subtotal", rowData.subtotal)
                                           setValue("vat_total", rowData.vat_total)
                                           setValue("discount_total", rowData.discount_total)
                                           setValue("shipping_cost", rowData.shipping_cost)
                                           setValue("shipping_percent", rowData.shipping_percent)
                                           setValue("shipping_total_cost", rowData.shipping_total_cost)
                                           setValue("overall_total", rowData.overall_total)
                                           setValue("status", rowData.status)
                                           setValue("sales_date", moment(rowData.created_at).format('DD.MM.YYYY'))
                                           setValue("sales_code", rowData.sales_code)
                                           setValue("invoice_no", rowData.invoice_no)
                                           setValue("invoice_date", rowData.invoice_date)
                                           setValue("payment", rowData.payment)
                                           setValue("shipped_by", rowData.shipped_by)
                                           setValue("transport", rowData.transport)
                                           setValue("delivery_term", rowData.delivery_term)
                                           setValue("origin", rowData.origin)
                                           setValue("number_of_packages", rowData.number_of_packages)
                                           setValue("type_of_packaging", rowData.type_of_packaging)
                                           setSalesDetails(rowData.salesDetails)
                                           handleShowDetail()
                                       }}>
                                        <i className="fal fa-info-circle me-2"></i>
                                    </a>
                                    <a className="cursor-pointer" title="commercial-invoice"
                                       onClick={() => {
                                           setValue("id", rowData.id)
                                           setValue("bank_id", rowData.bank_id)
                                           setValue("user_id", rowData.user_id)
                                           setValue("offer_code", rowData.offer_code)
                                           setValue("revised_code", rowData.revised_code)
                                           setValue("customer_trade_name", rowData.customer_trade_name)
                                           setValue("authorized_person", rowData.authorized_person)
                                           setValue("authorized_person_phone", rowData.authorized_person_phone)
                                           setValue("offer_date", moment(rowData.offer_date).format('DD.MM.YYYY'))
                                           setValue("invoice_address_line1", rowData.customerContactsInvoice.address)
                                           setValue("invoice_address_line2", rowData.customerContactsInvoice.district_name == null ? "-" : rowData.customerContactsInvoice.district_name + " / " + rowData.customerContactsInvoice.province_name + " / " + rowData.customerContactsInvoice.country_name)
                                           setValue("shipment_address_line1", rowData.customerContactsShipment.address)
                                           setValue("shipment_address_line2", rowData.customerContactsShipment.district_name == null ? "-" : rowData.customerContactsShipment.district_name + " / " + rowData.customerContactsShipment.province_name + " / " + rowData.customerContactsShipment.country_name)
                                           setValue("sales_date", moment(rowData.created_at).format('DD.MM.YYYY'))
                                           setValue("invoice_no", rowData.invoice_no)
                                           setValue("invoice_date", rowData.invoice_date)
                                           setValue("payment", rowData.payment)
                                           setValue("transport", rowData.transport)
                                           setValue("shipped_by", rowData.shipped_by)
                                           setValue("delivery_term", rowData.delivery_term)
                                           setValue("origin", rowData.origin)
                                           setValue("number_of_packages", rowData.number_of_packages)
                                           setValue("type_of_packaging", rowData.type_of_packaging)
                                           setValue("subtotal", parseFloat(rowData.subtotal).format(2, 3, '.', ','))
                                           setValue("shipping_total_cost", parseFloat(rowData.shipping_total_cost).format(2, 3, '.', ','))
                                           setValue("overall_total", parseFloat(rowData.overall_total).format(2, 3, '.', ','))
                                           setValue("currency_unit", rowData.currency_unit)
                                           setValue("maturity_time", rowData.maturity_time)
                                           setValue("subject", rowData.subject)
                                           setValue("discount_total", rowData.discount_total)
                                           setValue("shipping_cost", rowData.shipping_cost)
                                           setValue("shipping_percent", rowData.shipping_percent)
                                           setValue("status", rowData.status)
                                           setSalesDetails(rowData.salesDetails)
                                           setSettingsDetails(settings.settings)
                                           settings.banks.map((i, index) => {
                                               console.log(rowData.bank_id)
                                               if (rowData.bank_id === i.id) {
                                                   setBankDetails(i)
                                               }
                                           })
                                           handleShow()
                                       }}>
                                        <i className="fal fa-file-pdf me-2"></i>
                                    </a>
                                    <a className="cursor-pointer"
                                       title="packing-list"
                                       onClick={() => {
                                           setValue("id", rowData.id)
                                           setValue("user_id", rowData.user_id)
                                           setValue("customer_trade_name", rowData.customer_trade_name)
                                           setValue("authorized_person", rowData.authorized_person)
                                           setValue("authorized_person_phone", rowData.authorized_person_phone)
                                           setValue("invoice_address_line1", rowData.customerContactsInvoice.address)
                                           setValue("invoice_address_line2", rowData.customerContactsInvoice.district_name == null ? "-" : rowData.customerContactsInvoice.district_name + " / " + rowData.customerContactsInvoice.province_name + " / " + rowData.customerContactsInvoice.country_name)
                                           setValue("shipment_address_line1", rowData.customerContactsShipment.address)
                                           setValue("shipment_address_line2", rowData.customerContactsShipment.district_name == null ? "-" : rowData.customerContactsShipment.district_name + " / " + rowData.customerContactsShipment.province_name + " / " + rowData.customerContactsShipment.country_name)
                                           setValue("created_at", moment(rowData.created_at).format('DD.MM.YYYY'))
                                           setValue("invoice_no", rowData.invoice_no)
                                           setValue("invoice_date", rowData.invoice_date)
                                           setValue("payment", rowData.payment)
                                           setValue("transport", rowData.transport)
                                           setValue("shipped_by", rowData.shipped_by)
                                           setValue("delivery_term", rowData.delivery_term)
                                           setValue("number_of_packages", rowData.number_of_packages)
                                           setValue("type_of_packaging", rowData.type_of_packaging)
                                           setValue("container_no", rowData.container_no)
                                           setValue("vessel_name", rowData.vessel_name)
                                           setValue("delivery_type", rowData.delivery_type)
                                           setValue("status", rowData.status)
                                           setSalesDetails(rowData.salesDetails)
                                           setSettingsDetails(settings.settings)
                                           settings.banks.map((i, index) => {
                                               if (rowData.bank_id === i.id) {
                                                   setBankDetails(i)
                                               }
                                           })
                                           handleShowPackingList()
                                       }}>
                                        <i className="fal fa-file-pdf me-2"></i>
                                    </a>
                                </>)}
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

        <Modal size="xl" show={showDetail} onHide={handleCloseDetail} keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
            <Modal.Header closeButton>
                <p className="modal-title fs-6 fw-semibold" id="exampleModalLabel">
                    Gerçekleşen Satış Detay
                </p>
            </Modal.Header>
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
                                        return (<> <p className="col-sm-12 col-form-label">TL</p></>)
                                    } else if (watch('currency_unit') == "$") {
                                        return (<> <p className="col-sm-12 col-form-label">USD</p></>)
                                    } else if (watch('currency_unit') == "€") {
                                        return (<> <p className="col-sm-12 col-form-label">EURO</p></>)
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
                            <label className="col-sm-5 col-form-label fw-semibold">Satış Numarası:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("sales_code")}</p>
                            </div>
                            <label className="col-sm-5 col-form-label fw-semibold">Fatura Numarası:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("invoice_no")}</p>
                            </div>
                            <label className="col-sm-5 col-form-label fw-semibold">Teklif Numarası:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("offer_code")}{watch("revised_code") ? "-" + watch("revised_code") : ""}</p>
                            </div>
                            <label className="col-sm-5 col-form-label fw-semibold">Satış Tarihi:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("sales_date")}</p>
                            </div>
                            <label className="col-sm-5 col-form-label fw-semibold">Teklif Tarihi:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("offer_date_show")}</p>
                            </div>
                            <label className="col-sm-5 col-form-label fw-semibold">Vade Tarihi:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("maturity_date_show")}</p>
                            </div>
                            <label className="col-sm-5 col-form-label fw-semibold">Satışa Dair Not:</label>
                            <div className="col-sm-7">
                                <p className="col-sm-12 col-form-label">{watch("note")}</p>
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
                        {salesDetails.map((i, index) => (<>
                            <tr>
                                <th scope="row">{index + 1}</th>
                                <td key={index}>{i.product_name}</td>
                                <td key={index}>{Math.abs(i.quantity)}</td>
                                <td key={index}>{i.products[0].stock}</td>
                                <td key={index}>{i.availability}</td>
                                <td key={index}>{parseFloat(i.unit_price).format(2, 3, '.', ',')} {i.currency_unit} ( {i.unit} )</td>
                                <td key={index}>{parseFloat(i.vat_amount).format(2, 3, '.', ',')} {i.currency_unit} ( %{i.vat} )</td>
                                <td key={index}>{parseFloat(i.discount_amount).format(2, 3, '.', ',')} {i.currency_unit} ({(i.discount_type === "yuzde") ? "%" + i.discount : parseFloat(i.discount).format(2, 3, '.', ',') + i.currency_unit} ind.)</td>
                                <td key={index}>{parseFloat(i.total).format(2, 3, '.', ',')} {i.currency_unit}</td>
                                <td key={index}>{i.description}</td>
                            </tr>
                        </>))}
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary btn-sm" onClick={handleCloseDetail}>
                    Kapat
                </Button>
                <button type="button" className="p-2 btn-sm">
                    <i className="fal fa-check-circle"></i> Satış Yapıldı
                </button>
            </Modal.Footer>
        </Modal>
        <Modal size="xl" show={show} onHide={handleClose} keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body>
                <div id="commercial-invoice">
                    <div className="row px-3">
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
                                        <td>{getValues('invoice_date') ? moment(getValues('invoice_date')).format('DD.MM.YYYY') : "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>Invoice No</th>
                                        <td>{getValues('invoice_no') ? getValues('invoice_no') : "-"}</td>
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
                                        <td colSpan="3" style={{width: "25%"}}>{getValues('customer_trade_name')}</td>
                                        <th colSpan="2" style={{width: "20%"}}>Company Name</th>
                                        <td colSpan="3">{getValues('customer_trade_name')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Contact Person</th>
                                        <td colSpan="3">{getValues("authorized_person")}</td>
                                        <th colSpan="2">Contact Person</th>
                                        <td colSpan="3">{getValues("authorized_person")}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Address (Line1)</th>
                                        <td colSpan="3">{getValues('invoice_address_line1')}</td>
                                        <th colSpan="2">Address (Line1)</th>
                                        <td colSpan="3">{getValues('shipment_address_line1')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Address (Line2)</th>
                                        <td colSpan="3">{getValues('invoice_address_line2')}</td>
                                        <th colSpan="2">Address (Line2)</th>
                                        <td colSpan="3">{getValues('shipment_address_line2')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Phone</th>
                                        <td colSpan="3">{getValues("authorized_person_phone")}</td>
                                        <th colSpan="2">Phone</th>
                                        <td colSpan="3">{getValues("authorized_person_phone")}</td>
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
                                        return (<>
                                            <tr>
                                                <th>{index + 1}</th>
                                                <td>{i.products[0].product_code}</td>
                                                <td colSpan="3">{i.products[0].product_desc}</td>
                                                <td>{i.products[0].brand.brand_name}</td>
                                                <td>{i.availability}</td>
                                                <td>{Math.abs(i.quantity)}</td>
                                                <td>{i.currency_unit} {((parseFloat(i.unit_price) - (parseFloat(i.discount_amount) / parseFloat(Math.abs(i.quantity)))) + (parseFloat(i.vat_amount) / parseFloat(Math.abs(i.quantity)))).format(2, 3, '.', ',')}</td>
                                                <td> {i.currency_unit} {parseFloat(i.total).format(2, 3, '.', ',')}</td>
                                            </tr>
                                        </>)
                                    })}
                                    <tr className="table-secondary">
                                        <th colSpan="2" style={{fontSize: "12px"}}>Type of Transport</th>
                                        <th style={{fontSize: "12px"}}>Number of Packages</th>
                                        <th style={{fontSize: "12px"}}>Gross Weight</th>
                                        <th style={{fontSize: "12px"}}>Net Weight</th>
                                        <th colSpan="2">Type of Packaging</th>
                                        <th colSpan="2" className="text-end">SUBTOTAL</th>
                                        <th>{getValues('currency_unit')} {getValues('subtotal')}</th>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{fontSize: "12px"}}>{getValues('transport')}</td>
                                        <td>{getValues('number_of_packages')}</td>
                                        <td>{total_gross.toFixed(2)} kg</td>
                                        <td>{total_net.toFixed(2)} kg</td>
                                        <td colSpan="2">{getValues('type_of_packaging')}</td>
                                        <th colSpan="2" className="text-end table-secondary"
                                            style={{borderTop: "1px solid", borderBottom: "1px solid"}}>SHIPPING
                                            COST
                                        </th>
                                        <th style={{
                                            borderTop: "1px solid", borderBottom: "1px solid"
                                        }} className="table-secondary">{getValues('currency_unit')} {getValues('shipping_total_cost')}</th>
                                    </tr>
                                    <tr className="table-secondary">
                                        <th colSpan="2">Payment Term</th>
                                        <th colSpan="2">Delivery Term</th>
                                        <th colSpan="3">Country of Origin</th>
                                        <th colSpan="2" className="text-end">GRAND TOTAL</th>
                                        <th>{getValues('currency_unit')} {getValues('overall_total')}</th>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{fontSize: "12px"}}>{getValues('payment')}</td>
                                        <td colSpan="2">{getValues('delivery_term')}</td>
                                        <td colSpan="3">{getValues('origin')}</td>
                                        <td className="table-secondary" colSpan="3"></td>

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
                                                    <p className="col-sm-12 col-form-label"
                                                    >{bankDetails.euro_iban_no}</p>
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
                <a className="btn btn-tk-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(getValues('id'), "COMMERCIAL-INVOICE-")}>
                    PDF
                </a>
            </Modal.Footer>
        </Modal>
        <Modal size="xl" show={showPackingCreate} onHide={handleShowPackingCreate} backdrop="static" keyboard={false}
               aria-labelledby="example-modal-sizes-title-xl">
            <form onSubmit={handleSubmit(onSubmit)} id="revised">
                <Modal.Header closeButton>
                    <label>Fatura Numarası: {getValues("invoice_no")}</label>
                </Modal.Header>
                <hr/>
                <Modal.Body>
                    <div className="px-3 mt-2 py-2 bg-white rounded">
                        <div className="row py-4">
                            <div className="col-12">
                                <div className="table-responsive">
                                    <table className="table table-bordered w-100">
                                        <thead className="table-light">
                                        <tr>
                                            <th>No</th>
                                            <th className="table-th">Part No</th>
                                            <th className="table-th">Description</th>
                                            <th className="table-th-number">Origin</th>
                                            <th className="table-th">Packaging</th>
                                            <th className="table-th" style={{width: "1%"}}>Quantitiy</th>
                                            <th className="table-th text-center" style={{width: "13%"}}>Gross Weight Kg</th>
                                            <th className="table-th text-center" style={{width: "1%"}}>Net Weight Kg</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {fields.map((item, index) => {
                                            gross = parseFloat((item.products[0].kilogram) * (Math.abs(item.quantity)))
                                            net = parseFloat(gross - ((gross * 10) / 100))
                                            total_gross += gross
                                            total_net += net
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               readOnly
                                                               value={item.products[0].product_code}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               readOnly
                                                               value={item.products[0].product_desc}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               readOnly
                                                               value={item.products[0].brand.brand_name}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               autoComplete="off"
                                                               {...register(`products.${index}.packaging`)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               autoComplete="off"
                                                               readOnly
                                                               value={Math.abs(item.quantity)}/>
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               autoComplete="off"
                                                               readOnly
                                                               value={gross.toFixed(2)}/>
                                                    </td>
                                                    <td>
                                                        <input type="text"
                                                               className={"form-control form-control-sm "}
                                                               autoComplete="off"
                                                               readOnly
                                                               value={net.toFixed(2)}/>
                                                    </td>
                                                </tr>)
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <label className="col-sm-6 col-form-label">Container No</label>
                                        <input type="text"
                                               autoComplete="off"
                                               className="form-control form-control-sm "
                                               {...register("container_no")} />
                                    </div>
                                    <div className="col-sm-4">
                                        <label className="col-sm-6 col-form-label">Vessel Name</label>
                                        <input type="text"
                                               autoComplete="off"
                                               className="form-control form-control-sm "
                                               {...register("vessel_name")} />
                                    </div>
                                    <div className="col-sm-4">
                                        <label className="col-sm-6 col-form-label">Delivery Type</label>
                                        <input type="text"
                                               autoComplete="off"
                                               className="form-control form-control-sm "
                                               {...register("delivery_type")} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary btn-sm" onClick={handleClosePackingCreate}> Kapat </Button>
                    <Button variant="outline" className="btn-tk-save btn-sm" type="submit" {...register('id')}>Kaydet</Button>
                </Modal.Footer>
            </form>
        </Modal>
        <Modal size="xl" show={showPackingList} onHide={handleClosePackingList} keyboard={false}
               aria-labelledby="example-modal-sizes-title-xl">
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body>
                <div id="packing-list">
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
                                        <td>{getValues('invoice_date') ? moment(getValues('invoice_date')).format('DD.MM.YYYY') : "-"}</td>
                                    </tr>
                                    <tr>
                                        <th>Invoice No</th>
                                        <td>{getValues('invoice_no') ? getValues('invoice_no') : "-"}</td>
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
                                        <th colSpan="10" style={{border: "none"}}><h3 className="text-center">PACKING LIST</h3></th>
                                    </tr>
                                    <tr className="table-secondary">
                                        <th colSpan="5">Company Information</th>
                                        <th colSpan="5">Consignee (Ship to)</th>
                                    </tr>
                                    <tr>
                                        <th colSpan="2" style={{width: "16%"}}>Company Name</th>
                                        <td colSpan="3">{getValues('customer_trade_name')}</td>
                                        <th colSpan="2" style={{width: "16%"}}>Company Name</th>
                                        <td colSpan="3">{getValues('customer_trade_name')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Contact Person</th>
                                        <td colSpan="3">{getValues('authorized_person')}</td>
                                        <th colSpan="2">Contact Person</th>
                                        <td colSpan="3">{getValues('authorized_person')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Address (Line1)</th>
                                        <td colSpan="3">{getValues('invoice_address_line1')}</td>
                                        <th colSpan="2">Address (Line1)</th>
                                        <td colSpan="3">{getValues('shipment_address_line1')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Address (Line2)</th>
                                        <td colSpan="3">{getValues('invoice_address_line2')}</td>
                                        <th colSpan="2">Address (Line2)</th>
                                        <td colSpan="3">{getValues('shipment_address_line2')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Phone</th>
                                        <td colSpan="3">{getValues('authorized_person_phone')}</td>
                                        <th colSpan="2">Phone</th>
                                        <td colSpan="3">{getValues('authorized_person_phone')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                    </tr>
                                    <tr className="table-secondary text-center">
                                        <th>No</th>
                                        <th>Part No</th>
                                        <th colSpan="3" style={{width: "25%"}}>Decription</th>
                                        <th>Origin</th>
                                        <th>Packaging</th>
                                        <th>Quantity</th>
                                        <th style={{fontSize: "12px"}}>Gross Weight Kg</th>
                                        <th style={{fontSize: "12px"}}>Net Weight Kg</th>
                                    </tr>
                                    {salesDetails.map((i, index) => {
                                        arrQuantity.push(Math.abs(i.quantity))
                                        sumQuantity = arrQuantity.reduce((partialSum, a) => partialSum + a, 0)
                                        gross = parseFloat((i.products[0].kilogram) * (i.quantity))
                                        net = parseFloat(gross - ((gross * 10) / 100))
                                        total_grossP += gross
                                        total_netP += net
                                        return (<>
                                            <tr>
                                                <th>{index + 1}</th>
                                                <td>{i.products[0].product_code}</td>
                                                <td colSpan="3">{i.products[0].product_desc}</td>
                                                <td>{i.products[0]["brand"].brand_name}</td>
                                                <td>{i.packaging}</td>
                                                <td>{Math.abs(i.quantity)}</td>
                                                <td>{Math.abs(gross).toFixed(2)}</td>
                                                <td>{Math.abs(net).toFixed(2)}</td>
                                            </tr>
                                        </>)
                                    })}
                                    <tr className="table-secondary">
                                        <th colSpan="7" className="text-end">TOTAL</th>
                                        <th>{sumQuantity}</th>
                                        <th>{total_gross.toFixed(2)}</th>
                                        <th>{total_net.toFixed(2)}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                    </tr>
                                    <tr className="table-secondary text-center">
                                        <th colSpan="2">Container No</th>
                                        <th colSpan="">Vessel Name</th>
                                        <th colSpan="2">Carrier</th>
                                        <th colSpan="2">Delivery Type</th>
                                        <th colSpan="3">Delivery Term</th>
                                    </tr>
                                    <tr className="text-center">
                                        <td colSpan="2">{getValues('container_no')}</td>
                                        <td colSpan="">{getValues('vessel_name')}</td>
                                        <td colSpan="2">{getValues('shipped_by')}</td>
                                        <td colSpan="2">{getValues('delivery_type')}</td>
                                        <td colSpan="3">{getValues('delivery_term')}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="10" style={{color: "#ffffff"}}>|</th>
                                    </tr>
                                    <tr className="table-secondary text-center">
                                        <th colSpan="10">{settingsDetails.trade_name} (www.crmlimited.com)</th>
                                    </tr>
                                    <tr style={{height: "100px", textAlign: "center"}}>
                                        <td colSpan="6">
                                            <div className="row mb-2">
                                                <p className="col-sm-12 col-form-label">Address:</p><br/>
                                                <p className="col-sm-12 col-form-label">{settingsDetails.address} <br/> Phone: <br/>
                                                    {settingsDetails.first_phone} / {settingsDetails.second_phone} <br/>{settingsDetails.email}</p>
                                            </div>

                                        </td>
                                        <th colSpan="4" style={{paddingTop: "2%"}}>
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
                <Button variant="secondary btn-sm" onClick={handleClosePackingList}>
                    Kapat
                </Button>
                <Button variant="secondary btn-sm" onClick={() => {
                    handleClosePackingList()
                    setValue("id", getValues('id'))
                    setValue("user_id", getValues('user_id'))
                    setValue("invoice_no", getValues('invoice_no'))
                    setValue('products', salesDetails)
                    handleShowPackingCreate()
                }}
                >
                    Düzenle
                </Button>
                <a className="btn btn-tk-save btn-sm" title="PDF Oluştur" onClick={() => createPDF(getValues('id'), "PACKING-LIST-")}>
                    PDF
                </a>
            </Modal.Footer>
        </Modal>
    </>)
}

RealizedSalaes.auth = true;
export default RealizedSalaes;