import { useEffect, useState } from "react";
import api from "../../API";
import '../common.css'
import { InfoOutlined, OpenInNewOutlined, AlarmOn, FilterAlt, Add } from '@mui/icons-material';
import { IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import TaskInfo from "./TaskInfo";

const localData = localStorage.getItem("user");
const parseData = JSON.parse(localData);

const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 2);

// Fromdate: firstDay.toISOString().split('T')[0],
// Todate: new Date().toISOString().split('T')[0],

const initialState = {
    Branch: parseData?.BranchId,
    Fromdate: '2023-07-01',
    Todate: new Date().toISOString().split('T')[0],
    Task_Id: '',
    Task_Type_Id: 0,
    Project_Id: 0,
    Project_Head_Id: 0,
    Base_Group: 0,
    Status: 0
}

const Tasks = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);

    const [tasksData, setTaskData] = useState([]);
    const [filterValue, setFilterValue] = useState(initialState);
    const [screen, setScreen] = useState(true);
    const [dialog, setDialog] = useState(false)

    const [branch, setBranch] = useState([]);
    const [users, setUsers] = useState([]);
    const [baseGroup, setBaseGroup] = useState([]);
    const [taskType, setTaskType] = useState([]);
    const [project, setProject] = useState([]);
    const [status, setStatus] = useState([]);
    const [projectHead, setProjectHead] = useState([]);


    useEffect(() => {
        fetch(`${api}todayTasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterValue)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskData(data.data);
                }
            })
    }, [filterValue]);

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
                    setProjectHead(data.data);
                }
            })
        fetch(`${api}baseGroup`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBaseGroup(data.data)
                }
            })
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


    const DispTask = ({ o }) => {
        const [mouseEvent, setMouseEvent] = useState(false);
        return (
            <>
                <div className="p-3 mb-3 row rounded-4 task-card" >
                    <div className="col-2 col-lg-1 col-md-1 d-flex justify-content-center align-items-center flex-column hrul">
                        <Tooltip title="">
                            <IconButton
                                size="small"
                                onMouseEnter={() => setMouseEvent(!mouseEvent)}
                                onMouseLeave={() => setMouseEvent(!mouseEvent)}>
                                {mouseEvent ? <InfoOutlined className="h4 mb-0" /> : <AlarmOn className="h4 mb-0" />}
                            </IconButton>
                        </Tooltip>
                        <span className="badge bg-dark fa-10">{o?.Status_Work}</span>
                    </div>
                    <div className="col-8 col-lg-10 col-md-10 d-flex flex-column align-items-start justify-content-center fw-bold hrul">
                        <p className="fa-13 mb-0 text-primary">{o?.Task_Name}</p>
                        <p className="fa-12 mb-0 w-100">
                            <span className="text-muted">
                                {new Date(o?.Est_Start_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                {" - "}
                                {new Date(o?.Est_End_Dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            {/* <span className="float-end text-muted">
                                {o?.Start_Time + " - " + o?.End_Time}
                            </span> */}
                        </p>
                    </div>
                    <div className="col-2 col-lg-1 col-md-1 d-flex flex-column justify-content-center align-items-center">
                        <Tooltip title="Start Task">
                            <IconButton size="small">
                                <OpenInNewOutlined />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </>
        )
    }


    return (
        <>
            {screen ? (
                <div className="card">
                    <div className="card-header bg-white d-flex align-items-center justify-content-between">
                        <span className="fa-16 fw-bold text-uppercase">Tasks</span>
                        <div className="text-end">
                            <IconButton><Add className="text-primary" /></IconButton>
                            <IconButton><FilterAlt className="text-primary" /></IconButton>
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
                    branch={branch}
                    users={users}
                    baseGroup={baseGroup}
                    taskType={taskType}
                    project={project}
                    status={status}
                    projectHead={projectHead}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                />
            )}


            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description">
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogContent>
                        
                    </DialogContent>
                    <DialogActions>

                    </DialogActions>
            </Dialog>
        </>
    )
}

export default Tasks;