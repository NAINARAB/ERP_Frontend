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
    CircularProgress,
    Box,
    Typography 
} from '@mui/material';
import { CalendarMonth, QueryBuilder, Edit } from "@mui/icons-material";
import TaskAssign from '../taskAssign/addEditTaskAssign';

function TaskIndividual({ open, onClose, taskDetails, closeDialogTask }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

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
            <Dialog open={open} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="span">
                            Details
                        </Typography>
                        <button className='btn btn-light' onClick={onClose}>Close</button>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    {loading ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '300px', 
                            width: '100%' 
                        }}>
                            <CircularProgress /> 
                        </Box>
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
                                            <TableCell colSpan={9} className="fa-14 text-center">
                                                <Typography component="span">
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        taskDetails.map((detail, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="fa-13 text-center">
                                                    <Typography component="span">
                                                        {detail.EmployeeName || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="fa-13 text-center">
                                                    <Typography component="span">
                                                        {detail.AssignedUser || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <Box 
                                                        component="span" 
                                                        sx={{ 
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            px: 2,
                                                            py: 1,
                                                            backgroundColor: 'grey.100',
                                                            color: 'primary.main',
                                                            borderRadius: 4,
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        <CalendarMonth sx={{ fontSize: '18px', mr: 1 }} />
                                                        {formatDate(detail.Est_Start_Dt)} - {formatDate(detail.Est_End_Dt)}
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <Box 
                                                        component="span" 
                                                        sx={{ 
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            px: 2,
                                                            py: 1,
                                                            backgroundColor: 'grey.100',
                                                            color: 'primary.main',
                                                            borderRadius: 4,
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        <QueryBuilder sx={{ fontSize: '18px', mr: 1 }} />
                                                        {detail.Sch_Time || 'N/A'} - {detail.EN_Time || 'N/A'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="fa-13 text-center">
                                                    <Typography component="span">
                                                        {detail.Sch_Period || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <Box 
                                                        component="span" 
                                                        sx={{ 
                                                            display: 'inline-block',
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 4,
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            backgroundColor: Number(detail.Timer_Based) ? 'success.main' : 'warning.main',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {Number(detail.Timer_Based) ? "Yes" : "No"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="fa-14 text-center">
                                                    <Box 
                                                        component="span" 
                                                        sx={{ 
                                                            display: 'inline-block',
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 4,
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            backgroundColor: Number(detail.Invovled_Stat) ? 'success.main' : 'error.main',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {Number(detail.Invovled_Stat) ? "IN" : "OUT"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="fa-13 text-center">
                                                    <Typography component="span">
                                                        {detail.Ord_By || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="fa-13 text-center">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEditClick(detail)}
                                                        sx={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}
                                                    >
                                                        <Edit sx={{ fontSize: '18px' }} />
                                                        <Typography component="span" sx={{ fontSize: '12px' }}>
                                                            Edit
                                                        </Typography>
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

            {assignDialogOpen && (
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
            )}
        </>
    );
}

export default TaskIndividual;