import { checkIsNumber, ISOString, storageValue } from "../../../Components/functions";

export const paymentGeneralInfoInitialValue = {
    pay_id: '',
    year_id: '',
    payment_voucher_type_id: '',
    payment_sno: '',
    payment_invoice_no: '',
    payment_date: ISOString(),
    pay_bill_type: 3,
    credit_ledger: '',
    credit_ledger_name: 'Select',
    credit_amount: 0,
    debit_ledger: '',
    debit_ledger_name: 'Select',
    debit_amount: 0,
    remarks: '',
    bank_date: '',
    status: 1,
    created_by: checkIsNumber(storageValue?.UserId) ? storageValue?.UserId : '',
    altered_by: checkIsNumber(storageValue?.UserId) ? storageValue?.UserId : '',
    created_on: '',
    alterd_on: '',
}

export const paymentBillInfoInitialValue = {
    auto_id: '',
    // general info
    created_on: '',
    payment_id: '',
    payment_no: '',
    payment_date: '',
    bill_type: '',
    DR_CR_Acc_Id: '',
    
    // form values
    pay_bill_id: '',
    JournalBillType: '',
    bill_name: '',
    bill_amount: 0,
    Debit_Amo: 0,
    Credit_Amo: 0,

    // frontEndColumns
    PurchaseInvoiceDate: '',
    StockJournalDate: '',
    TotalPaidAmount: 0,
    PendingAmount: 0,
}

export const paymentCostingInfoInitialValue = {
    // backend
    auto_id: '',
    payment_id: '',
    payment_no: '',
    payment_date: '',
    bill_type : '',
    Debit_Ledger_Id: '',
    created_on: '',

    // frontend 
    pay_bill_id: '',
    JournalBillType: '',
    item_id: '',
    item_name: '',
    expence_value: 0,

    // to show previous payment (frontend only).
    itemQuantity: 0,
    PaidAmount: 0,
}

export const paymentTypes = [
    {
        value: 1,
        label: 'VENDOR - PURCHASE INVOICE'
    },
    {
        value: 2,
        label: 'EXPENCES / OTHERS'
    },
    {
        value: 3,
        label: 'EXPENCES - STOCK JOURNAL'
    },
    {
        value: 4,
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