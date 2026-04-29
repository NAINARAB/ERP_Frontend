import { useState, useEffect, useMemo } from "react";
import { Button, CardContent, Card, IconButton } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, ISOString, getUniqueData, Addition,
    checkIsNumber, toNumber, toArray, RoundNumber, isValidNumber,
    rid, filterableText,
    stringCompare, onlynumAndNegative
} from "../../../Components/functions";
import { Add, Delete, Edit } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import {
    creditNoteGeneralInfo, creditNoteDetailsInfo, creditNoteExpencesInfo,
    creditNoteStaffInfo, retailerOutstandingDetails, defaultStaffTypes
} from './variable';
import InvolvedStaffsCreditNote from "./manageInvolvedStaff";
import ManageCreditNoteGeneralInfo from "./manageGeneralInfo";
import CreditNoteTaxDetails from "./taxDetails";
import ExpencesOfCreditNote from "./manageExpences";
import AddProductFormCreditNote from "./addProducts";

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const CreateCreditNote = ({ loadingOn, loadingOff }) => {
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
        stockItemLedgerName: [],
        batchDetails: []
    });

    const [dialog, setDialog] = useState({
        addProductDialog: false
    });

    const [invoiceInfo, setInvoiceInfo] = useState(creditNoteGeneralInfo);
    const [invoiceProducts, setInvoiceProduct] = useState([]);
    const [invoiceExpences, setInvoiceExpences] = useState([]);
    const [staffArray, setStaffArray] = useState([]);
    const [retailerSalesStatus, setRetailerSalesStatus] = useState(retailerOutstandingDetails);

    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);

    const isInclusive = isEqualNumber(invoiceInfo.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(invoiceInfo.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceInfo.IS_IGST, 1);
    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';

    const isEdit = useMemo(() => isValidNumber(invoiceInfo?.CR_Id), [invoiceInfo?.CR_Id]);

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
                    stockItemLedgerNameResponse,
                    batchDetailsResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown` }),
                    fetchLink({ address: `masters/voucher?module=CREDIT_NOTE` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/defaultAccountMaster?Type=CREDIT_NOTE` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=CREDIT_NOTE` }),
                    fetchLink({ address: `inventory/batchMaster/stockBalance` })
                ]);

                const productsData = productsResponse.success ? productsResponse.data : [];

                setBaseData(pre => ({
                    ...pre,
                    branch: branchResponse.success ? branchResponse.data : [],
                    products: productsData,
                    retailers: retailerResponse.success ? retailerResponse.data : [],
                    voucherType: voucherTypeResponse.success ? voucherTypeResponse.data : [],
                    uom: uomResponse.success ? uomResponse.data : [],
                    staff: staffResponse.success ? staffResponse.data : [],
                    staffType: staffCategory.success ? staffCategory.data : [],
                    godown: godownLocationsResponse.success ? godownLocationsResponse.data : [],
                    brand: getUniqueData(productsData, 'Brand', ['Brand_Name']),
                    expence: expenceResponse.success ? toArray(expenceResponse.data).map(exp => ({
                        Id: exp.Acc_Id,
                        Expence_Name: exp.Account_Name,
                        percentageValue: exp.percentageValue
                    })) : [],
                    stockItemLedgerName: stockItemLedgerNameResponse.success ? stockItemLedgerNameResponse.data : [],
                    batchDetails: batchDetailsResponse.success ? batchDetailsResponse.data : []
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (isValidNumber(invoiceInfo.Retailer_Id)) {
            fetchLink({
                address: `receipt/receiptMaster/pendingSalesInvoiceReceipt/amount?Retailer_Id=${invoiceInfo.Retailer_Id}`,
            }).then(data => {
                if (data.success) {
                    setRetailerSalesStatus(pre => ({
                        ...pre,
                        outstanding: toNumber(data?.others?.outstanding),
                        creditLimit: toNumber(data?.others?.creditLimit),
                        creditDays: toNumber(data?.others?.creditDays),
                        recentDate: data?.others?.recentDate ? new Date(data?.others?.recentDate) : new Date(),
                    }));
                }
            }).catch(console.error);
        } else {
            setRetailerSalesStatus(retailerOutstandingDetails);
        }
    }, [invoiceInfo.Retailer_Id]);

    useEffect(() => {
        if (isValidObject(editValues) && Array.isArray(editValues?.Product_Array)) {
            const { Product_Array, Expence_Array, Staffs_Array } = editValues;

            setInvoiceInfo(
                Object.fromEntries(
                    Object.entries(creditNoteGeneralInfo).map(([key, value]) => {
                        if (key === 'CR_Date' || key === 'Ref_Inv_Date') {
                            return [key, editValues[key] ? ISOString(editValues[key]) : value];
                        }
                        return [key, editValues[key] ?? value];
                    })
                )
            );

            setInvoiceProduct(
                Product_Array.sort((a, b) => toNumber(a?.S_No) - toNumber(b?.S_No)).map(item => Object.fromEntries(
                    Object.entries(creditNoteDetailsInfo).map(([key, value]) => {
                        if (key === 'rowId') return [key, rid()];
                        return [key, item[key] ?? value];
                    })
                ))
            );

            setInvoiceExpences(
                toArray(Expence_Array).map(item => Object.fromEntries(
                    Object.entries(creditNoteExpencesInfo).map(([key, value]) => {
                        return [key, item[key] ?? value];
                    })
                ))
            );

            setStaffArray(() => {
                const stateOfStaff = toArray(Staffs_Array).map(item => Object.fromEntries(
                    Object.entries(creditNoteStaffInfo).map(([key, value]) => {
                        return [key, item[key] ?? value];
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
                }
            })
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

    const saveCreditNote = () => {
        if (isValidNumber(invoiceInfo?.CR_Id) && filterableText(invoiceInfo?.Alter_Reason).length === 0) {
            toast.warn('Alter reason is required');
            return;
        }

        fetchLink({
            address: `creditNote`,
            method: checkIsNumber(invoiceInfo?.CR_Id) ? 'PUT' : 'POST',
            loadingOff, loadingOn,
            bodyData: {
                ...invoiceInfo,
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
                toast.success(data.message);
                navigate(-1);
            } else {
                toast.warn(data.message);
            }
        }).catch(e => {
            console.error(e);
            toast.error("Failed to save Credit Note");
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
                ...creditNoteDetailsInfo,
                ...totals,
                Item_Name: 'Total',
                Item_Id: 'TOTAL_ROW',
            };
        }
        return null;
    }, [invoiceProducts]);

    const fetchInvoiceProducts = () => {
        if (!stringCompare(invoiceInfo.Ref_Inv_Number, '') && invoiceProducts) {
            fetchLink({
                address: `sales/salesInvoiceById?Do_Inv_No=${invoiceInfo.Ref_Inv_Number}&Retailer_Id=${invoiceInfo.Retailer_Id}`,
                loadingOn, loadingOff
            }).then(data => {
                if (data.success && data.data.length > 0) {
                    const invoiceData = data.data[0];
                    setInvoiceProduct(toArray(invoiceData.Products_List).map(item => Object.fromEntries(
                        Object.entries(creditNoteDetailsInfo).map(([key, value]) => {
                            if (Object.hasOwn(item, key)) return [key, item[key]];
                            if (key === 'rowId') return [key, rid()];
                            if (key === 'Item_Name') return [key, item['Product_Name']];
                            return [key, item[key] ?? value];
                        })
                    )));
                }
            }).catch(console.error)
        }
    }

    return (
        <>
            <AddProductFormCreditNote
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
                initialValue={{ ...creditNoteDetailsInfo, rowId: rid() }}
                batchDetails={baseData.batchDetails}
            />

            <Card>
                <div className='d-flex flex-wrap align-items-center border-bottom py-2 px-3'>
                    <span className="flex-grow-1 fa-16 fw-bold">Credit Note</span>
                    <span>
                        <Button type='button' onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/erp/creditNote');
                            }
                        }}>Cancel</Button>
                        <Button onClick={saveCreditNote} variant="contained" disabled={invoiceProducts.length === 0}>submit</Button>
                    </span>
                </div>

                <CardContent>
                    <div className="row p-0">
                        {/* staff info */}
                        <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                            <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                <InvolvedStaffsCreditNote
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
                                <ManageCreditNoteGeneralInfo
                                    invoiceInfo={invoiceInfo}
                                    setInvoiceInfo={setInvoiceInfo}
                                    retailers={baseData.retailers}
                                    branches={baseData.branch}
                                    voucherType={baseData.voucherType}
                                    stockItemLedgerName={baseData.stockItemLedgerName}
                                    onChangeRetailer={() => { }}
                                    retailerSalesStatus={retailerSalesStatus}
                                    loadingOn={loadingOn}
                                    loadingOff={loadingOff}
                                    fetchInvoiceProducts={fetchInvoiceProducts}
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
                            <Button
                                onClick={() => {
                                    setSelectedProductToEdit(null);
                                    setDialog(pre => ({ ...pre, addProductDialog: true }));
                                }}
                                sx={{ ml: 1 }}
                                variant='outlined'
                                type="button"
                                startIcon={<Add />}
                            >
                                Add Items
                            </Button>
                        }
                        dataArray={[...invoiceProducts, cumulativeRow].filter(Boolean)}
                        columns={[
                            createCol('Item_Name', 'string', 'Item Name'),
                            // createCol('Godown_Name', 'string', 'Godown'),
                            createCol('Batch_Name', 'string', 'Batch'),
                            createCol('Act_Qty', 'number', 'A.Qty'),
                            createCol('Alt_Act_Qty', 'number', 'Alt.A.Qty'),
                            createCol('Bill_Qty', 'number', 'B.Qty'),
                            createCol('Alt_Bill_Qty', 'number', 'Alt.B.Qty'),
                            createCol('Item_Rate', 'number', 'Rate'),
                            createCol('Unit_Name', 'string', 'UOM'),
                            createCol('Amount', 'number', 'Amount'),
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    if (row?.Item_Id === 'TOTAL_ROW') return null;
                                    return (
                                        <>
                                            <IconButton
                                                size='small'
                                                onClick={() => {
                                                    setSelectedProductToEdit(row);
                                                    setDialog(pre => ({ ...pre, addProductDialog: true }));
                                                }}>
                                                <Edit color='primary' className="fa-16" />
                                            </IconButton>
                                            <IconButton size='small' onClick={() => setInvoiceProduct(pre => pre.filter(item => item.rowId !== row.rowId))}>
                                                <Delete color="error" className="fa-16" />
                                            </IconButton>
                                        </>
                                    )
                                }
                            }
                        ]}
                    />

                    <div className="row mt-3">

                        <div className="col-12 p-2">
                            <ExpencesOfCreditNote
                                expenceMaster={baseData.expence}
                                invoiceExpences={invoiceExpences}
                                setInvoiceExpences={setInvoiceExpences}
                                IS_IGST={IS_IGST}
                                taxType={taxType}
                                Total_Invoice_value={taxSplitUp?.invoiceTotal || 0}
                                invoiceProducts={invoiceProducts}
                                products={baseData.products}
                                findProductDetails={findProductDetails}
                            />
                        </div>
                        {/* tax component */}
                        <div className="col-md-5 p-2 bg-light border">
                            <h6 className="border-bottom pb-2">Tax details</h6>
                            <CreditNoteTaxDetails invoiceProducts={invoiceProducts} />
                        </div>

                        {/* expences component */}
                        <div className="col-md-7 p-2">
                            <div className="d-flex justify-content-end mt-3">
                                <table className="table-bordered bg-light">
                                    <tbody>
                                        <tr>
                                            <td className="p-2 fa-14 text-end">Total Taxable</td>
                                            <td className="p-2 fa-14 text-end">{taxSplitUp?.totalTaxable || 0}</td>
                                        </tr>
                                        {!IS_IGST && (
                                            <>
                                                <tr>
                                                    <td className="p-2 fa-14 text-end">CGST</td>
                                                    <td className="p-2 fa-14 text-end">{taxSplitUp?.cgst || 0}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 fa-14 text-end">SGST</td>
                                                    <td className="p-2 fa-14 text-end">{taxSplitUp?.sgst || 0}</td>
                                                </tr>
                                            </>
                                        )}
                                        {IS_IGST && (
                                            <tr>
                                                <td className="p-2 fa-14 text-end">IGST</td>
                                                <td className="p-2 fa-14 text-end">{taxSplitUp?.igst || 0}</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="p-2 fa-14 text-end">Total Tax</td>
                                            <td className="p-2 fa-14 text-end">{taxSplitUp?.totalTax || 0}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 fa-14 text-end">Expenses</td>
                                            <td className="p-2 fa-14 text-end">{invExpencesTotal}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 fa-14 text-end">Round off</td>
                                            <td className="p-2 fa-14 text-end">
                                                <input
                                                    value={invoiceInfo?.Round_off ?? ''}
                                                    defaultValue={taxSplitUp?.roundOff ?? 0}
                                                    style={{ minWidth: '100px', maxWidth: '150px' }}
                                                    className="cus-inpt p-2 text-end"
                                                    onInput={onlynumAndNegative}
                                                    onChange={e => setInvoiceInfo(pre => ({ ...pre, Round_off: e.target.value }))}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 fa-15 fw-bold text-end">Total Invoice Value</td>
                                            <td className="p-2 fa-15 fw-bold text-end">₹ {RoundNumber(Number(taxSplitUp?.totalTaxable || 0) + Number(taxSplitUp?.totalTax || 0) + Number(invExpencesTotal || 0) + Number(invoiceInfo?.Round_off || 0))}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                </CardContent>
            </Card>
        </>
    );

}

export default CreateCreditNote;
