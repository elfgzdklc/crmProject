import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Logs from "../models/logs";
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
        res.status(401).json({error: "Yetkisiz giriş"})
    } else {
        const session = await getSession({req});
        const user_id = session.user.id;
        const user_email = session.user.email;
        const {
            id,
            invoice_no,
            container_no,
            vessel_name,
            delivery_type,
            products
        } = req.body;
        const updateSales = await Sales.update({
            container_no: container_no,
            vessel_name: vessel_name,
            delivery_type: delivery_type,
        }, {
            where: {id: id}
        });
        if (updateSales) {
            products.map(async (item, index) => {
                await SalesDetails.update({
                    packaging: products[index].packaging
                }, {
                    where: {
                        id: products[index].id
                    }
                })
            })
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                const insertLog = await Logs.create({
                    email: user_email,
                    action: 'Satış tablosuna "' + invoice_no + '" isimli satış için paket liste verileri eklendi.',
                    ip_address: add
                })
            })
            res.send(JSON.stringify({status: 'success', message: 'Ekleme işlemi gerçekleştirildi.', title: 'Başarılı!', sales: id}))
        } else {
            res.send(JSON.stringify({status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!'}));
        }
    }
}

