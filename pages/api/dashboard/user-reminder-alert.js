import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Events from "../models/events";

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
        const session = await getSession({req});
        const user_id = session.user.id;
        const moment = require('moment');
        let meetingUserAlertArray=[];
        const startAlert = moment().startOf('minute').format('YYYY-MM-DD 00:00:00');
        const endAlert = moment().endOf('minute').format('YYYY-MM-DD 23:59:59');
        const meetingCustomer = await Events.findAll(
            {
                where: {
                    user_id: {
                        [Op.eq]: user_id
                    },
                    meeting_id: {
                        [Op.ne]: null
                    },
                    start: {
                        [Op.between]: [startAlert, endAlert]
                    },
                    read:0,
                }
            }
        );
        for(let i=0;i<meetingCustomer.length;i++){
            const userAlert = await Events.findAll(
                {
                    where: {
                        user_id: {
                            [Op.eq]: user_id
                        },
                        meeting_id: {
                            [Op.ne]: null
                        },
                        start: {
                            [Op.between]: [startAlert, endAlert]
                        },
                        read:0,
                    }
                }
            );
            meetingUserAlertArray.push(userAlert)
        }
        if (meetingUserAlertArray) {
            res.json({
                data: meetingUserAlertArray,
            })
        } else {
            res.json({
                message: 'Hatırlatma Bulunamadı'
            })
        }

    }
}