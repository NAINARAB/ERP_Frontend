// import { useEffect, useState } from "react";
// import { fetchLink } from "../../Components/fetchComponent";
// import FilterableTable from '../../Components/filterableTable2'
// import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
// import { toast } from "react-toastify";
// import { Edit } from "@mui/icons-material";
// import RequiredStar from "../../Components/requiredStar";
// import Select from 'react-select'
// import { customSelectStyles } from "../../Components/tablecolumn";
// import { isEqualNumber } from "../../Components/functions";
// import AddBoxIcon from '@mui/icons-material/AddBox';
// import { Button as MuiButton } from "@mui/material/";
// import CheckIcon from '@mui/icons-material/Check';

// const Td = (prop) => <td className="border-0 fa-14 p-2 vctr">{prop.children}</td>

// const CostCenter = ({ loadingOn, loadingOff }) => {

//     const initialInputValue = {
//         Cost_Center_Id: '',
//         Cost_Center_Name: '',
//         Allias_Name: '',
//         User_Type: '',
//         Is_Converted_To_User: 0,
//         User_Id: '',
//     }
//     const parseData = JSON.parse(localStorage.getItem("user"));
//     const [costCenterData, setCostCenterData] = useState([]);
//     const [inputValue, setInputValue] = useState(initialInputValue)
//     const [others, setOthers] = useState({
//         dialog: false,
//         deleteDialog: false,
//         refresh: false,
//         filterText: 'ALL'
//     });
//     const [addDialogBox, setAddDialogBox] = useState(false);
//     const [companyData, setCompanyData] = useState([]);

//     const [newChipType, setNewChipType] = useState("");
//     const [branch, setBranch] = useState([]);
//     const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//     const [reload, setReload] = useState(false);
//     const [usertypes, setUserType] = useState([])
//     const [employeeMaster, setEmployeeMaster] = useState([])

//     useEffect(() => {
//         fetchLink({
//             address: `dataEntry/costCenter`
//         }).then(data => {
//             if (data.success) {
//                 setCostCenterData(data.data);
//             }
//         }).catch(e => console.error(e));
//     }, [others.refresh]);

//     const closeDialog = () => {
//         setInputValue(initialInputValue)
//         setOthers(prev => ({ ...prev, dialog: false, deleteDialog: false }));


//     };

//     useEffect(() => {
//         fetchLink({
//             address: `dataEntry/costCategory/DropDown`
//         }).then((data) => {
//             if (data.success) {
//                 setUserType(data.data);
//             }
//         }).catch((e) => console.error(e));


//     }, [parseData?.Company_id, reload]);


//     useEffect(() => {
//         fetchLink({
//             address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
//         }).then((data) => {

//             if (data.success) {
//                 setEmployeeMaster(data.data);
//             }
//         }).catch((e) => console.error(e));


//     }, [parseData?.Company_id, reload]);

//     useEffect(() => {
//         fetchLink({
//             address: `masters/branch/dropDown?Company_id=${parseData?.Company_id}`
//         }).then((data) => {
//             if (data.success) {
//                 setBranch(data.data);
//             }
//             fetchLink({
//                 address: `masters/company?Company_id=${parseData?.Company_id}`
//             }).then((data) => {
//                 if (data.success) {
//                     setCompanyData(data.data);
//                 }
//             }).catch((e) => console.error(e));
//         }).catch((e) => console.error(e));


//     }, [parseData?.Company_id]);


//     const handleCreate = () => {
//         fetchLink({
//             address: `dataEntry/costCategory`,
//             method: "POST",
//             bodyData: { Cost_Category: newChipType },
//         }).then((data) => {
//             if (data.success) {
//                 setIsCreateDialogOpen(false);
//                 setNewChipType("");
//                 setReload(prev => !prev);
//                 toast.success(data.message);
//             } else {
//                 toast.error(data.message);
//             }
//         }).catch(e => console.error(e));
//     };

//     const onAddUserSubmit = (e) => {
//         e.preventDefault();
//         if (loadingOn) loadingOn();



//         const userData = {
//             Name: inputValue.Name,
//             UserId: inputValue.UserId,
//             Cost_Center_Id: inputValue.Cost_Center_Id
//         };


//         fetchLink({
//             address: 'masters/users/costcenter',
//             method: 'POST',
//             bodyData: userData,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     toast.success('User created successfully');
//                     setAddDialogBox(false);
//                     setInputValue(initialInputValue)
//                     refresh();
//                 } else {
//                     toast.error(data.message || 'Failed to create user');
//                 }
//             })
//             .catch((e) => {
//                 console.error(e);
//                 toast.error('An error occurred while creating the user');
//             })
//             .finally(() => {
//                 if (loadingOff) loadingOff();
//             });
//     };


//     const refresh = () => setOthers(pre => ({ ...pre, refresh: !pre.refresh }))

//     const OnSubmit = (e) => {
//         e.preventDefault();
//         if (loadingOn) loadingOn();

//         fetchLink({
//             address: `dataEntry/costCenter`,
//             method: inputValue.Cost_Center_Id ? 'PUT' : 'POST',
//             bodyData: { Cost_Center_Name: inputValue?.Cost_Center_Name, User_Type: inputValue?.User_Type, Cost_Center_Id: inputValue?.Cost_Center_Id, Allias_Name: inputValue?.Allias_Name }
//         }).then(data => {

//             if (data.success) {
//                 toast.success(data.message);
//                 closeDialog();
//                 refresh();
//             } else {
//                 toast.error(data.message);
//             }
//         }).catch(e => console.error(e)).finally(() => {
//             if (loadingOff) loadingOff();
//         })
//     }

//     const showData = others.filterText === 'ALL'
//         ? costCenterData
//         : costCenterData.filter(fil => String(fil.Cost_Center_Name).trim().toLowerCase().includes(String(others.filterText).trim().toLowerCase()));



//     return (
//         <>
//             <Card>
//                 <div className="p-2 d-flex justify-content-between align-items-center flex-wrap">
//                     <h5 className="m-0">Cost Center</h5>
//                     <Button
//                         variant="outlined"
//                         onClick={() => setOthers(pre => ({ ...pre, dialog: true }))}
//                     >Add</Button>
//                 </div>
//                 <CardContent>
//                     <div className="d-flex justiy-content-end align-items-center mb-2">
//                         <label className="pe-2">Search: </label>
//                         <div className="col-md-3 col-sm-4">
//                             <Select
//                                 value={{ value: others.filterText, label: others.filterText }}
//                                 onChange={(e) => setOthers(prev => ({ ...prev, filterText: e.value }))}
//                                 options={[{ value: 'ALL', label: 'ALL' }, ...costCenterData.filter(obj => obj?.Cost_Center_Name).map(obj => ({
//                                     value: obj?.Cost_Center_Name,
//                                     label: obj?.Cost_Center_Name
//                                 }))]}
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 placeholder={"Search Cost Center"}
//                                 maxMenuHeight={200}
//                             />

//                         </div>
//                     </div>
//                     <FilterableTable
//                         dataArray={showData}
//                         EnableSerialNumber
//                         columns={[
//                             {
//                                 isVisible: 1,
//                                 Field_Name: 'Cost_Center_Name',
//                                 Fied_Data: 'string'
//                             },
//                             {
//                                 isVisible: 1,
//                                 Field_Name: 'Allias_Name',
//                                 Fied_Data: 'string',
//                             },
//                             {
//                                 isVisible: 1,
//                                 Field_Name: 'UserTypeGet',
//                                 Fied_Data: 'string'
//                             },
//                             {
//                                 isVisible: 1,
//                                 ColumnHeader: 'ERP User',
//                                 isCustomCell: true,
//                                 align: 'center',
//                                 Cell: ({ row }) => (
//                                     <span className={`cus-badge text-white ${isEqualNumber(row?.Is_Converted_To_User, 1) ? 'bg-success' : 'bg-danger'}`}>
//                                         {isEqualNumber(row?.Is_Converted_To_User, 1) ? 'true' : 'false'}
//                                     </span>
//                                 )
//                             },
//                             {
//                                 isVisible: 1,
//                                 Field_Name: 'UserGet',
//                                 Fied_Data: 'string'
//                             },
//                             {
//                                 isVisible: 1,
//                                 ColumnHeader: 'Actions',
//                                 isCustomCell: true,
//                                 Cell: ({ row }) => (
//                                     <>
//                                         <IconButton
//                                             size="small"
//                                             onClick={() => {
//                                                 setInputValue(prev => Object.fromEntries(
//                                                     Object.entries(prev).map(([key, value]) => [key, row[key] ?? value])
//                                                 ));
//                                                 setOthers(prev => ({ ...prev, dialog: true }));
//                                             }}
//                                         >
//                                             <Edit />
//                                         </IconButton>

//                                         <IconButton
//                                             size="small"
//                                             color="error"
//                                             onClick={() => {
//                                                 if (row?.Is_Converted_To_User !== 1) {
//                                                     setInputValue(prev => ({
//                                                         ...prev,
//                                                         Name: row?.Cost_Center_Name,
//                                                         UserType: row?.User_Type,
//                                                         Cost_Center_Id: row?.Cost_Center_Id
//                                                     }));
//                                                     setAddDialogBox(true);
//                                                 }
//                                             }}
//                                         >
//                                             {/* <span className={`cus-badge text-white ${isEqualNumber(row?.Is_Converted_To_User, 1) ? 'bg-success' : 'bg-danger'}`}></span> */}
//                                             {
//                                                 isEqualNumber(row?.Is_Converted_To_User, 1)
//                                                     ? <span style={{ color: 'green' }}> <CheckIcon /> </span>
//                                                     : <AddBoxIcon />

//                                             }
//                                         </IconButton>
//                                     </>
//                                 )
//                             }

//                         ]}
//                     />
//                 </CardContent>
//             </Card>

//             <Dialog
//                 open={others.dialog}
//                 // onClose={closeDialog}
//                 fullWidth maxWidth='sm'
//             >
//                 <DialogTitle>{inputValue.Cost_Center_Id ? 'Modify Records' : 'Add Records'}</DialogTitle>
//                 <form onSubmit={OnSubmit}>
//                     <DialogContent>
//                         <div className="table-responsive">
//                             <table className="table m-0">
//                                 <tbody>
//                                     <tr>
//                                         <Td>Cost Center Name <RequiredStar /></Td>
//                                         <Td>
//                                             <input
//                                                 value={inputValue.Cost_Center_Name}
//                                                 onChange={e => setInputValue(pre => ({ ...pre, Cost_Center_Name: e.target.value }))}
//                                                 className="cus-inpt p-2"
//                                                 required maxLength={150}
//                                             />
//                                         </Td>
//                                     </tr>
//                                     <tr>
//                                         <Td>Alias Name</Td>
//                                         <Td>
//                                             <input
//                                                 value={inputValue.Allias_Name}
//                                                 onChange={e => setInputValue(pre => ({ ...pre, Allias_Name: e.target.value }))}
//                                                 className="cus-inpt p-2"
//                                                 maxLength={250}
//                                             />
//                                         </Td>
//                                     </tr>
//                                     <tr>
//                                         <Td>User Type <RequiredStar /></Td>
//                                         <Td>
//                                             <select
//                                                 value={inputValue.User_Type}
//                                                 onChange={(e) =>
//                                                     setInputValue((prev) => ({
//                                                         ...prev,
//                                                         User_Type: e.target.value,
//                                                     }))
//                                                 }
//                                                 className="cus-inpt p-2"
//                                                 required
//                                                 aria-label="Select User Type"
//                                             >
//                                                 <option value="">Select Branch</option>
//                                                 {usertypes.map((UserTypeItem, index) => (
//                                                     <option key={index} value={UserTypeItem.value}>
//                                                         {UserTypeItem.label}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </Td>

//                                         {/* <Td>
//                                             <select
//                                                 value={inputValue.UserType}
//                                                 onChange={e => setInputValue(prev => ({ ...prev, UserType: e.target.value }))}
//                                                 className="cus-inpt p-2"
//                                                 required
//                                                 aria-label="Select User Type"
//                                             >
//                                                 <option value="">Select Branch</option>
//                                                 {usertypes.map((UserTypeItem, index) => (
//                                                     <option key={index} value={UserTypeItem.value}>
//                                                         {UserTypeItem.label}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </Td> */}

//                                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                             {/* <span>Create New</span> */}
//                                             <Button variant="contained" color="primary" onClick={() => setIsCreateDialogOpen(true)}>Create New</Button>
//                                         </div>

//                                         {/* <button variant="contained"  color="primary" onClick={() => setIsCreateDialogOpen(true)}>Create New</button> */}

//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </DialogContent>
//                     <DialogActions className='d-flex justify-content-between flex-wrap'>
//                         <Button type='button' variant="outlined" onClick={() => setInputValue(initialInputValue)}>Clear</Button>
//                         <span>
//                             <Button type="button" onClick={closeDialog}>cancel</Button>
//                             <Button type="submit" variant='contained'>Submit</Button>
//                         </span>
//                     </DialogActions>
//                 </form>
//             </Dialog>

//             <Dialog open={addDialogBox} fullWidth maxWidth="sm">
//                 <DialogTitle>Add New User</DialogTitle>
//                 <DialogContent>
//                     {/* Wrap your fields inside a form */}
//                     <form onSubmit={onAddUserSubmit}>
//                         <div className="table-responsive">
//                             <table className="table m-0">
//                                 <tbody>
//                                     <tr>
//                                         <td>Name</td>
//                                         <td>
//                                             <input
//                                                 value={inputValue.Name}
//                                                 onChange={(e) =>
//                                                     setInputValue((prev) => ({ ...prev, Name: e.target.value }))
//                                                 }
//                                                 className="cus-inpt p-2"
//                                                 required
//                                             />
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <Td>User Type <RequiredStar /></Td>

//                                         <Td>
//                                             <select
//                                                 value={inputValue.UserId}
//                                                 onChange={e => setInputValue(prev => ({ ...prev, UserId: e.target.value }))}
//                                                 className="cus-inpt p-2"
//                                                 required
//                                                 aria-label="Select User Type"
//                                             >
//                                                 <option value="">Select User</option>
//                                                 {employeeMaster.map((UserTypeItem, index) => (
//                                                     <option key={index} value={UserTypeItem.UserId}>
//                                                         {UserTypeItem.Name}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </Td>



//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         <DialogActions className="d-flex justify-content-between flex-wrap">
//                             <Button
//                                 type="button"
//                                 variant="outlined"
//                                 onClick={() =>
//                                     setInputValue({
//                                         UserId: "",
//                                         Name: "",
//                                         UserType: "",
//                                         UserName: "",
//                                         Company_Name: "",
//                                         BranchName: "",
//                                     })
//                                 }
//                             >
//                                 Clear
//                             </Button>
//                             <span>
//                                 <Button type="button" onClick={() => {
//                                     setAddDialogBox(false);
//                                     setInputValue(initialInputValue);
//                                 }} >
//                                     Cancel
//                                 </Button>
//                                 <Button type="submit" variant="contained">
//                                     Submit
//                                 </Button>
//                             </span>
//                         </DialogActions>
//                     </form>
//                 </DialogContent>
//             </Dialog>

//             <Dialog
//                 open={isCreateDialogOpen}
//                 onClose={() => setIsCreateDialogOpen(false)}
//             >
//                 <DialogTitle id="create-dialog-title">UserType Creation</DialogTitle>
//                 <DialogContent>
//                     <div className="p-2">
//                         <label>UserType Name</label>
//                         <input
//                             type="text"
//                             onChange={(event) => setNewChipType(event.target.value)}
//                             placeholder="Ex: Admin"
//                             value={newChipType}
//                             className="cus-inpt"
//                         />
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
//                         Cancel
//                     </MuiButton>
//                     <MuiButton onClick={() => handleCreate()} color="success">
//                         CREATE
//                     </MuiButton>
//                 </DialogActions>
//             </Dialog>
//         </>
//     )
// }

// export default CostCenter;



import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from '../../Components/filterableTable2'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { Edit } from "@mui/icons-material";
import RequiredStar from "../../Components/requiredStar";
import Select from 'react-select'
import { customSelectStyles } from "../../Components/tablecolumn";
// eslint-disable-next-line no-unused-vars
import { isEqualNumber } from "../../Components/functions";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Button as MuiButton } from "@mui/material/";
// eslint-disable-next-line no-unused-vars
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
        designation: '',
        branch: '',
        department: '',
        Name: '',
        UserId: '',
        Emp_Id: ''
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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [reload, setReload] = useState(false);
    const [usertypes, setUserType] = useState([])
    const [employeeMaster, setEmployeeMaster] = useState([])
    const [employeeFullList, setEmployeeFullList] = useState([]);

    const [addDialogBox, setAddDialogBox] = useState(false);
    const [isEmployee, setIsEmployee] = useState(false);
    const [createAsUser, setCreateAsUser] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [companyData, setCompanyData] = useState([]);
    const [branch, setBranch] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `userModule/employee/designation`,
        }).then((data) => {
            if (data.success) {
                setDesignation(data.data)
            }
        }).catch(e => console.log(e));

        fetchLink({
            address: `empAttendance/department`
        }).then((data) => {
            if (data.success) {
                setDepartments(data.others.department);
            }
        }).catch(e => console.log(e));
    }, []);

    const [newChipType, setNewChipType] = useState("");
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

    useEffect(() => {
        fetchLink({
            address: `masters/user/dropDown`
        }).then((data) => {

            if (data.success) {
                setEmployeeMaster(data.data);
            }
        }).catch((e) => console.error(e));

        fetchLink({
            address: `userModule/employee`
        }).then((data) => {
            if (data.success) {
                setEmployeeFullList(data.data);
            }
        }).catch((e) => console.error(e));

    }, [reload]);


    const onAddUserSubmit = (e) => {
        e.preventDefault();
        if (loadingOn) loadingOn();

        if (isEmployee) {
            const isEditing = !!inputValue.Emp_Id;
            fetchLink({
                address: `userModule/employee`,
                method: isEditing ? 'PUT' : 'POST',
                bodyData: { 
                    data: { 
                        empname: inputValue.Name,
                        designation: inputValue.designation,
                        branch: inputValue.branch,
                        department: inputValue.department,
                        mobile: inputValue.mobile,
                        Company_id: parseData?.Company_id ? parseInt(parseData.Company_id) : 4,
                        createAsUser: createAsUser,
                        Cost_Center_Id: inputValue.Cost_Center_Id,
                        user_manage_id: inputValue.user_manage_id
                    }, 
                    ID: inputValue.Emp_Id,
                    userMGT: true 
                }
            })
            .then((data) => {
                if (data.success) {
                    toast.success('Employee created successfully');
                    setAddDialogBox(false);
                    setInputValue(initialInputValue);
                    setIsEmployee(false);
                    refresh();
                    setReload(prev => !prev);
                } else {
                    toast.error(data.message || 'Failed to create employee');
                }
            })
            .catch((e) => {
                console.error(e);
                toast.error('An error occurred while creating the employee');
            })
            .finally(() => {
                if (loadingOff) loadingOff();
            });
        } else {
            const obj = {
                Name: inputValue.Name,
                UserId: inputValue.UserId ? String(inputValue.UserId) : "0",
                Emp_Id: inputValue.Emp_Id ? String(inputValue.Emp_Id) : "0",
                Cost_Center_Id: inputValue.Cost_Center_Id
            };

            fetchLink({
                address: 'masters/users/costcenter',
                method: 'POST',
                bodyData: obj,
            })
                .then((data) => {
                    if (data.success) {
                        toast.success('Successfully mapped');
                        setAddDialogBox(false);
                        setInputValue(initialInputValue);
                        refresh();
                        setReload(prev => !prev);
                    } else {
                        toast.error(data.message || 'Failed to map');
                    }
                })
                .catch((e) => {
                    console.error(e);
                    toast.error('An error occurred during mapping');
                })
                .finally(() => {
                    if (loadingOff) loadingOff();
                });
        }
    };

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

    const baseData = others.filterText === 'ALL'
        ? [...costCenterData]
        : costCenterData.filter(fil => String(fil.Cost_Center_Name).trim().toLowerCase().includes(String(others.filterText).trim().toLowerCase()));

    const showData = baseData.sort((a, b) => (b.Cost_Center_Id || 0) - (a.Cost_Center_Id || 0));



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
                                    <span className={`cus-badge text-white ${row?.UserGet !== 'Not found' ? 'bg-success' : 'bg-danger'}`}>
                                        {row?.UserGet !== 'Not found' ? 'true' : 'false'}
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
                                                const matchedUserType = usertypes.find(u => String(u.label).trim().toLowerCase() === String(row?.UserTypeGet || '').trim().toLowerCase())?.value;
                                                
                                                setInputValue(prev => {
                                                    const updated = Object.fromEntries(
                                                        Object.entries(prev).map(([key, value]) => [key, row[key] ?? value])
                                                    );
                                                    if (matchedUserType && !row?.User_Type) {
                                                        updated.User_Type = matchedUserType;
                                                    }
                                                    return updated;
                                                });
                                                setOthers(prev => ({ ...prev, dialog: true }));
                                            }}
                                        >
                                            <Edit />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                const isEmployeeMapped = row?.Is_Converted_To_User && Number(row?.Is_Converted_To_User) > 0;
                                                let mappedEmp = null;
                                                
                                                if (isEmployeeMapped) {
                                                    mappedEmp = employeeFullList.find(e => String(e.Emp_Id) === String(row.Is_Converted_To_User));
                                                }
                                                
                                                if (mappedEmp) {
                                                    setIsEmployee(true);
                                                    setCreateAsUser(mappedEmp.User_Mgt_Id && Number(mappedEmp.User_Mgt_Id) > 0 ? true : false);
                                                    
                                                    const mappedUser = employeeMaster.find(emp => String(emp.Name).trim().toLowerCase() === String(row?.Cost_Center_Name).trim().toLowerCase());
                                                    const uId = mappedUser ? mappedUser.UserId : (row?.UserId || row?.User_Id);
                                                    
                                                    setInputValue(prev => ({
                                                        ...prev,
                                                        Name: mappedEmp.Emp_Name || '',
                                                        designation: mappedEmp.Designation || '',
                                                        branch: mappedEmp.Branch || '',
                                                        department: mappedEmp.Department || '',
                                                        mobile: mappedEmp.Mobile_No || '',
                                                        Cost_Center_Id: row?.Cost_Center_Id,
                                                        UserType: row?.User_Type,
                                                        Emp_Id: mappedEmp.Emp_Id,
                                                        user_manage_id: mappedEmp.User_Mgt_Id,
                                                        UserId: (uId && String(uId) !== "null" && String(uId) !== "0") ? String(uId) : ""
                                                    }));
                                                } else {
                                                    setIsEmployee(false);
                                                    setCreateAsUser(false);
                                                    
                                                    const mappedUser = employeeMaster.find(emp => String(emp.Name).trim().toLowerCase() === String(row?.Cost_Center_Name).trim().toLowerCase());
                                                    const uId = mappedUser ? mappedUser.UserId : (row?.UserId || row?.User_Id);
                                                    const eId = row?.Is_Converted_To_User;
                                                    
                                                    setInputValue(prev => ({
                                                        ...prev,
                                                        CO_Id: row?.CO_Id,
                                                        Name: row?.Cost_Center_Name,
                                                        UserType: row?.User_Type,
                                                        Cost_Center_Id: row?.Cost_Center_Id,
                                                        UserId: (uId && String(uId) !== "null" && String(uId) !== "0") ? String(uId) : "",
                                                        Emp_Id: (eId && String(eId) !== "null" && String(eId) !== "0") ? String(eId) : ""
                                                    }));
                                                }
                                                setAddDialogBox(true);
                                            }}
                                        >
                                            <AddBoxIcon />
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

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Button variant="contained" color="primary" onClick={() => setIsCreateDialogOpen(true)}>Create New</Button>
                                        </div>

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
                    <form onSubmit={onAddUserSubmit}>
                        <div className="table-responsive">
                            <table className="table m-0">
                                <tbody>
                                    <tr>
                                        <Td colSpan={2}>
                                            <div className="d-flex align-items-center">
                                                <input 
                                                    type="checkbox" 
                                                    id="isEmployee"
                                                    checked={isEmployee}
                                                    onChange={e => setIsEmployee(e.target.checked)}
                                                    className="form-check-input shadow-none me-2"
                                                    style={{ padding: '0.7em' }}
                                                />
                                                <label className="form-check-label pt-1" htmlFor="isEmployee">Employee</label>
                                            </div>
                                        </Td>
                                    </tr>
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
                                    {isEmployee ? (
                                        <>
                                            <tr>
                                                <td>Designation</td>
                                                <td>
                                                    <select
                                                        value={inputValue.designation}
                                                        onChange={(e) => setInputValue((prev) => ({ ...prev, designation: e.target.value }))}
                                                        className="cus-inpt p-2"
                                                        required
                                                    >
                                                        <option value="" disabled> - Select - </option>
                                                        {designation && designation.length > 0 ? (
                                                            designation.map((obj, idx) => (
                                                                <option key={idx} value={obj.id}>
                                                                    {obj.Designation}
                                                                </option>
                                                            ))
                                                        ) : null}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Branch</td>
                                                <td>
                                                    <select
                                                        value={inputValue.branch}
                                                        onChange={e => setInputValue(prev => ({ ...prev, branch: parseInt(e.target.value) }))}
                                                        className="cus-inpt p-2"
                                                        required
                                                    >
                                                        <option value="">Select Branch</option>
                                                        {branch.map((b, index) => (
                                                            <option key={index} value={b.BranchId}>
                                                                {b.BranchName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Department</td>
                                                <td>
                                                    <input
                                                        type="search"
                                                        list="departmentList"
                                                        value={inputValue.department}
                                                        onChange={(e) => setInputValue((prev) => ({ ...prev, department: e.target.value }))}
                                                        className="cus-inpt p-2"
                                                        required
                                                        placeholder="Type or Search Department Name"
                                                    />
                                                    <datalist id="departmentList">
                                                        {departments && departments.length > 0 ? (
                                                            departments.map((option, idx) => (
                                                                <option
                                                                    key={idx}
                                                                    value={option.value}
                                                                    disabled={option.disabled}
                                                                >
                                                                    {option.label}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="">No options available</option>
                                                        )}
                                                    </datalist>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Mobile</td>
                                                <td>
                                                    <input
                                                        value={inputValue.mobile}
                                                        onChange={(e) => setInputValue((prev) => ({ ...prev, mobile: e.target.value }))}
                                                        className="cus-inpt p-2"
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2}>
                                                    <div className="d-flex align-items-center">
                                                        <label className="form-check-label p-1 pe-2" htmlFor="muser">Create as a User</label>
                                                        <input
                                                            className="form-check-input shadow-none"
                                                            style={{ padding: '0.7em' }}
                                                            type="checkbox"
                                                            id="muser"
                                                            checked={createAsUser}
                                                            onChange={() => setCreateAsUser(!createAsUser)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <>
                                        <tr>
                                            <Td>User {!inputValue.Emp_Id && <RequiredStar />}</Td>

                                            <Td>
                                                <select
                                                    value={inputValue.UserId}
                                                    onChange={e => setInputValue(prev => ({ ...prev, UserId: e.target.value }))}
                                                    className="cus-inpt p-2"
                                                    required={!inputValue.Emp_Id}
                                                    aria-label="Select User Type"
                                                >
                                                    <option value="">Select User</option>
                                                    {employeeMaster.map((UserTypeItem, index) => (
                                                        <option key={index} value={String(UserTypeItem.UserId)}>
                                                            {UserTypeItem.Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Td>
                                        </tr>
                                        <tr>
                                            <Td>Employee {!inputValue.UserId && <RequiredStar />}</Td>
                                            <Td>
                                                <select
                                                    value={String(inputValue.Emp_Id)}
                                                    onChange={e => setInputValue(prev => ({ ...prev, Emp_Id: e.target.value }))}
                                                    className="cus-inpt p-2"
                                                    required={!inputValue.UserId}
                                                >
                                                    <option value="">Select Employee</option>
                                                    {employeeFullList.map((emp, index) => (
                                                        <option key={index} value={String(emp.Emp_Id)}>
                                                            {emp.Emp_Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Td>
                                        </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <DialogActions className="d-flex justify-content-between flex-wrap">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    setInputValue(initialInputValue);
                                    setIsEmployee(false);
                                    setCreateAsUser(false);
                                }}
                            >
                                Clear
                            </Button>
                            <span>
                                <Button type="button" onClick={() => {
                                    setAddDialogBox(false);
                                    setInputValue(initialInputValue);
                                    setIsEmployee(false);
                                    setCreateAsUser(false);
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