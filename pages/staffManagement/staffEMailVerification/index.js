import React from 'react';
import {Image} from "react-bootstrap";

function StaffEMailVerification() {
    return (
        <>
            <div className="mt-5">
                <div className="mt-5">
                    <div className="row mx-0 d-flex justify-content-center">
                        <div className="col-12 d-flex justify-content-center">
                            <img src="/public/logo.png" style={{width:"17%"}} className="img-fluid"
                                   layout={"raw"}
                                   alt={"Logo"}/>
                        </div>
                        <div className="col-5 pt-5">
                            <div className="card pt-4 pb-5 shadow">
                                <div className="card-body text-center">
                                    <form action="">
                                        <h5 className="text-center mb-3 fs-5">
                                            E-Posta Doğrulama
                                        </h5>
                                        <div className="d-flex justify-content-center px-5 ">
                                            <input type="text" className="form-control form-control-sm  rounded-start rounded-0" placeholder="Doğrulama Kodunu Giriniz"/>
                                            <button type="submit" className="btn btn-primary btn-block rounded-end rounded-0">
                                                Doğrula
                                            </button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StaffEMailVerification;