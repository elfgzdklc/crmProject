import {Op} from "sequelize";
import {decode} from "next-auth/jwt";

const moment = require("moment");
const Customers = require('../models/customers');

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
        const totals = await Customers.findAll({
            where: {
                type: {
                    [Op.ne]: 2
                },
            }
        });
        const totalCustomers = await Customers.findAll(
            {
                where: {
                    type: 0
                }
            }
        );
        const totalPotentialCustomers = await Customers.findAll(
            {
                where: {
                    type: 1
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
