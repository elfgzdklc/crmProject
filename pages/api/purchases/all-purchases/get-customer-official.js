import {decode} from "next-auth/jwt";
import { Sequelize } from "sequelize";
import CustomerOfficial from "../../models/customerOfficial";
import CustomerToOfficial from "../../models/customerToOfficial";
import PurchaseDetails from "../../models/purchaseDetails";
import Products from "../../models/products";
import Purchases from "../../models/purchases";

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
        Purchases.hasOne(PurchaseDetails, {sourceKey: 'id', foreignKey: 'purchase_id'});
        PurchaseDetails.hasOne(Products, {sourceKey: 'product_id', foreignKey: 'id'});
        CustomerOfficial.hasOne(CustomerToOfficial, {sourceKey: 'id', foreignKey: 'official_id'});
        
        const {customer_id} = req.body;
        const customerOfficial = await CustomerOfficial.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'fullName'] ,'email','phone'],
            limit: 1,
            order: [
                ["id", "desc"]
            ],
            where: {
                '$customerToOfficial.customer_id$' : customer_id
            },
            include: [{
                model: CustomerToOfficial,
                as : 'customerToOfficial'
            }],
        });
        res.json(customerOfficial);
    }
}
