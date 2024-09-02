import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchLink } from '../../Components/fetchComponent'

function onlynum(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
}

const CustomerAddScreen = ({ screen, setScreen, underArray, row, refresh }) => {
    const storage = JSON.parse(localStorage.getItem("user"))
    const initialValue = {
        Branch_Id: 0,
        Company_Id: 0,
        Cust_Id: '',
        Cust_No: '',
        Customer_name: '',
        Contact_Person: '',
        Mobile_no: '',
        Email_Id: '',
        Address1: '',
        Address2: '',
        Address3: '',
        Address4: '',
        Pincode: '',
        State: '',
        Country: 'India',
        Gstin: '',
        Under_Id: '',
        User_Mgt_Id: '',
        User_Type_Id: '',
        Entry_By: storage?.UserId,
    }
    const [value, setValue] = useState(initialValue);
    const [branchData, setBranchData] = useState([]);
    // console.log(row)

    useEffect(() => {

        fetchLink({
            address: `masters/branch/dropDown?User_Id=${storage?.UserId}&Company_id=${storage?.Company_id}`
        }).then((data) => {
            if (data.success) {
                setBranchData(data.data);
            }
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        const {
            Branch_Id, Company_Id, Cust_Id, Cust_No, Customer_name, Contact_Person,
            Mobile_no, Email_Id, Address1, Address2, Address3, Address4, Pincode,
            State, Country, Gstin, Under_Id, User_Mgt_Id, User_Type_Id
        } = row;
        setValue(pre => ({
            ...pre,
            Branch_Id, Company_Id, Cust_Id, Cust_No, Customer_name, Contact_Person, 
            Mobile_no, Email_Id, Address1, Address2, Address3, Address4, Pincode, 
            State, Country, Gstin, Under_Id, User_Mgt_Id, User_Type_Id
        }))
    }, [row])

    const clearValue = () => {
        setValue(initialValue)
    }

    const filteredOptions = underArray
        .filter(obj => ((parseInt(obj.User_Type_Id) === 5) && (obj.Id != value?.Cust_Id)))
        .map(obj => ({ value: obj.Cust_Id, label: obj.Customer_name }));

    const input = [
        {
            label: 'Name',
            elem: 'input',
            placeholder: "Mr / Ms",
            event: (e) => setValue({ ...value, Customer_name: e.target.value }),
            required: true,
            value: value.Customer_name,
        },
        {
            label: 'Mobile',
            elem: 'input',
            oninput: (e) => onlynum(e),
            placeholder: "Enter Mobile Number",
            event: (e) => setValue({ ...value, Mobile_no: e.target.value }),
            required: true,
            value: value.Mobile_no,
            max: 10
        },
        {
            label: 'Branch',
            elem: 'select',
            options: [
                { value: 0, label: ' - Select - ', disabled: true, selected: true },
                ...branchData.map(obj => ({
                    value: Number(obj.BranchId),
                    label: obj.BranchName
                }))
            ],
            class: 'selectpicker',
            data: true,
            event: (e) => setValue({ ...value, Branch_Id: parseInt(e.target.value) }),
            required: true,
            value: value.Branch_Id,
        },
        {
            label: 'User Type',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                { value: 4, label: 'CUSTOMER' },
                { value: 5, label: 'BROKER' },
            ],
            event: (e) => setValue({ ...value, User_Type_Id: parseInt(e.target.value) }),
            required: true,
            value: value.User_Type_Id,
        },
        {
            label: 'Contact Person',
            elem: 'input',
            placeholder: "",
            event: (e) => setValue({ ...value, Contact_Person: e.target.value }),
            required: true,
            value: value.Contact_Person,
        },
        {
            label: 'Email ID',
            elem: 'input',
            type: 'email',
            placeholder: "emailaddress@mail.com",
            event: (e) => setValue({ ...value, Email_Id: e.target.value }),
            required: false,
            value: value.Email_Id,
        },
        {
            label: 'Gstin',
            elem: 'input',
            placeholder: "",
            // oninput: (e) => onlynum(e),
            event: (e) => setValue({ ...value, Gstin: e.target.value }),
            required: false,
            value: value.Gstin,
            max: 15,
        },
        {
            label: 'Under',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                { value: 0, label: ' Primary ' },
                ...filteredOptions
            ],
            class: 'selectpicker',
            data: true,
            event: (e) => setValue({ ...value, Under_Id: parseInt(e.target.value) }),
            required: true,
            value: value.Under_Id,
        },
        {
            label: 'Pincode',
            elem: 'input',
            placeholder: "654321",
            oninput: (e) => onlynum(e),
            event: (e) => setValue({ ...value, Pincode: e.target.value }),
            required: false,
            value: value.Pincode,
            max: 6
        },
        {
            label: 'State',
            elem: 'input',
            placeholder: "",
            event: (e) => setValue({ ...value, State: e.target.value }),
            required: false,
            value: value.State,
        },
        {
            label: 'Address Line 1',
            elem: 'textarea',
            event: (e) => setValue({ ...value, Address1: e.target.value }),
            required: true,
            value: value.Address1,
        },
        {
            label: 'Address Line 2',
            elem: 'textarea',
            event: (e) => setValue({ ...value, Address2: e.target.value }),
            value: value.Address2,
        },
        {
            label: 'Address Line 3',
            elem: 'textarea',
            event: (e) => setValue({ ...value, Address3: e.target.value }),
            value: value.Address3,
        },
        {
            label: 'Address Line 4',
            elem: 'textarea',
            event: (e) => setValue({ ...value, Address4: e.target.value }),
            value: value.Address4,
        },
    ];

    const validateForm = () => {
        for (const field of input) {
            if (field.required && field.value === '') {
                return `${field.label} is required.`;
            }
        }

        const validemail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = validemail.test(value.Email_Id);
        if ((!isEmailValid) && value.Email_Id !== '') {
            return 'Invalid email address'
        }

        const validPhoneNumber = /^\d{10}$/;
        const isPhoneNumberValid = validPhoneNumber.test(value.Mobile_no);

        if (!isPhoneNumberValid) {
            return 'Invalid phone number'
        }

        const validGstin = /^\d{15}$/;
        const isGstinValid = validGstin.test(value.Gstin);
        if ((!isGstinValid) && value.Gstin !== '') {
            return 'Invalid gstin'
        }

        const validPIN = /^\d{6}$/;
        const isPinValid = validPIN.test(value.Pincode);
        if ((!isPinValid) && value.Pincode !== '') {
            return 'Invalid Pincode'
        }

        return "Success";
    };

    const CreateCustomer = () => {
        const validate = validateForm();
        if (validate === 'Success') {
            fetchLink({
                address: `userModule/customer`,
                method: 'POST',
                bodyData: { ...value }
            }).then(data => {
                if (data.success) {
                    clearValue()
                    toast.success(data.message)
                    refresh()
                    setScreen(!screen)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))

        } else {
            toast.error(validate)
        }
    }

    const UpdateCustomer = () => {
        const validate = validateForm();
        if (validate === 'Success') {
            fetchLink({
                address: `userModule/customer`,
                method: 'PUT',
                bodyData: { ...value }
            }).then(data => {
                if (data.success) {
                    clearValue();
                    toast.success(data.message)
                    refresh()
                    setScreen(!screen)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
        } else {
            toast.error(validate)
        }
    }

    return (
        <>
            <div className="card">
                <div className='card-header py-2 d-flex align-items-center justify-content-between'>
                    <h5 className="mb-0 ">Customer Details</h5>
                    <button className="comadbtn mb-0" onClick={() => { setScreen(!screen); clearValue(); }}>Back</button>
                </div>
                <div className="card-body row">
                    {input.map((field, index) => (
                        <div key={index} className="col-lg-4 col-md-6 p-2 px-3">
                            <label>{field.label}{field.required && <p style={{ color: 'red', display: 'inline', fontWeight: 'bold', fontSize: '1em' }}> *</p>}</label>
                            {field.elem === 'input' ? (
                                <input
                                    type={field.type || 'text'}
                                    className='cus-inpt b-0'
                                    onChange={field.event}
                                    onInput={field.oninput}
                                    disabled={field.disabled}
                                    value={field.value} 
                                    maxLength={field.max}
                                />
                            ) : field.elem === 'select' ? (
                                <select
                                    className={'cus-inpt b-0'}
                                    onChange={field.event}
                                    value={field.value}>
                                    {field.options.map((option, optionIndex) => (
                                        <option
                                            key={optionIndex}
                                            value={option.value}
                                            disabled={option.disabled}
                                            defaultValue={option.selected} >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.elem === 'textarea' ? (
                                <textarea
                                    className='cus-inpt b-0'
                                    onChange={field.event}
                                    rows={4} value={field.value}>
                                </textarea>
                            ) : null}
                        </div>
                    ))}
                </div>
                <div className="card-footer text-end">
                    <button className="cancelbtn" onClick={() => setScreen(!screen)}>Cancel</button>
                    <button
                        className="comadbtn mb-0"
                        onClick={row.Cust_Id ? UpdateCustomer : CreateCustomer}>
                        {row.Cust_Id ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </>
    )
}

export default CustomerAddScreen;