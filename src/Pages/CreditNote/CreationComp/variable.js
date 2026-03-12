import { getSessionUser, ISOString, toArray, toNumber } from "../../../Components/functions";

const storage = getSessionUser()?.user || {};

export const creditNoteGeneralInfo = {
    CR_Id: '',
    CR_No: '',
    CR_Year: '',
    CR_Inv_No: '',

    Voucher_Type: '',
    CR_Date: ISOString(),
    Retailer_Id: '',
    Retailer_Name: '',      // for Front-end purpose
    Branch_Id: storage.BranchId || '',
    GST_Inclusive: 2,
    IS_IGST: 0,
    Narration: '',
    Cancel_status: 3,

    CSGT_Total: 0,
    SGST_Total: 0,
    IGST_Total: 0,
    Total_Expences: 0,
    Round_off: 0,
    Total_Before_Tax: 0,
    Total_Tax: 0,
    Total_Invoice_value: 0,
    Stock_Item_Ledger_Name: '',

    Ref_Inv_Number: '',
    Ref_Inv_Date: null,

    Mailing_Name: '',
    Mailing_Address: '',
    Mailing_Phone: '',
    Mailing_City: '',
    Mailing_GST: '',
    Mailing_State: '',

    Alter_Reason: '',
    paymentDueDays: 0,

    Alter_Id: '',
    Created_by: storage?.UserId,
    Altered_by: storage?.UserId,
    Created_on: '',
    Alterd_on: '',
}

export const creditNoteDetailsInfo = {
    rowId: '',
    CR_St_Id: '',
    CR_Date: '',
    CR_Id: '',

    GoDown_Id: '',
    Godown_Stock: 0,
    S_No: '',
    Item_Id: '',
    Item_Name: '',
    HSN_Code: '',
    Taxble: '',
    Batch_Name: '',

    Bill_Qty: '',
    Alt_Bill_Qty: '',
    Act_Qty: '',
    Alt_Act_Qty: '',
    Free_Qty: '',
    Total_Qty: '',

    Item_Rate: '',
    Taxable_Rate: '',
    Amount: '',

    Unit_Id: '',
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

export const creditNoteExpencesInfo = {
    Id: '',
    CR_Id: '',
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

export const creditNoteStaffInfo = {
    Id: '',
    CR_Id: '',
    Emp_Id: '',
    Emp_Name: '',       // for Front-end purpose
    Emp_Type_Id: '',
}

export const defaultStaffTypes = (costTypes = []) => {
    const defaultStaffTypes = ['Broker', 'Others5', 'Others6', 'Transport']
    return toArray(costTypes).filter(staff => defaultStaffTypes.includes(staff?.Cost_Category)).map(staff => ({
        ...creditNoteStaffInfo,
        Emp_Type_Id: staff?.Cost_Category_Id
    }))
}

export const retailerOutstandingDetails = {
    outstanding: 0,
    creditLimit: 0,
    creditDays: 0,
    recentDate: new Date(),
    invoiceCreationStatus: null,
    forceCreateInvoice: false,
    dialog: false,
}
