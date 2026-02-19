import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, Dialog, DialogTitle, DialogContent, DialogActions, CardActions } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, ISOString, getUniqueData, Addition, getSessionUser,
    checkIsNumber, toNumber, toArray, RoundNumber, isValidNumber,
    rid, Subraction, filterableText
} from "../../../Components/functions";
import { Close } from "@mui/icons-material";
import { Add, Delete, Edit, ReceiptLong } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import {
    salesInvoiceGeneralInfo, salesInvoiceDetailsInfo, salesInvoiceExpencesInfo,
    salesInvoiceStaffInfo, retailerDeliveryAddressInfo,
    retailerOutstandingDetails,
    canCreateInvoice,
    setAddress,
    defaultStaffTypes
} from './variable';
import InvolvedStaffs from "./manageInvolvedStaff";
import ManageSalesInvoiceGeneralInfo from "./manageGeneralInfo";
import SalesInvoiceTaxDetails from "./taxDetails";
import AddProductsInSalesInvoice from "./importFromSaleOrder";
import ExpencesOfSalesInvoice from "./manageExpences";
import AddProductForm from "./addProducts";
import InvoiceTemplate from "../LRReport/SalesInvPrint/invTemplate";
import AppDialog from "../../../Components/appDialogComponent";
import DeliverySlipprint from "../LRReport/deliverySlipPrint";

const storage = getSessionUser().user;

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const CreateSalesInvoice = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const [baseData, setBaseData] = useState({
        products: [],
        branch: [],
        retailers: [],
        voucherType: [],
        uom: [],
        staff: [],
        staffType: [],
        brand: [],
        godown: [],
        expence: [],
        stockInGodown: [],
        stockItemLedgerName: [],
        batchDetails: []
    });

    const [dialog, setDialog] = useState({
        addProductDialog: false,
        importFromSaleOrder: false,
        godownMismatch: false
    })

    const [invoiceInfo, setInvoiceInfo] = useState(salesInvoiceGeneralInfo);
    const [retailerDeliveryAddress, setRetailerDeliveryAddress] = useState(retailerDeliveryAddressInfo);
    const [retailerShippingAddress, setRetailerShippingAddress] = useState(retailerDeliveryAddressInfo);
    const [invoiceProducts, setInvoiceProduct] = useState([]);
    const [invoiceExpences, setInvoiceExpences] = useState([]);
    const [staffArray, setStaffArray] = useState([]);
    const [retailerSalesStatus, setRetailerSalesStatus] = useState(retailerOutstandingDetails);

    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);

    const isInclusive = isEqualNumber(invoiceInfo.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceInfo.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceInfo.IS_IGST, 1);
    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
    const minimumRows = 3;
    const dummyRowCount = minimumRows - invoiceProducts.length;
    const [printDialog, setPrintDialog] = useState({
        open: false,
        Do_Id: null,
        deliverySlipDialog: false
    });

    const isEdit = useMemo(() => isValidNumber(invoiceInfo?.Do_Id), [invoiceInfo?.Do_Id])

    useEffect(() => {

        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();

                const [
                    branchResponse,
                    productsResponse,
                    retailerResponse,
                    voucherTypeResponse,
                    uomResponse,
                    staffResponse,
                    staffCategory,
                    godownLocationsResponse,
                    expenceResponse,
                    // godownWiseStock,
                    stockItemLedgerNameResponse,
                    batchDetailsResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown` }),
                    fetchLink({ address: `masters/voucher?module=SALES` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/defaultAccountMaster?Type=SALES_INVOICE` }),
                    // fetchLink({ address: `sales/stockInGodown` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=SALES` }),
                    fetchLink({ address: `inventory/batchMaster/stockBalance` })
                ]);

                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );
                const retailersData = (retailerResponse.success ? retailerResponse.data : []).sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                const voucherType = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );
                const uomData = (uomResponse.success ? uomResponse.data : []).sort(
                    (a, b) => String(a.Units).localeCompare(b.Units)
                );
                const staffData = (staffResponse.success ? staffResponse.data : []).sort(
                    (a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name)
                );
                const staffCategoryData = (staffCategory.success ? staffCategory.data : []).sort(
                    (a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category)
                );
                const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                );
                const expencesMaster = (expenceResponse.success ? toArray(expenceResponse.data) : []).sort(
                    (a, b) => String(a?.Account_Name).localeCompare(b?.Account_Name)
                );
                // const stockInGodowns = (godownWiseStock.success ? godownWiseStock.data : []).sort(
                //     (a, b) => String(a?.stock_item_name).localeCompare(b?.stock_item_name)
                // );
                const stockItemLedgerName = (stockItemLedgerNameResponse.success ? stockItemLedgerNameResponse.data : [])

                setBaseData((pre) => ({
                    ...pre,
                    products: productsData,
                    branch: branchData,
                    retailers: retailersData,
                    voucherType: voucherType,
                    uom: uomData,
                    staff: staffData,
                    staffType: staffCategoryData,
                    godown: godownLocations,
                    brand: getUniqueData(productsData, 'Brand', ['Brand_Name']),
                    expence: expencesMaster.map(exp => ({
                        Id: exp.Acc_Id,
                        Expence_Name: exp.Account_Name,
                        percentageValue: exp.percentageValue
                    })),
                    // stockInGodown: stockInGodowns,
                    stockItemLedgerName: stockItemLedgerName,
                    batchDetails: toArray(batchDetailsResponse.data)
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
        if (isValidNumber(invoiceInfo.Retailer_Id)) {
            fetchLink({
                address: `receipt/receiptMaster/pendingSalesInvoiceReceipt/amount?Retailer_Id=${invoiceInfo.Retailer_Id}`,
                loadingOff, loadingOn
            }).then(data => {
                if (data.success) {
                    const invoiceCreationStatus = canCreateInvoice(data?.others);
                    setRetailerSalesStatus(pre => ({
                        ...pre,
                        outstanding: toNumber(data?.others?.outstanding),
                        creditLimit: toNumber(data?.others?.creditLimit),
                        creditDays: toNumber(data?.others?.creditDays),
                        recentDate: data?.others?.recentDate ? new Date(data?.others?.recentDate) : new Date(),
                        invoiceCreationStatus: invoiceCreationStatus
                    }));
                }
            }).catch(console.error);
        } else setRetailerSalesStatus(retailerOutstandingDetails)
    }, [invoiceInfo.Retailer_Id])

    useEffect(() => {
        if (
            isValidObject(editValues) &&
            Array.isArray(editValues?.Products_List)
        ) {
            const { Products_List, Expence_Array, Staffs_Array } = editValues;
            setInvoiceInfo(
                Object.fromEntries(
                    Object.entries(salesInvoiceGeneralInfo).map(([key, value]) => {
                        if (key === 'Do_Date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        return [key, editValues[key] ?? value]
                    })
                )
            );
            setInvoiceProduct(
                Products_List.sort((a, b) => toNumber(a?.S_No) - toNumber(b?.S_No)).map(item => Object.fromEntries(
                    Object.entries(salesInvoiceDetailsInfo).map(([key, value]) => {
                        if (key === 'rowId') return [key, rid()]
                        return [key, item[key] ?? value]
                    })
                ))
            );
            setInvoiceExpences(
                toArray(Expence_Array).map(item => Object.fromEntries(
                    Object.entries(salesInvoiceExpencesInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
            setStaffArray(() => {
                const stateOfStaff = toArray(Staffs_Array).map(item => Object.fromEntries(
                    Object.entries(salesInvoiceStaffInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ));

                return Array.from(
                    new Map(
                        stateOfStaff.map(item => [
                            `${item.Emp_Id}-${item.Emp_Type_Id}`,
                            item
                        ])
                    ).values()
                );
            });
        }
    }, [editValues])

    useEffect(() => {
        const staffs = toArray(editValues?.Staffs_Array)
        if (checkIsNumber(invoiceInfo.Retailer_Id) && baseData.retailers.length && staffs.length === 0) {

            const retailer = toArray(baseData.retailers).find(ret => isEqualNumber(ret?.Retailer_Id, invoiceInfo.Retailer_Id));

            if (!retailer) return;

            setStaffArray(prev => {
                const newStaff = [];

                if (isValidNumber(retailer.brokerId)) {
                    newStaff.push({
                        Emp_Id: retailer.brokerId,
                        Emp_Name: retailer.brokerName,
                        Emp_Type_Id: retailer.brokerTypeId
                    });
                }

                if (isValidNumber(retailer.transporterId)) {
                    newStaff.push({
                        Emp_Id: retailer.transporterId,
                        Emp_Name: retailer.transporterName,
                        Emp_Type_Id: retailer.transporterTypeId
                    });
                }

                let updatedStaff = [...prev];

                newStaff.forEach(ns => {
                    const existingIndex = updatedStaff.findIndex(ps => isEqualNumber(ps.Emp_Type_Id, ns.Emp_Type_Id));

                    if (existingIndex !== -1) {
                        const existing = updatedStaff[existingIndex];
                        // If existing is dummy (no valid Emp_Id), replace it. 
                        // If existing is real (valid Emp_Id), keep it (don't overwrite manual selection).
                        if (!isValidNumber(existing.Emp_Id)) {
                            updatedStaff[existingIndex] = ns;
                        }
                    } else {
                        updatedStaff.push(ns);
                    }
                });

                return updatedStaff;
            });
        }
    }, [invoiceInfo.Retailer_Id, baseData.retailers.length, editValues])

    useEffect(() => {
        if (baseData.stockItemLedgerName.length > 0 && !editValues?.Stock_Item_Ledger_Name) {
            const stockItemName = baseData.stockItemLedgerName[0];

            if (stockItemName) {
                setInvoiceInfo(prev => ({ ...prev, Stock_Item_Ledger_Name: stockItemName?.Stock_Item_Ledger_Name }));
            }
        }
    }, [editValues, baseData.stockItemLedgerName])

    useEffect(() => {
        const retailerId = invoiceInfo?.Retailer_Id;

        if (isValidNumber(retailerId)) {
            const retailerDetails = baseData.retailers.find(ret => isEqualNumber(ret.Retailer_Id, retailerId)) || {};

            const retailerAddress = toArray(retailerDetails?.deliveryAddresses);
            const {
                lolDeliveryName = '',
                lolPhoneNumber = '',
                lolCityName = '',
                lolDeliveryAddress = '',
                lolGstNumber = '',
                lolStateName = ''
            } = retailerDetails;
            // const withGstNumber = retailerAddress.find(add => isValidValue(add.gstNumber));
            // const firstAddress = retailerAddress[0];

            const billingAddress = retailerAddress.find(
                addr => isEqualNumber(addr?.id, invoiceInfo?.deliveryAddressId)
            ) ?? null;

            if (billingAddress) {
                setAddress(billingAddress, setRetailerDeliveryAddress)
            } else {
                setAddress({
                    deliveryName: lolDeliveryName,
                    phoneNumber: lolPhoneNumber,
                    cityName: lolCityName,
                    deliveryAddress: lolDeliveryAddress,
                    gstNumber: lolGstNumber,
                    stateName: lolStateName
                }, setRetailerDeliveryAddress)
            }

            // else if (withGstNumber) {
            //     setAddress(withGstNumber, setRetailerDeliveryAddress)
            // } else if (firstAddress) {
            //     setAddress({
            //         ...firstAddress,
            //         gstNumber: retailerDetails.Gstno ? String(retailerDetails.Gstno) : '',
            //         id: retailerDetails.Gstno ? null : firstAddress.id
            //     }, setRetailerDeliveryAddress)
            // } else {
            //     setAddress(retailerDeliveryAddressInfo, setRetailerDeliveryAddress)
            // }

            const shippingAddress = retailerAddress.find(
                addr => isEqualNumber(addr?.id, invoiceInfo?.shipingAddressId)
            ) ?? null;

            if (shippingAddress) {
                setAddress(shippingAddress, setRetailerShippingAddress)
            } else {
                setAddress({
                    deliveryName: lolDeliveryName,
                    phoneNumber: lolPhoneNumber,
                    cityName: lolCityName,
                    deliveryAddress: lolDeliveryAddress,
                    gstNumber: lolGstNumber,
                    stateName: lolStateName
                }, setRetailerShippingAddress)
            }

            // else if (withGstNumber) {
            //     setAddress(withGstNumber, setRetailerShippingAddress)
            // } else if (firstAddress) {
            //     setAddress({
            //         ...firstAddress,
            //         gstNumber: retailerDetails.Gstno ? String(retailerDetails.Gstno) : '',
            //         id: retailerDetails.Gstno ? null : firstAddress.id
            //     }, setRetailerShippingAddress)
            // } else {
            //     setAddress(retailerDeliveryAddressInfo, setRetailerShippingAddress)
            // }
        }
    }, [baseData.retailers, invoiceInfo.Retailer_Id])

    useEffect(() => {
        const defaultStaffTypesData = defaultStaffTypes(baseData.staffType);
        setStaffArray(pre => {
            const newDefaults = defaultStaffTypesData.filter(def =>
                !pre.some(p => isEqualNumber(p.Emp_Type_Id, def.Emp_Type_Id))
            );
            return [...pre, ...newDefaults];
        })
    }, [baseData.staffType])

    useEffect(() => {
        setInvoiceProduct(pre => {
            const exist = [...pre];

            return exist.map(item => {
                return Object.fromEntries(
                    Object.entries(item).map(([key, value]) => {
                        const productMaster = findProductDetails(baseData.products, item?.Item_Id);
                        const gstPercentage = IS_IGST ? productMaster.Igst_P : productMaster.Gst_P;
                        const isTaxable = gstPercentage > 0;

                        const { Bill_Qty, Item_Rate, Amount } = item;

                        const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                        const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                        const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                        const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                        const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                        const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                        switch (key) {
                            case 'Taxable_Rate': return [key, itemRateGst.base_amount]
                            case 'Total_Qty': return [key, Bill_Qty]
                            case 'Taxble': return [key, isTaxable ? 1 : 0]
                            case 'Taxable_Amount': return [key, gstInfo.base_amount]
                            case 'Tax_Rate': return [key, gstPercentage]
                            case 'Cgst':
                            case 'Sgst': return [key, cgstPer ?? 0]
                            case 'Cgst_Amo':
                            case 'Sgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
                            case 'Igst': return [key, igstPer ?? 0]
                            case 'Igst_Amo': return [key, isNotTaxableBill ? 0 : Igst_Amo]
                            case 'Final_Amo': return [key, gstInfo.with_tax]

                            default: return [key, item[key] || value]
                        }
                    })
                )
            })
        });
    }, [baseData.products, IS_IGST, taxType]);

    useEffect(() => {
        setInvoiceExpences(pre => {
            const exist = [...pre];

            return exist.map(item => {
                const
                    Igst = IS_IGST ? toNumber(item?.Igst) : 0,
                    Cgst = !IS_IGST ? toNumber(item?.Cgst) : 0,
                    Sgst = !IS_IGST ? toNumber(item?.Sgst) : 0,
                    Expence_Value = toNumber(item?.Expence_Value),
                    taxPercentage = IS_IGST ? Igst : Addition(Cgst, Sgst);

                const taxAmount = calculateGSTDetails(Expence_Value, taxPercentage, taxType);

                return {
                    ...item,
                    Cgst, Sgst, Igst,
                    Expence_Value,
                    Cgst_Amo: Cgst > 0 ? taxAmount.cgst_amount : 0,
                    Sgst_Amo: Sgst > 0 ? taxAmount.sgst_amount : 0,
                    Igst_Amo: Igst > 0 ? taxAmount.igst_amount : 0,
                }
            })
        })
    }, [baseData.expence, IS_IGST, taxType])

    // Expence Info

    const invExpencesTotal = useMemo(() => {
        return toArray(invoiceExpences).reduce((acc, exp) => Addition(acc, exp?.Expence_Value), 0)
    }, [invoiceExpences]);

    const Total_Invoice_value = useMemo(() => {
        const invValue = invoiceProducts.reduce((acc, item) => {
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
    }, [invoiceProducts, isNotTaxableBill, baseData.products, IS_IGST, isInclusive, invExpencesTotal])

    const taxSplitUp = useMemo(() => {
        if (toArray(invoiceProducts).length === 0) return {};

        let totalTaxable = 0;
        let totalTax = 0;

        invoiceProducts.forEach(item => {
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

    }, [invoiceProducts, baseData.products, IS_IGST, isNotTaxableBill, isInclusive, invExpencesTotal]);

    useEffect(() => {
        if (taxSplitUp?.roundOff && taxSplitUp?.roundOff !== invoiceInfo.Round_off) {
            setInvoiceInfo(pre => ({ ...pre, Round_off: taxSplitUp.roundOff }));
        }
    }, [taxSplitUp?.roundOff]);

    const clearValues = () => {
        setInvoiceInfo(salesInvoiceGeneralInfo);
        setInvoiceProduct([]);
        setInvoiceExpences([]);
        setStaffArray([]);
    }

    const saveSalesInvoice = () => {

        if (isValidNumber(invoiceInfo?.Do_Id) && filterableText(invoiceInfo?.Alter_Reason).length === 0) {
            toast.warn('Alter reason is required');
            return;
        }

        if (retailerSalesStatus.forceCreateInvoice === false && retailerSalesStatus.invoiceCreationStatus === false) {
            setRetailerSalesStatus(pre => ({ ...pre, dialog: true }));
            return;
        }

        fetchLink({
            address: `sales/salesInvoice`,
            method: checkIsNumber(invoiceInfo?.Do_Id) ? 'PUT' : 'POST',
            loadingOff, loadingOn,
            bodyData: {
                ...invoiceInfo,
                deliveryAddressDetails: {
                    delivery_id: retailerDeliveryAddress?.id,
                    deliveryName: retailerDeliveryAddress?.deliveryName,
                    phoneNumber: retailerDeliveryAddress?.phoneNumber,
                    cityName: retailerDeliveryAddress?.cityName,
                    deliveryAddress: retailerDeliveryAddress?.deliveryAddress,
                    gstNumber: retailerDeliveryAddress?.gstNumber,
                    stateName: retailerDeliveryAddress?.stateName
                },
                shipingAddressDetails: {
                    delivery_id: retailerShippingAddress?.id,
                    deliveryName: retailerShippingAddress?.deliveryName,
                    phoneNumber: retailerShippingAddress?.phoneNumber,
                    cityName: retailerShippingAddress?.cityName,
                    deliveryAddress: retailerShippingAddress?.deliveryAddress,
                    gstNumber: retailerShippingAddress?.gstNumber,
                    stateName: retailerShippingAddress?.stateName
                },
                Product_Array: invoiceProducts.map((item, index) => ({ ...item, S_No: index + 1 })),
                Staffs_Array: Array.from(
                    new Map(
                        staffArray.filter(
                            item => isValidNumber(item.Emp_Id) && isValidNumber(item.Emp_Type_Id)
                        ).map(item => [
                            `${item.Emp_Id}-${item.Emp_Type_Id}`,
                            item
                        ])
                    ).values()
                ),
                Expence_Array: invoiceExpences
            }
        }).then(data => {
            if (data.success) {
                const savedDoId = data.others?.Do_Id;

                toast.success(data.message);

                // Open print dialog with the saved Do_Id
                setPrintDialog({
                    open: true,
                    Do_Id: savedDoId,
                    deliverySlipDialog: false
                });

                // Clear form after successful submission (optional)
                // clearValues();
            } else {
                toast.warn(data.message);
            }
        }).catch(e => {
            console.error(e);
            toast.error("Failed to save invoice");
        })
    }

    const voucherGodownCondition = useMemo(() => {
        if (isEdit) return true;
        const selectedVoucher = baseData.voucherType.find(item => isEqualNumber(item.Vocher_Type_Id, invoiceInfo.Voucher_Type)) || {};
        const voucherGodown = toNumber(selectedVoucher?.GodownId);
        const productHasGodown = invoiceProducts.length > 0 && invoiceProducts.every(item => isEqualNumber(item?.GoDown_Id, voucherGodown));
        return productHasGodown;
    }, [baseData.voucherType, invoiceInfo.Voucher_Type, invoiceProducts, isEdit]);

    const isStockValid = useMemo(() => {
        if (isEdit) return true;
        if (invoiceProducts.length === 0) return true;

        const hasPositive = invoiceProducts.some(item => {
            const stock = toNumber(item?.Godown_Stock);
            const qty = toNumber(item?.Bill_Qty);
            return Subraction(stock, qty) >= 0;
        });

        const hasNegative = invoiceProducts.some(item => {
            const stock = toNumber(item?.Godown_Stock);
            const qty = toNumber(item?.Bill_Qty);
            return Subraction(stock, qty) < 0;
        });

        return !(hasPositive && hasNegative);
    }, [invoiceProducts, isEdit]);

    const cumulativeRow = useMemo(() => {
        if (invoiceProducts.length > 0) {
            const totals = invoiceProducts.reduce(
                (acc, item) => ({
                    Act_Qty: Addition(acc.Act_Qty, item.Act_Qty),
                    Alt_Act_Qty: Addition(acc.Alt_Act_Qty, item.Alt_Act_Qty),
                    Bill_Qty: Addition(acc.Bill_Qty, item.Bill_Qty),
                    Alt_Bill_Qty: Addition(acc.Alt_Bill_Qty, item.Alt_Bill_Qty),
                    Amount: Addition(acc.Amount, item.Amount),
                }),
                {
                    Act_Qty: 0,
                    Alt_Act_Qty: 0,
                    Bill_Qty: 0,
                    Alt_Bill_Qty: 0,
                    Amount: 0,
                }
            );

            return {
                ...salesInvoiceDetailsInfo,
                ...totals,
                Item_Name: 'Total',
                Item_Id: 'TOTAL_ROW',
            };
        }
        return null;
    }, [invoiceProducts]);

    const saveFunWithCodition = () => {
        if (voucherGodownCondition) {
            saveSalesInvoice();
        } else {
            setDialog(pre => ({ ...pre, godownMismatch: true }));
        }
    }

    return (
        <>

            <AddProductForm
                orderProducts={invoiceProducts}
                setOrderProducts={setInvoiceProduct}
                open={dialog.addProductDialog}
                onClose={() => {
                    setDialog(pre => ({ ...pre, addProductDialog: false }))
                    setSelectedProductToEdit(null);
                }}
                products={baseData.products}
                brands={baseData.brand}
                uom={baseData.uom}
                godowns={baseData.godown}
                GST_Inclusive={invoiceInfo.GST_Inclusive}
                IS_IGST={IS_IGST}
                editValues={selectedProductToEdit}
                initialValue={{ ...salesInvoiceDetailsInfo, Pre_Id: invoiceInfo.So_No, rowId: rid() }}
                batchDetails={baseData.batchDetails}
                saleOrderNumber={toNumber(invoiceInfo.So_No)}
                voucherType={invoiceInfo}
            />

            <Card>
                <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                    <span className="flex-grow-1 fa-16 fw-bold">Sales Invoice</span>
                    <span>
                        <Button type='button' onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/erp/sales/invoice');
                            }
                        }}>Cancel</Button>
                        <Button onClick={saveFunWithCodition} variant="contained" disabled={!isStockValid}>submit</Button>
                    </span>
                </div>
                <CardContent>
                    <div className="row p-0">
                        {/* staff info */}
                        <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                            <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                <InvolvedStaffs
                                    StaffArray={staffArray}
                                    setStaffArray={setStaffArray}
                                    costCenter={baseData.staff}
                                    costCategory={baseData.staffType}
                                />
                            </div>
                        </div>

                        {/* general info */}
                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                                <ManageSalesInvoiceGeneralInfo
                                    invoiceInfo={invoiceInfo}
                                    setInvoiceInfo={setInvoiceInfo}
                                    retailers={baseData.retailers}
                                    branches={baseData.branch}
                                    voucherType={baseData.voucherType}
                                    stockItemLedgerName={baseData.stockItemLedgerName}
                                    onChangeRetailer={() => {
                                        // setInvoiceProduct([]);
                                        // setInvoiceExpences([]);
                                    }}
                                    retailerDeliveryAddress={retailerDeliveryAddress}
                                    setRetailerDeliveryAddress={setRetailerDeliveryAddress}
                                    shippingAddress={retailerShippingAddress}
                                    setShippingAddress={setRetailerShippingAddress}
                                    retailerSalesStatus={retailerSalesStatus}
                                    staffArray={staffArray}
                                    setStaffArray={setStaffArray}
                                />
                            </div>
                        </div>
                    </div>

                    {!isStockValid && (
                        <div className="alert alert-danger p-2 mb-2">
                            Can't save invoice with mixed stock (positive and negative). Please ensure all items have either positive or negative stock.
                        </div>
                    )}

                    {/* product details */}
                    <FilterableTable
                        title="Items"
                        headerFontSizePx={13}
                        bodyFontSizePx={13}
                        EnableSerialNumber
                        disablePagination
                        ButtonArea={
                            <>
                                <Button
                                    onClick={() => {
                                        setSelectedProductToEdit(null);
                                        setDialog(pre => ({ ...pre, addProductDialog: true }));
                                    }}
                                    sx={{ ml: 1 }}
                                    variant='outlined'
                                    type="button"
                                    startIcon={<Add />}
                                    disabled={
                                        !checkIsNumber(invoiceInfo.Retailer_Id)
                                        || (invoiceProducts.length > 0
                                            && checkIsNumber(invoiceInfo.So_No))
                                    }
                                >Add Product</Button>

                                <AddProductsInSalesInvoice
                                    loadingOn={loadingOn}
                                    loadingOff={loadingOff}
                                    open={dialog.importFromSaleOrder}
                                    onClose={() => setDialog(pre => ({ ...pre, importFromSaleOrder: false }))}
                                    retailer={invoiceInfo?.Retailer_Id}
                                    selectedItems={invoiceProducts}
                                    setSelectedItems={setInvoiceProduct}
                                    staffArray={staffArray}
                                    setStaffArray={setStaffArray}
                                    products={baseData.products}
                                    GST_Inclusive={invoiceInfo.GST_Inclusive}
                                    IS_IGST={IS_IGST}
                                    invoiceInfo={invoiceInfo}
                                    setInvoiceInfo={setInvoiceInfo}
                                    godowns={baseData.godown}
                                    stockInGodown={baseData.stockInGodown}
                                >
                                    <Button
                                        onClick={() => setDialog(pre => ({ ...pre, importFromSaleOrder: true }))}
                                        disabled={
                                            !checkIsNumber(invoiceInfo.Retailer_Id)
                                            || (
                                                invoiceProducts.length > 0
                                                && !checkIsNumber(invoiceInfo.So_No)
                                            )
                                        }
                                        sx={{ ml: 1 }}
                                        type="button"
                                        variant='outlined'
                                        startIcon={<ReceiptLong />}
                                    >Choose Sale Order</Button>
                                </AddProductsInSalesInvoice>
                            </>
                        }
                        dataArray={[
                            ...invoiceProducts,
                            ...Array.from({
                                length: dummyRowCount > 0 ? dummyRowCount : 0
                            }).map(d => salesInvoiceDetailsInfo),
                            ...(cumulativeRow ? [cumulativeRow] : []),
                        ]}
                        columns={[
                            createCol('Item_Name', 'string'),
                            createCol('Batch_Name', 'string'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Act Qty',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    return row?.Act_Qty ? `${row?.Act_Qty} (${row?.Alt_Act_Qty})` : '';
                                }
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Bill Qty',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    return row?.Bill_Qty ? `${row?.Bill_Qty} (${row?.Alt_Bill_Qty})` : '';
                                }
                            },
                            createCol('Item_Rate', 'number'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Tax',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const { Cgst = 0, Sgst = 0, Igst = 0, Cgst_Amo = 0, Sgst_Amo = 0, Igst_Amo = 0 } = row;
                                    const taxPercentage = IS_IGST ? Igst : Addition(Cgst, Sgst);
                                    const taxAmount = IS_IGST ? Igst_Amo : Addition(Cgst_Amo, Sgst_Amo);

                                    return !checkIsNumber(row?.Item_Id) ? '' : `${taxAmount} - (${taxPercentage} %)`
                                }
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Godown',
                                isCustomCell: true,
                                Cell: ({ row }) => baseData.godown.find(
                                    godown => isEqualNumber(godown.Godown_Id, row?.GoDown_Id)
                                )?.Godown_Name ?? ''
                            },
                            createCol('Amount', 'number'),
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    return (
                                        <>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedProductToEdit(row);
                                                    setDialog(pre => ({ ...pre, addProductDialog: true }));
                                                }}
                                                size="small"
                                                type="button"
                                                disabled={!checkIsNumber(row?.Item_Id)}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                type="button"
                                                onClick={() => setInvoiceProduct(
                                                    pre => pre.filter(obj => obj.rowId !== row.rowId)
                                                )}
                                                color='error'
                                                disabled={!checkIsNumber(row?.Item_Id)}
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
                    />

                    <br />

                    <ExpencesOfSalesInvoice
                        invoiceExpences={invoiceExpences}
                        setInvoiceExpences={setInvoiceExpences}
                        expenceMaster={baseData.expence}
                        IS_IGST={IS_IGST}
                        taxType={taxType}
                        Total_Invoice_value={Total_Invoice_value}
                        invoiceProducts={invoiceProducts}
                        findProductDetails={findProductDetails}
                        products={baseData.products}
                    />

                    <br />

                    <SalesInvoiceTaxDetails
                        invoiceExpences={invoiceExpences}
                        isNotTaxableBill={isNotTaxableBill}
                        isInclusive={isInclusive}
                        IS_IGST={IS_IGST}
                        products={baseData.products}
                        invoiceInfo={invoiceInfo}
                        setInvoiceInfo={setInvoiceInfo}
                        invExpencesTotal={invExpencesTotal}
                        Total_Invoice_value={Total_Invoice_value}
                        taxSplitUp={taxSplitUp}
                    />

                    {/* narration */}
                    {/* <div className="col-12 p-2"> */}
                    <label className='fa-13'>Narration</label>
                    <textarea
                        className="cus-inpt fa-14"
                        rows={2}
                        value={invoiceInfo.Narration}
                        onChange={e => setInvoiceInfo(pre => ({ ...pre, Narration: e.target.value }))}
                    />
                    {/* </div> */}
                </CardContent>
                <CardActions className="d-flex justify-content-end">
                    <Button type='button' onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate('/erp/sales/invoice');
                        }
                    }}>Cancel</Button>
                    <Button onClick={saveFunWithCodition} variant="contained" disabled={!isStockValid}>submit</Button>
                </CardActions>
            </Card>

            <AppDialog
                open={dialog.godownMismatch}
                onClose={() => setDialog(pre => ({ ...pre, godownMismatch: false }))}
                title="Godown Mismatch"
                submitText="Yes"
                closeText="No"
                onSubmit={() => {
                    setDialog(pre => ({ ...pre, godownMismatch: false }));
                    saveSalesInvoice();
                }}
            >
                The godown is not match with Voucher type anyway do you want to save?
            </AppDialog>

            <AppDialog
                open={retailerSalesStatus.dialog}
                onClose={() => setRetailerSalesStatus(pre => ({ ...pre, dialog: false }))}
                title="Retailer Sales Status"
                onSubmit={() => {
                    setRetailerSalesStatus(pre => ({ ...pre, dialog: false, forceCreateInvoice: true }));
                    saveSalesInvoice();
                }}
                submitText="Yes"
                closeText="No"
                maxWidth="sm"
                fullWidth
                isSubmit
            >
                <h3>The Retailer Exceeds the credit limit and credit days!</h3>
                <p>Anyway Do you want to create invoice?</p>
            </AppDialog>

            <Dialog
                open={printDialog.open}
                maxWidth="lg"
                fullWidth
                scroll="paper"
                onClose={() => {
                    setPrintDialog({ open: false, Do_Id: null, deliverySlipDialog: false });
                    clearValues();
                    navigate('/erp/sales/invoice');
                }}
            >
                <DialogTitle className="d-flex align-items-center justify-content-between">
                    <span>Print Invoice #{printDialog.Do_Id}</span>
                    <div className="d-flex align-items-center">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setPrintDialog({
                                    open: false,
                                    Do_Id: printDialog.Do_Id,
                                    deliverySlipDialog: true
                                });
                            }}
                            sx={{ mr: 1 }}
                        >
                            Delivery Slip
                        </Button>
                        <IconButton
                            onClick={() => {
                                setPrintDialog({ open: false, Do_Id: null, deliverySlipDialog: false });
                                clearValues();
                                navigate('/erp/sales/invoice');
                            }}
                            size="small"
                        >
                            <Close />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {printDialog.Do_Id && (
                        <InvoiceTemplate
                            Do_Id={printDialog.Do_Id}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setPrintDialog({ open: false, Do_Id: null, deliverySlipDialog: false });
                            clearValues();
                            navigate('/erp/sales/invoice');
                        }}
                    >
                        Close and Go to Listing
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={printDialog.deliverySlipDialog || false}
                onClose={() => {
                    setPrintDialog({
                        open: false,
                        Do_Id: null,
                        deliverySlipDialog: false
                    });
                    navigate('/erp/sales/invoice');
                }}
                maxWidth="lg"
                fullWidth
                scroll="paper"
            >
                <DialogTitle className="d-flex align-items-center justify-content-between">
                    <span>Delivery Slip for Invoice #{printDialog.Do_Id}</span>
                    <IconButton
                        onClick={() => {
                            setPrintDialog({
                                open: false,
                                Do_Id: null,
                                deliverySlipDialog: false
                            });
                            navigate('/erp/sales/invoice');
                        }}
                        size="small"
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {printDialog.Do_Id && (
                        <DeliverySlipprint
                            Do_Id={printDialog.Do_Id}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setPrintDialog({
                                open: false,
                                Do_Id: null,
                                deliverySlipDialog: false
                            });
                            navigate('/erp/sales/invoice');
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default CreateSalesInvoice;