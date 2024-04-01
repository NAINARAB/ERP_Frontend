import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, IconButton } from '@mui/material';
import { KeyboardArrowLeft, CalendarMonth, QueryBuilder, Edit } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../../API";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";

// import CalenderComp from "./calender";


const TaskActivity = () => {
    const location = useLocation();
    const rights = location.state?.rights;
    const taskInfo = location.state?.taskDetails;
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const nav = useNavigate()

    const assignEmpInitialValue = {
        AN_No: '',
        Project_Id: taskInfo?.Project_Id,
        Sch_Id: taskInfo?.Sch_Id,
        Task_Levl_Id: taskInfo?.Task_Levl_Id,
        Task_Id: taskInfo?.Task_Id,
        Assigned_Emp_Id: parseData?.UserId,
        Emp_Id: '',
        Task_Assign_dt: new Date().toISOString().split('T')[0],
        Sch_Period: taskInfo?.Task_Sch_Duaration,
        Sch_Time: taskInfo?.Task_Start_Time,
        EN_Time: taskInfo?.Task_End_Time,
        Est_Start_Dt: new Date(taskInfo?.Task_Est_Start_Date).toISOString().split('T')[0],
        Est_End_Dt: new Date(taskInfo?.Task_Est_End_Date).toISOString().split('T')[0],
        Ord_By: 1,
        Timer_Based: true,
        Invovled_Stat: true,
        EmpGet: '- Select Employee -'
    }

    const [dialog, setDialog] = useState({
        assignEmp: false,
    });
    const [isEdit, setIsEdit] = useState(false);
    const [userDropDown, setUsersDropdown] = useState([])
    const [assignEmpInpt, setAssignEmpInpt] = useState(assignEmpInitialValue);
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [reload, setReload] = useState(false);
    const [workDetails, setWorkDetails] = useState([])

    useEffect(() => {
        fetch(`${api}userName?AllUser=${true}&BranchId=${parseData?.BranchId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsersDropdown(data.data)
                }
            }).catch(e => console.error(e))
        fetch(`${api}task/workedDetails?Task_Levl_Id=${taskInfo?.Task_Levl_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setWorkDetails(data.data)
                }
            }).catch(e => console.log(e))
    }, [])

    useEffect(() => {
        fetch(`${api}task/assignEmployee?Task_Levl_Id=${taskInfo?.Task_Levl_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAssignedEmployees(data.data)
                }
            }).catch(e => console.error(e))
    }, [reload])

    useEffect(() => {
        const [startHours, startMinutes] = assignEmpInpt?.Sch_Time.split(':').map(Number);
        const [durationHours, durationMinutes] = assignEmpInpt?.Sch_Period.split(':').map(Number);

        const endMinutes = (startMinutes + durationMinutes) % 60;
        const endHours = (startHours + durationHours + Math.floor((startMinutes + durationMinutes) / 60)) % 24;

        setAssignEmpInpt({ ...assignEmpInpt, EN_Time: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}` })
    }, [assignEmpInpt?.Sch_Time, assignEmpInpt?.Sch_Period])


    const switchEmpAssign = (val) => {
        if (val) {
            setAssignEmpInpt(val)
            setIsEdit(true)
        } else {
            setAssignEmpInpt(assignEmpInitialValue)
            setIsEdit(false)
        }
        setDialog({ ...dialog, assignEmp: !dialog.assignEmp })
    }

    const postAndPutAssignEmpFun = () => {
        if (assignEmpInpt?.Emp_Id) {
            fetch(`${api}task/assignEmployee`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignEmpInpt)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        toast.success(data.message);
                        switchEmpAssign();
                        setReload(!reload)
                    } else {
                        toast.error(data.message)
                    }
                })
                .catch(e => console.error(e))
        } else {
            toast.warn('Select Employee')
        }
    }

    const formatTime24 = (time24) => {
        const [hours, minutes] = time24.split(':').map(Number);

        let hours12 = hours % 12;
        hours12 = hours12 || 12;
        const period = hours < 12 ? 'AM' : 'PM';
        const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const time12 = `${formattedHours}:${formattedMinutes} ${period}`;

        return time12;
    }

    const statusColor = (id) => {
        const numId = Number(id);
        const color = ['bg-dark', 'bg-info', 'bg-warning', 'bg-success', 'bg-danger'];
        return color[numId]
    }

    return Number(rights?.read) === 1 && (
        <>
            <ToastContainer />
            <div className="cus-card p-2">
                <h5 className="mb-0 d-flex px-3 py-2 align-items-center">
                    <span className="flex-grow-1 fa-16">
                        Task: {taskInfo?.TaskNameGet}
                    </span>
                    <span className=" d-flex ">

                        <span className="fa-12">
                            {taskInfo?.TaskTypeGet}
                            <br />
                            <span className="fa-12">(
                                {new Date(taskInfo?.Task_Est_Start_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                {' - '}
                                {new Date(taskInfo?.Task_Est_End_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                )
                            </span>
                        </span>

                    </span>
                </h5>
            </div>

            <div className="cus-card py-2 ps-3">
                <h5 className="d-flex align-items-center m-0">
                    <span className="fa-17 flex-grow-1">Involved Employees</span>
                    <span className="d-flex pe-2">
                        <button
                            className="btn btn-primary rounded-5 px-3 fa-13 shadow d-flex align-items-center me-2"
                            onClick={() => switchEmpAssign()}>
                            Assign Employee
                        </button>
                        <button
                            className="btn btn-secondary rounded-5 px-3 fa-13 shadow d-flex align-items-center"
                            onClick={() => nav('/tasks/activeproject/projectschedule', { state: location.state?.retObj })}>
                            <KeyboardArrowLeft className="fa-in me-2" /> Back
                        </button>
                    </span>
                </h5>

                {assignedEmployees.length ? (
                    <div className="table-responsive mt-3">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="fa-14 text-center">Employee</th>
                                    <th className="fa-14 text-center">Assigned By</th>
                                    <th className="fa-14 text-center">Start-End Date</th>
                                    <th className="fa-14 text-center">Start-End Time</th>
                                    <th className="fa-14 text-center">Total Hours</th>
                                    <th className="fa-14 text-center">Timer Based</th>
                                    <th className="fa-14 text-center">Involved Status</th>
                                    <th className="fa-14 text-center">Order By</th>
                                    <th className="fa-14 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedEmployees.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-13 text-center">{o?.EmployeeName}</td>
                                        <td className="fa-13 text-center">{o?.AssignedUser}</td>
                                        <td className="fa-14 text-center">
                                            <span className="badge rounded-4 px-3 bg-light text-primary">
                                                <CalendarMonth className="fa-18 me-2" />
                                                {new Date(o?.Est_Start_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                {' - '}
                                                {new Date(o?.Est_End_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="fa-14 text-center">
                                            <span className="badge rounded-4 px-3 bg-light text-primary">
                                                <QueryBuilder className="fa-18 me-2" />
                                                {o?.Sch_Time}
                                                {' - '}
                                                {o?.EN_Time}
                                            </span>
                                        </td>
                                        <td className="fa-13 text-center">{o?.Sch_Period}</td>
                                        <td className="fa-14">
                                            <span className={`badge rounded-4 px-3 fw-bold text-white ${Number(o?.Timer_Based) ? 'bg-success' : 'bg-warning'}`}>
                                                {Number(o?.Timer_Based) ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td className="fa-14 text-center">
                                            <span className={`badge rounded-4 px-3 fw-bold text-white ${Number(o?.Invovled_Stat) ? 'bg-success' : 'bg-danger'}`}>
                                                {Number(o?.Invovled_Stat) ? "IN" : "OUT"}
                                            </span>
                                        </td>
                                        <td className="fa-13 text-center">{o?.Ord_By}</td>
                                        <td className="fa-13 text-center">
                                            <IconButton size="small" onClick={() => {
                                                switchEmpAssign({ ...o, EmpGet: o?.EmployeeName })
                                            }}>
                                                <Edit className="fa-18" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h6 className="mt-3">No Data</h6>
                )}



            </div>

            <div className="cus-card py-2 ps-3">
                <h5 className="m-0 mt-2 fa-17">Task Activity</h5>

                {workDetails.length > 0 ? (
                    <div className="table-responsive mt-3">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="fa-14 text-center">Sno</th>
                                    <th className="fa-14 text-center">Employee</th>
                                    <th className="fa-14 text-center">Date</th>
                                    <th className="fa-14 text-center">Time</th>
                                    <th className="fa-14 text-center">Duration (Mins)</th>
                                    <th className="fa-14 text-center">Status</th>
                                    <th className="fa-14">Work Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workDetails.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-13 text-center">{i+1}</td>
                                        <td className="fa-13 text-center">{o?.EmployeeName}</td>
                                        <td className="fa-13 text-center">
                                            {new Date(o?.Work_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="fa-14 text-center">
                                            <span className="badge rounded-4 px-3 bg-light text-primary">
                                                <QueryBuilder className="fa-18 me-2" />
                                                {formatTime24(o?.Start_Time)}
                                                {' - '}
                                                {formatTime24(o?.End_Time)}
                                            </span>
                                        </td>
                                        <td className="fa-13 text-center">{o?.Tot_Minutes}</td>
                                        <td className="fa-13 text-center">
                                            <span className={`badge rounded-4 px-3 fw-bold text-white ${statusColor(o?.Work_Status)}`}>
                                                {o?.WorkStatus}
                                            </span>
                                        </td>
                                        <td className="fa-13">{o?.Work_Done}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h6 className="mt-3">No Data</h6>
                )}
            </div>


            <Dialog
                open={dialog?.assignEmp}
                onClose={() => switchEmpAssign()}>
                <DialogTitle>{isEdit ? 'Modify Assigned Task' : 'Assign Task'}</DialogTitle>
                <DialogContent className="table-responsive">
                    <table className="table">
                        <tbody>

                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Employee</td>
                                <td className="border-bottom-0 fa-15">
                                    <Select
                                        value={{ value: assignEmpInpt?.Emp_Id, label: assignEmpInpt?.EmpGet }}
                                        onChange={(e) => setAssignEmpInpt({ ...assignEmpInpt, Emp_Id: e.value, EmpGet: e.label })}
                                        options={[
                                            { value: '', label: '- Select Employee -' },
                                            ...userDropDown.map(obj => ({ value: obj.UserId, label: obj.Name }))
                                        ]}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder={"Select User"} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Time</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='time'
                                        className="cus-inpt"
                                        value={assignEmpInpt?.Sch_Time}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Sch_Time: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Duration </td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='time'
                                        className="cus-inpt"
                                        value={assignEmpInpt?.Sch_Period}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Sch_Period: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Date </td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={new Date(assignEmpInpt?.Est_Start_Dt).toISOString().split('T')[0]}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_Start_Dt: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>End Date </td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={new Date(assignEmpInpt?.Est_End_Dt).toISOString().split('T')[0]}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_End_Dt: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Order BY </td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='number'
                                        className="cus-inpt"
                                        value={assignEmpInpt?.Ord_By}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Ord_By: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>
                                    {isEdit && (
                                        <div>
                                            <input
                                                className="form-check-input shadow-none"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                id="involve"
                                                checked={Boolean(Number(assignEmpInpt?.Invovled_Stat))}
                                                onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Invovled_Stat: e.target.checked })} />
                                            <label className="form-check-label p-1 ps-2" htmlFor="involve">is Involved?</label>
                                        </div>
                                    )}
                                </td>
                                <td className="border-bottom-0 fa-15 text-end">
                                    <div>
                                        <input
                                            className="form-check-input shadow-none"
                                            style={{ padding: '0.7em' }}
                                            type="checkbox"
                                            id="timerbased"
                                            checked={Boolean(Number(assignEmpInpt?.Timer_Based))}
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Timer_Based: e.target.checked })} />
                                        <label className="form-check-label p-1 ps-2" htmlFor="timerbased">Timer Based Task?</label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => switchEmpAssign()}>close</Button>
                    <Button onClick={postAndPutAssignEmpFun} >submit</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TaskActivity;