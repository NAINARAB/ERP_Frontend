
import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RequiredStar from '../../Components/requiredStar';
import { ISOString } from '../../Components/functions';

const ProjectForm = ({ open, onClose, inputValue, isEdit, setReload }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);

    const [projectHead, setProjectHead] = useState([]);
    const [proStatus, setProStatus] = useState([]);


    const [formData, setFormData] = useState({
        Project_Id: '',
        Project_Name: '',
        Project_Desc: '',
        Project_Head: '',
        Est_Start_Dt: ISOString(),
        Est_End_Dt: ISOString(),
        Project_Status: '',
        Entry_By: parseData?.UserId,
        Company_id: parseData?.Company_id
    });

    useEffect(() => {

        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
        }).then(data => {
            setProjectHead(data.success ? data.data : []);
            
        }).catch(e => console.error('Fetch Error:', e));
    }, [parseData?.Company_id]);

    useEffect(() => {

        fetchLink({
            address: `taskManagement/statusList`
        }).then(data => {
            if (data.success) {
                setProStatus(data.data);
            }
        }).catch(e => console.error('Fetch Error:', e));
    }, []);

    useEffect(() => {
        if (open) {
    
            if (isEdit && inputValue) {
                setFormData({
                    ...inputValue,
                    Project_Head: inputValue?.Project_Head_Id, 
                    Est_Start_Dt: inputValue.Est_Start_Dt ? ISOString(inputValue.Est_Start_Dt) : '',
                    Est_End_Dt: inputValue.Est_End_Dt ? ISOString(inputValue.Est_End_Dt) : '',
                    Project_Status: inputValue?.Project_Status || '', 
                    Project_Desc: inputValue?.Project_Desc || '-'
                });
            } else if (!isEdit) {
           
                setFormData({
                    Project_Name: '',
                    Project_Desc: '',
                    Project_Head: '', 
                    Est_Start_Dt: ISOString(),
                    Est_End_Dt: ISOString(),
                    Project_Status: '',
                    Entry_By: parseData?.UserId,
                    Company_id: parseData?.Company_id
                });
            }
        }
    }, [inputValue, open, isEdit]);
    
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateFields = () => {
        const requiredFields = [
            'Project_Name',
            'Project_Head',
            'Est_Start_Dt',
            'Est_End_Dt',
            'Project_Status',
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                toast.error(`${field.replace(/_/g, ' ')} is required`);
                return false;
            }
        }

        return true;
    };

    const createFun = () => {
        if (!validateFields()) return;

        const payload = {
            ...formData,
            Company_id: parseData.Company_id
        };

        fetchLink({
            address: `taskManagement/project`,
            method: 'POST',
            bodyData: payload,
        }).then(data => {
            if (data.success) {
                onClose();
                setReload(prev => !prev);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        }).catch(e => {
            console.error('Fetch Error:', e);
            toast.error("An error occurred while creating the project.");
        });
    };

    const editFun = () => {
        if (!validateFields()) return;

        fetchLink({
            address: `taskManagement/project`,
            method: 'PUT',
            bodyData: formData,
        }).then(data => {
            if (data.success) {
                onClose();
                setReload(prev => !prev);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error('Fetch Error:', e));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        isEdit ? editFun() : createFun();
    };

    const inputFields = [
        {
            label: 'Project Name',
            elem: 'input',
            type: 'text',
            required: true,
            name: 'Project_Name',
            value: formData.Project_Name || '',
        },
        {
            label: "Project Head",
            elem: "select",
            options: projectHead.map(obj => ({ value: obj?.UserId, label: obj?.Name })),
            required: true,
            name: 'Project_Head',
            value: formData.Project_Head || '',
        },
        {
            label: 'Estimated Start Date',
            elem: 'input',
            type: 'date',
            required: true,
            name: 'Est_Start_Dt',
            value: formData.Est_Start_Dt || '',
        },
        {
            label: 'Estimated End Date',
            elem: 'input',
            type: 'date',
            required: true,
            name: 'Est_End_Dt',
            value: formData.Est_End_Dt || '',
        },
        {
            label: 'Project Status',
            elem: 'select',
            options: proStatus.map(obj => ({ value: obj.Status_Id, label: obj.Status })),
            required: true,
            name: 'Project_Status',
            value: formData.Project_Status || '',
        },
        {
            label: 'Description',
            elem: 'textarea',
            name: 'Project_Desc',
            value: formData.Project_Desc || ' ',
        },
    ];

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle className="bg-primary text-white mb-2 px-3 py-2">
                    {isEdit ? "Edit Project" : 'Create Project'}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {inputFields.map((field, index) => (
                                <div key={index} className="col-lg-4 mb-3">
                                    <label>{field.label} {field.required && <RequiredStar />}</label>
                                    {field.elem === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            className='cus-inpt'
                                            value={field.value}
                                            onChange={handleChange}
                                        />
                                    ) : field.elem === 'select' ? (
                                        <select
                                            name={field.name}
                                            className='cus-inpt'
                                            value={field.value}
                                            onChange={handleChange}
                                        >
                                            <option value=''>Select</option>
                                            {field.options && field.options.map((option, idx) => (
                                                <option key={idx} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            className='cus-inpt'
                                            value={field.value}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <DialogActions>
                            <button
                                className="btn btn-light rounded-5 px-3"
                                type="button"
                                onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary rounded-5 px-3"
                                type='submit'>
                                {isEdit ? "Update" : "Submit"}
                            </button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProjectForm;
