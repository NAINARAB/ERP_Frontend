import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, Dialog, DialogTitle, DialogContent, DialogActions, CardActions } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, ISOString, getUniqueData, Addition,
    checkIsNumber, toNumber, toArray, RoundNumber, isValidNumber,
    rid, Subraction, filterableText, generateUUID, reactSelectFilterLogic,
    Division, Multiplication
} from "../../../Components/functions";
import { Close } from "@mui/icons-material";
import { Add, Delete, ReceiptLong } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import Select from 'react-select';
import { customSelectStyles } from '../../../Components/tablecolumn';

import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import {
    salesInvoiceGeneralInfo, salesInvoiceDetailsInfo, salesInvoiceExpencesInfo,
    salesInvoiceStaffInfo, retailerDeliveryAddressInfo,
    retailerOutstandingDetails,
    canCreateInvoice,
    setAddress,
    defaultStaffTypes,
    commonGodownForProducts
} from './variable';
import InvolvedStaffs from "./manageInvolvedStaff";
import ManageSalesInvoiceGeneralInfo from "./manageGeneralInfo";
import SalesInvoiceTaxDetails from "./taxDetails";
import ExpencesOfSalesInvoice from "./manageExpences";
import AddProductForm from "./addProducts";
import InvoiceTemplate from "../LRReport/SalesInvPrint/invTemplate";
import AppDialog from "../../../Components/appDialogComponent";
import DeliverySlipprint from "../LRReport/deliverySlipPrint";
import { getModuleAccess } from "../../../Components/moduleAccess";
import SalesInvoicePreview from "./salesInvoicePreview";

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const CreateSalesInvoice = ({ loadingOn, loadingOff, isLoading }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const [requestId, setRequestId] = useState(generateUUID());
    const [commonGodown, setCommonGodown] = useState(commonGodownForProducts);
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
        batchDetails: [],
        moduleConfiguration: []
    });

    const [dialog, setDialog] = useState({
        addProductDialog: false,
        importFromSaleOrder: false,
        godownMismatch: false
    });

    const [saleOrderDetails, setSaleOrderDetails] = useState({
        generalInfo: {},
        products: []
    })

    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewNavState, setPreviewNavState] = useState({ currentDoId: null, latestDoId: null });

    const [invoiceInfo, setInvoiceInfo] = useState(salesInvoiceGeneralInfo);
    const [retailerDeliveryAddress, setRetailerDeliveryAddress] = useState(retailerDeliveryAddressInfo);
    const [retailerShippingAddress, setRetailerShippingAddress] = useState(retailerDeliveryAddressInfo);
    const [invoiceProducts, setInvoiceProduct] = useState([]);
    const [invoiceExpences, setInvoiceExpences] = useState([]);
    const [staffArray, setStaffArray] = useState([]);
    const [retailerSalesStatus, setRetailerSalesStatus] = useState(retailerOutstandingDetails);

    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
    const [fetchedAddresses, setFetchedAddresses] = useState([]);

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
                    batchDetailsResponse,
                    moduleConfigurationResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown` }),
                    fetchLink({ address: `masters/voucher?module=SALE_INVOICE` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/defaultAccountMaster?Type=SALE_INVOICE` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=SALES` }),
                    fetchLink({ address: `inventory/batchMaster/stockBalance` }),
                    fetchLink({ address: `authorization/moduleRules?moduleName=SALE_INVOICE` })
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
                const stockItemLedgerName = (stockItemLedgerNameResponse.success ? stockItemLedgerNameResponse.data : []);
                const moduleConfiguration = moduleConfigurationResponse.success ? moduleConfigurationResponse.data : [];

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
                    stockItemLedgerName: stockItemLedgerName,
                    batchDetails: toArray(batchDetailsResponse.data),
                    moduleConfiguration: moduleConfiguration
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
                        invoiceCreationStatus: invoiceCreationStatus,
                        creditBills: toNumber(data?.others?.creditBills),
                        creditBillLimitCount: toNumber(data?.others?.creditBillLimitCount),
                        creditBillValidation: data?.others?.creditBillValidation ?? true
                    }));
                    setInvoiceInfo(pre => ({ ...pre, paymentDueDays: toNumber(data?.others?.creditDays) || '' }));
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
        if (isValidNumber(invoiceInfo?.So_No)) {
            fetchLink({
                address: `sales/saleOrder/getById?So_Id=${invoiceInfo.So_No}`
            }).then(data => {
                if (data.success) {
                    setSaleOrderDetails({
                        generalInfo: data.others?.generalInfo ?? {},
                        products: data.others?.products ?? []
                    });
                }
            }).catch(console.error);
        }
    }, [invoiceInfo?.So_No])

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
            fetchLink({
                address: `masters/retailers/address?Retailer_Id=${retailerId}`
            }).then(res => {
                const retailerAddress = res.success ? toArray(res.data) : [];

                const seen = new Set();
                const distinctAddresses = retailerAddress.filter(addr => {
                    const key = `${addr.deliveryName}|${addr.phoneNumber}|${addr.cityName}|${addr.deliveryAddress}|${addr.gstNumber}|${addr.stateName}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

                setFetchedAddresses(distinctAddresses);

                const retailerDetails = baseData.retailers.find(ret => isEqualNumber(ret.Retailer_Id, retailerId)) || {};

                const {
                    lolDeliveryName = '',
                    lolPhoneNumber = '',
                    lolCityName = '',
                    lolDeliveryAddress = '',
                    lolGstNumber = '',
                    lolStateName = ''
                } = retailerDetails;

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
            }).catch(console.error);
        } else {
            setFetchedAddresses([]);
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

    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/godownStockDetails?Godown_Id=${commonGodown.value}`
        }).then(({ data, success }) => {
            if (success) {
                setBaseData(pre => ({ ...pre, stockInGodown: data }))
            }
        }).catch(console.error);
    }, [commonGodown.value]);

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

        if (isLoading) return;

        if (isValidNumber(invoiceInfo?.Do_Id) && filterableText(invoiceInfo?.Alter_Reason).length === 0) {
            toast.warn('Alter reason is required');
            return;
        }

        fetchLink({
            address: `sales/salesInvoice`,
            method: checkIsNumber(invoiceInfo?.Do_Id) ? 'PUT' : 'POST',
            loadingOff, loadingOn,
            headers: {
                'Idempotency-Key': requestId
            },
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
                Product_Array: invoiceProducts
                    .filter(item => checkIsNumber(item.Item_Id))
                    .map((item, index) => {
                        const productMaster = findProductDetails(baseData.products, item.Item_Id);
                        const gstPercentage = IS_IGST ? productMaster.Igst_P : productMaster.Gst_P;
                        const isTaxable = gstPercentage > 0;
                        const Amount = toNumber(item.Amount);
                        const Item_Rate = toNumber(item.Item_Rate);
                        const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                        const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                        const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                        const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                        const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                        const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                        return {
                            ...item,
                            S_No: index + 1,
                            GoDown_Id: commonGodown.value,
                            Total_Qty: item.Bill_Qty,
                            Taxble: isTaxable ? 1 : 0,
                            Taxable_Rate: itemRateGst.base_amount,
                            Taxable_Amount: gstInfo.base_amount,
                            Tax_Rate: gstPercentage,
                            Cgst: cgstPer ?? 0,
                            Sgst: cgstPer ?? 0,
                            Cgst_Amo: isNotTaxableBill ? 0 : Cgst_Amo,
                            Sgst_Amo: isNotTaxableBill ? 0 : Cgst_Amo,
                            Igst: igstPer ?? 0,
                            Igst_Amo: isNotTaxableBill ? 0 : Igst_Amo,
                            Final_Amo: gstInfo.with_tax,
                        };
                    }),
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
            if (!isEqualNumber(data.statusCode, 409)) {
                setRequestId(generateUUID());
            }
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

    const parseAndSetPreviewData = (data) => {
        const Products_List = toArray(data.Products_List);
        const Expence_Array = toArray(data.Expence_Array);
        const Staffs_Array = toArray(data.Staffs_Array);

        const pInvoiceInfo = Object.fromEntries(
            Object.entries(salesInvoiceGeneralInfo).map(([key, value]) => {
                if (key === 'Do_Date') return [key, data[key] ? ISOString(data[key]) : value]
                return [key, data[key] ?? value]
            })
        );

        const pInvoiceProduct = Products_List.sort((a, b) => toNumber(a?.S_No) - toNumber(b?.S_No)).map(item => Object.fromEntries(
            Object.entries(salesInvoiceDetailsInfo).map(([key, value]) => {
                if (key === 'rowId') return [key, rid()]
                return [key, item[key] ?? value]
            })
        ));

        const pInvoiceExpences = toArray(Expence_Array).map(item => Object.fromEntries(
            Object.entries(salesInvoiceExpencesInfo).map(([key, value]) => {
                return [key, item[key] ?? value]
            })
        ));

        const stateOfStaff = toArray(Staffs_Array).map(item => Object.fromEntries(
            Object.entries(salesInvoiceStaffInfo).map(([key, value]) => {
                return [key, item[key] ?? value]
            })
        ));

        const pStaffArray = Array.from(
            new Map(
                stateOfStaff.map(item => [
                    `${item.Emp_Id}-${item.Emp_Type_Id}`,
                    item
                ])
            ).values()
        );

        setPreviewData({
            invoiceInfo: pInvoiceInfo,
            invoiceProduct: pInvoiceProduct,
            invoiceExpences: pInvoiceExpences,
            staffArray: pStaffArray,
            originalData: data
        });
    };

    const fetchLastInvoicePreview = async () => {
        if (!invoiceInfo?.Retailer_Id) return;
        if (loadingOn) loadingOn();
        try {
            const res = await fetchLink({
                address: `sales/salesInvoice/lastInvoice?Retailer_Id=${invoiceInfo.Retailer_Id}`
            });
            if (res.success && res.data && res.data.length > 0) {
                const data = res.data[0];
                parseAndSetPreviewData(data);
                setPreviewNavState({ currentDoId: data.Do_Id, latestDoId: data.Do_Id });
                setPreviewDialogOpen(true);
            } else {
                toast.info('No previous invoice found for this retailer.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to fetch previous invoice');
        } finally {
            if (loadingOff) loadingOff();
        }
    };

    const fetchAdjacentInvoice = async (direction) => {
        if (!invoiceInfo?.Retailer_Id || !previewNavState.currentDoId) return;
        if (loadingOn) loadingOn();
        try {
            const res = await fetchLink({
                address: `sales/salesInvoice/adjacentInvoice?Retailer_Id=${invoiceInfo.Retailer_Id}&Do_Id=${previewNavState.currentDoId}&direction=${direction}`
            });
            if (res.success && res.data && res.data.length > 0) {
                const data = res.data[0];
                parseAndSetPreviewData(data);
                setPreviewNavState(prev => ({ ...prev, currentDoId: data.Do_Id }));
            } else {
                toast.info(direction === 'prev' ? 'No older invoice found.' : 'No newer invoice found.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to fetch invoice');
        } finally {
            if (loadingOff) loadingOff();
        }
    };

    const salesInvoiceAccess = useMemo(() => {
        const crudAction = isEdit ? 3 : 1;
        return {
            stockSeparation: getModuleAccess(baseData.moduleConfiguration, 'SI_1', crudAction),   // Blocked
            batchUsage: getModuleAccess(baseData.moduleConfiguration, 'SI_2', crudAction),        // Warning
            singleGodown: getModuleAccess(baseData.moduleConfiguration, 'SI_3', crudAction),      // Warning
            creditAmountLimit: getModuleAccess(baseData.moduleConfiguration, 'SI_4', crudAction), // Blocked
            creditDaysLimit: getModuleAccess(baseData.moduleConfiguration, 'SI_5', crudAction),   // Blocked
            voucherBasedGodown: getModuleAccess(baseData.moduleConfiguration, 'SI_6', crudAction),// Warning
            creditBillCountLimit: getModuleAccess(baseData.moduleConfiguration, 'SI_7', crudAction) // Blocked
        };
    }, [baseData.moduleConfiguration, isEdit]);

    const activeInvoiceCreationStatus = useMemo(() => {
        const { outstanding, creditLimit, creditDays, recentDate, forceCreateInvoice, creditBillValidation } = retailerSalesStatus;

        if (forceCreateInvoice) return true;
        if (!recentDate) return true;

        const baseDate = new Date(recentDate);
        const expiryDate = new Date(baseDate);
        expiryDate.setDate(expiryDate.getDate() + toNumber(creditDays));
        const today = new Date();

        const currentTotal = taxSplitUp?.invoiceTotal || 0;
        const isOutstandingExceeded = toNumber(creditLimit) > 0
            ? Addition(toNumber(outstanding), currentTotal) > toNumber(creditLimit)
            : false;

        const isCreditDaysCrossed = toNumber(creditDays) > 0
            ? today > expiryDate
            : false;

        if (salesInvoiceAccess.creditAmountLimit && isOutstandingExceeded) return false;
        if (salesInvoiceAccess.creditDaysLimit && isCreditDaysCrossed) return false;

        return true;
    }, [retailerSalesStatus, salesInvoiceAccess, taxSplitUp?.invoiceTotal]);

    const isCreditBillLimitExceeded = useMemo(() => {
        if (!salesInvoiceAccess.creditBillCountLimit) return false;
        const { creditBillValidation, creditBillLimitCount } = retailerSalesStatus;
        if (toNumber(creditBillLimitCount) <= 0) return false;
        return creditBillValidation === false;
    }, [retailerSalesStatus, salesInvoiceAccess.creditBillCountLimit]);

    const selectedVoucher = useMemo(() => {
        return baseData.voucherType.find(item => isEqualNumber(item.Vocher_Type_Id, invoiceInfo.Voucher_Type)) || {};
    }, [baseData.voucherType, invoiceInfo.Voucher_Type]);

    const voucherCrLimitValid = useMemo(() => {
        const crLimit = toNumber(selectedVoucher?.crLimit);
        if (crLimit <= 0) return true; // 0 = unlimited
        const invoiceTotal = toNumber(taxSplitUp?.invoiceTotal);
        return invoiceTotal <= crLimit;
    }, [selectedVoucher, taxSplitUp?.invoiceTotal]);

    const voucherGodownCondition = useMemo(() => {
        if (!salesInvoiceAccess.voucherBasedGodown) return true;
        if (isEdit) return true;
        const voucherGodown = toNumber(selectedVoucher?.GodownId);
        const productHasGodown = invoiceProducts.length > 0 && invoiceProducts.every(item => isEqualNumber(item?.GoDown_Id, voucherGodown));
        return productHasGodown;
    }, [selectedVoucher, invoiceProducts, isEdit, salesInvoiceAccess.voucherBasedGodown]);

    // Warning only — does NOT block save
    const isSingleGodownValid = useMemo(() => {
        if (!salesInvoiceAccess.singleGodown) return true;
        if (invoiceProducts.length <= 1) return true;

        const firstGodown = invoiceProducts[0]?.GoDown_Id;
        return invoiceProducts.every(item => isEqualNumber(item?.GoDown_Id, firstGodown));
    }, [invoiceProducts, salesInvoiceAccess.singleGodown]);

    // Blocked — disables save button
    const isStockValid = useMemo(() => {
        if (!salesInvoiceAccess.stockSeparation) return true;
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
    }, [invoiceProducts, salesInvoiceAccess.stockSeparation]);

    // Warning only — does NOT block save
    const isBatchValid = useMemo(() => {
        if (!salesInvoiceAccess.batchUsage) return true;
        if (invoiceProducts.length === 0) return true;
        return invoiceProducts.every(item => isValidNumber(item?.Batch_Id) || Boolean(item?.Batch_Name));
    }, [invoiceProducts, salesInvoiceAccess.batchUsage]);

    const altQuantity = useMemo(() => {
        const rule = baseData.moduleConfiguration.find(
            rule => rule.ruleCode === 'SI_9'
        )
        return isEqualNumber(rule?.createOption, 1);
    }, [baseData.moduleConfiguration])

    const tdStyle = 'border fa-13 vctr';
    const inputStyle = 'cus-inpt p-1';


    const changeSelectedObjects = (indexValue, key, value) => {
        setInvoiceProduct((prev) => {
            return prev.map((item, sIndex) => {
                if (!isEqualNumber(sIndex, indexValue)) return item;

                const productInfo = findProductDetails(baseData.products, item.Item_Id);
                const pack = toNumber(productInfo?.PackGet) || 1;

                switch (key) {
                    case 'Act_Qty': {
                        const qty = toNumber(value);
                        const altQty = Division(qty, pack);
                        const newItem = {
                            ...item,
                            Act_Qty: value,
                            Bill_Qty: value,
                            Alt_Act_Qty: altQty,
                            Alt_Bill_Qty: altQty,
                        };
                        if (toNumber(item.Item_Rate)) {
                            newItem.Amount = Multiplication(item.Item_Rate, qty);
                        }
                        return newItem;
                    }
                    case 'Alt_Act_Qty': {
                        const altQty = toNumber(value);
                        const qty = Multiplication(altQty, pack);
                        const newItem = {
                            ...item,
                            Alt_Act_Qty: value,
                            Alt_Bill_Qty: value,
                            Act_Qty: qty,
                            Bill_Qty: qty,
                        };
                        if (toNumber(item.Item_Rate)) {
                            newItem.Amount = Multiplication(item.Item_Rate, qty);
                        }
                        return newItem;
                    }
                    case 'Bill_Qty': {
                        const qty = toNumber(value);
                        const altQty = Division(qty, pack);
                        const newItem = {
                            ...item,
                            Bill_Qty: value,
                            Alt_Bill_Qty: altQty,
                        };
                        if (toNumber(item.Item_Rate)) {
                            newItem.Amount = Multiplication(item.Item_Rate, qty);
                        } else if (toNumber(item.Amount) && qty) {
                            newItem.Item_Rate = Division(item.Amount, qty);
                        }
                        return newItem;
                    }
                    case 'Alt_Bill_Qty': {
                        const altQty = toNumber(value);
                        const qty = Multiplication(altQty, pack);
                        const newItem = {
                            ...item,
                            Alt_Bill_Qty: value,
                            Bill_Qty: qty,
                        };
                        if (toNumber(item.Item_Rate)) {
                            newItem.Amount = Multiplication(item.Item_Rate, qty);
                        }
                        return newItem;
                    }
                    case 'Item_Rate': {
                        const rate = toNumber(value);
                        const newItem = { ...item, Item_Rate: value };
                        if (toNumber(item.Bill_Qty)) {
                            newItem.Amount = Multiplication(rate, item.Bill_Qty);
                        }
                        return newItem;
                    }
                    case 'Amount': {
                        const amt = toNumber(value);
                        const newItem = { ...item, Amount: value };
                        if (toNumber(item.Bill_Qty)) {
                            newItem.Item_Rate = Division(amt, item.Bill_Qty);
                        }
                        return newItem;
                    }
                    default:
                        return { ...item, [key]: value };
                }
            });
        });
    };

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
                initialValue={{
                    ...salesInvoiceDetailsInfo,
                    Pre_Id: invoiceInfo.So_No,
                    rowId: rid(),
                }}
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

                        <Button
                            onClick={saveSalesInvoice}
                            variant="contained"
                            disabled={!isStockValid || !activeInvoiceCreationStatus || !voucherCrLimitValid || isCreditBillLimitExceeded || isLoading}
                        >submit</Button>
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
                                    retailerSalesStatus={{
                                        ...retailerSalesStatus,
                                        invoiceCreationStatus: activeInvoiceCreationStatus
                                    }}
                                    staffArray={staffArray}
                                    setStaffArray={setStaffArray}
                                    salesInvoiceAccess={salesInvoiceAccess}
                                    fetchedAddresses={fetchedAddresses}
                                    onPreviewOpen={fetchLastInvoicePreview}
                                    godownData={baseData.godown}
                                    commonGodown={commonGodown}
                                    setCommonGodown={setCommonGodown}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SI_1: Positive and Negative Stock Separation — BLOCKED */}
                    {!isStockValid && salesInvoiceAccess.stockSeparation && (
                        <div className="alert alert-danger p-2 mb-2">
                            🚫 <b>Stock Separation:</b> Cannot save invoice with mixed stock (positive and negative). Please ensure all items have either positive or negative stock.
                        </div>
                    )}

                    {/* SI_2: Batch Usage — WARNING only */}
                    {!isBatchValid && salesInvoiceAccess.batchUsage && (
                        <div className="alert alert-warning p-2 mb-2">
                            ⚠️ <b>Batch Usage:</b> One or more invoice items are missing a batch value. It is recommended to assign a batch to all items before saving.
                        </div>
                    )}

                    {/* SI_3: Single Godown Usage — WARNING only */}
                    {!isSingleGodownValid && salesInvoiceAccess.singleGodown && (
                        <div className="alert alert-warning p-2 mb-2">
                            ⚠️ <b>Single Godown:</b> Invoice items are from multiple godowns. It is recommended to use a single godown per invoice.
                        </div>
                    )}

                    {/* SI_4 & SI_5: Credit Amount / Days Limit — BLOCKED */}
                    {!activeInvoiceCreationStatus && (
                        <div className="alert alert-danger p-2 mb-2">
                            🚫 <b>Credit Limit Exceeded:</b> The retailer exceeds the credit limit or credit days limit. Cannot save invoice.
                        </div>
                    )}

                    {/* SI_6: Voucher Based Godown — WARNING (handled via dialog below) */}

                    {/* SI_7: Credit Bill Count Limit — BLOCKED */}
                    {isCreditBillLimitExceeded && (
                        <div className="alert alert-danger p-2 mb-2">
                            🚫 <b>Credit Bill Limit:</b> This account has&nbsp;
                            <b>{retailerSalesStatus.creditBills}</b> pending bill(s) out of a maximum of&nbsp;
                            <b>{retailerSalesStatus.creditBillLimitCount}</b> allowed.
                            New invoices cannot be created until existing bills are settled.
                        </div>
                    )}

                    {!voucherCrLimitValid && (
                        <div className="alert alert-warning p-2 mb-2">
                            ⚠️ Invoice total
                            (<b>₹{(taxSplitUp?.invoiceTotal ?? 0).toLocaleString('en-IN')}</b>)
                            exceeds the CR limit of
                            <b>₹{toNumber(selectedVoucher?.crLimit).toLocaleString('en-IN')}</b>
                            set for voucher <b>{selectedVoucher?.Voucher_Type}</b>.
                            Please reduce the invoice amount or select a different voucher.
                        </div>
                    )}

                    {/* product details */}
                    <div className="table-responsive">
                        <div className="d-flex p-2 justify-content-end align-items-center gap-2">
                            <Button
                                onClick={() => {
                                    setInvoiceProduct(prev => [
                                        ...prev,
                                        {
                                            ...salesInvoiceDetailsInfo,
                                            rowId: rid(),
                                            Pre_Id: invoiceInfo.So_No,
                                            S_No: prev.length + 1,
                                        }
                                    ]);
                                }}
                                variant='outlined'
                                type="button"
                                startIcon={<Add />}
                                disabled={
                                    !checkIsNumber(invoiceInfo.Retailer_Id)
                                    || (invoiceProducts.length > 0
                                        && checkIsNumber(invoiceInfo.So_No))
                                }
                            >Add Product</Button>
                        </div>

                        <table className="table">
                            <thead>
                                <tr>
                                    <td className={tdStyle}>SNo</td>
                                    <td className={tdStyle}>Item</td>
                                    {isValidNumber(invoiceInfo.So_No) && <td className={tdStyle}>Order Rate</td>}
                                    <td className={tdStyle}>Rate</td>
                                    {isValidNumber(invoiceInfo.So_No) && <td className={tdStyle}>Order Qty</td>}
                                    <td className={tdStyle}>Stock</td>
                                    {altQuantity && (
                                        <>
                                            <td className={tdStyle}>Act Qty</td>
                                            <td className={tdStyle}>Alt Act Qty</td>
                                        </>
                                    )}
                                    <td className={tdStyle}>Bill Qty</td>
                                    {/* <td className={tdStyle}>Alt Bill Qty</td> */}
                                    <td className={tdStyle}>Unit</td>
                                    <td className={tdStyle}>Amount</td>
                                    {salesInvoiceAccess.batchUsage && <td className={tdStyle}>Batch</td>}
                                    <td className={tdStyle}>#</td>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceProducts
                                    .sort((a, b) => toNumber(a.S_No) - toNumber(b.S_No))
                                    .map((row, i) => (
                                        <tr key={row.rowId || i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            <td className={tdStyle} style={{ minWidth: 200 }}>
                                                <Select
                                                    value={row?.Item_Id ? {
                                                        value: row.Item_Id,
                                                        label: row.Item_Name || findProductDetails(baseData.products, row.Item_Id)?.Product_Name || ''
                                                    } : null}
                                                    onChange={e => {
                                                        const productInfo = findProductDetails(baseData.products, e.value);
                                                        setInvoiceProduct(prev => prev.map((item, sIndex) => {
                                                            if (sIndex !== i) return item;
                                                            return {
                                                                ...item,
                                                                Item_Id: e.value,
                                                                Item_Name: productInfo.Product_Name ?? '',
                                                                Item_Rate: productInfo.Item_Rate ?? 0,
                                                                Unit_Id: productInfo.UOM_Id ?? item.Unit_Id,
                                                                Unit_Name: productInfo.Units ?? item.Unit_Name,
                                                                HSN_Code: productInfo?.HSN_Code ?? '',
                                                                GoDown_Id: '',
                                                                Bill_Qty: 0,
                                                                Alt_Bill_Qty: 0,
                                                                Act_Qty: 0,
                                                                Alt_Act_Qty: 0,
                                                                Amount: 0,
                                                            };
                                                        }));
                                                    }}
                                                    options={[
                                                        { value: '', label: 'select', isDisabled: true },
                                                        ...baseData.products.map(obj => ({
                                                            value: obj.Product_Id,
                                                            label: obj.Product_Name,
                                                            isDisabled: invoiceProducts.some(
                                                                (ind, idx) => idx !== i && isEqualNumber(ind.Item_Id, obj.Product_Id)
                                                            )
                                                        }))
                                                    ]}
                                                    styles={customSelectStyles}
                                                    isSearchable
                                                    placeholder="Select Product"
                                                    menuPortalTarget={document.body}
                                                    filterOption={reactSelectFilterLogic}
                                                    maxMenuHeight={200}
                                                />
                                            </td>
                                            {isValidNumber(invoiceInfo.So_No) && <td className={tdStyle}>
                                                {toArray(saleOrderDetails.products).find(s => isEqualNumber(s.Item_Id, row.Item_Id))?.Item_Rate}
                                            </td>}
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Item_Rate || ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Item_Rate', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            {isValidNumber(invoiceInfo.So_No) && <td className={tdStyle}>
                                                {toArray(saleOrderDetails.products).find(s => isEqualNumber(s.Item_Id, row.Item_Id))?.Bill_Qty}
                                            </td>}
                                            <td className={tdStyle}>
                                                {(() => {
                                                    const productDetails = findProductDetails(baseData.products, row.Item_Id);
                                                    const packValue = toNumber(productDetails?.PackGet);
                                                    const stockValue = toNumber(baseData.stockInGodown.find(
                                                        god => isEqualNumber(god.Product_Id, row?.Item_Id)
                                                    )?.Bal_Qty)
                                                    return `${stockValue}(${Division(stockValue, packValue || 1)})`;
                                                })()}
                                            </td>
                                            {altQuantity && (
                                                <>
                                                    <td className={tdStyle}>
                                                        <input
                                                            value={row?.Act_Qty || ''}
                                                            type="number"
                                                            className={inputStyle}
                                                            onChange={e => changeSelectedObjects(i, 'Act_Qty', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td className={tdStyle}>
                                                        <input
                                                            value={row?.Alt_Act_Qty || ''}
                                                            type="number"
                                                            className={inputStyle}
                                                            onChange={e => changeSelectedObjects(i, 'Alt_Act_Qty', e.target.value)}
                                                        />
                                                    </td>
                                                </>
                                            )}
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Bill_Qty || ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Bill_Qty', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            {/* <td className={tdStyle}>
                                                <input
                                                    value={row?.Alt_Bill_Qty ?? ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Alt_Bill_Qty', e.target.value)}
                                                />
                                            </td> */}
                                            <td className={tdStyle}>
                                                <select
                                                    value={row?.Unit_Id ?? ''}
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
                                                    {baseData.uom.map((o, j) => (
                                                        <option value={o.Unit_Id} key={j}>{o.Units}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={tdStyle}>
                                                <input
                                                    value={row?.Amount || ''}
                                                    type="number"
                                                    className={inputStyle}
                                                    onChange={e => changeSelectedObjects(i, 'Amount', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            {salesInvoiceAccess.batchUsage && (
                                                <td className={tdStyle} style={{ minWidth: 200 }}>
                                                    <Select
                                                        value={{
                                                            value: row?.Batch_Name || '',
                                                            label: row?.Batch_Name || ''
                                                        }}
                                                        onChange={e => changeSelectedObjects(i, 'Batch_Name', e.value)}
                                                        options={
                                                            baseData.batchDetails.filter(
                                                                bat => (
                                                                    isEqualNumber(bat.item_id, row?.Item_Id)
                                                                    && isEqualNumber(bat?.godown_id, commonGodown?.value)
                                                                    && toNumber(bat.pendingQuantity) >= toNumber(row?.Bill_Qty)
                                                                )
                                                            ).map(
                                                                bat => ({ value: bat.batch, label: bat.batch })
                                                            )
                                                        }
                                                        styles={customSelectStyles}
                                                        isSearchable={true}
                                                        placeholder={"Select Batch"}
                                                        menuPortalTarget={document.body}
                                                        isDisabled={
                                                            !checkIsNumber(row?.Item_Id)
                                                            || !checkIsNumber(commonGodown?.value)
                                                            || isEqualNumber(row?.Bill_Qty, 0)
                                                        }
                                                    />
                                                </td>
                                            )}
                                            <td className={tdStyle}>
                                                <IconButton
                                                    onClick={() => {
                                                        setInvoiceProduct(pre =>
                                                            pre.filter(obj => obj.rowId !== row.rowId)
                                                        );
                                                    }}
                                                    size='small'
                                                    type="button"
                                                    color='error'
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

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

                    <Button
                        onClick={saveSalesInvoice}
                        variant="contained"
                        disabled={!isStockValid || !activeInvoiceCreationStatus || !voucherCrLimitValid || isCreditBillLimitExceeded || isLoading}
                    >submit</Button>
                </CardActions>
            </Card>

            {/* <AppDialog
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
            </AppDialog> */}


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

            <SalesInvoicePreview
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                previewData={previewData}
                baseData={baseData}
                salesInvoiceAccess={salesInvoiceAccess}
                fetchedAddresses={fetchedAddresses}
                onPrevInvoice={() => fetchAdjacentInvoice('prev')}
                onNextInvoice={() => fetchAdjacentInvoice('next')}
                isLatestInvoice={previewNavState.currentDoId === previewNavState.latestDoId}
            />
        </>
    )
}

export default CreateSalesInvoice;