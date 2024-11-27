import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import { fetchLink } from '../../../Components/fetchComponent';
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';

const TaskAssign = ({ open, onClose, projectId, taskId, reload, editData }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
 
    const [usersDropdown, setUsersDropdown] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [schType, setSchType] = useState([]);
    const [selectedSch, setSelectedSch] = useState([])
    const intitalVlaue={
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
        Timer_Based: false,
        Sch_Type: '',
        Invovled_Stat: true,
        EmpGet: '- Select -',
        Is_Repitative: false,
        RepeatDays: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false }
    }

    const [assignEmpInpt, setAssignEmpInpt] = useState(intitalVlaue);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userResponse =  await fetchLink({ address: `masters/Employeedetails/getusersproject?Project_Id=${projectId}` });
                const schTypeResponse =  await fetchLink({ address: `taskManagement/project/schedule/newscheduleType` });


                if (userResponse.success) setUsersDropdown(userResponse.data || []);
                if (schTypeResponse.success) {
                
       }
                
            } catch (error) {
                toast.error("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        if (open) fetchData();
    }, [projectId, open, reload]);


    useEffect(() => {
 
        const fetchSelectedData = async () => {
            setLoading(true);
            try {
                if (editData) {
                    const selectedSchType =  await fetchLink({ address: `masters/employeedetails/selectedTaskDetails?projectId=${projectId}&Sch_Id=${taskId.Sch_Id}&Task_Id=${taskId.Task_Id}` });

                    const selectedSchId = selectedSchType.data[0]?.Sch_Type_Id;
                    const selectedSchName = selectedSchType.data[0]?.Sch_Name;

                    if (selectedSchId && selectedSchName) {
                        setSelectedSch({ value: selectedSchId, label: selectedSchName });
                    } else {
                        setSelectedSch({ value: '', label: '' });
                    }


                } else {
                    const selectedSchType = await fetchLink({ address: `masters/employeedetails/selectedTaskDetails?projectId=${projectId}&Sch_Id=${taskId.TaskSchId}&Task_Id=${taskId.Task_Id}` });


                    const selectedSchId = selectedSchType.data[0]?.Sch_Type_Id;
                    const selectedSchName = selectedSchType.data[0]?.Sch_Name;

                    if (selectedSchId && selectedSchName) {
                        setSelectedSch({ value: selectedSchId, label: selectedSchName });
                    } else {
                        setSelectedSch({ value: '', label: '' });
                    }

                }
            } catch (error) {

                toast.error("Failed to fetch data.");
            } finally {
                setLoading(false);
            }

        };

        if (open) fetchSelectedData();
    }, [open, editData, reload,projectId]);

    useEffect(() => {
        if (editData) {

            setAssignEmpInpt(prev => ({
                ...prev,
                AN_No: editData.AN_No,
                Emp_Id: editData.Emp_Id,
                Sch_Time: editData.Sch_Time,
                EN_Time: editData.EN_Time,
                Est_Start_Dt: editData.Est_Start_Dt.split('T')[0],
                Est_End_Dt: editData.Est_End_Dt.split('T')[0],
                Ord_By: editData.Ord_By,
                Timer_Based: editData.Timer_Based,
                Invovled_Stat: editData.Invovled_Stat,
                Sch_Type_Id: editData.Sch_Type,
                Sch_Type: editData.Sch_Type_Name,
                EmpGet: editData.EmployeeName,
                Is_Repitative: editData.Is_Repitative,
                RepeatDays: {
                    Mon: !!editData.IS_Rep_Monday,
                    Tue: !!editData.IS_Rep_Tuesday,
                    Wed: !!editData.IS_Rep_Wednesday,
                    Thu: !!editData.IS_Rep_Thursday,
                    Fri: !!editData.Is_Rep_Friday,
                    Sat: !!editData.Is_Rep_Saturday,
                    Sun: !!editData.Is_Rep_Sunday,
                },
            }));
        }
    }, [editData]);



    const calculateSchPeriod = () => {
        const [hours1, minutes1] = assignEmpInpt.Sch_Time.split(':').map(Number);
        const [hours2, minutes2] = assignEmpInpt.EN_Time.split(':').map(Number);

        const date1 = new Date(0, 0, 0, hours1, minutes1);
        const date2 = new Date(0, 0, 0, hours2, minutes2);

        if (date2 > date1) {
            let difference = Math.abs(date2 - date1);
            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor(difference / (1000 * 60));
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
        return '';
    };


    const mapRepeatDaysToISRepFields = () => {
        return {
            IS_Rep_Monday: assignEmpInpt.RepeatDays.Mon ? 1 : null,
            IS_Rep_Tuesday: assignEmpInpt.RepeatDays.Tue ? 1 : null,
            IS_Rep_Wednesday: assignEmpInpt.RepeatDays.Wed ? 1 : null,
            IS_Rep_Thursday: assignEmpInpt.RepeatDays.Thu ? 1 : null,
            Is_Rep_Friday: assignEmpInpt.RepeatDays.Fri ? 1 : null,
            Is_Rep_Saturday: assignEmpInpt.RepeatDays.Sat ? 1 : null,
            Is_Rep_Sunday: assignEmpInpt.RepeatDays.Sun ? 1 : null,
        };
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const schPeriod = calculateSchPeriod();

        if (assignEmpInpt.Est_End_Dt < assignEmpInpt.Est_Start_Dt) {
            toast.error("End date must be greater than start date.");
            return;
        }

        try {

            const address = editData ? 'masters/employeedetails/updateTask' : 'masters/employeedetails/assignTask';
            const repeatDaysMapped = mapRepeatDaysToISRepFields();
            const response = await fetchLink({
                address,
                method: editData ? 'PUT' : 'POST',
                bodyData: {
                    ...assignEmpInpt,
                    Project_Id: projectId,
                    Sch_Id: editData ? taskId.Sch_Id : taskId.TaskSchId,
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
                    Sch_Type: selectedSch.value,
                    Timer_Based: assignEmpInpt.Timer_Based ? 1 : 0,
                    Invovled_Stat: assignEmpInpt.Invovled_Stat ? 1 : 0,
                    Is_Repitative: assignEmpInpt.Is_Repitative ? 1 : 0,
                    RepeatDays: assignEmpInpt.Is_Repitative ? assignEmpInpt.RepeatDays : '',
                    ...repeatDaysMapped,
                }

            });

            if (response.success) {
                toast.success(`Task ${editData ? 'updated' : 'assigned'} successfully!`);
                setAssignEmpInpt({});

                onClose();
        

            } else {

                toast.error("Please fill the values correctly");
            }
        } catch (error) {
            toast.error("Error during task assignment/update: " + error.message);
        }

    };

    return (
        <>



            <Dialog open={open} maxWidth="sm">
                <DialogTitle>{editData ? 'Edit Task' : 'Employee Assign'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent className="table-responsive">
                           {loading && <div>Loading...</div>}
                        <table className="table" style={{ tableLayout: 'fixed' }}>
                            <tbody>
                                <tr>
                                    <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle', paddingRight: '1em' }}>
                                        Employee
                                    </td>
                                    <td className="border-bottom-0 fa-15" style={{ paddingLeft: '1em' }}>
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
                                    <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle', paddingRight: '1em' }}>
                                        Sch_Type
                                    </td>
                                    
                                    <td className="border-bottom-0 fa-15" style={{ paddingLeft: '1em' }}>
                                        <Select
                                            value={selectedSch ? { value: selectedSch.value, label: `${selectedSch.label}` } : null}
                                            styles={{ padding: '0.5em' }}
                                            isDisabled
                                            placeholder="Select Sch_Type"
                                        />
                                    </td>
                                </tr>



                                {/* Time and Date Inputs */}
                                <tr>
                                    <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle', paddingRight: '1em' }}>
                                        Start Time
                                    </td>
                                    <td className="border-bottom-0 fa-15" style={{ paddingLeft: '1em' }}>
                                        <input
                                            type="time"
                                            className="cus-inpt"
                                            value={assignEmpInpt.Sch_Time}
                                            required
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Sch_Time: e.target.value })}
                                            style={{ padding: '0.5em' }}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle', paddingRight: '1em' }}>
                                        End Time
                                    </td>
                                    <td className="border-bottom-0 fa-15" style={{ paddingLeft: '1em' }}>
                                        <input
                                            type="time"
                                            className="cus-inpt"
                                            value={assignEmpInpt.EN_Time}
                                            required
                                            min={assignEmpInpt.Sch_Time}
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, EN_Time: e.target.value })}
                                            style={{ padding: '0.5em' }}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle', paddingRight: '1em' }}>
                                        Est. Start Date
                                    </td>
                                    <td className="border-bottom-0 fa-15" style={{ paddingLeft: '1em' }}>
                                        <input
                                            type="date"
                                            className="cus-inpt"
                                            value={assignEmpInpt.Est_Start_Dt}
                                            required
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_Start_Dt: e.target.value })}
                                            style={{ padding: '0.5em' }}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle', paddingRight: '1em' }}>
                                        Est. End Date
                                    </td>
                                    <td className="border-bottom-0 fa-15" style={{ paddingLeft: '1em' }}>
                                        <input
                                            type="date"
                                            className="cus-inpt"
                                            value={assignEmpInpt.Est_End_Dt}
                                            required
                                            min={assignEmpInpt.Est_Start_Dt}
                                            onChange={e => setAssignEmpInpt({ ...assignEmpInpt, Est_End_Dt: e.target.value })}
                                            style={{ padding: '0.5em' }}
                                        />
                                    </td>
                                </tr>

                                {/* Timer Based & Involved Status */}
                                <tr>
                                    <td className="border-bottom-0 fa-15 text-start" style={{ paddingRight: '1em' }}>
                                        <div style={{ display: 'inline-flex', marginRight: '1em' }}>
                                            <input
                                                className="form-check-input shadow-none"
                                                type="checkbox"
                                                id="timerbased"
                                                checked={Boolean(Number(assignEmpInpt?.Timer_Based))}
                                                onChange={(e) =>
                                                    setAssignEmpInpt({ ...assignEmpInpt, Timer_Based: e.target.checked })
                                                }
                                                style={{ marginRight: '0.5em' }}
                                            />
                                            <label className="form-check-label p-1 ps-2" htmlFor="timerbased">
                                                Timer Based Task?
                                            </label>
                                        </div>

                                        {editData && (
                                            <div style={{ display: 'inline-flex', marginRight: '1em' }}>
                                                <input
                                                    className="form-check-input shadow-none"
                                                    type="checkbox"
                                                    checked={Boolean(Number(assignEmpInpt?.Invovled_Stat))}
                                                    onChange={() =>
                                                        setAssignEmpInpt({ ...assignEmpInpt, Invovled_Stat: !assignEmpInpt.Invovled_Stat })
                                                    }
                                                    style={{ marginRight: '0.5em' }}
                                                />
                                                <label className="form-check-label p-1 ps-2">Involved Status</label>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-bottom-0 fa-15" style={{ paddingRight: '1em' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1em' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={assignEmpInpt.Is_Repitative === 1}
                                                    onChange={(e) => {
                                                        setAssignEmpInpt((prevState) => ({
                                                            ...prevState,
                                                            Is_Repitative: e.target.checked ? 1 : 0,
                                                        }));
                                                    }}
                                                    style={{ marginRight: '1em' }}
                                                />
                                                <label style={{ marginBottom: '0' }}>Is Repetitive?</label>
                                            </div>
                                            {assignEmpInpt.Is_Repitative === 1 && (
                                                <div style={{ display: 'inline-flex', gap: '0.5em' }}>
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                        <label
                                                            key={day}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                marginRight: '1em',
                                                                width: '30px',
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={assignEmpInpt.RepeatDays[day]}
                                                                onChange={() =>
                                                                    setAssignEmpInpt({
                                                                        ...assignEmpInpt,
                                                                        RepeatDays: {
                                                                            ...assignEmpInpt.RepeatDays,
                                                                            [day]: !assignEmpInpt.RepeatDays[day],
                                                                        },
                                                                    })
                                                                }
                                                                style={{ marginRight: '0.5em' }}
                                                            />
                                                            {day}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>


                            </tbody>
                        </table>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                onClose();
                                setAssignEmpInpt(intitalVlaue);
                            }}
                            variant="outlined"
                        >
                            Close
                        </Button>
                        <Button type="submit" variant="contained">
                            Save Changes
                        </Button>

                    </DialogActions>
                </form>
            </Dialog>


        </>
    );
};

export default TaskAssign;
