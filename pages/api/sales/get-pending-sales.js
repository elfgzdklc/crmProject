import { decode } from "next-auth/jwt";
import { Op } from "sequelize";
import CustomerContacts from "../models/customerContacts";
import CustomerOfficial from "../models/customerOfficial";
import Customers from "../models/customers";
import CustomerToOfficial from "../models/customerToOfficial";
import CustomerToUser from "../models/customerToUser";
import OfferDetails from "../models/offerDetails";
import Offers from "../models/offers";
import Products from "../models/products";
import Users from "../models/users";

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
        OfferDetails.hasOne(Products, { sourceKey: 'product_id', foreignKey: 'id' });
        Offers.belongsTo(OfferDetails, { foreignKey: 'id', sourceKey: 'offer_id' });
       
        if (!Offers.hasAlias('customerContactsInvoiceSales')) {
            Offers.hasOne(CustomerContacts, { sourceKey: 'invoice_address', foreignKey: 'id' });
            Offers.belongsTo(CustomerContacts, { as: 'customerContactsInvoiceSales', foreignKey: 'invoice_address' });
        }
        
        if (!Offers.hasAlias('customerContactsShipmentSales')) {
            Offers.hasOne(CustomerContacts, { sourceKey: 'shipment_address', foreignKey: 'id' });
            Offers.belongsTo(CustomerContacts, { as: 'customerContactsShipmentSales', foreignKey: 'shipment_address' });
        }
      
        Offers.hasMany(OfferDetails, { foreignKey: 'offer_id', sourceKey: 'id' });
        OfferDetails.belongsTo(Offers, { foreignKey: 'offer_id', targetKey: 'id' });

        Customers.hasMany(CustomerToOfficial, { foreignKey: 'customer_id' });
        Offers.belongsTo(Customers, { foreignKey: 'customer_id' });

        CustomerToOfficial.hasOne(CustomerOfficial, { sourceKey: 'official_id', foreignKey: 'id' });
        Offers.belongsTo(CustomerToOfficial, { foreignKey: 'customer_id' });

        Customers.hasMany(CustomerToUser, { foreignKey: 'customer_id' });
        Offers.belongsTo(Customers, { foreignKey: 'customer_id' });

        CustomerToUser.hasOne(Users, {sourceKey: 'assigned_user_id', foreignKey: 'id'});
        Offers.belongsTo(CustomerToUser, {foreignKey: 'customer_id'});

        const { limit, page, sortColumn, sortType, search } = req.body;
        const total = await Offers.findAll({
            where: {
                [Op.and]: [
                    { status: 1 },
                    { sales_status: 0 },
                    { revised: 0 }
                ]
            }
        }
        );
        const sales = await Offers.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                [Op.or]: [
                    {
                        offer_code: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        customer_trade_name: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        revised_code: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    }
                ],
                status: 1,
                sales_status: 0,
                revised: 0
            },
            include: [
                {
                    model: Customers,
                    as:'customer',
                    include: [
                        {
                            model: CustomerToOfficial,
                            as:'customerToOfficials',
                            include: [{
                                model: CustomerOfficial,
                                as:'customerOfficial'
                            }]
                        }, {
                            attributes: ['id', 'assigned_user_id'],
                            model: CustomerToUser,
                            as:'customerToUsers',
                            include: [{
                                attributes: ['id', 'name', 'surname', 'phone'],
                                model: Users,
                                as:'user'
                            }]
                        }],
                },
                {
                    model: CustomerContacts,
                    as: 'customerContactsInvoiceSales',
                },
                {
                    model: CustomerContacts,
                    as: 'customerContactsShipmentSales',
                },
                {
                    model: OfferDetails,
                    as: 'offerDetails',
                    include: [{
                        attributes: ['id', 'stock'],
                        model: Products,
                        as:'product'
                    }
                    ],
                }
            ]
        });
        res.json({
            total: total.length,
            data: sales
        });
    }
}

