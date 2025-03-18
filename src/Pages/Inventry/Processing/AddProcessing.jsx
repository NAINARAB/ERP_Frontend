import { useEffect, useState } from "react"
import {
    Addition, Division, ISOString, Multiplication, checkIsNumber, combineDateTime, extractHHMM,
    formatDateForDatetimeLocal,
    getSessionUser, isEqualNumber, isGraterNumber, isValidObject
} from "../../../Components/functions"
import { Button, Card, CardContent, IconButton } from "@mui/material"
import { fetchLink } from "../../../Components/fetchComponent"
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import RequiredStar from '../../../Components/requiredStar';
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";

const { user } = getSessionUser();

const initialStockJournalInfoValues = {
    PR_Id: '',
    PR_Inv_Id: '',
    Year_Id: '',
    Branch_Id: '',
    Process_no: '',
    P_No: '',

    Godownlocation: '',
    BillType: 'New',
    VoucherType: '',
    Process_date: '',
    Machine_No: '',
    StartDateTime: '',
    EndDateTime: '',
    ST_Reading: '',
    EN_Reading: '',
    Total_Reading: '',
    Narration: '',
    PR_Status: 'NEW',
    Created_By: user?.name,
    Updated_By: user?.name,
}

const initialSoruceValue = {
    SJD_Id: '',
    STJ_Id: '',
    Sour_Item_Id: '',
    Sour_Item_Name: '',
    Sour_Goodown_Id: '',
    Sour_Batch_Lot_No: '',
    Sour_Qty: '',
    Sour_Unit_Id: '',
    Sour_Unit: '',
    Sour_Rate: '',
    Sour_Amt: '',
}

const initialDestinationValue = {
    SJD_Id: '',
    STJ_Id: '',
    Dest_Item_Id: '',
    Dest_Item_Name: '',
    Dest_Goodown_Id: '',
    Dest_Batch_Lot_No: '',
    Dest_Qty: '',
    Dest_Unit_Id: '',
    Dest_Unit: '',
    Dest_Rate: '',
    Dest_Amt: '',
}

const initialStaffInvolvedValue = {
    STJ_Id: '',
    S_Id: '',
    Staff_Id: '',
    Staff_Name: '',
    Staff_Type_Id: '',
}

const soruceAndDestination = [
    { source: 'Sour_Item_Id', destination: 'Dest_Item_Id' },
    { source: 'Sour_Item_Name', destination: 'Dest_Item_Name' },
    { source: 'Sour_Goodown_Id', destination: 'Dest_Goodown_Id' },
    { source: 'Sour_Batch_Lot_No', destination: 'Dest_Batch_Lot_No' },
    { source: 'Sour_Qty', destination: 'Dest_Qty' },
    { source: 'Sour_Unit_Id', destination: 'Dest_Unit_Id' },
    { source: 'Sour_Unit', destination: 'Dest_Unit' },
    { source: 'Sour_Rate', destination: 'Dest_Rate' },
    { source: 'Sour_Amt', destination: 'Dest_Amt' },
];

const StockManagementCreate = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    // const navigation = useNavigate();
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
                    fetchLink({ address: `masters/products` }),
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
            setIsViewOnly(isEditable);

            setStockJorunalInfo(
                Object.fromEntries(
                    Object.entries(initialStockJournalInfoValues).map(([key, value]) => {
                        if (key === 'Process_date') return [key, stateDetails[key] ? ISOString(stateDetails[key]) : value]
                        if (key === 'StartDateTime') return [key, stateDetails[key] ? formatDateForDatetimeLocal(stateDetails[key]) : value]
                        if (key === 'EndDateTime') return [key, stateDetails[key] ? formatDateForDatetimeLocal(stateDetails[key]) : value]
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
                        if (key === 'Staff_Name') return [key, staffData['Cost_Center_Name'] ? staffData['Cost_Center_Name'] : value]
                        return [key, staffData[key] ?? value]
                    })
                ))
            );
        }
    }, [stateDetails])

    const changeSourceValue = (rowIndex, key, value) => {
        setSourceList((prev) => {
            return prev.map((item, index) => {

                if (isEqualNumber(index, rowIndex)) {
                    switch (key) {
                        case 'Sour_Item_Id': {
                            const newItem = { ...item, Sour_Item_Id: value };
                            newItem.Sour_Item_Name = baseData.products?.find(pro =>
                                isEqualNumber(pro?.Product_Id, value)
                            )?.Product_Name ?? 'Not available';
                            return newItem;
                        }
                        case 'Sour_Unit_Id': {
                            const newItem = { ...item, Sour_Unit_Id: value };
                            newItem.Sour_Unit = baseData.uom?.find(uom =>
                                isEqualNumber(uom?.Unit_Id, value)
                            )?.Units ?? 'Not available';
                            return newItem;
                        }
                        case 'Sour_Qty': {
                            const newItem = { ...item, Sour_Qty: value };
                            if (item.Sour_Rate) {
                                newItem.Sour_Amt = Multiplication(item.Sour_Rate, value);
                            } else if (item.Sour_Amt) {
                                newItem.Sour_Rate = Division(item.Sour_Amt, value);
                            } else {
                                newItem.Sour_Amt = '';
                                newItem.Sour_Rate = '';
                            }
                            return newItem;
                        }
                        case 'Sour_Rate': {
                            const newItem = { ...item, Sour_Rate: value };
                            if (item.Sour_Qty) {
                                newItem.Sour_Amt = Multiplication(value, item.Sour_Qty);
                            } else if (item.Sour_Amt) {
                                newItem.Sour_Qty = Division(item.Sour_Amt, value);
                            } else {
                                newItem.Sour_Amt = '';
                                newItem.Sour_Qty = '';
                            }
                            return newItem;
                        }
                        case 'Sour_Amt': {
                            const newItem = { ...item, Sour_Amt: value };
                            if (checkIsNumber(item.Sour_Qty)) {
                                newItem.Sour_Rate = Division(value, item.Sour_Qty);
                            } else if (checkIsNumber(item.Sour_Rate)) {
                                newItem.Sour_Qty = Division(value, item.Sour_Rate);
                            } else {
                                newItem.Sour_Rate = '';
                                newItem.Sour_Qty = '';
                            }
                            return newItem;
                        }
                        default:
                            return { ...item, [key]: value };
                    }
                }
                return item;
            });
        });
    };

    const changeDestinationValues = (rowIndex, key, value) => {
        setDestinationList((prev) => {
            return prev.map((item, index) => {

                if (isEqualNumber(index, rowIndex)) {
                    switch (key) {
                        case 'Dest_Item_Id': {
                            const newItem = { ...item, Dest_Item_Id: value };
                            newItem.Dest_Item_Name = baseData.products?.find(pro =>
                                isEqualNumber(pro?.Product_Id, value)
                            )?.Product_Name ?? 'Not available';
                            return newItem;
                        }
                        case 'Dest_Unit_Id': {
                            const newItem = { ...item, Dest_Unit_Id: value };
                            newItem.Dest_Unit = baseData.uom?.find(uom =>
                                isEqualNumber(uom?.Unit_Id, value)
                            )?.Units ?? 'Not available';
                            return newItem;
                        }
                        case 'Dest_Qty': {
                            const newItem = { ...item, Dest_Qty: value };
                            if (item.Dest_Rate) {
                                newItem.Dest_Amt = Multiplication(item.Dest_Rate, value);
                            } else if (item.Dest_Amt) {
                                newItem.Dest_Rate = Division(item.Dest_Amt, value);
                            } else {
                                newItem.Dest_Amt = '';
                                newItem.Dest_Rate = '';
                            }
                            return newItem;
                        }
                        case 'Dest_Rate': {
                            const newItem = { ...item, Dest_Rate: value };
                            if (item.Dest_Qty) {
                                newItem.Dest_Amt = Multiplication(value, item.Dest_Qty);
                            } else if (item.Dest_Amt) {
                                newItem.Dest_Qty = Division(item.Dest_Amt, value);
                            } else {
                                newItem.Dest_Amt = '';
                                newItem.Dest_Qty = '';
                            }
                            return newItem;
                        }
                        case 'Dest_Amt': {
                            const newItem = { ...item, Dest_Amt: value };
                            if (checkIsNumber(item.Dest_Qty)) {
                                newItem.Dest_Rate = Division(value, item.Dest_Qty);
                            } else if (checkIsNumber(item.Dest_Rate)) {
                                newItem.Dest_Qty = Division(value, item.Dest_Rate);
                            } else {
                                newItem.Dest_Rate = '';
                                newItem.Dest_Qty = '';
                            }
                            return newItem;
                        }
                        default:
                            return { ...item, [key]: value };
                    }
                }
                return item;
            });
        });
    };

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
            method: checkIsNumber(stockJorunalInfo?.STJ_Id) ? 'PUT' : 'POST',
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
                                                                    min={Addition(stockJorunalInfo?.ST_Reading, 1)}
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
                            <div className="col-12 p-2 mb-2">
                                <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                                    <h5 className="flex-grow-1 ">
                                        CONSUMPTION
                                    </h5>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        type="button"
                                        onClick={() => {
                                            setSourceList([...sourceList, { ...initialSoruceValue }]);
                                        }}
                                    >Add</Button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th className="fa-13">Sno</th>
                                                <th className="fa-13">Item <RequiredStar /></th>
                                                <th className="fa-13">Batch Lot No</th>
                                                <th className="fa-13">Quantity <RequiredStar /></th>
                                                <th className="fa-13">Unit</th>
                                                <th className="fa-13">Rate</th>
                                                <th className="fa-13">Amount</th>
                                                <th className="fa-13">Location <RequiredStar /></th>
                                                <th className="fa-13">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sourceList.map((row, index) => (
                                                <tr key={index}>
                                                    <td className='fa-13'>{index + 1}</td>
                                                    <td className='fa-13 p-0' style={{ minWidth: '200px' }}>
                                                        <Select
                                                            value={{ value: row?.Sour_Item_Id, label: row?.Sour_Item_Name }}
                                                            onChange={e => changeSourceValue(index, 'Sour_Item_Id', e.value)}
                                                            options={
                                                                baseData.products
                                                                    .filter(pro =>
                                                                        !sourceList.some(src => isEqualNumber(pro.Product_Id, src.Sour_Item_Id))
                                                                    )
                                                                    .map(pro => ({ value: pro.Product_Id, label: pro.Product_Name }))
                                                            }
                                                            menuPortalTarget={document.body}
                                                            styles={customSelectStyles}
                                                            isSearchable={true}
                                                            placeholder={"Select Item"}
                                                            maxMenuHeight={300}
                                                        />

                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Batch_Lot_No ?? ""}
                                                            onChange={e => changeSourceValue(index, 'Sour_Batch_Lot_No', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Qty ?? ""}
                                                            type="number"
                                                            min={1}
                                                            required
                                                            onChange={e => changeSourceValue(index, 'Sour_Qty', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <select
                                                            value={row?.Sour_Unit_Id ?? ""}
                                                            onChange={e => changeSourceValue(index, 'Sour_Unit_Id', e.target.value)}
                                                            className="cus-inpt p-2"
                                                            style={{ minWidth: '40px' }}
                                                        >
                                                            <option value="" disabled>Select Unit</option>
                                                            {baseData.uom.map((uom, ind) => (
                                                                <option key={ind} value={uom.Unit_Id}>{uom.Units}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Rate ?? ""}
                                                            type="number"
                                                            min={1}
                                                            onChange={e => changeSourceValue(index, 'Sour_Rate', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Amt ?? ""}
                                                            type="number"
                                                            min={1}
                                                            onChange={e => changeSourceValue(index, 'Sour_Amt', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <select
                                                            value={row?.Sour_Goodown_Id ?? ""}
                                                            required
                                                            onChange={e => changeSourceValue(index, 'Sour_Goodown_Id', e.target.value)}
                                                            className="cus-inpt p-2"
                                                            style={{ minWidth: '40px' }}
                                                        >
                                                            <option value="" disabled>Select Location</option>
                                                            {baseData.godown.map((god, ind) => (
                                                                <option key={ind} value={god.Godown_Id}>{god.Godown_Name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 p-0 vctr text-center'>
                                                        <IconButton
                                                            variant="contained"
                                                            color="error"
                                                            type="button"
                                                            size="small"
                                                            onClick={() => {
                                                                setSourceList(sourceList.filter((_, ind) => ind !== index));
                                                            }}
                                                        ><Delete className="fa-20" /></IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="text-end">
                                    <span className="rounded-2 border bg-light fw-bold text-primary fa-14 p-2">
                                        <span className=" py-2 pe-2">Total Quantity: </span>
                                        {sourceList.reduce((acc, item) => {
                                            return checkIsNumber(item?.Sour_Item_Id) ? Addition(acc, item.Sour_Qty) : acc;
                                        }, 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Destination Entry */}
                            <div className="col-12 p-2 mb-2">
                                <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                                    <h5 className="flex-grow-1 ">
                                        PRODUCTION
                                    </h5>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        type="button"
                                        onClick={() => {
                                            setDestinationList([...destinationList, { ...initialDestinationValue }]);
                                        }}
                                    >Add</Button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered ">
                                        <thead>
                                            <tr>
                                                <th className="fa-13">Sno</th>
                                                <th className="fa-13">Item <RequiredStar /></th>
                                                <th className="fa-13">Batch Lot No</th>
                                                <th className="fa-13">Quantity <RequiredStar /></th>
                                                <th className="fa-13">Unit</th>
                                                <th className="fa-13">Rate</th>
                                                <th className="fa-13">Amount</th>
                                                <th className="fa-13">Location <RequiredStar /></th>
                                                <th className="fa-13">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {destinationList.map((row, index) => (
                                                <tr key={index}>
                                                    <td className='fa-13'>{index + 1}</td>
                                                    <td className='fa-13 p-0' style={{ minWidth: '200px' }}>
                                                        <Select
                                                            value={{ value: row?.Dest_Item_Id, label: row?.Dest_Item_Name }}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Item_Id', e.value)}
                                                            options={
                                                                baseData.products
                                                                    .filter(pro =>
                                                                        !destinationList.some(src => isEqualNumber(pro.Product_Id, src.Dest_Item_Id))
                                                                    )
                                                                    .map(pro => ({ value: pro.Product_Id, label: pro.Product_Name }))
                                                            }
                                                            menuPortalTarget={document.body}
                                                            styles={customSelectStyles}
                                                            isSearchable={true}
                                                            placeholder={"Select Item"}
                                                            maxMenuHeight={300}
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Dest_Batch_Lot_No ?? ""}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Batch_Lot_No', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Dest_Qty ?? ""}
                                                            type="number"
                                                            min={1}
                                                            required
                                                            onChange={e => changeDestinationValues(index, 'Dest_Qty', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <select
                                                            value={row?.Dest_Unit_Id ?? ""}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Unit_Id', e.target.value)}
                                                            className="cus-inpt p-2"
                                                            style={{ minWidth: '40px' }}
                                                        >
                                                            <option value="" disabled>Select Unit</option>
                                                            {baseData.uom.map((uom, ind) => (
                                                                <option key={ind} value={uom.Unit_Id}>{uom.Units}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Dest_Rate ?? ""}
                                                            type="number"
                                                            min={1}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Rate', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Dest_Amt ?? ""}
                                                            type="number"
                                                            min={1}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Amt', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <select
                                                            value={row?.Dest_Goodown_Id ?? ""}
                                                            required
                                                            onChange={e => changeDestinationValues(index, 'Dest_Goodown_Id', e.target.value)}
                                                            className="cus-inpt p-2"
                                                            style={{ minWidth: '40px' }}
                                                        >
                                                            <option value="" disabled>Select Location</option>
                                                            {baseData.godown.map((god, ind) => (
                                                                <option key={ind} value={god.Godown_Id}>{god.Godown_Name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 p-0 vctr text-center'>
                                                        <IconButton
                                                            variant="contained"
                                                            color="error"
                                                            type="button"
                                                            size="small"
                                                            onClick={() => {
                                                                setDestinationList(destinationList.filter((_, ind) => ind !== index));
                                                            }}
                                                        ><Delete className="fa-20" /></IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="text-end">
                                    <span className="rounded-2 border bg-light fw-bold text-primary fa-14 p-2">
                                        <span className=" py-2 pe-2">Total Quantity: </span>
                                        {destinationList.reduce((acc, item) => {
                                            return checkIsNumber(item?.Dest_Item_Id) ? Addition(acc, item.Dest_Qty) : acc;
                                        }, 0)}
                                    </span>
                                </div>
                            </div>

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
                                disabled={sourceList.length === 0 || destinationList.length === 0 || isViewOnly}
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

export {
    initialStockJournalInfoValues,
    initialSoruceValue,
    initialDestinationValue,
    initialStaffInvolvedValue
}