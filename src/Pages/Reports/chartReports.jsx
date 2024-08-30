import React, { useEffect, useState } from "react";
import api from "../../API";
import "react-toastify/dist/ReactToastify.css";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import PieChartComp from "../Dashboard/chartComp";
import LineChartComp from "./barChartComp";
import { Card, CardContent } from '@mui/material'

const ChartsReport = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [empData, setEmpData] = useState([]);
    const [taskData, setTaskData] = useState([]);
    const [usersDropDown, setUsersDropdown] = useState([]);
    const [filteredUser, setFilteredUser] = useState([]);
    const [taskDropDown, setTaskDropDown] = useState([]);

    const initialValueFilter = {
        Emp_Id: parseData?.UserId,
        date: new Date().toISOString().split('T')[0],
        EmpGet: parseData?.Name,
    }

    const initialValueBarChart = {
        Emp_Id: parseData?.UserId,
        From: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        To: new Date().toISOString().split('T')[0],
        EmpGet: parseData?.Name,
        Task_Id: '',
        TaskGet: ''
    }

    const [filters, setFileters] = useState(initialValueFilter);
    const [barChartFilter, setBarChartFilter] = useState(initialValueBarChart)


    useEffect(() => {
        fetch(`${api}myTodayWorks?Emp_Id=${filters.Emp_Id}&reqDate=${filters.date}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEmpData(data.data)
                }
            }).catch(e => console.error(e))
    }, [filters?.Emp_Id, filters?.date])

    useEffect(() => {
        fetch(`${api}taskAssignedUsersDropdown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsersDropdown(data.data)
                }
            }).catch(e => console.error(e))
        fetch(`${api}assignedTasksDropdown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskDropDown(data.data)
                }
                if (data?.data?.length > 0) {
                    setBarChartFilter(pre => ({ ...pre, Task_Id: data.data[0].Task_Id, TaskGet: data.data[0].Task_Name }))
                }
            }).catch(e => console.error(e))
    }, [parseData?.BranchId])

    useEffect(() => {
        fetch(`${api}taskActivityReportBarChart?Emp_Id=${barChartFilter?.Emp_Id}&From=${barChartFilter?.From}&To=${barChartFilter?.To}&Task_Id=${barChartFilter?.Task_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTaskData(data.data)
                }
            }).catch(e => console.error(e))
    }, [barChartFilter.Emp_Id, barChartFilter.From, barChartFilter.To, barChartFilter.Task_Id]);

    useEffect(() => {
        setFilteredUser([])
        fetch(`${api}userFilter/taskBased?Task_Id=${barChartFilter.Task_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFilteredUser(data.data)
                }
            }).catch(e => console.error(e))
    }, [barChartFilter?.Task_Id])


    return (
        <>
            <Card>
                <CardContent style={{ minHeight: 500 }}>
                    <h5>User Work Report</h5>
                    <div className="row">
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <Select
                                value={{ value: filters?.Emp_Id, label: filters?.EmpGet }}
                                onChange={(e) => setFileters({ ...filters, Emp_Id: e.value, EmpGet: e.label })}
                                options={[{ value: '', label: 'All Employee' }, ...usersDropDown.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Employee Name"} />
                        </div>
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <input
                                type="date"
                                value={filters.date}
                                onChange={e => setFileters({ ...filters, date: e.target.value })}
                                className="cus-inpt bg-test" style={{ backgroundColor: 'rgba(255, 255, 255, 0.322)' }} />
                        </div>
                    </div>


                    {/* <PieChartEmpData TasksArray={empData} /> */}
                    {/* <MuiPieChart TasksArray={empData} /> */}
                    <PieChartComp TasksArray={empData} />
                    {/* <ReChartPieChart data={empData} /> */}
                </CardContent>
            </Card>

            <Card className="mt-3">
                <CardContent style={{ minHeight: 500 }}>
                    <h5>Task Activity Report</h5>
                    <div className="row">

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <Select
                                value={{ value: barChartFilter?.Task_Id, label: barChartFilter?.TaskGet }}
                                onChange={(e) => setBarChartFilter({ ...barChartFilter, Task_Id: e.value, TaskGet: e.label })}
                                options={[...taskDropDown.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Task Name"} 
                            />
                        </div>

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <Select
                                value={{ value: barChartFilter?.Emp_Id, label: barChartFilter?.EmpGet }}
                                onChange={e => setBarChartFilter({ ...barChartFilter, Emp_Id: e.value, EmpGet: e.label })}
                                options={[{ value: '', label: 'All Employee' }, ...filteredUser.map(obj => ({ value: obj?.Emp_Id, label: obj?.Name }))]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Employee Name"} 
                            />
                        </div>

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <input
                                type="date"
                                value={barChartFilter.From}
                                onChange={e => setBarChartFilter({ ...barChartFilter, From: e.target.value })}
                                className="cus-inpt bg-test" style={{ backgroundColor: 'rgba(255, 255, 255, 0.322)' }}
                            />
                        </div>

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <input
                                type="date"
                                value={barChartFilter.To}
                                onChange={e => setBarChartFilter({ ...barChartFilter, To: e.target.value })}
                                className="cus-inpt bg-test" style={{ backgroundColor: 'rgba(255, 255, 255, 0.322)' }}
                            />
                        </div>

                    </div>

                    <LineChartComp taskActivity={taskData} startDate={barChartFilter.From} endDate={barChartFilter.To} />
                </CardContent>
            </Card>
        </>
    );
}

export default ChartsReport;
