import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Users from "../models/users";
import {Op, Sequelize} from "sequelize";

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
        const query = req.query.query;
        const session = await getSession({req});
        const user_id = session.user.id;

        const user_permission = await Users.findAll({
            attributes: ['permission_id', 'department_id'],
            where: {
                id: user_id
            }
        })

        if (user_permission[0].permission_id === 1) {    //Sistemde süper adminse tüm kullanıcıları değilse sadece departmanın kullanıcılarını çeker.
            const employees = await Users.findAll({
                attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'label'], ['id', 'value']],
                where: {
                    [Op.or]: [
                        {name: {[Op.substring]: query}},
                        {surname: {[Op.substring]: query}},
                        {id: {[Op.like]: query}}
                    ],
                    id: {[Op.ne]: user_id}
                },
                limit: 10
            });
            res.json(employees);
        } else {
            const employees = await Users.findAll({
                attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'label'], ['id', 'value']],
                where: {
                    [Op.or]: [
                        {name: {[Op.substring]: query}},
                        {surname: {[Op.substring]: query}},
                        {id: {[Op.like]: query}}
                    ],
                    department_id: user_permission[0].department_id,
                    id: {[Op.ne]: user_id}
                },
                limit: 10
            });
            res.json(employees);
        }
    }
}