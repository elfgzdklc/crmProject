import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Users from "../models/users";

export default async (req, res) => {
    const nowTime = new Date().getTime();
    let tokenSession = null;

    try {
        tokenSession = await decode({
            token: req?.headers?.authtoken ?? '',
            secret: process.env.SECRET
        });
    } catch (e) {
        console.log(e.message)
    }
    // 401 Unauthorized if auth token is not null, or the expiration token is minor than actual time
    if (!tokenSession || tokenSession.exp > nowTime) {
        res.status(401).json({error: "Yetkisiz giriş"})
    } else {
        const session = await getSession({req});
        const user_id = session.user.id;
        const user_liable = await Users.findAll({
            attributes: ['user_liable'],
            where: {
                id: user_id
            }
        });
        res.json(user_liable);
    }
}