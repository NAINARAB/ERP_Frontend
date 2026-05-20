import { useEffect, useState } from "react"
import { Addition, Division, ISOString, Multiplication, checkIsNumber, combineDateTime, extractHHMM, getSessionUser, isEqualNumber, isGraterNumber, isValidObject, reactSelectFilterLogic } from "../../Components/functions"
import { Button, Card, CardContent, IconButton } from "@mui/material"
import { fetchLink } from "../../Components/fetchComponent"
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import RequiredStar from '../../Components/requiredStar';
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";

const { user } = getSessionUser();

const initialStockJournalInfoValues = {
    STJ_Id: '',
    ST_Inv_Id: '',
    Journal_no: '',

    Branch_Id: '',
    Stock_Journal_date: ISOString(),
    Stock_Journal_Bill_type: 'MATERIAL INWARD',
    Stock_Journal_Voucher_type: '',
    Invoice_no: '',
    Narration: '',
    Trip_No: '',
    Created_by: user?.Name,
    altered_by: user?.Name,

    Start_Time: '',
    End_Time: '',

    Vehicle_Start_KM: '',
    Vehicle_End_KM: '',
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

const StockJournalCreate = ({ loadingOn, loadingOff }) => {
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
                    staffResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `masters/voucher` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `dataEntry/costCenter` })
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

                setBaseData((pre) => ({
                    ...pre,
                    products: productsData,
                    branch: branchData,
                    godown: godownLocations,
                    voucherType: voucherType,
                    uom: uomData,
                    staff: staffData,
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
                        if (key === 'Stock_Journal_date') return [key, stateDetails[key] ? ISOString(stateDetails[key]) : value]
                        if (key === 'Start_Time') return [key, stateDetails[key] ? extractHHMM(stateDetails[key]) : value]
                        if (key === 'End_Time') return [key, stateDetails[key] ? extractHHMM(stateDetails[key]) : value]
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

                if (
                    stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN'
                    && key !== 'Sour_Goodown_Id'
                    && key !== 'Sour_Batch_Lot_No'
                ) {
                    const destinationKey = soruceAndDestination.find(
                        (obj) => obj.source === key
                    )?.destination;
                    changeDestinationValues(rowIndex, destinationKey, value);
                }

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

                if (stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' && key !== 'Dest_Goodown_Id') {
                    const sourceKey = soruceAndDestination.find(
                        (obj) => obj.destination === key
                    )?.source;
                    changeSourceValue(rowIndex, sourceKey, value);
                }

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
            address: `inventory/stockJournal`,
            method: checkIsNumber(stockJorunalInfo?.STJ_Id) ? 'PUT' : 'POST',
            bodyData: {
                ...stockJorunalInfo,
                Start_Time: combineDateTime(stockJorunalInfo?.Stock_Journal_date, stockJorunalInfo?.Start_Time),
                End_Time: combineDateTime(stockJorunalInfo?.Stock_Journal_date, stockJorunalInfo?.End_Time),
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
                    <h5 className="text-center mb-2 border-bottom pb-2">STOCK JOURNAL</h5>
                    <form onSubmit={e => {
                        e.preventDefault();
                        saveStockJournal();
                    }}>
                        <div className="row ">
                            {/* Staff involved Info */}
                            <div className="col-xxl-2 col-lg-3 col-md-4 p-2">
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
                                                <th className="fa-13">Staff Name</th>
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
                                                            onChange={e => setStaffInvolvedList((prev) => {
                                                                return prev.map((item, ind) => {
                                                                    if (isEqualNumber(ind, index)) {
                                                                        return {
                                                                            ...item,
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
                                                    <td className='fa-13 vctr p-0'>
                                                        <IconButton
                                                            onClick={() => {
                                                                setStaffInvolvedList(prev => {
                                                                    return prev.filter((_, filIndex) => index !== filIndex);
                                                                });
                                                            }}
                                                            size='small'
                                                        >
                                                            <Delete color='error' />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Stock Journal Details */}
                            <div className="col-xxl-10 col-lg-9 col-md-8 py-2 px-0">
                                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>

                                    {/* Check Boxes */}
                                    <div className="d-flex align-items-center justify-content-center flex-wrap mb-2 border-bottom pb-2">

                                        <div className="form-check">
                                            <input
                                                className="form-check-input shadow-none"
                                                style={{ padding: '0.7em' }}
                                                type="radio"
                                                disabled={checkIsNumber(stockJorunalInfo?.STJ_Id) || isViewOnly}
                                                name="radioType"
                                                id="MATERIALINWARD"
                                                checked={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD'}
                                                onChange={() => {
                                                    setStockJorunalInfo(pre => ({ ...pre, Stock_Journal_Bill_type: 'MATERIAL INWARD' }));
                                                    setSourceList([]);
                                                    setDestinationList([]);
                                                }}
                                            />
                                            <label
                                                className="form-check-label p-1 me-3"
                                                htmlFor="MATERIALINWARD"
                                            >
                                                MATERIAL INWARD
                                            </label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                className="form-check-input shadow-none"
                                                style={{ padding: '0.7em' }}
                                                type="radio"
                                                disabled={checkIsNumber(stockJorunalInfo?.STJ_Id) || isViewOnly}
                                                name="radioType"
                                                id="OTHERGODOWN"
                                                checked={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN'}
                                                onChange={() => {
                                                    setStockJorunalInfo(pre => ({ ...pre, Stock_Journal_Bill_type: 'OTHER GODOWN' }));
                                                    setSourceList([]);
                                                    setDestinationList([]);
                                                }}
                                            />
                                            <label
                                                className="form-check-label p-1 me-3"
                                                htmlFor="OTHERGODOWN"
                                            >
                                                OTHER GODOWN
                                            </label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                className="form-check-input shadow-none"
                                                style={{ padding: '0.7em' }}
                                                type="radio"
                                                disabled={checkIsNumber(stockJorunalInfo?.STJ_Id) || isViewOnly}
                                                name="radioType"
                                                id="PROCESSING"
                                                checked={stockJorunalInfo.Stock_Journal_Bill_type === 'PROCESSING'}
                                                onChange={() => {
                                                    setStockJorunalInfo(pre => ({ ...pre, Stock_Journal_Bill_type: 'PROCESSING' }));
                                                    setSourceList([]);
                                                    setDestinationList([]);
                                                }}
                                            />
                                            <label
                                                className="form-check-label p-1 me-3"
                                                htmlFor="PROCESSING"
                                            >
                                                PROCESSING
                                            </label>
                                        </div>

                                    </div>

                                    <div className="row px-2">
                                        {/* Common Details - 1 */}
                                        <div className="col-lg-3 col-sm-6 p-2">
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

                                        <div className="col-lg-3 col-sm-6 p-2">
                                            <label>Date</label>
                                            <input
                                                value={stockJorunalInfo.Stock_Journal_date}
                                                type="date"
                                                disabled={isViewOnly}
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Stock_Journal_date: e.target.value })}
                                                className="cus-inpt p-2 mb-2"
                                            />
                                        </div>

                                        <div className="col-lg-3 col-sm-6 p-2">
                                            <label>Voucher Type</label>
                                            <Select
                                                value={{ value: stockJorunalInfo.Stock_Journal_Voucher_type, label: stockJorunalInfo.Stock_Journal_Voucher_type }}
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Stock_Journal_Voucher_type: e.value })}
                                                options={[
                                                    { value: '', label: 'Select Voucher Type', isDisabled: true },
                                                    ...baseData.voucherType.map(vt => ({
                                                        value: vt?.Voucher_Type,
                                                        label: vt?.Voucher_Type
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={"Select Voucher Type"}
                                                isDisabled={isViewOnly}
                                                filterOption={reactSelectFilterLogic}
                                            />
                                        </div>

                                        <div className="col-lg-3 col-sm-6 p-2">
                                            <label>Trip Number</label>
                                            <input
                                                value={stockJorunalInfo.Trip_No}
                                                placeholder="Trip / Machine / Vehicle"
                                                onChange={e => setStockJorunalInfo({ ...stockJorunalInfo, Trip_No: e.target.value })}
                                                className="cus-inpt p-2 mb-2"
                                                disabled={isViewOnly}
                                            />
                                        </div>

                                        {/* Common Details - 2 */}
                                        <div className="col-12 p-2 ">

                                            {/* <div className="table-responsive">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th colSpan={2} className="fa-13 text-center">Time</th>
                                                            <th colSpan={2} className="fa-13 text-center">Distance</th>
                                                        </tr>
                                                        <tr>
                                                            <th className="fa-13 text-center">Start</th>
                                                            <th className="fa-13 text-center">End</th>
                                                            <th className="fa-13 text-center">Start (Km)</th>
                                                            <th className="fa-13 text-center">End (Km)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="fa-13">
                                                                <input
                                                                    type='time'
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, Start_Time: e.target.value }))}
                                                                    value={stockJorunalInfo?.Start_Time}
                                                                    className="cus-inpt p-2"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                            <td className="fa-13">
                                                                <input
                                                                    type='time'
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, End_Time: e.target.value }))}
                                                                    value={stockJorunalInfo?.End_Time}
                                                                    className="cus-inpt p-2"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                            <td className="fa-13">
                                                                <input
                                                                    type="number"
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, Vehicle_Start_KM: e.target.value }))}
                                                                    value={stockJorunalInfo?.Vehicle_Start_KM}
                                                                    min={0}
                                                                    className="cus-inpt p-2"
                                                                    placeholder="Kilometers"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                            <td className="fa-13">
                                                                <input
                                                                    type="number"
                                                                    onChange={e => setStockJorunalInfo(pre => ({ ...pre, Vehicle_End_KM: e.target.value }))}
                                                                    value={stockJorunalInfo?.Vehicle_End_KM}
                                                                    min={Addition(stockJorunalInfo?.Vehicle_Start_KM, 1)}
                                                                    className="cus-inpt p-2"
                                                                    placeholder="Kilometers"
                                                                    disabled={isViewOnly}
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div> */}

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
                                        {stockJorunalInfo.Stock_Journal_Bill_type == 'PROCESSING' ? 'CONSUMPTION' : 'SORUCE'}
                                    </h5>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        type="button"
                                        disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
                                        onClick={() => {
                                            setSourceList([...sourceList, { ...initialSoruceValue }]);
                                            if (stockJorunalInfo.Stock_Journal_Bill_type !== 'PROCESSING') setDestinationList(
                                                [...destinationList, { ...initialDestinationValue }]
                                            );
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
                                                            isDisabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
                                                            placeholder={"Select Item"}
                                                            maxMenuHeight={300}
                                                            filterOption={reactSelectFilterLogic}
                                                        />

                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Batch_Lot_No ?? ""}
                                                            onChange={e => changeSourceValue(index, 'Sour_Batch_Lot_No', e.target.value)}
                                                            className="cus-inpt p-2"
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Qty ?? ""}
                                                            type="number"
                                                            min={1}
                                                            required
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
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
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
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
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
                                                            type="number"
                                                            min={1}
                                                            onChange={e => changeSourceValue(index, 'Sour_Rate', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Sour_Amt ?? ""}
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
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
                                                            disabled={isViewOnly}
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
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'MATERIAL INWARD' || isViewOnly}
                                                            size="small"
                                                            onClick={() => {
                                                                if (stockJorunalInfo.Stock_Journal_Bill_type !== 'PROCESSING') {
                                                                    setDestinationList(destinationList.filter((_, ind) => ind !== index));
                                                                    setSourceList(sourceList.filter((_, ind) => ind !== index));
                                                                } else {
                                                                    setSourceList(sourceList.filter((_, ind) => ind !== index));
                                                                }
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
                                        {stockJorunalInfo.Stock_Journal_Bill_type == 'PROCESSING' ? 'PRODUCTION' : 'DESTINATION'}
                                    </h5>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        type="button"
                                        disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
                                        onClick={() => {
                                            setDestinationList([...destinationList, { ...initialDestinationValue }]);
                                            if (stockJorunalInfo.Stock_Journal_Bill_type !== 'PROCESSING') setSourceList(
                                                [...sourceList, { ...initialSoruceValue }]
                                            );
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
                                                            isDisabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
                                                            filterOption={reactSelectFilterLogic}
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Dest_Batch_Lot_No ?? ""}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Batch_Lot_No', e.target.value)}
                                                            disabled={isViewOnly}
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
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <select
                                                            value={row?.Dest_Unit_Id ?? ""}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Unit_Id', e.target.value)}
                                                            className="cus-inpt p-2"
                                                            style={{ minWidth: '40px' }}
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
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
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
                                                            onChange={e => changeDestinationValues(index, 'Dest_Rate', e.target.value)}
                                                            className="cus-inpt p-2"
                                                        />
                                                    </td>
                                                    <td className='fa-13 px-1 py-0 vctr'>
                                                        <input
                                                            value={row?.Dest_Amt ?? ""}
                                                            type="number"
                                                            min={1}
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
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
                                                            disabled={isViewOnly}
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
                                                            disabled={stockJorunalInfo.Stock_Journal_Bill_type === 'OTHER GODOWN' || isViewOnly}
                                                            type="button"
                                                            size="small"
                                                            onClick={() => {
                                                                if (stockJorunalInfo.Stock_Journal_Bill_type !== 'PROCESSING') {
                                                                    setDestinationList(destinationList.filter((_, ind) => ind !== index));
                                                                    setSourceList(sourceList.filter((_, ind) => ind !== index));
                                                                } else {
                                                                    setDestinationList(destinationList.filter((_, ind) => ind !== index));
                                                                }
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

export default StockJournalCreate;

export {
    initialStockJournalInfoValues,
    initialSoruceValue,
    initialDestinationValue,
    initialStaffInvolvedValue
}