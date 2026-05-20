import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import AppDialog from "../../../Components/appDialogComponent";
import InvolvedStaffs from "./manageInvolvedStaff";
import ManageSalesInvoiceGeneralInfo from "./manageGeneralInfo";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import ExpencesOfSalesInvoice from "./manageExpences";
import SalesInvoiceTaxDetails from "./taxDetails";
import { checkIsNumber, isEqualNumber, Addition } from "../../../Components/functions";
import { retailerDeliveryAddressInfo } from './variable';

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const SalesInvoicePreview = ({
    open,
    onClose,
    previewData,
    baseData,
    salesInvoiceAccess,
    fetchedAddresses,
    onPrevInvoice,
    onNextInvoice,
    isLatestInvoice
}) => {

    const titleContent = previewData ? (
        <span className="d-flex align-items-center gap-1">
            <Tooltip title="Previous Invoice">
                <span>
                    <IconButton
                        size="small"
                        onClick={onPrevInvoice}
                        sx={{ mr: 0.5 }}
                    >
                        <ArrowBackIos fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            <span>{`Invoice Preview - ${previewData.invoiceInfo?.Do_Inv_No}`}</span>
            <Tooltip title={isLatestInvoice ? "This is the latest invoice" : "Next Invoice"}>
                <span>
                    <IconButton
                        size="small"
                        onClick={onNextInvoice}
                        disabled={isLatestInvoice}
                        sx={{ ml: 0.5 }}
                    >
                        <ArrowForwardIos fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </span>
    ) : 'Invoice Preview';

    return (
        <AppDialog
            open={open}
            onClose={onClose}
            title={titleContent}
            maxWidth="xl"
        >
            {previewData && (
                <div style={{ padding: 0, margin: 0 }}>
                    <div className="row p-0">
                        {/* staff info */}
                        <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                            <fieldset disabled={true} style={{ border: 'none', padding: 0, margin: 0, height: '100%' }}>
                                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                    <InvolvedStaffs
                                        StaffArray={previewData.staffArray}
                                        setStaffArray={() => {}}
                                        costCenter={baseData.staff}
                                        costCategory={baseData.staffType}
                                    />
                                </div>
                            </fieldset>
                        </div>
                        {/* general info */}
                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                                <ManageSalesInvoiceGeneralInfo
                                    invoiceInfo={previewData.invoiceInfo}
                                    setInvoiceInfo={() => {}}
                                    retailers={baseData.retailers}
                                    branches={baseData.branch}
                                    voucherType={baseData.voucherType}
                                    stockItemLedgerName={baseData.stockItemLedgerName}
                                    onChangeRetailer={() => {}}
                                    retailerDeliveryAddress={{
                                        ...retailerDeliveryAddressInfo,
                                        deliveryName: previewData.originalData.shippingName,
                                        phoneNumber: previewData.originalData.shippingPhoneNumber,
                                        cityName: previewData.originalData.shippingCityName,
                                        deliveryAddress: previewData.originalData.shippingDeliveryAddress,
                                        gstNumber: previewData.originalData.shippingGstNumber,
                                        stateName: previewData.originalData.shippingStateName
                                    }}
                                    setRetailerDeliveryAddress={() => {}}
                                    shippingAddress={{
                                        ...retailerDeliveryAddressInfo,
                                        deliveryName: previewData.originalData.shippingName,
                                        phoneNumber: previewData.originalData.shippingPhoneNumber,
                                        cityName: previewData.originalData.shippingCityName,
                                        deliveryAddress: previewData.originalData.shippingDeliveryAddress,
                                        gstNumber: previewData.originalData.shippingGstNumber,
                                        stateName: previewData.originalData.shippingStateName
                                    }}
                                    setShippingAddress={() => {}}
                                    retailerSalesStatus={{}}
                                    staffArray={previewData.staffArray}
                                    setStaffArray={() => {}}
                                    salesInvoiceAccess={salesInvoiceAccess}
                                    fetchedAddresses={fetchedAddresses}
                                    isPreview={true}
                                />
                            </div>
                        </div>
                    </div>

                    <fieldset disabled={true} style={{ border: 'none', padding: 0, margin: 0 }}>
                    {/* product details */}
                    <FilterableTable
                        title="Items"
                        headerFontSizePx={13}
                        bodyFontSizePx={13}
                        EnableSerialNumber
                        disablePagination
                        dataArray={previewData.invoiceProduct}
                        columns={[
                            createCol('Item_Name', 'string'),
                            createCol('Batch_Name', 'string'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Act Qty',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    return row?.Act_Qty ? `${row?.Act_Qty} (${row?.Alt_Act_Qty})` : '';
                                }
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Bill Qty',
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
                                    const pIS_IGST = isEqualNumber(previewData.invoiceInfo.IS_IGST, 1);
                                    const taxPercentage = pIS_IGST ? Igst : Addition(Cgst, Sgst);
                                    const taxAmount = pIS_IGST ? Igst_Amo : Addition(Cgst_Amo, Sgst_Amo);

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
                            createCol('Amount', 'number')
                        ]}
                    />

                    <br />

                    <ExpencesOfSalesInvoice
                        invoiceExpences={previewData.invoiceExpences}
                        setInvoiceExpences={() => {}}
                        expenceMaster={baseData.expence}
                        IS_IGST={isEqualNumber(previewData.invoiceInfo.IS_IGST, 1)}
                        taxType={isEqualNumber(previewData.invoiceInfo.GST_Inclusive, 2) ? 'zerotax' : isEqualNumber(previewData.invoiceInfo.GST_Inclusive, 1) ? 'remove' : 'add'}
                        Total_Invoice_value={previewData.originalData.Total_Invoice_value}
                        invoiceProducts={previewData.invoiceProduct}
                        findProductDetails={findProductDetails}
                        products={baseData.products}
                    />

                    <br />

                    <SalesInvoiceTaxDetails
                        invoiceExpences={previewData.invoiceExpences}
                        isNotTaxableBill={isEqualNumber(previewData.invoiceInfo.GST_Inclusive, 2)}
                        isInclusive={isEqualNumber(previewData.invoiceInfo.GST_Inclusive, 1)}
                        IS_IGST={isEqualNumber(previewData.invoiceInfo.IS_IGST, 1)}
                        products={baseData.products}
                        invoiceInfo={previewData.invoiceInfo}
                        setInvoiceInfo={() => {}}
                        invExpencesTotal={previewData.originalData.Total_Expences}
                        Total_Invoice_value={previewData.originalData.Total_Invoice_value}
                        taxSplitUp={{
                            totalTaxable: previewData.originalData.Total_Before_Tax,
                            totalTax: previewData.originalData.Total_Tax,
                            cgst: previewData.originalData.CSGT_Total,
                            sgst: previewData.originalData.SGST_Total,
                            igst: previewData.originalData.IGST_Total,
                            roundOff: previewData.originalData.Round_off,
                            invoiceTotal: previewData.originalData.Total_Invoice_value
                        }}
                    />

                    {/* narration */}
                    <label className='fa-13'>Narration</label>
                    <textarea
                        className="cus-inpt fa-14"
                        rows={2}
                        value={previewData.invoiceInfo.Narration}
                        readOnly
                    />
                    </fieldset>
                </div>
            )}
        </AppDialog>
    );
};

export default SalesInvoicePreview;
