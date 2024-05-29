import React, { useEffect, useMemo, useState } from "react";
import { apihost } from "../../backendAPI";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { IconButton } from '@mui/material';
import { LaunchOutlined } from '@mui/icons-material'
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
// import CurrentPage from '../../components/currentPage'

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);

const CustomerScreen = () => {
    const [isCustomer, setIsCustomer] = useState(false)
    const [dataArray, setDataArray] = useState([])
    const UserId = localStorage.getItem('UserId');
    const token = localStorage.getItem('userToken');
    const [total, setTotal] = useState(0)
    const [dialog, setDialog] = useState(false)
    const [SOA, setSOA] = useState([])
    const [clickedRow, setClickedRow] = useState({})

    const [selectedRange, setSelectedRange] = useState({
        from: firstDayOfMonth.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const [closingBalance, setClosingBalance] = useState({ debit: 0, credit: 0 });


    useEffect(() => {
        fetch(`${apihost}/api/getBalance?UserId=${UserId}`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            if (data.status === 'Success') {
                setDataArray(data.data)
                let temp = 0;
                data.data.map(obj => {
                    temp += parseInt(obj.Bal_Amount)
                })
                setTotal(temp)
            }
            if (data?.isCustomer) {
                setIsCustomer(true)
            } else {
                setIsCustomer(false)
            }
        })
    }, [])

    const CustomerBalance = useMemo(() => [
        {
            header: 'Action',
            Cell: (({ row }) => (
                <>
                    <IconButton
                        color="primary"
                        size='small'
                        onClick={() => { getInfo(row) }}>
                        <LaunchOutlined />
                    </IconButton>
                </>
            )),
            size: 110
        },
        {
            header: 'Company',
            accessorKey: 'Company_Name'
        },
        {
            header: 'Ledger Name',
            accessorKey: 'ledger_name',
            size: 330
        },
        {
            header: 'Balance',
            Cell: (({ row }) =>
                <span className={`${row?.original?.Bal_Amount < 0 ? 'text-danger' : 'text-success'} fw-bold w-100 text-end`} >
                    {row?.original?.Bal_Amount.toLocaleString('en-IN')}
                </span>
            )
        },
        {
            header: 'Dr/Cr',
            accessorKey: 'CR_DR'
        }
    ])

    const StatementColumn = useMemo(() => [
        {
            header: 'Month',
            accessorKey: 'Month_Year'
        },
        {
            header: 'Date',
            accessorKey: 'Ledger_Date',
            Cell: (({ row }) => {
                const formattedDate = new Date(row.original.Ledger_Date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                return formattedDate
            })
        },
        {
            header: 'Invoice No',
            accessorKey: 'invoice_no',
        },
        {
            header: 'Purticular',
            accessorKey: 'Ledger_Desc',
            Cell: (({ row }) => {
                const original = row.original;
                return (
                    <h6 className="w-100 text-secondary fw-bold mb-0">
                        <span className="float-start">{original.Ledger_Desc}</span>
                        <span className="float-end">{original.Particulars}</span>
                    </h6>
                )

            }),
            size: 450
        },
        {
            header: 'Debit Amt',
            accessorKey: 'Debit_Amt',
            Cell: (({ row }) => <h6 className="w-100 text-end">{row.original.Debit_Amt.toLocaleString('en-IN')}</h6>),
            AggregatedCell: ({ cell }) => (
                <h6 className="w-100 mb-0">
                    {/* Total:  */}
                    <span className="text-primary fw-bold float-end">{(cell.getValue().toLocaleString('en-IN'))}</span>
                </h6>
            ),
        },
        {
            header: 'Credit Amt',
            accessorKey: 'Credit_Amt',
            Cell: (({ row }) => <h6 className="w-100 text-end">{row.original.Credit_Amt.toLocaleString('en-IN')}</h6>),
            AggregatedCell: ({ cell }) => (
                <h6 className="w-100 mb-0">
                    {/* Total:  */}
                    <span className="text-primary fw-bold float-end">{(cell.getValue().toLocaleString('en-IN'))}</span>
                </h6>
            ),
        }
    ])

    const getInfo = (prop, mode) => {
        let rowData;
        if (mode && mode === 1) {
            rowData = clickedRow;
        } else {
            rowData = prop.original
        }
        setClickedRow(rowData)
        setDialog(true)
        fetch(`${apihost}/api/StatementOfAccound?Cust_Id=${rowData.Cust_Id}&Acc_Id=${rowData.tally_id}&Company_Id=${rowData.Company_Id}&Fromdate=${selectedRange.from}&Todate=${selectedRange.to}`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            setSOA(data.data)
            let bal = { debit: 0, credit: 0 }
            data.data.map(obj => {
                bal.debit += parseInt(obj.Debit_Amt)
                bal.credit += parseInt(obj.Credit_Amt)
            })
            setClosingBalance(bal)
        })
    }

    const handleClose = () => {
        setDialog(false);
        setSOA([]);
        setClickedRow({});
        setSelectedRange({
            from: firstDayOfMonth.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
        })
    }

    const table = useMaterialReactTable({
        columns: CustomerBalance,
        data: dataArray,
        enableColumnResizing: true,
        enableGrouping: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableRowVirtualization: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enableRowNumbers: true,
        initialState: {
            density: 'compact',
            expanded: true,
            grouping: [],
            pagination: { pageIndex: 0, pageSize: 100 },
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
        muiTableContainerProps: { sx: { maxHeight: '60vh' } },
    })

    const Statement = useMaterialReactTable({
        columns: StatementColumn,
        data: SOA,
        enableColumnResizing: true,
        enableGrouping: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableRowVirtualization: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        initialState: {
            density: 'compact',
            expanded: true,
            grouping: ['Month_Year'],
            pagination: { pageIndex: 0, pageSize: 100 },
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
    })

    return isCustomer ? (
        <>
            <div className="card">
                <div className="card-header py-3 bg-white" >
                    <h5 className="mb-0">
                        <span>Balance of {localStorage.getItem('Name')}</span>
                        <span className={total > 0 ? 'text-primary' : 'text-danger'}> &nbsp;( {total.toLocaleString('en-IN') + (total < 0 ? ' CR' : ' DR')} )</span>
                    </h5>
                </div>
                <div className="card-body p-0">
                    <MaterialReactTable table={table} />
                </div>
            </div>
            <Dialog
                open={dialog}
                onClose={handleClose}
                fullScreen
                fullWidth>
                <DialogTitle className="border-bottom text-primary">Transaction Report of {clickedRow?.Customer_name}</DialogTitle>
                <DialogContent className="rounded-2 shadow m-4 p-0">
                    <div className="row align-content-center">
                        <div className="col-lg-1">
                            <img src="./ic_launcher.png" alt="smtlogo" className="smtlogo" />
                        </div>
                        <div className="col-lg-4 p-2 ps-3">
                            <table className="table border-0">
                                <tbody>
                                    <tr>
                                        <td className="border-0" scope="row">Company</td>
                                        <td className="border-0">{clickedRow.Company_Name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0" scope="row">Ledger Name</td>
                                        <td className="border-0">{clickedRow.ledger_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0" scope="row">Contact Person</td>
                                        <td className="border-0">{SOA[0]?.Contact_Person}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0" scope="row">Mobile</td>
                                        <td className="border-0">{SOA[0]?.Mobile_no}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                        <div className="col-lg-4 p-2">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0">Opening Balnce</td>
                                        <td className="border-0 text-primary">{
                                            SOA[0]?.Debit_Amt > 0
                                                ? SOA[0]?.Debit_Amt.toLocaleString('en-IN') + ' DR'
                                                : SOA[0]?.Credit_Amt.toLocaleString('en-IN') + ' CR'
                                        }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0">Closing Balance</td>
                                        <td className="border-0 text-primary">{
                                            (closingBalance?.debit - closingBalance?.credit) < 0
                                                ? (closingBalance?.debit - closingBalance?.credit).toLocaleString('en-IN') + " CR"
                                                : (closingBalance?.debit - closingBalance?.credit).toLocaleString('en-IN') + ' DR'
                                        }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-lg-3 p-2">
                            <table className="table border-0">
                                <tbody>
                                    <tr>
                                        <td className="border-0">From :</td>
                                        <td className="p-0 border-0">
                                            <input
                                                type="date"
                                                className="form-control w-auto ms-2"
                                                onChange={(e) => setSelectedRange({ ...selectedRange, from: e.target.value })}
                                                value={selectedRange.from} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0">To :</td>
                                        <td className="p-0 border-0">
                                            <input
                                                type="date"
                                                className="form-control w-auto ms-2"
                                                onChange={(e) => {
                                                    if (selectedRange.from && selectedRange.from <= e.target.value) {
                                                        setSelectedRange({ ...selectedRange, to: e.target.value });
                                                    } else {
                                                        window.alert('Invald Date Range')
                                                    }
                                                }}
                                                value={selectedRange.to}
                                                disabled={!selectedRange.from} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0"></td>
                                        <td className="border-0">
                                            <button
                                                className="btn text-white"
                                                style={{ backgroundColor: 'rgb(66, 34, 225)' }}
                                                onClick={() => { getInfo('', 1) }}>Search</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <MaterialReactTable table={Statement} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='contained' color='error'>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    ) : (
        <>
        </>
    )
}

export default CustomerScreen;