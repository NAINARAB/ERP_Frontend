// import { useEffect, useState, useContext } from "react";
// import '../common.css';
// import { IconButton } from '@mui/material'
// import { Launch } from '@mui/icons-material'
// import { BarChart, Group, WorkHistory, CalendarMonth } from '@mui/icons-material';
// import { CgUserList } from "react-icons/cg";
// import { useNavigate } from 'react-router-dom';
// import { MyContext } from "../../Components/context/contextProvider";
// import { fetchLink } from "../../Components/fetchComponent";



// const ActiveProjects = () => {
//     const localData = localStorage.getItem("user");
//     const parseData = JSON.parse(localData);
//     const [projects, setProjects] = useState([]);
//     const { contextObj } = useContext(MyContext);
//     const nav = useNavigate();

//     useEffect(() => {
//         fetchLink({
//             address: `taskManagement/project/Abstract?Company_id=${parseData?.Company_id}`
//         }).then(data => {
//             if (data.success) {
//                 setProjects(data.data);
//             }
//         }).catch(e => console.error(e)) 
//     }, []);

//     const calcPercentage = (task, completed) => {
//         if (Number(task) === 0) {
//             return 0;
//         } else {
//             return ((Number(completed) / Number(task)) * 100).toFixed(0);
//         }
//     }

//     const CardDisplay = ({ icon, label, value, value2 }) => {
//         return (
//             <div className="col-xxl-3 col-lg-4 col-md-6 mb-3">
//                 <div className="p-3 rounded-3 mnh">
//                     <div className="d-flex">
//                         <span className='smallicon fa-17 me-2'>{icon}</span>
//                         <span className={`text-uppercase fw-bold text-muted fa-16`}>
//                             {label}
//                         </span>
//                     </div>
//                     <p className={`text-end mb-0 fw-bold`} style={{ fontSize: '26px' }} >
//                         {value}
//                         <span className="fa-20">{value2 && ' /' + value2}</span>
//                     </p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <>
//             {projects.map((o, i) => (
//                 <div className="project-card p-0"
//                     key={i}
//                     onClick={() => {
//                         nav('projectDetails', {
//                             state: {
//                                 project: o,
//                                 rights: {
//                                     read: contextObj.Read_Rights,
//                                     add: contextObj.Add_Rights,
//                                     edit: contextObj.Edit_Rights,
//                                     delete: contextObj.Delete_Rights
//                                 }
//                             }
//                         })
//                     }} >
//                     <div className="fa-18 mb-3 text-dark text-uppercase fw-bold d-flex align-items-center px-3 py-2 border-bottom ">
//                         <span className="flex-grow-1">{o.Project_Name} </span>
//                         <IconButton className="bg-light" onClick={() => {
//                             nav('projectschedule', {
//                                 state: {
//                                     project: o,
//                                     rights: {
//                                         read: contextObj.Read_Rights,
//                                         add: contextObj.Add_Rights,
//                                         edit: contextObj.Edit_Rights,
//                                         delete: contextObj.Delete_Rights
//                                     }
//                                 }
//                             })
//                         }
//                         }>
//                             <Launch className="text-dark" />
//                         </IconButton>
//                     </div>

//                     <div className="row px-3">

//                         <CardDisplay
//                             icon={<BarChart className="fa-in" />}
//                             label={'progress'}
//                             value={calcPercentage(o?.TasksScheduled, o?.CompletedTasks) + ' %'}
//                         />

//                         <CardDisplay
//                             icon={<WorkHistory className="fa-in" />}
//                             label={'schedule / completed'}
//                             value={o?.SchedulesCompletedCount}
//                             value2={o?.SchedulesCount}
//                         />

//                         <CardDisplay
//                             icon={<WorkHistory className="fa-in" />}
//                             label={'task / Completed'}
//                             value={o?.CompletedTasks}
//                             value2={o?.TasksScheduled}
//                         />

//                         <CardDisplay
//                             icon={<CgUserList className="fa-in" />}
//                             label={'task process / assigned'}
//                             value={o?.TasksProgressCount}
//                             value2={o?.TasksAssignedToEmployee}
//                         />

//                         <CardDisplay
//                             icon={<Group className="fa-in" />}
//                             label={'employee involved'}
//                             value={o?.EmployeesInvolved}
//                         />

//                         <div className="col-xxl-3 col-lg-4 col-md-6 mb-3">
//                             <div className="p-3 rounded-3 mnh" >
//                                 <div className="d-flex">
//                                     <span className='smallicon fa-17 me-2'><CalendarMonth className="fa-in" /></span>
//                                     <span className='text-uppercase fw-bold fa-16 text-muted'>duration</span>
//                                 </div>
//                                 <p className="text-end fa-15 mb-0 fw-bold">
//                                     {o?.Est_Start_Dt && (
//                                         new Date(o.Est_Start_Dt)
//                                             .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
//                                     )}
//                                     {" - "}
//                                     {o?.Est_End_Dt && (
//                                         new Date(o.Est_End_Dt)
//                                             .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
//                                     )}
//                                     {" "}
//                                     {"(" + ((new Date(o.Est_End_Dt) - new Date(o.Est_Start_Dt)) / (1000 * 60 * 60 * 24) + 1) + "DAYS)"}
//                                 </p>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             ))}
//         </>
//     )
// }

// export default ActiveProjects;




















import { useEffect, useState, useContext } from "react";
import '../common.css';
import { IconButton, Tooltip } from '@mui/material'
import { ArrowOutward as ArrowOutwardIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { BarChart, Group, CalendarMonth } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const ActiveProjects = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [projects, setProjects] = useState([]);
    const [projectTasks, setProjectTasks] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { contextObj } = useContext(MyContext);
    const nav = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        fetchLink({
            address: `taskManagement/project/Abstract?Company_id=${parseData?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProjects(data.data);
            }
        }).catch(e => console.error(e))
        .finally(() => setIsLoading(false));
    }, []);

    const fetchProjectTasks = async (projectId) => {
        // Return early if already fetched to avoid duplicate calls
        if (projectTasks[projectId]) return;
        
        try {
            const data = await fetchLink({
                address: `taskManagement/task/project/${projectId}`
            });
            if (data.success) {
                setProjectTasks(prev => ({
                    ...prev,
                    [projectId]: data.data
                }));
            }
        } catch (e) {
            console.error('Error fetching project tasks:', e);
        }
    }

    const calcPercentage = (task, completed) => {
        if (Number(task) === 0) {
            return 0;
        } else {
            return ((Number(completed) / Number(task)) * 100).toFixed(0);
        }
    }

    const getDurationDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end - start;
        const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
        return Math.max(1, Math.ceil(dayDiff + 1)); // Ensure at least 1 day
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-success';
            case 'in progress':
                return 'bg-warning';
            case 'pending':
                return 'bg-secondary';
            case 'not started':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }

    const getPriorityBadge = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-danger';
            case 'medium':
                return 'bg-warning';
            case 'low':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }

    const handleProjectClick = (project) => {
        nav('projectDetails', {
            state: {
                project: project,
                rights: {
                    read: contextObj.Read_Rights,
                    add: contextObj.Add_Rights,
                    edit: contextObj.Edit_Rights,
                    delete: contextObj.Delete_Rights
                }
            }
        });
    }

    const handleScheduleClick = (project, e) => {
        e?.stopPropagation();
        nav('projectschedule', {
            state: {
                project: project,
                rights: {
                    read: contextObj.Read_Rights,
                    add: contextObj.Add_Rights,
                    edit: contextObj.Edit_Rights,
                    delete: contextObj.Delete_Rights
                }
            }
        });
    }

    const handleTaskClick = (task, e) => {
        e?.stopPropagation();
        // Navigate to task details or handle task click
        console.log('Task clicked:', task);
        // You can implement navigation to task details here
        // nav('taskDetails', { state: { task } });
    }

    // Expandable Component for Project Details with Task List
    const ProjectExpandableComponent = ({ row }) => {
        const [isTasksLoading, setIsTasksLoading] = useState(false);
        const hasPendingTasks = Number(row?.TasksScheduled) - Number(row?.CompletedTasks) > 0;
        const tasks = projectTasks[row.Project_id] || [];
        
        // Fetch tasks when component mounts/expands
        useEffect(() => {
            const fetchTasks = async () => {
                if (row.Project_id && !projectTasks[row.Project_id]) {
                    setIsTasksLoading(true);
                    await fetchProjectTasks(row.Project_id);
                    setIsTasksLoading(false);
                }
            };

            fetchTasks();
        }, [row.Project_id]);

        return (
            <div className="p-3">
                {/* Project Summary Table */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3">Project Summary</h6>
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td className="p-2 bg-light fw-bold" style={{width: '15%'}}>Project Code</td>
                                <td className="p-2" style={{width: '18%'}}>{row.Project_Code || 'N/A'}</td>
                                <td className="p-2 bg-light fw-bold" style={{width: '15%'}}>Start Date</td>
                                <td className="p-2" style={{width: '18%'}}>{formatDate(row?.Est_Start_Dt)}</td>
                                <td className="p-2 bg-light fw-bold" style={{width: '15%'}}>End Date</td>
                                <td className="p-2" style={{width: '19%'}}>{formatDate(row?.Est_End_Dt)}</td>
                            </tr>
                            <tr>
                                <td className="p-2 bg-light fw-bold">Duration</td>
                                <td className="p-2">
                                    {getDurationDays(row?.Est_Start_Dt, row?.Est_End_Dt)} DAYS
                                </td>
                                <td className="p-2 bg-light fw-bold">Total Tasks</td>
                                <td className="p-2">{row?.TasksScheduled || 0}</td>
                                <td className="p-2 bg-light fw-bold">Completed Tasks</td>
                                <td className="p-2">{row?.CompletedTasks || 0}</td>
                            </tr>
                            <tr>
                                <td className="p-2 bg-light fw-bold">Project Status</td>
                                <td className="p-2" colSpan={5}>
                                    <span className={`badge ${Number(row?.CompletedTasks) === Number(row?.TasksScheduled) ? 
                                        'bg-success' : 'bg-warning'}`}>
                                        {Number(row?.CompletedTasks) === Number(row?.TasksScheduled) ? 
                                        'Completed' : 'In Progress'}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Progress Details Table */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3">Progress Overview</h6>
                    <table className="table table-bordered">
                        <thead className="bg-light">
                            <tr>
                                <th className="p-2">Metric</th>
                                <th className="p-2">Completed</th>
                                <th className="p-2">Total</th>
                                <th className="p-2">
                                    Progress
                                    {hasPendingTasks && (
                                        <Tooltip title="View Schedule">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleScheduleClick(row, e)}
                                            >
                                                <ArrowOutwardIcon className="text-blue-600" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 fw-bold">Tasks</td>
                                <td className="p-2">{row?.CompletedTasks || 0}</td>
                                <td className="p-2">{row?.TasksScheduled || 0}</td>
                                <td className="p-2 fw-bold">
                                    <span className={Number(row?.CompletedTasks) === Number(row?.TasksScheduled) ? 
                                        "text-green-600" : "text-orange-600"}>
                                        {calcPercentage(row?.TasksScheduled, row?.CompletedTasks)}%
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 fw-bold">Schedules</td>
                                <td className="p-2">{row?.SchedulesCompletedCount || 0}</td>
                                <td className="p-2">{row?.SchedulesCount || 0}</td>
                                <td className="p-2 fw-bold">
                                    <span className={Number(row?.SchedulesCompletedCount) === Number(row?.SchedulesCount) ? 
                                        "text-green-600" : "text-orange-600"}>
                                        {calcPercentage(row?.SchedulesCount, row?.SchedulesCompletedCount)}%
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 fw-bold">Task Progress</td>
                                <td className="p-2">{row?.TasksProgressCount || 0}</td>
                                <td className="p-2">{row?.TasksAssignedToEmployee || 0}</td>
                                <td className="p-2 fw-bold">
                                    <span className={Number(row?.TasksProgressCount) === Number(row?.TasksAssignedToEmployee) ? 
                                        "text-green-600" : "text-orange-600"}>
                                        {calcPercentage(row?.TasksAssignedToEmployee, row?.TasksProgressCount)}%
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Task Details List */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Task Details</h6>
                        <div className="d-flex align-items-center">
                            {isTasksLoading && (
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )}
                            <small className="text-muted">
                                {tasks.length} task(s) found
                            </small>
                        </div>
                    </div>
                    
                    {isTasksLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading tasks...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading tasks...</p>
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="p-2">Task Name</th>
                                        <th className="p-2">Assigned To</th>
                                        <th className="p-2">Priority</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Start Date</th>
                                        <th className="p-2">End Date</th>
                                        <th className="p-2">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task, index) => (
                                        <tr 
                                            key={task.Task_id || index} 
                                            className="cursor-pointer"
                                            onClick={(e) => handleTaskClick(task, e)}
                                        >
                                            <td className="p-2 fw-bold">
                                                {task.Task_name || `Task ${index + 1}`}
                                            </td>
                                            <td className="p-2">
                                                {task.AssignedTo || task.Assigned_To || 'Unassigned'}
                                            </td>
                                            <td className="p-2">
                                                <span className={`badge ${getPriorityBadge(task.Priority)}`}>
                                                    {task.Priority || 'Medium'}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <span className={`badge ${getStatusBadge(task.Status)}`}>
                                                    {task.Status || 'Not Started'}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                {formatDate(task.Start_date || task.Start_Date)}
                                            </td>
                                            <td className="p-2">
                                                {formatDate(task.End_date || task.End_Date)}
                                            </td>
                                            <td className="p-2">
                                                <div className="d-flex align-items-center">
                                                    <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                                                        <div 
                                                            className={`progress-bar ${
                                                                task.Status?.toLowerCase() === 'completed' ? 'bg-success' : 
                                                                task.Status?.toLowerCase() === 'in progress' ? 'bg-warning' : 'bg-info'
                                                            }`}
                                                            style={{width: `${task.Progress || 0}%`}}
                                                        ></div>
                                                    </div>
                                                    <small className="fw-bold">
                                                        {task.Progress || 0}%
                                                    </small>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 border rounded">
                            <p className="text-muted mb-0">No tasks found for this project</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 d-flex gap-2">
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleProjectClick(row)}
                    >
                        View Project Details
                    </button>
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={(e) => handleScheduleClick(row, e)}
                    >
                        View Project Schedule
                    </button>
                </div>
            </div>
        );
    };

    return (
        <FilterableTable
            title="Active Projects"
            dataArray={projects}
            EnableSerialNumber
            columns={[
                {
                    ColumnHeader: "Project Name",
                    isVisible: 1,
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <span 
                            className="fw-bold text-uppercase cursor-pointer"
                            onClick={() => handleProjectClick(row)}
                            style={{ cursor: 'pointer' }}
                        >
                            {row.Project_Name}
                        </span>
                    ),
                },
                {
                    ColumnHeader: "Progress",
                    isVisible: 1,
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <div className="d-flex align-items-center">
                            <BarChart className="text-muted me-2" fontSize="small" />
                            <span>{calcPercentage(row?.TasksScheduled, row?.CompletedTasks)}%</span>
                        </div>
                    ),
                },
                {
                    ColumnHeader: "Employee Involved",
                    isVisible: 1,
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <div className="d-flex align-items-center">
                            <Group className="text-muted me-2" fontSize="small" />
                            <span>{row?.EmployeesInvolved || 0}</span>
                        </div>
                    ),
                },
                {
                    ColumnHeader: "Duration",
                    isVisible: 1,
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <div className="d-flex align-items-center">
                            <CalendarMonth className="text-muted me-2" fontSize="small" />
                            <div>
                                <div>{formatDate(row?.Est_Start_Dt)} - {formatDate(row?.Est_End_Dt)}</div>
                                <small className="text-muted">
                                    ({getDurationDays(row?.Est_Start_Dt, row?.Est_End_Dt)} DAYS)
                                </small>
                            </div>
                        </div>
                    ),
                },
            ]}
            ButtonArea={
                <>
                    <Tooltip title="Refresh Projects">
                        <IconButton
                            size="small"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </>
            }
            tableMaxHeight={550}
            isExpendable={true}
            expandableComp={(props) => (
                <ProjectExpandableComponent {...props} />
            )}
        />
    )
}

export default ActiveProjects;