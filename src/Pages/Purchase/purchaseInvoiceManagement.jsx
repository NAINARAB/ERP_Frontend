import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Switch } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Add, Delete } from "@mui/icons-material";
import { Addition, checkIsNumber, Division, filterableText, getUniqueData, isEqualNumber, ISOString, isValidJSON, isValidObject, Multiplication, NumberFormat, numberToWords, onlynumAndNegative, RoundNumber } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import RequiredStar from "../../Components/requiredStar";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateGSTDetails } from '../../Components/taxCalculator';
import { initialInvoiceValue, itemsRowDetails, staffRowDetails } from "./variable";
import AddItemToSaleOrderCart from "../Sales/SaleOrder/addItemToCart";

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const dialogs = {
    addProductDialog: false,
    selectArrivalDialog: false
}

const PurchaseInvoiceManagement = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const navigation = useNavigate();
    const stateDetails = location.state;

    const [invoiceDetails, setInvoiceDetails] = useState(initialInvoiceValue);
    const [selectedItems, setSelectedItems] = useState([]);
    const [StaffArray, setStaffArray] = useState([]);

    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);

    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';
    const isInclusive = isEqualNumber(invoiceDetails?.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceDetails?.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceDetails?.IS_IGST, 1);

    const [dialog, setDialog] = useState(dialogs);
    const [manualInvoice, setManualInvoice] = useState(false)

    const [baseData, setBaseData] = useState({
        retailers: [],
        branch: [],
        uom: [],
        products: [],
        voucherType: [],
        stockItemLedgerName: [],
        godown: [],
        staff: [],
        staffType: [],
        brand: [],
    });

    const Total_Invoice_value = useMemo(() => {
        return selectedItems.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return Addition(acc, Amount);

            const product = findProductDetails(baseData.products, item.Item_Id);
            const gstPercentage = IS_IGST ? product.Igst_P : product.Gst_P;

            if (isInclusive) {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'remove').with_tax);
            } else {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'add').with_tax);
            }
        }, 0);
    }, [selectedItems, isNotTaxableBill, baseData.products, IS_IGST, isInclusive])

    const taxSplitUp = useMemo(() => {
        if (!selectedItems || selectedItems.length === 0) return {};

        let totalTaxable = 0;
        let totalTax = 0;

        selectedItems.forEach(item => {
            const Amount = RoundNumber(item?.Amount || 0);

            if (isNotTaxableBill) {
                totalTaxable = Addition(totalTaxable, Amount);
                return;
            }

            const product = findProductDetails(baseData.products, item.Item_Id);
            const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;

            const taxInfo = calculateGSTDetails(Amount, gstPercentage, isInclusive ? 'remove' : 'add');

            totalTaxable = Addition(totalTaxable, parseFloat(taxInfo.without_tax));
            totalTax = Addition(totalTax, parseFloat(taxInfo.tax_amount));
        });

        const totalWithTax = Addition(totalTaxable, totalTax);
        const roundedTotal = Math.round(totalWithTax);
        const roundOff = RoundNumber(roundedTotal - totalWithTax);

        const cgst = isEqualNumber(IS_IGST, 1) ? 0 : RoundNumber(totalTax / 2);
        const sgst = isEqualNumber(IS_IGST, 1) ? 0 : RoundNumber(totalTax / 2);
        const igst = isEqualNumber(IS_IGST, 1) ? RoundNumber(totalTax) : 0;

        return {
            totalTaxable: RoundNumber(totalTaxable),
            totalTax: RoundNumber(totalTax),
            cgst,
            sgst,
            igst,
            roundOff,
            invoiceTotal: roundedTotal
        };

    }, [selectedItems, baseData.products, IS_IGST, isNotTaxableBill, isInclusive]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();

                const [
                    retailerResponse,
                    branchResponse,
                    uomResponse,
                    productsResponse,
                    voucherTypeResponse,
                    stockItemLedgerNameResponse,
                    godownLocationsResponse,
                    staffResponse,
                    staffCategory
                ] = await Promise.all([
                    fetchLink({ address: `masters/retailers/dropDown` }),
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=PURCHASE` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                ]);

                const retailersData = (retailerResponse.success ? retailerResponse.data : []).sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                const uomData = (uomResponse.success ? uomResponse.data : []).sort(
                    (a, b) => String(a.Units).localeCompare(b.Units)
                );
                const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );
                const voucherType = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );
                const stockItemLedgerName = (stockItemLedgerNameResponse.success ? stockItemLedgerNameResponse.data : []).sort(
                    (a, b) => String(a?.Stock_Item_Ledger_Name).localeCompare(b?.Stock_Item_Ledger_Name)
                );
                const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                );
                const staffData = (staffResponse.success ? staffResponse.data : []).sort(
                    (a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name)
                );
                const staffCategoryData = (staffCategory.success ? staffCategory.data : []).sort(
                    (a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category)
                );

                setBaseData((pre) => ({
                    ...pre,
                    retailers: retailersData,
                    branch: branchData,
                    uom: uomData,
                    products: productsData,
                    voucherType: voucherType,
                    stockItemLedgerName: stockItemLedgerName,
                    godown: godownLocations,
                    staff: staffData,
                    staffType: staffCategoryData,
                    brand: getUniqueData(productsData, 'Brand', ['Brand_Name']),
                }));
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();

    }, [])

    useEffect(() => {
        if (
            isValidObject(stateDetails) &&
            Array.isArray(stateDetails?.orderInfo) &&
            Array.isArray(stateDetails?.staffInfo) &&
            isValidObject(stateDetails?.invoiceInfo)
        ) {
            const { invoiceInfo, orderInfo, staffInfo } = stateDetails;
            searchFromArrival(invoiceInfo.Retailer_Id);
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
                        if (key === 'Item_Name') return [key, item['Product_Name'] || value]
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
            setManualInvoice(invoiceInfo.isFromPurchaseOrder)
        }
    }, [stateDetails])

    const searchFromArrival = (vendor) => {
        if (checkIsNumber(vendor)) {
            if (loadingOn) loadingOn();
            // setSelectedItems([]);
            setDeliveryDetails([]);
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
            const preItems = prev.filter(o => !(
                isEqualNumber(o?.OrderId, itemDetail?.OrderId)
                && isEqualNumber(o?.Item_Id, itemDetail?.ItemId)
                && isEqualNumber(o?.DeliveryId, itemDetail?.Trip_Item_SNo)
            ));
            if (deleteOption) {
                return preItems;
            } else {
                const currentOrders = deliveryDetails.filter(item => (
                    isEqualNumber(item.OrderId, itemDetail.OrderId)
                    && isEqualNumber(itemDetail?.ItemId, item?.ItemId)
                    && isEqualNumber(itemDetail?.Trip_Item_SNo, item?.Trip_Item_SNo)
                ));

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
                                    case 'Involved_Emp_Name': return [key, staff?.EmployeeName];
                                    case 'Cost_Center_Type_Id': return [key, staff?.CostType];
                                    default: return [key, value];
                                }
                            })
                        ))
                    ]);
                }

                const reStruc = currentOrders.map(item => {
                    const productDetails = findProductDetails(baseData.products, item.ItemId);
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
                                case 'DeliveryId': return [key, Number(item?.Trip_Item_SNo)]
                                case 'OrderId': return [key, Number(item?.OrderId)]
                                case 'Po_Inv_Date': return [key, invoiceDetails?.Po_Inv_Date]
                                case 'Location_Id': return [key, Number(item?.LocationId) ?? '']
                                case 'Item_Id': return [key, Number(item?.ItemId)]
                                case 'Item_Name': return [key, Number(productDetails?.Product_Name)]
                                case 'Bill_Qty': return [key, item?.pendingInvoiceWeight]
                                case 'Act_Qty': return [key, Bill_Qty]
                                case 'Item_Rate': return [key, Item_Rate]
                                case 'Bill_Alt_Qty': return [key, Number(item?.Quantity)]
                                case 'Batch_No': return [key, item?.BatchLocation]
                                case 'Amount': return [key, Amount]
                                case 'Taxable_Rate': return [key, itemRateGst.base_amount]
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
        setDialog(dialogs);
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
                StaffArray: StaffArray,
                ...invoiceDetails
            }
        }).then(data => {
            if (data.success) {
                toast.success(data?.message || 'Saved');
                setSelectedItems([]);
                setInvoiceDetails(initialInvoiceValue);
                setDeliveryDetails([]);
                setStaffArray([]);
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
            <AddItemToSaleOrderCart
                orderProducts={selectedItems}
                setOrderProducts={setSelectedItems}
                open={dialog.addProductDialog}
                onClose={() => {
                    setDialog(pre => ({ ...pre, addProductDialog: false }))
                    setSelectedProductToEdit(null);
                }}
                products={baseData.products}
                brands={baseData.brand}
                uom={baseData.uom}
                godowns={baseData.godown}
                GST_Inclusive={isInclusive}
                IS_IGST={IS_IGST}
                editValues={selectedProductToEdit}
                initialValue={itemsRowDetails}
                stockInGodown={[]}
            />

            <form onSubmit={e => {
                e.preventDefault();
                postOrder();
            }}>
                <Card>

                    <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                        <span className="flex-grow-1 fa-16 fw-bold">Purchase Invoice Creation</span>
                        <span>

                            <label htmlFor="">Manual Invoice</label>
                            <Switch
                                checked={manualInvoice}
                                onChange={e => {
                                    setManualInvoice(e.target.checked);
                                    setSelectedItems([])
                                }}
                            />

                            <Button type='button' onClick={() => {
                                if ((Array.isArray(stateDetails?.orderInfo) || isValidObject(stateDetails?.invoiceInfo)) && window.history.length > 1) {
                                    navigation(-1);
                                } else {
                                    navigation('/erp/purchase/invoice');
                                }
                            }}>Cancel</Button>

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
                                                                        const staff = baseData.staff.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
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
                                                                [...baseData.staff.filter(fil => (
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
                                                            {baseData.staffType.map((st, sti) =>
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
                                                onChange={e => {
                                                    setInvoiceDetails(pre => ({
                                                        ...pre,
                                                        Retailer_Id: e.value,
                                                        Retailer_Name: e.label
                                                    }));
                                                    setSelectedItems([]);
                                                    searchFromArrival(e.value)
                                                }}
                                                options={[
                                                    { value: '', label: 'Search', isDisabled: true },
                                                    ...baseData.retailers.map(obj => ({
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
                                                value={{
                                                    value: invoiceDetails.Voucher_Type,
                                                    label: baseData.voucherType.find(v => isEqualNumber(v.Vocher_Type_Id, invoiceDetails.Voucher_Type))?.Voucher_Type
                                                }}
                                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Voucher_Type: e.value }))}
                                                options={[
                                                    { value: '', label: 'Search', isDisabled: true },
                                                    ...baseData.voucherType.filter(
                                                        fil => filterableText(fil.Type) === filterableText('PURCHASE')
                                                    ).map(obj => ({
                                                        value: obj?.Vocher_Type_Id,
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
                                                {baseData.branch.map((o, i) => (
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
                                                    ...baseData.stockItemLedgerName.map(obj => ({
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

                                    <label className='fa-13'>Narration</label>
                                    <textarea
                                        className="cus-inpt fa-14"
                                        rows={2}
                                        value={invoiceDetails.Narration}
                                        onChange={e => setInvoiceDetails(pre => ({ ...pre, Narration: e.target.value }))}
                                    />

                                </div>
                            </div>

                        </div>

                        {/* product info */}
                        <div className="table-responsive">
                            <div className="d-flex p-2 justify-content-end">

                                <Button type="button" onClick={() => setSelectedItems([])}>clear selected</Button>
                                
                                {manualInvoice ? (
                                    <Button
                                        onClick={() => {
                                            setSelectedProductToEdit(null);
                                            setDialog(pre => ({ ...pre, addProductDialog: true }));
                                        }}
                                        sx={{ ml: 1 }}
                                        variant='outlined'
                                        type="button"
                                        startIcon={<Add />}
                                        disabled={!checkIsNumber(invoiceDetails.Retailer_Id)}
                                    >Add Product</Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        className='ms-2'
                                        type="button"
                                        onClick={() => setDialog(pre => ({ ...pre, selectArrivalDialog: true }))}
                                        startIcon={<Add />}
                                        disabled={!checkIsNumber(invoiceDetails.Retailer_Id)}
                                    >Add Products</Button>
                                )}

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
                                            {/* <td className={tdStyle}>{findProductDetails(baseData.products, row.Item_Id)?.Product_Name ?? 'Not found'}</td> */}
                                            <td className={tdStyle}>{row.Item_Name ?? 'Not found'}</td>
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
                                                    {baseData.uom.map((o, i) => (
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
                                                    {baseData.godown.map((o, i) => (
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
                                            {/* {NumberFormat(totalValueBeforeTax.TotalValue)} */}
                                            {taxSplitUp.totalTaxable}
                                        </td>
                                    </tr>
                                    {!IS_IGST ? (
                                        <>
                                            <tr>
                                                <td className="border p-2">CGST</td>
                                                <td className="border p-2">
                                                    {taxSplitUp.cgst}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">SGST</td>
                                                <td className="border p-2">
                                                    {taxSplitUp.sgst}
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td className="border p-2">IGST</td>
                                            <td className="border p-2">
                                                {taxSplitUp.igst}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="border p-2">Round Off</td>
                                        <td className="border p-2">
                                            <input
                                                value={invoiceDetails.Round_off}
                                                defaultValue={taxSplitUp.roundOff}
                                                style={{ minWidth: '200px', maxWidth: '350px' }}
                                                className="cus-inpt p-2"
                                                onInput={onlynumAndNegative}
                                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Round_off: e.target.value }))}
                                            />
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
                open={dialog.selectArrivalDialog}
                onClose={closeDialogs}
                fullScreen
            >
                <DialogTitle className='d-flex flex-wrap align-items-center '>
                    <span className="flex-grow-1">Select Purchase Order</span>
                    <span>
                        <Button onClick={closeDialogs} type="button" className='me-2'>close</Button>
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
                                                checked={selectedItems.findIndex(o => isEqualNumber(o?.DeliveryId, row?.Trip_Item_SNo)) !== -1}
                                                onChange={() => {
                                                    if (selectedItems.findIndex(o => isEqualNumber(o?.DeliveryId, row?.Trip_Item_SNo)) !== -1) changeItems(row, true)
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
                            {
                                isVisible: 1,
                                ColumnHeader: 'Weight',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    row?.Weight ?? 0
                                ) + ' ' + row?.Units
                            },
                            createCol('pendingInvoiceWeight', 'number', 'Pending Tonnage'),
                            createCol('Quantity', 'number'),
                            createCol('PO_ID', 'string'),
                            createCol('Location', 'string'),
                        ]}
                        EnableSerialNumber
                        disablePagination
                        title={`Arrival Details of ${baseData.retailers?.find(ven =>
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