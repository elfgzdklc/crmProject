import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Customers from "../models/customers";
import CustomerToUser from "../models/customerToUser";

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
        Customers.hasMany(CustomerToUser, {foreignKey: 'customer_id', sourceKey: 'id'});
        CustomerToUser.belongsTo(Customers, {foreignKey: 'customer_id', targetKey: 'id'});
        
        const session = await getSession({req});
        const user_id = session.user.id;
        const customers = await Customers.findAll({
            include: [
                {
                    model: CustomerToUser,
                    as:'customerToUsers',
                    required: true,
                    where: {
                        assigned_user_id: user_id
                    }
                }
            ]
        });
        res.json(customers);
    }
}