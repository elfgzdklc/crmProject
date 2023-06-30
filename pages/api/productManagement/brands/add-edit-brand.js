import { decode } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Brands from "../../models/brands";
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
        res.status(401).json({ error: "Yetkisiz giriş" })
    } else {
        const session = await getSession({ req });
        const user_id = session.user.id;
        const user_email = session.user.email;
        const id = req.body.id;
        const brand_name = req.body.brand_name;
        if (id != 0) {
            //update
            const brand = await Brands.findAll({
                where: {
                    id: id
                }
            });
            const update = await Brands.update({ brand_name: brand_name }, {
                where: {
                    id: id
                }
            });
            if (update) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const insertLog = await Logs.create({
                        email: user_email,
                        action: 'Marka tablosundaki "' + brand[0].brand_name + '" isimli marka "' + brand_name + '" olarak güncellendi.',
                        ip_address: add
                    })
                })
                res.send(JSON.stringify({ status: 'success', message: 'Güncelleme işlemi gerçekleştirildi.', title: 'Başarılı!' }))
            } else {
                res.send(JSON.stringify({ status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!' }));
            }
        } else {
            //insert
            const insert = await Brands.create({ brand_name: brand_name, user_id: user_id })
            if (insert) {
                const localIpAddress = require("local-ip-address")
                const insertLog = await Logs.create({
                    email: user_email,
                    action: 'Marka tablosuna "' + brand_name + '" isimli marka eklendi.',
                    ip_address: localIpAddress()
                })
                
                // require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                //     const insertLog = await Logs.create({
                //         email: user_email,
                //         action: 'Marka tablosuna "' + brand_name + '" isimli marka eklendi.',
                //         ip_address: add
                //     })
                // })
                res.send(JSON.stringify({ status: 'success', message: 'Ekleme işlemi gerçekleştirildi.', title: 'Başarılı!' }))
            } else {
                res.send(JSON.stringify({ status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!' }));
            }
        }
    }
}
