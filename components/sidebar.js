import React, {useState, useEffect} from 'react';
import {signOut, useSession} from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import {Badge, Button} from "rsuite";

export default function Sidebar(props) {
    const {data: session, status} = useSession();
    const [offers, setOffers] = useState([]);

    async function getProcessPendingOffers() {
        await axios({
            method: 'POST',
            url: '/api/offers/get-process-pending-offers-count',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(function (res) {
            setOffers(res.data);
        }).catch(function (error) {
                console.log(error);
            }
        );
    }

    useEffect(() => {
        getProcessPendingOffers();
    })

    return (
        <>
            {/* start: Sidebar */}
            <div className="sidebar position-fixed top-0 bottom-0 bg-white border-end">
                {
                    session.user.permission_id == 1 ? (
                            <div className="d-flex align-items-center p-3">
                                <Link href="/dashboard">
                                    <a className="sidebar-logo  fw-bold text-decoration-none text-indigo fs-4">
                                        <img className="img-fluid" src="/public/logo.png" alt=""/>
                                    </a>
                                </Link>
                                <i className="sidebar-toggle ri-arrow-left-circle-line ms-auto fs-5 d-none d-md-block"/>
                            </div>
                        ) :
                        (
                            <div className="d-flex align-items-center p-3">
                                <Link href="/userDashboard">
                                    <a className="sidebar-logo  fw-bold text-decoration-none text-indigo fs-4">
                                        <img className="img-fluid" src="/public/logo.png" alt=""/>
                                    </a>
                                </Link>
                                <i className="sidebar-toggle ri-arrow-left-circle-line ms-auto fs-5 d-none d-md-block"/>
                            </div>
                        )
                }
                <ul className="sidebar-menu p-3 m-0 mb-0">
                    {
                        session.user.permission_id == 1 ? (
                            <li className="sidebar-menu-item active">
                                <Link href="/dashboard">
                                    <a>
                                        <i className="far fa-chart-scatter sidebar-menu-item-icon text-white"/>
                                        Güncel Durum
                                    </a>
                                </Link>
                            </li>
                        ) : (
                            <li className="sidebar-menu-item active">
                                <Link href="/userDashboard">
                                    <a>
                                        <i className="far fa-chart-scatter sidebar-menu-item-icon text-white"/>
                                        Güncel Durum
                                    </a>
                                </Link>
                            </li>
                        )
                    }
                    <li className="sidebar-menu-divider mt-3 mb-1 ">CRM</li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="fas fa-cubes sidebar-menu-item-icon"/>
                            Ürün Yönetimi
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/productManagement/brands">
                                    <a>
                                        Markalar
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/productManagement/products">
                                    <a>
                                        Ürünler
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/productManagement/productCategories">
                                    <a>
                                        Ürün Kategorileri
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="far fa-users sidebar-menu-item-icon"/>
                            Firma Yönetimi
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/customerManagement/customers">
                                    <a>
                                        Firmalar
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/customerManagement/potentialCustomers">
                                    <a>
                                        Potansiyel Firmalar
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/customerManagement/customerCategories">
                                    <a>
                                        Firma Kategorileri
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/customerManagement/customerOfficial">
                                    <a>
                                        Yetkili Kişiler
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebar-menu-item">
                        <Link href='/offers/processPendingOffers'>
                            <a>
                                <i className="far fa-file-exclamation sidebar-menu-item-icon me-2"></i>
                                İşlem Bekleyen Teklifler
                                <Badge className="ms-2" content={offers}/>
                            </a>
                        </Link>
                    </li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="far fa-file-signature sidebar-menu-item-icon"/>
                            Teklifler
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/offers/createOffer">
                                    <a>
                                        Teklif Oluştur
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item has-dropdown">
                                <a>
                                    Teklifler
                                    <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                                </a>
                                <ul className="sidebar-dropdown-menu">
                                    <li className="sidebar-dropdown-menu-item">
                                        <Link href="/offers/pendingOffers">
                                            <a>
                                                Beklemedeki Teklifler
                                            </a>
                                        </Link>
                                    </li>
                                    <li className="sidebar-dropdown-menu-item">
                                        <Link href="/offers/approvedOffers">
                                            <a>
                                                Onaylanmış Teklifler
                                            </a>
                                        </Link>
                                    </li>
                                    <li className="sidebar-dropdown-menu-item">
                                        <Link href="/offers/rejectedOffers">
                                            <a>
                                                Reddedilmiş Teklifler
                                            </a>
                                        </Link>
                                    </li>
                                    <li className="sidebar-dropdown-menu-item">
                                        <Link href="/offers/canceledOffers">
                                            <a>
                                                İptal Edilmiş Teklifler
                                            </a>
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                    </li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="far fa-money-bill sidebar-menu-item-icon"/>
                            Alışlar
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/purchases/createPurchase">
                                    <a>
                                        Alış Oluştur
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/purchases/allPurchases">
                                    <a>
                                        Tüm Alışlar
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="far fa-hand-holding-box sidebar-menu-item-icon"></i>
                            Satışlar
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/sales/pendingSales">
                                    <a>
                                        Bekleyen Satışlar
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/sales/realizedSales">
                                    <a>
                                        Gerçekleşen Satışlar
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="far fa-tools sidebar-menu-item-icon"></i>
                            Satış Sonrası Hizmet
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/afterSalesService/allAfterSalesService">
                                    <a>
                                        Hizmetler
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href="/afterSalesService/createAfterSalesService">
                                    <a>
                                        Hizmet Oluştur
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebar-menu-item">
                        <Link href="/staffManagement/staffManagement">
                            <a>
                                <i className="far fa-address-card sidebar-menu-item-icon"/>
                                Personel Yönetimi
                            </a>
                        </Link>
                    </li>
                    <li className="sidebar-menu-item">
                        <Link href={`/agenda`}>
                            <a>
                                <i className="far fa-calendar-alt sidebar-menu-item-icon me-3"></i>
                                Ajanda
                            </a>
                        </Link>
                    </li>
                    {
                        session.user.permission_id == 1 ? (
                            <li className="sidebar-menu-item">
                                <Link href={`/reports`}>
                                    <a>
                                        <i className="far fa-file-chart-line sidebar-menu-item-icon me-3"></i>
                                        Raporlar
                                    </a>
                                </Link>
                            </li>
                        ) : null
                    }
                    <li className="sidebar-menu-item">
                        <Link href='/announcements/announcementManagement'>
                            <a>
                                <i className="far fa-bullhorn sidebar-menu-item-icon me-2"></i>
                                Duyuru Yönetimi
                            </a>
                        </Link>
                    </li>
                    <li className="sidebar-menu-divider mt-3 mb-1 ">Ayarlar</li>
                    <li className="sidebar-menu-item has-dropdown">
                        <a>
                            <i className="far fa-cogs sidebar-menu-item-icon"/>
                            Ayarlar
                            <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                        </a>
                        <ul className="sidebar-dropdown-menu">
                            <li className="sidebar-dropdown-menu-item">
                                <Link href='/definitions/transactionLogs'>
                                    <a>
                                        İşlem Kayıtları
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item has-dropdown">
                                <a>
                                    Tanımlar
                                    <i className="ri-arrow-down-s-line sidebar-menu-item-accordion ms-auto"/>
                                </a>
                                <ul className="sidebar-dropdown-menu">
                                    <li className="sidebar-dropdown-menu-item">
                                        <Link href='/definitions/authorityManagement'>
                                            <a>
                                                Yetki Yönetimi
                                            </a>
                                        </Link>
                                    </li>
                                    <li className="sidebar-dropdown-menu-item">
                                        <Link href="/definitions/departments">
                                            <a>
                                                Departman Yönetimi
                                            </a>
                                        </Link>

                                    </li>
                                    {/*<li className="sidebar-dropdown-menu-item">*/}
                                    {/*    <Link href="/definitions/categoryManagement">*/}
                                    {/*        <a>*/}
                                    {/*            Kategori Yönetimi*/}
                                    {/*        </a>*/}
                                    {/*    </Link>*/}
                                    {/*</li>*/}
                                </ul>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href='/definitions/requests'>
                                    <a>
                                        Talepler
                                    </a>
                                </Link>
                            </li>
                            <li className="sidebar-dropdown-menu-item">
                                <Link href='/companySettings'>
                                    <a>
                                        Şirket Ayarları
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="sidebar-menu-item">
                        <a onClick={() => {
                            signOut({callbackUrl: `${process.env.NEXT_PUBLIC_URL}`})
                        }}>
                            <i className="far fa-sign-out sidebar-menu-item-icon"/>
                            Çıkış
                        </a>
                    </li>
                </ul>
            </div>
            <div className="sidebar-overlay"/>
            {/* end: Sidebar */
            }
        </>
    );
}
