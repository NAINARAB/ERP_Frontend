import { useEffect, useState } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, checkIsNumber, combineDateTime, extractHHMM, isEqualNumber, ISOString, isValidDate, isValidObject, Multiplication, RoundNumber, Subraction } from "../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close, Delete, Search } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { tripDetailsColumns, tripMasterDetails, tripStaffsColumns } from './tableColumns'
import { toast } from 'react-toastify'
import { useLocation } from "react-router-dom";

const TripSheetGodownSearch = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const stateDetails = location.state;
    const [expandedRows, setExpandedRows] = useState([]);
    const [deliveryPerson, setDeliveryPerson] = useState(null);
    const [deliveryPersonList, setDeliveryPersonList] = useState([]);
    const toggleExpand = (rowId) => {
        setExpandedRows((prevExpandedRows) => {
            if (prevExpandedRows.includes(rowId)) {
                return prevExpandedRows.filter(id => id !== rowId);
            }
            return [...prevExpandedRows, rowId];
        });
    };
    const storage = JSON.parse(localStorage.getItem('user'));

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

    const [transactionData, setTransactionData] = useState([]);

    const [products, setProducts] = useState([]);
    const [costCenter, setCostCenter] = useState([]);
    const [costCenterCategory, setCostCenterCategory] = useState([])
    const [branch, setBranch] = useState([]);
    const [tripSheetInfo, setTripSheetInfo] = useState(tripMasterDetails);
    const [staffInvolvedList, setStaffInvolvedList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    branchResponse,
                    productsResponse,
                    staffResponse,
                    staffCategory
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` })
                ]);

                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );

                const staffData = (staffResponse.success ? staffResponse.data : []).sort(
                    (a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name)
                );
                const staffCategoryData = (staffCategory.success ? staffCategory.data : []).sort(
                    (a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category)
                );

                setBranch(branchData)
                setProducts(productsData);

                setCostCenter(staffData);
                setCostCenterCategory(staffCategoryData)

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, [])


    useEffect(() => {

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setDeliveryPersonList(data.data);
            }
        }).catch(e => console.error(e));
    }, [])


    const handleDeliveryPersonChange = (selectedOption) => {

        setDeliveryPerson(selectedOption ? { UserId: selectedOption.value, Name: selectedOption.label } : null);
    };
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

    const searchTransaction = (e) => {
        e.preventDefault();
        const { Fromdate, Todate } = filters;

        if (Fromdate && Todate) {
            if (loadingOn) loadingOn();
            setTransactionData([]);
            fetchLink({
                address: `sales/saleDelivery?Fromdate=${Fromdate}&Todate=${Todate}`
            }).then(data => {
                if (data.success) setTransactionData(data.data);
            }).catch(e => console.log(e)).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }

    const changeItems = (itemDetail, deleteOption) => {
        console.log("dfasdasdasdasd", itemDetail)
        setSelectedItems(prev => {
            const preItems = prev.filter(o =>
                !isEqualNumber(o.So_Id, itemDetail.So_Id)
            );
            if (deleteOption) {
                return preItems;
            } else {
                const currentOrders = transactionData.filter(o =>
                    isEqualNumber(o.So_Id, itemDetail.So_Id)
                );
                console.log("Selected Items updated:", [...preItems, ...currentOrders]); // Debugging state update
                return preItems.concat(currentOrders);
            }
        });


    };

    const resetForm = () => {
        setSelectedItems([]);
        setStaffInvolvedList([]);
        setTripSheetInfo(tripMasterDetails);
        setTransactionData([]);
    }

    const saveTripSheet = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `delivery/deliveryOrderTrip`,
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
                Delivery_Person_Id: deliveryPerson?.UserId,
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

    const ExpendableComponent = ({ row }) => {

        return (
            <>
                <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
                                {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
                            </td>
                            <td className="border p-2 bg-light">Tax Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.IS_IGST, 1) && 'IGST'}
                                {isEqualNumber(row.IS_IGST, 0) && 'GST'}
                            </td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Narration</td>
                            <td className="border p-2" colSpan={5}>{row.Narration}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        )
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
                                                                    isEqualNumber(st.Cost_Center_Type_Id, fil.Cost_Center_Id)
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
                                                <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '110px' }}>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stock Journal Details */}
                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                <div className="row">

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Branch</label>
                                        <select
                                            value={tripSheetInfo.Branch_Id}
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Branch_Id: e.target.value })}
                                            placeholder={"Select Branch"}
                                            className="cus-inpt mb-2 p-2"
                                        >
                                            <option value="" disabled>Select Branch</option>
                                            {branch.map((br, bi) => (
                                                <option key={bi} value={br.BranchId}>{br.BranchName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Date</label>
                                        <input
                                            value={tripSheetInfo.Trip_Date}
                                            type="date"
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_Date: e.target.value })}
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Vehicle No</label>
                                        <input
                                            value={tripSheetInfo.Vehicle_No}
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Vehicle_No: e.target.value })}
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>
                                    <div className="col-xl-3 col-md-6 col-sm-12 p-2">
                                        <label>Delivery Person</label>
                                        <Select
                                            id="delivery-person"
                                            name="deliveryPerson"
                                            value={
                                                deliveryPerson
                                                    ? { value: deliveryPerson.UserId, label: deliveryPerson.Name }
                                                    : null
                                            }
                                            onChange={handleDeliveryPersonChange}
                                            options={[
                                                { value: '', label: 'Select', isDisabled: true },
                                                ...(deliveryPersonList || []).map((obj) => ({
                                                    value: obj.UserId,
                                                    label: obj.Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable
                                        // placeholder="Delivery Person Name"
                                        />
                                    </div>


                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Trip No</label>
                                        <input
                                            value={tripSheetInfo.Trip_No}
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_No: e.target.value })}
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>
                                </div>

                                <div className="table-responsive">
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
                                                        onChange={e => setTripSheetInfo(pre => ({ ...pre, StartTime: e.target.value }))}
                                                        value={tripSheetInfo?.StartTime}
                                                        className="cus-inpt p-2"
                                                    />
                                                </td>
                                                <td className="fa-13">
                                                    <input
                                                        type='time'
                                                        onChange={e => setTripSheetInfo(pre => ({ ...pre, EndTime: e.target.value }))}
                                                        value={tripSheetInfo?.EndTime}
                                                        className="cus-inpt p-2"
                                                    />
                                                </td>
                                                <td className="fa-13">
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
                                                <td className="fa-13">
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
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>

                    <FilterableTable
                        dataArray={selectedItems}
                        expandableComp={ExpendableComponent}
                        ButtonArea={
                            <>
                                <Button onClick={() => setFilters(pre => ({ ...pre, addItemDialog: true }))}>Add</Button>
                                <Button onClick={() => setSelectedItems([])} className="me-2">Clear</Button>
                            </>
                        }
                        EnableSerialNumber
                        disablePagination
                        title={`Selected Items: ${selectedItems.length} QTY: ${selectedItems?.reduce((acc, o) => Addition(acc, o.QTY ?? 0), 0)}`}
                        maxHeightOption
                        columns={[
                            {
                                isVisible: 1,
                                ColumnHeader: '',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <div onClick={() => toggleExpand(row.So_Id)}>
                                        {expandedRows.includes(row.So_Id) ? (
                                            <span>-</span>
                                        ) : (
                                            <span>+</span>
                                        )}
                                    </div>
                                ),
                            },
                            createCol('Retailer_Name', 'string'),
                            createCol('So_Id', 'string'),
                            createCol('So_Date', 'date', 'So_Date'),
                            createCol('Routename', 'string', 'Routename'),
                            createCol('Total_Tax', 'number', 'Total_Tax'),
                            createCol('Total_Before_Tax', 'number', 'Total_Before_Tax'),
                            createCol('Total_Invoice_value', 'number', 'Total_Invoice_value'),
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <IconButton
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => {
                                            const filteredItems = selectedItems.filter(o => !isEqualNumber(o.So_Id, row.So_Id));
                                            setSelectedItems(filteredItems);
                                        }}
                                    >
                                        <Delete className="fa-20" />
                                    </IconButton>
                                ),
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
                onClose={() => setFilters(pre => ({ ...pre, addItemDialog: false }))}
                maxWidth='lg' fullWidth fullScreen
            >
                <form onSubmit={searchTransaction}>
                    <DialogTitle
                        className="d-flex align-items-center"
                    >
                        <span className="flex-grow-1">Add Data</span>
                        <Button
                            variant="outlined"
                            type="submit" className="me-2"

                            startIcon={<Search />}
                        >Search</Button>
                        <IconButton
                            size="small" color="error"
                            onClick={() => setFilters(pre => ({ ...pre, addItemDialog: false }))}
                        ><Close /></IconButton>
                    </DialogTitle>

                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>

                                        <td className="text-center fa-13 fw-bold" colSpan={2}>Date</td>
                                    </tr>

                                    <tr>
                                        <td className="fa-13 text-center ">
                                            <input
                                                type="date"
                                                value={filters.Fromdate}
                                                className="cus-inpt p-2"
                                                required
                                                max={filters.Todate}
                                                onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                                            />
                                        </td>

                                        <td className="fa-13 text-center ">
                                            <input
                                                type="date"
                                                value={filters.Todate}
                                                className="cus-inpt p-2"
                                                min={filters.Fromdate}
                                                required
                                                onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                        <FilterableTable
                            dataArray={transactionData}
                            disablePagination
                            maxHeightOption
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: '#',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        // Check if this row is selected
                                        const isChecked = selectedItems.some(o =>
                                            isEqualNumber(o.So_Id, row.So_Id)
                                        );

                                        return (
                                            <div>
                                                <input
                                                    className="form-check-input shadow-none pointer"
                                                    style={{ padding: '0.7em' }}
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {

                                                        if (isChecked) {
                                                            changeItems(row, true);
                                                        } else {
                                                            changeItems(row);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                },
                                createCol('Retailer_Name', 'string', 'Retailer_Name'),
                                createCol('Branch_Name', 'string', 'Branch_Name'),
                                createCol('AreaName', 'string', 'AreaName'),
                                createCol('So_Date', 'date', 'So_Date'),
                                createCol('Total_Before_Tax', 'string', 'Total_Before_Tax'),
                                createCol('Total_Tax', 'number', 'Total_Tax'),
                                createCol('Total_Invoice_value', 'number', 'Total_Invoice_value'),
                            ]}
                        />

                    </DialogContent>

                    <DialogActions>
                        <Button type="button" onClick={() => setFilters(pre => ({ ...pre, addItemDialog: false }))}>close</Button>
                    </DialogActions>

                </form>
            </Dialog>
        </>
    )
}


export default TripSheetGodownSearch;
