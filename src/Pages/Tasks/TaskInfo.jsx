import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material'
import { KeyboardArrowLeft, QueryBuilder, BusinessCenter, PersonAdd, PlaylistAdd, Notes, Person, QuestionMark, RemoveRedEye } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import api from '../../API';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from 'moment';


const CardDiv = ({ label, icon, data }) => (
    <div className="col-xl-3 col-lg-4 col-md-6 px-2 py-1">
        <div className="bg-primary rounded-4 text-white p-3 fa-16">
            <div className="d-flex ">
                <span className='smallicon fa-17 bg-dark'>{icon}</span>
                <span className='ms-2 text-uppercase'>{label}</span>
            </div>
            <p className='w-100 text-end mb-0 fa-13 fw-bold'>{data}</p>
        </div>
    </div>
)



const TaskInfo = ({ row, users, setScreen, status, doRefresh }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialVal = {
        Id: "",
        Task_Id: row.Task_Id,
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
        Assigned_Emp_Id: parseData.UserId
    }
    const [subTasks, setSubTasks] = useState([]);
    const [assignedEmployee, setAssignedEmployee] = useState([]);
    const [reload, setReload] = useState(false);
    const [clickedRow, setClickedRow] = useState(initialVal);
    const [dialog, setDialog] = useState(false);
    const [subTaskForm, setSubTaskForm] = useState({
        Sub_Task_Id: '',
        Task_Id: row.Task_Id,
        Sub_Task: '',
        Sub_Task_Desc: '',
        Entry_By: parseData?.UserId,
        SStatus_Id: ''
    })
    const [subTaskDialog, setSubTaskDialog] = useState(false);
    const [subTaskEdit, setSubTaskEdit] = useState(false);
    const [assignEmpEdit, setAssignEmpEdit] = useState(false);

    useEffect(() => {
        fetch(`${api}subTask?TaskId=${row?.Task_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAssignedEmployee(data.data[1])
                    setSubTasks(data.data[2]);
                }
            }).catch(e => console.error(e))
    }, [reload])

    const closeDialog = () => {
        setDialog(false);
        setClickedRow(initialVal);
        setAssignEmpEdit(false);
    }

    const closeSubTaskDialog = () => {
        setSubTaskDialog(false);
        setSubTaskForm({
            ...subTaskForm,
            Sub_Task_Id: '',
            Sub_Task: '',
            Sub_Task_Desc: '',
            SStatus_Id: ''
        });
        setSubTaskEdit(false)
    }

    const timeFormat = (timeString12Hour) => {
        const parsedTime = moment(timeString12Hour, 'h:mm A');
        const time24Hour = parsedTime.format('HH:mm');
        return time24Hour;
    }

    const setEditFun = (ob) => {
        setClickedRow(ob);
        setDialog(true);
        setAssignEmpEdit(true)
    }

    const setEditSubTask = (o) => {
        setSubTaskForm(o);
        setSubTaskDialog(true);
        setSubTaskEdit(true)
    }

    const postSubTaskFun = () => {
        const newObj = subTaskForm;
        newObj.Entry_By = parseData?.UserId;
        fetch(`${api}subTask`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newObj)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    doRefresh();
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => closeSubTaskDialog())
    }

    const editSubTaskFun = () => {
        const newObj = subTaskForm;
        newObj.Entry_By = parseData?.UserId;
        fetch(`${api}subTask`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newObj)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    doRefresh();
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => closeSubTaskDialog())
    }

    const deleteSubTaskFun = () => {
        fetch(`${api}subTask`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Sub_Task_Id: subTaskForm.Sub_Task_Id })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    doRefresh();
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => closeSubTaskDialog())
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

    const editAssignedEmployeeFun = () => {
        fetch(`${api}assignEmployee`, {
            method: 'PUT',
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

    const deleteAssignedEmployeeFun = () => {
        fetch(`${api}assignEmployee`, {
            method: 'DELETE',
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
            <div className="card mb-2">
                <div className="card-header fw-bold bg-white d-flex align-items-center justify-content-between rounded-3">
                    <span className='text-primary'>TASK INFO</span>
                    <div className="text-end">
                        <IconButton size="small" onClick={setScreen} color='primary'>
                            <KeyboardArrowLeft />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDialog(true)} color='primary'>
                            <PersonAdd />
                        </IconButton>
                        <IconButton size="small" onClick={() => setSubTaskDialog(true)} color='primary'>
                            <PlaylistAdd />
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className="row m-0">
                <CardDiv
                    label={'PROJECT'}
                    icon={<BusinessCenter className='fa-in' />}
                    data={row?.Project_Name} />
                <CardDiv
                    label={'FROM'}
                    icon={<QueryBuilder className='fa-in' />}
                    data={new Date(row?.Est_Start_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
                <CardDiv
                    label={'TO'}
                    icon={<QueryBuilder className='fa-in' />}
                    data={new Date(row?.Est_End_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
                <CardDiv
                    label={'Main Task'}
                    data={row?.Main_Task_Name}
                    icon={<Notes className='fa-in' />} />
                <CardDiv
                    label={'project head'}
                    data={row?.Project_Head_User_Name}
                    icon={<Person className='fa-in' />} />
                <CardDiv
                    label={'status'}
                    data={row?.Status}
                    icon={<QuestionMark className='fa-in' />} />
            </div>

            <div className="row m-0 mt-1">

                {subTasks.length > 0 && (
                    <div className={assignedEmployee.length > 0 ? "col-lg-6 p-2" : 'col-12 p-2'}>

                        <div className="card">
                            <div className="card-header bg-white text-primary fw-bold text-uppercase">Sub Tasks</div>

                            <div className="card-body table-responsive">
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th className='fa-14'>SNo</th>
                                            <th className='fa-14'>Name</th>
                                            <th className='fa-14'>Describtion</th>
                                            <th className='fa-14'>Status</th>
                                            <th className='fa-14'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subTasks.map((o, i) => (
                                            <tr key={i}>
                                                <td className='fa-12'>{i + 1}</td>
                                                <td className='fa-12'>{o?.Sub_Task}</td>
                                                <td className='fa-12'>{o?.Sub_Task_Desc}</td>
                                                <td className='fa-12'>{o?.SStatus}</td>
                                                <td className='fa-12'>
                                                    <IconButton size='small' onClick={() => setEditSubTask(o)}>
                                                        <RemoveRedEye className='fa-in' />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {assignedEmployee.length > 0 && (
                    <div className={subTasks.length > 0 ? "col-lg-6 p-2" : "col-12 p-2"}>

                        <div className="card">
                            <div className="card-header bg-white text-primary fw-bold text-uppercase">Assigned Employee</div>

                            <div className="card-body table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className='fa-13'>SNo</th>
                                            <th className='fa-13'>EmpName</th>
                                            <th className='fa-13'>Task/SubTask</th>
                                            <th className='fa-13'>Date</th>
                                            <th className='fa-13'>Time</th>
                                            <th className='fa-13'>Priority</th>
                                            <th className='fa-13'>Order</th>
                                            <th className='fa-13'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedEmployee.map((o, i) => (
                                            <tr key={i}>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>{i + 1}</td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>{o.Emp_Name}</td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>{o.Sub_Task}</td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>
                                                    {new Date(o.Task_Assign_dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>{o.Sch_Time}</td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>{o.Prity}</td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>{o.Ord_By}</td>
                                                <td className={Number(o.Invovled_Stat) === 1 ? 'fa-12' : 'fa-12 bg-light text-danger'}>
                                                    <IconButton size='small' onClick={() => setEditFun(o)}>
                                                        <RemoveRedEye className='fa-in' />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <Dialog
                open={dialog} fullWidth maxWidth='lg'
                onClose={closeDialog}>
                <DialogTitle className='text-uppercase'>{assignEmpEdit ? 'UPDATE Assigned Employee' : 'Assign Employee'}</DialogTitle>
                <DialogContent>
                    <div className="row">

                        <div className="col-md-4">
                            <label className="py-2">SUB TASK</label>
                            <select
                                className="cus-inpt"
                                value={clickedRow?.T_Sub_Task_Id && clickedRow?.T_Sub_Task_Id}
                                onChange={(e) => setClickedRow({ ...clickedRow, T_Sub_Task_Id: e.target.value })}>
                                <option value={0}>-- Select --</option>
                                {subTasks.map((o, i) => <option value={o?.Sub_Task_Id} key={i}>{o?.Sub_Task}</option>)}
                            </select>
                        </div>

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
                    {assignEmpEdit && (
                        <Button
                            variant='outlined'
                            color='error'
                            onClick={deleteAssignedEmployeeFun}>
                            Remove
                        </Button>
                    )}
                    <Button variant='contained'
                        onClick={assignEmpEdit
                            ? () => { editAssignedEmployeeFun() }
                            : () => { assignEmployeeFun() }}>
                        {assignEmpEdit ? 'Update' : 'Assign'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={subTaskDialog} fullWidth maxWidth='lg'
                onClose={closeSubTaskDialog}>
                <DialogTitle className='bg-primary text-white mb-2 text-uppercase'>{subTaskEdit ? 'Update SubTask' : 'Create SubTask'}</DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-2">
                            <label>SubTask Name</label>
                            <input
                                className='cus-inpt'
                                value={subTaskForm?.Sub_Task}
                                onChange={(e) => setSubTaskForm({ ...subTaskForm, Sub_Task: e.target.value })} />
                        </div>
                        <div className="col-lg-4 col-md-6 mb-2">
                            <label>Status</label>
                            <select
                                className="cus-inpt"
                                onChange={(e) => setSubTaskForm({ ...subTaskForm, SStatus_Id: e.target.value })}
                                value={subTaskForm?.SStatus_Id}
                            >
                                <option value={''}>Select</option>
                                {status?.map((o, i) => Number(o.Status_Id) !== 0 && (
                                    <option key={i} value={o?.Status_Id}>{o?.Status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <label>Describtion</label>
                    <textarea
                        className='cus-inpt'
                        value={subTaskForm?.Sub_Task_Desc}
                        rows={4}
                        onChange={(e) => setSubTaskForm({ ...subTaskForm, Sub_Task_Desc: e.target.value })} />

                </DialogContent>
                <hr className='m-0' />
                <DialogActions>
                    <Button onClick={closeSubTaskDialog}>cancel</Button>
                    {subTaskEdit && <Button onClick={deleteSubTaskFun}>Delete</Button>}
                    <Button
                        onClick={
                            !subTaskEdit
                                ? () => { postSubTaskFun() }
                                : () => { editSubTaskFun() }}
                        variant='contained'>
                        {!subTaskEdit ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TaskInfo;