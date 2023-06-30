import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Customers from "../../models/customers";
import Logs from "../../models/logs";
import Country from "../../models/countries";
import Province from "../../models/provinces";
import District from "../../models/district";
import CustomerContacts from "../../models/customerContacts";

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
        let customer_contact;
        const user_id = session.user.id;
        const {
            id,
            type,
            category_id,
            customer_code,
            trade_name,
            tax_number,
            country,
            province,
            district,
            address,
            zip_code,
            tax_administration
        } = req.body;

        const old_customer_name = await Customers.findAll({     //id'ye ait bilgiler log için kullanılacak
            attributes: ['trade_name'],
            where: {
                id: id
            }
        });

        if (id == 0) {
            const customer = await Customers.create({
                user_id: user_id,
                category_id: category_id,
                type: type,
                customer_code: customer_code,
                trade_name: trade_name,
                tax_number: tax_number,
                tax_administration: tax_administration
            });
            if (customer) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: "Firma tablosuna " + '"' + trade_name + '"' + " isimli firma eklendi.",
                        ip_address: add
                    });
                });

                if (country.value === 232) {
                    customer_contact = await CustomerContacts.create({
                        user_id: user_id,
                        customer_id: customer.id,
                        country_id: country.value,
                        country_name: country.label,
                        province_id: province.value,
                        province_name: province.label,
                        district_id: district.value,
                        district_name: district.label,
                        zip_code: zip_code,
                        address: address,
                        address_type: 0,
                    });
                } else {
                    customer_contact = await CustomerContacts.create({
                        user_id: user_id,
                        customer_id: customer.id,
                        country_id: country.value,
                        country_name: country.label,
                        province_id: 0,
                        province_name: province,
                        district_id: 0,
                        district_name: district,
                        zip_code: zip_code,
                        address: address,
                        address_type: 0,
                    });
                }
                if (customer_contact) {
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
            } else {
                res.json({
                    status: "error",
                    title: "Başarısız!",
                    message: "İşlem sırasında hata meydana gelmiştir."
                });
            }
        } else {
            const customer = await Customers.update({
                user_id: user_id,
                category_id: category_id,
                type: type,
                customer_code: customer_code,
                trade_name: trade_name,
                tax_number: tax_number,
                tax_administration: tax_administration
            }, {
                where: {id: id}
            });
            if (customer) {
                if (country.value === 232) {
                    customer_contact = await CustomerContacts.update({
                        user_id: user_id,
                        customer_id: customer.id,
                        country_id: country.value,
                        country_name: country.label,
                        province_id: province.value,
                        province_name: province.label,
                        district_id: district.value,
                        district_name: district.label,
                        address: address,
                        zip_code: zip_code,
                        address_type: 0
                    }, {
                        where: {
                            customer_id: id,
                            address_type: 0
                        }
                    });
                } else {
                    customer_contact = await CustomerContacts.update({
                        user_id: user_id,
                        customer_id: customer.id,
                        country_id: country.value,
                        country_name: country.label,
                        province_id: 0,
                        province_name: province,
                        district_id: 0,
                        district_name: district,
                        address: address,
                        zip_code: zip_code,
                        address_type: 0
                    }, {
                        where: {
                            customer_id: id,
                            address_type: 0
                        }
                    });
                }

                if (customer_contact) {
                    require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                        if (old_customer_name[0].trade_name != req.body.trade_name) {
                            await Logs.create({                                          //log oluşturuluyor
                                email: session.user.email,
                                action: "Firma tablosundaki " + '"' + old_customer_name[0].trade_name + '"' + " isimli firma " + '"' + trade_name + '"' + " olarak güncellendi.",
                                ip_address: add
                            });
                        } else {
                            await Logs.create({                                          //log oluşturuluyor
                                email: session.user.email,
                                action: "Firma tablosundaki " + '"' + old_customer_name[0].trade_name + '"' + " isimli firma bilgilerinde güncelleme yapılmıştır.",
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
}