import {Op, Sequelize} from "sequelize";
import {decode} from "next-auth/jwt";
import Products from "../models/products";
import SalesDetails from "../models/salesDetails";

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
        Products.hasOne(SalesDetails, {sourceKey: 'id', foreignKey: 'product_id'});
        const sales_id = req.query.id;
        const query = req.query.query;
        const sales_product = await Products.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("product_code"), " ", Sequelize.col("products.product_name")), 'label'], ['id', 'value']],
            where: {
                [Op.or]: [
                    {product_code: {[Op.substring]: query}},
                    {product_name: {[Op.substring]: query}},
                ],
                '$salesDetail.sales_id$': sales_id
            },
            include: [{
                model: SalesDetails,
                attributes: ["id", "product_id"],
                as: 'salesDetail'
            }],
            limit: 10
        });
        res.json(sales_product);
    }
}