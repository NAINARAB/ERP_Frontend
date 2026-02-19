import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Switch } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Addition, checkIsNumber, Division, getUniqueData, isEqualNumber, ISOString, isValidObject, Multiplication, NumberFormat, numberToWords, onlynumAndNegative, RoundNumber, stringCompare, toNumber } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { initialInvoiceValue, itemsRowDetails, staffRowDetails } from "./variable";
import AddItemsDialog from "./addToCart";
import PurchaseInvoiceStaffInvolved from "./StaffInfoComp";
import PurchaseInvoiceGeneralInfo from "./generalInfoComp";
import ExpencesOfPurchaseInvoice from "./manageExpences";

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
    const [invoiceExpences, setInvoiceExpences] = useState([]);

    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);

    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';
    const isInclusive = isEqualNumber(invoiceDetails?.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceDetails?.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceDetails?.IS_IGST, 1);

    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';

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
        defaultAccounts: []
    });

    const invExpencesTotal = useMemo(() => {
        return (invoiceExpences || []).reduce((acc, exp) => Addition(acc, exp?.Expence_Value), 0)
    }, [invoiceExpences]);

    const Total_Invoice_value = useMemo(() => {
        const invValue = selectedItems.reduce((acc, item) => {
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

        return Addition(invValue, invExpencesTotal);
    }, [selectedItems, isNotTaxableBill, baseData.products, IS_IGST, isInclusive, invExpencesTotal])

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
        const totalWithExpenses = Addition(totalWithTax, invExpencesTotal);
        const roundedTotal = Math.round(totalWithExpenses);
        const roundOff = RoundNumber(roundedTotal - totalWithExpenses);

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

    }, [selectedItems, baseData.products, IS_IGST, isNotTaxableBill, isInclusive, invExpencesTotal]);

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
                    staffCategory,
                    defaultAccountMasterResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/retailers/dropDown` }),
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/voucher?module=PURCHASE_INVOICE` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=PURCHASE_INVOICE` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/defaultAccountMaster?Type=PURCHASE_INVOICE` })
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
                const defaultAccountMasterData = (defaultAccountMasterResponse.success ? defaultAccountMasterResponse.data : []).sort(
                    (a, b) => String(a?.Account_Name).localeCompare(b?.Account_Name)
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
                    defaultAccounts: defaultAccountMasterData.map(exp => ({
                        Id: exp.Acc_Id,
                        Expence_Name: exp.Account_Name,
                        percentageValue: exp.percentageValue
                    }))
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
            setManualInvoice(!invoiceInfo.isFromPurchaseOrder)
        }
        console.log(stateDetails)
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

                    const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                    const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                    const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                    const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                    const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                    const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                    const pack = productDetails?.PackGet;
                    const Alt_Act_Qty = parseInt(Division(item?.pendingInvoiceWeight, pack));

                    // console.log(productDetails)

                    return Object.fromEntries(
                        Object.entries(itemsRowDetails).map(([key, value]) => {
                            switch (key) {
                                case 'DeliveryId': return [key, Number(item?.Trip_Item_SNo)]
                                case 'OrderId': return [key, Number(item?.OrderId)]
                                case 'Po_Inv_Date': return [key, invoiceDetails?.Po_Inv_Date]
                                case 'Location_Id': return [key, Number(item?.LocationId) ?? '']
                                case 'Item_Id': return [key, Number(item?.ItemId)]
                                case 'Item_Name': return [key, productDetails?.Product_Name]
                                case 'Unit_Id': return [key, productDetails?.UOM_Id]
                                case 'Unit_Name': return [key, productDetails?.Units]
                                case 'Bill_Qty': return [key, item?.pendingInvoiceWeight]
                                case 'Act_Qty': return [key, Bill_Qty]
                                case 'Item_Rate': return [key, Item_Rate]
                                case 'Bill_Alt_Qty': return [key, Number(item?.Quantity)]
                                case 'Alt_Act_Qty': return [key, Alt_Act_Qty]
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

    const changeSelectedObjects = (indexValue, key, value) => {
        setSelectedItems((prev) => {
            return prev.map((item, sIndex) => {
                if (isEqualNumber(sIndex, indexValue)) {
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

    const resetData = () => {
        setSelectedItems([]);
        setInvoiceDetails(initialInvoiceValue);
        setDeliveryDetails([]);
        setStaffArray([]);
        setInvoiceExpences([]);
    }

    const postOrder = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: 'purchase/purchaseOrder',
            method: checkIsNumber(invoiceDetails?.PIN_Id) ? 'PUT' : 'POST',
            bodyData: {
                Product_Array: selectedItems,
                StaffArray: StaffArray,
                Expence_Array: invoiceExpences,
                ...invoiceDetails
            }
        }).then(data => {
            if (data.success) {
                resetData();
                toast.success(data?.message || 'Saved');
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
            <AddItemsDialog
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

                            <PurchaseInvoiceStaffInvolved
                                baseData={baseData}
                                StaffArray={StaffArray}
                                setStaffArray={setStaffArray}
                                staffRowDetails={staffRowDetails}
                            />

                            {/* general info */}
                            <PurchaseInvoiceGeneralInfo
                                invoiceDetails={invoiceDetails}
                                setInvoiceDetails={setInvoiceDetails}
                                baseData={baseData}
                                selectedItems={selectedItems}
                                setSelectedItems={setSelectedItems}
                                searchFromArrival={searchFromArrival}
                                inputStyle={inputStyle}
                            />

                        </div>

                        {/* product info */}
                        <div className="table-responsive">
                            <div className="d-flex p-2 justify-content-end">

                                <Button type="button" onClick={() => setSelectedItems([])}>clear selected</Button>

                                <Button
                                    onClick={() => {
                                        if (manualInvoice) {
                                            setSelectedProductToEdit(null);
                                            setDialog(pre => ({ ...pre, addProductDialog: true }));
                                        } else {
                                            setDialog(pre => ({ ...pre, selectArrivalDialog: true }))
                                        }
                                    }}
                                    variant='outlined'
                                    type="button"
                                    startIcon={<Add />}
                                    disabled={!checkIsNumber(invoiceDetails.Retailer_Id)}
                                >Add Product</Button>
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
                                        <td className={tdStyle}>#</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItems.map((row, i) => (
                                        <tr key={i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            {/* <td className={tdStyle}>{findProductDetails(baseData.products, row.Item_Id)?.Product_Name ?? 'Not found'}</td> */}
                                            <td className={tdStyle}>{row?.Item_Name || 'Not found'}</td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Item_Rate ? row?.Item_Rate : ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Item_Rate', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Bill_Qty ? row?.Bill_Qty : ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Bill_Qty', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Act_Qty ?? ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Act_Qty', e.target.value)}
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
                                                        changeSelectedObjects(i, 'Unit_Id', value);
                                                        changeSelectedObjects(i, 'Unit_Name', label);
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
                                                    onChange={e => changeSelectedObjects(i, 'Amount', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <select
                                                    value={row?.Location_Id}
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Location_Id', e.target.value)}
                                                // disabled={toNumber(row?.DeliveryId)}
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
                                                    onChange={e => changeSelectedObjects(i, 'Batch_No', e.target.value)}
                                                    disabled={toNumber(row?.DeliveryId)}
                                                />
                                            </td>
                                            <td className={tdStyle}>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedItems(prev => {
                                                            return prev.filter((_, filIndex) => i !== filIndex);
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

                            <br />

                            <ExpencesOfPurchaseInvoice
                                invoiceExpences={invoiceExpences}
                                setInvoiceExpences={setInvoiceExpences}
                                expenceMaster={baseData.defaultAccounts}
                                IS_IGST={IS_IGST}
                                taxType={taxType}
                                Total_Invoice_value={Total_Invoice_value}
                                invoiceProducts={selectedItems}
                                findProductDetails={findProductDetails}
                                products={baseData.products}
                            />

                            <br />

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
                                    const isChecked = selectedItems.findIndex(o => isEqualNumber(o?.DeliveryId, row?.Trip_Item_SNo)) !== -1;

                                    return (
                                        <div>
                                            <input
                                                className="form-check-input shadow-none pointer"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    if (isChecked) changeItems(row, true)
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