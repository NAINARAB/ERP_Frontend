import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { checkIsNumber, getNextDate, getPreviousDate, isEqualNumber, ISOString, isValidNumber, LocalDate, reactSelectFilterLogic, stringCompare, toArray, toNumber } from "../../../Components/functions";
import RequiredStar from '../../../Components/requiredStar';
import { useMemo, useState } from "react";
import AppTabs from "../../../Components/appTabsComponent";
import AppDialog from "../../../Components/appDialogComponent";
import { Button, IconButton } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const ManageCreditNoteGeneralInfo = ({
    invoiceInfo = {},
    setInvoiceInfo,
    retailers = [],
    voucherType = [],
    branches = [],
    stockItemLedgerName = [],
    onChangeRetailer,
    retailerSalesStatus = {},
    loadingOn,
    loadingOff,
}) => {

    const inputStyle = 'cus-inpt p-2';

    const [open, setOpen] = useState(false);

    const validRetailer = checkIsNumber(invoiceInfo?.Retailer_Id) && !isEqualNumber(invoiceInfo?.Retailer_Id, 0)

    const retailerDetails = useMemo(() => {
        return toArray(retailers).find(ret => isEqualNumber(ret.Retailer_Id, invoiceInfo?.Retailer_Id)) || {};
    }, [invoiceInfo?.Retailer_Id, retailers])

    const onChangeRetailerAddress = (column, value) => {
        const retailerAddress = toArray(retailerDetails?.deliveryAddresses).find(add => stringCompare(add[column], value));

        if (retailerAddress) {
            setInvoiceInfo(pre => ({
                ...pre,
                Mailing_Name: retailerAddress?.deliveryName || '',
                Mailing_Phone: retailerAddress?.phoneNumber || '',
                Mailing_City: retailerAddress?.cityName || '',
                Mailing_Address: retailerAddress?.deliveryAddress || '',
                Mailing_GST: retailerAddress?.gstNumber || '',
                Mailing_State: retailerAddress?.stateName || ''
            }));
        } else {
            setInvoiceInfo(pre => ({
                ...pre,
                [column]: value
            }));
        }
    }

    const onChangeRetailerName = (e) => {
        setInvoiceInfo(pre => ({
            ...pre,
            Retailer_Id: e.value,
            Retailer_Name: e.label,
        }));
        if (onChangeRetailer) onChangeRetailer();
    }

    return (
        <>
            <div className="row">

                <AppTabs
                    tabData={[
                        {
                            label: 'General Info',
                            children: (
                                <div className='row'>
                                    {/* customer name */}
                                    <div className="col-sm-8 p-2">
                                        <label className='fa-13'>Party Name <RequiredStar /></label>
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <Select
                                                    value={{
                                                        value: invoiceInfo?.Retailer_Id,
                                                        label: invoiceInfo?.Retailer_Name
                                                    }}
                                                    onChange={onChangeRetailerName}
                                                    options={[
                                                        { value: '', label: 'Search', isDisabled: true },
                                                        ...toArray(retailers).map(obj => ({
                                                            value: obj?.Retailer_Id,
                                                            label: obj?.Retailer_Name
                                                        }))
                                                    ]}
                                                    styles={customSelectStyles}
                                                    isSearchable={true}
                                                    placeholder={"Select Vendor"}
                                                    maxMenuHeight={300}
                                                    filterOption={reactSelectFilterLogic}
                                                />
                                            </div>
                                            <IconButton
                                                onClick={() => setOpen(true)}
                                                disabled={!isValidNumber(invoiceInfo?.Retailer_Id)}
                                            ><InfoOutlined /></IconButton>
                                        </div>
                                    </div>

                                    {/* voucher type */}
                                    <div className="col-sm-4 p-2">
                                        <label className='fa-13'>Voucher Type <RequiredStar /></label>
                                        <Select
                                            value={{
                                                value: invoiceInfo.Voucher_Type,
                                                label: toArray(voucherType).find(v => isEqualNumber(v.Vocher_Type_Id, invoiceInfo.Voucher_Type))?.Voucher_Type
                                            }}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Voucher_Type: e.value }))}
                                            options={[
                                                { value: '', label: 'Search', isDisabled: true },
                                                ...toArray(voucherType).filter(
                                                    fil => fil?.Type === 'CREDIT_NOTE' // Adjust according to your DB Type
                                                ).map(obj => ({
                                                    value: obj?.Vocher_Type_Id,
                                                    label: obj?.Voucher_Type
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            required={true}
                                            placeholder={"Select Voucher Type"}
                                            maxMenuHeight={300}
                                            filterOption={reactSelectFilterLogic}
                                            isDisabled={isValidNumber(invoiceInfo.CR_Id)}
                                        />
                                    </div>

                                    {/* Date */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Entry Date <RequiredStar /></label>
                                        <input
                                            value={invoiceInfo?.CR_Date ? ISOString(invoiceInfo.CR_Date) : ""}
                                            type="date"
                                            required
                                            className={inputStyle}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, CR_Date: e.target.value }))}
                                        />
                                    </div>

                                    {/* branch */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Branch <RequiredStar /></label>
                                        <select
                                            className={inputStyle}
                                            value={invoiceInfo?.Branch_Id}
                                            required
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Branch_Id: e.target.value }))}
                                        >
                                            <option value="">select</option>
                                            {branches.map((o, i) => (
                                                <option value={o?.BranchId} key={i}>{o?.BranchName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* GST TYPE */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>GST Type <RequiredStar /></label>
                                        <select
                                            className={inputStyle}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, GST_Inclusive: Number(e.target.value) }))}
                                            value={invoiceInfo.GST_Inclusive}
                                            required
                                        >
                                            <option value={1}>Inclusive Tax</option>
                                            <option value={0}>Exclusive Tax</option>
                                            <option value={2}>Not Taxable</option>
                                        </select>
                                    </div>

                                    {/* TAX TYPE */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Tax Type</label>
                                        <select
                                            className={inputStyle}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, IS_IGST: Number(e.target.value) }))}
                                            value={invoiceInfo.IS_IGST}
                                        >
                                            <option value='0'>GST</option>
                                            <option value='1'>IGST</option>
                                        </select>
                                    </div>

                                    {/* stock item ledger name */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Stock Item Ledger Name</label>
                                        <Select
                                            value={{ value: invoiceInfo.Stock_Item_Ledger_Name, label: invoiceInfo.Stock_Item_Ledger_Name }}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Stock_Item_Ledger_Name: e.value }))}
                                            options={[
                                                { value: '', label: 'Search', isDisabled: true },
                                                ...stockItemLedgerName.map(obj => ({
                                                    value: obj?.Stock_Item_Ledger_Name,
                                                    label: obj?.Stock_Item_Ledger_Name
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            required={true}
                                            isSearchable={true}
                                            placeholder={"Select"}
                                            maxMenuHeight={300}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </div>

                                    {/* Original Invoice ref */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Original Invoice No</label>
                                        <input
                                            value={invoiceInfo?.Ref_Inv_Number}
                                            className={inputStyle}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Ref_Inv_Number: String(e.target.value).trim() }))}
                                        />
                                    </div>

                                    {/* Original Invoice Date */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Original Invoice Date</label>
                                        <input
                                            type="date"
                                            value={invoiceInfo?.Ref_Inv_Date ? ISOString(invoiceInfo?.Ref_Inv_Date) : ''}
                                            className={inputStyle}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Ref_Inv_Date: String(e.target.value).trim() }))}
                                        />
                                    </div>

                                    {/* STATUS */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Status</label>
                                        <select
                                            value={invoiceInfo?.Cancel_status}
                                            className={inputStyle}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Cancel_status: e.target.value }))}
                                        >
                                            <option value="" disabled>Select</option>
                                            <option value="1">New</option>
                                            <option value="2">Progess</option>
                                            <option value="3">Completed</option>
                                            <option value="0">Canceled</option>
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Payment Days (in count)</label>
                                        <input
                                            type="number"
                                            className={inputStyle}
                                            value={invoiceInfo.paymentDueDays}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, paymentDueDays: e.target.value }))}
                                            placeholder='ex: 30, 12'
                                        />
                                    </div>

                                    {/* NARRATION */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Narration</label>
                                        <input
                                            className={inputStyle}
                                            value={invoiceInfo.Narration || ''}
                                            onChange={e => setInvoiceInfo(pre => ({ ...pre, Narration: e.target.value }))}
                                            placeholder='Notes...'
                                        />
                                    </div>

                                    {isValidNumber(invoiceInfo?.CR_Id) && (
                                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                            <label className='fa-13'>Edit Reason <RequiredStar /></label>
                                            <input
                                                value={invoiceInfo?.Alter_Reason}
                                                className={inputStyle}
                                                onChange={e => setInvoiceInfo(pre => ({ ...pre, Alter_Reason: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        },
                        {
                            label: 'Mailing Info',
                            children: (
                                <div className='row'>
                                    {/* GSTNO */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label >GSTNO</label>
                                        <input
                                            id="billingGSTNI"
                                            list="billingGSTINData"
                                            value={invoiceInfo?.Mailing_GST || ""}
                                            className={inputStyle}
                                            placeholder="ex: 15-CHAR-STRING"
                                            onChange={e => onChangeRetailerAddress('Mailing_GST', e.target.value)}
                                            disabled={!validRetailer}
                                            autoComplete="off"
                                        />
                                        <datalist id="billingGSTINData">
                                            {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                                                <option value={addr?.gstNumber} key={i}>{addr?.gstNumber}</option>
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* delivery name */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label htmlFor="nameInput">Mailing Name</label>
                                        <input
                                            id="nameInput"
                                            list="deliveryName"
                                            value={invoiceInfo?.Mailing_Name || ""}
                                            className={inputStyle}
                                            placeholder="ex: Party name / Other"
                                            onChange={e => onChangeRetailerAddress('Mailing_Name', e.target.value)}
                                            disabled={!validRetailer}
                                            autoComplete="off"
                                        />
                                        <datalist id="deliveryName">
                                            {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                                                <option key={i} value={addr?.deliveryName}>{addr?.deliveryName}</option>
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* phone number */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label htmlFor="phoneInput">Phone Number</label>
                                        <input
                                            id="phoneInput"
                                            list="phoneNumber"
                                            value={invoiceInfo?.Mailing_Phone || ""}
                                            className={inputStyle}
                                            placeholder="ex: 9876543210"
                                            onChange={e => onChangeRetailerAddress('Mailing_Phone', e.target.value)}
                                            disabled={!validRetailer}
                                            autoComplete="off"
                                        />
                                        <datalist id="phoneNumber">
                                            {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                                                <option key={i} value={addr?.phoneNumber}>{addr?.phoneNumber}</option>
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* City name */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label htmlFor="cityInput">City Name</label>
                                        <input
                                            id="cityInput"
                                            list="cityName"
                                            value={invoiceInfo?.Mailing_City || ""}
                                            className={inputStyle}
                                            placeholder="ex: Madurai"
                                            onChange={e => onChangeRetailerAddress('Mailing_City', e.target.value)}
                                            disabled={!validRetailer}
                                            autoComplete="off"
                                        />
                                        <datalist id="cityName">
                                            {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                                                <option key={i} value={addr?.cityName}>{addr?.cityName}</option>
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* State name */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label htmlFor="billingStateInput">State name</label>
                                        <input
                                            id="billingStateInput"
                                            list="billingState"
                                            value={invoiceInfo?.Mailing_State || ""}
                                            className={inputStyle}
                                            placeholder="ex: TamilNadu"
                                            onChange={e => onChangeRetailerAddress('Mailing_State', e.target.value)}
                                            disabled={!validRetailer}
                                            autoComplete="off"
                                        />
                                        <datalist id="billingState">
                                            {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                                                <option key={i} value={addr?.stateName}>{addr?.stateName}</option>
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* address */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label htmlFor="addressInput">Address</label>
                                        <input
                                            id="addressInput"
                                            list="deliveryAddress"
                                            value={invoiceInfo?.Mailing_Address || ""}
                                            className={inputStyle}
                                            placeholder="ex: 123, ABC Street"
                                            onChange={e => onChangeRetailerAddress('Mailing_Address', e.target.value)}
                                            disabled={!validRetailer}
                                            autoComplete="off"
                                        />
                                        <datalist id="deliveryAddress">
                                            {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                                                <option key={i} value={addr?.deliveryAddress}>{addr?.deliveryAddress}</option>
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Transaction Limit',
                            children: (
                                <div className="row">
                                    {/* outstanding */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Outstanding</label>
                                        <input
                                            className="cus-inpt p-2"
                                            value={retailerSalesStatus?.outstanding}
                                            readOnly
                                        />
                                    </div>
                                    {/* credit limit */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Credit Limit</label>
                                        <input
                                            className="cus-inpt p-2"
                                            value={
                                                isEqualNumber(retailerSalesStatus?.creditLimit, 0)
                                                    ? 'Unlimited'
                                                    : retailerSalesStatus?.creditLimit
                                            }
                                            readOnly
                                        />
                                    </div>
                                    {/* credit days */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Due Days</label>
                                        <input
                                            className="cus-inpt p-2"
                                            value={
                                                isEqualNumber(retailerSalesStatus?.creditDays, 0)
                                                    ? 'Unlimited'
                                                    : retailerSalesStatus?.creditDays
                                            }
                                            readOnly
                                        />
                                    </div>

                                    {/* previous invoice date */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Recent Sales Date</label>
                                        <input
                                            className="cus-inpt p-2"
                                            value={retailerSalesStatus?.recentDate ? LocalDate(retailerSalesStatus?.recentDate) : ''}
                                            readOnly
                                        />
                                    </div>

                                    {/* due date */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label className='fa-13'>Due Date</label>
                                        <input
                                            className="cus-inpt p-2"
                                            value={
                                                (retailerSalesStatus?.recentDate && isValidNumber(retailerSalesStatus?.creditDays))
                                                    ? LocalDate(getNextDate(retailerSalesStatus?.creditDays, retailerSalesStatus?.recentDate))
                                                    : ''
                                            }
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )
                        }
                    ]}
                />

            </div>

        </>
    )
}

export default ManageCreditNoteGeneralInfo;
