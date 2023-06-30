import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Logs from "../models/logs";
import Settings from "../models/settings";
import Banks from "../models/companyToBanks";
import Events from "../models/events";

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
        await Settings.destroy({truncate: true});
        const session = await getSession({req});
        const {
            trade_name,
            first_phone,
            second_phone,
            email,
            address,
            bank_id_0,
            bank_name_0,
            bank_branch_0,
            swift_code_0,
            usd_iban_no_0,
            euro_iban_no_0,
            bank_id_1,
            bank_name_1,
            bank_branch_1,
            swift_code_1,
            usd_iban_no_1,
            euro_iban_no_1,
            bank_id_2,
            bank_name_2,
            bank_branch_2,
            swift_code_2,
            usd_iban_no_2,
            euro_iban_no_2,
            meeting_time
        } = req.body;

        let logo, signature, favicon, favicon32;

        let updateLogo = "";
        let updateSignature = "";
        let updateFavicon = "";
        let updateFavicon32 = "";

        if (req.files) {
            if (req.files.logo) {
                logo = req.files.logo;
                logo.mv("public/logo.png");
                updateLogo = "logo.png";
            } else {
                updateLogo = req.body.logo;
            }
            if (req.files.signature) {
                signature = req.files.signature;
                signature.mv("public/signature.png");
                updateSignature = "signature.png";
            } else {
                updateSignature = req.body.signature;
            }
            if (req.files.favicon) {
                favicon = req.files.favicon;
                favicon.mv("public/favicon.ico");
                updateFavicon = "favicon.ico";
            } else {
                updateFavicon = req.body.favicon;
            }
            if (req.files.favicon32) {
                favicon32 = req.files.favicon32;
                favicon32.mv("public/favicon-32x32.png")
                updateFavicon32 = "favicon-32x32.png";
            } else {
                updateFavicon32 = req.body.favicon32;
            }
        } else {
            updateLogo = req.body.logo;
            updateSignature = req.body.signature;
            updateFavicon = req.body.favicon;
            updateFavicon32 = req.body.favicon32;
        }

        await Settings.create({
            user_id: session.user.id,
            logo: updateLogo,
            signature: updateSignature,
            favicon: updateFavicon,
            favicon32: updateFavicon32,
            trade_name: trade_name,
            first_phone: first_phone,
            second_phone: second_phone,
            email: email,
            address: address,
            meeting_time: meeting_time
        })

        const update = Banks.update({
            user_id: session.user.id,
            bank_name: bank_name_0,
            bank_branch: bank_branch_0,
            swift_code: swift_code_0,
            usd_iban_no: usd_iban_no_0,
            euro_iban_no: euro_iban_no_0,
        }, {
            where: {
                id: bank_id_0
            }
        }).then(async () => {
            await Banks.update({
                user_id: session.user.id,
                bank_name: bank_name_1,
                bank_branch: bank_branch_1,
                swift_code: swift_code_1,
                usd_iban_no: usd_iban_no_1,
                euro_iban_no: euro_iban_no_1,
            }, {
                where: {
                    id: bank_id_1
                }
            }).then(async () => {
                await Banks.update({
                    user_id: session.user.id,
                    bank_name: bank_name_2,
                    bank_branch: bank_branch_2,
                    swift_code: swift_code_2,
                    usd_iban_no: usd_iban_no_2,
                    euro_iban_no: euro_iban_no_2,
                }, {
                    where: {
                        id: bank_id_2
                    }
                })
            })
        });

        if (update) {
            require('dns').lookup(require('os').hostname(), async (err, add, fam) => {
                await Logs.create({
                    email: session.user.email,
                    action: "Şirket bilgilerinde güncelleme yapıldı.",
                    ip_address: add
                });
            });
            res.json({
                status: "success",
                title: "Başarılı!",
                message: "Güncelleme işlemi gerçekleştirildi."
            });
        } else {
            res.json({
                status: "error",
                title: "Başarısız!",
                message: "İşlem sırasında hata meydana gelmiştir."
            });
        }
    }
}
