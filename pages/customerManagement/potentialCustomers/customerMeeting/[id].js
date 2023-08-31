import React, {useState, useEffect} from 'react';
import {Table, CustomProvider, Pagination, Button, Popover, Whisper} from "rsuite";
import {Breadcrumbs} from "@mui/material";
import Link from 'next/link';
import axios from "axios";
import moment from "moment";
import {locale} from "../../../../public/rsuite/locales/tr_TR";
import {useForm} from "react-hook-form";
import TextField from '@mui/material/TextField';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import localeDateTr from "date-fns/locale/tr";
import Modal from 'react-bootstrap/Modal';
import Stack from '@mui/material/Stack';
import {MobileDateTimePicker} from '@mui/x-date-pickers/MobileDateTimePicker';
import alertSwal from "../../../../components/alert";
import Title from "../../../../components/head";

export async function getServerSideProps(context) {
    const token = context.req.cookies['__Crm-next-auth.session-token'] ?? ''
    const id = context.query.id;
    const path = process.env.NEXTAUTH_URL;
    const customerMeetings = await axios.post(`${path}api/customer-management/potential-customers/get-customer-meeting`, {
        limit: 10,
        page: 1,
        sortColumn: 'id',
        sortType: 'asc',
        search: '',
        id
    }, {
        headers: {
            AuthToken: token
        }
    });
    if (token) {
        return {
            props: {
                customerMeetings: customerMeetings.data,
                id,
                token: token
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function CustomerMeetings({customerMeetings, id, token}) {
    const [customer_meetings, setCustomerMeetings] = useState(customerMeetings.data);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(customerMeetings.total);
    const [sortColumn, setSortColumn] = useState("created_at");
    const [search, setSearch] = useState('');
    const [sortType, setSortType] = useState("asc");
    const [tradeName, setTradeName] = useState("");
    const [eventDetail, setEventDetail] = useState([]);

    const {register, setValue} = useForm();

    const [valueStart, setValueStart] = useState(new Date(moment().format('YYYY-MM-DD HH:mm').toString()).toISOString());
    const [valueEnd, setValueEnd] = useState(new Date(moment().format('YYYY-MM-DD HH:mm').toString()).toISOString());

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    const [showMeetingDetail, setShowMeetingDetail] = useState(false);
    const handleCloseMeetingDetail = () => setShowMeetingDetail(false);
    const handleShowMeetingDetail = () => setShowMeetingDetail(true);

    const [showDetailNotMeeting, setShowDetailNotMeeting] = useState(false);


    const {
        register: registerEvent,
        handleSubmit: handleSubmitEvent,
        setValue: setValueEvent,
        reset: resetEvent,
        watch: watchEvent,
        formState: {errors: errorsEvent},
    } = useForm();


    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    async function getPotentialCustomerName() {
        await axios({
            method: 'POST',
            url: `/api/customer-management/potential-customers/get-potential-customers-name`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                customer_id: id
            },
        }).then(function (response) {
            setTradeName(response.data)
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getCustomerMeeting() {
        await axios({
            method: 'POST',
            url: `/api/customer-management/potential-customers/get-customer-meeting`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: JSON.stringify({
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search,
                id: id
            }),
        }).then(function (response) {
            setCustomerMeetings(response.data.data);
            setTotal(response.data.total);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getEventDetail(id) {
        await axios({
            method: 'POST',
            url: `/api/customer-management/potential-customers/get-event-detail`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                meeting_id: id
            }
        }).then(function (response) {
            if (response.data.length == 0) {
                handleShowDetailNotMeeting();
            } else {
                handleShowDetail()
                setEventDetail(response.data);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    const onSubmitEvent = async (data) => {
        await axios({
            method: 'POST',
            url: `/api/customer-management/potential-customers/add-customer-meeting-alarm`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                meeting_id: data.meeting_id,
                start: valueStart,
                end: valueEnd,
                title: data.title
            }
        }).then(function (response) {
            handleClose();
            getCustomerMeeting();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                resetEvent();
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleCloseDetailNotMeeting = () => setShowDetailNotMeeting(false);

    const handleShowDetailNotMeeting = () => setShowDetailNotMeeting(true)

    useEffect(() => {
        getCustomerMeeting();
        getPotentialCustomerName();
    }, [limit, page, sortColumn, sortType, search, id, valueStart, valueEnd]);

    const ActionCell = ({rowData, dataKey, ...props}) => {
        const speaker = (
            <Popover>
                <p>
                    {`${rowData.user.email}`}
                </p>
            </Popover>
        );
        return (
            <Table.Cell {...props}>
                <Whisper placement="top" speaker={speaker}>
                    <a>{rowData.user.email.toLocaleString()}</a>
                </Whisper>
            </Table.Cell>
        );
    };

    return (
        <div>
            <Title title="Firma Görüşmeleri"/>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/customerManagement/potentialCustomers">
                        Potansiyel Firmalar
                    </Link>
                    <a className="cursor-pointer me-2"
                       href={'/customerManagement/potentialCustomers/customerMeeting/' + id}>
                        Firma Görüşmeleri
                    </a>
                </Breadcrumbs>
            </div>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row w-100">
                    <div className="col-md-4 col-12 mb-2 mb-md-0 mt-2">
                        <label className="fw-semibold">
                            Firma Adı : {tradeName}
                        </label></div>
                    <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                        <h5 className="fw-bold mb-0">
                            <div className="d-flex" role="search">
                                <input className="form-control form-control-sm  me-2" type="search"
                                       placeholder="Arama"
                                       aria-label="Arama"
                                       onChange={(e) => setSearch(e.target.value)}/>
                                <button className="btn btn-outline-secondary"><i className="fal fa-search"></i>
                                </button>
                            </div>
                        </h5>
                    </div>
                </div>
            </div>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={customer_meetings}
                            cellBordered={true}
                            hover={true}
                            bordered={true}
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}
                            sortColumn={sortColumn}
                            sortType={sortType}>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Görüşme Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="created_at">
                                    {rowData => moment(rowData.created_at).format('DD.MM.YYYY HH:mm:ss')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Görüşmeyi Yapan Kişi</Table.HeaderCell>
                                <ActionCell dataKey="user.email"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Görüşülen Kişi</Table.HeaderCell>
                                <Table.Cell dataKey="meeting_user_name"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Görüşme Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="meeting_code"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Görüşme Tipi</Table.HeaderCell>
                                <Table.Cell dataKey="meeting_type"/>
                            </Table.Column>
                            <Table.Column width={125}>
                                <Table.HeaderCell>Dosya</Table.HeaderCell>
                                <Table.Cell dataKey="meeting_file">
                                    {
                                        rowData => {
                                            if (rowData.meeting_file) {
                                                return rowData.meeting_file.split(",").map((item, i) => {
                                                        return (
                                                            <>
                                                                <a href={`/public/uploadsMeeting/` + item}
                                                                   download>{(() => {
                                                                    if (item.split(".")[1] === "pdf") {
                                                                        return (
                                                                            <i className="far fa-file-pdf me-1 fs-5"
                                                                               title="Pdf"></i>
                                                                        )
                                                                    } else if (item.split(".")[1] === "docx") {
                                                                        return (
                                                                            <i className="far fa-file-word me-1 fs-5"
                                                                               title="Word"></i>
                                                                        )
                                                                    } else if (item.split(".")[1] === "xlsx") {
                                                                        return (
                                                                            <i className="far fa-file-excel me-1 fs-5"
                                                                               title="Excel"></i>

                                                                        )
                                                                    } else if (item.split(".")[1] === "pptx") {
                                                                        return (
                                                                            <i className="far fa-file-powerpoint me-1 fs-5"
                                                                               title="Power Point"></i>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <i className="far fa-file-image me-1 fs-5"
                                                                               title="Resim"></i>
                                                                        )
                                                                    }
                                                                })()}</a>
                                                            </>
                                                        )
                                                    }
                                                )
                                            } else {
                                                return (
                                                    <a>
                                                        <i className="far fa-times-circle me-1 fs-6 iconColor"
                                                           title="Dosya bulunamadı"></i>
                                                    </a>
                                                )
                                            }
                                        }
                                    }
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={125}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay" onClick={() => {
                                                setValue('id', rowData.id);
                                                setValue('meeting_subject', rowData.meeting_subject);
                                                setValue('meeting_description', rowData.meeting_description);
                                                handleShowMeetingDetail()
                                            }}>
                                                <i className="fal fa-info-circle me-2 fs-6"></i>
                                            </a>
                                            <a className="cursor-pointer" title="Erteleme Ekle" onClick={() => {
                                                resetEvent();
                                                handleShow();
                                                setValueEvent("meeting_id", rowData.id);
                                            }}>
                                                <i className="far fa-bell-on me-2 fs-6"></i>
                                            </a>
                                            <a className="cursor-pointer" title="Erteleme Detay" onClick={() => {
                                                getEventDetail(rowData.id);
                                            }}>
                                                <i className="far fa-sticky-note"></i>
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
                                    onChangeLimit={handleChangeLimit}/>
                    </CustomProvider>
                </div>
            </div>

            <Modal show={showMeetingDetail} onHide={handleCloseMeetingDetail}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" id="eventAddModalLabel">
                        Görüşme Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <label>Görüşme Konusu</label>
                        <div className="col-md-12">
                            <input className="form-control  form-control-sm  "  {...register("meeting_subject")}
                                   readOnly/>
                        </div>
                        <label className="pt-2">Görüşme</label>
                        <div className="col-md-12">
                                    <textarea style={{"height": "15rem"}}
                                              className="form-control  form-control-sm  w-100"  {...register("meeting_description")}
                                              readOnly/>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm"
                            onClick={handleCloseMeetingDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" id="eventAddModalLabel">
                        Erteleme Ekle
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmitEvent(onSubmitEvent)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeDateTr}>
                                    <Stack spacing={3} className="mb-3 mb-md-0">
                                        <MobileDateTimePicker
                                            label="Başlangıç Zamanı"
                                            value={valueStart}
                                            onChange={(e) => {
                                                setValueStart(new Date(moment(e).format('YYYY-MM-DD HH:mm').toString()).toISOString())
                                            }}
                                            componentsProps={{
                                                actionBar: {
                                                    actions: [""]
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    {...registerEvent("start")}

                                                />
                                            )}
                                        />
                                    </Stack>
                                </LocalizationProvider>
                            </div>
                            <div className="col-md-6">
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeDateTr}>
                                    <Stack spacing={3}>
                                        <MobileDateTimePicker
                                            label="Bitiş Zamanı"
                                            value={valueEnd}
                                            name="end"
                                            componentsProps={{
                                                actionBar: {
                                                    actions: [""]
                                                }
                                            }}
                                            onChange={(e) => {
                                                setValueEnd(new Date(moment(e).format('YYYY-MM-DD HH:mm').toString()).toISOString())
                                            }}
                                            renderInput={(props) => (
                                                <TextField
                                                    {...props}
                                                    size="small"
                                                    {...registerEvent("end")}
                                                />
                                            )}
                                        />
                                    </Stack>
                                </LocalizationProvider>
                            </div>
                            <input name="meeting_id" value={watchEvent("meeting_id")} hidden/>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <label className="reactModalLabel mb-2 mt-2">Erteleme Sebebi</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <textarea
                                    className={"form-control form-control-sm " + (errorsEvent.title ? "is-invalid" : "")}
                                    autoFocus={true} {...registerEvent("title", {
                                    required: {
                                        value: true,
                                        message: "Bu alan zorunlu."
                                    }, minLength: {
                                        value: 50,
                                        message: "En az 50 karakter girilmelidir."
                                    }
                                })}/>
                                {errorsEvent.title && <div
                                    className="invalid-feedback text-start">{errorsEvent.title.message}</div>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm me-2" data-bs-dismiss="modal"
                                onClick={handleClose}>Vazgeç
                        </button>
                        <button type="submit" className="btn btn-custom-save btn-sm">Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" id="eventAddModalLabel">
                        Erteleme Bilgileri Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Başlangıç Tarihi</th>
                                <th>Bitiş Tarihi</th>
                                <th>Erteleme Açıklaması</th>
                            </tr>
                            </thead>
                            <tbody>
                            {eventDetail.map((item, index) => {
                                return (
                                    <>
                                        <tr>
                                            <th scope="row">{index + 1}</th>
                                            <td>{moment(item.start).format("DD.MM.YYYY HH:mm:ss")}</td>
                                            <td>{moment(item.end).format("DD.MM.YYYY HH:mm:ss")}</td>
                                            <td><span className="tableWord" title={item.title}>
                                            {item.title}</span></td>

                                        </tr>
                                    </>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal"
                            onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDetailNotMeeting} onHide={handleCloseDetailNotMeeting}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold" id="eventAddModalLabel">
                        Erteleme Bilgileri
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-square me-1"></i>Görüşmeye ait erteleme bulunmamaktadır.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal"
                            onClick={handleCloseDetailNotMeeting}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>

        </div>
    )

}

CustomerMeetings.auth = true;
export default CustomerMeetings;
