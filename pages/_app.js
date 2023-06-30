import '../styles/iconall.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-select-search/style.css'
import {Spinner} from "react-bootstrap";
import {getCsrfToken, SessionProvider, useSession} from "next-auth/react"
import Layout from "../components/Layout";
import 'rsuite/dist/rsuite.min.css';
import '../public/assets/css/globals.css';
import 'react-big-calendar/lib/sass/styles.scss'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import "react-datepicker/dist/react-datepicker.css";
import 'react-calendar/dist/Calendar.css';

// export async function getServerSideProps(context) {
//     const token = context.req.cookies['__Crm-next-auth.session-token']
//     console.log("token app" + token)
//     if (token) {
//         return {
//             props: {
//                 token: token
//             }
//         }
//     } else {
//         context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
//     }
// }

export default function App({Component, pageProps: {session, ...pageProps}}) {
    return (
        <SessionProvider session={session}>
            {Component.auth ? (
                <Auth>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </Auth>
            ) : (
                <>
                    <Component {...pageProps} />
                </>
            )}
        </SessionProvider>
    )
}

function Auth({children}) {
    // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
    const {status} = useSession({required: true})
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
    return children
}

