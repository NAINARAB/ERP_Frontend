import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, Button, Tooltip } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { checkIsNumber, DaysBetween, firstDayOfMonth, formatTime24, isEqualNumber, ISOString, LocalDate, LocalTime } from "../../Components/functions";
import { Close, FileDownload } from "@mui/icons-material";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import { fetchLink } from '../../Components/fetchComponent';
import CardComp from '../Analytics/entryComps/numCardComp';
import FilterableTable from '../../Components/filterableTable2';
import { mkConfig, generateCsv, download } from 'export-to-csv';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const handleExportData = (dataArray) => {
    const csv = generateCsv(csvConfig)(dataArray);
    download(csvConfig)(csv);
};

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const FingerPrintAttendanceReport = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [salaryTypes, setSalaryTypes] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [dialogAbstract, setDialogAbstract] = useState(false);
    const [objDetails, setObjectDetails] = useState({});
    const [filter, setFilter] = useState({
        From: firstDayOfMonth(),
        To: ISOString(),
        EmpId: '',
        Name: 'All Employees',
        display: 0, // calendar - 0, table - 1.
        salaryType: ''
    });

    useEffect(() => {
        fetchLink({
            address: `empAttendance/fingerPrintAttendance?Fromdate=${filter.From}&Todate=${filter.To}&EmpId=${filter.EmpId}`,
        }).then(data => {
            if (data.success) {
                setAttendanceData(data.data);
                const uniqueSalaryType = new Set(data.data.map(o => o?.Salary_Type));
                setSalaryTypes(Array.from(uniqueSalaryType));
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
                setEmployees(empSet);
            }
        }).catch(e => console.error(e));
    }, [filter.From, filter.To, filter.EmpId,])

    const closeDialg = () => {
        setDialog(false);
        setObjectDetails({});
    }

    const totalDays = DaysBetween(new Date(filter.From), new Date(filter.To));
    const presentDays = attendanceData.filter(o => isEqualNumber(o.Emp_Id, filter.EmpId)).length;
    const absentDays = totalDays - presentDays;

    const totalHours = attendanceData
        .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
        .reduce((sum, item) => sum + (new Date(item.OutTime) - new Date(item.InTime)), 0);

    const averageMilliseconds = totalHours / presentDays;

    const averageInTime = new Date(
        attendanceData
            .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
            .reduce((sum, item) => sum + new Date(item.InTime).getTime(), 0) / presentDays
    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const averageOutTime = new Date(
        attendanceData
            .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
            .reduce((sum, item) => sum + new Date(item.OutTime).getTime(), 0) / presentDays
    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let hours = Math.floor(averageMilliseconds / (1000 * 60 * 60));
    let minutes = Math.round((averageMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes === 60) {
        hours += 1;
        minutes = 0;
    }

    const averageInTimeMillis = attendanceData
        .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
        .reduce((sum, item) => sum + new Date(item.InTime).getTime(), 0) / presentDays;

    const averageOutTimeMillis = attendanceData
        .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
        .reduce((sum, item) => sum + new Date(item.OutTime).getTime(), 0) / presentDays;

    const ifEmployeeData = [
        {
            label: 'Total Days',
            value: totalDays,
        },
        {
            label: 'Present Days',
            value: presentDays,
        },
        {
            label: 'Absent Days',
            value: absentDays,
        },
        {
            label: 'Average Hours',
            value: hours + ':' + minutes,
        },
        {
            label: 'Average In-Time',
            value: formatTime24(averageInTime),
        },
        {
            label: 'Average Out-Time',
            value: formatTime24(averageOutTime),
        },
        {
            label: 'Total Hours Worked',
            value: `${Math.floor(totalHours / (1000 * 60 * 60))} hours`,
        },
        {
            label: 'Late Arrivals',
            value: attendanceData
                .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
                .filter(o => new Date(o.InTime).getTime() > averageInTimeMillis)
                .length,
        },
        {
            label: 'Early Departures',
            value: attendanceData
                .filter(o => isEqualNumber(o.Emp_Id, filter.EmpId))
                .filter(o => new Date(o.OutTime).getTime() < averageOutTimeMillis)
                .length,
        },
        {
            label: 'Half Present Days',
            value: attendanceData.filter(o => isEqualNumber(o.Emp_Id, filter.EmpId)).filter(o => o.AttendanceStatus.trim() === '½Present').length,
        },
    ];

    const ifNotEmployee = [
        {
            label: 'Total Days',
            value: DaysBetween(new Date(filter.From), new Date(filter.To)),
        },
        {
            label: 'Total Employees',
            value: employees.length,
        },
        {
            label: 'Average Attendance',
            value: attendanceData.length / totalDays,
        },
    ];

    const dataFormat = (arr) => {
        const data = arr.map(o => ({
            Emp_Id: o.Emp_Id,
            Employee: o.Emp_Name,
            InTime: o.InTime,
            OutTime: o.OutTime,
            Date: o.InTime,
            Salary_Type: o.Salary_Type
        }));

        const filteredData = data
            .filter(o => !filter.EmpId || isEqualNumber(o.Emp_Id, filter.EmpId))
            .filter(o => !filter.salaryType || o.Salary_Type === filter.salaryType);

        return filteredData;
    };


    return (
        <>
            <Card>

                <CardContent sx={{ minHeight: '50vh' }}>
                    <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                        <h6 className="fa-18">Employee Attendance</h6>
                        <div>
                            <Tooltip title='Download Excel Data'>
                                <IconButton 
                                    onClick={() => handleExportData(dataFormat(attendanceData))}
                                    className="me-2"
                                >
                                    <FileDownload />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant='outlined'
                                onClick={() => setDialogAbstract(true)}
                            >
                                {filter.EmpId ? 'Emplyee Summary' : 'Attendance Summary'}
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
                                    { value: '', label: '(' + employees.length + ') All Employees ' },
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

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Display View</label>
                            <select
                                className="cus-inpt"
                                value={filter?.display}
                                onChange={e => setFilter(pre => ({ ...pre, display: Number(e.target.value) }))}
                            >
                                <option value={0}>Calendar</option>
                                <option value={1}>Table</option>
                            </select>
                        </div>

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Salary Type</label>
                            <select
                                className="cus-inpt"
                                value={filter?.salaryType}
                                onChange={e => setFilter(pre => ({ ...pre, salaryType: e.target.value }))}
                            >
                                <option value={''}>- Select -</option>
                                {salaryTypes.map((o, i) => (
                                    <option value={o} key={i}>{o}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {isEqualNumber(filter.display, 0) && (
                        <FullCalendar
                            plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
                            initialView="listMonth"
                            initialDate={new Date()}
                            events={
                                dataFormat(attendanceData)?.map(o => ({
                                    title: o?.Employee,
                                    start: new Date(o?.InTime),
                                    end: new Date(o?.OutTime),
                                    objectData: o
                                }))
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
                    )}

                    {isEqualNumber(filter.display, 1) && (
                        <FilterableTable
                            dataArray={dataFormat(attendanceData)}
                            columns={[
                                {
                                    Field_Name: "Employee",
                                    Fied_Data: "string",
                                    isVisible: 1,
                                    OrderBy: 1,
                                },
                                {
                                    Field_Name: "Salary_Type",
                                    Fied_Data: "string",
                                    isVisible: 1,
                                    OrderBy: 1,
                                },
                                {
                                    Field_Name: "Date",
                                    Fied_Data: "date",
                                    isVisible: 1,
                                    OrderBy: 2,
                                },
                                {
                                    Field_Name: "InTime",
                                    Fied_Data: "time",
                                    isVisible: 1,
                                    OrderBy: 2,
                                },
                                {
                                    Field_Name: "OutTime",
                                    Fied_Data: "time",
                                    isVisible: 1,
                                    OrderBy: 3,
                                },
                            ]}
                            EnableSerialNumber={true}
                        />
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
                        Attendance summary {filter.EmpId && 'of ' + filter.Name}
                        <span className="ps-2 blue-text">{LocalDate(filter.From) + ' - ' + LocalDate(filter.To)}</span>
                    </span>
                    <IconButton onClick={() => setDialogAbstract(false)}><Close sx={{ color: 'black' }} /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="row">
                        {filter.EmpId ? (
                            ifEmployeeData.map((o, i) => (
                                <div className="col-lg-4 p-2" key={i}>
                                    <ContCard Value={o.value} Label={o.label} />
                                </div>
                            ))
                        ) : (
                            ifNotEmployee.map((o, i) => (
                                <div className="col-lg-4 p-2" key={i}>
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