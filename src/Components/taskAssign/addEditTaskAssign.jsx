import React, { useEffect, useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { MyContext } from '../context/contextProvider';
import { fetchLink } from '../fetchComponent';
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from 'react-toastify';

const TaskAssign = ({ open, onClose, projectId, taskId, reload }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const { contextObj } = useContext(MyContext);

    const [usersDropdown, setUsersDropdown] = useState([]);
    const [loading, setLoading] = useState(false);

    const assignEmpInitialValue = {
        AN_No: '',
        Project_Id: projectId,
        Sch_Id: taskId,
        Assigned_Emp_Id: parseData?.UserId,
        Emp_Id: '',
        Task_Assign_dt: new Date().toISOString().split('T')[0],
        Sch_Period: '',
        Sch_Time: '',
        EN_Time: '',
        Est_Start_Dt: '',
        Est_End_Dt: '',
        Ord_By: 1,
        Timer_Based: true,
        Invovled_Stat: true,
        EmpGet: '- Select Employee -'
    };

    const [assignEmpInpt, setAssignEmpInpt] = useState(assignEmpInitialValue);

    useEffect(() => {
        const fetchUsersDropdown = async () => {
            try {
                setLoading(true);
                const data = await fetchLink({
                    address: `masters/Employeedetails/getusersproject?Project_Id=${projectId}`
                });
                if (data.success) {
                    setUsersDropdown(data.data || []);
                } else {
                    toast.error("Failed to fetch employee dropdown.");
                }
            } catch (e) {
                console.error(e);
                toast.error("Error fetching employee dropdown.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsersDropdown();
    }, [projectId,reload]);

    const calculateSchPeriod = () => {
        const [hours1, minutes1] = assignEmpInpt.Sch_Time.split(':').map(Number);
        const [hours2, minutes2] = assignEmpInpt.EN_Time.split(':').map(Number);

        const date1 = new Date(0, 0, 0, hours1, minutes1);
        const date2 = new Date(0, 0, 0, hours2, minutes2);

        if (date2 > date1) {
            let difference = Math.abs(date2 - date1);
            const hours = Math.floor(difference / (1000 * 60 * 60));
            difference %= (1000 * 60 * 60);
            const minutes = Math.floor(difference / (1000 * 60));
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const schPeriod = calculateSchPeriod();

        if (assignEmpInpt.Est_End_Dt < assignEmpInpt.Est_Start_Dt) {
            toast.error("End date must be greater than start date.");
            return;
        }

        setAssignEmpInpt(prev => ({ ...prev, Sch_Period: schPeriod }));

        try {
            const response = await fetchLink({
                address: 'masters/employeedetails/assignTask',
                method: 'POST',
                bodyData: {
                    Project_Id: projectId,
                    Sch_Id: taskId.Sch_Id,
                    Task_Levl_Id: 1,
                    Task_Id: Number(taskId.Task_Id),
                    Assigned_Emp_Id: assignEmpInpt.Assigned_Emp_Id,
                    Emp_Id: assignEmpInpt.Emp_Id,
                    Sch_Period: schPeriod,
                    Sch_Time: assignEmpInpt.Sch_Time,
                    EN_Time: assignEmpInpt.EN_Time,
                    Est_Start_Dt: assignEmpInpt.Est_Start_Dt,
                    Est_End_Dt: assignEmpInpt.Est_End_Dt,
                    Ord_By: assignEmpInpt.Ord_By,
                    Timer_Based: assignEmpInpt.Timer_Based ? 1 : 0,
                },
            });

            if (response.success) {
                toast.success("Task assigned successfully!");
                setAssignEmpInpt(assignEmpInitialValue);
                reload();
                onClose();
            } else {
                toast.error("Failed to assign task: " + response.message);
            }
        } catch (error) {
            toast.error("Error during task assignment: " + error.message);
        }
    };

    return (
        <>
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Assign Task</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent className="table-responsive">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Employee</td>
                                <td className="border-bottom-0 fa-15">
                                    <Select
                                        value={{ value: assignEmpInpt.Emp_Id, label: assignEmpInpt.EmpGet }}
                                        onChange={(e) => setAssignEmpInpt({ ...assignEmpInpt, Emp_Id: e.value, EmpGet: e.label })}
                                        options={[{ value: '', label: '- Select Employee -' }, ...usersDropdown.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
                                        styles={customSelectStyles}
                                        required
                                        isSearchable={true}
                                        placeholder="Select User"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Time</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='time'
                                        className="cus-inpt"
                                        value={assignEmpInpt.Sch_Time}
                                        required
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Sch_Time: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>End Time</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='time'
                                        className="cus-inpt"
                                        value={assignEmpInpt.EN_Time}
                                        required
                                        min={assignEmpInpt.Sch_Time}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, EN_Time: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        required
                                        value={assignEmpInpt.Est_Start_Dt}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_Start_Dt: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>End Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        required
                                        min={assignEmpInpt.Est_Start_Dt}
                                        value={assignEmpInpt.Est_End_Dt}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_End_Dt: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Order By</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='number'
                                        required
                                        placeholder="1, 2, 3..."
                                        className="cus-inpt"
                                        value={assignEmpInpt.Ord_By}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Ord_By: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>
                                    <div>
                                        <input
                                            className="form-check-input shadow-none"
                                            style={{ padding: '0.7em' }}
                                            type="checkbox"
                                            id="timerbased"
                                            checked={Boolean(assignEmpInpt.Timer_Based)}
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Timer_Based: e.target.checked })}
                                        />
                                        <label className="form-check-label p-1 ps-2" htmlFor="timerbased">Timer Based Task?</label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <button className='btn btn-light' type="button" onClick={onClose}>Close</button>
                    <button className='btn btn-primary' type="submit">Submit</button>
                </DialogActions>
            </form>
        </Dialog>
        </>
    );
};

export default TaskAssign;
