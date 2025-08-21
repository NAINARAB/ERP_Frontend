import { checkIsNumber, ISOString, getSessionUser } from "../../../Components/functions";
const userDetails = getSessionUser().user;

export const journalGeneralInfoIV = {
    JournalAutoId: '',
    JournalId: '',
    Year_Id: '',
    VoucherType: '',
    VoucherTypeGet: '',
    JournalNo: '',
    JournalVoucherNo: '',
    JournalDate: ISOString(),
    BranchId: '',
    Narration: '',
    JournalStatus: 1,
    CreatedBy: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
    CreatedAt: '',
    UpdatedAt: '',
    AlterId: '',
}

export const journalEntriesInfoIV = {
    LineId: '',
    LineNum: '',
    JournalAutoId: '',
    JournalId: '',
    JournalVoucherNo: '',
    JournalDate: '',
    Acc_Id: null,
    AccountGet: '',
    DrCr: '',
    Amount: 0,
    Remarks: '',
    Entries: [],
}

export const journalBillReferenceIV = {
    autoGenId: '',
    LineId: '',
    LineNum: '',
    JournalAutoId: '',
    JournalId: '',
    JournalVoucherNo: '',
    JournalDate: '',
    Acc_Id: '',
    DrCr: '',
    RefId: '',
    RefNo: '',
    RefType: '',
    Amount: '',
}

export const journalStatus = [
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
];