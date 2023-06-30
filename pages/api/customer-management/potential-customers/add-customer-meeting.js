import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import {Sequelize} from "sequelize";
import Logs from "../../models/logs";
import Customers from "../../models/customers";
import CustomerMeetings from "../../models/customerMeetings";

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
        const {
            customer_id,
            meeting_type,
            meeting_subject,
            meeting_description,
            meeting_user_id,
            meeting_user_name
        } = req.body;


        const customer_name = await Customers.findAll({     //id'ye ait bilgiler log için kullanılacak
            attributes: ['trade_name'],
            where: {
                id: customer_id
            }
        });

        const unic = uuid.v1();
        let meeting_file;
        let meeting_file_name = [];
        let files = "";

        if (req.files) {
            meeting_file = req.files.meeting_file;
            if (meeting_file.mimetype) {
                if (meeting_file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || meeting_file.mimetype == "application/vnd.ms-excel") {
                    meeting_file_name.push(meeting_file.md5 + unic + ".xlsx")
                    meeting_file.mv("public/uploadsMeeting/" + meeting_file.md5 + unic + ".xlsx")
                } else if (meeting_file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || meeting_file.mimetype == "application/msword") {
                    meeting_file_name.push(meeting_file.md5 + unic + ".docx")
                    meeting_file.mv("public/uploadsMeeting/" + meeting_file.md5 + unic + ".docx")
                } else if (meeting_file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || meeting_file.mimetype == "application/vnd.ms-powerpoint") {
                    meeting_file_name.push(meeting_file.md5 + unic + ".pptx")
                    meeting_file.mv("public/uploadsMeeting/" + meeting_file.md5 + unic + ".pptx")
                } else {
                    meeting_file_name.push(meeting_file.md5 + unic + "." + meeting_file.mimetype.split('/')[1])
                    meeting_file.mv("public/uploadsMeeting/" + meeting_file.md5 + unic + "." + meeting_file.mimetype.split('/')[1])
                }
            } else {
                for (let value in meeting_file) {
                    if (meeting_file[value].mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || meeting_file[value].mimetype == "application/vnd.ms-excel") {
                        meeting_file_name.push(meeting_file[value].md5 + unic + ".xlsx")
                        meeting_file[value].mv("public/uploadsMeeting/" + meeting_file[value].md5 + unic + ".xlsx")
                    } else if (meeting_file[value].mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || meeting_file[value].mimetype == "application/msword") {
                        meeting_file_name.push(meeting_file[value].md5 + unic + ".docx")
                        meeting_file[value].mv("public/uploadsMeeting/" + meeting_file[value].md5 + unic + ".docx")
                    } else if (meeting_file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || meeting_file.mimetype == "application/vnd.ms-powerpoint") {
                        meeting_file_name.push(meeting_file[value].md5 + unic + ".pptx")
                        meeting_file[value].mv("public/uploadsMeeting/" + meeting_file[value].md5 + unic + ".pptx")
                    } else {
                        meeting_file_name.push(meeting_file[value].md5 + unic + "." + meeting_file[value].mimetype.split('/')[1])
                        meeting_file[value].mv("public/uploadsMeeting/" + meeting_file[value].md5 + unic + "." + meeting_file[value].mimetype.split('/')[1])
                    }
                }
            }
            files = meeting_file_name.join(",");
        } else {
            meeting_file = req.body.meeting_file;
            files = meeting_file;
        }

        const customer_meeting = await CustomerMeetings.create({
            user_id: user_id,
            customer_id: customer_id,
            meeting_code: "MTNG" + Math.floor(Math.random() * (99 - 10 + 1) + 10) + Math.floor(Math.random() * (999 - 100 + 1) + 100),
            meeting_type: meeting_type,
            meeting_subject: meeting_subject,
            meeting_description: meeting_description,
            meeting_user_id: meeting_user_id,
            meeting_user_name: meeting_user_name ,
            meeting_file: files
        });
        if (customer_meeting) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                await Logs.create({                                          //log oluşturuluyor
                    email: session.user.email,
                    action: '"' + customer_name[0].trade_name + '"' + " isimli firmaya görüşme eklendi.",
                    ip_address: add
                });
            });
            await Customers.update({
                last_meeting_time: Sequelize.fn("NOW")
            }, {
                where: {id: customer_id}
            });
            res.json({
                status: "success",
                title: "Başarılı!",
                message: "Görüşme ekleme işlemi gerçekleştirildi."
            });
        } else {
            res.json({
                status: "error",
                title: "Başarısız!",
                message: "İşlem sırasında hata meydana gelmiştir."
            });
        }
    }
}