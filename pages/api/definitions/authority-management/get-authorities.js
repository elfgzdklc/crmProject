import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Permissions from "../../models/permissions";
import PermissionDetails from "../../models/permissionDetails";

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
        Permissions.hasOne(PermissionDetails, {
            sourceKey: 'id',
            foreignKey: 'permission_id'
        });
        const {limit, page, sortColumn, sortType, search} = req.body;
        const total = await Permissions.findAll();
        const permissions = await Permissions.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                [Op.or]: [
                    {
                        permission_name: {
                            [Op.substring]: [
                                search
                            ]
                        }
                    }
                ]
            },
            include: [{
                as: 'permissionDetail',
                model: PermissionDetails
            }],
        });
        res.json({
            total: total.length,
            data: permissions
        });
    }
}