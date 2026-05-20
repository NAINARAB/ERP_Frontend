import { ISOString, checkIsNumber, getSessionUser } from "../../../Components/functions";
const user = getSessionUser().user;

export const contraIV = {
    ContraAutoId: "",
    ContraId: "",
    Year_Id: "",
    VoucherType: "",
    VoucherTypeGet: '',
    ContraNo: "",
    ContraVoucherNo: "",
    ContraDate: ISOString(),
    BranchId: "",
    DebitAccount: null,
    DebitAccountName: "",
    CreditAccount: null,
    CreditAccountName: "",
    BankName: "",
    BankDate: null,
    Amount: 0,
    ContraStatus: 1,
    Alter_Reason: '',
    Chequeno: '',
    ChequeDate: '',
    TransactionType: '',
    Narration: '',
    CreatedBy: checkIsNumber(user?.UserId) ? user.UserId : "",
    
    // reference column
    dr_cr: 'Cr',
    bill_id: null,
    bill_no: null,

    CreatedAt: "",
    UpdatedAt: "",
    AlterId: ""
};

export const contraStatus = [
    {
        label: 'New',
        value: 1
    },
    {
        label: 'Process',
        value: 2
    },
    {
        label: 'Completed',
        value: 3
    },
    {
        label: 'Canceled',
        value: 0
    },
]

export const contrarReference = {
    id: '',
    contra_id: '',
    contra_no: '',
    dr_cr: '',
    bill_id: '',
    bill_no: '',
    created_at: '',
    created_by: checkIsNumber(user?.UserId) ? user.UserId : ""
}