import React, { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isGraterNumber, isValidObject, ISOString, getUniqueData,
    NumberFormat, numberToWords,
    RoundNumber, Addition,
    getSessionUser,
    checkIsNumber,
    toNumber,
    toArray
} from "../../../Components/functions";
import { Add, ArrowLeft, Clear, Delete, Download, Edit, ReceiptLong, Save } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import { salesInvoiceGeneralInfo, salesInvoiceDetailsInfo, salesInvoiceExpencesInfo, salesInvoiceStaffInfo } from './variable';
import InvolvedStaffs from "./manageInvolvedStaff";
import ManageSalesInvoiceGeneralInfo from "./manageGeneralInfo";
import SalesInvoiceTaxDetails from "./taxDetails";
import AddItemToSaleOrderCart from "../SaleOrder/addItemToCart";
import AddProductsInSalesInvoice from "./importFromSaleOrder";
import ExpencesOfSalesInvoice from "./manageExpences";


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
        stockInGodown: []
    });

    const [dialog, setDialog] = useState({
        addProductDialog: false,
        importFromSaleOrder: false,
    })

    const [invoiceInfo, setInvoiceInfo] = useState(salesInvoiceGeneralInfo)
    const [invoiceProducts, setInvoiceProduct] = useState([]);
    const [invoiceExpences, setInvoiceExpences] = useState([]);
    const [staffArray, setStaffArray] = useState([]);

    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);

    const isInclusive = isEqualNumber(invoiceInfo.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceInfo.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceInfo.IS_IGST, 1);
    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
    const minimumRows = 3;
    const dummyRowCount = minimumRows - invoiceProducts.length

    useEffect(() => {

        const fetchData = async () => {
            try {
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
                    godownWiseStock
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/expences` }),
                    fetchLink({ address: `sales/stockInGodown` }),
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
                const expencesMaster = (expenceResponse.success ? expenceResponse.data : []).sort(
                    (a, b) => String(a?.Expence_Name).localeCompare(b?.Expence_Name)
                );
                const stockInGodowns = (godownWiseStock.success ? godownWiseStock.data : []).sort(
                    (a, b) => String(a?.stock_item_name).localeCompare(b?.stock_item_name)
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
                    expence: expencesMaster,
                    stockInGodown: stockInGodowns
                }));
            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, [storage?.Company_id])

    const clearValues = () => {
        setInvoiceInfo(salesInvoiceGeneralInfo);
        setInvoiceProduct([]);
        setInvoiceExpences([]);
        setStaffArray([]);
    }

    // re-calculate the tax after changeing tax-type, invoice-type
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

    const saveSalesInvoice = () => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `sales/salesInvoice`,
            method: checkIsNumber(invoiceInfo?.Do_Id) ? 'PUT' : 'POST',
            bodyData: {
                ...invoiceInfo,
                Product_Array: invoiceProducts,
                Staffs_Array: staffArray,
                Expence_Array: invoiceExpences
            }
        }).then(data => {
            if (data.success) {
                clearValues();
                toast.success(data.message);
            } else {
                toast.warn(data.message)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    return (
        <>

            <AddItemToSaleOrderCart
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
                stockInGodown={baseData.stockInGodown}
            />

            {/* <form onSubmit={e => {
                e.preventDefault();
                saveSalesInvoice();
            }}> */}
                <Card>
                    <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                        <span className="flex-grow-1 fa-16 fw-bold">Sales Invoice</span>
                        <span>
                            <Button type='button' onClick={() => {
                                if ((Array.isArray(editValues?.orderInfo) || isValidObject(editValues?.invoiceInfo)) && window.history.length > 1) {
                                    navigate(-1);
                                } else {
                                    navigate(location.pathname, { replace: true, state: null });
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

                            <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                                <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                                    <ManageSalesInvoiceGeneralInfo
                                        invoiceInfo={invoiceInfo}
                                        setInvoiceInfo={setInvoiceInfo}
                                        retailers={baseData.retailers}
                                        branches={baseData.branch}
                                        voucherType={baseData.voucherType}
                                        onChangeRetailer={() => {
                                            setInvoiceProduct([]);
                                            setInvoiceExpences([]);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

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

                                    {/* <Button
                                        variant="outlined"
                                        className="me-2"
                                        disabled={!checkIsNumber(invoiceInfo.Retailer_Id)}
                                        startIcon={<ReceiptLong />}
                                    >Choose Sale Order</Button> */}

                                    <AddProductsInSalesInvoice
                                        loadingOn={loadingOn}
                                        loadingOff={loadingOff}
                                        open={dialog.importFromSaleOrder}
                                        onClose={() => setDialog(pre => ({ ...pre, importFromSaleOrder: false }))}
                                        retailer={invoiceInfo?.Retailer_Id}
                                        selectedItems={invoiceProducts}
                                        setSelectedItems={setInvoiceProduct}
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
                                createCol('HSN_Code', 'string'),
                                createCol('Bill_Qty', 'number'),
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

                        <br />

                        <ExpencesOfSalesInvoice
                            invoiceExpences={invoiceExpences}
                            setInvoiceExpences={setInvoiceExpences}
                            expenceMaster={baseData.expence}
                            IS_IGST={IS_IGST}
                            taxType={taxType}
                        />

                        <br />

                        <SalesInvoiceTaxDetails
                            invoiceProducts={invoiceProducts}
                            invoiceExpences={invoiceExpences}
                            isNotTaxableBill={isNotTaxableBill}
                            isInclusive={isInclusive}
                            IS_IGST={IS_IGST}
                            products={baseData.products}
                        />
                    </CardContent>
                </Card>
            {/* </form> */}
        </>
    )
}

export default CreateSalesInvoice;