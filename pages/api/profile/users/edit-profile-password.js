import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Logs from "../../models/logs";
import Users from "../../models/users";
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
        const session = await getSession({req});
        const user_id = session.user.id;
        const log_email = session.user.email;
        const old_password = md5Hash.default(req.body.oldPassword);
        const new_password = md5Hash.default(req.body.newPassword);
        const new_password_confirm = md5Hash.default(req.body.newPassword2);
        if (new_password === new_password_confirm) {
            const user = await Users.findAll({
                where: {
                    id: user_id
                }
            });
            if (user[0].password === old_password) {
                const update = await Users.update({
                    password: new_password,
                    log_email: log_email
                }, {
                    where: {
                        id: user_id
                    }
                });
                if (update) {
                    require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                        const insertLog = await Logs.create({
                            email: log_email,
                            name: user[0].name,
                            action: 'Kullanıcı "' + email + '" şifresini güncelledi.',
                            ip_address: add
                        })
                    })
                    res.send(JSON.stringify({
                        status: 'success',
                        message: 'Güncelleme işlemi gerçekleştirildi.',
                        title: 'Başarılı!'
                    }))
                } else {
                    res.send(
                        JSON.stringify({
                                status: 'error',
                                message: 'İşlem sırasında hata meydana gelmiştir.',
                                title: 'Başarısız!'
                            }
                        ));
                }
            } else {
                res.send(
                    JSON.stringify({
                            status: 'error',
                            message: 'Eski şifreniz hatalı.',
                            title: 'Başarısız!'
                        }
                    ));
            }
        }
        else{
            res.send(
                JSON.stringify({
                        status: 'error',
                        message: 'Yeni şifreler uyuşmuyor.',
                        title: 'Başarısız!'
                    }
                ));
        }

    }
}