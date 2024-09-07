import React, { useEffect, useRef, useState } from "react";
import { LaunchOutlined } from '@mui/icons-material'
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { useReactToPrint } from 'react-to-print';
import { utils as XLSXUtils, writeFile as writeXLSX } from 'xlsx';
import logo from '../ic_launcher.png';
import { fetchLink } from '../../../Components/fetchComponent'


const SOAComp = () => {
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [isCustomer, setIsCustomer] = useState(false)
    const [dataArray, setDataArray] = useState([]);
    const UserId = parseData?.UserId;
    const token = parseData?.Autheticate_Id;
    const [total, setTotal] = useState(0)
    const [dialog, setDialog] = useState(false)
    const [SOA, setSOA] = useState([])
    const [clickedRow, setClickedRow] = useState({})
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);

    const [selectedRange, setSelectedRange] = useState({
        from: firstDayOfMonth.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const imageSource = logo
    const [closingBalance, setClosingBalance] = useState({ debit: 0, credit: 0 });
    const printRef = useRef()

    useEffect(() => {
        fetchLink({
            address: `userModule/customer/getBalance?UserId=${UserId}`
        }).then(data => {
            if (data.status === 'Success') {
                setDataArray(data.data)
                let temp = 0;
                data.data?.forEach(obj => {
                    temp += Number(obj.Bal_Amount)
                })
                setTotal(temp)
            }
            if (data?.isCustomer) {
                setIsCustomer(true)
            } else {
                setIsCustomer(false)
            }
        }).catch(e => console.error(e))
    }, [])

    const getInfo = (prop, mode) => {
        let rowData;
        if (mode && mode === 1) {
            rowData = clickedRow;
        } else {
            rowData = prop
        }
        setClickedRow(rowData)
        setDialog(true);
        fetchLink({
            address: `userModule/customer/StatementOfAccound?Cust_Id=${rowData?.Cust_Id}&Acc_Id=${rowData?.tally_id}&Company_Id=${rowData?.Company_Id}&Fromdate=${selectedRange?.from}&Todate=${selectedRange?.to}`
        }).then(data => {
            setSOA(data.data)
            let bal = { debit: 0, credit: 0 }
            data?.data?.forEach(obj => {
                bal.debit += Number(obj.Debit_Amt)
                bal.credit += Number(obj.Credit_Amt)
            })
            setClosingBalance(bal)
        }).catch(e => console.error(e))
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

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const generateExcel = (data) => {
        const worksheet = XLSXUtils.json_to_sheet(data);
        const workbook = XLSXUtils.book_new();
        XLSXUtils.book_append_sheet(workbook, worksheet, 'Sheet1');
        writeXLSX(workbook, `erpsmt_SOA_${new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}.xlsx`);
    }

    return isCustomer ? (
        <>
            <div className="card">
                <div className="card-header py-3 bg-white" >
                    <p className="mb-0 fw-bold" >
                        <span>Balance of {parseData?.Name}</span>
                        <span className={total > 0 ? 'text-primary' : 'text-danger'}> &nbsp;( {total.toLocaleString('en-IN') + (total < 0 ? ' CR' : ' DR')} )</span>
                    </p>
                </div>
                <div className="card-body p-0 table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ fontSize: '13px' }}>S.No</th>
                                <th style={{ fontSize: '13px' }}> - </th>
                                <th style={{ fontSize: '13px' }}>Company</th>
                                <th style={{ fontSize: '13px' }}>Ledger</th>
                                <th style={{ fontSize: '13px' }}>Balance</th>
                                <th style={{ fontSize: '13px' }}>Dr/Cr</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataArray.map((o, i) => (
                                <tr key={i}>
                                    <td style={{ fontSize: '13px' }}>{i + 1}</td>
                                    <td style={{ fontSize: '13px' }}>
                                        <button
                                            className="icon-btn"
                                            onClick={() => { getInfo(o) }}>
                                            <LaunchOutlined sx={{ fontSize: 'inherit' }} />
                                        </button>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>{o?.Company_Name}</td>
                                    <td style={{ fontSize: '13px' }}>{o?.ledger_name}</td>
                                    <td style={{ fontSize: '13px' }}>{o?.Bal_Amount?.toLocaleString('en-IN')}</td>
                                    <td style={{ fontSize: '13px' }}>{o?.CR_DR}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog
                open={dialog}
                onClose={handleClose}
                fullScreen
                fullWidth>
                <DialogTitle className="border-bottom text-primary d-flex align-items-center fa-18">
                    <span className="flex-grow-1">Transaction Report of {clickedRow?.Customer_name}</span>
                    <Button
                        className="fw-bold"
                        onClick={handlePrint} >
                        PDF
                    </Button>
                    <Button
                        className="ms-1 fw-bold"
                        onClick={() => {
                            const transformedData = SOA.map((o, i) => ({
                                Sno: i + 1,
                                Date: new Date(o?.Ledger_Date).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                }),
                                Purticular: o?.Ledger_Desc,
                                InvoiceNo: o?.invoice_no,
                                Debit: Boolean(Number(o.Debit_Amt)) ? o.Debit_Amt.toLocaleString('en-IN') : '',
                                Credit: Boolean(Number(o.Credit_Amt)) ? o.Credit_Amt.toLocaleString('en-IN') : '',
                                Company: o?.Company_Name,
                                Ledger: o?.Ledger_Name,
                                Mobile_Number: o?.Mobile_no
                            }));
                            generateExcel(transformedData);
                        }}
                    >
                        excel
                    </Button>
                </DialogTitle>
                <DialogContent className="rounded-2 shadow m-4 mb-2 p-0" >
                    <div className="row align-content-center">
                        <div className="col-lg-1">
                            <img src={imageSource} alt="Company Logo" className="smtlogo" />
                        </div>
                        <div className="col-lg-4 p-2 ps-3">
                            <table className="table border-0">
                                <tbody>
                                    <tr>
                                        <td className="border-0" scope="row">Company</td>
                                        <td className="border-0">{clickedRow?.Company_Name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0" scope="row">Ledger Name</td>
                                        <td className="border-0">{clickedRow?.ledger_name}</td>
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

                    <div className="p-2 table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="fa-13 tble-hed-stick">-</th>
                                    <th className="fa-13 tble-hed-stick">Date</th>
                                    <th className="fa-13 tble-hed-stick">Particulars</th>
                                    <th className="fa-13 tble-hed-stick">Invoice No</th>
                                    <th className="fa-13 tble-hed-stick">Dr</th>
                                    <th className="fa-13 tble-hed-stick">Cr</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SOA.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-13 bg-light">{i + 1}</td>
                                        <td className="fa-13 bg-light">
                                            {new Date(o?.Ledger_Date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="fa-13 bg-light">{o.Ledger_Desc}</td>
                                        <td className="fa-13">{o.invoice_no}</td>
                                        <td className="fa-13">{o.Debit_Amt.toLocaleString('en-IN')}</td>
                                        <td className="fa-13 bg-light">{o.Credit_Amt.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* printable div */}
                    <div className="d-none">
                        <div className="d-block px-5 py-2" ref={printRef}>
                            <img src={imageSource} alt="smtlogo" className="smtlogo" />
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 fa-14">Company</td>
                                        <td className="border-0 fa-14 fw-bold">{clickedRow?.Company_Name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Ledger Name</td>
                                        <td className="border-0 fa-14 fw-bold">{clickedRow?.ledger_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Contact Person</td>
                                        <td className="border-0 fa-14 fw-bold">{SOA[0]?.Contact_Person}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Mobile</td>
                                        <td className="border-0 fa-14 fw-bold">{SOA[0]?.Mobile_no}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">From</td>
                                        <td className="border-0 fa-14 fw-bold">{selectedRange.from}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">To</td>
                                        <td className="border-0 fa-14 fw-bold">{selectedRange.to}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Opening Balance</td>
                                        <td className="border-0 fa-14 fw-bold">
                                            {
                                                SOA[0]?.Debit_Amt > 0
                                                    ? SOA[0]?.Debit_Amt.toLocaleString('en-IN') + ' DR'
                                                    : SOA[0]?.Credit_Amt.toLocaleString('en-IN') + ' CR'
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Closing Balance</td>
                                        <td className="border-0 fa-14 fw-bold">
                                            {
                                                (closingBalance?.debit - closingBalance?.credit) < 0
                                                    ? (closingBalance?.debit - closingBalance?.credit).toLocaleString('en-IN') + " CR"
                                                    : (closingBalance?.debit - closingBalance?.credit).toLocaleString('en-IN') + ' DR'
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="p-2 table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="fa-13 tble-hed-stick">-</th>
                                            <th className="fa-13 tble-hed-stick">Date</th>
                                            <th className="fa-13 tble-hed-stick">Particulars</th>
                                            <th className="fa-13 tble-hed-stick">Invoice No</th>
                                            <th className="fa-13 tble-hed-stick">Dr</th>
                                            <th className="fa-13 tble-hed-stick">Cr</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SOA.map((o, i) => (
                                            <tr key={i}>
                                                <td className="fa-13 bg-light">{i + 1}</td>
                                                <td className="fa-13 bg-light">
                                                    {new Date(o?.Ledger_Date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="fa-13 bg-light">{o.Ledger_Desc}</td>
                                                <td className="fa-13">{o.invoice_no}</td>
                                                <td className="fa-13">{Boolean(Number(o.Debit_Amt)) && o.Debit_Amt.toLocaleString('en-IN')}</td>
                                                <td className="fa-13 bg-light">{Boolean(Number(o.Credit_Amt)) && o.Credit_Amt.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='contained' color='error'>Close</Button>
                </DialogActions>
            </Dialog>


        </>
    ) : <></>
}

export default SOAComp;