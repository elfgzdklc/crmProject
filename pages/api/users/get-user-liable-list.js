import {Sequelize, Op} from "sequelize";
import User from "../models/users";
import {decode} from "next-auth/jwt";

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
        const users = await User.findAll({
            where: {
                [Op.and]: [
                    {
                        user_liable: {
                            [Op.eq]: 1
                        }
                    },
                ],
            }
        });
        res.json({
            data: users
        });
    }
}