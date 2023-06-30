import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
const Announcements=require("../../models/announcements");
import AnnouncementsDetail from "../../models/announcementDetails";
import Logs from "../../models/logs";

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
        const id = req.query.id;
        const session=await getSession({req});
        const user_id=session.user.id;
        const announcement=await AnnouncementsDetail.update({
            deleted_id: user_id,
        },{
            where: {
                id: id
            }
        });
        if(announcement){
            const announcement_delete=await AnnouncementsDetail.destroy({
                where:{
                    id:id
                }
            });
            if(announcement_delete){
                require('dns').lookup(require('os').hostname(),async(err,add)=>{
                    const logAnnoun={
                        email:session.user.email,
                        action: "Duyurular tablosundan duyurusu silindi.",
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
                    status:"succes",
                    title:"Başarılı",
                    message:"Silme işlemi gerçekleştirildi."
                })
            }
        }
    }
}