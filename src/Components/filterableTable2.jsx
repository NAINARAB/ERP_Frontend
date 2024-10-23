import React, { Fragment, useState } from 'react';
import { Table, TableBody, TableContainer, TableRow, Paper, TablePagination, TableHead, TableCell, TableSortLabel, IconButton } from '@mui/material';
import { isEqualNumber, LocalDate, LocalTime, NumberFormat } from './functions';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

import PropTypes from 'prop-types';

/**
 * @typedef {Object} Column
 * @property {string} Field_Name
 * @property {'string'|'number'|'date'|'time'} Fied_Data
 * @property {string} ColumnHeader
 * @property {0|1} isVisible
 * @property {'left'|'right'|'center'} align
 * @property {boolean} [isCustomCell]
 * @property {Function} [Cell]
 */

/**
 * Filterable Table Component
 * @param {Object} props
 * @param {Array<Object>} props.dataArray
 * @param {Array<Column>} props.columns
 * @param {Function} [props.onClickFun]
 * @param {boolean} [props.isExpendable]
 * @param {React.ReactElement} [props.expandableComp]
 * @param {number} [props.tableMaxHeight]
 * @param {number} [props.initialPageCount]
 * @param {boolean} [props.EnableSerialNumber]
 * @param {'small'|'medium'|'large'} [props.CellSize]
 * @param {boolean} [props.disablePagination]
 * @param {''} [props.title]
 */


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
    title = ''
}) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialPageCount);
    const [sortCriteria, setSortCriteria] = useState([]);

    const columnAlign = [
        {
            type: 'left',
            class: ''
        }, {
            type: 'right',
            class: 'text-end'
        }, {
            type: 'center',
            class: 'text-center'
        }
    ];

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
                return NumberFormat(val)
            case 'date':
                return LocalDate(val);
            case 'time':
                return LocalTime(val);
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
                        <TableCell className='fa-13 border-end text-center'>
                            <IconButton size='small' onClick={() => setOpen(pre => !pre)}>{open ? <KeyboardArrowUp sx={{ fontSize }} /> : <KeyboardArrowDown sx={{ fontSize }} />}</IconButton>
                        </TableCell>
                    )}

                    {EnableSerialNumber === true && (
                        <TableCell className='fa-13 border-end text-center'>{(rowsPerPage * page) + index + 1}</TableCell>
                    )}

                    {columns?.map((column, columnInd) => (
                        isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)
                    ) && (
                            (Boolean(column?.isCustomCell) === false || !column.Cell) ? (
                                Object.entries(row).map(([key, value]) => (
                                    (
                                        (column.Field_Name === key)
                                        &&
                                        (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1))
                                    ) && (
                                        <TableCell
                                            key={columnInd}
                                            className={`fa-13 border-end ` + (
                                                column.align ? columnAlign.find(align => align.type === String(column.align).toLowerCase())?.class : ''
                                            )}
                                            onClick={() => onClickFun ? onClickFun(row) : console.log('Function not supplied')}
                                        >
                                            {formatString(value, column?.Fied_Data)}
                                        </TableCell>
                                    )
                                ))
                            ) : (
                                <TableCell
                                    key={columnInd}
                                    className={`fa-13 border-end ` + (
                                        column.align ? columnAlign.find(align => align.type === String(column.align).toLowerCase())?.class : ''
                                    )}
                                >
                                    {column.Cell({ row, Field_Name: column.Field_Name })}
                                </TableCell>
                            )
                        )
                    )}

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
        <div>
            {title && <h6 className='fw-bold text-muted'>{title}</h6>}
            <TableContainer component={Paper} sx={{ maxHeight: tableMaxHeight }}>

                <Table stickyHeader size={CellSize}>

                    <TableHead>
                        <TableRow>

                            {(isExpendable === true && expandableComp) && (
                                <TableCell
                                    className='fa-13 fw-bold border-end border-top text-center'
                                    style={{ backgroundColor: '#EDF0F7' }}
                                >#</TableCell>
                            )}

                            {EnableSerialNumber === true && (
                                <TableCell
                                    className='fa-13 fw-bold border-end border-top text-center'
                                    style={{ backgroundColor: '#EDF0F7' }}
                                >SNo</TableCell>
                            )}

                            {columns.map((column, ke) => {
                                return (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
                                    (Boolean(column?.isCustomCell) === false || !column.Cell) ? (
                                        <TableCell
                                            key={ke}
                                            className={`fa-13 fw-bold border-end border-top ` + (
                                                column.align ? columnAlign.find(align => align.type === String(column.align).toLowerCase())?.class : ''
                                            )}
                                            style={{ backgroundColor: '#EDF0F7' }}
                                            sortDirection={
                                                sortCriteria.some(criteria => criteria.columnId === column.Field_Name)
                                                    ? sortCriteria.find(criteria => criteria.columnId === column.Field_Name).direction
                                                    : false
                                            }
                                        >
                                            <TableSortLabel
                                                active={sortCriteria.some(criteria => criteria.columnId === column.Field_Name)}
                                                direction={
                                                    sortCriteria.some(criteria => criteria.columnId === column.Field_Name)
                                                        ? sortCriteria.find(criteria => criteria.columnId === column.Field_Name).direction
                                                        : 'asc'
                                                }
                                                onClick={() => handleSortRequest(column.Field_Name)}
                                            >
                                                {column.ColumnHeader ? column.ColumnHeader : column?.Field_Name?.replace(/_/g, ' ')}
                                            </TableSortLabel>
                                        </TableCell>
                                    ) : (
                                        <TableCell
                                            key={ke}
                                            className={`${column.ColumnHeader ? 'fa-13 fw-bold border-end border-top' : ' p-0 '}` + (
                                                column.align ? columnAlign.find(align => align.type === String(column.align).toLowerCase())?.class : ''
                                            )}
                                            style={{ backgroundColor: '#EDF0F7' }}
                                        >
                                            {column.ColumnHeader ? column.ColumnHeader : column?.Field_Name?.replace(/_/g, ' ')}
                                        </TableCell>
                                    )
                                )
                            })}

                        </TableRow>
                    </TableHead>


                    <TableBody>
                        {(disablePagination ? dataArray : paginatedData).map((row, index) => (
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
                <div className="p-2 pb-0">
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

        </div>
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
        isCustomCell: PropTypes.bool,
        Cell: PropTypes.func
    })).isRequired,
    onClickFun: PropTypes.func,
    isExpendable: PropTypes.bool,
    expandableComp: PropTypes.element,
    tableMaxHeight: PropTypes.number,
    initialPageCount: PropTypes.number,
    EnableSerialNumber: PropTypes.bool,
    CellSize: PropTypes.string,
    disablePagination: PropTypes.bool,
    title: PropTypes.string,
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
    title: undefined
};


export default FilterableTable;