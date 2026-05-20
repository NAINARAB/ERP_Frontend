import { useEffect, useState } from "react";
import { isEqualNumber, ISOString, isValidDate, toNumber } from '../../Components/functions';
import FilterableTable, { createCol } from '../../Components/filterableTable2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { FilterAlt, Search, ShoppingCart } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const StockInwards = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [reportData, setReportData] = useState([]);
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
        const { fetchFrom, fetchTo, sourceGodown = '', destinationGodown = '' } = filters

        fetchLink({
            address: `inventory/stockJournal/inwardsReport?Fromdate=${fetchFrom}&Todate=${fetchTo}&sourceGodown=${sourceGodown}&destinationGodown=${destinationGodown}`,
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo, filters?.refresh])

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

    return (
        <>
            <FilterableTable
                headerFontSizePx={11}
                bodyFontSizePx={11}
                dataArray={reportData}
                title="Material Inwards"
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
                EnableSerialNumber
                ExcelPrintOption
                PDFPrintOption
                // initialPageCount={10}
                columns={[
                    createCol('Stock_Journal_date', 'date', 'Date'),
                    createCol('Journal_no', 'string', 'Journal number'),
                    createCol('destinationItemNameGet', 'string', 'Item'),
                    createCol('destinationGodownGet', 'string', 'Destination'),
                    createCol('sourceGodownGet', 'string', 'Source'),
                    createCol('bagsQuantity', 'number', 'Bags'),
                    createCol('Dest_Qty', 'number', 'Tonnage'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Source Validation',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <span 
                                className={` 
                                    rounded-3 px-2 py-1 fa-10 fw-bold text-white
                                    ${isEqualNumber(row?.Sour_Qty, row?.Dest_Qty) ? ' bg-success' : " bg-warning "}`}
                            >{isEqualNumber(row?.Sour_Qty, row?.Dest_Qty) ? 'Verified': 'Miss-Matched'}</span>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Actions',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <Tooltip>
                                <IconButton
                                    size="small"
                                ><ShoppingCart /></IconButton>
                            </Tooltip>
                        )
                    }
                ]}

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
                                <td>
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
                                <td>
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
                                Todate: filters?.Todate,
                            };
                            updateQueryString(updatedFilters);
                            closeDialog();
                            setFilters(pre => ({...pre, refresh: !pre.refresh}))
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default StockInwards;