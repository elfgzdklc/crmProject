import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const moment = require("moment");
const Events = require('../models/events');

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
        const {limit, page, sortColumn, sortType, search, user_id} = req.body;
        const moment = require('moment');
        const weekStart = moment().startOf('week').format('YYYY-MM-DD');
        const weekEnd = moment().endOf('week').format('YYYY-MM-DD');
        const total = await Events.findAll(
            {
                where: {
                    start: {
                        [Op.between]: [weekStart, weekEnd]
                    },
                    user_id: {
                        [Op.eq]: user_id
                    },
                }
            }
        );
        const events = await Events.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                start: {
                    [Op.between]: [weekStart, weekEnd]
                },

                user_id: {
                    [Op.eq]: user_id
                },
                [Op.or]: [
                    {
                        title: {
                            [Op.substring]: [search]
                        }
                    }
                ]
            }
        });
        if (events) {
            res.json({
                total: total.length,
                data: events,
            })
        } else {
            res.json({
                status: false,
                message: 'Etkinlik Bulunamadı'
            })
        }

    }
}