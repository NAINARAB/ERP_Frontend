import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { customTableStyles } from '../../Components/tablecolumn'
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Card, Button, Paper, CardContent } from "@mui/material";
import { AddPhotoAlternate } from "@mui/icons-material";
import api from '../../API';
import { toast } from 'react-toastify';
import ImagePreviewDialog from "../../Components/imagePreview";
import { fetchLink } from '../../Components/fetchComponent';

const ProductsMaster = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [products, setProducts] = useState([]);
    const [reload, setReload] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [filterInput, setFilterInput] = useState('');
    const [dialog, setDialog] = useState({
        imageUpload: false,
        createAndUpdate: false
    })
    const initialInputValue = {
        Product_Id: '',
        Product_Code: '',
        Product_Name: '',
        Short_Name: '',
        Product_Description: '',
        Brand: '',
        Product_Group: '',
        UOM: '',
        IS_Sold: '',
        Product_Image: '',
        Display_Order_By: '',
        Product_Image_Name: '',
        Product_Image_Path: '',
        Product_Image_Type: '',
        Product_Image_Size: '',
    }
    const [productInputValue, setProductInputValue] = useState(initialInputValue)

    useEffect(() => {
        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))
    }, [reload, storage?.Company_id])

    const productColumn = [
        {
            name: 'Picture',
            cell: (row) => (
                <span className="py-1">
                    <ImagePreviewDialog url={row?.productImageUrl}>
                        <img
                            src={row?.productImageUrl}
                            alt={''}
                            style={{ height: 150, width: 150 }}
                        />
                    </ImagePreviewDialog>
                    <span style={{ position: 'absolute', top: 0, right: 0 }}>
                        <IconButton
                            onClick={() => {
                                setDialog({ ...dialog, imageUpload: true });
                                setProductInputValue({ ...productInputValue, Product_Id: row.Product_Id, Product_Name: row?.Product_Name })
                            }}
                            size="small"
                        >
                            <AddPhotoAlternate sx={{ fontSize: '15px' }} />
                        </IconButton>
                    </span>
                </span>
            ),
            maxWidth: '170px'
        },
        {
            name: 'Product',
            cell: row => (
                <div>
                    <h6>
                        {row?.Product_Name}
                        {/* <IconButton size="small">
                            <Edit sx={{ fontSize: '15px' }} />
                        </IconButton> */}
                    </h6>
                    <p className="mb-2">{row?.Product_Description}</p>

                    <div className="table-responisve">
                        <table className="mb-0">
                            <tbody>
                                <tr>
                                    <td className="border-0">Brand </td>
                                    <td className="border-0">{row?.Brand_Name}</td>
                                </tr>
                                <tr>
                                    <td className="pe-4 border-0">Product Group </td>
                                    <td className="border-0"> {row?.Pro_Group}</td>
                                </tr>
                                <tr>
                                    <td className="border-0">UOM </td>
                                    <td className="border-0">{row?.UOM}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            minWidth: '450px'
        },
    ]

    function handleSearchChange(event) {
        const term = event.target.value;
        setFilterInput(term);
        const filteredResults = products.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(term.toLowerCase())
            );
        });

        setFilteredData(filteredResults);
    }

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
                <div className="p-3 pb-0 d-flex align-items-center">
                    <h6 className="flex-grow-1 fa-18">Products</h6>
                    {/* <Button
                        variant='outlined'
                        startIcon={<Add />}
                        onClick={() => setDialog({ ...dialog, createAndUpdate: true })}
                    >
                        Add products
                    </Button> */}
                </div>
                <CardContent>
                    <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6 mb-3">
                        <input
                            type="search"
                            value={filterInput}
                            className="cus-inpt"
                            placeholder="Search"
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="rounded-4">
                        <DataTable
                            columns={productColumn}
                            data={
                                filteredData.length > 0
                                    ? filteredData
                                    : filterInput === ''
                                        ? products
                                        : []
                            }
                            pagination
                            fixedHeader={true}
                            fixedHeaderScrollHeight={'60vh'}
                            customStyles={customTableStyles}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* <Dialog>

            </Dialog> */}

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
        </>
    )
}


export default ProductsMaster;