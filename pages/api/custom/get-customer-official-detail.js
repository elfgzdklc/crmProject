import {decode} from "next-auth/jwt";
import CustomerOfficial from "../models/customerOfficial";
import CustomerToOfficial from "../models/customerToOfficial";

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
        CustomerToOfficial.hasOne(CustomerOfficial, {
            sourceKey: 'official_id',
            foreignKey: 'id'
        });
        const {customer_id} = req.body;
        const customer_offical_detail = await CustomerToOfficial.findAll({
            group: ['official_id'],
            where: {
                customer_id: customer_id,
            },
            include: [{
                model: CustomerOfficial,
                as: 'customerOfficial'
            }],
        });
        res.json(customer_offical_detail);
    }
}