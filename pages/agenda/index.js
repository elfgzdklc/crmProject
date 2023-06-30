import React, {useState, useCallback, useMemo, useEffect} from 'react'
import {Modal, Button} from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import {useForm} from "react-hook-form";
import {Calendar, momentLocalizer, Views} from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/tr'
import {Breadcrumbs} from "@mui/material";
import Link from "@mui/material/Link";
import axios from "axios";
import {useSession} from "next-auth/react";
import askDelete from "../../components/askDelete";
import alert from "../../components/alert";
import {ColorPicker, useColor} from "react-color-palette";
import Title from "../../components/head";

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

const localizer = momentLocalizer(moment)


function Agenda(props) {
    const [myEventsList, setEvents] = useState([])
    const {data: session} = useSession();
    const [u_id, setID] = useState(session.user.id);
    const [showChooseModal, setShowChooseModal] = useState(false);
    const [showChooseRemindingModal, setShowChooseRemindingModal] = useState(false);
    const [addDayTitleModal, setAddDayTitleModal] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [calendarEvent, setCalendarEvent] = useState({});
    const [selected, setSelected] = useState([]);
    const [color, setColor] = useColor("hex", "#121212");
    const [selecetColor, setSelecetColor] = useState(color.hex)
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const hideModals = () => {
        setShowChooseModal(false);
        setShowChooseRemindingModal(false);
    };

    const hideEditModals = () => {
        setShowEditModal(false);
    };

    const handleClosAddEventModal = () => setShowAddEventModal(false);
    const handleShowAddEventModal = () => setShowAddEventModal(true);

    const {
        formState: {errors},
        register,
        handleSubmit,
        reset
    } = useForm();

    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        reset: reset2,
        formState: {errors: errors2},
    } = useForm();

    const {
        register: register3,
        handleSubmit: handleSubmit3,
        setValue: setValue3,
        reset: reset3,
        formState: {errors: errors3},
    } = useForm();

    const eventStyle = (event) => {
        let current_time = moment().format('YYYY MM DD');
        let event_time = moment(event.start).format('YYYY MM DD');
        if (event.meeting_id == null) {
            if (current_time > event_time) {
                let background = 'rgba(221,221,221,0.76)';
                let color = 'rgba(0,0,0,0.73)';
                return {
                    className: "fs-7 fw-500",
                    style: {
                        backgroundColor: background,
                        color: color,
                    }
                };
            } else {
                if (event.importanceEvent == 1) {
                    let background = '#D57E7E';
                    let color = '#8c4646';
                    return {
                        className: "fs-7 fw-500",
                        style: {
                            backgroundColor: background,
                            color: color,
                        }
                    };
                } else {
                    if (event.importanceEvent == 2) {
                        let background = '#A2CDCD';
                        let color = '#396b6b';
                        return {
                            className: "fs-7 fw-500",
                            style: {
                                backgroundColor: background,
                                color: color,
                            }
                        };
                    } else {
                        let background = '#C1D5A4';
                        let color = '#485b2d';
                        return {
                            className: " fs-7 fw-500",
                            style: {
                                backgroundColor: background,
                                color: color,
                            }
                        };
                    }
                }
            }
        } else {
            let background = '#E9DAC1';
            let color = '#575757';
            return {
                className: "fs-7 fw-500",
                style: {
                    backgroundColor: background,
                    color: color,
                }
            };
        }
    };

    async function getInfo() {
        await axios({
            method: 'post',
            url: '/api/agenda/get-users-agenda',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                user_id: u_id,
            }
        }).then(function (res) {
            setEvents(res.data.data);
        }).catch(function (error) {
                console.log(error);
            }
        );
    }

    const onSubmit = async (data) => {
        if (data.start > data.end) {
            getInfo();
            alert("Hata", "Başlangıç tarihi bitiş tarihinden sonra olamaz.", "error", () => {
                if (data.status === 'error') {
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
                getInfo();
                alert(res.data.title, res.data.message, res.data.status, () => {
                    reset();
                })
            }).catch(function (error) {
                console.log(error)
            })
        }
    };

    const handleSelectSlot = useCallback(
        async ({start, end}) => {
            const title = window.prompt("Etkinlik Adı")
            const event = {
                title,
                start,
                end,
            }
            if (title) {
                if (event) {
                    setEvents((prev) => [...prev, {start, end, title}])
                    await axios({
                        method: "post",
                        url: `/api/agenda/add-event`,
                        headers: {
                            "Content-Type": "application/json",
                            AuthToken: props.token
                        },
                        data: JSON.stringify(event)
                    }).then(function (res) {
                        getInfo();
                        alert(res.data.title, res.data.message, res.data.status, () => {
                        })
                    }).catch(function (error) {
                            console.log(error)
                        }
                    );
                }
            } else {
                handleClosAddEventModal();
                getInfo();
                alert("Hata", "Etkinlik açıklaması boş olamaz.", "error", () => {
                    if (event.status === 'error') {
                    }
                });
            }

        },
        [setEvents],
    )
    const handleSelectEvent = (event) => {
        setSelected(event);
        if (event.meeting_id != null) {
            setShowChooseRemindingModal(true);
        } else {
            setShowChooseModal(true);
        }
        let {id, title, subject, start, end, allDay} = event;
        start = new Date(start);
        end = new Date(end);
        const data = {id, title, subject, start, end, allDay};
        setCalendarEvent(data);
    };

    const {defaultDate, scrollToTime} = useMemo(
        () => ({
            defaultDate: new Date(),
            views: ['day', 'work_week'],
            scrollToTime: new Date(1970, 1, 1, 6),
        }),
        [setEvents],
    )

    const handleDeleteStaff = (id) => {
        setShowChooseModal(false);
        let token = props.token;
        askDelete(`/api/agenda/delete-event/${id}`, token, function () {
                getInfo();
            }
        )
    }

    const handleUpdateStaff = (data) => {
        setShowChooseModal(false);
        const id = selected.id;
        const title = data.title;
        const importanceEvent = data.importanceEvent;
        axios({
            method: "post",
            url: `/api/agenda/update-event/${id}`,
            headers: {
                "Content-Type": "application/json",
                AuthToken: props.token
            },
            data: {
                id: id,
                title: title,
                importanceEvent: importanceEvent,
            }
        }).then(function (res) {
            hideEditModals()
            getInfo();
            alert(res.data.title, res.data.message, res.data.status, () => {
                    reset3();
                }
            )
        }).catch(function (error) {
                console.log(error)
            }
        );
    }
    const openEditModal = (event) => {
        setShowChooseModal(false);
        setShowChooseRemindingModal(false);
        setShowEditModal(true);
    }
    useEffect(() => {
        getInfo();
    }, []);

    return (
        <div>
            <Title title="Ajanda"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0 d-flex align-items-center">
                <div className="col-md-7">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="none" color="inherit" href="/dashboard">
                            Ana Sayfa
                        </Link>
                        <Link underline="none" color="inherit" href={`/agenda`}>
                            Ajanda
                        </Link>

                    </Breadcrumbs>
                </div>
                <div className="col-md-5 text-end">
                    <Button variant="outlined" className="text-capitalize btn-tk" onClick={() => {
                        reset2();
                        setValue2("id", 0);
                        setValue2('title', "");
                        setValue2('start', "");
                        setValue2('end', "");
                        handleShowAddEventModal();
                    }}><i className="fas fa-plus me-1"></i> Yeni Etkinlik
                    </Button>
                </div>
            </div>

            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <Calendar
                    className="w-100"
                    defaultDate={defaultDate}
                    defaultView={Views.MONTH}
                    localizer={localizer}
                    events={myEventsList}
                    onSelectEvent={(event) => handleSelectEvent(event)}
                    onSelectSlot={(slot) => {
                        handleSelectSlot(slot)
                    }}
                    scrollToTime={scrollToTime}
                    selectable
                    startAccessor="start"
                    endAccessor="end"
                    eventPropGetter={(event, start, end, isSelected) => eventStyle(event, start, end, isSelected)}
                    style={{height: 600}}
                    messages={{
                        date: 'Tarih',
                        time: 'Zaman',
                        event: 'Etkinlik',
                        allDay: 'Tüm Gün',
                        week: 'Hafta',
                        work_week: 'Çalışma Haftası',
                        day: 'Gün',
                        month: 'Ay',
                        previous: 'Geri',
                        next: 'İleri',
                        yesterday: 'Dün',
                        tomorrow: 'Yarın',
                        today: 'Bugün',
                        agenda: 'Ajanda',
                        noEventsInRange: 'Bu aralıkta etkinlik yok.',
                    }}
                    selected={selected}
                    popup
                />
            </div>

            {/*********Reminding***********/}
            <Modal show={showChooseRemindingModal} onHide={hideModals}>
                <Modal.Header closeButton>
                    <p className="fs-6 fw-semibold"> Hatırlatma Detay</p>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <p className="fs-6 fw-normal my-2">
                            {selected.title}
                        </p>
                    </form>
                </Modal.Body>
            </Modal>
            {/*********Choose***********/}
            <Modal show={showChooseModal} onHide={hideModals}>
                <Modal.Header closeButton>
                    <p className="fs-6 fw-semibold"> Etkinlik Düzenleme</p>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <p className="fs-6 fw-normal my-2">
                            <strong> {selected.title} </strong>
                            etkinliği için yapmak istediğiniz işlemi seçiniz:
                        </p>
                        <div className="text-center mt-3">
                            <Button variant="outline-danger" className="me-2 w-25"
                                    onClick={(event) => handleDeleteStaff(selected.id)}>Sil</Button>
                            <Button variant="outline-success" className="me-2 w-25" onClick={(event) => openEditModal(
                                reset3(),
                                setValue3('id', selected.id),
                                setValue3('title', selected.title),
                                setValue3('importanceEvent', selected.importanceEvent),
                                setValue3('start', moment(selected.start).format('DD-MM-YYYY')),
                                setValue3('end', moment(selected.end).format('DD-MM-YYYY')),
                            )}>Düzenle</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
            {/**********Edit**********/}
            <Modal show={showEditModal} onHide={hideEditModals}>
                <Modal.Header closeButton>
                    <p className="fs-6 fw-semibold"> Etkinlik Düzenleme</p>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit3(handleUpdateStaff)}>
                        <div className="row">
                            <div className="col-12 ">
                                <label className="my-1 fw-semibold">Etkinlik Rengi</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <select {...register3("importanceEvent", {required: true})}
                                        className={"form-select form-select-sm  " + (errors.importanceEvent ? "is-invalid" : "")}>
                                    <option value="">Seçiniz...</option>
                                    <option value="1">Kırmızı</option>
                                    <option value="2">Mavi</option>
                                    <option value="3">Yeşil</option>
                                </select>
                            </div>
                            <div className="col-12 mb-3">
                                <label className="my-1 fw-semibold">Etkinlik Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input className={"form-control form-control-sm" + (errors3.title ? "is-invalid" : "")}
                                       autoFocus={true} {...register3("title", {required: true})}/>
                                {errors3.title && <span className="text-danger">Bu alan zorunlu.</span>}
                            </div>
                            <div className="col-12 text-end">
                                <button type="button" className="btn btn-secondary btn-sm me-2" data-bs-dismiss="modal"
                                        onClick={hideEditModals}>Vazgeç
                                </button>
                                <button type="submit" className="btn btn-tk-save btn-sm" {...register3("id")}>Kaydet
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
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
        </div>
    );
}

Agenda.auth = true;
export default Agenda;
