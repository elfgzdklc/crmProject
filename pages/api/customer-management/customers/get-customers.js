import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Customers from "../../models/customers";
import CustomerCategories from "../../models/customerCategories";
import CustomerContacts from "../../models/customerContacts";
import CustomerToUser from "../../models/customerToUser";
import {getSession} from "next-auth/react";
import Users from "../../models/users";

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
        Customers.hasOne(CustomerCategories, {
            sourceKey: 'category_id',
            foreignKey: 'id'
        });
        Customers.hasOne(CustomerContacts, {
            sourceKey: 'id',
            foreignKey: 'customer_id'
        });
        Customers.hasOne(CustomerToUser, {
            sourceKey: 'id',
            foreignKey: 'customer_id'
        });
        const session = await getSession({req});
        const userId = session.user.id;
        const userLiable = await Users.findAll({
            attributes: ['user_liable'],
            where: {
                id: userId
            }
        });
        const {limit, page, sortColumn, sortType, search} = req.body;
        if (userLiable[0].user_liable == 1) {   //sorumlu kişilerin görebileceği müşterileri getirir.
            const total = await Customers.findAll({
                where: {
                    type: {[Op.ne]: 1}
                }
            });
            const customers = await Customers.findAll({
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    [Op.or]: [
                        {
                            trade_name: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            customer_code: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            tax_number: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            '$customerCategory.category_name$': {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        }
                    ],
                    type: {
                        [Op.ne]: 1
                    }
                },
                include: [
                    {
                    model: CustomerCategories,
                    as: 'customerCategory'
                },
                    {
                        model: CustomerContacts,
                        as: 'customerContact'
                    }]
            });
            res.json({
                total: total.length,
                data: customers
            });
        }
        else {
            const total = await CustomerToUser.findAll({
                where: {
                    assigned_user_id: userId
                }
            });
            const customers = await Customers.findAll({
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    [Op.or]: [
                        {
                            trade_name: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            customer_code: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            tax_number: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            '$customerCategory.category_name$': {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        }
                    ],
                    type: 0,
                    '$customerToUser.assigned_user_id$': userId
                },
                include: [{
                    model: CustomerCategories,
                    as: 'customerCategory'
                },
                    {
                        model: CustomerContacts,
                        as: 'customerContact'
                    }, {
                        model: CustomerToUser,
                        as: 'customerToUser',
                    }]
            });
            res.json({
                total: total.length,
                data: customers
            });
        }
    }
}
