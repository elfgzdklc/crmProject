import {decode} from "next-auth/jwt";
import SalesServices from "../models/salesServices";
import Logs from "../models/logs";
import {getSession} from "next-auth/react";
const uuid = require('uuid');

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
            invoice_no,
            customer_trade_name,
            description,
            solution,
            problem,
            product,
            sales_owner,
            date,
        } = req.body;

        const unic = uuid.v1();
        let service_file;
        let service_file_name = [];
        let files = "";

        if (req.files) {
            service_file = req.files.file;
            if (service_file.mimetype) {
                if (service_file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || service_file.mimetype == "application/vnd.ms-excel") {
                    service_file_name.push(service_file.md5 + unic + ".xlsx")
                    service_file.mv("public/uploadsAfterSalesService/" + service_file.md5 + unic + ".xlsx")
                } else if (service_file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || service_file.mimetype == "application/msword") {
                    service_file_name.push(service_file.md5 + unic + ".docx")
                    service_file.mv("public/uploadsAfterSalesService/" + service_file.md5 + unic + ".docx")
                } else if (service_file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || service_file.mimetype == "application/vnd.ms-powerpoint") {
                    service_file_name.push(service_file.md5 + unic + ".pptx")
                    service_file.mv("public/uploadsAfterSalesService/" + service_file.md5 + unic + ".pptx")
                } else {
                    service_file_name.push(service_file.md5 + unic + "." + service_file.mimetype.split('/')[1])
                    service_file.mv("public/uploadsAfterSalesService/" + service_file.md5 + unic + "." + service_file.mimetype.split('/')[1])
                }
            } else {
                for (let value in service_file) {
                    if (service_file[value].mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || service_file[value].mimetype == "application/vnd.ms-excel") {
                        service_file_name.push(service_file[value].md5 + unic + ".xlsx")
                        service_file[value].mv("public/uploadsAfterSalesService/" + service_file[value].md5 + unic + ".xlsx")
                    } else if (service_file[value].mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || service_file[value].mimetype == "application/msword") {
                        service_file_name.push(service_file[value].md5 + unic + ".docx")
                        service_file[value].mv("public/uploadsAfterSalesService/" + service_file[value].md5 + unic + ".docx")
                    } else if (service_file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || service_file.mimetype == "application/vnd.ms-powerpoint") {
                        service_file_name.push(service_file[value].md5 + unic + ".pptx")
                        service_file[value].mv("public/uploadsAfterSalesService/" + service_file[value].md5 + unic + ".pptx")
                    } else {
                        service_file_name.push(service_file[value].md5 + unic + "." + service_file[value].mimetype.split('/')[1])
                        service_file[value].mv("public/uploadsAfterSalesService/" + service_file[value].md5 + unic + "." + service_file[value].mimetype.split('/')[1])
                    }
                }
            }
            files = service_file_name.join(",");
        } else {
            service_file = req.body.file;
            files = service_file;
        }
        const createSalesService = await SalesServices.create({
            user_id: user_id,
            file: files,
            invoice_no: invoice_no,
            customer_trade_name: customer_trade_name,
            description: description,
            solution: solution,
            problem: problem,
            product: product,
            sales_owner: sales_owner,
            date: date,
        })
        if (createSalesService) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                await Logs.create({
                    email: user_email,
                    action: invoice_no + '" numaralı faturaya satış sonrası hizmet eklendi.',
                    ip_address: add
                })
            })
            res.json({
                status: "success",
                title: "Başarılı!",
                message: "Ekleme işlemi gerçekleştirildi."
            });
        } else {
            res.send(JSON.stringify({
                status: 'error',
                message: 'İşlem sırasında hata meydana gelmiştir.',
                title: 'Başarısız!'
            }));
        }
    }
}