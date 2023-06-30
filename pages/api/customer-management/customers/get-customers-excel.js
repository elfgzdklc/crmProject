import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Customers from "../../models/customers";
import CustomerCategories from "../../models/customerCategories";
import CustomerContacts from "../../models/customerContacts";

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
        const {search} = req.body;
        const customers = await Customers.findAll({
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
                },
                '$customerContact.address_type$': 0
            },
            include: [{
                model: CustomerCategories,
                as: 'customerCategory'
            },
                {
                    model: CustomerContacts,
                    as: 'customerContact'
                }]
        });
        res.json({
            data: customers
        });
    }
}