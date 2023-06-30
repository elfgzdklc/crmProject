import {Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Customers from "../models/customers";
import CustomerOfficial from "../models/customerOfficial";
import CustomerToOfficial from "../models/customerToOfficial";
import {getSession} from "next-auth/react";

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
        const customer_id = req.query.customerId;
        const official_id = req.query.officialId;

        const offical_name = await CustomerOfficial.findAll({
            attributes: ['name', 'surname'],
            where: {
                id: official_id
            }
        });

        const customer_name = await Customers.findAll({
            attributes: ['trade_name'],
            where: {
                id: customer_id
            }
        });

        const deleted_user = await CustomerToOfficial.update({
            deleted_id: session.user.id
        }, {
            where: {
                id: id,
            }
        });
        if (deleted_user) {
            await CustomerToOfficial.destroy({   //silme işlemi
                where: {
                    id: id
                }
            });
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({                                          //log oluşturuluyor
                    email: session.user.email,
                    action: customer_name[0].trade_name + " firmasına ait " + '"' + offical_name[0].name + ' ' + offical_name[0].surname + '"' + " isimli yetkili kişi silindi.",
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
            })
        }
    }
}