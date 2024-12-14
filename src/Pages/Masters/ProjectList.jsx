import React, { useState, useEffect, useContext } from "react";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Edit, Delete, Launch, People, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";
import ProjectForm from "../ProjectList/addEditProject";
import EmployeeManagementDialog from "../employeeManagement/employeeManagement";
import DataTable from "react-data-table-component";
import ListingTask from "../Tasks/taskDetails/listingTask";

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
    const [filterInput, setFilterInput] = useState('');
    const [reloadFlag, setReloadFlag] = useState(false);

    const parseData = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchProjects();
        fetchProjectData();
    }, [parseData?.Company_id, reload]);

    const handleReloadProjects = () => {
        setReload(prev => !prev);  
        setReloadFlag(prev => !prev); 
    };
    
    const fetchProjects = async () => {
        try {
            const data = await fetchLink({
                address: `taskManagement/project/newProjectAbstract?Company_id=${parseData?.Company_id}`
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

    const columns = [
        { name: 'Project', selector: row => row.Project_Name, sortable: true, width: '250px' },
        { name: 'Head', selector: row => projectAlldata.find(p => p.Project_Id === row.Project_Id)?.Project_Head_Name, sortable: true },
        { name: 'Status', selector: row => projectAlldata.find(p => p.Project_Id === row.Project_Id)?.Status, sortable: true },
        { name: 'End Date', selector: row => row.Est_End_Dt ? new Date(row.Est_End_Dt).toLocaleDateString('en-IN') : "N/A", sortable: true },
        { name: 'Progress', selector: row => `${calcPercentage(row.TodayTaskcounts, row.CompletedTasks)}%`, sortable: true },
        {
            name: 'Task Details', cell: row => (
                <>
                    <IconButton onClick={() => handleOpenListingTaskDialog(row)}>
                        <Launch />
                    </IconButton>
                    {row.CompletedTasks} / {row.TodayTaskcounts}
                </>
            )
        },
      
        { name: 'Task Count',  selector: row => row?.TodayTaskcounts, sortable: true, sortable: true },
      
        { name: 'Assigned', selector: row => row.TasksAssignedToEmployee },
        {
            name: 'Employees', cell: row => (
                <>
                    {Number(contextObj?.Add_Rights) === 1 && (
                        <IconButton onClick={() => handleOpenEmployeeDialog(row.Project_Id)}>
                            <People />
                        </IconButton>
                    )}
                    {row.EmployeesInvolved}
                </>
            )
        },
        {
            name: 'Actions', cell: row => (
                <>
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <IconButton onClick={() => handleOpenEditDialog(row)}><Edit /></IconButton>
                    )}
                </>
            )
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

    const handleCloseDialogs = () => {
        setDialogOpen(false);
        setListingTaskDialogOpen(false);
        setSelectedProject(null);
        setProjectToDelete(null);
        setDeleteDialog(false);
    };

    const handleOpenEmployeeDialog = projectId => {
        setProjectId(projectId);
        setEmployeeDialogOpen(true);
    };

    return (
        <>
            <div className="fw-bold d-flex align-items-center justify-content-between mt-0 ">
                <span style={{ marginLeft: '20px' }}>Projects</span>
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
                        <button onClick={handleOpenCreateDialog} className="btn btn-primary fa-13 shadow">
                            Create Project
                        </button>
                    )}
                </div>
            </div>

            <div className="card-body p-0 table-container">
                <DataTable
                    columns={columns}
                    data={filteredProjects}
                    pagination
                    highlightOnHover
                    fixedHeader
                    paginationPerPage={15}
                    responsive
                    persistTableHead
                    customStyles={{
                        headCells: {
                            style: {
                                fontSize: '16px',
                                fontWeight: 'bold',
                                padding: '10px',
                                backgroundColor: '#2c3e50',
                                color: '#ecf0f1',
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                            },
                        },
                        cells: {
                            style: {
                                padding: '8px',
                                fontSize: '14px',
                                backgroundColor: '#f9f9f9',
                                color: '#2c3e50',
                            },
                        },
                        rows: {
                            style: {
                                borderBottom: '1px solid #ddd',
                            },
                        },
                    }}
                    style={{
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 200px)',
                    }}
                />



                <Dialog
                    open={deleteDialog}
                    onClose={handleCloseDialogs}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description">
                    <DialogTitle className="bg-danger text-white mb-2 px-3 py-2" style={{ fontSize: '18px' }}>
                        Confirm Deletion
                    </DialogTitle>
                    <DialogContent className="p-4" style={{ fontSize: '16px' }}>
                        Are you sure you want to delete the project
                        <span className="text-primary">{" " + projectToDelete?.Project_Name + " "}</span>?
                    </DialogContent>
                    <DialogActions>
                        <button
                            onClick={() => setDeleteDialog(false)}
                            className="btn btn-secondary fa-13 shadow"
                            style={{
                                background: '#95a5a6',
                                color: 'white',
                                borderRadius: '25px',
                                padding: '8px 15px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={deleteFun}
                            className="btn btn-danger fa-13 shadow"
                            style={{
                                background: '#e74c3c',
                                color: 'white',
                                borderRadius: '25px',
                                padding: '8px 15px',
                                cursor: 'pointer',
                            }}
                        >
                            Delete
                        </button>
                    </DialogActions>
                </Dialog>


            </div>

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
