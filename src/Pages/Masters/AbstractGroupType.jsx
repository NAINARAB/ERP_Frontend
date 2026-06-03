import { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    DialogContentText,
    TextField,
    Autocomplete
} from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, {
    createCol,
} from "../../Components/filterableTable2";

const initialState = {
    ABS_Group_Id: "",
    ABS_Group: "",
    Group_Type: "",
    Voucher_Id: "",
};

const absGroupOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Credit", label: "Credit" },
];

const groupTypeOptions = [
    { value: "SALES", label: "SALES" },
    { value: "PURCHASE", label: "PURCHASE" },
    { value: "RECEIPT", label: "RECEIPT" },
    { value: "PAYMENT", label: "PAYMENT" },
    { value: "CONTRA", label: "CONTRA" },
    { value: "JOURNAL", label: "JOURNAL" },
];

function AbstractGroup() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] =
        useState(false);
    const [inputValue, setInputValue] =
        useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [abstractGroupList, setAbstractGroupList] =
        useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [voucherList, setVoucherList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    useEffect(() => {
        fetchAbstractGroups();
    }, [reload]);

    useEffect(() => {
        fetchVoucherDropdown();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredList(abstractGroupList);
        } else {
            const filtered = abstractGroupList.filter(
                (item) =>
                    item.ABS_Group?.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    ) ||
                    item.Group_Type?.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    ) ||
                    item.Voucher_Type?.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    )
            );

            setFilteredList(filtered);
        }
    }, [searchTerm, abstractGroupList]);

    const fetchAbstractGroups = async () => {
        try {
            const data = await fetchLink({
                address: `masters/abstractGroup`,
            });

            if (data.success) {
                setAbstractGroupList(data.data);
                setFilteredList(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error(
                "Failed to load abstract groups"
            );
        }
    };

    const fetchVoucherDropdown = async () => {
        try {
            const data = await fetchLink({
                address:
                    "masters/abstractGroup/dropDown",
            });

            if (data.success) {
                setVoucherList(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error(
                "Failed to load voucher types"
            );
        }
    };

    const handleCreate = async () => {
        const {
            ABS_Group,
            Group_Type,
            Voucher_Id,
        } = inputValue;

        if (
            !ABS_Group ||
            !Group_Type ||
            !Voucher_Id
        ) {
            toast.error(
                "Please fill all required fields."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await fetchLink({
                address: `masters/abstractGroup`,
                method: "POST",
                bodyData: inputValue,
            });

            if (data.success) {
                toast.success(
                    "Abstract Group created successfully!"
                );

                setIsCreateDialogOpen(false);
                setInputValue(initialState);
                setReload((prev) => !prev);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error(
                "Failed to create abstract group"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        const {
            ABS_Group_Id,
            ABS_Group,
            Group_Type,
            Voucher_Id,
        } = inputValue;

        if (
            !ABS_Group_Id ||
            !ABS_Group ||
            !Group_Type ||
            !Voucher_Id
        ) {
            toast.error(
                "Please fill all required fields."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await fetchLink({
                address: `masters/abstractGroup`,
                method: "PUT",
                bodyData: inputValue,
            });

            if (data.success) {
                toast.success(
                    "Abstract Group updated successfully!"
                );

                setEditMode(false);
                setInputValue(initialState);
                setReload((prev) => !prev);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error(
                "Failed to update abstract group"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);

        try {
            const data = await fetchLink({
                address: `masters/abstractGroup`,
                method: "DELETE",
                bodyData: {
                    ABS_Group_Id:
                        inputValue.ABS_Group_Id,
                },
            });

            if (data.success) {
                toast.success(
                    "Abstract Group deleted successfully!"
                );

                setReload((prev) => !prev);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error(
                "Failed to delete abstract group"
            );
        } finally {
            setOpen(false);
            setIsSubmitting(false);
        }
    };

    const editRow = (row) => {
        setInputValue({
            ABS_Group_Id: row.ABS_Group_Id,
            ABS_Group: row.ABS_Group,
            Group_Type: row.Group_Type,
            Voucher_Id: row.Voucher_Id,
        });

        setEditMode(true);
    };

    const closeCreateDialog = () => {
        if (!isSubmitting) {
            setIsCreateDialogOpen(false);
            setInputValue(initialState);
        }
    };

    const closeEditDialog = () => {
        if (!isSubmitting) {
            setEditMode(false);
            setInputValue(initialState);
        }
    };

    const closeDeleteDialog = () => {
        if (!isSubmitting) {
            setOpen(false);
        }
    };

    const customFilterOptions = (options, { inputValue }) => {
        const searchValue = inputValue
            .toLowerCase()
            .replace(/[\s,]/g, "");

        return options.filter((option) =>
            (option.label || "")
                .toLowerCase()
                .replace(/[\s,]/g, "")
                .includes(searchValue)
        );
    };

    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Abstract Group Type

                    <div className="d-flex align-items-center gap-3">
                        <div
                            style={{ width: "300px" }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                InputProps={{
                                    startAdornment:
                                        <Search
                                            fontSize="small"
                                            sx={{
                                                mr: 1,
                                            }}
                                        />,
                                    style: {
                                        height:
                                            "40px",
                                    },
                                }}
                            />
                        </div>

                        <Button
                            variant="contained"
                            size="small"
                            className="rounded-1 btn-primary"
                            onClick={() => {
                                setInputValue(
                                    initialState
                                );
                                setIsCreateDialogOpen(
                                    true
                                );
                            }}
                            sx={{
                                textTransform:
                                    "none",
                                fontWeight: 500,
                                px: 2,
                                height: "40px",
                            }}
                        >
                            Create Abstract Group
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={filteredList}
                    EnableSerialNumber={true}
                    maxHeightOption
                    columns={[
                        createCol(
                            "ABS_Group",
                            "string",
                            "Abstract Group"
                        ),
                        createCol(
                            "Group_Type",
                            "string",
                            "Group Type"
                        ),
                        createCol(
                            "Voucher_Type",
                            "string",
                            "Voucher Type"
                        ),
                        {
                            ColumnHeader:
                                "Actions",
                            isVisible: 1,
                            isCustomCell:
                                true,
                            Cell: ({
                                row,
                            }) => (
                                <td
                                    style={{
                                        minWidth:
                                            "80px",
                                    }}
                                >
                                    <IconButton
                                        onClick={() =>
                                            editRow(
                                                row
                                            )
                                        }
                                        size="small"
                                    >
                                        <Edit />
                                    </IconButton>

                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                            setOpen(
                                                true
                                            );
                                            setInputValue(
                                                {
                                                    ABS_Group_Id:
                                                        row.ABS_Group_Id,
                                                    ABS_Group:
                                                        row.ABS_Group,
                                                }
                                            );
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </td>
                            ),
                        },
                    ]}
                />
            </div>


            {/* Create Dialog */}

            <Dialog
                open={isCreateDialogOpen}
                onClose={closeCreateDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Create Abstract Group
                </DialogTitle>

                <DialogContent>
                    {/* Abstract Group */}

                    <div className="p-2">
                        <label>
                            Abstract Group*
                        </label>

                        <Autocomplete
                            options={absGroupOptions}
                            filterOptions={customFilterOptions}
                            getOptionLabel={(option) =>
                                option.label || ""
                            }
                            value={
                                absGroupOptions.find(
                                    (item) =>
                                        item.value ===
                                        inputValue.ABS_Group
                                ) || null
                            }
                            onChange={(
                                e,
                                newValue
                            ) =>
                                setInputValue({
                                    ...inputValue,
                                    ABS_Group:
                                        newValue?.value ||
                                        "",
                                })
                            }
                            renderInput={(
                                params
                            ) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search Abstract Group"
                                />
                            )}
                        />
                    </div>

                    {/* Group Type */}

                    <div className="p-2">
                        <label>
                            Group Type*
                        </label>

                        <Autocomplete
                            options={groupTypeOptions}
                            filterOptions={customFilterOptions}
                            getOptionLabel={(
                                option
                            ) =>
                                option.label || ""
                            }
                            value={
                                groupTypeOptions.find(
                                    (item) =>
                                        item.value ===
                                        inputValue.Group_Type
                                ) || null
                            }
                            onChange={(
                                e,
                                newValue
                            ) =>
                                setInputValue({
                                    ...inputValue,
                                    Group_Type:
                                        newValue?.value ||
                                        "",
                                })
                            }
                            renderInput={(
                                params
                            ) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search Group Type"
                                />
                            )}
                        />
                    </div>

                    {/* Voucher Type */}

                    <div className="p-2">
                        <label>
                            Voucher Type*
                        </label>

                        <Autocomplete
                            options={voucherList}
                            filterOptions={customFilterOptions}
                            getOptionLabel={(option) =>
                                option.label || ""
                            }
                            value={
                                voucherList.find(
                                    (item) =>
                                        item.value ===
                                        inputValue.Voucher_Id
                                ) || null
                            }
                            onChange={(
                                e,
                                newValue
                            ) =>
                                setInputValue({
                                    ...inputValue,
                                    Voucher_Id:
                                        newValue?.value ||
                                        "",
                                })
                            }
                            renderInput={(
                                params
                            ) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search Voucher Type"
                                />
                            )}
                        />
                    </div>
                </DialogContent>

                <DialogActions>
                    <MuiButton
                        onClick={
                            closeCreateDialog
                        }
                    >
                        Cancel
                    </MuiButton>

                    <MuiButton
                        onClick={handleCreate}
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Creating..."
                            : "Create"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}

            <Dialog
                open={editMode}
                onClose={closeEditDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit Abstract Group
                </DialogTitle>

                <DialogContent>
                    {/* Abstract Group */}

                    <div className="p-2">
                        <label>
                            Abstract Group*
                        </label>

                        <Autocomplete
                            options={absGroupOptions}
                            filterOptions={customFilterOptions}
                            getOptionLabel={(option) =>
                                option.label || ""
                            }
                            value={
                                absGroupOptions.find(
                                    (item) =>
                                        item.value ===
                                        inputValue.ABS_Group
                                ) || null
                            }
                            onChange={(
                                e,
                                newValue
                            ) =>
                                setInputValue({
                                    ...inputValue,
                                    ABS_Group:
                                        newValue?.value ||
                                        "",
                                })
                            }
                            renderInput={(
                                params
                            ) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search Abstract Group"
                                />
                            )}
                        />
                    </div>

                    {/* Group Type */}

                    <div className="p-2">
                        <label>
                            Group Type*
                        </label>

                        <Autocomplete
                            options={groupTypeOptions}
                            filterOptions={customFilterOptions}
                            getOptionLabel={(
                                option
                            ) =>
                                option.label || ""
                            }
                            value={
                                groupTypeOptions.find(
                                    (item) =>
                                        item.value ===
                                        inputValue.Group_Type
                                ) || null
                            }
                            onChange={(
                                e,
                                newValue
                            ) =>
                                setInputValue({
                                    ...inputValue,
                                    Group_Type:
                                        newValue?.value ||
                                        "",
                                })
                            }
                            renderInput={(
                                params
                            ) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search Group Type"
                                />
                            )}
                        />
                    </div>

                    {/* Voucher Type */}

                    <div className="p-2">
                        <label>
                            Voucher Type*
                        </label>

                        <Autocomplete
                            options={voucherList}
                            filterOptions={customFilterOptions}
                            getOptionLabel={(option) =>
                                option.label || ""
                            }
                            value={
                                voucherList.find(
                                    (item) =>
                                        item.value ===
                                        inputValue.Voucher_Id
                                ) || null
                            }
                            onChange={(
                                e,
                                newValue
                            ) =>
                                setInputValue({
                                    ...inputValue,
                                    Voucher_Id:
                                        newValue?.value ||
                                        "",
                                })
                            }
                            renderInput={(
                                params
                            ) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search Voucher Type"
                                />
                            )}
                        />
                    </div>
                </DialogContent>

                <DialogActions>
                    <MuiButton
                        onClick={
                            closeEditDialog
                        }
                    >
                        Cancel
                    </MuiButton>

                    <MuiButton
                        onClick={handleEdit}
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Updating..."
                            : "Update"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}

            <Dialog
                open={open}
                onClose={
                    closeDeleteDialog
                }
            >
                <DialogTitle>
                    Confirmation
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        <b>
                            {`Do you want to delete the ${inputValue.ABS_Group} Group?`}
                        </b>
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <MuiButton
                        onClick={
                            closeDeleteDialog
                        }
                    >
                        Cancel
                    </MuiButton>

                    <MuiButton
                        onClick={
                            handleDelete
                        }
                        sx={{
                            color:
                                "red",
                        }}
                    >
                        {isSubmitting
                            ? "Deleting..."
                            : "Delete"}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AbstractGroup;
