import { useEffect, useState } from "react";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { ISOString, isValidDate, Subraction } from "../../../Components/functions";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ClearAll, FilterAlt, Search } from "@mui/icons-material";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const PaymentReference = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        refresh: false,
        filterDialog: false,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, Fromdate: queryFilters.Fromdate, Todate: queryFilters.Todate }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
            setFilters(pre => ({
                ...pre,
                Fromdate: ISOString(stateDetails.Fromdate),
                Todate: stateDetails.Todate
            }));
        }
    }, [stateDetails])

    useEffect(() => {
        fetchLink({
            address: `payment/reports/pendingReference?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).catch(e => console.log(e))
    }, [filters.refresh])

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters(pre => ({
            ...pre,
            filterDialog: false,
        }));
    }

    const refreshData = () => {
        setFilters(pre => ({
            ...pre,
            refresh: !pre.refresh,
        }));
    }


    return (
        <>
            <FilterableTable
                title="Pending Reference"
                headerFontSizePx={13}
                bodyFontSizePx={12}
                dataArray={reportData}
                ButtonArea={
                    <>
                        <IconButton
                            onClick={() => setFilters(pre => ({...pre, filterDialog: true}))}
                        ><FilterAlt /></IconButton>
                    </>
                }
                columns={[
                    createCol('payment_invoice_no', 'string', 'PaymentID'),
                    createCol('payment_date', 'date', 'Date'),
                    createCol('debit_ledger_name', 'string', 'Debit Acc'),
                    createCol('credit_ledger_name', 'string', 'Credit Acc'),
                    createCol('debit_amount', 'number', 'Payed'),
                    createCol('total_referenced', 'number', 'Reference added'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Pending Reference',
                        isCustomCell: true,
                        Cell: ({ row }) => Subraction(row.debit_amount, row.total_referenced)
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
                            <tbody>

                                {/* from date */}
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

                                {/* to date */}
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
                <DialogActions className="d-flex align-items-center justify-content-between">
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setFilters(pre => ({
                                ...pre,
                                ...defaultFilters
                            }))
                        }}
                        startIcon={<ClearAll />}
                    >clear</Button>
                    <span>
                        <Button onClick={closeDialog}>close</Button>
                        <Button
                            onClick={() => {
                                closeDialog();
                                const updatedFilters = {
                                    Fromdate: filters?.Fromdate,
                                    Todate: filters?.Todate
                                };
                                updateQueryString(updatedFilters);
                                refreshData();
                            }}
                            startIcon={<Search />}
                            variant="contained"
                        >Search</Button>
                    </span>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PaymentReference;