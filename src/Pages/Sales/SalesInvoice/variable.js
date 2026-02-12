import { getSessionUser, ISOString, toArray, toNumber } from "../../../Components/functions";

const storage = getSessionUser().user;

export function canCreateInvoice(data) {
    const {
        outstanding,
        creditLimit,
        creditDays,
        recentDate
    } = data;

    const baseDate = new Date(recentDate);

    const expiryDate = new Date(baseDate);
    expiryDate.setDate(expiryDate.getDate() + toNumber(creditDays));

    const today = new Date();

    const isOutstandingExceeded = toNumber(outstanding) > toNumber(creditLimit);
    const isCreditDaysCrossed = today > expiryDate;

    return !((toNumber(creditLimit) > 0 ? isOutstandingExceeded : false) || (toNumber(creditDays) > 0 ? isCreditDaysCrossed : false));
}

export const allowedUserTypesForPreviousDateSalesEdit = [0, 1];

export const retailerOutstandingDetails = {
    outstanding: 0,
    creditLimit: 0,
    creditDays: 0,
    recentDate: new Date(),
    invoiceCreationStatus: null,
    forceCreateInvoice: false,
    dialog: false,
}

export const retailerDeliveryAddressInfo = {
    id: null,
    retailerId: null,
    deliveryName: '',
    phoneNumber: '',
    cityName: '',
    deliveryAddress: '',
    gstNumber: '',
    stateName: '',
}

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
    Branch_Id: storage.BranchId || '',
    GST_Inclusive: 2,
    IS_IGST: 0,
    Narration: '',
    Cancel_status: 3,
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

    Ref_Inv_Number: '', // purchase invoice reference number
    deliveryAddressId: null,
    deliveryAddressDetails: retailerDeliveryAddressInfo, // retailer delivery address
    shipingAddressId: null,
    shipingAddressDetails: retailerDeliveryAddressInfo, // retailer shipping address

    Delivery_Status: 0,
    Payment_Mode: 0,
    Payment_Status: 0,
    Alter_Reason: '',
    paymentDueDays: 0,

    // Delivery_Time: '',
    // Delivery_Location: '',
    // Delivery_Latitude: '',
    // Delivery_Longitude: '',
    // Collected_By: '',
    // Collected_Status: '',
    // Payment_Ref_No: '',

    Alter_Id: '',
    Created_by: storage?.UserId,
    Altered_by: storage?.UserId,
    Created_on: '',
    Alterd_on: '',
}

export const salesInvoiceDetailsInfo = {
    rowId: '',
    DO_St_Id: '',
    Do_Date: '',
    Delivery_Order_Id: '',

    GoDown_Id: '',
    Godown_Stock: 0,
    S_No: '',
    Item_Id: '',                // From front-end
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

export const setAddress = (address, setFun) => {
    const {
        deliveryName = '', phoneNumber = '', cityName = '', deliveryAddress = '',
        gstNumber = '', stateName = '', id = null
    } = address;

    setFun(pre => ({
        ...pre,
        deliveryName,
        phoneNumber,
        cityName,
        deliveryAddress,
        gstNumber,
        stateName,
        id
    }));
}

export const defaultStaffTypes = (costTypes = []) => {
    const defaultStaffTypes = ['Broker', 'Others5', 'Transport']
    return toArray(costTypes).filter(staff => defaultStaffTypes.includes(staff?.Cost_Category)).map(staff => ({
        ...salesInvoiceStaffInfo,
        Emp_Type_Id: staff?.Cost_Category_Id
    }))
}