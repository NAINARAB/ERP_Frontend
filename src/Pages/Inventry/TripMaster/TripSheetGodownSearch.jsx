import { useEffect, useState } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, checkIsNumber, isEqualNumber, ISOString, isValidDate, Multiplication, RoundNumber, Subraction } from "../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close, Delete, Search } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { tripDetailsColumns, tripMasterDetails, tripStaffsColumns } from './tableColumns'


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

const TripSheetGodownSearch = ({ loadingOn, loadingOff }) => {

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
    const [godown, setGodown] = useState([]);
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
                    godownLocationsResponse,
                    staffResponse,
                    staffCategory
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` })
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

                setBranch(branchData)
                setProducts(productsData);
                setGodown(godownLocations);
                setCostCenter(staffData);
                setCostCenterCategory(staffCategoryData)

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, [])

    const searchTransaction = (e) => {
        e.preventDefault();
        const { FromGodown, ToGodown, Fromdate, Todate } = filters;

        if (FromGodown && ToGodown && isValidDate(Fromdate) && isValidDate(Todate)) {
            if (loadingOn) loadingOn();
            setTransactionData([]);
            fetchLink({
                address: `inventory/stockJournal/godownActivity?FromDate=${Fromdate}&ToDate=${Todate}&fromGodown=${FromGodown}&toGodown=${ToGodown}`
            }).then(data => {
                if (data.success) setTransactionData(data.data);
            }).catch(e => console.log(e)).finally(() => {
                if (loadingOff) loadingOff();
            }).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }

    const changeItems = (itemDetail, deleteOption) => {
        setSelectedItems(prev => {
            const preItems = prev.filter(o =>
                !isEqualNumber(o.STJ_Id, itemDetail.STJ_Id)
            );

            if (deleteOption) {
                return preItems;
            } else {
                const currentOrders = transactionData.filter(o =>
                    isEqualNumber(o.STJ_Id, itemDetail.STJ_Id)
                );

                const reStruc = currentOrders.map(item => {
                    const productDetails = findProductDetails(products, item.Sour_Item_Id);
                    const GST_Inclusive = checkIsNumber(item?.GST_Inclusive) ? Number(item?.GST_Inclusive) : 0;
                    const IS_IGST = checkIsNumber(item?.IS_IGST) ? Number(item?.IS_IGST) : 0;
                    const gstPercentage = IS_IGST ? Number(productDetails.Igst_P) : Number(productDetails.Gst_P);
                    const Bill_Qty = Number(item.Sour_Qty);
                    const Item_Rate = RoundNumber(item.Sour_Rate);
                    const Amount = Multiplication(Bill_Qty, Item_Rate);
                    const tax = taxCalc(GST_Inclusive, Amount, gstPercentage);

                    const Taxable_Amount = Amount;
                    const Final_Amo = Addition(Amount, tax);

                    return Object.fromEntries(
                        Object.entries(tripDetailsColumns).map(([key, value]) => {
                            switch (key) {
                                case 'STJ_Id': return [key, Number(item?.STJ_Id)];
                                case 'Batch_No': return [key, item?.Sour_Batch_Lot_No];
                                case 'From_Location': return [key, item?.Sour_Goodown_Id];
                                case 'To_Location': return [key, item?.Dest_Goodown_Id];
                                case 'Product_Id': return [key, Number(item?.Sour_Item_Id)];
                                case 'HSN_Code': return [key, productDetails.HSN_Code];
                                case 'QTY': return [key, Bill_Qty];
                                case 'KGS': return [key, 0];
                                case 'GST_Inclusive': return [key, GST_Inclusive];
                                case 'IS_IGST': return [key, IS_IGST];
                                case 'Gst_Rate': return [key, Item_Rate];
                                case 'Gst_P': return [key, gstPercentage];
                                case 'Cgst_P': return [key, (gstPercentage / 2) ?? 0];
                                case 'Sgst_P': return [key, (gstPercentage / 2) ?? 0];
                                case 'Igst_P': return [key, (gstPercentage / 2) ?? 0];
                                case 'Taxable_Value': return [key, Taxable_Amount];
                                case 'Round_off': return [key, 0];
                                case 'Total_Value': return [key, Final_Amo];
                                case 'Trip_From': return [key, 'STOCK JOURNAL'];
                                case 'Party_And_Branch_Id': return [key, 1];
                                default: return [key, value];
                            }
                        })
                    );
                });

                return preItems.concat(reStruc);
            }
        });
    };

    const saveTripSheet = () => {

    }

    return (
        <>
            <Card>

                <div className="d-flex flex-wrap align-items-center border-bottom p-2">
                    <h5 className='flex-grow-1 m-0 ps-2'>Trip Sheet Creation</h5>
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
                                                        {costCenterCategory.map(st =>
                                                            <option value={st?.Cost_Category_Id}>{st?.Cost_Category}</option>
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

                                <div className="row px-2">
                                    {/* Common Details - 1 */}
                                    <div className="col-lg-3 col-sm-6 p-2">
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

                                        <label>Date</label>
                                        <input
                                            value={tripSheetInfo.Trip_Date}
                                            type="date"
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_Date: e.target.value })}
                                            className="cus-inpt p-2 mb-2"
                                        />

                                        <label>Trip Number</label>
                                        <input
                                            value={tripSheetInfo.Trip_No}
                                            placeholder="Trip / Machine / Vehicle"
                                            onChange={e => setTripSheetInfo({ ...tripSheetInfo, Trip_No: e.target.value })}
                                            className="cus-inpt p-2 mb-2"
                                        />

                                    </div>


                                    {/* Common Details - 2 */}
                                    <div className="col-lg-9 col-sm-6 p-2 pt-0">

                                        <div className="row">
                                            <div className="col-md-4 col-sm-6 p-2">
                                                <label>Challan No</label>
                                                <input
                                                    value={tripSheetInfo.Challan_No}
                                                    onChange={e => setTripSheetInfo({ ...tripSheetInfo, Challan_No: e.target.value })}
                                                    className="cus-inpt p-2 mb-2"
                                                />
                                            </div>
                                            <div className="col-md-4 col-sm-6 p-2">
                                                <label>Vehicle No</label>
                                                <input
                                                    value={tripSheetInfo.Vehicle_No}
                                                    onChange={e => setTripSheetInfo({ ...tripSheetInfo, Vehicle_No: e.target.value })}
                                                    className="cus-inpt p-2 mb-2"
                                                />
                                            </div>
                                            <div className="col-md-4 col-sm-6 p-2">
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
                        title={`Selected Items (${selectedItems.length})`}
                        maxHeightOption
                        columns={[
                            {
                                isVisible: 1,
                                ColumnHeader: 'Item',
                                isCustomCell: true,
                                Cell: ({ row }) => findProductDetails(products, row.Product_Id)?.Product_Name
                            },
                            createCol('HSN_Code', 'string', 'HSN Code'),
                            createCol('QTY', 'number', 'Quantity'),
                            createCol('KGS', 'number', 'KGs'),
                            createCol('Gst_Rate', 'number', 'Rate'),
                            createCol('Total_Value', 'number', 'Amount'),
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => <IconButton
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => {
                                        const filteredItems = selectedItems.filter(o =>
                                            !isEqualNumber(o.STJ_Id, row.STJ_Id)
                                        );
                                        setSelectedItems(filteredItems);
                                    }}
                                ><Delete className="fa-20" /></IconButton>
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

                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td className="text-center fa-13 fw-bold" colSpan={2}>Godown Location</td>
                                        <td className="text-center fa-13 fw-bold" colSpan={2}>Date</td>
                                    </tr>

                                    <tr>
                                        <td className="text-center fa-13 fw-bold">
                                            From
                                        </td>
                                        <td className="text-center fa-13 fw-bold">To</td>
                                        <td className="text-center fa-13 fw-bold">
                                            From
                                        </td>
                                        <td className="text-center fa-13 fw-bold">To</td>
                                    </tr>


                                    <tr>
                                        <td className="fa-13 ">
                                            <Select
                                                value={{ value: filters.FromGodown, label: filters.FromGodownName }}
                                                onChange={e => setFilters(pre => ({
                                                    ...pre,
                                                    FromGodown: e.value,
                                                    FromGodownName: e.label
                                                }))}
                                                menuPortalTarget={document.body}
                                                options={[
                                                    { value: '', label: 'Search', isDisabled: true },
                                                    ...godown.filter(fil => !isEqualNumber(fil.Godown_Id, filters.ToGodown)).map(obj => ({
                                                        value: obj?.Godown_Id,
                                                        label: obj?.Godown_Name
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={"Select Godown"}
                                                maxMenuHeight={300}
                                            />
                                        </td>

                                        <td className="fa-13 ">
                                            <Select
                                                value={{ value: filters.ToGodown, label: filters.ToGodownName }}
                                                onChange={e => setFilters(pre => ({
                                                    ...pre,
                                                    ToGodown: e.value,
                                                    ToGodownName: e.label
                                                }))}
                                                menuPortalTarget={document.body}
                                                options={[
                                                    { value: '', label: 'Search', isDisabled: true },
                                                    ...godown.filter(fil => !isEqualNumber(fil.Godown_Id, filters.FromGodown)).map(obj => ({
                                                        value: obj?.Godown_Id,
                                                        label: obj?.Godown_Name
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                placeholder={"Select Godown"}
                                                maxMenuHeight={300}
                                            />
                                        </td>

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
                            // EnableSerialNumber
                            disablePagination
                            title={`Godown Transactions From: ${transactionData[0]?.Source_Godown_Name}`}
                            maxHeightOption
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: '#',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {

                                        const isChecked = selectedItems.findIndex(o =>
                                            isEqualNumber(o.STJ_Id, row.STJ_Id)
                                            && isEqualNumber(o.From_Location, row.Sour_Goodown_Id)
                                            && isEqualNumber(o.Product_Id, row.Sour_Item_Id)
                                        ) === -1 ? false : true;

                                        return (
                                            <div>
                                                <input
                                                    className="form-check-input shadow-none pointer"
                                                    style={{ padding: '0.7em' }}
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) changeItems(row, true)
                                                        else changeItems(row)
                                                    }}
                                                />
                                            </div>
                                        )
                                    }
                                },
                                createCol('Sour_Item_Name', 'string', 'Item'),
                                createCol('Stock_Journal_Voucher_type', 'string', 'Voucher'),
                                createCol('Stock_Journal_Bill_type', 'string', 'Bill-Type'),
                                createCol('Sour_Batch_Lot_No', 'string', 'Batch'),
                                createCol('Sour_Qty', 'number', 'Quantity'),
                                createCol('Sour_Amt', 'number', 'Amount'),
                                createCol('Source_Godown_Name', 'string', 'From'),
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'To',
                                    isCustomCell: true,
                                    Cell: ({ row }) => godown.find(g => isEqualNumber(g.Godown_Id, row?.Dest_Goodown_Id)).Godown_Name ?? ' - '
                                },
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