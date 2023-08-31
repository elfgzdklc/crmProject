import React, {useEffect} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from 'next/link';
import axios from "axios";
import {useForm} from "react-hook-form";
import alertSwal from "../../../../components/alert";
import Title from "../../../../components/head";
import {useRouter} from "next/router";

export async function getServerSideProps(context) {
    const token = context.req.cookies['__Crm-next-auth.session-token'] ?? ''
    const id = context.query.id;
    const path = process.env.NEXTAUTH_URL;

    const permissionDetail = await axios.post(`${path}api/definitions/authority-management/authority-management-detail`, {
        id
    }, {
        headers: {
            AuthToken: token
        }
    });
    if (token) {
        return {
            props: {
                permissionDetail: permissionDetail.data,
                id,
                token: token
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function AuthorityManagementDetail({permissionDetail, id, token}) {

    const {register, handleSubmit, formState: {errors}, setValue, watch} = useForm();
    const router = useRouter();

    async function authorityDetail() {
        await axios({
            method: 'POST',
            url: `/api/definitions/authority-management/authority-management-detail`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                id: id
            },
        }).then(function (response) {
            setValue("permission_id", id);
            setValue("permission_name", response.data.permissionName[0].permission_name);
            setValue("brands", response.data.permissionDetail[0].brands);
            setValue("products", response.data.permissionDetail[0].products);
            setValue("product_categories", response.data.permissionDetail[0].product_categories);
            setValue("customers", response.data.permissionDetail[0].customers);
            setValue("potential_customers", response.data.permissionDetail[0].potential_customers);
            setValue("customer_categories", response.data.permissionDetail[0].customer_categories);
            setValue("official_persons", response.data.permissionDetail[0].official_persons);
            setValue("create_offer", response.data.permissionDetail[0].create_offer);
            setValue("pending_offers", response.data.permissionDetail[0].pending_offers);
            setValue("approved_offers", response.data.permissionDetail[0].approved_offers);
            setValue("rejected_offers", response.data.permissionDetail[0].rejected_offers);
            setValue("canceled_offers", response.data.permissionDetail[0].canceled_offers);
            setValue("purchases", response.data.permissionDetail[0].purchases);
            setValue("create_purchase", response.data.permissionDetail[0].create_purchase);
            setValue("pending_sales", response.data.permissionDetail[0].pending_sales);
            setValue("realized_sales", response.data.permissionDetail[0].realized_sales);
            setValue("after_sales_services", response.data.permissionDetail[0].after_sales_services);
            setValue("create_after_sales_services", response.data.permissionDetail[0].create_after_sales_services);
            setValue("staff_management", response.data.permissionDetail[0].staff_management);
            setValue("transaction_logs", response.data.permissionDetail[0].transaction_logs);
            setValue("authority_management", response.data.permissionDetail[0].authority_management);
            setValue("department_management", response.data.permissionDetail[0].department_management);
            setValue("category_management", response.data.permissionDetail[0].category_management);
            setValue("requests", response.data.permissionDetail[0].requests);
            setValue("announcement_management", response.data.permissionDetail[0].announcement_management);
            setValue("company_settings", response.data.permissionDetail[0].company_settings);
            setValue("process_pending_offers", response.data.permissionDetail[0].process_pending_offers);
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function onSubmit(data) {
        await axios({
            method: 'post',
            url: '/api/definitions/authority-management/add-edit-authority-detail',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                router.push("/definitions/authorityManagement/");
            })
        }).catch(function (error) {
            console.log(error);
        });
    }


    useEffect(() => {
        authorityDetail();
    }, [watch]);


    return (
        <div>
            <Title title="Yetkilendirme"/>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/definitions/authorityManagement/">
                        Yetki Yönetimi
                    </Link>
                    <a className="cursor-pointer me-2"
                       href={'/definitions/authorityManagement/authorityManagementDetail/' + id}>
                        Yetkilendirme - {watch("permission_name")}
                    </a>
                </Breadcrumbs>
            </div>
            <div className="row mt-2">
                <div className="col-12">
                    <div className="card bg-white rounded shadow">
                        <div className="card-body">
                            <div className="px-1 mt-2 pb-4">
                                <div className="row px-3 ">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="row">
                                            <div className="col-md-4 col-12">
                                                <table className="table table-hover">
                                                    <tbody>
                                                    <tr>
                                                        <th className="">1</th>
                                                        <td>Markalar</td>
                                                        <td><input type="checkbox" {...register("brands")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>2</th>
                                                        <td>Ürünler</td>
                                                        <td><input
                                                            type="checkbox" {...register("products")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>3</th>
                                                        <td>Ürün Kategorileri</td>
                                                        <td><input
                                                            type="checkbox" {...register("product_categories")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>4</th>
                                                        <td>Firmalar</td>
                                                        <td><input
                                                            type="checkbox" {...register("customers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>5</th>
                                                        <td>Potansiyel Firmalar</td>
                                                        <td><input
                                                            type="checkbox" {...register("potential_customers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>6</th>
                                                        <td>Firma Kategorileri</td>
                                                        <td><input
                                                            type="checkbox" {...register("customer_categories")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>7</th>
                                                        <td>Yetkili Kişiler</td>
                                                        <td><input
                                                            type="checkbox" {...register("official_persons")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>8</th>
                                                        <td>İşlem Bekleyen Teklifler</td>
                                                        <td><input
                                                            type="checkbox" {...register("process_pending_offers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>9</th>
                                                        <td>Teklif Oluştur</td>
                                                        <td><input
                                                            type="checkbox" {...register("create_offer")}
                                                        /></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="col-md-4 col-12">
                                                <table className="table table-hover">
                                                    <tbody>
                                                    <tr>
                                                        <th>10</th>
                                                        <td>Beklemedeki Teklifler</td>
                                                        <td><input
                                                            type="checkbox" {...register("pending_offers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>11</th>
                                                        <td>Onaylanmış Teklifler</td>
                                                        <td><input
                                                            type="checkbox" {...register("approved_offers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>12</th>
                                                        <td>Reddedilmiş Teklifler</td>
                                                        <td><input
                                                            type="checkbox" {...register("rejected_offers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>13</th>
                                                        <td>İptal Edilmiş Teklifler</td>
                                                        <td><input
                                                            type="checkbox" {...register("canceled_offers")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>14</th>
                                                        <td>Alış Oluştur</td>
                                                        <td><input
                                                            type="checkbox" {...register("create_purchase")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>15</th>
                                                        <td>Tüm Alışlar</td>
                                                        <td><input
                                                            type="checkbox" {...register("purchases")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>16</th>
                                                        <td>Bekleyen Satışlar</td>
                                                        <td><input
                                                            type="checkbox" {...register("pending_sales")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>17</th>
                                                        <td>Gerçekleşen Satışlar</td>
                                                        <td><input
                                                            type="checkbox" {...register("realized_sales")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>18</th>
                                                        <td>Hizmet Oluştur</td>
                                                        <td><input
                                                            type="checkbox" {...register("create_after_sales_services")}
                                                        /></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="col-md-4 col-12">
                                                <table className="table table-hover">
                                                    <tbody>
                                                    <tr>
                                                        <th>19</th>
                                                        <td>Hizmetler</td>
                                                        <td><input
                                                            type="checkbox" {...register("after_sales_services")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>20</th>
                                                        <td>Personel Yönetimi</td>
                                                        <td><input
                                                            type="checkbox" {...register("staff_management")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>21</th>
                                                        <td>İşlem Kayıtları</td>
                                                        <td><input
                                                            type="checkbox" {...register("transaction_logs")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>22</th>
                                                        <td>Yetki Yönetimi</td>
                                                        <td><input
                                                            type="checkbox" {...register("authority_management")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>23</th>
                                                        <td>Departman Yönetimi</td>
                                                        <td><input
                                                            type="checkbox" {...register("department_management")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>24</th>
                                                        <td>Kategori Yönetimi</td>
                                                        <td><input
                                                            type="checkbox" {...register("category_management")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>25</th>
                                                        <td>Talepler</td>
                                                        <td><input
                                                            type="checkbox" {...register("requests")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>26</th>
                                                        <td>Duyuru Yönetimi</td>
                                                        <td><input
                                                            type="checkbox" {...register("announcement_management")}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>27</th>
                                                        <td>Şirket Ayarları</td>
                                                        <td><input
                                                            type="checkbox" {...register("company_settings")}
                                                        /></td>
                                                    </tr>
                                                    <input name="permission_name" {...register("permission_name")}
                                                           hidden/>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end mb-2 mt-2">
                                            <a type="button" className="btn btn-secondary btn-sm"
                                               href={'/definitions/authorityManagement/'}>Vazgeç
                                            </a>
                                            <button type="submit" className="btn btn-custom-save btn-sm ms-1">Kaydet
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

AuthorityManagementDetail.auth = true;
export default AuthorityManagementDetail;
