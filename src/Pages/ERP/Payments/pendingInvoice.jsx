import React, { useEffect, useState, useRef } from "react";
import { LaunchOutlined, CurrencyRupee, ArrowBackIosNew, Visibility, Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Card, CardContent, } from '@mui/material';
import ShankarTraderQRC from './staticqrc.jpg';
import InvoiceBill from "../Report/billFormat";
import { useReactToPrint } from 'react-to-print';
import { LocalDate, NumberFormat } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";


const BillComponent = ({ props, bankDetails, reloadfun }) => {
    const [open, setOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [bankObj, setBankObj] = useState({});
    const [TransactionID, setTransactioId] = useState('');
    const printRef = useRef();
    const storage = JSON.parse(localStorage.getItem('user'));


    const [companyInfo, setCompanyInfo] = useState({});
    const [invoieInfo, setInvoiceInfo] = useState([]);
    const [expencesInfo, setExpencesInfo] = useState([]);
    const [invoiceDialog, setInvoiceDialog] = useState(false);

    useEffect(() => {
        props.CompanyBalanceInfo.sort((itemA, itemB) => {
            const dateA = new Date(itemA.invoice_date);
            const dateB = new Date(itemB.invoice_date);
            return dateA - dateB;
        });

        const selectedBillsArray = props?.CompanyBalanceInfo?.map((item, index) => ({
            invoiceNO: item?.invoice_no,
            num: index,
            check: false
        }));
        setSelectedBill(selectedBillsArray);
    }, [props, refresh]);

    const totalAmount = () => {
        let total = 0;
        selectedBill?.forEach((item, index) => {
            if (item.check === true) {
                total += Number(props?.CompanyBalanceInfo[index]?.Bal_Amount)
            }
        })
        return parseInt(total);
    }

    useEffect(() => {
        const comp = props?.CompanyBalanceInfo[0]?.Company_Id;
        bankDetails?.forEach(obj => {
            if (obj.Company_Id == comp) {
                setBankObj(obj);
            }
        })
    }, [totalAmount, bankDetails]);

    const handleCheckboxChange = (e, index) => {
        const updatedSelectedBill = [...selectedBill];
        updatedSelectedBill[index] = {
            ...updatedSelectedBill[index],
            check: e.target.checked
        };
        setSelectedBill(updatedSelectedBill);
    };

    const PayCheck = () => {
        let totalBillChecked = 0;
        let orderWiseChecked = true;

        for (let i = 0; i < selectedBill.length; i++) {
            const obj = selectedBill[i];
            if (obj.check === true) {
                totalBillChecked += 1;
                break;
            }
        }

        if (totalBillChecked === 0) {
            return toast.warn('Select a bill for payment');
        }

        for (let i = 1; i < selectedBill.length; i++) {
            const currentObj = selectedBill[i];
            const prevObj = selectedBill[i - 1];

            if (currentObj.check === true && prevObj.check === false) {
                for (let j = 0; j < props.CompanyBalanceInfo.length; j++) {
                    if (props.CompanyBalanceInfo[j].invoice_no === currentObj.invoiceNO) {
                        if (Number(props.CompanyBalanceInfo[j - 1].Pay_Status) !== 1) {
                            orderWiseChecked = false;
                        } else {
                            continue;
                        }
                    }
                }
            }
        }

        if (orderWiseChecked === false) {
            return toast.warn('You can only Pay Bills Order Wisely');
        }

        setDetailsDialog(true);
    };

    const postManualPay = () => {
        const selectedBillsData = [];
        selectedBill.map((obj, index) => {
            if (Boolean(obj.check) === true) {
                selectedBillsData.push(props.CompanyBalanceInfo[index])
            }
        })

        fetchLink({
            address: `userModule/customer/payment`,
            method: "POST",
            bodyData: {
                bills: selectedBillsData,
                amount: totalAmount(),
                UserId: storage?.UserId,
                paymentType: 1,
                TransactionId: TransactionID
            }
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setDetailsDialog(false); setRefresh(!refresh); reloadfun(); setTransactioId('')
            } else {
                toast.error(data.message)
            }
        }).catch(e => console.error(e))
    }

    const fetchInvoiceDetails = (CompanyId, Invoice_No, obj) => {
        setCompanyInfo({});
        setInvoiceInfo([]);
        setExpencesInfo([]);
        if (CompanyId && Invoice_No) {
            fetchLink({
                address: `userModule/customer/invoiceDetails?Company_Id=${CompanyId}&UserId=${storage?.UserId}&Invoice_No=${Invoice_No}`
            }).then(data => {
                if (data.success) {
                    if (data?.data[0]?.length) {
                        const company = data.data[0]
                        setCompanyInfo(company[0])
                    }
                    if (data?.data[1]?.length) {
                        setInvoiceInfo(data?.data[1]);
                        setInvoiceDialog(true);
                    }
                    if (data?.data[2].length) {
                        setExpencesInfo(data?.data[2])
                    }
                }
            }).catch(e => console.log(e))
        }
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <>
            <tr>
                <td className="border fa-14 text-center">
                    <IconButton size="small" color="primary" onClick={() => setOpen(!open)}>
                        <LaunchOutlined className="fa-20" />
                    </IconButton>
                </td>
                <td className="border fa-14">{props.CompName}</td>
                <td className="border fa-14">{props.CompanyBalanceInfo.length}</td>
                <td className="border fa-14 text-end text-primary fw-bold">
                    {(() => {
                        let amount = 0;
                        props.CompanyBalanceInfo.map(cobj => {
                            amount += parseInt(cobj.Bal_Amount)
                        })
                        return amount.toLocaleString();
                    })()}
                </td>
            </tr>

            <Dialog open={open} onClose={() => { setOpen(!open); setRefresh(!refresh) }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="lg"
                fullScreen>
                <DialogTitle sx={{ fontSize: '14px' }} className="fw-bold text-primary">{'Bills Payable For ' + props.CompName}</DialogTitle>
                <DialogContent className="p-0 ">
                    <p>
                        <span>PAYMENT AMOUNT : </span><br />
                        <span className="text-primary">{NumberFormat(totalAmount())}</span>
                    </p>

                    <table className="table">
                        <thead>
                            <tr>
                                <th className="fa-13"> - </th>
                                <th className="fa-13">Date</th>
                                <th className="fa-13">Ledger</th>
                                <th className="fa-13">InvoiceNo</th>
                                <th className="fa-13">Amount</th>
                                <th className="fa-13">Open Bill</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props?.CompanyBalanceInfo?.map((obj, index) => (
                                <tr key={index}>
                                    <td className={Number(obj?.Pay_Status) === 1 ? 'bg-success text-white fa-17 text-center' : 'fa-17 text-center bg-light'}>
                                        {Number(obj?.Pay_Status) !== 1 && (
                                            <input
                                                type="checkbox"
                                                className="form-check-input shadow-none border-primary"
                                                checked={selectedBill[index]?.check}
                                                disabled={Number(obj?.Pay_Status) === 1}
                                                onChange={(e) => handleCheckboxChange(e, index)}
                                            />
                                        )}
                                    </td>
                                    <td className={Number(obj?.Pay_Status) === 1 ? 'bg-success fa-13 text-white' : 'fa-13'}>
                                        {LocalDate(obj.invoice_date)}
                                    </td>
                                    <td className={Number(obj?.Pay_Status) === 1 ? 'bg-success fa-13 text-white' : 'fa-13 bg-light'}>{obj.ledger_name}</td>
                                    <td className={Number(obj?.Pay_Status) === 1 ? 'bg-success fa-13 text-white' : 'fa-13'}>{obj.invoice_no}</td>
                                    <td className={Number(obj?.Pay_Status) === 1 ? 'bg-success fa-13 text-white' : 'text-primary fa-13 bg-light'}>
                                        {NumberFormat(obj?.Bal_Amount)}
                                    </td>
                                    <td className={Number(obj?.Pay_Status) === 1 ? 'bg-success fa-13 text-white' : 'text-primary fa-13 bg-light'}>
                                        <IconButton onClick={() => fetchInvoiceDetails(obj?.Company_Id, obj?.invoice_no, obj)} size="small">
                                            <Visibility />
                                        </IconButton>
                                    </td>
                                </tr>
                            )
                            )}
                        </tbody>

                    </table>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<ArrowBackIosNew />}
                        onClick={() => { setOpen(!open); setRefresh(!refresh) }} >Go Back</Button>
                    <Button
                        color="success"
                        variant="outlined"
                        startIcon={<CurrencyRupee />}
                        onClick={PayCheck}>Proceed to pay </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={detailsDialog} onClose={() => { setDetailsDialog(false); setRefresh(!refresh) }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontSize: '14px' }} className="fw-bold text-primary">Selected Bills</DialogTitle>

                <DialogContent className="p-0">

                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ fontSize: '13px' }}>Date</th>
                                <th style={{ fontSize: '13px' }}>Ledger</th>
                                <th style={{ fontSize: '13px' }}>InvoiceNo</th>
                                <th style={{ fontSize: '13px' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedBill.map((item, index) =>
                                item.check === true && (
                                    <tr key={index}>
                                        <td style={{ fontSize: '13px' }} className=" bg-light">
                                            {props?.CompanyBalanceInfo[index]?.invoice_date && LocalDate(props?.CompanyBalanceInfo[index]?.invoice_date)}
                                        </td>
                                        <td style={{ fontSize: '12px' }}>{props?.CompanyBalanceInfo[index]?.ledger_name}</td>
                                        <td style={{ fontSize: '13px' }} className=" bg-light">{props?.CompanyBalanceInfo[index]?.invoice_no}</td>
                                        <td style={{ fontSize: '13px' }} className="text-primary fw-bold">
                                            {NumberFormat(props?.CompanyBalanceInfo[index]?.Bal_Amount)}
                                        </td>
                                    </tr>
                                )
                            )}
                            <tr>
                                <td>Total :</td>
                                <td className="text-success fw-bold">{NumberFormat(totalAmount())}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="row p-2">
                        <div className="col-lg-3 col-md-5 d-flex align-items-center flex-column">
                            <img src={ShankarTraderQRC} alt="qrc" height={260} />
                        </div>
                        <div className="col-lg-9 col-md-7 p-1">
                            <h5 className="text-uppercase ">BANK DETAILS</h5>
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className=" border-0">Bank Name</td>
                                        <td className=" border-0">{bankObj?.Bank_Name ? bankObj?.Bank_Name : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className=" border-0">Account Number</td>
                                        <td className=" border-0">{bankObj?.Account_No ? bankObj?.Account_No : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className=" border-0">Account Holder Name</td>
                                        <td className=" border-0">{bankObj?.Account_Holder_Name ? bankObj?.Account_Holder_Name : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className=" border-0">IFSC Code</td>
                                        <td className=" border-0">{bankObj?.IFSC_Code ? bankObj?.IFSC_Code : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className=" border-0">UPI</td>
                                        <td className=" border-0">{bankObj?.UPI_Number ? bankObj?.UPI_Number : '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-md-4 p-3">
                        <label>Enter Transaction Id</label>
                        <input className="form-control p-2" onChange={(e) => setTransactioId(e.target.value)} value={TransactionID} />
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button
                        color="error"
                        variant="outlined"
                        onClick={() => { setDetailsDialog(false); setRefresh(!refresh) }} >Cancel</Button>
                    <Button
                        color="success"
                        variant="outlined"
                        startIcon={<CurrencyRupee />}
                        disabled={!TransactionID}
                        onClick={postManualPay}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={invoiceDialog}
                onClose={() => setInvoiceDialog(false)}
                fullWidth maxWidth='lg'
            >
                <DialogTitle className="border-bottom text-primary d-flex align-items-center fa-18">
                    <span className="flex-grow-1">Invoice Details</span>
                    <Button
                        className="fw-bold"
                        onClick={handlePrint} >
                        PDF
                    </Button>
                    <IconButton size="small" className="bg-light" onClick={() => setInvoiceDialog(false)}>
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

const PendingInvoice = () => {
    const [balance, setBalance] = useState([]);
    const [isCustomer, setIsCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bankDetails, setBankDetails] = useState([]);
    const [reload, setReload] = useState(false);
    const storage = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchLink({
            address: `userModule/customer/isCustomer?UserId=${storage?.UserId}`,
        }).then(data => {
            if (data.success) {
                setIsCustomer(true)
            } else {
                setIsCustomer(false)
            }
        }).catch(e => console.error(e)) 
    }, [])

    useEffect(() => {

        if (isCustomer) {
            setLoading(true);
            fetchLink({
                address: `userModule/customer/paymentInvoiceList?UserId=${storage?.UserId}`,
            }).then(data => {
                if (data.success) {
                    const groupedData = data.data.reduce((acc, item) => {
                        const companyName = item.Company_Name;
                        const index = acc.findIndex((group) => group.CompName === companyName);

                        if (index === -1) {
                            acc.push({ CompName: companyName, CompanyBalanceInfo: [item] });
                        } else {
                            acc[index].CompanyBalanceInfo.push(item);
                        }

                        return acc;
                    }, []);
                    setBalance(groupedData);
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false)) 

            fetchLink({
                address: `userModule/BankDetails`,
            }).then(data => {
                setBankDetails(data.data)
            })
            .catch(e => console.error(e))   
        }

    }, [reload, isCustomer])

    const reloadData = () => {
        setReload(!reload)
    }


    return isCustomer === null
        ? <h6 className="pt-5 text-center text-primary">Loading...</h6>
        : isCustomer === true
            ? loading
                ? <h6 className="pt-5 text-center text-primary">Loading...</h6>
                : (
                    <Card sx={{ maxHeight: '80vh' }}>
                        <div className="fw-bold px-3 py-2 border-bottom">
                            Pending Amount
                        </div>
                        <CardContent>
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        <th className="border fa-14 text-center">Action</th>
                                        <th className="border fa-14 text-center">Company</th>
                                        <th className="border fa-14 text-center">Bills</th>
                                        <th className="border fa-14 text-center">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balance.map((obj, index) => <BillComponent props={obj} key={index} bankDetails={bankDetails} reloadfun={reloadData} />)}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )
            : <h6 className="pt-5 text-center text-danger">You're not a Customer</h6>

}

export default PendingInvoice;