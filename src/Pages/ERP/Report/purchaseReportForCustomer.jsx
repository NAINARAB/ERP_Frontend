import api from "../../../API";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button } from "@mui/material";
import { useReactToPrint } from 'react-to-print';
import { useEffect, useRef, useState } from "react";
import { Close, LaunchOutlined, Visibility } from '@mui/icons-material';
import InvoiceBill from "./billFormat";
import { LocalDate, NumberFormat } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";

const PurchaseReportForCustomer = () => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [sales, setSales] = useState([]);
    const [salesInfo, setSalesInfo] = useState([]);
    const [total, setTotal] = useState(0)
    const [dialog, setDialog] = useState({
        salesInfoDialog: false,
        billDialog: false
    });
    const [companyInfo, setCompanyInfo] = useState({});
    const [invoieInfo, setInvoiceInfo] = useState([]);
    const [expencesInfo, setExpencesInfo] = useState([]);
    const printRef = useRef()

    useEffect(() => {
        fetchLink({
            address: `userModule/customer/customerSalesReport?UserId=${storage?.UserId}`,
        }).then(data => {
            if (data.success) {
                setSales(data.data)
                let temp = 0;
                data.data.forEach(obj => {
                    temp += Number(obj?.Total_Amount)
                    console.log(obj?.Total_Amount)
                })
                setTotal(temp)
            }
        }).catch(e => console.error(e));

    }, [])

    const getSalesDetials = (obj) => {
        setSalesInfo([]);
        fetchLink({
            address: `userModule/customer/salesInfo?Cust_Id=${obj?.Cust_Id}&Acc_Id=${obj?.tally_id}&Company_Id=${obj?.Company_Id}`
        }).then(data => {
            if (data.success) {
                setSalesInfo(data.data);
                setDialog(pre => ({ ...pre, salesInfoDialog: true }))
            }
        }).catch(e => console.log(e))
    }

    const fetchInvoiceDetails = (CompanyId, Invoice_No) => {
        setCompanyInfo({});
        setInvoiceInfo([]);
        setExpencesInfo([]);
        if (CompanyId && Invoice_No) {
            fetchLink({
                address: `userModule/customer/invoiceDetails?Company_Id=${CompanyId}&UserId=${storage?.UserId}&Invoice_No=${Invoice_No}`
            }).then(data => {
                if (data.status === "Success") {
                    if (data?.data[0]?.length) {
                        const company = data.data[0]
                        setCompanyInfo(company[0])
                    }
                    if (data?.data[1]?.length) {
                        setInvoiceInfo(data?.data[1]);
                    }
                    if (data?.data[2].length) {
                        setExpencesInfo(data?.data[2])
                    }
                    setDialog(pre => ({ ...pre, billDialog: true }));
                }
            }).catch(e => console.log(e))
        }
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <>
            <div className="card">
                <div className="card-header py-3 bg-white" >
                    <p className="mb-0 fw-bold" >
                        <span>Balance of {storage?.Name}</span>
                        <span className={total > 0 ? 'text-primary' : 'text-danger'}> &nbsp;( {NumberFormat(total)} {(total < 0 ? ' CR' : ' DR')} )</span>
                    </p>
                </div>
                <div className="card-body p-0 table-responsive" style={{ maxHeight: '80vh' }}>
                    <table className="table" >
                        <thead>
                            <tr>
                                {['S.No', '-', 'Company', 'Ledger', 'Balance', 'Dr/Cr'].map((o, i) => (
                                    <th className="tble-hed-stick fa-13" key={i}>{o}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody >
                            {sales.map((o, i) => (
                                <tr key={i}>
                                    <td style={{ fontSize: '13px' }}>{i + 1}</td>
                                    <td style={{ fontSize: '13px' }}>
                                        <button
                                            className="icon-btn"
                                            onClick={() => { getSalesDetials(o) }}>
                                            <LaunchOutlined sx={{ fontSize: 'inherit' }} />
                                        </button>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>{o?.Company_Name}</td>
                                    <td style={{ fontSize: '13px' }}>{o?.ledger_name}</td>
                                    <td style={{ fontSize: '13px' }}>{NumberFormat(o?.Total_Amount)}</td>
                                    <td style={{ fontSize: '13px' }}>{o?.Total_Count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog
                fullScreen
                open={dialog.salesInfoDialog}
                onClose={() => setDialog(pre => ({ ...pre, salesInfoDialog: false }))}>
                <DialogTitle className="d-flex">
                    Sales List Of
                    <span className="text-primary flex-grow-1"> {salesInfo[0]?.Customer_name}</span>
                    <IconButton size="small" color='error' onClick={() => setDialog(pre => ({ ...pre, salesInfoDialog: false }))}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>-</th>
                                    <th>Date</th>
                                    <th>Invoice No</th>
                                    <th>Total Value</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesInfo?.map((o, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{o?.invoice_date && LocalDate(o?.invoice_date)}</td>
                                        <td>{o?.invoice_no}</td>
                                        <td>{NumberFormat(o?.total_invoice_value)}</td>
                                        <td>
                                            <IconButton onClick={() => fetchInvoiceDetails(o?.Company_Id, o?.invoice_no)} size="small">
                                                <Visibility />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>

                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog.billDialog}
                onClose={() => setDialog(pre => ({ ...pre, billDialog: false }))}
                fullWidth maxWidth='lg'
            >
                <DialogTitle className="border-bottom text-primary d-flex align-items-center fa-18">
                    <span className="flex-grow-1">Invoice Details</span>
                    <Button
                        className="fw-bold"
                        onClick={handlePrint}>
                        PDF
                    </Button>
                    <IconButton size="small" className="bg-light" onClick={() => setDialog(pre => ({ ...pre, billDialog: false }))}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="p-0" ref={printRef}>
                    <InvoiceBill invoieInfo={invoieInfo} companyInfo={companyInfo} expencesInfo={expencesInfo} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default PurchaseReportForCustomer;