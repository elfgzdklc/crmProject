import {decode} from "next-auth/jwt";
import Customers from "../../models/customers";

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
        const customer_id = req.body.customer_id;
        const customer_name = await Customers.findAll({
            attributes: ['trade_name'],
            where: {
                id: customer_id
            }
        });
        res.json(customer_name[0]['trade_name']);
    }
}