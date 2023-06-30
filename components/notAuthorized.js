import React from 'react';

function NotAuthorized(props) {
    return (
            <div>
                <div className="px-3 mt-2 pt-2 bg-white shadow pb-3">
                    <i className="ri-menu-line sidebar-toggle me-3 d-block d-md-none"/>
                    <div className="row pb-4">
                        <div className="col-md-12 mt-3 d-flex justify-content-center align-items-center">
                            <div className="notAuthorized">
                                <img className="w-100" src="/public/assets/img/not-authorized.jpg"/>
                            </div>
                        </div>
                        <div className="col-md-12 d-flex justify-content-center align-items-center">
                            <p className="notAuthorizedText"> Yetkiniz bulunmuyor !</p>
                        </div>
                    </div>
                </div>

            </div>
    );
}

export default NotAuthorized;