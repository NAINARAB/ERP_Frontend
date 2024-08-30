import React, { useEffect, useState } from "react";
import api from "../../API";
import { Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, CardHeader } from '@mui/material';
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { AccessAlarm, } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
import { Card, CardContent } from '@mui/material';
import { ISOString } from '../../Components/functions'


const statusColor = (id) => {
    const numId = Number(id);
    const color = ['bg-dark', 'bg-info', 'bg-warning', 'bg-success', 'bg-danger'];
    return color[numId]
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

const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formatNumber = (number) => {
        return number < 10 ? `0${number}` : number;
    };

    return `${formatNumber(hours)}:${formatNumber(minutes % 60)}:${formatNumber(seconds % 60)}`;
};

function timeToMilliseconds(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    const milliseconds = totalMinutes * 60000;

    return milliseconds;
}

function millisecondsToTime(milliseconds) {
    const date = new Date(milliseconds);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return formattedHours + ':' + formattedMinutes;
}

function addTimes(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    let totalHours = hours1 + hours2;
    let totalMinutes = minutes1 + minutes2;
    if (totalMinutes >= 60) {
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes %= 60;
    }
    const formattedHours = totalHours < 10 ? '0' + totalHours : totalHours;
    const formattedMinutes = totalMinutes < 10 ? '0' + totalMinutes : totalMinutes;
    return formattedHours + ':' + formattedMinutes;
}


const TodayTasks = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialWorkSaveValue = {
        Work_Id: '',
        Project_Id: '',
        Sch_Id: '',
        Task_Levl_Id: '',
        Task_Id: '',
        AN_No: '',
        Emp_Id: parseData?.UserId,
        Work_Done: '',
        Start_Time: '',
        End_Time: '',
        Work_Status: 2,
        Work_Dt: ISOString(),
        Det_string: []
    }
    const additionalTaskInitialValue = {
        Work_Id: '',
        Project_Id: 1,
        Sch_Id: 1,
        Task_Levl_Id: 1,
        Task_Id: 1,
        AN_No: 0,
        Emp_Id: parseData?.UserId,
        Work_Done: '',
        Start_Time: '12:00',
        End_Time: '14:00',
        Work_Status: 3,
        Work_Dt: ISOString()
    }
    const [myTasks, setMyTasks] = useState([]);
    const [workedDetais, setWorkedDetais] = useState([]);
    const [queryDate, setQueryDate] = useState({
        myTaskDate: ISOString(),
        executedTaskDate: ISOString()
    });
    const [reload, setReload] = useState(false);
    const [tabValue, setTabValue] = useState('1');
    const [dialog, setDialog] = useState(false);
    const [workDialog, setWorkDialog] = useState(false);
    const [nonTimerWorkDialog, setNonTimerWorkDialog] = useState(false);
    const [additionalTaskDialog, setAdditionalTaskDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState({});
    const [runningTaskId, setRunningTaskId] = useState(0);
    const [isEdit, setIsEdit] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [workInput, setWorkInput] = useState(initialWorkSaveValue);
    const [additionalTaskInput, setAdditionalTaskInput] = useState(additionalTaskInitialValue)
    const [nonTimerInput, setNonTimerInput] = useState({
        ...initialWorkSaveValue,
        Start_Time: '10:00',
        End_Time: '11:00',
    })

    useEffect(() => {
        fetch(`${api}task/myTasks?Emp_Id=${parseData?.UserId}&reqDate=${queryDate.myTaskDate}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMyTasks(data.data)
                }
            }).catch(e => console.error(e))
    }, [reload, queryDate.myTaskDate, parseData?.UserId])

    useEffect(() => {
        fetch(`${api}myTodayWorks?Emp_Id=${parseData?.UserId}&reqDate=${queryDate.executedTaskDate}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setWorkedDetais(data.data)
                }
            }).catch(e => console.error(e))
    }, [reload, queryDate.executedTaskDate, parseData?.UserId])

    useEffect(() => {
        fetch(`${api}startTask?Emp_Id=${parseData?.UserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const time = data.data[0].Time ? Number(data.data[0].Time) : null;
                    const taskId = data?.data[0]?.Task_Id ? Number(data?.data[0]?.Task_Id) : 0
                    setStartTime(time);
                    setRunningTaskId(taskId)
                } else {
                    setStartTime(null)
                }
            }).catch(e => console.log(e))
    }, [reload, parseData?.UserId])

    useEffect(() => {
        const interval = setInterval(() => {
            if (startTime) {
                const currentTime = new Date().getTime();
                const elapsed = currentTime - parseInt(startTime);
                setElapsedTime(elapsed);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    useEffect(() => {
        if (startTime && myTasks.length > 0) {
            const setRunning = myTasks.find(task => Number(task.Task_Levl_Id) === Number(runningTaskId))
            setSelectedTask(setRunning)
        }
    }, [startTime, myTasks, reload, runningTaskId])



    const startTimer = () => {
        fetch(`${api}startTask`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Emp_Id: parseData.UserId,
                Time: new Date().getTime(),
                Task_Id: selectedTask?.Task_Levl_Id,
                ForcePost: 0
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message)
                    setReload(!reload)
                    setIsRunning(true);
                    setDialog(false)
                } else {
                    toast.error(data.message);
                }
            }).catch(e => console.error(e))

    };

    const stopTimer = () => {
        fetch(`${api}startTask`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Emp_Id: parseData.UserId,
                Mode: 1
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message)
                    setStartTime(null);
                    setIsRunning(false);
                    setElapsedTime(0);
                    setSelectedTask({})
                } else {
                    toast.error(data.message);
                }
            })
    };

    const progressFun = (end) => {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - parseInt(startTime);
        const totalDuration = end;

        if (elapsed && totalDuration && elapsed < totalDuration) {
            return (elapsed / totalDuration) * 100;
        } else if (elapsed && totalDuration && elapsed >= totalDuration) {
            return 100;
        } else {
            return 0;
        }
    };

    const handleInputChange = (e, param) => {
        const updatedValue = e.target.value;
        setWorkInput((prevWorkInput) => {
            const indexValue = prevWorkInput?.Det_string?.findIndex(item => Number(item.Param_Id) === Number(param.Param_Id));

            if (indexValue !== -1) {
                const updatedDetString = [...prevWorkInput.Det_string];
                updatedDetString[indexValue] = {
                    ...updatedDetString[indexValue],
                    Current_Value: updatedValue,
                    Param_Id: param.Param_Id,
                    Default_Value: param.Default_Value,
                    Task_Id: param?.Task_Id
                };
                return {
                    ...prevWorkInput,
                    Det_string: updatedDetString
                };
            } else {
                return {
                    ...prevWorkInput,
                    Det_string: [
                        ...prevWorkInput.Det_string,
                        {
                            Current_Value: updatedValue,
                            Param_Id: param.Param_Id,
                            Default_Value: param.Default_Value,
                            Task_Id: selectedTask?.Task_Id
                        }
                    ]
                };
            }
        });
    };

    const handleNonTimerInputChange = (e, param) => {
        const updatedValue = e.target.value;
        setNonTimerInput((prevWorkInput) => {
            const indexValue = prevWorkInput?.Det_string?.findIndex(item => Number(item.Param_Id) === Number(param.Param_Id));

            if (indexValue !== -1) {
                const updatedDetString = [...prevWorkInput.Det_string];
                updatedDetString[indexValue] = {
                    ...updatedDetString[indexValue],
                    Current_Value: updatedValue,
                    Param_Id: param?.Param_Id,
                    Default_Value: param?.Default_Value,
                    Task_Id: param?.Task_Id
                };
                return {
                    ...prevWorkInput,
                    Det_string: updatedDetString
                };
            } else {
                return {
                    ...prevWorkInput,
                    Det_string: [
                        ...prevWorkInput.Det_string,
                        {
                            Current_Value: updatedValue,
                            Param_Id: param?.Param_Id,
                            Default_Value: param?.Default_Value,
                            Task_Id: param?.Task_Id
                        }
                    ]
                };
            }
        });
    };


    const renderEventContent = (eventInfo) => {
        const obj = eventInfo.event.extendedProps.objectData;
        const status = obj.Work_Status ? Number(obj.Work_Status) : 0;
        const message = [
            {
                color: 'bg-warning',
                message: 'New',
                text: 'text-dark'
            },
            {
                color: 'bg-warning',
                message: 'New',
                text: 'text-dark'
            },
            {
                color: 'bg-primary',
                message: 'on Progress',
                text: 'text-white'
            },
            {
                color: 'bg-success',
                message: 'Completed',
                text: 'text-white'
            },
        ]
        return (
            <div style={{ cursor: 'pointer' }}>
                <p className="mb-0">
                    <span>{eventInfo.event.title} </span>
                    <span>{formatTime24(obj?.Sch_Time) + ' - ' + formatTime24(obj?.EN_Time)} </span>
                    <span className={`badge text-dark ${message[status].color} ${message[status].text} mx-1`}>
                        {message[status].message}
                    </span>
                </p>
            </div>
        );
    };

    const openWorkDialog = (val) => {
        setWorkInput(initialWorkSaveValue);
        setWorkDialog(true)
    }

    function arrayToXml(array) {
        let xml = '<DocumentElement>';
        for (let obj of array) {
            xml += '<Data>';
            xml += `<Task_Id>${obj?.Task_Id ? String(obj?.Task_Id) : 0}</Task_Id>`;
            xml += `<Param_Id>${obj?.Param_Id ? String(obj?.Param_Id) : 0}</Param_Id>`;
            xml += `<Default_Value>${obj?.Default_Value ? String(obj?.Default_Value) : ''}</Default_Value>`;
            xml += `<Current_Value>${obj?.Current_Value ? String(obj?.Current_Value) : ''}</Current_Value>`;
            xml += '</Data>';
        }
        xml += '</DocumentElement>';
        return xml;
    }

    const saveWork = () => {
        fetch(`${api}saveWork`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Mode: isEdit ? 2 : 1,
                Work_Id: isEdit ? workInput?.Work_Id : 0,
                Project_Id: selectedTask?.Project_Id,
                Sch_Id: selectedTask?.Sch_Id,
                Task_Levl_Id: selectedTask?.Task_Levl_Id,
                Task_Id: selectedTask?.Task_Id,
                AN_No: selectedTask?.AN_No,
                Emp_Id: parseData?.UserId,
                Work_Done: workInput?.Work_Done,
                Start_Time: isEdit ? workInput.Start_Time : millisecondsToTime(startTime),
                End_Time: isEdit ? workInput.End_Time : addTimes(millisecondsToTime(startTime), formatTime(elapsedTime)),
                Work_Status: workInput?.Work_Status,
                Det_string: arrayToXml(workInput?.Det_string)
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSelectedTask({});
                    toast.success(data.message);
                    setWorkDialog(false); setIsEdit(false)
                    setReload(!reload); setElapsedTime(0); setIsRunning(false); setStartTime(null);
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
    }

    const saveNonTimerBasedTask = (e) => {
        e.preventDefault();
        fetch(`${api}saveWork`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Mode: isEdit ? 2 : 1,
                Work_Id: isEdit ? nonTimerInput?.Work_Id : 0,
                Project_Id: selectedTask?.Project_Id,
                Sch_Id: selectedTask?.Sch_Id,
                Task_Levl_Id: selectedTask?.Task_Levl_Id,
                Task_Id: selectedTask?.Task_Id,
                AN_No: selectedTask?.AN_No,
                Emp_Id: parseData?.UserId,

                Work_Dt: nonTimerInput?.Work_Dt,
                Work_Done: nonTimerInput?.Work_Done,
                Start_Time: nonTimerInput?.Start_Time,
                End_Time: nonTimerInput?.End_Time,
                Work_Status: nonTimerInput?.Work_Status,
                Det_string: arrayToXml(nonTimerInput?.Det_string)
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSelectedTask({});
                    toast.success(data.message);
                    setNonTimerWorkDialog(false);
                    setReload(!reload); setIsEdit(false); setStartTime(null);
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
    }

    const openUnAssignedTaskDialog = () => {
        setAdditionalTaskInput(additionalTaskInitialValue);
        setAdditionalTaskDialog(true);
    }

    const saveUnAssignedTask = (e) => {
        e.preventDefault();
        fetch(`${api}saveWork`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(additionalTaskInput)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setAdditionalTaskDialog(false);
                    setReload(!reload); setIsEdit(false)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
    }


    return (
        <>
            <ToastContainer />

            {startTime && (
                <div className="cus-card rounded-2 shadow-none px-3 py-1 mb-3">
                    <h5 className="mb-0 pt-2">Running Task</h5>

                    <div className="cus-card bg-light p-3 shadow-none rounded-1">

                        <p className="mb-0 fa-16 fw-bold pb-1 border-bottom">
                            <span className="flex-grow-1">{selectedTask?.Task_Name || ' No Active Task '}</span>
                        </p>

                        <div className="row mt-2 flex-row-reverse">
                            <div className="col-md-6">
                                <div className="p-2 pb-0">
                                    <p className="fa-20 d-flex mb-1">
                                        <span className="flex-grow-1">Duration : </span>
                                        <span className="text-primary">{formatTime(elapsedTime)}</span>
                                    </p>
                                    <p className="mb-0 d-flex">
                                        <span className="flex-grow-1">Progress : </span>
                                        {progressFun(selectedTask?.Sch_Period ? timeToMilliseconds(selectedTask?.Sch_Period) : 0)?.toFixed(2) + ' %'}
                                    </p>
                                    <span className="p-2 w-100">
                                        <div style={{ backgroundColor: '#ddd' }} className="rounded-4 overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${progressFun(selectedTask?.Sch_Period ? timeToMilliseconds(selectedTask?.Sch_Period) : 0)}%`,
                                                    backgroundColor: '#007bff',
                                                    height: '14px'
                                                }} />
                                        </div>
                                        <p className="mb-0 d-flex justify-content-between fa-12">
                                            <span   >0%</span>
                                            <span>100%</span>
                                        </p>
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-6 d-flex">
                                <div className="p-2 flex-grow-1">
                                    <p className="fa-14 mt-1 mb-0 d-flex">
                                        <span className=" flex-grow-1">Scheduled Time</span>
                                        <span>
                                            {selectedTask?.Sch_Time && formatTime24(selectedTask?.Sch_Time)}
                                            &nbsp; - &nbsp;
                                            {selectedTask?.EN_Time && formatTime24(selectedTask?.EN_Time)}
                                        </span>
                                    </p>
                                    <p className="fa-14 mt-1 mb-0 d-flex">
                                        <span className=" flex-grow-1">Total Hour</span>
                                        <span className="text-primary">
                                            {selectedTask?.Sch_Period} Hrs
                                        </span>
                                    </p>
                                    <p className="fa-14 mt-1 mb-0 d-flex">
                                        <span className=" flex-grow-1">Project</span>
                                        <span className="text-primary">
                                            {selectedTask?.Project_Name?.slice(0, 25)}
                                            {selectedTask?.Project_Name?.length > 25 && '...'}
                                        </span>
                                    </p>
                                    <p className="fa-14 mt-1 mb-0 d-flex">
                                        <span className=" flex-grow-1">Project Head</span>
                                        <span className="text-primary">
                                            {selectedTask?.Project_Head_Name}
                                        </span>
                                    </p>
                                </div>
                                <div className=" d-md-block vr" style={{ display: 'none' }}></div>
                            </div>
                        </div>

                    </div>

                    <div className="text-end mt-2 mb-1">
                        <Button onClick={stopTimer} color='error' variant='outlined' sx={{ marginRight: '10px' }}>cancel</Button>
                        <Button onClick={openWorkDialog} color='success' variant='contained'>Save</Button>
                    </div>
                </div>
            )}

            <Card variant='elevation'>
                <CardContent className="p-1">
                    <div className=" d-lg-flex">

                        <div className="flex-grow-1 p-2">
                            <CardHeader title='Assigned Task' className="text-center text-decoration-underline" />


                            <FullCalendar
                                plugins={[timeGridPlugin, listPlugin]}
                                initialView="timeGridDay"
                                initialDate={new Date()}
                                events={
                                    myTasks.map(o => ({
                                        title: o?.Task_Name,
                                        start: queryDate.myTaskDate + 'T' + o?.Sch_Time,
                                        end: queryDate.myTaskDate + 'T' + o?.EN_Time,
                                        objectData: o
                                    }))
                                }
                                headerToolbar={{
                                    left: 'prev next',
                                    center: 'title',
                                    right: 'timeGridDay, listDay',
                                }}
                                slotDuration={'00:20:00'}
                                slotMinTime={'08:00:00'}
                                slotMaxTime={'22:00:00'}
                                showNonCurrentDates={false}
                                editable={false}
                                selectable
                                selectMirror
                                eventClick={eve => {
                                    if (!startTime && elapsedTime === 0) {
                                        const selObj = eve.event.extendedProps?.objectData;
                                        if (Number(selObj?.Work_Status) !== 3 && Number(selObj?.Timer_Based) === 1) {
                                            setSelectedTask(selObj); 
                                            setDialog(true);
                                            setWorkInput({
                                                Work_Id: selObj?.Work_Id,
                                                Project_Id: selObj?.Project_Id,
                                                Sch_Id: selObj?.Sch_Id,
                                                Task_Levl_Id: selObj?.Task_Levl_Id,
                                                Task_Id: selObj?.Task_Id,
                                                AN_No: selObj?.AN_No,
                                                Emp_Id: parseData?.UserId,
                                                Work_Done: selObj?.Work_Done,
                                                Start_Time: selObj?.Start_Time,
                                                End_Time: selObj?.End_Time,
                                                Work_Status: selObj?.Work_Status,
                                                Work_Dt: ISOString(selObj?.Work_Dt),
                                                Det_string: selObj?.Param_Dts
                                            })
                                        } else if (Number(selObj?.Work_Status) !== 3) {
                                            setSelectedTask(selObj); 
                                            setNonTimerWorkDialog(true);
                                            setNonTimerInput({
                                                Work_Id: selObj?.Work_Id ? selObj?.Work_Id : '',
                                                Project_Id: selObj?.Project_Id ? selObj?.Project_Id : '',
                                                Sch_Id: selObj?.Sch_Id ? selObj?.Sch_Id : '',
                                                Task_Levl_Id: selObj?.Task_Levl_Id ? selObj?.Task_Levl_Id : '',
                                                Task_Id: selObj?.Task_Id ? selObj?.Task_Id : '',
                                                AN_No: selObj?.AN_No ? selObj?.AN_No : '',
                                                Emp_Id: parseData?.UserId,
                                                Work_Done: selObj?.Work_Done ? selObj?.Work_Done : '',
                                                Start_Time: selObj?.Start_Time ? selObj?.Start_Time : '10:00',
                                                End_Time: selObj?.End_Time ? selObj?.End_Time : '11:00',
                                                Work_Status: selObj?.Work_Status ? selObj?.Work_Status : 2,
                                                Work_Dt: selObj?.Work_Dt ?  ISOString(selObj?.Work_Dt) : ISOString(),
                                                Det_string: selObj?.Param_Dts ? selObj?.Param_Dts : [],
                                            })
                                        } else {
                                            toast.warn('This task is already completed')
                                        }
                                    } else {
                                        toast.warn('Complete running task')
                                    }
                                }}
                                eventContent={renderEventContent}
                                datesSet={obj => setQueryDate({ ...queryDate, myTaskDate: ISOString(obj.endStr) })}
                                height={1200}
                            />
                        </div>

                        <div className="flex-grow-1 p-2">
                            <CardHeader title='Executed' className="text-center text-decoration-underline" />

                            <FullCalendar
                                plugins={[timeGridPlugin, listPlugin]}
                                initialView="timeGridDay"
                                initialDate={queryDate.executedTaskDate}
                                events={
                                    workedDetais.map(o => ({
                                        title: o?.Task_Name,
                                        start: queryDate.executedTaskDate + 'T' + o?.Start_Time,
                                        end: queryDate.executedTaskDate + 'T' + o?.End_Time,
                                        objectData: o
                                    }))
                                }
                                headerToolbar={{
                                    left: 'prev next',
                                    center: 'title',
                                    right: 'timeGridDay, listWeek',
                                }}
                                slotDuration={'00:20:00'}
                                slotMinTime={'08:00:00'}
                                slotMaxTime={'22:00:00'}
                                showNonCurrentDates={false}
                                editable={false}
                                selectable
                                selectMirror
                                datesSet={obj => setQueryDate({ ...queryDate, executedTaskDate: ISOString(obj.endStr) })}
                                eventClick={eve => {
                                    if (!startTime && elapsedTime === 0) {
                                        const selObj = eve.event.extendedProps?.objectData;
                                        if (ISOString(selObj?.Entry_Date) === ISOString()) {
                                            setIsEdit(true)
                                            if (Number(selObj?.Timer_Based) === 0) {
                                                setSelectedTask(selObj); 
                                                setNonTimerWorkDialog(true)
                                                setNonTimerInput({
                                                    Work_Id: selObj?.Work_Id,
                                                    Project_Id: selObj?.Project_Id,
                                                    Sch_Id: selObj?.Sch_Id,
                                                    Task_Levl_Id: selObj?.Task_Levl_Id,
                                                    Task_Id: selObj?.Task_Id,
                                                    AN_No: selObj?.AN_No,
                                                    Emp_Id: parseData?.UserId,
                                                    Work_Done: selObj?.Work_Done,
                                                    Start_Time: selObj?.Start_Time ? selObj?.Start_Time : '10:00',
                                                    End_Time: selObj?.End_Time ? selObj?.End_Time : '11:00',
                                                    Work_Status: selObj?.Work_Status ? selObj?.Work_Status : 2,
                                                    Work_Dt: selObj?.Work_Dt ? ISOString(selObj?.Work_Dt) : ISOString(),
                                                    Det_string: selObj?.Param_Dts ? selObj?.Param_Dts : [],
                                                })
                                            } else {
                                                setSelectedTask(selObj); 
                                                setWorkDialog(true)
                                                setWorkInput({
                                                    Work_Id: selObj?.Work_Id,
                                                    Project_Id: selObj?.Project_Id,
                                                    Sch_Id: selObj?.Sch_Id,
                                                    Task_Levl_Id: selObj?.Task_Levl_Id,
                                                    Task_Id: selObj?.Task_Id,
                                                    AN_No: selObj?.AN_No,
                                                    Emp_Id: parseData?.UserId,
                                                    Work_Done: selObj?.Work_Done,
                                                    Start_Time: selObj?.Start_Time ? selObj?.Start_Time : '10:00',
                                                    End_Time: selObj?.End_Time ? selObj?.End_Time : '11:00',
                                                    Work_Status: selObj?.Work_Status ? selObj?.Work_Status : 2,
                                                    Work_Dt: selObj?.Work_Dt ? ISOString(selObj?.Work_Dt) : ISOString(),
                                                    Det_string: selObj?.Param_Dts ? selObj?.Param_Dts : []
                                                })
                                            }
                                        } else {
                                            toast.warn('You can only modify today works')
                                        }
                                    } else {
                                        toast.warn('Complete running task')
                                    }
                                }}
                                height={1200}
                            />
                        </div>

                    </div>

                    <div className="table-responsive mt-3">

                        <div className="d-flex justify-content-between border align-items-center p-2 rounded-3 mb-3" onClick={openUnAssignedTaskDialog}>
                            <span className="ps-2">Work Done At: {new Date(queryDate?.executedTaskDate).toLocaleDateString('en-IN')}</span>
                            <button className="btn btn-primary fa-14"> Add Additional Work Details</button>
                        </div>

                        <table className="table mb-1">
                            <thead>
                                <tr>
                                    <th className="fa-13 border">SNo</th>
                                    <th className="fa-13 border">Task</th>
                                    <th className="fa-13 border">Timer Based</th>
                                    <th className="fa-13 border">Start - End</th>
                                    <th className="fa-13 border">Total Minutes</th>
                                    <th className="fa-13 border">Status</th>
                                    <th className="fa-13 border">Discription</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workedDetais.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-13 border">{i + 1}</td>
                                        <td className="fa-13 border">{o?.Task_Name}</td>
                                        <td className="fa-13 border text-center">
                                            <span className={`badge rounded-4 px-3 fw-bold text-white ${statusColor(Number(o?.Timer_Based) === 1 ? 3 : 1)}`}>
                                                {Number(o?.Timer_Based) === 1 ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="fa-13 border text-center">{o?.Start_Time} - {o?.End_Time}</td>
                                        <td className="fa-13 border text-center">{o?.Tot_Minutes}</td>
                                        <td className="fa-13 border text-center">
                                            <span className={`badge rounded-4 px-3 fw-bold text-white ${statusColor(o?.Work_Status)}`}>
                                                {o?.WorkStatus}
                                            </span>
                                        </td>
                                        <td className="fa-13 border">{o?.Work_Done}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <TabContext value={tabValue} >

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'none' }}>
                            <TabList indicatorColor='secondary' textColor='secondary' onChange={(e, n) => setTabValue(n)} aria-label="">
                                <Tab sx={tabValue === '1' ? { backgroundColor: '#c6d7eb' } : {}} label={`TODAY TASKS (${myTasks.length})`} value='1' />
                                <Tab sx={tabValue === '2' ? { backgroundColor: '#c6d7eb' } : {}} label={`EXECUTED (${workedDetais.length})`} value='2' />
                            </TabList>
                        </Box>

                        <TabPanel value={'1'} sx={{ p: 0, pt: 2 }}>


                        </TabPanel>

                        <TabPanel value={'2'} sx={{ p: 0, pt: 2 }}>


                        </TabPanel>

                    </TabContext>
                </CardContent>
            </Card>

            <Dialog
                open={dialog}
                onClose={() => { setDialog(false); setSelectedTask({}) }}>
                <DialogTitle className="fa-18">
                    Start Task
                    <span className="text-primary fw-bold"> {selectedTask?.Task_Name}</span>
                </DialogTitle>
                <DialogContent sx={{ minWidth: '330px' }}>

                    <div className=" pb-3">

                        <p className="mb-0 text-center">
                            <AccessAlarm sx={{ fontSize: '50px' }} />
                        </p>

                        <p className="mb-0 text-center">
                            Allocated Time
                        </p>

                        <p className="my-2 text-center text-primary">{selectedTask?.Sch_Period} Hrs</p>

                    </div>

                    <p className="fa-16  mt-1 mb-0 d-flex">
                        <span className=" flex-grow-1">Schedule</span>
                        <span>
                            {selectedTask?.Sch_Time && formatTime24(selectedTask?.Sch_Time)}
                            &nbsp;-&nbsp;
                            {selectedTask?.EN_Time && formatTime24(selectedTask?.EN_Time)}
                        </span>
                    </p>

                    <p className="fa-16  mt-1 mb-0 d-flex">
                        <span className=" flex-grow-1">Project</span>
                        <span>
                            {selectedTask?.Project_Name?.slice(0, 25)}
                            {selectedTask?.Project_Name?.length > 25 && '...'}
                        </span>
                    </p>

                    <p className="fa-16  mt-1 mb-0 d-flex">
                        <span className=" flex-grow-1">Project Head</span>
                        <span>
                            {selectedTask?.Project_Head_Name}
                        </span>
                    </p>

                    <div className=" text-center">
                        <button
                            onClick={!isRunning ? startTimer : stopTimer}
                            className="clock-btn cus-shadow" style={!isRunning ? { backgroundColor: '#b5e6dd' } : { backgroundColor: '#D8BFD8' }}>
                            {!isRunning ? 'Start' : 'Stop'}
                        </button>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialog(false); setSelectedTask({}) }}>close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={workDialog}
                onClose={() => { setWorkDialog(false); setWorkInput(initialWorkSaveValue); setIsEdit(false); }}
                fullWidth maxWidth='sm'>
                <DialogTitle>Save Work</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    saveWork()
                }}>
                    <DialogContent>
                        <label className="my-2">Work Status</label>
                        <select
                            className="cus-inpt"
                            value={workInput.Work_Status} required
                            onChange={e => setWorkInput({ ...workInput, Work_Status: e.target.value })}>
                            <option value={2}>PENDING</option>
                            <option value={3}>COMPLETED</option>
                        </select>

                        <label className="my-2">Work Summary</label>
                        <textarea
                            rows="4"
                            className="cus-inpt" required
                            value={workInput.Work_Done}
                            onChange={e => setWorkInput({ ...workInput, Work_Done: e.target.value })} />

                        {selectedTask?.Param_Dts?.map((param, index) => (
                            <div key={index}>
                                <label className="mt-2 mb-1">{param?.Paramet_Name}</label>
                                <input
                                    type={param?.Paramet_Data_Type || 'text'}
                                    className="cus-inpt"
                                    onChange={(e) => handleInputChange(e, param)}
                                    value={workInput?.Det_string?.find(item => Number(item?.Param_Id) === Number(param?.Param_Id))?.Current_Value || ''}
                                    placeholder={param?.Paramet_Data_Type}
                                />
                            </div>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant='outlined'
                            type='button'
                            onClick={() => { setWorkDialog(false); setWorkInput(initialWorkSaveValue); setIsEdit(false) }}>
                            close
                        </Button>
                        <Button
                            color='success'
                            type='submit'
                            variant='contained'>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={nonTimerWorkDialog} maxWidth="sm" fullWidth
                onClose={() => { setNonTimerWorkDialog(false); setNonTimerInput(initialWorkSaveValue); setIsEdit(false) }} >
                <DialogTitle>Save Task Progress</DialogTitle>
                <form onSubmit={saveNonTimerBasedTask}>
                    <DialogContent className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Completed Date
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="date"
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Work_Dt: e.target.value })}
                                            value={ISOString(nonTimerInput?.Work_Dt)}
                                            className="cus-inpt" required />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Start Time
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="time"
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Start_Time: e.target.value })}
                                            value={nonTimerInput?.Start_Time}
                                            className="cus-inpt" required />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        End Time
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="time"
                                            min={nonTimerInput?.Start_Time}
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, End_Time: e.target.value })}
                                            value={nonTimerInput?.End_Time} required
                                            className="cus-inpt" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Work Status
                                    </td>
                                    <td className="border-0 fa-14">
                                        <select
                                            className="cus-inpt"
                                            value={nonTimerInput?.Work_Status}
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Work_Status: e.target.value })}
                                        >
                                            <option value={2}>PENDING</option>
                                            <option value={3}>COMPLETED</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14 pt-3">
                                        Work Summary
                                    </td>
                                    <td className="border-0 fa-14">
                                        <textarea
                                            rows="4"
                                            className="cus-inpt" required
                                            value={nonTimerInput?.Work_Done}
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Work_Done: e.target.value })} />
                                    </td>
                                </tr>
                                {selectedTask?.Param_Dts?.map((param, index) => (
                                    <tr key={index}>
                                        <td className="border-0 fa-14 pt-3">{param?.Paramet_Name}</td>
                                        <td className="border-0 fa-14">
                                            <input
                                                type={param?.Paramet_Data_Type || 'text'}
                                                className="cus-inpt"
                                                onChange={(e) => handleNonTimerInputChange(e, param)}
                                                value={nonTimerInput?.Det_string?.find(item => Number(item?.Param_Id) === Number(param?.Param_Id))?.Current_Value || ''}
                                                placeholder={param?.Paramet_Data_Type}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant='outlined' color="error" type='button'
                            onClick={() => { setNonTimerWorkDialog(false); setNonTimerInput(initialWorkSaveValue); setIsEdit(false) }}>
                            cancel
                        </Button>
                        <Button
                            variant='contained' color='success' type='submit'>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={additionalTaskDialog} maxWidth="sm" fullWidth
                onClose={() => setAdditionalTaskDialog(false)} >
                <DialogTitle>Additional Tasks</DialogTitle>
                <form onSubmit={saveUnAssignedTask}>
                    <DialogContent className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Completed Date
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="date"
                                            onChange={e => setAdditionalTaskInput({ ...additionalTaskInput, Work_Dt: e.target.value })}
                                            value={ISOString(additionalTaskInput?.Work_Dt)}
                                            className="cus-inpt" required />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Start Time
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="time"
                                            onChange={e => setAdditionalTaskInput({ ...additionalTaskInput, Start_Time: e.target.value })}
                                            value={additionalTaskInput?.Start_Time}
                                            className="cus-inpt" required />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        End Time
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="time"
                                            min={additionalTaskInput?.Start_Time}
                                            onChange={e => setAdditionalTaskInput({ ...additionalTaskInput, End_Time: e.target.value })}
                                            value={additionalTaskInput?.End_Time} required
                                            className="cus-inpt" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Work Status
                                    </td>
                                    <td className="border-0 fa-14">
                                        <select
                                            className="cus-inpt"
                                            value={additionalTaskInput?.Work_Status}
                                            onChange={e => setAdditionalTaskInput({ ...additionalTaskInput, Work_Status: e.target.value })}
                                        >
                                            <option value={2}>PENDING</option>
                                            <option value={3}>COMPLETED</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14 pt-3">
                                        Work Summary
                                    </td>
                                    <td className="border-0 fa-14">
                                        <textarea
                                            rows="4"
                                            className="cus-inpt" required
                                            value={additionalTaskInput?.Work_Done}
                                            onChange={e => setAdditionalTaskInput({ ...additionalTaskInput, Work_Done: e.target.value })} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant='outlined' color="error" type='button'
                            onClick={() => setAdditionalTaskDialog(false)}>
                            cancel
                        </Button>
                        <Button
                            variant='contained' color='success' type='submit'>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

export default TodayTasks;
