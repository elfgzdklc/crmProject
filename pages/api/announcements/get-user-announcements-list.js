import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";

const Announcements = require("../models/announcements");
const AnnouncementsDetail = require("../models/announcementDetails");
const User = require("../models/users");
const Departments = require("../models/departments");

User.hasOne(Departments, {
        sourceKey: 'department_id',
        foreignKey: 'id'
    }
);
AnnouncementsDetail.hasOne(Announcements, {
    sourceKey: 'announcement_id',
    foreignKey: 'id'
})
Announcements.hasOne(User, {
    sourceKey: 'user_id',
    foreignKey: 'id'
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
        const {limit, page, sortColumn, sortType, search, user_id} = req.body;
        const total = await AnnouncementsDetail.findAll(
            {
                where: {
                    user_id: {
                        [Op.eq]: user_id
                    },
                },
                include: [{
                    as: 'announcement',
                    model: Announcements
                }],

            }
        );
        const announcements = await AnnouncementsDetail.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [
                [sortColumn, sortType]
            ],
            where: {
                user_id: {
                    [Op.eq]: user_id
                },
                [Op.or]: [
                    {
                        created_at: {
                            [Op.substring]: [search]
                        },
                    }
                ],

            },
            include: [{
                as: 'announcement',
                model: Announcements
            }],

        });
        res.json({
            total: total.length,
            data: announcements
        });

    }
}