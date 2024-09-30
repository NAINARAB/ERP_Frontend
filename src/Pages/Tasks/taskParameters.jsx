import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Collapse } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { fetchLink } from '../../Components/fetchComponent';

const TaskParametersComp = ({ isOpened, disableCollapse }) => {
    const initialValue = {
        Paramet_Id: '',
        Paramet_Name: '',
        Paramet_Data_Type: '',
    }
    const [parameters, setParameters] = useState([])
    const [addDialog, setAddDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [inputValue, setInputValue] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(isOpened ? true : false);

    const [filterInput, setFilterInput] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `taskManagement/parameters`
        }).then(data => {
            if (data.success) {
                setParameters(data.data)
            }
        })
            .catch(e => console.error(e))

    }, [reload])

    const AddParameter = () => {
        fetchLink({
            address: `taskManagement/parameters`,
            method: 'POST',
            bodyData: inputValue
        }).then(data => {
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
        fetchLink({
            address: `taskManagement/parameters`,
            method: 'DELETE',
            bodyData: { Paramet_Id: inputValue.Paramet_Id }
        }).then(data => {
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

    // const openDeleteConfirmationDialog = (obj) => {
    //     setInputValue(obj);
    //     setDeleteDialog(true);
    // }

    const closeDeleteConfirmationDialog = () => {
        setInputValue(initialValue);
        setDeleteDialog(false)
    }

    function handleSearchChange(event) {
        const term = event.target.value;
        setFilterInput(term);
        const filteredResults = parameters.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(term.toLowerCase())
            );
        });
        setFilteredData(filteredResults);
    }

    return (
        <>
            <div className="card mb-3">

                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    <div className="flex-grow-1 mb-0">
                        {!disableCollapse && (
                            <IconButton size='small' onClick={() => setOpen(!open)}>
                                {open ? <ExpandLess style={{ fontSize: '18px', color: 'black' }} /> : <ExpandMore style={{ fontSize: '18px', color: 'black' }} />}
                            </IconButton>
                        )}
                        Task Parameters
                    </div>
                    <button onClick={() => setAddDialog(true)} className="btn btn-primary rounded-5 px-3 py-1 fa-13 shadow">
                        Create Parameter
                    </button>
                </div>

                <Collapse in={open} unmountOnExit>

                    <div className="card-body" style={{ maxHeight: '40vh', overflowY: 'scroll' }}>

                        <div className="row flex-row-reverse">
                            <div className="col-md-4 pb-2">
                                <input
                                    type="search"
                                    value={filterInput}
                                    className="cus-inpt"
                                    placeholder="Search"
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className='border fa-14'>Sno</th>
                                        <th className='border fa-14'>Parameter</th>
                                        <th className='border fa-14'>Data Type</th>
                                        {/* <th className='border fa-14'>Action</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(filteredData.length > 0 ? filteredData : filterInput === '' ? parameters : [])?.map((o, i) => (
                                        <tr key={i}>
                                            <td className='border fa-14'>{i + 1}</td>
                                            <td className='border fa-14'>{o?.Paramet_Name}</td>
                                            <td className='border fa-14'>{o?.Paramet_Data_Type}</td>
                                            {/* <td className='border fa-14'>
                                                <IconButton onClick={() => openDeleteConfirmationDialog(o)}>
                                                    <Delete sx={{color: 'red', fontSize: '16px'}} />
                                                </IconButton>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </Collapse>
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
                                                onChange={e => setInputValue({ ...inputValue, Paramet_Name: e.target.value })} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-0 fa-14">Data Type</td>
                                        <td className="border-0 fa-14">
                                            <select
                                                className='cus-inpt'
                                                value={inputValue?.Paramet_Data_Type} required
                                                onChange={e => setInputValue({ ...inputValue, Paramet_Data_Type: e.target.value })}
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