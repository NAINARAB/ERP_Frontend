import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import FilterableTable, { ButtonActions, createCol } from '../../../Components/filterableTable2';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, getSessionFiltersByPageId, isEqualNumber, ISOString, NumberFormat, setSessionFilters, toArray, toNumber } from "../../../Components/functions";
import { ClearAll, Edit, FilterAlt, FilterList, Search, Timeline } from "@mui/icons-material";
import { useMemo } from "react";
import { paymentStatus, paymentTypes } from "./variable";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";

const PaymentsMasterList = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        voucherType_Filter: { label: 'ALL', value: '' },
        debit_accounts_Filter: { label: 'ALL', value: '' },
        credit_accounts_Filter: { label: 'ALL', value: '' },
        created_by_Filter: { label: 'ALL', value: '' },
        payment_status: '',
        payment_type: ''
    };
    const [filters, setFilters] = useState({
        ...defaultFilters,
        filterDialog: false,
    });
    const [paymentData, setPaymentData] = useState([]);
    const [filterDropDown, setFilterDropDown] = useState({
        voucherType: [],
        debit_accounts: [],
        credit_accounts: [],
        created_by: [],
    })

    const navigate = useNavigate();

    useEffect(() => {

        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            voucherType_Filter = defaultFilters.voucherType_Filter,
            debit_accounts_Filter = defaultFilters.debit_accounts_Filter,
            credit_accounts_Filter = defaultFilters.credit_accounts_Filter,
            created_by_Filter = defaultFilters.created_by_Filter,
            payment_status = defaultFilters.payment_status,
            payment_type = defaultFilters.payment_type
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate: Fromdate,
            Todate: Todate,
            voucherType_Filter: voucherType_Filter,
            debit_accounts_Filter: debit_accounts_Filter,
            credit_accounts_Filter: credit_accounts_Filter,
            created_by_Filter: created_by_Filter,
            payment_status,
            payment_type,
        }));

    }, [sessionValue, pageID]);

    useEffect(() => {
        fetchLink({
            address: `payment/paymentMaster/filtersValues`
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
    }, [])

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            voucherType_Filter = defaultFilters.voucherType_Filter,
            debit_accounts_Filter = defaultFilters.debit_accounts_Filter,
            credit_accounts_Filter = defaultFilters.credit_accounts_Filter,
            created_by_Filter = defaultFilters.created_by_Filter,
            payment_status = defaultFilters.payment_status,
            payment_type = defaultFilters.payment_type
        } = otherSessionFiler;

        fetchLink({
            address: `payment/paymentMaster?
            Fromdate=${Fromdate}&
            Todate=${Todate}&
            voucher=${voucherType_Filter?.value || ''}&
            debit=${debit_accounts_Filter?.value || ''}&
            credit=${credit_accounts_Filter?.value || ''}&
            createdBy=${created_by_Filter?.value || ''}&
            status=${payment_status}&
            payment_type=${payment_type}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                setPaymentData(data.data)
            }
        }).catch(e => console.error(e))
    }, [sessionValue, pageID]);

    const TotalPayment = useMemo(() => paymentData.reduce(
        (acc, orders) => Addition(acc, orders?.debit_amount), 0
    ), [paymentData]);

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
                title='Payments'
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

                        {AddRights && (
                            <Button
                                onClick={() => navigate('addReference')}
                                variant="outlined"
                                className="me-2"
                            >Add Reference</Button>
                        )}

                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(TotalPayment) > 0 && <h6 className="m-0 text-end text-muted px-3">Total: {NumberFormat(TotalPayment)}</h6>}
                        </span>
                    </>
                }
                dataArray={paymentData}
                columns={[
                    createCol('payment_date', 'date', 'Date'),
                    createCol('payment_invoice_no', 'string', 'Payment ID'),
                    createCol('debit_amount', 'number', 'Amount'),
                    createCol('TotalReferencedAmount', 'number', 'Added Ref'),
                    createCol('debit_ledger_name', 'string', 'Debit-Acc'),
                    createCol('credit_ledger_name', 'string', 'Credit-Acc'),
                    createCol('Voucher_Type', 'string', 'Voucher'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Bill Type',
                        isCustomCell: true,
                        Cell: ({ row }) => paymentTypes.find(type => isEqualNumber(type.value, row.pay_bill_type))?.label
                    },
                    createCol('remarks', 'string', 'Narration'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Status',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const paymentStatusString = paymentStatus.find(s => isEqualNumber(s.value, row?.status))
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
                                    },
                                    {
                                        name: 'Add Reference',
                                        icon: <Timeline />,
                                        onclick: () => navigate('addReference', { state: row }),
                                        disabled: (
                                            !EditRights
                                            || isEqualNumber(row.pay_bill_type, 2)
                                            || isEqualNumber(row.pay_bill_type, 4)
                                        )
                                    },
                                    // {

                                    // }
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
                                        />
                                    </td>
                                </tr>

                                {/* payment type */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Payment Type </td>
                                    <td>
                                        <select
                                            className="cus-inpt p-2"
                                            value={filters.payment_type}
                                            onChange={e => setFilters(pre => ({ ...pre, payment_type: e.target.value }))}
                                        >
                                            <option value={''}>ALL</option>
                                            {paymentTypes.map((type, ind) => (
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
                                        />
                                    </td>
                                </tr>

                                {/* payment status */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Payment Status</td>
                                    <td>
                                        <select
                                            type="date"
                                            value={filters.payment_status}
                                            onChange={e => setFilters({ ...filters, payment_status: e.target.value })}
                                            className="cus-inpt"
                                        >
                                            <option value={''}>All</option>
                                            {paymentStatus.map((sts, ind) => (
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
                                            placeholder={"Sales Person Name"}
                                            menuPortalTarget={document.body}
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
                                    payment_status: filters.payment_status,
                                    payment_type: filters.payment_type,
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