import { useEffect, useState, useContext } from "react";
import api from "../../API";
import '../common.css'
import { QueryBuilder, CalendarMonth, PlayArrow, AccessAlarm } from '@mui/icons-material';
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Tooltip } from '@mui/material';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MyContext } from "../../Components/context/contextProvider";

const localData = localStorage.getItem("user");
const parseData = JSON.parse(localData);

const initialState = {
    Branch: parseData?.BranchId,
    Fromdate: new Date().toISOString().split('T')[0],
    Emp_Id: parseData?.UserId,
    Task_Type_Id: 0,
}


const MyTasks = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);

    const [tasksData, setTaskData] = useState([]);
    const [filterValue, setFilterValue] = useState(initialState);
    const [reload, setReload] = useState(false);
    const [taskType, setTaskType] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState({});
    const { contextObj } = useContext(MyContext);
    
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);


    useEffect(() => {
        fetch(`${api}myTasks?Branch=${filterValue.Branch}&Emp_Id=${filterValue.Emp_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskData(data.data);
                }
            }).catch(e => console.error(e))
    }, [reload]);

    useEffect(() => {
        fetch(`${api}/taskTypeDropDown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskType(data.data)
                }
            }).catch(e => console.error(e));
        fetch(`${api}startTask?Emp_Id=${parseData?.UserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStartTime(data?.data[0]?.Time);
                    setIsRunning(true);
                } else {
                    setStartTime(null)
                    setIsRunning(false);
                }
            }).catch(e => console.error(e));
    }, []);

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

    const startTimer = () => {
        fetch(`${api}startTask`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Emp_Id: parseData.UserId,
                Time: new Date().getTime(),
                Task_Id: selectedTask?.Task_Id,
                Sub_Task_Id: selectedTask?.Sub_Task_Id,
                ForcePost: 0
            })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message)
                    setStartTime(new Date().getTime());
                    setIsRunning(true);
                } else {
                    toast.error(data.message);
                }
            })

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
                    setElapsedTime(0)
                } else {
                    toast.error(data.message);
                }
            })
    };

    function handleSearchChange(event) {
        const term = event.target.value;
        setFilterValue({ ...filterValue, Task_Type_Id: term });
        const filteredResults = tasksData.filter(item => Number(item.Type_Task_Id) === Number(term));
        setFilteredData(filteredResults);
    }

    const returnColor = (num) => {
        const parsed = parseInt(num);
        const color = ['#b5cce6', '#87CEEB', '#D8BFD8', '#b5e6dd'];
        return { bg: color[parsed - 1] ? color[parsed - 1] : color[0] }
    }

    const progressFun = (end) => {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - parseInt(startTime);
        const totalDuration = parseInt(end) - parseInt(startTime);

        if (elapsed && totalDuration && elapsed < totalDuration) {
            return (elapsed / totalDuration) * 100;
        } else if (elapsed && totalDuration && elapsed >= totalDuration) {
            return 100;
        } else {
            return 0;
        }
    };

    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const formatNumber = (number) => {
            return number < 10 ? `0${number}` : number;
        };

        return `${formatNumber(hours)}:${formatNumber(minutes % 60)}:${formatNumber(seconds % 60)}`;
    };

    const tempEndTime = 600000;
    console.log(contextObj)
    return contextObj.Read_Rights === 1 && (
        <>
            <ToastContainer />
            <div className="tab-container">
                <div className="d-flex flex-nowrap align-items-center overflow-auto hidescroll">
                    <span className="me-2">Filter By:</span>
                    <div className="rounded-select-container">
                        <select
                            className="rounded-select"
                            value={filterValue.Task_Type_Id}
                            onChange={handleSearchChange} >
                            {taskType.map((o, i) => (
                                <option key={i} value={o.Task_Type_Id}>
                                    {Number(o.Task_Type_Id) === 0 ? 'TASK TYPE' : o.Task_Type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            {(filteredData && filteredData.length ? filteredData : Number(filterValue.Task_Type_Id) === 0 ? tasksData : []).map((o, i) => (
                <div className="cus-card row" key={i}>
                    <div
                        className="col-lg-2 col-md-3 p-4 fw-bold text-dark d-flex flex-column justify-content-center align-items-center"
                        style={{ backgroundColor: returnColor(o?.Type_Task_Id).bg }}
                    >
                        {/* o?.Task_Stat_Id */}
                        <span>{o?.Task_Type}</span>
                    </div>
                    <div className="col-lg-10 col-md-9 p-4 multiple-colors-gradient">
                        <span className="fa-20 fw-bold">{o?.Task_Name}</span><br />
                        <span className="fa-14 pe-2 text-black">
                            <CalendarMonth className="fa-in" />
                            {" "}
                            {o?.Est_Start_Dt && new Date(o?.Est_Start_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-')}
                            {" - "}
                            {o?.Est_End_Dt && new Date(o?.Est_End_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-')}
                        </span>
                        <QueryBuilder className="fa-in" />
                        <span className="fa-14 ps-2 fw-bold">{o?.Sch_Time}</span>
                        {Number(o?.Timer_Based) === 1 && <span className="badge bg-info mx-2">Timer Based!</span>}
                        <br />
                        <p className="m-0">
                            <span className="pb-2">Describrion: </span><br />
                            {o?.Task_Desc}
                        </p>
                        <hr />
                        <div className="d-flex align-items-center">
                            <span className="flex-grow-1">{'Assigned By ' + o?.Assigned_Name}</span>
                            <span>
                                <Tooltip title="Start Task">
                                    <IconButton className="cus-shadow bg-info text-white" size="small"
                                        onClick={() => { setSelectedTask(o); setDialog(true) }}>
                                        <PlayArrow />
                                    </IconButton>
                                </Tooltip>
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}>
                <DialogTitle>{selectedTask?.Task_Name}</DialogTitle>
                <DialogContent>
                    <div className="d-flex flex-column align-items-center justify-content-center pb-3" style={{ width: '15em', minHeight: '20em' }}>
                        <AccessAlarm sx={{ fontSize: '50px' }} />
                        Scheduled Time : 
                        <span className="my-2">{formatTime(tempEndTime)}</span>
                        <span className="p-2 w-100">
                            <div style={{ backgroundColor: '#ddd' }} className="rounded-4 overflow-hidden">
                                <div
                                    style={{
                                        width: `${progressFun(parseInt(startTime) + tempEndTime)}%`,
                                        backgroundColor: '#007bff',
                                        height: '20px'
                                    }} />
                            </div>
                        </span>
                        <span className="fa-20">
                            Duration : {formatTime(elapsedTime)}
                        </span>
                        {(parseInt(startTime) + parseInt(elapsedTime)) > (parseInt(startTime) + tempEndTime) ? (
                            <span className="text-danger fa-14 text-center">{"Over Time : " + formatTime((parseInt(startTime) + parseInt(elapsedTime)) - (parseInt(startTime) + tempEndTime))}</span>
                        ) : (
                            <span>
                                {'Progress : ' + progressFun(parseInt(startTime) + tempEndTime)?.toFixed(2) + ' %'}
                            </span>
                        )}
                        <button
                            onClick={!isRunning ? startTimer : stopTimer}
                            className="clock-btn cus-shadow" style={!isRunning ? { backgroundColor: '#b5e6dd' } : { backgroundColor: '#D8BFD8' }}>
                            {!isRunning ? 'Start' : 'Stop'}
                        </button>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button >cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default MyTasks;