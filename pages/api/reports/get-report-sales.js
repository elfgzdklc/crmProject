import {Op} from "sequelize";
import {decode} from "next-auth/jwt";

const moment = require("moment");
const Sales = require('../models/sales');

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
        const monthStart = moment().startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
        const totalSales = await Sales.findAll(
            {
                where: {
                    created_at: {
                        [Op.between]: [monthStart, monthEnd]
                    }
                }
            }
        );
        const totalPendingSales = await Sales.findAll(
            {
                where: {
                    created_at: {
                        [Op.between]: [monthStart, monthEnd]
                    },
                    status: 0
                }
            }
        );

        const totalRealizedSales = await Sales.findAll(
            {
                where: {
                    created_at: {
                        [Op.between]: [monthStart, monthEnd]
                    },
                    status: 1
                }
            }
        );

        res.json({
            totalSales: totalSales.length,
            totalPendingSales: totalPendingSales.length,
            totalRealizedSales: totalRealizedSales.length
        })

    }
}