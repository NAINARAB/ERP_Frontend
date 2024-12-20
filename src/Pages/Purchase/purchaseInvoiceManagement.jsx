import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Search } from "@mui/icons-material";
import { checkIsNumber, Division, isEqualNumber, ISOString, isValidJSON, isValidObject, Multiplication, NumberFormat, numberToWords, RoundNumber, Subraction } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import RequiredStar from "../../Components/requiredStar";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

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
    const user = localStorage.getItem('user');
    const storage = isValidJSON(user) ? JSON.parse(user) : {};
    const location = useLocation();
    const navigation = useNavigate();
    const stateDetails = location.state;

    const initialInvoiceValue = {
        PIN_Id: '',
        Po_Inv_No: '',
        Ref_Po_Inv_No: '',
        Branch_Id: '',
        Po_Inv_Date: ISOString(),
        Po_Entry_Date: ISOString(),
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
        Voucher_Type: '',
        Stock_Item_Ledger_Name: '',
        Created_by: storage.UserId,
        Altered_by: storage.UserId,
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
        Location_Id: '',
        Item_Id: '',
        Bill_Qty: 0,
        Item_Rate: 0,
        Bill_Alt_Qty: 0,
        Free_Qty: 0,
        Unit_Id: '',
        Unit_Name: '',
        Batch_No: '',
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
    const [voucherType, setVoucherType] = useState([]);
    const [stockItemLedgerName, setStockItemLedgerName] = useState([]);
    const [godownLocations, setGodownLocations] = useState([]);
    const [baseDetails, setBaseDetails] = useState({
        vendor: 'search',
        vendorId: '',
    });
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState(initialInvoiceValue);
    const [selectedItems, setSelectedItems] = useState([]);
    const [dialogs, setDialogs] = useState(false);
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

    useEffect(() => {
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

        fetchLink({
            address: `dataEntry/godownLocationMaster`
        }).then(data => {
            if (data.success) {
                setGodownLocations(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `purchase/voucherType`
        }).then(data => {
            if (data.success) {
                setVoucherType(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `purchase/stockItemLedgerName`
        }).then(data => {
            if (data.success) {
                setStockItemLedgerName(data.data);
            }
        }).catch(e => console.error(e));

    }, [])

    useEffect(() => {
        if (isValidObject(stateDetails) && Array.isArray(stateDetails?.orderInfo) && isValidObject(stateDetails?.invoiceInfo)) {
            const { invoiceInfo, orderInfo } = stateDetails;
            setInvoiceDetails(
                Object.fromEntries(
                    Object.entries(initialInvoiceValue).map(([key, value]) => {
                        if (key === 'Po_Inv_Date') return [key, invoiceInfo[key] ? ISOString(invoiceInfo[key]) : value]
                        if (key === 'Po_Entry_Date') return [key, invoiceInfo[key] ? ISOString(invoiceInfo[key]) : value]
                        return [key, invoiceInfo[key] ?? value]
                    })
                )
            );
            setSelectedItems(
                orderInfo.map(item => Object.fromEntries(
                    Object.entries(itemsRowDetails).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
            setDialogs(true)
        }
    }, [stateDetails])

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
                    const Bill_Qty = Number(item.Weight);
                    const Item_Rate = RoundNumber(item.BilledRate);
                    const Amount = Multiplication(Bill_Qty, Item_Rate);
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
                                case 'Location_Id': return [key, Number(item?.LocationId) ?? '']
                                case 'Item_Id': return [key, Number(item?.ItemId)]
                                case 'Bill_Qty': return [key, Bill_Qty]
                                case 'Item_Rate': return [key, Item_Rate]
                                case 'Bill_Alt_Qty': return [key, Number(item?.Quantity)]
                                case 'Batch_No': return [key, item?.BatchLocation]
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
        setDialogs(false);
        setSelectedItems([]);
        setInvoiceDetails(initialInvoiceValue);
        setDeliveryDetails([]);
        if ((Array.isArray(stateDetails?.orderInfo) || isValidObject(stateDetails?.invoiceInfo)) && window.history.length > 1) {
            navigation(-1);
        } else {
            navigation(location.pathname, { replace: true, state: null });
        }
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
        fetchLink({
            address: 'purchase/purchaseOrder',
            method: checkIsNumber(invoiceDetails?.PIN_Id) ? 'PUT' : 'POST',
            bodyData: {
                Product_Array: selectedItems,
                ...invoiceDetails
            }
        }).then(data => {
            if (data.success) {
                toast.success(data?.message || 'Saved');    
                closeDialogs();
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
                    <Button onClick={() => setSelectedItems([])}>clear selected</Button>
                    <Button
                        variant="contained"
                        className='ms-2'
                        onClick={() => setDialogs(true)}
                        disabled={selectedItems.length === 0}
                    >next</Button>
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
                            // onClick={() => getVendorInfo(3412)}
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
            </Card>

            <Dialog
                open={dialogs}
                onClose={closeDialogs}
                fullScreen
            >
                <form onSubmit={e => {
                    e.preventDefault();
                    postOrder();
                }}>
                    <DialogTitle className='d-flex flex-wrap align-items-center border-bottom '>
                        <span className="flex-grow-1">Create Invoice</span>
                        <span>
                            <Button onClick={closeDialogs} type="button" className='me-2'>cancel</Button>
                            <Button type='submit' variant="contained">submit</Button>
                        </span>
                    </DialogTitle>

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
                                <label>Entry Date <RequiredStar /></label>
                                <input
                                    value={invoiceDetails?.Po_Entry_Date}
                                    type="date"
                                    required
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Entry_Date: e.target.value }))}
                                />
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Bill Date <RequiredStar /></label>
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
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Voucher Type</label>
                                <Select
                                    value={{ value: invoiceDetails.Voucher_Type, label: invoiceDetails.Voucher_Type }}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Voucher_Type: e.label }))}
                                    options={[
                                        { value: '', label: 'Search', isDisabled: true },
                                        ...voucherType.map(obj => ({
                                            value: obj?.Voucher_Type,
                                            label: obj?.Voucher_Type
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Voucher Type"}
                                    maxMenuHeight={300}
                                />
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Stock Item Ledger Name</label>
                                <Select
                                    value={{ value: invoiceDetails.Stock_Item_Ledger_Name, label: invoiceDetails.Stock_Item_Ledger_Name }}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Stock_Item_Ledger_Name: e.label }))}
                                    options={[
                                        { value: '', label: 'Search', isDisabled: true },
                                        ...stockItemLedgerName.map(obj => ({
                                            value: obj?.Stock_Item_Ledger_Name,
                                            label: obj?.Stock_Item_Ledger_Name
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select"}
                                    maxMenuHeight={300}
                                />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <td className={tdStyle}>SNo</td>
                                        <td className={tdStyle}>Item</td>
                                        <td className={tdStyle}>Rate</td>
                                        <td className={tdStyle}>Bill Quantity</td>
                                        <td className={tdStyle}>Acl Quantity</td>
                                        <td className={tdStyle}>Unit</td>
                                        <td className={tdStyle}>Amount</td>
                                        <td className={tdStyle}>Godown Location</td>
                                        <td className={tdStyle}>Batch</td>
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
                                                <input
                                                    value={row?.Bill_Alt_Qty}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Bill_Alt_Qty', e.target.value)}
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
                                            <td className={tdStyle}>
                                                <select
                                                    value={row?.Location_Id}
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Location_Id', e.target.value)}
                                                >
                                                    <option value="">select</option>
                                                    {godownLocations.map((o, i) => (
                                                        <option value={o?.Godown_Id} key={i}>{o?.Godown_Name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Batch_No}
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Batch_No', e.target.value)}
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

                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default PurchaseInvoiceManagement;