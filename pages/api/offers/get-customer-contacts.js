import {decode} from "next-auth/jwt";
import CustomerContacts from "../models/customerContacts";

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
        const customer_contacts = await CustomerContacts.findAll({
            attributes: ['id', 'address', 'district_name', 'province_name', 'country_name','address_type'],
            where: {
                customer_id: req.body.customer
            }
        });
        res.json(customer_contacts);
    }
}