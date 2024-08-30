import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'


const CalenderComp = ({ eventsArray }) => {

    const getHour = (date) => {
        const dateObj = new Date(date);

        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        const formattedHours = hours < 10 ? "0" + hours : hours;
        const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

        const timeString = `${formattedHours}:${formattedMinutes}`;
        return timeString
    }

    const calcduration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const durationInMilliseconds = endDate - startDate;

        const durationInHours = Math.floor(durationInMilliseconds / (1000 * 60 * 60));
        const durationInMinutes = Math.floor((durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

        const formattedHours = durationInHours < 10 ? "0" + durationInHours : durationInHours;
        const formattedMinutes = durationInMinutes < 10 ? "0" + durationInMinutes : durationInMinutes;

        return `${formattedHours}:${formattedMinutes}`;

    }

    return (
        <>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                events={eventsArray}
                headerToolbar={{
                    left: 'prev next',
                    right: 'timeGridDay, timeGridWeek, dayGridMonth',

                }}
                editable={true}
            />
            {/* <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    initialDate={new Date()}
                    events={
                        empTaskData.map(o => ({
                            title: o?.TaskNameGet,
                            start: new Date(o?.Est_Start_Dt).toISOString().split('T')[0] + 'T' + o?.Sch_Time,
                            end: new Date(o?.Est_End_Dt).toISOString().split('T')[0] + 'T' + o?.EN_Time
                        }))
                    }
                    headerToolbar={{
                        left: 'prev next',
                        right: 'timeGridDay, timeGridWeek, dayGridMonth',
                    }}
                    showNonCurrentDates={false}
                    editable={true}
                    dayMaxEvents={1}
                    selectable
                    selectMirror
                    select={(info) => {
                        switchEmpAssign({
                            AN_No: '',
                            Project_Id: taskInfo?.Project_Id,
                            Sch_Id: taskInfo?.Sch_Id,
                            Task_Levl_Id: taskInfo?.Task_Levl_Id,
                            Task_Id: taskInfo?.Task_Id,
                            Assigned_Emp_Id: parseData?.UserId,
                            Emp_Id: currentEmp?.UserId,
                            Task_Assign_dt: new Date().toISOString().split('T')[0],
                            Sch_Period: calcduration(info?.startStr, info?.endStr),
                            Sch_Time: getHour(info?.startStr),
                            EN_Time: getHour(info?.endStr),
                            Est_Start_Dt: new Date(info?.startStr).toISOString().split('T')[0],
                            Est_End_Dt: new Date(info?.endStr).toISOString().split('T')[0],
                            Ord_By: 1,
                            Timer_Based: true,
                            Invovled_Stat: true,
                            EmpGet: currentEmp?.Name
                        })
                    }}
                /> */}
        </>
    )
}

export default CalenderComp