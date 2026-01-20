import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, Dialog, DialogTitle, DialogContent, DialogActions, CardActions } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, ISOString, getUniqueData, Addition, getSessionUser,
    checkIsNumber, toNumber, toArray, stringCompare,
    RoundNumber, isValidNumber
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
    canCreateInvoice
} from './variable';
import InvolvedStaffs from "./manageInvolvedStaff";
import ManageSalesInvoiceGeneralInfo from "./manageGeneralInfo";
import SalesInvoiceTaxDetails from "./taxDetails";
import AddProductsInSalesInvoice from "./importFromSaleOrder";
import ExpencesOfSalesInvoice from "./manageExpences";
import AddProductForm from "./addProducts";
import InvoiceTemplate from "../LRReport/SalesInvPrint/invTemplate";
import AppDialog from "../../../Components/appDialogComponent";


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
        Do_Id: null
    });

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
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `masters/voucher?module=SALES` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/defaultAccountMaster` }),
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
                const stockItemLedgerName = (stockItemLedgerNameResponse.success ? stockItemLedgerNameResponse.data : []).sort(
                    (a, b) => String(a?.Stock_Item_Ledger_Name).localeCompare(b?.Stock_Item_Ledger_Name)
                );

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
                    expence: expencesMaster.filter(
                        exp => !stringCompare(exp.Type, 'DEFAULT')
                    ).map(exp => ({
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

    }, [storage?.Company_id])

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
        if (checkIsNumber(invoiceInfo.Retailer_Id) && baseData.retailers.length) {

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

                const filteredNewStaff = newStaff.filter(ns =>
                    !prev.some(ps =>
                        ps.Emp_Id === ns.Emp_Id &&
                        ps.Emp_Type_Id === ns.Emp_Type_Id
                    )
                );

                return [...prev, ...filteredNewStaff]
            });
        }
    }, [invoiceInfo.Retailer_Id, baseData.retailers.length])

    const clearValues = () => {
        setInvoiceInfo(salesInvoiceGeneralInfo);
        setInvoiceProduct([]);
        setInvoiceExpences([]);
        setStaffArray([]);
    }

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
    }, [
        baseData.products,
        IS_IGST,
        taxType,
    ]);

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
    }, [
        baseData.expence,
        IS_IGST,
        taxType,
    ])

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
                Products_List.map(item => Object.fromEntries(
                    Object.entries(salesInvoiceDetailsInfo).map(([key, value]) => {
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
            setStaffArray(
                toArray(Staffs_Array).map(item => Object.fromEntries(
                    Object.entries(salesInvoiceStaffInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
        }
    }, [editValues])

    useEffect(() => {
        if (isValidNumber(editValues?.Retailer_Id)) {
            const retailerDetails = baseData.retailers.find(ret => isEqualNumber(ret.Retailer_Id, editValues?.Retailer_Id)) || {};
            const billingAddress = toArray(retailerDetails?.deliveryAddresses).find(
                addr => isEqualNumber(addr?.id, editValues?.deliveryAddressId)
            ) ?? null;

            if (billingAddress) {

                setRetailerDeliveryAddress({
                    deliveryName: billingAddress?.deliveryName,
                    phoneNumber: billingAddress?.phoneNumber,
                    cityName: billingAddress?.cityName,
                    deliveryAddress: billingAddress?.deliveryAddress,
                    gstNumber: billingAddress?.gstNumber,
                    stateName: billingAddress?.stateName,
                    id: billingAddress.id
                })
            }

            const shippingAddress = toArray(retailerDetails?.deliveryAddresses).find(
                addr => isEqualNumber(addr?.id, editValues?.shipingAddressId)
            ) ?? null;

            if (shippingAddress) {

                setRetailerShippingAddress({
                    deliveryName: shippingAddress?.deliveryName,
                    phoneNumber: shippingAddress?.phoneNumber,
                    cityName: shippingAddress?.cityName,
                    deliveryAddress: shippingAddress?.deliveryAddress,
                    gstNumber: shippingAddress?.gstNumber,
                    stateName: shippingAddress?.stateName,
                    id: shippingAddress.id
                })
            }

        }
    }, [editValues, baseData.retailers])

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

    const saveSalesInvoice = () => {
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
                Product_Array: invoiceProducts,
                Staffs_Array: staffArray,
                Expence_Array: invoiceExpences
            }
        }).then(data => {
            if (data.success) {
                const savedDoId = data.others?.Do_Id;

                toast.success(data.message);

                // Open print dialog with the saved Do_Id
                setPrintDialog({
                    open: true,
                    Do_Id: savedDoId
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

    //     }).then(data => {
    //         if (data.success) {
    //             clearValues();
    //             toast.success(data.message);
    //             navigate('/erp/sales/invoice')
    //         } else {
    //             toast.warn(data.message)
    //         }
    //     }).catch(e => console.error(e)).finally(() => {
    //         if (loadingOff) loadingOff();
    //     })
    // }

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
                initialValue={{ ...salesInvoiceDetailsInfo, Pre_Id: invoiceInfo.So_No }}
                batchDetails={baseData.batchDetails}
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
                        <Button onClick={() => saveSalesInvoice()} variant="contained">submit</Button>
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
                                        setInvoiceExpences([]);
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
                            }).map(d => salesInvoiceDetailsInfo)
                        ]}
                        columns={[
                            createCol('Item_Name', 'string'),
                            createCol('Batch_Name', 'string'),
                            createCol('Bill_Qty', 'number'),
                            createCol('Act_Qty', 'number'),
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
                                                    pre => pre.filter(obj => !isEqualNumber(obj.Item_Id, row.Item_Id))
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

                    <Dialog
                        open={printDialog.open}
                        maxWidth="lg"
                        fullWidth
                        scroll="paper"
                    >
                        <DialogTitle>
                            Print Invoice #{printDialog.Do_Id}
                            <IconButton
                                // onClick={() => setPrintDialog({ open: false, Do_Id: null })}
                                onClick={() => {
                                    setPrintDialog({ open: false, Do_Id: null });
                                    clearValues();
                                    navigate('/erp/sales/invoice');
                                }}

                                style={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <Close />
                            </IconButton>
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
                                    setPrintDialog({ open: false, Do_Id: null });
                                    clearValues();
                                    navigate('/erp/sales/invoice');
                                }}
                            >
                                Close and Go to Listing
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <br />

                    <ExpencesOfSalesInvoice
                        invoiceExpences={invoiceExpences}
                        setInvoiceExpences={setInvoiceExpences}
                        expenceMaster={baseData.expence}
                        IS_IGST={IS_IGST}
                        taxType={taxType}
                        Total_Invoice_value={Total_Invoice_value}
                    />

                    <br />

                    <SalesInvoiceTaxDetails
                        invoiceProducts={invoiceProducts}
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
                </CardContent>
                <CardActions className="d-flex justify-content-end">
                    <Button type='button' onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate('/erp/sales/invoice');
                        }
                    }}>Cancel</Button>
                    <Button onClick={saveSalesInvoice} variant="contained">submit</Button>
                </CardActions>
            </Card>

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
        </>
    )
}

export default CreateSalesInvoice;