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

export const batchListingColumns = [
    { Field_Name: 'trans_date', Fied_Data: 'date', ColumnHeader: 'Date' },
    { Field_Name: 'batch', Fied_Data: 'string', ColumnHeader: 'Batch' },
    { Field_Name: 'productNameGet', Fied_Data: 'string', ColumnHeader: 'Product' },
    { Field_Name: 'godownName', Fied_Data: 'string', ColumnHeader: 'Godown' },
    { Field_Name: 'stockDays', Fied_Data: 'number', ColumnHeader: 'Stock Days' },
    { Field_Name: 'pendingQuantity', Fied_Data: 'number', ColumnHeader: 'Available Qty' },
    { Field_Name: 'consumedQuantity', Fied_Data: 'number', ColumnHeader: 'Consumed Qty' },
    { Field_Name: 'totalQuantity', Fied_Data: 'number', ColumnHeader: 'Max Qty' },
]