import { decode } from "next-auth/jwt";
import { Op } from "sequelize";
import Brands from "../../models/brands";
import ProductCategories from "../../models/productCategories";
import Products from "../../models/products";

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
        Products.hasOne(Brands, {
            sourceKey: 'brand_id',
            foreignKey: 'id'
        });
        Products.hasOne(ProductCategories, {
            sourceKey: 'product_category_id',
            foreignKey: 'id'
        });
        if (!Products.hasAlias('brandDetailProduct')) {
            Products.belongsTo(Brands, { as: 'brandDetailProduct', foreignKey: 'brand_id' });
        }
        if (!Products.hasAlias('productCategoryDetailProduct')) {
            Products.belongsTo(ProductCategories, { as: 'productCategoryDetailProduct', foreignKey: 'product_category_id' });
        }
        const { limit, page, sortColumn, sortType, search } = req.body;
        const total = await Products.findAll();
        const products = await Products.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],

            where: {
                [Op.or]: [
                    {
                        product_name: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        product_code: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        '$brandDetailProduct.brand_name$': {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        '$productCategoryDetailProduct.category_name$': {
                            [Op.substring]: [
                                search
                            ]
                        }
                    }
                ]
            },
            include: [
                {
                    model: Brands,
                    as: 'brandDetailProduct'
                }, {
                    model: ProductCategories,
                    as: 'productCategoryDetailProduct'
                }
            ]
        });
        res.json({
            total: total.length,
            data: products
        });
    }
}
