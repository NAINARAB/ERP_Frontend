import { useEffect, useState } from "react"
import {
    Addition, Division, ISOString, Multiplication, checkIsNumber,
    formatSQLDateTimeObjectToInputDateTime,
    isEqualNumber, isGraterNumber, isValidObject,
    reactSelectFilterLogic,
    toArray
} from "../../../Components/functions"
import { Button, Card, CardContent, IconButton } from "@mui/material"
import { fetchLink } from "../../../Components/fetchComponent"
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import { initialStockJournalInfoValues, initialDestinationValue, initialSoruceValue, initialStaffInvolvedValue } from './addProcessingComp/variables'
import ConsumptionOfProcessing from './addProcessingComp/consumption'
import ProductionOfProcessing from "./addProcessingComp/production";

const StockManagementCreate = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const stateDetails = location.state;
    const [baseData, setBaseData] = useState({
        products: [],
        branch: [],
        godown: [],
        voucherType: [],
        uom: [],
        staff: [],
        staffType: []
    });
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [stockJorunalInfo, setStockJorunalInfo] = useState(initialStockJournalInfoValues);
    const [sourceList, setSourceList] = useState([]);
    const [destinationList, setDestinationList] = useState([]);
    const [staffInvolvedList, setStaffInvolvedList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    branchResponse,
                    productsResponse,
                    godownLocationsResponse,
                    voucherTypeResponse,
                    uomResponse,
                    staffResponse,
                    staffCategory,
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products/allProducts` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `purchase/voucherType` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                ]);

                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );
                const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
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

                setBaseData((pre) => ({
                    ...pre,
                    products: productsData,
                    branch: branchData,
                    godown: godownLocations,
                    voucherType: voucherType,
                    uom: uomData,
                    staff: staffData,
                    staffType: staffCategoryData,
                }));
            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const source = stateDetails?.SourceDetails;
        const destination = stateDetails?.DestinationDetails;
        const staff = stateDetails?.StaffsDetails;
        if (
            isValidObject(stateDetails)
            && Array.isArray(source)
            && Array.isArray(destination)
            && Array.isArray(staff)
        ) {
            const isEditable = stateDetails?.isEditable ? true : false;
            setIsViewOnly(!isEditable);

            setStockJorunalInfo(
                Object.fromEntries(
                    Object.entries(initialStockJournalInfoValues).map(([key, value]) => {
                        if (key === 'Process_date') return [key, stateDetails[key] ? ISOString(stateDetails[key]) : value]
                        if (key === 'StartDateTime') return [key, stateDetails[key] ? formatSQLDateTimeObjectToInputDateTime(stateDetails[key]) : value]
                        if (key === 'EndDateTime') return [key, stateDetails[key] ? formatSQLDateTimeObjectToInputDateTime(stateDetails[key]) : value]
                        return [key, stateDetails[key] ?? value]
                    })
                )
            );

            setSourceList(
                source.map(sourceData => Object.fromEntries(
                    Object.entries(initialSoruceValue).map(([key, value]) => {
                        if (key === 'Sour_Item_Name') return [key, sourceData['Product_Name'] ? sourceData['Product_Name'] : value]
                        return [key, sourceData[key] ?? value]
                    })
                ))
            )

            setDestinationList(
                destination.map(destinationData => Object.fromEntries(
                    Object.entries(initialDestinationValue).map(([key, value]) => {
                        if (key === 'Dest_Item_Name') return [key, destinationData['Product_Name'] ? destinationData['Product_Name'] : value]
                        return [key, destinationData[key] ?? value]
                    })
                ))
            );

            setStaffInvolvedList(
                staff.map(staffData => Object.fromEntries(
                    Object.entries(initialStaffInvolvedValue).map(([key, value]) => {
                        if (key === 'Staff_Name') return [key, staffData['EmpNameGet'] ? staffData['EmpNameGet'] : value]
                        return [key, staffData[key] ?? value]
                    })
                ))
            );
        }
    }, [stateDetails])

    const resetForm = () => {
        setStockJorunalInfo(initialStockJournalInfoValues)
        setSourceList([])
        setDestinationList([])
        setStaffInvolvedList([])
    }

    const saveStockJournal = () => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/stockProcessing`,
            method: checkIsNumber(stockJorunalInfo?.PR_Id) ? 'PUT' : 'POST',
            bodyData: {
                ...stockJorunalInfo,
                Source: sourceList.filter(item => checkIsNumber(item?.Sour_Item_Id) && isGraterNumber(item.Sour_Qty, 0)),
                Destination: destinationList.filter(item => checkIsNumber(item?.Dest_Item_Id) && isGraterNumber(item.Dest_Qty, 0)),
                StaffInvolve: staffInvolvedList.filter(item => checkIsNumber(item?.Staff_Id)),
            }
        }).then(data => {
            if (data.success) {
                resetForm();
                toast.success(data?.message || 'Saved');
            } else {
                toast.error(data?.message || 'Failed');
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }

    return (
        <>
            <Card>
                <CardContent sx={{ minHeight: '80vh' }}>
                    <h5 className="text-center mb-2 border-bottom pb-2">STOCK MANAGEMENT</h5>
                    <form onSubmit={e => {
                        e.preventDefault();
                        saveStockJournal();
                    }}>
                        <div className="row ">
                            {/* Staff involved Info */}
                            <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                    <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                                        <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            type="button"
                                            disabled={isViewOnly}
                                            onClick={() => setStaffInvolvedList([...staffInvolvedList, { ...initialStaffInvolvedValue }])}
                                        >Add</Button>
                                    </div>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th className="fa-13">Sno</th>
                                                <th className="fa-13">Name</th>
                                                <th className="fa-13">Type</th>
                                                <th className="fa-13">#</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffInvolvedList.map((row, index) => (
                                                <tr key={index}>
                                                    <td className='fa-13 vctr text-center'>{index + 1}</td>
                                                    <td className='fa-13 w-100 p-0'>
                                                        <Select
                                                            value={{ value: row?.Staff_Id, label: row?.Staff_Name }}
                                                            onChange={e => setStaffInvolvedList(prev => {
                                                                return prev.map((item, ind) => {
                                                                    if (isEqualNumber(ind, index)) {
                                                                        const staff = baseData.staff.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                                        return {
                                                                            ...item,
                                                                            Staff_Type_Id:
                                                                                checkIsNumber(item.Staff_Type_Id)
                                                                                    ? item.Staff_Type_Id
                                                                                    : checkIsNumber(staff.User_Type)
                                                                                        ? staff.User_Type
                                                                                        : 0,
                                                                            Staff_Id: e.value,
                                                                            Staff_Name: e.label
                                                                        }
                                                                    }
                                                                    return item;
                                                                });
                                                            })}
                                                            options={
                                                                [...baseData.staff.filter(fil => (
                                                                    staffInvolvedList.findIndex(st => (
                                                                        isEqualNumber(st.Staff_Id, fil.Cost_Center_Id)
                                                                    )) === -1 ? true : false
                                                                ))].map(st => ({
                                                                    value: st.Cost_Center_Id,
                                                                    label: st.Cost_Center_Name
                                                                }))
                                                            }
                                                            styles={customSelectStyles}
                                                            isSearchable={true}
                                                            placeholder={"Select Staff"}
                                                            filterOption={reactSelectFilterLogic}
                                                        />
                                                    </td>

                                                    <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '80px' }}>
                                                        <select
                                                            value={row?.Staff_Type_Id}
                                                            onChange={e => setStaffInvolvedList(prev => {
                                                                return prev.map((item, ind) => {
                                                                    if (isEqualNumber(ind, index)) {
                                                                        return {
                                                                            ...item,
                                                                            Staff_Type_Id: e.target.value
                                                                        }
                                                                    }
                                                                    return item;
                                                                });
                                                            })}
                                                            className="cus-inpt p-2"
                                                        >
                                                            <option value="">Select</option>
                                                            {baseData.staffType.map((st, sti) =>
                                                                <option value={st?.Cost_Category_Id} key={sti}>{st?.Cost_Category}</option>
                                                            )}
                                                        </select>
                                                    </td>

                                                    <td className='fa-13 vctr p-0'>
                                                        <IconButton
                                                            onClick={() => {
                                                                setStaffInvolvedList(prev => {
                                                                    return prev.filter((_, filIndex) => index !== filIndex);
                                                                });
                                                            }}
                                                            size='small'
                                                        >
                                                            <Delete className="fa-20" color='error' />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Stock Journal Details */}
                            <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0 fa-12">
                                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                    <div className="row px-3">
                                        {/* Common Details - 1 */}
                                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                            <label>Branch</label>
                                            <select
                                                value={stockJorunalInfo.Branch_Id}
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Branch_Id: e.target.value })}
                                                placeholder={"Select Branch"}
                                                className="cus-inpt mb-2 p-2"
                                                disabled={isViewOnly}
                                            >
                                                <option value="" disabled>Select Branch</option>
                                                {baseData.branch.map((br, bi) => (
                                                    <option key={bi} value={br.BranchId}>{br.BranchName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                            <label>Date</label>
                                            <input
                                                value={stockJorunalInfo.Process_date}
                                                type="date"
                                                disabled={isViewOnly}
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Process_date: e.target.value })}
                                                className="cus-inpt p-2 mb-2"
                                            />
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                            <label>Voucher Type</label>
                                            <select
                                                value={stockJorunalInfo.VoucherType}
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, VoucherType: e.target.value })}
                                                className="cus-inpt p-2"
                                                disabled={isViewOnly}
                                            >
                                                <option value="">Select Voucher</option>
                                                {baseData.voucherType.filter(fil => fil.Type === 'PROCESSING').map((vt, vInd) => (
                                                    <option value={vt.Vocher_Type_Id} key={vInd}>{vt.Voucher_Type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                            <label>Machine Number</label>
                                            <input
                                                value={stockJorunalInfo.Machine_No}
                                                placeholder="Machine Number"
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Machine_No: e.target.value })}
                                                className="cus-inpt p-2"
                                                disabled={isViewOnly}
                                            />
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                            <label>Activity Location</label>
                                            <select
                                                value={stockJorunalInfo.Godownlocation}
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Godownlocation: e.target.value })}
                                                className="cus-inpt p-2"
                                            >
                                                <option value={''} disabled>select godown</option>
                                                {baseData.godown.map((god, godInd) => (
                                                    <option value={god.Godown_Id} key={godInd}>{god.Godown_Name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                            <label>Order Status</label>
                                            <select
                                                className="cus-inpt p-2"
                                                value={stockJorunalInfo?.PR_Status}
                                                onChange={e => setStockJorunalInfo(pre => ({ ...pre, PR_Status: e.target.value }))}
                                            >
                                                <option value="New">New</option>
                                                <option value="On Process">On Process</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Canceled">Canceled</option>
                                            </select>
                                        </div>

                                        {/* Common Details - 2 */}
                                        <div className="col-12 p-2 ">

                                            <div className="table-responsive">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th colSpan={2} className="fa-13 text-center">Time-Taken</th>
                                                            <th colSpan={2} className="fa-13 text-center">Meter-Reading</th>
                                                        </tr>
                                                        <tr>
                                                            <th className="fa-13 text-center">Start</th>
                                                            <th className="fa-13 text-center">End</th>
                                                            <th className="fa-13 text-center">Start</th>
                                                            <th className="fa-13 text-center">End</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="fa-13">
                                                                <input
                                                                    type='datetime-local'
                                                                    onChange={e => {
                                                                        setStockJorunalInfo(pre => ({ ...pre, StartDateTime: e.target.value }));
                                                                    }}
                                                                    value={stockJorunalInfo?.StartDateTime}
                                                                    className="cus-inpt p-2"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                            <td className="fa-13">
                                                                <input
                                                                    type='datetime-local'
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, EndDateTime: e.target.value }))}
                                                                    value={stockJorunalInfo?.EndDateTime}
                                                                    min={stockJorunalInfo?.StartDateTime}
                                                                    className="cus-inpt p-2"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                            <td className="fa-13">
                                                                <input
                                                                    type="number"
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, ST_Reading: e.target.value }))}
                                                                    value={stockJorunalInfo?.ST_Reading}
                                                                    min={0}
                                                                    className="cus-inpt p-2"
                                                                    placeholder="Ex: 2000"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                            <td className="fa-13">
                                                                <input
                                                                    type="number"
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, EN_Reading: e.target.value }))}
                                                                    value={stockJorunalInfo?.EN_Reading}
                                                                    min={stockJorunalInfo?.ST_Reading}
                                                                    className="cus-inpt p-2"
                                                                    placeholder="Ex: 2200"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <textarea
                                                className="cus-inpt"
                                                placeholder="Narration"
                                                rows={5}
                                                disabled={isViewOnly}
                                                value={stockJorunalInfo.Narration}
                                                onChange={e => setStockJorunalInfo(pre => ({ ...pre, Narration: e.target.value }))}
                                            ></textarea>

                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Source Details */}
                            <ConsumptionOfProcessing
                                sourceList={sourceList}
                                setSourceList={setSourceList}
                                products={toArray(baseData?.products)}
                                uom={toArray(baseData?.uom)}
                                godown={toArray(baseData?.godown)}
                            />

                            {/* Destination Entry */}
                            <ProductionOfProcessing
                                destinationList={destinationList}
                                setDestinationList={setDestinationList}
                                products={toArray(baseData?.products)}
                                uom={toArray(baseData?.uom)}
                                godown={toArray(baseData?.godown)}
                            />

                        </div>

                        <div className="my-2 d-flex justify-content-end align-items-center ">
                            <Button
                                variant="outlined"
                                type="button"
                                color="secondary"
                                disabled={isViewOnly}
                                onClick={resetForm}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="contained" className="ms-2"
                                color="primary"
                                type="submit"
                                disabled={isViewOnly}
                            >
                                {checkIsNumber(stockJorunalInfo?.STJ_Id) ? "Update" : "Save"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default StockManagementCreate;