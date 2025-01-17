import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Addition, ISOString, isValidDate, isValidObject, LocalDate, LocalTime, NumberFormat, Subraction, timeDuration } from "../../../Components/functions";
import { Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";

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
    });
    const [selectedRow, setSelectedRow] = useState(null);


    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/tripSheet?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
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

    return (
        <>

            <FilterableTable
                dataArray={tripData}
                title="Trip Sheets"
                maxHeightOption
                ExcelPrintOption
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => nav('/erp/inventory/tripSheet/searchGodown')}
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
                    createCol('Branch_Name', 'string', 'Journal number'),
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
                                        onclick: () => nav('/erp/inventory/tripSheet/searchGodown', {
                                            state: {
                                                ...row,
                                                isEditable: false,
                                            },
                                        }),
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
                    <FilterableTable
                        title="Items"
                        EnableSerialNumber
                        dataArray={Array.isArray(row.Products_List) ? row.Products_List : []}
                        columns={[
                            {
                                isVisible: 1,
                                ColumnHeader: 'Reason',
                                isCustomCell: true,
                                Cell: ({ row }) => row.Stock_Journal_Bill_type ?? 'Not Available',
                            },
                            createCol('Batch_No', 'string'),
                            createCol('Product_Name', 'string', 'Item'),
                            createCol('HSN_Code', 'string'),
                            createCol('QTY', 'number'),
                            createCol('KGS', 'number'),
                            createCol('Gst_Rate', 'number'),
                            createCol('Total_Value', 'number'),
                            createCol('FromLocation', 'string', 'From'),
                            createCol('ToLocation', 'string', 'To'),
                        ]}
                        disablePagination
                        ExcelPrintOption
                    />
                )}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
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
                                </tr>

                                <tr>
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
                open={filters.printPreviewDialog}
                onClose={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                maxWidth='xl' fullWidth
            >
                <DialogTitle>Print Preview</DialogTitle>
                <DialogContent>
                    {isValidObject(selectedRow) && <React.Fragment>
                        <h3 className="mt-2 text-center">DELIVERY CHALLAN</h3>
                        <div className="d-flex border my-2 align-items-center">
                            <div class="text-center my-3 fw-bold flex-grow-1 p-2">
                                <p>S.M TRADERS</p>
                                <p>746-A, PULIYUR, SAYANAPURAM, SIVAGANGAI - 630611</p>
                                <p>GST No: 33AADFS4987M1ZL</p>
                            </div>
                            <div className="p-2">
                                <h5>ORIGINAL / DUPLICATE</h5>
                                <p>Challan No: &emsp;&emsp;{NumberFormat(selectedRow.Challan_No ?? ' -')}</p>
                                <p>Date: &emsp;&emsp; {selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}</p>
                                <p>GST No: 33AADFS4987M1ZL</p>
                            </div>
                        </div>

                        <div className="border p-2">
                            <table class="table">
                                <tr>
                                    <td colSpan={4}>Details of Recipient / Supplier / Consignee</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}></td>
                                    <td>Mode of Transport: </td>
                                    <td>By Road</td>
                                </tr>
                                <tr>
                                    <td>Name:</td>
                                    <td>S.M TRADERS</td>
                                    <td>Vehicle No: </td>
                                    <td>{selectedRow.Vehicle_No ?? ' -'}</td>
                                </tr>
                                <tr>
                                    <td>Address: </td>
                                    <td>157, CHITRAKARA STREET, EAST MASI STREET, MADURAI - 625001</td>
                                    <td>Driver Name:  </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>GSTIN:</td>
                                    <td>33AADFS4987M1ZL</td>
                                    <td>Date of Supply: </td>
                                    <td>{selectedRow.Delivery_Date ? LocalDate(selectedRow.Delivery_Date) : ''}</td>
                                </tr>
                                <tr>
                                    <td>State: </td>
                                    <td>Tamilnadu</td>
                                    <td>Time of Supply: </td>
                                    <td>{selectedRow.Delivery_Date ? LocalTime(selectedRow.Delivery_Date) : ''}</td>
                                </tr>
                                <tr>
                                    <td>State Code: </td>
                                    <td></td>
                                    <td>Place of Supply: </td>
                                    <td></td>
                                </tr>
                            </table>
                        </div>

                        <FilterableTable
                            title="Items"
                            EnableSerialNumber
                            dataArray={Array.isArray(selectedRow.Products_List) ? selectedRow.Products_List : []}
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Reason',
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Stock_Journal_Bill_type ?? 'Not Available',
                                },
                                createCol('Batch_No', 'string'),
                                createCol('Product_Name', 'string', 'Item'),
                                createCol('HSN_Code', 'string'),
                                createCol('QTY', 'number'),
                                createCol('KGS', 'number'),
                                createCol('Gst_Rate', 'number'),
                                createCol('Total_Value', 'number'),
                                createCol('FromLocation', 'string', 'From'),
                                createCol('ToLocation', 'string', 'To'),
                            ]}
                            disablePagination
                            ExcelPrintOption
                        />
                    </React.Fragment>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                        variant="outlined"
                    >close</Button>
                </DialogActions>
            </Dialog>


        </>
    )
}


export default TripSheets;