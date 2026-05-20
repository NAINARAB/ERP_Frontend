import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { toast } from "react-toastify";
import { fetchLink } from '../../Components/fetchComponent';

const AddEditParameter = ({ open, onClose, onReload }) => {
    const [inputValue, setInputValue] = useState({
        Paramet_Name: '',
        Paramet_Data_Type: '',
    });

    const handleAddParameter = async () => {
        try {
            const data = await fetchLink({
                address: `taskManagement/parameters`,
                method: 'POST',
                bodyData: inputValue
            });
            if (data.success) {
                toast.success(data.message);
                onReload();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to add parameter");
        } finally {
            onClose();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAddParameter();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle  className="bg-primary text-white mb-2 px-3 py-2">Create Task Parameter</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="border-0 fa-14">Name</td>
                                    <td className="border-0 fa-14">
                                        <input
                                            className='cus-inpt'
                                            value={inputValue.Paramet_Name}
                                            required
                                            onChange={e => setInputValue({ ...inputValue, Paramet_Name: e.target.value })} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0 fa-14">Data Type</td>
                                    <td className="border-0 fa-14">
                                        <select
                                            className='cus-inpt'
                                            value={inputValue.Paramet_Data_Type}
                                            required
                                            onChange={e => setInputValue({ ...inputValue, Paramet_Data_Type: e.target.value })}>
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
                        <button
                            className="btn btn-light rounded-5 px-3"
                            type="button"
                            onClick={onClose}>
                            CANCEL
                        </button>
                        <button
                            className="btn btn-primary rounded-5 px-3"
                            type='submit'>
                        CREATE PARAMETER
                        </button>
                    </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEditParameter;
