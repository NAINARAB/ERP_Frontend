import { useEffect, useState } from "react";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { ISOString, isValidDate, stringCompare, Subraction, toArray } from "../../../Components/functions";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ClearAll, FilterAlt, Search } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { useMemo } from "react";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const initialSelectValue = { value: '', label: '' }

const AccountTransaction = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        refresh: false,
        filterDialog: false,
        debitAccount: initialSelectValue,
        creditAccount: initialSelectValue,
        accountType: 'DEBIT ACCOUNT',
        accountGroup: initialSelectValue
    });

    const [filtersDropDown, setFiltersDropDown] = useState({
        voucherType: [],
        debit_accounts: [],
        credit_accounts: [],
        accountGroups: []
    });

    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

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
            setFilters(pre => ({
                ...pre,
                Fromdate: ISOString(stateDetails.Fromdate),
                Todate: stateDetails.Todate
            }));
        }
    }, [stateDetails])

    useEffect(() => {
        fetchLink({
            address: `payment/paymentMaster/filtersValues`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown(pre => ({
                    ...pre,
                    voucherType: toArray(data?.others?.voucherType),
                    debit_accounts: toArray(data?.others?.debit_accounts),
                    credit_accounts: toArray(data?.others?.credit_accounts)
                }))
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `payment/accountGroup`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown(pre => ({
                    ...pre,
                    accountGroups: toArray(data.data)
                }))
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        fetchLink({
            address: `payment/reports/accountsTransaction?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).catch(e => console.log(e))
    }, [filters.refresh])

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters(pre => ({
            ...pre,
            filterDialog: false,
        }));
    }

    const refreshData = () => {
        setFilters(pre => ({
            ...pre,
            refresh: !pre.refresh,
        }));
    }

    // const filteredData = useMemo(() => {
    //     // filter account type
    //     const data = [...reportData].filter(fil => stringCompare(fil.accountType, filters.accountType));

    //     return data.filter(value => {

    //         // if (value)
    //     })
    // }, [filters.debitAccount.value, filters.creditAccount.value, filters.accountType, reportData])


    return (
        <>
            <FilterableTable
                title="Pending Reference"
                headerFontSizePx={13}
                bodyFontSizePx={13}
                EnableSerialNumber
                dataArray={reportData.filter(fil => stringCompare(fil.accountType, filters.accountType))}
                ButtonArea={
                    <>
                        <IconButton
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                        ><FilterAlt /></IconButton>
                    </>
                }
                columns={[
                    createCol('accountGet', 'string', 'Account'),
                    createCol('accountGroupGet', 'string', 'Account Group'),
                    createCol('accountTotalDebit', 'number', 'Total Payment Amount'),
                    createCol('transactionCount', 'number', 'Payment Counts'),
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Pending Reference',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => Subraction(row.debit_amount, row.total_referenced)
                    // }
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

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Display Side</td>
                                    <td>
                                        <select
                                            className="cus-inpt p-2"
                                            value={filters.accountType}
                                            onChange={e => setFilters(pre => ({ ...pre, accountType: e.target.value }))}
                                        >
                                            <option value={'DEBIT ACCOUNT'}>DEBIT ACCOUNT</option>
                                            <option value={'CREDIT ACCOUNT'}>CREDIT ACCOUNT</option>
                                        </select>
                                    </td>
                                </tr>
{/* 
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Account Group</td>
                                    <td>
                                        <Select
                                            value={filters?.accountGroup}
                                            onChange={e => setFilters({ ...filters, accountGroup: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filtersDropDown.accountGroups.map(ag => ({
                                                    value: ag.Group_Id,
                                                    label: ag.Group_Name
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Debit Account</td>
                                    <td>
                                        <Select
                                            value={filters?.debitAccount}
                                            onChange={e => setFilters({ ...filters, debit_amount: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filtersDropDown.debit_accounts
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Credit Account</td>
                                    <td>
                                        <Select
                                            value={filters?.creditAccount}
                                            onChange={e => setFilters({ ...filters, creditAccount: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filtersDropDown.credit_accounts
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr> */}

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
                                refreshData();
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

export default AccountTransaction;