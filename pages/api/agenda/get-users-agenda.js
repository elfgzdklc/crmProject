import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const Events = require("../models/events");
const moment = require("moment");

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
        const events = await Events.findAll({
            where: {
                user_id:{
                    [Op.eq]: user_id
                }
            }
        });
        if (events) {
            res.json({
                status: true,
                data: events,
                start: moment().format('YYYY,MM,DD,HH,mm,ss'),
                end: moment().format('YYYY,MM,DD,HH,mm,ss'),
            })
        } else {
            res.json({
                status: false,
                message: 'Etkinlik Bulunamadı'
            })
        }
    }
}