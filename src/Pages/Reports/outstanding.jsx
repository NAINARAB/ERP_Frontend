import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    ISOString,
    isValidDate,
    NumberFormat,
    toArray,
    Addition,
} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState, useMemo } from "react";
import { FilterAlt, Search, FilterAltOff } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { customSelectStyles } from "../../Components/tablecolumn";

const useQuery = () => new URLSearchParams(useLocation().search);

const defaultFilters = {
    fromDate: ISOString(),
    toDate: ISOString(),
};

const defaultFilterDropDown = {
    voucherType: [],
    retailers: [],
    collectionType: [],
    paymentStatus: [],
    collectedBy: [],
};

const Outstanding = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const storage = JSON.parse(localStorage.getItem("user"));

    const [allAccounts, setAllAccounts] = useState([]);
    const [viewType, setViewType] = useState("debtors");

    const [accountOptions, setAccountOptions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);

    const [filters, setFilters] = useState({
        fromDate: defaultFilters.fromDate,
        toDate: defaultFilters.toDate,
        fetchFrom: defaultFilters.fromDate,
        fetchTo: defaultFilters.toDate,
        Account_Id: "",
        Group_Name: "",
        filterDialog: false,
        refresh: false,
    });

    const [drowDownValues, setDropDownValues] = useState(defaultFilterDropDown);

    useEffect(() => {
        fetchLink({ address: `receipt/filterValues` })
            .then((data) => {
                if (data.success) {
                    setDropDownValues({
                        voucherType: toArray(data?.others?.voucherType),
                    });
                }
            })
            .catch(console.error);

        fetchAllAccounts();
    }, [storage?.Company_id]);

    const resetFilters = () => {
        setFilters({
            ...defaultFilters,
            fetchFrom: defaultFilters.fromDate,
            fetchTo: defaultFilters.toDate,
            Account_Id: "",
            Group_Name: "",
            filterDialog: false,
            refresh: false,
        });

        updateQueryString({
            fromDate: defaultFilters.fromDate,
            toDate: defaultFilters.toDate,
            Account_Id: "",
            Group_Name: "",
        });

        fetchAllAccounts();
    };

    const fetchAllAccounts = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `payment/getDebtorDetails?fromDate=${filters?.fromDate}&toDate=${filters?.toDate}`,
            method: "GET",
        })
            .then((data) => {
                if (data.success) setAllAccounts(data.data || []);
            })
            .finally(() => loadingOff && loadingOff())
            .catch(console.error);
    };

    useEffect(() => {
        if (Array.isArray(allAccounts)) {
            const accOpts = allAccounts.map((a) => ({
                value: a.Acc_Id,
                label: a.Account_name,
            }));

            const grpOpts = [
                ...new Map(
                    allAccounts.map((a) => [
                        a.Group_Name,
                        { value: a.Group_Name, label: a.Group_Name },
                    ])
                ).values(),
            ];

            setAccountOptions([{ value: "", label: "ALL" }, ...accOpts]);
            setGroupOptions([{ value: "", label: "ALL" }, ...grpOpts]);
        }
    }, [allAccounts]);

    const tableData = useMemo(() => {
        if (!Array.isArray(allAccounts)) return [];

        return allAccounts.filter((item) => {
            const balance = parseFloat(item?.Bal_Amount || 0);

            // Skip zero balances
            if (balance === 0) return false;

            // Filter by account type
            if (viewType === "debtors" && item.Account_Types !== "Debtor") return false;
            if (viewType === "creditors" && item.Account_Types !== "Creditor") return false;

            if (filters.Account_Id && item.Acc_Id !== filters.Account_Id)
                return false;
            if (filters.Group_Name && item.Group_Name !== filters.Group_Name)
                return false;

            return true;
        });
    }, [allAccounts, viewType, filters.Account_Id, filters.Group_Name]);

    const Total_Debit = useMemo(() => {
        return tableData.reduce((acc, item) => Addition(acc, parseFloat(item?.Dr_Amount || 0)), 0);
    }, [tableData]);

    const Total_Credit = useMemo(() => {
        return tableData.reduce((acc, item) => Addition(acc, parseFloat(item?.Cr_Amount || 0)), 0);
    }, [tableData]);

    const Total_Outstanding = useMemo(() => {
        return Total_Debit - Total_Credit;
    }, [Total_Debit, Total_Credit]);

    useEffect(() => {
        const queryFilters = {
            fromDate:
                query.get("fromDate") && isValidDate(query.get("fromDate"))
                    ? query.get("fromDate")
                    : defaultFilters.fromDate,
            toDate:
                query.get("toDate") && isValidDate(query.get("toDate"))
                    ? query.get("toDate")
                    : defaultFilters.toDate,
        };
        setFilters((pre) => ({
            ...pre,
            fetchFrom: queryFilters.fromDate,
            fetchTo: queryFilters.toDate,
        }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters((pre) => ({ ...pre, filterDialog: false }));
    };

    return (
        <>
            <FilterableTable
                title={
                    viewType === "debtors"
                        ? "Debtors Outstanding"
                        : "Creditors Outstanding"
                }
                ButtonArea={
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Button
                                variant={viewType === "debtors" ? "contained" : "outlined"}
                                onClick={() => setViewType("debtors")}
                                size="small"
                            >
                                Debtors
                            </Button>
                            <Button
                                variant={viewType === "creditors" ? "contained" : "outlined"}
                                onClick={() => setViewType("creditors")}
                                size="small"
                            >
                                Creditors
                            </Button>
                            <div className="d-flex align-items-center">
                                <Tooltip title="Filters">
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({ ...filters, filterDialog: true })}
                                    >
                                        <FilterAlt />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reset Filters">
                                    <IconButton size="small" onClick={resetFilters}>
                                        <FilterAltOff />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="d-flex flex-column align-items-end">
                            <div className="d-flex align-items-center">
                                <span className="text-muted me-2">Total {viewType === "debtors" ? "Debtors" : "Creditors"} Debit:</span>
                                <strong>{NumberFormat(Total_Debit)}</strong>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="text-muted me-2">Total {viewType === "debtors" ? "Debtors" : "Creditors"} Credit:</span>
                                <strong>{NumberFormat(Total_Credit)}</strong>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="text-muted me-2">Total Outstanding:</span>
                                <strong className={Total_Outstanding >= 0 ? "text-danger" : "text-success"}>
                                    {NumberFormat(Math.abs(Total_Outstanding))} {Total_Outstanding >= 0 ? "DR" : "CR"}
                                </strong>
                            </div>
                        </div>
                    </div>
                }
                EnableSerialNumber
                ExcelPrintOption={true}
                dataArray={tableData}
                headerFontSizePx={14}
                bodyFontSizePx={13}
                columns={[
                    createCol("Acc_Id", "string", "Account ID"),
                    createCol("Account_name", "string", "Account Name"),
                    createCol("Group_Name", "string", "Group"),
                    {
                        ...createCol("Account_Types", "string", "Account Type"),
                        isVisible: 1
                    },
                    {
                        ...createCol("OB_Amount", "number", "Opening Balance"),
                        format: (value) => NumberFormat(value || 0)
                    },
                    {
                        ...createCol("Dr_Amount", "number", "Debit Amount"),
                        format: (value) => NumberFormat(value || 0)
                    },
                    {
                        ...createCol("Cr_Amount", "number", "Credit Amount"),
                        format: (value) => NumberFormat(value || 0)
                    },
                    createCol("CR_DR", "string", "Type"),
                    {
                        Field_Name: "Bal_Amount",
                        isVisible: 1,
                        Fied_Data: "number",
                        isCustomCell: true,
                        Header: "Balance Amount",
                        Cell: ({ row }) => (
                            <span className={row?.CR_DR === "DR" ? "text-danger" : "text-success"}>
                                {NumberFormat(Math.abs(row?.Bal_Amount || 0))} {row?.CR_DR}
                            </span>
                        ),
                    },
                ]}
            />

            {/* Filter Dialog */}
            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <table className="table table-borderless w-100">
                        <tbody>
                            <tr>
                                <td style={{ verticalAlign: "middle", width: "150px" }}>
                                    From
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        value={filters.fromDate || ""}
                                        onChange={(e) =>
                                            setFilters({ ...filters, fromDate: e.target.value })
                                        }
                                        className="cus-inpt"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>To</td>
                                <td>
                                    <input
                                        type="date"
                                        value={filters.toDate || ""}
                                        onChange={(e) =>
                                            setFilters({ ...filters, toDate: e.target.value })
                                        }
                                        className="cus-inpt"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Account Name</td>
                                <td>
                                    <Select
                                        styles={customSelectStyles}
                                        value={
                                            accountOptions.find(
                                                (a) => a.value === filters.Account_Id
                                            ) || { value: "", label: "ALL" }
                                        }
                                        options={accountOptions}
                                        onChange={(selected) =>
                                            setFilters({
                                                ...filters,
                                                Account_Id: selected?.value || "",
                                            })
                                        }
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Group Name</td>
                                <td>
                                    <Select
                                        styles={customSelectStyles}
                                        value={
                                            groupOptions.find(
                                                (g) => g.value === filters.Group_Name
                                            ) || { value: "", label: "ALL" }
                                        }
                                        options={groupOptions}
                                        onChange={(selected) =>
                                            setFilters({
                                                ...filters,
                                                Group_Name: selected?.value || "",
                                            })
                                        }
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button
                        onClick={() => {
                            const updatedFilters = {
                                fromDate: filters?.fromDate,
                                toDate: filters?.toDate,
                                Account_Id: filters?.Account_Id,
                                Group_Name: filters?.Group_Name,
                            };

                            setFilters((prev) => ({
                                ...prev,
                                fetchFrom: filters.fromDate,
                                fetchTo: filters.toDate,
                            }));

                            updateQueryString(updatedFilters);
                            fetchAllAccounts();
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Outstanding;