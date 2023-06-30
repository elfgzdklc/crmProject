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
        const id = req.query.id;
        const session = await getSession({req});
        const user_id = session.user.id;
        const users_detail = await User.findAll({
            attributes: ['name', 'surname'],
            where: {
                id: id
            }
        });
        const staff2 = await User.update(
            {
                deleted_id: user_id,
            },
            {
                where: {
                    id: id
                }
            }
        );
        if (staff2) {
            const staff_delete = await User.destroy({
                where: {
                    id: id
                }
            });
            if (staff_delete) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    const data2 = {
                        email: session.user.email,
                        action: "Kullanıcı tablosundan " + '"' + users_detail[0].name + ' ' + users_detail[0].surname + '"' + " isimli kullanıcı silindi.",
                        ip_address: add,
                    };
                    await Logs.create(data2);
                })
                res.json({
                    status: "success",
                    title: "Başarılı",
                    message: "Silme işlemi gerçekleştirildi."
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