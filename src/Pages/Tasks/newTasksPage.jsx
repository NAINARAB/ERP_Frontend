import api from "../../API";
import { MyContext } from "../../Components/context/contextProvider";
import { useContext, useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../common.css'
import { Edit, Delete } from '@mui/icons-material';
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DataTable from "react-data-table-component";
import InvalidPageComp from "../../Components/invalidCredential";


const TaskMaster = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialValue = {
        Task_Id: "",
        Task_No: "",
        Task_Name: "",
        Task_Desc: "",
        Under_Task_Id: 0,
        Task_Group_Id: 0,
        Entry_By: parseData?.UserId,
        Entry_Date: "",
        Update_By: '',
        Update_Date: "",
        Under_Task: ""
    }
    const [taskData, setTaskData] = useState([]);
    const [taskGroup, setTaskGroup] = useState([]);

    const [reload, setReload] = useState(false);
    const { contextObj } = useContext(MyContext);
    const [isEdit, setIsEdit] = useState(false);
    const [screen, setScreen] = useState(true);
    const [inputValue, setInputValue] = useState(initialValue);
    const [dialog, setDialog] = useState(false);

    useEffect(() => {
        fetch(`${api}tasks`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskData(data.data)
                }
            })
    }, [reload])

    useEffect(() => {
        fetch(`${api}taskTypeDropDown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskGroup(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [])

    const switchScreen = (rel) => {
        setInputValue(initialValue)
        setScreen(!screen);
        setIsEdit(false);
        if (rel) {
            setReload(!reload)
        }
    }

    const handleEdit = (row)     => {
        setInputValue(row);
        setIsEdit(true);
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
            name: 'T.No',
            selector: (row) => row?.Task_No,
            sortable: true,
        },
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
            name: 'Under Task',
            selector: (row) => row?.Under_Task,
            sortable: true,
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
                    {Number(contextObj?.Edit_Rights) === 1 && <IconButton onClick={() => handleEdit(row)}><Edit /></IconButton>}
                    {Number(contextObj?.Delete_Rights) === 1 && <IconButton onClick={() => handleDelete(row)}><Delete sx={{ color: '#FF6865' }} /></IconButton>}
                </div>
            ),
        },
    ];

    const postAndPutTask = async () => {
        if (inputValue?.Task_Name && inputValue?.Task_Desc) {
            const result = await fetch(`${api}tasks`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputValue)
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    toast.success(data.message);
                    switchScreen(true);
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        } else {
            toast.error('Enter Task Name and Describtion')
        }
    }

    const deleteTask = async () => {
        if (inputValue?.Task_Id && Number(contextObj.Delete_Rights) === 1) {
            const result = await fetch(`${api}tasks`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Task_Id: inputValue?.Task_Id })
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    closeDialog();
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        }
    }

    return Number(contextObj.Read_Rights) === 1 ? (
        <>
            <ToastContainer />
            <div className="card">

                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    <div className="fa-15 flex-grow">
                        {screen ? 'Task List' : isEdit ? 'Edit Task' : 'Create Task'}
                    </div>
                    <button onClick={() => { switchScreen(false) }} className="btn btn-primary rounded-5 px-3 py-1 fa-13 shadow">
                        {screen ? 'Create Task' : 'Back'}
                    </button>
                </div>

                <div className="card-body p-0 overflow-hidden rounded-bottom-3">
                    {screen ? (
                        <DataTable
                            columns={tasksColumn}
                            data={taskData}
                            pagination
                            highlightOnHover={true}
                            fixedHeader={true}
                            fixedHeaderScrollHeight={'68vh'} />
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
                                    {taskGroup.map((o, i) => (
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
                                    {taskData.map((o, i) => (
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
                        </div>
                    )}
                </div>
                {!screen && (
                    <div className="card-body text-end">
                        <button
                            className="btn btn-light rounded-5 px-3 me-2"
                            onClick={switchScreen}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary rounded-5 px-3"
                            onClick={postAndPutTask}>
                            {isEdit ? "Update Task" : 'Create Task'}
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
    ) :
        <InvalidPageComp />
}

export default TaskMaster