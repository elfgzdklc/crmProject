import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { Op } from "sequelize";
import CustomerToOfficial from "../models/customerToOfficial";
import Logs from "../models/logs";
import OfferDetails from "../models/offerDetails";
import Offers from "../models/offers";

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
        id,
        bank_id,
        currency_unit,
        customer_id,
        customer_trade_name,
        delivery_range,
        delivery_time,
        delivery_term,
        discount_total,
        end_date,
        invoice_address,
        maturity_range,
        maturity_time,
        maturity_date,
        number_of_packages,
        offer_code,
        offer_date,
        origin,
        overall_total,
        payment,
        transport,
        shipment_address,
        shipped_by,
        shipping_cost,
        shipping_percent,
        shipping_percentage_amount,
        shipping_total_cost,
        subject,
        subtotal,
        type_of_packaging,
        validity,
        vat_total,
        foreign_currency,
        products
    } = req.body;

    await Offers.update({revised: 1}, {
        where: {id: id}
    })
    const count = await Offers.count({
        where: {
            [Op.and]: [
                {offer_code: offer_code},
                {revised: 1}
            ]
        }
    });

    const customerToOfficial = await CustomerToOfficial.findAll({
        where: {customer_id: customer_id}
    })

    if (customerToOfficial[0]) {
        const insertOffer = await Offers.create({
            user_id: user_id,
            bank_id:bank_id,
            offer_code: offer_code,
            customer_id: customer_id,
            customer_trade_name: customer_trade_name,
            offer_date: offer_date,
            end_date: end_date,
            maturity_date: maturity_date,
            invoice_address: invoice_address,
            shipment_address: shipment_address,
            delivery_time: delivery_time + " " + delivery_range,
            maturity_time: maturity_time + " " + maturity_range,
            subject: subject,
            currency_unit: currency_unit,
            subtotal: subtotal,
            vat_total: vat_total,
            discount_total: discount_total,
            overall_total: overall_total,
            shipping_cost: shipping_cost,
            shipping_percent: shipping_percent,
            shipping_percentage_amount: shipping_percentage_amount,
            shipping_total_cost: shipping_total_cost,
            payment: payment,
            transport:transport,
            shipped_by: shipped_by,
            delivery_term: delivery_term,
            origin: origin,
            number_of_packages: number_of_packages,
            type_of_packaging: type_of_packaging,
            revised_code: "R" + count,
            validity: validity,
            foreign_currency: foreign_currency
        })
        if (insertOffer) {
            products.map(async (item, index) => {
                const insertOfferDetails = await OfferDetails.create({
                    offer_id: insertOffer.id,
                    product_id: products[index].product_id,
                    product_name: products[index].product_name,
                    quantity: products[index].quantity,
                    unit: products[index].unit,
                    unit_price: products[index].unit_price,
                    availability: products[index].availability_range ? products[index].availability_time + " " + products[index].availability_range : products[index].availability,
                    currency_unit: currency_unit,
                    vat: products[index].vat,
                    vat_amount: products[index].vat_amount,
                    discount: products[index].discount ? products[index].discount : "0.00",
                    discount_type: products[index].discount_type,
                    discount_amount: products[index].discount_amount,
                    subtotal: products[index].subtotal,
                    total: products[index].total,
                    description: products[index].description,
                })
            })
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                const insertLog = await Logs.create({
                    email: user_email,
                    action: 'Teklif tablosunda "' + offer_code + '" isimli teklifte revize işlemi yapıldı.',
                    ip_address: add
                })
            })
            res.send(JSON.stringify({status: 'success', message: 'Revize işlemi gerçekleştirildi.', title: 'Başarılı!', offer: insertOffer.id}))
        } else {
            res.send(JSON.stringify({status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!'}));
        }
    } else {
        res.send(JSON.stringify({status: 'warning', message: 'Firmaya ait yetkili tanımlamadan işleme devam edilemez.', title: 'Başarısız!'}));
    }
    }
}