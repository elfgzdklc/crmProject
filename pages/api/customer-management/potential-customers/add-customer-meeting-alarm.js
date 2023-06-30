import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../models/logs";
import CustomerMeetings from "../../models/customerMeetings";
import Events from "../../models/events"

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
        const {meeting_id, start, end, title} = req.body;

        const meeting_code = await CustomerMeetings.findAll({
            attributes: ['meeting_code'],
            where: {
                id: meeting_id
            }
        });

        const event = await Events.create({
            user_id: user_id,
            meeting_id: meeting_id,
            start: start,
            end: end,
            title: title,
            read:0,
        });
        if (event) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({                                          //log oluşturuluyor
                    email: session.user.email,
                    action: meeting_code[0]['meeting_code'] + " numaralı görüşmeye hatırlatma eklendi.",
                    ip_address: add
                });
            });
            res.json({
                status: "success",
                title: "Başarılı!",
                message: "Ekleme işlemi gerçekleştirildi."
            });
        } else {
            res.json({
                status: "error",
                title: "Başarısız!",
                message: "İşlem sırasında hata meydana gelmiştir."
            });
        }

    }
}