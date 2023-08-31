import React, {useEffect, useState} from 'react';
import {Breadcrumbs, Button} from "@mui/material";
import Link from '@mui/material/Link';
import axios from 'axios';
import {Controller, useForm} from 'react-hook-form';
import 'moment/locale/tr';
import {Pagination, Table, CustomProvider} from 'rsuite';
import {locale} from "../../../public/rsuite/locales/tr_TR";
import alert from "../../../components/alert";
import askDelete from "../../../components/askDelete";
import NumberFormat from "react-number-format";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {Carousel} from 'react-responsive-carousel';
import alertSwal from "../../../components/alert";
import {ExportExcel} from "../../../components/exportExcel";
import {useSession} from "next-auth/react";
import Title from "../../../components/head";
import alertAuthority from "../../../components/alertAuthority";
import {useRouter} from "next/router";
import {Modal} from 'react-bootstrap';

// export async function getServerSideProps(context) {
//     const path = process.env.NEXTAUTH_URL;
//     const products = await axios.post(`${path}api/productManagement/products/get-products`, {
//         limit: 10,
//         page: 1,
//         sortColumn: 'id',
//         sortType: 'desc',
//         search: ''
//     });
//     return {
//         props: {
//             products: products.data,
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

function Products(props) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        resetField,
        control,
        formState: {errors}
    } = useForm();
    const [products, setProducts] = useState([])
    const [sortColumn, setSortColumn] = useState("created_at")
    const [sortType, setSortType] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState();
    const [brands, setBrands] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [sheetDataProduct, setSheetDataProduct] = useState([]); // export işlemi için
    const fileName = "urunler";
    const {data: session} = useSession();
    const router = useRouter();

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const [showDetail, setShowDetail] = useState(false);
    const handleShowDetail = () => setShowDetail(true);
    const handleCloseDetail = () => setShowDetail(false);

    let img = [];
    const [images, setImages] = useState("");
    if (images) {
        img = images.split(", ");
    }

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
            if (response.data[0] === undefined || response.data[0].products === 0) {
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
                getProducts();
                getProductsExcel();
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function getBrands() {
        await axios({
            method: 'POST',
            url: '/api/productManagement/products/get-brands',
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
        }).then(function (response) {
            setBrands(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getProductCategories() {
        await axios({
            method: 'POST',
            url: '/api/productManagement/products/get-product-categories',
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
        }).then(function (response) {
            setProductCategories(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getProducts() {
        setLoading(true);
        await axios({
            method: 'POST',
            url: '/api/productManagement/products/get-products',
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
            setProducts(response.data.data)
            setTotal(response.data.total)
            setLoading(false)
        }).catch(function (error) {
            console.log(error)
        })
    }

    async function getProductsExcel() {
        setLoading(true)
        let jsonData = [];
        let productCategory;
        await axios({
            method: 'post',
            url: '/api/productManagement/products/get-products-excel',
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: JSON.stringify({
                search: search
            }),
        }).then(function (response) {
            setLoading(false)
            for (let i = 0; i < response.data.data.length; i++) {
                jsonData.push({
                    "Marka (Id)": response.data.data[i].brandDetail != null ? response.data.data[i].brandDetail.id : "-",
                    "Ürün Kategorisi (Id)": response.data.data[i].productCategoryDetail != null ? productCategory = response.data.data[i].productCategoryDetail.id : "-",
                    "Ürün Kodu": response.data.data[i].product_code != null ? response.data.data[i].product_code : "-",
                    "Ürün Adı": response.data.data[i].product_name != null ? response.data.data[i].product_name : "-",
                    "Ürün Açıklaması": response.data.data[i].product_desc != null ? response.data.data[i].product_desc : "-",
                    "Stok": response.data.data[i].stock != null ? response.data.data[i].stock : "0",
                    "Desi": response.data.data[i].desi != null ? response.data.data[i].desi : "0",
                    "Kilogram": response.data.data[i].kilogram != null ? response.data.data[i].kilogram : "0",
                    "Fiyat": response.data.data[i].price != null ? response.data.data[i].price : "0.00",
                    "İndirimli Fiyat": response.data.data[i].sale_price != null ? response.data.data[i].sale_price : "0.00",
                })
                setSheetDataProduct(jsonData);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    async function deleteProduct(id) {
        let token = props.token;
        try {
            askDelete(`/api/productManagement/products/delete-product/${id}`, token, function () {
                getProducts()
                getProductsExcel()
            });
        } catch (e) {
            console.log(e)
        }
    }

    async function getImages(id) {
        await axios({
            method: 'POST',
            url: `/api/productManagement/products/get-images/`,
            headers: {
                'Content-Type': 'application/json',
                AuthToken: props.token
            },
            data: {
                id: id
            }
        }).then(function (response) {
            setImages("")
            setImages(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const onSubmit = async (data) => {
        const formData = new FormData();
        if (data.product_image && data.product_image.length == 1) {
            alert('Uyarı', 'En az iki resim yüklenmelidir.', 'warning', () => {
                getBrands()
            })
        } else {
            //update kontrolü
            if (data.id != 0) {
                //update içinde dosya değişikliği yapılıp yapılmadığı kontrolü
                if (data.product_image != "[object FileList]") {
                    formData.append("product_image", data.product_image);
                } else {
                    for (let v in data.product_image) {
                        if (v != "length" && v != "item") {
                            formData.append("product_image", data.product_image[v]);
                        }
                    }
                }
            } else {
                for (let v in data.product_image) {
                    if (v != "length" && v != "item") {
                        formData.append("product_image", data.product_image[v]);
                    }
                }
            }
            for (let value in data) {
                if (value != "product_image") {
                    formData.append(value, data[value]);
                }
            }
            await axios({
                method: 'POST',
                url: '/api/productManagement/products/add-edit-product',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    AuthToken: props.token
                },
                data: formData,
            }).then(function (res) {
                handleClose();
                getProducts();
                getProductsExcel();
                alert(res.data.title, res.data.message, res.data.status, () => {
                    reset()
                })
            }).catch(function (error) {
                console.log(error)
            })
        }
    }

    const handleChangeLimit = dataKey => {
        setPage(1)
        setLimit(dataKey)
    }

    ///file limit start///
    const handleUploadFiles = files => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files.map((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file);
                if (uploaded.length > 6) {
                    alert('Uyarı!', `En fazla 6 dosya yükleyebilirsiniz.`, 'warning', () => {
                        getBrands()
                        resetField('product_image')
                    })
                    limitExceeded = true;
                    return true;
                }
            }
        })
        if (!limitExceeded) setUploadedFiles(uploaded)
    }

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)
        handleUploadFiles(chosenFiles);
    }
    ///file limit end///

    const importExcel = async (e) => {
        let fileObj = e.target.files[0];
        const formData = new FormData();
        formData.append("excel", fileObj);
        setLoading(true);
        await axios({
            method: 'post',
            url: "/api/productManagement/products/excel-create/",
            headers: {
                'Content-Type': 'multipart/form-data',
                AuthToken: props.token
            },
            data: formData,
        }).then(function (response) {
            document.getElementById('uploadFile').value = "";   //onChange işlemi için reset görevi görüyor
            if (response.data.status === "success") {
                alertSwal(response.data.title, response.data.message, response.data.status, () => {
                    setLoading(false);
                    getProducts();
                    getProductsExcel();
                    setTimeout(function () {
                        window.location.href = "/productManagement/products";
                    }, 1000)
                })
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    useEffect(() => {
        getPermissionDetail();
        getBrands();
        getProductCategories();
    }, [page, search, limit, sortColumn, sortType, watch]);

    return (
        <div>
            <Title title="Ürün Yönetimi"/>
            <div className="row bg-white mb-3 p-3 rounded shadow mx-0">
                <div className="col-lg-7 col-12 p-2">
                    <div className="row">
                        <div className="col-10 col-md-12 d-flex align-items-center">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link underline="none" color="inherit" href="/dashboard">
                                    Ana Sayfa
                                </Link>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    href="/productManagement/products"
                                >
                                    Ürün Yönetimi
                                </Link>
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5 col-12 d-flex justify-content-end">
                    <label className="custom-file-upload border rounded me-2 p-2 fw-semibold cursor-pointer">
                        <input type="file" onChange={importExcel} id="uploadFile" hidden/>
                        <i className="fa fa-cloud-upload cursor-pointer"></i> Yükle
                    </label>
                    <ExportExcel excelData={sheetDataProduct} fileName={fileName}/>
                </div>
            </div>
            {/* start: Header */}
            <div className="ps-3 py-2 bg-white rounded shadow d-flex align-items-center justify-content-between">
                <div className="row w-100">
                    <div className="col-md-4 col-12 mb-2 mb-md-0">
                        <h5 className="fw-bold mb-0">
                            <Button variant="outlined" className="text-capitalize btn-custom"
                                    onClick={() => {
                                        reset()
                                        setValue("id", 0)
                                        setValue('product_name', "");
                                        setValue('product_code', "");
                                        setValue('product_desc', "");
                                        setValue('price', "");
                                        setValue('sale_price', "");
                                        setValue('price', "");
                                        setValue('kilogram', "");
                                        setValue('desi', "");
                                        setValue('stock', "");
                                        handleShow()
                                    }}><i className="fas fa-plus me-1"></i>
                                Yeni Ürün
                            </Button>
                        </h5>
                    </div>
                    <div className="col-md-8 col-12 d-flex justify-content-end pe-0">
                        <h5 className="fw-bold mb-0 mbl-w-100">
                            <div className="d-flex" role="search">
                                <input className="form-control form-control-sm me-2" type="search" placeholder="Arama"
                                       aria-label="Arama" onChange={(e) => setSearch(e.target.value)}/>
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
                            data={products}
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
                            <Table.Column sortable={true} flexGrow={1}>
                                <Table.HeaderCell>Ürün Adı</Table.HeaderCell>
                                <Table.Cell dataKey="product_name"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={150} resizable>
                                <Table.HeaderCell>Ürün Kodu</Table.HeaderCell>
                                <Table.Cell dataKey="product_code"/>
                            </Table.Column>
                            <Table.Column width={150} resizable>
                                <Table.HeaderCell>Marka</Table.HeaderCell>
                                <Table.Cell dataKey="brandDetailProduct.brand_name"/>
                            </Table.Column>
                            <Table.Column width={150} resizable>
                                <Table.HeaderCell>Kategori</Table.HeaderCell>
                                <Table.Cell dataKey="productCategoryDetailProduct.category_name"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={100} resizable>
                                <Table.HeaderCell>Stok</Table.HeaderCell>
                                <Table.Cell dataKey="stock"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={125} resizable>
                                <Table.HeaderCell>Fiyat</Table.HeaderCell>
                                <Table.Cell dataKey="price"/>
                            </Table.Column>
                            <Table.Column sortable={true} width={150} resizable>
                                <Table.HeaderCell>İndirimli Fiyat</Table.HeaderCell>
                                <Table.Cell dataKey="sale_price"/>
                            </Table.Column>
                            <Table.Column width={200}>
                                <Table.HeaderCell align={"center"}>İşlemler</Table.HeaderCell>
                                <Table.Cell align={"center"}>
                                    {rowData => (
                                        <>
                                            <a className="cursor-pointer" title="Detay"
                                               onClick={() => {
                                                   reset();
                                                   setValue('brand_name', rowData.brandDetailProduct ? rowData.brandDetailProduct.brand_name : "");
                                                   setValue('category_name', rowData.productCategoryDetailProduct ? rowData.productCategoryDetailProduct.category_name : "");
                                                   setValue('product_name', rowData.product_name);
                                                   setValue('product_code', rowData.product_code);
                                                   setValue('product_desc', rowData.product_desc);
                                                   setValue('sale_price', rowData.sale_price);
                                                   setValue('price', rowData.price);
                                                   setValue('kilogram', rowData.kilogram);
                                                   setValue('desi', rowData.desi);
                                                   setValue('stock', rowData.stock);
                                                   getImages(rowData.id);
                                                   handleShowDetail();
                                               }}>
                                                <i className="fal fa-info-circle me-2"></i>
                                            </a>
                                            <a className="cursor-pointer" title="Düzenle"
                                               onClick={() => {
                                                   reset();
                                                   setValue('id', rowData.id);
                                                   setValue('brand_id', rowData.brand_id);
                                                   setValue('product_category_id', rowData.product_category_id);
                                                   setValue('product_name', rowData.product_name);
                                                   setValue('product_code', rowData.product_code);
                                                   setValue('product_desc', rowData.product_desc);
                                                   setValue('product_image', rowData.product_image);
                                                   setValue('sale_price', rowData.sale_price);
                                                   setValue('price', rowData.price);
                                                   setValue('kilogram', rowData.kilogram);
                                                   setValue('desi', rowData.desi);
                                                   setValue('stock', rowData.stock);
                                                   handleShow()
                                               }}>
                                                <i className="fal fa-edit me-2"></i>
                                            </a>
                                            {
                                                session.user.permission_id === 1 ? (
                                                    <a className="cursor-pointer" title="Sil" onClick={() => {
                                                        deleteProduct(rowData.id)
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

            <Modal size="lg" show={showDetail} onHide={handleCloseDetail} keyboard={false}
                   aria-labelledby="example-modal-sizes-title-lg">
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Ürün Detay
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <div className="col-12 mb-2">
                                <label className="mb-1">Ürün Görselleri</label>
                                {(() => {
                                    if (img == "" || img == "null") {
                                        return (
                                            <img style={{width: "100%"}} src="/public/assets/img/noproductimg.png"
                                                 alt="noproductimg"/>
                                        )
                                    } else {
                                        return (
                                            <Carousel showArrows={true}
                                                      showThumbs={true}
                                                      width={350}
                                                      autoPlay={true}
                                                      autoFocus={true}
                                                      infiniteLoop={true}
                                                      stopOnHover={true}
                                                      emulateTouch={true}
                                                      transitionTime={400}
                                            >
                                                {
                                                    img.map((i, index) => (
                                                        <div key={index}>
                                                            <img
                                                                src={`/public/uploads/${i}`}
                                                                alt={i}
                                                                objectFit="contain"
                                                            />
                                                        </div>
                                                    ))
                                                }
                                            </Carousel>
                                        )
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label>Ürün Adı</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("product_name")} />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Ürün Kodu</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("product_code")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Ürün Kategorisi</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("category_name")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Markası</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("brand_name")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Stok</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("stock")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Desi</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("desi")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Kilogram</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("kilogram")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>Fiyat</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("price")}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label>İndirimli Fiyat</label>
                                    <input className="form-control form-control-sm "
                                           readOnly {...register("sale_price")}
                                    />
                                </div>
                                <div className="col-12 mb-2">
                                    <label>Ürün Açıklaması</label>
                                    <textarea className="form-control form-control-sm "
                                              readOnly {...register("product_desc")} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseDetail}
                    >Kapat
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <p className="modal-title fs-6 fw-semibold">
                        Ürün {watch("id") && watch("id") != 0 ? 'Düzenle' : 'Ekle'}
                    </p>
                </Modal.Header>
                <hr/>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Ürün Adı</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm  " + (errors.product_name ? "is-invalid" : "")}
                                    maxLength={50}
                                    {...register("product_name", {required: true})} />
                                {errors.product_name &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Ürün Kodu</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <input
                                    className={"form-control form-control-sm  " + (errors.product_code ? "is-invalid" : "")}
                                    maxLength={50}
                                    {...register("product_code", {required: true})}
                                />
                                {errors.product_code &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Stok</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={control}
                                    name="stock"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errors.stock ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            maxLength={10}
                                            allowNegative={false}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errors.stock &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Markası</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <select
                                    {...register("brand_id", {required: true})}
                                    className={"form-select form-select-sm " + (errors.brand_id ? "is-invalid" : "")}
                                >
                                    <option value="">Seçiniz...</option>
                                    {brands.map((i, index) => (
                                        <option key={index} value={i.id}>{i.brand_name}</option>
                                    ))}
                                </select>
                                {errors.brand_id &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Desi</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={control}
                                    name="desi"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errors.desi ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            maxLength={10}
                                            allowNegative={false}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errors.desi &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Kilogram</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={control}
                                    name="kilogram"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errors.kilogram ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            maxLength={10}
                                            allowNegative={false}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errors.kilogram &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Kategorisi</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <select
                                    {...register("product_category_id", {required: true})}
                                    className={"form-select form-select-sm " + (errors.product_category_id ? "is-invalid" : "")}
                                >
                                    <option value="">Seçiniz...</option>
                                    {productCategories.map((i, index) => (
                                        <option key={index} value={i.id}>{i.category_name}</option>
                                    ))}
                                </select>
                                {errors.brand_id &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>Fiyat</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={control}
                                    name="price"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errors.price ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            maxLength={15}
                                            thousandSeparator={false}
                                            decimalSeparator={"."}
                                            allowNegative={false}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errors.price &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-3 mb-2">
                                <label>İndirimli Fiyat</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <Controller
                                    control={control}
                                    name="sale_price"
                                    render={({field: {onChange, name, value}}) => (
                                        <NumberFormat
                                            className={"form-control form-control-sm  " + (errors.sale_price ? "is-invalid" : "")}
                                            name={name}
                                            value={value}
                                            maxLength={15}
                                            thousandSeparator={false}
                                            decimalSeparator={"."}
                                            allowNegative={false}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{required: true}}
                                />
                                {errors.sale_price &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Ürün Resim</label>
                                <input className="form-control form-control-sm "
                                       type="file"
                                       id="formFile"
                                       accept='image/png, image/jpeg, image/svg'
                                       tabIndex={2}
                                       {...register("product_image")}
                                       onChange={handleFileEvent}
                                       multiple
                                />
                                <div className="bg-white mt-1 ps-1 tableInfoText" role="alert">
                                    <p className="mb-0">* Dosya seçilmeden ilerlenebilir, güncelleme ekranında
                                        işleme devam edilebilir.</p>
                                    <p className="mt-0">* Görsel eklenecek ise <strong> en az
                                        iki</strong> görsel seçilmelidir.</p>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6 mb-2">
                                <label>Ürün Açıklaması</label>
                                <span className="registerTitle text-danger fw-bold"> *</span>
                                <textarea
                                    maxLength={150}
                                    className={"form-control form-control-sm  " + (errors.product_desc ? "is-invalid" : "")}
                                    {...register("product_desc", {required: true})}
                                />
                                {errors.product_desc &&
                                    <div className="invalid-feedback text-start">Bu alan zorunlu.</div>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}
                        >Vazgeç
                        </button>
                        <button className="btn-custom-save btn-sm" type="submit" {...register('id')}>Kaydet</button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

Products.auth = true;
export default Products;
