import {decode, encode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Settings from "../models/settings";
import User from "../models/users";
import Logs from "../models/logs";
const ejs = require('ejs');
const Email = require("../../api/sendEmail");
const uuid = require('uuid');
let tokenSession = null;

export default async (req, res) => {
    const nowTime = new Date().getTime();

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
        const per_id = session.user.permission_id;
        const user_email = session.user.email;
        const id = req.body.id;
        const identity_number = req.body.identity_number;
        const title = req.body.title;
        const email = req.body.email;
        const name = req.body.name;
        const surname = req.body.surname;
        const phone = req.body.phone;
        const department_id = req.body.department_name;
        const permission_id = req.body.permission_name;
        const user_liable = req.body.user_liable;
        const personel_code = req.body.personel_code;
        const parent_id = req.body.parent_id;
        const parent_id_liable = session.user.id;
        const email_verify_code = uuid.v1();
        const user = await User.findAll({
            attributes: ['identity_number', 'email'],
        });
        const settings = await Settings.findOne();
        if (id != 0) {
            //update
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
                user_liable: user_liable,
                personel_code: personel_code
            }, {
                where: {
                    id: id
                }
            });
            if (update) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    await Logs.create({
                        email: user_email,
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
                res.send(JSON.stringify({
                    status: 'error',
                    message: 'İşlem sırasında hata meydana gelmiştir.',
                    title: 'Başarısız!'
                }));
            }
        } else {
            //insert
            if (parent_id) {
                await User.findOrCreate({
                    where: {
                        email: email,
                    },
                    defaults: {
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
                        user_liable: user_liable,
                        personel_code: personel_code,
                        email_verify_code: email_verify_code
                    }
                }).then(([user, created]) => {
                    if (created.toString() === 'false') {
                        res.send(JSON.stringify({
                            status: 'error',
                            message: 'Bu mail adresi ile kayıtlı kullanıcı bulunmaktadır.',
                            title: 'Başarısız!'
                        }));
                    } else {
                        //email temp start//

                        ejs.renderFile("./email-temp/pass.ejs", {
                            username: name + " " + surname,
                            url: `${process.env.NEXT_PUBLIC_URL}api/users/verify-code?id=${user.id}&verifyCode=${email_verify_code}`,
                            base_url: process.env.NEXT_PUBLIC_URL,
                            logo:settings.logo,
                            address: settings.address
                        }, function (err, data) {
                            if (err) {
                                console.log(err)
                            } else {
                                Email(email, "Kayıt Başarılı ✔", data);
                            }
                        })

                        // email temp end//
                        require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                            await Logs.create({
                                email: user_email,
                                action: 'Kullanıcı tablosuna "' + name + ' ' + surname + '" isimli kullanıcı eklendi.',
                                ip_address: add
                            })
                        })
                        res.send(JSON.stringify({
                            status: 'success',
                            message: 'Ekleme işlemi gerçekleştirildi.',
                            title: 'Başarılı!'
                        }))
                    }
                })
            } else {
                await User.findOrCreate({
                    where: {
                        email: email
                    },
                    defaults: {
                        user_id: user_id,
                        identity_number: identity_number,
                        title: title,
                        email: email,
                        name: name,
                        surname: surname,
                        phone: phone,
                        department_id: department_id,
                        permission_id: permission_id,
                        parent_id: parent_id_liable,
                        user_liable: user_liable,
                        personel_code: personel_code,
                        email_verify_code: email_verify_code
                    }
                }).then(([user, created]) => {
                    if (created.toString() === 'false') {
                        res.send(JSON.stringify({
                            status: 'error',
                            message: 'Bu mail adresi ile kayıtlı kullanıcı bulunmaktadır.',
                            title: 'Başarısız!'
                        }));
                    } else {
                        //email temp start//
                        ejs.renderFile("./email-temp/pass.ejs", {
                            username: name + " " + surname,
                            url: `${process.env.NEXT_PUBLIC_URL}api/users/verify-code?id=${user.id}&verifyCode=${email_verify_code}`,
                            base_url: process.env.NEXT_PUBLIC_URL,
                            logo:settings.logo,
                            address: settings.address
                        }, function (err, data) {
                            if (err) {
                                console.log(err)
                            } else {
                                Email(email, "Kayıt Başarılı ✔", data);
                            }
                        })
                        //email temp end//

                        require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                            await Logs.create({
                                email: user_email,
                                action: 'Kullanıcı tablosuna "' + name + ' ' + surname + '" isimli kullanıcı eklendi.',
                                ip_address: add
                            })
                        })
                        res.send(JSON.stringify({
                            status: 'success',
                            message: 'Ekleme işlemi gerçekleştirildi.',
                            title: 'Başarılı!'
                        }))
                    }
                })
            }
        }
    }
}