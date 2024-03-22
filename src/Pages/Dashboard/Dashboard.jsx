import React, { useEffect, useState } from "react";
import './Dashboard.css'
import api from "../../API";
import { Tab, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from '@mui/material';
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { Forum, PlayArrow, AccessAlarm, } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const [myTasks, setMyTasks] = useState([]);
  const [reload, setReload] = useState(false);
  const [tabValue, setTabValue] = useState('1');
  const [dialog, setDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState({})

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);


  useEffect(() => {
    fetch(`${api}todayTasks?Emp_Id=${parseData?.UserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMyTasks(data.data)
        }
      }).catch(e => console.error(e))
  }, [])

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

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formatNumber = (number) => {
      return number < 10 ? `0${number}` : number;
    };

    return `${formatNumber(hours)}:${formatNumber(minutes % 60)}:${formatNumber(seconds % 60)}`;
  };


  const TaskCard = ({ o }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <>
        <div className="col-xxl-3 col-lg-4 col-md-6 col-sm-12">
          <div className="p-4 img-gradient rounded-4 mb-4 task-card">

            <h5 className="mb-0 d-flex align-items-center pb-2" style={{ borderBottom: '1.2px solid darkgrey' }}>
              <span className="flex-grow-1 fa-18">{o?.Task_Name}</span>
              <span className="fa-13">
                {new Date(o?.Task_Assign_dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </h5>

            <p className="d-flex align-items-center mt-3 mb-1">
              <span className="flex-grow-1">
                Schedule
              </span>
              <span className="fa-14">
                {formatTime24(o?.Sch_Time)} - {formatTime24(o?.EN_Time)}
              </span>
            </p>

            <p className="d-flex align-items-center mb-1">
              <span className="flex-grow-1">
                Time Duration
              </span>
              <span className="fa-14 text-primary">
                {o?.Sch_Period} Hrs
              </span>
            </p>

            <p className="d-flex align-items-center mb-1">
              <span className="flex-grow-1">
                Project
              </span>
              <span className="fa-14">
                {o?.Project_Name.slice(0, 20)}
                {o?.Project_Name.length > 20 && '...'}
              </span>
            </p>

            <p className="d-flex align-items-center mb-2">
              <span className="flex-grow-1">
                Project Head
              </span>
              <span className="fa-14">
                {o?.Project_Head_Name}
              </span>
            </p>

            <div
              className="rounded-3"
              style={{ backgroundColor: '#f2f5f8', padding: '5px 15px', height: '150px', overflowY: 'scroll' }}>
              <p className="mb-0 mt-1">Describtion: </p>

              <p className="mb-0" style={{ textAlign: 'justify' }}>
                {!isExpanded ? (
                  <span>
                    &emsp;&emsp;{o?.Task_Desc.slice(0, 100)}
                    {o?.Task_Desc.length > 100 && (
                      <>
                        ...
                        <button className="btn p-0 fa-14 text-primary" onClick={() => setIsExpanded(true)}>Read more</button>
                      </>)}
                  </span>
                ) : (
                  <span>
                    {o?.Task_Desc}
                    <button className="btn p-0 fa-14 text-primary" onClick={() => setIsExpanded(false)}>Show less</button>
                  </span>
                )}
              </p>
            </div>

            <hr className="my-2" />

            <div className="d-flex align-items-center">
              <p className="flex-grow-1 mb-0">By: <span className="text-primary fa-16">{o?.Assigned_Name}</span></p>
              <Tooltip title="Forum">
                <IconButton size="small">
                  <Forum className="fa-in" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Start Task">
                <IconButton size="small" onClick={() => { setSelectedTask(o); setDialog(true) }}>
                  <PlayArrow className="fa-in" />
                </IconButton>
              </Tooltip>
            </div>

          </div>
        </div>
      </>
    )
  }

  function timeToMilliseconds(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    const milliseconds = totalMinutes * 60000;

    return milliseconds;
  }

  console.log(selectedTask?.Sch_Period ? timeToMilliseconds(selectedTask?.Sch_Period) : 'failed')

  return (
    <>
      <ToastContainer />
      <div className="px-3 py-2">
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList indicatorColor='secondary' textColor='secondary' onChange={(e, n) => setTabValue(n)} aria-label="">
              <Tab sx={tabValue === '1' ? { backgroundColor: '#c6d7eb' } : {}} label={'TODAY TASKS' + ' (' + myTasks.length + ')'} value='1' />
              <Tab sx={tabValue === '2' ? { backgroundColor: '#c6d7eb' } : {}} label={"EXECUTED" + ' (' + myTasks.length + ')'} value='2' />
            </TabList>
          </Box>
          <TabPanel value={'1'} sx={{ p: 1, pt: 2 }}>
            <div className="row">
              {myTasks.map((o, i) => <TaskCard key={i} o={o} />)}
            </div>
          </TabPanel>
          <TabPanel value={'2'} sx={{ p: 0, }}>
            <></>
          </TabPanel>
        </TabContext>
      </div>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}>
        <DialogTitle>
          Start Task
          <span className="text-primary fw-bold"> {selectedTask?.Task_Name}</span>
        </DialogTitle>
        <DialogContent>

          <div
            className="d-flex flex-column align-items-center justify-content-center pb-3"
            style={{ width: '15em', minHeight: '20em' }}>

            <AccessAlarm sx={{ fontSize: '50px' }} />
            Scheduled Time :
            <span className="my-2">{selectedTask?.Sch_Period} Hrs</span>
            {/* <span className="p-2 w-100">
              <div style={{ backgroundColor: '#ddd' }} className="rounded-4 overflow-hidden">
                <div
                  style={{
                    width: `${progressFun(selectedTask?.Sch_Period ? timeToMilliseconds(selectedTask?.Sch_Period) : 0)}%`,
                    backgroundColor: '#007bff',
                    height: '20px'
                  }} />

              </div>
            </span>
            
            <span className="fa-20">
              Duration : {formatTime(elapsedTime)}
            </span>

            <span>
              {'Progress : ' + progressFun(selectedTask?.Sch_Period ? timeToMilliseconds(selectedTask?.Sch_Period) : 0)?.toFixed(2) + ' %'}
            </span> */}

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
  );
}

export default Dashboard;
