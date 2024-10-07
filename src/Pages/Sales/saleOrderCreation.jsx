import React, { useState, useEffect } from "react";
import { Card, Box, CardContent, CardMedia, Button, Tab, CardActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from 'react-toastify';
import { isEqualNumber, isGraterNumber, isValidObject, ISOString } from "../../Components/functions";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import InvoiceBillTemplate from "./invoiceTemplate";
import { Visibility } from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';



const SaleOrderCreation = ({ editValues }) => {
    const storage = JSON.parse(localStorage.getItem('user'));

    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [tabValue, setTabValue] = useState('1');

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
        TaxType: 0,
    }

    const [orderDetails, setOrderDetails] = useState(initialValue)
    const [orderProducts, setOrderProducts] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        if (isValidObject(editValues)) {
            // console.log(editValues)
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
            setOrderProducts(editValues?.Products_List);
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
            address: `masters/products/grouped?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setSalePerson(data.data)
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    const handleStockInputChange = (productId, value, rate, obj) => {
        const productIndex = orderProducts.findIndex(item => item.Item_Id === productId);

        if (productIndex !== -1) {
            const updatedValues = [...orderProducts];
            updatedValues[productIndex].Bill_Qty = Number(value);
            updatedValues[productIndex].Item_Rate = Number(rate);
            updatedValues[productIndex] = { ...updatedValues[productIndex], Product: obj }
            console.log({ ...updatedValues[productIndex] })

            setOrderProducts(updatedValues);
        } else {
            setOrderProducts(prevValues => [...prevValues, { Item_Id: productId, Bill_Qty: Number(value), Item_Rate: Number(rate), Product: obj }]);
        }
    };

    const postSaleOrder = () => {
        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id && isGraterNumber(orderProducts[0]?.Bill_Qty, 0)) {

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
            })
                .catch(e => console.error(e))

        } else {
            if (orderProducts.length <= 0) {
                return toast.error('Enter any one product quantity')
            }
            if (!orderDetails?.Retailer_Id) {
                return toast.error('Select Retailer')
            }
            if (isEqualNumber(0, orderProducts[0]?.Bill_Qty)) {
                return toast.error('Enter any one product quantity')
            }
        }
    }

    // useEffect(() => console.log(orderProducts), [orderProducts])

    return (
        <>
            <div className="row">
                <div className="col-xl-3 col col-sm-4 mb-4">
                    <label>Date</label>
                    <input
                        type="date"
                        value={orderDetails?.So_Date ? new Date(orderDetails?.So_Date).toISOString().split('T')[0] : ''}
                        onChange={e => setOrderDetails({ ...orderDetails, So_Date: e.target.value })}
                        className="cus-inpt" required
                    />
                </div>

                <div className="col-xl-3 col-sm-4 mb-4">
                    <label>Retailer Name</label>
                    <Select
                        value={{ value: orderDetails?.Retailer_Id, label: orderDetails?.Retailer_Name }}
                        onChange={(e) => setOrderDetails({ ...orderDetails, Retailer_Id: e.value, Retailer_Name: e.label })}
                        options={[
                            ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Retailer Name"}
                    />

                </div>

                <div className="col-xl-3 col-sm-4 mb-4">
                    <label>Sales Person Name</label>
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
                </div>

                {/* <div className="col-xl-3 col-sm-4 mb-4">
                            <label>Tax Type</label>
                            <select className="cus-inpt" onChange={e => setOrderDetails({...orderDetails, TaxType: Number(e.target.value)})}>
                                <option value={0}>Inclusive Tax</option>
                                <option value={1}>Exclusive Tax</option>
                            </select>
                        </div> */}

            </div>

            <TabContext value={tabValue}>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        indicatorColor='transparant'
                        onChange={(e, n) => setTabValue(n)}
                        variant='scrollable'
                        scrollButtons="auto"
                    >
                        {products?.map((o, i) => (
                            <Tab
                                key={i}
                                sx={String(tabValue) === String(o?.Pro_Group_Id) ? { backgroundColor: '#c6d7eb' } : {}}
                                label={o?.Pro_Group}
                                value={String(o?.Pro_Group_Id)}
                            />
                        ))}
                    </TabList>
                </Box>

                {products?.map((o, i) => (
                    <TabPanel key={i} value={String(o?.Pro_Group_Id)} sx={{ p: 0 }}>
                        <div className="row">
                            {o?.GroupedProductArray?.map((oo, ii) => (
                                <div className="col-xl-4 col-lg-6 p-2" key={ii}>
                                    <Card sx={{ display: 'flex' }}>

                                        <CardMedia
                                            component="img"
                                            sx={{ width: 151 }}
                                            image={oo?.productImageUrl}
                                            alt="Pic"
                                        />

                                        <CardContent sx={{ flexGrow: '1' }}>
                                            <h6 className="fa-14">{oo?.Product_Name}</h6>
                                            <p className="fa-14">{oo?.Product_Description + " - " + oo?.UOM}</p>

                                            <div className="py-2">
                                                <label className="mb-2 w-100">Quantity</label>
                                                <input
                                                    style={{ maxWidth: 350 }}
                                                    type="number"
                                                    className="cus-inpt"
                                                    onChange={e =>
                                                        handleStockInputChange(
                                                            oo?.Product_Id,
                                                            e.target.value,
                                                            oo?.Item_Rate,
                                                            oo
                                                        )
                                                    }
                                                    value={(
                                                        orderProducts?.find(ooo => Number(ooo?.Item_Id) === Number(oo?.Product_Id))?.Bill_Qty || ''
                                                    )}
                                                />
                                            </div>
                                        </CardContent>

                                    </Card>
                                </div>
                            ))}
                        </div>
                    </TabPanel>
                ))}
            </TabContext>

            <CardActions className="d-flex align-items-center bg-light">

                <div className=" flex-grow-1">
                    <input
                        className="cus-inpt bg-white"
                        onChange={e => setOrderDetails({ ...orderDetails, Narration: e.target.value })}
                        value={orderDetails?.Narration}
                        placeholder="Discribtion"
                    />
                </div>
                <InvoiceBillTemplate orderDetails={orderDetails} orderProducts={orderProducts} postFun={postSaleOrder}>
                    <Button variant='contained' color='primary' startIcon={<Visibility />} >Preview</Button>
                </InvoiceBillTemplate>

            </CardActions>
        </>
    )
}


export default SaleOrderCreation;