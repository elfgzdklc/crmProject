import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const Users = require('../models/users');

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
        const user_id = req.body.user_id;
        const userLiable = await Users.findAll({
            attributes: ['user_liable'],
            where:{
                id:user_id,
            }
        });
        if (userLiable) {
            res.json({
                data: userLiable
            })
        } else {
            res.json({
                message: 'Sorumlu Değilsiniz Bulunamadı'
            })
        }
    }
}