import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useForm} from 'react-hook-form';
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

function PendingOffers(props) {
    const {
        watch,
        setValue,
        getValues,
        reset,
        formState: {errors}
    } = useForm();

    const [offers, setOffers] = useState([])
    const [sortColumn, setSortColumn] = useState("created_at")
    const [sortType, setSortType] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [offerDetails, setOfferDetails] = useState([]);
    const [settings, setSettings] = useState()
    const [settingsDetails, setSettingsDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);

    const {data: session} = useSession()
    const router = useRouter();

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
            url: '/api/offers/get-pending-offers',
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
    const handleClose = () => setShow(false);

    const [showDetail, setShowDetail] = useState(false);
    const handleShowDetail = () => setShowDetail(true);
    const handleCloseDetail = () => setShowDetail(false);

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
        <div>
            <Title title="Beklemedeki Teklifler"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-md-7 p-2">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link
                            underline="none"
                            color="inherit"
                            href="/offers/pendingOffers"
                        >
                            Beklemedeki Teklifler
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
                                            <a className="cursor-pointer" title="quotation/proforma"
                                               onClick={() => {
                                                   setValue("id", rowData.id)
                                                   setValue("bank_id", rowData.bank_id)
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

            <Modal size="xl" show={showDetail} onHide={handleCloseDetail} keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Beklemedeki Teklif Detay
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
                    <a className='btn text-secondary btn-sm border-secondary text-decoration-none' onClick={handleCloseDetail}>
                        <i className="far fa-undo me-1 text-secondary small"></i>Vazgeç
                    </a>
                </Modal.Footer>
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
                                            <td colSpan="3" style={{width: "25%"}}>{getValues('customer_trade_name')}</td>
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
                                                    <p>{settingsDetails.first_phone} / {settingsDetails.second_phone} <br/>{settingsDetails.email}</p>
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
        </div>
    );
}

PendingOffers.auth = true;
export default PendingOffers;
