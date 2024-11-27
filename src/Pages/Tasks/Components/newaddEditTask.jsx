import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../common.css';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, TextField, Autocomplete } from '@mui/material';
import { fetchLink } from '../../../Components/fetchComponent';
import { isValidObject } from '../../../Components/functions';
import RequiredStar from "../../../Components/requiredStar";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const TaskMasterMgt = ({ row, children, openAction, reload, onCloseFun, loadingOn, loadingOff, onTaskAdded }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    
    const initialValue = {
        Task_Id: "",
        Task_Name: "",
        Task_Desc: "",
        Task_Group_Id: "",
        Entry_By: parseData?.UserId,
        Company_id: parseData?.Company_id,
        Entry_Date: "",
        Update_By: '',
        Update_Date: "",
        Task_Parameters: [],
    };

    const [dialog, setDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [taskData, setTaskData] = useState([]);
    const [taskGroup, setTaskGroup] = useState([]);
    const [taskParameters, setTaskParameters] = useState([]);
    const [inputValue, setInputValue] = useState(initialValue);
    const [editDialog, setEditDialog] = useState(false);
    const [editInputValue, setEditInputValue] = useState(initialValue);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const taskResponse = await fetchLink({ address: `taskManagement/tasks/dropdown` });
                if (taskResponse.success) setTaskData(taskResponse.data);

                const taskGroupResponse = await fetchLink({ address: `masters/taskType/dropDown` });
                if (taskGroupResponse.success) setTaskGroup(taskGroupResponse.data);

                const taskParametersResponse = await fetchLink({ address: `taskManagement/parameters` });
                if (taskParametersResponse.success) setTaskParameters(taskParametersResponse.data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setDialog(openAction);
    }, [openAction]);

    useEffect(() => {
        if (isValidObject(row)) {
            console.log(row)
            setInputValue(prev => ({
                ...prev,
                ...row,
                Task_Group_Id: row.Task_Group_Id || "",
            }));
            setIsEdit(true);
        } else {
            setInputValue(initialValue);
            setIsEdit(false);
        }
    }, [row]);

    const closeDialog = () => {
        setDialog(false);
        if (onCloseFun) onCloseFun();
    };

    const closeEditDialog = () => {
        setEditDialog(false); 
        setEditInputValue(initialValue); 
    };

    const postAndPutTask = async () => {
        const paramArr = inputValue.Task_Parameters.map(param => ({
            ...param,
            Param_Id: param.Paramet_Id,
        })) || [];

        const PostObj = {
            ...inputValue,
            Task_Parameters: paramArr,
        };

        if (loadingOn) loadingOn();

        try {
            const response = await fetchLink({
                address: `taskManagement/tasks`,
                method: isEdit ? 'PUT' : 'POST',
                bodyData: PostObj,
            });
             
            if (response.success) {
                toast.success(response.message);
                setInputValue(initialValue)
                closeDialog();
                if (reload) reload();
                if (onTaskAdded) onTaskAdded(); 
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while processing your request.");
        } finally {
            if (loadingOff) loadingOff();
        }
    };

    // const openEditDialog = () => {
    //     setEditInputValue({
    //         ...inputValue,
    //         Task_Group_Id: inputValue.Type_Task_Id, 
    //     });

    //     setEditDialog(true);
    // };

    const handleEditSubmit = async () => {
        const paramArr = editInputValue.Task_Parameters.map(param => ({
            ...param,
            Param_Id: param.Paramet_Id,
        })) || [];

        const PostObj = {
            ...editInputValue,
            Task_Parameters: paramArr,
        };



        if (loadingOn) loadingOn();

        try {
            const response = await fetchLink({
                address: `taskManagement/tasks`,
                method: 'PUT',
                bodyData: PostObj,
            });

            if (response.success) {
                toast.success(response.message);
                closeEditDialog();
                if (reload) reload();
                if (onTaskAdded) onTaskAdded();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while processing your request.");
        } finally {
            if (loadingOff) loadingOff();
        }
    };

    return (
        <>
            <span onClick={() => setDialog(true)} style={{ cursor: 'pointer' }}>{children}</span>

            <Dialog open={dialog}>
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">
                    {isEdit ? 'Edit Task' : 'Add Task'}
                </DialogTitle>

                <form onSubmit={e => {
                    e.preventDefault();
                    postAndPutTask();
                }}>
                    <DialogContent>
                        <div className="row">
                            <div className="col-md-4 p-2">
                                <label>Task Name <RequiredStar /></label>
                                <input
                                    maxLength={150}
                                    onChange={e => setInputValue({ ...inputValue, Task_Name: e.target.value })}
                                    required
                                    value={inputValue.Task_Name}
                                    placeholder="ex: File Checking"
                                    className="cus-inpt" />
                            </div>
                            <div className="col-md-4 p-2">
                                <label>Task Group <RequiredStar /></label>
                                <select
                                    value={inputValue.Task_Group_Id}
                                    className="cus-inpt"
                                    required
                                    onChange={e => setInputValue({ ...inputValue, Task_Group_Id: e.target.value })}>
                                    <option value="" disabled>- select -</option>
                                    {taskGroup.map((o, i) => (
                                        <option key={i} value={o.Task_Type_Id}>
                                            {o.Task_Type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 p-2">
                                <label>Base Task</label>
                                <select
                                    value={inputValue.Under_Task_Id}
                                    className="cus-inpt"
                                    onChange={e => setInputValue({ ...inputValue, Under_Task_Id: e.target.value })}>
                                    <option value={0}>Primary</option>
                                    {taskData.map((o, i) => (
                                        <option key={i} value={o.Task_Id}>
                                            {o.Task_Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12">
                                <label>Task Description <RequiredStar /></label>
                                <textarea
                                    className="cus-inpt"
                                    value={inputValue.Task_Desc}
                                    rows="3"
                                    onChange={e => setInputValue({ ...inputValue, Task_Desc: e.target.value })} />
                            </div>
                            <div className="col-md-12 p-2">
                                <Autocomplete
                                    multiple
                                    id="checkboxes-tags-demo"
                                    options={taskParameters}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => `${option.Paramet_Name} - ${option.Paramet_Data_Type}`}
                                    value={inputValue.Task_Parameters || []}
                                    onChange={(event, newValue) => setInputValue({ ...inputValue, Task_Parameters: newValue })}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {`${option.Paramet_Name} - ${option.Paramet_Data_Type}`}
                                        </li>
                                    )}
                                    className="pt-2"
                                    isOptionEqualToValue={(opt, val) => Number(opt.Paramet_Id) === Number(val.Paramet_Id)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Task Parameters" placeholder="Choose Task Parameters" />
                                    )}
                                />
                            </div>

                            {inputValue.Task_Parameters.map((param, index) => (
                                <div key={index} className="col-md-4 p-2">
                                    <label className="mb-2">{param.Paramet_Name}</label>
                                    <input
                                        type={param.Paramet_Data_Type || 'text'}
                                        className="cus-inpt"
                                        onChange={(e) => {
                                            const updatedParams = [...inputValue.Task_Parameters];
                                            updatedParams[index] = {
                                                ...updatedParams[index],
                                                Default_Value: e.target.value,
                                            };
                                            setInputValue({ ...inputValue, Task_Parameters: updatedParams });
                                        }}
                                        value={param.Default_Value}
                                        placeholder="Default Value"
                                    />
                                </div>
                            ))}
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <button
                            className="btn btn-light rounded-5 px-3"
                            type="button"
                            onClick={closeDialog}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary rounded-5 px-3"
                            type='submit'>
                            Submit
                        </button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={editDialog} onClose={closeEditDialog}>
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">Edit Task</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    handleEditSubmit();
                }}>
                    <DialogContent>
                        <TextField
                            label="Task Name"
                            value={editInputValue.Task_Name}
                            onChange={e => setEditInputValue({ ...editInputValue, Task_Name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Task Group"
                            select
                            value={editInputValue.Task_Group_Id}
                            onChange={e => setEditInputValue({ ...editInputValue, Task_Group_Id: e.target.value })}
                            fullWidth
                        >
                            <option value="" disabled>- select -</option>
                            {taskGroup.map((o, i) => (
                                <option key={i} value={o.Task_Type_Id}>
                                    {o.Task_Type}
                                </option>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <button className="btn btn-light rounded-5 px-3" type="button" onClick={closeEditDialog}>
                            Cancel
                        </button>
                        <button className="btn btn-primary rounded-5 px-3" type='submit'>
                            Save
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};

export default TaskMasterMgt;
