import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const {getSession} = require("next-auth/react");
const Events = require("../../models/events");
const Logs = require("../../models/logs");

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
        const id = req.query.id;
        const session = await getSession({req});
        const user_id = session.user.id;
        const user_email = session.user.email;
        const update = await Events.update({deleted_id: user_id}, {
            where: {
                id: id
            }
        });
        if (update) {
            const event = await Events.findAll({
                where: {
                    id: id
                }
            });
            const deleteEvent = await Events.destroy({
                where: {
                    id: id
                }
            });
            if (deleteEvent) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: user_email,
                        action: 'Event tablosundaki "' + event[0].title + '" isimli etkinlik silindi.', ip_address: add
                    })
                })
                res.send(JSON.stringify({status: 'success', message: 'Silme işlemi gerçekleştirildi.', title: 'Başarılı!'}))
            } else {
                res.send(JSON.stringify({
                    status: 'error',
                    message: 'İşlem sırasında hata meydana gelmiştir.',
                    title: 'Başarısız!'
                }));
            }
        }
    }
}