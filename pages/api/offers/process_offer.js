import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Logs from "../models/logs";
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
        const user_email = session.user.email;
        const {offer_id, process, offer_code} = req.body;
        let process_type = "";
        if (process == 1) {
            process_type = "Onay";
        } else if (process == 2) {
            process_type = "Red"
        } else {
            process_type = "İptal"
        }
        const updateProcess = await Offers.update({status: process}, {
            where: {
                id: offer_id
            }
        })
        if (updateProcess) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                const insertLog = await Logs.create({
                    email: user_email,
                    action: 'Teklif tablosundaki "' + offer_code + '" numaralı teklif için "' + process_type + '" işlemi yapılmıştır.',
                    ip_address: add
                })
            })
            res.send(JSON.stringify({status: 'success', message: process_type + ' işlemi gerçekleştirildi.', title: 'Başarılı!'}))
        } else {
            res.send(JSON.stringify({status: 'error', message: 'İşlem sırasında hata meydana gelmiştir.', title: 'Başarısız!'}));
        }
    }
}