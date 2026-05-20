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




















// import { useEffect, useState, useContext } from "react";
// import '../common.css';
// import { IconButton, Tooltip } from '@mui/material'
// import { ArrowOutward as ArrowOutwardIcon, Refresh as RefreshIcon } from '@mui/icons-material'
// import { BarChart, Group, CalendarMonth } from '@mui/icons-material';

// import { useNavigate } from 'react-router-dom';
// import { MyContext } from "../../Components/context/contextProvider";
// import { fetchLink } from "../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../Components/filterableTable2";

// const ActiveProjects = () => {
//     const localData = localStorage.getItem("user");
//     const parseData = JSON.parse(localData);
//     const [projects, setProjects] = useState([]);
//     const [projectTasks, setProjectTasks] = useState({});
//     const [isLoading, setIsLoading] = useState(true);
//     const { contextObj } = useContext(MyContext);
//     const nav = useNavigate();

//     useEffect(() => {
//         setIsLoading(true);
//         fetchLink({
//             address: `taskManagement/project/Abstract?Company_id=${parseData?.Company_id}`
//         }).then(data => {
//             if (data.success) {
//                 setProjects(data.data);
//             }
//         }).catch(e => console.error(e))
//         .finally(() => setIsLoading(false));
//     }, []);

//     const fetchProjectTasks = async (projectId) => {
//         // Return early if already fetched to avoid duplicate calls
//         if (projectTasks[projectId]) return;
        
//         try {
//             const data = await fetchLink({
//                 address: `taskManagement/task/project/${projectId}`
//             });
//             if (data.success) {
//                 setProjectTasks(prev => ({
//                     ...prev,
//                     [projectId]: data.data
//                 }));
//             }
//         } catch (e) {
//             console.error('Error fetching project tasks:', e);
//         }
//     }

//     const calcPercentage = (task, completed) => {
//         if (Number(task) === 0) {
//             return 0;
//         } else {
//             return ((Number(completed) / Number(task)) * 100).toFixed(0);
//         }
//     }

//     const getDurationDays = (startDate, endDate) => {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         const timeDiff = end - start;
//         const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
//         return Math.max(1, Math.ceil(dayDiff + 1)); // Ensure at least 1 day
//     }

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         try {
//             return new Date(dateString).toLocaleDateString('en-IN', { 
//                 day: '2-digit', 
//                 month: '2-digit', 
//                 year: 'numeric' 
//             });
//         } catch (error) {
//             return 'Invalid Date';
//         }
//     }

//     const getStatusBadge = (status) => {
//         switch (status?.toLowerCase()) {
//             case 'completed':
//                 return 'bg-success';
//             case 'in progress':
//                 return 'bg-warning';
//             case 'pending':
//                 return 'bg-secondary';
//             case 'not started':
//                 return 'bg-info';
//             default:
//                 return 'bg-secondary';
//         }
//     }

//     const getPriorityBadge = (priority) => {
//         switch (priority?.toLowerCase()) {
//             case 'high':
//                 return 'bg-danger';
//             case 'medium':
//                 return 'bg-warning';
//             case 'low':
//                 return 'bg-info';
//             default:
//                 return 'bg-secondary';
//         }
//     }

//     const handleProjectClick = (project) => {
//         nav('projectDetails', {
//             state: {
//                 project: project,
//                 rights: {
//                     read: contextObj.Read_Rights,
//                     add: contextObj.Add_Rights,
//                     edit: contextObj.Edit_Rights,
//                     delete: contextObj.Delete_Rights
//                 }
//             }
//         });
//     }

//     const handleScheduleClick = (project, e) => {
//         e?.stopPropagation();
//         nav('projectschedule', {
//             state: {
//                 project: project,
//                 rights: {
//                     read: contextObj.Read_Rights,
//                     add: contextObj.Add_Rights,
//                     edit: contextObj.Edit_Rights,
//                     delete: contextObj.Delete_Rights
//                 }
//             }
//         });
//     }

//     const handleTaskClick = (task, e) => {
//         e?.stopPropagation();
//         // Navigate to task details or handle task click
//         console.log('Task clicked:', task);
//         // You can implement navigation to task details here
//         // nav('taskDetails', { state: { task } });
//     }

//     // Expandable Component for Project Details with Task List
//     const ProjectExpandableComponent = ({ row }) => {
//         const [isTasksLoading, setIsTasksLoading] = useState(false);
//         const hasPendingTasks = Number(row?.TasksScheduled) - Number(row?.CompletedTasks) > 0;
//         const tasks = projectTasks[row.Project_id] || [];
        
//         // Fetch tasks when component mounts/expands
//         useEffect(() => {
//             const fetchTasks = async () => {
//                 if (row.Project_id && !projectTasks[row.Project_id]) {
//                     setIsTasksLoading(true);
//                     await fetchProjectTasks(row.Project_id);
//                     setIsTasksLoading(false);
//                 }
//             };

//             fetchTasks();
//         }, [row.Project_id]);

//         return (
//             <div className="p-3">
//                 {/* Project Summary Table */}
//                 <div className="mb-4">
//                     <h6 className="fw-bold mb-3">Project Summary</h6>
//                     <table className="table table-bordered">
//                         <tbody>
//                             <tr>
//                                 <td className="p-2 bg-light fw-bold" style={{width: '15%'}}>Project Code</td>
//                                 <td className="p-2" style={{width: '18%'}}>{row.Project_Code || 'N/A'}</td>
//                                 <td className="p-2 bg-light fw-bold" style={{width: '15%'}}>Start Date</td>
//                                 <td className="p-2" style={{width: '18%'}}>{formatDate(row?.Est_Start_Dt)}</td>
//                                 <td className="p-2 bg-light fw-bold" style={{width: '15%'}}>End Date</td>
//                                 <td className="p-2" style={{width: '19%'}}>{formatDate(row?.Est_End_Dt)}</td>
//                             </tr>
//                             <tr>
//                                 <td className="p-2 bg-light fw-bold">Duration</td>
//                                 <td className="p-2">
//                                     {getDurationDays(row?.Est_Start_Dt, row?.Est_End_Dt)} DAYS
//                                 </td>
//                                 <td className="p-2 bg-light fw-bold">Total Tasks</td>
//                                 <td className="p-2">{row?.TasksScheduled || 0}</td>
//                                 <td className="p-2 bg-light fw-bold">Completed Tasks</td>
//                                 <td className="p-2">{row?.CompletedTasks || 0}</td>
//                             </tr>
//                             <tr>
//                                 <td className="p-2 bg-light fw-bold">Project Status</td>
//                                 <td className="p-2" colSpan={5}>
//                                     <span className={`badge ${Number(row?.CompletedTasks) === Number(row?.TasksScheduled) ? 
//                                         'bg-success' : 'bg-warning'}`}>
//                                         {Number(row?.CompletedTasks) === Number(row?.TasksScheduled) ? 
//                                         'Completed' : 'In Progress'}
//                                     </span>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Progress Details Table */}
//                 <div className="mb-4">
//                     <h6 className="fw-bold mb-3">Progress Overview</h6>
//                     <table className="table table-bordered">
//                         <thead className="bg-light">
//                             <tr>
//                                 <th className="p-2">Metric</th>
//                                 <th className="p-2">Completed</th>
//                                 <th className="p-2">Total</th>
//                                 <th className="p-2">
//                                     Progress
//                                     {hasPendingTasks && (
//                                         <Tooltip title="View Schedule">
//                                             <IconButton 
//                                                 size="small" 
//                                                 onClick={(e) => handleScheduleClick(row, e)}
//                                             >
//                                                 <ArrowOutwardIcon className="text-blue-600" />
//                                             </IconButton>
//                                         </Tooltip>
//                                     )}
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <td className="p-2 fw-bold">Tasks</td>
//                                 <td className="p-2">{row?.CompletedTasks || 0}</td>
//                                 <td className="p-2">{row?.TasksScheduled || 0}</td>
//                                 <td className="p-2 fw-bold">
//                                     <span className={Number(row?.CompletedTasks) === Number(row?.TasksScheduled) ? 
//                                         "text-green-600" : "text-orange-600"}>
//                                         {calcPercentage(row?.TasksScheduled, row?.CompletedTasks)}%
//                                     </span>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td className="p-2 fw-bold">Schedules</td>
//                                 <td className="p-2">{row?.SchedulesCompletedCount || 0}</td>
//                                 <td className="p-2">{row?.SchedulesCount || 0}</td>
//                                 <td className="p-2 fw-bold">
//                                     <span className={Number(row?.SchedulesCompletedCount) === Number(row?.SchedulesCount) ? 
//                                         "text-green-600" : "text-orange-600"}>
//                                         {calcPercentage(row?.SchedulesCount, row?.SchedulesCompletedCount)}%
//                                     </span>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td className="p-2 fw-bold">Task Progress</td>
//                                 <td className="p-2">{row?.TasksProgressCount || 0}</td>
//                                 <td className="p-2">{row?.TasksAssignedToEmployee || 0}</td>
//                                 <td className="p-2 fw-bold">
//                                     <span className={Number(row?.TasksProgressCount) === Number(row?.TasksAssignedToEmployee) ? 
//                                         "text-green-600" : "text-orange-600"}>
//                                         {calcPercentage(row?.TasksAssignedToEmployee, row?.TasksProgressCount)}%
//                                     </span>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Task Details List */}
//                 <div className="mb-4">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h6 className="fw-bold mb-0">Task Details</h6>
//                         <div className="d-flex align-items-center">
//                             {isTasksLoading && (
//                                 <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
//                                     <span className="visually-hidden">Loading...</span>
//                                 </div>
//                             )}
//                             <small className="text-muted">
//                                 {tasks.length} task(s) found
//                             </small>
//                         </div>
//                     </div>
                    
//                     {isTasksLoading ? (
//                         <div className="text-center py-4">
//                             <div className="spinner-border text-primary" role="status">
//                                 <span className="visually-hidden">Loading tasks...</span>
//                             </div>
//                             <p className="mt-2 text-muted">Loading tasks...</p>
//                         </div>
//                     ) : tasks.length > 0 ? (
//                         <div className="table-responsive">
//                             <table className="table table-bordered table-hover">
//                                 <thead className="bg-light">
//                                     <tr>
//                                         <th className="p-2">Task Name</th>
//                                         <th className="p-2">Assigned To</th>
//                                         <th className="p-2">Priority</th>
//                                         <th className="p-2">Status</th>
//                                         <th className="p-2">Start Date</th>
//                                         <th className="p-2">End Date</th>
//                                         <th className="p-2">Progress</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {tasks.map((task, index) => (
//                                         <tr 
//                                             key={task.Task_id || index} 
//                                             className="cursor-pointer"
//                                             onClick={(e) => handleTaskClick(task, e)}
//                                         >
//                                             <td className="p-2 fw-bold">
//                                                 {task.Task_name || `Task ${index + 1}`}
//                                             </td>
//                                             <td className="p-2">
//                                                 {task.AssignedTo || task.Assigned_To || 'Unassigned'}
//                                             </td>
//                                             <td className="p-2">
//                                                 <span className={`badge ${getPriorityBadge(task.Priority)}`}>
//                                                     {task.Priority || 'Medium'}
//                                                 </span>
//                                             </td>
//                                             <td className="p-2">
//                                                 <span className={`badge ${getStatusBadge(task.Status)}`}>
//                                                     {task.Status || 'Not Started'}
//                                                 </span>
//                                             </td>
//                                             <td className="p-2">
//                                                 {formatDate(task.Start_date || task.Start_Date)}
//                                             </td>
//                                             <td className="p-2">
//                                                 {formatDate(task.End_date || task.End_Date)}
//                                             </td>
//                                             <td className="p-2">
//                                                 <div className="d-flex align-items-center">
//                                                     <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
//                                                         <div 
//                                                             className={`progress-bar ${
//                                                                 task.Status?.toLowerCase() === 'completed' ? 'bg-success' : 
//                                                                 task.Status?.toLowerCase() === 'in progress' ? 'bg-warning' : 'bg-info'
//                                                             }`}
//                                                             style={{width: `${task.Progress || 0}%`}}
//                                                         ></div>
//                                                     </div>
//                                                     <small className="fw-bold">
//                                                         {task.Progress || 0}%
//                                                     </small>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     ) : (
//                         <div className="text-center py-4 border rounded">
//                             <p className="text-muted mb-0">No tasks found for this project</p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="mt-3 d-flex gap-2">
//                     <button 
//                         className="btn btn-sm btn-outline-primary"
//                         onClick={() => handleProjectClick(row)}
//                     >
//                         View Project Details
//                     </button>
//                     <button 
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={(e) => handleScheduleClick(row, e)}
//                     >
//                         View Project Schedule
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <FilterableTable
//             title="Active Projects"
//             dataArray={projects}
//             EnableSerialNumber
//             columns={[
//                 {
//                     ColumnHeader: "Project Name",
//                     isVisible: 1,
//                     isCustomCell: true,
//                     Cell: ({ row }) => (
//                         <span 
//                             className="fw-bold text-uppercase cursor-pointer"
//                             onClick={() => handleProjectClick(row)}
//                             style={{ cursor: 'pointer' }}
//                         >
//                             {row.Project_Name}
//                         </span>
//                     ),
//                 },
//                 {
//                     ColumnHeader: "Progress",
//                     isVisible: 1,
//                     isCustomCell: true,
//                     Cell: ({ row }) => (
//                         <div className="d-flex align-items-center">
//                             <BarChart className="text-muted me-2" fontSize="small" />
//                             <span>{calcPercentage(row?.TasksScheduled, row?.CompletedTasks)}%</span>
//                         </div>
//                     ),
//                 },
//                 {
//                     ColumnHeader: "Employee Involved",
//                     isVisible: 1,
//                     isCustomCell: true,
//                     Cell: ({ row }) => (
//                         <div className="d-flex align-items-center">
//                             <Group className="text-muted me-2" fontSize="small" />
//                             <span>{row?.EmployeesInvolved || 0}</span>
//                         </div>
//                     ),
//                 },
//                 {
//                     ColumnHeader: "Duration",
//                     isVisible: 1,
//                     isCustomCell: true,
//                     Cell: ({ row }) => (
//                         <div className="d-flex align-items-center">
//                             <CalendarMonth className="text-muted me-2" fontSize="small" />
//                             <div>
//                                 <div>{formatDate(row?.Est_Start_Dt)} - {formatDate(row?.Est_End_Dt)}</div>
//                                 <small className="text-muted">
//                                     ({getDurationDays(row?.Est_Start_Dt, row?.Est_End_Dt)} DAYS)
//                                 </small>
//                             </div>
//                         </div>
//                     ),
//                 },
//             ]}
//             ButtonArea={
//                 <>
//                     <Tooltip title="Refresh Projects">
//                         <IconButton
//                             size="small"
//                             onClick={() => window.location.reload()}
//                         >
//                             <RefreshIcon />
//                         </IconButton>
//                     </Tooltip>
//                 </>
//             }
//             tableMaxHeight={550}
//             isExpendable={true}
//             expandableComp={(props) => (
//                 <ProjectExpandableComponent {...props} />
//             )}
//         />
//     )
// }

// export default ActiveProjects;























import { useEffect, useState, useContext, useCallback } from "react";
import '../common.css';
import { 
  IconButton, 
  Tooltip, 
  Chip,
  LinearProgress,
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions
} from '@mui/material'
import { 
  ArrowOutward as ArrowOutwardIcon, 
  Refresh as RefreshIcon,
//   Group, 
//   CalendarMonth,
  ExpandMore,
//   Schedule,
  Search,
  Download,
  LibraryAdd,
  ViewHeadlineSharp,
  CheckCircle,
  Pending,
  PlayArrow,
  People,
//   Add
} from '@mui/icons-material'

import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from 'react-toastify';
import EmployeeManagementDialog from "../employeeManagement/employeeManagement";
import ProjectForm from "../ProjectList/addEditProject";

import TaskAssign from '../../Pages/Tasks/taskAssign/addEditTaskAssign';
import SubtaskDialog from './subTask'
const ActiveProjects = ({ onReload }) => {
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData || '{}');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [schedulesData, setSchedulesData] = useState({});
  const [loadingSchedules, setLoadingSchedules] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { contextObj } = useContext(MyContext);
  const [taskData, setTaskData] = useState([]);
  const [scheduleTypes, setScheduleTypes] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedTask, setSelectedTask] = useState(null);
  const entryBy = userData?.UserId;
  const nav = useNavigate();
  const [projectId, setProjectId] = useState('');
      const [reload, setReload] = useState(false);
          const [reloadFlag, setReloadFlag] = useState(false);
              const [selectedProject, setSelectedProject] = useState(null);
	const companyId = userData?.Company_id;
        const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
            const [dialogOpen, setDialogOpen] = useState(false);
                const [listingTaskDialogOpen, setListingTaskDialogOpen] = useState(false);
                    const [projectToDelete, setProjectToDelete] = useState(null);
                       const [deleteDialog, setDeleteDialog] = useState(false);
                       
const [subtaskDialogOpen, setSubtaskDialogOpen] = useState(false);
const [selectedParentTask, setSelectedParentTask] = useState(null);
                           const [taskAssignOpen, setTaskAssignOpen] = useState(false);
  const [taskScheduleInput, setTaskScheduleInput] = useState({
    Sch_Type_Id: '',
    Sch_Type: '',
    Task_Id: '',
    Task_Est_Start_Date: '',
    Task_Est_End_Date: ''
  });

    const [moduleAssign,setModuleAssign]=useState(false)

  const [level2Dialog, setLevel2Dialog] = useState({
  open: false,
  isEdit: false,
  initialData: null,
  scheduleId: '',
  dependencyTasks: []
});

// Replace the Level 2 task assignment button click handler
const handleLevel2TaskAssign = (scheduleId, dependencyTasks, editData = null) => {
  setLevel2Dialog({
    open: true,
    isEdit: !!editData,
    initialData: editData,
    scheduleId: scheduleId,
    dependencyTasks: dependencyTasks
  });
};


  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);


      const handleReloadProjects = () => {
        setReload(prev => !prev);  
        setReloadFlag(prev => !prev); 
    };
    

  const fetchProjects = () => {
    fetchLink({
      address: `taskManagement/project/AbstractNew?Company_id=${parseData?.Company_id}`
    }).then(data => {
      if (data.success) {
        const projectsWithProgress = data.data.map(project => ({
          ...project,
          progress: calculateProjectProgress(project)
        }));
        setProjects(projectsWithProgress);
      }
    }).catch(e => {
      console.error('Error fetching projects:', e);
      toast.error('Failed to load projects');
    });
  }

  const calculateProjectProgress = (project) => {
    const totalTasks = Number(project.TasksScheduled) || 0;
    const completedTasks = Number(project.CompletedTasks) || 0;
    
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  const filterProjects = () => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project => 
      project.Project_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.Project_Code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }

//   const fetchData = useCallback(async () => {
//     try {
//       if (!projectId) return;
      
//       const data = await fetchLink({
//         address: `taskManagement/project/schedule/ListingDetails?Project_Id=${projectId}`
//       });
//       if (data.success) {
//         setTaskData(data.data);
//       } else {
//         console.error('Failed to fetch task details:', data.message);
//         toast.error('Failed to load task details');
//       }
//     } catch (e) {
//       console.error('Error fetching task details:', e);
//       toast.error('Error loading task details');
//     }
//   }, [projectId]);


const handleAddSubtask = (task) => {
  setSelectedParentTask(task);
  setSubtaskDialogOpen(true);
};

const handleSubtaskAdded = () => {
  // Refresh the data when a subtask is added
  fetchProjects();
  if (selectedParentTask?.Project_Id) {
    fetchProjectSchedules(selectedParentTask.Project_Id);
  }
  toast.success('Subtask added successfully!');
};

const handleCloseSubtaskDialog = () => {
  setSubtaskDialogOpen(false);
  setSelectedParentTask(null);
};



  const handleAssignTask = async () => {
    if (!taskScheduleInput.Task_Id || !taskScheduleInput.Sch_Type_Id) {
      toast.error("Please select a task and schedule type before saving.");
      return;
    }

    const requestData = {
      entryBy: entryBy,
      Project_Id: projectId,
      Sch_Type_Id: taskScheduleInput.Sch_Type_Id,
      Sch_Est_Start_Date: taskScheduleInput.Task_Est_Start_Date,
      Sch_Est_End_Date: taskScheduleInput.Task_Est_End_Date,
      tasks: [taskScheduleInput]
    };

    try {
      const response = await fetchLink({
        address: 'taskManagement/project/schedule/createNewTaskWithSchedule',
        method: 'POST',
        bodyData: requestData,
      });

      if (response.success) {
        toast.success(response.message);
        setAssignDialogOpen(false);
        setTaskScheduleInput({
          Sch_Type_Id: '',
          Sch_Type: '',
          Task_Id: '',
          Task_Est_Start_Date: '',
          Task_Est_End_Date: ''
        });
        // fetchDatas();
        onReload?.();
      } else if (response.status === 'warning') {
        toast.warn(response.message || "Task already exists for this project.");
      } else {
        toast.warn(response.message || "Failed to assign task.");
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    }
  };

  const updateTaskDetails = async (task) => {
    const requestData = {
      Sch_Project_Id: task.Sch_Project_Id,
      Sch_Id: task.TaskSchId,
      schtypeid: taskScheduleInput.Sch_Type_Id,
      Task_Id: task.Task_Id
    };

    try {
      const response = await fetchLink({
        address: 'taskManagement/project/schedule/updateScheduleTaskUpdate',
        method: 'PUT',
        bodyData: requestData,
      });

      if (response.success) {
        toast.success(response.message);
        setUpdateDialogOpen(false);
        setIsEdit(false);
        onReload?.();
      } else if (response.status === 'warning') {
        toast.warn(response.message || "Task already exists for this project.");
      } else {
        toast.warn(response.message || "Failed to update task.");
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const fetchProjectSchedules = async (projectId) => {
    setLoadingSchedules(prev => ({
      ...prev,
      [projectId]: true
    }));

    try {
      const data = await fetchLink({
        address: `taskManagement/project/schedule/ListingDetailsAbstract?Project_Id=${projectId}`
      });
      
      if (data.success && data.data) {
        setSchedulesData(prev => ({
          ...prev,
          [projectId]: data.data
        }));
      } else {
        setSchedulesData(prev => ({
          ...prev,
          [projectId]: []
        }));
      }
    } catch (e) {
      console.error('Error fetching schedules:', e);
      setSchedulesData(prev => ({
        ...prev,
        [projectId]: []
      }));
      toast.error('Failed to load project schedules');
    } finally {
      setLoadingSchedules(prev => ({ 
        ...prev, 
        [projectId]: false 
      }));
    }
  }

  const handleRowExpand = async (projectId) => {
    const newExpanded = new Set(expandedRows);
    
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      if (!schedulesData[projectId] && !loadingSchedules[projectId]) {
        await fetchProjectSchedules(projectId);
      }
    }
    setExpandedRows(newExpanded);
  }

  const handleSchTypeChange = (e) => {
    const selectedOption = scheduleTypes.find(option => option.Sch_Type_Id === parseInt(e.target.value));
    if (selectedOption) {
      setTaskScheduleInput({
        ...taskScheduleInput,
        Sch_Type_Id: selectedOption.Sch_Type_Id,
        Sch_Type: selectedOption.Sch_Type,
      });
    }
  };



   const handleCloseDialogs = () => {
        setDialogOpen(false);
        setListingTaskDialogOpen(false);
        setSelectedProject(null);
        setProjectToDelete(null);
        setDeleteDialog(false);
    };

  const handleTaskChange = async (e) => {
    const selectedTaskId = e.target.value;
    setTaskScheduleInput(prev => ({
      ...prev,
      Task_Id: selectedTaskId
    }));

    try {
      const response = await fetchLink({
        address: `taskManagement/tasks/tasklistsid?Task_Id=${selectedTaskId}`
      });
      if (response.success) {
        const taskDetails = response.data;
        setTaskScheduleInput(prev => ({
          ...prev,
          Task_Levl_Id: taskDetails.Task_Levl_Id,
          Task_Name: taskDetails.Task_Name,
          Task_Desc: taskDetails.Task_Desc,
          Task_Group_Id: taskDetails.Task_Group_Id,
          Sch_Type_Id: taskDetails.Sch_Type_Id,
          Task_Sch_Duaration: taskDetails.Task_Sch_Duaration || '',
          Task_Start_Time: taskDetails.Task_Start_Time || new Date().toISOString(),
          Task_End_Time: taskDetails.Task_End_Time || new Date().toISOString(),
          Task_Est_Start_Date: taskDetails.Task_Est_Start_Date || new Date().toISOString(),
          Task_Est_End_Date: taskDetails.Task_Est_End_Date || new Date().toISOString(),
        }));
      } else {
        toast.error("Failed to fetch task details");
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast.error("Error loading task details");
    }
  };

  const calcPercentage = (task, completed) => {
    if (!task || Number(task) === 0) return 0;
    return Math.round((Number(completed) / Number(task)) * 100);
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const timePart = timeString.split('T')[1]?.split('.')[0];
      return timePart || timeString;
    } catch (error) {
      return timeString;
    }
  }

  const getStatusChip = (status) => {
    const statusConfig = {
      1: { label: 'New', color: 'primary', icon: <Pending /> },
      2: { label: 'In Progress', color: 'warning', icon: <PlayArrow /> },
      3: { label: 'Completed', color: 'success', icon: <CheckCircle /> },
      4: { label: 'Canceled', color: 'error', icon: <Pending /> }
    };
    
    const config = statusConfig[Number(status)] || { label: 'Unknown', color: 'default', icon: <Pending /> };
    return (
      <Chip 
        label={config.label} 
        color={config.color} 
        size="small" 
        icon={config.icon}
        variant="outlined"
      />
    );
  }

  const getTaskStatusChip = (status) => {
    let statusId;
    
    if (typeof status === 'number') {
      statusId = status;
    } else if (typeof status === 'string') {
      const statusMap = {
        'completed': 3,
        'in progress': 2,
        'new': 1,
        'not started': 1,
        'canceled': 4,
        'not assigned': 1
      };
      statusId = statusMap[status.toLowerCase()] || 1;
    } else {
      statusId = 1;
    }
    
    const statusConfig = {
      1: { label: 'New', color: 'primary', icon: <Pending /> },
      2: { label: 'In Progress', color: 'warning', icon: <PlayArrow /> },
      3: { label: 'Completed', color: 'success', icon: <CheckCircle /> },
      4: { label: 'Canceled', color: 'error', icon: <Pending /> }
    };
    
    const config = statusConfig[Number(statusId)] || statusConfig[1];
    return (
      <Chip 
        label={config.label} 
        color={config.color} 
        size="small" 
        icon={config.icon}
      />
    );
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'primary';
  }

  const handleProjectClick = (project) => {
    console.log('Project clicked:', project);
  }

  const getDurationDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end - start;
      const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
      return Math.max(1, Math.ceil(dayDiff));
    } catch (error) {
      return 0;
    }
  }

  const handleRefresh = () => {
    fetchProjects();
    setSchedulesData({});
    setExpandedRows(new Set());
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAssignButtonClick = (projectId) => {
  
    setProjectId(projectId);
    setModuleAssign(true)
    // setAssignDialogOpen(true);
  };



const fetchScheduleTypes = useCallback(async () => {
    try {
        const data = await fetchLink({ 
            address: `taskManagement/project/schedule/newscheduleType` 
        });
        if (data.success) {
          
            setScheduleTypes(data.data);
        } else {
            toast.error(data.message || "Failed to load schedule types");
        }
    } catch (error) {
        console.error("Error fetching schedule types:", error);
        toast.error("Error loading schedule types");
    }
}, []);

const fetchTasks = useCallback(async () => {
    try {
        setTaskData([])
        // const data = await fetchLink({ 
        //     address: `taskManagement/tasks/dropdown?Company_id=${companyId}` 
        // });
        // if (data.success) {
        //     setTasks(data.data);
        // } else {
        //     toast.error(data.message || "Failed to load tasks");
        // }
    } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Error loading tasks");
    }
}, [companyId]);

const fetchTaskData = useCallback(async () => {
    if (!projectId) return;

    try {
        const data = await fetchLink({
            address: `taskManagement/project/schedule/ListingDetails?Project_Id=${projectId}`
        });
        if (data.success) {
            setTaskData(data.data);
        } else {
            console.error('Failed to fetch task details:', data.message);
            toast.error('Failed to load task details');
        }
    } catch (error) {
        console.error('Error fetching task details:', error);
        toast.error('Error loading task details');
    }
}, [projectId]);


const fetchAllData = useCallback(async () => {
    try {
        await Promise.all([
            fetchScheduleTypes(),
            fetchTasks(),
            fetchTaskData()
        ]);
    } catch (error) {
        console.error("Error fetching all data:", error);
    }
}, [fetchScheduleTypes, fetchTasks, fetchTaskData]);

useEffect(() => {
    if (projectId) {
        fetchAllData();
    }
}, [projectId, fetchAllData]);


useEffect(() => {
    fetchScheduleTypes();
    fetchTasks();
}, [fetchScheduleTypes, fetchTasks]);



	// const handleSelectedTask = async (task) => {
    
	// 	setSelectedTask(task);
	// 	setTaskAssignOpen(true);
	// }

    const handleSelectedTask = async (task) => {
    // Make sure you're setting the projectId from the task
    // This depends on your task object structure
    if (task.Project_Id) {
        setProjectId(task.Project_Id);
    } else if (task.Sch_Project_Id) {
        setProjectId(task.Sch_Project_Id);
    }
    setSelectedTask(task);
    setTaskAssignOpen(true);
}


useEffect(() => {
    if (onReload) {
        fetchAllData();
    }
}, [onReload, fetchAllData]);

  const ScheduleTableView = ({ schedule }) => {
    if (!schedule.SchTypes) {
      return (
        <Typography variant="body2" color="textSecondary">
          No schedule data available
        </Typography>
      );
    }



    try {
      const scheduleTypes = schedule.SchTypes;
      let totalScheduleTasks = 0;
      let completedScheduleTasks = 0;
      
      const allTasks = [];
      scheduleTypes.forEach(schType => {
        if (Array.isArray(schType.TaskTypeGroups)) {
          schType.TaskTypeGroups.forEach(taskTypeGroup => {
            if (Array.isArray(taskTypeGroup.Tasks)) {
              taskTypeGroup.Tasks.forEach(task => {
                totalScheduleTasks++;
                
                const assignedEmployees = task.AssignedEmployees || [];
                const totalAssigned = assignedEmployees.length;
                
                const completionDetails = taskTypeGroup?.CompletedTaskDetails?.filter(
                  completedTask => 
                    completedTask.Task_Id === task.Task_Id && 
                    completedTask.Task_Levl_Id === task.Task_Levl_Id
                ) || [];

                const completedEmployees = completionDetails.length;
                const employeeProgress = totalAssigned > 0 ? Math.round((completedEmployees / totalAssigned) * 100) : 0;
                
                if (employeeProgress === 100) {
                  completedScheduleTasks++;
                }
                
                allTasks.push({
                  ...task,
                  Schedule_Type: schType.SchType,
                  Task_Group: taskTypeGroup.Task_Type,
                  Individual_Progress: employeeProgress,
                  Actual_Status: employeeProgress === 100 ? 3 : (employeeProgress > 0 ? 2 : 1),
                  TaskTypeGroup: taskTypeGroup,
                  assignedEmployees,
                  completedEmployees,
                  totalAssigned
                });
              });
            }
          });
        }
      });

      const scheduleProgress = totalScheduleTasks > 0 ? Math.round((completedScheduleTasks / totalScheduleTasks) * 100) : 0;

      return (
        <div>
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom>
              {/* Schedule Progress: {scheduleProgress}% */}
            </Typography>
            {/* <LinearProgress 
              variant="determinate" 
              value={scheduleProgress} 
              color={getProgressColor(scheduleProgress)}
              sx={{ height: 10, borderRadius: 5 }}
            /> */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Total Tasks: {totalScheduleTasks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed: {completedScheduleTasks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending: {totalScheduleTasks - completedScheduleTasks}
              </Typography>
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2C3E50' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Task Group</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Task Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Task Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Progress</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Employees</TableCell>
                  {/* <TableCell sx={{ color:'white',  fontWeight: 'bold', fontSize: '12px' }}>SubTask</TableCell> */}
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Start Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>End Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTasks.length > 0 ? (
                  allTasks.map((task, index) => {
                    const getOverallTaskStatus = () => {
                      if (task.totalAssigned === 0) return 'Not Assigned';
                      if (task.Individual_Progress === 0) return 'Not Started';
                      if (task.Individual_Progress === 100) return 'Completed';
                      return 'In Progress';
                    };

                    const overallStatus = getOverallTaskStatus();

                    return (
                      <TableRow 
                        key={task.A_Id || index} 
                        sx={{ 
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                          '&:hover': {
                            backgroundColor: '#e3f2fd'
                          }
                        }}
                      >
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Box>
                            <Typography variant="body2" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {task.Task_Group || 'N/A'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={task.Individual_Progress} 
                                color={getProgressColor(task.Individual_Progress)}
                                sx={{ 
                                  height: 4, 
                                  width: 60, 
                                  borderRadius: 2,
                                  mr: 1
                                }}
                              />
                              <Typography variant="caption" style={{ fontSize: '0.7rem' }}>
                                {task.completedEmployees}/{task.totalAssigned} ({task.Individual_Progress}%)
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                            {task.Schedule_Type || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Box>
                            <Typography variant="body2" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {task.Task_Name || 'N/A'}
                            </Typography>
                            {task.Task_Desc && (
                              <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>
                                {task.Task_Desc}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={task.Individual_Progress} 
                              size={30}
                              color={getProgressColor(task.Individual_Progress)}
                            />
                            <Box sx={{ ml: 1 }}>
                              <Typography variant="caption" display="block" style={{ fontSize: '0.7rem' }}>
                                {task.completedEmployees}/{task.totalAssigned} ({task.Individual_Progress}%)
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block" style={{ fontSize: '0.6rem' }}>
                                {overallStatus}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px' }}>
                          {getTaskStatusChip(overallStatus)}
                        </TableCell>
 <TableCell sx={{ fontSize: '11px' }}>
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>

    <Box sx={{ flex: 1 }}>
      {task.assignedEmployees.length > 0 ? (
        <Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" display="flex" style={{ fontSize: '0.6rem' }}>
         
                  <Tooltip title={task.assignedEmployees.length > 0 ? "Assign More Employees" : "Assign Employees"}>
      <IconButton 
        size="small" 
        onClick={() => handleSelectedTask(task)}
        sx={{ 
          padding: '4px',
          backgroundColor: task.assignedEmployees.length > 0 ? '#e3f2fd' : '#f5f5f5',
          '&:hover': {
            backgroundColor: task.assignedEmployees.length > 0 ? '#bbdefb' : '#e8e8e8'
          },
          minWidth: '24px',
          minHeight: '24px'
        }}
      >
        <LibraryAdd fontSize="small" />
      </IconButton>
    </Tooltip>
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, maxWidth: 180 }}>
            {task.assignedEmployees.map((employee, empIndex) => {
              const isCompleted = task.TaskTypeGroup?.CompletedTaskDetails?.some(
                detail => detail.Emp_Id === employee.Id
              );
              
              return (
                <Chip
                  key={empIndex}
                  label={employee.Name}
                  variant={isCompleted ? "filled" : "outlined"}
                  color={isCompleted ? "success" : "default"}
                  size="small"
                  sx={{ 
                    fontSize: '0.55rem',
                    height: '18px',
                    mb: 0.3
                  }}
                />
              );
            })}
          </Box>
        </Box>
      ) : (
        <>
            <Tooltip title={task.assignedEmployees.length > 0 ? "Assign More Employees" : "Assign Employees"}>
      <IconButton 
        size="small" 
        onClick={() => handleSelectedTask(task)}
        sx={{ 
          padding: '4px',
          backgroundColor: task.assignedEmployees.length > 0 ? '#e3f2fd' : '#f5f5f5',
          '&:hover': {
            backgroundColor: task.assignedEmployees.length > 0 ? '#bbdefb' : '#e8e8e8'
          },
          minWidth: '24px',
          minHeight: '24px'
        }}
      >
        <LibraryAdd fontSize="small" />
      </IconButton>
    </Tooltip>
        <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>
          No Employees Assigned
        </Typography>
        </>
      )}
    </Box>


  </Box>
</TableCell>
{/* <TableCell sx={{ fontSize: '11px' }}> */}
  {/* <Box sx={{ display: 'flex', gap: 0.5 }}> */}
    {/* Add Subtask Button */}
    {/* <Tooltip title="Add Subtask"> */}
      {/* <IconButton  */}
        {/* // size="small"  */}
        {/* // onClick={() => handleAddSubtask(task)} */}
        {/* sx={{  */}
          {/* padding: '4px', */}
          {/* color: 'primary.main', */}
          {/* '&:hover': { */}
            {/* // backgroundColor: 'primary.light', */}
            {/* color: 'white' */}
          {/* } */}
        {/* }} */}
      {/* > */}
        {/* <Add fontSize="small" /> */}
      {/* </IconButton> */}
    {/* </Tooltip> */}
  {/* </Box> */}
{/* </TableCell> */}
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                            {formatDate(task.Task_Est_Start_Date)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                            {formatDate(task.Task_Est_End_Date)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px' }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* <Tooltip title="Assign Task">
                              <IconButton 
                                size="small" 
                                // onClick={() => handleAssignButtonClick(task.Project_Id)}
                                sx={{ padding: '4px' }}
                              >
                                <LibraryAdd fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                            {/* <TableCell>
                                                                                                                    {Array.isArray(taskItem.AssignedEmployees) && taskItem.AssignedEmployees.length > 0 ? (
                                                                                                                        taskItem.AssignedEmployees.map((employee, empIndex) => (
                                                                                                                            <Chip
                                                                                                                                key={empIndex}
                                                                                                                                label={employee.Name}
                                                                                                                                variant="outlined"
                                                                                                                                size="small"
                                                                                                                                sx={{ margin: '2px', color: 'green' }}
                                                                                                                            />
                                                                                                                        ))
                                                                                                                    ) : (
                                                                                                                        <span>No Employees Assigned</span>
                                                                                                                    )}
                                                                                                                </TableCell> */}
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => console.log('View task details:', task)}
                                sx={{ padding: '4px' }}
                              >
                                <ViewHeadlineSharp fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        No tasks found for this schedule
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      );
    } catch (error) {
      console.error('Error parsing schedule data:', error);
      return (
        <Typography variant="body2" color="error">
          Error loading schedule data
        </Typography>
      );
    }
  };
  const handleOpenEmployeeDialog = projectId => {

        setProjectId(projectId);
        setEmployeeDialogOpen(true);
    };


        const handleOpenCreateDialog = () => {
        setSelectedProject(null);
        setIsEdit(false);
        setDialogOpen(true);
    };



  const ProjectExpansionPanel = ({ row }) => {
    const isExpanded = expandedRows.has(row.Project_Id);
    const schedules = schedulesData[row.Project_Id] || [];
    const isLoading = loadingSchedules[row.Project_Id];

    return (
      <TableRow>
        <TableCell colSpan={6} style={{ padding: 0 }}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <div className="p-3 border-top bg-light" style={{ backgroundColor: '#f8f9fa' }}>
              {isLoading ? (
                <div className="text-center py-4">
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="textSecondary" className="mt-2">
                    Loading tasks...
                  </Typography>
                </div>
              ) : schedules.length > 0 ? (
                <div className="space-y-4">
                  {schedules.map((schedule, index) => (
                    <Card key={schedule.Sch_Id || index} variant="outlined">
                      <CardContent>
                        <ScheduleTableView schedule={schedule} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Typography variant="body2" color="textSecondary">
                    No schedules found for this project
                  </Typography>
                </div>
              )}
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    );
  };

  const taskOptions = tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }));
  const paginatedProjects = filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card className="rounded-3 bg-white overflow-hidden m-3">
      <CardContent className="p-0">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <Typography variant="h5" className="fw-bold text-muted m-0">
            Active Projects
          </Typography>
          <div className="d-flex align-items-center gap-2">
              {Number(contextObj?.Add_Rights) === 1 && (
                        <button onClick={handleOpenCreateDialog} className="btn btn-primary fa-13 shadow">
                            Create Project
                        </button>
                    )}
            <TextField
              size="small"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Tooltip title="Export to PDF">
              <IconButton size="small">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Projects">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell width="25%" sx={{ fontSize: '13px', backgroundColor: '#EDF0F7', fontWeight: 'bold' }} className="border-end border-top">
                  Project Details
                </TableCell>
                <TableCell width="20%" sx={{ fontSize: '13px', backgroundColor: '#EDF0F7', fontWeight: 'bold' }} className="border-end border-top">
                  Progress
                </TableCell>
                <TableCell width="15%" sx={{ fontSize: '13px', backgroundColor: '#EDF0F7', fontWeight: 'bold' }} className="border-end border-top">
                  Team
                </TableCell>
                <TableCell width="20%" sx={{ fontSize: '13px', backgroundColor: '#EDF0F7', fontWeight: 'bold' }} className="border-end border-top">
                  Timeline
                </TableCell>
                <TableCell width="15%" sx={{ fontSize: '13px', backgroundColor: '#EDF0F7', fontWeight: 'bold' }} className="border-end border-top">
                  Status
                </TableCell>
                {/* <TableCell width="15%" sx={{ fontSize: '13px', backgroundColor: '#EDF0F7', fontWeight: 'bold' }} className="border-end border-top">
                  Action
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProjects.map((row, index) => (
                <>
                  <TableRow 
                    key={row.Project_Id} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell sx={{ fontSize: '12px' }} className="border-end">
                      <div className="d-flex align-items-center">
                        <IconButton 
                          size="small" 
                          className="me-2"
                          onClick={() => handleRowExpand(row.Project_Id)}
                          sx={{ 
                            transform: expandedRows.has(row.Project_Id) ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                          }}
                        >
                          <ExpandMore fontSize="small" />
                        </IconButton>
                        <div>
                          <Typography 
                            variant="subtitle1" 
                            className="fw-bold"
                            onClick={() => handleProjectClick(row)}
                            style={{ 
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              lineHeight: '1.2'
                            }}
                          >
                            {row.Project_Name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ fontSize: '0.8rem' }}>
                            {row.Project_Code || 'No Code'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                              Progress: {row.progress}%
                            </Typography>
                          </Box>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px' }} className="border-end">
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={row.progress} 
                            color={getProgressColor(row.progress)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="textSecondary" style={{ fontSize: '0.8rem' }}>
                            {row.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px' }} className="border-end">
                      {/* <div className="d-flex align-items-center">
                        <Group className="text-muted me-2" fontSize="small" />
                        <Typography variant="body2" style={{ fontSize: '0.8rem' }}>
                          {row?.EmployeesInvolved || 0} members
                        </Typography>
                      </div> */}

                       {Number(contextObj?.Add_Rights) === 1 && (
                                              <IconButton onClick={() => handleOpenEmployeeDialog(row.Project_Id)}>
                                                  <People />
                                              </IconButton>
                                          )}
                                          {row.EmployeesInvolved}
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px' }} className="border-end">
                      <div>
                        <Typography variant="body2" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                          Start: {formatDate(row?.Est_Start_Dt)}
                        </Typography>
                        <Typography variant="body2" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                          End: {formatDate(row?.Est_End_Dt)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>
                          {getDurationDays(row?.Est_Start_Dt, row?.Est_End_Dt)} days
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px' }} className="border-end">
                      {getStatusChip(row.Project_Status)}
                    </TableCell>
                    {/* <TableCell  */}
                      {/* sx={{ fontSize: '12px' }}  */}
                      {/* className="border-end" */}
                    {/* > */}
                      {/* <Tooltip title="Add Task">
                        <IconButton 
                          size="small" 
                          onClick={() => handleAssignButtonClick(row.Project_Id)}
                          sx={{ padding: '4px' }}
                        >
                          <LibraryAdd fontSize="small" />
                        </IconButton>
                      </Tooltip> */}
                    {/* </TableCell> */}
                  </TableRow>
                  <ProjectExpansionPanel row={row} />
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredProjects.length === 0 && (
          <div className="text-center py-5">
            <Typography variant="h6" color="textSecondary">
              {searchTerm ? 'No projects match your search' : 'No projects found'}
            </Typography>
          </div>
        )}
     <ProjectForm
                open={dialogOpen}
                onClose={handleCloseDialogs}
                inputValue={selectedProject}
                isEdit={isEdit}
                setReload={handleReloadProjects}
                projectData={projectId}
            />
        <Dialog open={assignDialogOpen} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: '8px' } }} onClose={() => setAssignDialogOpen(false)}>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogContent>
            <div style={{ padding: '1px', display: 'flex', marginTop: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <label htmlFor="task-select" style={{ marginRight: '8px', minWidth: '80px' }}>Select Task</label>
                <select
                  id="task-select"
                  value={taskScheduleInput.Task_Id || ''}
                  className="cus-inpt"
                  required
                  onChange={handleTaskChange}
                  style={{ flex: 1, marginRight: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="" disabled>- select -</option>
                  {taskOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* <IconButton onClick={() => setIsDialogOpen(true)}> */}
                  {/* <Button variant="contained" color="primary">Create New</Button> */}
                {/* </IconButton> */}
              </div>
            </div>
            <div style={{ padding: '1px', display: 'flex', marginTop: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '8px', minWidth: '80px' }}>Sch_Type</label>
                <select
                  value={taskScheduleInput.Sch_Type_Id || ''}
                  onChange={handleSchTypeChange}
                  className="cus-inpt"
                  required
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="" disabled>- Sch_Type -</option>
                  {scheduleTypes.map((option, index) => (
                    <option key={index} value={option.Sch_Type_Id}>
                      {option.Sch_Type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAssignTask}>Save</Button>
          </DialogActions>
        </Dialog>

        {updateDialogOpen && (
          <Dialog
            open={updateDialogOpen}
            fullWidth
            maxWidth="sm"
            PaperProps={{ style: { borderRadius: '8px' } }}
            onClose={() => setUpdateDialogOpen(false)}
          >
            <DialogTitle>{isEdit ? "Edit Task" : "Assign Task"}</DialogTitle>
            <DialogContent>
              <div style={{ padding: '1px', display: 'flex', marginTop: '16px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <label style={{ marginRight: '8px', minWidth: '80px' }}>Sch_Type</label>
                  <select
                    value={taskScheduleInput.Sch_Type_Id || ''}
                    onChange={handleSchTypeChange}
                    className="cus-inpt"
                    required
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="" disabled>- Sch_Type -</option>
                    {scheduleTypes.map((option, index) => (
                      <option key={index} value={option.Sch_Type_Id}>
                        {option.Sch_Type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => updateTaskDetails(taskScheduleInput)}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        )}


         {
            projectId && (
                 <EmployeeManagementDialog
                open={employeeDialogOpen}
                onClose={() => setEmployeeDialogOpen(false)}
                projectId={projectId}
                onReload={handleReloadProjects}
            />
            )
         }   
  
    {
        projectId && (
                        <TaskAssign
                            open={taskAssignOpen}
                            onClose={() => setTaskAssignOpen(false)}
                            task={selectedTask}
                            projectId={projectId}
                            entryBy={entryBy}
                            taskId={selectedTask}
                            reload={reload}
                            onReload={onReload}
                        />
        )
    }


    
<SubtaskDialog
  open={subtaskDialogOpen}
  onClose={handleCloseSubtaskDialog}
  parentTask={selectedParentTask}
  projectId={projectId}
  onSubtaskAdded={handleSubtaskAdded}
/>

        {filteredProjects.length > 0 && (
          <div className="p-2 pb-0">
            <TablePagination
              component="div"
              count={filteredProjects.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20, 50]}
              labelRowsPerPage="Rows per page"
              showFirstButton
              showLastButton
            />
          </div>
        )}
      </CardContent>
    </Card>

    
  )
}

export default ActiveProjects;