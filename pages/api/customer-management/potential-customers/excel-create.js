import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Customers from "../../models/customers";
import Logs from "../../models/logs";
import Country from "../../models/countries";
import Province from "../../models/provinces";
import District from "../../models/district";
import CustomerContacts from "../../models/customerContacts";
import readXlsxFile from "read-excel-file/node";

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
        let sampleFile;
        sampleFile = req.files.excel;
        const uploadPath = "public/uploadExcel/" + sampleFile.md5 + ".xlsx";

        await sampleFile.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log("Başarılı")
            }
        });

        let count = 0;
        let uploadLength = 0;
        readXlsxFile(uploadPath).then(async (rows) => {
            uploadLength = rows.length;
            rows.map((item) => {
                if (count > 0) {
                    Customers.create({
                        user_id: user_id,
                        type: 1,
                        category_id: item[0],
                        customer_code: item[1],
                        trade_name: item[2],
                        tax_administration: item[3],
                        tax_number: item[4],
                    }).then(async (customer) => {
                        if (customer) {
                            return CustomerContacts.create({
                                user_id: user_id,
                                customer_id: customer.id,
                                country_id: item[5],
                                country_name:item[6],
                                province_id: item[7],
                                province_name: item[8],
                                district_id: item[9],
                                district_name: item[10],
                                zip_code: item[11],
                                address: item[12]
                            });
                        }
                    })
                }
                count++;
            })
        })

        // readXlsxFile(uploadPath).then(async (rows) => {
        //     uploadLength = rows.length;
        //     rows.map((item) => {
        //         if (count > 0) {
        //             Customers.create({
        //                 user_id: user_id,
        //                 type: 1,
        //                 trade_name: item[0],
        //             }).then(async (customer) => {
        //                 if (customer) {
        //                     await CustomerContacts.create({
        //                         user_id: user_id,
        //                         customer_id: customer.id,
        //                         address: item[1]
        //                     });
        //                 }
        //             })
        //         }
        //         count++;
        //     })
        // })

        if (count === uploadLength) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                Logs.create({
                    email: session.user.email,
                    action: 'Potansiyel firmalar tablosuna toplu firma yükleme işlemi yapılmıştır.',
                    ip_address: add
                })
            })
            res.send(JSON.stringify({
                status: 'success',
                message: 'Excel dosyası başarıyla eklendi.',
                title: 'Başarılı!'
            }))
        } else {
            res.send(JSON.stringify({
                status: 'error',
                message: 'İşlem sırasında hata meydana gelmiştir.',
                title: 'Başarısız!'
            }))
        }
    }
}