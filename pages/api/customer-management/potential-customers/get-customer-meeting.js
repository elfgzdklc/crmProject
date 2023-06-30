import {decode} from "next-auth/jwt";
import {Op} from "sequelize";
import CustomerMeetings from "../../models/customerMeetings";
import User from "../../models/users";

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
        CustomerMeetings.hasOne(User, {
            sourceKey: 'user_id',
            foreignKey: 'id'
        });

        const {id, limit, page, sortColumn, sortType, search} = req.body;
        const total = await CustomerMeetings.findAll({
            where: {
                customer_id: id
            }
        });
        const customer_meetings = await CustomerMeetings.findAll(
            {
                limit: limit,
                offset: (page - 1) * limit,
                order: [
                    [sortColumn, sortType]
                ],
                where: {
                    [Op.or]: [
                        {
                            meeting_code: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            meeting_subject: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            meeting_type: {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        },
                        {
                            '$user.email$': {
                                [Op.substring]: [
                                    search
                                ]
                            }
                        }
                    ],
                    customer_id: id,
                },
                include: [
                    {
                        model: User,
                        as: 'user'
                    }
                ]
            }
        );

        res.json({
            total: total.length,
            data: customer_meetings
        });
    }
}