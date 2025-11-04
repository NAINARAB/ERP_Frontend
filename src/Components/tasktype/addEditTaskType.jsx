// import React, { useEffect } from "react";
// import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

// const AddEditTaskType = ({ open, onClose, existingTaskType, onCreate, onUpdate }) => {
//     const [inputValue, setInputValue] = React.useState({
//         Task_Type: "",
//         Task_Type_Id: "",
//     });

//     useEffect(() => {
//         if (existingTaskType) {
//             setInputValue(existingTaskType);
//         } else {
//             setInputValue({ Task_Type: "", Task_Type_Id: "" });
//         }
//     }, [existingTaskType]);

//     const handleSubmit = (event) => {
//         event.preventDefault(); 
//         if (existingTaskType) {
//             onUpdate(inputValue); 
//         } else {
//             onCreate(inputValue.Task_Type);
//         }
//         onClose();
//     };

//     return (
//         <Dialog open={open} onClose={onClose}>
//             <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">
//                 {existingTaskType ? "Edit Task Type" : "Create Task Type"}
//             </DialogTitle>
//             <DialogContent>
//                 <form onSubmit={handleSubmit}>
//                     <div className="p-2">
//                         <label>Task Type</label>
//                         <input
//                             type="text"
//                             onChange={(event) => setInputValue({ ...inputValue, Task_Type: event.target.value })}
//                             value={inputValue.Task_Type}
//                             className="cus-inpt"
//                         />
//                     </div>
//                     <DialogActions>
//                         <button
//                             className="btn btn-light rounded-5 px-3"
//                             type="button"
//                             onClick={onClose}>
//                             Cancel
//                         </button>
//                         <button
//                             className="btn btn-primary rounded-5 px-3"
//                             type="submit">
//                             {existingTaskType ? "Update" : "Create"}
//                         </button>
//                     </DialogActions>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default AddEditTaskType;










import React, { useEffect, useState } from "react";
import { 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle,
    Button,
    TextField
} from "@mui/material";
import { fetchLink } from "../../Components/fetchComponent";

const AddEditTaskType = ({ open, onClose, existingTaskType, onCreate, onUpdate }) => {
  
    const [inputValue, setInputValue] = useState({
        Task_Type: "",
        Task_Type_Id: "",
        ProjectId: "",
        ProjectName: "",
        Est_StartDate: new Date().toISOString().split('T')[0],
        Est_EndDate: new Date().toISOString().split('T')[0],
        Status: "1"
    });

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch projects from API
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const companyId = JSON.parse(localStorage.getItem("user"))?.Company_id || 1;
                const data = await fetchLink({
                    address: `taskManagement/project/Abstract?Company_id=${companyId}`
                });
                
                if (data.success) {
                    setProjects(data.data || []);
                } else {
                    console.error("Failed to fetch projects:", data.message);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchProjects();
        }
    }, [open]);

    useEffect(() => {
      
        if (existingTaskType && existingTaskType.ProjectId) {

            const formattedData = {
                ...existingTaskType,
                ProjectId: existingTaskType.ProjectId.toString(),
                Est_StartDate: existingTaskType.Est_StartDate 
                    ? new Date(existingTaskType.Est_StartDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                Est_EndDate: existingTaskType.Est_EndDate 
                    ? new Date(existingTaskType.Est_EndDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
            };
        
            setInputValue(formattedData);
        } else {
          
            setInputValue({ 
                Task_Type: "", 
                Task_Type_Id: "",
                ProjectId: "",
                ProjectName: "",
                Est_StartDate: new Date().toISOString().split('T')[0],
                Est_EndDate: new Date().toISOString().split('T')[0],
                Status: "1"
            });
        }
    }, [existingTaskType, open, projects]); 

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.Task_Type.trim()) {
        alert("Please enter a Task Type");
        return;
    }
    
    if (!inputValue.ProjectId) {
        alert("Please select a Project");
        return;
    }

    if (new Date(inputValue.Est_StartDate) > new Date(inputValue.Est_EndDate)) {
        alert("End date cannot be before start date");
        return;
    }

    // Prepare data for API - ensure proper types
    const submitData = {
        ...inputValue,
        ProjectId: inputValue.ProjectId, // Keep as string for dropdown, will be parsed in API call
        Status: inputValue.Status // Keep as string for dropdown, will be parsed in API call
    };

    if (existingTaskType && existingTaskType.Task_Type_Id) {
        onUpdate(submitData); 
    } else {
        onCreate(submitData);
    }
    onClose();
};

    const handleProjectChange = (e) => {
        const selectedProjectId = e.target.value;
        const selectedProject = projects.find(project => project.Project_Id.toString() === selectedProjectId);
        
        setInputValue(prev => ({
            ...prev,
            ProjectId: selectedProjectId,
            ProjectName: selectedProject ? selectedProject.Project_Name : "",
            Est_StartDate: selectedProject?.Est_Start_Dt ? new Date(selectedProject.Est_Start_Dt).toISOString().split('T')[0] : prev.Est_StartDate,
            Est_EndDate: selectedProject?.Est_End_Dt ? new Date(selectedProject.Est_End_Dt).toISOString().split('T')[0] : prev.Est_EndDate
        }));
    };

    const handleClose = () => {
        setInputValue({ 
            Task_Type: "", 
            Task_Type_Id: "",
            ProjectId: "",
            ProjectName: "",
            Est_StartDate: new Date().toISOString().split('T')[0],
            Est_EndDate: new Date().toISOString().split('T')[0],
            Status: "1"
        });
        onClose();
    };

    // Check if project dropdown should be disabled
    const isProjectDisabled = existingTaskType && existingTaskType.ProjectId;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm">
            <DialogTitle>
                {existingTaskType && existingTaskType.Task_Type_Id ? "UPDATE TASK TYPE" : "CREATE TASK TYPE"}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {/* Project Dropdown */}
                    <label>Project</label>
                    <select
                        value={inputValue.ProjectId || ""}
                        onChange={handleProjectChange}
                        className="cus-inpt"
                        required
                        disabled={isProjectDisabled}
                    >
                        <option value="" disabled>
                            {loading ? "Loading projects..." : "Select Project"}
                        </option>
                        {projects.map((project) => (
                            <option key={project.Project_Id} value={project.Project_Id.toString()}>
                                {project.Project_Name}
                            </option>
                        ))}
                    </select>

                    
                    {/* {inputValue.ProjectName && (
                        <div style={{ marginTop: '8px', marginBottom: '16px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                            <strong>Selected Project:</strong> {inputValue.ProjectName}
                        </div>
                    )} */}

                    {/* Task Type */}
                    <label>Task Type</label>
                    <TextField
                        value={inputValue.Task_Type}
                        onChange={e => setInputValue({
                            ...inputValue,
                            Task_Type: e.target.value
                        })}
                        fullWidth
                        margin="dense"
                        variant="outlined"
                        required
                        placeholder="Enter task type (e.g., Development, Testing)"
                    />

                    {/* Estimated Start Date */}
                    <label>Estimated Start Date</label>
                    <input
                        type="date"
                        value={inputValue.Est_StartDate}
                        onChange={e => setInputValue({
                            ...inputValue,
                            Est_StartDate: e.target.value
                        })}
                        className="cus-inpt"
                        required
                    />

                    {/* Estimated End Date */}
                    <label>Estimated End Date</label>
                    <input
                        type="date"
                        value={inputValue.Est_EndDate}
                        onChange={e => setInputValue({
                            ...inputValue,
                            Est_EndDate: e.target.value
                        })}
                        className="cus-inpt"
                        required
                    />

                    {/* Status Dropdown */}
                    <label>Status</label>
                    <select
                        className="cus-inpt"
                        value={inputValue.Status}
                        onChange={e => setInputValue({
                            ...inputValue,
                            Status: e.target.value
                        })}
                        required>
                        <option value="" disabled>Select Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                        <option value="2">Pending</option>
                        <option value="3">Completed</option>
                    </select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                        {existingTaskType && existingTaskType.Task_Type_Id ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEditTaskType;