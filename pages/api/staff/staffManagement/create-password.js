import {decode} from "next-auth/jwt";
const md5Hash = require("md5-hash");
const User = require('../../models/users');

export default async (req, res) => {
    const id = req.body.id;
    const password = md5Hash.default(req.body.password);
    const user = await User.findOne({
        where: {
            id: id
        }
    });
    if (!user["password"]) {
        const create_password = await User.update({
            password: password
        }, {
            where: {
                id: id
            }
        })
        if (create_password) {
            res.send(JSON.stringify({
                status: 'success',
                message: 'Şifreniz başarıyla oluşturuldu, yönlendiriliyorusunuz.',
                title: 'Başarılı!'
            }))
        } else {
            res.send(JSON.stringify({
                status: 'error',
                message: 'İşlem sırasında hata meydana gelmiştir.',
                title: 'Başarısız!'
            }))
        }
    } else {
        res.send(JSON.stringify({status: 'warning', message: 'Şifrenizi daha önce oluşturdunuz!', title: 'Uyarı!'}))
    }
}