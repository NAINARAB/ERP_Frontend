import { getSessionUser, ISOString } from "../../../Components/functions"

const storage = getSessionUser().user;

export const purchaseOrderGeneralInfo = {
    PO_Id: '',
    Po_Inv_No: '',
    Po_Year: '',
    Po_Vou_Num: '',

    Po_Date: ISOString(),
    Retailer_Id: '',
    Retailer_Name: '',
    Branch_Id: '',
    VoucherType: '',
    GST_Inclusive: 2,
    IS_IGST: 0,
    Narration: '',
    Po_Status: 1,

    CSGT_Total: 0,
    SGST_Total: 0,
    IGST_Total: 0,
    Round_off: 0,
    Total_Before_Tax: 0,
    Total_Tax: 0,
    Total_Invoice_value: 0,

    Created_by: storage?.UserId,
    Altered_by: storage?.UserId,

    Created_on: '',
    Alterd_on: '',
    Trans_Type: '',
    Alter_Id: '',
    Alter_Reason: '',
}

export const purchaseOrderStockInfo = {
    // front-end purpose
    BrandID: '',
    Brand: '',
    GroupID: '',
    Group: '',

    // backend generated
    Id: '',
    PO_Id: '',
    po_uid: '',
    Serial_No: '',

    // from entry
    Item_Id: '',
    Item_Rate: 0,
    Bill_Qty: 0,
    Amount: 0,
    HSN_Code: '',
    Unit_Id: '',
    Unit_Name: '',
    Godown_Id: '',

    // others
    Free_Qty: 0,
    Total_Qty: 0,

    // from product master  
    Taxble: 0,
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

export const purchaseOrderStaffInfo = {
    Id: '',
    PO_Id: '',
    po_uid: '',
    Emp_Id: '',
    EmpName: '',
    Emp_Type_Id: '',
    EmpType: ''
}

export const tripDetailsInfo = {
    id: '',
    PO_Id: '',
    po_uid: '',
    trip_id: '',
}