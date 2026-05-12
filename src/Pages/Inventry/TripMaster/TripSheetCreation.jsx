import { useEffect, useState } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import {
    Addition, checkIsNumber, combineDateTime, isEqualNumber,
    isValidDate, isValidObject, onlynum, ISOString,
    Subraction, stringCompare, LocalDate, formatDateForTimeLocal,
    toArray,
    toNumber
} from "../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close, Delete } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { tripDetailsColumns, tripMasterDetails, tripStaffsColumns, tripCreditNoteColumns } from './tableColumns'
import { toast } from 'react-toastify'
import { useLocation } from "react-router-dom";
import TripSheetGeneralInfo from "./createComp/generalInfo";
import TripSheetStaffInvolved from "./createComp/staffInfo";


const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const TripSheetGodownSearch = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const stateDetails = location.state;

    const [filters, setFilters] = useState({
        FromGodown: '',
        FromGodownName: 'Select From Location',
        ToGodown: '',
        ToGodownName: 'Select To Location',
        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false,
        addItemDialog: false,
        importDialog: false,
        fromGodownSearchDate: ISOString(),
        toGodownSearchDate: ISOString(),
        fromSearchGodown: '',
        toSearchGodown: '',
    });

    const [godown, setGodown] = useState([]);
    const [products, setProducts] = useState([]);
    const [uom, setUom] = useState([]);
    const [costCenter, setCostCenter] = useState([]);
    const [costCenterCategory, setCostCenterCategory] = useState([])
    const [branch, setBranch] = useState([]);
    const [voucherType, setVoucherType] = useState([]);
    const [godownActivity, setGodownActivity] = useState([]);
    const [batchDetails, setBatchDetails] = useState([]);
    const [tripSheetInfo, setTripSheetInfo] = useState(tripMasterDetails);
    const [selectedItems, setSelectedItems] = useState([]);
    const [staffInvolvedList, setStaffInvolvedList] = useState([]);

    const [creditNoteData, setCreditNoteData] = useState([]);
    const [cnFilters, setCnFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: '', label: 'ALL' },
        CreatedBy: { value: '', label: 'ALL' },
        VoucherType: { value: '', label: 'ALL' },
        dialog: false,
    });
    const [filtersDropDown, setFiltersDropDown] = useState({
        voucherType: [],
        retailers: [],
        createdBy: []
    });

    useEffect(() => {

        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();
                const [
                    branchResponse,
                    productsResponse,
                    godownLocationsResponse,
                    staffResponse,
                    staffCategory,
                    uomResponse,
                    voucherTypeResponse,
                    batchStockResponse,
                    creditNoteFilterResponse
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/uom` }),
                    fetchLink({ address: `masters/voucher` }),
                    fetchLink({ address: `inventory/batchMaster/stockBalance` }),
                    fetchLink({ address: `creditNote/filterValues` })
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

                setBranch(branchData);
                setProducts(productsData);
                setGodown(godownLocations);
                setCostCenter(staffData);
                setCostCenterCategory(staffCategoryData);
                setUom(uomOrdered);
                setVoucherType(voucherOrdered);
                setBatchDetails(toArray(batchStockResponse.data));

                const creditNoteFilterData = creditNoteFilterResponse.success ? creditNoteFilterResponse.data : null;
                if (creditNoteFilterData) {
                    setFiltersDropDown({
                        voucherType: toArray(creditNoteFilterData?.others?.voucherType),
                        retailers: toArray(creditNoteFilterData?.others?.retailers),
                        createdBy: toArray(creditNoteFilterData?.others?.createdBy)
                    });
                }

            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, [])

    useEffect(() => {
        const isCreditNote = stateDetails?.BillType === 'CREDIT_NOTE';
        const productsArray = isCreditNote ? stateDetails?.Credit_Note_List : stateDetails?.Products_List;
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
                        ) return [key, stateDetails[key] ? formatDateForTimeLocal(stateDetails[key]) : value]
                        return [key, stateDetails[key] ?? value]
                    })
                )
            );

            setSelectedItems(
                productsArray.map(productsData => Object.fromEntries(
                    Object.entries(isCreditNote ? tripCreditNoteColumns : tripDetailsColumns).map(([key, value]) => {
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
        setGodownActivity([])
    }

    const saveTripSheet = () => {
        if (tripSheetInfo.BillType && tripSheetInfo.VoucherType) {
            if (checkIsNumber(tripSheetInfo?.Trip_Id) && stringCompare(tripSheetInfo?.Alter_Reason, '')) return toast.error('Enter Alter Reason');
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
        } else {
            toast.warn('Select BillType and Voucher')
        }
    }

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, addItemDialog: false, importDialog: false }));
    }

    const searchGodownActivity = (from, to, fromGodown, toGodown) => {
        fetchLink({
            address: `
                inventory/tripSheet/arrivalEntry?
                Fromdate=${from}&
                Todate=${to}&
                FromGodown=${fromGodown}&
                ToGodown=${toGodown}&
                convertedStatus=0`,
            loadingOn, loadingOff,
        }).then(data => {
            if (data.success) setGodownActivity(data.data); else setGodownActivity([]);
        }).catch(e => console.log(e));
    }

    const searchCreditNote = (e) => {
        if(e) e.preventDefault();
        fetchLink({
            address: `creditNote?Fromdate=${cnFilters.Fromdate}&Todate=${cnFilters.Todate}&Retailer_Id=${cnFilters.Retailer?.value || ''}&Created_by=${cnFilters.CreatedBy?.value || ''}&VoucherType=${cnFilters.VoucherType?.value || ''}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setCreditNoteData(data?.data || []);
            } else {
                setCreditNoteData([]);
                toast.error(data.message || 'Failed to load credit notes');
            }
        }).catch(e => console.error(e));
    }

    const changeCreditNoteDetails = (itemDetail, deleteRow = false) => {
        setSelectedItems(prev => {
            const preItems = prev.filter(o => !isEqualNumber(o?.CR_Id, itemDetail.CR_Id));

            if (deleteRow) {
                return preItems;
            } else {
                const currentCreditNote = { ...itemDetail };
                const mappedCN = Object.fromEntries(
                    Object.entries(tripCreditNoteColumns).map(([key, value]) => {
                        return [key, currentCreditNote[key] ?? value];
                    })
                );
                return [...preItems, mappedCN];
            }
        });
    }

    const changeTripDetails = (itemDetail, deleteRow = false) => {
        setSelectedItems(prev => {
            const preItems = prev.filter(o => !isEqualNumber(o?.Arrival_Id, itemDetail.Arr_Id));

            let updatedDeliveryArray;
            if (deleteRow) {
                updatedDeliveryArray = preItems;
            } else {
                const currentProduct = { ...itemDetail };
                const reStruc = Object.fromEntries(
                    Object.entries(tripDetailsColumns).map(([key, value]) => {
                        if (key === 'Arrival_Id') {
                            return [key, currentProduct['Arr_Id'] ?? value]
                        } else {
                            return [key, currentProduct[key] ?? value]
                        }
                    })
                )
                updatedDeliveryArray = [...preItems, reStruc];
            }
            return updatedDeliveryArray;
        });
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
                        <TripSheetStaffInvolved
                            staffInvolvedList={staffInvolvedList}
                            setStaffInvolvedList={setStaffInvolvedList}
                            costCenter={costCenter}
                            costCenterCategory={costCenterCategory}
                        />

                        {/* Stock Journal Details */}
                        <TripSheetGeneralInfo
                            tripSheetInfo={tripSheetInfo}
                            setTripSheetInfo={setTripSheetInfo}
                            branch={branch}
                            godown={godown}
                            voucherType={voucherType}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                        />
                    </div>

                    <FilterableTable
                        dataArray={selectedItems}
                        ButtonArea={
                            <>
                                <Button
                                    onClick={() => {
                                        if (tripSheetInfo.BillType === 'CREDIT_NOTE') {
                                            setCnFilters(pre => ({ ...pre, dialog: true }));
                                        } else {
                                            checkIsNumber(tripSheetInfo.Godownlocation)
                                                ? setFilters(pre => ({ ...pre, importDialog: true }))
                                                : toast.warn('Select Godown Location')
                                        }
                                    }}
                                >{tripSheetInfo.BillType === 'CREDIT_NOTE' ? 'Import Credit Notes' : 'Import Arrivals'}</Button>
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
                            QTY: ${selectedItems?.reduce((acc, o) => Addition(acc, o?.QTY ?? 0), 0)}`
                        }
                        maxHeightOption
                        columns={tripSheetInfo.BillType === 'CREDIT_NOTE' ? [
                            createCol('CR_Date', 'date', 'Date'),
                            createCol('CR_Inv_No', 'string', 'ID'),
                            createCol('Retailer_Name', 'string', 'Customer'),
                            createCol('VoucherTypeGet', 'string', 'Voucher'),
                            createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => {
                                            setSelectedItems(prev => prev.filter(pro => !isEqualNumber(pro.CR_Id, row.CR_Id)));
                                        }}
                                    ><Delete className="fa-20" /></IconButton>
                                )
                            }
                        ] : [
                            {
                                isVisible: 1,
                                ColumnHeader: 'Item',
                                isCustomCell: true,
                                Cell: ({ row }) => findProductDetails(products, row.Product_Id)?.Product_Name
                            },
                            createCol('Batch_No', 'string', 'Batch'),
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
                                            color="error"
                                            size="small"
                                            onClick={() => {
                                                setSelectedItems(prev => {
                                                    const prevArray = [...prev];
                                                    return prevArray.filter(pro =>
                                                        !isEqualNumber(pro.Arrival_Id, row.Arrival_Id)
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
                open={filters.importDialog}
                onClose={closeDialog} fullScreen
            >
                <DialogTitle
                    className="d-flex align-items-center"
                >
                    <span className="flex-grow-1">Import From Arrival</span>
                    <IconButton
                        size="small" color="error"
                        onClick={closeDialog}
                    ><Close /></IconButton>
                </DialogTitle>

                <DialogContent>

                    <form className="p-2" onSubmit={e => {
                        e.preventDefault();
                        if (checkIsNumber(filters?.fromSearchGodown) && checkIsNumber(tripSheetInfo?.Godownlocation)) {
                            searchGodownActivity(
                                filters?.fromGodownSearchDate,
                                filters?.toGodownSearchDate,
                                filters?.fromSearchGodown,
                                tripSheetInfo?.Godownlocation
                            );
                        } else {
                            toast.warn('Select godown location');
                        }

                    }}>
                        <div className="d-flex flex-wrap align-items-end">
                            <div>
                                <label className='d-block ms-2'>From Date</label>
                                <input
                                    className="cus-inpt p-2 w-auto"
                                    type="date"
                                    value={filters?.fromGodownSearchDate}
                                    onChange={e => setFilters(pre => ({ ...pre, fromGodownSearchDate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className='d-block ms-2'>To Date</label>
                                <input
                                    className="cus-inpt p-2 w-auto ms-2"
                                    type="date"
                                    value={filters?.toGodownSearchDate}
                                    onChange={e => setFilters(pre => ({ ...pre, toGodownSearchDate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className='d-block ms-2'>From Godown</label>
                                <select
                                    className="cus-inpt p-2 w-auto ms-2"
                                    value={filters?.fromSearchGodown}
                                    required
                                    onChange={e => setFilters(pre => ({ ...pre, fromSearchGodown: e.target.value }))}
                                >
                                    <option value="">Select From Godown</option>
                                    {godown.map((g, gi) => (
                                        <option value={g?.Godown_Id} key={gi}>{g?.Godown_Name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='d-block ms-2'>To Godown</label>
                                <input
                                    className="cus-inpt p-2 w-auto ms-2"
                                    value={godown.find(g => isEqualNumber(g.Godown_Id, tripSheetInfo?.Godownlocation))?.Godown_Name}
                                    required disabled
                                />
                            </div>
                            <Button
                                variant="outlined"
                                className="ms-2"
                                type="submit"
                            >search</Button>
                        </div>
                    </form>

                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    {['#', 'SNo', 'Date', 'Item', 'Rate', 'Quantity', 'Batch'].map((o, i) => (
                                        <th className="fa-13" key={i}>{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {godownActivity.map((arrival, arrivalIndex) => {
                                    const isChecked = selectedItems.findIndex(o =>
                                        isEqualNumber(o?.Arrival_Id, arrival.Arr_Id)
                                    ) !== -1;
                                    const batchValue = isChecked ? selectedItems.find(o =>
                                        isEqualNumber(o?.Arrival_Id, arrival.Arr_Id)
                                    ) : {}
                                    return (
                                        <tr key={arrivalIndex}>
                                            <td className='fa-12'>
                                                <div>
                                                    <input
                                                        className="form-check-input shadow-none pointer"
                                                        style={{ padding: '0.7em' }}
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            if (isChecked) changeTripDetails(arrival, true)
                                                            else changeTripDetails(arrival)
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className='fa-12'>{arrivalIndex + 1}</td>
                                            <td className='fa-12'>{arrival?.Arrival_Date ? LocalDate(arrival.Arrival_Date) : ''}</td>
                                            <td className='fa-12'>{arrival?.Product_Name}</td>
                                            <td className='fa-12'>{arrival?.Gst_Rate}</td>
                                            <td className='fa-12'>{arrival?.QTY}</td>
                                            <td className='fa-12'>
                                                {/* {arrival?.Batch_No} */}
                                                {tripSheetInfo.BillType === 'OTHER GODOWN' && (
                                                    <Select
                                                        value={{
                                                            value: batchValue?.Batch_No || '',
                                                            label: batchValue?.Batch_No || ''
                                                        }}
                                                        onChange={e => changeTripDetails({ ...arrival, Batch_No: e.value })}
                                                        options={
                                                            batchDetails.filter(
                                                                bat => (
                                                                    isEqualNumber(bat.item_id, arrival.Product_Id)
                                                                    && toNumber(bat.pendingQuantity) >= toNumber(arrival.QTY)
                                                                    && isEqualNumber(bat?.godown_id, arrival?.From_Location)
                                                                )
                                                            ).map(
                                                                bat => ({ value: bat.batch, label: bat.batch })
                                                            )
                                                        }
                                                        styles={customSelectStyles}
                                                        isSearchable={true}
                                                        placeholder={"Select Batch"}
                                                        menuPortalTarget={document.body}
                                                        isDisabled={!isChecked}
                                                    />
                                                )}
                                                {tripSheetInfo.BillType === 'MATERIAL INWARD' && (
                                                    <input
                                                        value={batchValue?.Batch_No || ''}
                                                        onChange={e => changeTripDetails({ ...arrival, Batch_No: e.target.value })}
                                                        className="cus-inpt p-2"
                                                        disabled={!isChecked}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={cnFilters.dialog}
                onClose={() => setCnFilters(pre => ({ ...pre, dialog: false }))} fullScreen
            >
                <DialogTitle className="d-flex align-items-center">
                    <span className="flex-grow-1">Import From Credit Note</span>
                    <IconButton size="small" color="error" onClick={() => setCnFilters(pre => ({ ...pre, dialog: false }))}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <form className="p-2" onSubmit={searchCreditNote}>
                        <div className="d-flex flex-wrap align-items-end gap-2">
                            <div>
                                <label className='d-block ms-2'>From Date</label>
                                <input type="date" value={cnFilters.Fromdate} onChange={e => setCnFilters(pre => ({ ...pre, Fromdate: e.target.value }))} className="cus-inpt p-2 w-auto" />
                            </div>
                            <div>
                                <label className='d-block ms-2'>To Date</label>
                                <input type="date" value={cnFilters.Todate} onChange={e => setCnFilters(pre => ({ ...pre, Todate: e.target.value }))} className="cus-inpt p-2 w-auto" />
                            </div>
                            <div className="col-2">
                                <label className='d-block ms-2'>Retailer</label>
                                <Select
                                    value={cnFilters?.Retailer}
                                    onChange={(e) => setCnFilters(pre => ({ ...pre, Retailer: e }))}
                                    options={[{ value: '', label: 'ALL' }, ...filtersDropDown.retailers.map(o => ({ value: o.Retailer_Id, label: o.Retailer_Name }))]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Retailer Name"}
                                />
                            </div>
                            <div className="col-2">
                                <label className='d-block ms-2'>Voucher</label>
                                <Select
                                    value={cnFilters?.VoucherType}
                                    onChange={(e) => setCnFilters(pre => ({ ...pre, VoucherType: e }))}
                                    options={[{ value: '', label: 'ALL' }, ...filtersDropDown.voucherType.map(o => ({ value: o.Vocher_Type_Id, label: o.Voucher_Type }))]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Voucher Name"}
                                />
                            </div>
                            <Button variant="outlined" type="submit">search</Button>
                        </div>
                    </form>
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    {['#', 'SNo', 'Date', 'ID', 'Customer', 'Voucher', 'Invoice Value', 'Created By'].map((o, i) => (
                                        <th className="fa-13" key={i}>{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {creditNoteData.map((cn, cnIndex) => {
                                    const isChecked = selectedItems.findIndex(o => isEqualNumber(o?.CR_Id, cn.CR_Id)) !== -1;
                                    return (
                                        <tr key={cnIndex}>
                                            <td className='fa-12'>
                                                <input
                                                    className="form-check-input shadow-none pointer"
                                                    style={{ padding: '0.7em' }}
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) changeCreditNoteDetails(cn, true);
                                                        else changeCreditNoteDetails(cn);
                                                    }}
                                                />
                                            </td>
                                            <td className='fa-12'>{cnIndex + 1}</td>
                                            <td className='fa-12'>{cn?.CR_Date ? LocalDate(cn.CR_Date) : ''}</td>
                                            <td className='fa-12'>{cn?.CR_Inv_No}</td>
                                            <td className='fa-12'>{cn?.Retailer_Name}</td>
                                            <td className='fa-12'>{cn?.VoucherTypeGet}</td>
                                            <td className='fa-12'>{cn?.Total_Invoice_value}</td>
                                            <td className='fa-12'>{cn?.Created_BY_Name}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCnFilters(pre => ({ ...pre, dialog: false }))}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default TripSheetGodownSearch;