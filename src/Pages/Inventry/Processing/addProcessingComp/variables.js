import { getSessionUser, ISOString } from "../../../../Components/functions";

const { user } = getSessionUser();

export const initialStockJournalInfoValues = {
    PR_Id: '',
    PR_Inv_Id: '',
    Year_Id: '',
    Branch_Id: '',
    Process_no: '',
    P_No: '',

    Godownlocation: '',
    BillType: 'New',
    VoucherType: '',
    Process_date: ISOString(),
    Machine_No: '',
    StartDateTime: '',
    EndDateTime: '',
    ST_Reading: '',
    EN_Reading: '',
    Total_Reading: '',
    Narration: '',
    PR_Status: 'NEW',
    Created_By: user?.name,
    Updated_By: user?.name,
}

export const initialSoruceValue = {
    PRS_Id: '',
    PR_Id: '',
    Sour_Item_Id: '',
    Sour_Item_Name: 'Select',
    Sour_Goodown_Id: '',
    Godown_Name: 'Select',
    Sour_Batch_Lot_No: '',
    Sour_Qty: 0,
    Sour_Unit_Id: '',
    Sour_Unit: '',
    Sour_Rate: 0,
    Sour_Amt: 0,
}

export const initialDestinationValue = {
    PRS_Id: '',
    PR_Id: '',
    Dest_Item_Id: '',
    Dest_Item_Name: 'Select',
    Dest_Goodown_Id: '',
    Godown_Name: 'Select',
    Dest_Batch_Lot_No: '',
    Dest_Qty: 0,
    Dest_Unit_Id: '',
    Dest_Unit: '',
    Dest_Rate: 0,
    Dest_Amt: 0,
}

export const initialStaffInvolvedValue = {
    PR_Id: '',
    S_Id: '',
    Staff_Id: '',
    Staff_Name: '',
    Staff_Type_Id: '',
}

export const soruceAndDestination = [
    { source: 'Sour_Item_Id', destination: 'Dest_Item_Id' },
    { source: 'Sour_Item_Name', destination: 'Dest_Item_Name' },
    { source: 'Sour_Goodown_Id', destination: 'Dest_Goodown_Id' },
    { source: 'Sour_Batch_Lot_No', destination: 'Dest_Batch_Lot_No' },
    { source: 'Sour_Qty', destination: 'Dest_Qty' },
    { source: 'Sour_Unit_Id', destination: 'Dest_Unit_Id' },
    { source: 'Sour_Unit', destination: 'Dest_Unit' },
    { source: 'Sour_Rate', destination: 'Dest_Rate' },
    { source: 'Sour_Amt', destination: 'Dest_Amt' },
];