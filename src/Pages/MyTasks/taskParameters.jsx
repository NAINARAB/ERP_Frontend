import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Chip, Paper, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../API';
import { toast } from "react-toastify";

const TaskParametersComp = () => {
    const initialValue = {
        Paramet_Id: '',
        Paramet_Name: '',
        Paramet_Data_Type: '',
    }
    const [parameters, setParameters] = useState([])
    const [addDialog, setAddDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [inputValue, setInputValue] = useState(initialValue);
    const [reload, setReload] = useState(false)

    useEffect(() => {
        fetch(`${api}tasks/parameters`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setParameters(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [reload])

    const AddParameter = () => {
        fetch(`${api}tasks/parameters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputValue)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            })
            .catch(e => console.error(e))
            .finally(CloseAddDialog)
    }

    const DeleteParameter = () => {
        fetch(`${api}tasks/parameters`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({Paramet_Id: inputValue.Paramet_Id})
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            })
            .catch(e => console.error(e))
            .finally(closeDeleteConfirmationDialog)
    }

    const CloseAddDialog = () => {
        setAddDialog(false);
        setInputValue(initialValue)
    }

    const openDeleteConfirmationDialog = (obj) => {
        setInputValue(obj);
        setDeleteDialog(true);
    }

    const closeDeleteConfirmationDialog = () => { 
        setInputValue(initialValue);
        setDeleteDialog(false)
    }

    return (
        <>
            <div className="card mb-3">

                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    <div className="flex-grow-1 mb-0">Task Parameters</div>
                    <button onClick={() => setAddDialog(true)} className="btn btn-primary rounded-5 px-3 py-1 fa-13 shadow">
                        Create Parameter
                    </button>
                </div>

                <div className="card-body">
                    {parameters.map((o, i) => (
                        <Chip 
                            key={i} 
                            label={o?.Paramet_Name + ' - ' + o?.Paramet_Data_Type} 
                            className='m-1' 
                            component={Paper}
                            onDelete={() => openDeleteConfirmationDialog(o)} />
                    ))}
                </div>
            </div>

            <Dialog
                open={addDialog}
                onClose={CloseAddDialog}
                maxWidth='sm' fullWidth>
                <DialogTitle>Create Task Parameters</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    AddParameter()
                }}>
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="border-0 fa-14">Name</td>
                                        <td className="border-0 fa-14">
                                            <input 
                                                className='cus-inpt'
                                                value={inputValue?.Paramet_Name} required
                                                onChange={e => setInputValue({...inputValue, Paramet_Name: e.target.value})} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Data Type</td>
                                        <td className="border-0 fa-14">
                                            <select
                                                className='cus-inpt'
                                                value={inputValue?.Paramet_Data_Type} required
                                                onChange={e => setInputValue({...inputValue, Paramet_Data_Type: e.target.value})} 
                                            >
                                                <option value="" disabled>Select Data Type</option>
                                                <option value='number'>number</option>
                                                <option value='text'>text</option>
                                                <option value='date'>date</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={CloseAddDialog} type='button'>cancel</Button>
                        <Button type='submit'>Create Parameter</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={deleteDialog}
                onClose={closeDeleteConfirmationDialog}
                >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Do you want to delete the 
                    {inputValue?.Paramet_Name && <span className='text-primary px-1'>{inputValue?.Paramet_Name}</span>}
                    Parameter?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteConfirmationDialog} >Cancel</Button>
                    <Button onClick={DeleteParameter}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TaskParametersComp;