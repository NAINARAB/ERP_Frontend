import { useState } from "react"


const initialTripMasterDetails = {
    Trip_Id: '',
    Challan_No: '',
    Branch_Id: '',
    Trip_Date: '',
    Vehicle_No: '',
    StartTime: '',
    EndTime: '',
    Trip_No: '',
    Trip_ST_KM: '',
    Trip_EN_KM: '',
    Trip_Tot_Kms: '',
    Created_By: '',
    Updated_By: '',
}

const initialTripDetailsValue = {
    Id: '',
    Trip_Id: '',
    STJ_Id: '',
    Batch_No: '',
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

const initialStaffsValue = {
    Id: '',
    Trip_Id: '',
    Involved_Emp_Id: '',
    Cost_Center_Type_Id: '',
}


const TripSheetCreation = ({ loadingOn, loadingOff }) => {

    const [filters, setFilters] = useState({})

    return (
        <>
        
        </>
    )
} 

export default TripSheetCreation;

export {
    initialTripMasterDetails,
    initialTripDetailsValue,
    initialStaffsValue,
}