import { useState, useDeferredValue } from 'react';
import {
    Card, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer,
    IconButton, TablePagination,
    Select, MenuItem, FormControl, InputLabel, TextField, InputAdornment
} from '@mui/material';
import {
    FilterAlt,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Visibility, Transform,
    Save,
    PictureAsPdf,
    ViewCompact,
    Calculate,
    CalculateOutlined,
    InsertChartOutlined,
    ToggleOn,
    ToggleOff,
    Search
} from '@mui/icons-material';

import { useColumnVisibility } from './hooks/useColumnVisibility';
import { useColumnFilters } from './hooks/useColumnFilters';
import { useTableStateSync } from './hooks/useTableStateSync';

import { groupAndAggregate } from './utils/groupAndAggregate';
import GroupingDialog from './components/GroupingDialog';
import TableOptionsMenu from './components/TableOptionsMenu';
import ColumnSettingsDialog from './components/ColumnSettingsDialog';
import AggregationSettingsDialog from './components/AggregationSettingsDialog';
import StateSaveDialog from './components/StateSaveDialog';
import FilterDialog from './components/FilterDialog';
import { generatePDF, exportToExcel } from './utils/exportUtils';
import { NumberFormat, LocalDate, LocalTime } from '../functions';
import { randomNumber } from '../functions';

const AppTableComponent = ({
    dataArray = [],
    columns = [],
    title = '',
    stateName,
    stateUrl,
    stateGroup,
    PDFPrintOption,
    ExcelPrintOption,
    MenuButtons = [],
    // New Props
    onClickFun,
    isExpendable = false,
    expandableComp,
    tableMaxHeight = 550,
    initialPageCount = 20,
    EnableSerialNumber = false,
    CellSize = 'small',
    disablePagination = false,
    maxHeightOption = false,
    ButtonArea,
    bodyFontSizePx = 13,
    headerFontSizePx = 14,
    enableGlobalSearch = false
}) => {
    const [groupDialog, setGroupDialog] = useState(false);
    const [colSettingsOpen, setColSettingsOpen] = useState(false);
    const [aggSettingsOpen, setAggSettingsOpen] = useState(false);
    const [saveStateOpen, setSaveStateOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [grouping, setGrouping] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [page, setPage] = useState(0);
    const [groupPage, setGroupPage] = useState({}); // { groupKey: pageNumber }
    const [rowsPerPage, setRowsPerPage] = useState(initialPageCount);
    const [showFullHeight, setShowFullHeight] = useState(false);
    const [globalSearchText, setGlobalSearchText] = useState("");
    const deferredGlobalSearch = useDeferredValue(globalSearchText);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeGroupPage = (key, newPage) => {
        setGroupPage(prev => ({ ...prev, [key]: newPage }));
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        setGroupPage({}); // Reset group pages too
    };

    const formatValue = (val, type) => {
        switch (type) {
            case 'number': return val ? NumberFormat(val) : val;
            case 'date': return val ? LocalDate(val) : val;
            case 'time': return val ? LocalTime(val) : val;
            default: return val;
        }
    };

    // Column Visibility Hook
    const {
        dispColumns,
        setDispColumns,
        toggleVisibility,
        updateOrder,
        updateAggregation
    } = useColumnVisibility(columns);

    // Column Filters Hook
    const { filteredData, filters, setFilters, updateFilter } = useColumnFilters(dataArray, dispColumns, deferredGlobalSearch);

    // State Sync Hook
    const {
        enabled: stateEnabled,
        availableViews,
        savedVisibility,
        savedGrouping,
        checkIfNameExists,
        saveState
    } = useTableStateSync({
        stateName,
        stateUrl,
        stateGroup,
        dispColumns,
        grouping,
    });

    const activeGroups = grouping.filter(Boolean);
    const groupedData = activeGroups.length
        ? groupAndAggregate(filteredData, dispColumns, activeGroups)
        : filteredData;

    const toggleExpand = key =>
        setExpanded(p => ({ ...p, [key]: !p[key] }));

    const handleSaveState = async (formData) => {
        try {
            // Check for duplicates
            // if (checkIfNameExists(formData.name)) {
            //     alert('State name already exists!');
            //     return;
            // }
            await saveState(formData);
            setSaveStateOpen(false);
        } catch (e) {
            console.error("Failed to save state", e);
            alert("Failed to save state: " + e.message);
        }
    };

    const handleViewChange = (reportName) => {
        if (!reportName) {
            // Reset to default
            setDispColumns(columns.map((col, i) => ({
                ...col,
                isVisible: col.isVisible ?? 1,
                OrderBy: col.OrderBy ?? (i + 1),
                Aggregation: col.Aggregation || (['number', 'currency'].includes(col.Fied_Data) ? 'sum' :
                    ['date', 'time'].includes(col.Fied_Data) ? 'max' : 'count')
            })));
            setGrouping([]);
            return;
        }

        // Find visible columns for this report
        const viewCols = savedVisibility.filter(v => v.reportName === reportName);

        if (viewCols.length > 0) {
            setDispColumns(cols => cols.map(c => {
                const match = viewCols.find(v => v.columnName === c.Field_Name);
                if (match) {
                    return { ...c, isVisible: 1, OrderBy: match.orderNum };
                } else {
                    // Start with hidden? Or keep default? 
                    // Usually saved state implies "this is the configuration". 
                    // If column is missing from saved state, it's likely hidden or new.
                    // Let's hide it to match the "saved view" exactly.
                    return { ...c, isVisible: 0 };
                }
            }));
        }

        // Find grouping for this report
        const viewGroups = savedGrouping.filter(g => g.reportName === reportName);
        const newGrouping = []; // Reset
        viewGroups.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
        viewGroups.forEach((g, i) => {
            if (i < 3) newGrouping[i] = g.columnName;
        });
        setGrouping(newGrouping);
    };

    // Helper for Expandable Row
    const ExpandableRow = ({ row, rowIndex }) => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <TableRow
                    key={rowIndex}
                    hover
                    onClick={() => onClickFun && onClickFun(row)}
                    style={{ cursor: onClickFun ? 'pointer' : 'default' }}
                >
                    {activeGroups.length > 0 && <TableCell />}

                    {/* Expand Button */}
                    {isExpendable && expandableComp && (
                        <TableCell
                            className="text-center"
                            style={{ width: 50, fontSize: bodyFontSizePx }}
                        >
                            <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                setOpen(!open);
                            }}>
                                {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                        </TableCell>
                    )}

                    {/* Serial Number */}
                    {EnableSerialNumber && (
                        <TableCell
                            className="text-center"
                            style={{ width: 60, fontSize: bodyFontSizePx }}
                        >
                            {rowIndex + 1 + (page * rowsPerPage)}
                        </TableCell>
                    )}

                    {dispColumns
                        .filter(c => c.isVisible === 1)
                        .map((col, i) => {
                            if (col.isCustomCell && typeof col.Cell === 'function') {
                                return (
                                    <TableCell key={i} style={{ fontSize: bodyFontSizePx }}>
                                        {col.Cell({ row })}
                                    </TableCell>
                                );
                            }

                            return (
                                <TableCell
                                    key={i}
                                    style={{ fontSize: bodyFontSizePx }}>
                                    {formatValue(row[col.Field_Name], col.Fied_Data) ?? '-'}
                                </TableCell>
                            );
                        })}
                </TableRow>

                {isExpendable && expandableComp && open && (
                    <TableRow>
                        <TableCell
                            colSpan={
                                dispColumns.filter(c => c.isVisible === 1 && !activeGroups.includes(c.Field_Name)).length +
                                (EnableSerialNumber ? 1 : 0) +
                                (activeGroups.length > 0 ? 1 : 0) +
                                1 // For expand icon itself
                            }
                        >
                            {expandableComp({ row, index: rowIndex })}
                        </TableCell>
                    </TableRow>
                )}
            </>
        );
    };

    const renderRows = (rows, level = 0) =>
        rows.map((row, idx) => {
            if (row.__isGroup) {
                const key = `${level}-${row.__groupValue}`;

                return (
                    <>
                        <TableRow key={key} className="bg-light">
                            <TableCell style={{ fontSize: bodyFontSizePx }} className=''>
                                <IconButton size="small" onClick={() => toggleExpand(key)}>
                                    {expanded[key]
                                        ? <KeyboardArrowUp />
                                        : <KeyboardArrowDown />}
                                </IconButton>
                            </TableCell>

                            {/* Spacers for Expand/SNo in group header */}
                            {isExpendable && <TableCell />}
                            {EnableSerialNumber && (
                                <TableCell
                                    className="text-center "
                                    style={{ width: 60, fontSize: bodyFontSizePx }}
                                >
                                    {idx + 1 + (page * rowsPerPage)}
                                </TableCell>
                            )}

                            {dispColumns
                                .filter(c => c.isVisible === 1)
                                .map((col, i) => {
                                    if (col.Field_Name === row.__groupField) {
                                        return (
                                            <TableCell key={i} style={{ fontSize: bodyFontSizePx }} className=''>
                                                <strong>{row.__groupValue}</strong>
                                            </TableCell>
                                        );
                                    }

                                    if (col.isCustomCell) {
                                        return <TableCell key={i} style={{ fontSize: bodyFontSizePx }} className='' />;
                                    }

                                    return (
                                        <TableCell key={i} style={{ fontSize: bodyFontSizePx }} className=''>
                                            {formatValue(row.__aggregates[col.Field_Name], col.Fied_Data) ?? ''}
                                        </TableCell>
                                    );
                                })}
                        </TableRow>

                        {expanded[key] && (
                            <>
                                {renderRows(
                                    row.__rows.slice(
                                        (groupPage[key] || 0) * rowsPerPage,
                                        (groupPage[key] || 0) * rowsPerPage + rowsPerPage
                                    ),
                                    level + 1
                                )}
                                {row.__rows.length > rowsPerPage && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                dispColumns.filter(c => c.isVisible === 1).length +
                                                (activeGroups.length > 0 ? 1 : 0) +
                                                (isExpendable ? 1 : 0) +
                                                (EnableSerialNumber ? 1 : 0)
                                            }
                                            style={{ padding: 0 }}
                                        >
                                            <TablePagination
                                                component="div"
                                                count={row.__rows.length}
                                                rowsPerPage={rowsPerPage}
                                                page={groupPage[key] || 0}
                                                onPageChange={(e, newPage) => handleChangeGroupPage(key, newPage)}
                                                onRowsPerPageChange={handleChangeRowsPerPage}
                                                rowsPerPageOptions={[rowsPerPage]}
                                                labelRowsPerPage=""
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </>
                );
            }

            return <ExpandableRow row={row} rowIndex={idx} key={idx} />;
        });

    // Derived styles
    const containerStyle = {
        maxHeight: (showFullHeight && maxHeightOption) ? 'none' : tableMaxHeight,
        overflowY: (showFullHeight && maxHeightOption) ? 'visible' : 'auto'
    };

    return (
        <Card>
            <div className="d-flex p-2 align-items-center flex-wrap">
                <h6 className="flex-grow-1 mb-0">{title}</h6>

                <div className="d-flex align-items-center gap-2">
                    {/* Global Search */}
                    {enableGlobalSearch && (
                        <TextField
                            size="small"
                            placeholder="Search..."
                            variant="outlined"
                            value={globalSearchText}
                            onChange={(e) => setGlobalSearchText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            style={{ minWidth: 200 }}
                        />
                    )}

                    {/* View Selector */}
                    {stateEnabled && availableViews.length > 0 && (
                        <FormControl size="small" style={{ minWidth: 150 }}>
                            <InputLabel>Saved View</InputLabel>
                            <Select
                                label="Saved View"
                                onChange={(e) => handleViewChange(e.target.value)}
                                defaultValue=""
                            >
                                <MenuItem value="">Select View (Default)</MenuItem>
                                {availableViews.map((v, i) => (
                                    <MenuItem key={i} value={v.reportName}>
                                        {v.reportName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {ButtonArea && ButtonArea}

                    <TableOptionsMenu
                        options={[
                            maxHeightOption && {
                                label: showFullHeight ? 'Min Height' : 'Max Height',
                                onClick: () => setShowFullHeight(!showFullHeight),
                                icon: showFullHeight ? <ToggleOn color='primary' /> : <ToggleOff />,
                            },
                            {
                                label: 'Filters',
                                onClick: () => setFilterDialogOpen(true),
                                icon: <FilterAlt />
                            },
                            {
                                label: 'Columns',
                                onClick: () => setColSettingsOpen(true),
                                icon: <Visibility />
                            },
                            {
                                label: 'Group By',
                                onClick: () => setGroupDialog(true),
                                icon: <Transform />
                            },
                            stateEnabled && {
                                label: 'Save View',
                                onClick: () => setSaveStateOpen(true),
                                icon: <Save />
                            },
                            PDFPrintOption && {
                                label: 'Print PDF',
                                onClick: () => typeof PDFPrintOption === 'function'
                                    ? PDFPrintOption()
                                    : generatePDF(filteredData, dispColumns),
                                icon: <PictureAsPdf />
                            },
                            ExcelPrintOption && {
                                label: 'Export Excel',
                                onClick: () => typeof ExcelPrintOption === 'function'
                                    ? ExcelPrintOption()
                                    : exportToExcel(filteredData, dispColumns),
                                icon: <ViewCompact />
                            },
                            {
                                label: 'Aggregations',
                                onClick: () => setAggSettingsOpen(true),
                                icon: <InsertChartOutlined />
                            },
                            ...MenuButtons.map(b => ({
                                label: b.name,
                                onClick: b.onclick || b.onClick,
                                disabled: b.disabled,
                                icon: b.icon
                            }))
                        ].filter(Boolean)}
                    />
                </div>
            </div>

            <TableContainer style={containerStyle}>
                <Table size={CellSize} stickyHeader>
                    <TableHead>
                        <TableRow>
                            {activeGroups.length > 0 &&
                                <TableCell
                                    style={{ width: 50, fontSize: headerFontSizePx, backgroundColor: '#EDF0F7' }}
                                    className="fw-bold text-center" padding="checkbox" />}

                            {isExpendable && (
                                <TableCell
                                    style={{ width: 50, fontSize: headerFontSizePx, backgroundColor: '#EDF0F7' }}
                                    className="fw-bold text-center"
                                >
                                    #
                                </TableCell>
                            )}

                            {EnableSerialNumber && (
                                <TableCell
                                    style={{ width: 60, fontSize: headerFontSizePx, backgroundColor: '#EDF0F7' }}
                                    className="fw-bold text-center "
                                >
                                    SNo
                                </TableCell>
                            )}

                            {dispColumns
                                .filter(c => c.isVisible === 1)
                                .map(col => (
                                    <TableCell
                                        key={randomNumber()}
                                        style={{ fontSize: headerFontSizePx, backgroundColor: '#EDF0F7' }}
                                        className="fw-bold"
                                    >
                                        {col.ColumnHeader || col.Field_Name}
                                    </TableCell>
                                ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {Array.isArray(groupedData)
                            ? renderRows(
                                groupedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            )
                            : null}
                    </TableBody>
                </Table>
            </TableContainer>

            {!disablePagination && (
                <TablePagination
                    rowsPerPageOptions={Array.from(new Set([initialPageCount, 5, 10, 25, 50, 100, 200, 500, 1000, 2000])).sort((a, b) => a - b)}
                    component="div"
                    count={groupedData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    showFirstButton
                    showLastButton
                />
            )}

            <GroupingDialog
                open={groupDialog}
                onClose={() => setGroupDialog(false)}
                columns={dispColumns}
                grouping={grouping}
                onChange={(lvl, val, newGrouping) => {
                    if (newGrouping) {
                        setGrouping(newGrouping);
                    } else {
                        const next = [...grouping];
                        next[lvl] = val;
                        setGrouping(next);
                    }
                }}
                onApply={() => setGroupDialog(false)}
            />

            <ColumnSettingsDialog
                open={colSettingsOpen}
                onClose={() => setColSettingsOpen(false)}
                columns={columns}
                dispColumns={dispColumns}
                onToggle={toggleVisibility}
                onOrderChange={updateOrder}
            />

            <AggregationSettingsDialog
                open={aggSettingsOpen}
                onClose={() => setAggSettingsOpen(false)}
                columns={dispColumns}
                onUpdateAggregation={updateAggregation}
            />

            <FilterDialog
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                columns={dispColumns}
                showData={dataArray}
                filters={filters}
                onChange={updateFilter}
                onClear={() => setFilters({})}
            />

            <StateSaveDialog
                open={saveStateOpen}
                onClose={() => setSaveStateOpen(false)}
                onSave={handleSaveState}
                defaults={{ reportUrl: stateUrl, reportGroup: stateGroup }}
            />
        </Card>
    );
};

export default AppTableComponent;
