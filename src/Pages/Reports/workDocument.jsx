import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../../API";
import { Card, CardHeader, CardContent, Paper } from '@mui/material';
import { MyContext } from "../../Components/context/contextProvider";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { AccessTime, FiberManualRecord, SmsOutlined } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from "../../Components/fetchComponent";

const EmployeeDayAbstract = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [workedDetails, setWorkedDetails] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);

    const { contextObj } = useContext(MyContext);
    const [filter, setFilter] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        Emp_Id: parseData?.UserId,
        Emp_Name: parseData?.Name,
        Task_Id: '',
        Task_Name: 'Select Task',
    });
    const printRef = useRef()

    useEffect(() => {
        fetchLink({
            address: `taskManagement/task/work?Emp_Id=${filter?.Emp_Id}&Start=${filter.startDate}&End=${filter.endDate}&Task_Id=${filter?.Task_Id}`
        }).then(data => {
            if (data.success) {
                const groupedData = data?.data?.reduce((acc, current) => {
                    const workDate = new Date(current?.Work_Dt).toISOString().split('T')[0];
                    if (!acc[workDate]) {
                        acc[workDate] = [];
                    }
                    acc[workDate].push(current);
                    return acc;
                }, {});
                setWorkedDetails(groupedData)
            }
        }).catch(e => console.error(e))            
    }, [parseData?.UserId, filter])

    useEffect(() => {
        fetchLink({
            address: `taskManagement/task/assignEmployee/task/dropDown`
        }).then(data => {
            if (data.success) {
                setTasks(data.data)
            }
        }).catch(e => console.error(e))            
    }, [])

    useEffect(() => {
        if (Number(contextObj?.Print_Rights) === 1) {
            fetchLink({
                address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
            }).then(data => {
                if (data.success) {
                    setUsers(data.data)
                }
            }).catch(e => console.error(e))                
        }
    }, [contextObj?.Print_Rights, parseData?.Company_id])

    const formatTime24 = (time24) => {
        const [hours, minutes] = time24.split(':').map(Number);

        let hours12 = hours % 12;
        hours12 = hours12 || 12;
        const period = hours < 12 ? 'AM' : 'PM';
        const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const time12 = `${formattedHours}:${formattedMinutes} ${period}`;

        return time12;
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const getColor = (status) => {
        const numStatus = Number(status);
        const color = ['', 'bg-primary', 'bg-warning', 'bg-success', 'bg-danger']

        return color[numStatus]
    }

    const CardAndTableComp = () => {
        return (
            <div className="px-2">
                {Object.keys(workedDetails).map(workDate => (
                    <div key={workDate} className="cus-card pb-0">
                        <h6 className="p-3 mb-0 bg-light">
                            Date:
                            {new Date(workDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            {" ( " + workedDetails[workDate]?.length + " Tasks )"}
                        </h6>

                        <hr className="m-0" />

                        <div className="table-responsive day-abstract-table">
                            <table className="table">
                                <tbody>
                                    {workedDetails[workDate].map((taskDetail, oi) => (
                                        <tr key={oi}>

                                            <td style={{ verticalAlign: 'middle' }}><FiberManualRecord className='fa-in text-primary' /> {taskDetail.Task_Name}</td>
                                            <td style={{ verticalAlign: 'middle' }}><AccessTime className="fa-15" /> {taskDetail.Tot_Minutes} Minutes</td>
                                            <td className="fa-14 " style={{ verticalAlign: 'middle' }}>
                                                {formatTime24(taskDetail.Start_Time) + " - " + formatTime24(taskDetail.End_Time)}
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <span className={`badge fa-10 ms-2 p-1 ${getColor(taskDetail?.Work_Status)}`}>
                                                    {taskDetail?.WorkStatus}
                                                </span>
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <p className="mb-0 fa-14 text-muted">
                                                    <SmsOutlined className="fa-in" />
                                                    <span>&emsp;{taskDetail.Work_Done}</span>
                                                </p>
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {taskDetail?.Work_Param?.length > 0 && (
                                                    <div className="cus-card p-2 m-0">
                                                        {taskDetail?.Work_Param?.map((o, i) => (
                                                            <p className="mb-0 fa-14 d-flex" key={i}>
                                                                <span className="flex-grow-1">{o?.Paramet_Name}:</span>
                                                                <span className="text-primary">
                                                                    {
                                                                        (isNaN(o?.Current_Value) || (o?.Paramet_Data_Type) !== 'number')
                                                                            ? o?.Current_Value
                                                                            : Number(o?.Current_Value).toLocaleString('en-IN')
                                                                    }
                                                                </span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="row mb-2 px-3 day-abstract-card d-none">

                            {workedDetails[workDate].map(taskDetail => (

                                <div key={taskDetail.Work_Id} className="col-xl-3 col-lg-4 col-md-6 p-2 py-0">
                                    <div className="cus-card shadow-sm p-3">

                                        <p className="mb-2 fa-15 fw-bold text-secondary">
                                            {taskDetail.Task_Name + " "}
                                        </p>

                                        <p className="mb-2 fa-14 text-secondary">
                                            {formatTime24(taskDetail.Start_Time) + " - " + formatTime24(taskDetail.End_Time)}
                                            <span className={`badge fa-10 ms-2 p-1 ${getColor(taskDetail?.Work_Status)}`}>
                                                {taskDetail?.WorkStatus}
                                            </span>
                                        </p>

                                        <p className="mb-2 fa-14 text-secondary">
                                            <AccessTime className="fa-15" /> {taskDetail.Tot_Minutes} Minutes
                                        </p>

                                        <p className="mb-0 fa-14 text-muted">
                                            <span className="fw-bold">Summary : </span><br />
                                            <span>&emsp;{taskDetail.Work_Done}</span>
                                        </p>

                                        {taskDetail?.Parameter_Details?.length > 0 && (
                                            <p className="mb-1 text-secondary fa-14 fw-bold">Parameters ( {taskDetail?.Parameter_Details?.length} )</p>
                                        )}

                                        {taskDetail?.Parameter_Details?.length > 0 && <hr className="m-0" />}

                                        {taskDetail?.Parameter_Details?.map((o, i) => (
                                            <p className="mb-0 fa-14 d-flex" key={i}>
                                                <span className="flex-grow-1">{o?.Paramet_Name}:</span>
                                                <span> {o?.Current_Value}</span>
                                            </p>
                                        ))}

                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            <Card component={Paper} variant='elevation'>
                <CardHeader title='Work Abstract' className="pb-0" />

                <CardContent className="pt-2" style={{ minHeight: '500px' }}>

                    <div className="row">

                        <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 p-2">
                            <label className="pb-2">From: </label>
                            <input
                                type="date"
                                className="cus-inpt"
                                value={filter.startDate}
                                onChange={e => setFilter({ ...filter, startDate: e.target.value })}
                            />
                        </div>

                        <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 p-2">
                            <label className="pb-2">To: </label>
                            <input
                                type="date"
                                className="cus-inpt"
                                value={filter.endDate}
                                onChange={e => setFilter({ ...filter, endDate: e.target.value })}
                            />
                        </div>

                        <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 p-2">
                            <label className="pb-2">User </label>
                            <Select
                                value={{ value: filter?.Emp_Id, label: filter?.Emp_Name }}
                                onChange={(e) => setFilter({ ...filter, Emp_Id: e.value, Emp_Name: e.label })}
                                options={[
                                    { value: parseData?.UserId, label: parseData?.Name },
                                    ...users.map(obj => ({ value: obj.UserId, label: obj.Name }))
                                ]}
                                styles={customSelectStyles}
                                isDisabled={Number(contextObj?.Print_Rights) === 0}
                                isSearchable={true}
                                placeholder={"User Name"} />
                        </div>

                        <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 p-2">
                            <label className="pb-2">Task </label>
                            <Select
                                value={{ value: filter?.Task_Id, label: filter?.Task_Name }}
                                onChange={(e) => setFilter({ ...filter, Task_Id: e.value, Task_Name: e.label })}
                                options={[
                                    { value: '', label: 'All Task' },
                                    ...tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Task Name"} />
                        </div>

                        <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-6 d-flex align-items-end p-2">
                            <button className="btn btn-primary rounded-5 px-3" onClick={handlePrint}>Print PDF</button>
                        </div>

                    </div>

                    <CardAndTableComp />

                    <div className="d-none px-3">
                        <div className="px-3" ref={printRef}>
                            <h5>Work Abstract Of {filter.Emp_Name} </h5>
                            <p className="mb-0">
                                From {new Date(filter.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                &nbsp; - To: {new Date(filter.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </p>
                            <CardAndTableComp />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default EmployeeDayAbstract;
