import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../models/logs";
import CustomerOfficial from "../../models/customerOfficial";
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
            id,
            customer,
            title,
            name,
            surname,
            phone,
            email
        } = req.body;

        const old_customer_offical = await CustomerOfficial.findAll({     //id'ye ait bilgiler log için kullanılacak
            attributes: ['name', 'surname'],
            where: {
                id: id
            }
        });

        if (id == 0) {
            const customer_official = await CustomerOfficial.create({
                user_id: user_id,
                title: title,
                name: name,
                surname: surname,
                phone: phone,
                email: email
            });
            if (customer_official) {
                if (customer) {
                    CustomerToOfficial.create({
                        user_id: user_id,
                        customer_id: customer.value,
                        official_id: customer_official.id
                    });
                }
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Yetkili kişiler tablosuna " + '"' + customer_official.name + ' ' + customer_official.surname + '"' + " isimli kişi eklendi.",
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
            const customer_official = await CustomerOfficial.update({
                user_id: user_id,
                title: title,
                name: name,
                surname: surname,
                phone: phone,
                email: email
            }, {
                where: {id: id}
            });
            if (customer_official) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    if (old_customer_offical[0].name != name || old_customer_offical[0].surname != surname) {
                        await Logs.create({                                          //log oluşturuluyor
                            email: session.user.email,
                            action: "Yetkili kişiler tablosundaki " + '"' + old_customer_offical[0].name + ' ' + old_customer_offical[0].surname + '"' + " isimli kişi " + '"' + name + ' ' + surname + '"' + " olarak güncellendi.",
                            ip_address: add
                        });
                    } else {
                        await Logs.create({                                          //log oluşturuluyor
                            email: session.user.email,
                            action: "Yetkili kişiler tablosundaki " + '"' + old_customer_offical[0].name + ' ' + old_customer_offical[0].surname + '"' + " isimli kişinin bilgilerinde güncelleme yapılmıştır.",
                            ip_address: add
                        });
                    }
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