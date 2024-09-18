import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { checkIsNumber, DaysBetween, firstDayOfMonth, isEqualNumber, ISOString, LocalDate, LocalTime } from "../../Components/functions";
import { Close } from "@mui/icons-material";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import { fetchLink } from '../../Components/fetchComponent';
import CardComp from '../Analytics/entryComps/numCardComp';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const FingerPrintAttendanceReport = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [dialogAbstract, setDialogAbstract] = useState(false);
    const [objDetails, setObjectDetails] = useState({});
    const [filter, setFilter] = useState({
        From: firstDayOfMonth(),
        To: ISOString(),
        EmpId: '',
        Name: 'All Employee',
    });

    useEffect(() => {
        fetchLink({
            address: `empAttendance/fingerPrintAttendance?Fromdate=${filter.From}&Todate=${filter.To}&EmpId=${filter.EmpId}`,
        }).then(data => {
            if (data.success) {
                setAttendanceData(data.data);
                const empSet = [];
                const uniqueEmpIds = new Set();

                data.data.forEach(o => {
                    if (!uniqueEmpIds.has(o.Emp_Id)) {
                        empSet.push({
                            Emp_Name: o.Emp_Name,
                            fingerPrintEmpId: o.fingerPrintEmpId,
                            Emp_Id: o.Emp_Id,
                        });
                        uniqueEmpIds.add(o.Emp_Id);
                    }
                });
                empSet.sort((a, b) => String(a.Emp_Name).localeCompare(b.Emp_Name))
                setEmployees(empSet)
            }
        }).catch(e => console.error(e));
    }, [filter.From, filter.To, filter.EmpId,])

    const closeDialg = () => {
        setDialog(false);
        setObjectDetails({});
    }

    const ifEmployeeData = [
        {
            label: 'Total Days',
            value: DaysBetween(new Date(filter.From), new Date(filter.To)),
        },
        {
            label: 'Presect Days',
            value: attendanceData.filter(o => isEqualNumber(o.Emp_Id, filter.EmpId)).length,
        },
        {
            label: 'Absent Days',
            value: DaysBetween(new Date(filter.From), new Date(filter.To)) - attendanceData.filter(o => isEqualNumber(o.Emp_Id, filter.EmpId)).length,
        },
        // {
        //     label: 'Average Hours',
        //     value: attendanceData
        //     .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
        //     .reduce((sum, item) => {

        //     }, 0),
        // },
        // {
        //     label: '',
        //     value: '',
        // },
    ];

    const ifNotEmployee = [
        {
            label: 'Total Days',
            value: DaysBetween(new Date(filter.From), new Date(filter.To)),
        },
        {
            label: '',
            value: '',
        },
        {
            label: '',
            value: '',
        },
    ]

    return (
        <>
            <Card>

                <CardContent sx={{ minHeight: '50vh' }}>
                    <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                        <h6 className="fa-18">Employee Attendance</h6>
                        <div >
                            <Button
                                variant='outlined'
                                onClick={() => setDialogAbstract(true)}
                            >
                                Attendance Abstract
                            </Button>
                        </div>
                    </div>

                    <div className="px-2 row mb-4">

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Employee</label>
                            <Select
                                value={{ value: filter?.UserId, label: filter?.Name }}
                                onChange={(e) => setFilter({ ...filter, EmpId: e.value, Name: e.label })}
                                options={[
                                    { value: '', label: 'All Employee' },
                                    ...employees.map(obj => ({ value: obj?.Emp_Id, label: obj?.Emp_Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Employee Name"} // start from here
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

                    <FullCalendar
                        plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="listMonth"
                        initialDate={new Date()}
                        events={
                            checkIsNumber(filter.EmpId) ? (
                                attendanceData
                                    .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
                                    .map(o => ({
                                        title: o?.Emp_Name,
                                        start: new Date(o?.InTime),
                                        end: new Date(o?.OutTime),
                                        objectData: o
                                    }))
                            ) : (
                                attendanceData.map(o => ({
                                    title: o?.Emp_Name,
                                    start: new Date(o?.InTime),
                                    end: new Date(o?.OutTime),
                                    objectData: o
                                }))
                            )
                        }
                        headerToolbar={{
                            left: 'prev next',
                            center: 'title',
                            right: 'timeGridDay, timeGridWeek, dayGridMonth, listMonth',
                        }}
                        slotDuration={'00:30:00'}
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
                            const lastDay = new Date(date.endStr);
                            lastDay.setDate(lastDay.getDate() - 1);
                            const formattedLastDay = lastDay.toLocaleDateString('en-CA'); 
                            setFilter(pre => ({ 
                                ...pre, 
                                From: date.startStr.split('T')[0],
                                To: formattedLastDay 
                            }));
                        }}
                        height={800}
                    />


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
                                    <td className="fa-14 fw-bold text-primary border">{objDetails?.InTime ? LocalDate(objDetails?.InTime) : ' - '}</td>
                                    <td className="fa-14 fw-bold text-primary border text-end">{objDetails?.OutTime ? LocalDate(objDetails?.OutTime) : ' - '}</td>
                                </tr>
                                <tr>
                                    <td className="fa-14 fw-bold text-muted border">In Time</td>
                                    <td className="fa-14 fw-bold text-end text-muted border">Out Time</td>
                                </tr>
                                <tr>
                                    <td className="fa-14 fw-bold text-primary border">{objDetails?.InTime ? LocalTime(objDetails?.InTime) : ' - '}</td>
                                    <td className="fa-14 fw-bold text-primary border text-end">{objDetails?.OutTime ? LocalTime(objDetails?.OutTime) : ' - '}</td>
                                </tr>
                                {/* <tr>
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
                                </tr> */}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>

            </Dialog>

            <Dialog
                open={dialogAbstract}
                onClose={() => setDialogAbstract(false)}
                maxWidth='lg' fullWidth
            >
                <DialogTitle className='d-flex justify-content-between'>
                    <span>
                        {filter.EmpId ? 'Employee Abstract' : 'Attendance Summary'} 
                        <span className="ps-2 blue-text">{LocalDate(filter.From) + ' - ' + LocalDate(filter.To)}</span>
                    </span>
                    <IconButton onClick={() => setDialogAbstract(false)}><Close sx={{ color: 'black' }} /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="row">
                        {filter.EmpId ? (
                            ifEmployeeData.map((o, i) => (
                                <div className="col-lg-3 p-2" key={i}>
                                    <ContCard Value={o.value} Label={o.label} />
                                </div>
                            ))
                        ) : (
                            ifNotEmployee.map((o, i) => (
                                <div className="col-lg-3 p-2" key={i}>
                                    <ContCard Value={o.value} Label={o.label} />
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </>
    )
}


export default FingerPrintAttendanceReport;