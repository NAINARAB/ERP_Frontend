import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, CardActions } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, Addition,
    checkIsNumber, toNumber, toArray, RoundNumber, isValidNumber,
    rid
} from "../../Components/functions";
import { Add, Delete, Edit } from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { calculateGSTDetails } from '../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import {
    salesInvoiceGeneralInfo, salesInvoiceDetailsInfo, salesInvoiceExpencesInfo,
     retailerDeliveryAddressInfo,
    retailerOutstandingDetails,
    
    defaultStaffTypes
} from '../Sales/SalesInvoice/variable';
import AddProductForm from "./StockJournalProduct";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import RequiredStar from '../../Components/requiredStar';

const requestId = crypto.randomUUID();

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const StockJournalAdjustment = ({ loadingOn, loadingOff, isLoading }) => {
    
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
        batchDetails: [],
        moduleConfiguration: []
    });
    
    const inputStyle = 'cus-inpt p-2';
    const [dialog, setDialog] = useState({
        addProductDialog: false,
        importFromSaleOrder: false,
        godownMismatch: false
    });

  
    const [adjustmentInfo, setAdjustmentInfo] = useState({
        godownId: null,
        adjustmentType: null,
        Adj_date: new Date().toISOString().split('T')[0]
    });

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

const isEdit = useMemo(() => isValidNumber(editValues?.Aj_id), [editValues?.Aj_id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();

                const [
                    productsResponse,
                    uomResponse,
                    brandResponse,
                    godownResponse,
                    batchDetailsResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `masters/brand` }),
                    fetchLink({ address: `masters/godown` }),
                    fetchLink({ address: `inventory/batchMaster/stockBalance` })
                ]);

                const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );
                
                const uomData = (uomResponse.success ? uomResponse.data : []).sort(
                    (a, b) => String(a.Units).localeCompare(b.Units)
                );
                
                const brandData = (brandResponse.success ? brandResponse.data : []).sort(
                    (a, b) => String(a?.Brand_Name).localeCompare(b?.Brand_Name)
                );
                
                const godownData = (godownResponse.success ? godownResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                );

                setBaseData((prev) => ({
                    ...prev,
                    products: productsData,
                    uom: uomData,
                    brand: brandData,
                    godown: godownData,
                    batchDetails: toArray(batchDetailsResponse.data)
                }));
                
            } catch (e) {
                console.error("Error fetching data:", e);
                toast.error("Failed to load required data");
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, []);

    const adjustmentTypeOptions = [
        { value: 0, label: 'WASTAGE ADJUSTMENT' },
        { value: 1, label: 'VALUE ADJUSTMENT' }
    ];

    const isProductButtonEnabled = useMemo(() => {
        return checkIsNumber(adjustmentInfo.godownId) && checkIsNumber(adjustmentInfo.adjustmentType);
    }, [adjustmentInfo.godownId, adjustmentInfo.adjustmentType]);


    useEffect(() => {
    if (adjustmentInfo.godownId == null) return;
    
    setInvoiceProduct(pre => 
        pre.map(item => ({
            ...item,
            GoDown_Id: adjustmentInfo.godownId
        }))
    );
}, [adjustmentInfo.godownId]);

useEffect(() => {
    if (isValidObject(editValues) && Array.isArray(editValues?.Products_List)) {
        const { Products_List } = editValues;

        setAdjustmentInfo({
            godownId: editValues.godown_id != null ? toNumber(editValues.godown_id) : null,  // ✅ 0 is valid
            adjustmentType: editValues.Adjust_Type !== undefined ? editValues.Adjust_Type : null,
              Adj_date: editValues.Adj_date        // ✅ add this
        ? new Date(editValues.Adj_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
        });

        setInvoiceInfo(prev => ({
            ...prev,
            Do_Id: editValues.Aj_id ?? prev.Do_Id,
            Narration: editValues.narration ?? '',
            Alter_Reason: '',
        }));

        setInvoiceProduct(
            Products_List.map(item => ({
                ...salesInvoiceDetailsInfo,
                rowId: rid(),
                Item_Id: item.Item_Id || item.name_item_id || 0,
                Item_Name: item.Product_Name ?? '',
                Act_Qty: item.act_qty ?? 0,
                Alt_Act_Qty: item.act_qty ?? 0,
                Bill_Qty: item.bill_qty ?? 0,
                Alt_Bill_Qty: item.bill_qty ?? 0,
                Item_Rate: item.rate ?? 0,
                Amount: item.amount ?? 0,
                Adj_Payment: item.Adj_Payment ?? 0,
                GoDown_Id: editValues.godown_id != null ? toNumber(editValues.godown_id) : 0, 
            }))
        );
    }
}, [editValues]);

    useEffect(() => {
        const defaultStaffTypesData = defaultStaffTypes(baseData.staffType);
        setStaffArray(pre => {
            const newDefaults = defaultStaffTypesData.filter(def =>
                !pre.some(p => isEqualNumber(p.Emp_Type_Id, def.Emp_Type_Id))
            );
            return [...pre, ...newDefaults];
        });
    }, [baseData.staffType]);

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
                            case 'Taxable_Rate': return [key, itemRateGst.base_amount];
                            case 'Total_Qty': return [key, Bill_Qty];
                            case 'Taxble': return [key, isTaxable ? 1 : 0];
                            case 'Taxable_Amount': return [key, gstInfo.base_amount];
                            case 'Tax_Rate': return [key, gstPercentage];
                            case 'Cgst':
                            case 'Sgst': return [key, cgstPer ?? 0];
                            case 'Cgst_Amo':
                            case 'Sgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo];
                            case 'Igst': return [key, igstPer ?? 0];
                            case 'Igst_Amo': return [key, isNotTaxableBill ? 0 : Igst_Amo];
                            case 'Final_Amo': return [key, gstInfo.with_tax];

                            default: return [key, item[key] || value];
                        }
                    })
                );
            });
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
                };
            });
        });
    }, [baseData.expence, IS_IGST, taxType]);


    const invExpencesTotal = useMemo(() => {
        return toArray(invoiceExpences).reduce((acc, exp) => Addition(acc, exp?.Expence_Value), 0);
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
    }, [invoiceProducts, isNotTaxableBill, baseData.products, IS_IGST, isInclusive, invExpencesTotal]);

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
        setAdjustmentInfo({ godownId: null, adjustmentType: null });
    };

    const saveSalesInvoice = () => {
        if (isLoading) return;
         const requestId = crypto.randomUUID();
    
        if (!checkIsNumber(adjustmentInfo.godownId)) {
            toast.warn('Please select a godown');
            return;
        }
        if (!checkIsNumber(adjustmentInfo.adjustmentType)) {
            toast.warn('Please select adjustment type');
            return;
        }

   

        fetchLink({
            address: `inventory/getStockAdjustments`,
            method: isEdit===true ? 'PUT' : 'POST',
            loadingOff, loadingOn,
            headers: {
                'Idempotency-Key': requestId
            },
            bodyData: {
               
                adjustmentDetails: {
                    godownId: adjustmentInfo.godownId,
                    adjustmentType: adjustmentInfo.adjustmentType,
                    Adj_date: adjustmentInfo.Adj_date,
                    
                },
                invoiceNo:editValues?.invoice_no,
                Aj_id:editValues?.Aj_id,
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
                const savedId = data.others?.Id;
                toast.success(data.message);
                clearValues();
                navigate('/erp/inventory/StockJournalAdjustment');
            } else {
                toast.warn(data.message);
            }
        }).catch(e => {
            console.error(e);
            toast.error("Failed to save adjustment");
        });
    };

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

    return (
        <>
            <AddProductForm
                orderProducts={invoiceProducts}
                setOrderProducts={setInvoiceProduct}
                open={dialog.addProductDialog}
                onClose={() => {
                    setDialog(pre => ({ ...pre, addProductDialog: false }));
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
                    rowId: rid(),
                    GoDown_Id: adjustmentInfo.godownId
                }}
                batchDetails={baseData.batchDetails}
                voucherType={invoiceInfo}
            />

            <Card>
                <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                    <span className="flex-grow-1 fa-16 fw-bold">Stock Journal Adjustment</span>
                    <span>
                        <Button type='button' onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/erp/inventory/StockJournalAdjustment');
                            }
                        }}>Cancel</Button>
                        <Button onClick={saveSalesInvoice} variant="contained" disabled={isLoading}>Submit</Button>
                    </span>
                </div>
                <CardContent>
                    <div className="row p-0">
                        {/* General Info Section */}
                        <div className="col-xxl-12 col-lg-12 col-md-12 py-2 px-0">
                            <div className="border px-3 py-3" style={{ minHeight: '20vh', height: '100%' }}>
                                <div className='row'>
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Godown <RequiredStar /></label>
                                       <Select
                                           options={baseData.godown.map(g => ({ value: g.Godown_Id, label: g.Godown_Name }))}
                                           value={
                                               adjustmentInfo.godownId != null
                                                   ? {
                                                       value: adjustmentInfo.godownId,
                                                       label: baseData.godown.find(g => isEqualNumber(g.Godown_Id, adjustmentInfo.godownId))?.Godown_Name
                                                     }
                                                   : null
                                           }
                                           onChange={(selected) => setAdjustmentInfo(prev => ({
                                               ...prev,
                                               godownId: selected?.value ?? null  
                                           }))}
                                           placeholder="Select Godown"
                                           isClearable
                                           styles={customSelectStyles}
                                       />
                                    </div>
                                
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Adjustment Type <RequiredStar /></label>
                                        <Select
                                            options={adjustmentTypeOptions}
                                            value={adjustmentTypeOptions.find(option => option.value === adjustmentInfo.adjustmentType)}
                                            onChange={(selected) => setAdjustmentInfo(prev => ({ 
                                                ...prev, 
                                                adjustmentType: selected?.value !== undefined ? selected.value : null 
                                            }))}
                                            placeholder="Select Adjustment Type"
                                            isClearable
                                            styles={customSelectStyles}
                                        />
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
    <label className='fa-13'>Adjustment Date <RequiredStar /></label>
    <input
        type="date"
        className={inputStyle}
        value={adjustmentInfo.Adj_date ?? ''}
        onChange={e => setAdjustmentInfo(prev => ({
            ...prev,
            Adj_date: e.target.value
        }))}
        style={{ width: '100%' }}
    />
</div>

                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <FilterableTable
                        title="Items"
                        headerFontSizePx={13}
                        bodyFontSizePx={13}
                        EnableSerialNumber
                        disablePagination
                        ButtonArea={
                            <Button
                                onClick={() => {
                                    setSelectedProductToEdit(null);
                                    setDialog(pre => ({ ...pre, addProductDialog: true }));
                                }}
                                sx={{ ml: 1 }}
                                variant='outlined'
                                type="button"
                                startIcon={<Add />}
                                disabled={!isProductButtonEnabled}
                            >Add Product</Button>
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
                                ColumnHeader: 'Available Qty',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    return row?.Act_Qty ? `${row?.Act_Qty} (${row?.Alt_Act_Qty})` : '';
                                }
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Adjustment Qty',
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

                                    return !checkIsNumber(row?.Item_Id) ? '' : `${taxAmount} - (${taxPercentage} %)`;
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
                                isVisible: 1,
                                ColumnHeader: 'Adjustment Payment',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    return row?.Adj_Payment;
                                }
                            },
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
                                    );
                                },
                                ColumnHeader: 'Action',
                                isVisible: 1,
                            },
                        ]}
                    />

                    {/* Narration */}
                    <label className='fa-13 mt-3'>Narration</label>
                    <textarea
                        className="cus-inpt fa-14"
                        rows={2}
                        value={invoiceInfo.Narration}
                        onChange={e => setInvoiceInfo(pre => ({ ...pre, Narration: e.target.value }))}
                    />
                </CardContent>
                <CardActions className="d-flex justify-content-end">
                    <Button type='button' onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate('/erp/inventory/StockJournalAdjustment');
                        }
                    }}>Cancel</Button>
                    <Button onClick={saveSalesInvoice} variant="contained" disabled={isLoading}>Submit</Button>
                </CardActions>
            </Card>
        </>
    );
};

export default StockJournalAdjustment;