import {decode} from "next-auth/jwt";
import {Op,Sequelize} from "sequelize";
import CustomersToOfficial from "../../models/customerToOfficial";
import CustomerOfficial from "../../models/customerOfficial";

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
        CustomerOfficial.hasOne(CustomersToOfficial, {
            sourceKey: 'id',
            foreignKey: 'official_id'
        });
        const id = req.query.id;
        const query = req.query.query;
        const customerOfficial = await CustomerOfficial.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'label'], ['id', 'value']],
            where: {
                [Op.or]: [
                    {name: {[Op.substring]: query}},
                    {surname: {[Op.substring]: query}},
                    {id: {[Op.like]: query}}
                ],
                '$customerToOfficial.customer_id$': id,
            },
            include: [{
                model: CustomersToOfficial,
                as: 'customerToOfficial'
            }],
            limit: 10
        });
        res.json(customerOfficial);
    }
}