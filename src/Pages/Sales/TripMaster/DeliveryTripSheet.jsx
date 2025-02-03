import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Addition, ISOString, isValidDate, isValidObject, LocalDate, LocalTime, NumberFormat, numberToWords, Subraction, Multiplication, timeDuration } from "../../../Components/functions";
import { Download, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const TripSheets = ({ loadingOn, loadingOff }) => {

    const nav = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [tripData, setTripData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
        printPreviewDialog: false,
        shortPreviewDialog: false,
        FromGodown: [],
        ToGodown: [],
        Staffs: [],
        Items: []
    });
    const [selectedRow, setSelectedRow] = useState({});
    const printRef = useRef(null);


    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `delivery/deliveryTripSheet?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {

                setTripData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo]);

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, fetchFrom: queryFilters.Fromdate, fetchTo: queryFilters.Todate }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        nav(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters({
            ...filters,
            filterDialog: false,
        });
    }

    const TotalTax = (Cgst_P, Sgst_P) => {
        return Addition(Cgst_P, Sgst_P);
    };

    const TaxData = (Array.isArray(selectedRow?.Products_List) ? selectedRow.Products_List : []).reduce((data, item) => {
        const HSNindex = data.findIndex(obj => obj.hsnCode == item.HSN_Code);

        const {
            Taxable_Value = 0,
            Cgst_P = 0,
            Sgst_P = 0,
            Igst_P = 0,
            HSN_Code,
            QTY = 0
        } = item;

        if (HSNindex !== -1) {
            const prev = data[HSNindex];
            const newValue = {
                ...prev,
                taxableValue: Addition(prev.taxableValue, Taxable_Value),
                cgst: Addition(prev.cgst, Cgst_P),
                sgst: Addition(prev.sgst, Sgst_P),
                igst: Addition(prev.igst, Igst_P),
                totalTax: Addition(prev.totalTax, Addition(Addition(Cgst_P, Sgst_P), Igst_P)),
            };

            data[HSNindex] = newValue;
            return data;
        }

        const newEntry = {
            hsnCode: HSN_Code,
            taxableValue: Taxable_Value,
            cgst: Number(Cgst_P) ?? 0,
            sgst: Number(Sgst_P) ?? 0,
            igst: Number(Igst_P) ?? 0,
            totalTax: Addition(Addition(Cgst_P, Sgst_P), Igst_P),
        };

        return [...data, newEntry];
    }, []);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const uniqueFromLocations = useMemo(() => {
        const allLocations = tripData.flatMap((trip) =>
            trip.Products_List.map((product) => product.FromLocation)
        );
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [tripData]);

    const uniqueToLocations = useMemo(() => {
        const allLocations = tripData.flatMap((trip) =>
            trip.Products_List.map((product) => product.ToLocation)
        );
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [tripData]);

    const uniqueItems = useMemo(() => {
        const allItems = tripData.flatMap((trip) =>
            trip.Products_List.map((product) => product.Product_Name)
        );
        return [...new Set(allItems)].map(items => ({
            value: items,
            label: items,
        }));
    }, [tripData]);

    const uniqueStaffs = useMemo(() => {
        const allStaffs = tripData.flatMap((trip) =>
            trip.Employees_Involved.map((staff) => staff.Emp_Name)
        );
        return [...new Set(allStaffs)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [tripData]);

    const filteredData = useMemo(() => {
        return tripData.filter(trip => {
            const hasFromGodownMatch = filters.FromGodown.length > 0
                ? trip.Products_List.some(product =>
                    filters.FromGodown.some(selected => selected.value === product.FromLocation)
                )
                : false;

            const hasToGodownMatch = filters.ToGodown.length > 0
                ? trip.Products_List.some(product =>
                    filters.ToGodown.some(selected => selected.value === product.ToLocation)
                )
                : false;

            const hasItemMatch = filters.Items.length > 0
                ? trip.Products_List.some(product =>
                    filters.Items.some(selected => selected.value === product.Product_Name)
                )
                : false;

            const hasEmployeeMatch = filters.Staffs.length > 0
                ? trip.Employees_Involved.some(staff =>
                    filters.Staffs.some(selected => selected.value === staff.Emp_Name)
                )
                : false;

            return hasFromGodownMatch || hasToGodownMatch || hasItemMatch || hasEmployeeMatch;
        });
    }, [tripData, filters]);

    const groupedTotals = selectedRow?.Products_List?.reduce((acc, item) => {
        const key = `${item.Retailer_Id}-${item.Trip_Id}`;
        if (!acc[key]) {
            acc[key] = {
                Retailer_Id: item.Retailer_Id,
                Trip_Id: item.Trip_Id,
                Retailer_Name: item.Retailers_Name,
                Total_Amount: 0,
            };
        }

        acc[key].Total_Amount += Number(item.Total_Value);
        return acc;
    }, {});

    const groupedEntries = Object.values(groupedTotals || {});

    return (
        <>
            <FilterableTable
                dataArray={(
                    filters.FromGodown.length > 0 ||
                    filters.ToGodown.length > 0 ||
                    filters.Staffs.length > 0 ||
                    filters.Items.length > 0
                ) ? filteredData : tripData}
                title="Trip Sheets"
                maxHeightOption
                ExcelPrintOption
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => nav('/erp/sales/Tripsheet/Tripsheetcreation')}
                        >Add</Button>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            ><FilterAlt /></IconButton>
                        </Tooltip>
                    </>
                }
                EnableSerialNumber
                initialPageCount={10}
                columns={[
                    createCol('Trip_Date', 'date', 'Date'),
                    createCol('Trip_No', 'string'),
                    createCol('Challan_No', 'string', 'Challan'),
                    createCol('Vehicle_No', 'string', 'Vehicle'),
                    createCol('Branch_Name', 'string', 'Branch'),
                    createCol('StartTime', 'time', 'Start Time'),
                    createCol('EndTime', 'time', 'End Time'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Time Taken',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const startTime = row?.StartTime ? new Date(row.StartTime) : '';
                            const endTime = row.EndTime ? new Date(row.EndTime) : '';
                            const timeTaken = (startTime && endTime) ? timeDuration(startTime, endTime) : '00:00';
                            return (
                                <span className="cus-badge bg-light">{timeTaken}</span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Distance',
                        isCustomCell: true,
                        Cell: ({ row }) => NumberFormat(Subraction(row?.Trip_EN_KM, row?.Trip_ST_KM))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Total Qty',
                        isCustomCell: true,
                        Cell: ({ row }) => row?.Products_List?.reduce((acc, product) => Addition(product.QTY ?? 0, acc), 0)
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Total Item',
                        isCustomCell: true,
                        Cell: ({ row }) => NumberFormat(row.Products_List.length ?? 0)
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions
                                buttonsData={[
                                    {
                                        name: 'Edit',
                                        icon: <Edit className="fa-14" />,
                                        onclick: () => nav('/erp/sales/Tripsheet/Tripsheetcreation', {
                                            state: {
                                                ...row,
                                                isEditable: false,
                                            },
                                        }),
                                    },
                                    {
                                        name: 'Short Preview',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => {
                                            setFilters(pre => ({ ...pre, shortPreviewDialog: true }));
                                            setSelectedRow(row);
                                        }
                                    },
                                    {
                                        name: 'Preview',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => {
                                            setFilters(pre => ({ ...pre, printPreviewDialog: true }));
                                            setSelectedRow(row);
                                        }
                                    },
                                ]}
                            />
                        )
                    }
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <>
                        {row?.Employees_Involved?.length > 0 && (
                            <table className="fa-14">
                                <tbody>
                                    <tr>
                                        <th className="py-1 px-2 border text-muted" colSpan={3}>Involved Employees</th>
                                    </tr>
                                    <tr>
                                        <th className="py-1 px-2 border text-muted">SNo</th>
                                        <th className="py-1 px-2 border text-muted">Name</th>
                                        <th className="py-1 px-2 border text-muted">Role</th>
                                    </tr>
                                    {row.Employees_Involved.map((o, i) => (
                                        <tr key={i}>
                                            <td className="py-1 px-2 border">{i + 1}</td>
                                            <td className="py-1 px-2 border">{o?.Emp_Name}</td>
                                            <td className="py-1 px-2 border">{o?.Cost_Category}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <FilterableTable
                            title="Items"
                            EnableSerialNumber
                            dataArray={Array.isArray(row.Products_List) ? row.Products_List : []}
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Reason',
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Reason ?? 'Delivery',
                                },

                                createCol('Product_Name', 'string', 'Item'),
                                createCol('HSN_Code', 'string'),
                                createCol('Retailers_Name', 'string'),
                                createCol('QTY', 'number', 'QTY'),

                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Tax',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        const cgstP = Number(row.Cgst_P) || 0;
                                        const sgstP = Number(row.Sgst_P) || 0;


                                        const taxValue = cgstP + sgstP;
                                        return taxValue.toFixed(2);
                                    },
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Total',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {

                                        const taxableValue = Number(row.Taxable_Value) || 0;
                                        const cgstP = Number(row.Cgst_P) || 0;
                                        const sgstP = Number(row.Sgst_P) || 0;


                                        const total = taxableValue + cgstP + sgstP;

                                        return total.toFixed(2);
                                    },
                                },
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Round off',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        const total = Number(row.Total_Value) || 0;


                                        const integerPart = Math.floor(total);
                                        const decimalPart = total - integerPart;

                                        let roundedTotal = integerPart;
                                        let roundOffDiff = 0;


                                        if (decimalPart >= 0.56 && decimalPart <= 0.99) {
                                            roundedTotal = integerPart + 1;
                                        } else if (decimalPart >= 0.05 && decimalPart <= 0.55) {
                                            roundedTotal = integerPart;
                                        } else if (decimalPart >= 0.00 && decimalPart <= 0.04) {
                                            roundedTotal = integerPart;
                                        }

                                        roundOffDiff = (roundedTotal - total).toFixed(2);

                                        return roundOffDiff > 0 ? `+${roundOffDiff}` : roundOffDiff;
                                    },
                                },

                                createCol('Taxable_Value', 'number'),
                                createCol('Branch', 'string', 'From'),
                                createCol('ToLocation', 'string', 'To'),
                            ]}
                            disablePagination
                            ExcelPrintOption
                        />
                    </>
                )}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='md'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Staffs</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Staffs}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Staffs: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueStaffs}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Staff"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Items</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Items}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Items: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueItems}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Items"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>


                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                    <Button
                        onClick={() => {
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate
                            };
                            updateQueryString(updatedFilters);
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={filters.shortPreviewDialog}
                onClose={() => setFilters(pre => ({ ...pre, shortPreviewDialog: false }))}
                maxWidth='xl' fullWidth
            >
                <DialogTitle>Print Preview</DialogTitle>
                <DialogContent ref={printRef}>
                    {isValidObject(selectedRow) && <React.Fragment>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="fa-12 bg-light">Retailer Name</th>
                                    <th className="fa-12 bg-light">Trip_No</th>
                                    <th className="fa-12 bg-light">Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {groupedEntries.length > 0 ? (
                                    groupedEntries.map((group, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr>

                                                <td className="fw-bold">{group.Retailer_Name}</td>


                                                <td className="fw-bold">{group.Trip_Id}</td>


                                                <td className="fw-bold text-end">{NumberFormat(group.Total_Amount)}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </React.Fragment>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, shortPreviewDialog: false }))}
                        variant="outlined"
                    >close</Button>

                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.printPreviewDialog}
                onClose={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                maxWidth='xl' fullWidth
            >
                <DialogTitle>Print Preview</DialogTitle>
                <DialogContent ref={printRef}>
                    {isValidObject(selectedRow) && <React.Fragment>


                        <table className="table table-bordered fa-13 m-0">
                            <tbody>
                                <tr>
                                    <td colSpan={3}>DELIVERY CHALLAN</td>
                                    <td colSpan={3}>GSTIN :33AAOCP0807F1ZN</td>
                                    <td colSpan={2}>ORIGINAL / DUPLICATE</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} rowSpan={2}>
                                        <span className="fa-14 fw-bold">PUKAL FOODS PRIVATE LIMITED</span> <br />
                                        6A, First Floor, North, Viswanadha puram, Main road,<br />
                                        Reserve Line, Viswanathapuram,
                                        , Madurai, Tamil Nadu 625014
                                    </td>
                                    <td colSpan={3}>FSSAI No :</td>
                                    <td>Challan No</td>
                                    <td>{selectedRow?.Challan_No}</td>

                                </tr>
                                <tr>
                                    <td colSpan={3}>Phone No: 9842131353, 9786131353</td>
                                    <td>Date</td>
                                    <td>{selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}</td>
                                </tr>
                                <tr>
                                    <td colSpan={8} className="text-center">Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work</td>
                                </tr>
                                <tr>
                                    <td>Vehicle No</td>
                                    <td>{selectedRow?.Vehicle_No}</td>
                                    <td>Driver Name</td>
                                    <td>
                                        {selectedRow?.Employees_Involved?.filter(staff => (
                                            staff?.Cost_Category === 'Driver'
                                        ))?.map(staff => staff?.Emp_Name).join(', ')}
                                    </td>
                                    <td>Start Time</td>
                                    <td>{selectedRow?.StartTime ? LocalTime(new Date(selectedRow.StartTime)) : ''}</td>
                                    <td>Start KM</td>
                                    <td>{selectedRow?.Trip_ST_KM}</td>
                                </tr>
                                <tr>
                                    <td>Trip No</td>
                                    <td>{selectedRow?.Trip_ST_KM}</td>
                                    <td>LoadMan</td>
                                    <td>
                                        {selectedRow?.Employees_Involved?.filter(staff => (
                                            staff?.Cost_Category === 'Load Man'
                                        ))?.map(staff => staff?.Emp_Name).join(', ')}
                                    </td>
                                    <td>End Time</td>
                                    <td>{selectedRow?.EndTime ? LocalTime(new Date(selectedRow.EndTime)) : ''}</td>
                                    <td>End KM</td>
                                    <td>{selectedRow?.Trip_ST_KM}</td>
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

                                </tr>
                            </thead>
                            <tbody>

                                {(Array.isArray(selectedRow?.Products_List) ? selectedRow.Products_List : []).sort(
                                    (a, b) => String(a.Trip_From).localeCompare(b.Trip_From)
                                ).map((item, index, array) => {
                                    const isFirstOccurrence =
                                        index === 0 || item.Trip_From !== array[index - 1]?.Trip_From;
                                    const rowSpan = array.filter((row) => row.Trip_From === item.Trip_From).length;

                                    return (
                                        <tr key={index}>
                                            <td className="fa-10">{index + 1}</td>

                                            {isFirstOccurrence && (
                                                <td className="fa-10 vctr" rowSpan={rowSpan}>
                                                    {item.Reason || "Delivery"}
                                                </td>
                                            )}


                                            <td className="fa-10">{item?.Retailers_Name}</td>
                                            <td className="fa-10">{item?.Retailers_Address}</td>

                                            <td className="fa-10">{item?.Product_Name}</td>
                                            <td className="fa-10">{item?.HSN_Code}</td>
                                            <td className="fa-10">{NumberFormat(item?.QTY)}</td>
                                            <td className="fa-10">{NumberFormat(item.KGS || 0)}</td>
                                            <td className="fa-10">{NumberFormat((item?.Taxable_Value) / (item.QTY))}</td>
                                            <td className="fa-10">{NumberFormat(item?.Taxable_Value)}</td>

                                        </tr>
                                    );
                                })}


                            </tbody>
                        </table>



                        <table className="table table-bordered">
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

                                {TaxData.map((o, i) => {
                                    return (
                                        <tr key={i}>
                                            <td className="fa-10 text-end">{o?.hsnCode}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.taxableValue)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.igst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.cgst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.sgst)}</td>
                                            <td className="fa-10 text-end">
                                                {NumberFormat(o?.totalTax)}
                                            </td>
                                        </tr>
                                    )
                                })}
                                <tr>
                                    <td className="border fa-10 text-end">Total</td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.taxableValue), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.igst), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.cgst), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.sgst), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0))}
                                    </td>
                                </tr>

                            </tbody>
                            <td
                                colSpan={6}
                                className='border fa-13 fw-bold'
                            >
                                Tax Amount (in words) : INR &nbsp;
                                {numberToWords(
                                    parseInt(
                                        TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0)
                                    )
                                )} only.
                            </td>
                        </table>

                        <table className="table table-bordered fa-10">
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
                                    <td>Round Off</td>
                                    <td>0</td>
                                    <td>Grand Total</td>
                                    <td className="fa-15 fw-bold">
                                        {NumberFormat((Array.isArray(selectedRow.Products_List) ? selectedRow.Products_List : []).reduce(
                                            (acc, item) => Addition(acc, item.Total_Value ?? 0), 0
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                            <td
                                colSpan={6}
                                className='col-12 Text-Center fa-15 fw-bold'
                            >
                                Tax Amount (in words) : INR &nbsp;
                                {numberToWords(
                                    parseInt(
                                        selectedRow.Products_List.reduce((sum, item) => sum += Number(item.Total_Value), 0)
                                    )
                                )} only.
                            </td>
                        </table>
                        <div className="col-12 text-center">
                            <p>This is a Computer Generated Invoice</p>
                        </div>

                    </React.Fragment>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
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


export default TripSheets;
