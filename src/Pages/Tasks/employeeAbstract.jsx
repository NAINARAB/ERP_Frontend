import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import { fetchLink } from "../../Components/fetchComponent";
import { ISOString } from "../../Components/functions";


const WorkDoneHistory = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [workedDetais, setWorkedDetais] = useState([]);
    const [selectedTask, setSelectedTask] = useState({});
    const [dialog, setDialog] = useState(false);
    const [days, setDays] = useState({
        Start: ISOString(),
        End: ISOString(),
    })

    useEffect(() => {
        fetchLink({
            address: `taskManagement/task/work?Emp_Id=${parseData?.UserId}&from=${days.Start}&to=${days.End}`
        }).then(data => {
            if (data.success) {
                setWorkedDetais(data.data)
            }
        }).catch(e => console.error(e))
    }, [parseData?.UserId, days])

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

    return (
        <>
            <div className="px-3 py-2 calendar" >
                <h5 className="mb-3 text-center">Completed Tasks</h5>
                <FullCalendar
                    plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    initialDate={new Date()}
                    events={
                        workedDetais.map(o => ({
                            title: o?.Task_Name,
                            start: ISOString(o?.Work_Dt) + 'T' + o?.Start_Time,
                            end: ISOString(o?.Work_Dt) + 'T' + o?.End_Time,
                            objectData: o
                        }))
                    }
                    headerToolbar={{
                        left: 'prev next',
                        center: 'title',
                        right: 'timeGridDay, timeGridWeek, dayGridMonth, listMonth',
                    }}
                    slotDuration={'00:20:00'}
                    slotMinTime={'08:00:00'}
                    slotMaxTime={'22:00:00'}
                    showNonCurrentDates={false}
                    editable={false}
                    selectable
                    selectMirror
                    eventClick={eve => {
                        const eveObj = eve.event.extendedProps.objectData;
                        setSelectedTask(eveObj);
                        setDialog(true)
                    }}
                    height={1200}
                    datesSet={date => {
                        setDays(pre => ({ ...pre, Start: date.startStr.split('T')[0], End: date.endStr.split('T')[0] }))
                    }}
                />
            </div>

            <Dialog
                open={dialog} maxWidth="sm" fullWidth
                onClose={() => { setDialog(false); setSelectedTask({}) }}>
                <DialogTitle className="fa-18">
                    Work Details
                </DialogTitle>
                <DialogContent className="pb-0">

                    <div className="table-responsive pb-0">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className="border-1 fa-14">Task Name</td>
                                    <td className="border-1 fa-14">{selectedTask?.Task_Name}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Work Done At</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Work_Dt && new Date(selectedTask?.Work_Dt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Start Time</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Start_Time && formatTime24(selectedTask?.Start_Time)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">End Time</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.End_Time && formatTime24(selectedTask?.End_Time)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Total Minutes</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Tot_Minutes}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Project</td>
                                    <td className="border-1 fa-14">{selectedTask?.Project_Name}</td>
                                </tr>
                                {selectedTask?.Parameter_Details?.length > 0 && (
                                    <tr>
                                        <td colSpan={2} className="border-1 fa-14 text-center">Task Parameters ( {selectedTask?.Parameter_Details?.length} )</td>
                                    </tr>
                                )}
                                {selectedTask?.Parameter_Details?.map((o, i) => (
                                    <tr key={i}>
                                        <td className="border-1 fa-14">{o?.Paramet_Name}</td>
                                        <td className="border-1 fa-14">
                                            {o?.Paramet_Data_Type === 'number' ? Number(o?.Current_Value).toLocaleString('en-IN') : o?.Current_Value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialog(false); setSelectedTask({}) }}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default WorkDoneHistory;
