import React, { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, Dialog } from "@mui/material";
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
    toArray,
    stringCompare
} from "../../../Components/functions";
import { Add, ArrowLeft, Clear, Delete, Download, Edit, ReceiptLong, Save, Close } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { salesInvoiceGeneralInfo, salesInvoiceDetailsInfo, salesInvoiceExpencesInfo, salesInvoiceStaffInfo } from './variable';

import ManageSalesInvoiceGeneralInfo from "./manageGeneralInfo";
import SalesInvoiceTaxDetails from "./taxDetails";

import AddItemToSaleOrderCart from "../SaleOrder/addItemToCart";
import AddProductsInSalesInvoice from "./importFromSaleOrder";
import ExpencesOfSalesInvoice from "./manageExpences";
// import InvolvedStaffs from "./manageInvolvedStaff";
const storage = getSessionUser().user;

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};


const DirectSaleInvoiceModal = ({ loadingOn, loadingOff, open, onClose, editValues,defaultValues,transactionType,onSuccess }) => {

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
        if (!open) return;

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
                    godownWiseStock,
                    stockItemLedgerNameResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/defaultAccountMaster` }),
                    fetchLink({ address: `sales/stockInGodown` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=SALES` }),
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
                const stockInGodowns = (godownWiseStock.success ? godownWiseStock.data : []).sort(
                    (a, b) => String(a?.stock_item_name).localeCompare(b?.stock_item_name)
                );
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
                    ).map(exp => ({ Id: exp.Acc_Id, Expence_Name: exp.Account_Name })),
                    stockInGodown: stockInGodowns,
                    stockItemLedgerName: stockItemLedgerName
                }));
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();

    }, [storage?.Company_id, open])

    const clearValues = () => {
        setInvoiceInfo(salesInvoiceGeneralInfo);
        setInvoiceProduct([]);
        setInvoiceExpences([]);
        setStaffArray([]);
    }


    const handleStaffArrayChange = (updatedStaffArray) => {
        setStaffArray(updatedStaffArray);
    };


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
    ]);

useEffect(() => {
    if (
        isValidObject(editValues) &&
        Array.isArray(editValues?.ProductList) &&
        baseData.staff.length > 0 &&
        baseData.staffType.length > 0
    ) {
        const {
            ProductList,
            Staffs_Array,
            Broker_Id,
            Broker_Name,
            Expence_Array,
            Transporter_Id,
            Transporter_Name,
        } = editValues;

      
     
        
      
        const expenseArray = editValues.Expence_Array || editValues.expenceArray || 
                            editValues.Expenses || editValues.expenses || 
                            editValues.ExpenceList || editValues.expenceList || [];

         const retailerId = editValues.Retailer_Id || editValues.Custome_Id || 0;
    const retailerObj = baseData.retailers.find(r =>
        isEqualNumber(r.Retailer_Id, retailerId)
    );
  setInvoiceExpences(
                toArray(Expence_Array).map(item => Object.fromEntries(
                    Object.entries(salesInvoiceExpencesInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
        setInvoiceInfo(prev => ({
            ...prev,
            Do_Id: editValues.Pre_Id || '',
            So_No: editValues.Pre_Id || '',
            So_Date: editValues.Pre_Date ? ISOString(editValues.Pre_Date) : '',
            Retailer_Id: editValues.Custome_Id || editValues?.Retailer_Id || '',
            Retailer_Name: retailerObj?.Retailer_Name || '',
            Broker_Id: editValues.Broker_Id || '',
            Broker_Name: editValues.Broker_Name || '',
            Transporter_Id: editValues.Transporter_Id || '',
            Transporter_Name: editValues.Transporter_Name || '',
            TrasnportType: editValues.TrasnportType || 2,
            Voucher_Type: editValues.baseData || 0,
            Status: editValues.Status || '',
            isConverted: editValues.isConverted || 0,
            Total_Invoice_value: editValues.Total_Invoice_value || 0,
        }));

        setInvoiceProduct(
            ProductList.map(item => ({
                ...salesInvoiceDetailsInfo,
                Item_Id: item.Item_Id || '',
                Item_Name: item.Product_Name || '',
                HSN_Code: item.HSN_Code || '',
                Bill_Qty: item.Bill_Qty || 0,
                Act_Qty: item.Bill_Qty || 0,
                Item_Rate: item.Item_Rate || 0,
                Amount: item.Amount || 0,
                GoDown_Id: item.Godown_Id || '',
                Tax_Rate: item.Tax_Rate || 0,
                Cgst: item.Cgst || 0,
                UOM:item.Unit_Id || 0,
                Units:item.Unit_Name || '',
                Sgst: item.Sgst || 0,
                Igst: item.Igst || 0,
                Cgst_Amo: item.Cgst_Amo || 0,
                Sgst_Amo: item.Sgst_Amo || 0,
                Igst_Amo: item.Igst_Amo || 0,
                Taxable_Amount: item.Taxable_Amount || 0,
                Final_Amo: item.Final_Amo || 0,
            }))
        );

        let staffTemp = [];

        const getCategoryIdFromName = (categoryName) => {
            const category = baseData.staffType.find(cat => 
                stringCompare(cat.Cost_Category, categoryName)
            );
            return category?.Cost_Category_Id || '';
        };

        if (Broker_Id && !isEqualNumber(Broker_Id, 0)) {
            const brokerStaff = baseData.staff.find(s => 
                isEqualNumber(s.Cost_Center_Id, Broker_Id)
            );
            const brokerCategoryId = getCategoryIdFromName('Broker');

            if (brokerStaff) {
                staffTemp.push({
                    Involved_Emp_Id: brokerStaff.Cost_Center_Id,
                    EmpName: brokerStaff.Cost_Center_Name,
                    Cost_Center_Type_Id: brokerCategoryId,
                    Cost_Center_Type: 'Broker',
                });
            }
        }

        if (Transporter_Id && !isEqualNumber(Transporter_Id, 0)) {
            const transporterStaff = baseData.staff.find(s => 
                isEqualNumber(s.Cost_Center_Id, Transporter_Id)
            );
            const transporterCategoryId = getCategoryIdFromName('Transport');

            if (transporterStaff) {
                staffTemp.push({
                    Involved_Emp_Id: transporterStaff.Cost_Center_Id,
                    EmpName: transporterStaff.Cost_Center_Name,
                    Cost_Center_Type_Id: transporterCategoryId,
                    Cost_Center_Type: 'Transporter',
                });
            }
        }

        toArray(Staffs_Array).forEach((item, idx) => {
            const staffObj = baseData.staff.find(s =>
                isEqualNumber(s.Cost_Center_Id, item.Staff_Id)
            );
            
            let categoryId = item.Cost_Cat_Id;
            let categoryName = item.Cost_Cat_Name;
            
            if (!categoryId && categoryName) {
                categoryId = getCategoryIdFromName(categoryName);
            }

            if (staffObj) {
                staffTemp.push({
                    Involved_Emp_Id: staffObj.Cost_Center_Id,
                    EmpName: staffObj.Cost_Center_Name,
                    Cost_Center_Type_Id: categoryId || '',
                    Cost_Center_Type: categoryName || '',
                });
            }
        });

      
        setStaffArray(staffTemp);

    
    
    }
}, [editValues, baseData.staff, baseData.staffType, baseData.retailers]);
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
const saveSalesInvoice = () => {
    if (loadingOn) loadingOn();

    const staff_Involved_List = staffArray.map(staff => ({
        Involved_Emp_Id: staff.Involved_Emp_Id,
        Cost_Center_Type_Id: staff.Cost_Center_Type_Id
    }));
   
  const filteredProducts = invoiceProducts.filter(
        item => !(Number(item.Bill_Qty) === 0 && Number(item.Act_Qty) === 0)
    );

    fetchLink({
        address: `sales/salesOrderSalesInvoice`,
        // method: checkIsNumber(invoiceInfo?.Do_Id) ? 'PUT' : 'POST',
        method:'POST',
        bodyData: {
            ...defaultValues,
            ...invoiceInfo,
            Pre_Id:invoiceInfo.Do_Id,
            Product_Array: filteredProducts,
            staff_Involved_List: staff_Involved_List, 
            Expence_Array: invoiceExpences,
            transactionType:transactionType
        }
    }).then(data => {
     
       if (data.success) {
  clearValues();
  toast.success(data.message);
  if (onSuccess) onSuccess();   
  onClose(true);
}else {
            toast.warn(data.message)
        }
    }).catch(e => console.error(e)).finally(() => {
        if (loadingOff) loadingOff();
    })
}

    if (!open) return null;

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="xl" fullWidth>
            <div style={{ maxHeight: '90vh', overflow: 'auto' }}>
                
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

                <Card>
                    <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                        <span className="flex-grow-1 fa-16 fw-bold">Sales Invoice</span>
                        <span>
                            <IconButton onClick={() => onClose(false)}>
                                <Close />
                            </IconButton>
                            <Button onClick={() => saveSalesInvoice()} variant="contained">Submit</Button>
                        </span>
                    </div>
                    <CardContent>
                        <div className="row p-0">
                           
                            <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                    <InvolvedStaffs
                                        StaffArray={staffArray}
                                        setStaffArray={handleStaffArrayChange}
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
                                        stockItemLedgerName={baseData.stockItemLedgerName}
                                        // onChangeRetailer={() => {
                                        //     // setInvoiceProduct([]);
                                        //     // setInvoiceExpences([]);
                                        // }}
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
                                        {/* <Button
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
                                        >
                                            Choose Sale Order</Button> */}
                                    </AddProductsInSalesInvoice>
                                </>
                            }
                        dataArray={[
    ...[...invoiceProducts,
        ...Array.from({ length: dummyRowCount > 0 ? dummyRowCount : 0 }).map(d => salesInvoiceDetailsInfo)
    ].filter(item => !(Number(item.Bill_Qty) === 0 && Number(item.Act_Qty) === 0)) 
]}

                            columns={[
                                createCol('Item_Name', 'string'),
                                createCol('HSN_Code', 'string'),
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
                        invoiceInfo={invoiceInfo}
                        setInvoiceInfo={setInvoiceInfo}
                    />
                    </CardContent>
                </Card>
            </div>
        </Dialog>
    )
}


export default DirectSaleInvoiceModal;



const InvolvedStaffs = ({ StaffArray = [], setStaffArray, costCenter = [], costCategory = [] }) => {

    const getCategoryIdFromName = (categoryName) => {
        const category = costCategory.find(cat => 
            stringCompare(cat.Cost_Category, categoryName)
        );
        return category?.Cost_Category_Id || '';
    };

    const getCategoryNameFromId = (categoryId) => {
        const category = costCategory.find(cat => 
            isEqualNumber(cat.Cost_Category_Id, categoryId)
        );
        return category?.Cost_Category || '';
    };

    return (
        <>
            <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                <Button
                    variant="outlined"
                    color="primary"
                    type="button"
                    onClick={() => setStaffArray(pre => [...pre, { 
                        Involved_Emp_Id: '',
                        EmpName: '',
                        Cost_Center_Type_Id: '',
                        Cost_Center_Type: '' 
                    }])}
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
                    {toArray(StaffArray).map((row, index) => {
                        // Convert category name to ID if needed (for existing data)
                        const actualCategoryId = row.Cost_Center_Type_Id || getCategoryIdFromName(row.Cost_Center_Type);
                        
                        return (
                            <tr key={index}>
                                <td className='fa-13 vctr text-center'>{index + 1}</td>
                                <td className='fa-13 w-100 p-0'>
                                    <Select
                                        value={{
                                            value: row.Involved_Emp_Id,
                                            label: row.EmpName || 'Select Staff'
                                        }}
                                        onChange={e => {
                                            const selectedStaff = costCenter.find(c => 
                                                isEqualNumber(c.Cost_Center_Id, e.value)
                                            );
                                            const newArray = StaffArray.map((staff, i) => 
                                                i === index ? { 
                                                    ...staff, 
                                                    Involved_Emp_Id: Number(e.value),
                                                    EmpName: e.label
                                                } : staff
                                            );
                                            setStaffArray(newArray);
                                        }}
                                        options={costCenter
                                            .filter(staff => 
                                                !StaffArray.some((st, i) => 
                                                    i !== index && isEqualNumber(st.Involved_Emp_Id, staff.Cost_Center_Id)
                                                )
                                            )
                                            .map(st => ({
                                                value: st.Cost_Center_Id,
                                                label: st.Cost_Center_Name
                                            }))
                                        }
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder="Select Staff"
                                    />
                                </td>
                                <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '100px' }}>
                                    <select
                                        value={actualCategoryId}
                                        onChange={e => {
                                            const selectedCategory = costCategory.find(c => 
                                                isEqualNumber(c.Cost_Category_Id, e.target.value)
                                            );
                                            const newArray = StaffArray.map((staff, i) => 
                                                i === index ? { 
                                                    ...staff, 
                                                    Cost_Center_Type_Id: e.target.value,
                                                    Cost_Center_Type: selectedCategory?.Cost_Category || ''
                                                } : staff
                                            );
                                            setStaffArray(newArray);
                                        }}
                                        className="cus-inpt p-2 border-0"
                                    >
                                        <option value="">Select</option>
                                        {costCategory.map((st, sti) =>
                                            <option value={st.Cost_Category_Id} key={sti}>
                                                {st.Cost_Category}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='fa-13 vctr p-0'>
                                    <IconButton
                                        onClick={() => {
                                            const newArray = StaffArray.filter((_, i) => i !== index);
                                            setStaffArray(newArray);
                                        }}
                                        size='small'
                                    >
                                        <Delete color='error' />
                                    </IconButton>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    )
}

export  {InvolvedStaffs}