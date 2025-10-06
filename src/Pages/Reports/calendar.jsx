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

    useEffect(() => {
        let address = `taskManagement/task/work?Emp_Id=${filters.Emp_Id}&Project_Id=${filters.Project_Id}&from=${filters.from}&to=${filters.to}&Task_Id=${filters.Task_Id}`;
        
        if (viewMode === 'process') {
            address += `&Process_Id=${filters.Process_Id}`;
        }
        
        fetchLink({
            address: address
        }).then(data => {
            if (data.success) {
                setWorkedDetais(data.data);
                
                // Group process data by date for process view
                if (viewMode === 'process') {
                    const grouped = groupProcessDataByDate(data.data);
                    setGroupedProcessData(grouped);
                }
            }
        }).catch(e => console.error(e))    
    }, [filters, viewMode])

    // Group process data by date and calculate cumulative information
    const groupProcessDataByDate = (data) => {
        const grouped = {};
        
        data.forEach(item => {
            const date = new Date(item.Work_Dt).toISOString().split('T')[0];
            
            if (!grouped[date]) {
                grouped[date] = {
                    date: date,
                    processes: [],
                    totalMinutes: 0,
                    totalTasks: 0,
                    employees: new Set(),
                    employeeDetails: {},
                    processCount: {}
                };
            }
            
            // Add process information
            if (item.Process_Name) {
                if (!grouped[date].processCount[item.Process_Name]) {
                    grouped[date].processCount[item.Process_Name] = 0;
                }
                grouped[date].processCount[item.Process_Name]++;
            }
            
            // Add to processes list
            grouped[date].processes.push(item);
            
            // Calculate totals
            grouped[date].totalMinutes += parseInt(item.Tot_Minutes) || 0;
            grouped[date].totalTasks++;
            
            // Add employee details
            if (item.EmployeeName && item.Emp_Id) {
                grouped[date].employees.add(item.EmployeeName);
                
                const empId = item.Emp_Id.toString();
                
                if (!grouped[date].employeeDetails[empId]) {
                    grouped[date].employeeDetails[empId] = {
                        id: empId,
                        name: item.EmployeeName,
                        tasks: [],
                        totalMinutes: 0
                    };
                }
                grouped[date].employeeDetails[empId].tasks.push(item);
                grouped[date].employeeDetails[empId].totalMinutes += parseInt(item.Tot_Minutes) || 0;
            }
        });
        
        // Convert to array and calculate additional metrics
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
    }, [parseData?.BranchId])

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

    const getEventTitle = (item) => {
        if (viewMode === 'task') {
            return item?.Task_Name;
        } else {
            const dayData = groupedProcessData.find(d => d.date === new Date(item.Work_Dt).toISOString().split('T')[0]);
            if (dayData) {
                return `${dayData.totalTasks} tasks | ${dayData.totalMinutes}m | ${dayData.employeeCount} emp`;
            }
            return item?.Process_Name || 'No Process';
        }
    }

    const getCalendarTitle = () => {
        return viewMode === 'task' ? 'Completed Tasks' : 'Process Timeline (Cumulative)';
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

    const getEventBackgroundColor = (item) => {
        if (viewMode === 'task') {
            return '#3788d8';
        } else {
            const dayData = groupedProcessData.find(d => d.date === new Date(item.Work_Dt).toISOString().split('T')[0]);
            if (dayData) {
                if (dayData.totalMinutes > 480) return '#28a745';
                if (dayData.totalMinutes > 240) return '#ffc107';
                return '#dc3545';
            }
            return '#28a745';
        }
    }

    // Get filtered tasks based on selected employee
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
                    events={
                        viewMode === 'task' 
                            ? workedDetais.map(o => ({
                                title: getEventTitle(o),
                                start: new Date(o?.Work_Dt).toISOString().split('T')[0] + 'T' + o?.Start_Time,
                                end: new Date(o?.Work_Dt).toISOString().split('T')[0] + 'T' + o?.End_Time,
                                objectData: o,
                                backgroundColor: getEventBackgroundColor(o),
                                borderColor: getEventBackgroundColor(o)
                            }))
                            : groupedProcessData.map(day => ({
                                title: getEventTitle({ Work_Dt: day.date }),
                                start: day.date,
                                allDay: true,
                                objectData: day,
                                backgroundColor: getEventBackgroundColor({ Work_Dt: day.date }),
                                borderColor: getEventBackgroundColor({ Work_Dt: day.date })
                            }))
                    }
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
                    eventClick={eve => {
                        if (viewMode === 'task') {
                            const eveObj = eve.event.extendedProps.objectData;
                            setSelectedTask(eveObj);
                            setDialog(true);
                        } else {
                            const dayData = eve.event.extendedProps.objectData;
                            setSelectedProcessDay(dayData);
                            setSelectedEmployee('');
                            setProcessDayDialog(true);
                        }
                    }}
                    dateClick={handleDateClick}
                    datesSet={date => {
                        setFileters(pre => ({ ...pre, from: date.startStr.split('T')[0], to: date.endStr.split('T')[0] }))
                    }}
                    height={1200}
                />
            </div>

            {/* Task Details Dialog */}
            <Dialog
                open={dialog} maxWidth="sm" fullWidth
                onClose={() => { setDialog(false); setSelectedTask({}) }}>
                <DialogTitle className="fa-18">
                    Task Details
                </DialogTitle>
                <DialogContent className="pb-0">
                    <div className="table-responsive pb-0">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className="border-1 fa-14">EmpName</td>
                                    <td className="border-1 fa-14">{selectedTask?.EmployeeName}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Task</td>
                                    <td className="border-1 fa-14">{selectedTask?.Task_Name}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">ProcessName</td>
                                    <td className="border-1 fa-14">{selectedTask?.Process_Name}</td>
                                </tr>
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
                                    <td className="border-1 fa-14">Duration</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Tot_Minutes} ( Minutes )
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Description</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Work_Done}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Status</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.WorkStatus}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Project</td>
                                    <td className="border-1 fa-14">{selectedTask?.Project_Name}</td>
                                </tr>
                                {selectedTask?.Work_Param?.length > 0 && (
                                    <tr>
                                        <td colSpan={2} className="border-1 fa-14 text-center text-uppercase">Parameter Values</td>
                                    </tr>
                                )}
                                {selectedTask?.Work_Param?.map((o, i) => (
                                    <tr key={i}>
                                        <td className="border-1 fa-14">{o?.Paramet_Name}</td>
                                        <td className="border-1 fa-14">{o?.Current_Value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialog(false); setSelectedTask({}) }}>close</Button>
                </DialogActions>
            </Dialog>

            {/* Process Day Details Dialog */}
            <Dialog
                open={processDayDialog} maxWidth="lg" fullWidth
                onClose={() => { setProcessDayDialog(false); setSelectedProcessDay({}); setSelectedEmployee(''); }}>
                <DialogTitle className="fa-18">
                    Process Summary - {selectedProcessDay?.date && new Date(selectedProcessDay.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                </DialogTitle>
                <DialogContent className="pb-0">
                    {/* Employee Selection Dropdown */}
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
                                        label: `${emp.name} (${emp.tasks?.length || 0} tasks, ${emp.totalMinutes || 0} mins)`
                                    })) || [])
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Select Employee"
                            />
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                            <div className="text-muted fa-14">
                                {selectedEmployee ? 
                                    `Showing tasks for ${selectedProcessDay.employeeDetails?.[selectedEmployee]?.name || 'Unknown'}` 
                                    : `Showing all ${selectedProcessDay.totalTasks || 0} tasks from ${selectedProcessDay.employeeCount || 0} employees`
                                }
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="row mb-3">
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
                                    <h6 className="card-title mb-1">Total Duration</h6>
                                    <p className="card-text h4 text-success mb-0">
                                        {getFilteredTasks().reduce((total, task) => total + (parseInt(task.Tot_Minutes) || 0), 0)}m
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center p-2">
                                    <h6 className="card-title mb-1">Processes</h6>
                                    <p className="card-text h4 text-info mb-0">
                                        {[...new Set(getFilteredTasks().map(task => task.Process_Name))].length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center p-2">
                                    <h6 className="card-title mb-1">Projects</h6>
                                    <p className="card-text h4 text-warning mb-0">
                                        {[...new Set(getFilteredTasks().map(task => task.Project_Name))].length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Tasks Table */}
                    <div className="table-responsive pb-0">
                        <table className="table table-bordered mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="fa-14">#</th>
                                    <th className="fa-14">Employee</th>
                                    <th className="fa-14">Task</th>
                                    <th className="fa-14">Process</th>
                                    <th className="fa-14">Time</th>
                                    <th className="fa-14">Duration</th>
                                    <th className="fa-14">Description</th>
                                    <th className="fa-14">Project</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredTasks().length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center fa-14 py-3">
                                            No tasks found for the selected criteria
                                        </td>
                                    </tr>
                                ) : (
                                    getFilteredTasks().map((task, index) => (
                                        <tr key={index}>
                                            <td className="fa-13">{index + 1}</td>
                                            <td className="fa-13">{task.EmployeeName}</td>
                                            <td className="fa-13">{task.Task_Name}</td>
                                            <td className="fa-13">{task.Process_Name}</td>
                                            <td className="fa-13">
                                                {task.Start_Time && formatTime24(task.Start_Time)} - {task.End_Time && formatTime24(task.End_Time)}
                                            </td>
                                            <td className="fa-13">{task.Tot_Minutes} mins</td>
                                            <td className="fa-13">{task.Work_Done}</td>
                                            <td className="fa-13">{task.Project_Name}</td>
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