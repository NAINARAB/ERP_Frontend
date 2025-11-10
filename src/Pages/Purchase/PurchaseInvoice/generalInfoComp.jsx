import { reactSelectFilterLogic, stringCompare } from "../../../Components/functions";
import RequiredStar from "../../../Components/requiredStar";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from 'react-select';


const PurchaseInvoiceGeneralInfo = ({
    invoiceDetails,
    setInvoiceDetails,
    baseData,
    selectedItems,
    setSelectedItems,
    searchFromArrival,
    inputStyle,
}) => {

    return (
        <>
            <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                    <div className="row">

                        <div className="col-sm-8 p-2">
                            <label className='fa-13'>Vendor</label>
                            <Select
                                value={{
                                    value: invoiceDetails?.Retailer_Id,
                                    label: invoiceDetails?.Retailer_Name
                                }}
                                onChange={e => {
                                    setInvoiceDetails(pre => ({
                                        ...pre,
                                        Retailer_Id: e.value,
                                        Retailer_Name: e.label
                                    }));
                                    setSelectedItems([]);
                                    searchFromArrival(e.value)
                                }}
                                options={[
                                    { value: '', label: 'Search', isDisabled: true },
                                    ...baseData.retailers.map(obj => ({
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

                        <div className="col-sm-4 p-2">
                            <label className='fa-13'>Voucher Type</label>
                            <select
                                value={invoiceDetails.Voucher_Type}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Voucher_Type: e.target.value }))}
                                className={inputStyle}
                                required
                            >
                                <option value="">Select</option>
                                {baseData.voucherType.filter(
                                    fil => stringCompare(fil.Type, 'PURCHASE_INVOICE')
                                ).map((vou, vind) =>
                                    <option
                                        value={vou.Vocher_Type_Id}
                                        key={vind}
                                    >{vou.Voucher_Type}</option>
                                )}
                            </select>
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Branch <RequiredStar /></label>
                            <select
                                className={inputStyle}
                                value={invoiceDetails?.Branch_Id}
                                required
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Branch_Id: e.target.value }))}
                            >
                                <option value="">select</option>
                                {baseData.branch.map((o, i) => (
                                    <option value={o?.BranchId} key={i}>{o?.BranchName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Entry Date <RequiredStar /></label>
                            <input
                                value={invoiceDetails?.Po_Entry_Date}
                                type="date"
                                required
                                className={inputStyle}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Entry_Date: e.target.value }))}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Bill Date <RequiredStar /></label>
                            <input
                                value={invoiceDetails?.Po_Inv_Date}
                                type="date"
                                required
                                className={inputStyle}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Inv_Date: e.target.value }))}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Ref Number</label>
                            <input
                                value={invoiceDetails?.Ref_Po_Inv_No}
                                className={inputStyle}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Ref_Po_Inv_No: e.target.value }))}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>GST Type <RequiredStar /></label>
                            <select
                                className={inputStyle}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, GST_Inclusive: Number(e.target.value) }))}
                                value={invoiceDetails.GST_Inclusive}
                                required
                            >
                                <option value={1}>Inclusive Tax</option>
                                <option value={0}>Exclusive Tax</option>
                                <option value={2}>Not Taxable</option>
                            </select>
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Tax Type</label>
                            <select
                                className={inputStyle}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, IS_IGST: Number(e.target.value) }))}
                                value={invoiceDetails.IS_IGST}
                            >
                                <option value='0'>GST</option>
                                <option value='1'>IGST</option>
                            </select>
                        </div>

                        <div className="col-sm-6 p-2">
                            <label className='fa-13'>Stock Item Ledger Name</label>
                            <Select
                                value={{ value: invoiceDetails.Stock_Item_Ledger_Name, label: invoiceDetails.Stock_Item_Ledger_Name }}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Stock_Item_Ledger_Name: e.label }))}
                                options={[
                                    { value: '', label: 'Search', isDisabled: true },
                                    ...baseData.stockItemLedgerName.map(obj => ({
                                        value: obj?.Stock_Item_Ledger_Name,
                                        label: obj?.Stock_Item_Ledger_Name
                                    }))
                                ]}
                                styles={customSelectStyles}
                                required={true}
                                isSearchable={true}
                                placeholder={"Select"}
                                maxMenuHeight={300}
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Discount (% or Amount)</label>
                            <input
                                type="number"
                                className={inputStyle}
                                value={invoiceDetails.Discount}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, Discount: e.target.value }))}
                                placeholder='ex: 10%, 20% || 250, 300'
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Quality Condition</label>
                            <input
                                className={inputStyle}
                                value={invoiceDetails.QualityCondition}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, QualityCondition: e.target.value }))}
                                placeholder='discribe the quality'
                                maxLength={150}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                            <label className='fa-13'>Payment Days (in count)</label>
                            <input
                                type="number"
                                className={inputStyle}
                                value={invoiceDetails.PaymentDays}
                                onChange={e => setInvoiceDetails(pre => ({ ...pre, PaymentDays: e.target.value }))}
                                placeholder='ex: 30, 12'
                            />
                        </div>

                    </div>

                    <label className='fa-13'>Narration</label>
                    <textarea
                        className="cus-inpt fa-14"
                        rows={2}
                        value={invoiceDetails.Narration}
                        onChange={e => setInvoiceDetails(pre => ({ ...pre, Narration: e.target.value }))}
                    />

                </div>
            </div>
        </>
    )
}

export default PurchaseInvoiceGeneralInfo;