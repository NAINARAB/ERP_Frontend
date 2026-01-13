import { useState } from 'react';
import {
    Card, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer,
    IconButton, TablePagination
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp
} from '@mui/icons-material';

import { useColumnVisibility } from './hooks/useColumnVisibility';
import { useColumnFilters } from './hooks/useColumnFilters';
import { useTableStateSync } from './hooks/useTableStateSync';

import { groupAndAggregate } from './utils/groupAndAggregate';
import GroupingDialog from './components/GroupingDialog';
import TableOptionsMenu from './components/TableOptionsMenu';
import ColumnSettingsDialog from './components/ColumnSettingsDialog';
import StateSaveDialog from './components/StateSaveDialog';
import FilterDialog from './components/FilterDialog';
import { generatePDF, exportToExcel } from './utils/exportUtils';

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
    headerFontSizePx = 14
}) => {
    const [groupDialog, setGroupDialog] = useState(false);
    const [colSettingsOpen, setColSettingsOpen] = useState(false);
    const [saveStateOpen, setSaveStateOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [grouping, setGrouping] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialPageCount);
    const [showFullHeight, setShowFullHeight] = useState(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Column Visibility Hook
    const { dispColumns, setDispColumns, toggleVisibility, updateOrder } = useColumnVisibility(columns);

    // Column Filters Hook
    const { filteredData, filters, setFilters, updateFilter } = useColumnFilters(dataArray, dispColumns);

    // State Sync Hook
    const { enabled: stateEnabled, savedStates, saveState } = useTableStateSync({
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
            await saveState(formData);
            setSaveStateOpen(false);
        } catch (e) {
            console.error("Failed to save state", e);
        }
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
                        .map(col => (
                            <TableCell
                                key={col.Field_Name}
                                style={{ fontSize: bodyFontSizePx }}
                            >
                                {row[col.Field_Name] ?? '-'}
                            </TableCell>
                        ))}
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
                            <TableCell style={{ fontSize: bodyFontSizePx }}>
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
                                    className="text-center"
                                    style={{ width: 60, fontSize: bodyFontSizePx }}
                                >
                                    {idx + 1 + (page * rowsPerPage)}
                                </TableCell>
                            )}

                            {dispColumns
                                .filter(c => c.isVisible === 1)
                                .map(col => {
                                    if (col.Field_Name === row.__groupField) {
                                        return (
                                            <TableCell key={col.Field_Name} style={{ fontSize: bodyFontSizePx }}>
                                                <strong>{row.__groupValue}</strong>
                                            </TableCell>
                                        );
                                    }

                                    return (
                                        <TableCell key={col.Field_Name} style={{ fontSize: bodyFontSizePx }}>
                                            {row.__aggregates[col.Field_Name] ?? ''}
                                        </TableCell>
                                    );
                                })}
                        </TableRow>

                        {expanded[key] &&
                            renderRows(row.__rows, level + 1)}
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
                    {ButtonArea && ButtonArea}

                    <TableOptionsMenu
                        options={[
                            maxHeightOption && {
                                label: showFullHeight ? 'Min Height' : 'Max Height',
                                onClick: () => setShowFullHeight(!showFullHeight)
                            },
                            {
                                label: 'Filters',
                                onClick: () => setFilterDialogOpen(true)
                            },
                            {
                                label: 'Columns',
                                onClick: () => setColSettingsOpen(true)
                            },
                            {
                                label: 'Group By',
                                onClick: () => setGroupDialog(true)
                            },
                            stateEnabled && {
                                label: 'Save View',
                                onClick: () => setSaveStateOpen(true)
                            },
                            PDFPrintOption && {
                                label: 'Print PDF',
                                onClick: () => typeof PDFPrintOption === 'function'
                                    ? PDFPrintOption()
                                    : generatePDF(filteredData, dispColumns)
                            },
                            ExcelPrintOption && {
                                label: 'Export Excel',
                                onClick: () => typeof ExcelPrintOption === 'function'
                                    ? ExcelPrintOption()
                                    : exportToExcel(filteredData, dispColumns)
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
                            {activeGroups.length > 0 && <TableCell padding="checkbox" />}

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
                                    className="fw-bold text-center"
                                >
                                    SNo
                                </TableCell>
                            )}

                            {dispColumns
                                .filter(c => c.isVisible === 1)
                                .map(col => (
                                    <TableCell
                                        key={col.Field_Name}
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
                                activeGroups.length > 0
                                    ? groupedData
                                    : groupedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
