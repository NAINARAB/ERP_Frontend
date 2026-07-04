import { useEffect, useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { isEqualNumber, ISOString, stringCompare } from '../../../Components/functions'
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import AppDialog from '../../../Components/appDialogComponent';
import { Dialog, DialogContent, DialogActions, Button, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { AutoGraph, FilterAlt, QueryStats, Search, Warehouse } from "@mui/icons-material";
import { batchListingColumns } from "./variable";
const IN_MODULES = ["PURCHASE", "PRODUCTION", "CREDIT_NOTE", "MATERIAL_INWARD"];
const OUT_MODULES = ["SALES", "CONSUMPTION", "DEBIT_NOTE", "OTHER_GODOWN"];

const BatchSummaryExpander = ({ row }) => {
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!row.id) {
            setLoading(false);
            return;
        }
        fetchLink({
            address: `inventory/batchMaster/batchTransactions?batch_id=${row.id}`
        }).then(data => {
            if (data.success && data.data.length > 0) {
                const txs = data.data[0].transaction || [];
                const sums = txs.reduce((acc, tx) => {
                    const type = tx.transType;
                    if (!acc[type]) acc[type] = 0;
                    acc[type] += Number(tx.batchQuantity) || 0;
                    return acc;
                }, {});
                setSummary(sums);
            }
            setLoading(false);
        }).catch(e => {
            console.error(e);
            setLoading(false);
        });
    }, [row.id]);

    if (loading) {
        return <div className="p-3 text-center"><CircularProgress size={24} /></div>;
    }

    const modules = Object.keys(summary);
    if (modules.length === 0) {
        return <div className="p-3 text-center text-muted">No transactions found.</div>;
    }

    return (
        <div className="p-3" style={{ backgroundColor: '#faf7f0', borderTop: '1px solid #d8d0c2' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: '#5b635c' }}>
                BATCH TRANSACTION SUMMARY
            </div>
            <div className="d-flex flex-wrap gap-3">
                {modules.map(mod => {
                    const isIn = IN_MODULES.includes(mod);
                    return (
                        <div 
                            key={mod} 
                            style={{ 
                                padding: '12px 16px', 
                                borderRadius: '12px', 
                                backgroundColor: isIn ? '#e8f5e9' : '#ffebee',
                                color: isIn ? '#2e7d32' : '#c62828',
                                border: `1px solid ${isIn ? '#a5d6a7' : '#ef9a9a'}`,
                                minWidth: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.05em' }}>
                                {mod.replace('_', ' ')}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                                {isIn ? '+' : '-'}{summary[mod].toLocaleString()}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const BatchListing = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const [dataArray, setDataArray] = useState([]);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        FilterFromDate: ISOString(),
        FilterTodate: ISOString(),
        dateBased: 'no',
        filterDialog: false,
    });
    const [filterDialog, setFilterDialog] = useState(false);

    useEffect(() => {

        fetchLink({
            address: `inventory/batchMaster/stockBalance?
            Fromdate=${dateFilter.Fromdate}&
            Todate=${dateFilter.Todate}&
            dateBased=${dateFilter.dateBased}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) setDataArray(data.data);
            else setDataArray([]);
        }).catch(e => console.error(e))

    }, [dateFilter.Fromdate, dateFilter.Todate, dateFilter.dateBased]);

    const propsColumns = batchListingColumns.map((col, colInd) => ({
        isVisible: colInd < 10 ? 1 : 0,
        Field_Name: col?.Field_Name,
        Fied_Data: col?.Fied_Data,
        ColumnHeader: col.ColumnHeader,
        OrderBy: colInd + 1
    }));

    const DisplayColumn = useMemo(() => {
        const columns = propsColumns.filter(
            col => (isEqualNumber(col?.Defult_Display, 1) || isEqualNumber(col?.isVisible, 1))
        );
        columns.push({
            Field_Name: 'action',
            Fied_Data: 'string',
            ColumnHeader: 'Trace',
            isVisible: 1,
            isCustomCell: true,
            align: 'center',
            Cell: ({ row }) => (
                <>
                    <IconButton
                        size="small"
                        color="primary"
                        title="Trace Batch"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/erp/batchManagement/batchReport', {
                                state: {
                                    batch: row.batch,
                                    item: { value: row.item_id, label: row.productNameGet },
                                    godown: row.godown_id ? { value: row.godown_id, label: row.godownName } : null
                                }
                            });
                        }}
                    >
                        <QueryStats fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/erp/batchManagement/batchTransaction', {
                                state: {
                                    batch_id: row.id,
                                    batch: row.batch,
                                    item: { value: row.item_id, label: row.productNameGet },
                                    godown: row.godown_id ? { value: row.godown_id, label: row.godownName } : null
                                }
                            });
                        }}
                        size="small"
                        color="primary"
                        title="Stock transaction"
                    >
                        <Warehouse />
                    </IconButton>
                </>
            )
        });
        return columns;
    }, [propsColumns, navigate]);

    const closeDialog = () => {
        setFilterDialog(false);
    }

    return (
        <>

            <AppTableComponent
                title="Batch Listing"
                EnableSerialNumber
                // onClickFun={(row) => setSelectedBatchRow(row)}
                ButtonArea={
                    <>
                        <Tooltip title="API Date Filters">
                            <IconButton
                                onClick={() => setFilterDialog(true)}
                                size="small"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </>
                }
                maxHeightOption
                ExcelPrintOption
                dataArray={dataArray}
                columns={DisplayColumn}
                isExpendable
                expandableComp={(props) => <BatchSummaryExpander {...props} />}
            />

            <Dialog
                open={filterDialog}
                onClose={closeDialog}
                maxWidth='sm' fullWidth
            >
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={dateFilter.FilterFromDate}
                                            onChange={e => setDateFilter({ ...dateFilter, FilterFromDate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={dateFilter.FilterTodate}
                                            onChange={e => setDateFilter({ ...dateFilter, FilterTodate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        <input
                                            className="form-check-input shadow-none pointer mx-2"
                                            style={{ padding: '0.7em' }}
                                            type="checkbox"
                                            id="applyDateFilterCheckBox"
                                            checked={stringCompare(dateFilter.dateBased, 'yes')}
                                            onChange={() => setDateFilter(pre => ({
                                                ...pre,
                                                dateBased: stringCompare(pre.dateBased, 'yes') ? 'no' : 'yes',
                                            }))}
                                        />
                                        <label htmlFor="applyDateFilterCheckBox" className="fw-bold">Apply Date Filters</label>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            closeDialog();
                            setDateFilter(pre => ({
                                ...pre,
                                Fromdate: dateFilter?.FilterFromDate,
                                Todate: dateFilter.FilterTodate,
                                dateBased: 'yes',
                            }));
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default BatchListing