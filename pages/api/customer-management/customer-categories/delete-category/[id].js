import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../../models/logs";
import CustomerCategories from "../../../models/customerCategories";

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
        const id = req.query.id;
        const deleted_user = await CustomerCategories.update({
            deleted_id: session.user.id
        }, {
            where: {
                id: id,
            }
        });
        if (deleted_user) {
            const category_name = await CustomerCategories.findOne({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    id: id
                }
            });
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({                                          //log oluşturuluyor
                    email: session.user.email,
                    action: "Firma kategori tablosundan " + '"' + category_name.category_name + '"' + " isimli kategori silindi.",
                    ip_address: add
                });
            });
            const category_delete = await CustomerCategories.destroy({   //silme işlemi
                where: {
                    id: id
                }
            });
            if (category_delete) {
                res.json({
                    status: "success",
                    title: "Başarılı!",
                    message: "Silme işlemi gerçekleştirildi."
                });
            } else {
                res.json({
                    status: "error",
                    title: "Başarısız!",
                    message: "İşlem sırasında hata meydana gelmiştir."
                });
            }
        } else {
            res.json({
                status: "error",
                title: "Başarısız!",
                message: "İşlem sırasında hata meydana gelmiştir."
            });
        }
    }
}