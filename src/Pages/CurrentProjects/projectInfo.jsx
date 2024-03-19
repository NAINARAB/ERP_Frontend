import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, MenuItem, Autocomplete, TextField, Checkbox } from '@mui/material';
import { Add, Delete, Edit, KeyboardArrowLeft, Launch } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../../API";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Dropdown from 'react-bootstrap/Dropdown';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


const ProjectDetails = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const location = useLocation();
    const projectData = location.state?.project;
    const rights = location.state?.rights;  
    const nav = useNavigate()

    const scheduleInitialValue = {
        Sch_Id: '',
        Sch_Date: new Date().toISOString().split('T')[0],
        Project_Id: projectData?.Project_Id,
        Sch_By: parseData.UserId,
        Sch_Type_Id: 1,
        Sch_Est_Start_Date: new Date().toISOString().split('T')[0],
        Sch_Est_End_Date: '',
        Sch_Status: 1,
        Entry_By: parseData.UserId,
        Entry_Date: new Date()
    }

    const scheduleTaskInitalValue = {
        Sch_Project_Id: projectData?.Project_Id,
        Sch_Id: '',
        Task_Levl_Id: '',
        Task_Id: '',
        Type_Task_Id: 1,
        Task_Sch_Duaration: '01:00',
        Task_Start_Time: '10:00',
        Task_End_Time: '',
        Task_Est_Start_Date: new Date().toISOString().split('T')[0],
        Task_Est_End_Date: new Date().toISOString().split('T')[0],
        Task_Sch_Status: 1,
        Levl_Id: '',
        Task_Depend_Level_Id: '',
        TasksGet: '- Select Task -'
    }

    const [userDropdown, setUsersDropdown] = useState([]);
    const [scheduleType, setScheleType] = useState([]);
    const [workStatus, setWorkStatus] = useState([]);
    const [projectSchedule, setProjectSchedule] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [taskType, setTaskType] = useState([]);

    const [dependancyTasks, setDependencyTasks] = useState([]);
    const [selectedDependencyTasks, setSelectedDependencyTasks] = useState([])

    const [scheduleInput, setScheduleInput] = useState(scheduleInitialValue);
    const [taskScheduleInput, setTaskScheduleInput] = useState(scheduleTaskInitalValue);

    const [isEdit, setIsEdit] = useState(false);
    const [reload, setReload] = useState(false);

    const [dialog, setDialog] = useState({
        scheduleCreate: false,
        scheduleDelete: false,
        taskSchedule: false,
        taskDelete: false
    })

    useEffect(() => {
        fetch(`${api}project/schedule?Project_Id=${projectData?.Project_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProjectSchedule(data.data)
                }
            }).catch(e => console.error(e))
    }, [reload])

    useEffect(() => {

        fetch(`${api}userName?AllUser=${true}&BranchId=${parseData?.BranchId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsersDropdown(data.data)
                }
            }).catch(e => console.error(e))

        fetch(`${api}project/schedule/scheduleType`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setScheleType(data.data)
                }
            }).catch(e => console.error(e))

        fetch(`${api}workstatus`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    data.data.sort((a, b) => a.Status_Id - b.Status_Id)
                    setWorkStatus(data.data)
                }
            }).catch(e => console.error(e))

        fetch(`${api}tasksDropdown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTasks(data.data)
                }
            }).catch(e => console.error(e))

        fetch(`${api}taskTypeGet`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskType(data.data)
                }
            }).catch(e => console.error(e))

    }, [])

    useEffect(() => {
        const getScheduleDates = scheduleType.find(obj => Number(obj?.Sch_Type_Id) === Number(scheduleInput?.Sch_Type_Id));
        const findEndDate = new Date();
        const getDay = findEndDate.getDate();
        findEndDate.setDate(getDay + Number(getScheduleDates?.Sch_Days) || 0);
        const changeFormat = findEndDate.toISOString().split('T')[0]
        setScheduleInput({ ...scheduleInput, Sch_Est_End_Date: changeFormat })
    }, [scheduleInput?.Sch_Est_Start_Date, scheduleInput?.Sch_Type_Id, scheduleType])

    useEffect(() => {
        const [startHours, startMinutes] = taskScheduleInput?.Task_Start_Time.split(':').map(Number);
        const [durationHours, durationMinutes] = taskScheduleInput?.Task_Sch_Duaration.split(':').map(Number);

        const endMinutes = (startMinutes + durationMinutes) % 60;
        const endHours = (startHours + durationHours + Math.floor((startMinutes + durationMinutes) / 60)) % 24;

        setTaskScheduleInput({ ...taskScheduleInput, Task_End_Time: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}` })
    }, [taskScheduleInput?.Task_Start_Time, taskScheduleInput?.Task_Sch_Duaration, taskScheduleInput?.Task_Id])

    useEffect(() => {
        if (selectedDependencyTasks.length > 0) {
            const numStr = selectedDependencyTasks.map(obj => obj?.Task_Levl_Id).join(',');
            setTaskScheduleInput({ ...taskScheduleInput, Task_Depend_Level_Id: numStr });
        } else {
            setTaskScheduleInput({ ...taskScheduleInput, Task_Depend_Level_Id: '' });
        }
    }, [selectedDependencyTasks]);

    useEffect(() => {
        if (!projectData || !rights) {
            nav('/tasks/activeproject')
        }
    }, [projectData, rights])


    const scheduleDialogSwitch = (val) => {
        if (val) {
            setScheduleInput(val);
            setIsEdit(true)
        }

        if (!val && dialog.scheduleCreate === true) {
            setScheduleInput(scheduleInitialValue)
            setIsEdit(false)
        }

        setDialog({ ...dialog, scheduleCreate: !dialog.scheduleCreate });
    }

    const taskDialogSwitch = (bool, val) => {
        if (val && !bool) {
            setTaskScheduleInput(val);
            setIsEdit(true)
        }

        if (!val && dialog.taskSchedule === true && bool === true) {
            setTaskScheduleInput(scheduleTaskInitalValue);
            setIsEdit(false)
        }

        setDialog({ ...dialog, taskSchedule: !dialog.taskSchedule });
    }

    const switchScheduleDeleteDialog = (val) => {
        if (val) {
            setScheduleInput(val)
        } else {
            setScheduleInput(scheduleInitialValue)
        }

        setDialog({ ...dialog, scheduleDelete: !dialog.scheduleDelete });
    }

    const switchTaskDeleteDialog = (val) => {
        if (val) {
            setTaskScheduleInput(val)
        } else {
            setTaskScheduleInput(scheduleTaskInitalValue)
        }

        setDialog({ ...dialog, taskDelete: !dialog.taskDelete });
    }

    const postAndPutScheduleFun = () => {
        fetch(`${api}project/schedule`, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(scheduleInput)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error)
            .finally(() => scheduleDialogSwitch())
    }

    const deleteScheduleFun = () => {
        fetch(`${api}project/schedule`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(scheduleInput)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error)
            .finally(() => switchScheduleDeleteDialog())
    }

    const postAndPutTaskFun = () => {
        if (taskScheduleInput.Task_Id) {
            if (taskScheduleInput.Task_Est_Start_Date <= taskScheduleInput.Task_Est_Start_Date) {
                if (Number(taskScheduleInput?.Levl_Id) !== 1 && taskScheduleInput.Task_Depend_Level_Id === '') {
                    return toast.warn('Select Dependency Tasks')
                }
                fetch(`${api}project/schedule/scheduleTask`, {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(taskScheduleInput)
                }).then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            toast.success(data.message);
                            taskDialogSwitch(true);
                            setReload(!reload)
                        } else {
                            toast.error(data.message)
                        }
                    }).catch(e => console.error(e))
            } else {
                toast.warn('Select Valid Date')
            }
        } else {
            toast.warn('Select Task')
        }
    }

    const deleteTaskFun = () => {
        fetch(`${api}project/schedule/scheduleTask`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskScheduleInput)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
            .finally(() => switchTaskDeleteDialog())
    }

    const ScheduleComp = ({ obj, SNo }) => {
        const myDivRef = useRef(null);
        const [height, setHeight] = useState(0)

        useEffect(() => {
            if (myDivRef.current) {
                setHeight(myDivRef.current.offsetHeight);
            }
        }, []);

        const findNum = (arr, num) => {
            const index = arr.findIndex((o) => Number(o.Task_Levl_Id) === Number(num));
            return index >= 0 ? (index + 1) + '. ' : '';
        }


        return (
            <>

                <div className="cus-card p-2">
                    <h5 className="mb-0 d-flex px-3 py-2 align-items-center">
                        <span className="flex-grow-1">
                            Schedule: {SNo + ' '}
                            <br />
                            <span className="fa-12">
                                By: {obj?.SchByGet}
                            </span>
                        </span>
                        <span className=" d-flex fa-14">
                            <span>
                                {obj?.SchTypGet + ' (' + obj?.SchDays + ') '}
                                <br />
                                <span className="fa-12">(
                                    {new Date(obj?.Sch_Est_Start_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    {' - '}
                                    {new Date(obj?.Sch_Est_End_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    )
                                </span>
                            </span>
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="success"
                                    id="actions"
                                    className="rounded-5 bg-transparent text-dark border-0 btn"
                                >
                                </Dropdown.Toggle>
                                <Dropdown.Menu>

                                    {Number(rights?.edit) === 1 && (
                                        <MenuItem onClick={() => {
                                            scheduleDialogSwitch({
                                                Sch_Id: obj?.Sch_Id,
                                                Sch_Date: new Date(obj?.Sch_Date).toISOString().split('T')[0],
                                                Project_Id: projectData?.Project_Id,
                                                Sch_By: obj?.Sch_By,
                                                Sch_Type_Id: obj?.Sch_Type_Id,
                                                Sch_Est_Start_Date: new Date(obj?.Sch_Est_Start_Date).toISOString().split('T')[0],
                                                Sch_Est_End_Date: new Date(obj?.Sch_Est_End_Date).toISOString().split('T')[0],
                                                Sch_Status: obj?.Sch_Status,
                                                Entry_By: obj?.Entry_By,
                                                Entry_Date: new Date(obj?.Entry_Date).toISOString().split('T')[0],
                                            });
                                        }}>
                                            <Edit className="fa-in me-2 text-primary" />
                                            Edit
                                        </MenuItem>
                                    )}

                                    {Number(rights?.delete) === 1 && (
                                        <MenuItem onClick={() => switchScheduleDeleteDialog({ ...taskScheduleInput, Sch_Id: obj?.Sch_Id })}>
                                            <Delete className="fa-in me-2 text-danger " />
                                            Delete
                                        </MenuItem>
                                    )}

                                </Dropdown.Menu>
                            </Dropdown>
                        </span>
                    </h5>

                    <hr className="mt-0" />

                    <div className="overflow-x-auto text-nowrap">
                        <div className="d-flex">

                            {/* LevelOneTasks */}
                            <div className="res-width px-3 py-2">
                                <div className="rounded-4 p-3" style={{ backgroundColor: '#E7C8DD' }} ref={myDivRef}>

                                    <div className="d-flex align-items-center">
                                        <span className="flex-grow-1 ps-2 fw-bold">Level 1</span>
                                        {Number(rights?.add) === 1 && (
                                            <button
                                                className="btn btn-primary rounded-5 px-3 fa-13 shadow d-flex align-items-center"
                                                onClick={() => {
                                                    taskDialogSwitch(false);
                                                    setTaskScheduleInput({ ...taskScheduleInput, Sch_Id: obj?.Sch_Id, Levl_Id: 1 });
                                                    setDependencyTasks([])
                                                }}>
                                                Assign Task
                                            </button>
                                        )}
                                    </div>

                                    {obj?.LevelOneTasks.length > 0 ? (
                                        obj?.LevelOneTasks?.map((o, i) => (
                                            <div key={i} className="rounded-4 bg-light p-2 px-3 d-flex align-items-center mt-2">
                                                <span className="flex-grow-1 fw-bold">{(i + 1) + '. '}{o?.TaskNameGet}</span>
                                                <span className="fa-14 d-flex align-items-center">
                                                    {new Date(o?.Task_Est_Start_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    <span>
                                                        <Dropdown>
                                                            <Dropdown.Toggle
                                                                variant="success"
                                                                id="actions"
                                                                className="rounded-5 bg-transparent text-dark border-0 btn"
                                                            >
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                {Number(rights?.edit) === 1 && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            taskDialogSwitch(false, {
                                                                                Sch_Project_Id: projectData?.Project_Id,
                                                                                Sch_Id: obj?.Sch_Id,
                                                                                Task_Levl_Id: o?.Task_Levl_Id,
                                                                                Task_Id: o?.Task_Id,
                                                                                Type_Task_Id: o?.Type_Task_Id,
                                                                                Task_Sch_Duaration: o?.Task_Sch_Duaration,
                                                                                Task_Start_Time: o?.Task_Start_Time,
                                                                                Task_End_Time: o?.Task_End_Time,
                                                                                Task_Est_Start_Date: new Date(o?.Task_Est_Start_Date).toISOString().split('T')[0],
                                                                                Task_Est_End_Date: new Date(o?.Task_Est_End_Date).toISOString().split('T')[0],
                                                                                Task_Sch_Status: o?.Task_Sch_Status,
                                                                                Levl_Id: 1,
                                                                                Task_Depend_Level_Id: '',
                                                                                TasksGet: o?.TaskNameGet,
                                                                            })
                                                                        }}>
                                                                        <Edit className="fa-in me-2 text-primary" />
                                                                        Edit
                                                                    </MenuItem>
                                                                )}
                                                                {Number(rights?.delete) === 1 && (<MenuItem onClick={() => {
                                                                    switchTaskDeleteDialog({ ...taskScheduleInput, Task_Levl_Id: o?.Task_Levl_Id })
                                                                }}>
                                                                    <Delete className="fa-in me-2 text-danger " />
                                                                    Delete
                                                                </MenuItem>)}
                                                                <MenuItem onClick={
                                                                    () => nav('/tasks/activeproject/projectschedule/taskActivity',
                                                                        {
                                                                            state: {
                                                                                taskDetails: {
                                                                                    ...o,
                                                                                    Project_Id: projectData?.Project_Id,
                                                                                    Sch_Id: obj?.Sch_Id,
                                                                                },
                                                                                rights: location.state?.rights,
                                                                                retObj: location.state
                                                                            }
                                                                        }
                                                                    )
                                                                }>
                                                                    <Launch className="fa-in me-2 text-primary " />
                                                                    Open Task
                                                                </MenuItem>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </span>
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <h5 className="px-2 mb-0">No Tasks!</h5>
                                    )}

                                </div>
                            </div>


                            {/* LevelTwoTasks */}
                            <div className="res-width px-3 py-2">
                                <div className="rounded-4 p-3" style={{ backgroundColor: '#E2E4F6', minHeight: height, overflow: 'auto' }}>
                                    <div className="d-flex align-items-center">
                                        <span className="flex-grow-1 ps-2 fw-bold ">Level 2</span>
                                        {Number(rights?.add) === 1 && (
                                            <button
                                                className="btn btn-primary rounded-5 px-3 fa-13 shadow d-flex align-items-center"
                                                disabled={obj?.LevelOneTasks.length === 0}
                                                onClick={() => {
                                                    taskDialogSwitch(false);
                                                    setTaskScheduleInput({ ...taskScheduleInput, Sch_Id: obj?.Sch_Id, Levl_Id: 2 });
                                                    setDependencyTasks(obj?.LevelOneTasks)
                                                }}>
                                                Assign Task
                                            </button>
                                        )}
                                    </div>

                                    {obj?.LevelTwoTasks.length > 0 ? (
                                        obj?.LevelTwoTasks?.map((o, i) => (
                                            <div className="rounded-4 bg-light py-2 px-3 mt-2" key={i}>
                                                <span className="float-right fw-bold">{(i + 1) + '. '}{o?.TaskNameGet}</span>
                                                <span className="float-end fa-14">
                                                    {new Date(o?.Task_Est_Start_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                                <hr className="mt-0 mb-2" />
                                                {o?.DependancyTasks?.length > 0 && <p className="mb-1 text-primary">Dependency Tasks ({o?.DependancyTasks?.length})</p>}

                                                <div className="d-flex overflow-auto">
                                                    {o?.DependancyTasks?.map((depobj, depindex) => (
                                                        <span key={depindex} className="rounded-4 mt-2 me-2 px-3 py-1 fa-13 fw-bold" style={{ backgroundColor: '#E7C8DD' }}>
                                                            {findNum(obj?.LevelOneTasks, depobj.Task_Depend_Level_Id)}
                                                            {depobj?.TaskNameGet}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <h5 className="px-2 mb-0">No Tasks!</h5>
                                    )}

                                </div>
                            </div>


                            {/* LevelThreeTasks */}
                            <div className="res-width px-3 py-2">
                                <div className="rounded-4 p-3" style={{ backgroundColor: '#B4D2E7', minHeight: height, overflow: 'auto' }}>
                                    <div className="d-flex align-items-center">
                                        <span className="flex-grow-1 ps-2 fw-bold ">Level 3</span>
                                        {Number(rights?.add) === 1 && (
                                            <button
                                                className="btn btn-primary rounded-5 px-3 fa-13 shadow d-flex align-items-center"
                                                disabled={obj?.LevelTwoTasks.length === 0}
                                                onClick={() => {
                                                    taskDialogSwitch(false);
                                                    setTaskScheduleInput({ ...taskScheduleInput, Sch_Id: obj?.Sch_Id, Levl_Id: 3 });
                                                    setDependencyTasks(obj?.LevelTwoTasks)
                                                }}>
                                                Assign Task
                                            </button>
                                        )}
                                    </div>

                                    {obj?.LevelThreeTasks.length > 0 ? (
                                        obj?.LevelThreeTasks?.map((o, i) => (

                                            <div className="rounded-4 bg-light py-2 px-3 mt-2" key={i}>
                                                <span className="float-right fw-bold">{(i + 1) + '. '}{o?.TaskNameGet}</span>
                                                <span className="float-end fa-14">
                                                    {new Date(o?.Task_Est_Start_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                                <hr className="mt-0 mb-2" />
                                                {o?.DependancyTasks?.length > 0 && <p className="mb-1 text-primary">Dependency Tasks ({o?.DependancyTasks?.length})</p>}

                                                <div className="d-flex overflow-auto">
                                                    {o?.DependancyTasks?.map((depobj, depindex) => (
                                                        <span key={depindex} className="rounded-4 mt-2 me-2 px-3 py-1 fa-13 fw-bold" style={{ backgroundColor: '#E2E4F6' }}>
                                                            {findNum(obj?.LevelTwoTasks, depobj.Task_Depend_Level_Id)}
                                                            {depobj?.TaskNameGet}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <h5 className="px-2 mb-0">No Tasks!</h5>
                                    )}

                                </div>
                            </div>


                        </div>
                    </div>
                </div>

            </>
        )
    }

    return Number(rights?.read) === 1 && (
        <>
            <ToastContainer />
            <div className="cus-card p-3 d-flex align-items-center ">
                <h5 className=" flex-grow-1 mb-0 text-muted fa-16 ps-2">Create New Schedule</h5>
                {Number(rights?.add) === 1 && (
                    <button className="btn btn-primary rounded-5 px-3 fa-13 shadow d-flex align-items-center me-2" onClick={() => scheduleDialogSwitch()}>
                        <Add className="fa-in me-2" /> Add
                    </button>
                )}
                <button className="btn btn-secondary rounded-5 px-3 fa-13 shadow d-flex align-items-center" onClick={() => nav('/tasks/activeproject')}>
                    <KeyboardArrowLeft className="fa-in me-2" /> Back
                </button>
            </div>

            {projectSchedule.map((o, i) => <ScheduleComp key={i} obj={o} SNo={i + 1} />)}

            <Dialog
                open={dialog.scheduleCreate}
                onClose={() => scheduleDialogSwitch()}
                maxWidth='sm' fullWidth>
                <DialogTitle className="fa-18">{isEdit ? "Change Schedule" : 'Create Schedule'}</DialogTitle>
                <DialogContent>
                    <table className="table">
                        <tbody>
                            {(Number(parseData?.UserTypeId) === 0 || Number(parseData?.UserTypeId) === 1) && <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Scheduled By</td>
                                <td className="border-bottom-0 fa-15">
                                    <select
                                        className="cus-inpt"
                                        value={scheduleInput.Sch_By}
                                        onChange={e => setScheduleInput({ ...scheduleInput, Sch_By: e.target.value })}>
                                        {userDropdown.map((o, i) => (
                                            <option key={i} value={o?.UserId}>{o?.Name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>}
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}> Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={scheduleInput.Sch_Date}
                                        onChange={e => setScheduleInput({ ...scheduleInput, Sch_Date: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Type</td>
                                <td className="border-bottom-0 fa-15">
                                    <select
                                        className="cus-inpt"
                                        value={scheduleInput.Sch_Type_Id}
                                        onChange={e => setScheduleInput({ ...scheduleInput, Sch_Type_Id: e.target.value })}>
                                        {scheduleType.map((o, i) => (
                                            <option key={i} value={o?.Sch_Type_Id}>{o?.Sch_Type + " (" + o?.Sch_Days + " Day)"}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Status</td>
                                <td className="border-bottom-0 fa-15">
                                    <select
                                        className="cus-inpt"
                                        value={scheduleInput.Sch_Status}
                                        onChange={e => setScheduleInput({ ...scheduleInput, Sch_Status: e.target.value })}>
                                        {workStatus.map((o, i) => (
                                            <option key={i} value={o?.Status_Id}>{o?.Status}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={scheduleInput.Sch_Est_Start_Date}
                                        onChange={e => setScheduleInput({ ...scheduleInput, Sch_Est_Start_Date: e.target.value })} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => scheduleDialogSwitch()}>cancel</Button>
                    <Button onClick={postAndPutScheduleFun} >{isEdit ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog?.taskSchedule}
                onClose={() => taskDialogSwitch()}
                maxWidth='sm' fullWidth>
                <DialogTitle>{isEdit ? 'Manage Task' : 'Assign Task'}</DialogTitle>
                <DialogContent>
                    <table className="table">
                        <tbody>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Task</td>
                                <td className="border-bottom-0 fa-15">
                                    <Select
                                        value={{ value: taskScheduleInput?.Task_Id, label: taskScheduleInput?.TasksGet }}
                                        onChange={(e) => setTaskScheduleInput({ ...taskScheduleInput, Task_Id: e.value, TasksGet: e.label })}
                                        options={[...tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))]}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder={"Select Task"} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Task Type</td>
                                <td className="border-bottom-0 fa-15">
                                    <select
                                        className="cus-inpt"
                                        value={taskScheduleInput?.Type_Task_Id}
                                        onChange={e => setTaskScheduleInput({ ...taskScheduleInput, Type_Task_Id: e.target.value })}>
                                        {taskType.map((o, i) => <option key={i} value={o?.Task_Type_Id}>{o?.Task_Type}</option>)}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={taskScheduleInput?.Task_Est_Start_Date}
                                        onChange={e => setTaskScheduleInput({ ...taskScheduleInput, Task_Est_Start_Date: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>End Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={taskScheduleInput?.Task_Est_End_Date}
                                        onChange={e => setTaskScheduleInput({ ...taskScheduleInput, Task_Est_End_Date: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Time</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='time'
                                        className="cus-inpt"
                                        value={taskScheduleInput?.Task_Start_Time}
                                        onChange={e => setTaskScheduleInput({ ...taskScheduleInput, Task_Start_Time: e.target.value })} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Duration</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='time'
                                        className="cus-inpt"
                                        value={taskScheduleInput?.Task_Sch_Duaration}
                                        onChange={e => setTaskScheduleInput({ ...taskScheduleInput, Task_Sch_Duaration: e.target.value })} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {Number(taskScheduleInput?.Levl_Id) !== 1 && (
                        <>
                            <label className="mb-2">Select Dependency Tasks</label>
                            <Autocomplete
                                multiple
                                id="checkboxes-tags-demo"
                                options={dependancyTasks}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option?.TaskNameGet}
                                value={selectedDependencyTasks}
                                onChange={(f, e) => setSelectedDependencyTasks(e)}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option?.TaskNameGet}
                                    </li>
                                )}
                                style={{ width: '100%' }}
                                isOptionEqualToValue={(opt, val) => opt?.Task_Id === val?.Task_Id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Tasks" placeholder="Select Dependency Tasks" />
                                )}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => taskDialogSwitch()}>close</Button>
                    <Button onClick={postAndPutTaskFun}>
                        {isEdit ? 'Update' : 'Assign Task'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={dialog?.scheduleDelete}
                onClose={() => switchScheduleDeleteDialog()}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    Do you want to delete the Schedule?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => switchScheduleDeleteDialog()}>cancel</Button>
                    <Button onClick={deleteScheduleFun} >Delete</Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={dialog?.taskDelete}
                onClose={() => switchTaskDeleteDialog()}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    Do you want to delete the Task?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => switchTaskDeleteDialog()}>cancel</Button>
                    <Button onClick={deleteTaskFun} >Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ProjectDetails;