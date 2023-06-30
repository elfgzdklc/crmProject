import {decode} from "next-auth/jwt";
import {Op, Sequelize} from "sequelize";
import Customers from "../models/customers";
import CustomersToUser from "../models/customerToUser";

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
        Customers.hasOne(CustomersToUser, {
            sourceKey: 'id',
            foreignKey: 'customer_id'
        });

        const id = req.query.id;
        const query = req.query.query;
        const customers = await Customers.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("customer_code"), " ", Sequelize.col("trade_name")), 'label'], ['id', 'value']],
            where: {
                [Op.or]: [
                    {customer_code: {[Op.substring]: query}},
                    {trade_name: {[Op.substring]: query}},
                    {id: {[Op.like]: query}}
                ],
                type: 0,
                '$customerToUser.assigned_user_id$': id,
                '$customerToUser.status$': 0
            },
            include: [{
                model: CustomersToUser,
                as: 'customerToUser'
            }],
            limit: 10
        });
        res.json(customers);
    }
}