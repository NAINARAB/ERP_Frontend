import React, { useState, useEffect } from 'react';
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
    CircularProgress, // Import CircularProgress for loading spinner
} from '@mui/material';
import { CalendarMonth, QueryBuilder, Edit } from "@mui/icons-material";
import TaskAssign from '../taskAssign/addEditTaskAssign';

function TaskIndividual({ open, onClose, taskDetails, closeDialogTask }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state to handle loading spinner

    useEffect(() => {
        if (open) {
            setSelectedTask(null);
            setLoading(true); // Start loading when the dialog opens

            // Simulate loading delay (you would replace this with actual data fetching logic)
            setTimeout(() => {
                setLoading(false); // Set loading to false once data is loaded
            }, 500); // Example loading time of 2 seconds
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
            console.error('Invalid date value:', dateString);
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
                        <button className='btn btn-light' onClick={onClose}>Close</button>
                    </div>
                </DialogTitle>

                <DialogContent>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', width: '500px' }}>
                            <CircularProgress /> {/* Single circular spinner in the center */}
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
                                        // Display a "No data found" message if there are no tasks
                                        <TableRow>
                                            <TableCell colSpan={9} className="fa-14 text-center" style={{ textAlign: 'center' }}>
                                                No data found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        // Map over taskDetails if available and display rows
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
                                                <TableCell className="fa-13 text-center">
                                                    <IconButton size="small" onClick={() => handleEditClick(detail)}>
                                                        <Edit className="fa-18" />
                                                        Edit
                                                    </IconButton>
                                                </TableCell>
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
