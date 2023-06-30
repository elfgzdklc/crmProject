import moment, {now} from "moment";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
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
            customer,
            bank,
            offer_date,
            end_date,
            maturity_date,
            invoice_address,
            shipment_address,
            delivery_range,
            delivery_time,
            maturity_range,
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
            payment,
            shipped_by,
            delivery_term,
            origin,
            number_of_packages,
            total_gross_weight,
            type_of_packaging,
            validity,
            foreign_currency,
            products,
            completed
        } = req.body;

        if (completed === true) {
            const count = await Offers.count();
            let countEnd = [];
            if (count.toString().length < 5) {
                for (let i = 0; i < 5 - (count.toString().length); i++) {
                    countEnd += 0;
                }
            }
            const offer_code = "CRM" + customer["code"] + "-" + moment(now()).format("DDMM") + "-" + countEnd + (count + 1)

            const customerToOfficial = await CustomerToOfficial.findAll({
                where: {customer_id: customer["value"]}
            })

            if (customerToOfficial[0]) {
                const insertOffer = await Offers.create({
                    user_id: user_id,
                    bank_id: bank,
                    offer_code: offer_code,
                    customer_id: customer["value"],
                    customer_trade_name: customer["label"],
                    offer_date: offer_date ? offer_date : now(),
                    end_date: end_date ? end_date : now(),
                    maturity_date: maturity_date ? maturity_date : now(),
                    invoice_address: invoice_address,
                    shipment_address: shipment_address,
                    delivery_time: delivery_time + " " + delivery_range,
                    maturity_time: maturity_time + " " + maturity_range,
                    subject: subject,
                    transport: transport,
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
                    shipped_by: shipped_by,
                    delivery_term: delivery_term,
                    origin: origin,
                    number_of_packages: number_of_packages,
                    total_gross_weight: total_gross_weight,
                    type_of_packaging: type_of_packaging,
                    validity: validity,
                    foreign_currency: foreign_currency
                })
                if (insertOffer) {
                    products.map(async (item, index) => {
                        await OfferDetails.create({
                            offer_id: insertOffer.id,
                            product_id: products[index].product["value"],
                            product_name: (products[index].product["label"]).split(" || ")[1],
                            quantity: products[index].quantity,
                            unit: products[index].unit,
                            unit_price: products[index].unit_price ? products[index].unit_price : "0.00",
                            availability: products[index].availability_time != "" ? products[index].availability_time + " " + products[index].availability_range : products[index].availability_range,
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
                        await Logs.create({
                            email: user_email,
                            action: 'Teklif tablosuna "' + offer_code + '" isimli teklif eklendi.',
                            ip_address: add
                        })
                    })
                    res.send(JSON.stringify({
                        status: 'success',
                        message: 'Ekleme işlemi gerçekleştirildi.',
                        title: 'Başarılı!',
                        offer: insertOffer.id
                    }))
                } else {
                    res.send(JSON.stringify({
                        status: 'error',
                        message: 'İşlem sırasında hata meydana gelmiştir.',
                        title: 'Başarısız!'
                    }));
                }
            }
            else {
                res.send(JSON.stringify({
                    status: 'warning',
                    message: 'Firmaya ait yetkili tanımlamadan işleme devam edilemez.',
                    title: 'Başarısız!'
                }));
            }
        }
        else {
            const count = await Offers.count();
            let countEnd = [];
            if (count.toString().length < 5) {
                for (let i = 0; i < 5 - (count.toString().length); i++) {
                    countEnd += 0;
                }
            }
            const offer_code = "CRM" + customer["code"] + "-" + moment(now()).format("DDMM") + "-" + countEnd + (count + 1)

            const customerToOfficial = await CustomerToOfficial.findAll({
                where: {customer_id: customer["value"]}
            })

            if (customerToOfficial[0]) {
                const insertOffer = await Offers.create({
                    user_id: user_id,
                    bank_id: bank,
                    offer_code: offer_code,
                    customer_id: customer["value"],
                    customer_trade_name: customer["label"],
                    offer_date: offer_date ? offer_date : now(),
                    end_date: end_date ? end_date : now(),
                    maturity_date: maturity_date ? maturity_date : now(),
                    invoice_address: invoice_address,
                    shipment_address: shipment_address,
                    delivery_time: delivery_time + " " + delivery_range,
                    maturity_time: maturity_time + " " + maturity_range,
                    subject: subject,
                    transport: transport,
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
                    shipped_by: shipped_by,
                    delivery_term: delivery_term,
                    origin: origin,
                    number_of_packages: number_of_packages,
                    total_gross_weight: total_gross_weight,
                    type_of_packaging: type_of_packaging,
                    validity: validity,
                    foreign_currency: foreign_currency,
                    status: 4
                })
                if (insertOffer) {
                    products.map(async (item, index) => {
                        await OfferDetails.create({
                            offer_id: insertOffer.id,
                            product_id: products[index].product["value"],
                            product_name: (products[index].product["label"]).split(" || ")[1],
                            quantity: products[index].quantity,
                            unit: products[index].unit,
                            unit_price: products[index].unit_price ? products[index].unit_price : "0.00",
                            availability: products[index].availability_time != "" ? products[index].availability_time + " " + products[index].availability_range : products[index].availability_range,
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
                        await Logs.create({
                            email: user_email,
                            action: 'Teklif tablosuna "' + offer_code + '" isimli teklif eklendi.',
                            ip_address: add
                        })
                    })
                    res.send(JSON.stringify({
                        status: 'success',
                        message: 'Ekleme işlemi gerçekleştirildi.',
                        title: 'Başarılı!',
                        offer: insertOffer.id
                    }))
                } else {
                    res.send(JSON.stringify({
                        status: 'error',
                        message: 'İşlem sırasında hata meydana gelmiştir.',
                        title: 'Başarısız!'
                    }));
                }
            } else {
                res.send(JSON.stringify({
                    status: 'warning',
                    message: 'Firmaya ait yetkili tanımlamadan işleme devam edilemez.',
                    title: 'Başarısız!'
                }));
            }
        }

    }
}
