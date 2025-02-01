import { fetchLink } from '../../../Components/fetchComponent';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, checkIsNumber, combineDateTime, NumberFormat, LocalDate, LocalTime, extractHHMM, numberToWords, isEqualNumber, ISOString, isValidDate, isValidObject, Multiplication, RoundNumber, Subraction } from "../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close, Delete, JavascriptOutlined, Search } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { tripDetailsColumns, tripMasterDetails, tripStaffsColumns } from './tableColumns'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { Download } from "@mui/icons-material";


const taxCalc = (method = 1, amount = 0, percentage = 0) => {
    switch (method) {
        case 0:
            return RoundNumber(amount * (percentage / 100));
        case 1:
            return RoundNumber(amount - (amount * (100 / (100 + percentage))));
        case 2:
            return 0;
        default:
            return 0;
    }
}

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const TripSheetGodownSearch = ({ loadingOn, loadingOff, }) => {
    const location = useLocation();

    const nav = useNavigate();
    const [printPreviewDialog, setPrintPreviewDialog] = useState(false)
    const storage = JSON.parse(localStorage.getItem('user'));
    const Created_By = storage?.UserId;
    const selectedDetails = location.selectedRows;
    const [stateDetails, setStateDetails] = useState(location.state);

    const [deliveryPerson, setDeliveryPerson] = useState(null);
    const [deliveryPersonList, setDeliveryPersonList] = useState([]);
    const [filters, setFilters] = useState({

        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false,
        addItemDialog: false,

    });


    let rowCount = 1;


    const processTaxData = (source) => {
        return (Array.isArray(source) ? source : []).reduce((acc, item) => {
            if (Array.isArray(item?.Products_List)) {
                item.Products_List.forEach(subItem => {
                    const { Taxable_Amount = 0, Cgst_Amo = 0, Sgst_Amo = 0, Igst_Amo = 0, HSN_Code } = subItem;

                    const existingEntry = acc.find(obj => obj.hsnCode === HSN_Code);

                    if (existingEntry) {
                        // Creating a new updated entry instead of mutating the existing array
                        const updatedEntry = {
                            ...existingEntry,
                            taxableValue: Addition(existingEntry.taxableValue, Taxable_Amount),
                            cgst: Addition(existingEntry.cgst, Cgst_Amo),
                            sgst: Addition(existingEntry.sgst, Sgst_Amo),
                            igst: Addition(existingEntry.igst, Igst_Amo),
                            totalTax: Addition(existingEntry.totalTax, Addition(Addition(Cgst_Amo, Sgst_Amo), Igst_Amo)),
                          
                        };

                        // Replace the existing entry with the updated one
                        acc = acc.map(obj => obj.hsnCode === HSN_Code ? updatedEntry : obj);
                    } else {
                        acc.push({
                            hsnCode: HSN_Code,
                            taxableValue: Number(Taxable_Amount) || 0,
                            cgst: Number(Cgst_Amo) || 0,
                            sgst: Number(Sgst_Amo) || 0,
                            igst: Number(Igst_Amo) || 0,
                            totalTax: Addition(Addition(Cgst_Amo, Sgst_Amo), Igst_Amo),
                        });
                    }
                });
            }

            return acc;
        }, []);
    };

    // Use this function for both `TaxData1` and `TaxData`
    const TaxData1 = processTaxData(location.state);
    const TaxData = processTaxData(stateDetails);




    const Final_Amo = (Array.isArray(stateDetails) ? stateDetails : []).reduce(
        (acc, detail) =>
            acc +
            (detail.Products_List || []).reduce(
                (subAcc, product) => Addition(subAcc, product.Final_Amo || 0),
                0
            ),
        0
    );

    const taxableValue = (Array.isArray(stateDetails) ? stateDetails : []).reduce(
        (acc, detail) =>
            acc +
            (detail.Products_List || []).reduce(
                (subAcc, product) => Addition(subAcc, product.Taxable_Amount || 0),
                0
            ),
        0
    );

    const totalTax = (Array.isArray(stateDetails) ? stateDetails : []).reduce(
        (acc, detail) =>
            acc +
            (detail.Products_List || []).reduce(
                (subAcc, product) =>
                    Addition(subAcc, Addition(product.Cgst_Amo || 0, Addition(product.Sgst_Amo || 0, product.Igst_Amo || 0))),
                0
            ),
        0
    );


    useEffect(() => {

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setDeliveryPersonList(data.data);
            }
        }).catch(e => console.error(e));
    }, [])

    useEffect(() => {
        if (location.state?.Trip_Id) {
            const updatedProducts = (location.state.Products_List || []).map((product) => {


                const totalQty = product.QTY || 0;
                const taxableRate = product?.Taxable_Value && product?.QTY
                    ? product.Taxable_Value / product.QTY
                    : 0;

                const SGST_Total = product?.Cgst_P || 0;
                const CSGT_Total = product?.Sgst_P || 0;
                const IGST_Total = product?.Igst_P || 0;
                const HSN_Code = product.HSN_Code;

                // Only calculate Taxable_Amount if it's missing
                const totaltaxableAmount = product.Taxable_Amount ?? (totalQty * taxableRate);
                const itemSingleRate = taxableRate;
                const Final_Amo = totaltaxableAmount + SGST_Total + CSGT_Total + IGST_Total;
                const Retailers = product?.Retailer_Name;

                return {
                    ...product,
                    Total_Qty: totalQty,
                    Taxable_Rate: taxableRate,
                    Taxable_Amount: totaltaxableAmount,
                    SGST_Total,
                    CSGT_Total,
                    IGST_Total,
                    HSN_Code,
                    itemSingleRate,
                    Final_Amo,
                };
            });

            setProducts(updatedProducts);
        } else if (location.state) {
            const stateAsArray = Object.keys(location.state)
                .filter((key) => !isNaN(Number(key)))
                .map((key) => location.state[key]);

            setStateDetails(stateAsArray);

            const combinedProducts = stateAsArray.flatMap((item) => item.Products_List || []);
            setProducts(combinedProducts);
        }

    }, [location.state]);


    const handleDeliveryPersonChange = (selectedOption) => {

        setDeliveryPerson(selectedOption ? { UserId: selectedOption.value, Name: selectedOption.label } : null);
    };


    const [transactionData, setTransactionData] = useState([]);
    const [godown, setGodown] = useState([]);
    const [products, setProducts] = useState([]);
    const [costCenter, setCostCenter] = useState([]);
    const [costCenterCategory, setCostCenterCategory] = useState([])
    const [branch, setBranch] = useState([]);
    const [tripSheetInfo, setTripSheetInfo] = useState(tripMasterDetails);
    const [staffInvolvedList, setStaffInvolvedList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const printRef = useRef(null);


    useEffect(() => {
        const fetchBranchDetails = async () => {
            try {
                const branchResponse = await fetchLink({ address: `masters/branch/dropDown` });

                if (branchResponse.success) {
                    setBranch(branchResponse.data);
                }
            } catch (error) {
                console.error("Error fetching branch details:", error);
            }
        };

        fetchBranchDetails();
    }, []);




    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                const branchResponse = await fetchLink({ address: `masters/branch/dropDown` });
                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                setBranch(branchData);
            } catch (e) {
                console.error("Error fetching branch data:", e);
            }
        };


        const fetchGodownLocations = async () => {
            try {
                const godownLocationsResponse = await fetchLink({ address: `dataEntry/godownLocationMaster` });
                const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                );
                setGodown(godownLocations);
            } catch (e) {
                console.error("Error fetching godown locations:", e);
            }
        };

        const fetchStaffData = async () => {
            try {
                const staffResponse = await fetchLink({ address: `dataEntry/costCenter` });
                const staffData = (staffResponse.success ? staffResponse.data : []).sort(
                    (a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name)
                );
                setCostCenter(staffData);
            } catch (e) {
                console.error("Error fetching staff data:", e);
            }
        };

        const fetchStaffCategoryData = async () => {
            try {
                const staffCategoryResponse = await fetchLink({ address: `dataEntry/costCategory/DropDown` });
                const staffCategoryData = (staffCategoryResponse.success ? staffCategoryResponse.data : []).sort(
                    (a, b) => String(a?.value).localeCompare(b?.value)
                );
                setCostCenterCategory(staffCategoryData);
            } catch (e) {
                console.error("Error fetching staff category data:", e);
            }
        };

        fetchBranchData();
        fetchGodownLocations();
        fetchStaffData();
        fetchStaffCategoryData();
    }, [location.state]);

    useEffect(() => {

        const Delivery_List = stateDetails?.Products_List;
        const employeesArray = stateDetails?.Employees_Involved;

        if (
            isValidObject(stateDetails)
            && Array.isArray(Delivery_List)
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
                Delivery_List.map(productsData => Object.fromEntries(
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




    const saveTripSheet = () => {
        if (loadingOn) loadingOn();


        fetchLink({
            address: `delivery/deliveryOrderTrip`,
            method: checkIsNumber(tripSheetInfo?.Trip_Id) ? 'PUT' : 'POST',

            bodyData: {
                ...tripSheetInfo,
                Created_By,
                StartTime: (
                    tripSheetInfo.StartTime && tripSheetInfo.Trip_Date
                ) ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.StartTime) : '',
                EndTime: (
                    tripSheetInfo.EndTime && tripSheetInfo.Trip_Date
                ) ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.EndTime) : '',
                Product_Array: products,
                Delivery_Person_Id: deliveryPerson?.UserId,
                EmployeesInvolved: staffInvolvedList.filter(staff =>
                    checkIsNumber(staff.Involved_Emp_Id) &&
                    checkIsNumber(staff.Cost_Center_Type_Id)
                )
            }


        }).then(data => {
            if (data.success) {
                setProducts([])
                setStateDetails([])
                setDeliveryPerson(null)
                setTripSheetInfo()
                resetForm();
                toast.success(data.message);


            } else {
                toast.error(data.message)
            }
        }).catch(
            e => (toast.error(e))

        ).finally(() => {
            if (loadingOff) loadingOff();
        })
    }





    const resetForm = () => {
        
        setSelectedItems([]);
        setStaffInvolvedList([]);
        setTripSheetInfo(tripMasterDetails);
        setBranch([]);

        setTransactionData([]);
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });


    const Dialogopen = () => {
        setPrintPreviewDialog(true)
    }

    return (
        <>

            <Card>

                <div className="d-flex flex-wrap align-items-center border-bottom p-2">
                    <h5 className='flex-grow-1 m-0 ps-2'>Trip Sheet Creation</h5>
                    {/* <Button
                        variant="outlined"
                        onClick={Dialogopen} // Trigger save and preview
                    // disabled={selectedItems.length === 0 || !isValidDate(tripSheetInfo.Trip_Date)}
                    >
                        Preview
                    </Button> */}
                     <div className="border-top p-2 text-end">
                    <Button
                        variant="outlined"
                        onClick={saveTripSheet}
                    // disabled={selectedItems.length === 0 || !isValidDate(tripSheetInfo.Trip_Date)}
                    >Save</Button>
                </div>
                </div>

                <CardContent style={{ minHeight: 500 }}>

                    <div className="row ">

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
                                                <td className="fa-13 vctr p-0" style={{ maxWidth: '130px', minWidth: '110px' }}>
                                                    <select
                                                        value={row?.Cost_Center_Type_Id}
                                                        onChange={e => setStaffInvolvedList((prev) => {
                                                            return prev.map((item, ind) => {
                                                                if (isEqualNumber(ind, index)) {
                                                                    const selectedOption = e.target.options[e.target.selectedIndex];
                                                                    return {
                                                                        ...item,
                                                                        Cost_Center_Type_Id: e.target.value,
                                                                        Cost_Category: selectedOption.text
                                                                    };
                                                                }
                                                                return item;
                                                            });
                                                        })}
                                                        className="cus-inpt p-2"
                                                    >
                                                        <option value="">Select</option>
                                                        {costCenterCategory.map((st, sti) => (
                                                            <option value={st?.value} key={sti}>{st?.label}</option>
                                                        ))}
                                                    </select>
                                                </td>


                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                <div className="row">
                                    <div className="col-xl-3 col-md-6 col-sm-12 p-2">
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

                                    <div className="col-xl-3 col-md-6 col-sm-12 p-2">
                                        <label>Date</label>
                                        <input
                                            value={tripSheetInfo.Trip_Date}
                                            type="date"
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_Date: e.target.value })}
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>

                                    <div className="col-xl-3 col-md-6 col-sm-12 p-2">
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

                                    <div className="col-xl-3 col-md-6 col-sm-12 p-2">
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

                    <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                        <h6 className="flex-grow-1 m-0"></h6>
                        <Button
                            variant="outlined"
                            color="primary"
                            type="button"

                            onClick={() => {

                                nav('/erp/sales/Tripsheet/Tripsheetcreation/SaleOrderconvert', {
                                    selectedDetails
                                })
                            }}

                        >Add</Button>
                    </div>

                    <FilterableTable


                        dataArray={products}
                        EnableSerialNumber
                        disablePagination

                        maxHeightOption
                        columns={[
                            // createCol('Retailer_Name', 'string','Retailer_Name'),
                            createCol('Product_Name', 'string'),

                            createCol('HSN_Code', 'string', 'HSN_Code'),

                            createCol('Total_Qty', 'number', 'QTY'),
                            createCol('Taxable_Rate', 'number', 'Rate'),
                            createCol('Taxable_Amount', 'number', 'Amount_Before_Tax'),
                            createCol('Final_Amo', 'number', 'Final_Amo'),

                            // {
                            //     isVisible: 1,
                            //     ColumnHeader: '#',
                            //     isCustomCell: true,
                            //     Cell: ({ row }) => <IconButton
                            //         variant="contained"
                            //         color="error"
                            //         size="small"

                            //     ><Delete className="fa-20" /></IconButton>
                            // },
                        ]}
                    />





                </CardContent>

                <div className="border-top p-2 text-end">
                    <Button
                        variant="outlined"
                        onClick={saveTripSheet}
                    // disabled={selectedItems.length === 0 || !isValidDate(tripSheetInfo.Trip_Date)}
                    >Save</Button>
                </div>
            </Card>



            {/* <Dialog
                open={filters.addItemDialog}
                onClose={() => setFilters(pre => ({ ...pre, addItemDialog: false }))}
                maxWidth='lg' fullWidth fullScreen
            >
                <form onSubmit={searchTransaction}>
                    <DialogTitle
                        className="d-flex align-items-center"
                    >
                        <span className="flex-grow-1">Add Item</span>
                        <Button
                            variant="outlined"
                            type="submit" className="me-2"
                            disabled={!filters.FromGodown || !filters.ToGodown}
                            startIcon={<Search />}
                        >Search</Button>
                        <IconButton
                            size="small" color="error"
                            onClick={() => setFilters(pre => ({ ...pre, addItemDialog: false }))}
                        ><Close /></IconButton>
                    </DialogTitle>



                    <DialogActions>
                        <Button type="button" onClick={() => setFilters(pre => ({ ...pre, addItemDialog: false }))}>close</Button>
                    </DialogActions>

                </form>
            </Dialog> */}


            <Dialog
                open={printPreviewDialog}
                onClose={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                maxWidth='xl' fullWidth
            >
                <DialogTitle>Print Preview</DialogTitle>
                <DialogContent ref={printRef}>

                    {(stateDetails) && <React.Fragment>
                        <table className="table table-bordered fa-13 m-0">
                            <tbody>
                                <tr>
                                    <td colSpan={3}>DELIVERY CHALLAN</td>
                                    <td colSpan={3}>GSTIN : 33AADFS4987M1ZL</td>
                                    <td colSpan={2}>ORIGINAL / DUPLICATE</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} rowSpan={2}>
                                        <span className="fa-14 fw-bold">S.M TRADERS</span> <br />
                                        H.O: 153, CHITRAKARA STREET, MADURAI - 625001 <br />
                                        G.O: 746-A, PULIYUR, SAYANAPURAM, SIVAGANGAI - 630611
                                    </td>
                                    <td colSpan={3}>FSSAI No : 12418012000818</td>
                                    <td>Challan No</td>
                                    <td>{stateDetails?.Challan_No}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3}>Phone No: 9842131353, 9786131353</td>
                                    <td>Date</td>
                                    <td>{tripSheetInfo.Trip_Date ? LocalDate(tripSheetInfo.Trip_Date) : ''}</td>
                                </tr>
                                <tr>
                                    <td colSpan={8} className="text-center">Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work</td>
                                </tr>
                                <tr>
                                    <td>Vehicle No</td>
                                    <td>{tripSheetInfo?.Vehicle_No}</td>
                                    <td>Driver Name</td>
                                    <td>
                                        {staffInvolvedList?.filter(staff => (
                                            staff?.Cost_Category === 'Driver'
                                        ))?.map(staff => staff?.Emp_Name).join(', ')}
                                    </td>
                                    <td>Start Time</td>
                                    <td>{tripSheetInfo?.StartTime}</td>
                                    <td>Start KM</td>
                                    <td>{tripSheetInfo?.Trip_ST_KM}</td>
                                </tr>
                                <tr>

                                    <td>Trip No</td>
                                    <td>{tripSheetInfo?.Trip_No}</td>

                                    <td>LoadMan</td>

                                    <td>
                                        {stateDetails?.Employees_Involved?.filter(staff => (
                                            staff?.Cost_Category === 'Load Man'
                                        ))?.map(staff => staff?.Emp_Name).join(', ')}
                                    </td>
                                    <td>End Time</td>
                                    <td>{stateDetails?.EndTime ? LocalTime(new Date(stateDetails.EndTime)) : ''}</td>
                                    <td>End KM</td>
                                    <td>{stateDetails?.Trip_ST_KM}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* items */}
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="fa-12 bg-light">#</th>
                                    <th className="fa-12 bg-light">Reason</th>
                                    <th className="fa-12 bg-light">Party</th>
                                    <th className="fa-12 bg-light">Address</th>
                                    <th className="fa-12 bg-light">Item</th>
                                    <th className="fa-12 bg-light">HSN</th>
                                    <th className="fa-12 bg-light">Qty</th>
                                    <th className="fa-12 bg-light">KGS</th>
                                    <th className="fa-12 bg-light">Rate</th>
                                    <th className="fa-12 bg-light">Amount</th>
                                    {/* <th className="fa-12 bg-light">Transfer To</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {(Array.isArray(stateDetails) ? stateDetails : []).map((detail, index) => {
                                    return detail.Products_List.map((product, subIndex) => (
                                        <tr key={`${index}-${subIndex}`}>
                                            <td className="fa-10">{rowCount++}</td>
                                            <td className="fa-10">{detail.Narration || '-'}</td>
                                            <td className="fa-10">{detail.Retailer_Name}</td>
                                            <td className="fa-10">{detail.Retailer_Address || '-'}</td>
                                            <td className="fa-10">{product.Product_Name}</td>
                                            <td className="fa-10">{product.HSN_Code}</td>
                                            <td className="fa-10">{NumberFormat(product.Total_Qty)}</td>
                                            <td className="fa-10">{NumberFormat(product.KGS || 0)}</td>
                                            <td className="fa-10">{NumberFormat(product.Taxable_Rate)}</td>
                                            <td className="fa-10">{NumberFormat(product.Taxable_Amount)}</td>
                                            {/* <td className="fa-10">{detail.ToLocation || '-'}</td> */}
                                        </tr>
                                    ));
                                })}
                                <tr>
                                    <td className="fa-10 fw-bold" colSpan={6}>


                                    </td>
                                    <td className="fa-10 fw-bold">
                                        {NumberFormat((Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                            (acc, detail) =>
                                                acc +
                                                (detail.Products_List || []).reduce(
                                                    (subAcc, product) => Addition(subAcc, product.Total_Qty || 0),
                                                    0
                                                ),
                                            0
                                        ))}
                                    </td>
                                    <td className="fa-10 fw-bold">
                                        {NumberFormat((Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                            (acc, detail) =>
                                                acc +
                                                (detail.Products_List || []).reduce(
                                                    (subAcc, product) => Addition(subAcc, product.KGS || 0),
                                                    0
                                                ),
                                            0
                                        ))}
                                    </td>
                                    <td className="fa-10"></td>
                                    <td className="fa-10 fw-bold" colSpan={2}>
                                        {NumberFormat((Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                            (acc, detail) =>
                                                acc +
                                                (detail.Products_List || []).reduce(
                                                    (subAcc, product) => Addition(subAcc, product.Taxable_Amount || 0),
                                                    0
                                                ),
                                            0
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Tax Calculation */}
                        <table className="table table-bordered fw-bold">
                            <thead>
                                <tr>

                                    <td className="bg-light fa-12 text-center">HSN / SAC</td>
                                    <td className="bg-light fa-12 text-center">Taxable Value</td>
                                    <td className="bg-light fa-12 text-center">IGST</td>
                                    <td className="bg-light fa-12 text-center">CGST</td>
                                    <td className="bg-light fa-12 text-center">SGST</td>
                                    <td className="bg-light fa-12 text-center">Total Tax</td>
                                </tr>
                            </thead>

                            <tbody>


                                {Array.isArray(TaxData) &&
                                    TaxData.map((tax, index) => (
                                        <tr key={index}>
                                            <td className="fa-10 text-center">{tax.hsnCode || '-'}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.taxableValue)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.igst)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.cgst)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.sgst)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.totalTax)}</td>
                                            <td className="fa-10 text-center">

                                                {NumberFormat((Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                                    (acc, detail) =>
                                                        acc +
                                                        (detail.Products_List || []).reduce(
                                                            (subAcc, product) => Addition(subAcc, product.Final_Amo || 0),
                                                            0
                                                        ),
                                                    0
                                                ))}

                                            </td>

                                        </tr>
                                    ))}




                                {Array.isArray(TaxData) &&
                                    TaxData.map((tax, index) => (
                                        <tr key={index}>
                                            <td className="fa-10 text-center">{tax.hsnCode || '-'}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.taxableValue)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.igst)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.cgst)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.sgst)}</td>
                                            <td className="fa-10 text-center">{NumberFormat(tax.totalTax)}</td>
                                            <td className="fa-10 text-center">

                                                {NumberFormat((Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                                    (acc, detail) =>
                                                        acc +
                                                        (detail.Products_List || []).reduce(
                                                            (subAcc, product) => Addition(subAcc, product.Final_Amo || 0),
                                                            0
                                                        ),
                                                    0
                                                ))}

                                            </td>

                                        </tr>
                                    ))}
                            </tbody>


                        </table>

                        {/* tax calculation */}



                        <table className="table table-bordered fa-12">
                            <tbody>
                                <tr>
                                    <td>Prepared By</td>
                                    <td style={{ minWidth: 150 }}></td>
                                    <td>Executed By</td>
                                    <td style={{ minWidth: 150 }}></td>
                                    <td>Verified By</td>
                                    <td style={{ minWidth: 150 }}></td>
                                </tr>
                                <tr>
                                    <td>Other Expenses</td>
                                    <td>0</td>
                                    <td className=''>Round Off</td>
                                    <td className=' Text-Center fa-13 fw-bold'>
                                        {NumberFormat(Final_Amo - (taxableValue + totalTax))}
                                    </td>
                                    <td>Grand Total</td>
                                    <td>
                                        <td className='col-12 Text-Center fa-13 fw-bold' >
                                            {NumberFormat((Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                                (acc, detail) =>
                                                    acc +
                                                    (detail.Products_List || []).reduce(
                                                        (subAcc, product) => Addition(subAcc, product.Final_Amo || 0),
                                                        0
                                                    ),
                                                0
                                            ))}
                                        </td>
                                    </td>
                                </tr>

                            </tbody>

                        </table>
                        <td className="col-12 text-end fw-bold">
                            {numberToWords(
                                (Array.isArray(stateDetails) ? stateDetails : []).reduce(
                                    (acc, detail) =>
                                        acc +
                                        (detail.Products_List || []).reduce(
                                            (subAcc, product) => Addition(subAcc, product.Final_Amo || 0),
                                            0
                                        ),
                                    0
                                )
                            )} Only.
                        </td>

                        <div className="col-12 text-center">
                            <p>This is a Computer Generated Invoice</p>
                        </div>

                    </React.Fragment>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setPrintPreviewDialog(false)}
                        variant="outlined"
                    >close</Button>

                    <Button
                        startIcon={<Download />}
                        variant='outlined'
                        onClick={handlePrint}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default TripSheetGodownSearch;






















