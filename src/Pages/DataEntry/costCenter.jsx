import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from '../../Components/filterableTable2'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { Edit } from "@mui/icons-material";
import RequiredStar from "../../Components/requiredStar";
import Select from 'react-select'
import { customSelectStyles } from "../../Components/tablecolumn";
import { isEqualNumber } from "../../Components/functions";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Button as MuiButton } from "@mui/material/";
import CheckIcon from '@mui/icons-material/Check';

const Td = (prop) => <td className="border-0 fa-14 p-2 vctr">{prop.children}</td>

const CostCenter = ({ loadingOn, loadingOff }) => {

    const initialInputValue = {
        Cost_Center_Id: '',
        Cost_Center_Name: '',
        Allias_Name: '',
        User_Type: '',
        Is_Converted_To_User: 0,
        User_Id: '',
    }
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [costCenterData, setCostCenterData] = useState([]);
    const [inputValue, setInputValue] = useState(initialInputValue)
    const [others, setOthers] = useState({
        dialog: false,
        deleteDialog: false,
        refresh: false,
        filterText: 'ALL'
    });
    const [addDialogBox, setAddDialogBox] = useState(false);
    const [companyData, setCompanyData] = useState([]);

    const [newChipType, setNewChipType] = useState("");
    const [branch, setBranch] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [reload, setReload] = useState(false);
    const [usertypes, setUserType] = useState([])
    const [employeeMaster, setEmployeeMaster] = useState([])

    useEffect(() => {
        fetchLink({
            address: `dataEntry/costCenter`
        }).then(data => {
            if (data.success) {
                setCostCenterData(data.data);
            }
        }).catch(e => console.error(e));
    }, [others.refresh]);

    const closeDialog = () => {
        setInputValue(initialInputValue)
        setOthers(prev => ({ ...prev, dialog: false, deleteDialog: false }));


    };

    useEffect(() => {
        fetchLink({
            address: `dataEntry/costCategory/DropDown`
        }).then((data) => {
            if (data.success) {
                setUserType(data.data);
            }
        }).catch((e) => console.error(e));


    }, [parseData?.Company_id, reload]);


    useEffect(() => {
        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
        }).then((data) => {

            if (data.success) {
                setEmployeeMaster(data.data);
            }
        }).catch((e) => console.error(e));


    }, [parseData?.Company_id, reload]);

    useEffect(() => {
        fetchLink({
            address: `masters/branch/dropDown?Company_id=${parseData?.Company_id}`
        }).then((data) => {
            if (data.success) {
                setBranch(data.data);
            }
            fetchLink({
                address: `masters/company?Company_id=${parseData?.Company_id}`
            }).then((data) => {
                if (data.success) {
                    setCompanyData(data.data);
                }
            }).catch((e) => console.error(e));
        }).catch((e) => console.error(e));


    }, [parseData?.Company_id]);


    const handleCreate = () => {
        fetchLink({
            address: `dataEntry/costCategory`,
            method: "POST",
            bodyData: { Cost_Category: newChipType },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setNewChipType("");
                setReload(prev => !prev);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const onAddUserSubmit = (e) => {
        e.preventDefault();
        if (loadingOn) loadingOn();



        const userData = {
            Name: inputValue.Name,
            UserId: inputValue.UserId,
            Cost_Center_Id: inputValue.Cost_Center_Id
        };


        fetchLink({
            address: 'masters/users/costcenter',
            method: 'POST',
            bodyData: userData,
        })
            .then((data) => {
                if (data.success) {
                    toast.success('User created successfully');
                    setAddDialogBox(false);
                    setInputValue(initialInputValue)
                    refresh();
                } else {
                    toast.error(data.message || 'Failed to create user');
                }
            })
            .catch((e) => {
                console.error(e);
                toast.error('An error occurred while creating the user');
            })
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };


    const refresh = () => setOthers(pre => ({ ...pre, refresh: !pre.refresh }))

    const OnSubmit = (e) => {
        e.preventDefault();
        if (loadingOn) loadingOn();

        fetchLink({
            address: `dataEntry/costCenter`,
            method: inputValue.Cost_Center_Id ? 'PUT' : 'POST',
            bodyData: { Cost_Center_Name: inputValue?.Cost_Center_Name, User_Type: inputValue?.User_Type, Cost_Center_Id: inputValue?.Cost_Center_Id, Allias_Name: inputValue?.Allias_Name }
        }).then(data => {

            if (data.success) {
                toast.success(data.message);
                closeDialog();
                refresh();
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const showData = others.filterText === 'ALL'
        ? costCenterData
        : costCenterData.filter(fil => String(fil.Cost_Center_Name).trim().toLowerCase().includes(String(others.filterText).trim().toLowerCase()));



    return (
        <>
            <Card>
                <div className="p-2 d-flex justify-content-between align-items-center flex-wrap">
                    <h5 className="m-0">Cost Center</h5>
                    <Button
                        variant="outlined"
                        onClick={() => setOthers(pre => ({ ...pre, dialog: true }))}
                    >Add</Button>
                </div>
                <CardContent>
                    <div className="d-flex justiy-content-end align-items-center mb-2">
                        <label className="pe-2">Search: </label>
                        <div className="col-md-3 col-sm-4">
                            <Select
                                value={{ value: others.filterText, label: others.filterText }}
                                onChange={(e) => setOthers(prev => ({ ...prev, filterText: e.value }))}
                                options={[{ value: 'ALL', label: 'ALL' }, ...costCenterData.filter(obj => obj?.Cost_Center_Name).map(obj => ({
                                    value: obj?.Cost_Center_Name,
                                    label: obj?.Cost_Center_Name
                                }))]}
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
                                Field_Name: 'Cost_Center_Name',
                                Fied_Data: 'string'
                            },
                            {
                                isVisible: 1,
                                Field_Name: 'Allias_Name',
                                Fied_Data: 'string',
                            },
                            {
                                isVisible: 1,
                                Field_Name: 'UserTypeGet',
                                Fied_Data: 'string'
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'ERP User',
                                isCustomCell: true,
                                align: 'center',
                                Cell: ({ row }) => (
                                    <span className={`cus-badge text-white ${isEqualNumber(row?.Is_Converted_To_User, 1) ? 'bg-success' : 'bg-danger'}`}>
                                        {isEqualNumber(row?.Is_Converted_To_User, 1) ? 'true' : 'false'}
                                    </span>
                                )
                            },
                            {
                                isVisible: 1,
                                Field_Name: 'UserGet',
                                Fied_Data: 'string'
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Actions',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setInputValue(prev => Object.fromEntries(
                                                    Object.entries(prev).map(([key, value]) => [key, row[key] ?? value])
                                                ));
                                                setOthers(prev => ({ ...prev, dialog: true }));
                                            }}
                                        >
                                            <Edit />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                if (row?.Is_Converted_To_User !== 1) {
                                                    setInputValue(prev => ({
                                                        ...prev,
                                                        Name: row?.Cost_Center_Name,
                                                        UserType: row?.User_Type,
                                                        Cost_Center_Id: row?.Cost_Center_Id
                                                    }));
                                                    setAddDialogBox(true);
                                                }
                                            }}
                                        >
                                            {/* <span className={`cus-badge text-white ${isEqualNumber(row?.Is_Converted_To_User, 1) ? 'bg-success' : 'bg-danger'}`}></span> */}
                                            {
                                                isEqualNumber(row?.Is_Converted_To_User, 1)
                                                    ? <span style={{ color: 'green' }}> <CheckIcon /> </span>
                                                    : <AddBoxIcon />

                                            }
                                        </IconButton>
                                    </>
                                )
                            }

                        ]}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={others.dialog}
                // onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>{inputValue.Cost_Center_Id ? 'Modify Records' : 'Add Records'}</DialogTitle>
                <form onSubmit={OnSubmit}>
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table m-0">
                                <tbody>
                                    <tr>
                                        <Td>Cost Center Name <RequiredStar /></Td>
                                        <Td>
                                            <input
                                                value={inputValue.Cost_Center_Name}
                                                onChange={e => setInputValue(pre => ({ ...pre, Cost_Center_Name: e.target.value }))}
                                                className="cus-inpt p-2"
                                                required maxLength={150}
                                            />
                                        </Td>
                                    </tr>
                                    <tr>
                                        <Td>Alias Name</Td>
                                        <Td>
                                            <input
                                                value={inputValue.Allias_Name}
                                                onChange={e => setInputValue(pre => ({ ...pre, Allias_Name: e.target.value }))}
                                                className="cus-inpt p-2"
                                                maxLength={250}
                                            />
                                        </Td>
                                    </tr>
                                    <tr>
                                        <Td>User Type <RequiredStar /></Td>
                                        <Td>
                                            <select
                                                value={inputValue.User_Type}
                                                onChange={(e) =>
                                                    setInputValue((prev) => ({
                                                        ...prev,
                                                        User_Type: e.target.value,
                                                    }))
                                                }
                                                className="cus-inpt p-2"
                                                required
                                                aria-label="Select User Type"
                                            >
                                                <option value="">Select Branch</option>
                                                {usertypes.map((UserTypeItem, index) => (
                                                    <option key={index} value={UserTypeItem.value}>
                                                        {UserTypeItem.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Td>

                                        {/* <Td>
                                            <select
                                                value={inputValue.UserType}
                                                onChange={e => setInputValue(prev => ({ ...prev, UserType: e.target.value }))}
                                                className="cus-inpt p-2"
                                                required
                                                aria-label="Select User Type"
                                            >
                                                <option value="">Select Branch</option>
                                                {usertypes.map((UserTypeItem, index) => (
                                                    <option key={index} value={UserTypeItem.value}>
                                                        {UserTypeItem.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Td> */}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {/* <span>Create New</span> */}
                                            <Button variant="contained" color="primary" onClick={() => setIsCreateDialogOpen(true)}>Create New</Button>
                                        </div>

                                        {/* <button variant="contained"  color="primary" onClick={() => setIsCreateDialogOpen(true)}>Create New</button> */}

                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                    <DialogActions className='d-flex justify-content-between flex-wrap'>
                        <Button type='button' variant="outlined" onClick={() => setInputValue(initialInputValue)}>Clear</Button>
                        <span>
                            <Button type="button" onClick={closeDialog}>cancel</Button>
                            <Button type="submit" variant='contained'>Submit</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={addDialogBox} fullWidth maxWidth="sm">
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    {/* Wrap your fields inside a form */}
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
                                                    setInputValue((prev) => ({ ...prev, Name: e.target.value }))
                                                }
                                                className="cus-inpt p-2"
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <Td>User Type <RequiredStar /></Td>

                                        <Td>
                                            <select
                                                value={inputValue.UserId}
                                                onChange={e => setInputValue(prev => ({ ...prev, UserId: e.target.value }))}
                                                className="cus-inpt p-2"
                                                required
                                                aria-label="Select User Type"
                                            >
                                                <option value="">Select User</option>
                                                {employeeMaster.map((UserTypeItem, index) => (
                                                    <option key={index} value={UserTypeItem.UserId}>
                                                        {UserTypeItem.Name}
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
                                onClick={() =>
                                    setInputValue({
                                        UserId: "",
                                        Name: "",
                                        UserType: "",
                                        UserName: "",
                                        Company_Name: "",
                                        BranchName: "",
                                    })
                                }
                            >
                                Clear
                            </Button>
                            <span>
                                <Button type="button" onClick={() => {
                                    setAddDialogBox(false);
                                    setInputValue(initialInputValue);
                                }} >
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
    )
}

export default CostCenter;