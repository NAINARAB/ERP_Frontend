import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isGraterNumber, isValidObject, ISOString, getUniqueData,
    Multiplication, Division, NumberFormat, Subraction, numberToWords,
    RoundNumber, Addition,
    onlynum
} from "../../../Components/functions";
import { Add, Clear, ClearAll, Delete, Edit, Save } from "@mui/icons-material";
import { fetchLink } from '../../../Components/fetchComponent';
import FilterableTable from "../../../Components/filterableTable2";
import RequiredStar from "../../../Components/requiredStar";
import { calculateGSTDetails } from '../../../Components/taxCalculator';

const taxCalc = (method = 1, amount = 0, percentage = 0) => {
    switch (method) {
        case 0:
            return RoundNumber(amount * (percentage / 100));
        case 1:
            return RoundNumber(amount - (amount * (100 / (100 + percentage))));
        case 2:
            return 0;
        default:
            return 0;
    }
}

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const NewSaleOrderCreation = ({ editValues, loadingOn, loadingOff, reload, switchScreen }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
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
    })
    const [companyInfo, setCompanyInfo] = useState({});

    const initialValue = {
        Company_Id: storage?.Company_id,
        So_Date: ISOString(),
        VoucherType: '',
        Retailer_Id: '',
        Retailer_Name: 'Select',
        Sales_Person_Id: storage?.UserId,
        Sales_Person_Name: storage?.Name,
        Branch_Id: storage?.BranchId,
        Narration: '',
        Created_by: storage?.UserId,
        Product_Array: [],
        So_Id: '',
        GST_Inclusive: 1,
        IS_IGST: 0,
    }

    const productInitialDetails = {
        Item_Id: '',
        ItemName: 'Search Item',
        Bill_Qty: 0,
        Item_Rate: 0,
        UOM: '',
        Units: '',
        Product: {},
        Group: 'Search Group',
        GroupID: '',
        Brand: 'Search Brand',
        BrandID: '',
        Amount: 0
    }

    const staffInitialDetails = {
        So_Id: '',
        Involved_Emp_Id: '',
        Cost_Center_Type_Id: '',
    }

    const [orderDetails, setOrderDetails] = useState(initialValue)
    const [orderProducts, setOrderProducts] = useState([]);
    const [productDetails, setProductDetails] = useState(productInitialDetails);
    // const [staffDetails, setStaffDetails] = useState(staffInitialDetails);
    const [isEdit, setIsEdit] = useState(false);
    const [addProductDialog, setAddProductDialog] = useState(false);

    // const isExclusiveBill = isEqualNumber(orderDetails.GST_Inclusive, 0);
    const isInclusive = isEqualNumber(orderDetails.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(orderDetails.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(orderDetails.IS_IGST, 1);
    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';

    useEffect(() => {
        if (isValidObject(editValues)) {
            setOrderDetails(pre => ({
                ...pre,
                So_Date: editValues?.So_Date,
                Retailer_Id: editValues?.Retailer_Id,
                Retailer_Name: editValues?.Retailer_Name,
                Sales_Person_Id: editValues?.Sales_Person_Id,
                Sales_Person_Name: editValues?.Sales_Person_Name,
                Branch_Id: editValues?.Branch_Id,
                VoucherType: editValues?.VoucherType,
                Narration: editValues?.Narration,
                Created_by: editValues?.Created_by,
                So_Id: editValues?.So_Id,
                GST_Inclusive: editValues?.GST_Inclusive,
                IS_IGST: editValues?.IS_IGST,
            }));
            setOrderProducts(editValues?.Products_List?.map(pro => {
                const productDetails = findProductDetails(baseData.products, pro.Item_Id);
                return {
                    ...pro,
                    Item_Id: pro?.Item_Id ?? '',
                    ItemName: pro?.Product_Name ?? "",
                    Bill_Qty: pro?.Bill_Qty ?? 0,
                    Item_Rate: pro?.Item_Rate ?? 0,
                    UOM: pro?.Unit_Id ?? '',
                    Units: pro?.Units ?? '',
                    Product: {
                        ...pro,
                        Cgst_P: Number(productDetails?.Cgst_P) ?? 0,
                        Sgst_P: Number(productDetails?.Sgst_P) ?? 0,
                        Igst_P: Number(productDetails?.Igst_P) ?? 0,
                        Gst_P: Addition(productDetails?.Cgst_P, productDetails?.Sgst_P) ?? 0
                    } ?? {},
                    Group: 'Search Group',
                    GroupID: '',
                    Brand: 'Search Brand',
                    BrandID: '',
                    Amount: pro?.Amount ?? 0
                }
            }));
            setIsEdit(true)
        } else {
            setOrderDetails(initialValue);
            setOrderProducts([])
            setIsEdit(false)
        }
    }, [editValues, baseData.products])

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
                    salesPersonResponse,
                    companyResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/users/salesPerson/dropDown` }),
                    fetchLink({ address: `masters/company?Company_id=${storage?.Company_id}` }),
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
                setCompanyInfo((companyResponse.success && companyResponse?.data[0]) ? companyResponse?.data[0] : {})
            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, [storage?.Company_id])

    const handleProductInputChange = (productId, value, rate, obj, UOM_Id, Units) => {
        const productIndex = orderProducts.findIndex(item => isEqualNumber(item.Item_Id, productId));

        if (productIndex !== -1) {
            const updatedValues = [...orderProducts];
            updatedValues[productIndex].Bill_Qty = Number(value);
            updatedValues[productIndex].Item_Rate = Number(rate);
            updatedValues[productIndex].UOM = UOM_Id;
            updatedValues[productIndex].Units = Units;
            updatedValues[productIndex].Amount = Multiplication(value, rate);
            updatedValues[productIndex] = { ...updatedValues[productIndex], Product: obj }

            setOrderProducts(updatedValues);
        } else {
            setOrderProducts(prevValues => [...prevValues, {
                Item_Id: productId,
                Bill_Qty: Number(value),
                Item_Rate: Number(rate),
                UOM: UOM_Id,
                Units: Units,
                Amount: Multiplication(value, rate),
                Product: obj
            }]);
        }
    };

    const postSaleOrder = () => {
        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id) {
            loadingOn();
            fetchLink({
                address: `sales/saleOrder`,
                method: isEdit ? 'PUT' : 'POST',
                bodyData: {
                    ...orderDetails,
                    Product_Array: orderProducts.filter(o => isGraterNumber(o?.Bill_Qty, 0))
                }
            }).then(data => {
                if (data.success) {
                    toast.success(data?.message);
                    reload()
                    setOrderDetails(initialValue);
                    setOrderProducts([])
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

    const closeAddProduct = () => {
        setAddProductDialog(false);
        setProductDetails(productInitialDetails);
    }

    const Total_Invoice_value = orderProducts.reduce((acc, item) => {
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

    const totalValueBeforeTax = orderProducts.reduce((acc, item) => {
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

    useEffect(() => {
        setOrderProducts(pre => pre?.map(pro => ({
            ...pro,
            Amount: Multiplication(pro?.Item_Rate, pro?.Bill_Qty)
        })));
    }, [orderDetails.GST_Inclusive])

    return (
        <>

            <div className="p-3 pt-0">
                {/* CompnayInfo  */}
                <div className="p-3 rounded-3 mb-3 shadow-sm">
                    <h5 className="border-bottom">From:</h5>
                    <div className="row">
                        <div className="col-lg-4 col-md-6">
                            <table className="table table-borderless m-0 fa-13">
                                <tbody>
                                    <tr><td>
                                        <span className="me-2">Company: </span>
                                        <span>{companyInfo?.Company_Name}</span>
                                    </td></tr>
                                    <tr><td>
                                        <span className="me-2">Address: </span>
                                        <span>{companyInfo?.Company_Address}</span>
                                    </td></tr>
                                    <tr><td>
                                        <span className="me-2">Phone: </span>
                                        <span>{companyInfo?.Telephone_Number}</span>
                                    </td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <table className="table table-borderless fa-13 m-0">
                                <tbody>
                                    <tr>
                                        <td>Date:</td>
                                        <td>
                                            <input
                                                type="date"
                                                value={orderDetails?.So_Date ? ISOString(orderDetails?.So_Date) : ''}
                                                onChange={e => setOrderDetails({ ...orderDetails, So_Date: e.target.value })}
                                                className="cus-inpt p-1"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Invoice Type:</td>
                                        <td>
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, GST_Inclusive: Number(e.target.value) })}
                                                value={orderDetails.GST_Inclusive}
                                            >
                                                <option value={1}>Inclusive Tax</option>
                                                <option value={0}>Exclusive Tax</option>
                                                <option value={2}>Not Taxable</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Tax Type:</td>
                                        <td>
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, IS_IGST: Number(e.target.value) })}
                                                value={orderDetails.IS_IGST}
                                            >
                                                <option value='0'>GST</option>
                                                <option value='1'>IGST</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <table className="table table-borderless fa-13 m-0">
                                <tbody>
                                    <tr>
                                        <td>Sales Person:</td>
                                        <td>
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Sales_Person_Id: Number(e.target.value) })}
                                                value={orderDetails.Sales_Person_Id}
                                            >
                                                <option value='' disabled>select sales person</option>
                                                <option value={storage?.UserId}>{storage?.Name}</option>
                                                {baseData.salesPerson?.map((vou, ind) => (
                                                    <option value={vou.UserId} key={ind}>{vou.Name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Voucher Type:</td>
                                        <td>
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, VoucherType: Number(e.target.value) })}
                                                value={orderDetails.VoucherType}
                                            >
                                                <option value='' disabled>select voucher</option>
                                                {baseData.voucherType?.filter(vou => vou.Type === 'SALES').map((vou, ind) => (
                                                    <option value={vou.Vocher_Type_Id} key={ind}>{vou.Voucher_Type}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Branch</td>
                                        <td>
                                            <select
                                                className="cus-inpt p-1"
                                                onChange={e => setOrderDetails({ ...orderDetails, Branch_Id: Number(e.target.value) })}
                                                value={orderDetails.Branch_Id}
                                            >
                                                <option value='' disabled>select Branch</option>
                                                {baseData.branch.map((branch, ind) => (
                                                    <option value={branch.BranchId} key={ind}>{branch.BranchName}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}

                <div className="p-3 bg-light rounded-3 mb-3 shadow-sm">
                    <h5 className="border-bottom">To:</h5>
                    <div className="row ">
                        <div className="col-md-6">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 bg-light">Retailer Name:</td>
                                        <td className="border-0 bg-light">
                                            <Select
                                                value={{ value: orderDetails?.Retailer_Id, label: orderDetails?.Retailer_Name }}
                                                onChange={(e) => setOrderDetails({ ...orderDetails, Retailer_Id: e.value, Retailer_Name: e.label })}
                                                options={[
                                                    { value: '', label: 'select', isDisabled: true },
                                                    ...baseData.retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={"Retailer Name"}
                                                maxMenuHeight={200}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Address:</td>
                                        <td className="border-0 bg-light">{storage.Name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Phone:</td>
                                        <td className="border-0 bg-light">{ }</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 bg-light">Q-Pay:</td>
                                        <td className="border-0 bg-light">{10}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 bg-light">Frequency Days:</td>
                                        <td className="border-0 bg-light">{20}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <FilterableTable
                    title="Products Cart"
                    ButtonArea={
                        <Button
                            onClick={() => setAddProductDialog(true)}
                            sx={{ ml: 1 }}
                            variant='outlined'
                            startIcon={<Add />}
                        >Add Product</Button>
                    }
                    dataArray={orderProducts}
                    columns={[
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => row?.Product?.Product_Name,
                            ColumnHeader: 'Product',
                            isVisible: 1,
                        },
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => row?.Product?.HSN_Code,
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
                        {
                            Field_Name: 'Item_Rate',
                            ColumnHeader: "Rate",
                            Fied_Data: 'number',
                            isVisible: 1,
                            align: 'right'
                        },
                        {
                            ColumnHeader: 'Taxable Amount',
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const percentage = findProductDetails(baseData.products, row?.Item_Id)?.Gst_P
                                const amount = row.Amount ?? 0;
                                const taxDetails = calculateGSTDetails(amount, percentage, taxType);
                                return NumberFormat(taxDetails.base_amount)
                            },
                            isVisible: 1,
                            align: 'right'
                        },
                        {
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const percentage = findProductDetails(baseData.products, row?.Item_Id)?.Gst_P
                                const amount = row.Amount ?? 0;
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
                                const percentage = (
                                    IS_IGST
                                        ? row?.Product?.Igst_P
                                        : Addition(row?.Product?.Cgst_P, row?.Product?.Sgst_P)
                                ) ?? 0;
                                const amount = row.Amount ?? 0;
                                const tax = taxCalc(orderDetails.GST_Inclusive, amount, percentage)
                                return NumberFormat(
                                    isEqualNumber(orderDetails.GST_Inclusive, 1) ? amount : (amount + tax)
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
                                                setProductDetails({
                                                    Item_Id: row.Item_Id,
                                                    ItemName: row?.Product?.Product_Name,
                                                    Bill_Qty: row.Bill_Qty,
                                                    Item_Rate: row.Item_Rate,
                                                    UOM: row.Product.UOM_Id,
                                                    Product: row.Product,
                                                    Group: row?.Product?.Pro_Group,
                                                    GroupID: row?.Product?.Product_Group,
                                                    Brand: row?.Product?.Brand_Name,
                                                    BrandID: row?.Product?.Brand,
                                                    Amount: row?.Amount
                                                });
                                                setAddProductDialog(true);
                                            }}
                                            size="small"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setOrderProducts(pre => pre.filter(obj => !isEqualNumber(obj.Item_Id, row.Item_Id)))
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

                <p className="fa-15 mt-3 m-0">Narration</p>
                <textarea
                    className="cus-inpt "
                    value={orderDetails.Narration}
                    onChange={e => setOrderDetails(pre => ({ ...pre, Narration: e.target.value }))}
                />

                <div className="d-flex justify-content-end">
                    <Button
                        variant='outlined'
                        startIcon={<Clear />}
                        onClick={switchScreen}
                    >
                        {'cancel'}
                    </Button>
                    <Button
                        onClick={postSaleOrder}
                        sx={{ ml: 1 }}
                        variant='outlined'
                        color='success'
                        startIcon={<Save />}
                        disabled={orderProducts?.length === 0 || !orderDetails?.Retailer_Id}
                    >Save</Button>
                </div>
            </div>

            <Dialog
                open={addProductDialog}
                onClose={closeAddProduct}
                maxWidth='sm' fullWidth
            >
                <DialogTitle className="border-bottom">
                    <span>Add Products Details</span>
                </DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    if (productDetails.Item_Id && productDetails.Bill_Qty && productDetails.Item_Rate) {
                        handleProductInputChange(
                            productDetails.Item_Id,
                            productDetails.Bill_Qty,
                            productDetails.Item_Rate,
                            productDetails.Product,
                            productDetails.UOM,
                            productDetails.Units,
                        );
                        closeAddProduct();
                    } else {
                        toast.warn(!productDetails.Item_Id ? 'Select Product' : !productDetails.Bill_Qty ? 'Enter Quantity' : 'Enter Rate or Amount');
                    }
                }}>
                    <DialogContent>
                        <div className="row pb-5">
                            <div className="col-6 p-2">
                                <label>Brand</label>
                                <Select
                                    value={{ value: productDetails.BrandID, label: productDetails.Brand }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, BrandID: e.value, Brand: e.label }))}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...baseData.brand.map(obj => ({ value: obj?.Brand, label: obj?.Brand_Name }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Brand"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            {/* <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, GroupID: e.value, Group: e.label }))}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...productGroup.map(obj => ({ value: obj?.Product_Group, label: obj?.Pro_Group }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                />
                            </div> */}
                            <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) =>
                                        setProductDetails((pre) => ({ ...pre, GroupID: e.value, Group: e.label }))
                                    }
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...baseData.products
                                            .filter(
                                                (pro) =>
                                                    productDetails.BrandID
                                                        ? isEqualNumber(pro.Brand, productDetails.BrandID)
                                                        : true
                                            )
                                            .reduce((acc, pro) => {
                                                if (
                                                    !acc.some((grp) => grp.value === pro.Product_Group)
                                                ) {
                                                    acc.push({
                                                        value: pro.Product_Group,
                                                        label: pro.Pro_Group,
                                                    });
                                                }
                                                return acc;
                                            }, []),
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-12 p-2">
                                <label>Item Name <RequiredStar /></label>
                                <Select
                                    value={{ value: productDetails.Item_Id, label: productDetails.ItemName }}
                                    onChange={e => {
                                        const productInfo = baseData.products.find(pro => isEqualNumber(pro.Product_Id, e.value))
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Item_Id: e.value,
                                            ItemName: e.label,
                                            Product: productInfo ?? {},
                                            Group: productInfo.Pro_Group ?? pre.Group,
                                            GroupID: productInfo.Product_Group ?? pre.GroupID,
                                            Brand: productInfo.Brand_Name ?? pre.Brand,
                                            BrandID: productInfo.Brand ?? pre.BrandID,
                                            UOM: productInfo.UOM_Id ?? pre.UOM,
                                            Units: productInfo.Units ?? pre.Units,
                                            Item_Rate: productInfo.Item_Rate ?? 0,
                                            Amount: 0,
                                            Bill_Qty: 0,
                                        }));
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...[
                                            ...baseData.products
                                                .filter(pro => productDetails.BrandID ? isEqualNumber(pro.Brand, productDetails.BrandID) : true)
                                                .filter(pro => productDetails.GroupID ? isEqualNumber(pro.Product_Group, productDetails.GroupID) : true)
                                        ].map(obj => ({
                                            value: obj?.Product_Id,
                                            label: obj?.Product_Name,
                                            isDisabled: (
                                                orderProducts.findIndex(ind => isEqualNumber(
                                                    ind?.Item_Id, obj?.Product_Id
                                                ))
                                            ) === -1 ? false : true
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Quantity <RequiredStar /></label>
                                <input
                                    type="number"
                                    required
                                    value={productDetails.Bill_Qty ? productDetails.Bill_Qty : ''}
                                    onChange={e => {
                                        if (productDetails.Item_Rate) {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Amount: Multiplication(productDetails.Item_Rate, e.target.value),
                                                Bill_Qty: e.target.value,
                                            }))
                                        } else if (productDetails.Amount) {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Item_Rate: Division(pre.Amount, e.target.value),
                                                Bill_Qty: e.target.value,
                                            }))
                                        } else {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Bill_Qty: e.target.value,
                                            }));
                                        }
                                    }}
                                    className="cus-inpt"
                                    min={1}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Rate </label>
                                <input
                                    value={productDetails.Item_Rate ? productDetails.Item_Rate : ''}
                                    onInput={onlynum}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Item_Rate: e.target.value,
                                        Amount: pre.Bill_Qty ? Multiplication(e.target.value, pre.Bill_Qty) : pre.Amount
                                    }))}
                                    required
                                    className="cus-inpt"
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>UOM</label>
                                <select
                                    value={productDetails.UOM}
                                    onChange={e => {
                                        const selectedIndex = e.target.selectedIndex;
                                        const label = e.target.options[selectedIndex].text;
                                        const value = e.target.value;
                                        setProductDetails(pre => ({ ...pre, UOM: value, Units: label }));
                                    }}
                                    className="cus-inpt"
                                >
                                    <option value="" disabled>select</option>
                                    {baseData.uom.map((o, i) => (
                                        <option value={o.Unit_Id} key={i} >{o.Units}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 p-2">
                                <label>Amount</label>
                                <input
                                    required
                                    value={productDetails.Amount ? productDetails.Amount : ''}
                                    onInput={onlynum}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Amount: e.target.value,
                                        Item_Rate: pre.Bill_Qty ? Division(e.target.value, pre.Bill_Qty) : pre.Item_Rate
                                    }))}
                                    className="cus-inpt"
                                    min={1}
                                />
                            </div>
                        </div>

                    </DialogContent>
                    <DialogActions className="d-flex justify-content-between align-items-center">
                        <Button onClick={() => setProductDetails(productInitialDetails)} type='button' startIcon={<ClearAll />}>Clear</Button>
                        <span>
                            <Button type="button" onClick={closeAddProduct}>cancel</Button>
                            <Button type='submit' variant="outlined">Add</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}


export default NewSaleOrderCreation;