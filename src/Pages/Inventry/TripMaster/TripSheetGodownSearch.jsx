import { useEffect, useState } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import {
    Addition, checkIsNumber, combineDateTime, extractHHMM, isEqualNumber,
    isValidDate, isValidObject, Multiplication, onlynum, ISOString,
    Subraction, stringCompare
} from "../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close, Delete, Edit } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { tripDetailsColumns, tripMasterDetails, tripStaffsColumns } from './tableColumns'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from "react-router-dom";
import RequiredStar from "../../../Components/requiredStar";


const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const TripSheetGodownSearch = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    // const navigation = useNavigate();
    const stateDetails = location.state;
    const tdStyle = 'border fa-14 vctr';

    const [filters, setFilters] = useState({
        FromGodown: '',
        FromGodownName: 'Select From Location',
        ToGodown: '',
        ToGodownName: 'Select To Location',
        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false,
        addItemDialog: false,
    });

    const [godown, setGodown] = useState([]);
    const [products, setProducts] = useState([]);
    const [uom, setUom] = useState([]);
    const [costCenter, setCostCenter] = useState([]);
    const [costCenterCategory, setCostCenterCategory] = useState([])
    const [branch, setBranch] = useState([]);
    const [voucherType, setVoucherType] = useState([]);

    const [tripSheetInfo, setTripSheetInfo] = useState(tripMasterDetails);
    const [productInput, setProductInput] = useState(tripDetailsColumns);
    const [selectedItems, setSelectedItems] = useState([]);
    const [staffInvolvedList, setStaffInvolvedList] = useState([]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    branchResponse,
                    productsResponse,
                    godownLocationsResponse,
                    staffResponse,
                    staffCategory,
                    uomResponse,
                    voucherTypeResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `masters/voucher` })
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
                const staffData = (staffResponse.success ? staffResponse.data : []).sort(
                    (a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name)
                );
                const staffCategoryData = (staffCategory.success ? staffCategory.data : []).sort(
                    (a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category)
                );
                const uomOrdered = (uomResponse.success ? uomResponse.data : []).sort(
                    (a, b) => String(a?.Units).localeCompare(b?.Units)
                );
                const voucherOrdered = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Vocher_Type_Id).localeCompare(b?.Voucher_Type)
                );

                setBranch(branchData)
                setProducts(productsData);
                setGodown(godownLocations);
                setCostCenter(staffData);
                setCostCenterCategory(staffCategoryData);
                setUom(uomOrdered);
                setVoucherType(voucherOrdered)

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, [])

    useEffect(() => {
        const productsArray = stateDetails?.Products_List;
        const employeesArray = stateDetails?.Employees_Involved;
        if (
            isValidObject(stateDetails)
            && Array.isArray(productsArray)
            && Array.isArray(employeesArray)
        ) {
            setTripSheetInfo(
                Object.fromEntries(
                    Object.entries(tripMasterDetails).map(([key, value]) => {
                        if (key === 'Trip_Date') return [key, stateDetails[key] ? ISOString(stateDetails[key]) : value]
                        if (
                            key === 'StartTime' || key === 'EndTime'
                        ) return [key, stateDetails[key] ? extractHHMM(stateDetails[key]) : value]
                        return [key, stateDetails[key] ?? value]
                    })
                )
            );

            setSelectedItems(
                productsArray.map(productsData => Object.fromEntries(
                    Object.entries(tripDetailsColumns).map(([key, value]) => {
                        if (
                            key === 'Dispatch_Date' || key === 'Delivery_Date'
                        ) return [key, productsData[key] ? ISOString(productsData[key]) : value]
                        return [key, productsData[key] ?? value]
                    })
                ))
            )

            setStaffInvolvedList(
                employeesArray.map(staffData => Object.fromEntries(
                    Object.entries(tripStaffsColumns).map(([key, value]) => {
                        return [key, staffData[key] ?? value]
                    })
                ))
            );
        }
    }, [stateDetails])

    const resetForm = () => {
        setSelectedItems([]);
        setStaffInvolvedList([]);
        setTripSheetInfo(tripMasterDetails);
    }

    const saveTripSheet = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `inventory/tripSheet`,
            method: checkIsNumber(tripSheetInfo?.Trip_Id) ? 'PUT' : 'POST',
            bodyData: {
                ...tripSheetInfo,
                StartTime: (
                    tripSheetInfo.StartTime && tripSheetInfo.Trip_Date
                ) ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.StartTime) : '',
                EndTime: (
                    tripSheetInfo.EndTime && tripSheetInfo.Trip_Date
                ) ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.EndTime) : '',
                Product_Array: selectedItems,
                EmployeesInvolved: staffInvolvedList.filter(staff => checkIsNumber(staff.Involved_Emp_Id) && checkIsNumber(staff.Cost_Center_Type_Id))
            }
        }).then(data => {
            if (data.success) {
                resetForm();
                toast.success(data.message);
            } else {
                toast.error(data.message)
            }
        }).catch(
            e => console.log(e)
        ).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const closeDialog = () => {
        setProductInput(tripDetailsColumns);
        setFilters(pre => ({ ...pre, addItemDialog: false }));
    }

    return (
        <>
            <Card>

                <div className="d-flex flex-wrap align-items-center border-bottom p-2">
                    <h5 className='flex-grow-1 m-0 ps-2'>Trip Sheet Creation</h5>
                    <Button
                        variant="outlined"
                        onClick={saveTripSheet}
                        disabled={selectedItems.length === 0 || !isValidDate(tripSheetInfo.Trip_Date)}
                    >Save</Button>
                </div>

                <CardContent style={{ minHeight: 500 }}>

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
                                        onClick={() => setStaffInvolvedList([...staffInvolvedList, { ...tripStaffsColumns }])}
                                    >Add</Button>
                                </div>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th className="fa-13">Sno</th>
                                            <th className="fa-13">Staff Name</th>
                                            <th className="fa-13">Category</th>
                                            <th className="fa-13">#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffInvolvedList.map((row, index) => (
                                            <tr key={index}>
                                                <td className='fa-13 vctr text-center'>{index + 1}</td>
                                                <td className='fa-13 w-100 p-0'>
                                                    <Select
                                                        value={{
                                                            value: row?.Involved_Emp_Id,
                                                            label: row?.Emp_Name
                                                        }}
                                                        onChange={e => setStaffInvolvedList((prev) => {
                                                            return prev.map((item, ind) => {
                                                                if (isEqualNumber(ind, index)) {
                                                                    const staff = costCenter.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                                    return {
                                                                        ...item,
                                                                        Cost_Center_Type_Id:
                                                                            checkIsNumber(item.Cost_Center_Type_Id)
                                                                                ? item.Cost_Center_Type_Id
                                                                                : checkIsNumber(staff.User_Type)
                                                                                    ? staff.User_Type
                                                                                    : 0,
                                                                        Involved_Emp_Id: e.value,
                                                                        Emp_Name: staff.Cost_Center_Name ?? ''
                                                                    }
                                                                }
                                                                return item;
                                                            });
                                                        })}
                                                        options={
                                                            [...costCenter.filter(fil => (
                                                                staffInvolvedList.findIndex(st => (
                                                                    isEqualNumber(st.Involved_Emp_Id, fil.Cost_Center_Id)
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
                                                        value={row?.Cost_Center_Type_Id}
                                                        onChange={e => setStaffInvolvedList((prev) => {
                                                            return prev.map((item, ind) => {
                                                                if (isEqualNumber(ind, index)) {
                                                                    return {
                                                                        ...item,
                                                                        Cost_Center_Type_Id: e.target.value
                                                                    }
                                                                }
                                                                return item;
                                                            });
                                                        })}
                                                        className="cus-inpt p-2"
                                                    >
                                                        <option value="">Select</option>
                                                        {costCenterCategory.map((st, sti) =>
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
                                        <label>Trip No</label>
                                        <input
                                            value={tripSheetInfo.Trip_No}
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_No: e.target.value })}
                                            className="cus-inpt p-2"
                                            placeholder="ex: 1, 2, 3"
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
                                        <select
                                            value={tripSheetInfo.Godownlocation}
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Godownlocation: e.target.value })}
                                            className="cus-inpt p-2"
                                        >
                                            <option value={''} disabled>select godown</option>
                                            {godown.map((god, godInd) => (
                                                <option value={god.Godown_Id} key={godInd}>{god.Godown_Name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                                        <label>Bill Type</label>
                                        <select
                                            value={tripSheetInfo.BillType}
                                            onChange={e => setTripSheetInfo({ 
                                                ...tripSheetInfo, 
                                                BillType: e.target.value,
                                                VoucherType: ''
                                            })}
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
                                                        onChange={e => setTripSheetInfo(pre => ({ ...pre, StartTime: e.target.value }))}
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
                    </div>

                    <FilterableTable
                        dataArray={selectedItems}
                        ButtonArea={
                            <>
                                <Button
                                    onClick={() => setFilters(pre => ({ ...pre, addItemDialog: true }))}
                                >Add</Button>
                                <Button
                                    onClick={() => setSelectedItems([])}
                                    className="me-2"
                                >clear</Button>
                            </>
                        }
                        EnableSerialNumber
                        disablePagination
                        title={`
                            ITEMS: ${selectedItems.length}, 
                            QTY: ${selectedItems?.reduce((acc, o) => Addition(acc, o.QTY ?? 0), 0)}
                        `}
                        maxHeightOption
                        columns={[
                            {
                                isVisible: 1,
                                ColumnHeader: 'Item',
                                isCustomCell: true,
                                Cell: ({ row }) => findProductDetails(products, row.Product_Id)?.Product_Name
                            },
                            createCol('HSN_Code', 'string', 'HSN Code'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Units',
                                isCustomCell: true,
                                Cell: ({ row }) => uom.find(u =>
                                    isEqualNumber(u.Unit_Id, row.Unit_Id)
                                )?.Units
                            },
                            createCol('QTY', 'number', 'Tonnage'),
                            createCol('Gst_Rate', 'number', 'Rate'),
                            createCol('Total_Value', 'number', 'Amount'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'From',
                                isCustomCell: true,
                                Cell: ({ row }) => godown.find(g =>
                                    isEqualNumber(g.Godown_Id, row.From_Location)
                                )?.Godown_Name
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setProductInput(Object.fromEntries(
                                                    Object.entries(tripDetailsColumns).map(([key, value]) => [key, row[key] ? row[key] : value])
                                                ));
                                                setFilters(pre => ({...pre, addItemDialog: true}))
                                            }}
                                        ><Edit className="fa-20" /></IconButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => {
                                                setSelectedItems(prev => {
                                                    const prevArray = [...prev];
                                                    return prevArray.filter(pro =>
                                                        !isEqualNumber(pro.Product_Id, row.Product_Id)
                                                    );
                                                });
                                            }}
                                        ><Delete className="fa-20" /></IconButton>
                                    </>
                                )
                            },
                        ]}
                    />

                </CardContent>
                <div className="border-top p-2 text-end">
                    <Button
                        variant="outlined"
                        onClick={saveTripSheet}
                        disabled={selectedItems.length === 0 || !isValidDate(tripSheetInfo.Trip_Date)}
                    >Save</Button>
                </div>
            </Card>

            <Dialog
                open={filters.addItemDialog}
                onClose={closeDialog}
                maxWidth='sm' fullWidth
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (checkIsNumber(productInput.Product_Id)) {
                            setSelectedItems(prev => {
                                const prevArray = [...prev];
                                const proIndex = prevArray.findIndex(pro =>
                                    isEqualNumber(pro.Product_Id, productInput.Product_Id)
                                );
                                if (proIndex !== -1) {
                                    prevArray[proIndex] = productInput;
                                } else {
                                    prevArray.push(productInput);
                                }
                                return prevArray;
                            });
                            closeDialog();
                        } else {
                            toast.error('Select Item');
                        }
                    }}
                >

                    <DialogTitle
                        className="d-flex align-items-center"
                    >
                        <span className="flex-grow-1">Add Item</span>
                        <IconButton
                            size="small" color="error"
                            onClick={closeDialog}
                        ><Close /></IconButton>
                    </DialogTitle>

                    <DialogContent>
                        <table className="table m-0">
                            <tbody>
                                <tr>
                                    <td className={tdStyle}>Item Name <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <Select
                                            value={{
                                                value: productInput.Product_Id, label: products.find(pro => isEqualNumber(
                                                    pro.Product_Id, productInput.Product_Id
                                                ))?.Product_Name
                                            }}
                                            onChange={e => {
                                                const productId = Number(e.value || 0);
                                                const product = products.find(pro => isEqualNumber(
                                                    pro.Product_Id, productId
                                                ))
                                                setProductInput(pre => ({
                                                    ...pre,
                                                    Product_Id: e.value,
                                                    HSN_Code: product?.HSN_Code,
                                                    Gst_P: product?.Gst_P,
                                                    Cgst_P: product?.Cgst_P,
                                                    Sgst_P: product?.Sgst_P,
                                                    Igst_P: product?.Igst_P,
                                                    Unit_Id: product?.UOM_Id,
                                                    Units: product?.Units
                                                }))
                                            }}
                                            options={[
                                                { value: '', label: 'select product', isDisabled: true },
                                                ...products.map(obj => ({
                                                    value: obj?.Product_Id,
                                                    label: obj?.Product_Name,
                                                    isDisabled: (selectedItems.findIndex(o => isEqualNumber(
                                                        o?.Product_Id, obj?.Product_Id
                                                    ))) === -1 ? false : true
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            required
                                            isSearchable={true}
                                            placeholder={"Select Product"}
                                            maxMenuHeight={200}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>From Godown <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <select
                                            value={productInput.From_Location}
                                            onChange={e => setProductInput({
                                                ...productInput,
                                                From_Location: e.target.value,
                                                BatchLocation: godown.find(g => isEqualNumber(g.Godown_Id, e.target.value)).Godown_Name || ''
                                            })}
                                            className="cus-inpt p-2"
                                            required
                                        >
                                            <option value={''} disabled>select godown</option>
                                            {godown.map((god, godInd) => (
                                                <option value={god.Godown_Id} key={godInd}>{god.Godown_Name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Weight <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <input
                                            className='cus-inpt p-2 w-50'
                                            value={productInput.QTY ? productInput.QTY : ''}
                                            required
                                            placeholder='Weight'
                                            onInput={onlynum}
                                            onChange={e => {
                                                const amount = checkIsNumber(productInput.Gst_Rate) ?
                                                    Multiplication(e.target.value, productInput.Gst_Rate) :
                                                    productInput.Taxable_Value;
                                                setProductInput(
                                                    pre => ({
                                                        ...pre,
                                                        QTY: e.target.value,
                                                        Taxable_Value: amount,
                                                        Total_Value: amount
                                                    })
                                                )
                                            }}
                                        />
                                        <select
                                            className='cus-inpt p-2 w-50'
                                            value={productInput.Unit_Id}
                                            placeholder='Units ex: kg, l, ml...'
                                            onChange={e => setProductInput(
                                                pre => ({
                                                    ...pre,
                                                    Unit_Id: e.target.value,
                                                    Units: uom.find(u => isEqualNumber(u.Unit_Id, e.target.value)).Units
                                                }))}
                                        >
                                            <option value="" disabled>select uom</option>
                                            {uom.map((uomObj, ind) => (
                                                <option value={uomObj.Unit_Id} key={ind}>{uomObj.Units}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Rate <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <input
                                            required
                                            className='cus-inpt p-2'
                                            value={productInput.Gst_Rate ? productInput.Gst_Rate : ''}
                                            placeholder='Rate'
                                            onInput={onlynum}
                                            onChange={e => {
                                                const amount = checkIsNumber(productInput.QTY) ?
                                                    Multiplication(e.target.value, productInput.QTY) :
                                                    productInput.Taxable_Value;
                                                setProductInput(
                                                    pre => ({
                                                        ...pre,
                                                        Gst_Rate: e.target.value,
                                                        Taxable_Value: amount,
                                                        Total_Value: amount
                                                    })
                                                )
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Batch / Lot Number</td>
                                    <td className={tdStyle}>
                                        <input
                                            value={productInput.Batch_No}
                                            onChange={e => setProductInput({ ...productInput, Batch_No: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>BillNo</td>
                                    <td className={tdStyle}>
                                        <input
                                            value={productInput.BillNo}
                                            onChange={e => setProductInput({ ...productInput, BillNo: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Concern</td>
                                    <td className={tdStyle}>
                                        <input
                                            value={productInput.Concern}
                                            onChange={e => setProductInput({ ...productInput, Concern: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DialogContent>

                    <DialogActions>
                        <Button type="button" onClick={closeDialog}>close</Button>
                        <Button type="submit" variant="outlined">Add</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}


export default TripSheetGodownSearch;