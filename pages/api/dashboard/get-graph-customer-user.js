import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const moment = require("moment");
const Users = require('../models/users');
const CustomerToUser = require('../models/customerToUser');
const Sales = require("../models/sales");

CustomerToUser.hasOne(Users, {
    sourceKey: 'assigned_user_id',
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
        let customerUserArray = [];
        for (let i = 0; i < allUser.length; i++) {
            const customerToUser = await CustomerToUser.count({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    customer_type: "Firma",
                    assigned_user_id: allUser[i].id,
                    created_at: {
                        [Op.between]: [start, end]
                    }
                }
            })
            customerUserArray.push(customerToUser)
        }
        let potentailCustomerUserArray = [];
        for (let i = 0; i < allUser.length; i++) {
            const potentialCustomerToUser = await CustomerToUser.count({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    customer_type: "Potansiyel Firma",
                    assigned_user_id: allUser[i].id,
                    created_at: {
                        [Op.between]: [start, end]
                    }
                }
            })
            potentailCustomerUserArray.push(potentialCustomerToUser)
        }

        let salesUserArray=[];
        for (let i=0;i<allUser.length;i++){
            const  totalSales=await Sales.count({
                where:{
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    user_id:allUser[i].id
                }
            })
            salesUserArray.push(totalSales)
        }

        if (allUser) {
            res.json({
                data: allUser,
                customerToUser: customerUserArray,
                potentialCustomerToUser: potentailCustomerUserArray,
                salesToUser:salesUserArray,
            })
        } else {
            res.json({
                message: 'Kullanıcı Bulunamadı'
            })
        }
    }
}