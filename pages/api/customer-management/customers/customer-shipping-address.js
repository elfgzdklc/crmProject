import {decode} from "next-auth/jwt";
import CustomerContacts from "../../models/customerContacts";

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
        const customer_shipping_address = await CustomerContacts.findAll({
            where: {
                customer_id: customer_id,
                address_type: 1
            }
        });
        res.json(customer_shipping_address);
    }
}