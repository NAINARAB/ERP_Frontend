import React, { useState, useEffect } from "react";
import {
    Card, CardContent, Button, Chip, Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    TextField,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable from "../../Components/filterableTable2";
import * as XLSX from 'xlsx';
import { MyContext } from "../../Components/context/contextProvider";
import { useContext } from "react";
import { toast } from "react-toastify";
import Popper from '@mui/material/Popper';

const FingerPrintAttendanceReport = (loadingOn, loadingOff) => {

    const [loading, setLoading] = useState(true);
    const storage = JSON.parse(localStorage.getItem('user'));

    const userTypeId = storage?.UserTypeId;
    const parseData = storage;
    const [attendanceData, setAttendanceData] = useState([]);
    const [dropdownEmployees, setDropdownEmployees] = useState([]);
    const { contextObj } = useContext(MyContext);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const Add_Rights = contextObj?.Add_Rights;
    const getCurrentMonthYear = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    };

    const CustomPopper = (props) => {
        return <Popper {...props} placement="top" />;
    };
    const handleAddEmployeeClose = () => {
        setAddEmployeeDialogOpen(false);

    };

    const initialValue = {
        From: getCurrentMonthYear(),
        To: getCurrentMonthYear(),
        EmpId: 0,
        Name: '',
    };

    const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
    const [filter, setFilter] = useState(initialValue);
    const [employees, setEmployees] = useState([]);
    const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
    const [dropdownPlaceholder, setDropdownPlaceholder] = useState("ALL");


    const [debouncedFilter, setDebouncedFilter] = useState(filter);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

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

                if (Number(userTypeId) === 1 || Number(userTypeId) === 0 || Number(Add_Rights) === 1) {
                    filteredEmployees = data.data;
                    setFilter(prev => ({ ...prev, EmpId: 0, Name: 'ALL' }));
                    setIsDropdownDisabled(false);
                    setDropdownPlaceholder("ALL");
                } else {
                    filteredEmployees = data.data.filter(employee => employee.UserId === userId);
                    setFilter(prev => ({ ...prev, EmpId: userId, Name: storage?.Name }));
                    setIsDropdownDisabled(true);
                    setDropdownPlaceholder(storage?.Name);
                }

                setEmployees(filteredEmployees);
            }
        }).catch(e => console.error("Error fetching employees:", e));
    }, [storage?.UserTypeId, storage?.UserId, storage?.Company_id, storage?.Name]);

    const fetchAttendanceData = async (From, EmpId) => {
        try {
            const userTypeId = storage?.UserTypeId;

            const [year, month] = From.split("-");

            const startDate = `${year}-${month}-01`;

            const dayCount = getDaysInMonth(`${year}-${month}`);

            const endDate = `${year}-${month}-${dayCount}`;

            const response = await fetchLink({
                address: `userModule/employeActivity/trackActivitylogAttendance?FromDate=${startDate}&ToDate=${endDate}&UserTypeId=${userTypeId}&UserId=${EmpId}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('Autheticate_Id')}`,
                },
            });

            if (response.success) {
                setAttendanceData(response.data);
            }
        } catch (e) {
            console.error("Error fetching attendance data:", e);
        }
    };


    const handleOverallDownload = async () => {
        try {
            const fromDate = filter.From;
            const [year, month] = fromDate.split("-");
            const startDate = `${year}-${month}-01`;
            const dayCount = getDaysInMonth(`${year}-${month}`);
            const endDate = `${year}-${month}-${dayCount}`;
            const response = await fetchLink({
                address: `userModule/employeActivity/employeeAttendanceModuledownload?FromDate=${startDate}&ToDate=${endDate}`,
            });

            if (response.success) {
                const overallData = response.data;

                const getWorkingDays = (fromDate, endDate) => {
                    const allDays = [];
                    const currentDate = new Date(fromDate);
                    const endDateObj = new Date(endDate);

                    while (currentDate <= endDateObj) {
                        allDays.push(new Date(currentDate).toISOString().split("T")[0]);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    if (allDays.length === 0) {
                        allDays.push("No days in this range");
                    }
                    return {
                        days: allDays,
                        count: allDays.length,
                    };
                };

                const { days: dateRange } = getWorkingDays(startDate, endDate);

                const exportData = overallData.map(row => {
                    const punchDetails = row.AttendanceDetails ? JSON.parse(row.AttendanceDetails) : [];

                    const dailyAttendance = {};

                    dateRange.forEach((date, index) => {
                        if (Array.isArray(punchDetails)) {
                            const detail = punchDetails.find(detail => detail.Date === date);

                            const isSunday = new Date(date).getDay() === 0;

                            if (isSunday) {
                                dailyAttendance[`Day ${index + 1}`] = detail ? 'P' : 'H';
                            } else {
                                dailyAttendance[`Day ${index + 1}`] = detail ? detail.AttendanceStatus : 'A';
                            }
                        } else {
                            dailyAttendance[`Day ${index + 1}`] = 'A';
                        }
                    });

                    return {
                        EmployeeName: row.Name,
                        TotalPresent: row.TotalPresent || punchDetails.filter(detail => detail.AttendanceStatus === 'P').length,
                        ...dailyAttendance,
                    };
                });

                const ws = XLSX.utils.json_to_sheet(exportData);

                const headers = [
                    "EmployeeName",
                    "TotalPresent",
                    ...dateRange.map((_, id) => `Day ${id + 1}`),
                ];

                XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Overall Attendance Report");

                XLSX.writeFile(wb, "Overall_Attendance_Report.xlsx");
            }
        } catch (error) {
            console.error("Error downloading overall report:", error);
        }
    };


    const getDaysInMonth = (monthYear) => {
        if (!monthYear) return 0;

        const [year, month] = monthYear.split('-');

        return new Date(year, month, 0).getDate();
    };





    useEffect(() => {
        const { From, EmpId } = debouncedFilter;
        if (From && (EmpId || EmpId === 0)) {
            fetchAttendanceData(From, EmpId);
            fetchDropdownEmployees();
        }

    }, [debouncedFilter]);


    const fetchDropdownEmployees = async () => {
        setLoading(true);
        try {
            const data = await fetchLink({
                address: `masters/Employeedetails/dropDown?Company_id=${parseData.Company_id}`,
            });
            if (data.success) {
                setDropdownEmployees(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch employees for dropdown");
        } finally {
            setLoading(false);
        }
    };


    const handleFromChange = (e) => {
        const getDaysInMonth = (monthYear) => {
            if (!monthYear) return 0;

            const [year, month] = monthYear.split('-');

            return new Date(year, month, 0).getDate();
        };
        const selectedMonth = e.target.value;
        const [year, month] = selectedMonth.split("-");
        const startDate = `${year}-${month}-01`;
        const dayCount = getDaysInMonth(`${year}-${month}`);
        const endDate = `${year}-${month}-${dayCount}`;

        setFilter({
            From: startDate,
            To: endDate,
            EmpId: filter.EmpId || 0,
            Name: filter?.Name,
        });
    };


    const handleDownload = () => {
        const maxPunches = Math.max(
            ...attendanceData.map(row => (row.AttendanceDetails ? row.AttendanceDetails.split(',').length : 0))
        );

        const exportData = attendanceData.map(row => {
            const punchDetails = row.AttendanceDetails ? row.AttendanceDetails.split(',') : [];
            const punchColumns = {};

            const sortedPunchDetails = punchDetails
                .map(detail => {
                    const timeString = detail.trim().split(' ')[1];
                    let formattedTime = '--';
                    if (timeString) {
                        const [hours, minutes] = timeString.split(':').map(Number);
                        if (!isNaN(hours) && !isNaN(minutes)) {
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const formattedHours = hours % 12 || 12;
                            formattedTime = `${formattedHours < 10 ? '0' + formattedHours : formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                        }
                    }
                    return { formattedTime, timeString };
                })
                .filter(item => item.formattedTime !== '--')
                .sort((a, b) => {
                    const [aHours, aMinutes] = a.timeString.split(':').map(Number);
                    const [bHours, bMinutes] = b.timeString.split(':').map(Number);
                    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
                })
                .map(item => item.formattedTime);

            sortedPunchDetails.forEach((formattedTime, index) => {
                punchColumns[`Punch ${index + 1}`] = formattedTime;
            });

            return {
                Employee: row.username,
                "Log Date": formatAttendanceDate(row.LogDate),
                "Attendance Status": 'P',
                ...punchColumns,
            };
        });


        const columnsOrder = ["Employee", "Log Date", "Attendance Status", ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`)];


        const reorderedData = exportData.map(row =>
            columnsOrder.reduce((acc, col) => {
                acc[col] = row[col] || '--';
                return acc;
            }, {})
        );

        const ws = XLSX.utils.json_to_sheet(reorderedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    };

    const formatAttendanceDate = (logDateTime) => {
        if (!logDateTime) return '--';
        const [date] = logDateTime.split('T');
        return `${date} `;
    };

    const handleOverallWithPunch = () => {

        const filteredAttendanceData = attendanceData.filter((row) => {
            console.log(selectedEmployees)
            const isUserSelected = selectedEmployees.some((user) => user.UserId === row.UserId);
            return isUserSelected || selectedEmployees.some(user => user.UserId === 'all');
        });

        const groupedData = filteredAttendanceData.reduce((acc, row) => {
            const username = row.username;
            if (!acc[username]) {
                acc[username] = [];
            }
            acc[username].push(row);
            return acc;
        }, {});

        const wb = XLSX.utils.book_new();

        const firstLogDate = filteredAttendanceData[0]?.LogDate;
        const date = new Date(firstLogDate);
        const year = date.getFullYear();
        const month = date.toLocaleString("default", { month: "long" });

        Object.entries(groupedData).forEach(([username, userAttendance]) => {
            const maxPunches = Math.max(
                ...userAttendance.map(row => (row.AttendanceDetails ? row.AttendanceDetails.split(',').length : 0))
            );

            const exportData = userAttendance.map(row => {
                const location = row.location || "Unknown Location";
                const punchDetails = row.AttendanceDetails ? row.AttendanceDetails.split(',') : [];
                const punchColumns = {};

                const sortedPunchDetails = punchDetails
                    .map(detail => {
                        const timeString = detail.trim().split(' ')[1];
                        let formattedTime = '--';
                        if (timeString) {
                            const [hours, minutes] = timeString.split(':').map(Number);
                            if (!isNaN(hours) && !isNaN(minutes)) {
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                const formattedHours = hours % 12 || 12;
                                formattedTime = `${formattedHours < 10 ? '0' + formattedHours : formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                            }
                        }
                        return { formattedTime, timeString };
                    })
                    .filter(item => item.formattedTime !== '--')
                    .sort((a, b) => {
                        const [aHours, aMinutes] = a.timeString.split(':').map(Number);
                        const [bHours, bMinutes] = b.timeString.split(':').map(Number);
                        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
                    })
                    .map(item => item.formattedTime);

                sortedPunchDetails.forEach((formattedTime, index) => {
                    punchColumns[`Punch ${index + 1}`] = formattedTime;
                });

                return {
                    Employee: row.username,
                    Location: location,
                    "Log Date": formatAttendanceDate(row.LogDate),
                    ...punchColumns,
                };
            });

            const columnsOrder = ["Employee", "Log Date", ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`)];

            const reorderedData = exportData.map(row =>
                columnsOrder.reduce((acc, col) => {
                    acc[col] = row[col] || '--';
                    return acc;
                }, {})
            );

            const ws = XLSX.utils.json_to_sheet(reorderedData);
            XLSX.utils.book_append_sheet(wb, ws, username);
        });

        const fileName = `Attendance_Report_${month}_${year}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <>
            <Dialog
                open={addEmployeeDialogOpen}
                // onClose={handleAddEmployeeClose}
                maxWidth="md"
                PaperProps={{
                    style: { width: '500px', height: '500px' },
                }}
            >
                <DialogTitle>Add Employee</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        multiple
                        options={[{ UserId: 'all', Name: 'ALL' }, ...dropdownEmployees]}
                        getOptionLabel={(option) => option.Name}
                        isOptionEqualToValue={(option, value) => option.UserId === value.UserId}
                        onChange={(event, value) => {
                            if (value.some((selected) => selected.UserId === 'all')) {
                                setSelectedEmployees(dropdownEmployees);
                            } else {
                                const uniqueValues = value.filter((val, index, self) =>
                                    index === self.findIndex((t) => t.UserId === val.UserId)
                                );
                                setSelectedEmployees(uniqueValues);
                            }
                        }}
                        value={selectedEmployees.some((user) => user.UserId === 'all')
                            ? [{ UserId: 'all', Name: 'ALL' }]
                            : selectedEmployees}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Employees" />
                        )}
                    />


                </DialogContent>
                <DialogActions className="d-flex justify-content-between flex-wrap">
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => setSelectedEmployees([])}
                    >
                        Clear
                    </Button>
                    <span>
                        <Button onClick={handleAddEmployeeClose}>Cancel</Button>
                        <Button onClick={handleOverallWithPunch}>Download</Button>

                    </span>
                </DialogActions>

            </Dialog>
            <Card>
                <CardContent sx={{ minHeight: '50vh' }}>
                    <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                        <h6 className="fa-18">Employee Attendance</h6>
                        {Number(userTypeId === 1) || Number(userTypeId) === 0 ? (
                            <>
                                <div className="d-flex align-items-center justify-content-start gap-3">
                                    <Button

                                        onClick={handleDownload}
                                        variant="contained"

                                        disabled={filter?.EmpId === 0 || filter?.Name === "ALL"}
                                    >

                                        Individual Report
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleOverallDownload(filter?.From, filter?.To);

                                        }}
                                    >
                                        Monthly Report
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setAddEmployeeDialogOpen(true)
                                            // handleOverallWithPunch(filter?.From, filter?.To);

                                        }}
                                    >
                                        Cummulative Monthly Report
                                    </Button>
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
                                options={[{ value: 0, label: `ALL` }, ...employees.map(obj => ({ value: obj?.UserId, label: obj?.Name }))]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={dropdownPlaceholder}
                                isDisabled={isDropdownDisabled}
                            />
                        </div>

                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                            <label>From</label>
                            <input
                                type="month"
                                className="cus-inpt"
                                value={filter?.From?.slice(0, 7)}
                                onChange={handleFromChange}
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
                                ColumnHeader: 'Punch Details',
                                isVisible: 1,
                                width: '40%',
                                CellProps: {
                                    sx: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                    },
                                },
                                Cell: ({ row }) => (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {row.AttendanceDetails ? (
                                            row.AttendanceDetails.split(',')
                                                .map(detail => {
                                                    const timeString = detail.trim().split(' ')[1];
                                                    if (!timeString) return null;
                                                    let [hours, minutes] = timeString.split(':').map(Number);
                                                    if (isNaN(hours) || isNaN(minutes)) return null;
                                                    return { timeString, hours, minutes, originalDetail: detail };
                                                })
                                                .filter(item => item !== null)
                                                .sort((a, b) => a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes))
                                                .map((item, idx) => {
                                                    const { hours, minutes } = item;
                                                    const ampm = hours >= 12 ? 'PM' : 'AM';
                                                    const formattedHours = hours % 12 || 12;
                                                    const formattedTime = `${formattedHours < 10 ? '0' + formattedHours : formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

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
        </>
    );
};

export default FingerPrintAttendanceReport;