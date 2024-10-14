import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../common.css'
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, TextField, Autocomplete } from '@mui/material';
import { fetchLink } from '../../../Components/fetchComponent';
import { isValidObject } from '../../../Components/functions';
import RequiredStar from "../../../Components/requiredStar";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const TaskMasterMgt = ({ row, children, openAction, reload, onCloseFun, loadingOn, loadingOff }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialValue = {
        Task_Id: "",
        Task_Name: "",
        Task_Desc: "",
        Task_Group_Id: 0,
        Entry_By: parseData?.UserId,
        Entry_Date: "",
        Update_By: '',
        Update_Date: "",
        Task_Parameters: [],
    }
    const [dialog, setDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [taskData, setTaskData] = useState([]);
    const [taskGroup, setTaskGroup] = useState([]);
    const [taskParameters, setTaskParameters] = useState([]);
    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {

        fetchLink({
            address: `taskManagement/tasks/dropdown`
        }).then(data => {
            if (data.success) {
                setTaskData(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/taskType/dropDown`
        }).then(data => {
            if (data.success) {
                setTaskGroup(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `taskManagement/parameters`
        }).then(data => {
            if (data.success) {
                setTaskParameters(data.data)
            }
        }).catch(e => console.error(e))

    }, [])

    useEffect(() => {
        setDialog(openAction ? true : false)
    }, [openAction])

    useEffect(() => {
        if (isValidObject(row)) {
            setInputValue(pre => {
                let inputVAL = { ...pre }
                Object.entries(row).forEach(([key, value]) => {
                    inputVAL[key] = value
                })
                return inputVAL
            });
            setIsEdit(true);
        } else {
            setInputValue(initialValue);
            setIsEdit(false);
        }
    }, [row]);

    const closeDialog = () => {
        setInputValue(initialValue);
        setDialog(false);
        if (onCloseFun) {
            onCloseFun();
        }
    }

    const postAndPutTask = async () => {
        const paramArr = inputValue?.Task_Parameters?.map(param => ({
            ...param,
            Param_Id: param?.Paramet_Id
        })) || [];

        const PostObj = {
            ...inputValue,
            Task_Parameters: paramArr
        }
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: `taskManagement/tasks`,
            method: isEdit ? 'PUT' : 'POST',
            bodyData: PostObj
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                closeDialog();  
                if (reload) {
                    reload();
                }
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        })
    }

    return (
        <>
            
            <span onClick={() => setDialog(true)} style={{ cursor: 'pointer' }}>{children}</span>

            <Dialog
                open={dialog}
                onClose={closeDialog}>

                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">
                    {isEdit ? 'Edit Task' : 'Add Task'}
                </DialogTitle>

                <form onSubmit={e => {
                    e.preventDefault();
                    postAndPutTask();
                }}>

                    <DialogContent>
                        <div className="row ">

                            <div className="col-md-4 p-2">
                                <label>Task Name <RequiredStar /></label>
                                <input
                                    maxLength={150}
                                    onChange={e => setInputValue({ ...inputValue, Task_Name: e.target.value })}
                                    required
                                    value={inputValue?.Task_Name}
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
                                    <option value={0} disabled>- select -</option>
                                    {taskGroup?.map((o, i) => (
                                        Number(o?.Task_Type_Id) !== 0 &&
                                        <option key={i} value={o?.Task_Type_Id}>
                                            {o?.Task_Type}
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
                                    {taskData?.map((o, i) => (
                                        <option key={i} value={o?.Task_Id}>
                                            {o?.Task_Name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12">
                                <label>Task Describtion <RequiredStar /></label>
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
                                    options={[...taskParameters?.map(o => ({ ...o, Default_Value: '' }))]}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option?.Paramet_Name + ' - ' + option?.Paramet_Data_Type}
                                    value={inputValue?.Task_Parameters || []}
                                    onChange={(f, e) => setInputValue({ ...inputValue, Task_Parameters: e })}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option?.Paramet_Name + ' - ' + option?.Paramet_Data_Type}
                                        </li>
                                    )}
                                    className="pt-2"
                                    isOptionEqualToValue={(opt, val) => Number(opt?.Paramet_Id) === Number(val?.Paramet_Id)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Task Prarameters" placeholder="Choose Task Parameters" />
                                    )}
                                />
                            </div>

                            {inputValue?.Task_Parameters?.map((param, index) => (
                                <div key={index} className="col-md-4 p-2">
                                    <label className="mb-2">{param?.Paramet_Name}</label>
                                    <input
                                        type={param?.Paramet_Data_Type || 'text'}
                                        className="cus-inpt"
                                        onChange={(e) => {
                                            const updatedDetString = [...inputValue.Task_Parameters];
                                            updatedDetString[index] = {
                                                ...updatedDetString[index],
                                                Default_Value: e.target.value,
                                            };
                                            setInputValue({ ...inputValue, Task_Parameters: updatedDetString });
                                        }}
                                        value={param?.Default_Value}
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
        </>
    )
}

export default TaskMasterMgt;