import React, {useEffect, useState} from 'react';
import {Breadcrumbs} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import moment from 'moment'
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const logs = await axios.post(`${path}api/definitions/transaction-logs/get-transaction-logs`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: '',
//     });
//     return {
//         props: {
//             logs: logs.data
//         },
//     }
// }

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const session = await getSession(context);
//
//     // const permission_detail = await axios.post(`${path}api/get-user-permission/`, {
//     //     user_permission_id: session.user.permission_id,
//     // });
//
//     const permission_detail = await axios.post(`${path}api/get-user-permission/`, {
//         session: await getSession(context),
//     });
//     console.log(permission_detail)
//
//     // const logs = await axios.post(`${path}api/definitions/transaction-logs/get-transaction-logs`, {
//     //     limit: 10,
//     //     page: 1,
//     //     sortColumn: 'id',
//     //     sortType: 'desc',
//     search: '',
// });
// if (permission_detail.data[0].transaction_logs === 1) {
//     return {
//         props: {
//             logs: logs.data
//         },
//     }
// } else {
//     context.res.writeHead(302, {Location: '/dashboard'});
//     context.res.end();
//     return {
//         props: {
//             session: session
//         }
//     };
// }
// }

export async function getServerSideProps(context) {
    const token = context.req.cookies['__Crm-next-auth.session-token']
    if(token){
        return {
            props: {
                token: token
            },
        }
    }
    else{
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function TransactionLogs(props) {
    const {data: session} = useSession()
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState('');
    const router = useRouter();

    async function getPermissionDetail() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/custom/get-user-permission/',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                user_permission_id: session.user.permission_id
            }),
        }).then(function (response) {
            setLoading(false)
            if (response.data[0] === undefined || response.data[0].transaction_logs === 0) {
                if (session.user.permission_id === 1) {
                    alertAuthority(() => {
                        setTimeout(function () {
                            router.push("/dashboard")
                        }, 1000)
                    })
                } else {
                    alertAuthority(() => {
                        setTimeout(function () {
                            router.push("/userDashboard")
                        }, 1000)
                    })
                }
            } else {
                getLogs();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getLogs() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/definitions/transaction-logs/get-transaction-logs',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search
            }),
        }).then(function (response) {
            setLogs(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search]);

    const ActionCell = ({rowData, dataKey, ...props}) => {
        const speaker = (
            <Popover>
                <p>
                    {`${rowData.action}`}
                </p>
            </Popover>
        );
        return (
            <Table.Cell {...props}>
                <Whisper placement="top" speaker={speaker}>
                    <a>{rowData.action.toLocaleString()}</a>
                </Whisper>
            </Table.Cell>
        );
    };

    return (
        <div>
            <Title title="İşlem Kayıtları"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    href="/definitions/transactionLogs"
                >
                    İşlem Kayıtları
                </Link>
            </Breadcrumbs>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">
                </h5>
                <h5 className="fw-bold mb-0">
                    <div className="d-flex" role="search">
                        <input className="form-control form-control-sm  me-2" type="search" placeholder="Arama"
                               aria-label="Arama"
                               onChange={(e) => setSearch(e.target.value)}/>
                        <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                    </div>
                </h5>
            </div>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={logs}
                            cellBordered={true}
                            hover={true}
                            bordered={true}
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}
                            sortColumn={sortColumn}
                            sortType={sortType}
                        >
                            <Table.Column sortable={true} width={200}>
                                <Table.HeaderCell>Oluşturulma Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="created_at">
                                    {rowData => moment(rowData.created_at).format('DD.MM.YYYY HH:mm:ss')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Email</Table.HeaderCell>
                                <Table.Cell dataKey="email"/>
                            </Table.Column>
                            <Table.Column flexGrow={2} sortable={true}>
                                <Table.HeaderCell>İşlem</Table.HeaderCell>
                                <ActionCell dataKey="action"/>
                            </Table.Column>
                            <Table.Column width={200} sortable={true}>
                                <Table.HeaderCell>Ip Adresi</Table.HeaderCell>
                                <Table.Cell dataKey="ip_address"/>
                            </Table.Column>
                        </Table>
                        <Pagination className="mt-2"
                                    prev
                                    next
                                    first
                                    last
                                    ellipsis
                                    boundaryLinks
                                    maxButtons={5}
                                    size="xs"
                                    layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                                    total={total}
                                    limitOptions={[5, 10, 20, 50, 100]}
                                    limit={limit}
                                    activePage={page}
                                    onChangePage={setPage}
                                    onChangeLimit={handleChangeLimit}
                        />
                    </CustomProvider>
                </div>
            </div>
        </div>
    );
}

TransactionLogs.auth = true;

export default TransactionLogs;
