import React, {useState, useEffect} from 'react';
import {Table, CustomProvider, Pagination, Button, Popover, Whisper} from "rsuite";
import {Breadcrumbs} from "@mui/material";
import Link from 'next/link';
import axios from "axios";
import moment from "moment";
import {locale} from "../../../../public/rsuite/locales/tr_TR";
import Title from "../../../../components/head";

export async function getServerSideProps(context) {
    const id = context.query.id;
    const token = context.req.cookies['__Crm-next-auth.session-token']
    const path = process.env.NEXTAUTH_URL;

    const staffToCustomers = await axios.post(`${path}api/users/get-customer-user/`, {
        limit: 10,
        page: 1,
        sortColumn: 'id',
        sortType: 'asc',
        search: '',
        id
    }, {
        headers: {
            AuthToken: token
        }
    });
    if (token) {
        return {
            props: {
                staffToCustomers: staffToCustomers.data,
                token: token,
                id
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function StaffToCustomer({id, token, staffToCustomers}) {
    const [staffToCustomer, setStaffToCustomer] = useState(staffToCustomers.data);
    const [staff, setStaff] = useState(staffToCustomers.user.fullName);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState([]);
    const [sortColumn, setSortColumn] = useState("created_at");
    const [search, setSearch] = useState('');
    const [sortType, setSortType] = useState("asc");

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    async function getCustomerToOfficial() {
        setLoading(true)
        await axios({
            method: 'POST',
            url: `/api/users/get-customer-user`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: token
            },
            data: {
                limit: limit,
                page: page,
                sortColumn: sortColumn,
                sortType: sortType,
                search: search,
                id: id
            },
        }).then(function (response) {
            setLoading(false)
            setStaffToCustomer(response.data.data);
            setStaff(response.data.user.fullName);
            setTotal(response.data.total);
        }).catch(function (error) {
            console.log(error);
        });
    }

    useEffect(() => {
        getCustomerToOfficial();
    }, [limit, page, sortColumn, sortType, search, id]);

    return (
        <div>
            <Title title="Personel Firma Listesi"/>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/staffManagement/staffManagement">
                        Personel Yönetimi
                    </Link>
                    <a className="cursor-pointer me-2"
                       href={'/staffManagement/staffManagement/staffToCustomer/' + id}>
                        Personel Firma Listesi
                    </a>
                </Breadcrumbs>
            </div>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row w-100">
                    <div className="col-md-4 col-12 mb-2 mb-md-0 mt-2">
                        <label className="fw-semibold">
                            Personel Adı : {staff}
                        </label></div>
                    <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                        <h5 className="fw-bold mb-0">
                            <div className="d-flex" role="search">
                                <input className="form-control form-control-sm  me-2" type="search"
                                       placeholder="Arama"
                                       aria-label="Arama"
                                       onChange={(e) => setSearch(e.target.value)}/>
                                <button className="btn btn-outline-secondary"><i className="fal fa-search"></i>
                                </button>
                            </div>
                        </h5>
                    </div>
                </div>
            </div>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={staffToCustomer}
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
                            <Table.Column sortable={true} width={250}>
                                <Table.HeaderCell>Firma Atama Tarihi</Table.HeaderCell>
                                <Table.Cell dataKey="customerToUser.created_at">
                                    {rowData => moment(rowData.customerToUser.created_at).format('DD.MM.YYYY')}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column sortable={true} width={250}>
                                <Table.HeaderCell>Firma Türü</Table.HeaderCell>
                                <Table.Cell dataKey="customerToUser.customer_type"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={200}>
                                <Table.HeaderCell>Firma Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="customer_code"/>
                            </Table.Column>
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Firma Adı</Table.HeaderCell>
                                <Table.Cell dataKey="trade_name"/>
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
                                    onChangeLimit={handleChangeLimit}/>
                    </CustomProvider>
                </div>
            </div>

        </div>
    )

}

StaffToCustomer.auth = true;
export default StaffToCustomer;
