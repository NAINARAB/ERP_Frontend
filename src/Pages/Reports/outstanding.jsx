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
            address: `payment/debtorsCreditors?fromDate=${filters?.fromDate}&toDate=${filters?.toDate}`,
            method: "post",
        })
            .then((data) => {
                if (data.success) setAllAccounts(data.data);
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

            if (viewType === "debtors" && balance <= 0) return false;
            if (viewType === "creditors" && balance >= 0) return false;

            if (filters.Account_Id && item.Acc_Id !== filters.Account_Id)
                return false;
            if (filters.Group_Name && item.Group_Name !== filters.Group_Name)
                return false;

            return true;
        });
    }, [allAccounts, viewType, filters.Account_Id, filters.Group_Name]);

    const Total_Invoice_value = useMemo(() => {
        return tableData.reduce((acc, item) => Addition(acc, item?.Bal_Amount), 0);
    }, [tableData]);

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
                    <>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Button
                                variant={viewType === "debtors" ? "contained" : "outlined"}
                                onClick={() => setViewType("debtors")}
                            >
                                Debtors
                            </Button>
                            <Button
                                variant={viewType === "creditors" ? "contained" : "outlined"}
                                onClick={() => setViewType("creditors")}
                            >
                                Creditors
                            </Button>
                        </div>

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
                        {NumberFormat(Total_Invoice_value) !== 0 && (
                            <h6 className="m-0 text-end text-muted px-3">
                                Total: {NumberFormat(Math.abs(Total_Invoice_value))}
                            </h6>
                        )}
                    </>
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
                    createCol("OB_Amount", "number", "Opening Balance"),
                    createCol("Debit_Amt", "number", "Debit Amount"),
                    createCol("Credit_Amt", "number", "Credit Amount"),
                    {
                        Field_Name: "Bal_Amount",
                        isVisible: 1,
                        Fied_Data: "number",
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <div className="d-flex align-items-center flex-wrap p-2 pb-0">
                                {row?.CR_DR === "DR"
                                    ? `${NumberFormat(row?.Dr_Amount)} `
                                    : `${NumberFormat(row?.Cr_Amount)} `}
                            </div>
                        ),
                    },
                    createCol("CR_DR", "string", "Type"),
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
                                Retailer_Id: filters?.Retailer_Id,
                                Area_Id: filters?.Area_Id,
                                Route_Id: filters?.Route_Id,
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