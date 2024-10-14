import { MyContext } from "../../Components/context/contextProvider";
import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../common.css'
import { Edit, Delete } from '@mui/icons-material';
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DataTable from "react-data-table-component";
import TaskParametersComp from "./taskParameters";
import { fetchLink } from '../../Components/fetchComponent';
import TaskMasterMgt from "./Components/addEditTask";
import { isEqualNumber, isValidObject } from "../../Components/functions";


const TaskMaster = ({ loadingOn, loadingOff }) => {
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
    const [reload, setReload] = useState(false);
    const { contextObj } = useContext(MyContext);
    const [inputValue, setInputValue] = useState(initialValue);
    const [dialog, setDialog] = useState(false);
    const [filterInput, setFilterInput] = useState('');
    const [rowValue, setRowValue] = useState({});

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
        const filteredResults = [...taskData].filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(filterInput.toLowerCase())
            );
        });

        setFilteredData(filteredResults);
    }, [filterInput, taskData])

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
                        <IconButton onClick={() => setRowValue(row)}>
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

    const resetValues = () => setRowValue({})

    return (
        <>
            <TaskParametersComp />

            {isValidObject(rowValue) && (
                <TaskMasterMgt
                    row={rowValue}
                    openAction={true}
                    reload={() => setReload(pre => !pre)}
                    onCloseFun={resetValues}
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                />
            )}

            <div className="card">

                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    <span>Task Master</span>
                    {isEqualNumber(contextObj.Add_Rights, 1) && (
                        <TaskMasterMgt
                            openAction={false}
                            reload={() => setReload(pre => !pre)}
                            onCloseFun={resetValues}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        >
                            <button
                                className="btn btn-primary rounded-5 px-3 py-1 fa-13 shadow"
                            >
                                {'Create Task'}
                            </button>
                        </TaskMasterMgt>
                    )}
                </div>

                <div className="card-body p-0 overflow-hidden rounded-bottom-3">
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
                            data={filterInput ? filteredData : taskData}
                            pagination
                            highlightOnHover={true}
                            fixedHeader={true}
                            fixedHeaderScrollHeight={'68vh'}
                        />
                    </>

                </div>
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