import React, { useState } from 'react';
import { Table, TableBody, TableContainer, TableRow, Paper, TablePagination, TableHead, TableCell, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { isEqualNumber, NumberFormat, LocalDate } from './functions';

function groupByRecursiveWithMetadata(data, keys) {
    if (!Array.isArray(data)) {
        return {
            data: [],
            nextGroup: false,
            nextGroupKey: null
        };
    }

    if (keys.length === 0) {
        return {
            data,
            nextGroup: false,
            nextGroupKey: null
        };
    }

    const [currentKey, ...remainingKeys] = keys;
    const groupedData = data?.reduce((acc, item) => {
        const keyValue = item[currentKey] || 'N/A';
        if (!acc[keyValue]) {
            acc[keyValue] = [];
        }
        acc[keyValue].push(item);
        return acc;
    }, {});

    const result = Object.keys(groupedData).map(groupedColumnValue => ({
        groupedKey: currentKey,
        groupedColumnValue,
        ...groupByRecursiveWithMetadata(groupedData[groupedColumnValue], remainingKeys),
        nextGroup: remainingKeys.length > 0,
        nextGroupKey: remainingKeys[0] || null
    }));

    return {
        group: currentKey,
        groupDataValue: data,
        data: result,
        nextGroup: remainingKeys.length > 0,
        nextGroupKey: remainingKeys[0] || null
    };
}

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

const GroupingTable = ({ dataArray, keysToGroupBy, columns }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const groupedDataWithMetadata = groupByRecursiveWithMetadata(dataArray, keysToGroupBy);
    const paginatedData = groupedDataWithMetadata.data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
        <div>
            <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Expand</TableCell>
                            {columns.map((column, ke) => (isEqualNumber(column.isVisible, 1) || isEqualNumber(column.Defult_Display)) ? (
                                <TableCell key={ke} className='fa-14 fw-bold border-end border-top' style={{ backgroundColor: '#EDF0F7' }}>
                                    {column?.Field_Name?.replace(/_/g, ' ')}
                                </TableCell>
                            ) : null)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <GroupedRows rows={paginatedData} columns={columns} />
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="p-2">
                <TablePagination
                    component="div"
                    count={groupedDataWithMetadata.data.length}
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

/**
 * Component to render rows of grouped data.
 */
const GroupedRows = ({ rows, columns }) => {
    return rows.map((row, index) => (
        <GroupRow key={index} row={row} columns={columns} />
    ));
};

/**
 * Component to render a single group row.
 */
const GroupRow = ({ row, columns }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            {/* <TableRow>
                <TableCell>
                    {row.nextGroup ? (
                        <IconButton size="small" onClick={toggleExpand}>
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    ) : null}
                </TableCell>
                <TableCell>{row.groupedKey}</TableCell>
                <TableCell>{row.groupedColumnValue}</TableCell>
                <TableCell>
                    {!row.nextGroup && row.data.map((item, idx) => (
                        <div key={idx}>{JSON.stringify(item)}</div>
                    ))}
                </TableCell>
            </TableRow> */}
            <TableRow>
                <TableCell>
                    {row.nextGroup ? (
                        <IconButton size="small" onClick={toggleExpand}>
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    ) : null}
                </TableCell>
                {[...columns?.filter(column => isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)).map(column => (
                    Object.entries(row).map(([key, value]) => (
                        <TableCell
                            key={key}
                            className='fa-13 border-end'
                        >
                            {formatString(value, column?.Fied_Data)}
                            {/* {value} */}

                        </TableCell>
                    ))
                ))]}
            </TableRow>
            {isExpanded && row.nextGroup && (
                <TableRow>
                    <TableCell colSpan={4}>
                        <Table>
                            <TableBody>
                                <GroupedRows rows={row.data} columns={columns} />
                            </TableBody>
                        </Table>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export default GroupingTable;
