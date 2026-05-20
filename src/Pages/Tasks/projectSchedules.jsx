import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, FormControl } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Id: "",
    process: ""
};

const taskInitialState = {
    Id: "",
    Task_Name: "",
    Task_Type: "",
    Task_Sch_Duaration: "",
    Task_Start_Time: "",
    Task_End_Time: "",
    Task_Est_Start_Date: "",
    Task_Est_End_Date: "",
    sch_Project_Id: "",
    Project_Name: "",
    Type_Task_Id: "",
    Task_Sch_Status_Id: "",
    Task_Sch_Status: ""
};

function ProjectSchedules() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);
    const [process, setProcess] = useState([]);
    const [createProcess, setCreateProcess] = useState("");
    const storage = JSON.parse(localStorage.getItem("user"));
    const [projectsWithMissing, setProjectsWithMissing] = useState([]);
    const [editTaskDialog, setEditTaskDialog] = useState(false);
    const [taskInputValue, setTaskInputValue] = useState(taskInitialState);
    const [projects, setProjects] = useState([]);
    const [taskTypes, setTaskTypes] = useState([]);
    const [loadingTaskTypes, setLoadingTaskTypes] = useState(false);

    useEffect(() => {
        fetchLink({ address: `taskManagement/task/projectScheduleAbstract` })
            .then((data) => {
                if (data.success) setProcess(data.data);
            })
            .catch((e) => console.error(e));

        fetchProjects();
    }, [reload]);

    const fetchProjects = () => {
        fetchLink({ address: `taskManagement/project/dropDown?Company_id=${storage?.Company_id}&include_all=true` })
            .then((data) => {
                if (data.success) setProjects(data.data);
            })
            .catch((e) => console.error(e));
    };


    const fetchTaskTypes = (projectId) => {
        if (!projectId) {
            setTaskTypes([]);
            return;
        }

        setLoadingTaskTypes(true);
        fetchLink({ address: `taskManagement/taskType/dropdown?Project_Id=${projectId}` })
            .then((data) => {
                if (data.success) {
                    setTaskTypes(data.data || []);
                } else {
                    setTaskTypes([]);
                    toast.error("Failed to fetch task types");
                }
            })
            .catch((e) => {
                console.error(e);
                setTaskTypes([]);
                toast.error("Error fetching task types");
            })
            .finally(() => {
                setLoadingTaskTypes(false);
            });
    };

    const handleDelete = () => {
        fetchLink({
            address: `masters/processMaster`,
            method: "DELETE",
            bodyData: { Id: inputValue.Id }
        })
            .then((data) => {
                if (data.success) {
                    setReload(!reload);
                    setOpen(false);
                    toast.success("Process deleted successfully!");
                } else {
                    toast.error("Failed to delete Process: " + data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    useEffect(() => {
        if (editTaskDialog && taskInputValue.sch_Project_Id && taskInputValue.Project_Name) {
            const projectExists = projects.some(p => p.Project_Id == taskInputValue.sch_Project_Id);
            if (!projectExists) {
                const missingProject = {
                    Project_Id: taskInputValue.sch_Project_Id,
                    Project_Name: taskInputValue.Project_Name
                };
                setProjectsWithMissing([...projects, missingProject]);
            } else {
                setProjectsWithMissing(projects);
            }
        } else {
            setProjectsWithMissing(projects);
        }
    }, [projects, editTaskDialog, taskInputValue.sch_Project_Id, taskInputValue.Project_Name]);

    const handleCreate = () => {
        if (!createProcess.trim()) {
            toast.error("Please enter a Process");
            return;
        }
        fetchLink({
            address: `masters/processMaster`,
            method: "POST",
            bodyData: { Process_Name: createProcess.trim() }
        })
            .then((data) => {
                if (data.success) {
                    setIsCreateDialogOpen(false);
                    setReload(!reload);
                    toast.success(data.message);
                    setCreateProcess("");
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const editRow = (row) => {
        setInputValue({
            Id: row.Id,
            process: row.Process_Name
        });
        setEditUser(true);
    };

    const editProjectTask = (row) => {


        const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
            if (dateString.includes('T')) {
                return dateString.split('T')[0];
            }
            return dateString;
        };

        const formatTimeForInput = (timeString) => {
            if (!timeString) return "";
            if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
            if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
                return timeString.split(':').slice(0, 2).join(':');
            }
            return timeString;
        };

        setTaskInputValue({
            Id: row.Task_Id,
            Levl_Id: row.Levl_Id,
            Task_Name: row.Task_Name || "",
            Project_Name: row.Project_Name || "",
            Sch_Id: row.Sch_Id || "",
            sch_Project_Id: row.Sch_Project_Id || "",
            Sch_Type_Id: row.Sch_Type_Id || "",
            Task_Type: row.Task_Type || "",
            Task_Levl_Id: row.Task_Levl_Id || "",
            Task_Id: row.Task_Id || "",
            Task_Sch_Status: row.Task_Sch_Status || "",
            Type_Task_Id: row.Type_Task_Id || "", // Make sure this is set
            Task_Sch_Duaration: formatTimeForInput(row.Task_Sch_Duaration) || "",
            Task_Start_Time: formatTimeForInput(row.Task_Start_Time) || "",
            Task_End_Time: formatTimeForInput(row.Task_End_Time) || "",
            Task_Est_Start_Date: formatDateForInput(row.Task_Est_Start_Date) || "",
            Task_Est_End_Date: formatDateForInput(row.Task_Est_End_Date) || "",
            Task_Sch_Status: row.Task_Sch_Status
        });

        if (row.Sch_Project_Id) {
            fetchTaskTypes(row.Sch_Project_Id);
        }

        setEditTaskDialog(true);
    };

    const handleTaskEdit = () => {
        const {
            Id,
            Task_Name,
            Task_Type,
            Levl_Id,
            Sch_Id,
            Type_Task_Id,
            Sch_Type_Id,
            Task_Levl_Id,
            Task_Sch_Duaration,
            Task_Start_Time,
            Task_End_Time,
            Task_Est_Start_Date,
            Task_Est_End_Date,
            sch_Project_Id,
            Task_Sch_Status
        } = taskInputValue;



        if (!Task_Name || !Type_Task_Id || !sch_Project_Id) {
            toast.error("Please fill all required fields");
            return;
        }

        fetchLink({
            address: `taskManagement/task/updateTask`,
            method: "PUT",
            bodyData: {
                Id,
                Task_Name,
                Levl_Id,
                Task_Type,
                Sch_Id,
                Sch_Type_Id,
                Type_Task_Id: Type_Task_Id,
                Task_Levl_Id,
                Task_Sch_Duaration,
                Task_Start_Time,
                Task_End_Time,
                Task_Est_Start_Date,
                Task_Est_End_Date,
                sch_Project_Id,
                Task_Sch_Status
            }
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Task updated successfully!");
                    setReload(!reload);
                    setEditTaskDialog(false);
                    setTaskInputValue(taskInitialState);
                    setTaskTypes([]);
                } else {
                    toast.error("Failed to update task: " + data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const handleEdit = () => {
        const { Id, process } = inputValue;
        if (!process) {
            toast.error("Process cannot be empty");
            return;
        }

        fetchLink({
            address: `taskManagement/processMaster`,
            method: "PUT",
            bodyData: { Id, Process_Name: process }
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    setEditUser(false);
                    setInputValue(initialState);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const handleProjectChange = (e) => {
        const selectedProjectId = e.target.value;
        const selectedProject = projects.find(p => p.Project_Id == selectedProjectId);

        setTaskInputValue({
            ...taskInputValue,
            sch_Project_Id: selectedProjectId,
            Project_Name: selectedProject?.Project_Name || "",
            Task_Type: ""
        });

        fetchTaskTypes(selectedProjectId);
    };

    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Project Schedule
                    <div className="text-end">
                        {/* <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create Process
                        </Button> */}
                    </div>
                </div>

                <FilterableTable
                    dataArray={process}
                    EnableSerialNumber={true}
                    maxHeightOption

                    columns={[
                        createCol("Project_Name", "string", "Project_Name"),
                        createCol("Project_Desc", "string", "Project_Desc"),
                        {
                            ColumnHeader: "Actions",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <td className="fa-12" style={{ minWidth: "80px" }}>
                                    <IconButton onClick={() => editRow(row)} size="small">
                                        <Edit className="fa-in" />
                                    </IconButton>
                                    {/* <IconButton
                                        onClick={() => {
                                            setOpen(true);
                                            setInputValue({ Id: row.Id });
                                        }}
                                        size="small"
                                        color="error"
                                    > */}
                                    {/* <Delete className="fa-in" /> */}
                                    {/* </IconButton> */}
                                </td>
                            )
                        }
                    ]}
                    isExpendable={true}
                    expandableComp={({ row }) => (
                        <FilterableTable
                            headerFontSizePx={13}
                            bodyFontSizePx={12}
                            dataArray={(row?.Tasks)}
                            EnableSerialNumber
                            columns={[
                                createCol('Task_Name', 'string', 'Task_Name'),
                                createCol('Task_Type', 'string', 'Task_Type'),
                                createCol('Project_Name', 'string', 'Project_Name'),
                                createCol('Task_Sch_Duaration', 'number', 'Task_Sch_Duaration'),
                                createCol('Task_Start_Time', 'string', 'Task_Start_Time'),
                                createCol('Task_End_Time', 'string', 'Task_End_Time'),
                                createCol('Task_Est_Start_Date', 'date', 'Task_Est_Start_Date'),
                                createCol('Task_Est_End_Date', 'date', 'Task_Est_End_Date'),
                                {
                                    ColumnHeader: "Actions",
                                    isVisible: 1,
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            <IconButton onClick={() => editProjectTask(row)} size="small">
                                                <Edit className="fa-in" />
                                            </IconButton>
                                            {/* <IconButton
                                                onClick={() => {
                                                    setOpen(true);
                                                    setInputValue({ Id: row.Id });
                                                }}
                                                size="small"
                                                color="error"
                                            >
                                                <Delete className="fa-in" />
                                            </IconButton> */}
                                        </td>
                                    )
                                }
                            ]}
                        />
                    )}
                />
            </div>


            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            >
                <DialogTitle>Process Creation</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Process Name</label>
                        <input
                            type="text"
                            value={createProcess}
                            onChange={(e) => setCreateProcess(e.target.value)}
                            className="cus-inpt"
                            placeholder="Enter Process Name"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleCreate} color="success">Create</MuiButton>
                </DialogActions>
            </Dialog>


            <Dialog
                open={editUser}
                onClose={() => {
                    setEditUser(false);
                    setInputValue(initialState);
                }}
            >
                <DialogTitle>Edit Process</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Process Name</label>
                        <input
                            type="text"
                            value={inputValue.process}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, process: e.target.value })
                            }
                            className="cus-inpt"
                            placeholder="Enter Process Name"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditUser(false);
                        setInputValue(initialState);
                    }}>Cancel</MuiButton>
                    <MuiButton onClick={handleEdit} color="success">Update</MuiButton>
                </DialogActions>
            </Dialog>


            <Dialog
                open={editTaskDialog}
                onClose={() => {
                    setEditTaskDialog(false);
                    setTaskInputValue(taskInitialState);
                    setTaskTypes([]);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
                    <div className="p-2 d-flex flex-column gap-3">
                        <FormControl fullWidth>
                            <label>Project</label>
                            <Select
                                value={taskInputValue.sch_Project_Id || ""}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) return <em>Select Project</em>;
                                    const project = projects.find(p => p.Project_Id == selected);
                                    return project?.Project_Name || taskInputValue.Project_Name || "Select Project";
                                }}
                                onChange={handleProjectChange}
                            >
                                <MenuItem value="">
                                    <em>Select Project</em>
                                </MenuItem>
                                {projects.map((project) => (
                                    <MenuItem key={project.Project_Id} value={project.Project_Id}>
                                        {project.Project_Name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <label>Task Type</label>
                            <Select
                                value={taskInputValue.Type_Task_Id || ""}
                                displayEmpty
                                onChange={(e) => {
                                    const selectedTaskTypeId = e.target.value;
                                    const selectedTaskType = taskTypes.find(t =>
                                        t.Task_Type_Id == selectedTaskTypeId ||
                                        t.TaskType_Id == selectedTaskTypeId
                                    );

                                    setTaskInputValue({
                                        ...taskInputValue,
                                        Type_Task_Id: selectedTaskTypeId,
                                        Task_Type: selectedTaskType ? (selectedTaskType.Task_Type || selectedTaskType.Name) : ""
                                    });
                                }}
                                disabled={loadingTaskTypes || !taskInputValue.sch_Project_Id}
                            >
                                <MenuItem value="">
                                    <em>
                                        {loadingTaskTypes
                                            ? "Loading task types..."
                                            : !taskInputValue.sch_Project_Id
                                                ? "Select a project first"
                                                : "Select Task Type"
                                        }
                                    </em>
                                </MenuItem>
                                {taskTypes.map((taskType) => (
                                    <MenuItem
                                        key={taskType.Task_Type_Id || taskType.TaskType_Id}
                                        value={taskType.Task_Type_Id || taskType.TaskType_Id}
                                    >
                                        {taskType.Task_Type || taskType.Name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <div>
                            <label>Task Name</label>
                            <input
                                type="text"
                                value={taskInputValue.Task_Name || ""}
                                onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_Name: e.target.value })}
                                className="cus-inpt"
                                placeholder="Enter Task Name"
                                disabled
                            />
                        </div>

                        <div>
                            <label>Duration</label>
                            <input
                                type="time"
                                value={taskInputValue.Task_Sch_Duaration || ""}
                                onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_Sch_Duaration: e.target.value })}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={taskInputValue.Task_Start_Time || ""}
                                    onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_Start_Time: e.target.value })}
                                    className="cus-inpt"
                                />
                            </div>
                            <div className="col-md-6">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={taskInputValue.Task_End_Time || ""}
                                    onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_End_Time: e.target.value })}
                                    className="cus-inpt"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <label>Estimated Start Date</label>
                                <input
                                    type="date"
                                    value={taskInputValue.Task_Est_Start_Date || ""}
                                    onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_Est_Start_Date: e.target.value })}
                                    className="cus-inpt"
                                />
                            </div>
                            <div className="col-md-6">
                                <label>Estimated End Date</label>
                                <input
                                    type="date"
                                    value={taskInputValue.Task_Est_End_Date || ""}
                                    onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_Est_End_Date: e.target.value })}
                                    className="cus-inpt"
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label>Task_Sch_Status</label>
                            <Select
                                value={taskInputValue.Task_Sch_Status !== undefined && taskInputValue.Task_Sch_Status !== null ? taskInputValue.Task_Sch_Status.toString() : ""}
                                onChange={(e) => setTaskInputValue({ ...taskInputValue, Task_Sch_Status: e.target.value })}
                                displayEmpty
                                size="small"
                            >
                                <MenuItem value="">
                                    <em>Select Status</em>
                                </MenuItem>
                                <MenuItem value="0">Completed</MenuItem>
                                <MenuItem value="1">Progress</MenuItem>
                            </Select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditTaskDialog(false);
                        setTaskInputValue(taskInitialState);
                        setTaskTypes([]);
                    }}>Cancel</MuiButton>
                    <MuiButton onClick={handleTaskEdit} color="success">Update Task</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this Process?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} color="error" autoFocus>Delete</MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ProjectSchedules;
