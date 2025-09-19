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
    Narration: "",
    ContraStatus: 1,
    Chequeno: '',
    ChequeDate: '',
    TransactionType: '',
    CreatedBy: checkIsNumber(user?.UserId) ? user.UserId : "",
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