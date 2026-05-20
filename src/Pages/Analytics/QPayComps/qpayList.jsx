import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

const QPayListComp = ({ dataArray }) => {
    const qPayColumn = [
        { header: 'Q-Pay Days', accessorKey: 'Q_Pay_Days' },
        { header: 'Ledger Name', accessorKey: 'Ledger_name' },
        { header: 'Ref Brokers', accessorKey: 'Ref_Brokers' },
        { header: 'Ref Owners', accessorKey: 'Ref_Owners' },
        { header: 'Party District', accessorKey: 'Party_District' },
        { header: 'Freq Days', accessorKey: 'Freq_Days' },
        { header: 'Sales Count', accessorKey: 'Sales_Count' },
        { header: 'Sales Amount', accessorKey: 'Sales_Amount' },
    ];

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = dataArray.slice(startIndex, endIndex);

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className='border-end fa-14 text-center tble-hed-stick'>Sno</TableCell>
                            {qPayColumn.map((o, i) => (
                                <TableCell className='border-end fa-14 text-center tble-hed-stick' key={i}>{o?.header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData?.map((o, i) => (
                            <TableRow key={i}>
                                <TableCell className='fa-13 border-end text-center'>{startIndex + i + 1}</TableCell>
                                {qPayColumn?.map((oo, ii) => (
                                    <TableCell className={`fa-13 border-end ${oo.accessorKey === 'Sales_Amount' ? 'text-end' : 'text-center'}`} key={ii}>
                                        {oo.accessorKey === 'Sales_Amount' ? Number(o[oo.accessorKey])?.toLocaleString('en-IN', {
                                            currency: 'INR',
                                            style: 'currency'
                                        }) : o[oo.accessorKey]}
                                    </TableCell>
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
                    rowsPerPageOptions={[10, 25, 50, 100, 200, 500, dataArray.length]}
                    labelRowsPerPage="Rows per page"
                    showFirstButton
                    showLastButton
                />
            </div>
        </>
    );
};

export default QPayListComp;
