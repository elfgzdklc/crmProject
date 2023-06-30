import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import AnnouncementsDetail from "../models/announcementDetails";
import Announcements from "../models/announcements";
import User from "../models/users";
import Departments from "../models/departments";

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
            }
        );
        AnnouncementsDetail.hasOne(Announcements,{
            sourceKey: 'announcement_id',
            foreignKey: 'id'
        })
        Announcements.hasOne(User,{
            sourceKey:'user_id',
            foreignKey:'id'
        })
        const session = await getSession({req});
        const user_id = session.user.id;
        const announcements=await AnnouncementsDetail.findAll({
            include:[{
                as: 'announcement',
                model:Announcements
            }],
            where:{
                user_id:user_id,
                status:1
            }
        });
        if (announcements){
            res.json({
                status:true,
                data:announcements
            })
        }else{
            res.json({
                status: false,
                message: 'Duyuru Bulunamadı'
            })
        }
    }
}