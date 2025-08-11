import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../Components/filterableTable2";
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import RequiredStar from "../../Components/requiredStar";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { isEqualNumber } from "../../Components/functions";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button as MuiButton } from "@mui/material/";
import CheckIcon from "@mui/icons-material/Check";

const Td = (prop) => (
    <td className="border-0 fa-14 p-2 vctr">{prop.children}</td>
);

const CostCenterMap = ({ loadingOn, loadingOff }) => {
    const initialInputValue = {
        CO_Id: "",
        Cost_Center_Id: "",
        Cost_Center_Name: "",
        User_Type: "",
        Is_Converted_To_User: 0,
        User_Id: "",
    };
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [costCenterData, setCostCenterData] = useState([]);
    const [inputValue, setInputValue] = useState(initialInputValue);
    const [others, setOthers] = useState({
        dialog: false,
        deleteDialog: false,
        refresh: false,
        filterText: "ALL",
    });
    const [addDialogBox, setAddDialogBox] = useState(false);
    const [newChipType, setNewChipType] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [reload, setReload] = useState(false);
    const [usertypes, setUserType] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `masters/getCostCenter`,
        })
            .then((data) => {
                if (data.success) {
                    setCostCenterData(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, [others.refresh]);

    const closeDialog = () => {
        setInputValue(initialInputValue);
        setOthers((prev) => ({ ...prev, dialog: false, deleteDialog: false }));
    };

    useEffect(() => {
        fetchLink({
            address: `masters/erpCostCenter/dropDown`,
        })
            .then((data) => {
                if (data.success) {
                    setUserType(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, [parseData?.Company_id, reload]);

    const handleCreate = () => {
        fetchLink({
            address: `dataEntry/costCategory`,
            method: "POST",
            bodyData: { Cost_Category: newChipType },
        })
            .then((data) => {
                if (data.success) {
                    setIsCreateDialogOpen(false);
                    setNewChipType("");
                    setReload((prev) => !prev);
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const onAddUserSubmit = (e) => {
        e.preventDefault();
        if (loadingOn) loadingOn();

        const userData = {
            Name: inputValue.Name,
            UserId: inputValue.User_Id,
            Cost_Center_Id: inputValue.Cost_Center_Id,
            CO_Id: inputValue.CO_Id,
            value: inputValue.value,
        };

        fetchLink({
            address: "masters/costCenterupdate",
            method: "PUT",
            bodyData: userData,
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Cost Center added successfully");
                    setAddDialogBox(false);
                    setInputValue(initialInputValue);
                    refresh();
                } else {
                    toast.error(data.message || "Failed to create user");
                }
            })
            .catch((e) => {
                console.error(e);
                toast.error("An error occurred while creating the user");
            })
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    const refresh = () => setOthers((pre) => ({ ...pre, refresh: !pre.refresh }));


    const showData =
        others.filterText === "ALL"
            ? costCenterData
            : costCenterData.filter((fil) =>
                String(fil.Cost_Center_Name)
                    .trim()
                    .toLowerCase()
                    .includes(String(others.filterText).trim().toLowerCase())
            );

    return (
        <>
            <Card>
                <div className="p-2 d-flex justify-content-between align-items-center flex-wrap">
                    <h5 className="m-0">Cost Center</h5>
                    <Button
                        variant="outlined"
                        onClick={() => setOthers((pre) => ({ ...pre, dialog: true }))}
                    >
                        Add
                    </Button>
                </div>
                
                <CardContent>
                    <div className="d-flex justiy-content-end align-items-center mb-2">
                        <label className="pe-2">Search: </label>
                        <div className="col-md-3 col-sm-4">
                            <Select
                                value={{ value: others.filterText, label: others.filterText }}
                                onChange={(e) =>
                                    setOthers((prev) => ({ ...prev, filterText: e.value }))
                                }
                                options={[
                                    { value: "ALL", label: "ALL" },
                                    ...costCenterData
                                        .filter((obj) => obj?.Cost_Center_Name)
                                        .map((obj) => ({
                                            value: obj?.Cost_Center_Name,
                                            label: obj?.Cost_Center_Name,
                                        })),
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Search Cost Center"}
                                maxMenuHeight={200}
                            />
                        </div>
                    </div>

                    <FilterableTable
                        dataArray={showData}
                        EnableSerialNumber
                        columns={[
                            {
                                isVisible: 1,
                                Field_Name: "Cost_Center",
                                Fied_Data: "string",
                            },
                            {
                                isVisible: 1,
                                Field_Name: "Cost_Center_Name",
                                Fied_Data: "string",
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: "Actions",
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                if (row?.Is_Converted_To_User !== 1) {
                                                    setInputValue((prev) => ({
                                                        ...prev,
                                                        CO_Id: row?.CO_Id,
                                                        Name: row?.Cost_Center,
                                                        Cost_Center_Id: row?.Cost_Center_Id,
                                                        User_Type: row?.User_Type,
                                                        value: row?.value,
                                                    }));
                                                    setAddDialogBox(true);
                                                }
                                                console.log("inputvale", inputValue);
                                            }}
                                        >
                                            {isEqualNumber(row?.Is_Converted_To_User, 1) ? (
                                                <span style={{ color: "green" }}>
                                                    {" "}
                                                    <CheckIcon />{" "}
                                                </span>
                                            ) : (
                                                <AddBoxIcon />
                                            )}
                                        </IconButton>
                                    </>
                                ),
                            },
                        ]}
                    />
                </CardContent>
            </Card>

            <Dialog open={addDialogBox} fullWidth maxWidth="sm">
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <form onSubmit={onAddUserSubmit}>
                        <div className="table-responsive">
                            <table className="table m-0">
                                <tbody>
                                    <tr>
                                        <td>Name</td>
                                        <td>
                                            <input
                                                value={inputValue.Name}
                                                onChange={(e) =>
                                                    setInputValue((prev) => ({
                                                        ...prev,
                                                        Name: e.target.value,
                                                    }))
                                                }
                                                className="cus-inpt p-2"
                                                required
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <Td>
                                            Cost Center Name <RequiredStar />
                                        </Td>
                                        <Td>
                                            <select
                                                value={inputValue.value}
                                                onChange={(e) =>
                                                    setInputValue((prev) => ({
                                                        ...prev,
                                                        value: e.target.value,
                                                    }))
                                                }
                                                className="cus-inpt p-2"
                                                required
                                                aria-label="Select User Type"
                                            >
                                                <option value="">Select User</option>
                                                {usertypes.map((UserTypeItem, index) => (
                                                    <option key={index} value={UserTypeItem.value}>
                                                        {UserTypeItem.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <DialogActions className="d-flex justify-content-between flex-wrap">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => setInputValue(initialInputValue)}
                            >
                                Clear
                            </Button>
                            <span>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setAddDialogBox(false);
                                        setInputValue(initialInputValue);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="contained">
                                    Submit
                                </Button>
                            </span>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            >
                <DialogTitle id="create-dialog-title">UserType Creation</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>UserType Name</label>
                        <input
                            type="text"
                            onChange={(event) => setNewChipType(event.target.value)}
                            placeholder="Ex: Admin"
                            value={newChipType}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={() => handleCreate()} color="success">
                        CREATE
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CostCenterMap;