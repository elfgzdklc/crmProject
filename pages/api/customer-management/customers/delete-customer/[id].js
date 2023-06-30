import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Customers from "../../../models/customers";
import Logs from "../../../models/logs";
import CustomerToOfficial from "../../../models/customerToOfficial";
import moment from "moment";
import CustomerToUser from "../../../models/customerToUser";
import CustomerRequest from "../../../models/customerRequest";
import CustomerContacts from "../../../models/customerContacts";

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
        const deleted_user = await Customers.update({
            deleted_id: session.user.id
        }, {
            where: {
                id: id,
            }
        });
        if (deleted_user) {
            const customer_name = await Customers.findOne({     //id'ye ait bilgiler log için kullanılacak
                where: {
                    id: id
                }
            });
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({                                          //log oluşturuluyor
                    email: session.user.email,
                    action: "Firma tablosundan " + '"' + customer_name.trade_name + '"' + " isimli firma silindi.",
                    ip_address: add
                });
            });
            const customer_delete = await Customers.destroy({   //silme işlemi
                where: {
                    id: id
                }
            });
            if (customer_delete) {
                await CustomerToOfficial.update({
                    deleted_id: session.user.id,
                    deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
                }, {
                    where: {
                        customer_id: id
                    }
                });
                await CustomerToUser.update({
                    deleted_id: session.user.id,
                    deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
                }, {
                    where: {
                        customer_id: id
                    }
                });
                await CustomerRequest.update({
                    deleted_id: session.user.id,
                    deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
                }, {
                    where: {
                        customer_id: id
                    }
                });
                const customer_contact = await CustomerContacts.update({
                    deleted_id: session.user.id,
                    deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
                }, {
                    where: {
                        customer_id: id
                    }
                });
                if (customer_contact) {
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
}