import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../models/logs";
import Customers from "../../models/customers";
import CustomerToOfficial from "../../models/customerToOfficial";

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
        const {
            customer_id,
            customer_official,
        } = req.body;

        const customer_name = await Customers.findAll({
            attributes: ['trade_name'],
            where: {
                id: customer_id
            }
        })

        let count = 0;
        customer_official.map((item) => {
            CustomerToOfficial.create({
                user_id: user_id,
                customer_id: customer_id,
                official_id: item.value
            });
            count++;
        })
        if (count === customer_official.length) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({
                    email: session.user.email,
                    action: customer_name[0].trade_name + " isimli firmaya yetkili kişi eklendi.",
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
            })
        }
    }
}