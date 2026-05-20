export const comparisonColorCode = [
    {
        reason: 'Only in ERP DB',
        color: '#eb4034',
        code: 1,
    },
    {
        reason: 'Only in Tally DB',
        color: '#eb4034',
        code: 2
    },
    {
        reason: 'Alter_Id Mismatch',
        color: '#eba834',
        code: 3
    },
    {
        reason: 'Child Table Mismatch',
        color: '#eb4034',
        code: 4
    },
]

export const fieldMap = {
    // Format: fieldLabel: [tallyKey, erpKey]
    "Invoice No": ["invoice_no", "Do_Inv_No"],
    "Invoice Date": ["invoice_date", "Do_Date"],
    "Tally ID": ["tally_id", "Tally_Id"],
    "Alter ID": ["alter_id", "Alter_Id"],
    "Sales Ledger / Retailer": ["sales_party_ledger_id", "Retailer_Id"],
    "Before Tax": ["invoice_value_before_tax", "Total_Before_Tax"],
    "After Tax": ["invoice_value_after_tax", "Total_Invoice_value"],
    "Round Off": ["round_off", "Round_off"],
    "Narration": ["narration", "Narration"],
    "Cancel Status": ["cancel_status", "Cancel_status"],
    "Created By": ["created_by", "Created_by"],
    "Altered By": ["altered_by", "Altered_by"],
    "Created On": ["created_on_date", "Created_on"],
    "Altered On": ["alterd_date", "Alterd_on"]
};
