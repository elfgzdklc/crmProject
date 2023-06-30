import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../../models/logs";
import CustomerToOfficial from "../../../models/customerToOfficial";
import CustomerOfficial from "../../../models/customerOfficial" ;
import {Sequelize} from "sequelize";

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

        const deleted_user = await CustomerOfficial.update({
            deleted_id: session.user.id
        }, {
            where: {
                id: id,
            }
        });
        if (deleted_user) {
            const offical_id = await CustomerToOfficial.findAll({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    official_id: id
                }
            });
            for (let i = 0; i < offical_id.length; i++) {
                await CustomerToOfficial.update({
                    deleted_id: session.user.id,
                    deleted_at: Sequelize.fn("NOW")
                }, {
                    where: {
                        id: offical_id[i].id,
                    }
                });
            }
            const offical_name = await CustomerOfficial.findOne({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    id: id
                }
            });
            const delete_official_user = await CustomerOfficial.destroy({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    id: id
                }
            });
            if (delete_official_user) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Yetkili kişiler tablosundan " + '"' + offical_name.name + ' ' + offical_name.surname + '"' + " isimli kişi silindi.",
                        ip_address: add
                    });
                });

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