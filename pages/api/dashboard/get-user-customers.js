import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";

const moment = require("moment");
const CustomerToUser = require('../models/customerToUser');

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
        res.type(401).json({error: "Yetkisiz giriş"})
    } else {
        const monthStart = moment().startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
        const session = await getSession({req});
        const user_id = session.user.id;

        const totals = await CustomerToUser.findAll(
            {
                where: {
                    assigned_user_id: user_id,
                    created_at: {
                        [Op.between]: [monthStart, monthEnd]
                    }
                },
                [Op.and]: [{customer_type: "Firma"}, {customer_type: "Potansiyel Firma"}],
            }
        );
        const totalCustomers = await CustomerToUser.findAll(
            {
                where: {
                    assigned_user_id: user_id,
                    created_at: {
                        [Op.between]: [monthStart, monthEnd]
                    },
                    customer_type: "Firma"
                }
            }
        );
        const totalPotentialCustomers = await CustomerToUser.findAll(
            {
                where: {
                    assigned_user_id: user_id,
                    created_at: {
                        [Op.between]: [monthStart, monthEnd]
                    },
                    customer_type: "Potansiyel Firma"
                }
            }
        );

        res.json({
            totals: totals.length,
            totalCustomers: totalCustomers.length,
            totalPotentialCustomers: totalPotentialCustomers.length,
        })

    }
}