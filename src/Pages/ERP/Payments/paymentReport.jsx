import React, { useContext, useEffect, useState } from "react";
import { UnfoldMoreOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent } from '@mui/material';
import api from "../../../API";
import DataTable from "react-data-table-component";
import { MyContext } from "../../../Components/context/contextProvider";
import { isEqualNumber, ISOString, LocalDate, NumberFormat } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";


const PaymentReport = () => {
    const { contextObj } = useContext(MyContext);
    const [PHData, setPHData] = useState([])
    const storage = JSON.parse(localStorage.getItem('user'))
    const [search, setSearch] = useState({ searchData: '', payStatus: '0' });
    const [open, setOpen] = useState(false);
    const initialValue = { date: ISOString(), discribtion: '', verifyStatus: 0, Pay_Id: '' }
    const [verifyDetails, setVerifyDetails] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [isCustomer, setIsCustomer] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [showData, setShowData] = useState([])


    useEffect(() => {
        setPHData([]);
        fetchLink({
            address: `userModule/customer/isCustomer?UserId=${storage?.UserId}`
        }).then(data => {
            let fetchAPIAddress = '';
            if (data.success) {
                setIsCustomer(true);
                fetchAPIAddress = `userModule/customer/payment?paymentType=1&customerId=${data.data[0].Cust_Id}&payStatus=${search.payStatus}`;
            } else {
                setIsCustomer(false);
                fetchAPIAddress = `userModule/customer/payment?paymentType=1&payStatus=${search.payStatus}`;
            }

            fetchLink({
                address: fetchAPIAddress,
            }).then(data => {
                if (data.success) {
                    data.data.forEach(o => {
                        o.Created_At = new Date(o.Created_At)
                        o.Total_Amount = Number(o.Total_Amount)
                    })
                    setPHData(data.data)
                }
            })
            .catch(e => console.error(e))
                
        }).catch(e => console.error(e))
    }, [reload, search.payStatus])

    useEffect(() => {
        const filteredResults = PHData.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(search.searchData.toLowerCase())
            );
        });

        setFilteredData(filteredResults);
    }, [search.searchData, PHData]);

    useEffect(() => {
        setShowData(filteredData && filteredData.length > 0 ? filteredData : search.searchData === '' ? PHData : [])
    }, [filteredData, search.searchData])


    const clearVerifyDetails = () => {
        setVerifyDetails(initialValue)
    }

    const paymentReportColumn = [
        {
            name: 'Date',
            selector: (row) => row.Created_At,
            cell: (row) => LocalDate(row.Created_At),
            // maxWidth: '60px',
            sortable: true,
        },
        {
            name: 'Name',
            selector: (row) => row.Customer_name,
            sortable: true,
        },
        {
            name: 'Bills',
            selector: (row) => row.Bill_Count,
            // maxWidth: '60px',
            sortable: true,
        },
        {
            name: 'Amount',
            selector: (row) => row.Total_Amount,
            cell: (row) => NumberFormat(row.Total_Amount),
            // maxWidth: '60px',
            sortable: true,
        },
        {
            name: 'Company',
            selector: (row) => row.Company_Name,
            sortable: true,
        },
        {
            name: 'OrderId',
            selector: (row) => row.Order_Id,
        },
        {
            name: 'Status',
            selector: (row) => row.Payment_Status,
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row) => {
                return (isEqualNumber(contextObj?.Edit_Rights, 1) && isEqualNumber(search.payStatus, 0)) ? (
                    <IconButton
                        onClick={() => {
                            setOpen(true);
                            setVerifyDetails({ ...verifyDetails, Pay_Id: row.Id });
                        }}>
                        <UnfoldMoreOutlined />
                    </IconButton>
                ) : <></>
            },
            sortable: true
        },
    ]

    const cusPaymentReportColumn = [
        {
            name: 'Date',
            selector: (row) => row.Created_At,
            cell: (row) => LocalDate(row.Created_At),
            // maxWidth: '60px',
            sortable: true,
        },
        {
            name: 'Name',
            selector: (row) => row.Customer_name,
            sortable: true,
        },
        {
            name: 'Bills',
            selector: (row) => row.Bill_Count,
            // maxWidth: '40px',
            sortable: true,
        },
        {
            name: 'Amount',
            selector: (row) => row.Total_Amount,
            cell: (row) => NumberFormat(row.Total_Amount),
            // maxWidth: '60px',
            sortable: true,
        },
        {
            name: 'Company',
            selector: (row) => row.Company_Name,
            sortable: true,
        },
        {
            name: 'OrderId',
            selector: (row) => row.Order_Id,
        },
        {
            name: 'Status',
            selector: (row) => row.Payment_Status,
            sortable: true,
        }
    ]

    const DispDataTable = () => (
        <DataTable
            data={showData}
            columns={isCustomer ? cusPaymentReportColumn : paymentReportColumn}
            expandableRows
            pagination
            highlightOnHover={true}
            fixedHeader={true}
            fixedHeaderScrollHeight={'58vh'}
            // customStyles={customStyles}
            expandableRowsComponent={
                (row) => (
                    <div className="table-responisve m-2" style={{ width: 'fit-content' }}>
                        <table className="table mb-0">
                            <thead>
                                <tr>
                                    <td className="border fa-14">SNo</td>
                                    <td className="border fa-14">Invoice No</td>
                                    <td className="border fa-14">Bill Amount</td>
                                    <td className="border fa-14">Ledger No</td>
                                </tr>
                            </thead>
                            <tbody>
                                {row.data.PaymentDetails.map((o, i) => (
                                    <tr key={i}>
                                        <td className="border">{i + 1}</td>
                                        <td className="border">{o.Invoice_No}</td>
                                        <td className="border">{o.Bal_Amount}</td>
                                        <td className="border">{o.Ledger_Name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            } />
    )

    const postVefification = () => {
        if (!isCustomer) {
            fetchLink({
                address: `userModule/customer/payment/verification`,
                method:  'POST',
                bodyData: {
                    Pay_Id: verifyDetails.Pay_Id,
                    description: verifyDetails.discribtion,
                    verifiedDate: verifyDetails.date,
                    verifyStatus: verifyDetails.verifyStatus
                }
            }).then(data => {
                if (data.success) {
                    toast.success(data.message);
                    clearVerifyDetails();
                    setOpen(false);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            })
            .catch(e => console.error(e))
        }
    }

    return (
        <>

            <Card>
                <div className="p-3 border-bottom">
                    <h6 className="fa-18 mb-0">Payment Report</h6>
                </div>
                <CardContent>
                    <div className="d-sm-flex justify-content-between mb-3">
                        <select
                            style={{ padding: 10 }}
                            className="cus-inpt w-auto rounded-2" value={search.payStatus}
                            onChange={(e) => setSearch({ ...search, payStatus: e.target.value })} >
                            <option value='0'>Verification Pending List</option>
                            <option value="1">Verified</option>
                            <option value="2">Rejected</option>
                        </select>
                        <div className="flex-column mt-sm-0 mt-2">
                            <input type={'search'} className='cus-inpt w-auto rounded-5'
                                value={search.searchData}
                                onChange={(e) => {
                                    setSearch({ ...search, searchData: e.target.value });
                                }}
                                placeholder="Search..."
                            />
                        </div>
                    </div>
                    <DispDataTable />
                </CardContent>
            </Card>

            <Dialog
                open={open}
                onClose={() => { setOpen(false); clearVerifyDetails(); }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md" fullWidth>
                <DialogTitle id="alert-dialog-title">Payment Action</DialogTitle>
                <DialogContent>
                    <div >
                        <label>Discrition</label>
                        <textarea
                            rows="3"
                            className="cus-inpt shadow-none"
                            maxLength={330}
                            onChange={(e) => setVerifyDetails({ ...verifyDetails, discribtion: e.target.value })}
                            value={verifyDetails.discribtion}
                        />
                    </div>
                    <div className="row">
                        <div className="col-md-6 ">
                            <label>Verification Date</label>
                            <input
                                type="date"
                                className="cus-inpt"
                                onChange={(e) => setVerifyDetails({ ...verifyDetails, date: e.target.value })}
                                value={verifyDetails.date} />
                        </div>
                        <div className="col-md-6 ">
                            <label>Status</label>
                            <select
                                style={{ padding: 12 }}
                                className="cus-inpt"
                                onChange={(e) => setVerifyDetails({ ...verifyDetails, verifyStatus: e.target.value })}
                                value={verifyDetails.verifyStatus}>
                                <option value='0'>Verification Pending</option>
                                <option value="1">Verify</option>
                                <option value="2">Reject</option>
                            </select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpen(false); clearVerifyDetails(); }}>Close</Button>
                    <Button onClick={postVefification} autoFocus >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PaymentReport;