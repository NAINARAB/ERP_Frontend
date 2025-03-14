import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Addition, filterableText, ISOString, isValidDate, NumberFormat, Subraction, timeDuration, toNumber } from "../../../Components/functions";
import { FilterAlt, Search } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";

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
        FromGodown: [],
        ToGodown: [],
        Items: []
    });

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/tripSheet/arrivalList?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
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
            const hasFromGodownMatch = filters.FromGodown.length > 0
                ? filters.FromGodown.some(selected => filterableText(selected.value) === filterableText(trip.FromLocation))
                : false;

            const hasToGodownMatch = filters.ToGodown.length > 0
                ? filters.ToGodown.some(selected => filterableText(selected.value) === filterableText(trip.ToLocation))
                : false;

            const hasItemMatch = filters.Items.length > 0
                ? filters.Items.some(selected => filterableText(selected.value) === filterableText(trip.Product_Name))
                : false;

            return hasFromGodownMatch || hasToGodownMatch || hasItemMatch;
        });
    }, [tripData, filters.FromGodown, filters.ToGodown, filters.Items]);

    const bgColor = (total = 0, current = 0) => {
        const isCompleted = toNumber(current) >= toNumber(total);
        const cls = isCompleted ? ' bg-success ' : toNumber(current) > 0 ? ' bg-warning ' : ' bg-info ';
        const str = isCompleted ? ' Completed ' : toNumber(current) > 0 ? ' SemiFinished ' : ' New ';
        return { cls, str }
    }

    return (
        <>

            <FilterableTable
                dataArray={(
                    filters.FromGodown.length > 0 ||
                    filters.ToGodown.length > 0 ||
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
                    </>
                }
                columns={[
                    createCol('Trip_Date', 'date', 'Date'),
                    createCol('Product_Name', 'string', 'Item'),
                    createCol('QTY', 'string', 'Weight'),
                    createCol('Batch_No', 'string', 'Batch'),
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Po-Orders',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => toNumber(row?.ConvertedOrders?.length)
                    // },
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'P-Invoices',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => toNumber(row?.ConvertedAsInvoices?.length)
                    // },
                    createCol('Vehicle_No', 'string', 'Vehicle'),
                    createCol('Challan_No', 'string', 'Challan'),
                    createCol('FromLocation', 'string', 'From'),
                    createCol('ToLocation', 'string', 'To'),
                    createCol('Narration', 'string', 'Narration'),
                    // createCol('StartTime', 'time', 'Start Time'),
                    // createCol('EndTime', 'time', 'End Time'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'P-Orders',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convertedWeight = row?.ConvertedAsOrders?.reduce((acc, order) => Addition(acc, order?.Weight), 0);
                            const { cls, str } = bgColor(row?.QTY, convertedWeight)
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${cls}`}>
                                    {str}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'P-Invoices',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convertedWeight = row?.ConvertedAsInvoices?.reduce((acc, order) => Addition(acc, order?.Bill_Qty), 0);
                            const { cls, str } = bgColor(row?.QTY, convertedWeight)
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${cls}`}>
                                    {str}
                                </span>
                            )
                        }
                    },
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
                                            isMulti
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
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, ToGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueToLocations}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select To Godown"}
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
        </>
    )
}


export default ArrivalList;