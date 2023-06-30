const express = require('express');
const router = express.Router();
const User=require('../../../pages/api/models/users')
const {Op} = require("sequelize");
const {getSession} = require("next-auth/react");
const Logs = require("../models/logs");
const md5Hash = require("md5-hash")
const uuid = require("uuid");

// router.post('/api/users/edit-profile-info', async (req, res) => {
//         const session = await getSession({req});
//         const user_id = session.user.id;
//         const {name,surname,email,phone,identity_number} = req.body;
//         const log_email = req.body.email;
//         const unic = uuid.v1();
//         let avatar;
//         let image_name = [];
//         let images = "";
//         if (req.files) {
//             avatar = req.files.avatar;
//             if (avatar.mimetype) {
//                 image_name.push(avatar.md5 + unic + "." + avatar.mimetype.split('/')[1])
//                 avatar.mv('public/assets/img/user/'+avatar.md5+unic+ "." +avatar.mimetype.split('/')[1])
//             } else {
//                 for (let value in avatar) {
//                     image_name.push(avatar[value].md5 + unic + "." + avatar[value].mimetype.split('/')[1])
//                 }
//             }
//             images = image_name.join(", ");
//         }
//         else {
//             avatar = req.body.avatar;
//             images = avatar;
//         }
//         const update = await User.update({
//         identity_number: identity_number,
//         email: email,
//         name: name,
//         surname: surname,
//         phone: phone,
//         avatar: images,
//         log_email: log_email
//     }, {
//         where: {
//             id: user_id
//         }
//     });
//     if (update) {
//         require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
//             await Logs.create({
//                 email: log_email,
//                 name: name,
//                 action: 'Kullanıcı "' + name + '" isimli ve "' + email + '" adresli kullanıcı hesabını güncelledi.',
//                 ip_address: add
//             })
//         })
//         res.send(JSON.stringify({
//             status: 'success',
//             message: 'Güncelleme işlemi gerçekleştirildi.',
//             title: 'Başarılı!'
//         }))
//     } else {
//         res.send(
//             JSON.stringify({
//                     status: 'error',
//                     message: 'İşlem sırasında hata meydana gelmiştir.',
//                     title: 'Başarısız!'
//                 }
//             ));
//     }
// });

// router.post('/api/users/get-profile-info', async (req, res) => {
//     const user_id = req.body.id;
//     const users = await User.findOne({
//             where: {
//                 id: user_id
//             }
//         });
//         if(users){
//             res.json({
//                 status: true,
//                 data: users
//             });

//         }
//         else{
//             res.json({
//                 status: false,
//                 message: "Profil bilgileriniz getirilirken bir hata oluştu."
//             });
//         }
// });

// router.post('/api/users/edit-profile-password', async (req, res) => {
//         const session = await getSession({req});
//         const user_id = session.user.id;
//         const log_email = session.user.email;
//         const old_password = md5Hash.default(req.body.oldPassword);
//         const new_password = md5Hash.default(req.body.newPassword);
//         const new_password_confirm = md5Hash.default(req.body.newPassword2);
//         if (new_password === new_password_confirm) {
//             const user = await User.findAll({
//                 where: {
//                     id: user_id
//                 }
//             });
//             if (user[0].password === old_password) {
//                 const update = await User.update({
//                     password: new_password,
//                     log_email: log_email
//                 }, {
//                     where: {
//                         id: user_id
//                     }
//                 });
//                 if (update) {
//                     require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
//                         const insertLog = await Logs.create({
//                             email: log_email,
//                             name: user[0].name,
//                             action: 'Kullanıcı "' + email + '" şifresini güncelledi.',
//                             ip_address: add
//                         })
//                     })
//                     res.send(JSON.stringify({
//                         status: 'success',
//                         message: 'Güncelleme işlemi gerçekleştirildi.',
//                         title: 'Başarılı!'
//                     }))
//                 } else {
//                     res.send(
//                         JSON.stringify({
//                                 status: 'error',
//                                 message: 'İşlem sırasında hata meydana gelmiştir.',
//                                 title: 'Başarısız!'
//                             }
//                         ));
//                 }
//             } else {
//                 res.send(
//                     JSON.stringify({
//                             status: 'error',
//                             message: 'Eski şifreniz hatalı.',
//                             title: 'Başarısız!'
//                         }
//                     ));
//             }
//         }
//         else{
//             res.send(
//                 JSON.stringify({
//                         status: 'error',
//                         message: 'Yeni şifreler uyuşmuyor.',
//                         title: 'Başarısız!'
//                     }
//                 ));
//         }

// });

router.post('/api/users/header/profile-image', async (req,res)=>{
   const session= await getSession({req});
    const user_id=session.user.id;
    const users = await User.findAll({
        where: {
            id: user_id
        }
    });
    if(users){
        res.json({
            status: true,
            data: users
        });

    }
    else{
        res.json({
            status: false,
            message: "Profil resmi bilgileriniz getirilirken bir hata oluştu."
        });
    }
})
module.exports = router;