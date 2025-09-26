import { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import FilterableTable, { ButtonActions, createCol } from '../../../Components/filterableTable2';
import { useNavigate } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, getSessionFiltersByPageId, isEqualNumber, ISOString, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber } from "../../../Components/functions";
import { ClearAll, Edit, FilterAlt, Search, Timeline } from "@mui/icons-material";
import { useMemo } from "react";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { contraStatus } from "./contraVariables";

const PaymentsMasterList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');

    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        voucherType: { label: 'ALL', value: '' },
        debit_accounts: { label: 'ALL', value: '' },
        credit_accounts: { label: 'ALL', value: '' },
        created_by: { label: 'ALL', value: '' },
        status: { label: 'ALL', value: '' },
        branch: { label: 'ALL', value: '' }
    };

    const [filters, setFilters] = useState({
        ...defaultFilters,
        filterDialog: false,
    });

    const [contraData, setContraData] = useState([]);

    const [filterDropDown, setFilterDropDown] = useState({
        voucherType: [],
        debit_accounts: [],
        credit_accounts: [],
        created_by: [],
        branch: []
    });

    const navigate = useNavigate();

    useEffect(() => {

        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            voucherType = defaultFilters.voucherType,
            debit_accounts = defaultFilters.debit_accounts,
            credit_accounts = defaultFilters.credit_accounts,
            created_by = defaultFilters.created_by,
            status = defaultFilters.status,
            branch = defaultFilters.branch
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate: Fromdate,
            Todate: Todate,
            voucherType,
            branch,
            debit_accounts,
            credit_accounts,
            created_by,
            status,
        }));

    }, [sessionValue, pageID]);

    useEffect(() => {
        fetchLink({
            address: `contra/filtersValues`
        }).then(data => {
            if (data.success) {
                setFilterDropDown(pre => ({
                    ...pre,
                    voucherType: toArray(data?.others?.voucherType),
                    debit_accounts: toArray(data?.others?.debit_accounts),
                    credit_accounts: toArray(data?.others?.credit_accounts),
                    created_by: toArray(data?.others?.created_by),
                    branch: toArray(data?.others?.branch)
                }))
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            voucherType = defaultFilters.voucherType,
            branch = defaultFilters.branch,
            debit_accounts = defaultFilters.debit_accounts,
            credit_accounts = defaultFilters.credit_accounts,
            created_by = defaultFilters.created_by,
            status = defaultFilters.status
        } = otherSessionFiler;

        fetchLink({
            address: `contra/master?
            Fromdate=${Fromdate}&
            Todate=${Todate}&
            voucher=${voucherType?.value || ''}&
            branch=${branch?.value || ''}&
            debit=${debit_accounts?.value || ''}&
            credit=${credit_accounts?.value || ''}&
            createdBy=${created_by?.value || ''}&
            status=${status?.value || ''}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                setContraData(data.data)
            }
        }).catch(e => console.error(e))
    }, [sessionValue, pageID]);

    const TotalAmount = useMemo(() => contraData.filter(
        con => con?.ContraStatus !== 0
    ).reduce(
        (acc, orders) => Addition(acc, orders?.Amount), 0
    ), [contraData]);

    const closeDialog = () => setFilters(pre => ({ ...pre, filterDialog: false }));

    const statusColor = {
        NewOrder: ' bg-info fw-bold fa-11 px-2 py-1 rounded-3 ',
        OnProcess: ' bg-warning fw-bold fa-11 px-2 py-1 rounded-3 ',
        Completed: ' bg-success text-light fa-11 px-2 py-1 rounded-3 ',
        Canceled: ' bg-danger text-light fw-bold fa-11 px-2 py-1 rounded-3 '
    }

    const chooseColor = (orderStatus) => {
        switch (orderStatus) {
            case 1: return statusColor.NewOrder;
            case 2: return statusColor.OnProcess;
            case 3: return statusColor.Completed;
            case 0: return statusColor.Canceled;
            default: return ''
        }
    }

    return (
        <>
            <FilterableTable
                title='Contra'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                ButtonArea={
                    <>

                        <IconButton
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                            size="small" className="mx-1"
                        ><FilterAlt className="fa-20" /></IconButton>

                        {AddRights && (
                            <Button
                                onClick={() => navigate('create')}
                                variant="outlined"
                            >Add</Button>
                        )}

                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(TotalAmount) > 0 && <h6 className="m-0 text-end text-muted px-3">Total: {NumberFormat(TotalAmount)}</h6>}
                        </span>
                    </>
                }
                dataArray={contraData}
                columns={[
                    createCol('ContraDate', 'date', 'Date'),
                    createCol('ContraVoucherNo', 'string', 'Voucher ID'),
                    createCol('Amount', 'number'),
                    createCol('DebitAccountGet', 'string', 'Debit-Ac'),
                    createCol('CreditAccountGet', 'string', 'Credit-Ac'),
                    createCol('VoucherTypeGet', 'string', 'Voucher'),
                    createCol('Narration', 'string'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Status',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const paymentStatusString = contraStatus.find(s => isEqualNumber(s.value, row?.ContraStatus)) || {}
                            return (
                                <span className={chooseColor(paymentStatusString.value)}>
                                    {String(paymentStatusString.label).replace(' ', '')}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions
                                buttonsData={[
                                    {
                                        name: 'Edit',
                                        icon: <Edit />,
                                        onclick: () => navigate('create', { state: row }),
                                        disabled: !EditRights
                                    }
                                ]}
                            />
                        )
                    }
                ]}
                EnableSerialNumber
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
                                            value={filters?.debit_accounts}
                                            onChange={(e) => setFilters({ ...filters, debit_accounts: e })}
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
                                            value={filters?.credit_accounts}
                                            onChange={(e) => setFilters({ ...filters, credit_accounts: e })}
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

                                {/* payment type */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Branch </td>
                                    <td>
                                        <select
                                            className="cus-inpt p-2"
                                            value={filters.branch.value}
                                            onChange={e => {

                                                const branchValue = filterDropDown.branch.find(
                                                    b => isEqualNumber(b.value, e.target.value)
                                                ) || { label: '', value: '' };

                                                setFilters({
                                                    ...filters,
                                                    branch: {
                                                        label: branchValue?.label || '',
                                                        value: branchValue?.value || ''
                                                    }
                                                });

                                            }}
                                        >
                                            <option value={''}>ALL</option>
                                            {filterDropDown.branch.map((type, ind) => (
                                                <option value={type.value} key={ind}>{type.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                {/* Voucher Type */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher Type </td>
                                    <td>
                                        <Select
                                            value={filters?.voucherType}
                                            onChange={(e) => setFilters({ ...filters, voucherType: e })}
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

                                {/* payment status */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Status</td>
                                    <td>
                                        <select
                                            value={filters.status.value}
                                            onChange={e => {

                                                const statusValue = contraStatus.find(
                                                    s => isEqualNumber(s.value, e.target.value)
                                                ) || { label: '', value: '' };

                                                setFilters({
                                                    ...filters,
                                                    status: {
                                                        label: statusValue?.label || '',
                                                        value: statusValue?.value || ''
                                                    }
                                                });

                                            }}
                                            className="cus-inpt"
                                        >
                                            <option value={''}>All</option>
                                            {contraStatus.map((sts, ind) => (
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
                                            value={filters?.created_by}
                                            onChange={(e) => setFilters(pre => ({ ...pre, created_by: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filterDropDown.created_by
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
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
                                    voucherType: filters.voucherType,
                                    branch: filters.branch,
                                    debit_accounts: filters.debit_accounts,
                                    credit_accounts: filters.credit_accounts,
                                    created_by: filters.created_by,
                                    status: filters.status,
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

export default PaymentsMasterList;