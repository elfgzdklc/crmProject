import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Purchases from "../models/purchases";
const moment = require("moment");
const Sales = require("../models/sales");
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
        let sumTotalMonthSales = [];
        let sumTotalMonthBuying = [];
        let sum = 0;
        let sumBuying = 0;
        for (let i = 5; i >= 0; i--) {
            let start = moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD')
            let end = moment().subtract(i, 'months').endOf('month').format('YYYY-MM-DD')
            const totalSales = await Sales.findAll({
                attributes: ['overall_total'],
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    }
                }
            });
            for (let i = 0; i < totalSales.length; i++) {
                let totalValue = totalSales[i].overall_total
                sum = sum + parseFloat(totalValue)
            }
            sumTotalMonthSales.push(sum)
            sum = 0;
        }
        for (let i = 5; i >= 0; i--) {
            let start2 = moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD')
            let end2 = moment().subtract(i, 'months').endOf('month').format('YYYY-MM-DD')
            const totalBuying = await Purchases.findAll({
                attributes: ['overall_total'],
                where: {
                    created_at: {
                        [Op.between]: [start2, end2]
                    }
                }
            });

            for (let i = 0; i < totalBuying.length; i++) {
                let totalValue2 = totalBuying[i].overall_total
                sumBuying = sumBuying + parseFloat(totalValue2)
            }
            sumTotalMonthBuying.push(sumBuying);
            sumBuying = 0;
        }
        if (sumTotalMonthSales || sumTotalMonthBuying) {
            res.json({
                data: sumTotalMonthSales,
                sumTotalMonthBuying: sumTotalMonthBuying
            })
        } else {
            res.json({
                message: 'Satış Bulunamadı'
            })
        }
    }
}