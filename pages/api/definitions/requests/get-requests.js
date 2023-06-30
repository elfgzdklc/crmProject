import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Customers from "../../models/customers";
import CustomerRequest from "../../models/customerRequest";
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
        CustomerRequest.hasOne(Customers, {
            sourceKey: 'customer_id',
            foreignKey: 'id'
        });
        CustomerRequest.hasOne(Users, {
            sourceKey: 'request_user_id',
            foreignKey: 'id'
        });

        const {limit, page, sortColumn, sortType, search} = req.body;
        const total = await CustomerRequest.findAll();
        const logs = await CustomerRequest.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                [Op.or]: [
                    {
                        customer_type: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        '$user.email$': {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        '$customer.trade_name$': {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                ]
            },
            include: [{
                model: Customers,
                as: 'customer'
            },
                {
                    model: Users,
                    as: 'user'
                }
            ]
        });
        res.json({
            total: total.length,
            data: logs
        });
    }
}