// import React, { useState, useCallback, useEffect, useContext } from 'react';
// import {
// 	Dialog,
// 	DialogTitle,
// 	DialogContent,
// 	DialogActions,
// 	Button,
// 	Tab,
// 	Table,
// 	TableCell,
// 	TableContainer,
// 	TableHead,
// 	TableRow,
// 	IconButton,
// 	Chip,
// 	Accordion,
// 	AccordionSummary,
// 	AccordionDetails,
// 	Typography,
// 	Box
// } from '@mui/material';
// import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
// import ViewHeadlineSharpIcon from '@mui/icons-material/ViewHeadlineSharp';
// import { fetchLink } from '../../../Components/fetchComponent';
// import { toast } from 'react-toastify';
// import { Edit } from "@mui/icons-material";

// import TaskMasterMgt from '../Components/newaddEditTask';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// import TaskAssign from '../taskAssign/addEditTaskAssign';

// import TaskIndividual from './taskIndividual';
// import { TabContext, TabList, TabPanel } from '@mui/lab';
// import { MyContext } from "../../../Components/context/contextProvider";
// function ListingTask({ dialogOpen, setDialogOpen, projectid, reload, onReload, selectedProject }) {
// 	const [isDialogOpen, setIsDialogOpen] = useState(false);
// 	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
// 	const [taskAssignOpen, setTaskAssignOpen] = useState(false);
// 	const [selectedTask, setSelectedTask] = useState(null);
// 	const [tasks, setTasks] = useState([]);
// 	const [taskDetails, setTaskDetails] = useState([]);
// 	const [taskDetailDialog, setTaskDetailsDialog] = useState(false);
// 	const [taskScheduleInput, setTaskScheduleInput] = useState({
// 		Sch_Type_Id: '',
// 		Sch_Type: ''
// 	});


// 	const [taskData, setTaskData] = useState([]);
// 	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
// 	const userData = JSON.parse(localStorage.getItem('user'));
// 	const entryBy = userData?.UserId;
// 	const companyId = userData?.Company_id;
// 	const [editDialogOpen, setEditDialogOpen] = useState(false);
// 	const [expandedAccordion, setExpandedAccordion] = useState(null);
// 	// const [expandedAccordionSubTask, setExpandedAccordionSubTask] = useState(null);
// 	// const [scheduleTypes, setScheduleTypes] = useState([]);
// 	// const [selectedTab, setSelectedTab] = useState(0);
// 	const [expandedAccordionTask, setExpandedAccordionTask] = useState(null);

// 	const { contextObj } = useContext(MyContext);

// 	const [isEdit, setIsedit] = useState(false)
// 	const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

// 	// const [expandedItem, setExpandedItem] = useState({ schTypeId: null, taskId: null });



// 	const [selectedTab, setSelectedTab] = useState('1');
// 	const [scheduleTypes, setScheduleTypes] = useState([]);



// 	const handleTabChange = (event, newValue) => {
// 		setSelectedTab(newValue);
// 	};


// 	const handleAccordionChange = (taskId) => {
// 		setExpandedAccordion((prev) => (prev === taskId ? null : taskId));
// 	};

// 	const handleAccordionChangeTask = (taskId) => {
// 		setExpandedAccordionTask((prev) => (prev === taskId ? null : taskId));
// 	};

// 	const handleSelectedTask = async (task) => {
// 		setSelectedTask(task);
// 		setTaskAssignOpen(true);
// 	}

// 	const Schtype = async () => {
// 		fetchLink({ address: `taskManagement/project/schedule/newscheduleType` }).then((data) => {
// 			if (data.success) {
// 				console.log("data.data", data.data)
// 				setScheduleTypes(data.data);

// 			} else {
// 				toast.error(data.message);
// 			}
// 		});
// 	}

// 	const fetchTasks = useCallback(async () => {
// 		try {
// 			const data = await fetchLink({ address: `taskManagement/tasks/dropdown?Company_id=${companyId}` });
// 			if (data.success) {
// 				setTasks(data.data);
// 			} else {
// 				toast.error(data.message);
// 			}
// 		} catch (e) {
// 			console.error(e);
// 		}
// 	}, [companyId]);

// 	const fetchData = useCallback(async () => {
// 		try {
// 			const data = await fetchLink({
// 				address: `taskManagement/project/schedule/ListingDetails?Project_Id=${projectid}`
// 			});
// 			if (data.success) {
// 				setTaskData(data.data);
// 			} else {
// 				console.error('Failed to fetch task details:', data.message);
// 			}
// 		} catch (e) {
// 			console.error('Error fetching task details:', e);
// 		}
// 	}, [projectid]);

// 	useEffect(() => {
// 		fetchTasks();
// 		fetchData();
// 		Schtype();
// 	}, [reload, projectid, onReload]);



// 	const taskOptions = tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }));
// 	const handleviewTaskDetail = async (task) => {
// 		setTaskDetailsDialog(true);

// 		if (!task.Task_Id || !projectid) {
// 			toast.error('Task ID and Project ID are required');
// 			return;
// 		}

// 		try {
// 			const data = await fetchLink({
// 				address: `masters/employeedetails/assignedTaskDetails?Task_Id=${task.Task_Id}&ProjectId=${projectid}&LevelId=${task.Task_Levl_Id}`
// 			});

// 			if (data.success) {
// 				setTaskDetails(data.data);
// 			} else {
// 				console.error(data.message);
// 			}
// 		} catch (e) {
// 			console.error('Error fetching task details:', e);
// 		}
// 	};




// 	const handleAssignTask = async () => {
// 		if (!taskScheduleInput.Task_Id || !taskScheduleInput.Sch_Type_Id) {
// 			toast.error("Please select a task and schedule type before saving.");
// 			return;
// 		}

// 		const requestData = {
// 			entryBy: entryBy,
// 			Project_Id: projectid,
// 			Sch_Type_Id: taskScheduleInput.Sch_Type_Id,
// 			Sch_Est_Start_Date: taskScheduleInput.Task_Est_Start_Date,
// 			Sch_Est_End_Date: taskScheduleInput.Task_Est_End_Date,
// 			tasks: [taskScheduleInput]
// 		};

// 		try {
// 			const response = await fetchLink({
// 				address: 'taskManagement/project/schedule/createNewTaskWithSchedule',
// 				method: 'POST',
// 				bodyData: requestData,
// 			});

// 			if (response.success) {
// 				toast.success(response.message);
// 				setAssignDialogOpen(false);
// 				setTaskScheduleInput({})
// 				fetchData();
// 				onReload();
// 			}
// 			else if (response.status === 'warning') {
// 				toast.warn(response.message || "Task already exists for this project.");
// 			}
// 			else {

// 				toast.warn(response.message || "Task already exists for this project.");
// 			}
// 		} catch (error) {
// 			toast.error(error);
// 		}
// 	};

// 	const handleEditTask = (task) => {
// 		setSelectedTask(task);
// 		setEditDialogOpen(true);
// 	};


// 	const updatesTaskDetails = async (task) => {

// 		const requestData = {
// 			Sch_Project_Id: task.Sch_Project_Id,
// 			Sch_Id: task.TaskSchId,
// 			schtypeid: taskScheduleInput.Sch_Type_Id,
// 			Task_Id: task.Task_Id


// 		};

// 		try {
// 			const response = await fetchLink({
// 				address: 'taskManagement/project/schedule/updateScheduleTaskUpdate',
// 				method: 'PUT',
// 				bodyData: requestData,
// 			});

// 			if (response.success) {
// 				toast.success(response.message);

// 				setUpdateDialogOpen(false)
// 				setIsedit(false)
// 				onReload();
// 			}
// 			else if (response.status === 'warning') {
// 				toast.warn(response.message || "Task already exists for this project.");
// 			}
// 			else {

// 				toast.warn(response.message || "Task already exists for this project.");
// 			}
// 		} catch (error) {
// 			toast.error(error);
// 		}
// 	};





// 	const handleTaskEdit = (task) => {

// 		setIsedit(true);
// 		setTaskScheduleInput(task);
// 		setUpdateDialogOpen(true);
// 	};

// 	const handleTaskChange = async (selectedOption) => {
// 		setTaskScheduleInput(prev => ({
// 			...prev,
// 			Task_Id: selectedOption.value,
// 			TasksGet: selectedOption.label
// 		}));

// 		try {
// 			const response = await fetchLink({
// 				address: `taskManagement/tasks/tasklistsid?Task_Id=${selectedOption.value}`
// 			});
// 			if (response.success) {
// 				const taskDetails = response.data;
// 				setTaskScheduleInput(prev => ({
// 					...prev,
// 					Task_Levl_Id: taskDetails.Task_Levl_Id,
// 					Task_Name: taskDetails.Task_Name,
// 					Task_Desc: taskDetails.Task_Desc,
// 					Task_Group_Id: taskDetails.Task_Group_Id,

// 					Sch_Type_Id: taskDetails.Sch_Type_Id,
// 					Task_Sch_Duaration: taskDetails.Task_Sch_Duaration || '',
// 					Task_Start_Time: taskDetails.Task_Start_Time || new Date().toISOString(),
// 					Task_End_Time: taskDetails.Task_End_Time || new Date().toISOString(),
// 					Task_Est_Start_Date: taskDetails.Task_Est_Start_Date || new Date().toISOString(),
// 					Task_Est_End_Date: taskDetails.Task_Est_End_Date || new Date().toISOString(),
// 				}));
// 			} else {
// 				toast.error("Failed to fetch task details");
// 			}
// 		} catch (error) {
// 			toast.error(error);
// 		}
// 	};

// 	const setCloseTask = async () => {
// 		setDialogOpen(false);
// 		setTaskScheduleInput({});

// 	}



// 	const handleSchTypeChange = (e) => {
		
// 		const selectedOption = scheduleTypes.find(option => option.Sch_Type_Id === parseInt(e.target.value));
// 		if (selectedOption) {
// 			setTaskScheduleInput({
// 				...taskScheduleInput,
// 				Sch_Type_Id: selectedOption.Sch_Type_Id,
// 				Sch_Type: selectedOption.Sch_Type,
// 			});
// 		}
// 	};


// 	return (
// 		<>
// 			{updateDialogOpen && (
// 				<Dialog
// 					open={updateDialogOpen}
// 					fullWidth
// 					maxWidth="sm"
// 					PaperProps={{ style: { borderRadius: '8px' } }}
// 					onClose={() => setUpdateDialogOpen(false)}
// 				>
// 					<DialogTitle>{isEdit ? "Edit Task" : "Assign Task"}</DialogTitle>
// 					<DialogContent>
// 						<div style={{ padding: '1px', display: 'flex' }}>
// 							<div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
// 								<label style={{ marginRight: '8px' }}>Sch_Type</label>
// 								<select
// 									value={taskScheduleInput.Sch_Type_Id || ''}
// 									onChange={handleSchTypeChange}
// 									className="cus-inpt"
// 									required
// 									style={{ marginLeft: '10px' }}
// 								>
// 									<option value="" disabled>- Sch_Type -</option>
// 									{scheduleTypes.map((option, index) => (
// 										<option key={index} value={option.Sch_Type_Id}>
// 											{option.Sch_Type}
// 										</option>
// 									))}
// 								</select>
// 							</div>
// 						</div>
// 					</DialogContent>
// 					<DialogActions>
// 						<Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
// 						<Button
// 							variant="contained"
// 							color="primary"
// 							onClick={() => updatesTaskDetails(taskScheduleInput)}
// 						>
// 							Save
// 						</Button>
// 					</DialogActions>
// 				</Dialog>
// 			)}


// 			<Dialog open={dialogOpen} fullWidth maxWidth="lg" PaperProps={{ style: { height: '75vh' } }}>
// 				<DialogTitle>
// 					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// 						<span>{selectedProject?.Project_Name}</span>
// 						<Button variant="contained" color="primary" onClick={() => setAssignDialogOpen(true)}>Assign Task</Button>
// 					</div>
// 				</DialogTitle>

// 				<Box sx={{ width: '100%', typography: 'body1' }}>
// 					{taskData.map((schedule, index) => {
// 						const scheduleTypes = JSON.parse(schedule.SchTypes);
// 						// const overallSchTypes = JSON.parse(schedule.OverallSchTypes)


// 						return (
// 							<TabContext value={selectedTab} key={index}>
// 								<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
// 									<TabList onChange={handleTabChange} aria-label="Schedule Types">
// 										{/* <Tab label="Overall" value="overall" id="tab-overall" aria-controls="tabpanel-overall" /> */}
// 										{Array.isArray(scheduleTypes) && scheduleTypes.length > 0 ? (
// 											scheduleTypes.map((sch, index) => (
// 												<Tab
// 													key={`${sch.SchTypeId || 'index'}-${index}`}
// 													label={sch.SchType || 'No SchType'}
// 													value={(sch.SchTypeId || index).toString()}
// 													id={`tab-${sch.SchTypeId || index}`}
// 													aria-controls={`tabpanel-${sch.SchTypeId || index}`}
// 												/>
// 											))
// 										) : (
// 											<Typography variant="body2" color="textSecondary" sx={{ padding: 2 }}>
// 												No Details Available for {scheduleTypes}
// 											</Typography>
// 										)}
// 									</TabList>
// 								</Box>




// 								{Array.isArray(scheduleTypes) && scheduleTypes.map((sch, index) => (
// 									<TabPanel
// 										key={`${sch.SchTypeId || 'index'}-${index}`}
// 										value={(sch.SchTypeId || index).toString()}
// 										id={`tabpanel-${sch.SchTypeId || index}`}
// 										aria-labelledby={`tab-${sch.SchTypeId || index}`}
// 									>
// 										<Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
// 											{Array.isArray(sch.TaskCountsInSchType) && sch.TaskCountsInSchType.length > 0 ? (
// 												sch.TaskCountsInSchType.map((count, index) => (
// 													<Typography key={index} variant="body1" display="flex" justifyContent="space-between" alignItems="center">
// 														<Box>
// 															Schedule Type: <strong>{sch.SchType}</strong>
// 														</Box>
// 														<Box textAlign="right">
// 															Total Tasks: <strong>{count.TotalTasks}</strong> / Completed Tasks: <strong>{count.CompletedTasks}</strong>
// 														</Box>
// 													</Typography>
// 												))
// 											) : (
// 												<Typography variant="body2" color="textSecondary">
// 													No tasks counted for this schedule type.
// 												</Typography>
// 											)}
// 										</Box>

// 										{Array.isArray(sch.TaskTypeGroups) && sch.TaskTypeGroups.length > 0 ? (
// 											sch.TaskTypeGroups.map((taskType) => (
// 												<Accordion
// 													key={taskType.Task_Type_Id}
// 													expanded={expandedAccordion === taskType.Task_Type_Id}
// 													onChange={() => handleAccordionChange(taskType.Task_Type_Id)}
// 													sx={{
// 														backgroundColor: '#f0f4ff',
// 														boxShadow: 'black',
// 													}}
// 												>
// 													<AccordionSummary expandIcon={<ExpandMoreIcon />}>
// 														<Typography fontWeight="bold">
// 															{taskType.Task_Type || 'Default Task Type'}
// 														</Typography>
// 														<Box sx={{ textAlign: 'right', flexGrow: 1 }}>
// 															<Typography variant="h6">
// 																<Typography fontWeight="bold">
// 																	Completed Task / Total Task
// 																</Typography>
// 																{Array.isArray(taskType.TaskMetrics) && taskType.TaskMetrics.length > 0 ? (
// 																	taskType.TaskMetrics.map((tasks, index) => (
// 																		<Typography sx={{ textAlign: 'right', flexGrow: 1 }} key={index}>
// 																			{tasks.CompletedTasks} / {tasks?.TotalTasks}
// 																		</Typography>
// 																	))
// 																) : (
// 																	<Typography variant="body2" color="textSecondary">
// 																		No task metrics available for this task type.
// 																	</Typography>
// 																)}
// 															</Typography>
// 														</Box>
// 													</AccordionSummary>
// 													<AccordionDetails>
// 														{Array.isArray(taskType.Tasks) && taskType.Tasks.length > 0 ? (
// 															taskType.Tasks.map((taskItem) => (
// 																<Accordion
// 																	key={taskItem.Task_Id}
// 																	expanded={expandedAccordionTask === taskItem.Task_Id}
// 																	onChange={() => handleAccordionChangeTask(taskItem.Task_Id)}
// 																	sx={{
// 																		marginBottom: 2,
// 																	}}
// 																>
// 																	<AccordionSummary expandIcon={<ExpandMoreIcon />}>
// 																		<Box sx={{ textAlign: 'left', flexGrow: 1 }}>
// 																			<Typography fontWeight="bold">
// 																				{taskItem?.Task_Name || 'DEFAULT TASK'}
// 																			</Typography>
// 																		</Box>
// 																	</AccordionSummary>
// 																	<AccordionDetails>
// 																		<TableContainer style={{ maxHeight: '50vh' }}>
// 																			<Table stickyHeader>
// 																				<TableHead style={{ backgroundColor: '#2C3E50' }}>
// 																					<TableRow style={{ backgroundColor: '#2C3E50' }}>
// 																						<TableCell style={{ backgroundColor: '#2C3E50', color: 'white' }}>Task</TableCell>
// 																						<TableCell style={{ backgroundColor: '#2C3E50', color: 'white' }}>Task Type</TableCell>
// 																						<TableCell style={{ backgroundColor: '#2C3E50', color: 'white' }}>Employees</TableCell>
// 																						<TableCell style={{ backgroundColor: '#2C3E50', color: 'white' }}>Employee Assign</TableCell>
// 																						<TableCell style={{ backgroundColor: '#2C3E50', color: 'white' }}>Actions</TableCell>
// 																						<TableCell style={{ backgroundColor: '#2C3E50', color: 'white' }}>Details</TableCell>
// 																					</TableRow>
// 																				</TableHead>

// 																				<TableRow key={taskItem.Task_Id} sx={{ backgroundColor: '#BBE6F6' }}>
// 																					<TableCell>{taskItem.Task_Name}</TableCell>
// 																					<TableCell>
// 																						{sch.SchType}
// 																						<IconButton onClick={() => handleTaskEdit(taskItem)}>
// 																							<Edit />
// 																						</IconButton>
// 																					</TableCell>

// 																					<TableCell>
// 																						{Array.isArray(taskItem.AssignedEmployees) && taskItem.AssignedEmployees.length > 0 ? (
// 																							taskItem.AssignedEmployees.map((employee, empIndex) => (
// 																								<Chip
// 																									key={empIndex}
// 																									label={employee.Name}
// 																									variant="outlined"
// 																									size="small"
// 																									sx={{ margin: '2px', color: 'green' }}
// 																								/>
// 																							))
// 																						) : (
// 																							<span>No Employees Assigned</span>
// 																						)}
// 																					</TableCell>
// 																					<TableCell>
// 																						<IconButton onClick={() => handleSelectedTask(taskItem)}>
// 																							<LibraryAddIcon />
// 																						</IconButton>
// 																					</TableCell>

// 																					{Number(contextObj?.Edit_Rights) === 1 && (
// 																						<TableCell>
// 																							<IconButton onClick={() => handleEditTask(taskItem)}>
// 																								<Edit />
// 																							</IconButton>
// 																						</TableCell>
// 																					)}

// 																					<TableCell>
// 																						<IconButton onClick={() => handleviewTaskDetail(taskItem)}>
// 																							<ViewHeadlineSharpIcon />
// 																						</IconButton>
// 																					</TableCell>
// 																				</TableRow>
// 																			</Table>
// 																		</TableContainer>
// 																	</AccordionDetails>
// 																</Accordion>
// 															))
// 														) : (
// 															<Typography variant="body2" color="textSecondary">
// 																No tasks available for this task type.
// 															</Typography>
// 														)}
// 													</AccordionDetails>
// 												</Accordion>
// 											))
// 										) : (
// 											<Typography variant="body2" color="textSecondary">
// 												No task type groups found for this schedule type.
// 											</Typography>
// 										)}
// 									</TabPanel>
// 								))}

// 							</TabContext>
// 						)

// 					})}
// 				</Box>



// 				<DialogActions sx={{ marginTop: 'auto ', position: 'sticky', bottom: 0 }}>
// 					<Button variant="contained" color="primary" onClick={setCloseTask}>Close</Button>
// 				</DialogActions>

// 			</Dialog>


// 			<Dialog open={assignDialogOpen} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: '8px' } }}>
// 				<DialogTitle>Assign Task</DialogTitle>
// 				<DialogContent>
// 					<div style={{ padding: '1px', display: 'flex' }}>
// 						<div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
// 							<label htmlFor="task-select" style={{ marginRight: '8px' }}>Select Task</label>
// 							<select
// 								id="task-select"
// 								value={taskScheduleInput.Task_Id || ''}
// 								className="cus-inpt"
// 								required
// 								onChange={e => handleTaskChange({ value: e.target.value })}
// 								style={{ flex: 1, marginRight: '8px' }}
// 							>
// 								<option value="" disabled>- select -</option>
// 								{taskOptions.map((option, index) => (
// 									<option key={index} value={option.value}>
// 										{option.label}
// 									</option>
// 								))}
// 							</select>
// 							<IconButton onClick={() => setIsDialogOpen(true)}>
// 								<Button variant="contained" color="primary">Create New</Button>
// 							</IconButton>
// 						</div>
// 					</div>
// 					<div style={{ padding: '1px', display: 'flex' }}>
// 						<div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
// 							<label style={{ marginRight: '8px' }}>Sch_Type</label>
// 							<select
// 								value={taskScheduleInput.Sch_Type_Id || ''}
// 								onChange={handleSchTypeChange}
// 								className="cus-inpt"
// 								required
// 								style={{ marginLeft: '10px' }}
// 							>
// 								<option value="" disabled>- Sch_Type -</option>
// 								{scheduleTypes.map((option, index) => (
// 									<option key={index} value={option.Sch_Type_Id}>
// 										{option.Sch_Type}
// 									</option>
// 								))}
// 							</select>
// 						</div>
// 					</div>
// 				</DialogContent>
// 				<DialogActions>
// 					<Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
// 					<Button variant="contained" color="primary" onClick={handleAssignTask}>Save</Button>
// 				</DialogActions>
// 			</Dialog>

// 			<TaskAssign
// 				open={taskAssignOpen}
// 				onClose={() => setTaskAssignOpen(false)}
// 				task={selectedTask}
// 				projectId={projectid}
// 				entryBy={entryBy}
// 				taskId={selectedTask}
// 				reload={reload}
// 				onReload={onReload}
// 			/>

// 			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
// 				<DialogTitle>Delete Task</DialogTitle>
// 				<DialogActions>
// 					<Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
// 					{/* <Button onClick={deleteTaskFun} color="secondary">Delete</Button> */}
// 				</DialogActions>
// 			</Dialog>

// 			<TaskMasterMgt
// 				openAction={isDialogOpen}
// 				onCloseFun={() => setIsDialogOpen(false)}
// 				onTaskAdded={fetchTasks}
// 				Reload={reload}
// 			/>
// 			<TaskMasterMgt
// 				row={selectedTask}
// 				openAction={editDialogOpen}
// 				onCloseFun={() => setEditDialogOpen(false)}
// 				reload={fetchData}
// 				Reload={reload}
// 			/>
// 			<TaskIndividual
// 				open={taskDetailDialog}
// 				onClose={() => setTaskDetailsDialog(false)}
// 				taskDetails={taskDetails}
// 			/>

// 		</>
// 	);


// }

// export default ListingTask;





























import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Tab,
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Chip,
	TableBody,
	Typography,
	Box
} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ViewHeadlineSharpIcon from '@mui/icons-material/ViewHeadlineSharp';
import { fetchLink } from '../../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { Edit } from "@mui/icons-material";

import TaskMasterMgt from '../Components/newaddEditTask';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TaskAssign from '../taskAssign/addEditTaskAssign';

import TaskIndividual from './taskIndividual';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { MyContext } from "../../../Components/context/contextProvider";
function ListingTask({ dialogOpen, setDialogOpen, projectid, reload, onReload, selectedProject }) {
   
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [taskAssignOpen, setTaskAssignOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [taskDetails, setTaskDetails] = useState([]);
	const [taskDetailDialog, setTaskDetailsDialog] = useState(false);
	const [taskScheduleInput, setTaskScheduleInput] = useState({
		Sch_Type_Id: '',
		Sch_Type: ''
	});

const [isLoading, setIsLoading] = useState(false);
	const [taskData, setTaskData] = useState([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const userData = JSON.parse(localStorage.getItem('user'));
	const entryBy = userData?.UserId;
	const companyId = userData?.Company_id;
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [expandedAccordion, setExpandedAccordion] = useState(null);
	// const [expandedAccordionSubTask, setExpandedAccordionSubTask] = useState(null);
	// const [scheduleTypes, setScheduleTypes] = useState([]);
	// const [selectedTab, setSelectedTab] = useState(0);
	const [expandedAccordionTask, setExpandedAccordionTask] = useState(null);

	const { contextObj } = useContext(MyContext);

	const [isEdit, setIsedit] = useState(false)
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

	// const [expandedItem, setExpandedItem] = useState({ schTypeId: null, taskId: null });



	const [selectedTab, setSelectedTab] = useState('1');
	const [scheduleTypes, setScheduleTypes] = useState([]);



	const handleTabChange = (event, newValue) => {
		setSelectedTab(newValue);
	};


	const handleAccordionChange = (taskId) => {
		setExpandedAccordion((prev) => (prev === taskId ? null : taskId));
	};

	const handleAccordionChangeTask = (taskId) => {
		setExpandedAccordionTask((prev) => (prev === taskId ? null : taskId));
	};

	const handleSelectedTask = async (task) => {
		setSelectedTask(task);
		setTaskAssignOpen(true);
	}

	const Schtype = async () => {
		fetchLink({ address: `taskManagement/project/schedule/newscheduleType` }).then((data) => {
			if (data.success) {
				
				setScheduleTypes(data.data);

			} else {
				toast.error(data.message);
			}
		});
	}



const fetchTasks = useCallback(async () => {
    if (!selectedProject?.Task_Type_Id) {
        return;
    }

    
    setIsLoading(true);
    try {
	
        const data = await fetchLink({ 
            address: `taskManagement/tasks/dropdown?Company_id=${companyId}`
        });
        if (data.success) {
            setTasks(data.data);
        } else {
            toast.error(data.message);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
}, [companyId, selectedProject?.Task_Type_Id]);


const fetchData = useCallback(async () => {
    try {
        const data = await fetchLink({
            address: `taskManagement/project/schedule/ListingDetails?Project_Id=${projectid}&Task_Type_Id=${selectedProject?.Task_Type_Id || ''}`
        });
        if (data.success) {
            setTaskData(data.data);
        } else {
            console.error('Failed to fetch task details:', data.message);
        }
    } catch (e) {
        console.error('Error fetching task details:', e);
    }
}, [projectid, selectedProject?.Task_Type_Id]);
	useEffect(() => {
    if (selectedProject?.Task_Type_Id) {
        fetchTasks();
        fetchData();
        Schtype();
    }
}, [reload, projectid, onReload, selectedProject?.Task_Type_Id]);


	const taskOptions = tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }));
	const handleviewTaskDetail = async (task) => {
		setTaskDetailsDialog(true);

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
	};




	const handleAssignTask = async () => {
		if (!taskScheduleInput.Task_Id || !taskScheduleInput.Sch_Type_Id) {
			toast.error("Please select a task and schedule type before saving.");
			return;
		}
		console.log("taskScheduleInput.Task_Est_End_Date",selectedProject?.Task_Type_Id)

		const requestData = {
			entryBy: entryBy,
			Project_Id: projectid,
			Sch_Type_Id: taskScheduleInput.Sch_Type_Id,
			Sch_Est_Start_Date: taskScheduleInput.Task_Est_Start_Date,
			Sch_Est_End_Date: taskScheduleInput.Task_Est_End_Date,
			 tasks: [{
        ...taskScheduleInput,
        Task_Group_Id: selectedProject?.Task_Type_Id 
    }]
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
				setTaskScheduleInput({})
				fetchData();
				onReload();
			}
			else if (response.status === 'warning') {
				toast.warn(response.message || "Task already exists for this project.");
			}
			else {

				toast.warn(response.message || "Task already exists for this project.");
			}
		} catch (error) {
			toast.error(error);
		}
	};

	const handleEditTask = (task) => {
		setSelectedTask(task);
		setEditDialogOpen(true);
	};


	const updatesTaskDetails = async (task) => {

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

				setUpdateDialogOpen(false)
				setIsedit(false)
				onReload();
			}
			else if (response.status === 'warning') {
				toast.warn(response.message || "Task already exists for this project.");
			}
			else {

				toast.warn(response.message || "Task already exists for this project.");
			}
		} catch (error) {
			toast.error(error);
		}
	};





	const handleTaskEdit = (task) => {

		setIsedit(true);
		setTaskScheduleInput(task);
		setUpdateDialogOpen(true);
	};

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
			toast.error(error);
		}
	};

	const setCloseTask = async () => {
		setDialogOpen(false);
		setTaskScheduleInput({});

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


	return (
		<>
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
						<div style={{ padding: '1px', display: 'flex' }}>
							<div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
								<label style={{ marginRight: '8px' }}>Sch_Type</label>
								<select
									value={taskScheduleInput.Sch_Type_Id || ''}
									onChange={handleSchTypeChange}
									className="cus-inpt"
									required
									style={{ marginLeft: '10px' }}
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
							onClick={() => updatesTaskDetails(taskScheduleInput)}
						>
							Save
						</Button>
					</DialogActions>
				</Dialog>
			)}


			<Dialog open={dialogOpen} fullWidth maxWidth="lg" PaperProps={{ style: { height: '75vh' } }}>
				<DialogTitle>
			
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span>
							{/* {selectedProject?.Project_Name}  */}
						
							 {selectedProject?.Task_Type} </span>
						<Button variant="contained" color="primary" onClick={() => setAssignDialogOpen(true)}>Assign Task</Button>
					</div>
				</DialogTitle>

	<Box sx={{ width: '100%', typography: 'body1' }}>
    {taskData.map((schedule, index) => {
        const scheduleTypes = schedule.SchTypes || [];
        
        return (
            <TabContext value={selectedTab} key={index}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleTabChange} aria-label="Schedule Types">
                        {Array.isArray(scheduleTypes) && scheduleTypes.length > 0 ? (
                            scheduleTypes.map((sch, schIndex) => (
                                <Tab
                                    key={`${sch.SchTypeId || schIndex}-${schIndex}`}
                                    label={sch.SchType || 'No SchType'}
                                    value={(sch.SchTypeId || schIndex).toString()}
                                    id={`tab-${sch.SchTypeId || schIndex}`}
                                    aria-controls={`tabpanel-${sch.SchTypeId || schIndex}`}
                                />
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ padding: 2 }}>
                                No Schedule Types Available
                            </Typography>
                        )}
                    </TabList>
                </Box>

                {Array.isArray(scheduleTypes) && scheduleTypes.map((sch, schIndex) => (
                    <TabPanel
                        key={`${sch.SchTypeId || schIndex}-${schIndex}`}
                        value={(sch.SchTypeId || schIndex).toString()}
                        id={`tabpanel-${sch.SchTypeId || schIndex}`}
                        aria-labelledby={`tab-${sch.SchTypeId || schIndex}`}
                    >
                        {/* Schedule Type Header with Task Counts */}
                        <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <Typography variant="body1" display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    Schedule Type: <strong>{sch.SchType}</strong>
                                </Box>
                                {sch.TaskCountsInSchType ? (
                                    <Box textAlign="right">
                                        {(() => {
                                            try {
                                                const taskCounts = JSON.parse(sch.TaskCountsInSchType);
                                                if (Array.isArray(taskCounts) && taskCounts.length > 0) {
                                                    return (
                                                        <>
                                                            Total Tasks: <strong>{taskCounts[0]?.TotalTasks || 0}</strong> / 
                                                            Completed Tasks: <strong>{taskCounts[0]?.CompletedTasks || 0}</strong>
                                                        </>
                                                    );
                                                }
                                            } catch (e) {
                                                console.error('Error parsing TaskCountsInSchType:', e);
                                            }
                                            return 'No task counts available';
                                        })()}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No task counts available
                                    </Typography>
                                )}
                            </Typography>
                        </Box>

                        {/* Tasks List - Handle cases where Tasks array might be missing */}
                        {Array.isArray(sch.Tasks) && sch.Tasks.length > 0 ? (
                            <TableContainer sx={{ maxHeight: '60vh', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Task Name</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Task Type</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Assigned Employees</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Assign</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                            <TableCell sx={{ backgroundColor: '#2C3E50', color: 'white', fontWeight: 'bold' }}>Details</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sch.Tasks.map((taskItem) => (
                                            <TableRow 
                                                key={`${taskItem.Task_Id}-${taskItem.Task_Levl_Id}-${taskItem.A_Id}`} 
                                                sx={{ 
                                                    backgroundColor: '#BBE6F6',
                                                    '&:hover': {
                                                        backgroundColor: '#a8dff0'
                                                    }
                                                }}
                                            >
                                                {/* Task Name */}
                                                <TableCell>
                                                    <Typography fontWeight="bold">
                                                        {taskItem?.Task_Name || 'DEFAULT TASK'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Task Description */}
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {taskItem.Task_Desc || 'No description'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Task Type */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography>{taskItem.Task_Type || 'No Type'}</Typography>
                                                        <IconButton 
                                                            onClick={() => handleTaskEdit(taskItem)} 
                                                            size="small"
                                                            sx={{ color: '#1976d2' }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    {taskItem.AssignedEmployees && Array.isArray(taskItem.AssignedEmployees) && taskItem.AssignedEmployees.length > 0 ? (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {taskItem.AssignedEmployees.map((employee, empIndex) => (
                                                                <Chip
                                                                    key={empIndex}
                                                                    label={employee.Name}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{ 
                                                                        margin: '1px', 
                                                                        color: 'green',
                                                                        borderColor: 'green'
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                                            No Employees Assigned
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                {/* Assign Button */}
                                                <TableCell>
                                                    <IconButton 
                                                        onClick={() => handleSelectedTask(taskItem)}
                                                        sx={{ color: '#2e7d32' }}
                                                    >
                                                        <LibraryAddIcon />
                                                    </IconButton>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <Chip 
                                                        label={taskItem.TaskSchStatus || 'New'} 
                                                        color={
                                                            taskItem.TaskSchStatus === 'Completed' ? 'success' : 
                                                            taskItem.TaskSchStatus === 'In Progress' ? 'warning' : 'default'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>

                                           
                                                <TableCell>
                                                    <IconButton 
                                                        onClick={() => handleEditTask(taskItem)}
                                                        sx={{ color: '#ed6c02' }}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </TableCell>


                                                <TableCell>
                                                    <IconButton 
                                                        onClick={() => handleviewTaskDetail(taskItem)}
                                                        sx={{ color: '#1976d2' }}
                                                    >
                                                        <ViewHeadlineSharpIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ 
                                textAlign: 'center', 
                                p: 3, 
                                backgroundColor: '#f5f5f5', 
                                borderRadius: 1,
                                border: '1px dashed #ccc'
                            }}>
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                    No Tasks Available
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    There are no tasks assigned to the <strong>{sch.SchType}</strong> schedule type.
                                </Typography>
                               
                            </Box>
                        )}
                    </TabPanel>
                ))}
            </TabContext>
        );
    })}
</Box>


				<DialogActions sx={{ marginTop: 'auto ', position: 'sticky', bottom: 0 }}>
					<Button variant="contained" color="primary" onClick={setCloseTask}>Close</Button>
				</DialogActions>

			</Dialog>


			<Dialog open={assignDialogOpen} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: '8px' } }}>
				<DialogTitle>Assign Task</DialogTitle>
				<DialogContent>
					<div style={{ padding: '1px', display: 'flex' }}>
						{/* <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}> */}
							{/* <label htmlFor="task-select" style={{ marginRight: '6px' }}>Select Group</label> */}
						<div style={{ padding: '1px', display: 'flex' }}>
  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
    <label htmlFor="task-group" style={{ marginRight: '6px' }}>Task Group</label>
    <select
      id="task-group"
      value={selectedProject?.Task_Type_Id || ''}
      className="cus-inpt"
      disabled
      style={{ 
        flex: 1, 
        marginRight: '8px',
        backgroundColor: '#f5f5f5',
        color: '#666',
        cursor: 'not-allowed'
      }}
    >
      <option value={selectedProject?.Task_Type_Id}>
        {selectedProject?.Task_Type}
      </option>
    </select>
  </div>
{/* </div> */}
							
						</div>
					</div>

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
								<Button variant="contained" color="primary">Create New</Button>
							</IconButton>
						</div>
					</div>

					<div style={{ padding: '1px', display: 'flex' }}>
						<div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
							<label style={{ marginRight: '8px' }}>Sch_Type</label>
							<select
								value={taskScheduleInput.Sch_Type_Id || ''}
								onChange={handleSchTypeChange}
								className="cus-inpt"
								required
								style={{ marginLeft: '10px' }}
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

			<TaskAssign
				open={taskAssignOpen}
				onClose={() => setTaskAssignOpen(false)}
				task={selectedTask}
				projectId={projectid}
				entryBy={entryBy}
				taskId={selectedTask}
				reload={reload}
				onReload={onReload}
			/>

			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Delete Task</DialogTitle>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
					{/* <Button onClick={deleteTaskFun} color="secondary">Delete</Button> */}
				</DialogActions>
			</Dialog>

			<TaskMasterMgt
				openAction={isDialogOpen}
				onCloseFun={() => setIsDialogOpen(false)}
				onTaskAdded={fetchTasks}
				Reload={reload}
				Task_Type_Id={selectedProject?.Task_Type_Id}
				Task_Type={selectedProject?.Task_Type}
			/>
			<TaskMasterMgt
				row={selectedTask}
				openAction={editDialogOpen}
				onCloseFun={() => setEditDialogOpen(false)}
				reload={fetchData}
				Reload={reload}
			/>
			<TaskIndividual
				open={taskDetailDialog}
				onClose={() => setTaskDetailsDialog(false)}
				taskDetails={taskDetails}
			/>

		</>
	);


}

export default ListingTask;

