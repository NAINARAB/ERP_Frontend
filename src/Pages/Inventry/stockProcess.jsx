import { useEffect, useMemo, useState } from "react";
import { checkIsNumber, isEqualNumber, ISOString, isValidDate, Subraction } from '../../Components/functions';
import FilterableTable, { formatString } from '../../Components/filterableTable2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { FilterAlt, Search } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const transformStockJournalData = (data) => {
    let transformedData = [];

    data.forEach((entry, entryIndex) => {
        const maxRows = Math.max(entry?.SourceDetails?.length, entry?.DestinationDetails?.length, entry?.StaffsDetails?.length);

        const totalSourceQty = entry.SourceDetails.reduce((sum, item) => sum + (item.Sour_Qty || 0), 0);
        const totalDestinationQty = entry.DestinationDetails.reduce((sum, item) => sum + (item.Dest_Qty || 0), 0);

        const diffPercentage = totalSourceQty !== 0
            ? ((totalDestinationQty - totalSourceQty) / totalSourceQty) * 100
            : 0;

        transformedData.push({
            SNo: entryIndex + 1,
            Date: entry.Stock_Journal_date.split("T")[0],
            VoucherType: entry.Stock_Journal_Voucher_type,
            VoucherNo: entry.Journal_no,
            SourceItem: "",
            SourceGodown: "",
            SourceQty: totalSourceQty,
            DestinationItem: "",
            DestinationGodown: "",
            DestinationQty: totalDestinationQty,
            DifferentQTY: Subraction(totalDestinationQty, totalSourceQty),
            DifferentPercentage: diffPercentage,
            Staffs: ""
        });

        for (let i = 0; i < maxRows; i++) {
            transformedData.push({
                SNo: '',
                Date: '',
                VoucherType: '',
                VoucherNo: '',
                SourceItem: entry.SourceDetails[i]?.Product_Name || "",
                SourceGodown: entry.SourceDetails[i]?.Godown_Name || "",
                SourceQty: entry.SourceDetails[i]?.Sour_Qty || "",
                DestinationItem: entry.DestinationDetails[i]?.Product_Name || "",
                DestinationGodown: entry.DestinationDetails[i]?.Godown_Name || "",
                DestinationQty: entry.DestinationDetails[i]?.Dest_Qty || "",
                DifferentQTY: "",
                DifferentPercentage: "",
                Staffs: entry.StaffsDetails[i]?.Cost_Center_Name || "",
            });
        }
    });

    return transformedData;
};

const StockProcess = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [responseData, setResponseData] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        sourceGodown: "",
        destinationGodown: "",
        filterDialog: false,
        refresh: false,
    })

    useEffect(() => {
        fetchLink({
            address: `dataEntry/godownLocationMaster`
        }).then(data => {
            const godownLocations = (data.success ? data.data : []).sort(
                (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
            );
            setGodowns(godownLocations);
        })
    }, [])

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/stockJournal?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}&billType=PROCESSING`,
        }).then(data => {
            if (data.success) {
                // const filterForEmptyArrays = Array.isArray(data.data)
                //     ? data.data.filter(stj => !(
                //         stj?.SourceDetails?.length === 0
                //         && stj?.DestinationDetails?.length === 0
                //         && stj?.StaffsDetails?.length === 0
                //     ))
                //     : []
                setResponseData(data.data)
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo])

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
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters({
            ...filters,
            filterDialog: false,
        });
    }

    const filteredData = useMemo(() => {
        return responseData.filter((stj) => {
            const hasFromGodownMatch = filters.sourceGodown
                ? stj.SourceDetails.some((product) =>
                    isEqualNumber(filters.sourceGodown, product.Sour_Goodown_Id)
                )
                : true;

            const hasToGodownMatch = filters.destinationGodown
                ? stj.DestinationDetails.some((product) =>
                    isEqualNumber(filters.destinationGodown, product.Dest_Goodown_Id)
                )
                : true;

            return (
                hasFromGodownMatch &&
                hasToGodownMatch
            );
        });
    }, [
        filters.sourceGodown,
        filters.destinationGodown,
        responseData
    ]);

    const displayData = useMemo(() => {
        return (filters.sourceGodown || filters.destinationGodown)
            ? transformStockJournalData(filteredData)
            : transformStockJournalData(responseData)
    }, [filters.sourceGodown, filters.destinationGodown, filteredData, responseData])

    return (
        <>
            <FilterableTable
                headerFontSizePx={11}
                bodyFontSizePx={11}
                dataArray={displayData}
                title="PRODUCTIONS"
                maxHeightOption
                ButtonArea={
                    <>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            ><FilterAlt /></IconButton>
                        </Tooltip>
                    </>
                }
                ExcelPrintOption
                PDFPrintOption
                columns={[
                    { col: 'SNo', type: 'string', title: 'Sno' },
                    { col: 'Date', type: 'date', title: 'Date' },
                    { col: 'VoucherNo', type: 'string', title: 'Vch.No' },
                    { col: 'VoucherType', type: 'string', title: 'Voucher' },
                    { col: 'SourceItem', type: 'string', title: 'Consumption' },
                    { col: 'SourceGodown', type: 'string', title: 'From' },
                    { col: 'SourceQty', type: 'number', title: 'C.Tonnage' },
                    { col: 'DestinationItem', type: 'string', title: 'Productions' },
                    { col: 'DestinationGodown', type: 'string', title: 'To' },
                    { col: 'DestinationQty', type: 'number', title: 'P.Tonnage' },
                    { col: 'DifferentQTY', type: 'number', title: 'Diff' },
                    { col: 'DifferentPercentage', type: 'number', title: 'Diff (%)' },
                    { col: 'Staffs', type: 'string', title: 'Staffs' }
                ].map(cel => ({
                    isVisible: 1,
                    ColumnHeader: cel.title,
                    isCustomCell: true,
                    Cell: ({ row }) => formatString(row[cel.col], cel.type),
                    tdClass: ({ row }) => checkIsNumber(row?.SNo) ? 'fw-bold bg-light' : ''
                }))}
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
                            <tr>
                                <td style={{ verticalAlign: 'middle' }}>From</td>
                                <td className="py-1">
                                    <input
                                        type="date"
                                        value={filters.Fromdate}
                                        onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                        className="cus-inpt p-2"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: 'middle' }}>To</td>
                                <td className="py-1">
                                    <input
                                        type="date"
                                        value={filters.Todate}
                                        onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                        className="cus-inpt p-2"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: 'middle' }}>Source Godown</td>
                                <td className="py-1">
                                    <select
                                        value={filters.sourceGodown}
                                        onChange={e => setFilters(pre => ({ ...pre, sourceGodown: e.target.value }))}
                                        className="cus-inpt p-2"
                                    >
                                        <option value="">All Godown</option>
                                        {godowns.map((g, gi) => (
                                            <option value={g.Godown_Id} key={gi}>{g.Godown_Name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: 'middle' }}>Destination Godown</td>
                                <td className="py-1">
                                    <select
                                        value={filters.destinationGodown}
                                        onChange={e => setFilters(pre => ({ ...pre, destinationGodown: e.target.value }))}
                                        className="cus-inpt p-2"
                                    >
                                        <option value="">All Godown</option>
                                        {godowns.map((g, gi) => (
                                            <option value={g.Godown_Id} key={gi}>{g.Godown_Name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
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

export default StockProcess;