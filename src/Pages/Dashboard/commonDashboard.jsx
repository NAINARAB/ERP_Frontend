import { useEffect, useState } from "react"
import api from "../../API";
import { CiCalendarDate } from "react-icons/ci";
import { CgSandClock } from "react-icons/cg";
import { HiUsers } from "react-icons/hi2";
import { RxLapTimer } from "react-icons/rx";
import { TbTargetArrow } from "react-icons/tb";
import { BiTask } from "react-icons/bi";
import PieChartComp from "./chartComp";
import { Card, CardContent } from '@mui/material'



const CommonDashboard = () => {
    const [dashboardData, setDashboardData] = useState({});
    const [workedDetais, setWorkedDetais] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const isAdmin = Number(parseData?.UserTypeId) === 0 || Number(parseData?.UserTypeId) === 1 || Number(parseData?.UserTypeId) === 2

    useEffect(() => {
        fetch(`${api}dashboardData?UserType=${parseData?.UserTypeId}&Emp_Id=${parseData?.UserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDashboardData(data.data[0]);
                } else {
                    setDashboardData({})
                }
            }).catch(e => console.error(e))
    }, [parseData?.UserId, parseData?.UserTypeId]);

    useEffect(() => {
        if (!isAdmin) {
            fetch(`${api}myTodayWorks?Emp_Id=${parseData?.UserId}&reqDate=${new Date().toISOString().split('T')[0]}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setWorkedDetais(data.data)
                    }
                }).catch(e => console.error(e))
            fetch(`${api}task/myTasks?Emp_Id=${parseData?.UserId}&reqDate=${new Date().toISOString().split('T')[0]}`)
                .then(res => res.json())
                .then(data => {
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
                    }
                }).catch(e => console.error(e))
        }
    }, [isAdmin, parseData?.UserId])


    const CardComp = ({ title, icon, firstVal, secondVal, classCount }) => {
        return (
            <>
                <div className={`${isAdmin && 'col-xxl-3'} col-lg-4 col-md-6 col-sm-12 p-2`}>
                    <div className={"coloredDiv d-flex align-items-center text-light cus-shadow coloredDiv" + classCount}>
                        <div className="flex-grow-1 p-3">
                            <h5 >{title}</h5>
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
            <div className="px-1">
                {isAdmin ? (
                    <div className="row">

                        <CardComp
                            title={'Projects'}
                            icon={<TbTargetArrow style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.ActiveProjects}
                            secondVal={dashboardData?.AllProjects}
                            classCount={'1'} />

                        <CardComp
                            title={'Schedule'}
                            icon={<CiCalendarDate style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.ActiveSchedule}
                            secondVal={dashboardData?.AllSchedule}
                            classCount={'2'} />

                        <CardComp
                            title={'Completed Tasks'}
                            icon={<BiTask style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.TaskCompleted}
                            // secondVal={dashboardData?.TaskAssigned}
                            classCount={'3'} />

                        <CardComp
                            title={'Employee'}
                            icon={<HiUsers style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.EmployeeCounts}
                            secondVal={Number(dashboardData?.EmployeeCounts) + dashboardData?.OtherUsers}
                            classCount={'4'} />

                        <CardComp
                            title={'Worked Hours'}
                            icon={<RxLapTimer style={{ fontSize: '80px' }} />}
                            firstVal={minFormat(dashboardData?.TotalMinutes)}
                            classCount={'5'} />

                        <CardComp
                            title={'Today Tasks'}
                            icon={<CgSandClock style={{ fontSize: '80px' }} />}
                            firstVal={dashboardData?.TodayTaskCompleted}
                            secondVal={dashboardData?.TodayTasks}
                            classCount={'6'} />

                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div >
            <br />

            {(!isAdmin && workedDetais.length > 0) && (
                <>
                    <Card>
                        <CardContent>
                            <h5>Today Activity</h5>
                            <PieChartComp TasksArray={workedDetais} />
                        </CardContent>
                    </Card>
                    <br />
                </>
            )}

            {(!isAdmin && myTasks.length > 0) && (
                <Card>
                    <CardContent>
                        <h5>Today Tasks: {myTasks.length}</h5>

                        <div className="table-responsive mt-3">
                            <table className="table mb-1">
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
                                        <tr>
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
        </>
    )
}


export default CommonDashboard