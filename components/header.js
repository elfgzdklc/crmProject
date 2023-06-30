import {Button, InputLabel, Menu, MenuItem} from "@mui/material";
import React, {useState, useEffect} from 'react';
import {signOut, useSession} from "next-auth/react";
import Link from "next/link";
import Badge from '@mui/material/Badge'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import axios from "axios";
import {useForm} from "react-hook-form";
import moment from "moment";
import Modal from "react-bootstrap/Modal";

export default function Header() {
    const path = process.env.NEXTAUTH_URL;
    const [announcements, setAnnouncements] = useState([]);
    const [profileImage, setProfileImage] = useState("");
    const {data: session} = useSession();
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorEl2, setAnchorEl2] = useState(null);
    const [u_id, setID] = useState(session.user.id);
    const [showDetail, setShowDetail] = useState(false);
    const open = Boolean(anchorEl);
    const open2 = Boolean(anchorEl2);
    let piece = announcements.length;
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleClick2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };
    const handleClose2 = (event) => {
        setAnchorEl2(null);
    };

    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = () => setShowDetail(true);

    // async function getAnnouncements() {
    //     await axios({
    //         method: 'POST',
    //         url: '/api/announcements/get-user-announcements',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             AuthToken: token
    //         },
    //         data: JSON.stringify({
    //             user_id: u_id
    //         }),
    //     })
    //         .then(function (res) {
    //             setAnnouncements(res.data.data);
    //         }).catch(function (error) {
    //                 console.log(error);
    //             }
    //         );
    // }
    //
    //
    // async function getProfileImage() {
    //     await axios({
    //         method: 'post',
    //         url: '/api/profile/profile-image/',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             AuthToken: token
    //         },
    //     }).then(function (res) {
    //         setProfileImage(res.data.data[0].avatar);
    //     }).catch(function (error) {
    //             console.log(error);
    //         }
    //     );
    // }
    //
    // const handleAnnouncements = async (announcement_id) => {
    //     setAnchorEl2(null);
    //     await axios({
    //         method: 'POST',
    //         url: `/api/announcements/changer-read-status-announcements`,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             AuthToken: token
    //         },
    //         data: JSON.stringify({
    //             id: announcement_id
    //         }),
    //     }).then(function (res) {
    //         getAnnouncements()
    //     }).catch(function (error) {
    //         console.log(error);
    //     });
    // }

    async function getAnnouncements() {
        await axios({
            method: 'POST',
            url: '/api/header/get-user-announcements',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                user_id: u_id
            }),
        }).then(function (res) {
            setAnnouncements(res.data.data);
        }).catch(function (error) {
                console.log(error);
            }
        );
    }

    async function getProfileImage() {
        await axios({
            method: 'post',
            url: '/api/users/header/profile-image/',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(function (res) {
            setProfileImage(res.data.data[0].avatar);
        }).catch(function (error) {
                console.log(error);
            }
        );
    }

    const handleAnnouncements = async (announcement_id) => {
        setAnchorEl2(null);
        await axios({
            method: 'POST',
            url: `/api/changer-read-status-announcements`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                id: announcement_id
            }),
        }).then(function (res) {
            getAnnouncements()
        }).catch(function (error) {
            console.log(error);
        });
    }

    const {
        register: registerAnnounDet,
        handleSubmit: handleSubmitAnnounDet,
        setValue: setValueAnnounDet,
        reset: resetAnnounDet,
        watch: watchAnnounDet,
        formState: {errors: errorsAnnounDet},
        control: controlAnnounDet
    } = useForm();

    useEffect(() => {
        getAnnouncements();
        getProfileImage();
    }, [piece]);
    return (
        <>
            <header className="p-3 bg-white border-bottom">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                    </ul>
                    <div>
                        <form action="">

                            <Button
                                id="notification-button"
                                aria-controls={open2 ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open2 ? 'true' : undefined}
                                onClick={handleClick2}>
                                <Badge badgeContent={piece} color="error">
                                    <NotificationsOutlinedIcon color="action"/>
                                </Badge>
                            </Button>
                            <Menu id="notification-menu"
                                  anchorEl={anchorEl2}
                                  open={open2}
                                  onClose={handleClose2}
                                  className="p-4">
                                {
                                    announcements.length == 0 ? (
                                        <MenuItem className="border-bottom" onClick={handleClose2}>
                                            <label className="text-secondary ">
                                                <i className="fal fa-exclamation-circle me-1 fs-6"></i>
                                                <span className=" notificationText">Yeni Duyuru Bulunamadı</span>
                                            </label>
                                        </MenuItem>
                                    ) : (
                                        announcements.map(function (d, idx) {
                                                return (
                                                    <MenuItem key={idx} className="border-bottom unreadNotification">
                                                        <a className="text-secondary" onClick={() => {
                                                            handleAnnouncements(d.id);
                                                            setValueAnnounDet('id', d.announcement.id);
                                                            setValueAnnounDet('created_at', moment(d.announcement.created_at).format('DD.MM.YYYY'));
                                                            setValueAnnounDet('subject', d.announcement.subject);
                                                            setValueAnnounDet('message', d.announcement.message);
                                                            handleShowDetail();
                                                        }}
                                                           title={d.announcement.subject}>
                                                            🔔
                                                            <span
                                                                className=" notificationText">{d.announcement.subject}</span>
                                                        </a>
                                                    </MenuItem>
                                                )
                                            }
                                        )
                                    )
                                }
                                <MenuItem className="border-bottom d-flex justify-content-center"
                                          onClick={handleClose2}>
                                    <Link href={`/announcements`}>
                                        <a className="text-secondary ">
                                            <span
                                                className=" notificationText text-decoration-underline">Tümünü Gör</span>
                                        </a>
                                    </Link>
                                </MenuItem>
                            </Menu>
                        </form>

                    </div>
                    <InputLabel className="fw-semibold">{session.user.name_surname}</InputLabel>
                    <Button
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}>
                        <span className="shadow-sm border rounded-circle">
                            {
                                profileImage ? (
                                    <img src={`/public/assets/img/user/${profileImage}`} className="header-user-icon"
                                         alt="me"
                                         width="50" height="50"/>
                                ) : (
                                    <i className="fas fa-user-alt m-2 header-user-icon"></i>
                                )
                            }
                        </span>
                        <i className="fa fa-angle-down text-black  ms-2"></i>
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}>
                        <MenuItem onClick={handleClose}>
                            <Link href={`/profile/${session.user.id}`}>
                                <a className="profile">
                                    Hesabım
                                </a>
                            </Link>
                        </MenuItem>
                        <MenuItem onClick={() => {
                            handleClose()
                            signOut({callbackUrl: `${process.env.NEXT_PUBLIC_URL}`})
                        }}><a className="profile">Çıkış</a></MenuItem>
                    </Menu>
                    <a className="float-end mobileMenuIcon ">
                        <i className="fas fa-bars sidebar-toggle me-2 d-block d-md-none shadow-sm"/>
                    </a>
                </div>
            </header>

            {/*********Detail************/}
            <Modal show={showDetail} onHide={handleCloseDetail}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Duyuru Bilgileri
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6">
                            <label className=" pb-2">Tarih</label>
                            <input
                                className="form-control form-control-sm "  {...registerAnnounDet("created_at")}
                                readOnly/>
                        </div>
                        <div className="col-md-6">
                            <label className="pb-2">Konu</label>
                            <input
                                className="form-control form-control-sm "  {...registerAnnounDet("subject")}
                                readOnly/>
                        </div>
                        <div className="col-md-12">
                            <label className="pt-2 pb-2">Açıklama </label>
                            <textarea
                                className="form-control form-control-sm " {...registerAnnounDet("message")}
                                readOnly/>

                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>Vazgeç
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
        ;
}
