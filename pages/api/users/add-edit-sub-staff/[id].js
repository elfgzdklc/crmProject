import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import User from "../../models/users";
import Logs from "../../models/logs";

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
        const id = req.body.id;
        const user_id = session.user.id;
        const identity_number = req.body.identity_number;
        const title = req.body.title;
        const email = req.body.email;
        const name = req.body.name;
        const surname = req.body.surname;
        const phone = req.body.phone;
        const department_id = req.body.department_id;
        const permission_id = req.body.permission_name;
        const user_liable = 2;
        const personel_code = req.body.personel_code;
        const parent_id = req.query.id;
        const log_email = session.user.email;
        if (id != 0) {
            //update
            const user = await User.findAll({
                where: {
                    id: id
                }
            });
            const update = await User.update({
                identity_number: identity_number,
                title: title,
                email: email,
                name: name,
                surname: surname,
                phone: phone,
                department_id: department_id,
                permission_id: permission_id,
                parent_id: parent_id,
                personel_code:personel_code,
                log_email: log_email
            }, {
                where: {
                    id: id
                }
            });
            if (update) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: log_email,
                        action: 'Kullanıcı tablosundaki "' + name + ' ' + surname + '" isimli kullanıcı bilgilerinde güncelleme yapılmıştır.',
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
            //insert
            const insert = await User.create({
                user_id: user_id,
                identity_number: identity_number,
                title: title,
                email: email,
                name: name,
                surname: surname,
                phone: phone,
                department_id: department_id,
                permission_id: permission_id,
                parent_id: parent_id,
                personel_code:personel_code,
                user_liable: user_liable
            });
            if (insert) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: email,
                        action: 'Kullanıcı tablosuna "' + email + '" isimli kullanıcı eklendi.',
                        ip_address: add
                    })
                })
                res.send(JSON.stringify({
                    status: 'success',
                    message: 'Ekleme işlemi gerçekleştirildi.',
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
}