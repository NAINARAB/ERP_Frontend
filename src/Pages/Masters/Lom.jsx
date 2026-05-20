import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";
import { getSessionUser } from "../../Components/functions";
import {
    Card,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Switch,
    Paper,
    Button,
    Box,
    Typography,
    Divider,
    Collapse,
    TablePagination
} from "@mui/material";
import { ArrowOutward, KeyboardArrowDown, KeyboardArrowUp, OpenInNew } from "@mui/icons-material";

const Lom = ({ loadingOn, loadingOff }) => {
    const [erpDetails, setErpDetails] = useState([]);
    const [tallyData, setTallyData] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [columns, setColumns] = useState([]);
    // const [propsColumns, setPropsColumns] = useState([]);
    // const [selectedSource, setSelectedSource] = useState("ERP");
    const [expandedRows, setExpandedRows] = useState({});

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const [expandedPagination, setExpandedPagination] = useState({});

    const navigate = useNavigate();

    const navigationPaths = {
        "Cost Center": "/dataEntry/costCenter",
        "Cost Categories": "/userControl/CostCategory",
        "Ledger": "/erp/master/accountMaster",
        "Godown": "/erp/master/godown",
        "Group": "/erp/master/accountingGroup",
        "Stock": "/erp/master/products",
        "Voucher type": "/erp/master/voucherMaster",
        "Units": "/erp/master/uomMaster",
        "Brand": "/erp/master/brand",
        "Area": "/erp/master/areaMaster",
        "Pos Brand": "/erp/master/posMaster",
        "Route Master": "/erp/master/routeMaster",
        "Pos_Rate_Master": "/erp/master/RateMaster",
        "Stock_Los": "/erp/master/loslist",
        "Ledger Lol": "/erp/master/lollist",
        "Voucher Group": "/erp/master/voucherGroup",
        "Stock Group": "/erp/master/stockGroup",
        "Currency": "/erp/master/currency"
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleExpandedPageChange = (rowIndex, type, newPage) => {
        setExpandedPagination(prev => ({
            ...prev,
            [rowIndex]: {
                ...prev[rowIndex],
                [type]: {
                    ...prev[rowIndex]?.[type],
                    page: newPage
                }
            }
        }));
    };

    const handleExpandedRowsPerPageChange = (rowIndex, type, value) => {
        setExpandedPagination(prev => ({
            ...prev,
            [rowIndex]: {
                ...prev[rowIndex],
                [type]: {
                    ...prev[rowIndex]?.[type],
                    rowsPerPage: parseInt(value, 10),
                    page: 0
                }
            }
        }));
    };

    const toggleRowExpand = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));

        if (!expandedRows[index]) {
            setExpandedPagination(prev => ({
                ...prev,
                [index]: {
                    erp: { page: 0, rowsPerPage: 10 },
                    tally: { page: 0, rowsPerPage: 10 }
                }
            }));
        }
    };

    // const handleButtonClick = (data, source = "ERP") => {
    //     setSelectedSource(source);

    //     if (!data) return;

    //     const path = navigationPaths[data.master];
    //     if (path) {
    //         navigate(path);
    //         return;
    //     }

    //     if (!Array.isArray(data.columns)) {
    //         setColumns([]);
    //         setDialog(true);
    //         return;
    //     }

    //     const mappedColumns = data.columns.map((col, i) => ({
    //         Field_Name: col.COLUMN_NAME,
    //         isDefault: col.IS_NULLABLE === "NO",
    //         isVisible: true,
    //         OrderBy: i + 1,
    //     }));

    //     setColumns(mappedColumns);
    //     setPropsColumns(mappedColumns);
    //     setDialog(true);
    // };

    const renderMasterCell = (data, source) => {
        if (!data) return "-";

        const path = navigationPaths[data.master];
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {data.master || "-"}
                {path && (
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(path);
                        }}
                        sx={{ ml: 1 }}
                    >
                        <ArrowOutward color="primary" fontSize="small" />
                    </IconButton>
                )}
            </div>
        );
    };

    useEffect(() => {
        const user = getSessionUser().user;

        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();
                const [
                    erpResponse,
                    tallyResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/getDetails` }),
                    fetchLink({ address: `masters/getTallyData`, headers: { Db: user?.Company_id } })
                ]);

                setErpDetails(erpResponse.success ? erpResponse.data : []);
                setTallyData(tallyResponse.success ? tallyResponse.data : []);

                if (loadingOff) loadingOff();
            } catch (e) {
                console.error("Error fetching data:", e);
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, []);

    const renderTableRows = () => {
        const erpMap = new Map();
        erpDetails.forEach(item => {
            if (item?.master) {
                erpMap.set(item.master.trim().toLowerCase(), item);
            }
        });

        const tallyMap = new Map();
        tallyData.forEach(item => {
            if (item?.master) {
                tallyMap.set(item.master.trim().toLowerCase(), item);
            }
        });

        const allMasters = new Set([
            ...erpDetails.map(item => item.master?.trim().toLowerCase()),
            ...tallyData.map(item => item.master?.trim().toLowerCase())
        ].filter(Boolean));

        const rows = Array.from(allMasters).map((masterName, index) => ({
            erp: erpMap.get(masterName) || null,
            tally: tallyMap.get(masterName) || null,
            index: index + 1
        }));

        return rows.filter(row => row.erp !== null || row.tally !== null);
    };

    const renderExpandedContent = (row) => {
        const findMismatches = () => {
            if (!row.erp?.data || !row.tally?.data) return { erpMismatches: [], tallyMismatches: [] };

            const erpMap = new Map(row.erp.data.map(item => [String(item.Alter_Id), item]));
            const tallyMap = new Map(row.tally.data.map(item => [String(item.tally_id), item]));

            const erpOnly = row.erp.data.filter(item => !tallyMap.has(String(item.Alter_Id)));
            const tallyOnly = row.tally.data.filter(item => !erpMap.has(String(item.tally_id)));

            return {
                erpMismatches: erpOnly,
                tallyMismatches: tallyOnly
            };
        };


        const { erpMismatches, tallyMismatches } = findMismatches();

        const erpPagination = expandedPagination[row.index]?.erp || { page: 0, rowsPerPage: 5 };
        const tallyPagination = expandedPagination[row.index]?.tally || { page: 0, rowsPerPage: 5 };

        const paginatedErp = erpMismatches.slice(
            erpPagination.page * erpPagination.rowsPerPage,
            erpPagination.page * erpPagination.rowsPerPage + erpPagination.rowsPerPage
        );

        const paginatedTally = tallyMismatches.slice(
            tallyPagination.page * tallyPagination.rowsPerPage,
            tallyPagination.page * tallyPagination.rowsPerPage + tallyPagination.rowsPerPage
        );

        return (
            <tr>
                <td colSpan={7} style={{ padding: 0 }}>
                    <Collapse in={expandedRows[row.index]} timeout="auto" unmountOnExit>
                        <Box sx={{
                            display: 'flex',
                            p: 2,
                            backgroundColor: '#f9f9f9',
                            overflow: 'hidden',
                            width: '100%'
                        }}>
                            <Box sx={{
                                flex: 1,
                                pr: 2,
                                overflowX: 'auto',
                                minWidth: 0
                            }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    ERP Data (Missing in Tally) - {erpMismatches.length} records
                                </Typography>
                                {erpMismatches.length > 0 ? (
                                    <>
                                        <Paper elevation={0} sx={{
                                            p: 1,
                                            overflowX: 'auto',
                                            width: '100%',
                                            display: 'block'
                                        }}>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="table table-bordered" style={{
                                                    width: '100%',
                                                    minWidth: 'max-content'
                                                }}>
                                                    {/* <thead>
                                                        <tr>
                                                            {row.erp?.data?.[0] && Object.keys(row.erp.data[0]).map(key => (
                                                                <th key={key} style={{ whiteSpace: 'nowrap' }}>{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedErp.map((item, i) => (
                                                            <tr key={`erp-${i}`}>
                                                                {Object.values(item).map((value, j) => (
                                                                    <td key={j} style={{ whiteSpace: 'nowrap' }}>
                                                                        {typeof value === 'object' 
                                                                            ? JSON.stringify(value) 
                                                                            : String(value)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody> */}

                                                    <thead>
                                                        <tr>
                                                            {row.erp?.data?.[0] && Object.keys(row.erp.data[0]).slice(0, 6).map(key => (
                                                                <th key={key} style={{ whiteSpace: 'nowrap' }}>{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedErp.map((item, i) => (
                                                            <tr key={`erp-${i}`}>
                                                                {Object.entries(item).slice(0, 6).map(([key, value], j) => (
                                                                    <td key={j} style={{ whiteSpace: 'nowrap' }}>
                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>

                                                </table>
                                            </div>
                                        </Paper>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25]}
                                            component="div"
                                            count={erpMismatches.length}
                                            rowsPerPage={erpPagination.rowsPerPage}
                                            page={erpPagination.page}
                                            onPageChange={(e, newPage) => handleExpandedPageChange(row.index, 'erp', newPage)}
                                            onRowsPerPageChange={(e) => handleExpandedRowsPerPageChange(row.index, 'erp', e.target.value)}
                                            sx={{ borderTop: '1px solid #ddd' }}
                                        />
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        All ERP records match with Tally
                                    </Typography>
                                )}
                            </Box>

                            <Divider orientation="vertical" flexItem />

                            <Box sx={{
                                flex: 1,
                                pl: 2,
                                overflowX: 'auto',
                                minWidth: 0
                            }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Tally Data (Missing in ERP) - {tallyMismatches.length} records
                                </Typography>
                                {tallyMismatches.length > 0 ? (
                                    <>
                                        <Paper elevation={0} sx={{
                                            p: 1,
                                            overflowX: 'auto',
                                            // width: '100%',
                                            display: 'block'
                                        }}>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="table table-bordered" style={{
                                                    // width: '100%',
                                                    minWidth: 'max-content'
                                                }}>
                                                    {/* <thead>
                                                        <tr>
                                                            {row.tally?.data?.[0] && Object.keys(row.tally.data[0]).map(key => (
                                                                <th key={key} style={{ whiteSpace: 'nowrap' }}>{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedTally.map((item, i) => (
                                                            <tr key={`tally-${i}`}>
                                                                {Object.values(item).map((value, j) => (
                                                                    <td key={j} style={{ whiteSpace: 'nowrap' }}>
                                                                        {typeof value === 'object' 
                                                                            ? JSON.stringify(value) 
                                                                            : String(value)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody> */}


                                                    <thead>
                                                        <tr>
                                                            {row.tally?.data?.[0] && Object.keys(row.tally.data[0]).slice(0, 6).map(key => (
                                                                <th key={key} style={{ whiteSpace: 'nowrap' }}>{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedTally.map((item, i) => (
                                                            <tr key={`tally-${i}`}>
                                                                {Object.entries(item).slice(0, 6).map(([key, value], j) => (
                                                                    <td key={j} style={{ whiteSpace: 'nowrap' }}>
                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>

                                                </table>
                                            </div>
                                        </Paper>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25]}
                                            component="div"
                                            count={tallyMismatches.length}
                                            rowsPerPage={tallyPagination.rowsPerPage}
                                            page={tallyPagination.page}
                                            onPageChange={(e, newPage) => handleExpandedPageChange(row.index, 'tally', newPage)}
                                            onRowsPerPageChange={(e) => handleExpandedRowsPerPageChange(row.index, 'tally', e.target.value)}
                                            sx={{ borderTop: '1px solid #ddd' }}
                                        />
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        All Tally records match with ERP
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Collapse>
                </td>
            </tr>
        );
    };

    const rows = renderTableRows();
    const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <Card>
                <div className="px-3 py-2 fa-14">
                    <div className="d-flex flex-wrap align-items-center">
                        <h5 className="flex-grow-1">LOM</h5>
                    </div>
                </div>

                <Box sx={{
                    overflowX: 'auto',
                    width: '100%',
                    display: 'block'
                }}>
                    <table className="table table-bordered text-center" style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        minWidth: 'max-content'
                    }}>
                        <thead>
                            <tr>
                                <th colSpan="3" className="bg-light">ERP</th>
                                <th colSpan="3" className="bg-light">TALLY</th>
                            </tr>
                            <tr>
                                <th>#</th>
                                <th>MASTER NAME</th>
                                <th>COUNT</th>
                                <th>MASTER NAME</th>
                                <th>COUNT</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedRows.map((row, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td>{row.index}</td>
                                        <td>{renderMasterCell(row.erp, "ERP")}</td>
                                        <td>{row.erp?.count || "-"}</td>
                                        <td>{renderMasterCell(row.tally, "Tally")}</td>
                                        <td>{row.tally?.count || "-"}</td>
                                        <td className="p-0 text-center">
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleRowExpand(row.index)}
                                            >
                                                {expandedRows[row.index] ?
                                                    <KeyboardArrowUp /> :
                                                    <KeyboardArrowDown />}
                                            </IconButton>
                                            {row.erp?.page && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(row.erp.page)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            )}
                                        </td>
                                    </tr>
                                    {renderExpandedContent(row)}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                maxWidth="lg"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        minHeight: '60vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.contrastText,
                    py: 1.5
                }}>
                    {/* <span>Column Settings ({selectedSource})</span> */}
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 2,
                        p: 2,
                        overflowY: 'auto',
                        maxHeight: 'calc(60vh - 120px)'
                    }}>
                        {columns?.map((o, i) => (
                            <Card
                                key={i}
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: i % 2 !== 0 ? 'action.hover' : 'background.paper'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Switch
                                        checked={Boolean(o?.isDefault) || Boolean(o?.isVisible)}
                                        disabled={Boolean(o?.isDefault)}
                                        onChange={(e) =>
                                            setColumns((prev) =>
                                                prev.map((col) =>
                                                    col.Field_Name === o.Field_Name
                                                        ? { ...col, isVisible: e.target.checked ? 1 : 0 }
                                                        : col
                                                )
                                            )
                                        }
                                    />
                                    <Typography variant="body2" fontWeight="medium">
                                        {o?.Field_Name}
                                    </Typography>
                                </Box>

                                <Box
                                    component="input"
                                    type="number"
                                    value={o?.OrderBy || ""}
                                    onChange={(e) =>
                                        setColumns((prev) =>
                                            prev.map((col) =>
                                                col.Field_Name === o.Field_Name
                                                    ? { ...col, OrderBy: Number(e.target.value) }
                                                    : col
                                            )
                                        )
                                    }
                                    sx={{
                                        width: 80,
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        textAlign: 'center',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                    placeholder="Order"
                                />
                            </Card>
                        ))}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                        // onClick={() => setColumns(propsColumns)} 
                        variant="outlined"
                        color="primary"
                        sx={{ mr: 2 }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={() => setDialog(false)}
                        variant="contained"
                        color="primary"
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Lom;





