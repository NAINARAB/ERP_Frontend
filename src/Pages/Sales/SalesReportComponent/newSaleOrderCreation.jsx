import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import { isEqualNumber, isGraterNumber, isValidObject, ISOString, getUniqueData, Multiplication, Division, NumberFormat, LocalDateWithTime } from "../../../Components/functions";
import InvoiceBillTemplate from "./../invoiceTemplate";
import { Add, ClearAll, Delete, Edit, Visibility } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable from "../../../Components/filterableTable2";


const Required = () => <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1em' }}> *</span>


const NewSaleOrderCreation = ({ editValues, loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));

    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [productGroup, setProductGroup] = useState([]);
    const [productBrand, setProductBrand] = useState([]);
    const [productUOM, setProductUOM] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({});

    const initialValue = {
        Company_Id: storage?.Company_id,
        So_Date: ISOString(),
        Retailer_Id: '',
        Retailer_Name: 'Select',
        Sales_Person_Id: storage?.UserId,
        Sales_Person_Name: storage?.Name,
        Branch_Id: storage?.BranchId,
        Narration: '',
        Created_by: storage?.UserId,
        Product_Array: [],
        So_Id: '',
        GST_Inclusive: 1,
        IS_IGST: 0,
    }

    const productInitialDetails = {
        Item_Id: '',
        ItemName: 'Search Item',
        Bill_Qty: 0,
        Item_Rate: 0,
        UOM: '',
        Product: {},
        Group: 'Search Group',
        GroupID: '',
        Brand: 'Search Brand',
        BrandID: '',
        Amount: 0
    }

    const [orderDetails, setOrderDetails] = useState(initialValue)
    const [orderProducts, setOrderProducts] = useState([]);
    const [productDetails, setProductDetails] = useState(productInitialDetails);
    const [isEdit, setIsEdit] = useState(false);
    const [addProductDialog, setAddProductDialog] = useState(false);

    useEffect(() => {
        if (isValidObject(editValues)) {
            setOrderDetails(pre => ({
                ...pre,
                So_Date: editValues?.So_Date,
                Retailer_Id: editValues?.Retailer_Id,
                Retailer_Name: editValues?.Retailer_Name,
                Sales_Person_Id: editValues?.Sales_Person_Id,
                Sales_Person_Name: editValues?.Sales_Person_Name,
                Branch_Id: editValues?.Branch_Id,
                Narration: editValues?.Narration,
                Created_by: editValues?.Created_by,
                So_Id: editValues?.So_Id,
            }));
            setOrderProducts(editValues?.Products_List?.map(pro => ({
                ...pro,
                Item_Id: pro.Item_Id ?? '',
                ItemName: pro?.Product_Name ?? "",
                Bill_Qty: pro?.Bill_Qty ?? 0,
                Item_Rate: pro?.Item_Rate ?? 0,
                UOM: pro?.Unit_Id ?? '',
                Product: pro ?? {},
                Group: 'Search Group',
                GroupID: '',
                Brand: 'Search Brand',
                BrandID: '',
            })));
            setIsEdit(true)
        } else {
            setOrderDetails(initialValue);
            setOrderProducts([])
            setIsEdit(false)
        }
    }, [editValues])

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data);
                const uniqueGroup = getUniqueData(data.data, 'Product_Group', ['Pro_Group']);
                setProductGroup(uniqueGroup);
                const uniqueBrand = getUniqueData(data.data, 'Brand', ['Brand_Name']);
                setProductBrand(uniqueBrand);
                const uniqueUOM = getUniqueData(data.data, 'UOM_Id', ['Units']);
                setProductUOM(uniqueUOM)
            } else {
                setProducts([]);
                setProductGroup([])
                setProductBrand([]);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setSalePerson(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/company?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setCompanyInfo(data?.data[0] ? data?.data[0] : {})
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    const handleProductInputChange = (productId, value, rate, obj, UOM_Id) => {
        const productIndex = orderProducts.findIndex(item => isEqualNumber(item.Item_Id, productId));

        if (productIndex !== -1) {
            const updatedValues = [...orderProducts];
            updatedValues[productIndex].Bill_Qty = Number(value);
            updatedValues[productIndex].Item_Rate = Number(rate);
            updatedValues[productIndex].UOM = UOM_Id;
            updatedValues[productIndex].Amount = Multiplication(value, rate);
            updatedValues[productIndex] = { ...updatedValues[productIndex], Product: obj }

            setOrderProducts(updatedValues);
        } else {
            setOrderProducts(prevValues => [...prevValues, {
                Item_Id: productId,
                Bill_Qty: Number(value),
                Item_Rate: Number(rate),
                UOM: UOM_Id,
                Amount: Multiplication(value, rate),
                Product: obj
            }]);
        }
    };

    const postSaleOrder = () => {
        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id) {
            loadingOn();
            fetchLink({
                address: `sales/saleOrder`,
                method: isEdit ? 'PUT' : 'POST',
                bodyData: {
                    ...orderDetails,
                    Product_Array: orderProducts.filter(o => isGraterNumber(o?.Bill_Qty, 0))
                }
            }).then(data => {
                if (data.success) {
                    toast.success(data?.message);
                    // setReload(!reload)
                    setOrderDetails(initialValue);
                    setOrderProducts([])
                } else {
                    toast.error(data?.message)
                }
            }).catch(e => console.error(e)).finally(() => loadingOff())

        } else {
            if (orderProducts.length <= 0) {
                return toast.error('Enter any one product quantity')
            }
            if (!orderDetails?.Retailer_Id) {
                return toast.error('Select Retailer')
            }
        }
    }

    const closeAddProduct = () => {
        setAddProductDialog(false);
        setProductDetails(productInitialDetails);
    }

    return (
        <>

            <div className="p-3 pt-0">
                {/* CompnayInfo  */}
                <div className="p-3 bg-light rounded-3 mb-3 shadow-sm">
                    <h5 className="border-bottom">From:</h5>
                    <div className="row">
                        <div className="col-lg-8 col-md-7">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 bg-light" colSpan={2}>
                                            {companyInfo?.Company_Name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Address:</td>
                                        <td className="border-0 bg-light">{companyInfo?.Company_Address}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Phone:</td>
                                        <td className="border-0 bg-light">{companyInfo?.Telephone_Number}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-lg-4 col-md-5">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 bg-light">Date:</td>
                                        <td className="border-0 bg-light">
                                            <input
                                                type="date"
                                                value={orderDetails?.So_Date ? ISOString(orderDetails?.So_Date) : ''}
                                                onChange={e => setOrderDetails({ ...orderDetails, So_Date: e.target.value })}
                                                className="cus-inpt p-1 bg-light"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Created By:</td>
                                        <td className="border-0 bg-light">{storage.Name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Created Date:</td>
                                        <td className="border-0 bg-light">{LocalDateWithTime()}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Sales Person:</td>
                                        <td className="border-0 bg-light">
                                            <Select
                                                value={{ value: orderDetails?.Sales_Person_Id, label: orderDetails?.Sales_Person_Name }}
                                                onChange={(e) => setOrderDetails({ ...orderDetails, Sales_Person_Id: e.value, Sales_Person_Name: e.label })}
                                                options={[
                                                    { value: initialValue?.Sales_Person_Id, label: initialValue?.Sales_Person_Name },
                                                    ...salesPerson.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={"Sales Person Name"}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>

                {/* Customer Info */}

                <div className="p-3 bg-light rounded-3 mb-3 shadow-sm">
                    <h5 className="border-bottom">To:</h5>
                    <div className="row ">
                        <div className="col-md-6">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 bg-light">Retailer Name:</td>
                                        <td className="border-0 bg-light">
                                            <Select
                                                value={{ value: orderDetails?.Retailer_Id, label: orderDetails?.Retailer_Name }}
                                                onChange={(e) => setOrderDetails({ ...orderDetails, Retailer_Id: e.value, Retailer_Name: e.label })}
                                                options={[
                                                    ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={"Retailer Name"}
                                                maxMenuHeight={200}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Address:</td>
                                        <td className="border-0 bg-light">{storage.Name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Phone:</td>
                                        <td className="border-0 bg-light">{ }</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 bg-light">Q-Pay:</td>
                                        <td className="border-0 bg-light">{10}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Frequency Days:</td>
                                        <td className="border-0 bg-light">{20}</td>
                                    </tr>
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="d-flex align-items-end justify-content-end flex-wrap mb-3">
                    <select 
                        className="cus-inpt w-auto p-1 me-2" 
                        onChange={e => setOrderDetails({ ...orderDetails, GST_Inclusive: Number(e.target.value) })}
                    >
                        <option value={1}>Inclusive Tax</option>
                        <option value={0}>Exclusive Tax</option>
                    </select>
                    <select 
                        className="cus-inpt w-auto p-1 me-2" 
                        onChange={e => setOrderDetails({ ...orderDetails, IS_IGST: Number(e.target.value) })}
                    >
                        <option value={0}>GST</option>
                        <option value={1}>IGST</option>
                    </select>
                    {orderProducts.length > 0 && (
                        <InvoiceBillTemplate
                            orderDetails={orderDetails} orderProducts={orderProducts} postFun={postSaleOrder}
                        >
                            <Button
                                variant='outlined'
                                startIcon={<Visibility />}
                            >Preview</Button>
                        </InvoiceBillTemplate>
                    )}
                    <Button
                        onClick={() => setAddProductDialog(true)}
                        sx={{ ml: 1 }}
                        variant='outlined'
                        startIcon={<Add />}
                    >Add Product</Button>
                </div>

                <FilterableTable
                    dataArray={orderProducts}
                    columns={[
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => row?.Product?.Product_Name,
                            ColumnHeader: 'Product',
                            isVisible: 1,
                        },
                        {
                            Field_Name: 'UOM',
                            ColumnHeader: "Units",
                            Fied_Data: 'string',
                            isVisible: 1,
                            align: 'center',
                        },
                        {
                            Field_Name: 'Bill_Qty',
                            ColumnHeader: 'Quantity',
                            Fied_Data: 'string',
                            isVisible: 1,
                        },
                        {
                            Field_Name: 'Item_Rate',
                            ColumnHeader: "Rate",
                            Fied_Data: 'number',
                            isVisible: 1,
                        },
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => row?.Amount,
                            ColumnHeader: 'Amount',
                            isVisible: 1,
                        },
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                return (
                                    <>
                                        <IconButton
                                            onClick={() => {
                                                setProductDetails({
                                                    Item_Id: row.Item_Id,
                                                    ItemName: row?.Product?.Product_Name,
                                                    Bill_Qty: row.Bill_Qty,
                                                    Item_Rate: row.Item_Rate,
                                                    UOM: row.Product.UOM_Id,
                                                    Product: row.Product,
                                                    Group: row?.Product?.Pro_Group,
                                                    GroupID: row?.Product?.Product_Group,
                                                    Brand: row?.Product?.Brand_Name,
                                                    BrandID: row?.Product?.Brand,
                                                    Amount: row?.Amount
                                                });
                                                setAddProductDialog(true);
                                            }}
                                            size="small"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setOrderProducts(pre => pre.filter(obj => !isEqualNumber(obj.Item_Id, row.Item_Id)))
                                            }}
                                            color='error'
                                        >
                                            <Delete />
                                        </IconButton>
                                    </>
                                )
                            },
                            ColumnHeader: 'Action',
                            isVisible: 1,
                        },
                    ]}
                    EnableSerialNumber
                    CellSize="medium"
                />


                <p className="fa-15 mt-3 m-0">Narration</p>
                <textarea 
                    className="cus-inpt "
                    value={orderDetails.Narration}
                    onChange={e => setOrderDetails(pre => ({...pre, Narration: e.target.value}))} 
                />
            </div>

            <Dialog
                open={addProductDialog}
                onClose={closeAddProduct}
                maxWidth='sm' fullWidth
            >
                <DialogTitle className="border-bottom">
                    <span>Add Products Details</span>
                </DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    if (productDetails.Item_Id && productDetails.Bill_Qty && productDetails.Item_Rate) {
                        handleProductInputChange(
                            productDetails.Item_Id,
                            productDetails.Bill_Qty,
                            productDetails.Item_Rate,
                            productDetails.Product,
                            productDetails.UOM
                        );
                        closeAddProduct();
                    } else {
                        toast.warn(!productDetails.Item_Id ? 'Select Product' : !productDetails.Bill_Qty ? 'Enter Quantity' : 'Enter Rate or Amount');
                    }
                }}>
                    <DialogContent>
                        <div className="row pb-5">
                            <div className="col-6 p-2">
                                <label>Brand</label>
                                <Select
                                    value={{ value: productDetails.BrandID, label: productDetails.Brand }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, BrandID: e.value, Brand: e.label }))}
                                    options={[
                                        { value: '', label: 'ALL' },
                                        ...productBrand.map(obj => ({ value: obj?.Brand, label: obj?.Brand_Name }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Brand"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, GroupID: e.value, Group: e.label }))}
                                    options={[
                                        { value: '', label: 'ALL' },
                                        ...productGroup.map(obj => ({ value: obj?.Product_Group, label: obj?.Pro_Group }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-12 p-2">
                                <label>Item Name <Required /></label>
                                <Select
                                    value={{ value: productDetails.Item_Id, label: productDetails.ItemName }}
                                    onChange={e => {
                                        const productInfo = products.find(pro => isEqualNumber(pro.Product_Id, e.value))
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Item_Id: e.value,
                                            ItemName: e.label,
                                            Product: productInfo ?? {},
                                            Group: productInfo.Pro_Group ?? pre.Group,
                                            GroupID: productInfo.Product_Group ?? pre.GroupID,
                                            Brand: productInfo.Brand_Name ?? pre.Brand,
                                            BrandID: productInfo.Brand ?? pre.BrandID,
                                            UOM: productInfo.UOM_Id ?? pre.UOM,
                                            Item_Rate: productInfo.Item_Rate ?? 0,
                                            Amount: 0,
                                            Bill_Qty: 0,
                                        }));
                                    }}
                                    options={[
                                        { value: '', label: 'ALL' },
                                        ...[
                                            ...products
                                                .filter(pro => productDetails.BrandID ? isEqualNumber(pro.Brand, productDetails.BrandID) : true)
                                                .filter(pro => productDetails.GroupID ? isEqualNumber(pro.Product_Group, productDetails.GroupID) : true)
                                        ].map(obj => ({ value: obj?.Product_Id, label: obj?.Product_Name }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Quantity <Required /></label>
                                <input
                                    type="number"
                                    value={productDetails.Bill_Qty ? productDetails.Bill_Qty : ''}
                                    onChange={e => {
                                        if (productDetails.Item_Rate) {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Amount: Multiplication(productDetails.Item_Rate, e.target.value),
                                                Bill_Qty: e.target.value,
                                            }))
                                        } else if (productDetails.Amount) {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Item_Rate: Division(pre.Amount, e.target.value),
                                                Bill_Qty: e.target.value,
                                            }))
                                        } else {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Bill_Qty: e.target.value,
                                            }));
                                        }
                                    }}
                                    className="cus-inpt"
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Rate </label>
                                <input
                                    type="number"
                                    value={productDetails.Item_Rate ? NumberFormat(productDetails.Item_Rate) : ''}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Item_Rate: e.target.value,
                                        Amount: pre.Bill_Qty ? Multiplication(e.target.value, pre.Bill_Qty) : pre.Amount
                                    }))}
                                    className="cus-inpt"
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>UOM</label>
                                <select
                                    value={productDetails.UOM}
                                    onChange={e => setProductDetails(pre => ({ ...pre, UOM: e.target.value }))}
                                    className="cus-inpt"
                                >
                                    <option value="">select</option>
                                    {productUOM.map((o, i) => (
                                        <option value={o.UOM_Id} key={i} >{o.Units}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 p-2">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    value={productDetails.Amount ? productDetails.Amount : ''}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Amount: e.target.value,
                                        Item_Rate: pre.Bill_Qty ? Division(e.target.value, pre.Bill_Qty) : pre.Item_Rate
                                    }))}
                                    className="cus-inpt"
                                />
                            </div>
                        </div>

                    </DialogContent>
                    <DialogActions className="d-flex justify-content-between align-items-center">
                        <Button onClick={() => setProductDetails(productInitialDetails)} type='button' startIcon={<ClearAll />}>Clear</Button>
                        <span>
                            <Button type="button" onClick={closeAddProduct}>cancel</Button>
                            <Button type='submit' variant="outlined">Add</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}


export default NewSaleOrderCreation;