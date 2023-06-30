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
        const title = req.body.title;
        const importanceEvent = req.body.importanceEvent;
        const update = await Events.update({
            title: title,
            importanceEvent: importanceEvent
        }, {
            where: {
                id: id
            }
        });

        if (update) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: user_email,
                        action: 'Event tablosundaki "' + title + '" isimli etkinlik güncellendi.', ip_address: add
                    })

                }
            )
            res.send(JSON.stringify({
                status: 'success',
                message: 'Güncelleme işlemi gerçekleştirildi.',
                title: 'Başarılı!'
            }))
        } else {
            res.send(JSON.stringify({
                status: 'error',
                message: 'İşlem sırasında hata meydana gelmiştir.',
                title: 'Başarısız!'
            }));
        }
    }
}