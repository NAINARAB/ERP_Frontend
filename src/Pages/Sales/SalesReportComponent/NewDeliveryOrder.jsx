import React, { useState, useEffect, useMemo } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isGraterNumber, isValidObject, ISOString, getUniqueData,
    Multiplication, Division, NumberFormat, Subraction, numberToWords,
    RoundNumber, Addition
} from "../../../Components/functions";
import { Add, Clear, ClearAll, Delete, Edit, Save } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable from "../../../Components/filterableTable2";
import RequiredStar from "../../../Components/requiredStar";

import { calculateGSTDetails } from '../../../Components/taxCalculator';
const taxCalc = (method = 1, amount = 0, percentage = 0) => {
    switch (method) {
        case 0:
            return RoundNumber(amount * (percentage / 100));
        case 1:
            return RoundNumber(amount - (amount * (100 / (100 + percentage))));
        case 2:
            return 0;
        default:
            return 0;
    }
}

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const NewDeliveryOrder = ({ editValues, loadingOn, loadingOff, reload, switchScreen, editOn }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [baseData, setBaseData] = useState({
        products: [],
        branch: [],
        retailers: [],
        voucherType: [],
        uom: [],
        staff: [],
        staffType: [],
        salesPerson: [],
        brand: [],
    });
    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [productBrand, setProductBrand] = useState([]);
    const [productUOM, setProductUOM] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({});
    const [voucherType, setVoucherType] = useState([]);

    const [branch, setBranch] = useState([]);
    const initialValue = {
        Company_Id: storage?.Company_id,
        Do_Date: ISOString(),
        VoucherType: '',
        Retailer_Id: '',
        Retailer_Name: 'Select',
        Delivery_Status: 1,
        Delivery_Person_Id: 0,
        Payment_Ref_No: '',
        Delivery_Person_Name: '',
        Payment_Mode: 0,
        Payment_Status: 0,
        Branch_Id: storage?.BranchId,
        Narration: '',
        Created_by: storage?.UserId,
        Product_Array: [],
        So_No: editValues?.So_Id,
        GST_Inclusive: 1,
        IS_IGST: 0,
    }

    const productInitialDetails = {
        Item_Id: '',
        ItemName: 'Search Item',
        Bill_Qty: 0,
        Item_Rate: 0,
        UOM: '',
        Units: '',
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

    const isExclusiveBill = isEqualNumber(orderDetails.GST_Inclusive, 0);
    const isInclusive = isEqualNumber(orderDetails.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(orderDetails.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(orderDetails.IS_IGST, 1);
    const deliveryPerson = useState(0);
    // const [deliveryPersonList, setDeliveryPersonList] = useState([]);





    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                const { latitude, longitude } = position.coords;

                setOrderDetails(pre => ({
                    ...pre,
                    Delivery_Latitude: latitude,
                    Delivery_Longitude: longitude,
                }));
            } catch (error) {
                toast.warn('Unable to fetch location. Allow location access.');
            }
        };

        if (isValidObject(editValues)) {

            setOrderDetails(pre => ({
                ...pre,
                Do_Id: editValues?.Do_Id,
                Do_Date: editValues?.Do_Date ?? ISOString(),
                VoucherType: editValues?.Voucher_Type,
                Retailer_Id: editValues?.Retailer_Id,
                Retailer_Name: editValues?.Retailer_Name,
                Delivery_Status: editValues?.Delivery_Status,
                // Delivery_Person_Id: editValues?.Delivery_Person_Id,
                // Delivery_Person_Name: editValues?.Delivery_Person_Name,
                Payment_Status: editValues?.Payment_Status,
                Payment_Mode: editValues?.Payment_Mode,
                Branch_Id: editValues?.Branch_Id,
                Narration: editValues?.Narration,
                Created_by: editValues?.Created_by,
                Payment_Ref_No: editValues?.Payment_Ref_No,
                So_No: editValues?.So_Id,
                GST_Inclusive: editValues?.GST_Inclusive,
                IS_IGST: editValues?.IS_IGST,

            }));
            setOrderProducts(editValues?.Products_List?.map(pro => ({
                ...pro,
                Item_Id: pro.Item_Id ?? '',
                ItemName: pro?.Product_Name ?? "",
                Bill_Qty: pro?.Bill_Qty ?? 0,
                Item_Rate: pro?.Item_Rate ?? 0,
                UOM: pro?.Unit_Id ?? '',
                Units: pro?.Units ?? '',
                Product: {
                    ...pro,
                    Cgst_P: Number(findProductDetails(products, pro.Item_Id)?.Cgst_P) ?? 0,
                    Sgst_P: Number(findProductDetails(products, pro.Item_Id)?.Sgst_P) ?? 0,
                    Igst_P: Number(findProductDetails(products, pro.Item_Id)?.Igst_P) ?? 0,
                    Gst_P: Addition(findProductDetails(products, pro.Item_Id)?.Cgst_P, findProductDetails(products, pro.Item_Id)?.Sgst_P) ?? 0
                } ?? {},
                Group: 'Search Group',
                GroupID: '',
                Brand: 'Search Brand',
                BrandID: '',
                Amount: pro?.Amount ?? 0
            })));
            setIsEdit(true)
            if (!editValues?.Latitude || !editValues?.Longitude) {
                fetchLocation();
            }
        } else {
            setOrderDetails(initialValue);
            setOrderProducts([])
            setIsEdit(false)
        }
    }, [editValues, products])

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/uom`
        }).then(data => {
            if (data.success) {
                setProductUOM(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data);

                const uniqueBrand = getUniqueData(data.data, 'Brand', ['Brand_Name']);
                setProductBrand(uniqueBrand);

            } else {
                setProducts([]);
                setProductBrand([]);
            }
        }).catch(e => console.error(e))


        // fetchLink({
        //     address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        // }).then(data => {
        //     if (data.success) {
        //         setDeliveryPersonList(data.data);
        //     }
        // }).catch(e => console.error(e));


        fetchLink({
            address: `masters/company?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setCompanyInfo(data?.data[0] ? data?.data[0] : {})
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `purchase/voucherType`
        }).then(data => {
            if (data.success) {
                setVoucherType(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/branch/dropDown`
        }).then(data => {
            if (data.success) {
                setBranch(data.data)
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    const handleProductInputChange = (productId, value, rate, obj, UOM_Id, Units) => {
        const productIndex = orderProducts.findIndex(item => isEqualNumber(item.Item_Id, productId));

        if (productIndex !== -1) {
            const updatedValues = [...orderProducts];
            updatedValues[productIndex].Bill_Qty = Number(value);
            updatedValues[productIndex].Item_Rate = Number(rate);
            updatedValues[productIndex].UOM = UOM_Id;
            updatedValues[productIndex].Units = Units;
            updatedValues[productIndex].Amount = Multiplication(value, rate);
            updatedValues[productIndex] = { ...updatedValues[productIndex], Product: obj }

            setOrderProducts(updatedValues);
        } else {
            setOrderProducts(prevValues => [...prevValues, {
                Item_Id: productId,
                Bill_Qty: Number(value),
                Item_Rate: Number(rate),
                UOM: UOM_Id,
                Units: Units,
                Amount: Multiplication(value, rate),
                Product: obj
            }]);
        }
    };



    const postSaleOrder = () => {
        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id) {
            loadingOn();
          
            fetchLink({
                address: `delivery/deliveryOrder`,
                method: (isEdit && !editOn) ? 'PUT' : 'POST',

                bodyData: {
                    ...orderDetails,
                    Product_Array: orderProducts.filter(o => isGraterNumber(o?.Bill_Qty, 0)),
                    Delivery_Person_Id: deliveryPerson ?? Number(orderDetails?.Delivery_Person_Id) ?? 0,
                    Payment_Status: (orderDetails?.Payment_Status) ? Number(orderDetails?.Payment_Status) : 1,
                    Payment_Ref_No: orderDetails?.Payment_Ref_No,
                    Delivery_Status: (orderDetails?.Delivery_Status) ? Number(orderDetails?.Delivery_Status) : 1,
                    Payment_Mode: (orderDetails?.Payment_Mode) ? Number(orderDetails?.Payment_Mode) : 1
                }

            }).then(data => {

                if (data.success) {
                    toast.success(data?.message);

                    setOrderDetails(initialValue);
                    setOrderProducts([])
                    reload()
                } else {
                    toast.error(data?.message)
                }
            }).catch(e => console.error(e)).finally(() => loadingOff())

        } else {
            if (orderProducts.length <= 0) {
                return toast.error('Enter any one product quantity')
            }
            if (!orderDetails?.Retailer_Id) {
                toast.error('Select Retailer')
                return toast.error('Select Retailer')
            }
        }
    }

    const closeAddProduct = () => {
        setAddProductDialog(false);
        setProductDetails(productInitialDetails);
    }

    const Total_Invoice_value = useMemo(() => {
        return orderProducts.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return Addition(acc, Amount);

            const product = findProductDetails(baseData.products, item.Item_Id);
            const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;

            if (isInclusive) {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'remove').with_tax);
            } else {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'add').with_tax);
            }
        }, 0)
    }, [orderProducts, isNotTaxableBill, baseData.products, IS_IGST, isInclusive])

    const totalValueBeforeTax = useMemo(() => {
        return orderProducts.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return {
                TotalValue: Addition(acc.TotalValue, Amount),
                TotalTax: 0
            }

            const product = findProductDetails(baseData.products, item.Item_Id);
            const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;

            const taxInfo = calculateGSTDetails(Amount, gstPercentage, isInclusive ? 'remove' : 'add');
            const TotalValue = Addition(acc.TotalValue, taxInfo.without_tax);
            const TotalTax = Addition(acc.TotalTax, taxInfo.tax_amount);

            return {
                TotalValue, TotalTax
            };
        }, {
            TotalValue: 0,
            TotalTax: 0
        });
    }, [orderProducts, isNotTaxableBill, baseData.products, IS_IGST, isInclusive])

    useEffect(() => {
        setOrderProducts(pre => pre?.map(pro => ({
            ...pro,
            Amount: Multiplication(pro?.Item_Rate, pro?.Bill_Qty)
        })));
    }, [orderDetails.GST_Inclusive])

    useEffect(() => {
        setOrderProducts(pre => pre?.map(pro => ({
            ...pro,
            Amount: Multiplication(pro?.Item_Rate, pro?.Bill_Qty)
        })));
    }, [orderDetails.GST_Inclusive])

    // const handleDeliveryPersonChange = (selectedOption) => {

    //     setDeliveryPerson(selectedOption ? { UserId: selectedOption.value, Name: selectedOption.label } : null);
    // };

    return (
        <>
            {editOn && (
                <>
                    <h6 className="fa-18 m-0 p-3 py-2 d-flex align-items-center justify-content-between">Create Delivery Order</h6>
                </>
            )}

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
                                                value={orderDetails?.Do_Date ? ISOString(orderDetails?.Do_Date) : ''}
                                                onChange={e => setOrderDetails({ ...orderDetails, Do_Date: e.target.value })}
                                                className="cus-inpt p-1"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border-0 bg-light">Invoice Type:</td>
                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, GST_Inclusive: Number(e.target.value) })}
                                                value={orderDetails.GST_Inclusive}
                                            >
                                                <option value={1}>Inclusive Tax</option>
                                                <option value={0}>Exclusive Tax</option>
                                                <option value={2}>Not Taxable</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Tax Type:</td>
                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, IS_IGST: Number(e.target.value) })}
                                                value={orderDetails.IS_IGST}
                                            >
                                                <option value='0'>GST</option>
                                                <option value='1'>IGST</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Voucher Type <span style={{ color: "red" }}>*</span></td>

                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1 "
                                                onChange={e => setOrderDetails({
                                                    ...orderDetails,
                                                    VoucherType: e.target.value
                                                })}

                                                value={orderDetails.VoucherType}
                                            >

                                                <option value='' disabled>select voucher</option>
                                                {voucherType.map((vou, ind) => (
                                                    <option
                                                        value={vou.Vocher_Type_Id}
                                                        key={ind}
                                                    >
                                                        {vou.Voucher_Type}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Branch <span style={{ color: "red" }}>*</span></td>

                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Branch_Id: Number(e.target.value) })}
                                                value={orderDetails.Branch_Id}
                                            >
                                                <option value='' disabled>select Branch</option>
                                                {branch.map((branch, ind) => (
                                                    <option value={branch.BranchId} key={ind}>{branch.BranchName}</option>
                                                ))}
                                            </select>
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
                                                    { value: '', label: 'select', isDisabled: true },
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
                                    <tr>
                                        <td className="border-0 bg-light">Delivery_Status:</td>
                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Delivery_Status: e.target.value })}
                                                value={orderDetails.Delivery_Status ? orderDetails.Delivery_Status : 1}
                                            >
                                                <option value={5}>Pending</option>

                                                <option value={7}>Delivered</option>
                                                <option value={6}>Return</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Payment_Mode:</td>
                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Payment_Mode: e.target.value })}
                                                value={orderDetails.Payment_Mode || 0}
                                            >
                                                <option value={0}></option>
                                                <option value={1}>Cash</option>
                                                <option value={3}>QR-Pay</option>
                                                <option value={2}>G-Pay</option>
                                            </select>
                                        </td>
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





                                    <tr>
                                        <td className="border-0 bg-light">Payment_Status:</td>
                                        <td className="border-0 bg-light">
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Payment_Status: Number(e.target.value) })}
                                                value={orderDetails.Payment_Status}
                                            >
                                                <option value={1}>Pending</option>

                                                <option value={3}>Complete</option>
                                            </select>
                                        </td>
                                    </tr>
                                    {/* <tr>
                                        <td className="border-0 bg-light">Delivery Person Name:</td>
                                        <td className="border-0 bg-light">
                                            <Select
                                                value={
                                                    deliveryPerson
                                                        ? { value: deliveryPerson.UserId, label: deliveryPerson.Name }
                                                        : { value: orderDetails?.Delivery_Person_Id, label: orderDetails?.Delivery_Person_Name }
                                                }
                                                onChange={handleDeliveryPersonChange}
                                                options={[
                                                    { value: '', label: 'Select', isDisabled: true },
                                                    ...deliveryPersonList.map((obj) => ({
                                                        value: obj.UserId,
                                                        label: obj.Name,
                                                    })),
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={
                                                    deliveryPerson
                                                        ? deliveryPerson.Name
                                                        : 'Sales Person Name'
                                                }
                                            />
                                        </td>
                                    </tr> */}


                                    <tr>
                                        <td className="border-0 bg-light">Payment Reference No:</td>
                                        <td className="border-0 bg-light">
                                            <input
                                                type="text"
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Payment_Ref_No: e.target.value })}
                                                value={orderDetails?.Payment_Ref_No}  // Default to empty string if no value available
                                                placeholder="Enter Payment Reference Number"
                                            />
                                        </td>
                                    </tr>


                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                {/* Actions */}
                <div className="d-flex align-items-end justify-content-end flex-wrap mb-3">

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
                            isCustomCell: true,
                            Cell: ({ row }) => row?.Product?.HSN_Code,
                            ColumnHeader: 'HSN Code',
                            isVisible: 1,
                        },
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => row?.Bill_Qty + (row?.Units ?? ''),
                            ColumnHeader: 'Quantity',
                            isVisible: 1,
                            align: 'center'
                        },
                        {
                            Field_Name: 'Item_Rate',
                            ColumnHeader: "Rate",
                            Fied_Data: 'number',
                            isVisible: 1,
                            align: 'right'
                        },
                        {
                            ColumnHeader: 'Taxable Amount',
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const percentage = (
                                    IS_IGST ? row?.Product?.Igst_P : Addition(row?.Product?.Cgst_P, row?.Product?.Sgst_P)) ?? 0;
                                const amount = row.Amount ?? 0;
                                const tax = taxCalc(orderDetails.GST_Inclusive, amount, percentage);
                                return NumberFormat(
                                    isInclusive ? (amount - tax) : amount
                                )
                            },
                            isVisible: 1,
                            align: 'right'
                        },
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const percentage = (
                                    IS_IGST ? row?.Product?.Igst_P : Addition(row?.Product?.Cgst_P, row?.Product?.Sgst_P)) ?? 0;
                                const amount = row.Amount ?? 0;
                                return NumberFormat(
                                    taxCalc(orderDetails.GST_Inclusive, amount, percentage)
                                ) + ' (' + percentage + '%)'
                            },
                            ColumnHeader: 'Tax',
                            isVisible: 1,
                            align: 'right'
                        },
                        {
                            ColumnHeader: 'Amount',
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const percentage = (
                                    IS_IGST
                                        ? row?.Product?.Igst_P
                                        : Addition(row?.Product?.Cgst_P, row?.Product?.Sgst_P)
                                ) ?? 0;
                                const amount = row.Amount ?? 0;
                                const tax = taxCalc(orderDetails.GST_Inclusive, amount, percentage)
                                return NumberFormat(
                                    isEqualNumber(orderDetails.GST_Inclusive, 1) ? amount : (amount + tax)
                                )
                            },
                            isVisible: 1,
                            align: 'right'
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
                    CellSize="small"
                    disablePagination={true}
                />


                {orderProducts.length > 0 && (
                    <div className="d-flex justify-content-end py-2">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="border p-2" rowSpan={isEqualNumber(orderDetails.IS_IGST, 1) ? 4 : 5}>
                                        Total in words: {numberToWords(parseInt(Total_Invoice_value))}
                                    </td>
                                    <td className="border p-2">Total Taxable Amount</td>
                                    <td className="border p-2">
                                        {NumberFormat(totalValueBeforeTax.TotalValue)}
                                    </td>
                                </tr>
                                {!isEqualNumber(orderDetails.IS_IGST, 1) ? (
                                    <>
                                        <tr>
                                            <td className="border p-2">CGST</td>
                                            <td className="border p-2">
                                                {NumberFormat(totalValueBeforeTax.TotalTax / 2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border p-2">SGST</td>
                                            <td className="border p-2">
                                                {NumberFormat(totalValueBeforeTax.TotalTax / 2)}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td className="border p-2">IGST</td>
                                        <td className="border p-2">
                                            {NumberFormat(totalValueBeforeTax.TotalTax)}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    {/* {
                                            Total_Invoice_value}
                                            {
                                                totalValueBeforeTax}
                                                 { totalValueBeforeTax.TotalTax
                                             }
                                        */}

                                    <td className="border p-2">Round Off</td>
                                    <td className="border p-2">
                                        {RoundNumber(Math.round(Total_Invoice_value) - Total_Invoice_value)}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border p-2">Total</td>
                                    <td className="border p-2">
                                        {NumberFormat(Math.round(Total_Invoice_value))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}


                <p className="fa-15 mt-3 m-0">Narration</p>
                <textarea
                    className="cus-inpt "
                    value={orderDetails.Narration}
                    onChange={e => setOrderDetails(pre => ({ ...pre, Narration: e.target.value }))}
                />

                <div className="d-flex justify-content-end">
                    <Button
                        variant='outlined'
                        startIcon={<Clear />}
                        onClick={switchScreen}
                    >
                        {'cancel'}
                    </Button>
                    <Button
                        onClick={postSaleOrder}
                        sx={{ ml: 1 }}
                        variant='outlined'
                        color='success'
                        startIcon={<Save />}
                        disabled={orderProducts?.length === 0 || !orderDetails?.Retailer_Id}
                    >Save</Button>
                </div>
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
                            productDetails.UOM,
                            productDetails.Units,
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
                                        { value: '', label: 'select', isDisabled: true },
                                        ...productBrand.map(obj => ({ value: obj?.Brand, label: obj?.Brand_Name }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Brand"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            {/* <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, GroupID: e.value, Group: e.label }))}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...productGroup.map(obj => ({ value: obj?.Product_Group, label: obj?.Pro_Group }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                />
                            </div> */}
                            <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) =>
                                        setProductDetails((pre) => ({ ...pre, GroupID: e.value, Group: e.label }))
                                    }
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...products
                                            .filter(
                                                (pro) =>
                                                    productDetails.BrandID
                                                        ? isEqualNumber(pro.Brand, productDetails.BrandID)
                                                        : true
                                            )
                                            .reduce((acc, pro) => {
                                                if (
                                                    !acc.some((grp) => grp.value === pro.Product_Group)
                                                ) {
                                                    acc.push({
                                                        value: pro.Product_Group,
                                                        label: pro.Pro_Group,
                                                    });
                                                }
                                                return acc;
                                            }, []),
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-12 p-2">
                                <label>Item Name <RequiredStar /></label>
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
                                            Units: productInfo.Units ?? pre.Units,
                                            Item_Rate: productInfo.Item_Rate ?? 0,
                                            Amount: 0,
                                            Bill_Qty: 0,
                                        }));
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...[
                                            ...products
                                                .filter(pro => productDetails.BrandID ? isEqualNumber(pro.Brand, productDetails.BrandID) : true)
                                                .filter(pro => productDetails.GroupID ? isEqualNumber(pro.Product_Group, productDetails.GroupID) : true)
                                        ].map(obj => ({
                                            value: obj?.Product_Id,
                                            label: obj?.Product_Name,
                                            isDisabled: (
                                                orderProducts.findIndex(ind => isEqualNumber(
                                                    ind?.Item_Id, obj?.Product_Id
                                                ))
                                            ) === -1 ? false : true
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Quantity <RequiredStar /></label>
                                <input
                                    type="input"
                                    required
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
                                    min={1}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Rate </label>
                                <input
                                    type="float"
                                    value={productDetails.Item_Rate ? (productDetails.Item_Rate) : ''}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Item_Rate: e.target.value,
                                        Amount: pre.Bill_Qty ? Multiplication(e.target.value, pre.Bill_Qty) : pre.Amount
                                    }))}
                                    min={1}
                                    className="cus-inpt"
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>UOM</label>
                                <select
                                    value={productDetails.UOM}
                                    onChange={e => {
                                        const selectedIndex = e.target.selectedIndex;
                                        const label = e.target.options[selectedIndex].text;
                                        const value = e.target.value;
                                        setProductDetails(pre => ({ ...pre, UOM: value, Units: label }));
                                    }}
                                    className="cus-inpt"
                                >
                                    <option value="" disabled>select</option>
                                    {productUOM.map((o, i) => (
                                        <option value={o.Unit_Id} key={i} >{o.Units}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 p-2">
                                <label>Amount</label>
                                <input
                                    type="input"
                                    value={productDetails.Amount ? productDetails.Amount : ''}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Amount: e.target.value,
                                        Item_Rate: pre.Bill_Qty ? Division(e.target.value, pre.Bill_Qty) : pre.Item_Rate
                                    }))}
                                    className="cus-inpt"
                                    min={1}
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


export default NewDeliveryOrder;