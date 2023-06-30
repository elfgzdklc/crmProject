import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Permissions from "../../models/permissions";
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
        const {id, permission_name} = req.body;

        if (id == 0) {
            const permission = await Permissions.create({
                user_id: user_id,
                permission_name: permission_name
            });
            if (permission) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    const permission_create_log = await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Yetki tablosuna " + '"' + permission_name + '"' + " isimli yetki eklendi.",
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
        } else {
            const old_permission_name = await Permissions.findOne({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    id: id
                }
            });

            const permission = await Permissions.update({
                user_id: user_id,
                permission_name: permission_name,
            }, {
                where: {id: id}
            });
            if (permission) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Yetki tablosundaki " + '"' + old_permission_name.permission_name + '"' + " isimli yetki " + '"' + permission_name + '"' + " olarak güncellendi.",
                        ip_address: add
                    });
                });
                res.json({
                    status: "success",
                    title: "Başarılı!",
                    message: "Güncelleme işlemi gerçekleştirildi."
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
}