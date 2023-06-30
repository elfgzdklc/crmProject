import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Events from "../models/events";
import CustomerToOfficial from "../models/customerToOfficial";
import moment from "moment";

const {getSession} = require("next-auth/react");
const Announcements = require("../models/announcements");
const AnnouncementsDetail = require("../models/announcementDetails");
const User = require("../models/users");
const Departments = require("../models/departments");
const Logs = require("../models/logs");


User.hasOne(Departments, {
        sourceKey: 'department_id',
        foreignKey: 'id'
    }
);
AnnouncementsDetail.hasOne(Announcements, {
    sourceKey: 'announcement_id',
    foreignKey: 'id'
})
Announcements.hasOne(User, {
    sourceKey: 'user_id',
    foreignKey: 'id'
})
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
        const user_name = session.user.name;
        const user_email = session.user.email;
        const id = req.body.id;
        const department_id = req.body.department_id;
        const subject = req.body.subject;
        const message = req.body.message;

        if (id != 0) {
            await Announcements.update({
                deleted_id: user_id,
                deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
            }, {
                where: {
                    id: id
                }
            });
            await AnnouncementsDetail.update({
                deleted_id: user_id,
                deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
            }, {
                where: {
                    announcement_id: id
                }
            });

            if (!department_id.length) {
                const user_department = await User.findAll({
                    attributes: ['id'],
                    where: {
                        department_id: department_id.value,
                    }
                })
                const insert = await Announcements.create({
                    user_id: user_id,
                    department_id: department_id.value,
                    department_name: department_id.label,
                    subject: subject,
                    message: message
                })

                if (insert) {
                    for (let i = 0; i < user_department.length; i++) {
                        await AnnouncementsDetail.bulkCreate([
                            {user_id: user_department[i].id, announcement_id: insert.id, status: 1},
                        ])
                    }

                    require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                        await Logs.create({
                            email: user_email,
                            action: 'Duyurular tablosuna "' + user_name + '" tarafından "' + message + '" duyurusu güncellendi.',
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
                department_id.map(async (item) => {
                    const user_department = await User.findAll({
                        attributes: ['id'],
                        where: {
                            department_id: item.value,
                        }
                    })
                    const insert = await Announcements.create({
                        user_id: user_id,
                        department_id: item.value,
                        department_name: item.label,
                        subject: subject,
                        message: message
                    })

                    if (insert) {
                        for (let i = 0; i < user_department.length; i++) {
                            await AnnouncementsDetail.bulkCreate([
                                {user_id: user_department[i].id, announcement_id: insert.id, status: 1},
                            ])
                        }

                        require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                            await Logs.create({
                                email: user_email,
                                action: 'Duyurular tablosuna "' + user_name + '" tarafından "' + message + '" duyurusu güncellendi.',
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

                })
            }

        } else {
            department_id.map(async (item) => {
                const user_department = await User.findAll({
                    attributes: ['id'],
                    where: {
                        department_id: item.value,
                    }
                })
                const insert = await Announcements.create({
                    user_id: user_id,
                    department_id: item.value,
                    department_name: item.label,
                    subject: subject,
                    message: message
                })
                if (insert) {
                    for (let i = 0; i < user_department.length; i++) {
                        await AnnouncementsDetail.bulkCreate([
                            {user_id: user_department[i].id, announcement_id: insert.id, status: 1},
                        ])
                    }
                    require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                        await Logs.create({
                            email: user_email,
                            action: 'Duyurular tablosuna "' + user_name + '" tarafından "' + message + '" duyurusu eklendi.',
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
                        message: 'İşlem sırasında hata meydana gelmiştir.',
                        title: 'Başarısız!'
                    }));
                }
            })
        }
    }
}