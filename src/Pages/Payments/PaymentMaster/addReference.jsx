import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Addition, checkIsNumber, isEqualNumber, ISOString, isValidObject, LocalDate, NumberFormat, stringCompare, Subraction, toArray } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import { paymentGeneralInfoInitialValue, paymentTypes } from "./variable";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import RequiredStar from "../../../Components/requiredStar";
import { Close, Done, Save, Search } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import PurchaseInvoicePayment from "./purchasePayment";
import ChoosePaymentComponent from "./choosePayment";
import { toast } from "react-toastify";
import ExpencePayment from "./expencesPayment";


const initialSelectValue = { value: '', label: '' };
const filterInitialValue = {
    paymentInvoice: initialSelectValue,
    debitAccount: initialSelectValue,
    creditAccount: initialSelectValue,
    paymentType: initialSelectValue,
    journalType: initialSelectValue,
    itemFilter: initialSelectValue,
    journalDate: '',
    selectPaymentDialog: false,
    selectPurchaseInvoice: false,
    selectStockJournal: false,
}

const AddPaymentReference = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const cellStyle = { minWidth: '130px' };
    const cellHeadStype = { width: '150px' };

    const [paymentGeneralInfo, setPaymentGeneralInfo] = useState(paymentGeneralInfoInitialValue)
    const [paymentBillInfo, setPaymentBillInfo] = useState([]);
    const [paymentCostingInfo, setPaymentCostingInfo] = useState([]);

    const [baseData, setBaseData] = useState({
        accountGroup: [],
        accounts: [],
        paymentInvoiceSearchResult: [],
        stockJournalSearchResult: [],
        purchaseInvoiceSearchResult: [],
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
        if (!isEqualNumber(paymentGeneralInfo.pay_bill_type, 1) || !paymentGeneralInfo.debit_ledger || !checkIsNumber(paymentGeneralInfo.debit_ledger)) {
            updateBaseData('purchaseInvoiceSearchResult', []);
            return;
        }

        fetchLink({
            address: `purchase/paymentPendingInvoices?Acc_Id=${paymentGeneralInfo.debit_ledger}`,
        }).then(data => {
            if (data.success) {
                updateBaseData('purchaseInvoiceSearchResult', toArray(data.data));
            }
        }).catch(e => console.log(e))
    }, [paymentGeneralInfo.debit_ledger, paymentGeneralInfo.pay_bill_type]);

    useEffect(() => {
        if (!checkIsNumber(paymentGeneralInfo.pay_id) || !checkIsNumber(paymentGeneralInfo.pay_bill_type)) {
            return;
        }

        fetchLink({
            address: `payment/paymentMaster/againstRef?payment_id=${paymentGeneralInfo.pay_id}`
        }).then(data => {
            if (data.success) {
                setPaymentBillInfo(data.data)
            }
        }).catch(e => console.log(e))
    }, [paymentGeneralInfo.pay_id, paymentGeneralInfo.pay_bill_type])

    useEffect(() => {
        if (isValidObject(editValues)) {
            setPaymentGeneralInfo(
                Object.fromEntries(
                    Object.entries(paymentGeneralInfoInitialValue).map(([key, value]) => {
                        if (key === 'payment_date') return [key, editValues[key] ? ISOString(editValues[key]) : value];
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
        updateFilterData('selectPaymentDialog', false);
        updateFilterData('selectPurchaseInvoice', false);
    }

    const resetAll = () => {
        setPaymentGeneralInfo(paymentGeneralInfoInitialValue);
        setPaymentBillInfo([]);
        setPaymentCostingInfo([]);
        setFilters(filterInitialValue);
        updateBaseData('paymentInvoiceSearchResult', []);
        updateBaseData('stockJournalSearchResult', []);
        updateBaseData('purchaseInvoiceSearchResult', []);
    }

    const TotalAgainstRef = useMemo(() => {
        return paymentBillInfo.reduce(
            (acc, invoice) => Addition(acc, invoice.Debit_Amo), 0
        )
    }, [paymentBillInfo]);

    const SavePayment = () => {
        if (TotalAgainstRef > paymentGeneralInfo.debit_amount) return toast.warn('Payment amount is invalid');

        fetchLink({
            address: `payment/paymentMaster/againstRef`,
            method: 'POST',
            bodyData: {
                payment_id: paymentGeneralInfo.pay_id,
                payment_no: paymentGeneralInfo.payment_invoice_no,
                payment_date: paymentGeneralInfo.payment_date,
                bill_type: paymentGeneralInfo.pay_bill_type,
                BillsDetails: toArray(paymentBillInfo)
            }
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                resetAll();
                navigate('/erp/payments/paymentList');
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.log(e))
    }

    return (
        <>
            <div className="bg-white p-2 rounded-2">

                <div className="table-responsive">

                    {/* payment invoices */}
                    <div className="p-2 d-flex align-items-center mb-3">
                        <h5 className="m-0 flex-grow-1">Payment Reference Creation</h5>

                        <Button
                            type="button"
                            variant='contained'
                            className="mx-1"
                            onClick={() => navigate('/erp/payments/paymentList')}
                        >back</Button>
                    </div>

                    {/* choose Payment */}
                    <ChoosePaymentComponent
                        cellHeadStype={cellHeadStype}
                        cellStyle={cellStyle}
                        paymentGeneralInfo={paymentGeneralInfo}
                        paymentBillInfo={paymentBillInfo}
                        filters={filters}
                        baseData={baseData}
                        setPaymentGeneralInfo={setPaymentGeneralInfo}
                        updateFilterData={updateFilterData}
                        updateBaseData={updateBaseData}
                        closeDialog={closeDialog}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />

                    {/* choose Purchase invoice */}
                    {isEqualNumber(paymentGeneralInfo.pay_bill_type, 1) && (
                        <PurchaseInvoicePayment
                            cellHeadStype={cellHeadStype}
                            cellStyle={cellStyle}
                            paymentGeneralInfo={paymentGeneralInfo}
                            filters={filters}
                            baseData={baseData}
                            setPaymentGeneralInfo={setPaymentGeneralInfo}
                            updateFilterData={updateFilterData}
                            updateBaseData={updateBaseData}
                            closeDialog={closeDialog}
                            paymentBillInfo={paymentBillInfo}
                            setPaymentBillInfo={setPaymentBillInfo}
                        />
                    )}

                    {/* choose Purchase invoice */}
                    {isEqualNumber(paymentGeneralInfo.pay_bill_type, 3) && (
                        <ExpencePayment
                            cellHeadStype={cellHeadStype}
                            cellStyle={cellStyle}
                            filters={filters}
                            baseData={baseData}
                            paymentGeneralInfo={paymentGeneralInfo}
                            paymentBillInfo={paymentBillInfo}
                            paymentCostingInfo={paymentCostingInfo}
                            setPaymentGeneralInfo={setPaymentGeneralInfo}
                            setPaymentBillInfo={setPaymentBillInfo}
                            setPaymentCostingInfo={setPaymentCostingInfo}
                            updateFilterData={updateFilterData}
                            updateBaseData={updateBaseData}
                            closeDialog={closeDialog}
                        />
                    )}

                </div>

                <hr className="my-2" />

                <div className="p-2 d-flex justify-content-end">
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        disabled={
                            !checkIsNumber(paymentGeneralInfo.pay_id)
                            || paymentBillInfo.length === 0
                        }
                        onClick={SavePayment}
                    >Save</Button>
                </div>

            </div>

        </>
    )
}

export default AddPaymentReference;