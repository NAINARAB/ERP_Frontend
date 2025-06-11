import { useState, useEffect } from "react";
import { Button } from '@mui/material';
import FilterableTable, { createCol } from '../../Components/filterableTable2';
import { useNavigate } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";
import { Addition, checkIsNumber, isEqualNumber, ISOString, Subraction, toArray } from "../../Components/functions";
import { receiptGeneralInfoInitialValue } from "./ReceiptMaster/variable";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";


const CustomerPendingReceipt = ({ loadingOn, loadingOff, AddRights }) => {

    const [reportData, setReportData] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState([]);
    const navigation = useNavigate();

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        ledger: { value: '', label: 'Select Ledger' },
        refresh: false,
        filterDialog: false,
    });

    useEffect(() => {
        fetchLink({
            address: `receipt/getCustomerWhoHasBills`
        }).then(data => {
            if (data.success) {
                setLedgers(data.data)
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (!checkIsNumber(filters.ledger.value)) return;
        // setReportData([]);
        setSelectedInvoice([]);

        fetchLink({
            address: `receipt/receiptMaster/pendingSalesInvoiceReceipt?Acc_Id=${filters.ledger.value}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const repDat = toArray(data.data).map(o => ({
                    ...o,
                    receiptPendingAmount: Subraction(o.Total_Invoice_value, o.Paid_Amount)
                }))
                setReportData(repDat);
            }
        }).catch(e => console.error(e))
    }, [filters.ledger.value]);

    const CountCard = ({ label = '', value = '' }) => {
        return (
            <div className="col-md-2 col-sm-4 p-2 d-flex flex-column align-items-center justify-content-center">
                <h2 className="text-primary fw-bold ">{value}</h2>
                <h6 className="m-0">{label}</h6>
            </div>
        )
    }

    const onSelect = (row, deleteOption) => {
        setSelectedInvoice(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(o => !isEqualNumber(o?.Do_Id, row.Do_Id));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                updateBillInfo = [...excludeCurrentValue, row];
            }
            return updateBillInfo;
        })
    }

    return (
        <>
            <FilterableTable
                title="Customer Outstaing Receipts"
                EnableSerialNumber
                dataArray={reportData}
                columns={[
                    createCol('Do_Inv_No', 'string', 'Invoice No'),
                    createCol('Do_Date', 'date', 'Date'),
                    createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                    createCol('Paid_Amount', 'number'),
                    createCol('receiptPendingAmount', 'number', 'Outstanding'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Make Receipt',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const isChecked = selectedInvoice.findIndex(
                                bill => isEqualNumber(bill?.Do_Id, row?.Do_Id)
                            ) !== -1;

                            return (
                                <div>
                                    <input
                                        className="form-check-input shadow-none pointer"
                                        style={{ padding: '0.7em' }}
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                            if (isChecked) onSelect(row, true)
                                            else onSelect(row)
                                        }}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                ButtonArea={
                    <>
                        <div style={{ minWidth: '360px' }}>
                            <Select
                                value={filters?.ledger}
                                onChange={(e) => setFilters(pre => ({ ...pre, ledger: e }))}
                                options={[
                                    { value: '', label: 'ALL' },
                                    ...ledgers
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Select Leder Name"}
                                menuPortalTarget={document.body}
                            />
                        </div>
                    </>
                }
            />

            <div className="card mt-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Summary Data</span>

                    <Button
                        variant="outlined"
                        onClick={() => navigation('/erp/receipts/listReceipts/create', {
                            state: {
                                ...receiptGeneralInfoInitialValue,
                                credit_ledger: filters.ledger.value,
                                credit_ledger_name: filters.ledger.label,
                                credit_amount: selectedInvoice.reduce((acc, bill) => Addition(
                                    acc,
                                    Subraction(bill.Total_Invoice_value, bill.Paid_Amount)
                                ), 0)
                            }
                        })}
                        disabled={selectedInvoice.length === 0}
                    >Create Receipt</Button>

                </div>
                <div className="card-body">
                    <div className="row p-2">

                        <CountCard label="Pending Invoice" value={reportData.length} />

                        <CountCard
                            label="Total Invoice Value"
                            value={reportData.reduce((acc, bill) => Addition(
                                acc,
                                bill.Total_Invoice_value
                            ), 0)}
                        />

                        <CountCard
                            label="Outstanding"
                            value={reportData.reduce((acc, bill) => Addition(
                                acc,
                                Subraction(bill.Total_Invoice_value, bill.Paid_Amount)
                            ), 0)}
                        />

                        <CountCard
                            label="Previous Receipt"
                            value={reportData.reduce((acc, bill) => Addition(
                                acc,
                                bill.Paid_Amount
                            ), 0)}
                        />

                        <CountCard
                            label="Selected Value"
                            value={selectedInvoice.reduce((acc, bill) => Addition(
                                acc,
                                Subraction(bill.Total_Invoice_value, bill.Paid_Amount)
                            ), 0)}
                        />

                    </div>
                </div>
            </div>
        </>
    )
}

export default CustomerPendingReceipt;