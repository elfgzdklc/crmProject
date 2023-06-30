import {decode} from "next-auth/jwt";
import {Op} from "sequelize";
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
        res.status(401).json({error: "Yetkisiz giriş"})
    } else {
        Products.hasOne(Brands, {
            sourceKey: 'brand_id',
            foreignKey: 'id'
        });
        Products.hasOne(ProductCategories, {
            sourceKey: 'product_category_id',
            foreignKey: 'id'
        });
        if (!Products.hasAlias('brandDetail')) {
            Products.belongsTo(Brands, {as: 'brandDetail', foreignKey: 'brand_id'});
        }
        if (!Products.hasAlias('productCategoryDetail')) {
            Products.belongsTo(ProductCategories, {as: 'productCategoryDetail', foreignKey: 'product_category_id'});
        }
        const {search} = req.body;
        const products = await Products.findAll({
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
                        '$brandDetail.brand_name$': {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        '$productCategoryDetail.category_name$': {
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
                    as: 'brandDetail'
                }, {
                    model: ProductCategories,
                    as: 'productCategoryDetail'
                }
            ]
        });
        res.json({
            data: products
        });
    }
}
