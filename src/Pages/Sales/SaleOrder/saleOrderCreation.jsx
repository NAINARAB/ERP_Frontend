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
    reactSelectFilterLogic
} from "../../../Components/functions";
import { Add, ArrowLeft, Clear, Delete, Download, Edit, Save } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { calculateGSTDetails } from '../../../Components/taxCalculator';
import { useLocation, useNavigate } from "react-router-dom";
import { saleOrderGeneralInfo, saleOrderStockInfo, saleOrderStaffInfo } from "./column";
import ImportFromPOS from "./importFromPos";
import AddItemToSaleOrderCart from "./addItemToCart";
import InvolvedStaffs from "./creationStaffInfo";
import RequiredStar from "../../../Components/requiredStar";

const storage = getSessionUser().user;

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const SaleOrderCreation = ({ loadingOn, loadingOff }) => {
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
        salesPerson: [],
        brand: [],
    });

    const [orderDetails, setOrderDetails] = useState(saleOrderGeneralInfo)
    const [orderProducts, setOrderProducts] = useState([]);
    const [staffInvolved, setStaffInvolved] = useState([]);

    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
    const [addProductDialog, setAddProductDialog] = useState(false);
    const [importPosDialog, setImportPosDialog] = useState(false);

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
                    Object.entries(saleOrderGeneralInfo).map(([key, value]) => {
                        if (key === 'So_Date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        return [key, editValues[key] ?? value]
                    })
                )
            );
            setOrderProducts(
                Products_List.map(item => Object.fromEntries(
                    Object.entries(saleOrderStockInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
            setStaffInvolved(
                Staff_Involved_List.map(item => Object.fromEntries(
                    Object.entries(saleOrderStaffInfo).map(([key, value]) => {
                        return [key, item[key] ?? value]
                    })
                ))
            );
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
                    salesPersonResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/users/salesPerson/dropDown` }),
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
                const salesPersonData = (salesPersonResponse.success ? salesPersonResponse.data : []).sort(
                    (a, b) => String(a?.Name).localeCompare(b?.Name)
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
                    salesPerson: salesPersonData,
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
        setOrderDetails(saleOrderGeneralInfo);
        setOrderProducts([]);
        setStaffInvolved([]);
    }

    const postSaleOrder = () => {
        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id) {
            loadingOn();
            fetchLink({
                address: `sales/saleOrder`,
                method: checkIsNumber(orderDetails?.So_Id) ? 'PUT' : 'POST',
                bodyData: {
                    ...orderDetails,
                    Product_Array: orderProducts.filter(o => isGraterNumber(o?.Bill_Qty, 0)),
                    Staff_Involved_List: staffInvolved
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
                return toast.error('Select Retailer')
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
                    Object.entries(saleOrderStockInfo).map(([key, value]) => {
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
        saleOrderStockInfo,
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
                initialValue={saleOrderStockInfo}
            />

            <Card>

                <div className="d-flex align-items-center flex-wrap p-2">
                    <h5 className="flex-grow-1 ps-2">Sale Order Creation</h5>
                    <Button
                        variant='outlined' sx={{ ml: 1 }}
                        startIcon={<ArrowLeft />}
                        onClick={() => navigate('/erp/sales/saleOrder')}
                    >
                        {'Back'}
                    </Button>
                    <Button
                        variant='outlined' sx={{ ml: 1 }}
                        startIcon={<Clear />}
                        onClick={clearValues}
                    >
                        {'Clear'}
                    </Button>
                </div>

                <CardContent>
                    <div className="row">

                        {/* CompnayInfo  */}
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

                        {/* General Info  */}
                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                                <div className="row">

                                    <div className="col-sm-8 p-2">
                                        <label className='fa-13'>Retailer Name <RequiredStar /></label>
                                        <Select
                                            value={{ value: orderDetails?.Retailer_Id, label: orderDetails?.Retailer_Name }}
                                            onChange={(e) => {
                                                setOrderDetails({ ...orderDetails, Retailer_Id: e.value, Retailer_Name: e.label });
                                                // setOrderProducts([]);
                                            }}
                                            options={[
                                                { value: '', label: 'select', isDisabled: true },
                                                ...baseData.retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
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
                                            {baseData.voucherType?.filter(vou => vou.Type === 'SALES').map((vou, ind) => (
                                                <option value={vou.Vocher_Type_Id} key={ind}>{vou.Voucher_Type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Date <RequiredStar /></label>
                                        <input
                                            type="date"
                                            value={orderDetails?.So_Date ? ISOString(orderDetails?.So_Date) : ''}
                                            onChange={e => setOrderDetails({ ...orderDetails, So_Date: e.target.value })}
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
                                        <label className='fa-13'>Sales Person <RequiredStar /></label>
                                        <select
                                            className="cus-inpt p-2"
                                            onChange={e => setOrderDetails({ ...orderDetails, Sales_Person_Id: Number(e.target.value) })}
                                            value={orderDetails.Sales_Person_Id}
                                        >
                                            <option value='' disabled>select sales person</option>
                                            <option value={storage?.UserId}>{storage?.Name}</option>
                                            {baseData.salesPerson?.map((vou, ind) => (
                                                <option value={vou.UserId} key={ind}>{vou.Name}</option>
                                            ))}
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
                                {/* <AddItemToSaleOrderCart
                                        orderProducts={orderProducts}
                                        setOrderProducts={setOrderProducts}
                                        open={addProductDialog}
                                        onClose={() => setAddProductDialog(false)}
                                        products={baseData.products}
                                        brands={baseData.brand}
                                        uom={baseData.uom}
                                        GST_Inclusive={orderDetails.GST_Inclusive}
                                        IS_IGST={IS_IGST}
                                    >
                                        <Button
                                            onClick={() => setAddProductDialog(true)}
                                            sx={{ ml: 1 }}
                                            variant='outlined'
                                            startIcon={<Add />}
                                            disabled={
                                                !checkIsNumber(orderDetails.Retailer_Id)
                                                || (orderProducts.length > 0
                                                    && orderProducts.some(pro => checkIsNumber(pro.Pre_Id)))
                                            }
                                        >Add Product</Button>
                                    </AddItemToSaleOrderCart> */}

                                <Button
                                    onClick={() => {
                                        setSelectedProductToEdit(null);
                                        setAddProductDialog(true);
                                    }}
                                    sx={{ ml: 1 }}
                                    variant='outlined'
                                    startIcon={<Add />}
                                    disabled={
                                        !checkIsNumber(orderDetails.Retailer_Id)
                                        || (orderProducts.length > 0
                                            && orderProducts.some(pro => checkIsNumber(pro.Pre_Id)))
                                    }
                                >Add Product</Button>

                                <ImportFromPOS
                                    loadingOn={loadingOn} loadingOff={loadingOff}
                                    open={importPosDialog} onClose={() => setImportPosDialog(false)}
                                    retailer={orderDetails?.Retailer_Id}
                                    selectedItems={orderProducts} setSelectedItems={setOrderProducts}
                                    products={baseData.products}
                                    GST_Inclusive={orderDetails.GST_Inclusive}
                                    IS_IGST={IS_IGST}
                                >
                                    <Button
                                        onClick={() => setImportPosDialog(true)}
                                        disabled={
                                            !checkIsNumber(orderDetails.Retailer_Id)
                                            || (orderProducts.length > 0
                                                && orderProducts.some(pro => !checkIsNumber(pro.Pre_Id)))
                                        }
                                        sx={{ ml: 1 }}
                                        variant='outlined'
                                        startIcon={<Download />}
                                    >Import pos</Button>
                                </ImportFromPOS>

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
                                Cell: ({ row }) => findProductDetails(baseData.products, row?.Item_Id).Product_Name?.HSN_Code,
                                ColumnHeader: 'HSN Code',
                                isVisible: 1,
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => row?.Bill_Qty + ' ' + (row?.Units ?? ''),
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
                                    // console.log({ percentage, amount, taxDetails, taxType })
                                    return NumberFormat(taxDetails.tax_amount) + ' (' + taxDetails.tax_per + '%)'
                                },
                                ColumnHeader: 'Tax',
                                isVisible: 1,
                                align: 'right'
                            },
                            // createCol('Amount', 'number', 'Amount', 'right'),
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
                                                onClick={() => {
                                                    if (checkIsNumber(row?.Pre_Id)) {
                                                        setOrderProducts(pre => pre.filter(o => !isEqualNumber(o?.Pre_Id, row?.Pre_Id)))
                                                    } else {
                                                        setOrderProducts(pre => pre.filter(obj => !isEqualNumber(obj.Item_Id, row.Item_Id)))
                                                    }
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

                    {/* invoice Gst and total  */}
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
                            onClick={postSaleOrder}
                            sx={{ ml: 1 }}
                            variant='outlined'
                            color='success'
                            startIcon={<Save />}
                            disabled={orderProducts?.length === 0 || !orderDetails?.Retailer_Id}
                        >Save</Button>
                    </div>

                </CardContent>
            </Card>

        </>
    )
}

export default SaleOrderCreation;