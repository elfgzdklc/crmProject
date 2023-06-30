import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const {getSession} = require("next-auth/react");
const Events = require("../models/events");
const Logs = require("../models/logs");

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
        const name = session.user.name;
        const title = req.body.title;
        const start = req.body.start;
        const importanceEvent = req.body.importanceEvent;
        const end = req.body.end;
        const log_email = session.user.email;
        const insert = await Events.create({
            where: {
                [Op.ne]: null
            },
            title: title,
            start: start,
            end: end,
            user_id: user_id,
            importanceEvent: importanceEvent,
            log_email: log_email
        });

        if (title == "" || start == "" || end == "") {
            res.json({
                status: 'error',
                message: 'Lütfen ilgili alanları doldurunuz.'
            })
        } else if (insert) {

            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: log_email,
                        name: name,
                        action: 'Kullanıcı "' + name + '" isimli kullanıcıya "' + title + '" adlı etkinliği ekledi.',
                        ip_address: add
                    })
                }
            )
            res.json({
                status: 'success',
                message: 'Etkinlik eklendi.',
                title: 'Başarılı!'
            })
        } else {
            res.json({
                status: 'error',
                message: 'Etkinlik eklenemedi.',
                title: 'Başarısız!'
            })
        }
    }
}