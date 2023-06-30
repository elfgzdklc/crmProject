import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../../models/logs";
import Customers from "../../models/customers";
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
        const user_id = session.user.id;
        const {
            id,
            customerId,
            country,
            province,
            district,
            address,
            zip_code,
        } = req.body;

        let customer_contact;
        const old_customer_name = await Customers.findAll({     //id'ye ait bilgiler log için kullanılacak
            attributes: ['trade_name'],
            where: {
                id: customerId
            }
        });

        if (id == 0) {
            if (country.value === 232) {
                customer_contact = await CustomerContacts.create({
                    user_id: user_id,
                    customer_id: customerId,
                    country_id: country.value,
                    country_name: country.label,
                    province_id: province.value,
                    province_name: province.label,
                    district_id: district.value,
                    district_name: district.label,
                    zip_code: zip_code,
                    address: address,
                    address_type: 1,
                });
            }
            else{
                customer_contact = await CustomerContacts.create({
                    user_id: user_id,
                    customer_id: customerId,
                    country_id: country.value,
                    country_name: country.label,
                    province_id: 0,
                    province_name: province,
                    district_id: 0,
                    district_name: district,
                    zip_code: zip_code,
                    address: address,
                    address_type: 1,
                });
            }
            if (customer_contact) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: old_customer_name[0].trade_name + " isimli firmaya sevkiyat adresi eklenmiştir.",
                        ip_address: add
                    });
                })
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
            if (country.value === 232) {
                customer_contact = await CustomerContacts.update({
                        user_id: user_id,
                        customer_id: customerId,
                        country_id: country.value,
                        country_name: country.label,
                        province_id: province.value,
                        province_name: province.label,
                        district_id: district.value,
                        district_name: district.label,
                        zip_code: zip_code,
                        address: address,
                        address_type: 1
                    },
                    {
                        where: {
                            customer_id: customerId,
                            address_type: 1
                        }
                    }
                );
            }
            else{
                customer_contact = await CustomerContacts.update({
                        user_id: user_id,
                        customer_id: customerId,
                        country_id: country.value,
                        country_name: country.label,
                        province_id: 0,
                        province_name: province,
                        district_id: 0,
                        district_name: district,
                        zip_code: zip_code,
                        address: address,
                        address_type: 1
                    },
                    {
                        where: {
                            customer_id: customerId,
                            address_type: 1
                        }
                    }
                );
            }

            if (customer_contact) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: old_customer_name[0].trade_name + " isimli firmaya ait sevkiyat adresi bilgilerinde güncelleme yapılmıştır.",
                        ip_address: add
                    });
                })
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
                })
            }
        }
    }
}