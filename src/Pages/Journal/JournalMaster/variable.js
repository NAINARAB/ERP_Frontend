import { checkIsNumber, ISOString, getSessionUser } from "../../../Components/functions";
const userDetails = getSessionUser().user;

export const journalGeneralInfoIV = {
    JournalAutoId: '',
    Alter_Reason: '',
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
    approved_by: null,
    approved_by_get: '',
    cost_center_mapping: 0,
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
    isSundryParty: 0,
    DrCr: '',
    Amount: 0,
    Remarks: '',
    BillEntries: [],
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
    BillRefNo: '',
    Amount: '',
}

export const journalStaffInvolvedInfo = {
    id: '',
    JournalAutoId: '',
    Emp_Id: '',
    Emp_Name: '',
    Emp_Type_Id: '',
    Emp_Type_Name: '',
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