import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save } from "@mui/icons-material";
import { toast } from "react-toastify";

import { Addition, checkIsNumber, isEqualNumber, ISOString, isValidObject, Subraction, toArray } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import { receiptValueInitialValue, receiptGeneralInfoInitialValue } from "./variable";

import SalesInvoiceReceipt from "./salesReceipt";
import ChooseReceiptComponent from "./chooseReceipt";
import ExpenceReceipt from "./expencesReceipt";


const initialSelectValue = { value: '', label: '' };
const filterInitialValue = {
    receiptInvoice: initialSelectValue,
    debitAccount: initialSelectValue,
    creditAccount: initialSelectValue,
    receiptType: initialSelectValue,
    journalType: initialSelectValue,
    itemFilter: initialSelectValue,
    journalDate: '',
    selectReceiptDialog: false,
    selectSalesInvoice: false,
    selectStockJournal: false,
}

const AddPaymentReference = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const cellStyle = { minWidth: '130px' };
    const cellHeadStype = { width: '150px' };

    const [receiptValue, setReceiptValue] = useState(receiptGeneralInfoInitialValue);
    const [receiptBillInfo, setReceiptBillInfo] = useState([]);
    const [receiptCostingInfo, setReceiptCostingInfo] = useState([]);

    const [baseData, setBaseData] = useState({
        accountGroup: [],
        accounts: [],
        receiptInvoiceSearchResult: [],
        stockJournalSearchResult: [],
        salesInvoiceSearchResult: [],
        itemDropDownData: [],
        journalVoucherData: [],
    });

    const [filters, setFilters] = useState(filterInitialValue)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    accountGroupResponse,
                    accountResponse,
                ] = await Promise.all([
                    fetchLink({ address: `payment/accountGroup` }),
                    fetchLink({ address: `payment/accounts` }),
                ]);

                const accountGroup = toArray(accountGroupResponse.success ? accountGroupResponse.data : []).sort(
                    (a, b) => String(a?.Group_Name).localeCompare(b?.Group_Name)
                );
                const accounts = toArray(accountResponse.success ? accountResponse.data : []).sort(
                    (a, b) => String(a?.Account_name).localeCompare(b?.Account_name)
                );

                updateBaseData('accountGroup', accountGroup);
                updateBaseData('accounts', accounts);

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, [])

    useEffect(() => {
        if (!isEqualNumber(receiptValue.receipt_bill_type, 1) || !receiptValue.credit_ledger || !checkIsNumber(receiptValue.credit_ledger)) {
            updateBaseData('salesInvoiceSearchResult', []);
            return;
        }

        fetchLink({
            address: `receipt/receiptMaster/pendingSalesInvoiceReceipt?Acc_Id=${receiptValue.credit_ledger}`,
        }).then(data => {
            if (data.success) {
                updateBaseData('salesInvoiceSearchResult', toArray(data.data));
            }
        }).catch(e => console.error(e))
    }, [receiptValue.credit_ledger, receiptValue.receipt_bill_type]);

    useEffect(() => {
        if (
            !checkIsNumber(receiptValue.receipt_id) 
            || !checkIsNumber(receiptValue.receipt_bill_type)
            || (
                !isEqualNumber(receiptValue.receipt_bill_type, 1)
                && !isEqualNumber(receiptValue.receipt_bill_type, 2)
            )
        ) {
            return;
        }

        fetchLink({
            address: `receipt/receiptMaster/againstRef?receipt_id=${receiptValue.receipt_id}`
        }).then(data => {
            if (data.success) {
                const reSturc = toArray(data.data).map(bill => ({
                    ...bill,
                    SalesInvoiceDate: bill.referenceBillDate,
                    StockJournalDate: bill.referenceBillDate,
                    TotalPaidAmount: bill.totalPaidAmount,
                    PendingAmount: Subraction(bill?.Total_Invoice_value, bill.totalPaidAmount),
                }));
                setReceiptBillInfo(reSturc);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `receipt/receiptMaster/againstRef/costingInfo?receipt_id=${receiptValue.receipt_id}`
        }).then(data => {
            if (data.success) {
                setReceiptCostingInfo(toArray(data.data));
            }
        }).catch(e => console.error(e));

    }, [receiptValue.receipt_id, receiptValue.receipt_bill_type])

    useEffect(() => {
        if (isValidObject(editValues)) {
            setReceiptValue(
                Object.fromEntries(
                    Object.entries(receiptGeneralInfoInitialValue).map(([key, value]) => {
                        if (key === 'receipt_date') return [key, editValues[key] ? ISOString(editValues[key]) : value];
                        return [key, editValues[key] ?? value]
                    })
                )
            );
        }
    }, [editValues])

    const updateBaseData = (key = '', value = []) => {
        setBaseData(pre => ({ ...pre, [key]: value }));
    }

    const updateFilterData = (key = '', value = []) => {
        setFilters(pre => ({ ...pre, [key]: value }));
    }

    const closeDialog = () => {
        updateFilterData('selectReceiptDialog', false);
        updateFilterData('selectSalesInvoice', false);
        updateFilterData('selectStockJournal', false);
    }

    const resetAll = () => {
        setReceiptValue(receiptGeneralInfoInitialValue);
        setReceiptBillInfo([]);
        setReceiptCostingInfo([]);
        setFilters(filterInitialValue);
        updateBaseData('receiptInvoiceSearchResult', []);
        updateBaseData('stockJournalSearchResult', []);
        updateBaseData('salesInvoiceSearchResult', []);
    }

    const TotalAgainstRef = useMemo(() => {
        return receiptBillInfo.reduce(
            (acc, invoice) => Addition(acc, invoice.Credit_Amo), 0
        )
    }, [receiptBillInfo]);

    const SavePayment = () => {
        if (TotalAgainstRef > receiptValue.debit_amount) return toast.warn('Receipt amount is invalid');

        fetchLink({
            address: `receipt/receiptMaster/againstRef`,
            method: 'POST',
            bodyData: {
                receipt_id: receiptValue.receipt_id,
                receipt_no: receiptValue.receipt_invoice_no,
                receipt_date: receiptValue.receipt_date,
                receipt_bill_type: receiptValue.receipt_bill_type,
                BillsDetails: toArray(receiptBillInfo),
                CostingDetails: toArray(receiptCostingInfo),
                DR_CR_Acc_Id: receiptValue.credit_ledger
            },
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                resetAll();
                navigate('/erp/receipts/listReceipts');
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e))
    }

    return (
        <>
            <div className="bg-white p-2 rounded-2">

                <div className="table-responsive">

                    {/* payment invoices */}
                    <div className="p-2 d-flex align-items-center mb-3">
                        <h5 className="m-0 flex-grow-1">Receipt Reference Creation</h5>

                        <Button
                            type="button"
                            variant='contained'
                            className="mx-1"
                            onClick={() => navigate('/erp/receipts/listReceipts')}
                        >back</Button>
                    </div>

                    {/* choose Payment */}
                    <ChooseReceiptComponent
                        cellHeadStype={cellHeadStype}
                        cellStyle={cellStyle}
                        receiptValue={receiptValue}
                        receiptBillInfo={receiptBillInfo}
                        filters={filters}
                        baseData={baseData}
                        setReceiptValue={setReceiptValue}
                        updateFilterData={updateFilterData}
                        updateBaseData={updateBaseData}
                        closeDialog={closeDialog}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />

                    {/* choose Purchase invoice */}
                    {isEqualNumber(receiptValue.receipt_bill_type, 1) && (
                        <SalesInvoiceReceipt
                            cellHeadStype={cellHeadStype}
                            cellStyle={cellStyle}
                            receiptValue={receiptValue}
                            filters={filters}
                            baseData={baseData}
                            setReceiptValue={setReceiptValue}
                            updateFilterData={updateFilterData}
                            updateBaseData={updateBaseData}
                            closeDialog={closeDialog}
                            receiptBillInfo={receiptBillInfo}
                            setReceiptBillInfo={setReceiptBillInfo}
                        />
                    )}

                    {/* choose Stock journal */}
                    {isEqualNumber(receiptValue.receipt_bill_type, 2) && (
                        <ExpenceReceipt
                            cellHeadStype={cellHeadStype}
                            cellStyle={cellStyle}
                            filters={filters}
                            baseData={baseData}
                            receiptValue={receiptValue}
                            receiptBillInfo={receiptBillInfo}
                            receiptCostingInfo={receiptCostingInfo}
                            setReceiptValue={setReceiptValue}
                            setReceiptBillInfo={setReceiptBillInfo}
                            setReceiptCostingInfo={setReceiptCostingInfo}
                            updateFilterData={updateFilterData}
                            updateBaseData={updateBaseData}
                            closeDialog={closeDialog}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}

                </div>

                <hr className="my-2" />

                <div className="p-2 d-flex justify-content-end">
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        disabled={
                            !checkIsNumber(receiptValue.receipt_id)
                            // || receiptBillInfo.length === 0
                        }
                        onClick={SavePayment}
                    >Save</Button>
                </div>

            </div>

        </>
    )
}

export default AddPaymentReference;