import {decode} from "next-auth/jwt";
import Sales from "../models/sales";
import Users from "../models/users";
import Offers from "../models/offers";
import {Sequelize} from "sequelize";

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
        Sales.hasOne(Offers, {sourceKey: 'offer_code', foreignKey: 'offer_code'});
        Offers.hasOne(Users, {sourceKey: 'user_id', foreignKey: 'id'});
        const sales_id = req.body.sales_id;
        const sales = await Sales.findAll({
            attributes: ["customer_id", "customer_trade_name", "offer_code"],
            where: {
                id: sales_id,
            },
            include: [
                {
                    model: Offers,
                    attributes: ["user_id"],
                    as: 'offer',
                    include: [{
                        as: 'user',
                        model: Users,
                        attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'fullName']],
                    }]
                }
            ],
        });
        res.json(sales);
    }
}