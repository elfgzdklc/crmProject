import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Button } from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import 'moment/locale/tr';
import { Pagination, Table, CustomProvider } from 'rsuite';
import { locale } from "../../../public/rsuite/locales/tr_TR";
import alert from "../../../components/alert";
import askDelete from "../../../components/askDelete";
import { useSession } from "next-auth/react";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import { useRouter } from "next/router";
import { Modal } from 'react-bootstrap';

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const brands = await axios.post(`${path}api/productManagement/brands/get-brands`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//
//     return {
//         props: {
//             brands: brands.data,
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
    }
    else {
        context.res.writeHead(302, { Location: `${process.env.NEXT_PUBLIC_URL}` });
    }
}
function Brands(props) {
    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();
    const [brands, setBrands] = useState([]);
    const [sortColumn, setSortColumn] = useState("created_at");
    const [sortType, setSortType] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const { data: session } = useSession();
    const router = useRouter();

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);


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
            if (response.data[0] === undefined || response.data[0].brands === 0) {
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
                getBrands();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }


    async function getBrands() {
        setLoading(true);
        await axios({
            method: 'POST',
            url: '/api/productManagement/brands/get-brands',
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
            setBrands(response.data.data)
            setTotal(response.data.total)
            setLoading(false);
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function deleteBrand(id) {
        let token = props.token;
        try {
            askDelete(`/api/productManagement/brands/delete-brand/${id}`, token, function () {
                getBrands()
            });
        } catch (e) {
            console.log(e);
        }
    }

    const onSubmit = async (data) => {
        await axios({
            method: 'POST',
            url: '/api/productManagement/brands/add-edit-brand',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify(data),
        }).then(function (res) {
            handleClose();
            getBrands();
            alert(res.data.title, res.data.message, res.data.status, () => {
                reset();
            })
        }).catch(function (error) {
            console.log(error)
        })
    }
    const handleChangeLimit = dataKey => {
        setPage(1)
        setLimit(dataKey)
    }


    // //tablo sıralaması için row değeri setBrands a eklendi
    // const items = []
    // for (let i = 0; i < brands.length; i++) {
    //     items.push({row: i + 1})
    // }
    // let allBrands = brands.map((item, i) => Object.assign({}, item, items[i]));
    useEffect(() => {
        getPermissionDetail();
    }, [page, search, limit, sortColumn, sortType, watch]);

    return (
        <div>
            <Title title="Marka Yönetimi" />
            <div className="row  bg-white mb-3 py-3 rounded shadow w-100 ms-1" >
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="none" color="inherit" href="/dashboard">
                        Ana Sayfa
                    </Link>
                    <Link underline="none" color="inherit" href="/productManagement/brands">
                        Marka Yönetimi
                    </Link>
                </Breadcrumbs>
            </div>


            {/* start: Header */}
            <div className="px-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row w-100">
                    <div className="col-md-4 col-12 mb-2 mb-md-0">
                        <h5 className="fw-bold mb-0">
                            <Button variant="outlined" className="text-capitalize btn-custom"
                                onClick={() => {
                                    reset()
                                    setValue("id", 0)
                                    handleShow();
                                }}><i className="fas fa-plus me-1"></i>
                                Yeni Marka
                            </Button>
                        </h5>
                    </div>
                    <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                        <h5 className="fw-bold mb-0  mbl-w-100">
                            <div className="d-flex" role="search">
                                <input className="form-control form-control-sm me-2" type="search" placeholder="Arama"
                                    aria-label="Arama"
                                    onChange={(e) => setSearch(e.target.value)} />
                                <button className="btn btn-outline-secondary"><i className="fal fa-search"></i></button>
                            </div>
                        </h5>
                    </div>
                </div>
            </div>
            {/*end: Header*/}
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
                <div>
                    <CustomProvider locale={locale}>
                        <Table
                            height={400}
                            loading={loading}
                            autoHeight={true}
                            data={brands}
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
                            <Table.Column width={150} sortable={true}>
                                <Table.HeaderCell>Id</Table.HeaderCell>
                                <Table.Cell dataKey="id"/>
                            </Table.Column>
                            <Table.Column flexGrow={1} sortable={true}>
                                <Table.HeaderCell>Marka Adı</Table.HeaderCell>
                                <Table.Cell dataKey="brand_name" />
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Düzenle"
                                                onClick={() => {
                                                    reset();
                                                    setValue('id', rowData.id);
                                                    setValue('brand_name', rowData.brand_name);
                                                    handleShow()
                                                }}>
                                                <i className="fal fa-edit me-2"></i>
                                            </a>
                                            {
                                                session.user.permission_id === 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        deleteBrand(rowData.id)
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

            <Modal size="md" show={show} onHide={handleClose} backdrop="static" keyboard={false} aria-labelledby="example-modal-sizes-title-md">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Marka {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <label className="pb-2">Marka Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input type="text"
                                    className={"form-control form-control-sm " + (errors.brand_name ? "is-invalid" : "")}
                                    autoFocus={true}
                                    name="brand_name"
                                    {...register("brand_name", { required: true })} />
                                {errors.brand_name &&
                                    <div className="invalid-feedback text-start">Bu
                                        alan
                                        zorunlu.</div>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}>Vazgeç
                        </button>
                        <button className="btn-custom-save btn-sm" type="submit" {...register('id')}>Kaydet</button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    )
}

Brands.auth = true;
export default Brands;
