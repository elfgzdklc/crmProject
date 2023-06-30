const express=require('express');
const router=express.Router();
const {Op}=require('sequelize');
const moment = require("moment");
const {getSession} = require("next-auth/react");
const Announcements=require("../models/announcements");
const AnnouncementsDetail=require("../models/announcementDetails");
const User = require("../models/users");
const Departments = require("../models/departments");
const Logs = require("../models/logs");

User.hasOne(Departments, {
        sourceKey: 'department_id',
        foreignKey: 'id'
    }
);
AnnouncementsDetail.hasOne(Announcements,{
    sourceKey: 'announcement_id',
    foreignKey: 'id'
})
Announcements.hasOne(User,{
    sourceKey:'user_id',
    foreignKey:'id'
})

router.post('/api/header/get-user-announcements',async (req,res)=>{
    const session = await getSession({req});
    const user_id = req.body.user_id;
    const announcements=await AnnouncementsDetail.findAll({
        include:[{
            model:Announcements,
            as: 'announcement'
        }],
        where:{
            user_id:user_id,
            status:1
        }
    });
    if (announcements){
        res.json({
            status:true,
            data:announcements
        })
    }else{
        res.json({
            status: false,
            message: 'Duyuru Bulunamadı'
        })
    }
})

router.post('/api/changer-read-status-announcements',async (req,res)=>{
    const id=req.body.id;
    if(id!=0){
        const update=await AnnouncementsDetail.update({
            status:0
        },
            {
                where:{
                    id:id
                }
            });
        if (update){
            res.send(JSON.stringify({
                status: 'success',
                message: 'Güncelleme işlemi gerçekleştirildi.',
                title: 'Başarılı!'
            }))
        }
    }
})

module.exports=router;