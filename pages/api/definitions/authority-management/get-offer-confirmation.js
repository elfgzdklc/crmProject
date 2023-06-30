import {Op, Sequelize} from "sequelize";
import {decode} from "next-auth/jwt";
import Users from "../../models/users";

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
        const users = await Users.findAll({
            attributes: [[Sequelize.fn('concat', Sequelize.col("name"), " ", Sequelize.col("surname")), 'fullName']],
            where: {
                permission_id: 2
            }
        });
        res.json(users);
    }
}
