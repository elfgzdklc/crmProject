import React from 'react';
import Link from "next/link";
import Title from "../components/head";

export default function page404() {
    return <>
        <Title title="Sayfa Bulunamadı"/>
        <div className="d-flex justify-content-center mt-5">
            <div className="mt-5 page404">
                <img className="w-100" src="/public/assets/img/404.png"/>
                <Link href="/dashboard">
                    <a className="d-flex justify-content-center text-secondary mt-3 fs-6 text-decoration-underline fw-bold"> Ana
                        Sayfa</a>
                </Link>
            </div>
        </div>
    </>
}