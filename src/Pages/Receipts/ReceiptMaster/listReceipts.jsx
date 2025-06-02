import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import FilterableTable, { ButtonActions, createCol } from '../../../Components/filterableTable2';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, isEqualNumber, ISOString, isValidDate, NumberFormat, toArray, toNumber } from "../../../Components/functions";
import { ClearAll, Edit, FilterAlt, Search, Timeline } from "@mui/icons-material";
import { useMemo } from "react";
import { receiptStatus, receiptTypes } from "./variable";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";

const useQuery = () => new URLSearchParams(useLocation().search);
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

const ReceiptList = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights }) => {
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        DebitAccount: { value: '', label: 'ALL' },
        CreditAccount: { value: '', label: 'ALL' },
        refresh: false,
        filterDialog: false,
        voucherType: [],
        debit_accounts: [],
        credit_accounts: [],
        created_by: [],
        voucherType_Filter: { label: 'ALL', value: '' },
        debit_accounts_Filter: { label: 'ALL', value: '' },
        credit_accounts_Filter: { label: 'ALL', value: '' },
        created_by_Filter: { label: 'ALL', value: '' },
        payment_status: '',
        payment_type: ''
    });
    const [reload, setReload] = useState(false)
    const [paymentData, setPaymentData] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();
    console.log(stateDetails)

    useEffect(() => {
        fetchLink({
            address: `payment/paymentMaster/filtersValues`
        }).then(data => {
            if (data.success) {
                setFilters(pre => ({
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
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, Fromdate: queryFilters.Fromdate, Todate: queryFilters.Todate }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
            setFilters(pre => ({ ...pre, Fromdate: ISOString(stateDetails.Fromdate), Todate: stateDetails.Todate }));
            setReload(pre => !pre);
        }
    }, [stateDetails])

    useEffect(() => {
        const From = filters.Fromdate, To = filters.Todate;
        const voucher = filters.voucherType_Filter.value;
        const debit = filters.debit_accounts_Filter.value;
        const credit = filters.credit_accounts_Filter.value;
        const createdBy = filters.created_by_Filter.value;
        const status = filters.payment_status;
        const payment_type = filters.payment_type;

        fetchLink({
            address: `payment/paymentMaster?Fromdate=${From}&Todate=${To}&voucher=${voucher}&debit=${debit}&credit=${credit}&createdBy=${createdBy}&status=${status}&payment_type=${payment_type}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                setPaymentData(data.data)
            }
        }).catch(e => console.error(e))
    }, [reload]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const TotalPayment = useMemo(() => paymentData.reduce(
        (acc, orders) => Addition(acc, orders?.debit_amount), 0
    ), [paymentData]);

    const closeDialog = () => setFilters(pre => ({ ...pre, filterDialog: false }));

    return (
        <>
            <FilterableTable
                title='Receipts'
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
                    createCol('receipt_date', 'date', 'Date'),
                    createCol('receipt_invoice_no', 'string', 'Receipt ID'),
                    createCol('debit_amount', 'number', 'Amount'),
                    createCol('TotalReferencedAmount', 'number', 'Added Ref'),
                    createCol('debit_ledger_name', 'string', 'Debit-Acc'),
                    createCol('credit_ledger_name', 'string', 'Credit-Acc'),
                    createCol('Voucher_Type', 'string', 'Voucher'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Bill Type',
                        isCustomCell: true,
                        Cell: ({ row }) => receiptTypes.find(type => isEqualNumber(type.value, row.bill_type))?.label
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
                                            || isEqualNumber(row.bill_type, 2)
                                            || isEqualNumber(row.bill_type, 4)
                                        )
                                    },
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
                                                ...filters.debit_accounts
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
                                                ...filters.credit_accounts
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
                                            {receiptTypes.map((type, ind) => (
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
                                                ...filters.voucherType
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
                                            {receiptStatus.map((sts, ind) => (
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
                                                ...filters.created_by
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
                                const updatedFilters = {
                                    Fromdate: filters?.Fromdate,
                                    Todate: filters?.Todate
                                };
                                updateQueryString(updatedFilters);
                                setReload(pre => !pre);
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

export default ReceiptList;