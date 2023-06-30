import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Departments from "../models/departments";
import Permissions from "../models/permissions";
import User from "../models/users";

User.hasOne(Departments, {
    sourceKey: 'department_id',
    foreignKey: 'id'
});

User.hasOne(Permissions, {
    sourceKey: 'permission_id',
    foreignKey: 'id'
});

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
        // const id=req.query.id
        const {limit, page, sortColumn, sortType, search,id} = req.body;
        const total = await User.findAll(
            {
                where: {
                    [Op.and]: [
                        {
                            parent_id: {
                                [Op.eq]: id
                            }
                        },
                        {
                            id: {
                                [Op.ne]: id
                            }
                        }
                    ],
                },
            }
        );
        const users = await User.findAll(
            {
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    [Op.and]: [
                        {
                            parent_id: {
                                [Op.eq]: id
                            }
                        },
                        {
                            id: {
                                [Op.ne]: id
                            }
                        }
                    ],
                    [Op.or]: [
                        {
                            email: {
                                [Op.substring]: [search]
                            },
                            name: {
                                [Op.substring]: [search]
                            }
                        }
                    ],
                },
                include: [
                    {
                        as :'department',
                        model: Departments,
                    },
                    {
                        as :'permission',
                        model: Permissions,
                    }
                ]
            }
        );
        res.json({
            total: total.length,
            data: users
        });
    }
}