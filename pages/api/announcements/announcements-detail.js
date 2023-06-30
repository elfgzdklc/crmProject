import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import User from "../models/users";
const Announcements=require("../models/announcements");
const AnnouncementsDetail=require("../models/announcementDetails");

AnnouncementsDetail.hasOne(Announcements,{
    sourceKey: 'announcement_id',
    foreignKey: 'id'
})
Announcements.hasOne(User,{
    sourceKey:'user_id',
    foreignKey:'id'
})

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
        const {id} = req.body;
        const users = await AnnouncementsDetail.findAll(
            {
                include:[{
                    as: 'announcement',
                    model:Announcements
                }],
                where:{
                    announcement_id:id,
                }
            }
        );
        res.json({
            data: users
        });
    }
}