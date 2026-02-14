import { useEffect, useState, Fragment, useMemo } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Button as MuiButton,
    TextField,
    InputAdornment
} from "@mui/material";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search as SearchIcon } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { erpModules } from "../../Components/tablecolumn";
import { isEqualNumber } from "../../Components/functions";

const EMPTY_FORM = {
    id: "",
    Voucher_Type: "",
    Voucher_Code: "",
    Branch_Id: "",
    GodownId: "",
    Type: "",
    status: ""
};

function VoucherMaster({ loadingOn, loadingOff }) {
    const [voucherData, setVoucherData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [reload, setReload] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [form, setForm] = useState(EMPTY_FORM);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;

    const [tallySync, setTallySync] = useState(false);
    const [typeOptions, setTypeOptions] = useState([]);


    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const typesFromData = voucherData
            .map(item => item?.Type)
            .filter(Boolean);

        const baseOptions = (erpModules || []).map((m) => m?.name).filter(Boolean);

        const extras = ["MATERIAL_INWARD", "OTHER_GODOWN", "PROCESSING"];

        const allTypes = Array.from(new Set([...baseOptions, ...extras, ...typesFromData]));

        setTypeOptions(allTypes);
    }, [erpModules, voucherData]);

    useEffect(() => {
        fetchLink({ address: `masters/voucher?showDeleted=1` })
            .then((res) => {
                if (res?.success) setVoucherData(res.data || []);
            })
            .catch(console.error);

        fetchLink({ address: `masters/branch/dropDown` })
            .then((res) => {
                if (res?.success) setBranches(res.data || []);
            })
            .catch(console.error);

        fetchLink({ address: `masters/godown` })
            .then((res) => {
                if (res?.success) setGodowns(res.data || []);
            })
            .catch(console.error);
    }, [reload]);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return voucherData;

        const searchLower = searchTerm.toLowerCase().trim();

        return voucherData.filter(voucher => {
            return (
                (voucher?.Voucher_Type?.toLowerCase() || "").includes(searchLower) ||
                (voucher?.Voucher_Code?.toLowerCase() || "").includes(searchLower) ||
                (voucher?.Type?.toLowerCase() || "").includes(searchLower) ||
                (voucher?.BranchName?.toLowerCase() || "").includes(searchLower)
            );
        });
    }, [voucherData, searchTerm]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setTallySync(false);
    };

    const openCreate = () => {
        setFormMode("create");
        resetForm();
        setIsFormOpen(true);
    };

    const openEdit = (row) => {
        setForm({
            id: row?.Vocher_Type_Id || "",
            Voucher_Type: row?.Voucher_Type || "",
            Voucher_Code: row?.Voucher_Code || "",
            Branch_Id: row?.Branch_Id || "",
            GodownId: row?.GodownId || "",
            Type: row?.Type || "",
            status: Number(row?.isDeleted) || 0
        });

        setTallySync(Number(row?.tallySync) === 1);
        setFormMode("edit");
        setIsFormOpen(true);
    };

    const onChange = (key) => (e) => {
        const value = e?.target?.value ?? e;
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const validate = () => {
        const missing = [];
        if (!form.Voucher_Type?.trim()) missing.push("Voucher Name");
        if (!form.Voucher_Code?.trim()) missing.push("Voucher Code");
        if (!String(form.Branch_Id)) missing.push("Branch");
        if (!form.Type?.trim()) missing.push("Type");
        if (missing.length) {
            toast.error(`Please fill: ${missing.join(", ")}`);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const tallySyncValue = tallySync ? 1 : 0;

        const bodyData = {
            Voucher_Type: form.Voucher_Type.trim(),
            Voucher_Code: form.Voucher_Code.trim(),
            Branch_Id: Number(form.Branch_Id),
            GodownId: Number(form?.GodownId),
            Type: form.Type,
            tallySync: tallySyncValue,
            status: Number(form.status) || 0
        };

        const isEdit = formMode === "edit" && form.id;

        const payload = isEdit
            ? {
                address: `masters/voucher`,
                method: "PUT",
                bodyData: {
                    Vocher_Type_Id: form.id,
                    ...bodyData,
                    Alter_By: userId,
                },
            }
            : {
                address: `masters/voucher`,
                method: "POST",
                bodyData: {
                    ...bodyData,
                    Created_By: userId,
                },
            };

        try {
            const res = await fetchLink(payload, loadingOn, loadingOff);
            if (res?.success) {
                toast.success(res.message || (isEdit ? "Updated!" : "Created!"));

                if (!isEdit && form.Type && !typeOptions.includes(form.Type)) {
                    setTypeOptions(prev => [...prev, form.Type]);
                }

                setIsFormOpen(false);
                resetForm();
                setReload((r) => !r);
            } else {
                toast.error(res?.message || "Something went wrong");
            }
        } catch (e) {
            console.error(e);
            toast.error("Request failed");
        }
    };

    const confirmDelete = (row) => {
        setDeleteId(row?.Vocher_Type_Id ?? row?.Voucher_Type_Id ?? "");
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetchLink({
                address: `masters/voucher`,
                method: "DELETE",
                bodyData: { Vocher_Type_Id: deleteId },
                loadingOn, loadingOff
            });
            if (res?.success) {
                toast.success("Voucher deleted successfully!");
                setReload((r) => !r);
                setDeleteOpen(false);
                setDeleteId("");
            } else {
                toast.error(res?.message || "Failed to delete voucher");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error deleting voucher");
        }
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Voucher Master
                    <div className="text-end d-flex align-items-center gap-2">

                        <TextField
                            placeholder="Search vouchers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{
                                width: 250,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    height: '36px'
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={openCreate}
                        >
                            Create Voucher
                        </Button>
                    </div>
                </div>



                <FilterableTable
                    dataArray={filteredData}
                    EnableSerialNumber
                    isExpendable
                    maxHeightOption
                    columns={[
                        createCol("Voucher_Type", "string", "Voucher Type"),
                        createCol("Type", "string", "Type"),
                        createCol("godownNameGet", "string", "Godown Name"),
                        createCol("BranchName", "string", "Branch Name"),
                        createCol("Voucher_Code", "string", "Voucher Code"),
                        {
                            ColumnHeader: "Tally Sync",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const syncValue = Number(row?.tallySync);
                                return (
                                    <span className={syncValue === 1 ? "text-success fw-bold" : "text-secondary"}>
                                        {syncValue == 1 ? "Yes" : "No"}
                                    </span>
                                );
                            }
                        },
                        {
                            ColumnHeader: 'Status',
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                return (
                                    <>
                                        {isEqualNumber(row?.isDeleted, 1) ? (
                                            <span className="badge bg-danger">Inactive</span>
                                        ) : (
                                            <span className="badge bg-success">Active</span>
                                        )}
                                    </>
                                )
                            }
                        },
                        {
                            ColumnHeader: "Actions",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <td className="fa-12" style={{ minWidth: 80 }}>
                                    <IconButton onClick={() => openEdit(row)} size="small">
                                        <Edit className="fa-in" />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => confirmDelete(row)}
                                        size="small"
                                        color="error"
                                    >
                                        <Delete className="fa-in" />
                                    </IconButton>
                                </td>
                            ),
                        },
                    ]}
                />
            </div>

            <Dialog
                fullWidth maxWidth='sm'
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                aria-labelledby="voucher-dialog-title"
            >
                <DialogTitle id="voucher-dialog-title">
                    {formMode === "edit" ? "Edit Voucher" : "Create Voucher"}
                </DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label className="d-block mb-1">Voucher Name</label>
                        <input
                            type="text"
                            value={form.Voucher_Type}
                            onChange={onChange("Voucher_Type")}
                            className="cus-inpt w-100"
                        />
                    </div>

                    <div className="p-2">
                        <label className="d-block mb-1">Voucher Code</label>
                        <input
                            type="text"
                            value={form.Voucher_Code}
                            onChange={onChange("Voucher_Code")}
                            className="cus-inpt w-100"
                        />
                    </div>

                    <div className="p-2">
                        <label className="d-block mb-1">Branch</label>
                        <select
                            value={form.Branch_Id}
                            onChange={onChange("Branch_Id")}
                            className="cus-inpt w-100"
                        >
                            <option value="">Select Branch</option>
                            {branches.map((b) => (
                                <option key={b.BranchId} value={b.BranchId}>
                                    {b.BranchName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-2">
                        <label className="d-block mb-1">Godown</label>
                        <select
                            value={form.GodownId}
                            onChange={onChange("GodownId")}
                            className="cus-inpt w-100"
                        >
                            <option value="">Select Godown</option>
                            {godowns.map((g) => (
                                <option key={g.Godown_Id} value={g.Godown_Id}>
                                    {g.Godown_Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-2">
                        <label className="d-block mb-1">Type</label>
                        <select
                            value={form.Type}
                            onChange={onChange("Type")}
                            className="cus-inpt w-100"
                        >
                            <option value="">Select Type</option>
                            {typeOptions.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-2">
                        <label className="d-block mb-1">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm(prev => ({ ...prev, status: Number(e.target.value) }))}
                            className="cus-inpt w-100"
                        >
                            <option value={0}>Active</option>
                            <option value={1}>Inactive</option>
                        </select>
                    </div>

                    <div className="p-2">
                        <label className="d-block mb-1">Tally Sync</label>
                        <div className="d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={tallySync}
                                onChange={(e) => setTallySync(e.target.checked)}
                                className="me-2"
                                id="tallySyncCheckbox"
                            />
                            <label htmlFor="tallySyncCheckbox" className="mb-0">
                                {tallySync ? "Yes, sync with Tally" : "No, don't sync"}
                            </label>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsFormOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleSubmit} color="success">
                        {formMode === "edit" ? "Update" : "Create"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete the Voucher?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setDeleteOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} autoFocus color="error">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default VoucherMaster;