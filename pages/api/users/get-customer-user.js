import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import User from "../models/users";
import CustomerToUser from "../models/customerToUser";
import Customers from "../models/customers";
import CustomerCategories from "../models/customerCategories";

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
        Customers.hasOne(CustomerToUser, {
            sourceKey: 'id',
            foreignKey: 'customer_id'
        });
        const {id, limit, page, sortColumn, sortType, search} = req.body;
        const user = await User.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'fullName']],
            where: {
                id: id
            },
        })
        const total = await CustomerToUser.findAll({
            where: {
                assigned_user_id: id
            }
        });
        const customerUser = await Customers.findAll(
            {
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    [Op.or]: [
                        {
                            customer_code: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            trade_name: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            '$customerToUser.customer_type$': {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                    ],
                    '$customerToUser.assigned_user_id$': id,
                },
                include: [
                    {
                        model: CustomerToUser,
                        as : 'customerToUser'
                    }
                ]
            }
        );
        res.json({
            user: user[0],
            total: total.length,
            data: customerUser
        });
    }
}
