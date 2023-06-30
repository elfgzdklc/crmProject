import React, {useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import moment from "moment";
import alert from "../../components/alert";
import axios from "axios";
import Head from "../../components/head";
import {Bar, Doughnut} from "react-chartjs-2";
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

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Dropdown from 'react-bootstrap/Dropdown';

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


function Reports(props) {
    const {formState: {errors}, register, handleSubmit, reset} = useForm();

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


    const [allUser, setAllUser] = useState([]);
    const [monthIncome, setMonthIncome] = useState([]);
    const [monthEuroIncome, setMonthEuroIncome] = useState("");
    const [monthDolarIncome, setMonthDolarIncome] = useState("");

    const [user, setUser] = useState([]);
    const [userOffer, setUserOffer] = useState([]);
    const [userCustomer, setUserCustomer] = useState([]);
    const [userPotentialCustomer, setUserPotentialCustomer] = useState([]);
    const [userSales, setUserSales] = useState([]);
    const [userApprovedOffers, setUserApprovedOffers] = useState([]);
    const [userRejectedOffers, setUserRejectedOffers] = useState([]);
    const [userWaitOffers, setUserWaitdOffers] = useState([]);
    const [userCanceledOffers, setUseCanceleddOffers] = useState([]);

    function saveUserMonthStatus() {
        const canvasSave = document.getElementById('graphUserStatus');
        html2canvas(canvasSave)
            .then((canvas) => {
                const imgData = canvas.toDataURL();
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'JPEG', 5, 10, 195, 140);
                pdf.save("graphUserStatus.pdf");

            })
    }


    //para formatı
    Number.prototype.format = function (n, x, s, c) {
        let re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };

    function saveUserOfferMonthStatus() {
        const canvasSave = document.getElementById('graphUserOfferStatus');
        html2canvas(canvasSave)
            .then((canvas) => {
                const imgData = canvas.toDataURL();
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'JPEG', 5, 10, 195, 140);
                pdf.save("graphUserOfferStatus.pdf");

            })
    }

    function saveSalesMonthStatus() {
        const canvasSave = document.getElementById('graphSalesStatus');
        html2canvas(canvasSave)
            .then((canvas) => {
                const imgData = canvas.toDataURL();
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'JPEG', 5, 10, 195, 140);
                pdf.save("graphSalesStatus.pdf");

            })
    }

    function saveOfferMonthStatus() {
        const canvasSave = document.getElementById('graphOfferStatus');
        html2canvas(canvasSave)
            .then((canvas) => {
                const imgData = canvas.toDataURL();
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'JPEG', 5, 10, 195, 140);
                pdf.save("graphOfferStatus.pdf");

            })
    }

    function printCardStatus() {
        const input = document.getElementById('divToPrint');
        html2canvas(input)
            .then((canvas) => {
                const imgData = canvas.toDataURL();
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'JPEG', 5, 10, 195, 80);
                pdf.save("rapor.pdf");

            })
        ;
    }

    function printAllPage() {
        const input = document.getElementById('pageToPrint');
        html2canvas(input)
            .then((canvas) => {
                const imgData = canvas.toDataURL();
                const pdf = new jsPDF("p", "px", "a4");
                pdf.addImage(imgData, 'JPEG', 5, 5, 430, 620);
                pdf.save("all-page.pdf");

            })
        ;
    }

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

    async function getAllUser() {
        await axios({
            method: 'post',
            url: '/api/reports/get-all-users',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setAllUser(res.data)
        }).catch(function (error) {
            console.log(error)
        })
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

    async function getUserOffer() {
        await axios({
            method: 'Post',
            url: `/api/reports/get-graph-reports-offer-user`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            }
        }).then(function (res) {
            setUserOffer(res.data.data);
            setUserApprovedOffers(res.data.offerApprovedToUser);
            setUserRejectedOffers(res.data.offerRejectedToUser);
            setUserWaitdOffers(res.data.offerWaitToUser);
            setUseCanceleddOffers(res.data.offerCanceledToUser);
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
    let arrayOfferUserName = [];

    userOffer.map((item, index) => {
        arrayOfferUserName.push(item.name + " " + item.surname)
    })

    let arrayUserApproved = [];

    userApprovedOffers.map((item, index) => {
        arrayUserApproved.push(item)
    })

    let arrayUserRejected = [];

    userRejectedOffers.map((item, index) => {
        arrayUserRejected.push(item)
    })

    let arrayUserWait = [];

    userWaitOffers.map((item, index) => {
        arrayUserWait.push(item)
    })
    let arrayUserCanceled = [];

    userCanceledOffers.map((item, index) => {
        arrayUserCanceled.push(item)
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

    const dataUserApproved = {
        labels: arrayOfferUserName,
        datasets: [
            {
                label: 'Onaylanmış Teklifler',
                data: arrayUserApproved,
                backgroundColor: 'rgba(34, 75, 12, 0.5)'
            },
            {
                label: 'Reddedilen Teklifler',
                data: arrayUserRejected,
                backgroundColor: 'rgba(210, 0, 26, 0.5)',
            },
            {
                label: 'Bekleyen Teklifler',
                data: arrayUserWait,
                backgroundColor: 'rgba(238, 227, 203,0.75)',
            },
            {
                label: 'İptal Edilen Teklifler',
                data: arrayUserCanceled,
                backgroundColor: 'rgba(76, 0, 51,0.75)',
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
    const monthlySales = {
        labels: ['Bekleyen Satışlar', 'Gerçekleşen Satışlar'],
        datasets: [
            {
                data: [pendingSales, realizedSales],
                backgroundColor: [
                    'rgba(238, 227, 203, 0.5)',
                    'rgba(34, 75, 12, 0.5)',
                ],
                borderColor: [
                    'rgba(238, 227, 203, 1)',
                    'rgba(34, 75, 12, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };
    const monthlyGraphOffer = {
        labels: ['Beklemedeki Teklifler', 'Onaylanmış Teklifler', 'Reddedilmiş Teklifler', 'İptal Edilmiş Teklifler'],
        datasets: [
            {
                data: [pendingOffer, approvedOffer, rejectedOffer, canceledOffer],
                backgroundColor: [
                    'rgba(238, 227, 203, 0.5)',
                    'rgba(34, 75, 12, 0.5)',
                    'rgba(210, 0, 26, 0.5)',
                    'rgba(76, 0, 51, 0.5)',
                ],
                borderColor: [
                    'rgba(238, 227, 203, 1)',
                    'rgba(34, 75, 12, 1)',
                    'rgba(210, 0, 26, 1)',
                    'rgba(76, 0, 51, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const onSubmitSearch = async (data) => {
        console.log(data)
        if (data.created_at > data.created_at2) {
            alert("Hata", "Başlangıç tarihi bitiş tarihinden sonra olamaz.", "error", () => {
                if (data.status === 'error') {
                    reset();
                }
            });
        } else {
            await axios({
                method: "post",
                url: `/api/reports/get-selected-customer-length`,
                headers: {
                    "Content-Type": "application/json",
                    AuthToken: props.token
                },
                data: JSON.stringify(data)
            }).then(function (res) {
                setTotalCustomer(res.data.data);
                setCustomer(res.data.activeCustomers);
                setPotentialCustomer(res.data.potentialCustomers);
                setTotalOffer(res.data.totalOffer);
                setApprovedOffer(res.data.approvedOffer);
                setRejectedOffer(res.data.rejectedOffer);
                setPendingOffer(res.data.waitingOffer);
                setCanceledOffer(res.data.totalCanceledOffer);
                setTotalSales(res.data.totalSales);
                setAllUser(res.data.allUser);
                setMonthIncome(res.data.monthIncome);
                setRealizedSales(res.data.totalRealizedSales);
                setPendingSales(res.data.totalPendingSales);
                //setUserCustomer(res.data.customerToUser);
                //setUserPotentialCustomer(res.data.potentialCustomerToUser);
                //setUserSales(res.data.salesToUser);
                //setUserApprovedOffers(res.data.offerApprovedToUser2);
                //setUserRejectedOffers(res.data.offerRejectedToUser2);
                //setUserWaitdOffers(res.data.offerWaitToUser2);
                //setUseCanceleddOffers(res.data.offerCanceledToUser2);
                setMonthEuroIncome(res.data.euroTotalSalesSelect)
                setMonthDolarIncome(res.data.dolarTotalSalesSelect)
            }).catch(function (error) {
                console.log(error)
            })
        }
    }

    useEffect(() => {
        getAllUser();
        getCustomers();
        getOffers();
        getSales();
        getUser();
        getUserOffer();
        getMonthIncome();
    }, []);

    return (
        <>
            <Head title="Raporlar"/>
            <div className=" mx-0  mb-3 ps-4 ">
                <div className="row bg-white rounded shadow w-100">
                    <div className="col-12  mt-4">
                        <p className="mb-2">Listenmesini istediğiniz tarih aralığını ve personeli seçiniz: </p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmitSearch)}>
                        <div className="col-md-12 mb-4  d-flex justify-content-between">
                            <div className="row w-100">
                                <div className="col-md-2 col-12 mb-2 mb-md-0">
                                    <select
                                        className={"form-select form-select-sm w-100 me-2"} {...register("user_name")}>
                                        <option value="">Seçiniz</option>
                                        {
                                            allUser.map((user, index) => (
                                                <option key={user.id}
                                                        value={user.id}>{user.name} {user.surname}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-md-2 col-6 mb-2 mb-md-0 pe-0 pe-md-2">
                                    <input
                                        type="date"
                                        className="form-control form-control-sm me-2 w-100"
                                        id="validityPeriod"
                                        name="created_at"
                                        defaultValue={moment().add(30, 'days').format("YYYY-MM-DD HH:mm:ss")}
                                        {...register("created_at")}
                                    />
                                </div>
                                <div className="col-md-2 col-6 mb-2 mb-md-0">
                                    <input
                                        type="date"
                                        className="form-control form-control-sm me-2"
                                        id="validityPeriod"
                                        name="created_at2"
                                        defaultValue={moment().add(30, 'days').format("YYYY-MM-DD HH:mm:ss")}
                                        {...register("created_at2")}
                                    />
                                </div>
                                <div className="col-md-3 col-12 mb-2 mb-md-0">
                                    <button type="submit"
                                            className="btn btn-outline-secondary w-100 btn-sm me-2" {...register("id")}>
                                        <i className="far fa-search me-2"></i>
                                        Filtrele
                                    </button>
                                </div>
                                <div className="col-md-3 col-12 mb-2 mb-md-0 mbl-d-none">
                                    <Dropdown>
                                        <Dropdown.Toggle variant="outline-success" id="dropdown-basic"
                                                         className="btn-sm w-100">
                                            <i className="far fa-arrow-to-bottom me-1"></i> İndirme Seçimi
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={printAllPage}>Tüm Sayfa</Dropdown.Item>
                                            <Dropdown.Item onClick={printCardStatus}>Durum Kartları</Dropdown.Item>
                                            <Dropdown.Item onClick={saveUserMonthStatus}>Aylık Çalışan
                                                Durumu</Dropdown.Item>
                                            <Dropdown.Item onClick={saveUserOfferMonthStatus}>Aylık Çalışan Teklif
                                                Durumu</Dropdown.Item>
                                            <Dropdown.Item onClick={saveSalesMonthStatus}>Aylık Satış
                                                Durumu</Dropdown.Item>
                                            <Dropdown.Item onClick={saveOfferMonthStatus}>Aylık Teklif
                                                Durumu</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div id="pageToPrint">
                <div className="row w-100 ps-3" id="divToPrint">
                    <div className="col-12 pe-0">
                        <div className="row">
                            <div className="col-md-4 mb-3 text-center ">
                                <div className="card shadow rounded border-top-green">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Toplam Firma Sayısı</p>
                                        <p className="fs-6 mt-1">{totalCustomer}</p>

                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3 text-center">
                                <div className="card  shadow rounded border-top-brown">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Toplam Teklif </p>
                                        <p className="fs-6 mt-1">{totalOffer}</p>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-4 mb-3 text-center">
                                <div className="card shadow rounded border-top-light-blue">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row">
                                                <p className="fs-6 fw-semibold">Aylık Gelir</p>
                                                <div className="col-md-6 pe-0">
                                                    <p className="fs-6 mt-1"> {monthDolarIncome ? parseFloat(monthDolarIncome).format(2, 3, '.', ',') : "0,00"} $</p>
                                                </div>
                                                <div className="col-md-6 pe-0">
                                                    <p className="fs-6 mt-1"> {monthEuroIncome ? parseFloat(monthEuroIncome).format(2, 3, '.', ',') : "0,00"} €</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-12 pe-0">
                        <div className="row">
                            <div className="col-md-4 text-center mb-3">
                                <div className="card shadow rounded border-top-green">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold"> Firma Sayısı</p>
                                        <p className="fs-6 mt-1">{customer}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 text-center mb-3">
                                <div className="card shadow rounded border-top-brown">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Bekleyen Teklif </p>
                                        <p className="fs-6 mt-1">{pendingOffer}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 text-center mb-3">
                                <div className="card shadow rounded border-top-brown">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Onaylanan Teklif </p>
                                        <p className="fs-6 mt-1">{approvedOffer}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 text-center mb-3">
                                <div className="card shadow rounded border-top-light-blue">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Toplam Satış</p>
                                        <p className="fs-6 mt-1">{totalSales}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="col-12 pe-0">
                        <div className="row">
                            <div className="col-md-4 text-center mb-3">
                                <div className="card  shadow rounded  border-top-green">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold"> Potansiyel Firma Sayısı</p>
                                        <p className="fs-6 mt-1">{potentialCustomer}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 text-center mb-3">
                                <div className="card shadow rounded border-top-brown">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Reddedilen Teklif </p>
                                        <p className="fs-6 mt-1">{rejectedOffer}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 text-center mb-3">
                                <div className="card shadow rounded border-top-brown">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">İptal Edilen Teklif </p>
                                        <p className="fs-6 mt-1">{canceledOffer}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 mb-3 text-center">
                                <div className="card shadow rounded border-top-light-blue">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Bekleyen Satış</p>
                                        <p className="fs-6 mt-1">{pendingSales}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 text-center mb-3">
                                <div className="card shadow rounded border-top-light-blue">
                                    <div className="card-body">
                                        <p className="fs-6 fw-semibold">Gerçekleşen Satış </p>
                                        <p className="fs-6 mt-1">{realizedSales}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row w-100 ps-3">
                    <div className="col-md-6 col-12 mb-3 pe-0 text-center">
                        <div className="card shadow rounded ">
                            <div className="card-body p-4">
                                <h5>Aylık Satış Durumu</h5>
                                <Doughnut id="graphSalesStatus" options={options} data={monthlySales} type="doughnut"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-12 mb-3 pe-0 text-center">
                        <div className="card shadow rounded ">
                            <div className="card-body p-4">
                                <h5>Aylık Teklif Durumu</h5>
                                <Doughnut id="graphOfferStatus" options={options} data={monthlyGraphOffer}
                                          type="doughnut"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mb-3 pe-0 text-center mbl-d-none">
                        <div className="card shadow rounded ">
                            <div className="card-body p-4">
                                <h5>Aylık Çalışan Durumu</h5>
                                <Bar id="graphUserStatus" options={options} data={userMonthStatus} type="bar"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mb-3 pe-0 text-center mbl-d-none">
                        <div className="card shadow rounded ">
                            <div className="card-body p-4">
                                <h5>Aylık Çalışan Teklif Durumu</h5>
                                <Bar id="graphUserOfferStatus" options={options} data={dataUserApproved} type="bar"/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </>
    );
}

Reports.auth = true;

export default Reports;