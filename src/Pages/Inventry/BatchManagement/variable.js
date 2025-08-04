import { getSessionUser, checkIsNumber } from "../../../Components/functions";

const userDetails = getSessionUser().user;

export const batchGeneralInfo = {
    id: '',
    batch: '',
    item_id: '',
    godown_id: '',
    quantity: 0,
    rate: 0,
    created_at: '',
    created_by: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
}

export const batchMasterTransaction = {
    id: '',
    batch_id: '',
    item_id: '',
    godown_id: '',
    quantity: 0,
    type: '',
    reference_id: '',
    created_at: '',
    created_by: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
}