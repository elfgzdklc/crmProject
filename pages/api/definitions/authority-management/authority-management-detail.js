import {decode} from "next-auth/jwt";
import PermissionDetails from "../../models/permissionDetails";
import Permissions from "../../models/permissions";

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
        const permission_id = req.body.id;
        const permissionName = await Permissions.findAll({
            attributes: ['permission_name'],
            where: {
                id: permission_id
            }
        });

        const permissionDetail = await PermissionDetails.findAll({
            where: {
                permission_id: permission_id
            }
        });
        res.json({
            permissionDetail : permissionDetail,
            permissionName : permissionName
        });
    }
}