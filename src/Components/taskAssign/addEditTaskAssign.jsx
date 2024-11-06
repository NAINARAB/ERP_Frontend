import React, { useEffect, useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { MyContext } from '../context/contextProvider';
import { fetchLink } from '../fetchComponent';
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from 'react-toastify';
import context from 'react-bootstrap/esm/AccordionContext';

const TaskAssign = ({ open, onClose, projectId, taskId, reload, editData }) => {
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
        EmpGet: '- Select -'
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
    }, [projectId, reload]);

    useEffect(() => {
 
        if (editData) {
            setAssignEmpInpt({
                ...assignEmpInitialValue,
                AN_No: editData.AN_No,
                Emp_Id: editData.Emp_Id,
                Sch_Time: editData.Sch_Time,
                EN_Time: editData.EN_Time,
                Est_Start_Dt: editData.Est_Start_Dt.split('T')[0],
                Est_End_Dt: editData.Est_End_Dt.split('T')[0],
                Ord_By: editData.Ord_By,
                Timer_Based: editData.Timer_Based,
                Invovled_Stat: editData.Invovled_Stat,
             EmpGet:editData.EmployeeName
            });
       
        } else {
            setAssignEmpInpt(assignEmpInitialValue);
        }
    }, [editData, usersDropdown]);

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
            const address = editData ? 'masters/employeedetails/updateTask' : 'masters/employeedetails/assignTask';
            const bodyData = {
                Project_Id: projectId,
                Sch_Id: taskId.Sch_Id,
                Task_Levl_Id: taskId.Task_Levl_Id,
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
                Invovled_Stat: assignEmpInpt.Invovled_Stat ? 1 : 0,
                AN_No: editData ? assignEmpInpt.AN_No : undefined,
            };

            const response = await fetchLink({
                address,
                method: editData ? 'PUT' : 'POST',
                bodyData,
            });
            if (response.success) {
                toast.success(`Task ${editData ? 'updated' : 'assigned'} successfully!`);
                setAssignEmpInpt(assignEmpInitialValue);
                onClose();
                reload()
            } else {
                toast.error("Failed to assign/update task: " + response.message);

            }
        } catch (error) {
        
            toast.error("Error during task assignment/update: " + error.message);
        }
    };

    const onClosed = () => {
        setAssignEmpInpt(assignEmpInitialValue);
        onClose();
    };

    return (
        <Dialog open={open} maxWidth="sm">
            <DialogTitle>{editData ? 'Edit Task' : 'Assign Task'}</DialogTitle>
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
                                        options={[{ value: '', label: '- Select -' }, ...usersDropdown.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
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
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Est. Start Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={assignEmpInpt.Est_Start_Dt}
                                        required
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_Start_Dt: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Est. End Date</td>
                                <td className="border-bottom-0 fa-15">
                                    <input
                                        type='date'
                                        className="cus-inpt"
                                        value={assignEmpInpt.Est_End_Dt}
                                        required
                                        min={assignEmpInpt.Est_Start_Dt}
                                        onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_End_Dt: e.target.value })}
                                    />
                                </td>
                            </tr>


                            <tr>
                                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>
                                    {editData && (
                                        <div>
                                            <input
                                                className="form-check-input shadow-none"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                id="Invovled_Stat"
                                                checked={Boolean(Number(assignEmpInpt?.Invovled_Stat))}
                                                onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Invovled_Stat: e.target.checked })} />
                                            <label className="form-check-label p-1 ps-2" htmlFor="involve">is Involved?</label>
                                        </div>
                                    )}
                                </td>
                                <td className="border-bottom-0 fa-15 text-end">
                                    <div>
                                        <input
                                            className="form-check-input shadow-none"
                                            style={{ padding: '0.7em' }}
                                            type="checkbox"
                                            id="timerbased"
                                            checked={Boolean(Number(assignEmpInpt?.Timer_Based))}
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Timer_Based: e.target.checked })} />
                                        <label className="form-check-label p-1 ps-2" htmlFor="timerbased">Timer Based Task?</label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
              {Number(contextObj?.Edit_Rights===1) && ( <DialogActions>
                    <Button onClick={onClosed}>Cancel</Button>
                    <Button type='submit' color="primary">{editData ? 'Update' : 'Assign'}</Button>
                </DialogActions>) }  
            </form>
        </Dialog>
    );
};

export default TaskAssign;



