import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../../models/logs";
import Categories from "../../../models/categories";

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
        const id = req.query.id;
        const session = await getSession({req});
        const user_id = session.user.id;
        const user_email = session.user.email;
        const update = await Categories.update({deleted_id: user_id}, {
            where: {
                id: id
            }
        });
        if (update) {
            const category = await Categories.findAll({
                where: {
                    id: id
                }
            });
            const deleteCategory = await Categories.destroy({
                where: {
                    id: id
                }
            });
            if (deleteCategory) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    await Logs.create({
                        email: user_email,
                        action: 'Kategori tablosundaki "' + category[0].category_name + '" isimli kategori silindi.', ip_address: add
                    })
                })
                res.send(JSON.stringify({status: 'success', message: 'Silme işlemi gerçekleştirildi.', title: 'Başarılı!'}))
            } else {
                res.send(JSON.stringify({status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!'}));
            }
        }
    }
}