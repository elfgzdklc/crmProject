import {decode} from "next-auth/jwt";
import { getSession } from "next-auth/react";
import Users from "../../models/users";
const uuid = require("uuid");

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
        const {name,surname,email,phone,identity_number} = req.body;
        const log_email = req.body.email;
        const unic = uuid.v1();
        let avatar;
        let image_name = [];
        let images = "";
        if (req.files) {
            avatar = req.files.avatar;
            if (avatar.mimetype) {
                image_name.push(avatar.md5 + unic + "." + avatar.mimetype.split('/')[1])
                avatar.mv('public/assets/img/user/'+avatar.md5+unic+ "." +avatar.mimetype.split('/')[1])
            } else {
                for (let value in avatar) {
                    image_name.push(avatar[value].md5 + unic + "." + avatar[value].mimetype.split('/')[1])
                }
            }
            images = image_name.join(", ");
        }
        else {
            avatar = req.body.avatar;
            images = avatar;
        }
        const update = await Users.update({
        identity_number: identity_number,
        email: email,
        name: name,
        surname: surname,
        phone: phone,
        avatar: images,
        log_email: log_email
    }, {
        where: {
            id: user_id
        }
    });
    if (update) {
        require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
            await Logs.create({
                email: log_email,
                name: name,
                action: 'Kullanıcı "' + name + '" isimli ve "' + email + '" adresli kullanıcı hesabını güncelledi.',
                ip_address: add
            })
        })
        res.send(JSON.stringify({
            status: 'success',
            message: 'Güncelleme işlemi gerçekleştirildi.',
            title: 'Başarılı!'
        }))
    } else {
        res.send(
            JSON.stringify({
                    status: 'error',
                    message: 'İşlem sırasında hata meydana gelmiştir.',
                    title: 'Başarısız!'
                }
            ));
    }
    }
}