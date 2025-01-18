import React, { Fragment, useRef, useState } from 'react';
import { Table, TableBody, TableContainer, TableRow, Paper, TablePagination, TableHead, TableCell, TableSortLabel, IconButton, Button, Popover, MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip, Card } from '@mui/material';
import { isEqualNumber, LocalDate, LocalTime, NumberFormat, randomNumber } from './functions';
import { Download, KeyboardArrowDown, KeyboardArrowUp, MoreVert, ToggleOff, ToggleOn } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} Column
 * @property {string} [Field_Name] 
 * @property {'string'|'number'|'date'|'time'} [Fied_Data]
 * @property {'top'|'middle'|'bottom'} [verticalAlign] 
 * @property {string} [ColumnHeader] 
 * @property {0|1} [isVisible] 
 * @property {'left'|'right'|'center'} [align] 
 * @property {boolean} [isCustomCell] 
 * @property {Function} [Cell]
 */

/**
 * @typedef {Object} Menu
 * @property {string} [name] 
 * @property {JSX.Element} [icon] 
 * @property {Function} [onclick] 
 * @property {boolean} [disabled] 
 */

/**
 * Filterable Table Component
 * @param {Object} props 
 * @param {Array<Object>} [props.dataArray] 
 * @param {Array<Column>} [props.columns] 
 * @param {Function} [props.onClickFun] 
 * @param {boolean} [props.isExpendable=false] 
 * @param {React.ReactElement|JSX.Element} [props.expandableComp] 
 * @param {number} [props.tableMaxHeight] 
 * @param {number} [props.initialPageCount=10] 
 * @param {boolean} [props.EnableSerialNumber=false] 
 * @param {'small'|'medium'|'large'} [props.CellSize='medium'] 
 * @param {boolean} [props.disablePagination=false] 
 * @param {string} [props.title=''] 
 * @param {boolean} [props.PDFPrintOption=false] 
 * @param {boolean} [props.ExcelPrintOption=false] 
 * @param {boolean} [props.maxHeightOption=false]
 * @param {React.ReactElement|JSX.Element} [props.ButtonArea] 
 * @param {Array<Menu>} props.MenuButtons 
 */

/**
 * Button Actions
 * @param {Array<Menu>} [buttonsData] 
 * @param {string} [ToolTipText] 
 */

const preprocessDataForExport = (data, columns) => {
    return data.map((row) => {
        const flattenedRow = {};

        columns.forEach((column, index) => {
            if (column.isVisible || column.Defult_Display) {
                if (column.isCustomCell && column.Cell) {
                    const cellContent = column.Cell({ row });

                    const safeColumnHeader = column.ColumnHeader
                        ? String(column.ColumnHeader).replace(/\s+/g, '_').toLowerCase()
                        : `field_${index + 1}`;

                    if (typeof cellContent === 'string' || typeof cellContent === 'number' || typeof cellContent === 'bigint') {
                        flattenedRow[safeColumnHeader] = cellContent;
                    }
                    // else if (React.isValidElement(cellContent)) {
                    //     flattenedRow[safeColumnHeader] = 'null';
                    // } else {
                    //     flattenedRow[safeColumnHeader] = 'invalid';
                    // }
                } else {
                    // Handle regular fields
                    let key = column.Field_Name;
                    flattenedRow[key] = row[key] || '';
                }
            }
        });

        return flattenedRow;
    });
};

const generatePDF = (dataArray, columns) => {
    try {
        const doc = new jsPDF();
        const processedData = preprocessDataForExport(dataArray, columns);

        const headers = columns
            .filter((column) => column.isVisible || column.Defult_Display)
            .map((column) => column.Field_Name || String(column.ColumnHeader).replace(/\s+/g, '_').toLowerCase());

        const rows = processedData.map((row) =>
            headers.map((header) => row[header])
        ).map((o, i) => ({ ...o, Sno: i + 1 }))

        doc.autoTable({
            head: [headers],
            body: rows,
        });

        doc.save('table.pdf');
    } catch (e) {
        console.error(e);
    }
};

const exportToExcel = (dataArray, columns) => {
    try {
        const processedData = preprocessDataForExport(dataArray, columns);

        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'table.xlsx');
    } catch (e) {
        console.error(e);
    }
};

const createCol = (field = '', type = 'string', ColumnHeader = '', align = 'left', verticalAlign = 'center') => {
    return {
        isVisible: 1,
        Field_Name: field,
        Fied_Data: type,
        align,
        verticalAlign,
        ...(ColumnHeader && { ColumnHeader })
    }
}

const ButtonActions = ({ buttonsData = [], ToolTipText = 'Options' }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const popOverOpen = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={ToolTipText}>
                <IconButton aria-describedby={popOverOpen} onClick={handleClick} className='ms-2' size='small'>
                    <MoreVert />
                </IconButton>
            </Tooltip>

            <Popover
                open={popOverOpen}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuList>
                    {buttonsData.map((btn, btnKey) => (
                        <MenuItem
                            key={btnKey}
                            onClick={() => btn?.onclick && btn?.onclick()}
                            disabled={btn?.disabled}
                        >
                            <ListItemIcon>{btn?.icon}</ListItemIcon>
                            <ListItemText>{btn?.name}</ListItemText>
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>
        </>
    )
}

const FilterableTable = ({
    dataArray = [],
    columns = [],
    onClickFun = null,
    isExpendable = false,
    expandableComp = null,
    tableMaxHeight = 550,
    initialPageCount = 20,
    EnableSerialNumber = false,
    CellSize = 'small' || 'medium',
    disablePagination = false,
    title = '',
    PDFPrintOption = false,
    ExcelPrintOption = false,
    maxHeightOption = false,
    ButtonArea = null,
    MenuButtons = []
}) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialPageCount);
    const [sortCriteria, setSortCriteria] = useState([]);
    const [showFullHeight, setShowFullHeight] = useState(true);
    const tableHeight = (showFullHeight && maxHeightOption) ? ' max-content ' : tableMaxHeight;

    const columnAlign = [
        {
            type: 'left',
            class: 'text-start'
        }, {
            type: 'right',
            class: 'text-end'
        }, {
            type: 'center',
            class: 'text-center'
        }
    ];

    const columnVerticalAlign = [
        {
            type: 'top',
            class: ' vtop '
        }, {
            type: 'bottom',
            class: ' vbottom '
        }, {
            type: 'center',
            class: ' vctr '
        }
    ]

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSortRequest = (columnId) => {
        const existingCriteria = sortCriteria.find(criteria => criteria.columnId === columnId);
        if (existingCriteria) {
            const isAsc = existingCriteria.direction === 'asc';
            setSortCriteria(sortCriteria.map(criteria =>
                criteria.columnId === columnId
                    ? { ...criteria, direction: isAsc ? 'desc' : 'asc' }
                    : criteria
            ));
        } else {
            setSortCriteria([...sortCriteria, { columnId, direction: 'asc' }]);
        }
    };

    const sortData = (data) => {
        if (!sortCriteria.length) return data;

        const sortedData = [...data].sort((a, b) => {
            for (const criteria of sortCriteria) {
                const { columnId, direction } = criteria;
                const aValue = a[columnId];
                const bValue = b[columnId];

                if (aValue !== bValue) {
                    if (direction === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                }
            }
            return 0;
        });

        return sortedData;
    };

    const sortedData = sortData(dataArray);
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    const formatString = (val, dataType) => {
        switch (dataType) {
            case 'number':
                return val ? NumberFormat(val) : val;
            case 'date':
                return val ? LocalDate(val) : val;
            case 'time':
                return val ? LocalTime(val) : val;
            case 'string':
                return val;
            default:
                return ''
        }
    }

    const RowComp = ({ row, index }) => {
        const [open, setOpen] = useState(false);
        const fontSize = '20px';

        return (
            <Fragment>
                <TableRow>

                    {(isExpendable === true && expandableComp) && (
                        <TableCell className='fa-13 border-end text-center vtop'>
                            <IconButton size='small' onClick={() => setOpen(pre => !pre)}>{open ? <KeyboardArrowUp sx={{ fontSize }} /> : <KeyboardArrowDown sx={{ fontSize }} />}</IconButton>
                        </TableCell>
                    )}

                    {EnableSerialNumber === true && (
                        <TableCell className='fa-13 border-end text-center vtop'>{(rowsPerPage * page) + index + 1}</TableCell>
                    )}

                    {columns?.map((column, columnInd) => {
                        const isColumnVisible = isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1);
                        const isCustomCell = Boolean(column?.isCustomCell) && column.Cell;
                        const isCommonValue = !isCustomCell;

                        const horizondalalignClass = column.align ? columnAlign.find(
                            align => align.type === String(column.align).toLowerCase()
                        )?.class : '';
                        const verticalAlignClass = column.verticalAlign ? columnVerticalAlign.find(
                            align => align.type === String(column.verticalAlign).toLowerCase()
                        )?.class : ' vctr '

                        if (isColumnVisible && isCommonValue) return Object.entries(row).map(
                            ([key, value]) => column.Field_Name === key && (
                                <TableCell
                                    key={columnInd}
                                    className={`fa-13 border-end ` + horizondalalignClass + verticalAlignClass}
                                    onClick={() => onClickFun ? onClickFun(row) : console.log('Function not supplied')}
                                >
                                    {formatString(value, column?.Fied_Data)}
                                </TableCell>
                            )
                        )

                        if (isColumnVisible && isCustomCell) return (
                            <TableCell
                                key={columnInd}
                                className={`fa-13 border-end ` + horizondalalignClass + verticalAlignClass}
                            >
                                {column.Cell({ row, Field_Name: column.Field_Name, index })}
                            </TableCell>
                        )
                        
                        return <TableCell key={columnInd} className={`fa-13 border-end ` + horizondalalignClass + verticalAlignClass}></TableCell>
                    })}

                </TableRow>

                {(isExpendable === true && expandableComp && open) && (
                    <TableRow>
                        <TableCell colSpan={Number(columns?.length) + (EnableSerialNumber === true ? 2 : 1)}>{expandableComp({ row, index })}</TableCell>
                    </TableRow>
                )}
            </Fragment>
        )
    }

    return (
        <Card className='rounded-3 bg-white overflow-hidden' component={Paper}>
            <div
                className="d-flex align-items-center flex-wrap px-3 py-2 flex-row-reverse "
            >
                {(PDFPrintOption || ExcelPrintOption || MenuButtons.length > 0 || maxHeightOption) && (
                    <ButtonActions
                        ToolTipText='Table Options'
                        buttonsData={[
                            ...(maxHeightOption
                                ? [{
                                    name: 'Max Height',
                                    icon: showFullHeight
                                        ? <ToggleOn fontSize="small" color='primary' />
                                        : <ToggleOff fontSize="small" />,
                                    onclick: () => setShowFullHeight(pre => !pre),
                                    disabled: isEqualNumber(dataArray?.length, 0)
                                }]
                                : []),
                            ...(PDFPrintOption
                                ? [{
                                    name: 'PDF Print',
                                    icon: <Download fontSize="small" color='primary' />,
                                    onclick: () => generatePDF(dataArray, columns),
                                    disabled: isEqualNumber(dataArray?.length, 0)
                                }]
                                : []),
                            ...(ExcelPrintOption
                                ? [{
                                    name: 'Excel Print',
                                    icon: <Download fontSize="small" color='primary' />,
                                    onclick: () => exportToExcel(dataArray, columns),
                                    disabled: isEqualNumber(dataArray?.length, 0)
                                }]
                                : []),
                            ...MenuButtons,
                        ]}
                    />
                )}
                {ButtonArea && ButtonArea}
                {title && <h6 className='fw-bold text-muted flex-grow-1 m-0'>{title}</h6>}
            </div>

            <TableContainer sx={{ maxHeight: tableHeight }}>

                <Table stickyHeader size={CellSize}>

                    <TableHead>
                        <TableRow>
                            {/* Expendable column */}
                            {isExpendable && expandableComp && (
                                <TableCell className='fa-13 fw-bold border-end border-top text-center' style={{ backgroundColor: '#EDF0F7' }}>
                                    #
                                </TableCell>
                            )}

                            {/* Serial number column */}
                            {EnableSerialNumber && (
                                <TableCell className='fa-13 fw-bold border-end border-top text-center' style={{ backgroundColor: '#EDF0F7' }}>
                                    SNo
                                </TableCell>
                            )}

                            {/* Columns */}
                            {columns.map((column, ke) => {
                                const isColumnVisible = isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1);
                                const isSortable = Boolean(column?.isCustomCell) === false || !column.Cell;
                                const sortCriteriaMatch = sortCriteria.find(criteria => criteria.columnId === column.Field_Name);
                                const sortDirection = sortCriteriaMatch ? sortCriteriaMatch.direction : 'asc';

                                if (isColumnVisible) {
                                    return isSortable ? (
                                        <TableCell
                                            key={ke}
                                            className={`fa-13 fw-bold border-end border-top ` +
                                                (column.align ? columnAlign.find(align => align.type === String(column.align).toLowerCase())?.class : '')}
                                            style={{ backgroundColor: '#EDF0F7' }}
                                            sortDirection={sortCriteriaMatch ? sortDirection : false}
                                        >
                                            <TableSortLabel
                                                active={!!sortCriteriaMatch}
                                                direction={sortDirection}
                                                onClick={() => handleSortRequest(column.Field_Name)}
                                            >
                                                {column.ColumnHeader || column?.Field_Name?.replace(/_/g, ' ')}
                                            </TableSortLabel>
                                        </TableCell>
                                    ) : (
                                        <TableCell
                                            key={ke}
                                            className={`${(column.ColumnHeader || column?.Field_Name) ? ' fa-13 fw-bold border-end border-top p-2 appFont ' : ' p-0 '} ` +
                                                (column.align ? columnAlign.find(align => align.type === String(column.align).toLowerCase())?.class : '')}
                                            style={{ backgroundColor: '#EDF0F7' }}
                                        >
                                            {column.ColumnHeader || column?.Field_Name?.replace(/_/g, ' ')}
                                        </TableCell>
                                    )
                                }
                                return null;
                            })}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {(disablePagination ? sortedData : paginatedData).map((row, index) => (
                            <RowComp key={index} row={row} index={index} />
                        ))}
                        {dataArray.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        columns.length +
                                        ((isExpendable === true && expandableComp) ? 1 : 0) +
                                        (EnableSerialNumber === true ? 1 : 0)
                                    }
                                    sx={{ textAlign: 'center' }}
                                >
                                    No Data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </TableContainer>

            {!disablePagination && paginatedData.length !== 0 && (
                <div
                    className="p-2 pb-0"
                >
                    <TablePagination
                        component="div"
                        count={dataArray.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={Array.from(new Set([initialPageCount, 5, 20, 50, 100, 200, 500])).sort((a, b) => a - b)}
                        labelRowsPerPage="Rows per page"
                        showFirstButton
                        showLastButton
                    />
                </div>
            )}

        </Card>
    );
};

FilterableTable.propTypes = {
    dataArray: PropTypes.arrayOf(PropTypes.object).isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
        Field_Name: PropTypes.string,
        Fied_Data: PropTypes.oneOf(['string', 'number', 'date', 'time']),
        ColumnHeader: PropTypes.string,
        isVisible: PropTypes.oneOf([0, 1]),
        align: PropTypes.oneOf(['left', 'right', 'center']),
        verticalAlign: PropTypes.oneOf(['top', 'center', 'bottom']),
        isCustomCell: PropTypes.bool,
        Cell: PropTypes.func
    })).isRequired,
    onClickFun: PropTypes.func,
    isExpendable: PropTypes.bool,
    expandableComp: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    tableMaxHeight: PropTypes.number,
    initialPageCount: PropTypes.number,
    EnableSerialNumber: PropTypes.bool,
    CellSize: PropTypes.string,
    disablePagination: PropTypes.bool,
    title: PropTypes.string,
    PDFPrintOption: PropTypes.bool,
    ExcelPrintOption: PropTypes.bool,
    maxHeightOption: PropTypes.bool,
    ButtonArea: PropTypes.element,
    MenuButtons: PropTypes.arrayOf(PropTypes.object)
};

FilterableTable.defaultProps = {
    dataArray: [],
    columns: [],
    onClickFun: null,
    isExpendable: false,
    expandableComp: null,
    tableMaxHeight: 550,
    initialPageCount: 20,
    EnableSerialNumber: false,
    CellSize: 'small',
    disablePagination: false,
    title: undefined,
    PDFPrintOption: false,
    ExcelPrintOption: false,
    maxHeightOption: false,
    ButtonArea: null,
    MenuButtons: []
};

export default FilterableTable;

export {
    createCol,
    ButtonActions,
}