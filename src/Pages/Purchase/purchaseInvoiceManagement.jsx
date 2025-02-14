import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Add, Delete, Search } from "@mui/icons-material";
import { Addition, checkIsNumber, Division, isEqualNumber, ISOString, isValidJSON, isValidObject, Multiplication, NumberFormat, numberToWords, RoundNumber, Subraction } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import RequiredStar from "../../Components/requiredStar";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateGSTDetails } from '../../Components/taxCalculator';

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
        Retailer_Id: 17,
        Retailer_Name: 'testing',
        // Retailer_Id: '',
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
        Act_Qty: 0,
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

    const staffRowDetails = {
        Id: '',
        PIN_Id: '',
        Involved_Emp_Id: '',
        Involved_Emp_Name: 'select',
        Cost_Center_Type_Id: '',
    }

    const [vendorList, setVendorList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [productUOM, setProductUOM] = useState([]);
    const [products, setProducts] = useState([]);
    const [voucherType, setVoucherType] = useState([]);
    const [stockItemLedgerName, setStockItemLedgerName] = useState([]);
    const [godownLocations, setGodownLocations] = useState([]);
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [costCenter, setCostCenter] = useState([]);
    const [costCategory, setCostCategory] = useState([]);

    const [invoiceDetails, setInvoiceDetails] = useState(initialInvoiceValue);
    const [selectedItems, setSelectedItems] = useState([]);
    const [StaffArray, setStaffArray] = useState([]);
    const [dialogs, setDialogs] = useState(false);
    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';
    const isInclusive = isEqualNumber(invoiceDetails?.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceDetails?.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceDetails?.IS_IGST, 1);

    const Total_Invoice_value = selectedItems.reduce((acc, item) => {
        const Amount = RoundNumber(item?.Amount);

        if (isNotTaxableBill) return Addition(acc, Amount);

        const product = findProductDetails(products, item.Item_Id);
        const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;

        if (isInclusive) {
            return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'remove').with_tax);
        } else {
            return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'add').with_tax);
        }
    }, 0)

    const totalValueBeforeTax = selectedItems.reduce((acc, item) => {
        const Amount = RoundNumber(item?.Amount);

        if (isNotTaxableBill) return {
            TotalValue: Addition(acc.TotalValue, Amount),
            TotalTax: 0
        }

        const product = findProductDetails(products, item.Item_Id);
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

    useEffect(() => {
        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                const retailerData = data?.data?.sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                setVendorList(retailerData);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/branch/dropDown`
        }).then(data => {
            if (data.success) {
                const branchData = data?.data?.sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                setBranches(branchData)
            };
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/uom`
        }).then(data => {
            if (data.success) {
                const uomData = data?.data?.sort(
                    (a, b) => String(a?.Units).localeCompare(b?.Units)
                );
                setProductUOM(uomData);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products`
        }).then(data => {
            if (data.success) {
                const productsData = data?.data?.sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );
                setProducts(productsData)
            } 
        }).catch(e => console.error(e))

        fetchLink({
            address: `dataEntry/godownLocationMaster`
        }).then(data => {
            if (data.success) {
                const godownLocations = data?.data?.sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                );
                setGodownLocations(godownLocations);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `purchase/voucherType`
        }).then(data => {
            if (data.success) {
                const voucherTypeData = data?.data?.sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );
                setVoucherType(voucherTypeData);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `purchase/stockItemLedgerName`
        }).then(data => {
            if (data.success) {
                const stockItemLedgerName = data?.data?.sort(
                    (a, b) => String(a?.Stock_Item_Ledger_Name).localeCompare(b?.Stock_Item_Ledger_Name)
                );
                setStockItemLedgerName(stockItemLedgerName);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `dataEntry/costCenter`
        }).then(data => {
            if (data.success) {
                const staffData = data?.data?.sort(
                    (a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name)
                );
                setCostCenter(staffData);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `dataEntry/costCenter/category`
        }).then(data => {
            if (data.success) {
                const staffCategoryData = data?.data?.sort(
                    (a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category)
                );
                setCostCategory(staffCategoryData);
            }
        }).catch(e => console.error(e));

    }, [])

    useEffect(() => {
        if (
            isValidObject(stateDetails) &&
            Array.isArray(stateDetails?.orderInfo) &&
            Array.isArray(stateDetails?.staffInfo) &&
            isValidObject(stateDetails?.invoiceInfo)
        ) {
            const { invoiceInfo, orderInfo, staffInfo } = stateDetails;
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
            setStaffArray(
                staffInfo.map(item => Object.fromEntries(
                    Object.entries(staffRowDetails).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
        }
    }, [stateDetails])

    const searchFromArrival = (vendor) => {
        if (checkIsNumber(vendor)) {
            if (loadingOn) loadingOn();
            // setSelectedItems([]);
            fetchLink({
                address: `dataEntry/purchaseOrderEntry/delivery/partyBased?VendorId=${vendor}`
            }).then(data => {
                if (data.success) setDeliveryDetails(data.data)
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff()
            })
        }
    }

    const changeItems = (itemDetail, deleteOption) => {
        setSelectedItems((prev) => {
            const preItems = prev.filter(o => !isEqualNumber(o?.OrderId, itemDetail?.OrderId));
            if (deleteOption) {
                return preItems;
            } else {
                const currentOrders = deliveryDetails.filter(item => isEqualNumber(item.OrderId, itemDetail.OrderId));

                const notInStaffList = [...new Map(
                    currentOrders.flatMap(ordr => ordr.EmployeesInvolved)
                        .filter(staff => !StaffArray.some(arrObj => isEqualNumber(arrObj.Involved_Emp_Id, staff.EmployeeId)))
                        .map(staff => [staff.EmployeeId, staff])
                ).values()];

                if (notInStaffList.length > 0) {
                    setStaffArray(prevStaffArray => [
                        ...prevStaffArray,
                        ...notInStaffList.map(staff => Object.fromEntries(
                            Object.entries(staffRowDetails).map(([key, value]) => {
                                switch (key) {
                                    case 'Involved_Emp_Id': return [key, staff?.EmployeeId];
                                    case 'Cost_Center_Type_Id': return [key, staff?.CostType];
                                    default: return [key, value];
                                }
                            })
                        ))
                    ]);
                }

                const reStruc = currentOrders.map(item => {
                    const productDetails = findProductDetails(products, item.ItemId);
                    const gstPercentage = IS_IGST ? productDetails.Igst_P : productDetails.Gst_P;
                    const isTaxable = gstPercentage > 0;

                    const Bill_Qty = parseFloat(item.Weight) ?? 0;
                    const Item_Rate = RoundNumber(item.BilledRate) ?? 0;
                    const Amount = Multiplication(Bill_Qty, Item_Rate);

                    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
                    const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                    const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                    const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                    const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                    const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                    const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

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
                                case 'Act_Qty': return [key, Bill_Qty]
                                case 'Item_Rate': return [key, Item_Rate]
                                case 'Bill_Alt_Qty': return [key, Number(item?.Quantity)]
                                case 'Batch_No': return [key, item?.BatchLocation]
                                case 'Taxable_Rate': return [key, itemRateGst.base_amount]
                                case 'Amount': return [key, Amount]
                                case 'Total_Qty': return [key, Bill_Qty]
                                case 'Taxble': return [key, isTaxable ? 1 : 0]
                                case 'HSN_Code': return [key, productDetails.HSN_Code]
                                case 'Taxable_Amount': return [key, gstInfo.base_amount]
                                case 'Tax_Rate': return [key, gstPercentage]
                                case 'Cgst':
                                case 'Sgst': return [key, cgstPer ?? 0]
                                case 'Cgst_Amo':
                                case 'Sgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
                                case 'Igst': return [key, igstPer ?? 0]
                                case 'Igst_Amo': return [key, isNotTaxableBill ? 0 : Igst_Amo]
                                case 'Final_Amo': return [key, gstInfo.with_tax]

                                default: return [key, value]
                            }
                        })
                    )

                });
                return preItems.concat(reStruc);
            }
        });
    };

    const closeDialogs = () => {
        setDialogs(false);
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
                setSelectedItems([]);
                setInvoiceDetails(initialInvoiceValue);
                setDeliveryDetails([]);
                if ((Array.isArray(stateDetails?.orderInfo) || isValidObject(stateDetails?.invoiceInfo)) && window.history.length > 1) {
                    navigation(-1);
                } else {
                    navigation(location.pathname, { replace: true, state: null });
                }
            } else {
                toast.error(data?.message || 'Request Failed')
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    return (
        <>
            <form onSubmit={e => {
                e.preventDefault();
                postOrder();
            }}>
                <Card>
                    <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                        <span className="flex-grow-1 fa-16 fw-bold">Purchase Invoice Creation</span>
                        <span>
                            <Button type='submit' variant="contained">submit</Button>
                        </span>
                    </div>
                    <CardContent>

                        <div className="row">
                            {/* staff info */}
                            <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                    <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                                        <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            type="button"
                                            onClick={() => setStaffArray([...StaffArray, { ...staffRowDetails }])}
                                        >Add</Button>
                                    </div>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th className="fa-13">Sno</th>
                                                <th className="fa-13">Staff Name</th>
                                                <th className="fa-13">Category</th>
                                                <th className="fa-13">#</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {StaffArray.map((row, index) => (
                                                <tr key={index}>
                                                    <td className='fa-13 vctr text-center'>{index + 1}</td>
                                                    <td className='fa-13 w-100 p-0'>
                                                        <Select
                                                            value={{
                                                                value: row?.Involved_Emp_Id,
                                                                label: row?.Involved_Emp_Name, 
                                                            }}
                                                            onChange={e => setStaffArray((prev) => {
                                                                return prev.map((item, ind) => {
                                                                    if (isEqualNumber(ind, index)) {
                                                                        const staff = costCenter.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                                        return {
                                                                            ...item,
                                                                            Cost_Center_Type_Id:
                                                                                checkIsNumber(item.Cost_Center_Type_Id)
                                                                                    ? Number(item.Cost_Center_Type_Id)
                                                                                    : checkIsNumber(staff.User_Type)
                                                                                        ? Number(staff.User_Type)
                                                                                        : 0,
                                                                            Involved_Emp_Id: Number(e.value),
                                                                            Involved_Emp_Name: e.label
                                                                        }
                                                                    }
                                                                    return item;
                                                                });
                                                            })}
                                                            options={
                                                                [...costCenter.filter(fil => (
                                                                    !StaffArray.some(st => (
                                                                        isEqualNumber(st.Involved_Emp_Id, fil.Cost_Center_Id)
                                                                    ))
                                                                ))].map(st => ({
                                                                    value: st.Cost_Center_Id,
                                                                    label: st.Cost_Center_Name
                                                                }))
                                                            }
                                                            styles={customSelectStyles}
                                                            isSearchable={true}
                                                            placeholder={"Select Staff"}
                                                        />
                                                    </td>
                                                    <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '100px' }}>
                                                        <select
                                                            value={row?.Cost_Center_Type_Id}
                                                            onChange={e => setStaffArray((prev) => {
                                                                return prev.map((item, ind) => {
                                                                    if (isEqualNumber(ind, index)) {
                                                                        return {
                                                                            ...item,
                                                                            Cost_Center_Type_Id: e.target.value
                                                                        }
                                                                    }
                                                                    return item;
                                                                });
                                                            })}
                                                            className="cus-inpt p-2 border-0"
                                                        >
                                                            <option value="">Select</option>
                                                            {costCategory.map((st, sti) =>
                                                                <option value={st?.Cost_Category_Id} key={sti}>{st?.Cost_Category}</option>
                                                            )}
                                                        </select>
                                                    </td>
                                                    <td className='fa-13 vctr p-0'>
                                                        <IconButton
                                                            onClick={() => {
                                                                setStaffArray(prev => {
                                                                    return prev.filter((_, filIndex) => index !== filIndex);
                                                                });
                                                            }}
                                                            size='small'
                                                        >
                                                            <Delete color='error' />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* general info */}
                            <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                                <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>

                                    <div className="row">
                                        <div className="col-sm-8 p-2">
                                            <label className='fa-13'>Vendor</label>
                                            <Select
                                                value={{
                                                    value: invoiceDetails?.Retailer_Id, 
                                                    label: invoiceDetails?.Retailer_Name
                                                }}
                                                onChange={e => setInvoiceDetails(pre => ({
                                                    ...pre,
                                                    Retailer_Id: e.value,
                                                    Retailer_Name: e.label
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
                                        </div>

                                        <div className="col-sm-4 p-2">
                                            <label className='fa-13'>Voucher Type</label>
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
                                                required={true}
                                                placeholder={"Select Voucher Type"}
                                                maxMenuHeight={300}
                                            />
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Branch <RequiredStar /></label>
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

                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Entry Date <RequiredStar /></label>
                                            <input
                                                value={invoiceDetails?.Po_Entry_Date}
                                                type="date"
                                                required
                                                className={inputStyle}
                                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Entry_Date: e.target.value }))}
                                            />
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Bill Date <RequiredStar /></label>
                                            <input
                                                value={invoiceDetails?.Po_Inv_Date}
                                                type="date"
                                                required
                                                className={inputStyle}
                                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Inv_Date: e.target.value }))}
                                            />
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Ref Number</label>
                                            <input
                                                value={invoiceDetails?.Ref_Po_Inv_No}
                                                className={inputStyle}
                                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Ref_Po_Inv_No: e.target.value }))}
                                            />
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>GST Type <RequiredStar /></label>
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

                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Tax Type</label>
                                            <select
                                                className={inputStyle}
                                                onChange={e => setInvoiceDetails(pre => ({ ...pre, IS_IGST: Number(e.target.value) }))}
                                                value={invoiceDetails.IS_IGST}
                                            >
                                                <option value='0'>GST</option>
                                                <option value='1'>IGST</option>
                                            </select>
                                        </div>

                                        <div className="col-sm-6 p-2">
                                            <label className='fa-13'>Stock Item Ledger Name</label>
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
                                                required={true}
                                                isSearchable={true}
                                                placeholder={"Select"}
                                                maxMenuHeight={300}
                                            />
                                        </div>

                                    </div>

                                </div>
                            </div>

                        </div>

                        {/* product info */}
                        <div className="table-responsive">
                            <div className="d-flex p-2 justify-content-end">
                                <Button type="button" onClick={() => setSelectedItems([])}>clear selected</Button>
                                <Button
                                    variant="outlined"
                                    className='ms-2'
                                    type="button"
                                    onClick={() => setDialogs(true)}
                                    startIcon={<Add />}
                                    disabled={!checkIsNumber(invoiceDetails.Retailer_Id)}
                                >Add Products</Button>
                            </div>
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
                                                    value={row?.Item_Rate ? row?.Item_Rate : ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Item_Rate', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Bill_Qty ? row?.Bill_Qty : ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Bill_Qty', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Act_Qty ?? ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(row, 'Act_Qty', e.target.value)}
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
                                                    value={row?.Amount ? row?.Amount : ''}
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
                                                    {NumberFormat(RoundNumber(totalValueBeforeTax.TotalTax / 2))}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">SGST</td>
                                                <td className="border p-2">
                                                    {NumberFormat(RoundNumber(totalValueBeforeTax.TotalTax / 2))}
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td className="border p-2">IGST</td>
                                            <td className="border p-2">
                                                {NumberFormat(RoundNumber(totalValueBeforeTax.TotalTax))}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
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

                    </CardContent>
                </Card>
            </form>

            <Dialog
                open={dialogs}
                onClose={closeDialogs}
                fullScreen
            >
                <DialogTitle className='d-flex flex-wrap align-items-center '>
                    <span className="flex-grow-1">Select Purchase Order</span>
                    <span>
                        <Button onClick={closeDialogs} type="button" className='me-2'>close</Button>
                        <Button 
                            type="button" 
                            onClick={() => searchFromArrival(invoiceDetails.Retailer_Id)}
                        >Search Arrival Details</Button>
                    </span>
                </DialogTitle>
                <DialogContent>
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
                        title={`Arrival Details of ${vendorList?.find(ven =>
                            isEqualNumber(ven?.Retailer_Id, invoiceDetails?.Retailer_Id)
                        )?.Retailer_Name ?? 'Not available'}`}
                        maxHeightOption
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default PurchaseInvoiceManagement;