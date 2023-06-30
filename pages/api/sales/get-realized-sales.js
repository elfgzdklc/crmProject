import { decode } from "next-auth/jwt";
import { Op } from "sequelize";
import Brands from "../models/brands";
import CustomerContacts from "../models/customerContacts";
import CustomerOfficial from "../models/customerOfficial";
import Customers from "../models/customers";
import CustomerToOfficial from "../models/customerToOfficial";
import CustomerToUser from "../models/customerToUser";
import Products from "../models/products";
import Sales from "../models/sales";
import SalesDetails from "../models/salesDetails";
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
        if (!Sales.hasAlias('customerContactsInvoice')) {
            Sales.hasOne(CustomerContacts, { sourceKey: 'invoice_address', foreignKey: 'id' });
            Sales.belongsTo(CustomerContacts, { as: 'customerContactsInvoice', foreignKey: 'invoice_address' });
        }
        
        if (!Sales.hasAlias('customerContactsShipment')) {
            Sales.hasOne(CustomerContacts, { sourceKey: 'shipment_address', foreignKey: 'id' });
            Sales.belongsTo(CustomerContacts, { as: 'customerContactsShipment', foreignKey: 'shipment_address' });
        }

        Sales.hasMany(SalesDetails, { foreignKey: 'sales_id', sourceKey: 'id' });
        SalesDetails.belongsTo(Sales, { foreignKey: 'sales_id', targetKey: 'id' });

        Customers.hasMany(CustomerToOfficial, { foreignKey: 'customer_id' });
        Sales.belongsTo(Customers, { foreignKey: 'customer_id' });

        CustomerToOfficial.hasOne(CustomerOfficial, { sourceKey: 'official_id', foreignKey: 'id' });
        Sales.belongsTo(CustomerToOfficial, { foreignKey: 'customer_id' });

        Customers.hasMany(CustomerToUser, { foreignKey: 'customer_id' });
        Sales.belongsTo(Customers, { foreignKey: 'customer_id' });

        CustomerToUser.hasOne(Users, {sourceKey: 'assigned_user_id', foreignKey: 'id'});
        Sales.belongsTo(CustomerToUser, {foreignKey: 'customer_id'});

        SalesDetails.hasMany(Products, { sourceKey: 'product_id', foreignKey: 'id' });
        SalesDetails.belongsTo(Sales, { foreignKey: 'sales_id', targetKey: 'id' });

        Products.hasOne(Brands, { sourceKey: 'brand_id', foreignKey: 'id' })
        SalesDetails.belongsTo(Products, { foreignKey: 'product_id', targetKey: 'id' })

        const { limit, page, sortColumn, sortType, search } = req.body;
        const total = await Sales.findAll({
            where: {
                status: 1
            }
        }
        );
        const sales = await Sales.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                [Op.or]: [
                    {
                        sales_code: {
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
                        invoice_no: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    }
                ],
                status: 1,
            },
            include: [
                {
                    model: Customers,
                    as:'customer',
                    include: [{
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
                    as: 'customerContactsInvoice',
                    required: true
                },
                {
                    model: CustomerContacts,
                    as: 'customerContactsShipment',
                    required: true
                },
                {
                    model: SalesDetails,
                    as: 'salesDetails',
                    include: [
                        {
                            attributes: ['id', 'brand_id', 'kilogram', 'product_code', 'product_desc', 'stock'],
                            model: Products,
                            as:'products',
                            include: [{
                                model: Brands,
                                as:'brand'
                            }]

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

