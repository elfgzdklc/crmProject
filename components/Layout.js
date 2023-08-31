import React, {useEffect, useState,forwardRef} from 'react';
import Sidebar from "./sidebar";
import Header from "./header";
import Footer from "./footer";
import Script from "next/script";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import {useSession} from "next-auth/react";
import {useForm} from "react-hook-form";


const MuiAlert2=forwardRef(function Alert(props,ref) {
        return <MuiAlert elevation={6} variant="filled" {...props} ref={ref} />;
    }
);


export default function Layout({children}) {
    const {data: session} = useSession()
    const [alertReminder, setAlertReminder] = useState([]);
    const [alertReminderRead, setAlertReminderRead] = useState([]);
    const[open, setOpen] = useState(false);
    const {handleSubmit} = useForm();
    const handleClickOpen = () => {
        setOpen(true);
    }
    const handleClose2 = (event,reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    }

    // async function getReminderAlert() {
    //     await axios({
    //         method: 'POST',
    //         url: '/api/dashboard/user-reminder-alert',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             AuthToken: token
    //         }
    //     }).then(function (response) {
    //         setAlertReminder(response.data.data);
    //         handleClickOpen();
    //     }).catch(function (error) {
    //         console.log(error)
    //     })
    // }
    // async function submitReadUserAlert(){
    //     await axios({
    //         method:'post',
    //         url:'/api/user-read-reminder-alert',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             AuthToken: token
    //         }
    //     }).then(function (response){
    //         setAlertReminderRead(response.data.data);
    //     }).catch(function (error) {
    //         console.log(error);
    //     })
    // }
    async function getReminderAlert() {
        await axios.post('/api/user-reminder-alert').then(function (response) {
            setAlertReminder(response.data.data[0]);
            handleClickOpen();
        }).catch(function (error) {
            console.log(error);
        })
    }
    async function submitReadUserAlert(){
        await axios({
            method:'post',
            url:'/api/user-read-reminder-alert',
        }).then(function (response){
            setAlertReminderRead(response.data.data);

        }).catch(function (error) {
                 console.log(error);
             })
    }

    useEffect(()=>{
        if (alertReminder==""){
        }else{
        }
        const interval = setInterval(() => {
           getReminderAlert()
        }, 3000000);
        return () => clearInterval(interval);
    },[])
    useEffect(() => {
        getReminderAlert();
        handleClickOpen();
    }, []);
    return (
        <>
            <Script src="/custom.js"/>
            <link rel="stylesheet" href="/assets/css/globals.css"/>
            <Sidebar/>
            <main className="bg-light ps-16">
                <form onSubmit={handleSubmit(submitReadUserAlert)}>
                {
                    alertReminder?(
                        alertReminder.map(function(d, idx){
                            return (
                                <div key={idx}>
                                    <div className="player mt-2 bg-white">
                                        <Stack spacing={2}>
                                            <Snackbar open={open} autoHideDuration={5000}
                                                      anchorOrigin={{
                                                          vertical: "top",
                                                          horizontal: "right"
                                                      }}  onClose={handleClose2}>
                                                <MuiAlert2 onClose={handleClose2} severity="info" className="alertStyle bg-white">
                                                    <h5 className="text-decoration-underline">Hatırlatma</h5>
                                                    <p>
                                                        Sayın  {session.user.name_surname};  {d.title} konusunda hatırlatmanız bulunuyor!
                                                    </p>
                                                    <br/>
                                                    <button className="btn btn-custom-gold" type="submit" onClick={handleClose2}>Gördüm</button>
                                                    <div>
                                                        <audio autoPlay src="https://ia800203.us.archive.org/14/items/slack_sfx/been_tree.mp3">
                                                        </audio>
                                                    </div>
                                                </MuiAlert2>
                                            </Snackbar>
                                        </Stack>
                                    </div>
                                </div>
                            )
                        })
                    ):<></>
                }
                </form>
                <Header/>
                <div className="p-2">
                    {children}
                </div>
            </main>
            <Footer/>
        </>
    )
}
