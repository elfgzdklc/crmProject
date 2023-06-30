const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');
const Events = require('../models/events');
const {getSession} = require("next-auth/react");
const Logs = require("../models/logs");

router.post('/api/user-reminder-alert', async (req, res) => {
    const session = await getSession({req});
    const user_id = session.user.id;
    const moment = require('moment');
    let meetingUserAlertArray=[];
    const startAlert = moment().startOf('minute').format('YYYY-MM-DD 00:00:00');
    const endAlert = moment().endOf('minute').format('YYYY-MM-DD 23:59:59');
    const meetingCustomer = await Events.findAll(
        {
            where: {
                user_id: {
                    [Op.eq]: user_id
                },
                meeting_id: {
                    [Op.ne]: null
                },
                start: {
                    [Op.between]: [startAlert, endAlert]
                },
                read:0,
            }
        }
    );
    for(let i=0;i<meetingCustomer.length;i++){
        const userAlert = await Events.findAll(
            {
                where: {
                    user_id: {
                        [Op.eq]: user_id
                    },
                    meeting_id: {
                        [Op.ne]: null
                    },
                    start: {
                        [Op.between]: [startAlert, endAlert]
                    },
                    read:0,
                }
            }
        );
        meetingUserAlertArray.push(userAlert)
    }
    if (meetingUserAlertArray) {
        res.json({
            data: meetingUserAlertArray,
        })
    } else {
        res.json({
            message: 'Hatırlatma Bulunamadı'
        })
    }
});

router.post('/api/user-read-reminder-alert', async (req, res) => {
    const session = await getSession({req});
    const user_id = session.user.id;
    const moment = require('moment');
    const user_email = session.user.email;
    const startAlert = moment().startOf('minute').format('YYYY-MM-DD 00:00:00');
    const endAlert = moment().endOf('minute').format('YYYY-MM-DD 23:59:59');
    let userRead;
    let userReadEventArray = [];
    const meetingCustomer = await Events.findAll(
        {
            where: {
                user_id: {
                    [Op.eq]: user_id
                },
                meeting_id: {
                    [Op.ne]: null
                },
                start: {
                    [Op.between]: [startAlert, endAlert]
                },
                read:0
            }
        }
    );
    for (let i = 0; i <meetingCustomer.length; i++) {
        userRead=await Events.update({
                read:1
            },{
                where:{
                    meeting_id:meetingCustomer[i].meeting_id
                }
            }
        )
        userReadEventArray.push(userRead)
        if (userRead){
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                 await Logs.create({
                    email: user_email,
                    action: 'Kullanıcı ' + meetingCustomer[i].title + '" hatırlatmasını gördü. "',
                    ip_address: add
                })
            })
        }
    }


    if (userRead) {
        res.json({
            data: userReadEventArray,
        })
    } else {
        res.json({
            message: 'Hatırlatma Okunamadı'
        })
    }
});


module.exports = router;