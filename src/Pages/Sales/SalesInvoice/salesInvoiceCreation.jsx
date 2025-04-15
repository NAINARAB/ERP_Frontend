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
    toNumber
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
        godown: []
    });

    const [dialog, setDialog] = useState({
        addProductDialog: false,
        importFromSaleOrder: false
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
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
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
                    brand: getUniqueData(productsData, 'Brand', ['Brand_Name'])
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

    return (
        <>
            <form onSubmit={e => {
                e.preventDefault();

            }}>
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
                            <Button type='submit' variant="contained">submit</Button>
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
                                        variant="outlined"
                                        disabled={!checkIsNumber(invoiceInfo.Retailer_Id)}
                                        startIcon={<Add />}
                                    >Add Product</Button>

                                    <Button
                                        variant="outlined"
                                        className="me-2"
                                        disabled={!checkIsNumber(invoiceInfo.Retailer_Id)}
                                        startIcon={<ReceiptLong />}
                                    >Choose Sale Order</Button>
                                </>
                            }
                            dataArray={invoiceProducts}
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

                                        return `${taxAmount} - (${taxPercentage} %)`
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
                            ]}
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
            </form>
        </>
    )
}

export default CreateSalesInvoice;