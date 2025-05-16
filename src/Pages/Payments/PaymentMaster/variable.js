import { checkIsNumber, ISOString, storageValue } from "../../../Components/functions";

export const paymentGeneralInfoInitialValue = {
    pay_id: '',
    year_id: '',
    payment_voucher_type_id: '',
    payment_sno: '',
    payment_invoice_no: '',
    payment_date: ISOString(),
    pay_bill_type: 1,
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
    payment_id: '',
    payment_no: '',
    payment_date: '',
    bill_type: '',
    pay_bill_id: '',
    bill_name: '',
    bill_amount: 0,
    DR_CR_Acc_Id: '',
    Debit_Amo: 0,
    Credit_Amo: 0,
    created_on: '',

    // frontEndColumns

    PurchaseInvoiceDate: '',
    TotalPaidAmount: 0,
    PendingAmount: 0,
}

export const paymentCostingInfoInitialValue = {
    pay_cost_id: '',
    payment_id: '',
    payment_no: '',
    pur_date: '',
    Debit_Ledger_Id: '',
    item_id: '',
    item_name: '',
    expence_id: '',
    expence_value: 0,
    created_on: '',
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