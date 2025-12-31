import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { checkIsNumber, isEqualNumber, reactSelectFilterLogic, toArray, toNumber } from "../../../Components/functions";
import RequiredStar from '../../../Components/requiredStar';
import { retailerDeliveryAddressInfo } from "./variable";
import { useMemo } from "react";

const ManageSalesInvoiceGeneralInfo = ({
    invoiceInfo = {},
    setInvoiceInfo,
    retailers = [],
    voucherType = [],
    branches = [],
    onChangeRetailer,
    stockItemLedgerName = [],
    retailerDeliveryAddress = retailerDeliveryAddressInfo,
    setRetailerDeliveryAddress
}) => {

    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';

    const validRetailer = checkIsNumber(invoiceInfo?.Retailer_Id) && !isEqualNumber(invoiceInfo?.Retailer_Id, 0)

    const retailerDetails = useMemo(() => {
        return retailers.find(ret => isEqualNumber(ret.Retailer_Id, invoiceInfo?.Retailer_Id)) || {};
    }, [invoiceInfo?.Retailer_Id])

    const onChangeRetailerAddress = (column, value) => {

        const retailerAddress = retailerDetails?.deliveryAddresses.find(add => add[column] === value);

        if (retailerAddress) {
            setRetailerDeliveryAddress(pre => ({
                ...pre,
                deliveryName: retailerAddress?.deliveryName,
                phoneNumber: retailerAddress?.phoneNumber,
                cityName: retailerAddress?.cityName,
                deliveryAddress: retailerAddress?.deliveryAddress,
                id: retailerAddress.id
            }))
        } else {
            setRetailerDeliveryAddress(pre => ({
                ...pre,
                [column]: value,
                id: null
            }))
        }
    }

    return (
        <>
            <div className="row">

                {/* customer name */}
                <div className="col-sm-8 p-2">
                    <label className='fa-13'>Party Name</label>
                    <Select
                        value={{
                            value: invoiceInfo?.Retailer_Id,
                            label: invoiceInfo?.Retailer_Name
                        }}
                        onChange={e => {
                            const gstValue = retailers.find(ret => isEqualNumber(ret.Retailer_Id, e.value))?.Gstno || '';
                            setInvoiceInfo(pre => ({
                                ...pre,
                                Retailer_Id: e.value,
                                Retailer_Name: e.label,
                                gstNumber: gstValue
                            }));
                            setRetailerDeliveryAddress(retailerDeliveryAddressInfo);
                            // if (onChangeRetailer) onChangeRetailer();
                        }}
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

                {/* voucher type */}
                <div className="col-sm-4 p-2">
                    <label className='fa-13'>Voucher Type</label>
                    <Select
                        value={{
                            value: invoiceInfo.Voucher_Type,
                            label: toArray(voucherType).find(v => isEqualNumber(v.Vocher_Type_Id, invoiceInfo.Voucher_Type))?.Voucher_Type
                        }}
                        onChange={e => setInvoiceInfo(pre => ({ ...pre, Voucher_Type: e.value }))}
                        options={[
                            { value: '', label: 'Search', isDisabled: true },
                            ...toArray(voucherType).filter(
                                fil => fil?.Type === 'SALES'
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
                    />
                </div>

                {/* GSTNO */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label >GSTNO</label>
                    <input
                        value={invoiceInfo?.gstNumber || ""}
                        className={inputStyle}
                        placeholder="ex: 15-CHAR-STRING"
                        onChange={e => setInvoiceInfo(pre => ({ ...pre, gstNumber: e.target.value }))}
                    />
                </div>

                {/* retailer address - start */}

                {/* delivery name */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label htmlFor="nameInput">Mailing Name</label>
                    <input
                        id="nameInput"
                        list="deliveryName"
                        value={retailerDeliveryAddress?.deliveryName || ""}
                        className={inputStyle}
                        placeholder="ex: Party name / Other"
                        onChange={e => onChangeRetailerAddress('deliveryName', e.target.value)}
                        disabled={!validRetailer}
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
                        value={retailerDeliveryAddress?.phoneNumber || ""}
                        className={inputStyle}
                        placeholder="ex: 9876543210"
                        onChange={e => onChangeRetailerAddress('phoneNumber', e.target.value)}
                        disabled={!validRetailer}
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
                        value={retailerDeliveryAddress?.cityName || ""}
                        className={inputStyle}
                        placeholder="ex: Madurai"
                        onChange={e => onChangeRetailerAddress('cityName', e.target.value)}
                        disabled={!validRetailer}
                    />
                    <datalist id="cityName">
                        {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                            <option key={i} value={addr?.cityName}>{addr?.cityName}</option>
                        ))}
                    </datalist>
                </div>

                {/* address */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label htmlFor="addressInput">Address</label>
                    <input
                        id="addressInput"
                        list="deliveryAddress"
                        value={retailerDeliveryAddress?.deliveryAddress || ""}
                        className={inputStyle}
                        placeholder="ex: 123, ABC Street"
                        onChange={e => onChangeRetailerAddress('deliveryAddress', e.target.value)}
                        disabled={!validRetailer}
                    />
                    <datalist id="deliveryAddress">
                        {toArray(retailerDetails?.deliveryAddresses).map((addr, i) => (
                            <option key={i} value={addr?.deliveryAddress}>{addr?.deliveryAddress}</option>
                        ))}
                    </datalist>
                </div>

                {/* retailer address - end */}

                {/* Date */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label className='fa-13'>Entry Date <RequiredStar /></label>
                    <input
                        value={invoiceInfo?.Do_Date || ""}
                        type="date"
                        required
                        className={inputStyle}
                        onChange={e => setInvoiceInfo(pre => ({ ...pre, Do_Date: e.target.value }))}
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

                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label className='fa-13'>Purchase Ref</label>
                    <input
                        value={invoiceInfo?.Ref_Inv_Number}
                        className={inputStyle}
                        onChange={e => setInvoiceInfo(pre => ({ ...pre, Ref_Inv_Number: String(e.target.value).trim() }))}
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

                {/* DELIVERY STATUS */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label className='fa-13'>Delivery Status</label>
                    <select
                        className="cus-inpt p-2"
                        onChange={(e) =>
                            setInvoiceInfo({
                                ...invoiceInfo,
                                Delivery_Status: toNumber(e.target.value),
                            })
                        }
                        value={toNumber(invoiceInfo.Delivery_Status)}
                    >
                        <option value={0}>Select</option>
                        <option value={5}>Pending</option>
                        <option value={7}>Delivered</option>
                        <option value={6}>Return</option>
                    </select>
                </div>

                {/* PAYMENT STATUS */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label className='fa-13'>Payment Status</label>
                    <select
                        className="cus-inpt p-2"
                        onChange={(e) =>
                            setInvoiceInfo({
                                ...invoiceInfo,
                                Payment_Status: toNumber(e.target.value),
                            })
                        }
                        value={toNumber(invoiceInfo.Payment_Status)}
                    >
                        <option value={0}>Select</option>
                        <option value={1}>Pending</option>
                        <option value={3}>Complete</option>
                    </select>
                </div>

                {/* PAYMENT MODE */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label className='fa-13'>Payment Mode</label>
                    <select
                        className="cus-inpt p-2"
                        onChange={(e) =>
                            setInvoiceInfo({
                                ...invoiceInfo,
                                Payment_Mode: toNumber(e.target.value),
                            })
                        }
                        value={toNumber(invoiceInfo.Payment_Mode)}
                    >
                        <option value={0}>Select</option>
                        <option value={1}>Cash</option>
                        <option value={3}>QR-Pay</option>
                        <option value={2}>G-Pay</option>
                    </select>
                </div>

            </div>

            <label className='fa-13'>Narration</label>
            <textarea
                className="cus-inpt fa-14"
                rows={2}
                value={invoiceInfo.Narration}
                onChange={e => setInvoiceInfo(pre => ({ ...pre, Narration: e.target.value }))}
            />

        </>
    )
}

export default ManageSalesInvoiceGeneralInfo;