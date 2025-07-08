import React, { useEffect, useState, useMemo } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";
import {
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Card,
    CircularProgress,
    InputAdornment,
    Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    Settings as SettingsIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    ArrowUpward as AscIcon,
    ArrowDownward as DescIcon,
    FilterList as FilterIcon,
    Cancel as CancelIcon,
    Save as SaveIcon,
    Edit as EditIcon,
    Download as DownloadIcon,
    Upload as FileUploadIcon,
} from "@mui/icons-material";
import { getSessionUser } from "../../Components/functions";
import * as XLSX from "xlsx";
import api from "../../API";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#EDF0F7",
        color: "#000000",
        fontWeight: "bold",
        borderRight: "1px solid #e0e0e0",
        "&:last-child": {
            borderRight: "none",
        },
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        padding: "12px 16px",
        borderRight: "1px solid #e0e0e0",
        "&:last-child": {
            borderRight: "none",
        },
    },
}));

const StyledTableRow = styled(TableRow)(({ highlight }) => ({
    backgroundColor: highlight ? "#84EAB3" : "#fff",
    ...(highlight && {
        borderLeft: "4px solid #1976d2",
    }),
    "&:hover": {
        backgroundColor: highlight ? "#84EAB5" : "#f5f5f5",
    },
}));

const PaginationContainer = styled("div")({
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f5f5f5",
    borderTop: "1px solid #e0e0e0",
});

const PROTECTED_COLUMNS = [
    "Auto_Id",
    "Ledger_Tally_Id",
    "Ledger_Name",
    "Ledger_Alias",
    "Actual_Party_Name_with_Brokers",
];

function Lollist() {
    const [lolData, setLolData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [columnSettings, setColumnSettings] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [originalColumnSettings, setOriginalColumnSettings] = useState([]);
    const [columnDropDown, setColumnDropDown] = useState([]);
    const [allData, setAllData] = useState([]);
    const [isApplying, setIsApplying] = useState(false);
    const [searchValues, setSearchValues] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const [globalSearch, setGlobalSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedData, setEditedData] = useState({});
    const user = getSessionUser().user;
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchColumnData = async () => {
        try {
            const dropData = await fetchLink({
                address: `masters/columns/dropDown?company_id=${parseData?.companyId}`,
            });

            if (dropData.success) {
                setColumnDropDown(dropData.data);
            }
        } catch (error) {
            console.error("Error fetching columns:", error);
        }
    };

    useEffect(() => {
        fetchColumnData();
    }, [parseData?.companyId]);

    useEffect(() => {
        async function fetchData() {
            try {
                const columnRes = await fetchLink({
                    address: `masters/displayColumn?company_id=${parseData?.companyId}`,
                });

                if (!columnRes.success || !Array.isArray(columnRes.data)) {
                    console.error("No display columns found");
                    return;
                }

                const sortedColumns = [...columnRes.data].sort(
                    (a, b) => a.Position - b.Position
                );
                setColumnSettings(sortedColumns);
                setOriginalColumnSettings([...sortedColumns]);

                const visibleColumns = sortedColumns
                    .filter(
                        (col) =>
                            col.status === 1 &&
                            !["Auto_Id", "Ledger_Tally_Id"].includes(col.ColumnName)
                    )
                    .sort((a, b) => a.Position - b.Position)
                    .map((col) => ({
                        header: col.Alias_Name || col.ColumnName,
                        accessor: col.ColumnName,
                        position: col.Position,
                    }));
                setColumns(visibleColumns);

                const dataRes = await fetchLink({ address: `masters/getlolDetails` });

                if (dataRes.success && Array.isArray(dataRes.data)) {
                    setAllData(dataRes.data);

                    const allowedKeys = visibleColumns.map((col) => col.accessor);
                    const filteredData = dataRes.data.map((row) => {
                        const filteredRow = {};
                        allowedKeys.forEach((key) => {
                            filteredRow[key] = row[key] || "";
                        });
                        return filteredRow;
                    });

                    setLolData(filteredData);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        }

        fetchData();
    }, [data]);

    const handlePositionChange = (columnId, newPosition) => {
        const positionValue = parseInt(newPosition);

        if (!isNaN(positionValue)) {
            setColumnDropDown((prev) =>
                prev.map((col) =>
                    col.Id === columnId ? { ...col, Position: positionValue } : col
                )
            );
        }
    };

    const handleAliasChange = (columnId, newAlias) => {
        setColumnDropDown((prev) =>
            prev.map((col) =>
                col.Id === columnId ? { ...col, Alias_Name: newAlias } : col
            )
        );
    };

    const getColumnStatus = (columnId) => {
        const column = columnSettings.find((col) => col.Id === columnId);
        return column ? column.status === 1 : false;
    };

    const handleColumnToggle = (columnId, isChecked) => {
        const column = columnDropDown.find((col) => col.Id === columnId);

        if (column?.Position <= 5) {
            toast.error("First 5 columns cannot be disabled");
            return;
        }

        let updatedSettings;

        if (columnSettings.some((col) => col.Id === columnId)) {
            updatedSettings = columnSettings.map((col) =>
                col.Id === columnId ? { ...col, status: isChecked ? 1 : 0 } : col
            );
        } else {
            const newColumn = columnDropDown.find((col) => col.Id === columnId);
            if (newColumn) {
                updatedSettings = [
                    ...columnSettings,
                    {
                        ...newColumn,
                        status: isChecked ? 1 : 0,
                    },
                ];
            } else {
                updatedSettings = [...columnSettings];
            }
        }

        updatedSettings.sort((a, b) => a.Position - b.Position);
        setColumnSettings(updatedSettings);
    };

    const handleEditClick = (rowData) => {
        // setCurrentRowData(rowData);
        setEditedData({ ...rowData });
        setEditDialogOpen(true);
    };

    const handleSaveChanges = async () => {
        try {
            const updateResponse = await fetchLink({
                address: "masters/updateDetails",
                method: "PUT",
                bodyData: editedData,
                headers: {
                    Db: user?.Company_id,
                },
            });

            if (!updateResponse.success) {
                throw new Error(updateResponse.message || "Failed to update row");
            }

            setAllData((prevData) =>
                prevData.map((row) =>
                    row.Auto_Id === editedData.Auto_Id ? editedData : row
                )
            );

            setLolData((prevData) =>
                prevData.map((row) =>
                    row.Auto_Id === editedData.Auto_Id ? editedData : row
                )
            );

            setEditDialogOpen(false);
            toast.success("Data updated successfully");
        } catch (error) {
            console.error("Error updating row:", error);
            toast.error("Failed to update row");
        }
    };

    const applyColumnChanges = async () => {
        setIsApplying(true);
        try {
            const updatedSettings = columnSettings.map((col) => {
                const dropdownCol = columnDropDown.find((dc) => dc.Id === col.Id);
                return dropdownCol
                    ? {
                        ...col,
                        Position: dropdownCol.Position,
                        Alias_Name: dropdownCol.Alias_Name,
                    }
                    : col;
            });

            const positionMap = {};
            const duplicatePositions = new Set();

            updatedSettings.forEach((col) => {
                if (positionMap[col.Position]) {
                    duplicatePositions.add(col.Position);
                }
                positionMap[col.Position] = true;
            });

            if (duplicatePositions.size > 0) {
                const positionsList = Array.from(duplicatePositions).join(", ");
                toast.error(`Duplicate positions found: ${positionsList}`);
                return;
            }

            setColumnSettings(updatedSettings);
            setOriginalColumnSettings(updatedSettings);

            const updateResponse = await fetchLink({
                address: "masters/updateColumnChanges",
                method: "PUT",
                bodyData: {
                    columns: updatedSettings.map((col) => ({
                        id: col.Id,
                        status: col.status,
                        position: col.Position,
                        alias_name: col.Alias_Name,
                        column_name: col.ColumnName,
                    })),
                    company_id: parseData?.companyId,
                },
            });

            if (!updateResponse.success) {
                throw new Error(
                    updateResponse.message || "Failed to update column statuses"
                );
            }

            const visibleColumns = updatedSettings
                .filter((col) => col.status === 1)
                .sort((a, b) => a.Position - b.Position)
                .map((col) => ({
                    header: col.Alias_Name || col.ColumnName,
                    accessor: col.ColumnName,
                    position: col.Position,
                }));

            setColumns(visibleColumns);

            if (allData.length > 0) {
                const allowedKeys = visibleColumns.map((col) => col.accessor);
                const filteredData = allData.map((row) => {
                    const filteredRow = {};
                    allowedKeys.forEach((key) => {
                        filteredRow[key] = row[key] || "";
                    });
                    return filteredRow;
                });
                setLolData(filteredData);
            }

            setDialogOpen(false);
            toast.success("Changes Saved");
        } catch (error) {
            console.error("Error updating column statuses:", error);
            toast.error(
                error.message || "Failed to update columns. Please try again."
            );
        } finally {
            setIsApplying(false);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedFile(null);
        setIsLoading(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            alert("File size exceeds 5MB");
            return;
        }
        setSelectedFile(file);
    };

    const uploadExcelFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("company_id", parseData?.Company_id);
            formData.append("Created_By", parseData?.UserId);
            formData.append("isRetailer", "1");

            console.log("FormData contents:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value instanceof File ? `File: ${value.name}` : value);
            }
            const response = await fetch(`${api}masters/uploadExcel`, {
                method: "POST",
                body: formData,
                headers: {
                    Db: user?.Company_id,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Upload failed");
            }

            const result = await response.json();
            setIsLoading(false);
            return result;
        } catch (error) {
            setIsLoading(false);
            console.error("Upload Error:", {
                message: error.message,
                stack: error.stack,
                time: new Date().toISOString(),
            });
            throw new Error(`Upload failed: ${error.message}`);
        }
    };

    const exportSelectedRowsToExcel = (columns, selectedRows) => {
        try {
            if (!Array.isArray(columns) || !Array.isArray(selectedRows)) {
                throw new Error(
                    "Invalid data: columns and selectedRows must be arrays"
                );
            }

            const filteredColumns = columns.filter(
                (col) =>
                    col.accessor !== "Auto_Id" && col.accessor !== "Ledger_Tally_Id"
            );

            const headers = filteredColumns.map((col) => {
                if (typeof col.header !== "string") {
                    console.warn("Missing or invalid header for column:", col);
                    return "UNNAMED_COLUMN";
                }
                return col.header;
            });

            const rowData = selectedRows.map((row) =>
                filteredColumns.map((col) => row[col.accessor] ?? "")
            );

            const excelData = [headers, ...rowData];

            const ws = XLSX.utils.aoa_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "SelectedData");

            const timestamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `selected_data_${timestamp}.xlsx`);
        } catch (error) {
            console.error("Excel export failed:", error);
            alert(`Export failed: ${error.message}`);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setIsLoading(true);
            await uploadExcelFile(selectedFile);
            handleClose();
            setData((prev) => !prev);
            toast.success("File uploaded successfully");
        } catch (error) {
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const resetToDefaults = () => {
        setColumnSettings([...originalColumnSettings]);
        setColumnDropDown([...originalColumnSettings]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getPageSizeOptions = () => {
        const baseOptions = [5, 10, 15, 30, 60, 120, 240];
        const maxOption = Math.max(...baseOptions);

        if (lolData.length > maxOption) {
            return [...baseOptions];
        }
        return baseOptions;
    };

    const handleSearchChange = (columnName, value) => {
        setSearchValues((prev) => ({
            ...prev,
            [columnName]: value,
        }));
    };

    const applySearch = () => {
        setAppliedFilters({ ...searchValues });
        setPage(0);
    };

    const clearSearch = () => {
        setSearchValues({});
        setAppliedFilters({});
        setGlobalSearch("");
        setPage(0);
    };

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const filteredData = useMemo(() => {
        let filterableData = [...allData];

        if (globalSearch) {
            const searchTerms = globalSearch
                .split(",")
                .map((term) => term.trim().toLowerCase())
                .filter(Boolean);

            filterableData = filterableData.filter((row) =>
                searchTerms.some((term) =>
                    Object.values(row).some((val) =>
                        String(val).toLowerCase().includes(term)
                    )
                )
            );
        }

        filterableData = filterableData.filter((row) =>
            Object.keys(appliedFilters).every((key) => {
                if (!appliedFilters[key]) return true;
                return String(row[key])
                    .toLowerCase()
                    .includes(String(appliedFilters[key]).toLowerCase());
            })
        );

        if (sortConfig.key) {
            filterableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return filterableData;
    }, [allData, globalSearch, appliedFilters, sortConfig]);

    const renderTableHeader = () => (
        <TableHead>
            <TableRow>
                <StyledTableCell align="center" sx={{ width: "80px" }}>
                    S.No
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ width: "80px" }}>
                    CheckBox
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ width: "80px" }}>
                    Actions
                </StyledTableCell>

                {columns.map((col) => (
                    <StyledTableCell key={col.accessor} align="center">
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {col.header}
                            <Tooltip
                                title={`Sort ${sortConfig.key === col.accessor
                                    ? sortConfig.direction === "asc"
                                        ? "Descending"
                                        : "Ascending"
                                    : "Ascending"
                                    }`}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => requestSort(col.accessor)}
                                    color={
                                        sortConfig.key === col.accessor ? "primary" : "default"
                                    }
                                >
                                    {sortConfig.key === col.accessor ? (
                                        sortConfig.direction === "asc" ? (
                                            <AscIcon />
                                        ) : (
                                            <DescIcon />
                                        )
                                    ) : (
                                        <FilterIcon />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Filter..."
                            value={searchValues[col.accessor] || ""}
                            onChange={(e) => handleSearchChange(col.accessor, e.target.value)}
                            sx={{ width: "100%", mt: 1 }}
                            InputProps={{
                                endAdornment: searchValues[col.accessor] && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleSearchChange(col.accessor, "")}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );

    {
        isLoading && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                    Processing your file, please wait...
                </Typography>
            </Box>
        );
    }

    const handleCheckboxChange = (row) => {
        setSelectedRows((prevSelected) => {
            const isSelected = prevSelected.some(
                (selectedRow) => selectedRow.Ledger_Tally_Id === row.Ledger_Tally_Id
            );
            return isSelected
                ? prevSelected.filter(
                    (selectedRow) => selectedRow.Ledger_Tally_Id !== row.Ledger_Tally_Id
                )
                : [...prevSelected, row];
        });
    };

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h5">LOL List</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {selectedRows.length > 0 && (
                        <Chip
                            label={`SELECTED ROWS : ${selectedRows.length} `}
                            color="primary"
                            size="small"
                            sx={{ mr: 2 }}
                        />
                    )}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        sx={{
                            width: 250,
                            mr: 2,
                            "& .MuiInputBase-root": {
                                height: 32,
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: globalSearch && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setGlobalSearch("")}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Tooltip title="Column Settings">
                        <IconButton onClick={() => setDialogOpen(true)}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={applySearch}
                        disabled={Object.keys(searchValues).length === 0}
                        sx={{ ml: 2 }}
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={clearSearch}
                        disabled={Object.keys(appliedFilters).length === 0 && !globalSearch}
                        sx={{ ml: 1 }}
                    >
                        Clear All
                    </Button>
                    <MenuItem
                        onClick={() => exportSelectedRowsToExcel(columns, selectedRows)}
                    >
                        <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download{" "}
                    </MenuItem>
                    <MenuItem onClick={handleClickOpen}>
                        <FileUploadIcon fontSize="small" sx={{ mr: 1 }} />
                        Upload
                    </MenuItem>

                    <Dialog open={open} fullWidth>
                        <DialogTitle>Upload Excel File</DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}
                            >
                                <Button
                                    variant="contained"
                                    component="label"
                                //   startIcon={<CloudUploadIcon />}
                                >
                                    Browse
                                    <input
                                        type="file"
                                        accept=".xls,.xlsx"
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                <Typography>
                                    {selectedFile ? selectedFile.name : "No file selected"}
                                </Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                onClick={handleUpload}
                                variant="contained"
                                disabled={!selectedFile || isLoading}
                                startIcon={
                                    isLoading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : null
                                }
                            >
                                {isLoading ? "Uploading..." : "Upload"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Column Settings</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {columnDropDown
                            .sort((a, b) => a.Position - b.Position)
                            .map((column) => (
                                <div className="col-lg-4 col-md-6 p-2" key={column.Id}>
                                    <Card className="p-2">
                                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                                            <Switch
                                                checked={getColumnStatus(column.Id)}
                                                onChange={(e) =>
                                                    handleColumnToggle(column.Id, e.target.checked)
                                                }
                                                disabled={column.Position <= 5}
                                                color={column.Position <= 5 ? "default" : "primary"}
                                            />
                                            <div>{column?.ColumnName}</div>

                                            <div className="d-flex align-items-center gap-2">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    variant="outlined"
                                                    value={column.Position ?? 0}
                                                    onChange={(e) =>
                                                        handlePositionChange(column.Id, e.target.value)
                                                    }
                                                    sx={{ width: "70px" }}
                                                    inputProps={{
                                                        min: 1,
                                                        readOnly: PROTECTED_COLUMNS.includes(
                                                            column.ColumnName
                                                        ),
                                                    }}
                                                    disabled={PROTECTED_COLUMNS.includes(
                                                        column.ColumnName
                                                    )}
                                                />

                                                <TextField
                                                    size="small"
                                                    variant="outlined"
                                                    value={column.Alias_Name ?? ""}
                                                    onChange={(e) =>
                                                        handleAliasChange(column.Id, e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetToDefaults} variant="outlined">
                        Reset
                    </Button>
                    <Button onClick={() => setDialogOpen(false)} color="error">
                        Close
                    </Button>
                    <Button
                        onClick={applyColumnChanges}
                        variant="contained"
                        color="primary"
                        disabled={isApplying}
                    >
                        {isApplying ? "Applying..." : "Apply"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Row</DialogTitle>

                <div
                    className="container-fluid"
                    style={{ maxHeight: "80vh", overflow: "auto" }}
                >
                    <div className="row g-3">
                        {columns.map((col) => (
                            <div key={col.accessor} className="col-12 col-sm-6 col-md-4">
                                <div className="form-group">
                                    <label className="form-label">{col.header}</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={editedData[col.accessor] || ""}
                                        onChange={(e) =>
                                            setEditedData({
                                                ...editedData,
                                                [col.accessor]: e.target.value,
                                            })
                                        }
                                        disabled={
                                            col.accessor === "Auto_Id" ||
                                            col.accessor === "Ledger_Tally_Id" ||
                                            col.accessor === "Ledger_Name"
                                        }
                                        style={{
                                            padding: "1rem 1rem",
                                            fontSize: "1rem",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogActions>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveChanges}
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {columns.length > 0 && allData.length > 0 ? (
                <Paper elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                    <TableContainer>
                        <Table
                            stickyHeader
                            aria-label="ledger table"
                            sx={{ minWidth: 650 }}
                        >
                            {renderTableHeader()}
                            <TableBody>
                                {filteredData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, idx) => (
                                        <StyledTableRow
                                            key={idx}
                                            highlight={row.Is_Tally_Updated === 1}
                                        >
                                            <StyledTableCell align="center">
                                                {page * rowsPerPage + idx + 1}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <IconButton>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.some(
                                                            (selectedRow) =>
                                                                selectedRow.Ledger_Tally_Id ===
                                                                row.Ledger_Tally_Id
                                                        )}
                                                        onChange={() => handleCheckboxChange(row)}
                                                        onFocus={(e) => e.target.blur()}
                                                        style={{
                                                            transform: "scale(1.5)",
                                                            width: "14px",
                                                            height: "20px",
                                                        }}
                                                    />
                                                </IconButton>
                                            </StyledTableCell>
                                            <StyledTableCell align="center">
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        onClick={() => handleEditClick(row)}
                                                        color="primary"
                                                        size="small"
                                                        sx={{
                                                            "&:hover": {
                                                                backgroundColor: "rgba(25, 118, 210, 0.08)",
                                                                transform: "scale(1.1)",
                                                            },
                                                            transition: "transform 0.2s",
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </StyledTableCell>
                                            {columns.map((col) => (
                                                <StyledTableCell
                                                    key={`${idx}-${col.accessor}`}
                                                    align="center"
                                                >
                                                    {row[col.accessor]}
                                                </StyledTableCell>
                                            ))}
                                        </StyledTableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <PaginationContainer>
                        <TablePagination
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPageOptions={[]}
                            sx={{
                                "& .MuiTablePagination-toolbar": {
                                    padding: 0,
                                    minHeight: "auto",
                                },
                                "& .MuiTablePagination-spacer": {
                                    display: "none",
                                },
                                "& .MuiTablePagination-actions": {
                                    marginLeft: "16px",
                                },
                            }}
                        />
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Rows per page</InputLabel>
                            <Select
                                value={rowsPerPage}
                                onChange={handleChangeRowsPerPage}
                                label="Rows per page"
                            >
                                {getPageSizeOptions().map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </PaginationContainer>
                </Paper>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </Box>
    );
}

export default Lollist;