

import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Button, Dialog, DialogTitle, DialogContent, Chip, TextField } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { firstDayOfMonth, ISOString } from "../../Components/functions";
import { Close } from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable from "../../Components/filterableTable2";
import * as XLSX from 'xlsx';

const FingerPrintAttendanceReport = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const userTypeId = storage?.UserTypeId;
    const [attendanceData, setAttendanceData] = useState([]);
    const initialValue = {
        From: firstDayOfMonth(),
        To: ISOString(),
        EmpId: 0,
        Name: '',
    };

    const [filter, setFilter] = useState(initialValue);
    const [dialog, setDialog] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
    const [dropdownPlaceholder, setDropdownPlaceholder] = useState("Employee Name");


    const [debouncedFilter, setDebouncedFilter] = useState(filter);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 50);

        return () => clearTimeout(timer);
    }, [filter]);


    useEffect(() => {

        const userTypeId = storage?.UserTypeId;
        const userId = storage?.UserId;
        const companyId = storage?.Company_id;

        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${companyId}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('Autheticate_Id')}`,
            }
        }).then(data => {
            if (data.success) {
                let filteredEmployees = [];

                if (Number(userTypeId) == 1 || Number(userTypeId) == 0) {
                    filteredEmployees = data.data;
                    setFilter(prev => ({ ...prev, EmpId: 0, Name: 'All Employees' }));
                    setIsDropdownDisabled(false);
                    setDropdownPlaceholder("Employee Name");
                } else {
                    filteredEmployees = data.data.filter(employee => employee.UserId === userId);
                    setFilter(prev => ({ ...prev, EmpId: userId, Name: storage?.Name }));
                    setIsDropdownDisabled(true);
                    setDropdownPlaceholder(storage?.Name || "Employee Name");
                }

                setEmployees(filteredEmployees);
            }
        }).catch(e => console.error("Error fetching employees:", e));
    }, [storage?.UserTypeId]);

    const fetchAttendanceData = async (From, To, EmpId) => {
        try {
            const userTypeId = storage?.UserTypeId;

            const response = await fetchLink({
                address: `userModule/employeActivity/trackActivitylogAttendance?FromDate=${From}&ToDate=${To}&UserTypeId=${userTypeId}&UserId=${EmpId}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('Autheticate_Id')}`,
                }
            });

            if (response.success) {
                setAttendanceData(response.data);
            }
        } catch (e) {
            console.error("Error fetching attendance data:", e);
        }
    };


    useEffect(() => {
        const { From, To, EmpId } = debouncedFilter;
        if (From && To && (EmpId || EmpId === 0)) {
            fetchAttendanceData(From, To, EmpId);
        }
    }, [debouncedFilter]);

    const openReportDialog = () => {
        setDialog(true);
    };

    const closeDialog = () => {
        setDialog(false);
    };

    // const handleDownload = () => {

    //     const maxPunches = Math.max(...attendanceData.map(row => (row.AttendanceDetails ? row.AttendanceDetails.split(',').length : 0)));


    //     const exportData = attendanceData.map(row => {
    //         const punchDetails = row.AttendanceDetails ? row.AttendanceDetails.split(',') : [];
    //         const punchColumns = {};


    //         for (let i = 0; i < maxPunches; i++) {
    //             punchColumns[`Punch Detail ${i + 1}`] = punchDetails[i] ? punchDetails[i].trim() : '--';
    //         }

    //         return {
    //             Employee: row.username,
    //             "Log Date": formatAttendanceDate(row.LogDate),
    //             "Attendance Status": row.AttendanceStatus,
    //             ...punchColumns 
    //         };
    //     });


    //     const ws = XLSX.utils.json_to_sheet(exportData);


    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");


    //     XLSX.writeFile(wb, "Attendance_Report.xlsx");
    // };


    const handleDownload = () => {
        const maxPunches = Math.max(...attendanceData.map(row => (row.AttendanceDetails ? row.AttendanceDetails.split(',').length : 0)));

        const exportData = attendanceData.map(row => {
            const punchDetails = row.AttendanceDetails ? row.AttendanceDetails.split(',') : [];
            const punchColumns = {};


            for (let i = 0; i < maxPunches; i++) {

                const timeString = punchDetails[i] ? punchDetails[i].split(' (')[0].trim() : '';
                let formattedTime = '--';

                if (timeString) {
                    let [hours, minutes] = timeString.split(':').map(Number);
                    let ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                }

                punchColumns[`Punch Detail ${i + 1}`] = formattedTime;
            }

            return {
                Employee: row.username,
                "Log Date": formatAttendanceDate(row.LogDate),
                "Attendance Status": row.AttendanceStatus,
                ...punchColumns,
            };
        });


        const ws = XLSX.utils.json_to_sheet(exportData);


        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");


        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    };




    const formatAttendanceDate = (logDateTime) => {
        if (!logDateTime) return '--';
        const [date] = logDateTime.split('T');
        return `${date} `;
    };

    return (
        <>
            <Card>
                <CardContent sx={{ minHeight: '50vh' }}>
                    <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                        <h6 className="fa-18">Employee Attendance</h6>
                        {(userTypeId == 1 || userTypeId == 0) ? (
                            <>
                                <div className="d-flex align-items-center justify-content-start gap-3">
                                    <Button
                                        onClick={openReportDialog}
                                        disabled={filter?.EmpId === 0 || filter?.Name === "All Employees"}
                                    >
                                        Individual Report
                                    </Button>
                                    {/* <Button 
                                        onClick={() => { 
                                            fetchMonthlyReportData(filter?.From, filter?.To); 
                                            openReportDialog(); 
                                        }}
                                    >
                                        Monthly Report
                                    </Button> */}
                                </div>
                            </>
                        ) : (
                            <div> </div>
                        )}



                    </div>

                    <div className="px-2 row mb-4">
                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>Employee</label>
                            <Select
                                value={{ value: filter?.EmpId, label: filter?.Name }}
                                onChange={(e) => setFilter({ ...filter, EmpId: e.value, Name: e.label })}
                                options={[{ value: '', label: `All Employees` }, ...employees.map(obj => ({ value: obj?.UserId, label: obj?.Name }))]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={dropdownPlaceholder}
                                isDisabled={isDropdownDisabled}
                            />
                        </div>

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>From</label>
                            <input
                                type="date"
                                className="cus-inpt"
                                value={filter?.From}
                                onChange={e => setFilter(prev => ({ ...prev, From: e.target.value }))}
                            />
                        </div>

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>To</label>
                            <input
                                type="date"
                                className="cus-inpt"
                                value={filter?.To}
                                onChange={e => setFilter(prev => ({ ...prev, To: e.target.value }))}
                            />
                        </div>
                    </div>

                    <FilterableTable
                        dataArray={attendanceData}
                        columns={[
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => row.username,
                                ColumnHeader: 'Employee',
                                isVisible: 1,
                                width: '20%',
                                CellProps: {
                                    sx: {
                                        padding: '10px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                    },
                                },
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => formatAttendanceDate(row.LogDate || '--'),
                                ColumnHeader: 'Log Date',
                                isVisible: 1,
                                width: '20%',
                                CellProps: {
                                    sx: {
                                        padding: '10px',
                                        textAlign: 'center',
                                        color: 'gray',
                                    },
                                },
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => (row.AttendanceStatus || '--'),
                                ColumnHeader: 'Attendance Status',
                                isVisible: 1,
                                width: '20%',
                                CellProps: {
                                    sx: {
                                        padding: '10px',
                                        textAlign: 'center',
                                    },
                                },
                            },
                            {
                                isCustomCell: true,
                                ColumnHeader: 'Punch Details',
                                isVisible: 1,
                                width: '40%',
                                CellProps: {
                                    sx: {
                                        padding: '10px',
                                    },
                                },
                                Cell: ({ row }) => (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {row.AttendanceDetails ? (
                                            row.AttendanceDetails.split(',').map((detail, idx) => {
                                                const timeString = detail.split(' (')[0];
                                                let [hours, minutes] = timeString.split(':').map(Number);
                                                let ampm = hours >= 12 ? 'PM' : 'AM';
                                                hours = hours % 12;
                                                hours = hours ? hours : 12;
                                                const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                                                return (
                                                    <Chip
                                                        key={idx}
                                                        label={formattedTime}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ margin: '2px', color: 'green' }}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <span>No details available</span>
                                        )}
                                    </div>
                                ),
                            }
                        ]}
                        EnableSerialNumber
                        CellSize="small"
                        disablePagination={false}
                    />
                </CardContent>
            </Card>

            <Dialog open={dialog} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Individual Report
                    <IconButton onClick={closeDialog} style={{ position: 'absolute', right: 16, top: 16 }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="employee">Employee</label>
                        <Select
                            id="employee"
                            value={{ value: filter?.EmpId, label: filter?.Name }}
                            onChange={(e) => {
                                setFilter({ ...filter, EmpId: e.value, Name: e.label });
                            }}
                            options={[{ value: '', label: 'All Employees' }, ...employees.map((obj) => ({ value: obj?.UserId, label: obj?.Name }))]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            placeholder={dropdownPlaceholder}
                            isDisabled={isDropdownDisabled}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="from-date">From Date:</label>
                        <TextField
                            id="from-date"
                            type="date"
                            value={filter?.From}
                            onChange={e => setFilter(prev => ({ ...prev, From: e.target.value }))}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            margin="normal"
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="to-date">To Date:</label>
                        <TextField
                            id="to-date"
                            type="date"
                            value={filter?.To}
                            onChange={e => setFilter(prev => ({ ...prev, To: e.target.value }))}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            margin="normal"
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={handleDownload}
                            variant="contained"
                            color="primary"
                            style={{ marginTop: '16px' }}
                        >
                            Download Report
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default FingerPrintAttendanceReport;