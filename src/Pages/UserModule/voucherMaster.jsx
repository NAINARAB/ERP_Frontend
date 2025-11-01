// import React, { useEffect, useMemo, useState, Fragment } from "react";
// import {
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     IconButton,
//     Button as MuiButton,
// } from "@mui/material";
// import { toast } from "react-toastify";
// import { Button } from "react-bootstrap";
// import { Delete, Edit } from "@mui/icons-material";
// import { fetchLink } from "../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../Components/filterableTable2";
// import { erpModules } from "../../Components/tablecolumn";

// const EMPTY_FORM = {
//     id: "",
//     Voucher_Type: "",
//     Voucher_Code: "",
//     Branch_Id: "",
//     Type: "",
// };

// function VoucherMaster({ loadingOn, loadingOff }) {
//     const [voucherData, setVoucherData] = useState([]);
//     const [branches, setBranches] = useState([]);
//     const [reload, setReload] = useState(false);

//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [formMode, setFormMode] = useState("create");
//     const [form, setForm] = useState(EMPTY_FORM);

//     const [deleteOpen, setDeleteOpen] = useState(false);
//     const [deleteId, setDeleteId] = useState("");

//     const user = JSON.parse(localStorage.getItem("user"));
//     const userId = user?.UserId;

//     const TYPE_OPTIONS = useMemo(() => {
//         const base = (erpModules || []).map((m) => m?.name).filter(Boolean);
//         const extras = ["MATERIAL INWARD", "OTHER GODOWN", "PROCESSING"];
//         return Array.from(new Set([...base, ...extras]));
//     }, []);

//     useEffect(() => {
//         // vouchers
//         fetchLink({ address: `masters/voucher` })
//             .then((res) => {
//                 if (res?.success) setVoucherData(res.data || []);
//             })
//             .catch(console.error);

//         // branches dropdown
//         fetchLink({ address: `masters/branch/dropDown` })
//             .then((res) => {
//                 if (res?.success) setBranches(res.data || []);
//             })
//             .catch(console.error);
//     }, [reload]);

//     const resetForm = () => setForm(EMPTY_FORM);

//     const openCreate = () => {
//         setFormMode("create");
//         resetForm();
//         setIsFormOpen(true);
//     };

//     const openEdit = (row) => {
//         setFormMode("edit");
//         setForm({
//             id: row?.Vocher_Type_Id ?? row?.Voucher_Type_Id ?? "",
//             Voucher_Type: row?.Voucher_Type ?? "",
//             Voucher_Code: row?.Voucher_Code ?? "",
//             Branch_Id: row?.Branch_Id ?? "",
//             Type: row?.Type ?? "",
//         });
//         setIsFormOpen(true);
//     };

//     const onChange = (key) => (e) => {
//         const value = e?.target?.value ?? e;
//         setForm((prev) => ({ ...prev, [key]: value }));
//     };

//     const validate = () => {
//         const missing = [];
//         if (!form.Voucher_Type?.trim()) missing.push("Voucher Name");
//         if (!form.Voucher_Code?.trim()) missing.push("Voucher Code");
//         if (!String(form.Branch_Id)) missing.push("Branch");
//         if (!form.Type?.trim()) missing.push("Type");
//         if (missing.length) {
//             toast.error(`Please fill: ${missing.join(", ")}`);
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async () => {
//         if (!validate()) return;

//         const bodyData = {
//             Voucher_Type: form.Voucher_Type.trim(),
//             Voucher_Code: form.Voucher_Code.trim(),
//             Branch_Id: Number(form.Branch_Id),
//             Type: form.Type,
//         };

//         const isEdit = formMode === "edit" && form.id;

//         const payload = isEdit
//             ? {
//                 address: `masters/voucher`,
//                 method: "PUT",
//                 bodyData: {
//                     Vocher_Type_Id: form.id, // backend spelling
//                     ...bodyData,
//                     Alter_By: userId,
//                 },
//             }
//             : {
//                 address: `masters/voucher`,
//                 method: "POST",
//                 bodyData: {
//                     ...bodyData,
//                     Created_By: userId,
//                 },
//             };

//         try {
//             const res = await fetchLink(payload, loadingOn, loadingOff);
//             if (res?.success) {
//                 toast.success(res.message || (isEdit ? "Updated!" : "Created!"));
//                 setIsFormOpen(false);
//                 resetForm();
//                 setReload((r) => !r);
//             } else {
//                 toast.error(res?.message || "Something went wrong");
//             }
//         } catch (e) {
//             console.error(e);
//             toast.error("Request failed");
//         }
//     };

//     const confirmDelete = (row) => {
//         setDeleteId(row?.Vocher_Type_Id ?? row?.Voucher_Type_Id ?? "");
//         setDeleteOpen(true);
//     };

//     const handleDelete = async () => {
//         if (!deleteId) return;
//         try {
//             const res = await fetchLink({
//                 address: `masters/voucher`,
//                 method: "DELETE",
//                 bodyData: { Vocher_Type_Id: deleteId },
//                 loadingOn, loadingOff
//             });
//             if (res?.success) {
//                 toast.success("Voucher deleted successfully!");
//                 setReload((r) => !r);
//                 setDeleteOpen(false);
//                 setDeleteId("");
//             } else {
//                 toast.error(res?.message || "Failed to delete voucher");
//             }
//         } catch (e) {
//             console.error(e);
//             toast.error("Error deleting voucher");
//         }
//     };

//     return (
//         <Fragment>
//             <div className="card">
//                 <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
//                     Voucher Master
//                     <div className="text-end">
//                         <Button
//                             className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
//                             onClick={openCreate}
//                         >
//                             Create Voucher
//                         </Button>
//                     </div>
//                 </div>

//                 <FilterableTable
//                     dataArray={voucherData}
//                     EnableSerialNumber
//                     isExpendable
//                     maxHeightOption
//                     columns={[
//                         createCol("Voucher_Type", "string", "Voucher Type"),
//                         createCol("Type", "string", "Type"),
//                         createCol("BranchName", "string", "Branch Name"),
//                         createCol("Voucher_Code", "string", "Voucher Code"),
//                         {
//                             ColumnHeader: "Actions",
//                             isVisible: 1,
//                             isCustomCell: true,
//                             Cell: ({ row }) => (
//                                 <td className="fa-12" style={{ minWidth: 80 }}>
//                                     <IconButton onClick={() => openEdit(row)} size="small">
//                                         <Edit className="fa-in" />
//                                     </IconButton>
//                                     <IconButton
//                                         onClick={() => confirmDelete(row)}
//                                         size="small"
//                                         color="error"
//                                     >
//                                         <Delete className="fa-in" />
//                                     </IconButton>
//                                 </td>
//                             ),
//                         },
//                     ]}
//                 />
//             </div>

//             <Dialog
//                 open={isFormOpen}
//                 onClose={() => setIsFormOpen(false)}
//                 aria-labelledby="voucher-dialog-title"
//             >
//                 <DialogTitle id="voucher-dialog-title">
//                     {formMode === "edit" ? "Edit Voucher" : "Create Voucher"}
//                 </DialogTitle>
//                 <DialogContent>
//                     <div className="p-2">
//                         <label>Voucher Name</label>
//                         <input
//                             type="text"
//                             value={form.Voucher_Type}
//                             onChange={onChange("Voucher_Type")}
//                             className="cus-inpt"
//                         />
//                     </div>

//                     <div className="p-2">
//                         <label>Voucher Code</label>
//                         <input
//                             type="text"
//                             value={form.Voucher_Code}
//                             onChange={onChange("Voucher_Code")}
//                             className="cus-inpt"
//                         />
//                     </div>

//                     <div className="p-2">
//                         <label>Branch</label>
//                         <select
//                             value={form.Branch_Id}
//                             onChange={onChange("Branch_Id")}
//                             className="cus-inpt"
//                         >
//                             <option value="">Select Branch</option>
//                             {branches.map((b) => (
//                                 <option key={b.BranchId} value={b.BranchId}>
//                                     {b.BranchName}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="p-2">
//                         <label>Type</label>
//                         <select
//                             value={form.Type}
//                             onChange={onChange("Type")}
//                             className="cus-inpt"
//                         >
//                             <option value="">Select Type</option>
//                             {TYPE_OPTIONS.map((name) => (
//                                 <option key={name} value={name}>
//                                     {name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <MuiButton onClick={() => setIsFormOpen(false)}>Cancel</MuiButton>
//                     <MuiButton onClick={handleSubmit} color="success">
//                         {formMode === "edit" ? "Update" : "Create"}
//                     </MuiButton>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={deleteOpen}
//                 onClose={() => setDeleteOpen(false)}
//                 aria-labelledby="delete-dialog-title"
//             >
//                 <DialogTitle id="delete-dialog-title">Confirmation</DialogTitle>
//                 <DialogContent>
//                     <b>Do you want to delete the Voucher?</b>
//                 </DialogContent>
//                 <DialogActions>
//                     <MuiButton onClick={() => setDeleteOpen(false)}>Cancel</MuiButton>
//                     <MuiButton onClick={handleDelete} autoFocus color="error">
//                         Delete
//                     </MuiButton>
//                 </DialogActions>
//             </Dialog>
//         </Fragment>
//     );
// }

// export default VoucherMaster;













import React, { useEffect, useState, Fragment } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Button as MuiButton,
} from "@mui/material";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { erpModules } from "../../Components/tablecolumn";

const EMPTY_FORM = {
    id: "",
    Voucher_Type: "",
    Voucher_Code: "",
    Branch_Id: "",
    Type: "",
};

function VoucherMaster({ loadingOn, loadingOff }) {
    const [voucherData, setVoucherData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [reload, setReload] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [form, setForm] = useState(EMPTY_FORM);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;
    const [tallySync, setTallySync] = useState(false);

    // Use state for typeOptions
    const [typeOptions, setTypeOptions] = useState([]);

    useEffect(() => {
        // Initialize type options
        const baseOptions = (erpModules || []).map((m) => m?.name).filter(Boolean);
        const extras = ["MATERIAL INWARD", "OTHER GODOWN", "PROCESSING"];
        const initialOptions = Array.from(new Set([...baseOptions, ...extras]));
        setTypeOptions(initialOptions);
    }, []);

    useEffect(() => {
        fetchLink({ address: `masters/voucher` })
            .then((res) => {
                if (res?.success) {
                    setVoucherData(res.data || []);

                    // Extract all unique types from the fetched data and add to typeOptions
                    const typesFromData = res.data
                        .map(item => item?.Type)
                        .filter(Boolean)
                        .filter(type => !typeOptions.includes(type));

                    if (typesFromData.length > 0) {
                        setTypeOptions(prev => Array.from(new Set([...prev, ...typesFromData])));
                    }
                }
            })
            .catch(console.error);

        fetchLink({ address: `masters/branch/dropDown` })
            .then((res) => {
                if (res?.success) setBranches(res.data || []);
            })
            .catch(console.error);
    }, [reload]);

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
        if (row?.Type && !typeOptions.includes(row.Type)) {
            setTypeOptions((prev) => [...prev, row.Type]);
        }

        setForm({
            id: row?.Vocher_Type_Id || "",
            Voucher_Type: row?.Voucher_Type || "",
            Voucher_Code: row?.Voucher_Code || "",
            Branch_Id: row?.Branch_Id || "",
            Type: row?.Type || "",
        });

        // ✅ Convert DB value (0/1 or "0"/"1") to boolean
        setTallySync(Number(row?.tallySync) === 0);

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

        const bodyData = {
            Voucher_Type: form.Voucher_Type.trim(),
            Voucher_Code: form.Voucher_Code.trim(),
            Branch_Id: Number(form.Branch_Id),
            Type: form.Type,
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
                    tallySync: tallySync,

                },
            }
            : {
                address: `masters/voucher`,
                method: "POST",
                bodyData: {
                    ...bodyData,
                    Created_By: userId,
                    tallySync: tallySync,

                },
            };

        try {
            const res = await fetchLink(payload, loadingOn, loadingOff);
            if (res?.success) {
                toast.success(res.message || (isEdit ? "Updated!" : "Created!"));

                // setTallySync(false);

                // Add the new type to typeOptions if it's a new type
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
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={openCreate}
                        >
                            Create Voucher
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={voucherData}
                    EnableSerialNumber
                    isExpendable
                    maxHeightOption
                    columns={[
                        createCol("Voucher_Type", "string", "Voucher Type"),
                        createCol("Type", "string", "Type"),
                        createCol("BranchName", "string", "Branch Name"),
                        createCol("Voucher_Code", "string", "Voucher Code"),
                        createCol("Tally Sync", "string", "Tally Sync", (row) =>
                            row?.tallySync == 0 ? "Yes" : "No"
                        ),
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
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                aria-labelledby="voucher-dialog-title"
            >
                <DialogTitle id="voucher-dialog-title">
                    {formMode === "edit" ? "Edit Voucher" : "Create Voucher"}
                </DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Voucher Name</label>
                        <input
                            type="text"
                            value={form.Voucher_Type}
                            onChange={onChange("Voucher_Type")}
                            className="cus-inpt"
                        />
                    </div>

                    <div className="p-2">
                        <label>Voucher Code</label>
                        <input
                            type="text"
                            value={form.Voucher_Code}
                            onChange={onChange("Voucher_Code")}
                            className="cus-inpt"
                        />
                    </div>

                    <div className="p-2">
                        <label>Branch</label>
                        <select
                            value={form.Branch_Id}
                            onChange={onChange("Branch_Id")}
                            className="cus-inpt"
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
                        <label>Type</label>
                        <select value={form.Type} onChange={onChange("Type")} className="cus-inpt">
                            <option value="">Select Type</option>
                            {typeOptions.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-2">
                        <label className="mr-2, me-2">Tally Sync:</label>
                        <label className="mr-2">
                            <input
                                type="checkbox"
                                checked={tallySync}
                                onChange={(e) => setTallySync(e.target.checked)}
                                className="me-2"
                            />{" "}
                            {tallySync ? "Yes" : "No"}
                        </label>
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