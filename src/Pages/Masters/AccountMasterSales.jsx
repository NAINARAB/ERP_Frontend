import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { ButtonActions, createCol } from "../../Components/filterableTable2";
import { Edit, Delete } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from "react-toastify";
import RequiredStar from "../../Components/requiredStar";
import { checkIsNumber, toArray } from "../../Components/functions";

const initialValue = {
    Id: "",
    Acc_Id: "",
    Account_Name: "",
    Sales_Id: "",
    Sales_Person_Name: "",
    Type: "",
};

const AccountMasterSales = ({ loadingOn, loadingOff }) => {
    const [records, setRecords] = useState([]);
    const [inputValue, setInputValue] = useState(initialValue);
    const [accountList, setAccountList] = useState([]);
    const [salesPersonList, setSalesPersonList] = useState([]);
    const [filters, setFilters] = useState({
        dialog: false,
        refresh: false,
        searchValue: { value: "", label: "Search Account" },
    });

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Fetch account master dropdown
    useEffect(() => {
        fetchLink({
            address: `masters/accountMasterSales/accounts`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) setAccountList(toArray(data.data));
            })
            .catch((e) => console.error(e));
    }, [loadingOn, loadingOff]);

    // Fetch sales person dropdown
    useEffect(() => {
        fetchLink({
            address: `masters/accountMasterSales/salespersons`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) setSalesPersonList(toArray(data.data));
            })
            .catch((e) => console.error(e));
    }, [loadingOn, loadingOff]);

    // Fetch AccountMasterSales records
    useEffect(() => {
        fetchLink({
            address: `masters/accountMasterSales`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) setRecords(toArray(data.data));
                else setRecords([]);
            })
            .catch((e) => console.error(e));
    }, [filters.refresh, loadingOn, loadingOff]);

    // Close Dialog
    const closeDialog = () => {
        setFilters((pre) => ({ ...pre, dialog: false }));
        setInputValue(initialValue);
    };

    // Save or Update AccountMasterSales
    const saveRecord = () => {
        const method = checkIsNumber(inputValue.Id) ? "PUT" : "POST";

        if (!inputValue.Acc_Id || !inputValue.Sales_Id || !inputValue.Type) {
            toast.warn("Please fill all required fields.");
            return;
        }

        fetchLink({
            address: `masters/accountMasterSales`,
            method,
            bodyData: {
                ...inputValue,
                User_Id: inputValue.Sales_Id,
            },
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message || "Record saved successfully!");
                    setFilters((pre) => ({
                        ...pre,
                        dialog: false,
                        refresh: !pre.refresh,
                    }));
                    setInputValue(initialValue);
                } else {
                    toast.error(data.message || "Something went wrong!");
                }
            })
            .catch((e) => console.error(e));
    };

    // Delete Record
    const handleDeleteOpen = (row) => {
        setSelectedRow(row);
        setDeleteDialog(true);
    };

    // Confirm Delete Handler
    const confirmDelete = () => {
        if (!selectedRow) return;

        fetchLink({
            address: `masters/accountMasterSales`,
            method: "DELETE",
            bodyData: { Id: selectedRow.Id },
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Record deleted successfully!");
                    setFilters((pre) => ({ ...pre, refresh: !pre.refresh }));
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e))
            .finally(() => {
                setDeleteDialog(false);
                setSelectedRow(null);
            });
    };

    // Cancel delete dialog
    const cancelDelete = () => {
        setDeleteDialog(false);
        setSelectedRow(null);
    };

    return (
        <>
            <FilterableTable
                title="Account Master - Sales"
                EnableSerialNumber
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            className="mx-1"
                            onClick={() => setFilters((pre) => ({ ...pre, dialog: true }))}
                        >
                            Add Account - Sales
                        </Button>
                        <div style={{ minWidth: "270px" }}>
                            <Select
                                value={filters.searchValue}
                                options={[
                                    { value: "", label: "ALL" },
                                    ...records.map((rec) => ({
                                        value: rec.Acc_Id,
                                        label: rec.Account_Name,
                                    })),
                                ]}
                                menuPortalTarget={document.body}
                                onChange={(e) =>
                                    setFilters((pre) => ({ ...pre, searchValue: e }))
                                }
                                styles={customSelectStyles}
                                isSearchable
                            />
                        </div>
                    </>
                }
                dataArray={
                    filters.searchValue.value
                        ? records.filter(
                            (rec) =>
                                String(rec.Account_Name)
                                    .toLowerCase()
                                    .includes(filters.searchValue.label.toLowerCase()) ||
                                String(rec.Sales_Person_Name)
                                    .toLowerCase()
                                    .includes(filters.searchValue.label.toLowerCase())
                        )
                        : records
                }
                columns={[
                    createCol("Account_Name", "string", "Account Name"),
                    createCol("Sales_Person_Name", "string", "Sales Person"),
                    createCol("Type", "string", "Type"),
                    {
                        isVisible: 1,
                        ColumnHeader: "Action",
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions
                                buttonsData={[
                                    {
                                        name: "Edit",
                                        icon: <Edit />,
                                        onclick: () => {
                                            setInputValue(row);
                                            setFilters((pre) => ({ ...pre, dialog: true }));
                                        },
                                    },
                                    {
                                        name: "Delete",
                                        icon: <Delete />,
                                        onclick: () => handleDeleteOpen(row),
                                    },
                                ]}
                            />
                        ),
                    },
                ]}
            />

            {/* Add/Edit Dialog */}
            <Dialog
                open={filters.dialog}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {checkIsNumber(inputValue.Id)
                        ? "Modify Account (Sales)"
                        : "Add Account (Sales)"}
                </DialogTitle>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveRecord();
                    }}
                >
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table fa-13">
                                <tbody>
                                    <tr>
                                        <td className="vctr">
                                            Account <RequiredStar />
                                        </td>
                                        <td>
                                            <Select
                                                value={{
                                                    value: inputValue.Acc_Id,
                                                    label: inputValue.Account_Name || "Select",
                                                }}
                                                options={[
                                                    { value: "", label: "Select" },
                                                    ...accountList.map((acc) => ({
                                                        value: acc.value,
                                                        label: acc.label,
                                                    })),
                                                ]}
                                                menuPortalTarget={document.body}
                                                onChange={(e) =>
                                                    setInputValue((pre) => ({
                                                        ...pre,
                                                        Acc_Id: e.value,
                                                        Account_Name: e.label,
                                                    }))
                                                }
                                                styles={customSelectStyles}
                                                isSearchable
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="vctr">
                                            Sales Person <RequiredStar />
                                        </td>
                                        <td>
                                            <Select
                                                value={{
                                                    value: inputValue.Sales_Id,
                                                    label: inputValue.Sales_Person_Name || "Select",
                                                }}
                                                options={[
                                                    { value: "", label: "Select" },
                                                    ...salesPersonList.map((sp) => ({
                                                        value: sp.Id,
                                                        label: sp.Name,
                                                    })),
                                                ]}
                                                menuPortalTarget={document.body}
                                                onChange={(e) =>
                                                    setInputValue((pre) => ({
                                                        ...pre,
                                                        Sales_Id: e.value,
                                                        Sales_Person_Name: e.label,
                                                    }))
                                                }
                                                styles={customSelectStyles}
                                                isSearchable
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="vctr">
                                            Type <RequiredStar />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="cus-inpt p-2"
                                                value={inputValue.Type}
                                                onChange={(e) =>
                                                    setInputValue((pre) => ({
                                                        ...pre,
                                                        Type: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            size="small"
                            onClick={() => {
                                closeDialog();
                                setInputValue(initialValue);
                            }}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button size="small" type="submit" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={cancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this record?
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button variant="contained" onClick={confirmDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AccountMasterSales;
