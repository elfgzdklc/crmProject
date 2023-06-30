import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const moment = require("moment");
const {getSession} = require("next-auth/react");
const Users = require('../models/users');
const CustomerToUser = require('../models/customerToUser');

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
        const session = await getSession({req});
        const user_id = session.user.id;
        const allUser = await Users.findAll({
            attributes: ['id', 'name', 'surname'],
            where: {
                deleted_id: {
                    [Op.eq]: null
                }
            }
        });
        let customerUserArray = [];
        for (let i = 5; i >= 0; i--) {
            const customerToUser = await CustomerToUser.findAll({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    customer_type: "Firma",
                    assigned_user_id: user_id,
                    created_at: {
                        [Op.between]: [moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD'), moment().subtract(i, 'months').endOf('month').format('YYYY-MM-DD')]
                    }
                }
            })
            customerUserArray.push(customerToUser.length)
        }
        let potentailCustomerUserArray = [];
        for (let i = 5; i >=0; i--) {
            const potentialCustomerToUser = await CustomerToUser.findAll({
                include: [{
                    as: 'user',
                    model: Users
                }],
                where: {
                    customer_type: "Potansiyel Firma",
                    assigned_user_id: user_id,
                    created_at: {
                        [Op.between]: [moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD'), moment().subtract(i, 'months').endOf('month').format('YYYY-MM-DD')]
                    }
                }
            })
            potentailCustomerUserArray.push(potentialCustomerToUser.length)
        }
        if (allUser) {
            res.json({
                data: allUser,
                customerToUser: customerUserArray,
                potentialCustomerToUser: potentailCustomerUserArray,
            })
        } else {
            res.json({
                message: 'Kullanıcı Bulunamadı'
            })
        }
    }
}