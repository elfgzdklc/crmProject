import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import moment from 'moment'
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import {useForm} from "react-hook-form";
import {Modal} from "react-bootstrap";

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

function AllAfterSalesServices(props) {
    const {data: session} = useSession()
    const [allSalesServices, setAllSalesServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const router = useRouter();
    const [productFile, setProductFile] = useState("");

    const {register, setValue, watch, formState: {errors}} = useForm();

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

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
            if (response.data[0] === undefined ||  response.data[0].after_sales_services === 0) {
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
                getAllAfterSalesServices();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getAllAfterSalesServices() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/after-sales-service/all-sales-service/',
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
            setAllSalesServices(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search]);

    const ActionCell = ({rowData, dataKey, ...props}) => {
        const speaker = (
            <Popover>
                <p>
                    {`${rowData.invoice_no}`}
                </p>
            </Popover>
        );
        return (
            <Table.Cell {...props}>
                <Whisper placement="top" speaker={speaker}>
                    <a>{rowData.invoice_no.toLocaleString()}</a>
                </Whisper>
            </Table.Cell>
        );
    };

    return (
        <div>
            <Title title="Hizmetler"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    href="/afterSalesService/allAfterSalesService"
                >
                    Satış Sonrası Hizmetler
                </Link>
            </Breadcrumbs>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
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
                            data={allSalesServices}
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
                            <Table.Column sortable={true} width={200}>
                                <Table.HeaderCell>Oluşturulma Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="date">
                                    {rowData => moment(rowData.date).format('DD.MM.YYYY')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Fatura Numarası</Table.HeaderCell>
                                <ActionCell dataKey="invoice_no"/>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Firma</Table.HeaderCell>
                                <Table.Cell dataKey="customer_trade_name"/>
                            </Table.Column>
                            <Table.Column flexGrow={2} sortable={true}>
                                <Table.HeaderCell>Ürünler</Table.HeaderCell>
                                <Table.Cell dataKey="product"/>
                            </Table.Column>
                            <Table.Column width={125}>
                                <Table.HeaderCell align={"center"}>İşlem</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                setValue('id', rowData.id);
                                                setValue('invoice_no', rowData.invoice_no);
                                                setValue('customer_trade_name', rowData.customer_trade_name);
                                                setValue('sales_owner', rowData.sales_owner);
                                                setValue('date', moment(rowData.date).format("DD/MM/YYYY"));
                                                setValue('product', rowData.product);
                                                setValue('description', rowData.description);
                                                setValue('solution', rowData.solution);
                                                setValue('problem', rowData.problem);
                                                setProductFile(rowData.file);
                                                handleShowDetail()
                                            }}>
                                                <i className="fal fa-info-circle me-2 fs-6"></i>
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

            <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
                <Modal.Header closeButton>
                    <h5 className="modal-title">
                        Tarih : {watch("date")}
                    </h5>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <div className="row">
                                <div className="col-12 mb-2">
                                    <label>Fatura Numarası</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("invoice_no")}/>
                                </div>
                                <div className="col-12 mb-2">
                                    <label>Firma Adı</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("customer_trade_name")}
                                    />
                                </div>
                                <div className="col-12 mb-2">
                                    <label>Satış Sahibi</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("sales_owner")}
                                    />
                                </div>
                                <div className="col-12 mb-2">
                                    <label>Ürün Adı / Ürün Kodu</label>
                                    <textarea className="form-control form-control-sm "
                                              readOnly {...register("product")}/>
                                </div>
                                <div className="col-6 w-100">
                                    <div className="col-12 mb-2">
                                        <label className="mb-2">Ürün Dosyaları </label>
                                        <div className="col-12">
                                            {
                                                (productFile) ? (
                                                    productFile.split(",").map((item, i) => {
                                                            return (
                                                                <>
                                                                    <a className="ms-1"
                                                                       href={`/public/uploadsAfterSalesService/` + item}
                                                                       download>{(() => {
                                                                        if (item.split(".")[1] === "pdf") {
                                                                            return (
                                                                                <i className="far fa-file-pdf me-1 fs-2"
                                                                                   title="Pdf"></i>
                                                                            )
                                                                        } else if (item.split(".")[1] === "docx") {
                                                                            return (
                                                                                <i className="far fa-file-word me-1 fs-2"
                                                                                   title="Word"></i>
                                                                            )
                                                                        } else if (item.split(".")[1] === "xlsx") {
                                                                            return (
                                                                                <i className="far fa-file-excel me-1 fs-2"
                                                                                   title="Excel"></i>

                                                                            )
                                                                        } else if (item.split(".")[1] === "pptx") {
                                                                            return (
                                                                                <i className="far fa-file-powerpoint me-1 fs-2"
                                                                                   title="Power Point"></i>
                                                                            )
                                                                        } else {
                                                                            return (
                                                                                <i className="far fa-file-image me-1 fs-2"
                                                                                   title="Resim"></i>
                                                                            )
                                                                        }
                                                                    })()}</a>
                                                                </>

                                                            )
                                                        }
                                                    )
                                                ) : (
                                                    <>
                                                        <div className="registerTitle text-danger"> Dosya
                                                            Yüklenmemiştir.
                                                        </div>
                                                    </>
                                                )
                                            }
                                            <p className="tableInfoText mt-2">* İndirmek için görsele tıklayınız. </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="row">
                                <div className="row">
                                    <div className="col-md-12">
                                        <label> Problem</label>
                                        <textarea
                                            className="form-control  form-control-sm  w-100"  {...register("problem")}
                                            readOnly/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <label className="pt-2 pb-2"> Çözüm</label>
                                        <textarea
                                            className="form-control  form-control-sm  w-100"  {...register("solution")}
                                            readOnly/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <label className="pt-2 pb-2"> Açıklama</label>
                                        <textarea
                                            className="form-control  form-control-sm  w-100"  {...register("description")}
                                            readOnly/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm"
                            onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}

AllAfterSalesServices.auth = true;

export default AllAfterSalesServices;
