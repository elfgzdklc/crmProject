import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Offers from "../models/offers";
const moment = require("moment");
const Users=require('../models/users');

Offers.hasOne(Users, {
    sourceKey: 'user_id',
    foreignKey: 'id'
});

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
        const start = moment().startOf('month').format('YYYY-MM-DD');
        const end = moment().endOf('month').format('YYYY-MM-DD');
        const allUser = await Users.findAll({
            attributes: ['id', 'name', 'surname'],
            where: {
                deleted_id: {
                    [Op.eq]: null
                }
            }
        });

        let offerApprovedUserArray = [];
        for (let i = 0; i < allUser.length; i++) {
            const offerApprovedToUser = await Offers.count({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    status: 1,
                    user_id: allUser[i].id,
                }
            })
            offerApprovedUserArray.push(offerApprovedToUser)
        }
        let offerRejectedUserArray = [];
        for (let i = 0; i < allUser.length; i++) {
            const offerRejectedToUser = await Offers.count({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    status: 2,
                    user_id: allUser[i].id,
                }
            })
            offerRejectedUserArray.push(offerRejectedToUser)
        }
        let offerWaitUserArray=[];
        for (let i = 0; i < allUser.length; i++) {
            const offerWaitToUser = await Offers.count({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    status: 0,
                    user_id: allUser[i].id,
                }
            })
            offerWaitUserArray.push(offerWaitToUser)
        }
        let offerCanceledUserArray=[];
        for (let i = 0; i < allUser.length; i++) {
            const offerCanceledToUser = await Offers.count({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    status: 3,
                    user_id: allUser[i].id,
                }
            })
            offerCanceledUserArray.push(offerCanceledToUser)
        }

        if (allUser) {
            res.json({
                data: allUser,
                offerApprovedToUser: offerApprovedUserArray,
                offerRejectedToUser: offerRejectedUserArray,
                offerWaitToUser:offerWaitUserArray,
                offerCanceledToUser:offerCanceledUserArray,
            })
        } else {
            res.json({
                message: 'Kullanıcı Bulunamadı'
            })
        }
    }
}