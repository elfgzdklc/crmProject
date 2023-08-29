import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {getCsrfToken, useSession, signIn, getSession} from "next-auth/react"
import {useRouter} from "next/router";
import {Spinner} from "react-bootstrap";
import Title from "../components/head";
import {Alert} from "@mui/material";

const localIpAddress = require("local-ip-address")

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Tüm hakları saklıdır © '}
            <Link color="inherit" href="https://crm.com.tr/">
                crmProject
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

export async function getServerSideProps(context) {
    return {
        props: {
            csrfToken: await getCsrfToken(context),
            ipAddress: localIpAddress()
        }
    }
}

export default function SignInSide({csrfToken, ipAddress}) {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [passwordShown, setPasswordShown] = useState(false);

    const [authState, setAuthState] = useState({
        email: '',
        password: ''
    })

    const [pageState, setPageState] = useState({
        error: '',
        processing: false
    })

    const handleFieldChange = (e) => {
        setAuthState(old => ({...old, [e.target.id]: e.target.value}))
    }
    const simplifyError = (error) => {
        const errorMap = {
            'CredentialsSignin': 'Kullanıcı adı veya şifre hatalı.3'
        }
        return errorMap[error] || "Hata oluştu."
    }

    const handleAuth = async () => {
        setPageState(old => ({...old, processing: true, error: ''}))
        signIn('credentials', {
            ...authState,
            redirect: false
        }).then(response => {
            if (response.ok) {
            } else {
                setPageState(old => ({...old, processing: false, error: response.error}))
            }
        }).catch(error => {
            setPageState(old => ({...old, processing: false, error: error.message || "Hata oluştu."}))

        })
    }

    const togglePassword = () => {
        setPasswordShown(!passwordShown);
    };
    const {error} = useRouter().query;

    if (status === "loading") {
        return <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div className="text-center">
                <Spinner animation="border" className="mb-3" variant="primary"/>
                <h5>Yükleniyor...</h5>
            </div>
        </div>
    }
    if (session) {
        if (session.user.permission_id == 1) {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/userDashboard";
        }
    } else {
        return (
            <>
                <Title title="Giriş Yap"/>
                <ThemeProvider theme={theme}>
                    <Grid container component="main" sx={{height: '100vh'}}>
                        <CssBaseline/>
                        <Grid
                            item
                            xs={false}
                            sm={4}
                            md={7}
                            sx={{
                                backgroundImage: 'url(loginBg.jpg)',
                                backgroundRepeat: 'no-repeat',
                                backgroundColor: (t) =>
                                    t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square
                              className="align-items-center d-flex">
                            <Box
                                sx={{
                                    my: 8,
                                    mx: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <img src="/public/logo.png" className="col-6 mx-auto mb-5" alt=""/>
                                <div>
                                    <input name="csrfToken" type="hidden" defaultValue={csrfToken}/>
                                    <input name="ipAddress" type="hidden" defaultValue={ipAddress}/>
                                    {
                                        pageState.error !== '' &&
                                        // <Alert severity='error'>{simplifyError(pageState.error)}</Alert>
                                        <p className="alert alert-danger py-1 fs-7 w-100 text-center" role="alert">
                                            <i className="far fa-exclamation-circle me-1"></i>
                                            {simplifyError(pageState.error)}</p>
                                    }
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={authState.email}
                                        onChange={handleFieldChange}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Şifre"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        value={authState.password}
                                        onChange={handleFieldChange}
                                    />

                                    {/*<FormControlLabel*/}
                                    {/*    control={<Checkbox value="remember" color="primary"/>}*/}
                                    {/*    label="Beni hatırla"*/}
                                    {/*/>*/}
                                    <Button
                                        disabled={pageState.processing}
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{mt: 3, mb: 2, textTransform: 'capitalize'}}
                                        onClick={handleAuth}
                                    >
                                        Giriş Yap
                                    </Button>

                                </div>


                                {/*<Grid container>*/}
                                {/*    <Grid item xs>*/}
                                {/*        <Link href="#" variant="body2">*/}
                                {/*            Şifremi unuttum*/}
                                {/*        </Link>*/}
                                {/*    </Grid>*/}
                                {/*</Grid>*/}
                                <Copyright sx={{mt: 5}}/>
                            </Box>
                        </Grid>
                    </Grid>
                </ThemeProvider>
            </>
        );
    }
}
