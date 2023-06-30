import {decode} from "next-auth/jwt";
import {Op, Sequelize} from "sequelize";
import Brands from "../models/brands";
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
        res.status(401).json({error: "Yetkisiz giriş"})
    } else {
        if (!Offers.hasAlias('customerContactsInvoice')) {
            Offers.hasOne(CustomerContacts, {sourceKey: 'invoice_address', foreignKey: 'id'});
            Offers.belongsTo(CustomerContacts, {as: 'customerContactsInvoice', foreignKey: 'invoice_address'});
        }
        if (!Offers.hasAlias('customerContactsShipment')) {
            Offers.hasOne(CustomerContacts, {sourceKey: 'shipment_address', foreignKey: 'id'});
            Offers.belongsTo(CustomerContacts, {as: 'customerContactsShipment', foreignKey: 'shipment_address'});
        }
        Offers.hasMany(OfferDetails, {foreignKey: 'offer_id', sourceKey: 'id'});
        OfferDetails.belongsTo(Offers, {foreignKey: 'offer_id', targetKey: 'id'});

        Customers.hasMany(CustomerToOfficial, {foreignKey: 'customer_id'});
        Offers.belongsTo(Customers, {foreignKey: 'customer_id'});

        CustomerToOfficial.hasOne(CustomerOfficial, {sourceKey: 'official_id', foreignKey: 'id'});
        Offers.belongsTo(CustomerToOfficial, {foreignKey: 'customer_id'});

        Customers.hasMany(CustomerToUser, {foreignKey: 'customer_id'});
        Offers.belongsTo(Customers, {foreignKey: 'customer_id'});

        CustomerToUser.hasOne(Users, {sourceKey: 'assigned_user_id', foreignKey: 'id'});
        Offers.belongsTo(CustomerToUser, {foreignKey: 'customer_id'});

        OfferDetails.hasMany(Products, {sourceKey: 'product_id', foreignKey: 'id'});
        OfferDetails.belongsTo(Offers, {foreignKey: 'offer_id', targetKey: 'id'});

        Products.hasOne(Brands, {sourceKey: 'brand_id', foreignKey: 'id'})
        OfferDetails.belongsTo(Products, {foreignKey: 'product_id', targetKey: 'id'})

        const {limit, page, sortColumn, sortType, search} = req.body;
        const total = await Offers.findAll({
                where: {
                    status: 4,
                    revised: 0
                }
            }
        );
        const offers = await Offers.findAll({
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
                    Sequelize.where(Sequelize.fn("concat", Sequelize.col("offer_code"), "-", Sequelize.col("revised_code")), {
                        [Op.substring]: [
                            search
                        ]
                    }),
                ],
                status: 4,
                revised: 0
            },
            include: [
                {
                    attributes: ['id', 'customer_code', 'trade_name', 'tax_number'],
                    model: Customers,
                    as: 'customer',
                    include: [
                        {
                            attributes: ['id', 'official_id'],
                            model: CustomerToOfficial,
                            as: 'customerToOfficials',
                            include: [{
                                attributes: ['id', 'name', 'surname', 'phone', 'email'],
                                model: CustomerOfficial,
                                as: 'customerOfficial'
                            }]
                        }, {
                            attributes: ['id', 'assigned_user_id'],
                            model: CustomerToUser,
                            as: 'customerToUsers',
                            include: [{
                                attributes: ['id', 'name', 'surname', 'phone'],
                                model: Users,
                                as: 'user'
                            }]
                        }
                    ],
                },
                {
                    model: CustomerContacts,
                    as: 'customerContactsInvoice',
                    required: true
                },
                {
                    model: CustomerContacts,
                    as: 'customerContactsShipment',
                    required: true
                },
                {
                    model: OfferDetails,
                    as: 'offerDetails',
                    include: [
                        {
                            attributes: ['id', 'brand_id', 'kilogram', 'product_code', 'product_desc'],
                            model: Products,
                            as: 'products',
                            include: [{
                                model: Brands,
                                as: 'brand'
                            }]

                        }
                    ],
                }
            ]
        });
        res.json({
            total: total.length,
            data: offers
        });
    }
}
