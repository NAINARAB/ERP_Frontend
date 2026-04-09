import { useEffect, useState } from "react";
import { checkIsNumber, getSessionUser, isEqualNumber, isValidNumber } from "../../Components/functions";
import { additionalModules, erpModules, tallyModules } from "../../Components/tablecolumn";
import { fetchLink } from "../../Components/fetchComponent";
import AppTableComponent from "../../Components/appTable/appTableComponent";
import { createCol } from "../../Components/filterableTable2";
import { IconButton } from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import AppDialog from "../../Components/appDialogComponent";
import RequiredStar from "../../Components/requiredStar";
import { toast } from "react-toastify";

const storage = getSessionUser().user;
const voucherTypeColumns = {
    Vocher_Type_Id: '',
    Voucher_Type: '',
    Voucher_Code: '',
    Branch_Id: 0,
    Type: '',
    Tally_Id: 0,
    Alter_Id: '',
    Created_By: storage?.UserId,
    Created_Time: '',
    Alter_By: storage?.UserId,
    Alter_Time: '',
    tally_sync: false,
    deleteFlag: 0,
    GodownId: 0,
    crLimit: 0,
    drLimit: 0,
    tallyModule: ''
}

const validation = (voucherInput) => {
    const errors = {};
    if (String(voucherInput.Voucher_Type).trim().length === 0) errors.Voucher_Type = "Voucher Type is required";
    if (String(voucherInput.Voucher_Code).trim().length === 0) errors.Voucher_Code = "Voucher Code is required";
    if (!isValidNumber(voucherInput.Branch_Id)) errors.Branch_Id = "Branch is required";
    if (String(voucherInput.Type).trim().length === 0) errors.Type = "Type is required";
    if (!isValidNumber(voucherInput.GodownId)) errors.GodownId = "Godown is required";
    return errors;
}

const VoucherTypeMaster = ({ loadingOn, loadingOff }) => {
    const [voucherTypes, setVoucherTyeps] = useState([]);
    const [voucherInput, setVoucherInput] = useState(voucherTypeColumns);
    const [otherControls, setOtherControls] = useState({
        refreshCount: 0,
        dialog: false,
        deleteDialog: false,
        deleteConfirm: false,
    });

    // master details
    const [dependencyData, setDependencyData] = useState({
        branches: [],
        godowns: []
    });

    useEffect(() => {
        fetchLink({
            address: `masters/voucher?showDeleted=1`,
            loadingOn, loadingOff
        }).then(res => {
            if (res.success) setVoucherTyeps(res.data || []);
        }).catch(console.error);
    }, [otherControls.refreshCount]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    branchResponse,
                    godownLocationsResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/godown` }),
                ]);

                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );
                const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                );

                setDependencyData(pre => ({
                    ...pre,
                    branches: branchData,
                    godowns: godownLocations,
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, []);

    const onChange = (key) => (e) => {
        const value = e?.target?.value || '';
        setVoucherInput(prev => ({ ...prev, [key]: value }));
    };

    const closeDialog = (refresh = false) => {
        setOtherControls(pre => ({ 
            ...pre, 
            dialog: false, 
            deleteDialog: false, 
            deleteConfirm: false,
            refreshCount: refresh ? pre.refreshCount + 1 : pre.refreshCount 
        }));
        setVoucherInput(voucherTypeColumns);
    }

    const saveVoucher = () => {
        const validate = validation(voucherInput);
        if (Object.keys(validate).length > 0) {
            toast.error("Please fill all the required fields");
            return;
        }

        fetchLink({
            address: `masters/voucher`,
            method: checkIsNumber(voucherInput.Vocher_Type_Id) ? 'PUT' : 'POST',
            bodyData: { ...voucherInput, tally_sync: voucherInput.tally_sync ? 1 : 0 },
            loadingOff, loadingOn
        }).then(res => {
            if (res.success) {
                toast.success(res.message);
                closeDialog(true);
            } else {
                toast.error(res.message);
            }
        }).catch(console.error)
    }

    return (
        <>

            <AppTableComponent
                dataArray={voucherTypes}
                columns={[
                    createCol("Voucher_Type", "string", "Voucher Type"),
                    createCol("Voucher_Code", "string", "Voucher Code"),
                    createCol("BranchName", "string", "Branch"),
                    createCol("godownNameGet", "string", "Godown"),
                    createCol("Type", "string", "Type"),
                    createCol("crLimit", "number", "Cr Limit"),
                    createCol("drLimit", "number", "Dr Limit"),
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
                                <IconButton
                                    onClick={() => {
                                        setVoucherInput({...row, tally_sync: row.tally_sync});
                                        setOtherControls(pre => ({ ...pre, dialog: true }));
                                    }}
                                    size="small">
                                    <Edit className="fa-in" />
                                </IconButton>
                            </td>
                        ),
                    }
                ]}
                title="Voucher Type Master"
                tableMaxHeight={750}
                initialPageCount={20}
                EnableSerialNumber={true}
                CellSize="small"
                maxHeightOption={false}
                ButtonArea={<>
                    <IconButton
                        variant="contained"
                        color="primary"
                        onClick={() => setOtherControls(pre => ({ ...pre, dialog: true }))}
                    >
                        <Add />
                    </IconButton>
                </>}
                bodyFontSizePx={12}
                headerFontSizePx={12}
                enableGlobalSearch={true}
            />

            <AppDialog
                open={otherControls.dialog}
                onClose={() => closeDialog(false)}
                title="Voucher Type Master"
                maxWidth="sm"
                fullWidth
                submitText="Save"
                onSubmit={saveVoucher}
            >
                <div className="p-2">
                    <label className="d-block mb-1">Voucher Name <RequiredStar /></label>
                    <input
                        type="text"
                        value={voucherInput.Voucher_Type}
                        onChange={onChange("Voucher_Type")}
                        className="cus-inpt w-100"
                    />
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Voucher Code <RequiredStar /></label>
                    <input
                        type="text"
                        value={voucherInput.Voucher_Code}
                        onChange={onChange("Voucher_Code")}
                        className="cus-inpt w-100"
                    />
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Branch <RequiredStar /></label>
                    <select
                        value={voucherInput.Branch_Id}
                        onChange={onChange("Branch_Id")}
                        className="cus-inpt w-100"
                    >
                        <option value={0}>Select Branch</option>
                        {dependencyData.branches.map((b) => (
                            <option key={b.BranchId} value={b.BranchId}>
                                {b.BranchName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Godown <RequiredStar /></label>
                    <select
                        value={voucherInput.GodownId}
                        onChange={onChange("GodownId")}
                        className="cus-inpt w-100"
                    >
                        <option value={0}>Select Godown</option>
                        {dependencyData.godowns.map((g) => (
                            <option key={g.Godown_Id} value={g.Godown_Id}>
                                {g.Godown_Name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Type <RequiredStar /></label>
                    <select
                        value={voucherInput.Type}
                        onChange={onChange("Type")}
                        className="cus-inpt w-100"
                    >
                        <option value="">Select Type</option>
                        {[...erpModules, ...additionalModules].sort((a, b) => a.name.localeCompare(b.name)).map((obj) => (
                            <option key={obj.name} value={obj.name}>{obj.alias}</option>
                        ))}
                    </select>
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Status <RequiredStar /></label>
                    <select
                        value={voucherInput.status}
                        onChange={onChange("status")}
                        className="cus-inpt w-100"
                    >
                        <option value={0}>Active</option>
                        <option value={1}>Inactive</option>
                    </select>
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Tally Module</label>
                    <select
                        value={voucherInput.tallyModule}
                        onChange={onChange("tallyModule")}
                        className="cus-inpt w-100"
                    >
                        <option value="">Select Tally Module</option>
                        {tallyModules.map((m) => (
                            <option key={m.value} value={m.value}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="p-2 row">
                    <div className="col-6">
                        <label className="d-block mb-1">CR Limit</label>
                        <input
                            type="number"
                            value={voucherInput.crLimit}
                            onChange={onChange("crLimit")}
                            className="cus-inpt w-100"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="col-6">
                        <label className="d-block mb-1">DR Limit</label>
                        <input
                            type="number"
                            value={voucherInput.drLimit}
                            onChange={onChange("drLimit")}
                            className="cus-inpt w-100"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Tally Sync</label>
                    <div className="d-flex align-items-center">
                        <input
                            type="checkbox"
                            checked={voucherInput.tally_sync}
                            onChange={(e) => setVoucherInput(pre => ({ ...pre, tally_sync: e.target.checked }))}
                            className="me-2"
                            id="tallySyncCheckbox"
                        />
                        <label htmlFor="tallySyncCheckbox" className="mb-0">
                            {voucherInput.tally_sync ? "Yes, sync with Tally" : "No, don't sync"}
                        </label>
                    </div>
                </div>
            </AppDialog>
        </>
    )
}

export default VoucherTypeMaster;