import { useEffect, useState } from "react"
import api from "../../API";

// import { BusinessCenter } from '@mui/icons-material';
// import { MdPunchClock } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { CgSandClock } from "react-icons/cg";
import { HiUsers } from "react-icons/hi2";
import { RxLapTimer } from "react-icons/rx";
// import { GoTasklist } from "react-icons/go";
// import { MdOutlineTaskAlt } from "react-icons/md";
import { TbTargetArrow } from "react-icons/tb";
import { BiTask } from "react-icons/bi";



const CommonDashboard = () => {
    const [dashboardData, setDashboardData] = useState({});
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);

    useEffect(() => {
        fetch(`${api}dashboardData?UserType=${parseData?.UserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDashboardData(data.data[0]);
                } else {
                    setDashboardData({})
                }
            }).catch(e => console.error(e))
    }, [parseData?.UserId]);


    const CardComp = ({ title, icon, firstVal, secondVal, classCount }) => {
        return (
            <>
                <div className="col-xxl-3 col-lg-4 col-md-6 col-sm-12 p-2">
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
        let hour = Math.floor(Number(val) / 60);
        let minutes = Number(val) % 60;
        let formatHour = hour < 10 ? '0' + hour : hour;
        let formatMinute = minutes < 10 ? '0' + minutes : minutes;

        return formatHour + ':' + formatMinute;
    }



    return (
        <>
            <div className="px-3">
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
                        secondVal={dashboardData?.TaskAssigned}
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
            </div>
        </>
    )
}


export default CommonDashboard