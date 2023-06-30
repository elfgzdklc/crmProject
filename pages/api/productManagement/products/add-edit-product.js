import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Logs from "../../models/logs";
import Products from "../../models/products";
import { v1 as uuidv1 } from 'uuid';

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
        const user_email = session.user.email;
        const {
            product_name,
            product_code,
            stock,
            brand_id,
            product_category_id,
            product_desc,
            desi,
            kilogram,
            price,
            sale_price,
            id
        } = req.body;
        const unic = uuidv1();
        let product_image;
        let image_name = [];
        let images = "";
    
        const system_product_code = await Products.findAll(
            {
                where: {
                    product_code: product_code
                }
            });
    
        if (req.files) {
            product_image = req.files.product_image;
            if (product_image.mimetype) {
                image_name.push(product_image.md5 + unic + "." + product_image.mimetype.split('/')[1])
            } else {
                for (let value in product_image) {
                    image_name.push(product_image[value].md5 + unic + "." + product_image[value].mimetype.split('/')[1])
                }
            }
            images = image_name.join(", ");
        } else {
            product_image = req.body.product_image;
            images = product_image;
        }
    
        function moveFile(message) {
            try {
                if (!req.files) {
                    res.send(JSON.stringify({status: 'warning', message: message, title: 'Uyarı!'}))
                } else {
                    for (let value in product_image) {
                        if (product_image[value].mimetype) {
                            product_image[value].mv("public/uploads/" + product_image[value].md5 + unic + "." + product_image[value].mimetype.split('/')[1])
                        } else {
                            product_image.mv("public/uploads/" + product_image.md5 + unic + "." + product_image.mimetype.split('/')[1])
                        }
                    }
                }
            } catch (e) {
                res.status(500).send(e)
            }
        }
    
        if (id != 0) {
            //update
            const product = await Products.findAll({
                where: {
                    id: id
                }
            });
            const update = await Products.update({
                brand_id: brand_id,
                product_category_id: product_category_id,
                product_code: product_code,
                product_name: product_name,
                product_desc: product_desc,
                product_image: images,
                stock: stock,
                desi: desi,
                kilogram: kilogram,
                price: price,
                sale_price: sale_price
            }, {
                where: {
                    id: id
                }
            });
            if (update) {
                moveFile('Resim değişikliği yapılmadı, güncelleme başarılı!');
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    let action;
                    if (product[0].product_name != product_name) {
                        action = 'Ürün tablosundaki "' +
                            product[0].product_name + '" isimli ürün "' + product_name + '" olarak güncellendi.'
                    } else {
                        action = 'Ürün tablosundaki "' +
                            product[0].product_name + '" isimli üründe güncelleme yapıldı.'
                    }
                    const insertLog = await Logs.create({
                        email: user_email,
                        action: action,
                        ip_address: add
                    })
                })
                res.send(JSON.stringify({
                    status: 'success',
                    message: 'Güncelleme işlemi gerçekleştirildi.',
                    title: 'Başarılı!'
                }))
            } else {
                res.send(JSON.stringify({
                    status: 'error',
                    message: 'İşlem sırasında hata meydana gelmiştir.',
                    title: 'Başarısız!'
                }));
            }
        } else {
            //insert
            if (system_product_code.length > 0) {
                if (system_product_code == false) {
                    const insert = await Products.create({
                        user_id: user_id,
                        brand_id: brand_id,
                        product_category_id: product_category_id,
                        product_code: product_code,
                        product_name: product_name,
                        product_desc: product_desc,
                        product_image: images,
                        stock: stock,
                        desi: desi,
                        kilogram: kilogram,
                        price: price,
                        sale_price: sale_price
                    })
                    if (insert) {
                        moveFile('Kayıt başarılı, resim eklenmedi, !')
                        require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                            const insertLog = await Logs.create({
                                email: user_email,
                                action: 'Ürün tablosuna "' + product_name + '" isimli ürün eklendi.',
                                ip_address: add
                            })
                        })
                        res.send(JSON.stringify({
                            status: 'success',
                            message: 'Ekleme işlemi gerçekleştirildi.',
                            title: 'Başarılı!'
                        }))
                    } else {
                        res.send(JSON.stringify({
                            status: 'error',
                            message: 'İşlem sırasında hata meydana gelmiştir..',
                            title: 'Başarısız!'
                        }));
                    }
                } else {
                    res.send(JSON.stringify({
                        status: 'error',
                        message: 'Bu ürün kodu sistemde kayıtlıdır.',
                        title: 'Başarısız!'
                    }));
                    return;
                }
            } else {
                const insert = await Products.create({
                    user_id: user_id,
                    brand_id: brand_id,
                    product_category_id: product_category_id,
                    product_code: product_code,
                    product_name: product_name,
                    product_desc: product_desc,
                    product_image: images,
                    stock: stock,
                    desi: desi,
                    kilogram: kilogram,
                    price: price,
                    sale_price: sale_price
                })
                if (insert) {
                    moveFile('Kayıt başarılı, resim eklenmedi!')
                    require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                        const insertLog = await Logs.create({
                            email: user_email,
                            action: 'Ürün tablosuna "' + product_name + '" isimli ürün eklendi.',
                            ip_address: add
                        })
                    })
                    res.send(JSON.stringify({
                        status: 'success',
                        message: 'Ekleme işlemi gerçekleştirildi.',
                        title: 'Başarılı!'
                    }))
                } else {
                    res.send(JSON.stringify({
                        status: 'error',
                        message: 'İşlem sırasında hata meydana gelmiştir..',
                        title: 'Başarısız!'
                    }));
                }
            }
        }
    }
}
