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
import PageTitle from "../components/head";
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

export const option2 = {
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

function UserDashboard(props) {
    const {data: session} = useSession()
    const [value, onChange] = useState(new Date());
    const {formState: {errors}, register, handleSubmit, reset,} = useForm();
    const [event, setEvent] = useState([]);

    const [totalCustomer, setTotalCustomer] = useState();
    const [customer, setCustomer] = useState();
    const [potentialCustomer, setPotentialCustomer] = useState();

    const [totalOffer, setTotalOffer] = useState([]);
    const [approvedOffer, setApprovedOffer] = useState([]);
    const [pendingOffer, setPendingOffer] = useState([]);
    const [rejectedOffer, setRejectedOffer] = useState([]);
    const [canceledOffer, setCanceledOffer] = useState([]);

    const [monthCustomer, setMonthCustomer] = useState();

    const [userCustomer, setUserCustomer] = useState([]);
    const [userPotentialCustomer, setUserPotentialCustomer] = useState([]);
    const [u_id, setID] = useState(session.user.id);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");
    const [userCustomer2, setUserCustomer2] = useState([]);
    const [userPotentialCustomer2, setUserPotentialCustomer2] = useState([]);
    const [userSales, setUserSales] = useState([]);
    const [user, setUser] = useState([]);
    const [userLiable, setUserLiable] = useState([]);
    const [showAddEventModal, setShowAddEventModal] = useState(false);

    const handleClosAddEventModal = () => setShowAddEventModal(false);
    const handleShowAddEventModal = () => setShowAddEventModal(true);

    async function getCustomers() {
        await axios({
            method: 'post',
            url: `/api/dashboard/get-user-customers`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setTotalCustomer(res.data.totals);
            setCustomer(res.data.totalCustomers);
            setPotentialCustomer(res.data.totalPotentialCustomers);
            setMonthCustomer(res.data.totals);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getOffers() {
        await axios({
            method: 'post',
            url: `/api/dashboard/get-user-offers`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setTotalOffer(res.data.totalOffers);
            setPendingOffer(res.data.totalPendingOffers);
            setApprovedOffer(res.data.totalApprovedOffers);
            setRejectedOffer(res.data.totalRejectedOffers);
            setCanceledOffer(res.data.totalCanceledOffers);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomersUser() {
        await axios({
            method: 'post',
            url: `/api/dashboard/get-graph-userdashboard-customer-user`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setUserCustomer(res.data.customerToUser);
            setUserPotentialCustomer(res.data.potentialCustomerToUser);
        }).catch(function (error) {
            console.log(error)
        })
    }


    async function getCustomerUserGraph() {
        await axios({
            method: 'post',
            url: `/api/dashboard/get-graph-customer-user`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setUserCustomer2(res.data.customerToUser);
            setUserSales(res.data.salesToUser);
            setUserPotentialCustomer2(res.data.potentialCustomerToUser);
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getUser() {
        await axios({
            method: 'post',
            url: `/api/dashboard/get-user-liable-graph-customer-user`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setUser(res.data.data);
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getUserLiable() {
        await axios({
            method: "post",
            url: `/api/dashboard/get-user-dashboard-user-liable`,
            headers: {
                "Content-Type": "application/json",
                AuthToken: props.token
            },
            data: JSON.stringify({
                user_id: u_id
            })
        }).then(function (res) {
            setUserLiable(res.data.data);
        }).catch(function (error) {
            console.log(error);
        })
    }

    let month6 = moment().subtract(5, 'months').startOf("month").format('MM');

    let mounthCount = [];
    for (let i = 0; i <= 5; i++) {
        mounthCount.push((month6++ + ". Ay"))
    }
    const data4 = {
        labels: mounthCount,
        datasets: [
            {
                label: 'Firmalar',
                data: userCustomer,
                borderColor: 'rgb(34, 75, 12)',
                backgroundColor: 'rgba(34, 75, 12, 0.5)',
            },
            {
                label: 'Potansiyel Firmalar',
                data: userPotentialCustomer,
                borderColor: 'rgb(244, 187, 187)',
                backgroundColor: 'rgba(244, 187, 187, 0.5)',
            },
        ],
    };
    let user_liableArray = [];
    userLiable.map((item, index) => {
        user_liableArray.push(item.user_liable)
    })
    let arrayUserName = [];

    user.map((item, index) => {
        arrayUserName.push(item.name + " " + item.surname)
    })
    let arrayUserCustomer = [];

    userCustomer2.map((item, index) => {
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
                backgroundColor: 'rgba(244, 187, 187, 0.5)',
            },
            {
                label: 'Kazanılan Firma',
                data: arrayUserCustomer,
                backgroundColor: 'rgba(34, 75, 12, 0.5)',
            },
            {
                label: 'Satış',
                data: arrayUserSales,
                backgroundColor: 'rgba(100, 92, 170,0.75)',
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

    const onSubmit = async (data) => {
        if (data.start > data.end) {

            alert("Hata", "Başlangıç tarihi bitiş tarihinden sonra olamaz.", "error", () => {
                if (data.status === 'error') {
                    reset();
                    handleClosAddEventModal();
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
            url: `/api/dashboard/get-users-dashboard-events/`,
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
        })
            .then(function (res) {
                setEvent(res.data.data);
                setLoading(false);
            }).catch(function (error) {
                    console.log(error);
                }
            );
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };
    useEffect(() => {
        getCustomers();
        getOffers();
        getEvents();
        getCustomersUser();
        getCustomerUserGraph();
        getUser();
        getUserLiable();
    }, [limit, page, sortColumn, sortType, search]);

    return (
        <div>
            <PageTitle title="Ana Sayfa"/>
            <div className="px-3 mt-2 py-2">
                {/*<i className="ri-menu-line sidebar-toggle me-3 d-block d-md-none"/>*/}
                <div className="mt-3">
                    <div className="px-3 px-3">
                        <div className="row">
                            <div className="col-lg-8 col-12">
                                <div className="row w-100">
                                    <div className="col-12 mb-3">
                                        <div className="row">
                                            <div className="col-md-8 mb-3 text-center">
                                                <div className="card  shadow rounded border-top-green">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">Toplam Teklif </p>
                                                        <p className="fs-8 mt-1">{totalOffer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-brown">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">Toplam Firma Sayısı</p>
                                                        <p className="fs-8 mt-1">{totalCustomer}</p>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-green">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">Bekleyen Teklif </p>
                                                        <p className="fs-8 mt-1">{pendingOffer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-green">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">Onaylanan Teklif </p>
                                                        <p className="fs-8 mt-1">{approvedOffer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-brown">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">Firma Sayısı</p>
                                                        <p className="fs-8 mt-1">{customer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-green">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">Reddedilen Teklif </p>
                                                        <p className="fs-8 mt-1">{rejectedOffer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-green">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold">İptal Edilen Teklif </p>
                                                        <p className="fs-8 mt-1">{canceledOffer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3 text-center">
                                                <div className="card shadow rounded border-top-brown">
                                                    <div className="card-body">
                                                        <p className="fs-8 fw-semibold"> Potansiyel Firma Sayısı</p>
                                                        <p className="fs-8 mt-1">{potentialCustomer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <div className="row">


                                        </div>
                                    </div>

                                    <div className="col-md-12 mt-3 text-center mbl-d-none">
                                        <div className="card shadow rounded ">
                                            <div className="card-body p-4">
                                                <h6>6 Ay Firma Tablosu</h6>
                                                <Line options={option2} data={data4}/>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        user_liableArray[0] == 1 ? (
                                            <div className="col-12 mt-3 text-center mbl-d-none">
                                                <div className="card shadow rounded ">
                                                    <div className="card-body p-4">
                                                        <h5>Aylık Çalışan Durumu</h5>
                                                        <Bar options={options} data={userMonthStatus} type="bar"/>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p></p>
                                        )}

                                </div>
                            </div>
                            <div className="col-lg-4 col-12 px-0">
                                <div className="d-flex justify-content-end mb-4">
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
                                                <a className="btn btn-custom-gold text-decoration-none btn-sm me-2">
                                                    <i className="far fa-calendar-alt me-1"></i>
                                                    Ajanda
                                                </a>
                                            </Link>
                                            <button className="btn btn-custom btn-sm" onClick={handleShowAddEventModal}>
                                                <i className="far fa-calendar-plus me-1"></i>
                                                Yeni Etkinlik
                                            </button>
                                        </div>
                                        <div>
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
                        <button type="submit" className="btn btn-custom-save btn-sm">Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}


UserDashboard.auth = true;
export default UserDashboard;
