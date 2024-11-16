import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { fetchLink } from '../../Components/fetchComponent';
import TaskMasterMgt from '../../Pages/Tasks/Components/newaddEditTask';
import TaskAssign from '../taskAssign/addEditTaskAssign';
import { toast } from 'react-toastify';
import ViewHeadlineSharpIcon from '@mui/icons-material/ViewHeadlineSharp';
import { Edit } from "@mui/icons-material";
import TaskIndividual from './taskIndividual';

function ListingTask({ dialogOpen, setDialogOpen, projectid, reload, onReload }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [taskAssignOpen, setTaskAssignOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskDetails, setTaskDetails] = useState([]);
    const [taskDetailDialog, setTaskDetailsDialog] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const initialValue = {
        Task_Id: '',
        Task_Levl_Id: '',
        Type_Task_Id: '',
        Task_Sch_Duaration: '',
        Task_Group_Id: '',
        Task_Start_Time: new Date().toISOString(),
        Task_End_Time: new Date().toISOString(),
        Task_Est_Start_Date: new Date().toISOString(),
        Task_Est_End_Date: new Date().toISOString(),
    };

    const [taskScheduleInput, setTaskScheduleInput] = useState(initialValue);
    const [taskData, setTaskData] = useState([]);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [editEmployeeId, setEditEmployeeId] = useState([]);
    const [editEmployeeTaskId, setEditEmployeeTaskId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const userData = JSON.parse(localStorage.getItem('user'));
    const entryBy = userData?.UserId;
    const companyId = userData?.Company_id;
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const fetchTasks = async () => {
        try {
            const data = await fetchLink({ address: `taskManagement/tasks/dropdown?Company_id=${companyId}` });
            if (data.success) {
                setTasks(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAvailableEmployees = async () => {
        try {
            const data = await fetchLink({ address: `masters/Employeedetails/getusersproject?Project_Id=${projectid}` });
            if (data.success) {
                setAvailableEmployees(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
        }
    };
    const handleDeleteTask = async (task) => {
        setTaskToDelete(task.Task_Id);
        setDeleteDialogOpen(true);
    };

    useEffect(() => {
        fetchTasks();
        fetchAvailableEmployees();
    }, [reload, onReload]);

    const taskOptions = tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }));

    const handleTaskChange = async (selectedOption) => {
        setTaskScheduleInput(prev => ({
            ...prev,
            Task_Id: selectedOption.value,
            TasksGet: selectedOption.label
        }));

        try {
            const response = await fetchLink({
                address: `taskManagement/tasks/tasklistsid?Task_Id=${selectedOption.value}`
            });
            if (response.success) {
                const taskDetails = response.data;
                setTaskScheduleInput(prev => ({
                    ...prev,
                    Task_Levl_Id: taskDetails.Task_Levl_Id,
                    Task_Name: taskDetails.Task_Name,
                    Task_Desc: taskDetails.Task_Desc,
                    Task_Group_Id: taskDetails.Task_Group_Id,
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
            toast.error(error);
        }
    };

    const handleAssignTask = async () => {
        if (!taskScheduleInput.Task_Id) {
            toast.error("Please select a task before saving.");
            return;
        }

        const requestData = {
            entryBy: entryBy,
            Project_Id: projectid,
            Sch_Type_Id: 1,
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
                toast.success("Schedule Created Successfully");
                setAssignDialogOpen(false);
                fetchData();
                onReload();
            } else {
                toast.error("Failed to Create Schedule");
            }
        } catch (error) {
            toast.error(error);
        }
    };

    const fetchData = async () => {
        try {
            const data = await fetchLink({
                address: `taskManagement/project/schedule/ListingDetails?Project_Id=${projectid}`
            });
            if (data.success) {
                setTaskData(data.data);
            } else {
                console.error('Failed to fetch task details:', data.message);
            }
        } catch (e) {
            console.error('Error fetching task details:', e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [reload, projectid, onReload]);

    const handleSelectedTask = async (task) => {
        setSelectedTask(task);
        setTaskAssignOpen(true);
    }

    const setCloseTask = async () => {
        setDialogOpen(false);
        setTaskScheduleInput(initialValue);
    }

    const handleviewTaskDetail = async (task) => {
        setTaskDetailsDialog(true);
        console.log("projectid",projectid)
        if (!task.Task_Id || !projectid) {
            toast.error('Task ID and Project ID are required');
            return;
        }
    
        try {
            const data = await fetchLink({
                address: `masters/employeedetails/assignedTaskDetails?Task_Id=${task.Task_Id}&ProjectId=${projectid}&LevelId=${task.Task_Levl_Id}`
            });
       
            if (data.success) {
                setTaskDetails(data.data);
            } else {
                console.error(data.message);
            }
        } catch (e) {
            console.error('Error fetching task details:', e);
        }
    }

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setEditDialogOpen(true);
    };

    const deleteTaskFun = async () => {
        if (!taskToDelete) return;

        try {
            const response = await fetchLink({
                address: `masters/employeedetails/deleteTask?Task_Id=${taskToDelete}`,
                method: 'DELETE',
            });


            if (response.success) {
                toast.success("Task Deleted Successfully");
                setDeleteDialogOpen(false);
                fetchData();
                onReload();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the task.");
            console.error(error);
        }
    };


    const handleEmployeeEditClick = (employeeId, taskId) => {
        setEditEmployeeId(employeeId);
        setEditEmployeeTaskId(taskId);
    };

    const handleEmployeeChange = async (newEmployeeId) => {
        if (!editEmployeeTaskId) return;

        try {
            const response = await fetchLink({
                address: 'masters/employeedetails/assignTask',
                method: 'PUT',
                bodyData: {

                    Emp_Id: newEmployeeId
                },
            });

            if (response.success) {
                toast.success("Employee updated successfully");
                fetchData();
                // setEditEmployeeId(null); 
                // setEditEmployeeTaskId(null); 
            } else {
                toast.error("Failed to update employee assignment: " + response.message);
            }
        } catch (error) {
            toast.error("Error occurred while updating employee assignment: " + error.message);
        }
    };

    return (
        <>


            <Dialog
                open={dialogOpen}
                fullWidth
                maxWidth="md"
                PaperProps={{ style: { height: '75vh' } }}
            >
                <DialogTitle>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Task List</span>
                        <Button variant="contained" color="primary" onClick={() => setAssignDialogOpen(true)}>Assign Task</Button>
                    </div>
                </DialogTitle>

                <DialogContent>
                    <TableContainer style={{ maxHeight: '50vh' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Task </TableCell>
                                    <TableCell>Task Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Estimated Start Date</TableCell>
                                    <TableCell>Estimated End Date</TableCell>
                                    <TableCell>Employees</TableCell>
                                    <TableCell>Assign</TableCell>
                                    <TableCell>Actions</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {taskData.length > 0 ? (
                                    taskData.map(task => (
                                        <TableRow key={task.Task_Id}>
                                            <TableCell>{task.Task_Name || 'N/A'}</TableCell>
                                            <TableCell>{task.Task_Type || '-'}</TableCell>
                                            <TableCell>{task.Status}</TableCell>
                                            <TableCell>
                                                {task.Task_Est_Start_Date
                                                    ? new Date(task.Task_Est_Start_Date).toISOString().slice(0, 10).split('-').reverse().join('-')
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {task.Task_Est_End_Date
                                                    ? new Date(task.Task_Est_End_Date).toISOString().slice(0, 10).split('-').reverse().join('-')
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {Array.isArray(JSON.parse(task.AssignedEmployees)) && JSON.parse(task.AssignedEmployees).length > 0 ? (
                                                    JSON.parse(task.AssignedEmployees).map((employee) => (
                                                        <div key={employee.User_Id} style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Chip
                                                                label={employee.Name}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{ margin: '2px', color: 'green' }}
                                                            // onClick={() => handleEmployeeEditClick(employee.User_Id, task.Task_Id)}
                                                            />

                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>No Employees Assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleSelectedTask(task)}>
                                                    <LibraryAddIcon />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEditTask(task)}>
                                                    <Edit />
                                                </IconButton>
                                                {/* <IconButton onClick={() => handleDeleteTask(task)}>
                                                    <Delete />
                                                </IconButton> */}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleviewTaskDetail(task)}>
                                                    <ViewHeadlineSharpIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center">No tasks found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={setCloseTask}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={assignDialogOpen}
                fullWidth
                maxWidth="sm"
                PaperProps={{ style: { borderRadius: '8px' } }}
            >
                <DialogTitle>Assign Task</DialogTitle>
                <DialogContent>
                    <div style={{ padding: '1px', display: 'flex' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="task-select" style={{ marginRight: '8px' }}>Select Task</label>
                            <select
                                id="task-select"
                                value={taskScheduleInput.Task_Id || ''}
                                className="cus-inpt"
                                required
                                onChange={e => handleTaskChange({ value: e.target.value })}
                                style={{ flex: 1, marginRight: '8px' }}
                            >
                                <option value="" disabled>- select -</option>
                                {taskOptions.map((option, index) => (
                                    <option key={index} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <IconButton onClick={() => setIsDialogOpen(true)}>
                                <AddIcon />
                            </IconButton>
                        </div>
                    </div>
                </DialogContent>

                <DialogActions>
                    <button className='btn btn-light' variant="outlined" onClick={() => setAssignDialogOpen(false)}>Cancel</button>
                    <button className='btn btn-primary' variant="contained" color="primary" onClick={handleAssignTask}>Save</button>
                </DialogActions>
            </Dialog>

            <TaskAssign
                open={taskAssignOpen}
                onClose={() => setTaskAssignOpen(false)}
                task={selectedTask}
                projectId={projectid}
                entryBy={entryBy}
                taskId={selectedTask}
                reload={onReload}
            />

            <TaskMasterMgt
                openAction={isDialogOpen}
                onCloseFun={() => setIsDialogOpen(false)}
                onTaskAdded={fetchTasks}
                Reload={reload}
            />

            <TaskMasterMgt
                row={selectedTask}
                openAction={editDialogOpen}
                onCloseFun={() => setEditDialogOpen(false)}
                reload={fetchData}
            />

            <TaskIndividual
                open={taskDetailDialog}
                onClose={() => setTaskDetailsDialog(false)}
                taskDetails={taskDetails}
            />


            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    Do you want to delete this task?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={deleteTaskFun} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ListingTask;