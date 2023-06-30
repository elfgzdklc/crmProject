import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useForm} from 'react-hook-form';
import 'moment/locale/tr';
import {Pagination, Table, CustomProvider} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import moment from "moment";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {Button, Modal} from 'react-bootstrap';

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const offers = await axios.post(`${path}api/offers/get-canceled-offers`, {
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
    const {data: session} = useSession()
    const router = useRouter();

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
            if (response.data[0] === undefined || response.data[0].canceled_offers === 0) {
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
            url: '/api/offers/get-canceled-offers',
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

    const [showDetail, setShowDetail] = useState(false);
    const handleShowDetail = () => setShowDetail(true);
    const handleCloseDetail = () => setShowDetail(false);

    useEffect(() => {
        getPermissionDetail();
    }, [page, search, limit, sortColumn, sortType, watch]);

    return (
        <div>
            <Title title="İptal Edilmiş Teklifler"/>
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
                            İptal Edilmiş Teklifler
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
                                    {rowData => rowData.currency_unit + " " + parseFloat(rowData.overall_total).format(2, 3, '.', ',')}
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
                                                   setValue("number_of_packages", rowData.number_of_packages)
                                                   setValue("payment", rowData.payment)
                                                   setValue("transport", rowData.transport)
                                                   setValue("type_of_packaging", rowData.type_of_packaging)
                                                   setValue("delivery_term", rowData.delivery_term)
                                                   setValue("origin", rowData.origin)
                                                   setValue("status", rowData.status)
                                                   setOfferDetails(rowData.offerDetails)
                                                   handleShowDetail()
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
            <Modal size="xl" show={showDetail} onHide={handleCloseDetail} keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        İptal Edilmiş Teklif Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-4 col-12">
                            <div className="row mb-2">
                                <label className="col-sm-5 col-form-label fw-semibold">Firma Adı:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("customer_trade_name")}</p>
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
                                <div className="col-sm-6 ps-0">
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
                                <label className="col-sm-6 col-form-label fw-semibold">Son Geçerlilik Tarihi:</label>
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
                                    <tr key={index + "u"}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{i.product_name}</td>
                                        <td>{Math.abs(i.quantity)}</td>
                                        <td>{parseFloat(i.unit_price).format(2, 3, '.', ',')} {i.currency_unit} ( {i.unit} )</td>
                                        <td>{i.availability}</td>
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
                    <Button variant="secondary btn-sm" onClick={handleCloseDetail}>
                        Kapat
                    </Button>
                    <button type="button" className="p-2 btn-sm">
                        <i className="fal fa-ban"></i> İptal Edildi
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

PendingOffers.auth = true;
export default PendingOffers;