import { createCol } from "../../Components/filterableTable2"

export const dayBookColumn = (moduleName) => {
    const SalesLedgerName = createCol('Purticular', 'string', 'Ledger');
    const SalesTotal = createCol('total_invoice_value', 'number', 'Invoice Value');
    // common Columns
    const ModuleID = createCol('ModuleID', 'string', 'InvoiceNo')
    const EventDate = createCol('EventDate', 'date', 'Date');
    const VoucherName = createCol('VoucherName', 'string', 'Voucher');
    const DebitLedger = createCol('DebitLedger', 'string', 'Debit A/c');
    const DebitAmt = createCol('DebitAmt', 'number', 'Debit (₹)');
    const CreditLedger = createCol('CreditLedger', 'string', 'Credit A/c');
    const CreditAmt = createCol('CreditAmt', 'number', 'Credit (₹)');

    switch (moduleName) {
        case 'Sales':
            return [ModuleID, EventDate, VoucherName, SalesLedgerName, SalesTotal]
        case 'Payment':
        case 'Receipt':
        case 'Journal':
        case 'Contra': 
            return [ModuleID, EventDate, VoucherName, DebitLedger, DebitAmt, CreditLedger, CreditAmt]
        default:
            return []
    }
}