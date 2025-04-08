import { getSessionUser, ISOString } from "../../../Components/functions";
const storage = getSessionUser().user;

export const receiptGeneralInfo = {
    collection_id: '',
    collection_inv_no: '',
    voucher_id: '',
    collection_no: '',
    year_id: '',
    retailer_id: '',
    payed_by: '',
    collection_date: ISOString(),
    collection_type: 'CASH',
    total_amount: 0,
    latitude: '',
    longitude: '',
    created_on: '',
    alterd_on: '',
    collected_by: '',
    created_by: storage.UserId,
    updated_by: storage.UserId
};

export const receiptDetailsInfo = {
    auto_id: '',
    collection_id: '',
    bill_id: '',
    bill_amount: 0,
    collected_amount: 0,
    verify_status: 0,
    payment_status: 'ADMIN ENTRY',
    bank_date: '',
    narration: '',
    verified_by: storage.UserId,
    verified_at: '',
};