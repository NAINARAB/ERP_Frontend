import { useEffect, useState } from "react";
import { isValidNumber } from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import AppTableComponent from "../../Components/appTable/appTableComponent";
import { createCol } from "../../Components/filterableTable2";
import { IconButton } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import AppDialog from "../../Components/appDialogComponent";
import RequiredStar from "../../Components/requiredStar";
import { toast } from "react-toastify";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";

const mappingColumns = {
    id: '',
    Acc_Id: 0,
    Account_name: '',
    UserId: 0,
    UserName: ''
}

const validation = (input) => {
    const errors = {};
    if (!isValidNumber(input.Acc_Id)) errors.Acc_Id = "Account is required";
    if (!isValidNumber(input.UserId)) errors.UserId = "User is required";
    return errors;
}

const UserAccountMapping = ({ loadingOn, loadingOff }) => {
    const [mappings, setMappings] = useState([]);
    const [mappingInput, setMappingInput] = useState(mappingColumns);
    const [otherControls, setOtherControls] = useState({
        refreshCount: 0,
        dialog: false,
        deleteDialog: false,
    });

    const [dependencyData, setDependencyData] = useState({
        accounts: [],
        users: []
    });

    useEffect(() => {
        fetchLink({
            address: `masters/userAccountMapping`,
            loadingOn, loadingOff
        }).then(res => {
            if (res.success) setMappings(res.data || []);
        }).catch(console.error);
    }, [otherControls.refreshCount]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    accountsResponse,
                    usersResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/accountMaster` }),
                    fetchLink({ address: `masters/user/dropDown` }),
                ]);

                const accountsData = (accountsResponse.success ? accountsResponse.data : []).sort(
                    (a, b) => String(a?.Account_name).localeCompare(b?.Account_name)
                );
                const usersData = (usersResponse.success ? usersResponse.data : []).sort(
                    (a, b) => String(a?.Name).localeCompare(b?.Name)
                );

                setDependencyData(pre => ({
                    ...pre,
                    accounts: accountsData,
                    users: usersData,
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, []);

    const closeDialog = (refresh = false) => {
        setOtherControls(pre => ({
            ...pre,
            dialog: false,
            deleteDialog: false,
            refreshCount: refresh ? pre.refreshCount + 1 : pre.refreshCount
        }));
        setMappingInput(mappingColumns);
    }

    const saveMapping = () => {
        const validate = validation(mappingInput);
        if (Object.keys(validate).length > 0) {
            toast.error("Please fill all the required fields");
            return;
        }

        fetchLink({
            address: `masters/userAccountMapping`,
            method: mappingInput.id ? 'PUT' : 'POST',
            bodyData: mappingInput,
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

    const deleteMapping = () => {
        fetchLink({
            address: `masters/userAccountMapping`,
            method: 'DELETE',
            bodyData: { id: mappingInput.id },
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
                dataArray={mappings}
                columns={[
                    createCol("UserName", "string", "User Name"),
                    createCol("Account_name", "string", "Account Name"),
                    {
                        ColumnHeader: "Actions",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <td className="fa-12" style={{ minWidth: 80 }}>
                                <IconButton
                                    onClick={() => {
                                        setMappingInput(row);
                                        setOtherControls(pre => ({ ...pre, dialog: true }));
                                    }}
                                    size="small">
                                    <Edit className="fa-in" />
                                </IconButton>
                                <IconButton
                                    onClick={() => {
                                        setMappingInput(row);
                                        setOtherControls(pre => ({ ...pre, deleteDialog: true }));
                                    }}
                                    color="error"
                                    size="small">
                                    <Delete className="fa-in" />
                                </IconButton>
                            </td>
                        ),
                    }
                ]}
                title="User Account Mapping"
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
                title="User Account Mapping"
                maxWidth="sm"
                fullWidth
                submitText="Save"
                onSubmit={saveMapping}
            >
                <div className="p-2">
                    <label className="d-block mb-1">User <RequiredStar /></label>
                    <Select
                        value={{ value: mappingInput.UserId, label: mappingInput.UserName }}
                        onChange={e => setMappingInput(prev => ({ ...prev, UserId: e.value, UserName: e.label }))}
                        options={dependencyData.users.map(u => ({ value: u.UserId, label: u.Name }))}
                        styles={customSelectStyles}
                        isClearable
                        placeholder="Select User"
                        menuPortalTarget={document.body}
                    />
                </div>

                <div className="p-2">
                    <label className="d-block mb-1">Account <RequiredStar /></label>
                    <Select
                        value={{ value: mappingInput.Acc_Id, label: mappingInput.Account_name }}
                        onChange={e => setMappingInput(prev => ({ ...prev, Acc_Id: e.value, Account_name: e.label }))}
                        options={dependencyData.accounts.map(a => ({ value: a.Acc_Id, label: a.Account_name }))}
                        styles={customSelectStyles}
                        isClearable
                        placeholder="Select Account"
                        menuPortalTarget={document.body}
                    />
                </div>
            </AppDialog>

            <AppDialog
                open={otherControls.deleteDialog}
                onClose={() => closeDialog(false)}
                title="Confirm Delete"
                maxWidth="xs"
                fullWidth
                submitText="Delete"
                submitButtonColor="error"
                onSubmit={deleteMapping}
            >
                <div className="p-3 text-center">
                    Are you sure you want to delete this mapping?
                </div>
            </AppDialog>
        </>
    )
}

export default UserAccountMapping;