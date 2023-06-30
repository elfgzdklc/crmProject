import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import Department from "../../models/departments";

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
        const departments = await Department.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("department_name")), 'label'], ['id', 'value']],
            where:{
                [Op.or]:[
                    {department_name:{[Op.substring]:query}},
                    {id: {[Op.like]: query}}
                ]
            },
            limit: 10
        });
        res.json(departments);
    }
}