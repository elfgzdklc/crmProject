import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import CustomerToOfficial from "../../models/customerToOfficial";
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

        const uploadPath = "public/uploadExcel/" + sampleFile.md5 + ".xlsx";

        await sampleFile.mv(uploadPath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });

        let count = 0;
        let uploadLength = 0;
        readXlsxFile(uploadPath).then(async (rows) => {
            uploadLength = rows.length;
            rows.map((item) => {
                if (count > 0) {
                    CustomerToOfficial.create({
                        user_id: user_id,
                        customer_id: item[0],
                        official_id: item[1],
                    })
                }
                count++;
            })
        })
        if (count === uploadLength) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                Logs.create({
                    email: session.user.email,
                    action: 'Firmalara toplu yükleme işlemi ile yetkili kişi ataması yapılmıştır.',
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