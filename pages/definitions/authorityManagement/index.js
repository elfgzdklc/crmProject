import React, {useEffect, useState} from 'react';
import {Breadcrumbs, Button} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {useForm, Controller} from 'react-hook-form';
import 'moment/locale/tr';
import {CustomProvider, Table, Pagination, Popover, Whisper} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import {useSession} from "next-auth/react";
import deleteSwal from "../../../components/askDelete";
import alertSwal from "../../../components/alert";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import {Modal} from "react-bootstrap";
import NumberFormat from "react-number-format";

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const permissions = await axios.post(`${path}api/definitions/authority-management/get-authorities`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//     return {
//         props: {
//             permissions: permissions.data
//         }, // will be passed to the page component as props
//     }
// }
export async function getServerSideProps(context) {
    const token = context.req.cookies['__Crm-next-auth.session-token']
    if (token) {
        return {
            props: {
                token: token
            },
        }
    } else {
        context.res.writeHead(302, {Location: `${process.env.NEXT_PUBLIC_URL}`});
    }
}

function AuthorityManagement(props) {
    const {data: session} = useSession()
    const router = useRouter();
    const {register, handleSubmit, setValue, reset, formState: {errors}, watch} = useForm();
    const {
        register: registerPermission,
        handleSubmit: handleSubmitPermission,
        reset: resetPermission
    } = useForm();

    const [permissions, setPermissions] = useState([]);
    const [sortColumn, setSortColumn] = useState("id");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");

    const [showAuthority, setShowAuthority] = useState(false);
    const handleCloseAuthority = () => setShowAuthority(false);
    const handleShowAuthority = () => setShowAuthority(true);

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
            if (response.data[0] === undefined || response.data[0].authority_management === 0) {
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
                getPermissions();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getPermissions() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/definitions/authority-management/get-authorities',
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
            setPermissions(response.data.data);
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


    const onSubmit = async (data) => {
        await axios({
            method: 'post',
            url: '/api/definitions/authority-management/add-edit-authority',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (response) {
            handleCloseAuthority();
            getPermissions();
            alertSwal(response.data.title, response.data.message, response.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error);
        });
    };


    const deleteAuthority = async (id) => {
        let getToken = props.token;
        deleteSwal(`/api/definitions/authority-management/delete-authority/${id}`, getToken, () => {
            getPermissions();
        });
    }
    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search, watch]);

    return (
        <div>
            <Title title="Yetki Yönetimi"/>
            <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                <Link underline="none" color="inherit" href="/dashboard">
                    Ana Sayfa
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    href="/definitions/authorityManagement"
                >
                    Yetki Yönetimi
                </Link>
            </Breadcrumbs>
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row w-100">
                    <div className="col-md-4 col-12 mb-2 mb-md-0">
                        <h5 className="fw-bold mb-0">
                            <Button variant="outlined" className="text-capitalize btn-custom" onClick={() => {
                                reset();
                                setValue("id", 0);
                                handleShowAuthority();
                            }}>
                                <i className="fas fa-plus me-1"></i> Yeni Yetki Grubu
                            </Button>
                        </h5>
                    </div>
                    <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                        <h5 className="fw-bold mb-0">
                            <div className="d-flex" role="search">
                                <input className="form-control me-2" type="search" placeholder="Arama"
                                       aria-label="Arama"
                                       onChange={(e) => setSearch(e.target.value)}/>
                                <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
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
                            data={permissions}
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
                            <Table.Column flexGrow={4}>
                                <Table.HeaderCell>Yetki Adı</Table.HeaderCell>
                                <Table.Cell dataKey="permission_name"/>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>Yetkiler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Yetki Düzenleme" key={rowData.id}
                                               href={'/definitions/authorityManagement/authorityManagementDetail/' + rowData.id}>
                                                <i className="fal fa-clipboard-list-check fs-5"></i>
                                            </a>
                                        </>
                                    )}
                                </Table.Cell>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Düzenle"
                                               onClick={() => {
                                                   setValue('id', rowData.id);
                                                   setValue('permission_name', rowData.permission_name);
                                                   handleShowAuthority()
                                               }}>
                                                <i className="fal fa-edit me-2"></i>
                                            </a>
                                            {
                                                session.user.permission_id === 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        deleteAuthority(rowData.id)
                                                    }}>
                                                        <i className="fal fa-trash-alt"></i>
                                                    </a>
                                                ) : null
                                            }
                                        </>
                                    )}
                                </Table.Cell>
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

            <Modal show={showAuthority} onHide={handleCloseAuthority}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Yetki {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12 col-lg-12">
                                <label className="pb-2">Yetki Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input type="text"
                                       className={"form-control form-control-sm " + (errors.permission_name ? "is-invalid" : "")}
                                       name="permission_name"
                                       {...register("permission_name", {required: true})}/>
                                {errors.permission_name &&
                                    <div className="invalid-feedback text-start">Bu
                                        alan
                                        zorunlu.</div>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseAuthority}>Vazgeç
                        </button>
                        <button type="submit"
                                className="btn btn-custom-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

        </div>
    );
}

AuthorityManagement.auth = true;

export default AuthorityManagement;
