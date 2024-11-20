import React, { useState, useEffect,useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    IconButton,
    CircularProgress,
    Button
} from '@mui/material';
import { CalendarMonth, QueryBuilder, Edit } from "@mui/icons-material";
import TaskAssign from '../taskAssign/addEditTaskAssign';
import { MyContext } from '../../../Components/context/contextProvider';
function TaskIndividual({ open, onClose, taskDetails, closeDialogTask }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const { contextObj } = useContext(MyContext);

    useEffect(() => {
        if (open) {
            setSelectedTask(null);
            setLoading(true); 

    
            setTimeout(() => {
                setLoading(false);
            }, 500);
        }
    }, [open]);

    const handleEditClick = (task) => {
        setSelectedTask(task);
        setAssignDialogOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    return (
        <>
            <Dialog open={open} maxWidth="lg">
                <DialogTitle>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Details</span>
                        <Button variant="contained" color="primary"  onClick={onClose}>Close</Button>
                    </div>
                </DialogTitle>

                <DialogContent>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', width: '500px' }}>
                            <CircularProgress /> 
                        </div>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className="fa-14 text-center">Employee</TableCell>
                                        <TableCell className="fa-14 text-center">Assigned By</TableCell>
                                        <TableCell className="fa-14 text-center">Start-End Date</TableCell>
                                        <TableCell className="fa-14 text-center">Start-End Time</TableCell>
                                        <TableCell className="fa-14 text-center">Total Hours</TableCell>
                                        <TableCell className="fa-14 text-center">Timer Based</TableCell>
                                        <TableCell className="fa-14 text-center">Involved Status</TableCell>
                                        <TableCell className="fa-14 text-center">Order By</TableCell>
                                        <TableCell className="fa-14 text-center">Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {taskDetails.length === 0 ? (
                                       
                                        <TableRow>
                                            <TableCell colSpan={9} className="fa-14 text-center" style={{ textAlign: 'center' }}>
                                                No data found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                     
                                        taskDetails.map((detail, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="fa-13 text-center">{detail.EmployeeName || 'N/A'}</TableCell>
                                                <TableCell className="fa-13 text-center">{detail.AssignedUser || 'N/A'}</TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <span className="badge rounded-4 px-3 bg-light text-primary">
                                                        <CalendarMonth className="fa-18 me-2" />
                                                        {formatDate(detail.Est_Start_Dt)} - {formatDate(detail.Est_End_Dt)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <span className="badge rounded-4 px-3 bg-light text-primary">
                                                        <QueryBuilder className="fa-18 me-2" />
                                                        {detail.Sch_Time || 'N/A'} - {detail.EN_Time || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="fa-13 text-center">{detail.Sch_Period || 'N/A'}</TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <span className={`badge rounded-4 px-3 fw-bold text-white ${Number(detail.Timer_Based) ? 'bg-success' : 'bg-warning'}`}>
                                                        {Number(detail.Timer_Based) ? "Yes" : "No"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <span className={`badge rounded-4 px-3 fw-bold text-white ${Number(detail.Invovled_Stat) ? 'bg-success' : 'bg-danger'}`}>
                                                        {Number(detail.Invovled_Stat) ? "IN" : "OUT"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="fa-13 text-center">{detail.Ord_By || 'N/A'}</TableCell>
                                                {Number(contextObj?.Edit_Rights) === 1 && (
                                                <TableCell className="fa-13 text-center">
                                                    
                                                    <IconButton size="small" onClick={() => handleEditClick(detail)}>
                                                        <Edit className="fa-18" />
                                                        Edit
                                                    </IconButton>
                                                </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
            </Dialog>

            {assignDialogOpen &&
                <TaskAssign
                    open={assignDialogOpen}
                    projectId={selectedTask?.Project_Id}
                    taskId={selectedTask}
                    editData={selectedTask}
                    onClose={() => {
                        setAssignDialogOpen(false);
                        onClose();
                    }}
                />
            }
        </>
    );
}

export default TaskIndividual;
