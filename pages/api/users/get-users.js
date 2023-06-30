import {Op, Sequelize} from "sequelize";
import {decode} from "next-auth/jwt";
import User from "../models/users";
import Departments from "../models/departments";
import Permissions from "../models/permissions";
import Offers from "../models/offers";
import OfferDetails from "../models/offerDetails";

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
        User.hasOne(Departments, {
            sourceKey: 'department_id',
            foreignKey: 'id'
        });

        User.hasOne(Permissions, {
            sourceKey: 'permission_id',
            foreignKey: 'id'
        });

        User.hasOne(User, {
            sourceKey: 'parent_id',
            foreignKey: 'id',
        });

        const {limit, page, sortColumn, sortType, search, permission_id, user_id} = req.body;
        if (permission_id == 1) {
            const total = await User.findAll(
                {
                    where: {
                        id: {
                            [Op.ne]: user_id
                        }
                    }
                }
            );

            const userParent = await User.findAll({
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    id: {
                        [Op.ne]: user_id
                    },
                    [Op.or]: [
                        {
                            email: {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            name: {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            surname: {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            '$department.department_name$': {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            '$user.name$': {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            '$user.surname$': {
                                [Op.substring]: [search]
                            },
                        }
                    ],
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: [[Sequelize.fn('concat', Sequelize.col("user.name"), " ", Sequelize.col("user.surname")), 'fullName']],
                    },
                    {
                        model: Departments,
                        as: 'department',
                    },
                    {
                        model: Permissions,
                        as: 'permission',
                    }
                ]
            })

            res.json({
                total: total.length,
                data: userParent
            });
        } else {
            const total = await User.findAll(
                {
                    where: {
                        id: {
                            [Op.ne]: user_id
                        },
                        parent_id: {
                            [Op.eq]: user_id
                        },
                    }
                }
            );
            const users = await User.findAll({
                include: [
                    {
                        model: Departments,
                        as: 'department',
                    },
                    {
                        model: Permissions,
                        as: 'permission',
                    }],
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    [Op.or]: [
                        {
                            email: {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            name: {
                                [Op.substring]: [search]
                            },
                        },
                        {
                            surname: {
                                [Op.substring]: [search]
                            },
                        }
                    ],
                    id: {
                        [Op.ne]: user_id
                    },
                    parent_id: {
                        [Op.eq]: user_id
                    },
                }
            });
            res.json({
                total: total.length,
                data: users
            });
        }
    }
}