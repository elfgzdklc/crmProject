import { now } from "moment";
import { decode } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Logs from "../../models/logs";
import Products from "../../models/products";
import PurchaseDetails from "../../models/purchaseDetails";
import Purchases from "../../models/purchases";

export default async (req, res) => {
    //para formatı
    Number.prototype.format = function (n, x, s, c) {
        let re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };

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
        res.status(401).json({ error: "Yetkisiz giriş" })
    } else {
        const session = await getSession({ req });
        const user_id = session.user.id;
        const user_email = session.user.email;
        const {
            purchase_code,
            document_number,
            customer,
            purchase_date,
            delivery_date,
            maturity_date,
            invoice_address,
            delivery_range,
            delivery_time,
            maturity_range,
            maturity_time,
            subject,
            subtotal,
            vat_total,
            discount_total,
            overall_total,
            shipping_cost,
            products
        } = req.body;

        const insertPurchase = await Purchases.create({
            user_id: user_id,
            document_number: document_number,
            purchase_code: purchase_code,
            customer_id: customer["value"],
            customer_trade_name: customer["label"],
            purchase_date: purchase_date ? purchase_date : now(),
            delivery_date: delivery_date ? delivery_date : now(),
            maturity_date: maturity_date ? maturity_date : now(),
            invoice_address: invoice_address,
            delivery_time: delivery_time + " " + delivery_range,
            maturity_time: maturity_time + " " + maturity_range,
            subject: subject,
            subtotal: subtotal,
            vat_total: vat_total,
            discount_total: discount_total,
            overall_total: overall_total,
            shipping_cost: (shipping_cost) ? shipping_cost : 0.00
        })
        if (insertPurchase) {
            products.map(async (item, index) => {
                const insertPurchaseDetails = await PurchaseDetails.create({
                    purchase_id: insertPurchase.id,
                    product_id: products[index].product["value"],
                    product_name: (products[index].product["label"]).split(" || ")[1],
                    quantity: products[index].quantity,
                    unit: products[index].unit,
                    unit_price: products[index].unit_price,
                    currency_unit: products[index].currency_unit,
                    vat: products[index].vat,
                    vat_amount: products[index].vat_amount,
                    discount: (products[index].discount) ? products[index].discount : 0.00,
                    discount_type: products[index].discount_type,
                    discount_amount: products[index].discount_amount,
                    subtotal: products[index].subtotal,
                    total: products[index].total,
                    description: products[index].description,
                })
                let price = parseFloat(products[index].unit_price).format(2, 3, '.', ',')
                //ürün stock, price güncelleme
                const q = await Products.increment({ stock: products[index].quantity }, { where: { id: products[index].product["value"] } })
                const u = await Products.update({
                    price: price,
                    sale_price: ""
                }, {
                    where: {
                        id: products[index].product["value"]
                    }
                });
            })
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                const insertLog = await Logs.create({
                    email: user_email,
                    action: 'Alış tablosuna "' + purchase_code + '" isimli alış eklendi.',
                    ip_address: add
                })
            })
            res.send(JSON.stringify({ status: 'success', message: 'Ekleme işlemi gerçekleştirildi.', title: 'Başarılı!' }))
        } else {
            res.send(JSON.stringify({ status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!' }));
        }

    }
}
