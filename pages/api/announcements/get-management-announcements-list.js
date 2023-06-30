import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import User from "../models/users";
import Departments from "../models/departments";
import AnnouncementsDetail from "../models/announcementDetails";
const Announcements=require("../models/announcements");

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
        const total = await Announcements.findAll( );
        const announcements = await Announcements.findAll({
            include:[{
                as: 'user',
                model:User
            }],
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where:{
                [Op.or]: [
                    {
                        subject: {
                            [Op.substring]: [search]
                        },
                        message: {
                            [Op.substring]: [search]
                        },
                    }
                ],
            }
        });
        res.json({
            total: total.length,
            data: announcements
        });
    }
}