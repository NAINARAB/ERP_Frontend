import React, { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card } from "@mui/material";
import Select from "react-select";
import { customSelectStyles, statusDropDown } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isGraterNumber, isValidObject, ISOString, getUniqueData,
    NumberFormat, numberToWords,
    RoundNumber, Addition,
    getSessionUser,
    checkIsNumber,
    toNumber,
    reactSelectFilterLogic,
    isValidNumber,
    stringCompare
} from "../../../Components/functions";
import { Add, Clear, Delete, Edit, Save, Settings } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import { purchaseOrderGeneralInfo, purchaseOrderStockInfo, purchaseOrderStaffInfo } from "./column";
import AddItemToSaleOrderCart from "../../Sales/SaleOrder/addItemToCart";
import InvolvedStaffs from "./creationComponent/involvedStaffs";
import ParameterDialog from "./creationComponent/parameterDialog";
import RequiredStar from "../../../Components/requiredStar";

const storage = getSessionUser().user;

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const CreatePurchaseOrder = ({ loadingOn, loadingOff }) => {
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
    });

    const [orderDetails, setOrderDetails] = useState(purchaseOrderGeneralInfo)
    const [orderProducts, setOrderProducts] = useState([]);
    const [staffInvolved, setStaffInvolved] = useState([]);

    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
    const [addProductDialog, setAddProductDialog] = useState(false);

    const [moduleParameters, setModuleParameters] = useState([]);
    const [itemParameters, setItemParameters] = useState({});
    const [parameterDialog, setParameterDialog] = useState({ open: false, item: null });

    const isInclusive = isEqualNumber(orderDetails.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(orderDetails.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(orderDetails.IS_IGST, 1);
    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';

    useEffect(() => {
        if (
            isValidObject(editValues) &&
            Array.isArray(editValues?.Products_List) &&
            Array.isArray(editValues?.Staff_Involved_List)
        ) {
            const { Products_List, Staff_Involved_List } = editValues;
            setOrderDetails(
                Object.fromEntries(
                    Object.entries(purchaseOrderGeneralInfo).map(([key, value]) => {
                        if (key === 'Po_Date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        return [key, editValues[key] ?? value]
                    })
                )
            );
            setOrderProducts(
                Products_List.map(item => Object.fromEntries(
                    Object.entries(purchaseOrderStockInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
            setStaffInvolved(
                Staff_Involved_List.map(item => Object.fromEntries(
                    Object.entries(purchaseOrderStaffInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );

            // Populate itemParameters from Products_List[].parameters
            const paramMap = {};
            Products_List.forEach(prod => {
                const params = Array.isArray(prod.parameters) ? prod.parameters : [];
                if (params.length > 0) {
                    paramMap[prod.Item_Id] = params.map(p => ({
                        ItemId: prod.Item_Id,
                        ParameterId: p.ParameterId,
                        ParameterValueOne: p.ParameterValueOne || '',
                        ParameterValueTwo: p.ParameterValueTwo || '',
                    }));
                }
            });
            setItemParameters(paramMap);
        }
    }, [editValues])

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
                    moduleParameterResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `masters/voucher?module=PURCHASE_ORDER` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/moduleParameters?moduleName=PURCHASE_ORDER` })
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
                setModuleParameters(moduleParameterResponse.success ? moduleParameterResponse.data : [])
                    

                setBaseData((pre) => ({
                    ...pre,
                    products: productsData,
                    branch: branchData,
                    retailers: retailersData,
                    voucherType: voucherType,
                    uom: uomData,
                    staff: staffData,
                    staffType: staffCategoryData,
                    brand: getUniqueData(productsData, 'Brand', ['Brand_Name'])
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();

    }, [storage?.Company_id])

    const clearValues = () => {
        setOrderDetails(purchaseOrderGeneralInfo);
        setOrderProducts([]);
        setStaffInvolved([]);
        setItemParameters({});
    }

    const postPurchaseOrder = () => {
        if (isValidNumber(orderDetails?.PO_Id) && stringCompare(orderDetails?.Alter_Reason, '')) return toast.error('Enter Alter Reason');

        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id) {
            loadingOn();

            // Build flat Parameter_Array from itemParameters
            const Parameter_Array = Object.values(itemParameters).flat();

            fetchLink({
                address: `purchase/purchaseOrderEntry`,
                method: checkIsNumber(orderDetails?.PO_Id) ? 'PUT' : 'POST',
                bodyData: {
                    ...orderDetails,
                    Product_Array: orderProducts.filter(o => isGraterNumber(o?.Bill_Qty, 0)),
                    Staff_Involved_List: staffInvolved,
                    Parameter_Array,
                }
            }).then(data => {
                if (data.success) {
                    toast.success(data?.message);
                    clearValues()
                } else {
                    toast.error(data?.message)
                }
            }).catch(e => console.error(e)).finally(() => loadingOff())

        } else {
            if (orderProducts.length <= 0) {
                return toast.error('Enter any one product quantity')
            }
            if (!orderDetails?.Retailer_Id) {
                return toast.error('Select Vendor')
            }
        }
    }

    const Total_Invoice_value = useMemo(() => {
        return orderProducts.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return Addition(acc, Amount);

            const product = findProductDetails(baseData.products, item.Item_Id);
            const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;

            if (isInclusive) {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'remove').with_tax);
            } else {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'add').with_tax);
            }
        }, 0)
    }, [orderProducts, isNotTaxableBill, baseData.products, IS_IGST, isInclusive])

    const totalValueBeforeTax = useMemo(() => {
        return orderProducts.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return {
                TotalValue: Addition(acc.TotalValue, Amount),
                TotalTax: 0
            }

            const product = findProductDetails(baseData.products, item.Item_Id);
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
    }, [orderProducts, isNotTaxableBill, baseData.products, IS_IGST, isInclusive])

    useEffect(() => {
        setOrderProducts(pre => {
            const exist = [...pre];

            return exist.map(item => {
                return Object.fromEntries(
                    Object.entries(purchaseOrderStockInfo).map(([key, value]) => {
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
        purchaseOrderStockInfo,
        baseData.products,
        IS_IGST,
        taxType,
    ])

    return (
        <>
            <AddItemToSaleOrderCart
                orderProducts={orderProducts}
                setOrderProducts={setOrderProducts}
                open={addProductDialog}
                onClose={() => {
                    setAddProductDialog(false);
                    setSelectedProductToEdit(null);
                }}
                products={baseData.products}
                brands={baseData.brand}
                uom={baseData.uom}
                GST_Inclusive={orderDetails.GST_Inclusive}
                IS_IGST={IS_IGST}
                editValues={selectedProductToEdit}
                initialValue={purchaseOrderStockInfo}
            />

            <Card>

                <div className="d-flex align-items-center flex-wrap p-2">
                    <h5 className="flex-grow-1 ps-2">Purchase Order Creation</h5>
                    <Button
                        variant='outlined' sx={{ ml: 1 }}
                        startIcon={<Clear />}
                        onClick={clearValues}
                    >
                        {'Clear'}
                    </Button>
                    <Button
                        onClick={postPurchaseOrder}
                        sx={{ ml: 1 }}
                        variant='outlined'
                        color='success'
                        startIcon={<Save />}
                        disabled={orderProducts?.length === 0 || !orderDetails?.Retailer_Id}
                    >Save</Button>
                </div>

                <CardContent>
                    <div className="row">

                        {/* Staff Info */}
                        <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                            <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                <InvolvedStaffs
                                    StaffArray={staffInvolved}
                                    setStaffArray={setStaffInvolved}
                                    costCenter={baseData.staff}
                                    costCategory={baseData.staffType}
                                />
                            </div>
                        </div>

                        {/* General Info */}
                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                                <div className="row">

                                    <div className="col-sm-8 p-2">
                                        <label className='fa-13'>Vendor Name <RequiredStar /></label>
                                        <Select
                                            value={{ value: orderDetails?.Retailer_Id, label: orderDetails?.Retailer_Name }}
                                            onChange={(e) => {
                                                setOrderDetails({ ...orderDetails, Retailer_Id: e.value, Retailer_Name: e.label });
                                            }}
                                            options={[
                                                { value: '', label: 'select', isDisabled: true },
                                                ...baseData.retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Vendor Name"}
                                            maxMenuHeight={200}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </div>

                                    <div className="col-sm-4 p-2">
                                        <label className='fa-13'>Voucher Type <RequiredStar /></label>
                                        <select
                                            className="cus-inpt p-2"
                                            onChange={e => setOrderDetails({ ...orderDetails, VoucherType: Number(e.target.value) })}
                                            value={orderDetails.VoucherType}
                                        >
                                            <option value='' disabled>select voucher</option>
                                            {baseData.voucherType?.map((vou, ind) => (
                                                <option value={vou.Vocher_Type_Id} key={ind}>{vou.Voucher_Type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Date <RequiredStar /></label>
                                        <input
                                            type="date"
                                            value={orderDetails?.Po_Date ? ISOString(orderDetails?.Po_Date) : ''}
                                            onChange={e => setOrderDetails({ ...orderDetails, Po_Date: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Invoice Type <RequiredStar /></label>
                                        <select
                                            className="cus-inpt p-2"
                                            onChange={e => setOrderDetails({ ...orderDetails, GST_Inclusive: Number(e.target.value) })}
                                            value={orderDetails.GST_Inclusive}
                                        >
                                            <option value={1}>Inclusive Tax</option>
                                            <option value={0}>Exclusive Tax</option>
                                            <option value={2}>Not Taxable</option>
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Tax Type <RequiredStar /></label>
                                        <select
                                            className="cus-inpt p-2"
                                            onChange={e => setOrderDetails({ ...orderDetails, IS_IGST: Number(e.target.value) })}
                                            value={orderDetails.IS_IGST}
                                        >
                                            <option value='0'>GST</option>
                                            <option value='1'>IGST</option>
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Branch <RequiredStar /></label>
                                        <select
                                            className="cus-inpt p-2"
                                            onChange={e => setOrderDetails({ ...orderDetails, Branch_Id: Number(e.target.value) })}
                                            value={orderDetails.Branch_Id}
                                        >
                                            <option value='' disabled>select Branch</option>
                                            {baseData.branch.map((branch, ind) => (
                                                <option value={branch.BranchId} key={ind}>{branch.BranchName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Status</label>
                                        <select
                                            value={orderDetails?.Po_Status}
                                            className="cus-inpt p-2"
                                            onChange={e => setOrderDetails(pre => ({ ...pre, Po_Status: e.target.value }))}
                                        >
                                            {statusDropDown.map((s, i) => <option value={s.value} key={i}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    {isValidNumber(orderDetails.PO_Id) && (
                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Alter Reason <RequiredStar /></label>
                                            <input
                                                value={orderDetails?.Alter_Reason}
                                                className="cus-inpt p-2"
                                                onChange={e => setOrderDetails(pre => ({ ...pre, Alter_Reason: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="col-12 p-2">
                                        <label className='fa-13'>Narration</label>
                                        <textarea
                                            className="cus-inpt "
                                            value={orderDetails.Narration}
                                            onChange={e => setOrderDetails(pre => ({ ...pre, Narration: e.target.value }))}
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <FilterableTable
                        title="Products"
                        ButtonArea={
                            <>
                                <Button
                                    onClick={() => {
                                        setSelectedProductToEdit(null);
                                        setAddProductDialog(true);
                                    }}
                                    sx={{ ml: 1 }}
                                    variant='outlined'
                                    startIcon={<Add />}
                                    disabled={!checkIsNumber(orderDetails.Retailer_Id)}
                                >Add Product</Button>
                            </>
                        }
                        dataArray={orderProducts}
                        columns={[
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => findProductDetails(baseData.products, row?.Item_Id).Product_Name,
                                ColumnHeader: 'Product',
                                isVisible: 1,
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => findProductDetails(baseData.products, row?.Item_Id)?.HSN_Code,
                                ColumnHeader: 'HSN Code',
                                isVisible: 1,
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => row?.Bill_Qty + ' ' + (row?.Unit_Name ?? ''),
                                ColumnHeader: 'Quantity',
                                isVisible: 1,
                                align: 'center'
                            },
                            createCol('Item_Rate', 'number', 'Rate', 'right'),
                            createCol('Taxable_Amount', 'number', 'Taxable Amount', 'right'),
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const percentage = findProductDetails(baseData.products, row?.Item_Id)?.Gst_P
                                    const amount = toNumber(row?.Amount);
                                    const taxDetails = calculateGSTDetails(amount, percentage, taxType);
                                    return NumberFormat(taxDetails.tax_amount) + ' (' + taxDetails.tax_per + '%)'
                                },
                                ColumnHeader: 'Tax',
                                isVisible: 1,
                                align: 'right'
                            },
                            {
                                ColumnHeader: 'Amount',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const percentage = findProductDetails(baseData.products, row?.Item_Id)?.Gst_P
                                    const amount = row.Amount ?? 0;
                                    const tax = calculateGSTDetails(amount, percentage, taxType).tax_amount;
                                    return NumberFormat(
                                        isEqualNumber(orderDetails.GST_Inclusive, 1) ? amount : Addition(amount, tax)
                                    )
                                },
                                isVisible: 1,
                                align: 'right'
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const productName = findProductDetails(baseData.products, row?.Item_Id)?.Product_Name || 'Item';
                                    const paramCount = (itemParameters[row?.Item_Id] || []).length;
                                    return (
                                        <>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedProductToEdit(row);
                                                    setAddProductDialog(true);
                                                }}
                                                size="small"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => setParameterDialog({ open: true, item: { ...row, ProductName: productName } })}
                                                color={paramCount > 0 ? 'primary' : 'default'}
                                                title="Parameters"
                                            >
                                                <Settings />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setOrderProducts(pre => pre.filter(obj => !isEqualNumber(obj.Item_Id, row.Item_Id)))
                                                    setItemParameters(prev => {
                                                        const next = { ...prev };
                                                        delete next[row.Item_Id];
                                                        return next;
                                                    });
                                                }}
                                                color='error'
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
                        EnableSerialNumber
                        CellSize="small"
                        disablePagination={true}
                    />

                    {/* Parameters Summary */}
                    {Object.keys(itemParameters).length > 0 && orderProducts.length > 0 && (
                        <div className="mt-3">
                            <h6 className="fw-bold border-bottom pb-2 mb-3">
                                <Settings className="fa-16 me-1" /> Item Parameters
                            </h6>
                            {orderProducts
                                .filter(prod => (itemParameters[prod.Item_Id] || []).length > 0)
                                .map((prod, idx) => {
                                    const productName = findProductDetails(baseData.products, prod.Item_Id)?.Product_Name || 'Item';
                                    const params = itemParameters[prod.Item_Id] || [];
                                    return (
                                        <div key={idx} className="mb-3 border rounded p-2 bg-light">
                                            <div className="fw-semibold text-primary fa-14 mb-2">{productName}</div>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered mb-0 fa-13">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Parameter</th>
                                                            <th>Type</th>
                                                            <th>Value 1</th>
                                                            <th>Value 2</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {params.map((p, pi) => {
                                                            const mp = moduleParameters.find(m => isEqualNumber(m.numID, p.ParameterId));
                                                            return (
                                                                <tr key={pi}>
                                                                    <td>{pi + 1}</td>
                                                                    <td>{mp?.parameterName || p.ParameterId}</td>
                                                                    <td>{mp?.dataType || '-'}</td>
                                                                    <td>{p.ParameterValueOne || '-'}</td>
                                                                    <td>{p.ParameterValueTwo || '-'}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {/* Invoice GST and Total */}
                    {orderProducts.length > 0 && (
                        <div className="d-flex justify-content-end py-2">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border p-2" rowSpan={isEqualNumber(orderDetails.IS_IGST, 1) ? 4 : 5}>
                                            Total in words: {numberToWords(parseInt(Total_Invoice_value))}
                                        </td>
                                        <td className="border p-2">Total Taxable Amount</td>
                                        <td className="border p-2">
                                            {NumberFormat(totalValueBeforeTax.TotalValue)}
                                        </td>
                                    </tr>
                                    {!isEqualNumber(orderDetails.IS_IGST, 1) ? (
                                        <>
                                            <tr>
                                                <td className="border p-2">CGST</td>
                                                <td className="border p-2">
                                                    {NumberFormat(totalValueBeforeTax.TotalTax / 2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">SGST</td>
                                                <td className="border p-2">
                                                    {NumberFormat(totalValueBeforeTax.TotalTax / 2)}
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td className="border p-2">IGST</td>
                                            <td className="border p-2">
                                                {NumberFormat(totalValueBeforeTax.TotalTax)}
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
                    )}

                    <div className="d-flex justify-content-end">
                        <Button
                            onClick={postPurchaseOrder}
                            sx={{ ml: 1 }}
                            variant='outlined'
                            color='success'
                            startIcon={<Save />}
                            disabled={orderProducts?.length === 0 || !orderDetails?.Retailer_Id}
                        >Save</Button>
                    </div>

                </CardContent>
            </Card>

            <ParameterDialog
                open={parameterDialog.open}
                onClose={() => setParameterDialog({ open: false, item: null })}
                itemData={parameterDialog.item}
                moduleParameters={moduleParameters}
                itemParameters={itemParameters}
                setItemParameters={setItemParameters}
            />

        </>
    )
}

export default CreatePurchaseOrder;

