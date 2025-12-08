import { checkIsNumber, isEqualNumber, reactSelectFilterLogic } from "../../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from '../../../../Components/tablecolumn';

const PurchaseOrderGeneralInfo = ({
    OrderDetails = [],
    retailers = [],
    branch = [],
    setOrderDetails,
    inputStyle = '',
}) => {
    return (
        <>
            <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                    <div className="row py-2 px-3">

                        <div className="col-md-3 col-sm-6 p-2">
                            <label>Loading Date</label>
                            <input
                                type="date"
                                className={inputStyle + ' bg-light'}
                                value={OrderDetails.LoadingDate}
                                onChange={e => setOrderDetails(pre => ({ ...pre, LoadingDate: e.target.value }))}
                            />
                        </div>

                        <div className="col-md-3 col-sm-6 p-2">
                            <label>Trade Date</label>
                            <input
                                type="date"
                                className={inputStyle + ' bg-light'}
                                value={OrderDetails.TradeConfirmDate}
                                onChange={e => setOrderDetails(pre => ({ ...pre, TradeConfirmDate: e.target.value }))}
                            />
                        </div>

                        <div className="col-md-3 col-sm-6 p-2">
                            <label>Order Status</label>
                            <select
                                className={inputStyle + ' bg-light'}
                                value={OrderDetails?.OrderStatus}
                                onChange={e => setOrderDetails(pre => ({ ...pre, OrderStatus: e.target.value }))}
                            >
                                <option value="New Order">New Order</option>
                                <option value="On Process">On Process</option>
                                <option value="Completed">Completed</option>
                                <option value="Canceled">Canceled</option>
                            </select>
                        </div>

                        <div className="col-md-3 col-sm-6 p-2">
                            <label>Branch</label>
                            <select
                                className={inputStyle + ' bg-light'}
                                value={OrderDetails?.BranchId}
                                onChange={e => setOrderDetails(pre => ({ ...pre, BranchId: e.target.value }))}
                                disabled={checkIsNumber(OrderDetails.Sno)}
                            >
                                <option value="">Select Branch</option>
                                {branch.map((o, i) => (
                                    <option value={o?.BranchId} key={i}>{o?.BranchName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-9 p-2">
                            <label>Party Name</label>
                            <Select
                                value={{ value: OrderDetails.PartyId, label: OrderDetails.PartyName }}
                                onChange={e => {
                                    const selectedOption = retailers.find(
                                        ret => isEqualNumber(ret.Retailer_Id, e.value)
                                    ) ?? {}

                                    setOrderDetails(pre => ({
                                        ...pre,
                                        PartyId: selectedOption?.Retailer_Id,
                                        PartyName: selectedOption?.Retailer_Name,
                                        PartyAddress: selectedOption?.Reatailer_Address
                                    }))
                                }}
                                options={[
                                    { value: '', label: 'select', isDisabled: true },
                                    ...retailers.map(obj => ({
                                        value: obj?.Retailer_Id,
                                        label: obj?.Retailer_Name
                                    }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Select Party"}
                                menuPortalTarget={document.body}
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        <div className="col-md-4 p-2">
                            <label>Party Address</label>
                            <textarea
                                className={inputStyle + ' mb-2'}
                                value={OrderDetails.PartyAddress}
                                onChange={e => setOrderDetails(pre => ({ ...pre, PartyAddress: e.target.value }))}
                            />
                        </div>

                        <div className="col-md-4 p-2">
                            <label>Payment Condition</label>
                            <textarea
                                className={inputStyle}
                                rows={2}
                                value={OrderDetails.PaymentCondition}
                                onChange={e => setOrderDetails(pre => ({ ...pre, PaymentCondition: e.target.value }))}
                            />
                        </div>

                        <div className="col-md-4 p-2">
                            <label>Remarks</label>
                            <textarea
                                className={inputStyle}
                                rows={2}
                                value={OrderDetails.Remarks}
                                onChange={e => setOrderDetails(pre => ({ ...pre, Remarks: e.target.value }))}
                            />
                        </div>

                        <div className="col-md-4 p-2">
                            <label>Discount (% or Amount)</label>
                            <input
                                type="number"
                                className={inputStyle}
                                value={OrderDetails.Discount}
                                onChange={e => setOrderDetails(pre => ({ ...pre, Discount: e.target.value }))}
                                placeholder='ex: 10%, 20% || 250, 300'
                            />
                        </div>

                        <div className="col-md-4 p-2">
                            <label>Quality Condition</label>
                            <input
                                className={inputStyle}
                                value={OrderDetails.QualityCondition}
                                onChange={e => setOrderDetails(pre => ({ ...pre, QualityCondition: e.target.value }))}
                                placeholder='discribe the quality'
                                maxLength={150}
                            />
                        </div>

                        <div className="col-md-4 p-2">
                            <label>Payment Days (in count)</label>
                            <input
                                type="number"
                                className={inputStyle}
                                value={OrderDetails.PaymentDays}
                                onChange={e => setOrderDetails(pre => ({ ...pre, PaymentDays: e.target.value }))}
                                placeholder='ex: 30, 12'
                            />
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default PurchaseOrderGeneralInfo;