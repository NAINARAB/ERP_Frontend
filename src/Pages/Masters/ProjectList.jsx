
import React, { useState, useEffect, useContext } from "react";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Edit, Delete, Launch, People } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";
import ProjectForm from "../../Components/ProjectList/addEditProject";
import EmployeeManagementDialog from "../../Components/employeeManagement/employeeManagement";
import DataTable from "react-data-table-component";
import ListingTask from "../../Components/taskDetails/listingTask";
import SearchIcon from '@mui/icons-material/Search';

const ActiveProjects = () => {
    const [reload, setReload] = useState(false);
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
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
    const [filterInput, setFilterInput] = useState('');

    useEffect(() => {
        fetchProjects();
        fetchProjectData();
    }, [parseData?.Company_id, reload]);

    const handleReloadProjects = () => {
        setReload(prev => !prev);
    };

    const fetchProjects = async () => {
        try {
            const data = await fetchLink({
                address: `taskManagement/project/newProjectAbstract?Company_id=${parseData?.Company_id}`
            });
            if (data.success && Array.isArray(data.data)) {
                setProjects(data.data);
            } else {
                console.error("Unexpected data format:", data);
                setProjects([]);
            }
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
            if (data.success && Array.isArray(data.data)) {
                setProjectAlldata(data.data);
            } else {
                console.error("Unexpected data format:", data);
                setProjectAlldata([]);
            }
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

    const columns = [
        {
            name: 'Project Name',
            selector: row => row.Project_Name,
            sortable: true,
        },
        {
            name: 'Project Head',
            selector: row => projectAlldata.find(p => p.Project_Id === row.Project_Id)?.Project_Head_Name,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => projectAlldata.find(p => p.Project_Id === row.Project_Id)?.Status,
            sortable: true,
        },
        {
            name: 'Start Date',
            selector: row => row.Est_Start_Dt ? new Date(row.Est_Start_Dt).toLocaleDateString('en-IN') : "N/A",
            sortable: true,
        },
        {
            name: 'End Date',
            selector: row => row.Est_End_Dt ? new Date(row.Est_End_Dt).toLocaleDateString('en-IN') : "N/A",
            sortable: true,
        },
        {
            name: 'Progress',
            selector: row => `${calcPercentage(row.TasksScheduled, row.CompletedTasks)}%`,
            sortable: true,
        },
        {
            name: 'Tasks / Completed',
            cell: row => (
                <>
                    {row.CompletedTasks} / {row.TasksScheduled}
                    <IconButton onClick={() => handleOpenListingTaskDialog(row)} style={{ marginLeft: '8px' }}>
                        <Launch />
                    </IconButton>
                </>
            ),
        },
        {
            name: 'Tasks Assigned',
            selector: row => row.TasksAssignedToEmployee,
        },
        {
            name: 'Employees Involved',
            cell: row => (
                <>
                    {row.EmployeesInvolved}
                    {Number(contextObj?.Add_Rights) === 1 && (
                        <IconButton onClick={() => handleOpenEmployeeDialog(row.Project_Id)}>
                            <People />
                        </IconButton>
                    )}
                </>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <>
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <IconButton onClick={() => handleOpenEditDialog(row)}><Edit /></IconButton>
                    )}
                    {Number(contextObj?.Delete_Rights) === 1 && (
                        <IconButton onClick={() => handleOpenDeleteDialog(row)}><Delete /></IconButton>
                    )}
                </>
            ),
        },
    ];

    const filteredProjects = projects.filter(project => {
        const projectHead = projectAlldata.find(p => p.Project_Id === project.Project_Id)?.Project_Head_Name || "";
        const status = projectAlldata.find(p => p.Project_Id === project.Project_Id)?.Status || "";
        return (
            project.Project_Name.toLowerCase().includes(filterInput.toLowerCase()) ||
            projectHead.toLowerCase().includes(filterInput.toLowerCase()) ||
            status.toLowerCase().includes(filterInput.toLowerCase())
        );
    });

    const handleOpenCreateDialog = () => {
        console.log("Opening Create Dialog");
        setSelectedProject(null); 
        setIsEdit(false); 
        setDialogOpen(true); 
        console.log("Dialog Open State:", dialogOpen);
    };
    
    const handleOpenEditDialog = (project) => {
        console.log("Opening Edit Dialog for project:", project);
        setSelectedProject(project); 
        setIsEdit(true); 
        setDialogOpen(true); 
        console.log("Dialog Open State:", dialogOpen);
    };
    
    const handleOpenDeleteDialog = (project) => {
        setProjectToDelete(project);
        setDeleteDialog(true);
        
    };

    const handleOpenListingTaskDialog = (project) => {
        setSelectedProject(project);
        setProjectId(project.Project_Id);
        setListingTaskDialogOpen(true); 
    };

    const handleCloseDialogs = () => {
        setDialogOpen(false);
        setListingTaskDialogOpen(false); 
        setSelectedProject(null);
        setProjectToDelete(null);
        setDeleteDialog(false)
    };

    const handleProjectCreated = () => {
        setReload(prev => !prev);
        handleCloseDialogs();
    };

    const handleOpenEmployeeDialog = (projectId) => {
        setProjectId(projectId);
        setEmployeeDialogOpen(true);
    };

    const calcPercentage = (task, completed) => {
        return Number(task) === 0 ? 0 : ((Number(completed) / Number(task)) * 100).toFixed(0);
    };

    return (
        <>
            <div className="fw-bold d-flex align-items-center justify-content-between mt-0">
                <span>Projects</span>
                <div className="mb-1" style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <SearchIcon style={{ position: 'absolute', left: 15, color: '#aaa' }} />
                        <input
                            type="text"
                            placeholder="Search"
                            onChange={e => setFilterInput(e.target.value)}
                            style={{
                                paddingLeft: 35,
                                marginRight: 10,
                                margin: 10,
                                borderRadius: 4,
                                border: '1px solid black'
                            }}
                        />
                    </div>
                    {Number(contextObj?.Add_Rights) === 1 && (
                        <button onClick={() => handleOpenCreateDialog(null)} className="btn btn-primary fa-13 shadow">
                            Create Project
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-body2 p-0" style={{ marginTop: '0px', overflow: 'hidden' }}>
                    <DataTable
                        columns={columns}
                        data={filteredProjects}
                        pagination
                        highlightOnHover
                        fixedHeader
                        fixedHeaderScrollHeight="58vh"
                        persistTableHead
                        noHeader={false}
                        customStyles={{
                            headCells: {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    padding: '10px',
                                    backgroundColor: '#f7f7f7',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <ListingTask
                // completedTasks={0}
                onClose={handleCloseDialogs}
                dialogOpen={listingTaskDialogOpen}
                setDialogOpen={setListingTaskDialogOpen}
                isEdit={false}
                parseData={parseData}
                projectid={projectId}
                onReload={handleReloadProjects}
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

            <Dialog
                open={deleteDialog}
                onClose={handleCloseDialogs}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description">
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">Confirmation</DialogTitle>
                <DialogContent className="p-4">
                    Do you want to delete the project
                    <span className="text-primary">{" " + projectToDelete?.Project_Name + " "}</span>?
                </DialogContent>
                <DialogActions>
                    <button className="btn btn-light rounded-5 px-3 me-1" onClick={handleCloseDialogs}>Cancel</button>
                    <button className="btn btn-primary rounded-5 px-3" onClick={deleteFun}>Delete</button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ActiveProjects;
