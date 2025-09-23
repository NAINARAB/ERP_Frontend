import { Addition, isEqualNumber, onlynum, stringCompare, Subraction } from "../../../../Components/functions";
import { customSelectStyles } from "../../../../Components/tablecolumn";
import Select from 'react-select';

const TripSheetGeneralInfo = ({
    tripSheetInfo,
    setTripSheetInfo,
    branch,
    godown,
    voucherType,
    selectedItems,
    setSelectedItems
}) => {

    return (
        <>
            <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0 fa-12">

                <div className="border" style={{ minHeight: '30vh', height: '100%' }}>
                    <div className="row px-3">

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Branch</label>
                            <select
                                value={tripSheetInfo.Branch_Id}
                                onChange={e => setTripSheetInfo({ ...tripSheetInfo, Branch_Id: e.target.value })}
                                placeholder={"Select Branch"}
                                className="cus-inpt p-2"
                            >
                                <option value="" disabled>Select Branch</option>
                                {branch.map((br, bi) => (
                                    <option key={bi} value={br.BranchId}>{br.BranchName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Date</label>
                            <input
                                value={tripSheetInfo.Trip_Date}
                                type="date"
                                onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_Date: e.target.value })}
                                className="cus-inpt p-2"
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Vehicle No</label>
                            <input
                                value={tripSheetInfo.Vehicle_No}
                                onChange={e => setTripSheetInfo({ ...tripSheetInfo, Vehicle_No: e.target.value })}
                                className="cus-inpt p-2"
                                placeholder="ex: TN XX YYYY"
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Phone Number</label>
                            <input
                                value={tripSheetInfo.PhoneNumber}
                                onChange={e => setTripSheetInfo({ ...tripSheetInfo, PhoneNumber: e.target.value })}
                                className="cus-inpt p-2"
                                maxLength={10}
                                placeholder="ex: 987-654-3210"
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Activity Location</label>
                            <Select
                                value={{
                                    value: tripSheetInfo.Godownlocation,
                                    label: godown.find(g => isEqualNumber(g.Godown_Id, tripSheetInfo.Godownlocation))?.Godown_Name || ''
                                }}
                                onChange={e => {
                                    setTripSheetInfo(pre => ({ ...pre, Godownlocation: e.value }));
                                    setSelectedItems([]);
                                }}
                                options={
                                    godown.map(st => ({ value: st.Godown_Id, label: st.Godown_Name }))
                                }
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Godown"}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Bill Type</label>
                            <select
                                value={tripSheetInfo.BillType}
                                onChange={e => {
                                    setTripSheetInfo({
                                        ...tripSheetInfo,
                                        BillType: e.target.value,
                                        VoucherType: ''
                                    });
                                    setSelectedItems([]);
                                }}
                                className="cus-inpt p-2"
                            >
                                <option value={''} disabled>select</option>
                                <option value={'MATERIAL INWARD'}>MATERIAL INWARD</option>
                                <option value={'OTHER GODOWN'}>OTHER GODOWN</option>
                                <option value={'OTHERS'}>OTHERS</option>
                            </select>
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Voucher Type</label>
                            <select
                                value={tripSheetInfo.VoucherType}
                                onChange={e => setTripSheetInfo({ ...tripSheetInfo, VoucherType: e.target.value })}
                                className="cus-inpt p-2"
                            >
                                <option value={''} disabled>select voucher</option>
                                {voucherType.filter(
                                    v => stringCompare(v.Type, tripSheetInfo.BillType)
                                ).map((voucher, voucherInd) => (
                                    <option value={voucher.Vocher_Type_Id} key={voucherInd}>{voucher.Voucher_Type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Status</label>
                            <select
                                value={tripSheetInfo?.TripStatus || ''}
                                onChange={e => setTripSheetInfo(pre => ({ ...pre, TripStatus: e.target.value }))}
                                className="cus-inpt p-2"
                            >
                                <option value="">Select</option>
                                <option value="New">New</option>
                                <option value="OnProcess">OnProcess</option>
                                <option value="Completed">Completed</option>
                                <option value="Canceled">Canceled</option>
                            </select>
                        </div>

                        <div className="col-12 px-2 py-1">
                            <label>Narration</label>
                            <textarea
                                value={tripSheetInfo.Narration}
                                className="cus-inpt p-2"
                                onChange={e => setTripSheetInfo({ ...tripSheetInfo, Narration: e.target.value })}
                                rows={2}
                                placeholder="Other Details"
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered fa-13 m-0">
                            <thead>
                                <tr>
                                    <th colSpan={2} className="text-center bg-light">Time</th>
                                    <th colSpan={2} className="text-center bg-light">Distance</th>
                                </tr>
                                <tr>
                                    <th className="text-center">Start</th>
                                    <th className="text-center">End</th>
                                    <th className="text-center">Start (Km)</th>
                                    <th className="text-center">End (Km)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input
                                            type='time'
                                            onChange={e => {
                                                setTripSheetInfo(pre => ({ ...pre, StartTime: e.target.value }))
                                            }}
                                            value={tripSheetInfo?.StartTime}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type='time'
                                            onChange={e => setTripSheetInfo(pre => ({ ...pre, EndTime: e.target.value }))}
                                            value={tripSheetInfo?.EndTime}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            onChange={e => setTripSheetInfo(pre => ({
                                                ...pre,
                                                Trip_ST_KM: e.target.value,
                                                Trip_Tot_Kms: Subraction(pre.Trip_EN_KM ?? 0, e.target.value ?? 0)
                                            }))}
                                            value={tripSheetInfo?.Trip_ST_KM}
                                            min={0}
                                            className="cus-inpt p-2"
                                            placeholder="Kilometers"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            onChange={e => setTripSheetInfo(pre => ({
                                                ...pre,
                                                Trip_EN_KM: e.target.value,
                                                Trip_Tot_Kms: Subraction(e.target.value ?? 0, pre.Trip_ST_KM ?? 0)
                                            }))}
                                            value={tripSheetInfo?.Trip_EN_KM}
                                            min={Addition(tripSheetInfo?.Trip_ST_KM, 1)}
                                            className="cus-inpt p-2"
                                            placeholder="Kilometers"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                            <thead>
                                <tr>
                                    <th colSpan={2} className="text-center bg-light">Loading</th>
                                    <th colSpan={2} className="text-center bg-light">Un-Loading</th>
                                </tr>
                                <tr>
                                    <th className="text-center">Load</th>
                                    <th className="text-center">Empty</th>
                                    <th className="text-center">Load</th>
                                    <th className="text-center">Empty</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input
                                            onInput={onlynum}
                                            onChange={e => setTripSheetInfo(pre => ({ ...pre, LoadingLoad: e.target.value }))}
                                            value={tripSheetInfo?.LoadingLoad}
                                            className="cus-inpt p-2"
                                            placeholder="ex: 123Kg"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            onInput={onlynum}
                                            onChange={e => setTripSheetInfo(pre => ({ ...pre, LoadingEmpty: e.target.value }))}
                                            value={tripSheetInfo?.LoadingEmpty}
                                            className="cus-inpt p-2"
                                            placeholder="ex: 123Kg"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            onInput={onlynum}
                                            onChange={e => setTripSheetInfo(pre => ({ ...pre, UnloadingLoad: e.target.value }))}
                                            value={tripSheetInfo?.UnloadingLoad}
                                            className="cus-inpt p-2"
                                            placeholder="ex: 123Kg"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            onInput={onlynum}
                                            onChange={e => setTripSheetInfo(pre => ({ ...pre, UnloadingEmpty: e.target.value }))}
                                            value={tripSheetInfo?.UnloadingEmpty}
                                            className="cus-inpt p-2"
                                            placeholder="ex: 123Kg"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>
    )
}

export default TripSheetGeneralInfo;