import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../models/logs";
import CustomerCategories from "../../models/customerCategories";

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
        const {id, category_name} = req.body;

        if (id == 0) {
            const category = await CustomerCategories.create({
                user_id: user_id,
                category_name: category_name
            });
            if (category) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Firma kategori tablosuna " + '"' + category_name + '"' + " isimli kategori eklendi.",
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
            const old_category_name = await CustomerCategories.findOne({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    id: id
                }
            });

            const category = await CustomerCategories.update({
                user_id: user_id,
                category_name: category_name,
            }, {
                where: {id: id}
            });
            if (category) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Firma kategori tablosundaki " + '"' + old_category_name.category_name + '"' + " isimli kategori " + '"' + category_name + '"' + " olarak güncellendi.",
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