import {Sequelize} from "sequelize";
import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import CustomerToUser from "../../models/customerToUser";
import CustomerRequest from "../../models/customerRequest";

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
        const accept_user_id = session.user.id;
        const {request_id, customer_id, trade_name, assignedUser} = req.body;

        const accept_request = await CustomerRequest.update({
            status: 2,
            rejection_user_id: accept_user_id,
            rejection_time: Sequelize.fn('NOW')
        }, {
            where: {
                id: request_id,
            }
        });
        if (accept_request) {
            CustomerToUser.update({
                status: 0,
            }, {
                where: {
                    customer_id: customer_id
                }
            })
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                    await Logs.create({
                        email: session.user.email,
                        action: trade_name + " firmasının " + '"' + assignedUser + '"' + " kullanıcısından alınma talebi reddedilmiştir.",
                        ip_address: add
                    })
                }
            )
            res.json({
                status: 'success',
                message: 'Talep reddedildi.',
                title: 'Başarılı!'
            })
        } else {
            res.json({
                status: "error",
                title: "Başarısız!",
                message: "İşlem sırasında hata meydana gelmiştir."
            });
        }
    }
}