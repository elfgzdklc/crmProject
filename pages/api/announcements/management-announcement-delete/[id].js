import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import User from "../../models/users";
import Departments from "../../models/departments";
const {getSession} = require("next-auth/react");
const Announcements=require("../../models/announcements");
const AnnouncementsDetail=require("../../models/announcementDetails");
AnnouncementsDetail.hasOne(Announcements,{
    sourceKey: 'announcement_id',
    foreignKey: 'id'
})
Announcements.hasOne(User,{
    sourceKey:'user_id',
    foreignKey:'id'
})

const Logs = require("../../models/logs");
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
        const id=req.query.id;
        const session=await getSession({req});
        const user_id=session.user.id;
        const user_announcement=await AnnouncementsDetail.findAll({
            attributes: ['id'],
            where:{
                announcement_id:id,
            }
        })
        const deleted_Announ=await  Announcements.findAll({
            attributes:['subject'],
            where:{id:id}
        })
        const announcement=await Announcements.update({
            deleted_id: user_id,
        },{
            where: {
                id: id
            }
        });
        if(announcement){
            for (let i=0;i<user_announcement.length;i++){
                await AnnouncementsDetail.update({
                    deleted_id: user_id,
                    deleted_at:new Date(),
                },{
                    where: {
                        id: user_announcement[i].id
                    }
                });
            }
            const announcement_delete=await Announcements.destroy({
                where:{
                    id:id
                }
            });
            res.json({
                status:"succes",
                title:"Başarılı",
                message:"Silme işlemi gerçekleştirildi."
            });
            if(announcement_delete){
                require('dns').lookup(require('os').hostname(),async(err,add)=>{
                    const logAnnoun={
                        email:session.user.email,
                        action: "Duyurular tablosundan "+'"'+deleted_Announ[0].subject+'"'+"duyurusu silindi.",
                        ip_address:add
                    };
                    await Logs.create(logAnnoun)
                })
                res.json({
                    status:"succes",
                    title:"Başarılı",
                    message:"Silme işlemi gerçekleştirildi."
                });
            }
            else{
                res.json({
                    status:"error",
                    title:"Başarısız",
                    message:"Silme işlemi gerçekleştirilemedi."
                })
            }
        }
    }
}
