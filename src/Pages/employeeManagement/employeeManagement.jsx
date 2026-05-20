import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete,
    TextField,
} from '@mui/material';
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import { MyContext } from "../../Components/context/contextProvider";
import Popper from '@mui/material/Popper';

const EmployeeManagementDialog = ({ open, onClose, projectId, onReload }) => {

    const initialValue = {
        Name: '',
        Designation_Name: '',
        BranchName: ''
    }

    const [employees, setEmployees] = useState(initialValue);
    const [loading, setLoading] = useState(true);
    const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
    const [dropdownEmployees, setDropdownEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const { contextObj } = useContext(MyContext);

    useEffect(() => {
        if (open && projectId) {
            fetchEmployeeDetails();
            fetchDropdownEmployees();
            fetchAssignedEmployees();
        }
    }, [open, projectId]);

    const CustomPopper = (props) => {
        return <Popper {...props} placement="top" />;
    };

    const fetchEmployeeDetails = async () => {
        setLoading(true);
        try {
            const data = await fetchLink({
                address: `masters/Employeedetails?Project_Id=${projectId}`,
            });
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch employee details");
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownEmployees = async () => {
        setLoading(true);
        try {
            const data = await fetchLink({
                address: `masters/Employeedetails/dropDown?Company_id=${parseData.Company_id}`,
            });
            if (data.success) {
                setDropdownEmployees(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch employees for dropdown");
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedEmployees = async () => {
        setLoading(true);
        try {
            const data = await fetchLink({
                address: `masters/Employeedetails?Project_Id=${projectId}`,
            });
            if (data.success) {
                setSelectedEmployees(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch assigned employees");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployeeOpen = () => {
        setAddEmployeeDialogOpen(true);
    };

    const handleAddEmployeeClose = () => {
        setAddEmployeeDialogOpen(false);
        onClosed()
        setEmployees(initialValue)
    };

    const handleAddEmployees = async () => {
        if (Number(contextObj?.Add_Rights) === 1) {
            try {
                const response = await fetchLink({
                    address: 'masters/Employeedetails/employeeAdd',
                    method: 'POST',
                    bodyData: {
                        Project_Id: projectId,
                        UserIds: selectedEmployees.map(emp => emp.UserId),
                    },
                });

                if (response.success) {
                    toast.success("Employees added successfully");
                    setAddEmployeeDialogOpen(false);
                    await fetchEmployeeDetails();
                    await fetchAssignedEmployees();
                    onReload();
                } else {
                    toast.error("Failed to add employees");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error adding employees");
            }
        }
    };
    const onClosed = () => {

        onClose()
        setEmployees(initialValue);
    };
    return (
        <>
            <Dialog open={open} maxWidth="sm" fullWidth>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2} marginInlineStart={2}>
                    <span>Employee Details</span>

{/* <Button variant="contained" color="primary"    style={{ marginRight: '18px ' }}   onClick={onClosed}>Close</Button> */}
<DialogActions>
                    <Button 
                        variant="contained"
                        color="primary"
                        onClick={handleAddEmployeeOpen}
                        sx={{ mr: 1 }}
                    >
                        Add
                    </Button>
                </DialogActions>
{/* 
                    <button
                        className='btn btn-light'
                        style={{ marginRight: '18px ',color:'#1976d2' }}
                     
                        onClick={onClosed}
                    >
                        Close
                    </button> */}
                </Box>
                <DialogContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Employee Name</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Department</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array.isArray(employees) && employees.length > 0 ? (
                                        employees.map(user => (
                                            <TableRow key={user.EmployeeId || user.UserId}>
                                                <TableCell>{user.Name || 'N/A'}</TableCell>
                                                <TableCell>{user.Designation_Name || '-'}</TableCell>
                                                <TableCell>{user.BranchName || '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3}>No data available</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>

                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ marginTop: 'auto ', position: 'sticky', bottom: 0 }}>
                    <Button variant="contained" color="primary" onClick={onClosed}>Close</Button>
                </DialogActions>

                </Dialog>

            <Dialog
                open={addEmployeeDialogOpen}
                // onClose={handleAddEmployeeClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Employee</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        multiple
                        options={dropdownEmployees}
                        getOptionLabel={(option) => option.Name}
                        isOptionEqualToValue={(option, value) => option.UserId === value.UserId}
                        onChange={(event, value) => {
                            const uniqueValues = value.filter((val, index, self) =>
                                index === self.findIndex((t) => (
                                    t.UserId === val.UserId
                                ))
                            );
                            setSelectedEmployees(uniqueValues);
                        }}
                        PopperComponent={CustomPopper}
                        value={selectedEmployees}
                        onClose={onclose}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Employees" />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddEmployeeClose}>Cancel</Button>
                    <Button onClick={handleAddEmployees} variant='contained' color="primary">Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EmployeeManagementDialog;
