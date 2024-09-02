import { useEffect, useState } from "react"
import { CiCalendarDate } from "react-icons/ci";
import { CgSandClock } from "react-icons/cg";
import { HiUsers } from "react-icons/hi2";
import { RxLapTimer } from "react-icons/rx";
import { TbTargetArrow } from "react-icons/tb";
import { BiTask } from "react-icons/bi";
import PieChartComp from "./chartComp";
import { Card, CardHeader, CardContent, Paper, FormControlLabel, Switch } from '@mui/material'
import SOAComp from "./erp/SOA";
import AttendanceComp from "../Attendance/attendanceComp";
import ManagementDashboard from "./managementDashboard";
import { fetchLink } from '../../Components/fetchComponent'
import { ISOString } from "../../Components/functions";



const CommonDashboard = () => {
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [dashboardData, setDashboardData] = useState({});
    const [workedDetais, setWorkedDetais] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [tallyDetails, setTallyDetails] = useState([]);
    const isAdmin = Number(parseData?.UserTypeId) === 0 || Number(parseData?.UserTypeId) === 1
    const isMangement = Number(parseData?.UserTypeId) === 2
    const isEmp = Number(parseData?.UserTypeId) === 6 || Number(parseData?.UserTypeId) === 3;
    const isCustomer = Number(parseData?.UserTypeId) === 4 || Number(parseData?.UserTypeId) === 5;
    const [dispTask, setDispTask] = useState(false)

    useEffect(() => {
        if (isAdmin || isEmp || isMangement) {
            fetchLink({
                address: `dashboard/dashboardData?UserType=${parseData?.UserTypeId}&Emp_Id=${parseData?.UserId}`
            })
            .then(data => {
                if (data.success) {
                    setDashboardData(data.data[0]);
                } else {
                    setDashboardData({});
                }
            })
            .catch(e => {
                console.error(e);
            });
        }
    }, [parseData?.UserId, parseData?.UserTypeId, isAdmin, isMangement, isEmp]);

    useEffect(() => {
        if (isEmp) {
            fetchLink({
                address:`dashboard/getTallyData?UserId=${parseData?.UserId}`
            }).then(data => {
                if (data.success) {
                    setTallyDetails(data.data);
                } else {
                    setTallyDetails([])
                }
            }).catch(e => console.error(e))
        }
    }, [isEmp])

    useEffect(() => {
        if (isEmp) {
            fetchLink({
                address:`taskManagement/task/work?Emp_Id=${parseData?.UserId}&from=${ISOString()}&to=${ISOString()}`
            }).then(data => {
                if (data.success) {
                    setWorkedDetais(data.data);
                } else {
                    setTallyDetails([])
                }
            }).catch(e => console.error(e))

            fetchLink({
                address:`taskManagement/tasks/myTasks?Emp_Id=${parseData?.UserId}&reqDate=${ISOString()}`
            }).then(data => {
                if (data.success) {
                    data.data.sort((a, b) => {
                        const [aHours, aMinutes] = a?.Sch_Time.split(':').map(Number);
                        const [bHours, bMinutes] = b?.Sch_Time.split(':').map(Number);
                        if (aHours !== bHours) {
                            return aHours - bHours;
                        }
                        return aMinutes - bMinutes;
                    });
                    setMyTasks(data.data);
                } else {
                    setMyTasks([])
                }
            }).catch(e => console.error(e))
        }
    }, [isEmp, parseData?.UserId])

    const CardComp = ({ title, icon, firstVal, secondVal, classCount }) => {
        return (
            <>
                <div className={`${(isAdmin || isMangement) && 'col-xxl-3'} col-lg-4 col-md-6 col-sm-12 p-2`}>
                    <div className={"coloredDiv d-flex align-items-center text-light cus-shadow coloredDiv" + classCount}>
                        <div className="flex-grow-1 p-3">
                            <h5 className="text-uppercase">{title}</h5>
                            <h3 className="fa-16 text-end pe-3">
                                <span style={{ fontSize: '30px' }}>{firstVal ? firstVal : 0} </span>
                                {secondVal && '/' + secondVal}
                            </h3>
                        </div>
                        {icon}
                    </div>
                </div>
            </>
        )
    }

    const minFormat = (val) => {
        const hour = Math.floor(Number(val) / 60);
        const minutes = Number(val) % 60;
        const formatHour = hour < 10 ? '0' + hour : hour;
        const formatMinute = minutes < 10 ? '0' + minutes : minutes;

        return (formatHour && formatMinute) ? formatHour + ':' + formatMinute : '00:00';
    }

    const statusColor = (id) => {
        const numId = Number(id);
        const color = ['bg-dark', 'bg-info', 'bg-warning', 'bg-success', 'bg-danger'];
        return color[numId]
    }

    return (
        <>
            {isCustomer && <SOAComp />}

            {(isMangement || isAdmin) && <ManagementDashboard />}

            {(isAdmin || isMangement) && (
                <FormControlLabel
                    control={
                        <Switch
                            checked={dispTask}
                            onChange={e => setDispTask(e.target.checked)}
                        />
                    }
                    label="Show Task Management"
                    className=" fw-bold text-primary"
                />
            )}

            <div className="px-1">
                {((isAdmin || isMangement) && dispTask) && (
                    <div className="row">
                        <CardComp
                            title={'Projects'}
                            icon={<TbTargetArrow style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.ActiveProjects}
                            secondVal={dashboardData?.AllProjects}
                            classCount={'1'}
                        />
                        <CardComp
                            title={'Schedule'}
                            icon={<CiCalendarDate style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.ActiveSchedule}
                            secondVal={dashboardData?.AllSchedule}
                            classCount={'2'}
                        />
                        <CardComp
                            title={'Completed Tasks'}
                            icon={<BiTask style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.TaskCompleted}
                            // secondVal={dashboardData?.TaskAssigned}
                            classCount={'3'}
                        />
                        <CardComp
                            title={'Employee'}
                            icon={<HiUsers style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.EmployeeCounts}
                            secondVal={Number(dashboardData?.EmployeeCounts) + dashboardData?.OtherUsers}
                            classCount={'4'}
                        />
                        <CardComp
                            title={'Worked Hours'}
                            icon={<RxLapTimer style={{ fontSize: '80px' }} />}
                            firstVal={minFormat(dashboardData?.TotalMinutes)}
                            classCount={'5'}
                        />
                        <CardComp
                            title={'Today Tasks'}
                            icon={<CgSandClock style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.TodayTaskCompleted}
                            secondVal={dashboardData?.TodayTasks}
                            classCount={'6'}
                        />
                    </div>
                )}
                {isEmp && (
                    <div className="row">
                        <CardComp
                            title={'Completed Tasks'}
                            firstVal={dashboardData?.TaskCompleted}
                            secondVal={dashboardData?.TotalTasks}
                            icon={<BiTask style={{ fontSize: '80px' }} />}
                            classCount={'1'} />
                        <CardComp
                            title={'Today Tasks'}
                            firstVal={dashboardData?.TodayTaskCompleted}
                            secondVal={dashboardData?.TodayTasks}
                            icon={<CgSandClock style={{ fontSize: '80px' }} />}
                            classCount={'2'} />
                        <CardComp
                            title={'Total Work Hours'}
                            firstVal={minFormat(dashboardData?.WorkedMinutes)}
                            icon={<CgSandClock style={{ fontSize: '80px' }} />}
                            classCount={'3'} />
                    </div>
                )}
            </div>

            <br />

            {isEmp && <AttendanceComp />}

            <br />

            {(isEmp && workedDetais.length > 0) && (
                <>
                    <Card>
                        <CardContent sx={{ pb: 2 }}>
                            <h5>Today Activity</h5>
                            <PieChartComp TasksArray={workedDetais} />
                            <br />
                        </CardContent>
                    </Card>
                    <br />
                </>
            )}

            {(isEmp && myTasks.length > 0) && (
                <Card>
                    <CardHeader title={'Today Tasks:' + myTasks.length} sx={{ pb: 0 }} />
                    <CardContent>

                        <div className="table-responsive">
                            <table className="table mb-1 ">
                                <thead>
                                    <tr>
                                        <th className="fa-13 border">SNo</th>
                                        <th className="fa-13 border">Task</th>
                                        <th className="fa-13 border">Timer Based</th>
                                        <th className="fa-13 border">Schedule</th>
                                        <th className="fa-13 border">Duration</th>
                                        <th className="fa-13 border">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTasks.map((o, i) => (
                                        <tr key={i}>
                                            <td className="fa-13 border">{i + 1}</td>
                                            <td className="fa-13 border">{o?.Task_Name}</td>
                                            <td className="fa-13 border text-center">
                                                <span className={`badge rounded-4 px-3 fw-bold text-white ${statusColor(Number(o?.Timer_Based) === 1 ? 3 : 1)}`}>
                                                    {Number(o?.Timer_Based) === 1 ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="fa-13 border text-center">{o?.Sch_Time} - {o?.EN_Time}</td>
                                            <td className="fa-13 border text-center">{o?.Sch_Period}</td>
                                            <td className="fa-13 border text-center">
                                                <span className={`badge rounded-4 px-3 fw-bold text-white ${statusColor(o?.Work_Id ? 3 : 1)}`}>
                                                    {o?.Work_Id ? 'Completed' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <br />

            {(isEmp && tallyDetails?.length > 0) && (
                <Card component={Paper}>
                    <CardHeader title="Tally Entries" sx={{ pb: 0 }} />
                    <CardContent>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="fa-13 border">Sno</th>
                                        <th className="fa-13 border">Particulars</th>
                                        <th className="fa-13 border">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tallyDetails?.map((o, i) => (
                                        <tr key={i}>
                                            <td className="fa-13 border">{i + 1}</td>
                                            <td className="fa-13 border">{o?.Particulars}</td>
                                            <td className="fa-13 border">{o?.Tally_Count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

        </>
    )
}


export default CommonDashboard