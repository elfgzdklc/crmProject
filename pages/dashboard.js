import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {Table, CustomProvider, Pagination} from "rsuite";
import Calendar from "react-calendar";
import {Bar, Line} from "react-chartjs-2";
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    PointElement,
    LineElement
} from 'chart.js';
import moment from "moment";
import alert from "../components/alert";
import axios from "axios";
import {useForm} from "react-hook-form";
import Link from "next/link";
import {locale} from "../public/rsuite/locales/tr_TR";
import NotAuthorized from "../components/notAuthorized";
import Head from "../components/head";
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

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement)


function Dashboard(props) {
    const {data: session} = useSession()
    const [value, onChange] = useState(new Date());
    const userSession = session.user.permission_id;
    const {formState: {errors}, register, handleSubmit, reset,} = useForm();
    const [sales, setSales] = useState([]);
    const [salesPrice, setSalesPrice] = useState([]);
    const [totalSalesPrice, setTotalSalesPrice] = useState();
    const [totalBuyingPrice, setTotalBuyingPrice] = useState();
    const [user, setUser] = useState([]);
    const [userCustomer, setUserCustomer] = useState([]);
    const [userPotentialCustomer, setUserPotentialCustomer] = useState([]);
    const [userSales, setUserSales] = useState([]);
    const [event, setEvent] = useState([]);
    const [activeCustomer, setActiveCustomer] = useState();
    const [monthCustomer, setMonthCustomer] = useState();
    const [offer, setOffer] = useState();
    const [u_id, setID] = useState(session.user.id);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");
    const [monthEuroIncome, setMonthEuroIncome] = useState("");
    const [monthDolarIncome, setMonthDolarIncome] = useState("");
    const [showAddEventModal, setShowAddEventModal] = useState(false);

    const [totalCustomer, setTotalCustomer] = useState([]);
    const [customer, setCustomer] = useState([]);
    const [potentialCustomer, setPotentialCustomer] = useState([]);


    const [totalOffer, setTotalOffer] = useState([]);
    const [approvedOffer, setApprovedOffer] = useState([]);
    const [pendingOffer, setPendingOffer] = useState([]);
    const [rejectedOffer, setRejectedOffer] = useState([]);
    const [canceledOffer, setCanceledOffer] = useState([]);


    const [totalSales, setTotalSales] = useState([]);
    const [pendingSales, setPendingSales] = useState([]);
    const [realizedSales, setRealizedSales] = useState([]);

    const handleClosAddEventModal = () => setShowAddEventModal(false);
    const handleShowAddEventModal = () => setShowAddEventModal(true);

    //para formatı
    Number.prototype.format = function (n, x, s, c) {
        let re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };

    async function getMonthIncome() {
        await axios({
            method: 'Post',
            url: `/api/reports/get-month-total-income-price`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setMonthEuroIncome(res.data.euroTotalSales);
            setMonthDolarIncome(res.data.dolarTotalSales);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getIncome() {
        await axios({
            method: 'Post',
            url: `/api/dashboard/get-income-expense`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setTotalSalesPrice(res.data.data);
            setTotalBuyingPrice(res.data.sumTotalMonthBuying);
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getUser() {
        await axios({
            method: 'Post',
            url: `/api/dashboard/get-graph-customer-user`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setUser(res.data.data);
            setUserCustomer(res.data.customerToUser);
            setUserSales(res.data.salesToUser);
            setUserPotentialCustomer(res.data.potentialCustomerToUser);
        }).catch(function (error) {
            console.log(error)
        })
    }


    let arrayUserName = [];

    user.map((item, index) => {
        arrayUserName.push(item.name + " " + item.surname)
    })

    let arrayUserCustomer = [];

    userCustomer.map((item, index) => {
        arrayUserCustomer.push(item)
    })

    let arrayPotentialCustomer = [];

    userPotentialCustomer.map((item, index) => {
        arrayPotentialCustomer.push(item)
    })

    let arrayUserSales = [];

    userSales.map((item, index) => {
        arrayUserSales.push(item)
    })

    const userMonthStatus = {
        labels: arrayUserName,
        datasets: [
            {
                label: 'Potansiyal Firma',
                data: arrayPotentialCustomer,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Kazanılan Firma',
                data: arrayUserCustomer,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
                label: 'Satış',
                data: arrayUserSales,
                backgroundColor: 'rgba(100, 92, 170,0.75)',
            },
        ],
    };

    let month6 = moment().subtract(5, 'months').startOf("month").format('MM');

    let monthCount = [];

    for (let i = 0; i <= 5; i++) {
        monthCount.push((month6++) + ". Ay")
    }
    const data4 = {
        labels: monthCount,
        datasets: [
            {
                label: 'Satışlar',
                data: totalSalesPrice,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Alışlar',
                data: totalBuyingPrice,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
            },
        },
    };

    const option2 = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
            },
        },
    };

    const onSubmit = async (data) => {
        if (data.start > data.end) {
            alert("Hata", "Başlangıç tarihi bitiş tarihinden sonra olamaz.", "error", () => {
                if (data.status === 'error') {
                    reset();
                    handleClosAddEventModal()
                }
            });
        } else {
            await axios({
                method: "post",
                url: `/api/agenda/add-event`,
                headers: {
                    "Content-Type": "application/json",
                    AuthToken: props.token
                },
                data: JSON.stringify(data)
            }).then(function (res) {
                handleClosAddEventModal();
                reset();
                getEvents();
                alert(res.data.title, res.data.message, res.data.status, () => {
                    if (res.data.status === 'success') {

                    }
                })
            }).catch(function (error) {
                console.log(error)
            })
        }
    };

    async function getEvents() {
        setLoading(true);
        await axios({
            method: "post",
            url: `/api/dashboard/get-users-dashboard-events`,
            headers: {
                "Content-Type": "application/json",
                AuthToken: props.token
            },
            data: JSON.stringify({
                user_id: u_id,
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search
            })
        }).then(function (res) {
            setEvent(res.data.data);
            setLoading(false);
        }).catch(function (error) {
                console.log(error);
            }
        );
    }

    async function getOffers() {
        await axios({
            method: 'Post',
            url: `/api/reports/get-report-offers`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setTotalOffer(res.data.totalOffers);
            setPendingOffer(res.data.totalPendingOffers);
            setApprovedOffer(res.data.totalApprovedOffers);
            setRejectedOffer(res.data.totalRejectedOffers)
            setCanceledOffer(res.data.totalCanceledOffers);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getSales() {
        await axios({
            method: 'Post',
            url: `/api/reports/get-report-sales`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setTotalSales(res.data.totalSales);
            setPendingSales(res.data.totalPendingSales);
            setRealizedSales(res.data.totalRealizedSales);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomers() {
        await axios({
            method: 'Post',
            url: `/api/reports/get-report-customers`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setTotalCustomer(res.data.totals);
            setCustomer(res.data.totalCustomers);
            setPotentialCustomer(res.data.totalPotentialCustomers);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };
    useEffect(() => {
        getCustomers();
        getOffers();
        getSales();
        getMonthIncome();
        getEvents();
        getUser();
        getIncome();
    }, [limit, page, sortColumn, sortType, search]);
    if (userSession === 1) {
        return (
            <>
                <Head title="Ana Sayfa"/>
                <div className="px-3 mt-1 py-2">
                    <div className="mt-3">
                        <div className="px-3 px-3 mt-2 py-2 ">
                            <div className="row">
                                <div className="col-lg-8 d-flex pe-0 align-items-center">
                                    <div className="row w-100">
                                        <div className="col-12 px-0">
                                            <div className="row">
                                                <div className="col-md-3 mb-3 text-center ">
                                                    <div className="card shadow rounded border-top-green">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold">Toplam Firma </p>
                                                            <p className="fs-8 mt-1">{totalCustomer}</p>

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-5 mb-3 text-center">
                                                    <div className="card  shadow rounded border-top-brown">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold">Toplam Teklif </p>
                                                            <p className="fs-8 mt-1">{totalOffer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3 text-center">
                                                    <div className="card shadow rounded border-top-light-blue">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <div className="row">
                                                                    <p className="fs-8 fw-semibold">Aylık Gelir</p>
                                                                    <div className="col-md-6 pe-0">
                                                                        <p className="fs-8 mt-1"> {monthDolarIncome ? parseFloat(monthDolarIncome).format(2, 3, '.', ',') : "0,00"} $</p>
                                                                    </div>
                                                                    <div className="col-md-6 pe-0">
                                                                        <p className="fs-8 mt-1"> {monthEuroIncome ? parseFloat(monthEuroIncome).format(2, 3, '.', ',') : "0,00"} €</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 px-0">
                                            <div className="row">
                                                <div className="col-md-3 text-center mb-3">
                                                    <div className="card shadow rounded border-top-green">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold"> Firma</p>
                                                            <p className="fs-8 mt-1">{customer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-5 text-center mb-3">
                                                    <div className="card shadow rounded border-top-brown">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold">Bekleyen / Onaylanan</p>
                                                            <p className="fs-8 mt-1 pendingOffer">{pendingOffer}</p>
                                                            <p className="fs-8 approvedOffer">{approvedOffer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 text-center mb-3">
                                                    <div className="card shadow rounded border-top-light-blue">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold">Toplam Satış</p>
                                                            <p className="fs-8 mt-1">{totalSales}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-12 px-0">
                                            <div className="row">
                                                <div className="col-md-3 text-center mb-3">
                                                    <div className="card  shadow rounded  border-top-green">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold"> Potansiyel Firma</p>
                                                            <p className="fs-8 mt-1">{potentialCustomer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-5 text-center mb-3">
                                                    <div className="card shadow rounded border-top-brown">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold">Reddedilen / İptal
                                                                Edilen </p>
                                                            <p className="fs-8 mt-1 pendingOffer">{rejectedOffer}</p>
                                                            <p className="fs-8 mt-1 approvedOffer">{canceledOffer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3 text-center">
                                                    <div className="card shadow rounded border-top-light-blue">
                                                        <div className="card-body">
                                                            <p className="fs-8 fw-semibold">Bekleyen / Gerçekleşen</p>
                                                            <p className="fs-8 mt-1 pendingSales">{pendingSales}</p>
                                                            <p className="fs-8 mt-1 realizedSales">{realizedSales}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 text-center  px-0 mbl-d-none">
                                            <div className="card shadow rounded ">
                                                <div className="card-body p-4">
                                                    <h5>Aylık Çalışan Durumu</h5>
                                                    <Bar options={options} data={userMonthStatus} type="bar"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mt-3 text-center px-0">
                                            <div className="card shadow rounded ">
                                                <div className="card-body p-4">
                                                    <h6>6 Aylık Alış-Satış Tablosu</h6>

                                                    <Line options={option2} data={data4}/>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                                <div className="col-lg-4 mt-3  mt-md-0 px-0">
                                    <div className="d-flex justify-content-end mb-3">
                                        <Calendar
                                            onChange={onChange}
                                            value={value}
                                            onClickDay={
                                                (e) => {
                                                    window.location.href = `/agenda`
                                                }
                                            }
                                        />
                                    </div>
                                    <div className="card shadow rounded mt-2 text-center">
                                        <div className="card-body">
                                            <div className="col-12 text-end mb-3">
                                                <Link href={`/agenda`}>
                                                    <a className="btn btn-tk-gold text-decoration-none btn-sm me-2">
                                                        <i className="far fa-calendar-alt me-1 btn-tk-gold border-0"></i>
                                                        Ajanda
                                                    </a>
                                                </Link>
                                                <button className="btn btn-tk btn-sm" onClick={() => {
                                                    reset();
                                                    handleShowAddEventModal();
                                                }}>
                                                    <i className="far fa-calendar-plus me-1"></i>
                                                    Yeni Etkinlik
                                                </button>
                                            </div>
                                            <div>
                                                <CustomProvider locale={locale}>
                                                    <Table
                                                        height={300}
                                                        loading={loading}
                                                        autoHeight={true}
                                                        cellBordered={true}
                                                        hover={true}
                                                        bordered={true}
                                                        sortColumn={sortColumn}
                                                        sortType={sortType}
                                                        data={event}
                                                        onSortColumn={(sortColumn, sortType) => {
                                                            setSortColumn(sortColumn)
                                                            setSortType(sortType)
                                                        }}>
                                                        <Table.Column sortable={true} flexGrow={2}>
                                                            <Table.HeaderCell>
                                                            <span className="fw-semibold fs-6">
                                                                Tarih️
                                                            </span>
                                                            </Table.HeaderCell>
                                                            <Table.Cell
                                                                dataKey="start">{rowData => moment(rowData.start).format('DD.MM.YYYY')}</Table.Cell>
                                                        </Table.Column>
                                                        <Table.Column sortable={true} flexGrow={4}>
                                                            <Table.HeaderCell>
                                                            <span className="fw-semibold fs-6">
                                                                ⭐️ Yapılacak İşler ⭐️
                                                            </span>
                                                            </Table.HeaderCell>
                                                            <Table.Cell dataKey="title"/>
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
                                                                layout={['-', 'limit', '|', 'pager']}
                                                                limitOptions={[10, 15, 25, 50, 100]}
                                                                limit={limit}
                                                                activePage={page}
                                                                onChangePage={setPage}
                                                                onChangeLimit={handleChangeLimit}/>
                                                </CustomProvider>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/********Add Event Modal*******/}
                <Modal show={showAddEventModal} onHide={handleClosAddEventModal}>
                    <Modal.Header closeButton>
                        <p className="fs-6 fw-semibold">
                            Etkinlik Ekle
                        </p>
                    </Modal.Header>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="fw-semibold mb-1">Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="validityPeriod"
                                        name="start"
                                        defaultValue={moment().add(30, 'days').format("YYYY-MM-DD HH:mm:ss")}
                                        {...register("start")}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="fw-semibold mb-1">Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="validityPeriod"
                                        name="end"
                                        defaultValue={moment().add(30, 'days').format("YYYY-MM-DD HH:mm:ss")}
                                        {...register("end")}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="fw-semibold mb-1">Etkinlik Rengi</label>
                                    <select {...register("importanceEvent", {required: true})}
                                            className={"form-select form-select-sm  " + (errors.importanceEvent ? "is-invalid" : "")}>
                                        <option value="">Seçiniz...</option>
                                        <option value="1">Kırmızı</option>
                                        <option value="2">Mavi</option>
                                        <option value="3">Yeşil</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="fw-semibold mb-1">Etkinlik Adı</label>
                                    <span className="registerTitle text-danger fw-bold"> *</span>
                                    <textarea
                                        className={"form-control form-control-sm " + (errors.name ? "is-invalid" : "")}
                                        autoFocus={true} {...register("title", {required: true})}/>
                                    {errors.name &&
                                        <span className="text-danger">Bu alan zorunlu.</span>}
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-secondary btn-sm"
                                    onClick={handleClosAddEventModal}>Vazgeç
                            </button>
                            <button type="submit" className="btn btn-tk-save btn-sm">Kaydet
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </>
        );
    } else {
        return (
            <NotAuthorized/>
        )
    }
}

Dashboard.auth = true;

export default Dashboard;
