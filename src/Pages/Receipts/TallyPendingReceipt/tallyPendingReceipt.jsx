import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Addition, checkIsNumber, formatDateToCustom, getDaysBetween, NumberFormat, toArray, toNumber } from "../../../Components/functions";
import { FilterAlt, Print } from "@mui/icons-material";
import { useReactToPrint } from 'react-to-print';

const TallyPendingReceipt = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const printRef = useRef(null);
    const [filters, setFilters] = useState({
        customer: { value: '', label: 'Select Customer' },
        customersArray: [],
        refresh: false,
        filterDialog: false,
        dueDays: 0
    });

    useEffect(() => {
        fetchLink({
            address: `userModule/customer/dropDown`,
        }).then(data => {
            if (data.success) {
                setFilters(pre => ({ ...pre, customersArray: toArray(data.data) }));
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        setReportData([]);
        if (checkIsNumber(filters.customer.value)) {
            fetchLink({
                address: `userModule/customer/paymentInvoiceList?UserId=${filters.customer.value}`,
                loadingOn: loadingOn,
                loadingOff: loadingOff
            }).then(data => {
                if (data.success) {
                    const withDueDate = toArray(data.data).map(
                        row => ({
                            ...row, 
                            dueDays: toNumber(row?.invoice_date ? getDaysBetween(row?.invoice_date) : '') 
                        })
                    ).sort((a, b) => b.dueDays - a.dueDays)
                    setReportData(withDueDate);
                }
            }).catch(e => console.error(e))
        }
    }, [filters.customer.value])

    const totalPendingAmount = useMemo(() => {
        return reportData.reduce((acc, inv) => Addition(acc, inv.Bal_Amount), 0);
    }, [reportData]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDialog: false }))
    }

    return (
        <>
            <Card>
                <div className="p-2 px-3 d-flex align-items-center flex-wrap">
                    <h6 className=" flex-grow-1 m-0">Pending Invoices</h6>

                    <div style={{ width: '100%', maxWidth: '300px', minWidth: '220px' }} className="m-1">

                    </div>

                    <IconButton
                        size="small"
                        onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                    ><FilterAlt className="fa-20" /></IconButton>

                    <IconButton
                        size="small"
                        onClick={handlePrint}
                        disabled={reportData?.length === 0}
                    ><Print className="fa-20" /></IconButton>

                </div>

                <hr className="m-2" />

                <div className="p-2" ref={printRef}>
                    <h6 className="d-flex align-items-center justify-content-between fw-bold m-2">
                        <span>{filters.customer.label}</span>
                        <span>₹{NumberFormat(totalPendingAmount)}</span>
                    </h6>

                    <hr className="m-2" />

                    <div className="table-responsive">
                        <table className="table table-bordered fa-11">
                            <thead>
                                <tr>
                                    {['Sno', 'Date', 'Ref.No', '', 'Pending Amount', 'Overdue by days'].map(
                                        (row, rowIndex) => <th key={rowIndex}>{row}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, rowIndex) => {
                                    const isGraterDueDay = filters.dueDays ? filters.dueDays <= toNumber(row?.dueDays) : false;

                                    return (
                                        <tr key={rowIndex} className={`
                                            ${(isGraterDueDay) ? ' fw-bold text-primary ' : '' }`
                                        }>
                                            <td>{rowIndex + 1}</td>
                                            <td>{row?.invoice_date ? formatDateToCustom(row?.invoice_date) : '-'}</td>
                                            <td>{row?.invoice_no}</td>
                                            <td>{row?.Bill_Company}</td>
                                            <td>₹{NumberFormat(row?.Bal_Amount)}</td>
                                            <td>{row?.dueDays}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog} maxWidth='sm' fullWidth
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table m-0 table-borderless">
                            <tbody>
                                <tr>
                                    <td className="vctr">Customer</td>
                                    <td className="vctr">
                                        <Select
                                            value={filters?.customer}
                                            onChange={(e) => setFilters({ ...filters, customer: e })}
                                            options={[
                                                { value: '', label: 'Select', isDisabled: true },
                                                ...toArray(filters.customersArray).map(obj => ({
                                                    value: obj?.UserId,
                                                    label: obj?.label
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Customer Name"}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="vctr">Due Days</td>
                                    <td className="vctr">
                                        <input 
                                            type="number"
                                            className="cus-inpt p-2"
                                            value={filters.dueDays ? filters.dueDays : ''} 
                                            onChange={e => setFilters(pre => ({...pre, dueDays: toNumber(e.target.value)}))}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button 
                        variant="outlined" 
                        onClick={closeDialog}
                        color="error"
                    >Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TallyPendingReceipt;