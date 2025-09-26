import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Addition, checkIsNumber, filterableText, isEqualNumber, ISOString, isValidDate, toNumber } from "../../../Components/functions";
import { Edit, FilterAlt, Search } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import CreateArrival from "./createArrival";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const ArrivalList = ({ loadingOn, loadingOff }) => {

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
        FromGodown: { label: 'Select Godown', value: '' },
        ToGodown: { label: 'Select Godown', value: '' },
        Items: [],
        TripConvertion: { label: 'ALL', value: '' },
        addDialog: false
    });

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/tripSheet/arrivalEntry?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {
                setTripData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo, filters?.refresh]);

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

    const uniqueFromLocations = useMemo(() => {
        const allLocations = tripData.map((product) => product.FromLocation);
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [tripData]);

    const uniqueToLocations = useMemo(() => {
        const allLocations = tripData.map((product) => product.ToLocation);
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [tripData]);

    const uniqueItems = useMemo(() => {
        const allItems = tripData.map((product) => product.Product_Name);
        return [...new Set(allItems)].map(items => ({
            value: items,
            label: items,
        }));
    }, [tripData]);

    const filteredData = useMemo(() => {
        return tripData.filter(trip => {
            const selectedFromGodown = filters.FromGodown?.value || null;
            const selectedToGodown = filters.ToGodown?.value || null;
            const selectedItems = filters.Items || [];
            const convertedAsTrip = filters.TripConvertion?.value !== '';
            const convertedStatus = filters.TripConvertion?.value

            const hasConverted = convertedAsTrip
                ? convertedStatus === 'Converted' ? checkIsNumber(trip?.Trip_Id) : !checkIsNumber(trip?.Trip_Id)
                : false;

            const hasFromGodownMatch = selectedFromGodown
                ? filterableText(selectedFromGodown) === filterableText(trip.FromLocation)
                : false;

            const hasToGodownMatch = selectedToGodown
                ? filterableText(selectedToGodown) === filterableText(trip.ToLocation)
                : false;

            const hasItemMatch = selectedItems.length > 0
                ? selectedItems.some(item =>
                    filterableText(item.value) === filterableText(trip.Product_Name)
                )
                : false;

            if (selectedFromGodown && selectedToGodown && selectedItems.length > 0) {
                return hasFromGodownMatch && hasToGodownMatch && hasItemMatch;
            }

            if (selectedFromGodown && selectedToGodown) {
                return hasFromGodownMatch && hasToGodownMatch;
            }

            if (selectedFromGodown && selectedItems.length > 0) {
                return hasFromGodownMatch && hasItemMatch;
            }

            if (selectedToGodown && selectedItems.length > 0) {
                return hasToGodownMatch && hasItemMatch;
            }

            return hasConverted && (hasFromGodownMatch || hasToGodownMatch || hasItemMatch);
        });
    }, [tripData, filters.FromGodown, filters.ToGodown, filters.Items, filters.TripConvertion]);

    const bgColor = (total = 0, current = 0) => {
        const isCompleted = toNumber(current) >= toNumber(total);
        const cls = isCompleted ? ' bg-success ' : toNumber(current) > 0 ? ' bg-warning ' : ' bg-info ';
        const str = isCompleted ? ' Completed ' : toNumber(current) > 0 ? ' SemiFinished ' : ' New ';
        return { cls, str }
    }

    const EditComp = ({ row }) => {
        const [open, setOpen] = useState(false);

        return !checkIsNumber(row?.Trip_Id) && (
            <>
                <IconButton onClick={() => setOpen(true)}>
                    <Edit className="fa-20" />
                </IconButton>

                {open && (
                    <CreateArrival
                        productValue={{ ...row, dialog: open }}
                        open={open}
                        close={() => setOpen(false)}
                        onSubmit={() => {
                            setOpen(false);
                            setFilters(pre => ({ ...pre, refresh: !pre.refresh }));
                        }}
                        loadingOff={loadingOff} loadingOn={loadingOn}
                    >
                        {/* H */}
                    </CreateArrival>
                )}
            </>
        );
    };

    return (
        <>

            <FilterableTable
                dataArray={(
                    filters.FromGodown.value ||
                    filters.ToGodown.value ||
                    filters.Items.length > 0
                ) ? filteredData : tripData}
                title="Arrival List"
                maxHeightOption
                ExcelPrintOption
                EnableSerialNumber
                initialPageCount={10}
                headerFontSizePx={13}
                bodyFontSizePx={11}
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                        ><FilterAlt /></IconButton>
                        <CreateArrival
                            onSubmit={() => setFilters(pre => ({ ...pre, refresh: !pre.refresh }))}
                            open={filters.addDialog}
                            close={() => setFilters(pre => ({ ...pre, addDialog: false }))}
                            loadingOff={loadingOff} loadingOn={loadingOn}
                        >
                            <Button onClick={() => setFilters(pre => ({ ...pre, addDialog: true }))}>
                                Add
                            </Button>
                        </CreateArrival>
                    </>
                }
                columns={[
                    createCol('Arrival_Date', 'date', 'Date'),
                    createCol('Product_Name', 'string', 'Item'),
                    createCol('QTY', 'string', 'Weight'),
                    createCol('Gst_Rate', 'string', 'Rate'),
                    createCol('Batch_No', 'string', 'Batch'),
                    createCol('FromLocation', 'string', 'From'),
                    createCol('ToLocation', 'string', 'To'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Trip-?',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const Trip_Id = checkIsNumber(row?.Arrival_Id)
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${Trip_Id ? 'bg-success' : 'bg-warning'}`}>
                                    {Trip_Id ? 'Converted' : 'Not'}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'P-Orders',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            // const convertedWeight = row?.ConvertedAsOrders?.reduce((acc, order) => Addition(acc, order?.Weight), 0);
                            // const { cls, str } = bgColor(row?.QTY, convertedWeight)
                            const order = isEqualNumber(row?.ConvertedAsOrder, 1);
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${order ? ' bg-success ' : ' bg-warning '}`}>
                                    {order ? 'Converted' : 'Not'}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'P-Invoices',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            // const convertedWeight = row?.ConvertedAsInvoices?.reduce((acc, order) => Addition(acc, order?.Bill_Qty), 0);
                            // const { cls, str } = bgColor(row?.QTY, convertedWeight)
                            const invoice = isEqualNumber(row?.ConvertedAsInvoice, 1);
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${invoice ? ' bg-success ' : ' bg-warning '}`}>
                                    {invoice ? 'Converted' : 'Not'}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => <EditComp row={row} />
                    }
                ]}
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

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.FromGodown}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, FromGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueFromLocations}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select From Godown"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.ToGodown}
                                            onChange={(selectedOptions) => {
                                                setFilters((prev) => ({ ...prev, ToGodown: selectedOptions }))
                                            }}
                                            menuPortalTarget={document.body}
                                            options={uniqueToLocations}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select To Godown"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Trip Convertion</td>
                                    <td colSpan={3}>
                                        <select
                                            value={filters.TripConvertion}
                                            onChange={e => setFilters(pre => ({ ...pre, TripConvertion: e.target.value }))}
                                            className="cus-inpt p-2"
                                        >
                                            <option value="">ALL</option>
                                            <option value="Converted">Converted</option>
                                            <option value="Not Converted">Not Converted</option>
                                        </select>
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
        </>
    )
}


export default ArrivalList;