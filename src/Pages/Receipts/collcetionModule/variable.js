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
    collection_account: '',
    payment_status: '',
    latitude: '',
    longitude: '',
    collected_by: '',
    total_amount: 0,
    created_on: '',
    alterd_on: '',
    narration: '',
    verify_status: 0,
    bank_date: '',
    created_by: storage.UserId,
    updated_by: storage.UserId,
    verified_by: storage.UserId,
    verified_at: '',
};

export const receiptDetailsInfo = {
    auto_id: '',
    collection_id: '',
    bill_id: '',
    bill_amount: 0,
    collected_amount: 0
};