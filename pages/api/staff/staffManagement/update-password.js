import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const User = require('../../models/users');
const md5Hash = require("md5-hash")

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
        const id = req.body.id;
        const password = md5Hash.default(req.body.password);
        const create_password = await User.update({
            password: password
        }, {
            where: {
                id: id
            }
        })
        if (create_password) {
            res.send(JSON.stringify({
                status: 'success',
                message: 'Kullanıcıya şifre ataması gerçekleştirildi.',
                title: 'Başarılı!'
            }))
        } else {
            res.send(JSON.stringify({
                status: 'error',
                message: 'İşlem sırasında hata meydana gelmiştir.',
                title: 'Başarısız!'
            }))
        }
    }
}