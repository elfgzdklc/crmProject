import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../models/logs";
import CustomerRequest from "../../models/customerRequest";
import CustomerToUser from "../../models/customerToUser";

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
            assigned_user_id,
            customer_id,
            description,
        } = req.body;

        let count = 0;
        customer_id.map((item) => {
            const customer_request = CustomerRequest.create({
                request_user_id: user_id,
                assigned_user_id: assigned_user_id.value,
                customer_id: item.value,
                customer_type: "Potansiyel Firma",
                description: description,
                status: 0
            })
            if (customer_request) {
                customer_id.map((customer) => {
                    CustomerToUser.update({
                        status: 1
                    }, {
                        where: {
                            customer_id: customer.value
                        }
                    })
                })
                count++;
            }
        })
        if (count === customer_id.length) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({
                    email: session.user.email,
                    action: assigned_user_id.label + " isimli personel için talep oluşturuldu.",
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