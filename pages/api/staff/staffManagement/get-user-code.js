import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
import User from "../../models/users";

export default async (req, res) => {
    const id = req.body.id;
    const user = await User.findOne({
        where: {
            id: id
        }
    });
    res.json(user["email_verify_code"]);
}