import React from "react";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn"
import { isEqualNumber, toArray } from "../../../Components/functions";
import RequiredStar from '../../../Components/requiredStar';

const ManageSalesInvoiceGeneralInfo = ({
    invoiceInfo = {},
    setInvoiceInfo,
    retailers = [],
    voucherType = [],
    branches = [],
    onChangeRetailer,
    stockItemLedgerName = []
}) => {

    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';

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
                            setInvoiceInfo(pre => ({
                                ...pre,
                                Retailer_Id: e.value,
                                Retailer_Name: e.label
                            }));

                            if (onChangeRetailer) onChangeRetailer();
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
                    />
                </div>

                {/* Date */}
                <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                    <label className='fa-13'>Entry Date <RequiredStar /></label>
                    <input
                        value={invoiceInfo?.Do_Date}
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