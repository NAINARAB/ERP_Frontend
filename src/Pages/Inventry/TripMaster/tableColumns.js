import { checkIsNumber, ISOString } from "../../../Components/functions";
import { getSessionUser } from "../../../Components/functions";

const userDetails = getSessionUser().user;

export const tripTypes = [
    {
        value: 'MATERIAL_INWARD',
        label: 'Material Inward'
    },
    {
        value: 'OTHER_GODOWN',
        label: 'Godown Stock Transfer'
    }
];

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
    Created_By: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
    Updated_By: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
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
    From_Location: 0,
    To_Location: 0,
    Concern: '',
    BillNo: '',
    BatchLocation: '',
    Product_Id: 0,
    HSN_Code: '',
    QTY: 0,
    KGS: 0,
    Unit_Id: 0,
    Units: '',
    GST_Inclusive: 0,
    IS_IGST: 0,
    Gst_Rate: 0,
    Gst_P: 0,
    Cgst_P: 0,
    Sgst_P: 0,
    Igst_P: 0,
    Taxable_Value: 0,
    Round_off: 0,
    Total_Value: 0,
    Created_By: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
    CreatedAt: '',
    Updated_By: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
}