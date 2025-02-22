import { ISOString } from "../../../Components/functions"

export const tripMasterDetails = {
    Trip_Id: '',
    Challan_No: '',
    Branch_Id: '',
    Trip_Date: ISOString(),
    Vehicle_No: '',
    StartTime: '',
    EndTime: '',
    Trip_No: '',
    Trip_ST_KM: '',
    Trip_EN_KM: '',
    Trip_Tot_Kms: '',
    Created_By: '',
    Updated_By: '',
    DO_Date:ISOString(),
    Delivery_Person_Id:''
}

export const tripDetailsColumns = {
    Id: '',
    Trip_Id: '',
    Batch_No: '',
    Journal_no: '',
    From_Location: '',
    To_Location: '',
    S_No: '',
    Reason: '',
    Product_Id: '',
    HSN_Code: '',
    QTY: '',
    KGS: '',
    GST_Inclusive: '',
    IS_IGST: '',
    Gst_Rate: '',
    Gst_P: '',
    Cgst_P: '',
    Sgst_P: '',
    Igst_P: '',
    Taxable_Value: '',
    Round_off: '',
    Total_Value: '',
    Trip_From: '',
    Party_And_Branch_Id: '',
    Transporter_Id: '',
    Dispatch_Date: '',
    Delivery_Date: '',
    Created_By: '',
    Updated_By: '',
}

export const tripStaffsColumns = {
    Id: '',
    Trip_Id: '',
    Involved_Emp_Id: '',
    Cost_Center_Type_Id: '',
    Emp_Name: '',
}