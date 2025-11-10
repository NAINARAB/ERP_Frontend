import { checkIsNumber, ISOString, getSessionUser } from "../../../Components/functions";
const userDetails = getSessionUser().user;

export const initialOrderDetailsValue = {
    Sno: '',
    Id: '',
    BranchId: '',
    PoYear: '',
    PO_ID: '',
    LoadingDate: '',
    TradeConfirmDate: '',
    OwnerName: '',
    OwnerId: '',
    BrokerName: '',
    BrokerId: '',
    PartyId: 'select',
    PartyName: '',
    PartyAddress: '',
    PaymentCondition: '',
    Remarks: '',
    OrderStatus: 'New Order',
    Discount: 0,
    QualityCondition: '',
    PaymentDays: 0,
    CreatedBy: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
}

export const initialItemDetailsValue = {
    Id: '',
    Sno: '',
    OrderId: '',
    ItemId: '',
    ItemName: '',
    Weight: '',
    Units: '',
    Rate: '',
    DeliveryLocation: '',
    Discount: '',
    QualityCondition: ''
}

export const initialDeliveryDetailsValue = {
    indexValue: null,
    Id: '',
    Sno: '',
    OrderId: '',
    Trip_Id: '',
    Trip_Item_SNo: '',
    LocationId: '',
    Location: '',
    TransporterIndex: '',
    ArrivalDate: '',
    ItemId: '',
    ItemName: '',
    Concern: '',
    BillNo: '',
    BillDate: '',
    BilledRate: 0,
    Quantity: '',
    Weight: '',
    Units: '',
    BatchLocation: '',
    PendingQuantity: '',
    CreatedBy: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : ''
}

export const initialTranspoterDetailsValue = {
    indexValue: null,
    Id: '',
    OrderId: '',
    Loading_Load: '',
    Loading_Empty: '',
    Unloading_Load: '',
    Unloading_Empty: '',
    EX_SH: '',
    DriverName: '',
    VehicleNo: '',
    PhoneNumber: '',
    CreatedBy: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
}

export const initialStaffDetailsValue = {
    Id: '',
    OrderId: '',
    EmployeeId: '',
    CostType: '',
}