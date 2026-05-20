// Level2TaskDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  Autocomplete,
//   MenuItem
} from '@mui/material';
import Select from 'react-select';
import { toast } from "react-toastify";
import { fetchLink } from '../../Components/fetchComponent';
import { customSelectStyles } from "../../Components/tablecolumn";
// import { ISOString } from '../../Components/functions';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const Level2TaskDialog = ({
  open,
  onClose,
  isEdit = false,
  initialData = null,
  scheduleId,
  projectId,
  dependencyTasks = [],
  tasks = [],
  taskType = [],
  workStatus = [],
  onSuccess
}) => {
  const [taskScheduleInput, setTaskScheduleInput] = useState({
    Sch_Project_Id: projectId,
    Sch_Id: scheduleId,
    Task_Levl_Id: '',
    Task_Id: '',
    Type_Task_Id: 1,
    Task_Sch_Duaration: '01:00',
    Task_Start_Time: '10:00',
    Task_End_Time: '11:00',
    Task_Est_Start_Date: new Date().toISOString().split('T')[0],
    Task_Est_End_Date: new Date().toISOString().split('T')[0],
    Task_Sch_Status: 1,
    Levl_Id: 2,
    Task_Depend_Level_Id: '',
    TasksGet: '- Select Task -'
  });

  const [selectedDependencyTasks, setSelectedDependencyTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize form when dialog opens or data changes
  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        setTaskScheduleInput(initialData);
        setSelectedDependencyTasks(initialData.dependencyTasks || []);
      } else {
        setTaskScheduleInput(prev => ({
          ...prev,
          Sch_Project_Id: projectId,
          Sch_Id: scheduleId,
          Levl_Id: 2
        }));
        setSelectedDependencyTasks([]);
      }
    }
  }, [open, isEdit, initialData, projectId, scheduleId]);

  // Update duration when start/end time changes
  useEffect(() => {
    const [hours1, minutes1] = taskScheduleInput?.Task_Start_Time.split(':').map(Number);
    const [hours2, minutes2] = taskScheduleInput?.Task_End_Time.split(':').map(Number);

    const date1 = new Date(0, 0, 0, hours1, minutes1);
    const date2 = new Date(0, 0, 0, hours2, minutes2);

    if (date2 > date1) {
      let difference = Math.abs(date2 - date1);
      const hours = Math.floor(difference / (1000 * 60 * 60));
      difference %= (1000 * 60 * 60);
      const minutes = Math.floor(difference / (1000 * 60));

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');

      setTaskScheduleInput(opt => ({ 
        ...opt, 
        Task_Sch_Duaration: `${formattedHours}:${formattedMinutes}` 
      }));
    }
  }, [taskScheduleInput?.Task_Start_Time, taskScheduleInput?.Task_End_Time]);

  // Update dependency task IDs
  useEffect(() => {
    if (selectedDependencyTasks.length > 0) {
      const numStr = selectedDependencyTasks.map(obj => obj?.Task_Levl_Id).join(',');
      setTaskScheduleInput(opt => ({ ...opt, Task_Depend_Level_Id: numStr }));
    } else {
      setTaskScheduleInput(opt => ({ ...opt, Task_Depend_Level_Id: '' }));
    }
  }, [selectedDependencyTasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!taskScheduleInput.Task_Id) {
      toast.warn('Select Task');
      setLoading(false);
      return;
    }

    if (taskScheduleInput.Task_Depend_Level_Id === '') {
      toast.warn('Select Dependency Tasks');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchLink({
        address: `taskManagement/project/schedule/scheduleTask`,
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        bodyData: taskScheduleInput
      });

      if (response.success) {
        toast.success(response.message);
        onSuccess();
        handleClose();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving the task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTaskScheduleInput({
      Sch_Project_Id: projectId,
      Sch_Id: scheduleId,
      Task_Levl_Id: '',
      Task_Id: '',
      Type_Task_Id: 1,
      Task_Sch_Duaration: '01:00',
      Task_Start_Time: '10:00',
      Task_End_Time: '11:00',
      Task_Est_Start_Date: new Date().toISOString().split('T')[0],
      Task_Est_End_Date: new Date().toISOString().split('T')[0],
      Task_Sch_Status: 1,
      Levl_Id: 2,
      Task_Depend_Level_Id: '',
      TasksGet: '- Select Task -'
    });
    setSelectedDependencyTasks([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>{isEdit ? 'Edit Sub Task' : 'Assign Sub Task'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <table className="table">
            <tbody>
              <tr>
                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Task</td>
                <td className="border-bottom-0 fa-15">
                  <Select
                    value={{ 
                      value: taskScheduleInput?.Task_Id, 
                      label: taskScheduleInput?.TasksGet 
                    }}
                    onChange={(e) => setTaskScheduleInput({ 
                      ...taskScheduleInput, 
                      Task_Id: e.value, 
                      TasksGet: e.label 
                    })}
                    options={[...tasks.map(obj => ({ 
                      value: obj.Task_Id, 
                      label: obj.Task_Name 
                    }))]}
                    styles={customSelectStyles}
                    isSearchable={true}
                    required
                    placeholder={"Select Task"}
                  />
                </td>
              </tr>
              <tr>
                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Task Type</td>
                <td className="border-bottom-0 fa-15">
                  <select
                    className="cus-inpt"
                    value={taskScheduleInput?.Type_Task_Id}
                    required
                    onChange={e => setTaskScheduleInput({ 
                      ...taskScheduleInput, 
                      Type_Task_Id: e.target.value 
                    })}
                  >
                    {taskType.map((o, i) => (
                      <option key={i} value={o?.Task_Type_Id}>
                        {o?.Task_Type}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Date</td>
                <td className="border-bottom-0 fa-15">
                  <input
                    type='date'
                    className="cus-inpt"
                    required
                    value={taskScheduleInput?.Task_Est_Start_Date && 
                      new Date(taskScheduleInput?.Task_Est_Start_Date).toISOString().split('T')[0]}
                    onChange={e => setTaskScheduleInput({ 
                      ...taskScheduleInput, 
                      Task_Est_Start_Date: e.target.value 
                    })}
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
                    min={taskScheduleInput?.Task_Est_Start_Date}
                    value={taskScheduleInput?.Task_Est_End_Date && 
                      new Date(taskScheduleInput?.Task_Est_End_Date).toISOString().split('T')[0]}
                    onChange={e => setTaskScheduleInput({ 
                      ...taskScheduleInput, 
                      Task_Est_End_Date: e.target.value 
                    })}
                  />
                </td>
              </tr>
              <tr>
                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Start Time</td>
                <td className="border-bottom-0 fa-15">
                  <input
                    type='time'
                    className="cus-inpt"
                    value={taskScheduleInput?.Task_Start_Time}
                    required
                    onChange={e => setTaskScheduleInput({ 
                      ...taskScheduleInput, 
                      Task_Start_Time: e.target.value 
                    })}
                  />
                </td>
              </tr>
              <tr>
                <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>End Time</td>
                <td className="border-bottom-0 fa-15">
                  <input
                    type='time'
                    className="cus-inpt"
                    required
                    min={taskScheduleInput?.Task_Start_Time}
                    value={taskScheduleInput?.Task_End_Time}
                    onChange={e => setTaskScheduleInput({ 
                      ...taskScheduleInput, 
                      Task_End_Time: e.target.value 
                    })}
                  />
                </td>
              </tr>
              {isEdit && (
                <tr>
                  <td className="border-bottom-0 fa-15" style={{ verticalAlign: 'middle' }}>Status</td>
                  <td className="border-bottom-0 fa-15">
                    <select
                      className="cus-inpt"
                      value={taskScheduleInput.Task_Sch_Status}
                      required
                      onChange={e => setTaskScheduleInput({ 
                        ...taskScheduleInput, 
                        Task_Sch_Status: e.target.value 
                      })}
                    >
                      {workStatus.map((o, i) => (
                        <option key={i} value={o?.Status_Id}>
                          {o?.Status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Dependency Tasks Section */}
          <label className="mb-2">Select Dependency Tasks</label>
          <Autocomplete
            multiple
            id="level2-dependency-tasks"
            options={dependencyTasks}
            disableCloseOnSelect
            getOptionLabel={(option) => option?.TaskNameGet}
            value={selectedDependencyTasks}
            onChange={(event, newValue) => setSelectedDependencyTasks(newValue)}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option?.TaskNameGet}
              </li>
            )}
            style={{ width: '100%' }}
            isOptionEqualToValue={(opt, val) => 
              Number(opt?.Task_Levl_Id) === Number(val?.Task_Levl_Id)
            }
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Dependency Tasks" 
                placeholder="Select tasks this task depends on" 
                required
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            type='button' 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type='submit'
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Assign Task')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Level2TaskDialog;