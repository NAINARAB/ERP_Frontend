import React, { useEffect, useState, useContext } from 'react';
import { Drawer, IconButton, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ListingTask from '../Tasks/taskDetails/listingTask';
import { BarChart, Group, WorkHistory, CalendarMonth } from '@mui/icons-material';
import { CgUserList } from "react-icons/cg";
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";

const ProjectDetailsDrawer = ({ open, onClose, projectData }) => {
    const [completedTasks, setCompletedTasks] = useState(0);
    const [projectSingle, setProjectSingle] = useState(null);
    const [loading, setLoading] = useState(false);
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const { contextObj } = useContext(MyContext);
    const [dialogOpen, setDialogOpen] = useState(false);

    const calcPercentage = (task, completed) => {
        if (Number(task) === 0) return 0;
        return ((Number(completed) / Number(task)) * 100).toFixed(0);
    };

    const CardDisplay = ({ icon, label, value, value2, onClick, extraIcon }) => (
        <div className="col-xxl-3 col-lg-4 col-md-6 mb-3">
            <div className="p-3 rounded-3 mnh" onClick={onClick}>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <span className='smallicon fa-17 me-2'>{icon}</span>
                        <span className={`text-uppercase fw-bold text-muted fa-16`}>{label}</span>
                    </div>
                    {extraIcon && <span className='ms-2'>{extraIcon}</span>}
                </div>
                <p className={`text-end mb-0 fw-bold`} style={{ fontSize: '26px' }}>
                    {value}
                    <span className="fa-20">{value2 && ' /' + value2}</span>
                </p>
            </div>
        </div>
    );

    const handleClick = (completedTasks) => {
        setCompletedTasks(completedTasks);
        setDialogOpen(true);
    };

    useEffect(() => {
        if (!open || !parseData?.Company_id || !projectData?.Project_Id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const projectDetailsResponse = await fetchLink({
                    address: `taskManagement/project/newAbstract?Company_id=${parseData.Company_id}&Project_Id=${projectData.Project_Id}`
                });

                if (projectDetailsResponse.success && projectDetailsResponse.data.length > 0) {
                    setProjectSingle(projectDetailsResponse.data[0]);
                } else {
                    console.error('Failed to fetch project details:', projectDetailsResponse.message);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, parseData?.Company_id, projectData?.Project_Id]);

    return (
        <>
            <Drawer anchor="right" open={open} onClose={onClose}>
                <div className="p-4" style={{ width: '1500px' }}>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                    <h2 className="text-center">Project Details</h2>

                    {loading ? (
                        <CircularProgress />
                    ) : projectSingle ? (
                        <div className="project-card">
                            <div className="fa-18 mb-3 text-dark text-uppercase fw-bold d-flex align-items-center px-3 py-2 border-bottom">
                                <span className="flex-grow-1">Project ID: {projectSingle.Project_Name}</span>
                            </div>

                            <div className="row">
                                <CardDisplay
                                    icon={<BarChart className="fa-in" />}
                                    label={'Progress'}
                                    value={projectSingle.TasksScheduled && projectSingle.CompletedTasks
                                        ? `${calcPercentage(projectSingle.TasksScheduled, projectSingle.CompletedTasks)} %`
                                        : '0 %'}
                                />

                                <CardDisplay
                                    icon={<WorkHistory className="fa-in" />}
                                    label={'Task / Completed'}
                                    value={projectSingle.CompletedTasks || 0}
                                    value2={projectSingle.TasksScheduled || 1}
                                    extraIcon={<AddIcon />}
                                    onClick={() => handleClick(projectSingle.CompletedTasks)}
                                />

                                <CardDisplay
                                    icon={<CgUserList className="fa-in" />}
                                    label={'Task Process / Assigned'}
                                    value={projectSingle.TasksProgressCount || 0}
                                    value2={projectSingle.TasksAssignedToEmployee || 1}
                                />
                                <CardDisplay
                                    icon={<Group className="fa-in" />}
                                    label={'Employees Involved'}
                                    value={projectSingle.EmployeesInvovled || 0}
                                />
                                <div className="col-xxl-3 col-lg-4 col-md-6 mb-3">
                                    <div className="p-3 rounded-3 mnh">
                                        <div className="d-flex">
                                            <span className='smallicon fa-17 me-2'>
                                                <CalendarMonth className="fa-in" />
                                            </span>
                                            <span className='text-uppercase fw-bold fa-16 text-muted'>Duration</span>
                                        </div>
                                        <p className="text-end fa-15 mb-0 fw-bold">
                                            {new Date(projectSingle.Est_Start_Dt)
                                                .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            {" - "}
                                            {new Date(projectSingle.Est_End_Dt)
                                                .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            {" (" + ((new Date(projectSingle.Est_End_Dt) - new Date(projectSingle.Est_Start_Dt)) / (1000 * 60 * 60 * 24) + 1) + " DAYS)"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>No project details available.</div>
                    )}
                </div>
            </Drawer>
            {dialogOpen && (
                <ListingTask
                    completedTasks={completedTasks}
                    onClose={() => setDialogOpen(false)}
                    dialogOpen={dialogOpen}
                    setDialogOpen={setDialogOpen}
                    isEdit={false}
                    parseData={parseData}
                    projectData={projectData}
                />
            )}
        </>
    );
};

export default ProjectDetailsDrawer;
