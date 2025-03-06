import { useEffect, useState } from "react";
import { ISOString, isValidDate } from '../../Components/functions';
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
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
    })

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/stockJournal/inwardsReport?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
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

export default StockInwards;