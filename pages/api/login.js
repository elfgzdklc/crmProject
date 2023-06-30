const md5Hash = require("md5-hash")
const Users = require("./models/users");
const { Op } = require("sequelize");
const Logs = require("./models/logs");
const publicIp = require("react-public-ip");

// export default async (req, res) => {
//     const email = req.body.email;
//     const password = md5Hash.default(req.body.password);
//     Users.findOne({
//         where: {
//             [Op.and]: [
//                 {email: email},
//                 {password: password},
//                 {deleted_at: null},
//             ]
//         }
//     }).then(async (user) => {
//             if (user) {
//                 res.status(200).send(JSON.stringify({
//                     id: user.id,
//                     name_surname: user.name + " " + user.surname,
//                     name: user.name,
//                     surname: user.surname,
//                     email: user.email,
//                     avatar: user.avatar,
//                     permission_id: user.permission_id,
//                     personel_code: user.personel_code,
//                     status: "success"
//                 }))
//                 const ipv4 = await publicIp.v4() || "";
//                 const ipAddress = req.body.ipAddress;
//                 await Logs.create({
//                     email: user.email,
//                     action: 'Başarılı giriş yapılmıştır.',
//                     ip_address: ipAddress
//                 })
//             } else {
//                 res.status(403).send(JSON.stringify({
//                     status: "error",
//                     title: 'Giriş başarısız',
//                     message: 'Giriş başarısız.',
//                     data: user
//                 }))
//             }
//         }
//     ).catch(err => {
//             res.status(403).send(JSON.stringify({
//                 status: "error",
//                 title: 'Giriş başarısız',
//                 message: 'Giriş başarısız.'
//             }))
//         }
//     )
// }

export default async (req,res)=>{
        const email = req.body.email;
    const password = md5Hash.default(req.body.password);

    Users.findOne({
        where: {
            [Op.and]: [
                {email: email},
                {password: password},
                {deleted_at: null},
            ]
        }
    }).then(async (user) => {
            if (user) {
                res.status(200).send(JSON.stringify({
                    id: user.id,
                    name_surname: user.name + " " + user.surname,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    avatar: user.avatar,
                    permission_id: user.permission_id,
                    personel_code: user.personel_code,
                    status: "success"
                }))
                const ipAddress = req.body.ipAddress;
                await Logs.create({
                    email: user.email,
                    action: 'Başarılı giriş yapılmıştır.',
                    ip_address: ipAddress
                })
            } else {
                res.status(403).send(JSON.stringify({
                    status: "error",
                    title: 'Giriş başarısız',
                    message: 'Kullanıcı adı veya şifre hatalı.',
                    data: user
                }))
            }
        }
    ).catch(err => {
            res.status(403).send(JSON.stringify({
                status: "error",
                title: 'Giriş başarısız',
                message: 'Kullanıcı adı veya şifre hatalı.'
            }))
        }
    )

}
