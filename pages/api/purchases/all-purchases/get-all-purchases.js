import {decode} from "next-auth/jwt";
import { Op } from "sequelize";
import CustomerOfficial from "../../models/customerOfficial";
import CustomerToOfficial from "../../models/customerToOfficial";
import Products from "../../models/products";
import PurchaseDetails from "../../models/purchaseDetails";
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

        const {limit, page, sortColumn, sortType, search} = req.body;
        const purchases = await Purchases.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                [Op.or]: [
                    {
                        customer_trade_name: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        '$purchaseDetail.product.product_code$': {
                            [Op.substring]: [
                                search
                            ]
                        }
                    }
                ]
            },
            include: [{
                model: PurchaseDetails,
                as:'purchaseDetail',
                include: [{
                    model: Products,
                    as:'product',
                    attributes: ['product_code']
                }]
            }],
        });
        res.json({
            total: purchases.length,
            data: purchases
        });
    }
}
