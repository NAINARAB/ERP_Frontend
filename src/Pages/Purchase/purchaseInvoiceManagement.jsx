import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Search } from "@mui/icons-material";
import { checkIsNumber, Division, isEqualNumber, ISOString, isValidJSON, Multiplication, NumberFormat, numberToWords, RoundNumber, Subraction } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import RequiredStar from "../../Components/requiredStar";
import { toast } from "react-toastify";

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

const PurchaseInvoiceManagement = ({ loadingOn, loadingOff }) => {
    // const user = localStorage.getItem('user');
    // const storage = isValidJSON(user) ? JSON.parse(user) : {};

    const initialInvoiceValue = {
        PIN_Id: '',
        Po_Inv_No: '',
        Ref_Po_Inv_No: '',
        Branch_Id: '',
        Po_Inv_Date: ISOString(),
        Retailer_Id: '',
        GST_Inclusive: 2,
        IS_IGST: 0,
        Narration: '',
        isConverted: '',
        CSGT_Total: 0,
        SGST_Total: 0,
        IGST_Total: 0,
        Round_off: 0,
        Total_Before_Tax: 0,
        Total_Tax: 0,
        Total_Invoice_value: 0,
        Cancel_status: 0,
        Created_by: 0,
        Altered_by: 0,
        Created_on: '',
        Alterd_on: '',
        Trans_Type: '',
        Alter_Id: '',
        Approved_By: '',
        Approve_Status: '',
    }

    const itemsRowDetails = {
        POI_St_Id: '',
        DeliveryId: '',
        OrderId: '',
        PIN_Id: '',
        Po_Inv_Date: '',
        S_No: '',
        Item_Id: '',
        Bill_Qty: 0,
        Item_Rate: 0,
        Weight: 0,
        Free_Qty: 0,
        Unit_Id: '',
        Unit_Name: '',
        Taxable_Rate: 0,
        Amount: 0,
        Total_Qty: 0,
        Taxble: 0,
        HSN_Code: '',
        Taxable_Amount: 0,
        Tax_Rate: 0,
        Cgst: 0,
        Cgst_Amo: 0,
        Sgst: 0,
        Sgst_Amo: 0,
        Igst: 0,
        Igst_Amo: 0,
        Final_Amo: 0,
        Created_on: '',
    }
    const [vendorList, setVendorList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [productUOM, setProductUOM] = useState([]);
    const [products, setProducts] = useState([]);
    const [baseDetails, setBaseDetails] = useState({
        vendor: 'search',
        vendorId: '',
    });
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState(initialInvoiceValue);
    const [selectedItems, setSelectedItems] = useState([]);
    const [dialogs, setDialogs] = useState({
        nextStep: false,
    });
    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';
    const isExclusiveBill = isEqualNumber(invoiceDetails?.GST_Inclusive, 0);
    const isInclusive = isEqualNumber(invoiceDetails?.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceDetails?.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceDetails?.IS_IGST, 1);

    const Total_Invoice_value = selectedItems.reduce((o, item) => {
        const itemRate = RoundNumber(item?.Item_Rate);
        const billQty = parseInt(item?.Bill_Qty);
        const Amount = Multiplication(billQty, itemRate);

        if (isInclusive || isNotTaxableBill) {
            return o += Number(Amount);
        }

        if (isExclusiveBill) {
            const product = findProductDetails(products, item.Item_Id);
            const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;
            const tax = taxCalc(0, itemRate, gstPercentage)
            return o += (Number(Amount) + (tax * billQty));
        }
    }, 0);

    const totalValueBeforeTax = selectedItems.reduce((acc, item) => {
        const itemRate = RoundNumber(item?.Item_Rate);
        const billQty = parseInt(item?.Bill_Qty) || 0;

        if (isNotTaxableBill) {
            acc.TotalValue += Multiplication(billQty, itemRate);
            return acc;
        }

        const product = findProductDetails(products, item.Item_Id);
        const gstPercentage = IS_IGST ? product.Igst_P : product.Gst_P;

        if (isInclusive) {
            const itemTax = taxCalc(1, itemRate, gstPercentage);
            const basePrice = Subraction(itemRate, itemTax);
            acc.TotalTax += Multiplication(billQty, itemTax);
            acc.TotalValue += Multiplication(billQty, basePrice);
        }
        if (isExclusiveBill) {
            const itemTax = taxCalc(0, itemRate, gstPercentage);
            acc.TotalTax += Multiplication(billQty, itemTax);
            acc.TotalValue += Multiplication(billQty, itemRate);
        }

        return acc;
    }, {
        TotalValue: 0,
        TotalTax: 0
    });

    useState(() => {
        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                setVendorList(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/branch/dropDown`
        }).then(data => {
            if (data.success) setBranches(data.data);
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/uom`
        }).then(data => {
            if (data.success) {
                setProductUOM(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products`
        }).then(data => {
            if (data.success) setProducts(data.data);
            else setProducts([]);
        }).catch(e => console.error(e))

    }, [])

    // useEffect(() => {
    //     setInvoiceDetails(pre => ({
    //         ...pre,
    //         Total_Invoice_value: Total_Invoice_value,
    //         Total_Before_Tax: totalValueBeforeTax.TotalValue,
    //         Total_Tax: totalValueBeforeTax.TotalTax,
    //         CSGT_Total: IS_IGST ? 0 : totalValueBeforeTax.TotalTax / 2,
    //         SGST_Total: IS_IGST ? 0 : totalValueBeforeTax.TotalTax / 2,
    //         IGST_Total: IS_IGST ? totalValueBeforeTax.TotalTax : 0,
    //         Round_off: Total_Invoice_value - (
    //             RoundNumber(totalValueBeforeTax.TotalValue + totalValueBeforeTax.TotalTax)
    //         )
    //     }))
    // }, [totalValueBeforeTax, Total_Invoice_value])

    // useState(() => {
    //     const isInclusive = isEqualNumber(invoiceDetails.GST_Inclusive, 1);
    //     const isIgst = isEqualNumber(invoiceDetails?.IS_IGST, 1);
    //     const isNotTaxableBill = isEqualNumber(invoiceDetails?.GST_Inclusive, 2);
    //     setSelectedItems(pre => {
    //         const preItems = [...pre];
    //         return preItems.map(item => {
    //             const productDetails = findProductDetails(products, item.Item_Id)
    //             const gstPercentage = isIgst ? productDetails.Igst_P : productDetails.Gst_P;
    //             const Taxble = gstPercentage > 0 ? 1 : 0;
    //             const Bill_Qty = Number(item.Bill_Qty);
    //             const Item_Rate = RoundNumber(item.Item_Rate ?? 0);
    //             const Amount = Bill_Qty * Item_Rate;
    //             const tax = taxCalc(invoiceDetails.GST_Inclusive, Amount, gstPercentage);
    //             const itemTaxRate = taxCalc(invoiceDetails.GST_Inclusive, Item_Rate, gstPercentage);
    //             const Taxable_Rate = RoundNumber(Subraction(Item_Rate, itemTaxRate));

    //             const Taxable_Amount = isInclusive ? (Amount - tax) : Amount;
    //             const Final_Amo = isInclusive ? Amount : (Amount + tax);
    //             const Cgst_Amo = !isIgst ? (taxCalc(invoiceDetails.GST_Inclusive, Amount, gstPercentage) / 2) : 0;
    //             const Igst_Amo = isIgst ? taxCalc(invoiceDetails.GST_Inclusive, Amount, gstPercentage) : 0;
    //             return Object.fromEntries(
    //                 Object.entries(itemsRowDetails).map(([key, value]) => {
    //                     switch (key) {
    //                         case 'Taxable_Rate': return [key, Number(Taxable_Rate)]
    //                         case 'Taxble': return [key, Taxble]
    //                         case 'Taxable_Amount': return [key, Taxable_Amount]
    //                         case 'Tax_Rate': return [key, gstPercentage]
    //                         case 'Cgst': return [key, (gstPercentage / 2) ?? 0]
    //                         case 'Cgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
    //                         case 'Sgst': return [key, (gstPercentage / 2) ?? 0]
    //                         case 'Sgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
    //                         case 'Igst': return [key, (gstPercentage / 2) ?? 0]
    //                         case 'Igst_Amo': return [key, isNotTaxableBill ? 0 : Igst_Amo]
    //                         case 'Final_Amo': return [key, Final_Amo]

    //                         default: return [key, value]
    //                     }
    //                 })
    //             )
    //         })
    //     })
    // }, [invoiceDetails.GST_Inclusive, invoiceDetails.IS_IGST, selectedItems, products])

    const getVendorInfo = (vendor) => {
        if (loadingOn) loadingOn();
        setSelectedItems([]);
        setInvoiceDetails(pre => ({
            ...pre,
            Retailer_Id: vendor
        }))
        fetchLink({
            // address: `dataEntry/purchaseOrderEntry/delivery/partyBased?VendorId=${baseDetails?.vendorId}`
            address: `dataEntry/purchaseOrderEntry/delivery/partyBased?VendorId=${vendor}`
        }).then(data => {
            if (data.success) setDeliveryDetails(data.data)
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff()
        })
    }

    const changeItems = (itemDetail, deleteOption) => {
        setSelectedItems((prev) => {
            const preItems = prev.filter(o => !isEqualNumber(o?.OrderId, itemDetail?.OrderId));
            if (deleteOption) {
                return preItems;
            } else {
                const currentOrders = deliveryDetails.filter(item => isEqualNumber(item.OrderId, itemDetail.OrderId));

                const reStruc = currentOrders.map(item => {
                    const productDetails = findProductDetails(products, item.ItemId)
                    const gstPercentage = IS_IGST ? productDetails.Igst_P : productDetails.Gst_P;
                    const Taxble = gstPercentage > 0 ? 1 : 0;
                    const Bill_Qty = Number(item.Quantity);
                    const Item_Rate = RoundNumber(item.BilledRate);
                    const Amount = Bill_Qty * Item_Rate;
                    const tax = taxCalc(invoiceDetails.GST_Inclusive, Amount, gstPercentage);
                    const itemTaxRate = taxCalc(invoiceDetails.GST_Inclusive, Item_Rate, gstPercentage);
                    const Taxable_Rate = RoundNumber(Subraction(Item_Rate, itemTaxRate));

                    const Taxable_Amount = isInclusive ? (Amount - tax) : Amount;
                    const Final_Amo = isInclusive ? Amount : (Amount + tax);
                    const Cgst_Amo = !IS_IGST ? (taxCalc(invoiceDetails.GST_Inclusive, Amount, gstPercentage) / 2) : 0;
                    const Igst_Amo = IS_IGST ? taxCalc(invoiceDetails.GST_Inclusive, Amount, gstPercentage) : 0;
                    return Object.fromEntries(
                        Object.entries(itemsRowDetails).map(([key, value]) => {
                            switch (key) {
                                case 'DeliveryId': return [key, Number(item?.Id)]
                                case 'OrderId': return [key, Number(item?.OrderId)]
                                case 'PIN_Id': return [key, Number(item?.OrderId)]
                                case 'Po_Inv_Date': return [key, invoiceDetails?.Po_Inv_Date]
                                case 'Item_Id': return [key, Number(item?.ItemId)]
                                case 'Bill_Qty': return [key, Bill_Qty]
                                case 'Item_Rate': return [key, Number(item?.BilledRate)]
                                case 'Weight': return [key, Number(item?.Weight)]
                                case 'Taxable_Rate': return [key, Number(Taxable_Rate)]
                                case 'Amount': return [key, Amount]
                                case 'Total_Qty': return [key, Bill_Qty]
                                case 'Taxble': return [key, Taxble]
                                case 'HSN_Code': return [key, productDetails.HSN_Code]
                                case 'Taxable_Amount': return [key, Taxable_Amount]
                                case 'Tax_Rate': return [key, gstPercentage]
                                case 'Cgst': return [key, (gstPercentage / 2) ?? 0]
                                case 'Cgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
                                case 'Sgst': return [key, (gstPercentage / 2) ?? 0]
                                case 'Sgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
                                case 'Igst': return [key, (gstPercentage / 2) ?? 0]
                                case 'Igst_Amo': return [key, isNotTaxableBill ? 0 : Igst_Amo]
                                case 'Final_Amo': return [key, Final_Amo]

                                default: return [key, value]
                            }
                        })
                    )
                })
                return preItems.concat(reStruc);
            }
        });
    };

    const closeDialogs = () => {
        setDialogs({
            nextStep: false,
        })
    }

    const changeSelectedObjects = (row, key, value) => {
        setSelectedItems((prev) => {
            return prev.map(item => {
                if (item.DeliveryId === row.DeliveryId) {
                    switch (key) {
                        case 'Bill_Qty': {
                            const updatedValue = parseFloat(value || 0);
                            const newItem = { ...item, Bill_Qty: updatedValue };
                            if (item.Item_Rate) {
                                newItem.Amount = Multiplication(item.Item_Rate, updatedValue);
                            } else if (item.Amount) {
                                newItem.Item_Rate = Division(item.Amount, updatedValue);
                            }
                            return newItem;
                        }
                        case 'Item_Rate': {
                            const updatedValue = parseFloat(value || 0);
                            const newItem = { ...item, Item_Rate: updatedValue };
                            if (item.Bill_Qty) {
                                newItem.Amount = Multiplication(updatedValue, item.Bill_Qty);
                            }
                            return newItem;
                        }
                        case 'Amount': {
                            const updatedValue = parseFloat(value || 0);
                            const newItem = { ...item, Amount: updatedValue };
                            if (item.Bill_Qty) {
                                newItem.Item_Rate = Division(updatedValue, item.Bill_Qty);
                            }
                            return newItem;
                        }
                        default:
                            return { ...item, [key]: value };
                    }
                }
                return item;
            });
        });
    };

    const postOrder = () => {
        if (loadingOn) loadingOn();
        // checkIsNumber(invoiceDetails?.PIN_Id) ? 'PUT' : 
        fetchLink({
            address: 'purchase/purchaseOrder',
            method: 'POST',
            bodyData: {
                Product_Array: selectedItems,
                ...invoiceDetails
            }
        }).then(data => {
            if (data.success) {
                toast.success(data?.message || 'Saved');
                closeDialogs();
                setSelectedItems([]);
                setInvoiceDetails(initialInvoiceValue);
                setDeliveryDetails([])
            } else {
                toast.error(data?.message || 'Request Failed')
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    return (
        <>
            <Card>
                <div className="d-flex flex-wrap align-items-center border-bottom p-2">
                    <h5 className='flex-grow-1 m-0 ps-2'>Purchase Invoice Creation</h5>
                    {/* <Button variant='outlined'>back</Button> */}
                </div>
                <CardContent style={{ minHeight: 500 }}>
                    <label className="pe-2">Select Vendor For Invoice: </label>
                    <div className="d-flex align-self-stretch flex-wrap mb-2">
                        <span className="flex-grow-1" style={{ maxWidth: '50%' }}>
                            <Select
                                value={{ value: baseDetails.vendorId, label: baseDetails.vendor }}
                                onChange={e => setBaseDetails(pre => ({
                                    ...pre,
                                    vendorId: e.value,
                                    vendor: e.label
                                }))}
                                options={[
                                    { value: '', label: 'Search', isDisabled: true },
                                    ...vendorList.map(obj => ({
                                        value: obj?.Retailer_Id,
                                        label: obj?.Retailer_Name
                                    }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Select Vendor"}
                                maxMenuHeight={300}
                            />
                        </span>
                        <Button
                            variant="outlined"
                            className="mx-2"
                            disabled={!checkIsNumber(baseDetails.vendorId)}
                            // onClick={() => getVendorInfo(3440)}
                        onClick={() => getVendorInfo(baseDetails.vendorId)}
                        ><Search /></Button>
                    </div>

                    <FilterableTable
                        dataArray={deliveryDetails}
                        columns={[
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => {

                                    return (
                                        <div>
                                            <input
                                                className="form-check-input shadow-none pointer"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                checked={selectedItems.findIndex(o => isEqualNumber(o?.DeliveryId, row?.Id)) !== -1}
                                                onChange={() => {
                                                    if (selectedItems.findIndex(o => isEqualNumber(o?.DeliveryId, row?.Id)) !== -1) changeItems(row, true)
                                                    else changeItems(row)
                                                }}
                                            />
                                        </div>
                                    )
                                }
                            },
                            createCol('ArrivalDate', 'date'),
                            createCol('ItemName', 'string'),
                            createCol('BilledRate', 'string'),
                            createCol('Quantity', 'number'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Weight',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    row?.Weight ?? 0
                                ) + ' ' + row?.Units
                            },
                            createCol('PO_ID', 'string'),
                            createCol('Location', 'string'),
                        ]}
                        EnableSerialNumber
                        disablePagination
                        title={`Arrival Details of ${baseDetails.vendor}`}
                        maxHeightOption
                    />
                </CardContent>
                <CardActions className="d-flex justify-content-end flex-wrap">
                    <Button onClick={() => setSelectedItems([])}>clear all</Button>
                    <Button
                        variant="contained"
                        onClick={() => setDialogs(pre => ({ ...pre, nextStep: true }))}
                        disabled={selectedItems.length === 0}
                    >next</Button>
                </CardActions>
            </Card>

            <Dialog
                open={dialogs.nextStep}
                onClose={closeDialogs}
                fullScreen
            >
                <DialogTitle>Create Invoice</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    postOrder();
                }}>
                    <DialogContent className="table-responsive">
                        <div className="row">
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Vendor</label>
                                <input
                                    disabled={true}
                                    value={vendorList?.find(ven =>
                                        isEqualNumber(ven?.Retailer_Id, invoiceDetails?.Retailer_Id)
                                    )?.Retailer_Name ?? 'Not Mapped'}
                                    className={inputStyle}
                                />
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Branch <RequiredStar /></label>
                                <select
                                    className={inputStyle}
                                    value={invoiceDetails?.Branch_Id}
                                    required
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Branch_Id: e.target.value }))}
                                >
                                    <option value="">select</option>
                                    {branches.map((o, i) => (
                                        <option value={o?.BranchId} key={i}>{o?.BranchName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Date <RequiredStar /></label>
                                <input
                                    value={invoiceDetails?.Po_Inv_Date}
                                    type="date"
                                    required
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Inv_Date: e.target.value }))}
                                />
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Ref Number</label>
                                <input
                                    value={invoiceDetails?.Ref_Po_Inv_No}
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Ref_Po_Inv_No: e.target.value }))}
                                />
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>GST Type <RequiredStar /></label>
                                <select
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, GST_Inclusive: Number(e.target.value) }))}
                                    value={invoiceDetails.GST_Inclusive}
                                    required
                                >
                                    <option value={1}>Inclusive Tax</option>
                                    <option value={0}>Exclusive Tax</option>
                                    <option value={2}>Not Taxable</option>
                                </select>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Tax Type</label>
                                <select
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, IS_IGST: Number(e.target.value) }))}
                                    value={invoiceDetails.IS_IGST}
                                >
                                    <option value='0'>GST</option>
                                    <option value='1'>IGST</option>
                                </select>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <td className={tdStyle}>SNo</td>
                                        <td className={tdStyle}>Item</td>
                                        <td className={tdStyle}>Rate</td>
                                        <td className={tdStyle}>Quantity</td>
                                        <td className={tdStyle}>Unit</td>
                                        <td className={tdStyle}>Amount</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItems.map((row, i) => (
                                        <tr key={i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            <td className={tdStyle}>{findProductDetails(products, row.Item_Id)?.Product_Name ?? 'Not found'}</td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Item_Rate}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Item_Rate', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Bill_Qty}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Bill_Qty', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <select
                                                    value={row?.Unit_Id}
                                                    className={inputStyle}
                                                    onChange={e => {
                                                        const selectedIndex = e.target.selectedIndex;
                                                        const label = e.target.options[selectedIndex].text;
                                                        const value = e.target.value;
                                                        changeSelectedObjects(row, 'Unit_Id', value);
                                                        changeSelectedObjects(row, 'Unit_Name', label);
                                                    }}
                                                    required
                                                >
                                                    <option value="">select</option>
                                                    {productUOM.map((o, i) => (
                                                        <option value={o.Unit_Id} key={i} >{o.Units}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Amount}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Amount', e.target.value)}
                                                    required
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border p-2" rowSpan={isEqualNumber(invoiceDetails.IS_IGST, 1) ? 4 : 5}>
                                            Total in words: {numberToWords(parseInt(Total_Invoice_value))}
                                        </td>
                                        <td className="border p-2">Total Taxable Amount</td>
                                        <td className="border p-2">
                                            {NumberFormat(totalValueBeforeTax.TotalValue)}
                                        </td>
                                    </tr>
                                    {!IS_IGST ? (
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
                                        <td className="border p-2">Round Off</td>
                                        <td className="border p-2">
                                            {NumberFormat(
                                                Total_Invoice_value - (
                                                    totalValueBeforeTax.TotalValue + totalValueBeforeTax.TotalTax
                                                )
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2">Total</td>
                                        <td className="border p-2">
                                            {NumberFormat(Total_Invoice_value)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* <FilterableTable
                            dataArray={selectedItems}
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Item',
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        findProductDetails(products, row.Item_Id)?.Product_Name ?? 'Not found'
                                    )
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Rate',
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <input
                                            value={row?.Item_Rate}
                                            type="number"
                                            className={inputStyle}
                                            onChange={e => changeSelectedObjects(row, 'Item_Rate', e.target.value)}
                                            required
                                        />
                                    )
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Quantity',
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <input
                                            value={row?.Bill_Qty}
                                            type="number"
                                            className={inputStyle}
                                            onChange={e => changeSelectedObjects(row, 'Bill_Qty', e.target.value)}
                                            required
                                        />
                                    )
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Weight',
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <input
                                            value={row?.Weight}
                                            type="number"
                                            className={inputStyle}
                                            onChange={e => changeSelectedObjects(row, 'Weight', e.target.value)}
                                            required
                                        />
                                    )
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Unit',
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <select
                                            value={row?.Unit_Id}
                                            type="number"
                                            className={inputStyle}
                                            onChange={e => {
                                                const selectedIndex = e.target.selectedIndex;
                                                const label = e.target.options[selectedIndex].text;
                                                const value = e.target.value;
                                                changeSelectedObjects(row, 'Unit_Id', value);
                                                changeSelectedObjects(row, 'Unit_Name', label);
                                            }}
                                            required
                                        >
                                            <option value="">select</option>
                                            {productUOM.map((o, i) => (
                                                <option value={o.Unit_Id} key={i} >{o.Units}</option>
                                            ))}
                                        </select>
                                    )
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Amount',
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <input
                                            value={row?.Amount}
                                            type="number"
                                            className={inputStyle}
                                            onChange={e => changeSelectedObjects(row, 'Amount', e.target.value)}
                                            required
                                        />
                                    )
                                },
                            ]}
                            EnableSerialNumber
                        /> */}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialogs} type="button">back</Button>
                        <Button type='submit' variant="contained">submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default PurchaseInvoiceManagement;