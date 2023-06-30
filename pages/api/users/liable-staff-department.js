import {decode} from "next-auth/jwt";
const User = require('../models/users');
const Departments = require("../models/departments");

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
    }
    else {

       User.hasOne(Departments, {
           sourceKey: 'department_id',
           foreignKey: 'id'
       });
       const id = req.body.id;
       const department_id = await User.findAll({
           attributes: ['department_id'],
           where: {
               id: id
           } ,
           include: [
               {
                   as : 'department',
                   model: Departments,
               }],
       })
       const department = await Departments.findAll({
           attributes: ['id', 'department_name'],
           where: {
               id: department_id[0].department_id
           }
       })
       res.json(department);
    }

}