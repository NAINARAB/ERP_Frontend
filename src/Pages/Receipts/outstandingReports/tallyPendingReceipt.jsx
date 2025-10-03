import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Addition, checkIsNumber, formatDateToCustom, getDaysBetween, ISOString, LocalDate, NumberFormat, reactSelectFilterLogic, stringCompare, toArray, toNumber } from "../../../Components/functions";
import { FilterAlt, Print, Search } from "@mui/icons-material";
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const TallyPendingReceipt = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const printRef = useRef(null);
    const [filters, setFilters] = useState({
        broker: { value: '', label: 'Select Broker' },
        ledger: { value: '', label: 'Select Ledger' },
        customersArray: [],
        refresh: false,
        filterDialog: false,
        dueDays: 0,
        reqDate: ISOString(),
        source: 'TALLY'
    });

    useEffect(() => {
        fetchLink({
            address: `userModule/customer/lol/dropDown`,
        }).then(data => {
            if (data.success) {
                setFilters(pre => ({ ...pre, customersArray: toArray(data.data) }));
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        setReportData([]);

        const brokerValue = filters?.broker?.value || '';

        const ledgers = checkIsNumber(filters?.ledger?.value)
            ? [{ Ledger_Tally_Id: filters?.ledger?.value }]
            : brokerValue
                ? toArray(filters?.customersArray).filter(
                    fil => stringCompare(fil?.Actual_Party_Name_with_Brokers, brokerValue)
                ).map(
                    ledger => ({ Ledger_Tally_Id: ledger?.Ledger_Tally_Id })
                )
                : [];

        const resultLedger = toArray(ledgers);
        const reqDate = filters?.reqDate;

        if (resultLedger === 0) return toast.error('Select any Ledger or Broker');
        if (!reqDate) return toast.error('Enter Till Date');

        fetchLink({
            address: `userModule/customer/paymentInvoiceList/filters`,
            loadingOn: loadingOn,
            loadingOff: loadingOff,
            method: 'POST',
            bodyData: {
                ledgerId: resultLedger,
                reqDate: reqDate,
                source: filters.source
            }
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).catch(e => console.error(e));

    }, [filters.refresh])

    const withDueDays = useMemo(() => {
        return toArray(reportData).map(
            row => {
                const dueDay = toNumber(row?.invoice_date ? getDaysBetween(row?.invoice_date, filters.reqDate) : '');

                return {
                    ...row,
                    dueDays: dueDay,
                    showDueDay: filters.dueDays ? filters.dueDays <= dueDay : true
                }
            }
        ).sort((a, b) => b.dueDays - a.dueDays)
    }, [reportData, filters.dueDays, filters.reqDate])

    const totalPendingAmount = useMemo(() => {
        return reportData.reduce((acc, inv) => Addition(acc, inv?.Bal_Amount), 0);
    }, [reportData]);

    const tillDateAmount = useMemo(() => {
        return reportData.filter(
            row => {
                const dueDay = toNumber(row?.invoice_date ? getDaysBetween(row?.invoice_date, filters.reqDate) : '');
                return filters.dueDays ? filters.dueDays <= dueDay : true
            }
        ).reduce((acc, inv) => Addition(acc, inv?.Bal_Amount), 0);
    }, [reportData, filters.dueDays, filters.reqDate]);

    const brokersDropDown = useMemo(() => {
        const allBroker = toArray(filters.customersArray).map(trip => trip?.Actual_Party_Name_with_Brokers);

        return [...new Set(allBroker)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [filters.customersArray])

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

                <div className="table-responsive" ref={printRef}>
                    <table className="table table-bordered fa-11">
                        <thead>
                            <tr>
                                <td
                                    colSpan={6}
                                    className="fw-bold text-center fa-15"
                                >
                                    {filters.ledger.value ? filters.ledger.label : filters.broker.label} - Till {LocalDate(filters.reqDate).replaceAll('/', '-')}
                                </td>
                            </tr>
                            <tr>
                                {['Sno', 'Date', 'Ref.No', 'Dr / Cr', 'Pending Amount', 'Overdue by days'].map(
                                    (row, rowIndex) => <th key={rowIndex}>{row}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>

                            {withDueDays.map((row, rowIndex) => {
                                const isGraterDueDay = filters.dueDays ? filters.dueDays <= toNumber(row?.dueDays) : false;

                                return (
                                    <tr key={rowIndex} className={`
                                            ${(isGraterDueDay) ? ' fw-bold text-primary ' : ''}`
                                    }>
                                        <td>{rowIndex + 1}</td>
                                        <td>{row?.invoice_date ? formatDateToCustom(row?.invoice_date) : '-'}</td>
                                        <td>{row?.invoice_no}</td>
                                        <td>{row?.accountSide}</td>
                                        <td>₹{NumberFormat(row?.Bal_Amount)}</td>
                                        <td className={row?.showDueDay ? '' : ' text-white '}>{row?.dueDays}</td>
                                    </tr>
                                )
                            })}

                            <tr className="fw-bold">
                                <td colSpan={4} className=" text-center">TOTAL</td>
                                <td>₹{NumberFormat(totalPendingAmount)}/-</td>
                                <td>₹{NumberFormat(tillDateAmount)}/-</td>
                            </tr>

                        </tbody>
                    </table>
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
                                {/* broker */}
                                <tr>
                                    <td className="vctr">Broker</td>
                                    <td className="vctr">
                                        <Select
                                            value={filters?.broker}
                                            onChange={(e) => setFilters({ ...filters, broker: e })}
                                            options={[
                                                { value: '', label: 'ALL Brokers' },
                                                ...brokersDropDown
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Broker Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* individual ledger */}
                                <tr>
                                    <td className="vctr">Customer</td>
                                    <td className="vctr">
                                        <Select
                                            value={filters?.ledger}
                                            onChange={(e) => setFilters({ ...filters, ledger: e })}
                                            options={[
                                                { value: '', label: 'Select', isDisabled: true },
                                                ...(
                                                    filters.broker.value
                                                        ? toArray(filters.customersArray).filter(
                                                            fil => stringCompare(fil.Actual_Party_Name_with_Brokers, filters.broker.value)
                                                        ).map(obj => ({
                                                            value: obj?.Ledger_Tally_Id,
                                                            label: obj?.Ledger_Name
                                                        }))
                                                        : toArray(filters.customersArray).map(obj => ({
                                                            value: obj?.Ledger_Tally_Id,
                                                            label: obj?.Ledger_Name
                                                        }))
                                                )
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Customer Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* till date (before the day) */}
                                <tr>
                                    <td className="vctr">Till Date</td>
                                    <td className="vctr">
                                        <input
                                            type="date"
                                            className="cus-inpt p-2"
                                            value={filters.reqDate ? filters.reqDate : ''}
                                            onChange={e => setFilters(pre => ({ ...pre, reqDate: e.target.value }))}
                                        />
                                    </td>
                                </tr>

                                {/* due days (grater than) */}
                                <tr>
                                    <td className="vctr">Due Days</td>
                                    <td className="vctr">
                                        <input
                                            type="number"
                                            className="cus-inpt p-2"
                                            value={filters.dueDays ? filters.dueDays : ''}
                                            onChange={e => setFilters(pre => ({ ...pre, dueDays: toNumber(e.target.value) }))}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="vctr">Source</td>
                                    <td className="vctr">
                                        <select
                                            className="cus-inpt p-2"
                                            value={filters.source}
                                            onChange={e => setFilters(pre => ({ ...pre, source: e.target.value }))}
                                        >
                                            <option value="TALLY">TALLY</option>
                                            <option value="ERP">ERP</option>
                                            <option value="JOURNAL">JOURNAL</option>
                                        </select>
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

                    <Button
                        variant="outlined"
                        onClick={() => setFilters(pre => ({ ...pre, refresh: !pre.refresh, filterDialog: false }))}
                        startIcon={<Search />}
                        disabled={
                            !filters.broker.value
                            && !filters.ledger.value
                        }
                    >Search</Button>

                </DialogActions>
            </Dialog>
        </>
    )
}

export default TallyPendingReceipt;