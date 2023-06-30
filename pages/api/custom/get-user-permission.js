import {decode} from "next-auth/jwt";
import PermissionDetail from "../models/permissionDetails";

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
        const permission_id = req.body.user_permission_id;
        const user_permission = await PermissionDetail.findAll({
            where: {
                permission_id: permission_id
            }
        });
        res.json(user_permission);
    }
}