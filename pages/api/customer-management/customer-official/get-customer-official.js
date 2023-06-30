import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
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
        const {limit, page, sortColumn, sortType, search} = req.body;
        const total = await CustomerOfficial.findAll();
        const customerOfficial = await CustomerOfficial.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        surname: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        email: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    },
                    {
                        phone: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    }
                ],
            },
        });
        res.json({
            total: total.length,
            data: customerOfficial
        });
    }
}