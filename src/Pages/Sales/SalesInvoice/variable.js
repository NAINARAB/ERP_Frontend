import { getSessionUser, ISOString } from "../../../Components/functions";

const storage = getSessionUser().user;

export const salesInvoiceGeneralInfo = {
    Do_Id: '',
    Do_No: '',
    Do_Year: '',
    Do_Inv_No: '',
    
    Voucher_Type: '',
    Do_Date: ISOString(),
    Retailer_Id: '',
    Retailer_Name: '',      // for Front-end purpose
    Delivery_Person_Id: '', // not used in sales invoice
    Branch_Id: '',
    GST_Inclusive: 2,
    IS_IGST: 0,
    Narration: '',
    Cancel_status: 1,
    So_No: '',              // SALE ORDER ID (ONE TO MANY INVOICE MAPPING)
    Trans_Type: '',

    CSGT_Total: 0,
    SGST_Total: 0,
    IGST_Total: 0,
    Total_Expences: 0,
    Round_off: 0,
    Total_Before_Tax: 0,
    Total_Tax: 0,
    Total_Invoice_value: 0,
    Stock_Item_Ledger_Name: '',

    // Delivery_Status: '',
    // Delivery_Time: '',
    // Delivery_Location: '',
    // Delivery_Latitude: '',
    // Delivery_Longitude: '',
    // Collected_By: '',
    // Collected_Status: '',
    // Payment_Mode: '',
    // Payment_Ref_No: '',
    // Payment_Status: '',

    Alter_Id: '',
    Created_by: storage?.UserId,
    Altered_by: storage?.UserId,
    Created_on: '',
    Alterd_on: '',
}


export const salesInvoiceDetailsInfo = {
    DO_St_Id: '',
    Do_Date: '',
    Delivery_Order_Id: '',

    GoDown_Id: '',
    S_No: '',
    Item_Id: '',                // From front-end
    Item_Name: '',
    HSN_Code: '',
    Taxble: '',
    Batch_Name: '',

    Bill_Qty: '',               // From front-end
    Act_Qty: '',
    Alt_Act_Qty: '',
    Free_Qty: '',
    Total_Qty: '',

    Item_Rate: '',              // From front-end
    Taxable_Rate: '',
    Amount: '',                 // From front-end
    
    Unit_Id: '',                // From front-end
    Unit_Name: '',
    Act_unit_Id: '',
    Alt_Act_Unit_Id: '',
    
    Taxable_Amount: '',
    Tax_Rate: '',

    Cgst: '',
    Sgst: '',
    Igst: '',
    Cgst_Amo: '',
    Sgst_Amo: '',
    Igst_Amo: '',

    Final_Amo: '',
    Created_on: '',
}


export const salesInvoiceExpencesInfo = {
    Id: '',
    Do_Id: '',
    Sno: '',
    Expense_Id: '',
    Cgst: 0,
    Cgst_Amo: 0,
    Sgst: 0,
    Sgst_Amo: 0,
    Igst: 0,
    Igst_Amo: 0,
    Expence_Value: 0
}


export const salesInvoiceStaffInfo = {
    Id: '',
    Do_Id: '',
    Emp_Id: '',
    Emp_Name: '',       // for Front-end purpose
    Emp_Type_Id: '',
}