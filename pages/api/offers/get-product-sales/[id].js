import {decode} from "next-auth/jwt";
import Sales from "../../models/sales";
import SalesDetails from "../../models/salesDetails";


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
        SalesDetails.hasOne(Sales, {sourceKey: 'sales_id', foreignKey: 'id'});
        SalesDetails.belongsTo(Sales, {foreignKey: 'sales_id'});
        
        const id = req.query.id;
        const product_sales = await SalesDetails.findAll({
            limit: 10,
            order: [["created_at", "desc"]],
            where: {
                product_id: id
            },
            include: [{
                attributes: ['customer_id', 'customer_trade_name'],
                model: Sales,
                as:'sale'
            }]
        });
        res.json(product_sales);
    }
}