import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useForm} from "react-hook-form";
import {useSession} from "next-auth/react";
import Title from "../../../components/head";
import moment from "moment";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import {Button, Modal} from 'react-bootstrap';

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const purchases = await axios.post(`${path}api/purchases/all-purchases/get-all-purchases`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: '',
//     });
//     return {
//         props: {
//             purchases: purchases.data
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

function AllPurchases(props) {
    const {
        watch,
        setValue,
        formState: {errors}
    } = useForm();
    const [purchases, setPurchases] = useState([]);
    const [customerOfficial, setCustomerOfficial] = useState([]);
    const {data: session} = useSession();
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const [purchaseDetails, setPurchaseDetails] = useState([]);
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
            if (response.data[0] === undefined || response.data[0].purchases === 0) {
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
                getAllPurchases();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getAllPurchases() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/purchases/all-purchases/get-all-purchases',
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
            setPurchases(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomerOfficial(customer_id) {
        await axios({
            method: 'post',
            url: '/api/purchases/all-purchases/get-customer-official',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                customer_id: customer_id
            }),
        }).then(function (response) {
            setCustomerOfficial(response.data[0]);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search]);

    return (
        <div>
            <Title title="Tüm Alışlar"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    href="/purchases/allPurchases"
                >
                    Tüm Alışlar
                </Link>
            </Breadcrumbs>
            <div
                className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">
                </h5>
                <h5 className="fw-bold mb-0">
                    <div className="d-flex" role="search">
                        <input className="form-control form-control-sm  me-2" type="search" placeholder="Arama"
                               aria-label="Arama"
                               onChange={(e) => setSearch(e.target.value)}/>
                        <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                    </div>
                </h5>
            </div>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={purchases}
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
                            <Table.Column sortable={true} flexGrow={3}>
                                <Table.HeaderCell>Tedarikçi</Table.HeaderCell>
                                <Table.Cell dataKey="customer_trade_name">
                                    {rowData =>
                                        <Whisper
                                            trigger="click"
                                            placement='top'
                                            speaker={
                                                customerOfficial ? (
                                                    <Popover
                                                        title={customerOfficial.fullName}>
                                                        <p>Telefon : {customerOfficial.phone}</p>
                                                        <p>Email : {customerOfficial.email}</p>
                                                    </Popover>
                                                ) : (
                                                    <Popover
                                                        title="Yetkili Kişi Bulunamadı">
                                                    </Popover>
                                                )
                                            }
                                        >
                                            <a onClick={() => getCustomerOfficial(rowData.customer_id)}>
                                                {rowData.customer_trade_name}
                                            </a>
                                        </Whisper>
                                    }
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Ürün Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="purchaseDetail.product.product_code"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Ürün Adı</Table.HeaderCell>
                                <Table.Cell dataKey="purchaseDetail.product_name"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Birim Fiyat</Table.HeaderCell>
                                <Table.Cell dataKey="purchaseDetail.unit_price">
                                    {rowData => (parseFloat(rowData.purchaseDetail.unit_price).format(2, 3, '.', ',')).concat(' ').concat(rowData.purchaseDetail.currency_unit)}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} width={125} resizable>
                                <Table.HeaderCell>Toplam Tutar</Table.HeaderCell>
                                <Table.Cell dataKey="purchaseDetail.total">
                                    {rowData => (parseFloat(rowData.purchaseDetail.total).format(2, 3, '.', ',')).concat(' ').concat(rowData.purchaseDetail.currency_unit)}
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
                                                   setValue("purchase_code", rowData.purchase_code)
                                                   setValue("document_number", rowData.document_number)
                                                   setValue("customer_trade_name", rowData.customer_trade_name)
                                                   setValue("purchase_date", moment(rowData.purchase_date).format('DD.MM.YYYY'))
                                                   setValue("maturity_date", moment(rowData.maturity_date).format('DD.MM.YYYY'))
                                                   setValue("delivery_date", moment(rowData.delivery_date).format('DD.MM.YYYY'))
                                                   setValue("delivery_time", rowData.delivery_time)
                                                   setValue("maturity_time", rowData.maturity_time)
                                                   setValue("subtotal", rowData.subtotal)
                                                   setValue("vat_total", rowData.vat_total)
                                                   setValue("discount_total", rowData.discount_total)
                                                   setValue("shipping_cost", rowData.shipping_cost)
                                                   setValue("overall_total", rowData.overall_total)
                                                   setPurchaseDetails(rowData.purchaseDetail)
                                                   handleShow()
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

            <Modal size="xl" show={show} onHide={handleClose} keyboard={false} aria-labelledby="example-modal-sizes-title-xl">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Alış Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-5 col-6">
                            <div className="row mb-2">
                                <label className="col-sm-5 col-form-label fw-semibold">Firma Adı:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("customer_trade_name")}</p>
                                </div>
                                <label className="col-md-5 col-form-label fw-semibold">Belge Numarası:</label>
                                <div className="col-md-7">
                                    <p className="col-sm-10 col-form-label">{watch("document_number")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label fw-semibold">Alış Numarası:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("purchase_code")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-6">
                            <div className="row mb-2">

                                <label className="col-sm-6 col-form-label fw-semibold">Alış Tarihi:</label>
                                <div className="col-sm-6">
                                    <p className="col-sm-10 col-form-label">{watch("purchase_date")}</p>
                                </div>
                                <label className="col-sm-6 col-form-label fw-semibold">Vade Tarihi:</label>
                                <div className="col-sm-6">
                                    <p className="col-sm-10 col-form-label">{watch("maturity_date")}</p>
                                </div>
                                <label className="col-sm-6 col-form-label fw-semibold">Teslim Tarihi:</label>
                                <div className="col-sm-6">
                                    <p className="col-sm-10 col-form-label">{watch("delivery_date")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="row mb-2">
                                <label className="col-sm-5 col-form-label ps-2 fw-semibold">Teslim Süresi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("delivery_time")}</p>
                                </div>
                                <label className="col-sm-5 col-form-label ps-2 fw-semibold">Vade Süresi:</label>
                                <div className="col-sm-7">
                                    <p className="col-sm-10 col-form-label">{watch("maturity_time")}</p>
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
                                <th scope="col">KDV Tutarı</th>
                                <th scope="col">İskonto Tutarı</th>
                                <th scope="col">Toplam</th>
                                <th scope="col">Açıklama</th>
                            </tr>
                            </thead>
                            <tbody>
                            <>
                                <tr key={1}>
                                    <th scope="row">{1}</th>
                                    <td>{purchaseDetails.product_name}</td>
                                    <td>{Math.abs(purchaseDetails.quantity)}</td>
                                    <td>{parseFloat(purchaseDetails.unit_price).format(2, 3, '.', ',')} ( {purchaseDetails.unit} )</td>
                                    <td>{parseFloat(purchaseDetails.vat_amount).format(2, 3, '.', ',')} ( %{purchaseDetails.vat} )</td>
                                    <td>{parseFloat(purchaseDetails.discount_amount).format(2, 3, '.', ',')} ( {(purchaseDetails.discount_type === "yuzde") ? "%" + purchaseDetails.discount : purchaseDetails.discount + purchaseDetails.currency_unit} ind.
                                        )
                                    </td>
                                    <td>{parseFloat(purchaseDetails.total).format(2, 3, '.', ',')} {purchaseDetails.currency_unit}</td>
                                    <td>{purchaseDetails.description}</td>
                                </tr>
                            </>

                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary btn-sm" onClick={handleClose}>
                        Kapat
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

AllPurchases.auth = true;

export default AllPurchases;
