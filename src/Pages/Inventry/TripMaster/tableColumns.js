import { ISOString } from "../../../Components/functions";
import { getSessionUser } from "../../../Components/functions";

const { user } = getSessionUser();

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
    Godownlocation: '',
    LoadingLoad: '',
    LoadingEmpty: '',
    UnloadingLoad: '',
    UnloadingEmpty: '',
    MachineNo: '',
    PhoneNumber: '',
    BillType: 'MATERIAL INWARD',
    VoucherType: '',
    Narration: '',
    TripStatus: 'New',
    Created_By: user.UserId,
    Updated_By: user.UserId,
}

export const tripDetailsColumns = {
    Id: '',
    Trip_Id: '',
    Delivery_Id: '',
    Arrival_Id: '',
    Batch_No: '',
    From_Location: '',
    To_Location: '',
    Concern: '',
    BillNo: '',
    BatchLocation: '',
    Product_Id: '',
    HSN_Code: '',
    QTY: '',
    KGS: '',
    Unit_Id: '',
    Units: '',
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
}

export const tripStaffsColumns = {
    Id: '',
    Trip_Id: '',
    Involved_Emp_Id: '',
    Cost_Center_Type_Id: '',
    Emp_Name: '',
}

export const initialArrivalValue = {
    Arr_Id: '',
    Arrival_Date: ISOString(),
    Batch_No: '',
    From_Location: '',
    To_Location: '',
    Concern: '',
    BillNo: '',
    BatchLocation: '',
    Product_Id: '',
    HSN_Code: '',
    QTY: '',
    KGS: '',
    Unit_Id: '',
    Units: '',
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
    Created_By: '',
    CreatedAt: user.UserId,
    Updated_By: user.UserId,
}