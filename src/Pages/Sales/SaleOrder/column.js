import { getSessionUser, ISOString } from "../../../Components/functions"

const storage = getSessionUser().user;

export const saleOrderGeneralInfo = {
    So_Id: '',
    So_Inv_No: '',
    So_Year: '',
    So_Branch_Inv_Id: '',

    So_Date: ISOString(),
    Retailer_Id: '',
    Retailer_Name: '',
    Sales_Person_Id: '',
    Branch_Id: '',
    VoucherType: '',
    GST_Inclusive: 2,
    IS_IGST: 0,
    Narration: '',
    isConverted: '',
    Cancel_status: 1,
    
    CSGT_Total: 0,
    SGST_Total: 0,
    IGST_Total: 0,
    Round_off: 0,
    Total_Before_Tax: 0,
    Total_Tax: 0,
    Total_Invoice_value: 0,

    Created_by: storage?.UserId,
    Altered_by: storage?.UserId,
    Approved_By: '',
    Approve_Status: '',

    Created_on: '',
    Alterd_on: '',
    Trans_Type: '',
    Alter_Id: '',
}

export const saleOrderStockInfo = {
    // front-end purpose
    BrandID: '',
    Brand: '',
    GroupID: '',
    Group: '',

    // backend generated
    SO_St_Id: '',
    So_Date: '',
    Sales_Order_Id: '',
    S_No: '',

    // from entry
    Pre_Id: '',
    Item_Id: '',
    Item_Rate: 0,
    Bill_Qty: 0,
    Amount: 0,
    HSN_Code: '',
    Unit_Id: '',
    Unit_Name: '',

    // others
    Free_Qty: 0,
    Total_Qty: 0,

    // from product master  
    Taxble: 0, // 0 means tax not applicable
    Taxable_Rate: 0,
    Taxable_Amount: 0,
    Tax_Rate: 0,
    Cgst: 0,
    Cgst_Amo: 0,
    Sgst: 0,
    Sgst_Amo: 0,
    Igst: 0,
    Igst_Amo: 0,
    Final_Amo: 0,

    // generated from server
    Created_on: '',
}

export const saleOrderStaffInfo = {
    Id: '', 
    So_Id: '', 
    Involved_Emp_Id: '', 
    EmpName: '',
    Cost_Center_Type_Id: '',
    EmpType: ''
}