import React, {useState, useEffect} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from 'next/link';
import axios from "axios";

export async function getServerSideProps(context) {
    const id = context.query.id;
    const path = process.env.NEXTAUTH_URL;
    const announDetails = await axios.post(`${path}api/announcements/announcements-detail/`, {
        id: id
    });
    const token = context.req.cookies['__Crm-next-auth.session-token']
    if(token){
        return {
            props: {
                token: token,
                announDetails: announDetails.data,
                id,
            },
        }
    }
    else{
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function AnnouncementsDetail({announDetails, id,token}) {
    const [announDetail, setAnnounDetail] = useState(announDetails.data);

    async function getAnnounDetail() {
        await axios({
            method: 'POST',
            url: `/api/announcements/announcements-detail/`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: JSON.stringify({
                    id: id
                }
            ),
        }).then(function (response) {
            setAnnounDetail(response.data.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        getAnnounDetail();
    });

    return (
        <div>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <i className="ri-menu-line sidebar-toggle me-3 d-block d-md-none"/>
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/announcements">
                        Duyurular
                    </Link>
                </Breadcrumbs>
            </div>
            <div className="px-3 py-2 bg-white mt-3 rounded shadow align-items-center">
                {
                    announDetail.map(announ => (
                        <div className="row" key={announ.id}>
                            <div className="col-12 p-3">
                                <div className="p-3">
                                    <p className="announTitle">{announ.announcement.subject}</p>
                                    <p>{announ.announcement.message}</p>
                                </div>

                                <div className="text-end mt-3">
                                    <Link href="../../announcements">
                                        <a className="btn btn-custom btn-sm "><i className="far fa-undo me-1"></i> Geri Dön</a>
                                    </Link>

                                </div>

                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
        ;


}


AnnouncementsDetail.auth=true;
export default AnnouncementsDetail;