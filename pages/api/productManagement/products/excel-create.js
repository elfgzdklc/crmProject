import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Products from "../../models/products";
import Logs from "../../models/logs";
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
        let priceNumberFormat = new Intl.NumberFormat('tr-TR');

        const uploadPath = "public/uploadExcel/" + sampleFile.md5 + ".xlsx";

        await sampleFile.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
        });

        let count = 0;
        let uploadLength = 0;

        readXlsxFile(uploadPath).then(async (rows) => {
            rows.map((item) => {
                if (count > 0) {
                    return Products.findOrCreate({
                        where: {
                            product_code: item[2]
                        },
                        defaults: {
                            user_id: user_id,
                            brand_id: parseInt(item[0]),
                            product_category_id: parseInt(item[1]),
                            product_code: item[2].toString(),
                            product_name: item[3].toString(),
                            product_desc: item[4].toString(),
                            stock: parseInt(item[5]),
                            desi: item[6].toString(),
                            kilogram: item[7].toString(),
                            price: parseFloat(item[8]),
                            sale_price: parseFloat(item[9])
                        },
                    }).then(([product, created]) => {
                            if (created.toString() === "false") {
                                return Products.update({
                                    user_id: user_id,
                                    brand_id: parseInt(item[0]),
                                    product_category_id: parseInt(item[1]),
                                    product_code: item[2].toString(),
                                    product_name: item[3].toString(),
                                    product_desc: item[4].toString(),
                                    stock: parseInt(item[5]),
                                    desi: item[6].toString(),
                                    kilogram: item[7].toString(),
                                    price: parseFloat(item[8]),
                                    sale_price: parseFloat(item[9])
                                }, {
                                    where: {
                                        product_code: item[2].toString(),
                                        id: parseInt(product.id)
                                    },
                                })
                            } else {
                                console.log("Eklendi")
                            }
                        }
                    );
                }
                count++;
            })
        })

        // readXlsxFile(uploadPath).then(async (rows) => {
        //     rows.map((item) => {
        //         if (count > 0) {
        //             return Products.findOrCreate(
        //                 {
        //                     where: {
        //                         product_code: item[0].toString()
        //                     },
        //                     defaults: {
        //                         user_id: user_id,
        //                         product_name: item[1].toString(),
        //                         kilogram: item[2].toString(),
        //                     },
        //                 }).then(async ([product, created]) => {
        //                     if (created.toString() === "false") {
        //                         return Products.update(
        //                             {
        //                                 user_id: user_id,
        //                                 product_name: item[1].toString(),
        //                                 kilogram: item[2].toString(),
        //                             }, {
        //                                 where: {
        //                                     product_code: item[0].toString(),
        //                                     id: parseInt(product.id)
        //                                 },
        //                             })
        //                         console.log("Güncellendi")
        //                     } else {
        //                         console.log("Eklendi")
        //                     }
        //                 }
        //             );
        //         }
        //         count++;
        //     })
        // })

        if (count === uploadLength) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                Logs.create({
                    email: session.user.email,
                    action: 'Ürünler tablosuna toplu ürün yükleme işlemi yapılmıştır.',
                    ip_address: add
                })
            })
            res.status(200).send(JSON.stringify({
                status: "success",
                title: 'Başarılı',
                message: 'Aktarım başarılı bir şekilde tamamlandı.'
            }));
        } else {
            res.send(JSON.stringify({
                status: 'error',
                message: 'İşlem sırasında hata meydana gelmiştir.',
                title: 'Başarısız!'
            }))
        }
    }
}
