import { useEffect, useState } from "react";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { checkIsNumber, isEqualNumber, ISOString, isValidDate, stringCompare, Subraction, toArray } from "../../../Components/functions";
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
        debitAccountGroup: initialSelectValue,
        creditAccountGroup: initialSelectValue,
    });

    const [filtersDropDown, setFiltersDropDown] = useState({
        accounts: [],
        accountGroups: [],
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
            address: `masters/accounts`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown(pre => ({
                    ...pre,
                    accounts: toArray(data.data)
                    // accounts: toArray(data.data).map(acc => ({
                    //     value: acc.Acc_Id,
                    //     label: acc.Account_name,
                    //     group: acc.Group_Id,
                    //     groupName: acc.Group_Name
                    // })),
                }));
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/accountGroups`
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
    };

    function getChildGroups(data, groupId) {
        const result = [];
        const visited = new Set();

        function recurse(currentId) {
            if (visited.has(currentId)) return;
            visited.add(currentId);

            for (const group of data) {
                if (isEqualNumber(group.Parent_AC_id, currentId)) {
                    result.push(group);

                    if (group.Group_Id !== 0) {
                        recurse(group.Group_Id);
                    }
                }
            }
        }

        recurse(groupId);

        return result;
    }

    const filteredData = useMemo(() => {

        const data = [...reportData].filter(fil => stringCompare(fil.accountType, filters.accountType));

        return data.filter(account => {

            const hasDebitMatch = checkIsNumber(filters.debitAccount.value)
                ? isEqualNumber(filters.debitAccount.value, account.accountId)
                : false;

            const hasCreditMatch = checkIsNumber(filters.creditAccount.value)
                ? isEqualNumber(filters.creditAccount.value, account.accountId)
                : false;

            return hasDebitMatch || hasCreditMatch;

        });
    }, [
        filtersDropDown.accountGroups,
        filtersDropDown.accounts,
        filters.accountType,
        filters.accountGroup,
        filters.debitAccount.value,
        filters.creditAccount.value,
        reportData
    ]);

    const filteredDebitAccount = useMemo(() => {
        if (!checkIsNumber(filters.debitAccountGroup.value)) return filtersDropDown.accounts.map(
            acc => ({ value: acc.Acc_Id, label: acc.Account_name })
        );

        const childGroups = [
            filtersDropDown.accountGroups.find(grp => isEqualNumber(grp.Group_Id, filters.debitAccountGroup.value)),
            ...getChildGroups(filtersDropDown.accountGroups, filters.debitAccountGroup.value)
        ];
        console.log({ childGroups })

        return filtersDropDown.accounts.filter(
            acc => childGroups.some(group => isEqualNumber(group.Group_Id, acc.Group_Id))
        ).map(acc => ({ value: acc.Acc_Id, label: acc.Account_name }))

    }, [
        filtersDropDown.accountGroups,
        filtersDropDown.accounts,
        filters.debitAccountGroup.value,
    ]);

    const filteredCreditAccount = useMemo(() => {
        if (!checkIsNumber(filters.creditAccountGroup.value)) return filtersDropDown.accounts.map(
            acc => ({ value: acc.Acc_Id, label: acc.Account_name })
        );

        const childGroups = [
            filtersDropDown.accountGroups.find(grp => isEqualNumber(grp.Group_Id, filters.creditAccountGroup.value)),
            ...getChildGroups(filtersDropDown.accountGroups, filters.creditAccountGroup.value)
        ];

        return filtersDropDown.accounts.filter(
            acc => childGroups.some(group => isEqualNumber(group.Group_Id, acc.Group_Id))
        ).map(acc => ({ value: acc.Acc_Id, label: acc.Account_name }))

    }, [
        filtersDropDown.accountGroups,
        filtersDropDown.accounts,
        filters.creditAccountGroup.value,
    ]);


    return (
        <>
            <FilterableTable
                title="Account Transaction"
                headerFontSizePx={13}
                bodyFontSizePx={13}
                EnableSerialNumber
                dataArray={(
                    checkIsNumber(filters.debitAccount.value) ||
                    checkIsNumber(filters.creditAccount.value)
                ) ? filteredData : reportData.filter(fil => stringCompare(fil.accountType, filters.accountType))}
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
                fullWidth maxWidth='md'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>

                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>

                                <tr>
                                    <td className="bg-light"></td>
                                    <td className="bg-light text-center">From</td>
                                    <td className="bg-light text-center">To</td>
                                </tr>

                                {/* from date */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
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
                                    <td colSpan={2}>
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

                                <tr>
                                    <td className="bg-light "></td>
                                    <td className="bg-light text-center">Group</td>
                                    <td className="bg-light text-center">Account</td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Debit Account</td>

                                    <td>
                                        <Select
                                            value={filters?.debitAccountGroup}
                                            onChange={e => setFilters(pre => ({
                                                ...pre,
                                                debitAccountGroup: e,
                                                debitAccount: initialSelectValue
                                            }))}
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

                                    <td>
                                        <Select
                                            value={filters?.debitAccount}
                                            onChange={e => setFilters({ ...filters, debitAccount: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filteredDebitAccount
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Debit account"}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Credit Account</td>

                                    <td>
                                        <Select
                                            value={filters?.creditAccountGroup}
                                            onChange={e => setFilters(pre => ({
                                                ...pre,
                                                creditAccountGroup: e,
                                                creditAccount: initialSelectValue
                                            }))}
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

                                    <td>
                                        <Select
                                            value={filters?.creditAccount}
                                            onChange={e => setFilters({ ...filters, creditAccount: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filteredCreditAccount
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Credit Name"}
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