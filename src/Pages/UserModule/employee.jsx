import { useEffect, useState } from 'react';
import { ChevronLeft, Add, KeyboardArrowUp, KeyboardArrowDown, Edit, } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Card, CardContent, Collapse, IconButton } from '@mui/material';
import { ISOString, LocalDate } from '../../Components/functions';
import { fetchLink } from '../../Components/fetchComponent';

const DispEmployee = ({ emp, edit, del, setVal }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="card-header fa-16 d-flex align-items-center justify-content-between">
                <span className='fw-bold'>
                    {emp.Emp_Name}
                </span>
                <span>
                    {emp.Designation_Name + ' '}
                    {edit === true && <IconButton size='small' onClick={() => setVal(emp, 'PUT')}><Edit /></IconButton>}
                    {/* {del === true && <IconButton size='small'><Delete sx={{ color: '#FF6865' }} /></IconButton>} */}
                    <IconButton onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </span>
            </div>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <div className="card-body">
                    <div className="row">

                        <div className="col-lg-4 col-md-12 p-2 ">
                            <h3 className="h6">
                                <span className="float-start">Branch</span>
                                <span className="float-end">{emp.BranchName ? emp.BranchName : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Salary</span>
                                <span className="float-end">{emp.Salary ? emp.Salary : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Joining</span>
                                <span className="float-end">{emp.DOJ ? LocalDate(emp.DOJ) : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Education</span>
                                <span className="float-end">{emp.Education ? emp.Education : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Mobile</span>
                                <span className="float-end">{emp.Mobile_No ? emp.Mobile_No : '-'}</span>
                            </h3>
                        </div>

                        <div className="col-lg-4 col-md-12 p-2 ">
                            <h3 className="h6">
                                <span className="float-start">City</span>
                                <span className="float-end">{emp.City ? emp.City : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">PinCode</span>
                                <span className="float-end">{emp.Pincode ? emp.Pincode : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Gender</span>
                                <span className="float-end">{emp.Sex ? emp.Sex : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">DOB</span>
                                <span className="float-end">{emp.DOB ? LocalDate(emp.DOB) : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Religion</span>
                                <span className="float-end">{emp.Emp_Religion ? emp.Emp_Religion : '-'}</span>
                            </h3>
                        </div>

                        <div className="col-lg-4 col-md-12 p-2 ">
                            <h3 className="h6">
                                <span className="float-start">Father's Name</span>
                                <span className="float-end">{emp.Fathers_Name ? emp.Fathers_Name : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Mother's Name</span>
                                <span className="float-end">{emp.Mothers_Name ? emp.Mothers_Name : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Spouse's Name</span>
                                <span className="float-end">{emp.Spouse_Name ? emp.Spouse_Name : '-'}</span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Address 1</span>
                                <span className="float-end" style={{ width: '50%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                                    {emp.Address_1 ? emp.Address_1 : '-'}
                                </span>
                            </h3>
                            <br />
                            <h3 className="h6">
                                <span className="float-start">Address 2</span>
                                <span className="float-end" style={{ width: '50%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                                    {emp.Address_2 ? emp.Address_2 : '-'}
                                </span>
                            </h3>
                            <br/>
                            <h3 className="h6">
                                <span className="float-start">Department Name</span>
                                <span className="float-end">{emp.Department ? emp.Department : '-'}</span>
                            </h3>
                            <br/>
                            
                            <h3 className="h6">
                                <span className="float-start">Location</span>
                                <span className="float-end">{emp.Location ? emp.Location : '-'}</span>
                            </h3>
                        </div>

                    </div>
                </div>
            </Collapse>
        </>
    )
}

const EmployeeMaster = () => {
    const storage = JSON.parse(localStorage.getItem('user'))
    const initialEmpValue = {
        branch: '',
        empname: '',
        designation: '',
        dob: ISOString(),
        doj: ISOString(),
        address1: '',
        address2: '',
        city: '',
        country: "India",
        pincode: '',
        mobile: '',
        education: '',
        father: '',
        mother: '',
        spouse: '',
        gender: '',
        religion: '',
        salary: 0,
        total_loan: 0,
        salary_advance: 0,
        due_loan: 0,
        user_manage_id: '',
        enter_by: parseInt(storage?.UserId),
        fingerPrintEmpId: null,
        Department_ID: '',
        department:'',
        location:''
    }
    const [empFormData, setEmpFormData] = useState(initialEmpValue);
    const [empData, setEmpData] = useState([]);
    const [departments, setDepartments] = useState([])
    const [filteredData, setFilteredData] = useState([]);
    const [branch, setBranch] = useState([]);
    const [designation, setDesignation] = useState([]);
    const inputclass = 'cus-inpt b-0';
    const [dispScreen, setDispScreen] = useState(false);
    const [userCreate, setUserCreate] = useState(false);
    const [search, setSearch] = useState('')
    const [pk, setPK] = useState('')
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {

        fetchLink({
            address: `userModule/employee`,
        }).then((data) => {
            if (data.success) {
                setEmpData(data.data)
            }
        }).catch(e => console.log(e));

    }, [refresh])

    useEffect(() => {

        fetchLink({
            address: `masters/branch/dropDown?User_Id=${storage?.UserId}&Company_id=${storage?.Company_id}`
        }).then((data) => {
            if (data.success) {
                setBranch(data.data)
            }
        }).catch(e => console.log(e));

        fetchLink({
            address: `userModule/employee/designation`,
        }).then((data) => {
            if (data.success) {
                setDesignation(data.data)
            }
        }).catch(e => console.log(e));

        fetchLink({
            address: `userModule/employee/department`
        }).then((data) => {
            if (data.success) {
                setDepartments(data.data)
            }
        }).catch(e => console.log(e));
    }, [])

    useEffect(() => {
        const filteredResults = empData.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(search.toLowerCase())
            );
        });

        setFilteredData(filteredResults);
    }, [search, empData])

    function onlynum(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }

    const setInitialValue = () => {
        setEmpFormData(initialEmpValue)
    }

    const input = [
        {
            label: 'Name',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Name",
            event: (e) => setEmpFormData({ ...empFormData, empname: e.target.value }),
            required: true,
            value: empFormData.empname,
        },
        {
            label: 'Designation',
            elem: 'select',
            class: inputclass,
            options: [{ value: '', label: ' - Select - ', disabled: true, selected: true }, ...designation.map(obj => ({ value: obj.id, label: obj.Designation }))],
            event: (e) => setEmpFormData({ ...empFormData, designation: e.target.value }),
            required: true,
            value: empFormData.designation,
        },
        {
            label: 'Mobile',
            elem: 'input',
            oninput: (e) => onlynum(e),
            class: inputclass,
            placeholder: "Enter Mobile Number",
            event: (e) => setEmpFormData({ ...empFormData, mobile: e.target.value }),
            required: userCreate,
            value: empFormData.mobile,
            max: 10
        },
        {
            label: 'Attendance Id (Finger Print)',
            elem: 'input',
            oninput: (e) => onlynum(e),
            class: inputclass,
            placeholder: "Enter Employee Attendance Master Id",
            event: (e) => setEmpFormData({ ...empFormData, fingerPrintEmpId: e.target.value }),
            value: empFormData.fingerPrintEmpId,
        },
        {
            label: 'Salary Type',
            elem: 'select',
            class: inputclass,
            options: [{ value: '', label: ' - Select - ', disabled: true, selected: true }, ...departments.map(obj => ({ value: obj.DepartmentId, label: obj.DepartmentFName }))],
            event: (e) => setEmpFormData({ ...empFormData, Department_ID: e.target.value }),
            required: true,
            value: empFormData.Department_ID,
        },
        {
            label: 'Education',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Education",
            event: (e) => setEmpFormData({ ...empFormData, education: e.target.value }),
            value: empFormData.education,
        },
        {
            label: 'Date of Birth',
            elem: 'input',
            type: 'date',
            class: inputclass,
            placeholder: "Select Date of Birth",
            event: (e) => setEmpFormData({ ...empFormData, dob: e.target.value }),
            value: empFormData.dob,
        },
        {
            label: 'Date of Joining',
            elem: 'input',
            type: 'date',
            class: inputclass,
            placeholder: "Select Date of Joining",
            event: (e) => setEmpFormData({ ...empFormData, doj: e.target.value }),
            value: empFormData.doj,
        },
        {
            label: 'Gender',
            elem: 'select',
            class: inputclass,
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
            ],
            event: (e) => setEmpFormData({ ...empFormData, gender: e.target.value }),
            required: true,
            value: empFormData.gender,
        },
        {
            label: 'Religion',
            elem: 'select',
            class: inputclass,
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                { value: 'Hindu', label: 'Hindu' },
                { value: 'Muslim', label: 'Muslim' },
                { value: 'Christian', label: 'Christian' },
                { value: 'Other', label: 'Other' }
            ],
            event: (e) => setEmpFormData({ ...empFormData, religion: e.target.value }),
            value: empFormData.religion,
        },
        {
            label: 'Branch',
            elem: 'select',
            class: inputclass,
            options: [{ value: '', label: ' - Select - ', disabled: true, selected: true }, ...branch.map(obj => ({ value: obj.BranchId, label: obj.BranchName }))],
            event: (e) => setEmpFormData({ ...empFormData, branch: parseInt(e.target.value) }),
            required: true,
            value: empFormData.branch,
        },
        {
            label: 'Salary',
            elem: 'input',
            oninput: (e) => onlynum(e),
            class: inputclass,
            placeholder: "Enter Salary",
            event: (e) => setEmpFormData({ ...empFormData, salary: e.target.value }),
            required: true,
            value: empFormData.salary,
        },
        {
            label: 'Father\'s Name',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Father's Name",
            event: (e) => setEmpFormData({ ...empFormData, father: e.target.value }),
            value: empFormData.father,
        },
        {
            label: 'Mother\'s Name',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Mother's Name",
            event: (e) => setEmpFormData({ ...empFormData, mother: e.target.value }),
            value: empFormData.mother,
        },
        {
            label: 'Spouse\'s Name',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Spouse's Name",
            event: (e) => setEmpFormData({ ...empFormData, spouse: e.target.value }),
            value: empFormData.spouse,
        },
        {
            label: 'City',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter City",
            event: (e) => setEmpFormData({ ...empFormData, city: e.target.value }),
            required: true,
            value: empFormData.city,
        },
        {
            label: 'Pincode',
            elem: 'input',
            oninput: (e) => onlynum(e),
            class: inputclass,
            placeholder: "Enter Pincode",
            event: (e) => setEmpFormData({ ...empFormData, pincode: e.target.value }),
            value: empFormData.pincode,
            max: 6
        },
        {
            label: 'Address Line 1',
            elem: 'textarea',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Address Line 1",
            event: (e) => setEmpFormData({ ...empFormData, address1: e.target.value }),
            required: true,
            value: empFormData.address1,
        },
        {
            label: 'Address Line 2',
            elem: 'textarea',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Address Line 2",
            event: (e) => setEmpFormData({ ...empFormData, address2: e.target.value }),
            value: empFormData.address2,
        },
        {
            label: 'Department Name',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Department Name",
            event: (e) => setEmpFormData({ ...empFormData, department: e.target.value }),
            value: empFormData.department,
        },
        {
            label: 'Location',
            elem: 'input',
            type: 'text',
            class: inputclass,
            placeholder: "Enter Location",
            event: (e) => setEmpFormData({ ...empFormData, location: e.target.value }),
            value: empFormData.location,
        },
    ];

    const validateForm = () => {
        for (const field of input) {
            if (field.required && field.value === '') {
                return `${field.label} is required.`;
            }
        }

        return "Success";
    }

    const postEmp = () => {
        const validate = validateForm();
        if (validate === 'Success') {
            fetchLink({
                address: `userModule/employee`,
                method: 'POST',
                bodyData: { data: {...empFormData, createAsUser: userCreate}, userMGT: true }
            }).then(data => {
                if (data.success) {
                    toast.success(data.message)
                    setInitialValue()
                    setPK('')
                    setDispScreen(!dispScreen)
                    setRefresh(!refresh)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.log(e));
        } else {
            toast.error(validate)
        }
    }

    const putEmp = () => {
        const validate = validateForm();
        if (validate === 'Success') {
            fetchLink({
                address: `userModule/employee`,
                method: 'PUT',
                bodyData: { data: {...empFormData, createAsUser: userCreate}, ID: pk }
            }).then(data => {
                if (data.success) {
                    toast.success(data.message)
                    setInitialValue()
                    setPK('')
                    setDispScreen(!dispScreen)
                    setRefresh(!refresh)
                } else {
                    toast.error(data.message)
                }
            })
                .catch(e => console.error(e))
        } else {
            toast.error(validate)
        }
    }

    const setVal = (emp, method) => {
        setPK(emp.Emp_Id);
        if (method === 'PUT') {
            setEmpFormData(pre => ({
                ...pre,
                branch: emp?.Branch,
                empname: emp?.Emp_Name,
                designation: emp?.Designation,
                dob: emp?.DOB ? ISOString(emp?.DOB) : ISOString(),
                doj: emp?.DOJ ? ISOString(emp?.DOJ) : ISOString(),
                address1: emp?.Address_1,
                address2: emp?.Address_2,
                city: emp?.City,
                country: "India",
                pincode: emp?.Pincode,
                mobile: emp?.Mobile_No,
                education: emp?.Education,
                father: emp?.Fathers_Name,
                mother: emp?.Mothers_Name,
                spouse: emp?.Spouse_Name,
                gender: emp?.Sex,
                religion: emp?.Emp_Religion,
                salary: emp?.Salary,
                total_loan: emp?.Total_Loan,
                salary_advance: emp?.Salary_Advance,
                due_loan: emp?.Due_Loan,
                user_manage_id: emp?.User_Mgt_Id,
                enter_by: parseInt(storage?.UserId),
                fingerPrintEmpId: emp?.fingerPrintEmpId,
                Department_ID: emp?.Department_ID,
                department:emp?.Department,
                location:emp?.Location
            }))
            setDispScreen(!dispScreen);
        }
    }

    return (
        <>
            <Card>
                <div className='fa-16 p-2 ps-3 d-flex align-items-center justify-content-between border-bottom fw-bold pb-2 text-primary'>
                    <span className='text-uppercase'>
                        {'Employees ( ' + empData.length + ' )'}
                    </span>
                    <span>
                        <button
                            className="comadbtn mb-0"
                            onClick={() => {
                                setDispScreen(!dispScreen);
                                setPK('');
                                setInitialValue()
                            }}
                        >
                            {dispScreen
                                ? <><ChevronLeft sx={{ fontSize: '1em', padding: '0px', margin: '0px' }} /> Back</>
                                : <><Add sx={{ fontSize: '1em', padding: '0px', margin: '0px' }} /> Add Employee</>}
                        </button>
                    </span>
                </div>
                <CardContent className='p-0'>
                    {dispScreen
                        ?
                        <div className='p-3'>
                            <h2 className='h5 mb-0'>{pk ? 'Update Employee' : 'Create Employee'}</h2>

                            <div className="row">

                                {input.map((field, index) => (
                                    <div key={index} className="col-lg-4 col-md-6 p-2 px-3">
                                        <label className='mb-1 text-dark'>{field.label}{field.required && <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1em' }}> *</span>}</label>
                                        {field.elem === 'input' ? (
                                            <input
                                                type={field.type || 'text'}
                                                className={field.class}
                                                onChange={field.event}
                                                onInput={field.oninput}
                                                disabled={field.disabled}
                                                value={field.value}
                                                maxLength={field.max}

                                            />
                                        ) : field.elem === 'select' ? (
                                            <select
                                                className={field.class}
                                                onChange={field.event}
                                                value={field.value}>
                                                {field.options.map((option, optionIndex) => (
                                                    <option key={optionIndex} value={option.value} disabled={option.disabled} defaultValue={option.selected}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : field.elem === 'textarea' ? (
                                            <textarea
                                                className={field.class}
                                                onChange={field.event}
                                                rows={1} value={field.value}>
                                            </textarea>
                                        ) : null}
                                    </div>
                                ))}

                                {!pk && (
                                    <div className='col-lg-4 col-md-6 d-flex align-items-center'>
                                        <div>
                                            <label className="form-check-label p-1 pe-2" htmlFor="muser">Create as a User</label>
                                            <input
                                                className="form-check-input shadow-none"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                id="muser"
                                                checked={userCreate}
                                                onChange={() => setUserCreate(!userCreate)}
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>

                            <div className='d-flex flex-row-reverse'>
                                <button className='comadbtn' style={{ marginBottom: '0px' }} onClick={pk ? putEmp : postEmp}>Submit</button>
                                <button
                                    className='cancelbtn'
                                    onClick={() => {
                                        setDispScreen(!dispScreen); setPK('');
                                        setInitialValue();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>
                        :
                        <div style={{ maxHeight: '74vh', overflowY: 'scroll' }} className='p-3 pe-2'>

                            <div className='text-end mb-2'>
                                <input
                                    className='cus-inpt w-auto'
                                    type='search'
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            {(filteredData && filteredData.length ? filteredData : search === '' ? empData : []).map(emp => (
                                <div key={emp.Emp_Id} className='col-sm-12 card shadow-none mb-2'>
                                    <DispEmployee emp={emp} edit={true} del={true} setVal={setVal} />
                                </div>
                            ))}
                        </div>
                    }
                </CardContent>
            </Card>
        </>
    )
}

export default EmployeeMaster