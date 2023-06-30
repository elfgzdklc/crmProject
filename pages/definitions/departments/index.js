import React, {useState, useEffect} from 'react';
import {Table, CustomProvider, Pagination} from "rsuite";
import {Breadcrumbs, Button} from "@mui/material";
import Link from "@mui/material/Link";
import axios from "axios";
import {useForm} from "react-hook-form";
import askDelete from "../../../components/askDelete";
import {useSession} from "next-auth/react";
import alert from "../../../components/alert";
import {locale} from "../../../public/rsuite/locales/tr_TR";
import Title from "../../../components/head";
import {useRouter} from "next/router";
import alertAuthority from "../../../components/alertAuthority";
import {Modal} from "react-bootstrap";


// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const departments = await axios.post(`${path}api/departments/get-departments`, {
//         limit: 10,
//         page: 1,
//         sortColumn: "id",
//         sortType: "desc",
//         search: ''
//     });
//     return {
//         props: {
//             departments: departments.data,
//         },
//     };
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


function Departments(props) {
    const {data: session} = useSession()
    const router = useRouter();
    const [departments, setDepartments] = useState([]);
    const [defaultOptions, setDefaultOptions] = useState();
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState();
    const [sortColumn, setSortColumn] = useState("id");
    const [sortType, setSortType] = useState("desc");
    const [search, setSearch] = useState("");

    const [showDepartment, setShowDepartment] = useState(false);
    const handleCloseDepartment = () => setShowDepartment(false);
    const handleShowDepartment = () => setShowDepartment(true);

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
            if (response.data[0] === undefined || response.data[0].department_management === 0) {
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
                getDepartments();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }


    async function getDepartments() {
        setLoading(true);
        await axios({
            method: 'post',
            url: '/api/definitions/departments-management/get-departments',
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
            setDepartments(response.data.data);
            setLoading(false);
            setTotal(response.data.total);
        }).catch(function (error) {
            console.log(error);
        });
    }

    const {register, handleSubmit, setValue, reset, watch, formState: {errors}} = useForm();

    const onSubmit = async data => {
        await axios({
            method: 'POST',
            url: '/api/definitions/departments-management/add-edit-department',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (res) {
            handleCloseDepartment();
            getDepartments()
            alert(res.data.title, res.data.message, res.data.status, () => {
                reset()
            })
        }).catch(function (error) {
            console.log(error)
        })
    }
    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const handleDeleteDepartment = (id) => {
        let getToken = props.token;
        askDelete(`/api/definitions/departments-management/delete-departments/${id}`, getToken, function () {
                getDepartments()
            }
        );
    }
    useEffect(() => {
        getPermissionDetail();
    }, [limit, page, sortColumn, sortType, search, watch]);
    return (
        <div>
            <Title title="Departman Yönetimi"/>
            <div>
                <Breadcrumbs aria-label="breadcrumb" className="bg-white mb-3 p-3 rounded shadow">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link
                        underline="none"
                        color="inherit"
                        href="/definitions/departments"
                    >
                        Departmanlar
                    </Link>
                </Breadcrumbs>
                {/* start: Header */}
                <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                    <div className="row w-100">
                        <div className="col-md-8 col-12 mb-2 mb-md-0">
                            <h5 className="fw-bold mb-0">
                                <Button variant="outlined" className="text-capitalize btn-tk" onClick={() => {
                                    reset()
                                    setValue("id", 0)
                                    handleShowDepartment()
                                }}>
                                    <i className="fas fa-plus me-1"></i>Yeni Departman
                                </Button>
                            </h5>
                        </div>
                        <div className="col-md-4 col-12 d-flex justify-content-end pe-0">
                            <h5 className="fw-bold mb-0">
                                <div className="d-flex" role="search">
                                    <input className="form-control me-2" type="search" placeholder="Arama"
                                           aria-label="Arama"
                                           onChange={(e) => setSearch(e.target.value)}/>
                                    <button className="btn btn-outline-secondary"><i className="fal fa-search"></i>
                                    </button>
                                </div>
                            </h5>
                        </div>
                    </div>
                </div>
                {/* end: Header */}
            </div>
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            cellBordered={true}
                            hover={true}
                            bordered={true}
                            sortColumn={sortColumn}
                            sortType={sortType}
                            data={departments}
                            onSortColumn={(sortColumn, sortType) => {
                                setSortColumn(sortColumn);
                                setSortType(sortType);
                            }}>
                            <Table.Column sortable={true} flexGrow={4}>
                                <Table.HeaderCell>Departman Adı</Table.HeaderCell>
                                <Table.Cell dataKey="department_name"/>
                            </Table.Column>
                            <Table.Column width={200} align="center">
                                <Table.HeaderCell>
                                    İşlemler
                                </Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Düzenle"
                                               onClick={() => {
                                                   reset();
                                                   setValue('id', rowData.id);
                                                   setValue('department_name', rowData.department_name);
                                                   handleShowDepartment()
                                               }}>
                                                <i className="fal fa-edit me-2"></i>
                                            </a>
                                            {
                                                session.user.permission_id === 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        handleDeleteDepartment(rowData.id)
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
                                    onChangeLimit={handleChangeLimit}/>
                    </CustomProvider>
                </div>
            </div>

            <Modal show={showDepartment} onHide={handleCloseDepartment}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Departman {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <label className="pb-2">Departman Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input type="text"
                                       className={"form-control form-control-sm " + (errors.department_name ? "is-invalid" : "")}
                                       autoFocus={true}
                                       name="department_name"
                                       {...register("department_name", {required: true})}/>
                                {errors.department_name &&
                                    <div className="invalid-feedback text-start">Bu
                                        alan
                                        zorunlu.</div>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm"
                                onClick={handleCloseDepartment}>Vazgeç
                        </button>
                        <button type="submit"
                                className="btn btn-tk-save btn-sm" {...register("id")}>Kaydet
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

        </div>
    );
}

Departments.auth = true;
export default Departments;