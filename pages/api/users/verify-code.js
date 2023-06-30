import {decode} from "next-auth/jwt";
import User from "../models/users";

export default async (req, res) => {
    const id = req.query.id;
    const code = req.query.verifyCode;
    const user = await User.findOne({
        where: {
            id: id
        }
    });
    let userCode = user["email_verify_code"];
    if (user) {
        if (!user["password"]) {
            if (userCode == code) {
                res.redirect(process.env.NEXTAUTH_URL + `staffManagement/staffPassword/${user["email_verify_code"]}` + "-" + `${user["id"]}`)
            } else {
                res.redirect(process.env.NEXTAUTH_URL + "undifined-code")
            }
        } else {
            res.redirect(process.env.NEXTAUTH_URL + "undifined-pass")
        }
    } else {
        res.redirect(process.env.NEXTAUTH_URL + "undefined-user")
    }
}