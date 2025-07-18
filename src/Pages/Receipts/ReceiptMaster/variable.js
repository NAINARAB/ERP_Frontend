import { checkIsNumber, ISOString, getSessionUser } from "../../../Components/functions";
const userDetails = getSessionUser().user;

export const receiptGeneralInfoInitialValue = {
    receipt_id: '',
    year_id: '',
    receipt_voucher_type_id: '',
    receipt_sno: '',
    receipt_invoice_no: '',

    receipt_date: ISOString(),
    receipt_bill_type: 1,
    credit_ledger: '',
    credit_ledger_name: 'Select',
    credit_amount: 0,
    debit_ledger: '',
    debit_ledger_name: 'Select',
    debit_amount: 0,
    remarks: '',
    status: 1,
    
    check_no: '',
    check_date: '',
    bank_name: '',
    bank_date: '',
    
    created_by: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
    altered_by: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
    created_on: '',
    alterd_on: '',
}

export const receiptBillInfoInitialValue = {
    auto_id: '',
    // general info
    created_on: '',
    receipt_id: '',
    receipt_no: '',
    receipt_date: '',
    receipt_bill_type: '',
    DR_CR_Acc_Id: '',
    
    // form values
    bill_id: '',
    JournalBillType: '',
    bill_name: '',
    bill_amount: 0,
    Debit_Amo: 0,
    Credit_Amo: 0,

    // frontEndColumns
    SalesInvoiceDate: '',
    StockJournalDate: '',
    TotalPaidAmount: 0,
    PendingAmount: 0,
}

export const receiptCostingInfoInitialValue = {
    // backend
    auto_id: '',
    receipt_id: '',
    receipt_no: '',
    receipt_date: '',
    receipt_bill_type: '',
    Debit_Ledger_Id: '',
    created_on: '',

    // frontend 
    bill_id: '',
    JournalBillType: '',
    arr_id: '',
    item_id: '',
    item_name: '',
    expence_value: 0,

    // to show previous payment (frontend only).
    itemQuantity: 0,
    PaidAmount: 0,
}

export const receiptTypes = [
    {
        value: 1,
        label: 'CUSTOMER - SALES INVOICE'
    },
    {
        value: 2,
        label: 'EXPENCES - RETURN'
    },
    {
        value: 3,
        label: 'ON ACCOUNT'
    },
];

export const stockJournalTypes = [
    {
        label: 'MATERIAL INWARD',
        value: 1
    },
    {
        label: 'GODOWN TRANSFER',
        value: 2
    },
    {
        label: 'PROCESSING',
        value: 3
    },
]

export const receiptStatus = [
    {
        label: 'New',
        value: 1
    },
    {
        label: 'Process',
        value: 2
    },
    {
        label: 'Completed',
        value: 3
    },
    {
        label: 'Canceled',
        value: 0
    },
]