import { getSessionUser } from "../../../../Components/functions";

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
    Process_date: '',
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
    SJD_Id: '',
    STJ_Id: '',
    Sour_Item_Id: '',
    Sour_Item_Name: '',
    Sour_Goodown_Id: '',
    Sour_Batch_Lot_No: '',
    Sour_Qty: '',
    Sour_Unit_Id: '',
    Sour_Unit: '',
    Sour_Rate: '',
    Sour_Amt: '',
}

export const initialDestinationValue = {
    SJD_Id: '',
    STJ_Id: '',
    Dest_Item_Id: '',
    Dest_Item_Name: '',
    Dest_Goodown_Id: '',
    Dest_Batch_Lot_No: '',
    Dest_Qty: '',
    Dest_Unit_Id: '',
    Dest_Unit: '',
    Dest_Rate: '',
    Dest_Amt: '',
}

export const initialStaffInvolvedValue = {
    STJ_Id: '',
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