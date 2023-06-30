import {decode} from "next-auth/jwt";
import {getSession} from "next-auth/react";
import Permissions from "../../models/permissions";
import Logs from "../../models/logs";
import PermissionDetails from "../../models/permissionDetails";

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
        const {
            permission_id,
            permission_name,
            brands,
            products,
            product_categories,
            customers,
            potential_customers,
            customer_categories,
            official_persons,
            create_offer,
            pending_offers,
            approved_offers,
            rejected_offers,
            canceled_offers,
            purchases,
            create_purchase,
            pending_sales,
            realized_sales,
            after_sales_services,
            create_after_sales_services,
            staff_management,
            transaction_logs,
            authority_management,
            department_management,
            category_management,
            requests,
            announcement_management,
            company_settings,
            process_pending_offers
        } = req.body;


        const permission_detail = await PermissionDetails.findAll({
            where: {
                permission_id: permission_id
            }
        });

        if (permission_detail.length == 0) {
            const permission_detail_add = await PermissionDetails.create({
                user_id: user_id,
                permission_id: permission_id,
                permission_name: permission_name,
                brands: brands,
                products: products,
                product_categories: product_categories,
                customers: customers,
                potential_customers: potential_customers,
                customer_categories: customer_categories,
                official_persons: official_persons,
                create_offer: create_offer,
                pending_offers: pending_offers,
                approved_offers: approved_offers,
                rejected_offers: rejected_offers,
                canceled_offers: canceled_offers,
                purchases: purchases,
                create_purchase: create_purchase,
                pending_sales: pending_sales,
                realized_sales: realized_sales,
                after_sales_services: after_sales_services,
                create_after_sales_services: create_after_sales_services,
                staff_management: staff_management,
                transaction_logs: transaction_logs,
                authority_management: authority_management,
                department_management: department_management,
                category_management: category_management,
                requests: requests,
                announcement_management: announcement_management,
                company_settings: company_settings,
                process_pending_offers:process_pending_offers
            });
            if (permission_detail_add) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: '"' + permission_name + '"' + " isimli yetki için yetki ekleme işlemi yapıldı.",
                        ip_address: add
                    });
                });
                res.json({
                    status: "success",
                    title: "Başarılı!",
                    message: "Ekleme işlemi gerçekleştirildi."
                });
            } else {
                res.json({
                    status: "error",
                    title: "Başarısız!",
                    message: "İşlem sırasında hata meydana gelmiştir."
                });
            }
        } else {
            const permission_detail_update = await PermissionDetails.update({
                user_id: user_id,
                permission_id: permission_id,
                permission_name: permission_name,
                brands: brands,
                products: products,
                product_categories: product_categories,
                customers: customers,
                potential_customers: potential_customers,
                customer_categories: customer_categories,
                official_persons: official_persons,
                create_offer: create_offer,
                pending_offers: pending_offers,
                approved_offers: approved_offers,
                rejected_offers: rejected_offers,
                canceled_offers: canceled_offers,
                purchases: purchases,
                create_purchase: create_purchase,
                pending_sales: pending_sales,
                realized_sales: realized_sales,
                after_sales_services: after_sales_services,
                create_after_sales_services: create_after_sales_services,
                staff_management: staff_management,
                transaction_logs: transaction_logs,
                authority_management: authority_management,
                department_management: department_management,
                category_management: category_management,
                requests: requests,
                announcement_management: announcement_management,
                company_settings: company_settings,
                process_pending_offers:process_pending_offers
            }, {
                where: {
                    permission_id: permission_id
                }
            });
            if (permission_detail_update) {
                require('dns').lookup(require('os').hostname(), async (err, add, fam) => {  //ip adresi alınıyor
                    await Logs.create({                                          //log oluşturuluyor
                        email: session.user.email,
                        action: '"' + permission_name + '"' + " isimli yetki için yetki güncelleme işlemi yapıldı.",
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
}
