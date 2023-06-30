import { now } from "moment";
import { decode } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Customers from "../models/customers";
import Logs from "../models/logs";
import Offers from "../models/offers";
import Products from "../models/products";
import Sales from "../models/sales";
import SalesDetails from "../models/salesDetails";

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
        res.status(401).json({ error: "Yetkisiz giriş" })
    } else {
        const session = await getSession({ req });
        const user_id = session.user.id;
        const user_email = session.user.email;
        const {
            offer_id,
            bank_id,
            customer_id,
            customer_trade_name,
            authorized_person,
            authorized_person_email,
            authorized_person_phone,
            offer_code,
            offer_date,
            end_date,
            maturity_date,
            invoice_address_id,
            shipment_address_id,
            delivery_time,
            maturity_time,
            subject,
            transport,
            currency_unit,
            subtotal,
            vat_total,
            discount_total,
            overall_total,
            shipping_cost,
            shipping_percent,
            shipping_percentage_amount,
            shipping_total_cost,
            sales_code,
            note,
            invoice_no,
            invoice_date,
            payment,
            shipped_by,
            delivery_term,
            origin,
            number_of_packages,
            type_of_packaging,
            products
        } = req.body;

        const insertSales = await Sales.create({
            user_id: user_id,
            bank_id:bank_id,
            offer_code: offer_code,
            customer_id: customer_id,
            customer_trade_name: customer_trade_name,
            authorized_person: authorized_person,
            authorized_person_email: authorized_person_email,
            authorized_person_phone: authorized_person_phone,
            offer_date: offer_date,
            end_date: end_date,
            maturity_date: maturity_date,
            invoice_address: invoice_address_id,
            shipment_address: shipment_address_id,
            delivery_time: delivery_time,
            maturity_time: maturity_time,
            subject: subject,
            transport:transport,
            currency_unit: currency_unit,
            subtotal: subtotal,
            vat_total: vat_total,
            discount_total: discount_total,
            overall_total: overall_total,
            shipping_cost: shipping_cost,
            shipping_percent: shipping_percent,
            shipping_percentage_amount: shipping_percentage_amount,
            shipping_total_cost: shipping_total_cost,
            sales_code: sales_code,
            note: note,
            invoice_no: invoice_no,
            invoice_date: invoice_date ? invoice_date : null,
            payment: payment,
            shipped_by: shipped_by,
            delivery_term: delivery_term,
            origin: origin,
            number_of_packages: number_of_packages,
            type_of_packaging: type_of_packaging,
            status: 1
        })
        const offersSaleStatusUpdate = await Offers.update({
            sales_status: 1,
        }, {
            where: { id: offer_id }
        });

        if (insertSales) {
            const customerTypeUpdate = await Customers.update({
                type: 0
            }, {
                where: { id: customer_id }
            });
            products.map(async (item, index) => {
                const insertSalesDetails = await SalesDetails.create({
                    sales_id: insertSales.id,
                    product_id: products[index].product_id,
                    product_name: products[index].product_name,
                    quantity: -products[index].quantity,
                    availability: products[index].availability,
                    unit: products[index].unit,
                    unit_price: products[index].unit_price,
                    currency_unit: products[index].currency_unit,
                    vat: products[index].vat,
                    vat_amount: products[index].vat_amount,
                    discount: products[index].discount,
                    discount_type: products[index].discount_type,
                    discount_amount: products[index].discount_amount,
                    subtotal: products[index].subtotal,
                    total: products[index].total,
                    description: products[index].description,
                })
                //ürün stok güncelleme
                await Products.increment({ stock: -products[index].quantity }, { where: { id: products[index].product_id } })
            })

            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                const insertLog = await Logs.create({
                    email: user_email,
                    action: 'Satış tablosuna "' + sales_code + '" isimli satış eklendi.',
                    ip_address: add
                })
            })
            res.send(JSON.stringify({ status: 'success', message: 'Ekleme işlemi gerçekleştirildi.', title: 'Başarılı!', sales: insertSales.id }))
        } else {
            res.send(JSON.stringify({ status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!' }));
        }
    }
}

