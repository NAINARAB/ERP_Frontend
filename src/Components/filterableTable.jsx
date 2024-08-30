import React, { useState } from 'react';
import { Table, TableBody, TableContainer, TableRow, Paper, TablePagination, TableHead, TableCell, TableSortLabel } from '@mui/material';
import { isEqualNumber, LocalDate, NumberFormat } from './functions';

const FilterableTable = ({ dataArray, columns, onClickFun }) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [sortCriteria, setSortCriteria] = useState([]);

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
            case 'string':
                return val;
            default:
                return ''
        }
    }

    return (
        <div>
            <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
                                <TableCell
                                    key={ke}
                                    className='fa-13 fw-bold border-end border-top'
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
                                        {column?.Field_Name?.replace(/_/g, ' ')}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index}>
                                {columns.map(column => (
                                    Object.entries(row).map(([key, value]) => (
                                        (
                                            (column.Field_Name === key)
                                            &&
                                            (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1))
                                        ) && (
                                            <TableCell
                                                key={column + index}
                                                className='fa-13 border-end'
                                                onClick={() => onClickFun ? onClickFun(row) : console.log('Function not supplied')}
                                            >
                                                {formatString(value, column?.Fied_Data)}
                                            </TableCell>
                                        )
                                    ))
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="p-2">
                <TablePagination
                    component="div"
                    count={dataArray.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[20, 50, 100, 200, 500]}
                    labelRowsPerPage="Rows per page"
                    showFirstButton
                    showLastButton
                />
            </div>
        </div>
    );
};

export default FilterableTable;
