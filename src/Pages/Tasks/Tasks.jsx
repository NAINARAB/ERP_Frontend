import { useEffect, useState } from "react";
import api from "../../API";
import '../common.css'
import { FilterAlt, Add, Edit, RemoveRedEye, Delete, PersonAdd } from '@mui/icons-material';
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Menu, MenuItem } from '@mui/material';
import TaskInfo from "./TaskInfo";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from 'react-bootstrap/Dropdown';
import moment from "moment";

const localData = localStorage.getItem("user");
const parseData = JSON.parse(localData);

const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 2);

// Fromdate: firstDay.toISOString().split('T')[0],
// Todate: new Date().toISOString().split('T')[0],


const initialState = {
    Branch: parseData?.BranchId,
    Fromdate: new Date(firstDay).toISOString().split('T')[0],
    Todate: new Date().toISOString().split('T')[0],
    Task_Id: '',
    Task_Type_Id: 0,
    Project_Id: 0,
    Project_Head_Id: 0,
    Base_Group: 0,
    Status: 0
}

const initialVal = {
    Id: "",
    Task_Id: '',
    T_Sub_Task_Id: "",
    Sub_Task: "",
    S_No: "",
    Emp_Id: "",
    Task_Assign_dt: "",
    Emp_Name: "",
    Prity: 1,
    Sch_Time: "",
    Ord_By: 1,
    Timer_Based: 0,
    Invovled_Stat: "",
    Task_Name: "",
}

const formInitialValue = {
    Type_Task_Id: '',
    Task_Name: '',
    Task_Desc: '',
    Task_Stat_Id: '',
    Est_Start_Dt: new Date().toISOString().split('T')[0],
    Est_End_Dt: new Date().toISOString().split('T')[0],
    Branch_Id: parseData?.BranchId,
    Project_Id: '',
    Entry_By: parseData?.UserId
}

const Tasks = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);

    const [tasksData, setTaskData] = useState([]);
    const [filterValue, setFilterValue] = useState(initialState);
    const [formValue, setFormValue] = useState(formInitialValue)
    const [screen, setScreen] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [filterMenu, setFilterMenu] = useState(null);
    const open = Boolean(filterMenu);
    const [reload, setReload] = useState(false);
    const [assignEmp, setAssignEmp] = useState(false);
    const [clickedRow, setClickedRow] = useState(initialVal);

    const [branch, setBranch] = useState([]);
    const [users, setUsers] = useState([]);
    const [taskType, setTaskType] = useState([]);
    const [project, setProject] = useState([]);
    const [status, setStatus] = useState([]);

    const [isEdit, setIsEdit] = useState(false);



    useEffect(() => {
        fetch(`${api}taskGet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterValue)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskData(data.data);
                }
            })
    }, [filterValue, reload]);

    useEffect(() => {
        fetch(`${api}branchDropDown?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBranch(data.data);
                }
            })
        fetch(`${api}userDropDown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsers(data.data);
                }
            })
        // fetch(`${api}baseGroup`)
        //     .then(res => res.json())
        //     .then(data => {
        //         if (data.success) {
        //             setBaseGroup(data.data)
        //         }
        //     })
        fetch(`${api}/projectDropDown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProject(data.data);
                }
            })
        fetch(`${api}/taskTypeDropDown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskType(data.data)
                }
            })
        fetch(`${api}/taskStatus`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus(data.data)
                }
            })
    }, []);


    const openMenu = (event) => {
        setFilterMenu(event.currentTarget);
    };

    const closeMenu = () => {
        setFilterMenu(null);
    };


    const DispTask = ({ o }) => {
        return (
            <>
                <div 
                    className="p-3 mb-3 row rounded-4" 
                    style={
                        Number(o.Sub_Task_Id) === 0 
                        ? {background: 'linear-gradient(to right, #5ced73, #5ced73)'}
                        : {background: '#CEE6F2'}
                    }>
                    <div className="col-2 col-lg-1 col-md-1 d-flex justify-content-center align-items-center flex-column hrul">
                        {/* <Tooltip title="">
                            <IconButton
                                size="small">
                                <InfoOutlined className="h4 mb-0" />
                            </IconButton>
                        </Tooltip> */}
                        <span className="icon">{o?.Status}</span>
                    </div>
                    <div className="col-8 col-lg-10 col-md-10 d-flex flex-column align-items-start justify-content-center fw-bold hrul">
                        <p className="fa-13 mb-0 text-primary">{o?.Task_Name}</p>
                        <p className="fa-12 mb-0 w-100">
                            <span className="text-muted">
                                {new Date(o?.Est_Start_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                {" - "}
                                {new Date(o?.Est_End_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                        </p>
                    </div>
                    <div className="col-2 col-lg-1 col-md-1 d-flex flex-column justify-content-center align-items-center">
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-basic"
                                className="rounded-5 bg-transparent text-dark border-0 btn"
                            >
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <MenuItem onClick={() => { 
                                    setClickedRow({
                                        ...clickedRow, 
                                        Task_Id: o.Task_Id, 
                                        Sub_Task_Id: o.Sub_Task_Id, 
                                        Task_Name: o.Task_Name,
                                        Task_Assign_dt: o.Est_Start_Dt,
                                        // T_Sub_Task_Id: o.T_Sub_Task_Id
                                    }); 
                                    setAssignEmp(true);
                                    }}>
                                    <PersonAdd className="fa-in me-2" /> Assign Employee
                                </MenuItem>
                                <MenuItem onClick={() => { setIsEdit(true); setFormValue(o); setDialog(true); }}>
                                    <Edit className="fa-in me-2" /> Edit
                                </MenuItem>
                                <MenuItem onClick={() => { setFormValue(o); setDeleteDialog(true) }}>
                                    <Delete className="fa-in me-2" /> Delete
                                </ MenuItem>
                                {Number(o.Sub_Task_Id) === 0 && (
                                    <MenuItem onClick={() => { setFormValue(o); setScreen(!screen); }}>
                                        <RemoveRedEye className="fa-in me-2" /> Open
                                    </MenuItem>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </>
        )
    }

    const postTask = (e) => {
        e.preventDefault();
        fetch(`${api}tasks`, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formValue)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => clearValues())
    }

    const deleteTask = () => {
        fetch(`${api}tasks`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Task_Id: formValue.Task_Id })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => clearValues())
    }

    const clearValues = () => {
        setDialog(false);
        setDeleteDialog(false)
        setIsEdit(false);
        setFormValue(formInitialValue);
    }

    const closeDialog = () => {
        setAssignEmp(false);
        setClickedRow(initialVal);
    }

    const timeFormat = (timeString12Hour) => {
        const parsedTime = moment(timeString12Hour, 'h:mm A');
        const time24Hour = parsedTime.format('HH:mm');
        return time24Hour;
    }

    const assignEmployeeFun = () => {
        fetch(`${api}assignEmployee`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clickedRow)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => closeDialog())
    }

    return (
        <>
            <ToastContainer />
            {screen ? (
                <div className="card">
                    <div className="card-header bg-white d-flex align-items-center justify-content-between">
                        <span className="fa-16 fw-bold text-uppercase">Tasks</span>
                        <div className="text-end">
                            <IconButton size="small" onClick={() => setDialog(!dialog)}>
                                <Add className="text-primary" />
                            </IconButton>
                            <IconButton size="small" onClick={openMenu}>
                                <FilterAlt className="text-primary" />
                            </IconButton>
                        </div>
                    </div>
                    <div className="card-body overflow-scroll" style={{ maxHeight: "78vh", padding: '20px 30px' }}>
                        <div className="rounded-5 bg-primary p-1 text-uppercase tab-container">
                            <div className="d-flex flex-nowrap overflow-auto hidescroll">
                                {taskType?.map((o, i) => (
                                    <button
                                        key={i}
                                        className={`btn rounded-5 text-uppercase me-2 fa-16 tab-item ${Number(filterValue.Task_Type_Id) === Number(o.Task_Type_Id) ? 'btn-light' : 'text-white'}`}
                                        onClick={() => setFilterValue({ ...filterValue, Task_Type_Id: o.Task_Type_Id })}
                                    >
                                        {o.Task_Type} {Number(filterValue.Task_Type_Id) === Number(o.Task_Type_Id) && "(" + tasksData.length + ")"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <br />
                        {tasksData?.map((o, i) => <DispTask key={i} o={o} />)}
                    </div>
                </div>
            ) : (
                <TaskInfo
                    row={formValue}
                    users={users}
                    status={status}
                    setScreen={() => setScreen(!screen)}
                />
            )}


            <Menu
                anchorEl={filterMenu}
                open={open}
                onClose={closeMenu}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                PaperProps={{
                    style: {
                        // maxHeight: 100 * 4.5,
                        width: '30ch',
                    },
                }}
            >
                <div className="p-2">
                    <div className="p-2">
                        <label>Branch</label>
                        <select
                            className="cus-inpt"
                            onChange={(e) => setFilterValue({ ...filterValue, Branch: e.target.value })}
                            value={filterValue?.Branch}>
                            <option value={''}>Select</option>
                            {branch?.map((o, i) => <option key={i} value={o?.BranchId}>{o?.BranchName}</option>)}
                        </select>
                    </div>
                    <div className="p-2">
                        <label>Project</label>
                        <select
                            className="cus-inpt"
                            onChange={(e) => setFilterValue({ ...filterValue, Project_Id: e.target.value })}
                            value={filterValue?.Project_Id}>
                            <option value={''}>Select</option>
                            {project?.map((o, i) => <option key={i} value={o?.Project_Id}>{o?.Project_Name}</option>)}
                        </select>
                    </div>
                    <div className="p-2">
                        <label>Status</label>
                        <select
                            className="cus-inpt"
                            onChange={(e) => setFilterValue({ ...filterValue, Status: e.target.value })}
                            value={filterValue?.Status}>
                            <option value={''}>Select</option>
                            {status?.map((o, i) => <option key={i} value={o?.Status_Id}>{o?.Status}</option>)}
                        </select>
                    </div>
                    <div className="p-2">
                        <label>From Date</label>
                        <input
                            className="cus-inpt"
                            type="date"
                            value={filterValue?.Fromdate}
                            onChange={e => setFilterMenu({ ...filterValue, Fromdate: e.target.value })} />
                    </div>
                    <div className="p-2">
                        <label>To Date</label>
                        <input
                            className="cus-inpt"
                            type="date"
                            value={filterValue?.Todate}
                            onChange={e => setFilterMenu({ ...filterValue, Todate: e.target.value })} />
                    </div>
                </div>
            </Menu>


            <Dialog
                open={dialog} fullWidth maxWidth='lg'
                onClose={clearValues}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description">
                <DialogTitle className="bg-primary text-white mb-2">{isEdit ? 'Edit Task' : 'Create Task'}</DialogTitle>
                <form onSubmit={e => postTask(e)}>
                    <DialogContent>
                        <div className="row">
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Branch</label>
                                <select
                                    className="cus-inpt"
                                    onChange={(e) => setFormValue({ ...formValue, Branch_Id: e.target.value })}
                                    value={formValue?.Branch_Id} required>
                                    <option value={''}>Select</option>
                                    {branch?.map((o, i) => <option key={i} value={o?.BranchId}>{o?.BranchName}</option>)}
                                </select>
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Project</label>
                                <select
                                    className="cus-inpt"
                                    onChange={(e) => setFormValue({ ...formValue, Project_Id: e.target.value })}
                                    value={formValue?.Project_Id} required>
                                    <option value={''}>Select</option>
                                    {project?.map((o, i) => Number(o.Project_Id) !== 0 && <option key={i} value={o?.Project_Id}>{o?.Project_Name}</option>)}
                                </select>
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Task Type</label>
                                <select
                                    className="cus-inpt"
                                    onChange={(e) => setFormValue({ ...formValue, Type_Task_Id: e.target.value })}
                                    value={formValue?.Type_Task_Id} required>
                                    <option value={''}>Select</option>
                                    {taskType?.map((o, i) => Number(o.Task_Type_Id) !== 0 && (
                                        <option key={i} value={o?.Task_Type_Id}>{o?.Task_Type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Status</label>
                                <select
                                    className="cus-inpt"
                                    onChange={(e) => setFormValue({ ...formValue, Task_Stat_Id: e.target.value })}
                                    value={formValue?.Task_Stat_Id} required>
                                    <option value={''}>Select</option>
                                    {status?.map((o, i) => Number(o.Status_Id) !== 0 && (
                                        <option key={i} value={o?.Status_Id}>{o?.Status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Task Name</label>
                                <input
                                    className="cus-inpt"
                                    maxLength={100}
                                    value={formValue?.Task_Name} required
                                    onChange={e => setFormValue({ ...formValue, Task_Name: e.target.value })} />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Start Time</label>
                                <input
                                    className="cus-inpt"
                                    type='date'
                                    value={isEdit ? new Date(formValue?.Est_Start_Dt).toISOString().split('T')[0] : formValue?.Est_Start_Dt} required
                                    onChange={e => setFormValue({ ...formValue, Est_Start_Dt: e.target.value })}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>End Time</label>
                                <input
                                    className="cus-inpt"
                                    type="date"
                                    value={isEdit ? new Date(formValue?.Est_End_Dt).toISOString().split('T')[0] : formValue?.Est_End_Dt} required
                                    onChange={e => setFormValue({ ...formValue, Est_End_Dt: e.target.value })}
                                />
                            </div>
                            <div className="col-12 p-2">
                                <label>Task Describtion</label>
                                <textarea
                                    className="cus-inpt" rows="3"
                                    onChange={(e) => setFormValue({ ...formValue, Task_Desc: e.target.value })}
                                    value={formValue?.Task_Desc} />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ borderTop: "1px solid #f2f2f2" }}>
                        <Button variant="outlined" type='reset' onClick={clearValues}>Cancel</Button>
                        <Button variant="contained" type='submit'>{isEdit ? 'Save' : 'Create task'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={deleteDialog} fullWidth maxWidth='sm'
                onClose={clearValues}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description">
                <DialogTitle className="bg-primary text-white mb-4">Confirmation</DialogTitle>
                <DialogContent className="text-uppercase">
                    Do you want to delete the
                    <span className="text-primary mx-2">{formValue?.Task_Name && formValue?.Task_Name}</span>
                    task ?
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={clearValues}>no</Button>
                    <Button variant="contained" onClick={deleteTask} >yes</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={assignEmp} fullWidth maxWidth='lg'
                onClose={closeDialog}>
                <DialogTitle className='text-uppercase'>
                    {'Assign Employee For '}
                    <span className="text-primary text-decoration-underline">{clickedRow?.Task_Name}</span>
                    {' Task'}
                </DialogTitle>
                <DialogContent>
                    <div className="row">

                        <div className="col-md-4">
                            <label className="py-2">EMPLOYEE NAME</label>
                            <select
                                className="cus-inpt"
                                value={clickedRow?.Emp_Id && clickedRow?.Emp_Id}
                                onChange={(e) => setClickedRow({ ...clickedRow, Emp_Id: e.target.value })}>
                                <option value={0}>-- Select --</option>
                                {users.map((o, i) => Number(o.Project_Head) !== 0 && <option value={o?.Project_Head} key={i}>{o?.Project_Head_Name}</option>)}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="py-2">ASSIGN DATE</label>
                            <input
                                type="date"
                                className="cus-inpt"
                                value={clickedRow?.Task_Assign_dt && new Date(clickedRow?.Task_Assign_dt).toISOString().split('T')[0]}
                                onChange={(e) => setClickedRow({ ...clickedRow, Task_Assign_dt: e.target.value })} />
                        </div>

                        <div className="col-md-4">
                            <label className="py-2">SCHEDULE TIME</label>
                            <input
                                type="time"
                                className="cus-inpt"
                                value={clickedRow?.Sch_Time && timeFormat(clickedRow?.Sch_Time)}
                                onChange={(e) => setClickedRow({ ...clickedRow, Sch_Time: e.target.value })} />
                        </div>

                        <div className="col-md-4">
                            <label className="py-2">ORDER BY</label>
                            <input
                                type="number"
                                className="cus-inpt" placeholder='ex: 1, 2, 3...'
                                value={clickedRow?.Ord_By && clickedRow?.Ord_By}
                                onChange={(e) => setClickedRow({ ...clickedRow, Ord_By: e.target.value })} />
                        </div>

                        <div className="col-md-4">
                            <label className="py-2">PRIORITY</label>
                            <input
                                type="number"
                                className="cus-inpt"
                                value={clickedRow?.Prity && clickedRow?.Prity} placeholder='ex: 1, 2, 3...'
                                onChange={(e) => setClickedRow({ ...clickedRow, Prity: e.target.value })} />
                        </div>

                        <div className="col-md-4 py-3">
                            <label className="pt-1 border-bottom m-0 fw-bold text-muted" htmlFor="timbsd">Time Based ?</label>
                            <input
                                className="form-check-input p-2 m-2"
                                type="checkbox"
                                value={clickedRow?.Timer_Based && clickedRow?.Timer_Based === 1}
                                id="timbsd"
                                onChange={(e) => {
                                    setClickedRow({ ...clickedRow, Timer_Based: e.target.checked ? 1 : 0 })
                                }} />
                        </div>

                    </div>

                </DialogContent>
                <DialogActions>
                    <Button variant='' onClick={closeDialog}>close</Button>
                    <Button variant='contained'
                        onClick={assignEmployeeFun}>
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default Tasks;