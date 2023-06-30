import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: `/`
    },
    cookies: {
        sessionToken: {
            name: `__Crm-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true
            }
        },
        callbackUrl: {
            name: `Crm-next-auth.session-token.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: true
            }
        },
        csrfToken: {
            name: `Crm-next-auth.session-token.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true
            }
        },
        pkceCodeVerifier: {
            name: `Crm-next-auth.session-token.pkce.code_verifier`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true
            }
        },
        state: {
            name: `Crm-next-auth.session-token.state`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: true,
            },
        },
    },
    providers: [
        CredentialsProvider({
                //name: 'Credentials',

                //type: "credentials",
                //credentials: {},
                async authorize(credentials, req) {
                    const res = await fetch(`${process.env.NEXTAUTH_URL}api/login`, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    const user = await res.json()
                    if (res.ok && user) {
                        return user
                    }
                    return null
                    //else {
                    //    throw new Error(user.exception);
                    //}
                }
            }
        )
    ],
    callbacks: {
        session: async ({session, token}) => {
            if (session?.user) {
                session.user.id = token.uid;
                session.user.surname = token.surname;
                session.user.name_surname = token.name_surname;
                session.user.avatar = token.avatar;
                session.user.permission_id = token.permission_id;
                session.accessToken = token.accessToken;
                session.user.personel_code = token.personel_code
            }
            return session;
        },
        jwt: async ({user, token}) => {
            if (user) {
                token.uid = user.id;
                token.surname = user.surname;
                token.name_surname = user.name_surname;
                token.avatar = user.avatar;
                token.permission_id = user.permission_id;
                token.accessToken = user.access_token;
                token.personel_code = user.personel_code
            }
            return token;
        },
    },
    secret: process.env.SECRET

}

export default NextAuth(authOptions)

