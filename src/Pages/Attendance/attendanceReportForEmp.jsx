import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, Tooltip } from "@mui/material";
import '../common.css'
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";

import { ISOString, LocalDate, LocalTime, timeDuration } from "../../Components/functions";
import { Close, OpenInNew } from "@mui/icons-material";

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import { fetchLink } from '../../Components/fetchComponent'


const AttendanceReportForEmployee = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [objDetails, setObjectDetails] = useState({});
    const [filter, setFilter] = useState({
        From: ISOString(),
        To: ISOString(),
        UserId: '',
        Name: 'All Employee',
        display: 0 // calendar - 0, table - 1.
    });

    useEffect(() => {
        fetchLink({
            address: `empAttendance/attendance/history?From=${filter?.From}&To=${filter?.To}&UserId=${filter?.UserId}&UserTypeID=3`
        }).then(data => {
            if (data.success) {
                setAttendanceData(data.data)
            }
        }).catch(e => console.error(e))

    }, [filter.From, filter.To, filter?.UserId])

    useEffect(() => {
        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setEmployees(data.data)
            }
        }).catch(e => console.error(e))

    }, [])

    const closeDialg = () => {
        setDialog(false);
        setObjectDetails({});
    }

    return (
        <>
            <Card>
                <CardContent sx={{ minHeight: '50vh' }}>
                    <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                        <h6 className="fa-18">Employee Attendance</h6>
                        {/* <span className="fw-bold ">₹ </span> */}
                        <div >
                            <select
                                className="cus-inpt w-auto"
                                value={filter?.display}
                                onChange={e => setFilter(pre => ({ ...pre, display: Number(e.target.value) }))}
                            >
                                <option value={0}>Calendar</option>
                                <option value={1}>Table</option>
                            </select>
                        </div>
                    </div>

                    <div className="px-2 row mb-4">

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Employee</label>
                            <Select
                                value={{ value: filter?.UserId, label: filter?.Name }}
                                onChange={(e) => setFilter({ ...filter, UserId: e.value, Name: e.label })}
                                options={[
                                    { value: '', label: 'All Employee' },
                                    ...employees.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Employee Name"}
                            />
                        </div>

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>From</label>
                            <input
                                type="date"
                                className="cus-inpt "
                                value={filter?.From}
                                onChange={e => setFilter(pre => ({ ...pre, From: e.target.value }))}
                            />
                        </div>

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>To</label>
                            <input
                                type="date"
                                className="cus-inpt "
                                value={filter?.To}
                                onChange={e => setFilter(pre => ({ ...pre, To: e.target.value }))}
                            />
                        </div>

                    </div>

                    {(filter?.display === 0) ? (
                        <FullCalendar
                            plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
                            initialView="listMonth"
                            initialDate={new Date()}
                            events={
                                attendanceData.map(o => ({
                                    title: o?.User_Name,
                                    start: new Date(o?.Start_Date),
                                    end: new Date(o?.End_Date),
                                    objectData: o
                                }))
                            }
                            headerToolbar={{
                                left: 'prev next',
                                center: 'title',
                                right: 'timeGridDay, timeGridWeek, dayGridMonth, listMonth',
                            }}
                            slotDuration={'00:30:00'}
                            slotMinTime={'08:00:00'}
                            slotMaxTime={'22:00:00'}
                            showNonCurrentDates={false}
                            editable={false}
                            selectable
                            selectMirror
                            eventClick={eve => {
                                const eveObj = eve.event.extendedProps.objectData;
                                setObjectDetails(eveObj);
                                setDialog(true);
                            }}
                            datesSet={date => {
                                setFilter(pre => ({ ...pre, From: date.startStr.split('T')[0], To: date.endStr.split('T')[0] }))
                            }}
                            height={800}
                        />
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: '57vh', overflow: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['SNo', 'Date', 'Employee', 'Start Time', 'End Time', 'Duration', 'Location'].map((o, i) => (
                                            <th key={i} className="fa-13 text-center border tble-hed-stick">{o}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData?.map((o, i) => (
                                        <tr key={i}>
                                            <td className="fa-13 border text-center">{i + 1}</td>
                                            <td className="fa-13 border text-center">
                                                {o?.Start_Date && LocalDate(o?.Start_Date)}
                                                <span> - </span>
                                                {o?.End_Date && LocalDate(o?.End_Date)}
                                            </td>
                                            <td className="fa-13 border">{o?.User_Name}</td>
                                            <td className="fa-13 border text-end">{o?.Start_Date && LocalTime(o?.Start_Date)}</td>
                                            <td className="fa-13 border text-end">{o?.End_Date && LocalTime(o?.End_Date)}</td>
                                            <td className="fa-13 border text-end">
                                                {(o?.Start_Date && o?.End_Date) ? timeDuration(o?.Start_Date, o?.End_Date) : '--:--:--'}
                                                {/* {o?.End_Date && LocalTime(o?.End_Date)} */}
                                            </td>
                                            <td className="fa-13 border">
                                                <Tooltip title="Open in Map">
                                                    <IconButton
                                                        size="small"
                                                        color='primary'
                                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${objDetails?.Latitude},${objDetails?.Longitude}`, '_blank')}
                                                    >
                                                        <OpenInNew sx={{ fontSize: '16px' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </CardContent>
            </Card>

            <Dialog
                open={dialog}
                onClose={closeDialg}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='d-flex justify-content-between'>
                    <span>Attendance Details</span>
                    <IconButton onClick={closeDialg}><Close sx={{ color: 'black' }} /></IconButton>
                </DialogTitle>

                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="fa-14 fw-bold text-muted border">Start Date</td>
                                    <td className="fa-14 fw-bold text-end text-muted border">End Date</td>
                                </tr>
                                <tr>
                                    <td className="fa-14 fw-bold text-primary border">{objDetails?.Start_Date ? LocalDate(objDetails?.Start_Date) : ' - '}</td>
                                    <td className="fa-14 fw-bold text-primary border text-end">{objDetails?.End_Date ? LocalDate(objDetails?.End_Date) : ' - '}</td>
                                </tr>
                                <tr>
                                    <td className="fa-14 fw-bold text-muted border">In Time</td>
                                    <td className="fa-14 fw-bold text-end text-muted border">Out Time</td>
                                </tr>
                                <tr>
                                    <td className="fa-14 fw-bold text-primary border">{objDetails?.Start_Date ? LocalTime(objDetails?.Start_Date) : ' - '}</td>
                                    <td className="fa-14 fw-bold text-primary border text-end">{objDetails?.End_Date ? LocalTime(objDetails?.End_Date) : ' - '}</td>
                                </tr>
                                <tr>
                                    <td className="fa-14 border text-end fw-bold" colSpan={2}>
                                        <Tooltip title="Open in Map">
                                            <span className="ps-2">
                                                Location:
                                                <IconButton
                                                    size="small"
                                                    color='primary'
                                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${objDetails?.Latitude},${objDetails?.Longitude}`, '_blank')}
                                                >
                                                    <OpenInNew sx={{ fontSize: '16px' }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>

            </Dialog>

        </>
    )
}

export default AttendanceReportForEmployee;