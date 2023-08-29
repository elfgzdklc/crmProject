import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import fetch from 'node-fetch';

const options = {
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
            async authorize(credentials) {
                const { email, password } = credentials;
                try {
                    const response = await fetch(`${process.env.NEXTAUTH_URL}api/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });
                    if (response.ok) {
                        // İstek başarılı, oturum açma başarılı
                        const user = await response.json();
                        return user;
                    } else {
                        // İstek başarısız, oturum açma başarısız
                        throw new Error('Kullanıcı adı veya şifre hatalı');
                    }
                } catch (error) {
                    // Hata oluştu
                    throw new Error('Sunucu hatası2');
                }
            }
        })
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
const Auth = (req, res) => NextAuth(req, res, options)
export default Auth;

