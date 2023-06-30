import { decode } from "next-auth/jwt";
import PurchaseDetails from "../../../models/purchaseDetails";
import Purchases from "../../../models/purchases";

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
        res.status(401).json({ error: "Yetkisiz giriş" })
    } else {
        PurchaseDetails.hasOne(Purchases, { sourceKey: 'purchase_id', foreignKey: 'id' });
        PurchaseDetails.belongsTo(Purchases, { foreignKey: 'purchase_id' });
        const id = req.query.id;
        const product_purchase = await PurchaseDetails.findAll({
            limit: 10,
            order: [["created_at", "desc"]],
            where: {
                product_id: id
            },
            include: [{
                attributes: ['customer_id', 'customer_trade_name'],
                model: Purchases,
                as:'purchase'
            }]
        });
        res.json(product_purchase);
    }
}
