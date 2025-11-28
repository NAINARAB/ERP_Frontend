import { useState, useEffect, useContext } from "react";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, Button, Box, Typography, Chip } from '@mui/material';
import { Edit, Delete, Launch, People, Add, Clear } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";
import ProjectForm from "../ProjectList/addEditProject";
import EmployeeManagementDialog from "../employeeManagement/employeeManagement";
import ListingTask from "../Tasks/taskDetails/listingTask";
import AddEditTaskType from "../../Components/tasktype/addEditTaskType";
import FilterableTable, { createCol } from "../../Components/filterableTable2"


const WorkDetails = ({
    open,
    onClose,
    projectId,
    projectName,
    parseData,
    taskId,
    contextObj
}) => {
    const [workData, setWorkData] = useState([]);
    const [filteredWorkData, setFilteredWorkData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nonTimerWorkDialog, setNonTimerWorkDialog] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null);
    const [nonTimerInput, setNonTimerInput] = useState({
        Work_Dt: '',
        Start_Time: '',
        End_Time: '',
        Work_Status: 2,
        Process_Id: 1,
        Work_Done: '',
        Det_string: []
    });
    const [processDetails, setProcessDetails] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        fromDate: '',
        toDate: ''
    });

    const initialWorkSaveValue = {
        Work_Dt: '',
        Start_Time: '',
        End_Time: '',
        Work_Status: 2,
        Process_Id: 1,
        Work_Done: '',
        Det_string: []
    };

    useEffect(() => {
        if (open && projectId) {
            fetchWorkDetails();
            fetchProcessDetails();
        }
    }, [open, projectId]);

    useEffect(() => {

        applyDateFilter();
    }, [workData, dateFilter]);

    const fetchWorkDetails = async () => {
        setLoading(true);
        try {

            const data = await fetchLink({
                address: `taskManagement/workDetailsTask?Project_Id=${projectId}&Task_Id=${taskId}`
            });

            if (data.success) {
                setWorkData(data.data || []);
            } else {
                toast.error("Failed to fetch work details");
                setWorkData([]);
            }
        } catch (error) {
            console.error("Error fetching work details:", error);
            toast.error("Error fetching work details");
            setWorkData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProcessDetails = async () => {
        try {
            const data = await fetchLink({
                address: `masters/processMaster`
            });
            if (data.success) {
                setProcessDetails(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching process details:", error);
            toast.error("Error fetching process details");
        }
    };

    const ISOString = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    const applyDateFilter = () => {
        if (!dateFilter.fromDate && !dateFilter.toDate) {
            setFilteredWorkData(workData);
            return;
        }

        const filtered = workData.filter(work => {
            const workDate = new Date(work.Work_Dt);
            let fromCondition = true;
            let toCondition = true;

            if (dateFilter.fromDate) {
                const fromDate = new Date(dateFilter.fromDate);
                fromCondition = workDate >= fromDate;
            }

            if (dateFilter.toDate) {
                const toDate = new Date(dateFilter.toDate);
                toDate.setHours(23, 59, 59, 999);
                toCondition = workDate <= toDate;
            }

            return fromCondition && toCondition;
        });

        setFilteredWorkData(filtered);
    };

    const handleDateFilterChange = (field, value) => {
        setDateFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearDateFilter = () => {
        setDateFilter({
            fromDate: '',
            toDate: ''
        });
    };

    const handleEditWork = (work) => {
        setSelectedWork(work);
        setNonTimerInput({
            Work_Dt: work.Work_Dt || '',
            Start_Time: work.Start_Time || '',
            End_Time: work.End_Time || '',
            Work_Status: work.Work_Status === 3 || work.WorkStatus === 'COMPLETED' ? 3 : 2,
            Process_Id: work.Process_Id || 1,
            Work_Done: work.Work_Done || '',
            Det_string: work.Det_string || work.Param_Dts || []
        });
        setIsEdit(true);
        setNonTimerWorkDialog(true);
    };

    const handleNonTimerInputChange = (e, param) => {
        const { value } = e.target;
        setNonTimerInput(prev => {
            const existingIndex = prev.Det_string.findIndex(item =>
                Number(item.Param_Id) === Number(param.Param_Id)
            );

            if (existingIndex >= 0) {
                const updatedDetString = [...prev.Det_string];
                updatedDetString[existingIndex] = {
                    ...updatedDetString[existingIndex],
                    Current_Value: value
                };
                return {
                    ...prev,
                    Det_string: updatedDetString
                };
            } else {
                return {
                    ...prev,
                    Det_string: [
                        ...prev.Det_string,
                        {
                            Task_Id: taskId,
                            Param_Id: param.Param_Id,
                            Default_Value: '',
                            Current_Value: value
                        }
                    ]
                };
            }
        });
    };

    const saveNonTimerBasedTask = async (e) => {
        e.preventDefault();

        try {

            const payload = {
                Mode: isEdit ? 2 : 1,
                Work_Id: isEdit ? selectedWork.Work_Id : 0,
                Project_Id: projectId,
                Sch_Id: selectedWork?.Sch_Id || "1",
                Task_Levl_Id: selectedWork?.Task_Levl_Id || "1",
                Task_Id: taskId,
                AN_No: selectedWork?.AN_No || "1",
                Emp_Id: parseInt(parseData?.UserId),
                Process_Id: parseInt(nonTimerInput.Process_Id) || 1,
                Work_Dt: nonTimerInput.Work_Dt,
                Work_Done: nonTimerInput.Work_Done,
                Start_Time: nonTimerInput.Start_Time,
                End_Time: nonTimerInput.End_Time,
                Work_Status: parseInt(nonTimerInput.Work_Status),
                Entry_By: parseInt(parseData?.UserId),
                Entry_Date: new Date(),
                Det_string: nonTimerInput.Det_string.length > 0 ? nonTimerInput.Det_string : null,
                Additional_Project: projectName || '',
                Additional_Task: selectedWork?.Task_Name || ''
            };

            const data = await fetchLink({
                address: `taskManagement/task/work`,
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                bodyData: payload
            });

            if (data.success) {
                toast.success(`Work ${isEdit ? 'updated' : 'saved'} successfully!`);
                setNonTimerWorkDialog(false);
                setNonTimerInput(initialWorkSaveValue);
                setIsEdit(false);
                setSelectedWork(null);
                fetchWorkDetails();
            } else {
                toast.error(`Failed to ${isEdit ? 'update' : 'save'} work: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving work:', error);
            toast.error(`Error ${isEdit ? 'updating' : 'saving'} work`);
        }
    };

    const workDetailsColumns = [
        createCol("EmployeeName", "string", "Employee", "left", "center", 1),
        createCol("Task_Name", "string", "Task Type", "left", "center", 1),
        createCol("Work_Done", "string", "Work Done", "left", "center", 1),
        {
            Field_Name: "Start_Time",
            ColumnHeader: "Start Time",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Start_Time ? (row.Start_Time) : "N/A"
        },
        {
            Field_Name: "End_Time",
            ColumnHeader: "End Time",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.End_Time ? (row.End_Time) : "N/A"
        },
        {
            Field_Name: "Total_Hours",
            ColumnHeader: "Hours Worked",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => {
                const totalMinutes = row.Tot_Minutes || 0;

                // Convert minutes to hours and minutes
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                // Format the display
                let displayText = '';
                if (hours > 0 && minutes > 0) {
                    displayText = `${hours}h ${minutes}m`;
                } else if (hours > 0) {
                    displayText = `${hours}h`;
                } else if (minutes > 0) {
                    displayText = `${minutes}m`;
                } else {
                    displayText = '0h';
                }

                return (
                    <Chip
                        label={displayText}
                        color="primary"
                        size="small"
                    />
                );
            }
        },
        {
            Field_Name: "Status",
            ColumnHeader: "Status",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => {
                const status = row.Work_Status === 3 || row.WorkStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING';
                return (
                    <Chip
                        label={status}
                        color={status === 'COMPLETED' ? "success" : "warning"}
                        size="small"
                    />
                );
            }
        },
        ...(Number(contextObj?.Add_Rights) === 1 ? [{
            Field_Name: "Action",
            ColumnHeader: "Action",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <Tooltip title="Edit Work">
                            <IconButton
                                size="small"
                                onClick={() => handleEditWork(row)}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }] : [])
    ];

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2 d-flex justify-content-between align-items-center">
                    <span>Work Details - {projectName}</span>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {/* Date Filter Section */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', backgroundColor: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                            <Typography variant="body2" sx={{ color: 'black', fontWeight: 'bold' }}>
                                Filter:
                            </Typography>
                            <input
                                type="date"
                                value={dateFilter.fromDate}
                                onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
                                className="cus-inpt"
                                style={{ width: '140px', fontSize: '12px' }}
                                placeholder="From Date"
                            />
                            <Typography variant="body2" sx={{ color: 'black' }}>
                                to
                            </Typography>
                            <input
                                type="date"
                                value={dateFilter.toDate}
                                onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
                                className="cus-inpt"
                                style={{ width: '140px', fontSize: '12px' }}
                                placeholder="To Date"
                                min={dateFilter.fromDate}
                            />
                            {(dateFilter.fromDate || dateFilter.toDate) && (
                                <Tooltip title="Clear Filter">
                                    <IconButton
                                        size="small"
                                        onClick={clearDateFilter}
                                        sx={{ color: 'black' }}
                                    >
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent className="p-4">
                    {loading ? (
                        <Typography variant="body1" align="center">
                            Loading work details...
                        </Typography>
                    ) : filteredWorkData.length > 0 ? (
                        <FilterableTable
                            title={`Work Details (${filteredWorkData.length} records)`}
                            dataArray={filteredWorkData}
                            EnableSerialNumber={true}
                            columns={workDetailsColumns}
                            ButtonArea={null}
                            isExpendable={false}
                            tableMaxHeight={400}
                        />
                    ) : (
                        <Typography variant="body1" align="center" color="textSecondary">
                            {workData.length === 0
                                ? "No work details found for this project."
                                : "No work details found for the selected date range."}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} variant="contained" color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={nonTimerWorkDialog}
                maxWidth="sm"
                fullWidth
                onClose={() => {
                    setNonTimerWorkDialog(false);
                    setNonTimerInput(initialWorkSaveValue);
                    setIsEdit(false);
                    setSelectedWork(null);
                }}
            >
                <DialogTitle>{isEdit ? 'Edit' : 'Save'} Task Progress</DialogTitle>

                <form onSubmit={saveNonTimerBasedTask}>
                    <DialogContent className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle', width: '30%' }}>
                                        Project Name
                                    </td>
                                    <td className="border-0 fa-14" style={{ width: '70%' }}>
                                        <div className="cus-inpt w-100" style={{
                                            padding: '8px 12px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: '#f5f5f5',
                                            minHeight: '38px'
                                        }}>
                                            {projectName || 'No project name'}
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Task Name
                                    </td>
                                    <td className="border-0 fa-14">
                                        <div className="cus-inpt w-100" style={{
                                            padding: '8px 12px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: '#f5f5f5',
                                            minHeight: '38px'
                                        }}>
                                            {selectedWork?.Task_Name || 'No task name'}
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Work Date
                                    </td>
                                    <td className="border-0 fa-14">
                                        <input
                                            type="date"
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Work_Dt: e.target.value })}
                                            value={ISOString(nonTimerInput?.Work_Dt)}
                                            className="cus-inpt w-100"
                                            required
                                        />
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
                                            className="cus-inpt w-100"
                                            required
                                        />
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
                                            value={nonTimerInput?.End_Time}
                                            required
                                            className="cus-inpt w-100"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Work Status
                                    </td>
                                    <td className="border-0 fa-14">
                                        <select
                                            className="cus-inpt w-100"
                                            value={nonTimerInput?.Work_Status}
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Work_Status: parseInt(e.target.value) })}
                                        >
                                            <option value={2}>PENDING</option>
                                            <option value={3}>COMPLETED</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'middle' }}>
                                        Process
                                    </td>
                                    <td className="border-0 fa-14">
                                        <select
                                            className="cus-inpt w-100"
                                            value={nonTimerInput.Process_Id}
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Process_Id: parseInt(e.target.value) })}
                                        >
                                            <option value={0}>Select Process</option>
                                            {processDetails.map(process => (
                                                <option key={process.Id} value={process.Id}>
                                                    {process.Process_Name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14" style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                                        Work Summary
                                    </td>
                                    <td className="border-0 fa-14">
                                        <textarea
                                            rows="4"
                                            className="cus-inpt w-100"
                                            required
                                            value={nonTimerInput?.Work_Done}
                                            onChange={e => setNonTimerInput({ ...nonTimerInput, Work_Done: e.target.value })}
                                        />
                                    </td>
                                </tr>
                                {selectedWork?.Param_Dts?.map((param, index) => (
                                    <tr key={index}>
                                        <td className="border-0 fa-14" style={{ verticalAlign: 'middle', paddingTop: '12px' }}>
                                            {param?.Paramet_Name}
                                        </td>
                                        <td className="border-0 fa-14">
                                            <input
                                                type={param?.Paramet_Data_Type || 'text'}
                                                className="cus-inpt w-100"
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
                            variant='outlined'
                            color="error"
                            type='button'
                            onClick={() => {
                                setNonTimerWorkDialog(false);
                                setNonTimerInput(initialWorkSaveValue);
                                setIsEdit(false);
                                setSelectedWork(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            color='success'
                            type='submit'
                        >
                            {isEdit ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};

const ActiveProjects = () => {
    const [reload, setReload] = useState(false);
    const [projects, setProjects] = useState([]);
    const [projectAlldata, setProjectAlldata] = useState([]);
    const { contextObj } = useContext(MyContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [projectId, setProjectId] = useState(0);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
    const [listingTaskDialogOpen, setListingTaskDialogOpen] = useState(false);
    const [taskModuleDialog, setTaskModuleDialog] = useState(false);
    const [module, setModule] = useState([]);
    const [isEditTaskType, setIsEditTaskType] = useState(false);
    const [workDetailsDialog, setWorkDetailsDialog] = useState(false);
    const [taskId, setTaskId] = useState(0)
    const parseData = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchProjects();
        fetchProjectData();
    }, [parseData?.Company_id, reload]);

    const handleReloadProjects = () => {
        setReload(prev => !prev);
    };

    const fetchProjects = async () => {
        try {
            let EmpId = "";

            if (parseData?.UserType == "ADMIN" || parseData?.UserTypeId == 0 || parseData?.UserTypeId == 1) {
                EmpId = "";
            } else {
                EmpId = parseData?.UserId || "";
            }

            const data = await fetchLink({
                address: `taskManagement/project/newProjectAbstract?Company_id=${parseData?.Company_id}&EmpId=${EmpId}`
            });

            setProjects(data.success ? data.data : []);
        } catch (e) {
            console.error(e);
            setProjects([]);
        }
    };

    const fetchProjectData = async () => {
        try {
            const data = await fetchLink({
                address: `taskManagement/project?Company_id=${parseData?.Company_id}`
            });
            setProjectAlldata(data.success ? data.data : []);
        } catch (e) {
            console.error(e);
            setProjectAlldata([]);
        }
    };

    const deleteFun = () => {
        if (projectToDelete) {
            fetchLink({
                address: `taskManagement/project`,
                method: 'DELETE',
                bodyData: { Project_Id: projectToDelete?.Project_Id },
            }).then(data => {
                if (data.success) {
                    setReload(!reload);
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            }).catch(e => console.error('Fetch Error:', e));
        }
        setDeleteDialog(false);
    };

    const calcPercentage = (task, completed) => (Number(task) === 0 ? 0 : ((Number(completed) / Number(task)) * 100).toFixed(0));

    const handleOpenCreateDialog = () => {
        setSelectedProject(null);
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleOpenEditDialog = project => {
        setSelectedProject(project);
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleOpenDeleteDialog = project => {
        setProjectToDelete(project);
        setDeleteDialog(true);
    };

    const handleOpenListingTaskDialog = project => {
        setSelectedProject(project);
        setProjectId(project.Project_Id);
        setListingTaskDialogOpen(true);
    };

    const handleWorkDetailsDialog = project => {

        setSelectedProject(project);
        setProjectId(project.Project_Id);
        setTaskId(project.Task_Type_Id)
        setWorkDetailsDialog(true);
    };

    const handleModuleAdd = (project) => {
        const taskTypeWithProject = {
            ProjectId: project.Project_Id,
            ProjectName: project.Project_Name,
            Est_StartDate: project.Est_Start_Dt ? new Date(project.Est_Start_Dt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            Est_EndDate: project.Est_End_Dt ? new Date(project.Est_End_Dt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            Day_Duration: "",
            Time_Duration: "",
            Task_Type: "",
            Task_Type_Id: "",
            Status: "1"
        };
        setModule(taskTypeWithProject);
        setIsEditTaskType(false);
        setTaskModuleDialog(true);
    };

    const handleEditTaskType = (taskType) => {
        const taskTypeWithProject = {
            ProjectId: taskType.Project_Id,
            ProjectName: taskType.Project_Name,
            Est_StartDate: taskType.Est_StartTime ? new Date(taskType.Est_StartTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            Est_EndDate: taskType.Est_EndTime ? new Date(taskType.Est_EndTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            Day_Duration: taskType.Day_Duration,
            Hours_Duration: taskType.Hours_Duration,
            Task_Type: taskType.Task_Type,
            Task_Type_Id: taskType.Task_Type_Id,
            Status: taskType.Status?.toString() || "1"
        };
        setModule(taskTypeWithProject);
        setIsEditTaskType(true);
        setTaskModuleDialog(true);
    };

    const handleCloseDialogs = () => {
        setDialogOpen(false);
        setListingTaskDialogOpen(false);
        setWorkDetailsDialog(false);
        setSelectedProject(null);
        setProjectToDelete(null);
        setDeleteDialog(false);
        setTaskModuleDialog(false);
        setIsEditTaskType(false);
    };

    const handleOpenEmployeeDialog = projectId => {
        setProjectId(projectId);
        setEmployeeDialogOpen(true);
    };

    const handleCreate = async (taskTypeData) => {
        try {
            const data = await fetchLink({
                address: `masters/taskType`,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                bodyData: {
                    Mode: 1,
                    Task_Type: taskTypeData.Task_Type,
                    Project_Id: parseInt(taskTypeData.ProjectId) || parseInt(taskTypeData.Project_Id),
                    Est_StartDate: taskTypeData.Est_StartDate,
                    Est_EndDate: taskTypeData.Est_EndDate,
                    Status: parseInt(taskTypeData.Status),
                    Day_Duration: parseInt(taskTypeData.Day_Duration) || 0,
                    Hours_Duration: parseInt(taskTypeData.Hours_Duration) || 0
                },
            });
            if (data.success) {
                setReload(!reload);
                toast.success("Task type created successfully!");
                setTaskModuleDialog(false);
            } else {
                toast.error("Failed to create task type: " + data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating task type.");
        }
    };

    const handleUpdate = async (updatedTaskType) => {
        try {
            const data = await fetchLink({
                address: `masters/taskType`,
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                bodyData: {
                    Mode: 2,
                    Task_Type_Id: parseInt(updatedTaskType.Task_Type_Id),
                    Task_Type: updatedTaskType.Task_Type,
                    Project_Id: parseInt(updatedTaskType.Project_Id),
                    Est_StartDate: updatedTaskType.Est_StartDate,
                    Est_EndDate: updatedTaskType.Est_EndDate,
                    Status: parseInt(updatedTaskType.Status),
                    Day_Duration: parseInt(updatedTaskType.Day_Duration) || 0,
                    Hours_Duration: parseInt(updatedTaskType.Hours_Duration) || 0
                },
            });
            if (data.success) {
                setReload(!reload);
                toast.success("Task type updated successfully!");
                setTaskModuleDialog(false);
            } else {
                toast.error("Failed to update task type: " + data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating task type.");
        }
    };

    const tableData = projects.map(project => {
        console.log("projecr", project)
        const projectData = projectAlldata.find(p => p.Project_Id === project.Project_Id);
        return {
            ...project,
            Project_Head_Name: projectData?.Project_Head_Name || "-",
            Status_Text: projectData?.Status || project.Status || "-",
            Progress_Percentage: calcPercentage(project.SchedulesCount, project.SchedulesCompletedCount)
        };
    });

    const innerColumns = [
        createCol("Task_Type", "string", "Task Group", "left", "center", 1),
        {
            Field_Name: "Days",
            ColumnHeader: "Days",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Day_Duration ? row.Day_Duration : "-"
        },
        {
            Field_Name: "Hours",
            ColumnHeader: "Hours",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Hours_Duration ? row.Hours_Duration : "-"
        },
        {
            Field_Name: "Total_Worked_Minutes",
            ColumnHeader: "Total Worked Hours",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Total_Worked_Hours ? row.Total_Worked_Hours : "-"
        },
        {
            Field_Name: "Remainging Hours",
            ColumnHeader: "Remaining Hours",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Remaining_Time ? row.Remaining_Time : "-"
        },
        {
            Field_Name: "Est_StartTime",
            ColumnHeader: "Start Date",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Est_StartTime ? row.Est_StartTime.split('T')[0] : "N/A"
        },

        {
            Field_Name: "Est_EndTime",
            ColumnHeader: "End Date",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Est_EndTime ? row.Est_EndTime.split('T')[0] : "N/A"
        },
        {
            Field_Name: "TotalTasks",
            ColumnHeader: "TotalTasks",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.TotalTasks ? row.TotalTasks : "0"
        },
        {
            Field_Name: "CompletedTasks",
            ColumnHeader: "CompletedTasks",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.CompletedTasks ? row.CompletedTasks : "0"
        },
        {
            Field_Name: "Percentage",
            ColumnHeader: "Percentage",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => {




                const percentage = row.CompletionPercentage ||
                    row.completionPercentage ||
                    row.percentage ||
                    row.Percentage ||
                    row.original?.CompletionPercentage ||
                    0;

                return percentage + "%";
            }
        },
        {
            Field_Name: "Status",
            ColumnHeader: "Status",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Chip
                    label={row.Status === 1 ? "Active" : "Inactive"}
                    color={row.Status === 1 ? "success" : "default"}
                    size="small"
                />
            )
        },
        {
            Field_Name: "View Task",
            ColumnHeader: "View Task",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View Task Details">
                        <IconButton
                            size="small"
                            onClick={() => handleOpenListingTaskDialog({ ...row, Project_Name: row.Project_Name || "Task" })}
                        >
                            <Launch fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        {
            Field_Name: "Work Details",
            ColumnHeader: "Work Details",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View Work Details">
                        <IconButton
                            size="small"
                            onClick={() => handleWorkDetailsDialog({ ...row, Project_Name: row.Project_Name || "Task" })}
                        >
                            <Launch fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        ...(Number(contextObj?.Add_Rights) === 1 ? [{
            Field_Name: "Actions",
            ColumnHeader: "Actions",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <Tooltip title="Edit Task Type">
                            <IconButton
                                size="small"
                                onClick={() => handleEditTaskType(row)}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }] : [])
    ];

    const ExpandableComponent = ({ row }) => {
        const [isExpanded, setIsExpanded] = useState(true);
        const taskTypes = row.TaskTypes || [];

        useEffect(() => {
            setIsExpanded(true);
        }, [taskTypes.length, reload]);

        if (!isExpanded) return null;




        return (
            <Box sx={{ padding: 2, backgroundColor: '#f8f9fa', margin: 1, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                        Modules for {row.Project_Name}
                    </Typography>
                    {(
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => {
                                handleModuleAdd(row);
                                setIsExpanded(true);
                            }}
                            sx={{ textTransform: 'none' }}
                        >
                            Add Task Group
                        </Button>
                    )}
                </Box>

                <FilterableTable
                    title="Modules"
                    dataArray={taskTypes}
                    EnableSerialNumber={true}
                    columns={innerColumns}
                    ButtonArea={null}
                    isExpendable={false}
                    tableMaxHeight={300}
                />
            </Box>
        );
    };

    const columns = [
        createCol("Project_Name", "string", "Project", "left", "center", 1),
        createCol("Project_Head_Name", "string", "Head", "left", "center", 1),
        {
            Field_Name: "Est_Start_Dt",
            ColumnHeader: "Start Date",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Est_Start_Dt ? new Date(row.Est_Start_Dt).toLocaleDateString('en-IN') : "N/A"
        },
        {
            Field_Name: "Est_End_Dt",
            ColumnHeader: "End Date",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => row.Est_End_Dt ? new Date(row.Est_End_Dt).toLocaleDateString('en-IN') : "N/A"
        },
        {
            Field_Name: "Progress_Percentage",
            ColumnHeader: "Progress",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" fontWeight="bold">
                    {row.Progress_Percentage}%
                </Typography>
            )
        },

        {
            Field_Name: "Task_Details",
            ColumnHeader: "Task Group",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="h6" fontWeight="bold">

                        {row.TaskGroupCount || 0} / {row.CompletedTaskGroupCount || 0}

                        <Tooltip title="View Task Details">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenListingTaskDialog(row)}
                                sx={{ mt: 0.5 }}
                            >
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Total / Completed
                    </Typography>
                </Box>
            )
        },
        {
            Field_Name: "Employees",
            ColumnHeader: "Employees",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    {Number(contextObj?.Add_Rights) === 1 && (
                        <Tooltip title="Manage Employees">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenEmployeeDialog(row.Project_Id)}
                            >
                                <People fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Typography variant="body2">
                        {row.EmployeesInvolved}
                    </Typography>
                </Box>
            )
        },
        ...(Number(contextObj?.Add_Rights) === 1 ? [{
            Field_Name: "Actions",
            ColumnHeader: "Actions",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <Tooltip title="Edit Project">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(row)}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <Tooltip title="Delete Project">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(row)}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }] : [])
    ];

    return (
        <>

            <FilterableTable
                title="Active Projects"
                dataArray={tableData}
                EnableSerialNumber={true}
                columns={columns}
                ButtonArea={
                    <>
                        {Number(contextObj?.Add_Rights) === 1 && (
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={handleOpenCreateDialog}
                            >
                                Create Project
                            </Button>
                        )}
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={(props) => <ExpandableComponent {...props} />}
            />


            <WorkDetails
                open={workDetailsDialog}
                onClose={() => setWorkDetailsDialog(false)}
                projectId={projectId}
                projectName={selectedProject?.Project_Name || "Project"}
                parseData={parseData}
                taskId={taskId}
                contextObj={contextObj}
            />

            <ListingTask
                onClose={handleCloseDialogs}
                dialogOpen={listingTaskDialogOpen}
                setDialogOpen={setListingTaskDialogOpen}
                isEdit={false}
                parseData={parseData}
                projectid={projectId}
                onReload={handleReloadProjects}
                selectedProject={selectedProject}
                reload={reload}
            />

            <ProjectForm
                open={dialogOpen}
                onClose={handleCloseDialogs}
                inputValue={selectedProject}
                isEdit={isEdit}
                setReload={handleReloadProjects}
                projectData={projectId}
            />

            <EmployeeManagementDialog
                open={employeeDialogOpen}
                onClose={() => setEmployeeDialogOpen(false)}
                projectId={projectId}
                onReload={handleReloadProjects}
            />

            <AddEditTaskType
                open={taskModuleDialog}
                onClose={() => setTaskModuleDialog(false)}
                existingTaskType={module}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                isEdit={isEditTaskType}
            />

            <Dialog
                open={deleteDialog}
                onClose={handleCloseDialogs}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">Confirmation</DialogTitle>
                <DialogContent className="p-4">
                    Do you want to delete the project
                    <span className="text-primary">{" " + projectToDelete?.Project_Name + " "}</span>?
                </DialogContent>
                <DialogActions>
                    <button onClick={() => setDeleteDialog(false)} className="btn btn-secondary fa-13 shadow">
                        Cancel
                    </button>
                    <button onClick={deleteFun} className="btn btn-danger fa-13 shadow">
                        Delete
                    </button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ActiveProjects;