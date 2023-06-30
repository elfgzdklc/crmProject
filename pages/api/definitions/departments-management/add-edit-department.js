import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Department from "../../models/departments";
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
        const user_id = session.user.id;
        const user_email = session.user.email;
        const id = req.body.id;
        const department_name = req.body.department_name;
        if (id != 0) {
            //update
            const department = await Department.findAll({
                where: {
                    id: id
                }
            });
            const update = await Department.update({department_name: department_name}, {
                where: {
                    id: id
                }
            });
            if (update) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: user_email,
                        action: 'Departman tablosundaki "' + department[0].department_name + '" isimli departman "' + department_name + '" olarak güncellendi.',
                        ip_address: add
                    })
                })
                res.send(JSON.stringify({status: 'success', message: 'Güncelleme işlemi gerçekleştirildi.', title: 'Başarılı!'}))
            } else {
                res.send(JSON.stringify({status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!'}));
            }
        } else {
            //insert
            const insert = await Department.create({department_name: department_name, user_id: user_id})
            if (insert) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: user_email,
                        action: 'Departman tablosuna "' + department_name + '" isimli departman eklendi.',
                        ip_address: add
                    })
                })
                res.send(JSON.stringify({status: 'success', message: 'Ekleme işlemi gerçekleştirildi.', title: 'Başarılı!'}))
            } else {
                res.send(JSON.stringify({status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!'}));
            }
        }
    }
}