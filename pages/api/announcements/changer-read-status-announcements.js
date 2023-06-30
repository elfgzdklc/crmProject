import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const AnnouncementsDetail=require("../models/announcementDetails");

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
    }
}