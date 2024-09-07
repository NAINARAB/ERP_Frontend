import { MyContext } from "../../Components/context/contextProvider";
import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../common.css'
import { Edit, Delete, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, TextField, Autocomplete } from '@mui/material';
import DataTable from "react-data-table-component";
import TaskParametersComp from "./taskParameters";
import { fetchLink } from '../../Components/fetchComponent';
import { checkIsNumber } from '../../Components/functions'

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const TaskMaster = () => {
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
    const [taskData, setTaskData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [taskGroup, setTaskGroup] = useState([]);
    const [taskParameters, setTaskParameters] = useState([]);

    const [reload, setReload] = useState(false);
    const { contextObj } = useContext(MyContext);
    const [screen, setScreen] = useState(true);
    const [inputValue, setInputValue] = useState(initialValue);
    const [dialog, setDialog] = useState(false);
    const [filterInput, setFilterInput] = useState('');

    useEffect(() => {
        fetchLink({
            address: `taskManagement/tasks?Company_id=${parseData?.Company_id}`
        }).then(data => {
            if (data.success) {
                setTaskData(data.data)
            }
        }).catch(e => console.error(e))

    }, [reload])

    useEffect(() => {

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
        const filteredResults = [...taskData].filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(filterInput.toLowerCase())
            );
        });
        
        setFilteredData(filteredResults);
    }, [filterInput, taskData])

    const switchScreen = (rel) => {
        setInputValue(initialValue);
        setScreen(!screen);
        if (rel) {
            setReload(!reload)
        }
    }

    const handleEdit = (row) => {
        setInputValue(row);
        setScreen(!screen);
    }

    const handleDelete = (row) => {
        setInputValue(row);
        setDialog(true);
    }

    const closeDialog = () => {
        setInputValue(initialValue);
        setDialog(false);
    }

    const tasksColumn = [
        {
            name: 'Task',
            selector: (row) => row?.Task_Name,
            sortable: true,
        },
        {
            name: 'Task Group',
            selector: (row) => row?.Task_Group,
            sortable: true,
        },
        {
            name: 'Task Describtion',
            selector: (row) => row?.Task_Desc,
            sortable: true,
            width: '170px'
        },
        {
            name: 'Created At',
            selector: (row) => new Date(row?.Entry_Date),
            cell: (row) => {
                return new Date(row?.Entry_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            },
            sortable: true
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div>
                    {Number(contextObj?.Edit_Rights) === 1 && (
                        <IconButton onClick={() => handleEdit(row)}>
                            <Edit />
                        </IconButton>
                    )}
                    {Number(contextObj?.Delete_Rights) === 1 && (
                        <IconButton onClick={() => handleDelete(row)}>
                            <Delete sx={{ color: '#FF6865' }} />
                        </IconButton>
                    )}
                </div>
            ),
        },
    ];

    const postAndPutTask = async () => {
        const paramArr = inputValue?.Task_Parameters?.map(param => ({
            ...param,
            Param_Id: param?.Paramet_Id
        })) || [];

        const PostObj = {
            ...inputValue,
            Task_Parameters: paramArr
        }
        if (inputValue?.Task_Name && inputValue?.Task_Desc) {
            fetchLink({
                address: `taskManagement/tasks`,
                method: checkIsNumber(PostObj.Task_Id) ? 'PUT' : 'POST',
                bodyData: PostObj
            }).then(data => {
                if (data.success) {
                    toast.success(data.message);
                    switchScreen(true);
                } else {
                    toast.error(data.message);
                }
            }).catch(e => console.error(e))
           
        } else {
            toast.error('Enter Task Name and Describtion')
        }
    }

    const deleteTask = async () => {
        if (inputValue?.Task_Id && Number(contextObj.Delete_Rights) === 1) {
            fetchLink({
                address: `taskManagement/tasks`,
                method: 'DELETE',
                bodyData: { Task_Id: inputValue?.Task_Id }
            }).then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    closeDialog();
                } else {
                    toast.error(data.message);
                }
            }).catch(e => console.error(e))
        }
    }

    function handleSearchChange(event) {
        const term = event.target.value;
        setFilterInput(term);
    }

    return (
        <>
            <TaskParametersComp />

            <div className="card">

                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    <div className="fa-15 flex-grow">
                        {screen ? 'Task List' : checkIsNumber(inputValue.Task_Id) ? 'Edit Task' : 'Create Task'}
                    </div>
                    <button onClick={() => { switchScreen(false) }} className="btn btn-primary rounded-5 px-3 py-1 fa-13 shadow">
                        {screen ? 'Create Task' : 'Back'}
                    </button>
                </div>

                <div className="card-body p-0 overflow-hidden rounded-bottom-3">
                    {screen ? (
                        <>
                            <div className="d-flex justify-content-end">
                                <div className="col-md-4 p-2">
                                    <input
                                        type="search"
                                        value={filterInput}
                                        className="cus-inpt"
                                        placeholder="Search"
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <DataTable
                                columns={tasksColumn}
                                data={filteredData && filteredData.length ? filteredData : filterInput === '' ? taskData : []}
                                pagination
                                highlightOnHover={true}
                                fixedHeader={true}
                                fixedHeaderScrollHeight={'68vh'}
                            />
                        </>
                    ) : (
                        <div className="row px-3 py-2">

                            <div className="col-md-4 p-2">
                                <label>Task Name</label>
                                <input
                                    maxLength={150}
                                    onChange={e => setInputValue({ ...inputValue, Task_Name: e.target.value })}
                                    value={inputValue?.Task_Name}
                                    placeholder="ex: File Checking"
                                    className="cus-inpt" />
                            </div>

                            <div className="col-md-4 p-2">
                                <label>Task Group</label>
                                <select
                                    value={inputValue.Task_Group_Id}
                                    className="cus-inpt"
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
                                <label>Task Describtion</label>
                                <textarea
                                    className="cus-inpt"
                                    value={inputValue.Task_Desc}
                                    rows="5"
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
                    )}
                </div>
                {!screen && (
                    <div className="card-body text-end">
                        <button
                            className="btn btn-light rounded-5 px-3 me-2"
                            onClick={() => switchScreen(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary rounded-5 px-3"
                            onClick={postAndPutTask}>
                            {checkIsNumber(inputValue.Task_Id) ? "Update Task" : 'Create Task'}
                        </button>
                    </div>
                )}
            </div>

            <Dialog
                open={dialog}
                onClose={closeDialog}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description">
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">Confirmation</DialogTitle>
                <DialogContent className="p-4">
                    Do you want to delete the
                    <span className="text-primary">{" " + inputValue?.Task_Name + " "}</span>
                    Task ?
                </DialogContent>
                <DialogActions>
                    <button
                        className="btn btn-light rounded-5 px-3 me-1"
                        onClick={closeDialog}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary rounded-5 px-3"
                        onClick={deleteTask}>
                        Delete
                    </button>
                </DialogActions>
            </Dialog>

        </>
    ) 
}

export default TaskMaster