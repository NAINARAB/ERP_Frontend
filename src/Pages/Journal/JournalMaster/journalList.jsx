import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material"
import FilterableTable, { createCol, formatString } from "../../../Components/filterableTable2"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, getSessionFiltersByPageId, isEqualNumber, ISOString, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber } from "../../../Components/functions";
import { ClearAll, Edit, FilterAlt, Search } from "@mui/icons-material";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from "react-select";
import { journalStatus } from "./variable";
import { useMemo } from "react";

const JournalList = ({ loadingOn, loadingOff, pageID, AddRights, EditRights }) => {
    const nav = useNavigate();
    // const [dataArray, setDataArray] = useState([]);
    const [generalInfo, setGeneralInfo] = useState([]);
    const [entriesInfo, setEntriesInfo] = useState([]);
    const [billReferenceInfo, setBillReferenceInfo] = useState([]);

    const sessionValue = sessionStorage.getItem('filterValues');

    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        voucherType_Filter: { label: 'ALL', value: '' },
        debit_accounts_Filter: { label: 'ALL', value: '' },
        credit_accounts_Filter: { label: 'ALL', value: '' },
        created_by_Filter: { label: 'ALL', value: '' },
        journalStatus: '',
    };

    const [filters, setFilters] = useState({
        ...defaultFilters,
        filterDialog: false,
    });

    const [filterDropDown, setFilterDropDown] = useState({
        voucherType: [],
        debit_accounts: [],
        credit_accounts: [],
        created_by: [],
    })

    useEffect(() => {
        const sessionFilterValues = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            voucherType_Filter = defaultFilters.voucherType_Filter,
            debit_accounts_Filter = defaultFilters.debit_accounts_Filter,
            credit_accounts_Filter = defaultFilters.credit_accounts_Filter,
            created_by_Filter = defaultFilters.created_by_Filter,
            journalStatus = defaultFilters.journalStatus,
        } = sessionFilterValues;

        setFilters(pre => ({
            ...pre,
            Fromdate: Fromdate,
            Todate: Todate,
            voucherType_Filter,
            debit_accounts_Filter,
            credit_accounts_Filter,
            created_by_Filter,
            journalStatus,
        }));

    }, [sessionValue, pageID]);

    useEffect(() => {
        const sessionFilterValues = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            voucherType_Filter = defaultFilters.voucherType_Filter,
            debit_accounts_Filter = defaultFilters.debit_accounts_Filter,
            credit_accounts_Filter = defaultFilters.credit_accounts_Filter,
            created_by_Filter = defaultFilters.created_by_Filter,
            journalStatus = defaultFilters.journalStatus
        } = sessionFilterValues;

        fetchLink({
            address: `journal/journalMaster?
                Fromdate=${Fromdate}&
                Todate=${Todate}&
                voucher=${voucherType_Filter?.value || ''}&
                debit=${debit_accounts_Filter?.value || ''}&
                credit=${credit_accounts_Filter?.value || ''}&
                createdBy=${created_by_Filter?.value || ''}&
                status=${journalStatus}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                setGeneralInfo(toArray(data.others?.generalInfo));
                setEntriesInfo(toArray(data.others?.entriesInfo));
                setBillReferenceInfo(toArray(data.others?.billReferencesInfo));
            }
        }).catch(e => console.error(e))
    }, [sessionValue, pageID]);

    useEffect(() => {
        fetchLink({
            address: `journal/filtersValues`
        }).then(data => {
            if (data.success) {
                setFilterDropDown(pre => ({
                    ...pre,
                    voucherType: toArray(data?.others?.voucherType),
                    debit_accounts: toArray(data?.others?.debit_accounts),
                    credit_accounts: toArray(data?.others?.credit_accounts),
                    created_by: toArray(data?.others?.created_by)
                }))
            }
        })
    }, []);

    const reportData = useMemo(() => {
        let transformedData = [];

        generalInfo.forEach((journal, jourInd) => {
            const billRefData = billReferenceInfo.filter(item => item.JournalAutoId === journal.JournalAutoId);

            const debitSide = entriesInfo.filter(item => (
                item.JournalAutoId === journal.JournalAutoId
                && item.DrCr === 'Dr'
            )).map(entry => ({
                ...entry,
                Entries: billRefData.filter(bill => (
                    bill.LineId === entry.LineId
                    && bill.DrCr === 'Dr'
                    && isEqualNumber(bill.Acc_Id, entry.Acc_Id)
                ))
            }));

            const creditSide = entriesInfo.filter(item => (
                item.JournalAutoId === journal.JournalAutoId
                && item.DrCr === 'Cr'
            )).map(entry => ({
                ...entry,
                Entries: billRefData.filter(bill => (
                    bill.LineId === entry.LineId
                    && bill.DrCr === 'Cr'
                    && isEqualNumber(bill.Acc_Id, entry.Acc_Id)
                ))
            }));

            const maxRows = Math.max(debitSide.length, creditSide.length);
            const sNo = ++jourInd;
            const statusGet = journalStatus.find(sts => isEqualNumber(sts.value, journal.JournalStatus))?.label || '';

            transformedData.push({
                sno: sNo,
                date: ISOString(journal.JournalDate),
                voucherNo: journal.JournalVoucherNo,
                debitAcc: '',
                creditAcc: '',
                debitAmount: debitSide.reduce((acc, orders) => Addition(acc, orders?.Amount), 0),
                creditAmount: creditSide.reduce((acc, orders) => Addition(acc, orders?.Amount), 0),
                voucherType: journal.VoucherTypeGet,
                status: statusGet,
                branch: journal.BranchGet,
                createdBy: journal.CreatedByGet,
                journalObject: { ...journal, Entries: [...debitSide, ...creditSide], billReferenceInfo: billRefData }
            });

            for (let i = 0; i < maxRows; i++) {
                transformedData.push({
                    sno: sNo + '.' + (i + 1),
                    date: '',
                    voucherNo: '',
                    debitAcc: debitSide[i]?.AccountNameGet || '',
                    creditAcc: creditSide[i]?.AccountNameGet || '',
                    debitAmount: checkIsNumber(debitSide[i]?.Amount) ? NumberFormat(debitSide[i]?.Amount) : '',
                    creditAmount: checkIsNumber(creditSide[i]?.Amount) ? NumberFormat(creditSide[i]?.Amount) : '',
                    debitBillReference: toArray(debitSide[i]?.Entries),
                    creditBillReference: toArray(creditSide[i]?.Entries),
                    voucherType: '',
                    status: '',
                    branch: '',
                    createdBy: '',
                });
            }
        });

        return transformedData;
    }, [generalInfo, entriesInfo])

    const JournalTotal = useMemo(() => entriesInfo.filter(
        item => item.DrCr === 'Dr'
    ).reduce(
        (acc, orders) => Addition(acc, orders?.Amount), 0
    ), [entriesInfo]);

    const closeDialog = () => setFilters(pre => ({ ...pre, filterDialog: false }));

    return (
        <>

            <FilterableTable
                title='Journal List'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                ButtonArea={
                    <>

                        {AddRights && (
                            <Button
                                onClick={() => nav("create")}
                                variant="outlined"
                            >create</Button>
                        )}

                        <IconButton
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                            size="small" className="mx-1"
                        ><FilterAlt className="fa-20" /></IconButton>

                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(JournalTotal) > 0 && <h6 className="m-0 text-end text-muted px-3">Total: {NumberFormat(JournalTotal)}</h6>}
                        </span>
                    </>
                }
                dataArray={reportData}
                columns={[...[
                    { col: 'sno', type: 'string', title: 'Sno' },
                    { col: 'date', type: 'date', title: 'Date' },
                    { col: 'voucherNo', type: 'string', title: 'VoucheNo' },
                    { col: 'debitAcc', type: 'string', title: 'Debit' },
                    { col: 'debitAmount', type: 'string', title: 'Amount' },
                    { col: 'creditAcc', type: 'string', title: 'Credit' },
                    { col: 'creditAmount', type: 'string', title: 'Amount' },
                    { col: 'voucherType', type: 'string', title: 'Voucher' },
                    { col: 'status', type: 'string', title: 'Status' },
                ].map(cel => ({
                    isVisible: 1,
                    ColumnHeader: cel.title,
                    isCustomCell: true,
                    Cell: ({ row }) => formatString(row[cel.col], cel.type),
                    tdClass: ({ row }) => row?.voucherNo ? 'fw-bold bg-light' : ''
                })),
                {
                    isVisible: 1,
                    ColumnHeader: 'Action',
                    isCustomCell: true,
                    Cell: ({ row }) => {
                        return (row?.journalObject && EditRights) && (
                            <>
                                <IconButton size="small" onClick={() => {
                                    // console.log(row)
                                    nav('create', {
                                        state: {
                                            ...row.journalObject,
                                        }
                                    })
                                }}>
                                    <Edit className="fa-20" />
                                </IconButton>
                            </>
                        )
                    }
                }
                ]}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>

                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>

                                {/* from date */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                {/* to date */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                {/* debit account */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Debit Account</td>
                                    <td>
                                        <Select
                                            value={filters?.debit_accounts_Filter}
                                            onChange={(e) => setFilters({ ...filters, debit_accounts_Filter: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filterDropDown.debit_accounts
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Debit Account"}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* credit account */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Credit Account </td>
                                    <td>
                                        <Select
                                            value={filters?.credit_accounts_Filter}
                                            onChange={(e) => setFilters({ ...filters, credit_accounts_Filter: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filterDropDown.credit_accounts
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Credit Account"}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* Voucher Type */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher Type </td>
                                    <td>
                                        <Select
                                            value={filters?.voucherType_Filter}
                                            onChange={(e) => setFilters({ ...filters, voucherType_Filter: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filterDropDown.voucherType
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Voucher Type"}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* receipt status */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Receipt Status</td>
                                    <td>
                                        <select
                                            type="date"
                                            value={filters.journalStatus}
                                            onChange={e => setFilters({ ...filters, journalStatus: e.target.value })}
                                            className="cus-inpt"
                                        >
                                            <option value={''}>All</option>
                                            {journalStatus.map((sts, ind) => (
                                                <option value={sts.value} key={ind}>{sts.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                {/* created by */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Created By</td>
                                    <td>
                                        <Select
                                            value={filters?.created_by_Filter}
                                            onChange={(e) => setFilters(pre => ({ ...pre, created_by_Filter: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filterDropDown.created_by
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions className="d-flex align-items-center justify-content-between">
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setFilters(pre => ({
                                ...pre,
                                ...defaultFilters
                            }))
                        }}
                        startIcon={<ClearAll />}
                    >clear</Button>
                    <span>
                        <Button onClick={closeDialog}>close</Button>
                        <Button
                            onClick={() => {
                                closeDialog();
                                setSessionFilters({
                                    Fromdate: filters?.Fromdate,
                                    Todate: filters.Todate,
                                    pageID,
                                    voucherType_Filter: filters.voucherType_Filter,
                                    debit_accounts_Filter: filters.debit_accounts_Filter,
                                    credit_accounts_Filter: filters.credit_accounts_Filter,
                                    created_by_Filter: filters.created_by_Filter,
                                    journalStatus: filters.journalStatus,
                                    journalStatus: filters.journalStatus,
                                });
                            }}
                            startIcon={<Search />}
                            variant="contained"
                        >Search</Button>
                    </span>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default JournalList;