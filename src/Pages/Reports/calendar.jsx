// import React, { useEffect, useState } from "react";
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
// import "react-toastify/dist/ReactToastify.css";
// import FullCalendar from '@fullcalendar/react'
// import dayGridPlugin from '@fullcalendar/daygrid'
// import timeGridPlugin from '@fullcalendar/timegrid'
// import interactionPlugin from '@fullcalendar/interaction'
// import listPlugin from '@fullcalendar/list';
// import Select from 'react-select';
// import { customSelectStyles } from "../../Components/tablecolumn";
// import { fetchLink } from '../../Components/fetchComponent'

// const ReportCalendar = () => {
//     const localData = localStorage.getItem("user");
//     const parseData = JSON.parse(localData);
//     const initialValueFilter = {
//         Emp_Id: '',
//         Project_Id: 0,
//         Task_Id: 0,
//         Process_Id: 0,
//         from: new Date().toISOString().split('T')[0],
//         to: new Date().toISOString().split('T')[0],
//         EmpGet: 'All Employee',
//         ProjectGet: 'All Project',
//         TaskGet: 'All Task',
//         ProcessGet: 'All Process'
//     }
//     const [workedDetais, setWorkedDetais] = useState([]);
//     const [groupedProcessData, setGroupedProcessData] = useState([]);
//     const [processDetails, setProcessDetails] = useState([]);
//     const [selectedTask, setSelectedTask] = useState({});
//     const [selectedProcessDay, setSelectedProcessDay] = useState({});
//     const [selectedEmployee, setSelectedEmployee] = useState('');
//     const [dialog, setDialog] = useState(false);
//     const [processDayDialog, setProcessDayDialog] = useState(false);
//     const [filters, setFileters] = useState(initialValueFilter);
//     const [projects, setProjects] = useState([]);
//     const [usersDropDown, setUsersDropdown] = useState([]);
//     const [tasks, setTasks] = useState([]);
//     const [viewMode, setViewMode] = useState('task'); 

//     useEffect(() => {
//         let address = `taskManagement/task/work?Emp_Id=${filters.Emp_Id}&Project_Id=${filters.Project_Id}&from=${filters.from}&to=${filters.to}&Task_Id=${filters.Task_Id}`;
        
//         if (viewMode === 'process') {
//             address += `&Process_Id=${filters.Process_Id}`;
//         }
        
//         fetchLink({
//             address: address
//         }).then(data => {
//             if (data.success) {
//                 setWorkedDetais(data.data);
                
             
//                 if (viewMode === 'process') {
//                     const grouped = groupProcessDataByDate(data.data);
//                     setGroupedProcessData(grouped);
//                 }
//             }
//         }).catch(e => console.error(e))    
//     }, [filters, viewMode])


//     const groupProcessDataByDate = (data) => {
//         const grouped = {};
        
//         data.forEach(item => {
//             const date = new Date(item.Work_Dt).toISOString().split('T')[0];
            
//             if (!grouped[date]) {
//                 grouped[date] = {
//                     date: date,
//                     processes: [],
//                     totalMinutes: 0,
//                     totalTasks: 0,
//                     employees: new Set(),
//                     employeeDetails: {},
//                     processCount: {}
//                 };
//             }
            
         
//             if (item.Process_Name) {
//                 if (!grouped[date].processCount[item.Process_Name]) {
//                     grouped[date].processCount[item.Process_Name] = 0;
//                 }
//                 grouped[date].processCount[item.Process_Name]++;
//             }
            
     
//             grouped[date].processes.push(item);
            
        
//             grouped[date].totalMinutes += parseInt(item.Tot_Minutes) || 0;
//             grouped[date].totalTasks++;
            
          
//             if (item.EmployeeName && item.Emp_Id) {
//                 grouped[date].employees.add(item.EmployeeName);
                
//                 const empId = item.Emp_Id.toString();
                
//                 if (!grouped[date].employeeDetails[empId]) {
//                     grouped[date].employeeDetails[empId] = {
//                         id: empId,
//                         name: item.EmployeeName,
//                         tasks: [],
//                         totalMinutes: 0
//                     };
//                 }
//                 grouped[date].employeeDetails[empId].tasks.push(item);
//                 grouped[date].employeeDetails[empId].totalMinutes += parseInt(item.Tot_Minutes) || 0;
//             }
//         });
        
 
//         return Object.values(grouped).map(day => ({
//             ...day,
//             employeeCount: day.employees.size,
//             topProcesses: Object.entries(day.processCount)
//                 .sort((a, b) => b[1] - a[1])
//                 .slice(0, 3)
//                 .map(([name, count]) => `${name} (${count})`)
//                 .join(', '),
//             employeesList: Object.values(day.employeeDetails)
//         }));
//     }

//     useEffect(() => {
//         fetchLink({
//             address: `taskManagement/project/dropDown?Company_id=${parseData?.Company_id}`
//         }).then(data => {
//             if (data.success) {
//                 setProjects(data.data)
//             }
//         }).catch(e => console.error(e))
        
//         fetchLink({
//             address: `masters/users/employee/dropDown?BranchId=${parseData?.BranchId}&Company_id=${parseData?.Company_id}`
//         }).then(data => {
//             if (data.success) {
//                 setUsersDropdown(data?.data?.sort((a, b) => String(a?.Name).localeCompare(b?.Name)))
//             }
//         }).catch(e => console.error(e))
        
//         fetchLink({
//             address: `taskManagement/task/assignEmployee/task/dropDown`
//         }).then(data => {
//             if (data.success) {
//                 setTasks(data?.data?.sort((a, b) => String(a?.Task_Name).localeCompare(b?.Task_Name)))
//             }
//         }).catch(e => console.error(e))
        
//         fetchLink({
//             address: `taskManagement/processMaster/dropDown`
//         }).then(data => {
//             if (data.success) {
//                 setProcessDetails(data.data)
//             }
//         }).catch(e => console.error(e))            
//     }, [parseData?.BranchId])

//     const formatTime24 = (time24) => {
//         const [hours, minutes] = time24.split(':').map(Number);

//         let hours12 = hours % 12;
//         hours12 = hours12 || 12;
//         const period = hours < 12 ? 'AM' : 'PM';
//         const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
//         const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
//         const time12 = `${formattedHours}:${formattedMinutes} ${period}`;

//         return time12;
//     }

//     const getEventTitle = (item) => {
//         if (viewMode === 'task') {
//             return item?.Task_Name;
//         } else {
//             const dayData = groupedProcessData.find(d => d.date === new Date(item.Work_Dt).toISOString().split('T')[0]);
//             if (dayData) {
//                 return `${dayData.totalTasks} tasks | ${dayData.totalMinutes}m | ${dayData.employeeCount} emp`;
//             }
//             return item?.Process_Name || 'No Process';
//         }
//     }

//     const getCalendarTitle = () => {
//         return viewMode === 'task' ? 'Completed Tasks' : 'Process Timeline (Cumulative)';
//     }

//     const handleDateClick = (info) => {
//         if (viewMode === 'process') {
//             const clickedDate = info.dateStr;
//             const dayData = groupedProcessData.find(d => d.date === clickedDate);
            
//             if (dayData) {
//                 setSelectedProcessDay(dayData);
//                 setSelectedEmployee('');
//                 setProcessDayDialog(true);
//             }
//         }
//     }

//     const getEventBackgroundColor = (item) => {
//         if (viewMode === 'task') {
//             return '#3788d8';
//         } else {
//             const dayData = groupedProcessData.find(d => d.date === new Date(item.Work_Dt).toISOString().split('T')[0]);
//             if (dayData) {
//                 if (dayData.totalMinutes > 480) return '#28a745';
//                 if (dayData.totalMinutes > 240) return '#ffc107';
//                 return '#dc3545';
//             }
//             return '#28a745';
//         }
//     }

   
//     const getFilteredTasks = () => {
//         if (!selectedProcessDay || !selectedProcessDay.processes) {
//             return [];
//         }
        
//         if (!selectedEmployee) {
//             return selectedProcessDay.processes;
//         }
        
//         return selectedProcessDay.processes.filter(task => {
//             return task.Emp_Id && task.Emp_Id.toString() === selectedEmployee.toString();
//         });
//     }

//     function formatMinutesToHours(totalMinutes) {
//   const hours = Math.floor(totalMinutes / 60);
//   const minutes = totalMinutes % 60;
//   if (hours > 0) {
//     return `${hours}h ${minutes}m`;
//   }
//   return `${minutes}m`;
// }
// const totalMinutes = getFilteredTasks().reduce(
//   (total, task) => total + (parseInt(task.Tot_Minutes) || 0),
//   0
// );

//     return (
//         <>
//             <div className="row mb-3">
//                 <div className="col-12 d-flex justify-content-center">
//                     <div className="toggle-container bg-light rounded-pill p-1 d-flex">
//                         <button
//                             className={`btn rounded-pill px-4 ${viewMode === 'task' ? 'btn-primary' : 'btn-light'}`}
//                             onClick={() => setViewMode('task')}
//                         >
//                             Task View
//                         </button>
//                         <button
//                             className={`btn rounded-pill px-4 ${viewMode === 'process' ? 'btn-primary' : 'btn-light'}`}
//                             onClick={() => setViewMode('process')}
//                         >
//                             Process View
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="row">
//                 <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
//                     <Select
//                         value={{ value: filters?.Emp_Id, label: filters?.EmpGet }}
//                         onChange={(e) => setFileters({ ...filters, Emp_Id: e.value, EmpGet: e.label })}
//                         options={[{ value: '', label: 'All Employee' }, ...usersDropDown.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
//                         styles={customSelectStyles}
//                         isSearchable={true}
//                         placeholder={"Employee Name"} />
//                 </div>
//                 <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
//                     <Select
//                         value={{ value: filters?.Project_Id, label: filters?.ProjectGet }}
//                         onChange={(e) => setFileters({ ...filters, Project_Id: e.value, ProjectGet: e.label })}
//                         options={[...projects.map(obj => ({ value: obj.Project_Id, label: Number(obj.Project_Id) === 0 ? 'All Project' : obj.Project_Name }))]}
//                         styles={customSelectStyles}
//                         isSearchable={true}
//                         placeholder={"Project Title"} />
//                 </div>
                
//                 {viewMode === 'task' && (
//                     <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
//                         <Select
//                             value={{ value: filters?.Task_Id, label: filters?.TaskGet }}
//                             onChange={(e) => setFileters({ ...filters, Task_Id: e.value, TaskGet: e.label })}
//                             options={[{ value: 0, label: 'All Task' }, ...tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))]}
//                             styles={customSelectStyles}
//                             isSearchable={true}
//                             placeholder={"Select Task"} />
//                     </div>
//                 )}
                
//                 {viewMode === 'process' && (
//                     <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
//                         <Select
//                             value={{ value: filters?.Process_Id, label: filters?.ProcessGet }}
//                             onChange={(e) => setFileters({ ...filters, Process_Id: e.value, ProcessGet: e.label })}
//                             options={[{ value: 0, label: 'All Process' }, ...processDetails.map(obj => ({ value: obj.Id, label: obj.Process_Name }))]}
//                             styles={customSelectStyles}
//                             isSearchable={true}
//                             placeholder={"Select Process"} />
//                     </div>
//                 )}
//             </div>

//             <div className="px-3 py-2 calendar" >
//                 <h4 className="mb-3 text-center text-primary">{getCalendarTitle()}</h4>

//                 <FullCalendar
//                     plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
//                     initialView="dayGridMonth"
//                     initialDate={new Date()}
//                     events={
//                         viewMode === 'task' 
//                             ? workedDetais.map(o => ({
//                                 title: getEventTitle(o),
//                                 start: new Date(o?.Work_Dt).toISOString().split('T')[0] + 'T' + o?.Start_Time,
//                                 end: new Date(o?.Work_Dt).toISOString().split('T')[0] + 'T' + o?.End_Time,
//                                 objectData: o,
//                                 backgroundColor: getEventBackgroundColor(o),
//                                 borderColor: getEventBackgroundColor(o)
//                             }))
//                             : groupedProcessData.map(day => ({
//                                 title: getEventTitle({ Work_Dt: day.date }),
//                                 start: day.date,
//                                 allDay: true,
//                                 objectData: day,
//                                 backgroundColor: getEventBackgroundColor({ Work_Dt: day.date }),
//                                 borderColor: getEventBackgroundColor({ Work_Dt: day.date })
//                             }))
//                     }
//                     headerToolbar={{
//                         left: 'prev next',
//                         center: 'title',
//                         right: 'timeGridDay, timeGridWeek, dayGridMonth, listMonth',
//                     }}
//                     slotDuration={'00:20:00'}
//                     slotMinTime={'08:00:00'}
//                     slotMaxTime={'22:00:00'}
//                     showNonCurrentDates={false}
//                     editable={false}
//                     selectMirror
//                     eventClick={eve => {
//                         if (viewMode === 'task') {
//                             const eveObj = eve.event.extendedProps.objectData;
//                             setSelectedTask(eveObj);
//                             setDialog(true);
//                         } else {
//                             const dayData = eve.event.extendedProps.objectData;
//                             setSelectedProcessDay(dayData);
//                             setSelectedEmployee('');
//                             setProcessDayDialog(true);
//                         }
//                     }}
//                     dateClick={handleDateClick}
//                     datesSet={date => {
//                         setFileters(pre => ({ ...pre, from: date.startStr.split('T')[0], to: date.endStr.split('T')[0] }))
//                     }}
//                     height={1200}
//                 />
//             </div>

        
//             <Dialog
//                 open={dialog} maxWidth="sm" fullWidth
//                 onClose={() => { setDialog(false); setSelectedTask({}) }}>
//                 <DialogTitle className="fa-18">
//                     Task Details
//                 </DialogTitle>
//                 <DialogContent className="pb-0">
//                     <div className="table-responsive pb-0">
//                         <table className="table mb-0">
//                             <tbody>
//                                 <tr>
//                                     <td className="border-1 fa-14">EmpName</td>
//                                     <td className="border-1 fa-14">{selectedTask?.EmployeeName}</td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Task</td>
//                                     <td className="border-1 fa-14">{selectedTask?.Task_Name}</td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">ProcessName</td>
//                                     <td className="border-1 fa-14">{selectedTask?.Process_Name}</td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Date</td>
//                                     <td className="border-1 fa-14">
//                                         {selectedTask?.Work_Dt && new Date(selectedTask?.Work_Dt).toLocaleDateString('en-IN', {
//                                             day: '2-digit', month: '2-digit', year: 'numeric'
//                                         })}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Start Time</td>
//                                     <td className="border-1 fa-14">
//                                         {selectedTask?.Start_Time && formatTime24(selectedTask?.Start_Time)}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">End Time</td>
//                                     <td className="border-1 fa-14">
//                                         {selectedTask?.End_Time && formatTime24(selectedTask?.End_Time)}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Duration</td>
//                                     <td className="border-1 fa-14">
//                                         {selectedTask?.Tot_Minutes} ( Minutes )
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Description</td>
//                                     <td className="border-1 fa-14">
//                                         {selectedTask?.Work_Done}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Status</td>
//                                     <td className="border-1 fa-14">
//                                         {selectedTask?.WorkStatus}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border-1 fa-14">Project</td>
//                                     <td className="border-1 fa-14">{selectedTask?.Project_Name}</td>
//                                 </tr>
//                                 {selectedTask?.Work_Param?.length > 0 && (
//                                     <tr>
//                                         <td colSpan={2} className="border-1 fa-14 text-center text-uppercase">Parameter Values</td>
//                                     </tr>
//                                 )}
//                                 {selectedTask?.Work_Param?.map((o, i) => (
//                                     <tr key={i}>
//                                         <td className="border-1 fa-14">{o?.Paramet_Name}</td>
//                                         <td className="border-1 fa-14">{o?.Current_Value}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => { setDialog(false); setSelectedTask({}) }}>close</Button>
//                 </DialogActions>
//             </Dialog>

          
//             <Dialog
//                 open={processDayDialog} maxWidth="lg" fullWidth
//                 onClose={() => { setProcessDayDialog(false); setSelectedProcessDay({}); setSelectedEmployee(''); }}>
//                 <DialogTitle className="fa-18">
//                     Process Summary - {selectedProcessDay?.date && new Date(selectedProcessDay.date).toLocaleDateString('en-IN', {
//                         day: '2-digit', month: '2-digit', year: 'numeric'
//                     })}
//                 </DialogTitle>
//                 <DialogContent className="pb-0">
//                     {/* Employee Selection Dropdown */}
//                     <div className="row mb-3">
//                         <div className="col-md-6">
//                             <label className="form-label fw-bold">Select Employee:</label>
//                             <Select
//                                 value={selectedEmployee ? 
//                                     { 
//                                         value: selectedEmployee, 
//                                         label: selectedProcessDay.employeeDetails?.[selectedEmployee]?.name || 'Unknown Employee'
//                                     } 
//                                     : { value: '', label: 'All Employees' }
//                                 }
//                                 onChange={(e) => setSelectedEmployee(e.value)}
//                                 options={[
//                                     { value: '', label: 'All Employees' },
//                                     ...(selectedProcessDay.employeesList?.map(emp => ({
//                                         value: emp.id,
//                                         label: `${emp.name} (${emp.tasks?.length || 0} tasks, ${emp.totalMinutes || 0} mins)`
//                                     })) || [])
//                                 ]}
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 placeholder="Select Employee"
//                             />
//                         </div>
//                         <div className="col-md-6 d-flex align-items-end">
//                             <div className="text-muted fa-14">
//                                 {selectedEmployee ? 
//                                     `Showing tasks for ${selectedProcessDay.employeeDetails?.[selectedEmployee]?.name || 'Unknown'}` 
//                                     : `Showing all ${selectedProcessDay.totalTasks || 0} tasks from ${selectedProcessDay.employeeCount || 0} employees`
//                                 }
//                             </div>
//                         </div>
//                     </div>

                  
//                     <div className="row mb-3">
//                         <div className="col-md-3">
//                             <div className="card bg-light">
//                                 <div className="card-body text-center p-2">
//                                     <h6 className="card-title mb-1">Total Tasks</h6>
//                                     <p className="card-text h4 text-primary mb-0">{getFilteredTasks().length}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="col-md-3">
//                             <div className="card bg-light">
//                                 <div className="card-body text-center p-2">
//                                     <h6 className="card-title mb-1">Total Duration</h6>
//                                     <p className="card-text h4 text-success mb-0">
//                                         {/* {getFilteredTasks().reduce((total, task) => total + (parseInt(task.Tot_Minutes) || 0), 0)}m */}
//                                          {formatMinutesToHours(totalMinutes)}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="col-md-3">
//                             <div className="card bg-light">
//                                 <div className="card-body text-center p-2">
//                                     <h6 className="card-title mb-1">Processes</h6>
//                                     <p className="card-text h4 text-info mb-0">
//                                         {[...new Set(getFilteredTasks().map(task => task.Process_Name))].length}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="col-md-3">
//                             <div className="card bg-light">
//                                 <div className="card-body text-center p-2">
//                                     <h6 className="card-title mb-1">Projects</h6>
//                                     <p className="card-text h4 text-warning mb-0">
//                                         {[...new Set(getFilteredTasks().map(task => task.Project_Name))].length}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

               
//                     <div className="table-responsive pb-0">
//                         <table className="table table-bordered mb-0">
//                             <thead className="bg-light">
//                                 <tr>
//                                     <th className="fa-14">#</th>
//                                     <th className="fa-14">Employee</th>
//                                     <th className="fa-14">Task</th>
//                                     <th className="fa-14">Process</th>
//                                     <th className="fa-14">Time</th>
//                                     <th className="fa-14">Duration</th>
//                                     <th className="fa-14">Description</th>
//                                     <th className="fa-14">Project</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {getFilteredTasks().length === 0 ? (
//                                     <tr>
//                                         <td colSpan="8" className="text-center fa-14 py-3">
//                                             No tasks found for the selected criteria
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     getFilteredTasks().map((task, index) => (
//                                         <tr key={index}>
//                                             <td className="fa-13">{index + 1}</td>
//                                             <td className="fa-13">{task.EmployeeName}</td>
//                                             <td className="fa-13">{task.Task_Name}</td>
//                                             <td className="fa-13">{task.Process_Name}</td>
//                                             <td className="fa-13">
//                                                 {task.Start_Time && formatTime24(task.Start_Time)} - {task.End_Time && formatTime24(task.End_Time)}
//                                             </td>
//                                             <td className="fa-13">{task.Tot_Minutes} mins</td>
//                                             <td className="fa-13">{task.Work_Done}</td>
//                                             <td className="fa-13">{task.Project_Name}</td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => { setProcessDayDialog(false); setSelectedProcessDay({}); setSelectedEmployee(''); }}>
//                         close
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// }

// export default ReportCalendar;
















import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import "react-toastify/dist/ReactToastify.css";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { fetchLink } from '../../Components/fetchComponent'

const ReportCalendar = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialValueFilter = {
        Emp_Id: '',
        Project_Id: 0,
        Task_Id: 0,
        Process_Id: 0,
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        EmpGet: 'All Employee',
        ProjectGet: 'All Project',
        TaskGet: 'All Task',
        ProcessGet: 'All Process'
    }
    const [workedDetais, setWorkedDetais] = useState([]);
    const [groupedProcessData, setGroupedProcessData] = useState([]);
    const [processDetails, setProcessDetails] = useState([]);
    const [selectedTask, setSelectedTask] = useState({});
    const [selectedProcessDay, setSelectedProcessDay] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [dialog, setDialog] = useState(false);
    const [processDayDialog, setProcessDayDialog] = useState(false);
    const [filters, setFileters] = useState(initialValueFilter);
    const [projects, setProjects] = useState([]);
    const [usersDropDown, setUsersDropdown] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [viewMode, setViewMode] = useState('task'); 
    const [taskAssigned, setTaskAssigned] = useState([]);

    const safeDateParse = (dateString, fallback = new Date()) => {
        if (!dateString) return fallback;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? fallback : date;
        } catch (error) {
            return fallback;
        }
    };

    const safeDateToISOString = (date) => {
        try {
            const validDate = safeDateParse(date);
            return validDate.toISOString().split('T')[0];
        } catch (error) {
            return new Date().toISOString().split('T')[0];
        }
    };

    const getDatesInRange = (startDate, endDate) => {
        const dates = [];
        const start = safeDateParse(startDate);
        const end = safeDateParse(endDate);
        
        if (isNaN(end.getTime())) {
            return [safeDateToISOString(start)];
        }
        
        const currentDate = new Date(start);
        
        while (currentDate <= end) {
            dates.push(safeDateToISOString(new Date(currentDate)));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    };

    const normalizeAssignedTask = (task) => {
        const startDate = task.Est_Start_Dt || task.Task_Assign_dt;
        const endDate = task.Est_End_Dt || task.Est_Start_Dt || task.Task_Assign_dt;
        
      
        const dateRange = getDatesInRange(startDate, endDate);
       
        const workingDays = dateRange.filter(date => {
            const dayOfWeek = new Date(date).getDay();
            return dayOfWeek !== 0;
        });

        const events = workingDays.map(date => ({
            ...task,
            workType: 'assigned',
            Work_Dt: date, 
            Task_Name: task.Task_Name,
            EmployeeName: task.EmployeeName,
            Emp_Id: task.Emp_Id || task.Assigned_Emp_Id,
            Process_Name: task.Process_Name || 'Not Specified',
            Project_Name: task.Project_Name,
            Start_Time: task.Sch_Time || '08:00:00',
            End_Time: task.EN_Time || '17:00:00',
            Tot_Minutes: task.Tot_Minutes || 60, 
            Work_Done: task.Task_Desc || 'Assigned Task',
            WorkStatus: 'Assigned',
         
            AN_No: task.AN_No,
            Sch_Period: task.Sch_Period,
            Est_Start_Dt: task.Est_Start_Dt,
            Est_End_Dt: task.Est_End_Dt,
          
            isDateRangeEvent: true,
            originalStartDate: task.Est_Start_Dt,
            originalEndDate: task.Est_End_Dt
        }));

        return events;
    };

    const normalizeCompletedWork = (work) => {
        return {
            ...work,
            workType: 'completed',
            Work_Dt: work.Work_Dt,
            Task_Name: work.Task_Name,
            EmployeeName: work.EmployeeName,
            Emp_Id: work.Emp_Id,
            Process_Name: work.Process_Name,
            Project_Name: work.Project_Name,
            Start_Time: work.Start_Time,
            End_Time: work.End_Time,
            Tot_Minutes: work.Tot_Minutes,
            Work_Done: work.Work_Done,
            WorkStatus: work.WorkStatus,
            Work_Param: work.Work_Param || [],
            isDateRangeEvent: false
        };
    };

    useEffect(() => {
        let address = `taskManagement/task/work?Emp_Id=${filters.Emp_Id}&Project_Id=${filters.Project_Id}&from=${filters.from}&to=${filters.to}&Task_Id=${filters.Task_Id}`;
        
        if (viewMode === 'process') {
            address += `&Process_Id=${filters.Process_Id}`;
        }
        
        fetchLink({
            address: address
        }).then(data => {
            if (data.success) {
                console.log('Completed work raw data:', data.data);
                const completedWork = data.data.map(item => normalizeCompletedWork(item));
                setWorkedDetais(completedWork);
            }
        }).catch(e => console.error(e))    
    }, [filters, viewMode])

    useEffect(() => {
        let address = `taskManagement/tasks/assignedTask?Emp_Id=${filters.Emp_Id}&startDate=${filters.from}&endDate=${filters.to}`;
   
        if (viewMode === 'process') {
            address += `&Process_Id=${filters.Process_Id}`;
        }
        
        fetchLink({
            address: address
        }).then(data => {
            if (data.success) {
                console.log('Assigned tasks raw data:', data.data);
                const assignedWork = data.data.flatMap(item => normalizeAssignedTask(item));
              
                setTaskAssigned(assignedWork);
            }
        }).catch(e => console.error(e))    
    }, [filters, viewMode])

    useEffect(() => {
        if (workedDetais.length > 0 || taskAssigned.length > 0) {
            const combinedData = [...workedDetais, ...taskAssigned];
            console.log('Combined data for grouping:', combinedData);
            const grouped = groupProcessDataByDate(combinedData);
            setGroupedProcessData(grouped);
        }
    }, [workedDetais, taskAssigned])

    const groupProcessDataByDate = (data) => {
        const grouped = {};
        
        data.forEach(item => {
            const date = safeDateToISOString(item.Work_Dt);
            
            if (!grouped[date]) {
                grouped[date] = {
                    date: date,
                    processes: [],
                    totalMinutes: 0,
                    totalTasks: 0,
                    employees: new Set(),
                    employeeDetails: {},
                    processCount: {},
                    assignedTasks: 0,
                    completedTasks: 0,
                    assignedMinutes: 0,
                    completedMinutes: 0
                };
            }
            

            if (item.Process_Name) {
                if (!grouped[date].processCount[item.Process_Name]) {
                    grouped[date].processCount[item.Process_Name] = 0;
                }
                grouped[date].processCount[item.Process_Name]++;
            }
            

            grouped[date].processes.push(item);
            
 
            if (item.workType === 'completed') {
                grouped[date].completedTasks++;
                grouped[date].completedMinutes += parseInt(item.Tot_Minutes) || 0;
                grouped[date].totalMinutes += parseInt(item.Tot_Minutes) || 0;
            } else {
                grouped[date].assignedTasks++;

                const assignedMinutes = parseInt(item.Tot_Minutes) || 60;
                grouped[date].assignedMinutes += assignedMinutes;
                grouped[date].totalMinutes += assignedMinutes;
            }
            
            grouped[date].totalTasks++;
            
            // Employee details
            if (item.EmployeeName && item.Emp_Id) {
                grouped[date].employees.add(item.EmployeeName);
                
                const empId = item.Emp_Id.toString();
                
                if (!grouped[date].employeeDetails[empId]) {
                    grouped[date].employeeDetails[empId] = {
                        id: empId,
                        name: item.EmployeeName,
                        tasks: [],
                        totalMinutes: 0,
                        assignedTasks: 0,
                        completedTasks: 0
                    };
                }
                grouped[date].employeeDetails[empId].tasks.push(item);
                
                if (item.workType === 'completed') {
                    grouped[date].employeeDetails[empId].totalMinutes += parseInt(item.Tot_Minutes) || 0;
                    grouped[date].employeeDetails[empId].completedTasks++;
                } else {
                    grouped[date].employeeDetails[empId].assignedTasks++;
                    grouped[date].employeeDetails[empId].totalMinutes += parseInt(item.Tot_Minutes) || 60;
                }
            }
        });
        
        return Object.values(grouped).map(day => ({
            ...day,
            employeeCount: day.employees.size,
            topProcesses: Object.entries(day.processCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, count]) => `${name} (${count})`)
                .join(', '),
            employeesList: Object.values(day.employeeDetails)
        }));
    }

    // NEW: Create parallel events for assigned and completed tasks
    const getParallelEvents = () => {
        const parallelEvents = [];
        
        // Group by date first
        const dateGroups = {};
        
        // Add completed work
        workedDetais.forEach(item => {
            const date = safeDateToISOString(item.Work_Dt);
            if (!dateGroups[date]) {
                dateGroups[date] = {
                    date: date,
                    assigned: [],
                    completed: []
                };
            }
            dateGroups[date].completed.push(item);
        });
        
        // Add assigned work
        taskAssigned.forEach(item => {
            const date = safeDateToISOString(item.Work_Dt);
            if (!dateGroups[date]) {
                dateGroups[date] = {
                    date: date,
                    assigned: [],
                    completed: []
                };
            }
            dateGroups[date].assigned.push(item);
        });
        
    
        Object.values(dateGroups).forEach(dateGroup => {
            const { date, assigned, completed } = dateGroup;
            
      
            if (assigned.length > 0) {
                const totalAssignedMinutes = assigned.reduce((sum, task) => sum + (parseInt(task.Tot_Minutes) || 60), 0);
                parallelEvents.push({
                    // title: `📋 Assigned: ${assigned.length} tasks | ${formatMinutesToHours(totalAssignedMinutes)}`,
                    start: date,
                    allDay: true,
                    display: 'background',
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    textColor: 'white',
                    extendedProps: {
                        type: 'assigned-summary',
                        date: date,
                        tasks: assigned,
                        count: assigned.length,
                        totalMinutes: totalAssignedMinutes
                    },
                    classNames: ['assigned-column']
                });
            }
            
    
            if (completed.length > 0) {
                const totalCompletedMinutes = completed.reduce((sum, task) => sum + (parseInt(task.Tot_Minutes) || 0), 0);
                parallelEvents.push({
                    // title: `✅ Completed: ${completed.length} tasks | ${formatMinutesToHours(totalCompletedMinutes)}`,
                    start: date,
                    allDay: true,
                    display: 'background',
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    textColor: 'white',
                    extendedProps: {
                        type: 'completed-summary',
                        date: date,
                        tasks: completed,
                        count: completed.length,
                        totalMinutes: totalCompletedMinutes
                    },
                    classNames: ['completed-column']
                });
            }
            
       
            assigned.forEach(task => {
                const workDate = safeDateToISOString(task.Work_Dt);
                const startTime = safeTimeFormat(task.Start_Time, '08:00:00');
                const endTime = safeTimeFormat(task.End_Time, '17:00:00');
                
                parallelEvents.push({
                    title: `📋 ${task.Task_Name}`,
                    start: `${workDate}T${startTime}`,
                    end: `${workDate}T${endTime}`,
                    objectData: task,
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    textColor: 'white',
                    extendedProps: {
                        objectData: task,
                        isDateRangeEvent: task.isDateRangeEvent,
                        type: 'assigned-detail'
                    }
                });
            });
            
            completed.forEach(task => {
                const workDate = safeDateToISOString(task.Work_Dt);
                const startTime = safeTimeFormat(task.Start_Time, '08:00:00');
                const endTime = safeTimeFormat(task.End_Time, '17:00:00');
                
                parallelEvents.push({
                    title: `✅ ${task.Task_Name}`,
                    start: `${workDate}T${startTime}`,
                    end: `${workDate}T${endTime}`,
                    objectData: task,
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    textColor: 'white',
                    extendedProps: {
                        objectData: task,
                        isDateRangeEvent: task.isDateRangeEvent,
                        type: 'completed-detail'
                    }
                });
            });
        });
        
        return parallelEvents;
    }

    const getEventTitle = (item) => {
        if (viewMode === 'task') {
            const workType = item.workType === 'assigned' ? '[Assigned]' : '[Completed]';
            const rangeIndicator = item.workType === 'assigned' && item.isDateRangeEvent ? ' 📅' : '';
            return `${workType} ${item?.Task_Name || 'Task'}${rangeIndicator}`;
        } else {
            const dayData = groupedProcessData.find(d => d.date === safeDateToISOString(item.Work_Dt));
            if (dayData) {
                return `${dayData.assignedTasks}A/${dayData.completedTasks}C | ${dayData.totalMinutes}m`;
            }
            return item?.Process_Name || 'No Process';
        }
    }

    const getEventBackgroundColor = (item) => {
        if (item.workType === 'assigned') {
            return '#28a745'; // Green
        } else {
            return '#dc3545'; // Red
        }
    }

    const safeTimeFormat = (timeString, defaultTime = '08:00:00') => {
        if (!timeString || typeof timeString !== 'string') return defaultTime;
        
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
            const hours = timeParts[0].padStart(2, '0');
            const minutes = timeParts[1].padStart(2, '0');
            return `${hours}:${minutes}:00`;
        }
        return defaultTime;
    };

    const getCalendarEvents = () => {
        if (viewMode === 'task') {
         
            return getParallelEvents();
        } else {
            return groupedProcessData.map(day => {
                const validDate = safeDateToISOString(day.date);
                return {
                    title: `${day.assignedTasks}A/${day.completedTasks}C | ${day.totalMinutes}m | ${day.employeeCount} emp`,
                    start: validDate,
                    allDay: true,
                    objectData: day,
                    backgroundColor: day.assignedTasks > day.completedTasks ? '#28a745' : '#dc3545',
                    borderColor: day.assignedTasks > day.completedTasks ? '#28a745' : '#dc3545'
                };
            });
        }
    }

    const formatTime24 = (time24) => {
        if (!time24) return 'N/A';
        try {
            const timeParts = time24.split(':');
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            
            if (isNaN(hours) || isNaN(minutes)) return 'N/A';
            
            let hours12 = hours % 12;
            hours12 = hours12 || 12;
            const period = hours < 12 ? 'AM' : 'PM';
            const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            return `${formattedHours}:${formattedMinutes} ${period}`;
        } catch (error) {
            return 'N/A';
        }
    }

    const getCalendarTitle = () => {
        return viewMode === 'task' ? 'Task Calendar - Parallel View (Green: Assigned, Red: Completed)' : 'Process Timeline (Green: More Assigned, Red: More Completed)';
    }

    const handleDateClick = (info) => {
        if (viewMode === 'process') {
            const clickedDate = info.dateStr;
            const dayData = groupedProcessData.find(d => d.date === clickedDate);
            
            if (dayData) {
                setSelectedProcessDay(dayData);
                setSelectedEmployee('');
                setProcessDayDialog(true);
            }
        }
    }

    const handleEventClick = (info) => {
        if (viewMode === 'task') {
            const event = info.event;
            const extendedProps = event.extendedProps;
            
            if (extendedProps.type === 'assigned-summary' || extendedProps.type === 'completed-summary') {
                
                const date = extendedProps.date;
                const allTasks = [...workedDetais, ...taskAssigned].filter(task => 
                    safeDateToISOString(task.Work_Dt) === date
                );
                
                const dayData = {
                    date: date,
                    processes: allTasks,
                    assignedTasks: extendedProps.type === 'assigned-summary' ? extendedProps.tasks : [],
                    completedTasks: extendedProps.type === 'completed-summary' ? extendedProps.tasks : [],
                    totalTasks: allTasks.length,
                    employeeCount: new Set(allTasks.map(t => t.Emp_Id)).size
                };
                
                setSelectedProcessDay(dayData);
                setSelectedEmployee('');
                setProcessDayDialog(true);
            } else {
               
                const eveObj = extendedProps.objectData;
                setSelectedTask(eveObj);
                setDialog(true);
            }
        } else {
            const dayData = info.event.extendedProps.objectData;
            setSelectedProcessDay(dayData);
            setSelectedEmployee('');
            setProcessDayDialog(true);
        }
    }

    const getFilteredTasks = () => {
        if (!selectedProcessDay || !selectedProcessDay.processes) {
            return [];
        }
        
        if (!selectedEmployee) {
            return selectedProcessDay.processes;
        }
        
        return selectedProcessDay.processes.filter(task => {
            return task.Emp_Id && task.Emp_Id.toString() === selectedEmployee.toString();
        });
    }

    function formatMinutesToHours(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    
    useEffect(() => {
        fetchLink({
            address: `taskManagement/project/dropDown?Company_id=${parseData?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProjects(data.data)
            }
        }).catch(e => console.error(e))
        
        fetchLink({
            address: `masters/users/employee/dropDown?BranchId=${parseData?.BranchId}&Company_id=${parseData?.Company_id}`
        }).then(data => {
            if (data.success) {
                setUsersDropdown(data?.data?.sort((a, b) => String(a?.Name).localeCompare(b?.Name)))
            }
        }).catch(e => console.error(e))
        
        fetchLink({
            address: `taskManagement/task/assignEmployee/task/dropDown`
        }).then(data => {
            if (data.success) {
                setTasks(data?.data?.sort((a, b) => String(a?.Task_Name).localeCompare(b?.Task_Name)))
            }
        }).catch(e => console.error(e))
        
        fetchLink({
            address: `taskManagement/processMaster/dropDown`
        }).then(data => {
            if (data.success) {
                setProcessDetails(data.data)
            }
        }).catch(e => console.error(e))            
    }, [parseData?.BranchId, parseData?.Company_id])

    const totalMinutes = getFilteredTasks().reduce(
        (total, task) => total + (parseInt(task.Tot_Minutes) || (task.workType === 'assigned' ? 60 : 0)),
        0
    );

    return (
        <>
            <div className="row mb-3">
                <div className="col-12 d-flex justify-content-center">
                    <div className="toggle-container bg-light rounded-pill p-1 d-flex">
                        <button
                            className={`btn rounded-pill px-4 ${viewMode === 'task' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => setViewMode('task')}
                        >
                            Task View
                        </button>
                        <button
                            className={`btn rounded-pill px-4 ${viewMode === 'process' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => setViewMode('process')}
                        >
                            Process View
                        </button>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                    <Select
                        value={{ value: filters?.Emp_Id, label: filters?.EmpGet }}
                        onChange={(e) => setFileters({ ...filters, Emp_Id: e.value, EmpGet: e.label })}
                        options={[{ value: '', label: 'All Employee' }, ...usersDropDown.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Employee Name"} />
                </div>
                <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                    <Select
                        value={{ value: filters?.Project_Id, label: filters?.ProjectGet }}
                        onChange={(e) => setFileters({ ...filters, Project_Id: e.value, ProjectGet: e.label })}
                        options={[...projects.map(obj => ({ value: obj.Project_Id, label: Number(obj.Project_Id) === 0 ? 'All Project' : obj.Project_Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Project Title"} />
                </div>
                
                {viewMode === 'task' && (
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                        <Select
                            value={{ value: filters?.Task_Id, label: filters?.TaskGet }}
                            onChange={(e) => setFileters({ ...filters, Task_Id: e.value, TaskGet: e.label })}
                            options={[{ value: 0, label: 'All Task' }, ...tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            placeholder={"Select Task"} />
                    </div>
                )}
                
                {viewMode === 'process' && (
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                        <Select
                            value={{ value: filters?.Process_Id, label: filters?.ProcessGet }}
                            onChange={(e) => setFileters({ ...filters, Process_Id: e.value, ProcessGet: e.label })}
                            options={[{ value: 0, label: 'All Process' }, ...processDetails.map(obj => ({ value: obj.Id, label: obj.Process_Name }))]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            placeholder={"Select Process"} />
                    </div>
                )}
            </div>

            <div className="px-3 py-2 calendar" >
                <h4 className="mb-3 text-center text-primary">{getCalendarTitle()}</h4>

                <FullCalendar
                    plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    initialDate={new Date()}
                    events={getCalendarEvents()}
                    headerToolbar={{
                        left: 'prev next',
                        center: 'title',
                        right: 'timeGridDay, timeGridWeek, dayGridMonth, listMonth',
                    }}
                    slotDuration={'00:20:00'}
                    slotMinTime={'08:00:00'}
                    slotMaxTime={'22:00:00'}
                    showNonCurrentDates={false}
                    editable={false}
                    selectMirror
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    datesSet={date => {
                        setFileters(pre => ({ ...pre, from: date.startStr.split('T')[0], to: date.endStr.split('T')[0] }))
                    }}
                    height={1200}
                    eventDisplay="block"
                    eventOrder="start,-duration,allDay"
                />
            </div>

   
            <Dialog
                open={dialog} maxWidth="sm" fullWidth
                onClose={() => { setDialog(false); setSelectedTask({}) }}>
                <DialogTitle className="fa-18">
                    Task Details - {selectedTask?.workType === 'assigned' ? 'Assigned Task' : 'Completed Work'}
                    {selectedTask?.isDateRangeEvent && ' (Date Range)'}
                </DialogTitle>
                <DialogContent className="pb-0">
                    <div className="table-responsive pb-0">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className="border-1 fa-14">Work Type</td>
                                    <td className="border-1 fa-14">
                                        <span className={`badge ${selectedTask?.workType === 'assigned' ? 'bg-success' : 'bg-danger'}`}>
                                            {selectedTask?.workType === 'assigned' ? 'Assigned' : 'Completed'}
                                            {selectedTask?.isDateRangeEvent && ' (Date Range)'}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Employee Name</td>
                                    <td className="border-1 fa-14">{selectedTask?.EmployeeName}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Task</td>
                                    <td className="border-1 fa-14">{selectedTask?.Task_Name}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Process Name</td>
                                    <td className="border-1 fa-14">{selectedTask?.Process_Name}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Project</td>
                                    <td className="border-1 fa-14">{selectedTask?.Project_Name}</td>
                                </tr>
                                
                                {selectedTask?.workType === 'assigned' ? (
                                    <>
                                        <tr>
                                            <td className="border-1 fa-14">Display Date</td>
                                            <td className="border-1 fa-14">
                                                {selectedTask?.Work_Dt && new Date(selectedTask?.Work_Dt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                                {selectedTask?.isDateRangeEvent && ' (Part of Date Range)'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-1 fa-14">Date Range</td>
                                            <td className="border-1 fa-14">
                                                {selectedTask?.originalStartDate && new Date(selectedTask?.originalStartDate).toLocaleDateString('en-IN')} 
                                                {' to '}
                                                {selectedTask?.originalEndDate && new Date(selectedTask?.originalEndDate).toLocaleDateString('en-IN')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-1 fa-14">Scheduled Time</td>
                                            <td className="border-1 fa-14">
                                                {selectedTask?.Sch_Time && formatTime24(selectedTask?.Sch_Time)} - {selectedTask?.EN_Time && formatTime24(selectedTask?.EN_Time)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-1 fa-14">Task Description</td>
                                            <td className="border-1 fa-14">{selectedTask?.Task_Desc || 'N/A'}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <>
                                        <tr>
                                            <td className="border-1 fa-14">Date</td>
                                            <td className="border-1 fa-14">
                                                {selectedTask?.Work_Dt && new Date(selectedTask?.Work_Dt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-1 fa-14">Start Time</td>
                                            <td className="border-1 fa-14">
                                                {selectedTask?.Start_Time && formatTime24(selectedTask?.Start_Time)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-1 fa-14">End Time</td>
                                            <td className="border-1 fa-14">
                                                {selectedTask?.End_Time && formatTime24(selectedTask?.End_Time)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-1 fa-14">Work Done</td>
                                            <td className="border-1 fa-14">{selectedTask?.Work_Done || 'N/A'}</td>
                                        </tr>
                                    </>
                                )}
                                
                                <tr>
                                    <td className="border-1 fa-14">Duration</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Tot_Minutes || (selectedTask?.workType === 'assigned' ? '60 (Estimated)' : '0')} Minutes
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Status</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.WorkStatus || (selectedTask?.workType === 'assigned' ? 'Assigned' : 'Completed')}
                                    </td>
                                </tr>

                            
                                {selectedTask?.workType === 'assigned' && selectedTask?.AN_No && (
                                    <tr>
                                        <td className="border-1 fa-14">AN Number</td>
                                        <td className="border-1 fa-14">{selectedTask?.AN_No}</td>
                                    </tr>
                                )}

                            
                                {selectedTask?.workType === 'completed' && selectedTask?.Work_Param?.length > 0 && (
                                    <>
                                        <tr>
                                            <td colSpan={2} className="border-1 fa-14 text-center text-uppercase fw-bold">Work Parameters</td>
                                        </tr>
                                        {selectedTask?.Work_Param?.map((o, i) => (
                                            <tr key={i}>
                                                <td className="border-1 fa-14">{o?.Paramet_Name}</td>
                                                <td className="border-1 fa-14">{o?.Current_Value}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialog(false); setSelectedTask({}) }}>close</Button>
                </DialogActions>
            </Dialog>

           
            <Dialog
                open={processDayDialog} maxWidth="lg" fullWidth
                onClose={() => { setProcessDayDialog(false); setSelectedProcessDay({}); setSelectedEmployee(''); }}>
                <DialogTitle className="fa-18">
                    Daily Summary - {selectedProcessDay?.date && new Date(selectedProcessDay.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                </DialogTitle>
                <DialogContent className="pb-0">
        
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Select Employee:</label>
                            <Select
                                value={selectedEmployee ? 
                                    { 
                                        value: selectedEmployee, 
                                        label: selectedProcessDay.employeeDetails?.[selectedEmployee]?.name || 'Unknown Employee'
                                    } 
                                    : { value: '', label: 'All Employees' }
                                }
                                onChange={(e) => setSelectedEmployee(e.value)}
                                options={[
                                    { value: '', label: 'All Employees' },
                                    ...(selectedProcessDay.employeesList?.map(emp => ({
                                        value: emp.id,
                                        label: `${emp.name} (${emp.assignedTasks || 0}A/${emp.completedTasks || 0}C)`
                                    })) || [])
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Select Employee"
                            />
                        </div>
                        {/* <div className="col-md-6 d-flex align-items-end">
                            <div className="text-muted fa-14">
                                {selectedEmployee ? 
                                    `Showing tasks for ${selectedProcessDay.employeeDetails?.[selectedEmployee]?.name || 'Unknown'}` 
                                    : `Showing all ${selectedProcessDay.totalTasks || 0} tasks (${selectedProcessDay.assignedTasks || 0}A/${selectedProcessDay.completedTasks || 0}C) from ${selectedProcessDay.employeeCount || 0} employees`
                                }
                            </div>
                        </div> */}
                    </div>

            
                    {/* <div className="row mb-3">
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center p-2">
                                    <h6 className="card-title mb-1">Total Tasks</h6>
                                    <p className="card-text h4 text-primary mb-0">{getFilteredTasks().length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center p-2">
                                    <h6 className="card-title mb-1">Assigned Tasks</h6>
                                    <p className="card-text h4 text-success mb-0">
                                        {getFilteredTasks().filter(task => task.workType === 'assigned').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center p-2">
                                    <h6 className="card-title mb-1">Completed Tasks</h6>
                                    <p className="card-text h4 text-danger mb-0">
                                        {getFilteredTasks().filter(task => task.workType === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center p-2">
                                    <h6 className="card-title mb-1">Total Duration</h6>
                                    <p className="card-text h4 text-info mb-0">
                                        {formatMinutesToHours(totalMinutes)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div> */}
<div className="row mb-3">
    <div className="col-md-4">
        <div className="card bg-light">
            <div className="card-body text-center p-2">
                <h6 className="card-title mb-1">Total Tasks</h6>
                <p className="card-text h4 text-primary mb-0">{getFilteredTasks().length}</p>
            </div>
        </div>
    </div>
    <div className="col-md-4">
        <div className="card bg-light">
            <div className="card-body text-center p-2">
                <h6 className="card-title mb-1">Assigned Tasks</h6>
                <p className="card-text h4 text-success mb-0">
                    {getFilteredTasks().filter(task => task.workType === 'assigned').length}
                </p>
            </div>
        </div>
    </div>
    <div className="col-md-4">
        <div className="card bg-light">
            <div className="card-body text-center p-2">
                <h6 className="card-title mb-1">Completed Tasks</h6>
                <p className="card-text h4 text-danger mb-0">
                    {getFilteredTasks().filter(task => task.workType === 'completed').length}
                </p>
            </div>
        </div>
    </div>
    {/* <div className="col-md-3">
        <div className="card bg-light">
            <div className="card-body text-center p-2">
                <h6 className="card-title mb-1">Total Duration</h6>
                <p className="card-text h4 text-info mb-0">
                    {formatMinutesToHours(totalMinutes)}
                </p>
            </div>
        </div>
    </div> */}
</div>


<div className="row mb-3">
    <div className="col-md-6">
        <div className="card bg-success bg-opacity-10">
            <div className="card-body text-center p-2">
                <h6 className="card-title mb-1 text-success">Assigned Duration</h6>
                <p className="card-text h4 text-success mb-0">
                    {formatMinutesToHours(
                        getFilteredTasks()
                            .filter(task => task.workType === 'assigned')
                            .reduce((total, task) => total + (parseInt(task.Tot_Minutes) || 60), 0)
                    )}
                </p>
                <small className="text-muted">
                    {getFilteredTasks().filter(task => task.workType === 'assigned').length} tasks
                </small>
            </div>
        </div>
    </div>
    <div className="col-md-6">
        <div className="card bg-danger bg-opacity-10">
            <div className="card-body text-center p-2">
                <h6 className="card-title mb-1 text-danger">Completed Duration</h6>
                <p className="card-text h4 text-danger mb-0">
                    {formatMinutesToHours(
                        getFilteredTasks()
                            .filter(task => task.workType === 'completed')
                            .reduce((total, task) => total + (parseInt(task.Tot_Minutes) || 0), 0)
                    )}
                </p>
                <small className="text-muted">
                    {getFilteredTasks().filter(task => task.workType === 'completed').length} tasks
                </small>
            </div>
        </div>
    </div>
</div>
         
                    <div className="table-responsive pb-0">
                        <table className="table table-bordered mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="fa-14">#</th>
                                    <th className="fa-14">Type</th>
                                    <th className="fa-14">Employee</th>
                                    <th className="fa-14">Task</th>
                                    <th className="fa-14">Process</th>
                                    <th className="fa-14">Project</th>
                                    <th className="fa-14">Time</th>
                                    <th className="fa-14">Duration</th>
                                    <th className="fa-14">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredTasks().length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center fa-14 py-3">
                                            No tasks found for the selected criteria
                                        </td>
                                    </tr>
                                ) : (
                                    getFilteredTasks().map((task, index) => (
                                        <tr key={index}>
                                            <td className="fa-13">{index + 1}</td>
                                            <td className="fa-13">
                                                <span className={`badge ${task.workType === 'assigned' ? 'bg-success' : 'bg-danger'}`}>
                                                    {task.workType === 'assigned' ? 'Assigned' : 'Completed'}
                                                    {task.isDateRangeEvent && ' 📅'}
                                                </span>
                                            </td>
                                            <td className="fa-13">{task.EmployeeName}</td>
                                            <td className="fa-13">{task.Task_Name}</td>
                                            <td className="fa-13">{task.Process_Name}</td>
                                            <td className="fa-13">{task.Project_Name}</td>
                                            <td className="fa-13">
                                                {task.workType === 'completed' ? (
                                                    <>
                                                        {task.Start_Time && formatTime24(task.Start_Time)} - {task.End_Time && formatTime24(task.End_Time)}
                                                    </>
                                                ) : (
                                                    <>
                                                        {task.Sch_Time && formatTime24(task.Sch_Time)} - {task.EN_Time && formatTime24(task.EN_Time)}
                                                        {task.isDateRangeEvent && ' (Range)'}
                                                    </>
                                                )}
                                            </td>
                                            <td className="fa-13">{task.Tot_Minutes || (task.workType === 'assigned' ? '60' : '0')} mins</td>
                                            <td className="fa-13">
                                                {task.workType === 'completed' ? task.Work_Done : task.Task_Desc}
                                                {task.isDateRangeEvent && ` (Date Range: ${task.originalStartDate && new Date(task.originalStartDate).toLocaleDateString('en-IN')} to ${task.originalEndDate && new Date(task.originalEndDate).toLocaleDateString('en-IN')})`}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setProcessDayDialog(false); setSelectedProcessDay({}); setSelectedEmployee(''); }}>
                        close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ReportCalendar;