import React, { useState, useEffect } from "react";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Card, Button, Paper, CardContent } from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import api from '../../API';
import { toast } from 'react-toastify';
import ImagePreviewDialog from "../../Components/imagePreview";
import { fetchLink } from '../../Components/fetchComponent';
import ProductAddEditComp from "./Components/productAddEdit";
import FilterableTable from "../../Components/filterableTable2";
import './Components/productCss.css';
import { indianCurrency, isValidObject } from "../../Components/functions";

const initialInputValue = {
    Product_Id: '',
    Product_Code: '',
    Product_Name: '',
    Short_Name: '',
    Product_Description: '',
    Brand: '',
    Product_Group: '',
    Pack_Id: '',
    UOM_Id: '',
    IS_Sold: '',
    Display_Order_By: '',
    HSN_Code: '',
    Gst_P: '',
    Cgst_P: '',
    Sgst_P: '',
    Igst_P: '',
    ERP_Id: '',
}

const ProductCard = ({ product, setProductInputValue, setDialog }) => {
    return (
        <div className="row">

            <div className="col-sm-2 p-0">
                <div className="product-card-image">
                    <ImagePreviewDialog url={product?.productImageUrl}>
                        <img
                            src={product?.productImageUrl}
                            alt={product?.Product_Name}
                            style={{ maxWidth: '150px' }}
                        />
                    </ImagePreviewDialog>
                </div>
            </div>

            <div className=" col-sm-10 p-2">
                <div className="product-brand-group">
                    <span>{product?.Brand_Name} - {product?.Pro_Group}</span>
                    <span>
                        <IconButton
                            onClick={() => {
                                setProductInputValue(pre => {
                                    let inputVAL = { ...pre }
                                    Object.entries(product).forEach(([key, value]) => {
                                        inputVAL[key] = value ?? ''
                                    })
                                    return inputVAL
                                });

                                setDialog();
                            }}
                        ><Edit /></IconButton>
                    </span>
                </div>
                <h6 className="fw-bold fa-18">{product?.Product_Name}</h6>
                <p className="product-description">
                    {product?.Product_Description}
                </p>
                <table style={{ minWidth: '300px', marginBottom: '15px' }}>
                    <tbody>
                        <tr>
                            <td className="border fa-12 p-1 fw-bold">HSN Code</td>
                            <td className="border fa-12 p-1">{product?.HSN_Code ?? '-'}</td>
                            <td className="border fa-12 p-1 fw-bold">ERP Id</td>
                            <td className="border fa-12 p-1">{product?.ERP_Id ?? '-'}</td>
                        </tr>
                        <tr>
                            <td className="border fa-12 p-1 fw-bold">Tax</td>
                            <td className="border fa-12 p-1">{product?.Gst_P ?? 0}(%)</td>
                            <td className="border fa-12 p-1 fw-bold">Is Salable?</td>
                            <td className="border fa-12 p-1">
                                {(() => {
                                    switch (product?.IS_Sold) {
                                        case 0: {
                                            return 'Not Salable'
                                        }
                                        case 1: {
                                            return 'Salable'
                                        }
                                        default: {
                                            return 'Unknown'
                                        }
                                    }
                                })()}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="product-price">
                    <span className="price">{indianCurrency(product?.Item_Rate)}</span>
                    <span className="units"> / {product?.Units}</span>
                </div>
            </div>

            {/* <div className="col-sm-2 p-2">
                
            </div> */}
        </div>
    );
};

const ProductsMaster = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [products, setProducts] = useState([]);
    const [reload, setReload] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [filterInput, setFilterInput] = useState('');
    const [productInputValue, setProductInputValue] = useState(initialInputValue)
    const [dialog, setDialog] = useState({
        imageUpload: false,
        createAndUpdate: false
    });


    useEffect(() => {
        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))
    }, [reload, storage?.Company_id])

    useEffect(() => {
        const filteredResults = products.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(filterInput.toLowerCase())
            );
        });

        setFilteredData(filteredResults);
    }, [products, filterInput])

    const updateProductImage = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('Product_Image', productInputValue.Product_Image);
        formData.append('Product_Id', productInputValue?.Product_Id);
        if (productInputValue?.Product_Image && productInputValue?.Product_Id) {
            // fetchLink({
            //     address: `masters/products/productImage`,
            //     method: 'PUT',
            //     bodyData: formData,
            //     autoHeaders: true,
            // }).then(data => {
            //     if (data.success) {
            //         toast.success(data.message);
            //         imageUploadDialogClose()
            //         setReload(!reload)
            //     } else {
            //         toast.error(data.message)
            //     }
            // }).catch(e => console.error(e))

            fetch(`${api}masters/products/productImage`, {
                method: 'PUT',
                body: formData
            }).then(res => res.json())
                .then(data => {
                    if (data.success) {
                        toast.success(data.message);
                        imageUploadDialogClose()
                        setReload(!reload)
                    } else {
                        toast.error(data.message)
                    }
                }).catch(e => console.error(e))
        }
    }

    const imageUploadDialogClose = () => {
        setDialog({ ...dialog, imageUpload: false });
        setProductInputValue(initialInputValue);
    }

    return (
        <>
            <Card component={Paper}>
                <div className="p-3 pb-1 d-flex align-items-center flex-wrap">
                    <h6 className="flex-grow-1 fa-18">Products</h6>

                    <ProductAddEditComp
                        reload={() => setReload(pre => !pre)}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    >
                        <Button
                            variant='outlined'
                            startIcon={<Add />}
                        >
                            New
                        </Button>
                    </ProductAddEditComp>

                    <input
                        type="search"
                        value={filterInput}
                        className="cus-inpt w-auto p-1 ps-2 ms-2"
                        placeholder="Search"
                        onChange={e => setFilterInput(e.target.value)}
                    />

                </div>


                <CardContent sx={{ p: 0 }}>
                    <FilterableTable
                        dataArray={filterInput === '' ? products : filteredData}
                        columns={[
                            {
                                isVisible: 1,
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <ProductCard 
                                        product={row} 
                                        setDialog={() => setDialog(pre => ({...pre, createAndUpdate: true}))} 
                                        setProductInputValue={setProductInputValue}
                                    />
                                ),
                            }
                        ]}
                        tableMaxHeight={600}
                        initialPageCount={10}
                    />
                </CardContent>

            </Card>

            <Dialog
                open={dialog.imageUpload}
                onClose={imageUploadDialogClose}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    Update Product Image
                    <span className="ps-1 text-primary">{productInputValue?.Product_Name}</span>
                </DialogTitle>
                <form onSubmit={updateProductImage}>
                    <DialogContent>
                        <label>Select Product Image</label>
                        <input
                            type='file'
                            className="cus-inpt" required
                            onChange={e => setProductInputValue({ ...productInputValue, Product_Image: e.target.files[0] })}
                            accept="image/*"
                        />
                        {productInputValue.Product_Image && (
                            <img
                                src={URL.createObjectURL(productInputValue.Product_Image)}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: 200, marginTop: 10 }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button type="button" onClick={imageUploadDialogClose}>cancel</Button>
                        <Button type="submit">update</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {(dialog.createAndUpdate && isValidObject(productInputValue)) && (
                <ProductAddEditComp
                    reload={() => setReload(pre => !pre)}
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    row={productInputValue}
                />
            )}
        </>
    )
}


export default ProductsMaster;