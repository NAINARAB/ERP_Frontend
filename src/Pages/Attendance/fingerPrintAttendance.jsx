import React, { useState, useEffect } from "react";
import {
    Dialog,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import {
    ISOString,
    isValidDate
} from "../../Components/functions";
// import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Search, Refresh } from "@mui/icons-material";
// import { convertedStatus } from "../convertedStatus";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { MyContext } from "../../Components/context/contextProvider";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    CardContent,
    Button,
    Chip,
    Autocomplete,
    TextField,
} from "@mui/material";
import { useContext } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
const useQuery = () => new URLSearchParams(useLocation().search);

const AttendanceNewScreen = ({
    loadingOn,
    loadingOff
}) => {

    const storage = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;

    const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
    const getCurrentMonthYear = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
    };

    const initialValue = {
        From: getCurrentMonthYear(),
        To: getCurrentMonthYear(),
        EmpId: "0",
        Name: "ALL",
    };
    const query = useQuery();

    const defaultFilters = {
        From: getCurrentMonthYear(),
        To: getCurrentMonthYear()
    }

    const [saleOrders, setSaleOrders] = useState([]);
    const [viewMode, setViewMode] = useState('default');
    const [expandedDepartment, setExpandedDepartment] = useState([]);

    const [dropdownEmployees, setDropdownEmployees] = useState([]);
    const [reload, setReload] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const userTypeId = storage?.UserTypeId;
    const parseData = storage;
    const { contextObj } = useContext(MyContext);

    const [dropdownPlaceholder, setDropdownPlaceholder] = useState("ALL");
    const [filter, setFilter] = useState(initialValue);
    const [debouncedFilter, setDebouncedFilter] = useState(filter);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

        return () => clearTimeout(timer);
    }, [filter]);

    useEffect(() => {
        const { From, EmpId } = debouncedFilter;
        if (From && (EmpId || EmpId === 0)) {
            fetchAttendanceData(From, EmpId);
            fetchDropdownEmployees();
        }

    }, [debouncedFilter]);

    const getDaysInMonth = (monthYear) => {
        if (!monthYear) return 0;

        const [year, month] = monthYear.split('-');

        return new Date(year, month, 0).getDate();
    };

    const [filters, setFilters] = useState({
        FromDate: new Date().toISOString().split('T')[0],
        ToDate: new Date().toISOString().split('T')[0],
        Cancel_status: 0,
    });

    const toggleExpand = (department) => {
        if (expandedDepartment === department) {
            setExpandedDepartment(null);
        } else {
            setExpandedDepartment(department);
        }
    };
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const Add_Rights = contextObj?.Add_Rights;

    useEffect(() => {
        if (loadingOn) loadingOn();

        const today = new Date().toISOString().split('T')[0];
        const fromDate = filters.FromDate || today;
        const toDate = filters.ToDate || today;

        fetchLink({
            address: `empAttendance/departmentwise?FromDate=${fromDate}&ToDate=${toDate}`,
        })
            .then((data) => {
                if (data.success) {
                    setSaleOrders(data?.data);
                }
            })
            .catch((e) => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    }, [reload]);

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

    const handleSummaryDownload = async () => {
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
                    let sundayCount = 0;

                    while (currentDate <= endDateObj) {
                        const dateStr = new Date(currentDate).toISOString().split("T")[0];
                        allDays.push(dateStr);

                        if (currentDate.getDay() === 0) {
                            sundayCount++;
                        }

                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    if (allDays.length === 0) {
                        allDays.push("No days in this range");
                    }

                    return {
                        days: allDays,
                        sundayCount,
                        totalDays: allDays.length,
                    };
                };

                const { days: dateRange, sundayCount, totalDays } = getWorkingDays(startDate, endDate);

                let totalWorkingDaysSummary = 0;
                let totalLeaveDaysSummary = 0;

                const summaryData = overallData.map(row => {
                    const punchDetails = row.AttendanceDetails ? JSON.parse(row.AttendanceDetails) : [];
                    let totalWorkingDays = 0;
                    let totalLeaveDays = 0;

                    dateRange.forEach((date) => {
                        if (Array.isArray(punchDetails)) {
                            const detail = punchDetails.find(detail => detail.Date === date);

                            const isSunday = new Date(date).getDay() === 0;


                            if (isSunday) {
                                return;
                            }

                            if (detail) {
                                if (detail.AttendanceStatus === 'P') {
                                    totalWorkingDays++;
                                } else if (detail.AttendanceStatus === 'A') {
                                    totalLeaveDays++;
                                }
                            } else {
                                totalLeaveDays++;
                            }
                        }
                    });

                    totalWorkingDaysSummary += totalWorkingDays;
                    totalLeaveDaysSummary += totalLeaveDays;

                    return {
                        EmployeeName: row.Name,
                        EmployeeID: row.EmployeeID,
                        Month: `${month}-${year}`,
                        Branch: row.Branch,
                        NumberOfSundays: sundayCount,
                        NumberOfDaysInMonth: totalDays,
                        TotalWorkingDays: totalWorkingDays,
                        TotalLeaveDays: totalLeaveDays,
                    };
                });

                const exportData = summaryData.map(item => ({
                    EmployeeName: item.EmployeeName,
                    EmployeeID: item.EmployeeID,
                    Month: item.Month,
                    Branch: item.Branch,
                    NumberOfSundays: item.NumberOfSundays,
                    NumberOfDaysInMonth: item.NumberOfDaysInMonth,
                    TotalWorkingDays: item.TotalWorkingDays,
                    TotalLeaveDays: item.TotalLeaveDays,
                }));

                const ws = XLSX.utils.json_to_sheet(exportData);

                const headers = [
                    "EmployeeName",
                    "EmployeeID",
                    "Month",
                    "Branch",
                    "NumberOfSundays",
                    "NumberOfDaysInMonth",
                    "TotalWorkingDays",
                    "TotalLeaveDays",
                ];

                XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary Report");

                XLSX.writeFile(wb, "Attendance_Summary_Report.xlsx");
            }
        } catch (error) {
            console.error("Error downloading overall report:", error);
        }
    };

    const handleDownload = () => {
        const maxPunches = 6;

        const exportData = attendanceData.map(row => {

            const punchDetails = row.AttendanceDetails ? row.AttendanceDetails.split(',').map(detail => detail.trim()) : [];
            const punchColumns = {};

            let allPunchesEmpty = true;

            for (let i = 0; i < maxPunches; i++) {
                const punch = punchDetails[i] || '--';
                punchColumns[`Punch ${i + 1}`] = punch;

                if (punch !== '--') {
                    allPunchesEmpty = false;
                }
            }

            const attendanceStatus = allPunchesEmpty ? 'A' : 'P';

            return {
                Employee: row.username,
                "Log Date": formatAttendanceDate(row.LogDate),
                "Attendance Status": attendanceStatus,
                ...punchColumns,
            };
        });

        const columnsOrder = [
            "Employee",
            "Log Date",
            "Attendance Status",
            ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`)
        ];

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

    const MAX_PUNCHES = 6;

    const punchColumns = Array.from({ length: MAX_PUNCHES }, (_, index) => ({
        isCustomCell: true,
        ColumnHeader: `Punch ${index + 1}`,
        isVisible: 1,
        width: '13%',
        CellProps: {
            sx: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
            },
        },
        Cell: ({ row }) => {
            const punches = row.AttendanceDetails
                ? row.AttendanceDetails.split(',').map((p) => p.trim()).filter((p) => p !== '')
                : [];

            const punch = punches[index] || '--';
            const time = punch.split(' (')[0];

            return (
                time !== '--' ? (
                    <Chip
                        label={time}
                        variant="outlined"
                        size="small"
                        sx={{ color: 'green', margin: '2px' }}
                    />
                ) : (
                    <div style={{ color: 'gray' }}>--</div>
                )
            );
        },
    }));

    const formatAttendanceDate = (logDateTime) => {
        if (!logDateTime) return '--';
        const [date] = logDateTime.split('T');
        return `${date} `;
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
                    return {
                        days: allDays,
                        count: allDays.length,
                    };
                };

                const { days: dateRange } = getWorkingDays(startDate, endDate);

                const exportData = overallData.map(row => {
                    let punchDetails = [];
                    try {

                        punchDetails = row.AttendanceDetails ? JSON.parse(row.AttendanceDetails) : [];
                    } catch (error) {
                        console.error("Error parsing AttendanceDetails for employee:", row.username, error);
                        punchDetails = [];
                    }

                    const dailyAttendance = {};

                    let totalPresent = 0;

                    dateRange.forEach((date, index) => {
                        const isSunday = new Date(date).getDay() === 0;

                        if (isSunday) {
                            dailyAttendance[`Day ${index + 1}`] = 'H';
                        } else {
                            if (Array.isArray(punchDetails)) {
                                const detail = punchDetails.find(detail => detail.Date === date);

                                dailyAttendance[`Day ${index + 1}`] = detail ? detail.AttendanceStatus : 'A';

                                if (detail && detail.AttendanceStatus === 'P') {
                                    totalPresent++;
                                }
                            } else {
                                dailyAttendance[`Day ${index + 1}`] = 'A';
                            }
                        }
                    });

                    return {
                        EmployeeName: row.username || row.Name,
                        TotalPresent: totalPresent,
                        ...dailyAttendance,
                    };
                });

                const headers = [
                    "EmployeeName",
                    "TotalPresent",
                    ...dateRange.map((_, id) => `Day ${id + 1}`),
                ];

                const ws = XLSX.utils.json_to_sheet(exportData);
                XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Overall Attendance Report");

                XLSX.writeFile(wb, "Overall_Attendance_Report.xlsx");
            }
        } catch (error) {
            console.error("Error downloading overall report:", error);
        }
    };

    const handleOverallWithPunch = () => {
        const maxPunches = 6;

        const filteredAttendanceData = attendanceData.filter((row) => {

            const isUserSelected = selectedEmployees.some(
                (user) => Number(user.UserId) === Number(row.User_Mgt_Id) || user.UserId === 'ALL'
            );
            return isUserSelected;
        });

        const groupedData = filteredAttendanceData.reduce((acc, row) => {
            const username = row.username;
            if (!acc[username]) {
                acc[username] = [];
            }
            acc[username].push(row);
            return acc;
        }, {});

        if (Object.keys(groupedData).length === 0) {
            toast.error("No attendance data found")
            return;
        }

        const wb = XLSX.utils.book_new();

        const firstLogDate = filteredAttendanceData[0]?.LogDate;
        if (!firstLogDate) {
            console.error("No log date found in the filtered attendance data.");
            return;
        }

        const date = new Date(firstLogDate);
        const year = date.getFullYear();
        const month = date.toLocaleString("default", { month: "long" });

        Object.entries(groupedData).forEach(([username, userAttendance]) => {
            const exportData = userAttendance.map((row) => {

                const punchDetails = row.AttendanceDetails
                    ? row.AttendanceDetails.split(',').map((detail) => detail.trim())
                    : [];

                const punchColumns = {};
                let allPunchesEmpty = true;

                for (let i = 0; i < maxPunches; i++) {
                    const punch = punchDetails[i] || '--';
                    punchColumns[`Punch ${i + 1}`] = punch;

                    if (punch !== '--') {
                        allPunchesEmpty = false;
                    }
                }

                const attendanceStatus = allPunchesEmpty ? 'A' : 'P';

                return {
                    Employee: row.username,
                    "Log Date": formatAttendanceDate(row.LogDate),
                    "Attendance Status": attendanceStatus,
                    ...punchColumns,
                };
            });

            const columnsOrder = [
                "Employee",
                "Log Date",
                "Attendance Status",
                ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`),
            ];

            const reorderedData = exportData.map((row) =>
                columnsOrder.reduce((acc, col) => {
                    acc[col] = row[col] || '--';
                    return acc;
                }, {})
            );

            const sheetName = username.slice(0, 31);
            const ws = XLSX.utils.json_to_sheet(reorderedData);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        const fileName = `Attendance_Report_${month}_${year}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

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
    }, [storage?.UserTypeId, storage?.UserId, storage?.Company_id, storage?.Name, reload]);

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

    useEffect(() => {
        const queryFilters = {
            FromDate:
                query.get("FromDate") && isValidDate(query.get("FromDate"))
                    ? query.get("FromDate")
                    : defaultFilters.Fromdate,
            ToDate:
                query.get("ToDate") && isValidDate(query.get("ToDate"))
                    ? query.get("ToDate")
                    : defaultFilters.Todate,
        };
        setFilters((pre) => ({
            ...pre,
            FromDate: queryFilters.FromDate,
            ToDate: queryFilters.ToDate,
        }));
    }, [location.search]);

    useEffect(() => {
        const FromDate =
            stateDetails?.FromDate && isValidDate(stateDetails?.FromDate)
                ? ISOString(stateDetails?.FromDate)
                : null;
        const ToDate =
            stateDetails?.ToDate && isValidDate(stateDetails?.ToDate)
                ? ISOString(stateDetails?.ToDate)
                : null;
        if (FromDate && ToDate) {
            updateQueryString({ FromDate, ToDate });
            setFilters((pre) => ({
                ...pre,
                FromDate: ISOString(stateDetails.FromDate),
                ToDate: stateDetails.ToDate,
            }));
            setReload((pre) => !pre);
        }
    }, [stateDetails]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const handleAddEmployeeClose = () => {
        setAddEmployeeDialogOpen(false);
    };

    const data = () => setViewMode('employee');
    const dataDepartment = () => setViewMode('department');
    // const dashboard=()=>setViewMode('default')

    const dashboard = () => {
        setFilters((prev) => ({
            ...prev,
            FromDate: prev.FromDate || new Date().toISOString().split('T')[0],
            ToDate: prev.ToDate || new Date().toISOString().split('T')[0],
        }));
        setViewMode('default');
    };

    const ExpendableComponent = ({ row }) => {
        const departments =
            typeof row.DepartmentWiseCounts === "string"
                ? JSON.parse(row.DepartmentWiseCounts)
                : row.DepartmentWiseCounts;

        return (
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px",
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            Department Name
                        </th>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            TotalMaleEmployees
                        </th>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            TotalFemaleEmployees
                        </th>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            Total Employees
                        </th>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            TotalMalePresentToday
                        </th>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            TotalFemalePresentToday
                        </th>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "left",
                            }}
                        >
                            TotalPresentToday
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {departments && departments.length > 0 ? (
                        departments.map((data, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    onClick={() => toggleExpand(data.Department)}

                                >
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.Department || "-"}

                                    </td>
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.TotalMaleEmployees || "-"}
                                    </td>
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.TotalFemaleEmployees || "-"}
                                    </td>
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.TotalEmployees || "-"}
                                    </td>
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.TotalMalePresentToday || "-"}
                                    </td>
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.TotalFemalePresentToday || "-"}
                                    </td>
                                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                        {data?.TotalPresentToday || "-"}
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ padding: "8px" }}>
                                No Departments Available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    };

    const handleRefresh = () => {
        if (loadingOn) loadingOn();

        const userTypeId = storage?.UserTypeId;
        const userId = storage?.UserId;
        const companyId = storage?.Company_id;

        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${companyId}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('Autheticate_Id')}`,
            }
        })
            .then(data => {
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
            })
            .catch(e => console.error("Error fetching employees:", e))
            .finally(() => {
                if (loadingOff) loadingOff();
                setReload(prev => !prev);
            });
    };

    const handleRefreshData = () => {
        window.location.reload()
    }

    const ExpendableComponent1 = ({ row }) => {
        let departments = [];
        let monthlyAttendance = [];

        try {
            departments =
                typeof row.Employees === "string"
                    ? JSON.parse(row.Employees)
                    : row.Employees || [];

            monthlyAttendance =
                typeof row.MonthlyAverageAttendance === "string"
                    ? JSON.parse(row.MonthlyAverageAttendance)
                    : row.MonthlyAverageAttendance || [];
        } catch (err) {
            departments = [];
            monthlyAttendance = [];
        }

        const currentYear = new Date().getFullYear();

        const monthList = [
            { name: "January", number: 1 },
            { name: "February", number: 2 },
            { name: "March", number: 3 },
            { name: "April", number: 4 },
            { name: "May", number: 5 },
            { name: "June", number: 6 },
            { name: "July", number: 7 },
            { name: "August", number: 8 },
            { name: "September", number: 9 },
            { name: "October", number: 10 },
            { name: "November", number: 11 },
            { name: "December", number: 12 },
        ];

        const attendanceMap = new Map();
        monthlyAttendance.forEach((item) => {

            const key = `${item.MonthNumber}-${item.YearNumber}`;
            attendanceMap.set(key, item.UniqueEmployeeDays ?? 0);
        });

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "20px" }}>

                    <table
                        style={{
                            width: "60%",
                            borderCollapse: "collapse",
                            border: "1px solid #ccc",
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: "#f0f0f0" }}>
                                <th
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "5px",
                                        textAlign: "left",
                                    }}
                                >
                                    Emp_Name
                                </th>
                                <th
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "8px",
                                        textAlign: "left",
                                    }}
                                >
                                    Sex
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments && departments.length > 0 ? (
                                departments.map((data, index) => (
                                    <tr key={index}>
                                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                            {data?.Emp_Name || "-"}
                                        </td>
                                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                            {data?.Sex || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" style={{ padding: "8px" }}>
                                        No Employees Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div
                        style={{
                            flex: "1",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            padding: "10px",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <h3 style={{ textAlign: "center" }}>Months & Attendance</h3>
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            {monthList.map((month) => {
                                const key = `${month.number}-${currentYear}`;
                                const uniqueEmployeeDays = attendanceMap.get(key) ?? 0;

                                return (
                                    <div
                                        key={month.number}
                                        style={{
                                            minWidth: "100px",
                                            padding: "8px",
                                            backgroundColor: "#f0f0f0",
                                            color: "black",
                                            borderRadius: "4px",
                                            textAlign: "center",
                                            userSelect: "none",
                                        }}
                                    >
                                        <div style={{ fontWeight: "bold" }}>
                                            {month.name} {currentYear}
                                        </div>
                                        <div
                                            style={{
                                                marginTop: "6px",
                                                fontSize: "14px",
                                                color: "#555",
                                            }}
                                        >
                                            {uniqueEmployeeDays}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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

    useEffect(() => {
        const companyId = storage?.Company_id;

        fetchLink({
            address: `empAttendance/department?Company_id=${companyId}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
            },
        })
            .then((data) => {
                if (data.success) {
                    if (data.others && data.others.department) {
                        const deptOptions = data.others.department.map((dept) => ({
                            value: dept.value,
                            label: dept.label,
                        }));
                        setDepartments(deptOptions);
                    }
                }
            })
            .catch((e) => console.error("Error fetching departments:", e));
    }, [storage?.Company_id, reload]);

    const handleDepartmentChange = (selected) => {
        setSelectedDepartment(selected);

        setEmployees([]);
        setSelectedEmployee(null);

        if (selected) {
            fetchLink({
                address: `empAttendance/employeesByDepartment`,
                method: "POST",
                bodyData: { department: selected.value },
            })
                .then((data) => {
                    if (data.success && data.others?.employees) {
                        const employeeOptions = data.others.employees.map((emp) => ({
                            value: emp.id || emp.value || emp.Emp_Id,
                            label: emp.name || emp.label || emp.Emp_Name,
                        }));

                        setEmployees(employeeOptions);
                    } else {
                        setEmployees([]);
                    }
                })
                .catch((e) => {
                    console.error("Error fetching employees:", e);
                    setEmployees([]);
                });
        } else {
            setEmployees([]);
        }
    };

    const departmentWiseCounts = React.useMemo(() => {
        if (!saleOrders?.[0]?.DepartmentWiseCounts) return [];
        try {
            const parsed = JSON.parse(saleOrders[0].DepartmentWiseCounts);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error("Failed to parse DepartmentWiseCounts JSON:", err);
            return [];
        }
    }, [saleOrders]);

    const filteredData = React.useMemo(() => {
        if (!departmentWiseCounts.length) return [];

        const filteredDepartments = departmentWiseCounts.filter(item => {
            return selectedDepartment ? item.Department === selectedDepartment.label : true;
        });

        return filteredDepartments.map(dept => {
            const filteredEmployees = selectedEmployee
                ? dept.Employees.filter(emp => {
                    if (!emp.Emp_Name) return false;
                    return emp.Emp_Name.trim().toLowerCase() === selectedEmployee.label.trim().toLowerCase();
                })
                : dept.Employees;

            return {
                ...dept,
                Employees: filteredEmployees
            };
        });
    }, [departmentWiseCounts, selectedDepartment, selectedEmployee]);

    return (
        <>
            {Number(userTypeId) === 0 || Number(userTypeId) === 1 ? (

                <>
                    {viewMode === 'default' && (
                        <FilterableTable
                            title={
                                <div className="d-flex align-items-center">
                                    <Button
                                        size="small mx-2"
                                        variant="outlined"
                                        disabled
                                        onClick={() => dashboard()}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        size="small mx-2"
                                        variant="outlined"
                                        onClick={() => data()}
                                    >
                                        Employee
                                    </Button>
                                    <Button
                                        size="small mx-2"
                                        variant="outlined"
                                        onClick={() => dataDepartment()}
                                    >
                                        Department
                                    </Button>

                                    <div className="d-flex align-items-center justify-content-start gap-3">
                                        <label>From Date</label>
                                        <input
                                            type="date"
                                            onChange={e => setFilters({ ...filters, FromDate: e.target.value })}
                                            value={filters?.FromDate}
                                            className="cus-inpt w-auto p-1"
                                        />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-start gap-3">
                                        <label>To Date</label>
                                        <input
                                            type="date"
                                            onChange={e => setFilters({ ...filters, ToDate: e.target.value })}
                                            value={filters?.ToDate}
                                            className="cus-inpt w-auto p-1"
                                        />
                                    </div>

                                    <div className="p-1">
                                        <IconButton
                                            onClick={() => setReload(!reload)}
                                            variant="outlined"
                                            size="small"
                                        >
                                            <Search />
                                        </IconButton>
                                    </div>
                                </div>
                            }
                            dataArray={saleOrders}
                            EnableSerialNumber
                            columns={[
                                createCol("TotalDepartments", "string", "Department"),
                                createCol("TotalMaleEmployees", "number", "Total Male Employees"),
                                createCol("TotalFemaleEmployees", "number", "Total Female Employees"),
                                createCol("TotalEmployees", "number", "Total Employees"),
                                createCol("TotalMalePresentToday", "number", "Total Male Present Today"),
                                createCol("TotalFemalePresentToday", "number", "Total Female Present Today"),
                                createCol("TotalPresentToday", "number", "Total Present Today"),
                            ]}
                            isExpendable={true}
                            tableMaxHeight={550}
                            expandableComp={ExpendableComponent}
                        />
                    )}

                    {viewMode === 'employee' && (
                        <>
                            <Dialog
                                open={addEmployeeDialogOpen}
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
                                        <h6 className="fa-18">
                                            <Button size="small mx-2" variant="outlined" onClick={() => dashboard()}>
                                                Dashboard
                                            </Button>
                                            <Button size="small mx-2" variant="outlined" disabled onClick={() => data()}>
                                                EMPLOYEE
                                            </Button>
                                            <Button size="small mx-2" variant="outlined" onClick={() => dataDepartment()}>
                                                Department
                                            </Button>
                                        </h6>

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
                                                }}
                                            >
                                                Cummulative Monthly Report
                                            </Button>
                                            <Button
                                                onClick={handleSummaryDownload}
                                            >
                                                Summary
                                            </Button>
                                        </div>
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
                                        <div className="col-auto p-2 d-flex align-items-center">
                                            <button
                                                className="btn btn-link ms-2 p-0 mt-3"
                                                onClick={handleRefresh}
                                                title="Refresh Departments & Employees"
                                            >
                                                <Refresh fontSize="medium" />
                                            </button>

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
                                            ...punchColumns
                                        ]}
                                        EnableSerialNumber
                                        CellSize="small"
                                        disablePagination={false}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {viewMode === 'department' && (
                        <>
                            {(() => {
                                let departmentWiseCounts = [];
                                const countsStr = saleOrders?.[0]?.DepartmentWiseCounts;

                                if (countsStr) {
                                    try {
                                        const parsed = JSON.parse(countsStr);
                                        departmentWiseCounts = Array.isArray(parsed) ? parsed : [];
                                    } catch (err) {
                                        console.error("Failed to parse DepartmentWiseCounts JSON:", err);
                                    }
                                }

                                return (
                                    <>
                                        <FilterableTable
                                            title={
                                                <div className="d-flex flex-column">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <Button
                                                            size="small mx-2"
                                                            variant="outlined"
                                                            onClick={() => dashboard()}
                                                        >
                                                            Dashboard
                                                        </Button>
                                                        <Button
                                                            size="small mx-2"
                                                            variant="outlined"
                                                            onClick={() => data()}
                                                        >
                                                            Employee
                                                        </Button>
                                                        <Button
                                                            size="small mx-2"
                                                            variant="outlined"
                                                            disabled
                                                            onClick={() => dataDepartment()}
                                                        >
                                                            Department
                                                        </Button>
                                                    </div>

                                                    <div className="row align-items-end">
                                                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                                            <label>Department</label>
                                                            <Select
                                                                options={departments}
                                                                isSearchable
                                                                placeholder="ALL"
                                                                value={selectedDepartment}
                                                                styles={customSelectStyles}
                                                                onChange={handleDepartmentChange}
                                                            />
                                                        </div>

                                                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                                            <label>Employee</label>
                                                            <Select
                                                                options={employees}
                                                                isSearchable
                                                                placeholder="ALL"
                                                                value={selectedEmployee}
                                                                styles={customSelectStyles}
                                                                onChange={setSelectedEmployee}
                                                                isDisabled={!selectedDepartment}
                                                            />
                                                        </div>

                                                        <div className="col-auto p-2 d-flex align-items-center">
                                                            <button
                                                                className="btn btn-link ms-2 p-0 mb-2"
                                                                onClick={handleRefreshData}
                                                                style={{ minWidth: '24px' }}
                                                                title="Refresh Departments & Employees"
                                                            >
                                                                <Refresh fontSize="small" />
                                                            </button>

                                                        </div>
                                                    </div>

                                                </div>
                                            }
                                            dataArray={filteredData}
                                            EnableSerialNumber
                                            columns={[
                                                createCol("Department", "string", "Department"),
                                                createCol("TotalMaleEmployees", "number", "Total Male Employees"),
                                                createCol("TotalFemaleEmployees", "number", "Total Female Employees"),
                                                createCol("TotalEmployees", "number", "Total Employees"),
                                                createCol("TotalMalePresentToday", "number", "Total Male Present Today"),
                                                createCol("TotalFemalePresentToday", "number", "Total Female Present Today"),
                                                createCol("TotalPresentToday", "number", "Total Present Today"),
                                            ]}
                                            isExpendable={true}
                                            tableMaxHeight={550}
                                            expandableComp={ExpendableComponent1}
                                        />
                                    </>
                                );
                            })()}
                        </>
                    )}
                </>
            ) :
                (

                    (
                        <>
                            <Dialog
                                open={addEmployeeDialogOpen}
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
                                        value={
                                            selectedEmployees.some((user) => user.UserId === 'all')
                                                ? [{ UserId: 'all', Name: 'ALL' }]
                                                : selectedEmployees
                                        }
                                        onChange={(event, value) => {
                                            if (value.some((selected) => selected.UserId === 'all')) {
                                                setSelectedEmployees(dropdownEmployees);
                                            } else {
                                                const uniqueValues = value.filter(
                                                    (val, index, self) => index === self.findIndex((t) => t.UserId === val.UserId)
                                                );
                                                setSelectedEmployees(uniqueValues);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Employees" />
                                        )}
                                    />
                                </DialogContent>
                                <DialogActions className="d-flex justify-content-between flex-wrap">
                                    <Button variant="outlined" onClick={() => setSelectedEmployees([])}>
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
                                        <h6 className="fa-18">

                                            <Button size="small" variant="outlined" className="mx-2" >
                                                EMPLOYEE
                                            </Button>

                                        </h6>

                                        {(userTypeId === 1 || userTypeId === 0) && (
                                            <div className="d-flex align-items-center justify-content-start gap-3">
                                                <Button
                                                    onClick={handleDownload}
                                                    variant="contained"
                                                    disabled={filter?.EmpId === 0 || filter?.Name === 'ALL'}
                                                >
                                                    Individual Report
                                                </Button>
                                                <Button onClick={() => handleOverallDownload(filter?.From, filter?.To)}>
                                                    Monthly Report
                                                </Button>
                                                <Button onClick={() => setAddEmployeeDialogOpen(true)}>
                                                    Cumulative Monthly Report
                                                </Button>
                                                <Button onClick={handleSummaryDownload}>
                                                    Summary
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-2 row mb-4">
                                        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                            <label>Employee</label>
                                            <Select
                                                value={{ value: filter?.EmpId, label: filter?.Name }}
                                                onChange={(e) => setFilter({ ...filter, EmpId: e.value, Name: e.label })}
                                                options={[
                                                    { value: 0, label: 'ALL' },
                                                    ...employees.map((obj) => ({ value: obj.UserId, label: obj.Name })),
                                                ]}
                                                styles={customSelectStyles}
                                                isSearchable
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
                                            ...punchColumns,
                                        ]}
                                        EnableSerialNumber
                                        CellSize="small"
                                        disablePagination={false}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )
                )
            }
        </>
    )
}
export default AttendanceNewScreen;



// import React, { useState, useEffect } from "react";
// import {
//     Card, CardContent, Button, Chip, Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Autocomplete,
//     TextField,
// } from "@mui/material";
// import Select from "react-select";
// import { customSelectStyles } from "../../Components/tablecolumn";
// import { fetchLink } from '../../Components/fetchComponent';
// import FilterableTable from "../../Components/filterableTable2";
// import * as XLSX from 'xlsx';
// import { MyContext } from "../../Components/context/contextProvider";
// import { useContext } from "react";
// import { toast } from "react-toastify";

// const FingerPrintAttendanceReport = (loadingOn, loadingOff) => {

//     const [loading, setLoading] = useState(true);
//     const storage = JSON.parse(localStorage.getItem('user'));

//     const userTypeId = storage?.UserTypeId;
//     const parseData = storage;
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [dropdownEmployees, setDropdownEmployees] = useState([]);
//     const { contextObj } = useContext(MyContext);
//     const [selectedEmployees, setSelectedEmployees] = useState([]);
//     const Add_Rights = contextObj?.Add_Rights;


//     const getCurrentMonthYear = () => {
//         const date = new Date();
//         const year = date.getFullYear();
//         const month = (date.getMonth() + 1).toString().padStart(2, '0');
//         return `${year}-${month}`;
//     };

//     const handleAddEmployeeClose = () => {
//         setAddEmployeeDialogOpen(false);

//     };

//     const initialValue = {
//         From: getCurrentMonthYear(),
//         To: getCurrentMonthYear(),
//         EmpId: 0,
//         Name: '',
//     };

//     const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
//     const [filter, setFilter] = useState(initialValue);
//     const [employees, setEmployees] = useState([]);
//     const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
//     const [dropdownPlaceholder, setDropdownPlaceholder] = useState("ALL");
//     const [debouncedFilter, setDebouncedFilter] = useState(filter);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setDebouncedFilter(filter);
//         }, 500);

//         return () => clearTimeout(timer);
//     }, [filter]);

//     useEffect(() => {
//         const userTypeId = storage?.UserTypeId;
//         const userId = storage?.UserId;
//         const companyId = storage?.Company_id;

//         fetchLink({
//             address: `masters/users/employee/dropDown?Company_id=${companyId}`,
//             headers: {
//                 Authorization: `Bearer ${localStorage.getItem('Autheticate_Id')}`,
//             }
//         }).then(data => {
//             if (data.success) {
//                 let filteredEmployees = [];

//                 if (Number(userTypeId) === 1 || Number(userTypeId) === 0 || Number(Add_Rights) === 1) {
//                     filteredEmployees = data.data;
//                     setFilter(prev => ({ ...prev, EmpId: 0, Name: 'ALL' }));
//                     setIsDropdownDisabled(false);
//                     setDropdownPlaceholder("ALL");
//                 } else {
//                     filteredEmployees = data.data.filter(employee => employee.UserId === userId);
//                     setFilter(prev => ({ ...prev, EmpId: userId, Name: storage?.Name }));
//                     setIsDropdownDisabled(true);
//                     setDropdownPlaceholder(storage?.Name);
//                 }

//                 setEmployees(filteredEmployees);
//             }
//         }).catch(e => console.error("Error fetching employees:", e));
//     }, [storage?.UserTypeId, storage?.UserId, storage?.Company_id, storage?.Name]);

//     const fetchAttendanceData = async (From, EmpId) => {
//         try {
//             const userTypeId = storage?.UserTypeId;
//             const [year, month] = From.split("-");

//             const startDate = `${year}-${month}-01`;

//             const dayCount = getDaysInMonth(`${year}-${month}`);

//             const endDate = `${year}-${month}-${dayCount}`;

//             const response = await fetchLink({
//                 address: `userModule/employeActivity/trackActivitylogAttendance?FromDate=${startDate}&ToDate=${endDate}&UserTypeId=${userTypeId}&UserId=${EmpId}`,
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('Autheticate_Id')}`,
//                 },
//             });

//             if (response.success) {
//                 setAttendanceData(response.data);
//             }
//         } catch (e) {

//             console.error("Error fetching attendance data:", e);
//         }
//     };

//     const handleOverallDownload = async () => {
//         try {
//             const fromDate = filter.From;
//             const [year, month] = fromDate.split("-");
//             const startDate = `${year}-${month}-01`;
//             const dayCount = getDaysInMonth(`${year}-${month}`);
//             const endDate = `${year}-${month}-${dayCount}`;
//             const response = await fetchLink({
//                 address: `userModule/employeActivity/employeeAttendanceModuledownload?FromDate=${startDate}&ToDate=${endDate}`,
//             });

//             if (response.success) {
//                 const overallData = response.data;
//                 console.log("overalldata", overallData);

//                 const getWorkingDays = (fromDate, endDate) => {
//                     const allDays = [];
//                     const currentDate = new Date(fromDate);
//                     const endDateObj = new Date(endDate);

//                     while (currentDate <= endDateObj) {
//                         allDays.push(new Date(currentDate).toISOString().split("T")[0]);
//                         currentDate.setDate(currentDate.getDate() + 1);
//                     }
//                     return {
//                         days: allDays,
//                         count: allDays.length,
//                     };
//                 };

//                 const { days: dateRange } = getWorkingDays(startDate, endDate);

//                 const exportData = overallData.map(row => {
//                     let punchDetails = [];
//                     try {

//                         punchDetails = row.AttendanceDetails ? JSON.parse(row.AttendanceDetails) : [];
//                     } catch (error) {
//                         console.error("Error parsing AttendanceDetails for employee:", row.username, error);
//                         punchDetails = []; 
//                     }

//                     const dailyAttendance = {};

//                     let totalPresent = 0;

//                     dateRange.forEach((date, index) => {
//                         const isSunday = new Date(date).getDay() === 0;

//                         if (isSunday) {
//                             dailyAttendance[`Day ${index + 1}`] = 'H';
//                         } else {
//                             if (Array.isArray(punchDetails)) {
//                                 const detail = punchDetails.find(detail => detail.Date === date);


//                                 dailyAttendance[`Day ${index + 1}`] = detail ? detail.AttendanceStatus : 'A';


//                                 if (detail && detail.AttendanceStatus === 'P') {
//                                     totalPresent++;
//                                 }
//                             } else {

//                                 dailyAttendance[`Day ${index + 1}`] = 'A';
//                             }
//                         }
//                     });

//                     return {
//                         EmployeeName: row.username || row.Name,
//                         TotalPresent: totalPresent, 
//                         ...dailyAttendance,
//                     };
//                 });


//                 const headers = [
//                     "EmployeeName",
//                     "TotalPresent",
//                     ...dateRange.map((_, id) => `Day ${id + 1}`),
//                 ];


//                 const ws = XLSX.utils.json_to_sheet(exportData);
//                 XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });


//                 const wb = XLSX.utils.book_new();
//                 XLSX.utils.book_append_sheet(wb, ws, "Overall Attendance Report");


//                 XLSX.writeFile(wb, "Overall_Attendance_Report.xlsx");
//             }
//         } catch (error) {
//             console.error("Error downloading overall report:", error);
//         }
//     };
//     const getDaysInMonth = (monthYear) => {
//         if (!monthYear) return 0;

//         const [year, month] = monthYear.split('-');

//         return new Date(year, month, 0).getDate();
//     };

//     useEffect(() => {
//         const { From, EmpId } = debouncedFilter;
//         if (From && (EmpId || EmpId === 0)) {
//             fetchAttendanceData(From, EmpId);
//             fetchDropdownEmployees();
//         }

//     }, [debouncedFilter]);

//     const fetchDropdownEmployees = async () => {
//         setLoading(true);
//         try {
//             const data = await fetchLink({
//                 address: `masters/Employeedetails/dropDown?Company_id=${parseData.Company_id}`,
//             });
//             if (data.success) {
//                 setDropdownEmployees(data.data);
//             }
//         } catch (e) {
//             console.error(e);
//             toast.error("Failed to fetch employees for dropdown");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFromChange = (e) => {
//         const getDaysInMonth = (monthYear) => {
//             if (!monthYear) return 0;

//             const [year, month] = monthYear.split('-');

//             return new Date(year, month, 0).getDate();
//         };
//         const selectedMonth = e.target.value;
//         const [year, month] = selectedMonth.split("-");
//         const startDate = `${year}-${month}-01`;
//         const dayCount = getDaysInMonth(`${year}-${month}`);
//         const endDate = `${year}-${month}-${dayCount}`;

//         setFilter({
//             From: startDate,
//             To: endDate,
//             EmpId: filter.EmpId || 0,
//             Name: filter?.Name,
//         });
//     };

//     const handleDownload = () => {
//         const maxPunches = 6;

//         const exportData = attendanceData.map(row => {

//             const punchDetails = row.AttendanceDetails ? row.AttendanceDetails.split(',').map(detail => detail.trim()) : [];
//             const punchColumns = {};


//             let allPunchesEmpty = true;

//             for (let i = 0; i < maxPunches; i++) {
//                 const punch = punchDetails[i] || '--';
//                 punchColumns[`Punch ${i + 1}`] = punch;

//                 if (punch !== '--') {
//                     allPunchesEmpty = false;
//                 }
//             }

//             const attendanceStatus = allPunchesEmpty ? 'A' : 'P';


//             return {
//                 Employee: row.username,
//                 "Log Date": formatAttendanceDate(row.LogDate),
//                 "Attendance Status": attendanceStatus,
//                 ...punchColumns,
//             };
//         });


//         const columnsOrder = [
//             "Employee",
//             "Log Date",
//             "Attendance Status",
//             ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`)
//         ];

//         const reorderedData = exportData.map(row =>
//             columnsOrder.reduce((acc, col) => {
//                 acc[col] = row[col] || '--';
//                 return acc;
//             }, {})
//         );
//         const ws = XLSX.utils.json_to_sheet(reorderedData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

//         XLSX.writeFile(wb, "Attendance_Report.xlsx");
//     };

//     const formatAttendanceDate = (logDateTime) => {
//         if (!logDateTime) return '--';
//         const [date] = logDateTime.split('T');
//         return `${date} `;
//     };

//     const handleOverallWithPunch = () => {
//         const maxPunches = 6;

//         const filteredAttendanceData = attendanceData.filter((row) => {

//           const isUserSelected = selectedEmployees.some(
//             (user) => Number(user.UserId) === Number(row.User_Mgt_Id) || user.UserId === 'ALL'
//           );
//           return isUserSelected;
//         });

//         const groupedData = filteredAttendanceData.reduce((acc, row) => {
//           const username = row.username;
//           if (!acc[username]) {
//             acc[username] = [];
//           }
//           acc[username].push(row);
//           return acc;
//         }, {});

//         if (Object.keys(groupedData).length === 0) {
//             toast.error("No attendance data found")
//           return;
//         }

//         const wb = XLSX.utils.book_new();

//         const firstLogDate = filteredAttendanceData[0]?.LogDate;
//         if (!firstLogDate) {
//           console.error("No log date found in the filtered attendance data.");
//           return;
//         }

//         const date = new Date(firstLogDate);
//         const year = date.getFullYear();
//         const month = date.toLocaleString("default", { month: "long" });

//         Object.entries(groupedData).forEach(([username, userAttendance]) => {
//           const exportData = userAttendance.map((row) => {

//             const punchDetails = row.AttendanceDetails
//               ? row.AttendanceDetails.split(',').map((detail) => detail.trim())
//               : [];

//             const punchColumns = {};
//             let allPunchesEmpty = true;

//             for (let i = 0; i < maxPunches; i++) {
//               const punch = punchDetails[i] || '--';
//               punchColumns[`Punch ${i + 1}`] = punch;

//               if (punch !== '--') {
//                 allPunchesEmpty = false;
//               }
//             }


//             const attendanceStatus = allPunchesEmpty ? 'A' : 'P';

//             return {
//               Employee: row.username,
//               "Log Date": formatAttendanceDate(row.LogDate),
//               "Attendance Status": attendanceStatus,
//               ...punchColumns,
//             };
//           });


//           const columnsOrder = [
//             "Employee",
//             "Log Date",
//             "Attendance Status",
//             ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`),
//           ];

//           const reorderedData = exportData.map((row) =>
//             columnsOrder.reduce((acc, col) => {
//               acc[col] = row[col] || '--';
//               return acc;
//             }, {})
//           );

//           const sheetName = username.slice(0, 31); 
//           const ws = XLSX.utils.json_to_sheet(reorderedData);
//           XLSX.utils.book_append_sheet(wb, ws, sheetName);
//         });


//         const fileName = `Attendance_Report_${month}_${year}.xlsx`;
//         XLSX.writeFile(wb, fileName);
//       };

//     const handleSummaryDownload = async () => {
//         try {
//             const fromDate = filter.From;
//             const [year, month] = fromDate.split("-");
//             const startDate = `${year}-${month}-01`;
//             const dayCount = getDaysInMonth(`${year}-${month}`);
//             const endDate = `${year}-${month}-${dayCount}`;

//             const response = await fetchLink({
//                 address: `userModule/employeActivity/employeeAttendanceModuledownload?FromDate=${startDate}&ToDate=${endDate}`,
//             });

//             if (response.success) {
//                 const overallData = response.data;
//                 const getWorkingDays = (fromDate, endDate) => {
//                     const allDays = [];
//                     const currentDate = new Date(fromDate);
//                     const endDateObj = new Date(endDate);
//                     let sundayCount = 0;

//                     while (currentDate <= endDateObj) {
//                         const dateStr = new Date(currentDate).toISOString().split("T")[0];
//                         allDays.push(dateStr);

//                         if (currentDate.getDay() === 0) {
//                             sundayCount++;
//                         }

//                         currentDate.setDate(currentDate.getDate() + 1);
//                     }

//                     if (allDays.length === 0) {
//                         allDays.push("No days in this range");
//                     }

//                     return {
//                         days: allDays,
//                         sundayCount,
//                         totalDays: allDays.length,
//                     };
//                 };

//                 const { days: dateRange, sundayCount, totalDays } = getWorkingDays(startDate, endDate);

//                 let totalWorkingDaysSummary = 0;
//                 let totalLeaveDaysSummary = 0;

//                 const summaryData = overallData.map(row => {
//                     const punchDetails = row.AttendanceDetails ? JSON.parse(row.AttendanceDetails) : [];
//                     let totalWorkingDays = 0;
//                     let totalLeaveDays = 0;

//                     dateRange.forEach((date) => {
//                         if (Array.isArray(punchDetails)) {
//                             const detail = punchDetails.find(detail => detail.Date === date);

//                             const isSunday = new Date(date).getDay() === 0;


//                             if (isSunday) {
//                                 return; 
//                             }

//                             if (detail) {
//                                 if (detail.AttendanceStatus === 'P') {
//                                     totalWorkingDays++;
//                                 } else if (detail.AttendanceStatus === 'A') {
//                                     totalLeaveDays++;
//                                 }
//                             } else {
//                                 totalLeaveDays++;
//                             }
//                         }
//                     });

//                     totalWorkingDaysSummary += totalWorkingDays;
//                     totalLeaveDaysSummary += totalLeaveDays;

//                     return {
//                         EmployeeName: row.Name,
//                         EmployeeID: row.EmployeeID,
//                         Month: `${month}-${year}`,
//                         Branch: row.Branch,
//                         NumberOfSundays: sundayCount,
//                         NumberOfDaysInMonth: totalDays,
//                         TotalWorkingDays: totalWorkingDays,
//                         TotalLeaveDays: totalLeaveDays,
//                     };
//                 });

//                 const exportData = summaryData.map(item => ({
//                     EmployeeName: item.EmployeeName,
//                     EmployeeID: item.EmployeeID,
//                     Month: item.Month,
//                     Branch: item.Branch,
//                     NumberOfSundays: item.NumberOfSundays,
//                     NumberOfDaysInMonth: item.NumberOfDaysInMonth,
//                     TotalWorkingDays: item.TotalWorkingDays,
//                     TotalLeaveDays: item.TotalLeaveDays,
//                 }));

//                 const ws = XLSX.utils.json_to_sheet(exportData);

//                 const headers = [
//                     "EmployeeName",
//                     "EmployeeID",
//                     "Month",
//                     "Branch",
//                     "NumberOfSundays",
//                     "NumberOfDaysInMonth",
//                     "TotalWorkingDays",
//                     "TotalLeaveDays",
//                 ];

//                 XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

//                 const wb = XLSX.utils.book_new();
//                 XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary Report");


//                 XLSX.writeFile(wb, "Attendance_Summary_Report.xlsx");
//             }
//         } catch (error) {
//             console.error("Error downloading overall report:", error);
//         }
//     };

//     return (
//         <>
//             <Dialog
//                 open={addEmployeeDialogOpen}
//                 // onClose={handleAddEmployeeClose}
//                 maxWidth="md"
//                 PaperProps={{
//                     style: { width: '500px', height: '500px' },
//                 }}
//             >
//                 <DialogTitle>Add Employee</DialogTitle>
//                 <DialogContent>
//                     <Autocomplete
//                         multiple
//                         options={[{ UserId: 'all', Name: 'ALL' }, ...dropdownEmployees]}
//                         getOptionLabel={(option) => option.Name}
//                         isOptionEqualToValue={(option, value) => option.UserId === value.UserId}
//                         onChange={(event, value) => {
//                             if (value.some((selected) => selected.UserId === 'all')) {
//                                 setSelectedEmployees(dropdownEmployees);
//                             } else {
//                                 const uniqueValues = value.filter((val, index, self) =>
//                                     index === self.findIndex((t) => t.UserId === val.UserId)
//                                 );
//                                 setSelectedEmployees(uniqueValues);
//                             }
//                         }}
//                         value={selectedEmployees.some((user) => user.UserId === 'all')
//                             ? [{ UserId: 'all', Name: 'ALL' }]
//                             : selectedEmployees}
//                         renderInput={(params) => (
//                             <TextField {...params} placeholder="Employees" />
//                         )}
//                     />
//                 </DialogContent>
//                 <DialogActions className="d-flex justify-content-between flex-wrap">
//                     <Button
//                         type="button"
//                         variant="outlined"
//                         onClick={() => setSelectedEmployees([])}
//                     >
//                         Clear
//                     </Button>
//                     <span>
//                         <Button onClick={handleAddEmployeeClose}>Cancel</Button>
//                         <Button onClick={handleOverallWithPunch}>Download</Button>

//                     </span>
//                 </DialogActions>
//             </Dialog>
//             <Card>
//                 <CardContent sx={{ minHeight: '50vh' }}>
//                     <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
//                         <h6 className="fa-18">Employee Attendance</h6>

//                         {Number(userTypeId === 1) || Number(userTypeId) === 0 ? (
//                             <>
//                                 <div className="d-flex align-items-center justify-content-start gap-3">
//                                     <Button

//                                         onClick={handleDownload}
//                                         variant="contained"

//                                         disabled={filter?.EmpId === 0 || filter?.Name === "ALL"}
//                                     >

//                                         Individual Report
//                                     </Button>
//                                     <Button
//                                         onClick={() => {
//                                             handleOverallDownload(filter?.From, filter?.To);

//                                         }}
//                                     >
//                                         Monthly Report
//                                     </Button>

//                                     <Button
//                                         onClick={() => {
//                                             setAddEmployeeDialogOpen(true)
//                                             // handleOverallWithPunch(filter?.From, filter?.To);

//                                         }}
//                                     >
//                                         Cummulative Monthly Report
//                                     </Button>


//                                     <Button
//                                         onClick={
//                                             handleSummaryDownload
//                                         }
//                                     >
//                                         Summary
//                                     </Button>
//                                 </div>
//                             </>
//                         ) : (
//                             <div> </div>
//                         )}
//                     </div>

//                     <div className="px-2 row mb-4">
//                         <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label>Employee</label>
//                             <Select
//                                 value={{ value: filter?.EmpId, label: filter?.Name }}
//                                 onChange={(e) => setFilter({ ...filter, EmpId: e.value, Name: e.label })}
//                                 options={[{ value: 0, label: `ALL` }, ...employees.map(obj => ({ value: obj?.UserId, label: obj?.Name }))]}
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 placeholder={dropdownPlaceholder}
//                                 isDisabled={isDropdownDisabled}
//                             />
//                         </div>

//                         <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label>From</label>
//                             <input
//                                 type="month"
//                                 className="cus-inpt"
//                                 value={filter?.From?.slice(0, 7)}
//                                 onChange={handleFromChange}
//                             />
//                         </div>
//                     </div>

//                     <FilterableTable
//                         dataArray={attendanceData}
//                         columns={[
//                             {
//                                 isCustomCell: true,
//                                 Cell: ({ row }) => row.username,
//                                 ColumnHeader: 'Employee',
//                                 isVisible: 1,
//                                 width: '20%',
//                                 CellProps: {
//                                     sx: {
//                                         padding: '10px',
//                                         textAlign: 'left',
//                                         fontWeight: 'bold',
//                                     },
//                                 },
//                             },
//                             {
//                                 isCustomCell: true,
//                                 Cell: ({ row }) => formatAttendanceDate(row.LogDate || '--'),
//                                 ColumnHeader: 'Log Date',
//                                 isVisible: 1,
//                                 width: '20%',
//                                 CellProps: {
//                                     sx: {
//                                         padding: '10px',
//                                         textAlign: 'center',
//                                         color: 'gray',
//                                     },
//                                 },
//                             },
//                             {
//                                 isCustomCell: true,
//                                 ColumnHeader: 'Punch Details',
//                                 isVisible: 1,
//                                 width: '40%',
//                                 CellProps: {
//                                     sx: {
//                                         display: 'flex',
//                                         flexWrap: 'wrap',
//                                         justifyContent: 'center',
//                                     },
//                                 },
//                                 Cell: ({ row }) => (
//                                     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
//                                         {row.AttendanceDetails ? (
//                                             row.AttendanceDetails.split(',')
//                                                 .map((detail) => detail.trim())
//                                                 .filter((detail) => detail !== '')
//                                                 .map((detail, index) => {

//                                                     const parts = detail.split(' (');
//                                                     const time = parts[0];

//                                                     return (
//                                                         <Chip
//                                                             key={index}
//                                                             label={time}
//                                                             variant="outlined"
//                                                             size="small"
//                                                             sx={{ margin: '2px', color: 'green' }}
//                                                         />
//                                                     );
//                                                 })
//                                         ) : (
//                                             <div>No Punch Details</div>
//                                         )}
//                                     </div>
//                                 ),
//                             }
//                         ]}
//                         EnableSerialNumber
//                         CellSize="small"
//                         disablePagination={false}
//                     />
//                 </CardContent>
//             </Card>
//         </>
//     );
// };

// export default FingerPrintAttendanceReport;