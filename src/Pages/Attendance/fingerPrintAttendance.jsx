// import React, { useState, useEffect } from "react";
// import {
//     Dialog,
//     IconButton,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
// } from "@mui/material";
// import Select from "react-select";
// import { customSelectStyles } from "../../Components/tablecolumn";
// import { ISOString, isValidDate } from "../../Components/functions";
// // import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
// import { Search, Refresh } from "@mui/icons-material";
// // import { convertedStatus } from "../convertedStatus";
// import { fetchLink } from "../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../Components/filterableTable2";
// import { MyContext } from "../../Components/context/contextProvider";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//     Card,
//     CardContent,
//     Button,
//     Chip,
//     Autocomplete,
//     TextField,
// } from "@mui/material";
// import { useContext } from "react";
// import { toast } from "react-toastify";
// import * as XLSX from "xlsx";
// const useQuery = () => new URLSearchParams(useLocation().search);

// const AttendanceNewScreen = ({ loadingOn, loadingOff }) => {
//     const storage = JSON.parse(localStorage.getItem("user"));
//     const navigate = useNavigate();
//     const location = useLocation();
//     const stateDetails = location.state;

//     const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);

//     const getCurrentMonthYear = () => {
//         const date = new Date();
//         const year = date.getFullYear();
//         const month = (date.getMonth() + 1).toString().padStart(2, "0");
//         return `${year}-${month}`;
//     };

//     const initialValue = {
//         From: getCurrentMonthYear(),
//         To: getCurrentMonthYear(),
//         EmpId: "0",
//         Name: "ALL",
//     };
//     const query = useQuery();

//     const defaultFilters = {
//         From: getCurrentMonthYear(),
//         To: getCurrentMonthYear(),
//     };

//     const [saleOrders, setSaleOrders] = useState([]);
//     const [viewMode, setViewMode] = useState("default");
//     const [expandedDepartment, setExpandedDepartment] = useState([]);

//     const [dropdownEmployees, setDropdownEmployees] = useState([]);
//     const [reload, setReload] = useState(false);
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
//     const [employees, setEmployees] = useState([]);
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//     const userTypeId = storage?.UserTypeId;
//     const parseData = storage;
//     const { contextObj } = useContext(MyContext);

//     const [dropdownPlaceholder, setDropdownPlaceholder] = useState("ALL");
//     const [filter, setFilter] = useState(initialValue);
//     const [debouncedFilter, setDebouncedFilter] = useState(filter);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setDebouncedFilter(filter);
//         }, 500);

//         return () => clearTimeout(timer);
//     }, [filter]);

//     useEffect(() => {
//         const { From, EmpId } = debouncedFilter;
//         if (From && (EmpId || EmpId === 0)) {
//             fetchAttendanceData(From, EmpId);
//             fetchDropdownEmployees();
//         }
//     }, [debouncedFilter]);

//     const getDaysInMonth = (monthYear) => {
//         if (!monthYear) return 0;

//         const [year, month] = monthYear.split("-");

//         return new Date(year, month, 0).getDate();
//     };

//     const [filters, setFilters] = useState({
//         FromDate: new Date().toISOString().split("T")[0],
//         ToDate: new Date().toISOString().split("T")[0],
//         Cancel_status: 0,
//     });

//     const toggleExpand = (department) => {
//         if (expandedDepartment === department) {
//             setExpandedDepartment(null);
//         } else {
//             setExpandedDepartment(department);
//         }
//     };
//     const [departments, setDepartments] = useState([]);
//     const [selectedDepartment, setSelectedDepartment] = useState(null);

//     const [selectedEmployees, setSelectedEmployees] = useState([]);
//     const Add_Rights = contextObj?.Add_Rights;

//     useEffect(() => {
//         if (loadingOn) loadingOn();

//         const today = new Date().toISOString().split("T")[0];
//         const fromDate = filters.FromDate || today;
//         const toDate = filters.ToDate || today;

//         fetchLink({
//             address: `empAttendance/departmentwise?FromDate=${fromDate}&ToDate=${toDate}`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setSaleOrders(data?.data);
//                 }
//             })
//             .catch((e) => console.error(e))
//             .finally(() => {
//                 if (loadingOff) loadingOff();
//             });
//     }, [reload]);

//     const handleFromChange = (e) => {
//         const getDaysInMonth = (monthYear) => {
//             if (!monthYear) return 0;

//             const [year, month] = monthYear.split("-");

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

//                 const {
//                     days: dateRange,
//                     sundayCount,
//                     totalDays,
//                 } = getWorkingDays(startDate, endDate);

//                 let totalWorkingDaysSummary = 0;
//                 let totalLeaveDaysSummary = 0;

//                 const summaryData = overallData.map((row) => {
//                     const punchDetails = row.AttendanceDetails
//                         ? JSON.parse(row.AttendanceDetails)
//                         : [];
//                     let totalWorkingDays = 0;
//                     let totalLeaveDays = 0;

//                     dateRange.forEach((date) => {
//                         if (Array.isArray(punchDetails)) {
//                             const detail = punchDetails.find(
//                                 (detail) => detail.Date === date
//                             );

//                             const isSunday = new Date(date).getDay() === 0;

//                             if (isSunday) {
//                                 return;
//                             }

//                             if (detail) {
//                                 if (detail.AttendanceStatus === "P") {
//                                     totalWorkingDays++;
//                                 } else if (
//                                     detail.AttendanceStatus === "A" ||
//                                     detail.AttendanceStatus === "H"
//                                 ) {
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

//                 const exportData = summaryData.map((item) => ({
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
//     const handleDownload = () => {
//         const maxPunches = 4;

//         const exportData = attendanceData.map((row) => {
//             const punchDetails = row.AttendanceDetails
//                 ? row.AttendanceDetails.split(",").filter((p) => p.trim() !== "")
//                 : [];

//             let attendanceStatus = row.AttendanceStatus;

//             if (!attendanceStatus) {
//                 attendanceStatus = punchDetails.length === 0 ? "A" : "P";
//             }

//             const punchColumns = {};
//             for (let i = 0; i < maxPunches; i++) {
//                 punchColumns[`Punch${i + 1}`] = punchDetails[i]
//                     ? punchDetails[i].trim()
//                     : "--";
//             }

//             return {
//                 Employee: row.username || row.Employee,
//                 "Log Date": formatAttendanceDate(row.LogDate),
//                 "Attendance Status": attendanceStatus,
//                 ...punchColumns,
//             };
//         });

//         const columnsOrder = [
//             "Employee",
//             "Log Date",
//             "Attendance Status",
//             "Punch1",
//             "Punch2",
//             "Punch3",
//             "Punch4",
//         ];

//         const reorderedData = exportData.map((row) =>
//             columnsOrder.reduce((acc, col) => {
//                 acc[col] = row[col] || "--";
//                 return acc;
//             }, {})
//         );

//         const ws = XLSX.utils.json_to_sheet(reorderedData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

//         XLSX.writeFile(wb, "Attendance_Report.xlsx");
//     };

//     const MAX_PUNCHES = 6;

//     function formatToAmPm(timeString) {
//         if (!timeString) return "--";
//         const [hourStr, minuteStr] = timeString.split(":");
//         if (!hourStr || !minuteStr) return "--";

//         let hour = parseInt(hourStr, 10);
//         const minute = minuteStr;
//         const ampm = hour >= 12 ? "PM" : "AM";

//         hour = hour % 12 || 12;

//         return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
//     }

//     const punchColumns = Array.from({ length: MAX_PUNCHES }, (_, index) => ({
//         isCustomCell: true,
//         ColumnHeader: `Punch ${index + 1}`,
//         isVisible: 1,
//         width: "13%",
//         CellProps: {
//             sx: {
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 padding: "10px",
//             },
//         },
//         Cell: ({ row }) => {
//             const punches = row.AttendanceDetails
//                 ? row.AttendanceDetails.split(",")
//                     .map((p) => p.trim())
//                     .filter((p) => p !== "")
//                 : [];

//             const punch = punches[index] || "--";
//             const rawTime = punch.split(":in(")[0];
//             const formattedTime = punch !== "--" ? formatToAmPm(rawTime) : "--";

//             return formattedTime !== "--" ? (
//                 <Chip
//                     label={formattedTime}
//                     variant="outlined"
//                     size="small"
//                     sx={{ color: "green", margin: "2px" }}
//                 />
//             ) : (
//                 <div style={{ color: "gray" }}>--</div>
//             );
//         },
//     }));

//     const formatAttendanceDate = (logDateTime) => {
//         if (!logDateTime) return "--";
//         const [date] = logDateTime.split("T");
//         return `${date} `;
//     };

//     const handleOverallDownload = async () => {
//         try {
//             const fromDate = filter.From;
//             const [year, month] = fromDate.split("-");
//             const startDate = `${year}-${month}-01`;
//             const dayCount = getDaysInMonth(`${year}-${month}`);
//             const endDate = `${year}-${month}-${dayCount}`;

//             const [attendanceRes, leaveRes] = await Promise.all([
//                 fetchLink({
//                     address: `userModule/employeActivity/employeeAttendanceModuledownload?FromDate=${startDate}&ToDate=${endDate}`,
//                 }),
//                 fetchLink({
//                     address: `masters/leave?FromDate=${startDate}&ToDate=${endDate}`,
//                 }),
//             ]);

//             if (!attendanceRes.success) throw new Error("Attendance data failed");

//             const leaveMap = {};
//             (leaveRes?.data || []).forEach((leave) => {
//                 if (leave.Status?.toUpperCase() !== "APPROVED") return;

//                 const userId = leave.User_Id;
//                 if (!userId) return;

//                 const parseDate = (dateStr) => {
//                     try {
//                         return new Date(
//                             dateStr.includes("T") ? dateStr.split("T")[0] : dateStr
//                         );
//                     } catch {
//                         return null;
//                     }
//                 };

//                 const leaveStart = parseDate(leave.FromDate);
//                 const leaveEnd = parseDate(leave.ToDate);
//                 if (!leaveStart || !leaveEnd) return;

//                 let current = new Date(leaveStart);
//                 while (current <= leaveEnd) {
//                     const dateStr = current.toISOString().split("T")[0];
//                     if (!leaveMap[userId]) leaveMap[userId] = {};
//                     leaveMap[userId][dateStr] = true;
//                     current.setDate(current.getDate() + 1);
//                 }
//             });

//             const { days: dateRange } = getDateRange(startDate, endDate);
//             const exportData = attendanceRes.data.map((emp) => {
//                 const attendanceDetails = tryParseJSON(emp.AttendanceDetails) || [];
//                 const dailyStatus = {};
//                 let presentCount = 0;

//                 const attendanceLookup = {};
//                 attendanceDetails.forEach((record) => {
//                     if (record?.Date) {
//                         attendanceLookup[record.Date] = {
//                             status: record.AttendanceStatus,
//                             hasPunch: record.Punch1 !== "[]",
//                         };
//                     }
//                 });

//                 dateRange.forEach((date, index) => {
//                     const dayNum = index + 1;
//                     const dayKey = `Day ${dayNum}`;
//                     const isSunday = new Date(date).getDay() === 0;
//                     const userId = emp.User_Mgt_Id;
//                     const attendanceRecord = attendanceLookup[date];
//                     const attendanceStatus = attendanceRecord?.status;
//                     const hasPunch = attendanceRecord?.hasPunch;

//                     if (isSunday) {
//                         dailyStatus[dayKey] = "H";
//                     } else if (userId && leaveMap[userId]?.[date]) {
//                         dailyStatus[dayKey] = "L";
//                     } else if (attendanceStatus === "L") {
//                         dailyStatus[dayKey] = "L";
//                     } else if (attendanceStatus === "P") {
//                         dailyStatus[dayKey] = hasPunch ? "P" : "A";
//                         if (hasPunch) presentCount++;
//                     } else if (attendanceStatus === "H") {
//                         dailyStatus[dayKey] = "H";
//                     } else {
//                         dailyStatus[dayKey] = "A";
//                     }
//                 });

//                 return {
//                     EmployeeName: emp.username || emp.Name,
//                     TotalPresent: presentCount,
//                     ...dailyStatus,
//                 };
//             });

//             const headers = [
//                 "EmployeeName",
//                 "TotalPresent",
//                 ...dateRange.map((_, i) => `Day ${i + 1}`),
//             ];
//             const ws = XLSX.utils.json_to_sheet(exportData);
//             XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
//             XLSX.writeFile(wb, `Attendance_Report_${month}_${year}.xlsx`);
//         } catch (error) {
//             console.error("Download failed:", error);
//             toast.error("Failed to generate report");
//         }
//     };

//     function getDateRange(start, end) {
//         const dates = [];
//         const current = new Date(start);
//         const endDate = new Date(end);

//         while (current <= endDate) {
//             dates.push(current.toISOString().split("T")[0]);
//             current.setDate(current.getDate() + 1);
//         }

//         return { days: dates, count: dates.length };
//     }

//     function tryParseJSON(jsonString) {
//         try {
//             return jsonString ? JSON.parse(jsonString) : [];
//         } catch {
//             return [];
//         }
//     }

//     const handleOverallWithPunch = async () => {
//         try {
//             const maxPunches = 6;

//             const firstLogDate = attendanceData[0]?.LogDate;
//             if (!firstLogDate) {
//                 toast.error("No attendance data found");
//                 return;
//             }

//             const dateObj = new Date(firstLogDate);
//             const year = dateObj.getFullYear();
//             const month = dateObj.getMonth() + 1;
//             const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
//             const endDate = new Date(year, month, 0).toISOString().split("T")[0];

//             const leaveResponse = await fetchLink({
//                 address: `masters/leave?FromDate=${startDate}&ToDate=${endDate}`,
//             });
//             const leaveData = leaveResponse?.success ? leaveResponse.data : [];

//             const leaveMap = {};
//             leaveData.forEach((leave) => {
//                 // Case-insensitive status check
//                 if (leave.Status?.toLowerCase() !== "approved") return;

//                 const userId = String(leave.User_Id);
//                 if (!userId) return;

//                 const parseDate = (dateStr) => {
//                     const parts = dateStr.split(/[-/]/);
//                     if (parts.length === 3) {
//                         if (parts[2].length === 4) {
//                             return parts[0].length === 2
//                                 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
//                                 : new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
//                         }

//                         return new Date(dateStr);
//                     }
//                     return new Date(dateStr);
//                 };

//                 const leaveStart = parseDate(leave.FromDate);
//                 const leaveEnd = parseDate(leave.ToDate);

//                 let currentDate = new Date(leaveStart);

//                 while (currentDate <= leaveEnd) {
//                     const dateStr = currentDate.toISOString().split("T")[0];
//                     if (!leaveMap[userId]) leaveMap[userId] = {};

//                     if (currentDate.getDay() !== 0) {
//                         leaveMap[userId][dateStr] = "L";
//                     }
//                     currentDate.setDate(currentDate.getDate() + 1);
//                 }
//             });

//             const filteredAttendanceData = attendanceData.filter((row) =>
//                 selectedEmployees.some(
//                     (user) =>
//                         String(user.UserId) === String(row.User_Mgt_Id) ||
//                         user.UserId === "ALL"
//                 )
//             );

//             const groupedData = filteredAttendanceData.reduce((acc, row) => {
//                 acc[row.username] = acc[row.username] || [];
//                 acc[row.username].push(row);
//                 return acc;
//             }, {});

//             if (Object.keys(groupedData).length === 0) {
//                 toast.error("No attendance data found");
//                 return;
//             }

//             const wb = XLSX.utils.book_new();

//             Object.entries(groupedData).forEach(([username, userAttendance]) => {
//                 const exportData = userAttendance.map((row) => {
//                     const logDate = new Date(row.LogDate);
//                     const dateStr = logDate.toISOString().split("T")[0];
//                     const isSunday = logDate.getDay() === 0;

//                     const userId = String(row.User_Mgt_Id);
//                     const hasApprovedLeave = leaveMap[userId]?.[dateStr] === "L";

//                     let attendanceStatus;
//                     if (isSunday) {
//                         attendanceStatus = "H";
//                     } else if (hasApprovedLeave) {
//                         attendanceStatus = "L";
//                     } else {
//                         const punches =
//                             row.AttendanceDetails?.split(",").map((d) => d.trim()) || [];
//                         attendanceStatus = punches.some((p) => p && p !== "--") ? "P" : "A";
//                     }

//                     const punchColumns = {};
//                     const punches =
//                         row.AttendanceDetails?.split(",").map((d) => d.trim()) || [];
//                     for (let i = 0; i < maxPunches; i++) {
//                         punchColumns[`Punch ${i + 1}`] = punches[i] || "--";
//                     }

//                     return {
//                         Employee: username,
//                         "Log Date": formatAttendanceDate(row.LogDate),
//                         "Attendance Status": attendanceStatus,
//                         ...punchColumns,
//                     };
//                 });

//                 const columnsOrder = [
//                     "Employee",
//                     "Log Date",
//                     "Attendance Status",
//                     ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`),
//                 ];

//                 const reorderedData = exportData.map((row) =>
//                     columnsOrder.reduce((acc, col) => {
//                         acc[col] = row[col] || "--";
//                         return acc;
//                     }, {})
//                 );

//                 XLSX.utils.book_append_sheet(
//                     wb,
//                     XLSX.utils.json_to_sheet(reorderedData),
//                     username.slice(0, 31)
//                 );
//             });

//             const fileName = `Attendance_Report_${new Date().toLocaleString(
//                 "default",
//                 { month: "long" }
//             )}_${year}.xlsx`;
//             XLSX.writeFile(wb, fileName);
//         } catch (error) {
//             console.error("Error generating report:", error);
//             toast.error("Failed to generate report");
//         }
//     };
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

//     useEffect(() => {
//         const userTypeId = storage?.UserTypeId;
//         const userId = storage?.UserId;
//         const companyId = storage?.Company_id;

//         fetchLink({
//             address: `masters/users/employee/dropDown?Company_id=${companyId}`,
//             headers: {
//                 Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
//             },
//         })
//             .then((data) => {
//                 if (data.success) {
//                     let filteredEmployees = [];

//                     if (
//                         Number(userTypeId) === 1 ||
//                         Number(userTypeId) === 0 ||
//                         Number(Add_Rights) === 1
//                     ) {
//                         filteredEmployees = data.data;
//                         setFilter((prev) => ({ ...prev, EmpId: 0, Name: "ALL" }));
//                         setIsDropdownDisabled(false);
//                         setDropdownPlaceholder("ALL");
//                     } else {
//                         filteredEmployees = data.data.filter(
//                             (employee) => employee.UserId === userId
//                         );
//                         setFilter((prev) => ({
//                             ...prev,
//                             EmpId: userId,
//                             Name: storage?.Name,
//                         }));
//                         setIsDropdownDisabled(true);
//                         setDropdownPlaceholder(storage?.Name);
//                     }

//                     setEmployees(filteredEmployees);
//                 }
//             })
//             .catch((e) => console.error("Error fetching employees:", e));
//     }, [
//         storage?.UserTypeId,
//         storage?.UserId,
//         storage?.Company_id,
//         storage?.Name,
//         reload,
//     ]);

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
//                     Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
//                 },
//             });

//             if (response.success) {
//                 setAttendanceData(response.data);
//             }
//         } catch (e) {
//             console.error("Error fetching attendance data:", e);
//         }
//     };

//     useEffect(() => {
//         const queryFilters = {
//             FromDate:
//                 query.get("FromDate") && isValidDate(query.get("FromDate"))
//                     ? query.get("FromDate")
//                     : defaultFilters.Fromdate,
//             ToDate:
//                 query.get("ToDate") && isValidDate(query.get("ToDate"))
//                     ? query.get("ToDate")
//                     : defaultFilters.Todate,
//         };
//         setFilters((pre) => ({
//             ...pre,
//             FromDate: queryFilters.FromDate,
//             ToDate: queryFilters.ToDate,
//         }));
//     }, [location.search]);

//     useEffect(() => {
//         const FromDate =
//             stateDetails?.FromDate && isValidDate(stateDetails?.FromDate)
//                 ? ISOString(stateDetails?.FromDate)
//                 : null;
//         const ToDate =
//             stateDetails?.ToDate && isValidDate(stateDetails?.ToDate)
//                 ? ISOString(stateDetails?.ToDate)
//                 : null;
//         if (FromDate && ToDate) {
//             updateQueryString({ FromDate, ToDate });
//             setFilters((pre) => ({
//                 ...pre,
//                 FromDate: ISOString(stateDetails.FromDate),
//                 ToDate: stateDetails.ToDate,
//             }));
//             setReload((pre) => !pre);
//         }
//     }, [stateDetails]);

//     const updateQueryString = (newFilters) => {
//         const params = new URLSearchParams(newFilters);
//         navigate(`?${params.toString()}`, { replace: true });
//     };

//     const handleAddEmployeeClose = () => {
//         setAddEmployeeDialogOpen(false);
//     };

//     const data = () => setViewMode("employee");
//     const dataDepartment = () => setViewMode("department");
//     // const dashboard=()=>setViewMode('default')

//     const dashboard = () => {
//         setFilters((prev) => ({
//             ...prev,
//             FromDate: prev.FromDate || new Date().toISOString().split("T")[0],
//             ToDate: prev.ToDate || new Date().toISOString().split("T")[0],
//         }));
//         setViewMode("default");
//     };

//     const ExpendableComponent = ({ row }) => {
//         const departments =
//             typeof row.DepartmentWiseCounts === "string"
//                 ? JSON.parse(row.DepartmentWiseCounts)
//                 : row.DepartmentWiseCounts;

//         return (
//             <table
//                 style={{
//                     width: "100%",
//                     borderCollapse: "collapse",
//                     marginTop: "10px",
//                 }}
//             >
//                 <thead>
//                     <tr style={{ backgroundColor: "#f0f0f0" }}>
//                         <th
//                             style={{
//                                 border: "1px solid #ccc",
//                                 padding: "8px",
//                                 textAlign: "left",
//                             }}
//                         >
//                             Department Name
//                         </th>
//                         <th
//                             style={{
//                                 border: "1px solid #ccc",
//                                 padding: "8px",
//                                 textAlign: "left",
//                             }}
//                         >
//                             Total Employees
//                         </th>
//                         <th
//                             style={{
//                                 border: "1px solid #ccc",
//                                 padding: "8px",
//                                 textAlign: "left",
//                             }}
//                         >
//                             Present Today
//                         </th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {departments && departments.length > 0 ? (
//                         departments.map((data, index) => (
//                             <tr key={index} onClick={() => toggleExpand(data.Department)}>
//                                 <td style={{ border: "1px solid #ccc", padding: "8px" }}>
//                                     {data?.Department || "-"}
//                                 </td>
//                                 <td style={{ border: "1px solid #ccc", padding: "8px" }}>
//                                     <div style={{ display: "flex", alignItems: "center" }}>
//                                         <span
//                                             style={{
//                                                 fontSize: "1.25rem",
//                                                 fontWeight: "bold",
//                                                 marginRight: "100px", // Increased from 15px to 100px
//                                                 minWidth: "60px", // Ensures consistent spacing
//                                             }}
//                                         >
//                                             {data?.TotalEmployees || "-"}
//                                         </span>
//                                         <span style={{ fontSize: "1rem" }}>
//                                             Male / Female: {data?.TotalMaleEmployees || "0"} /{" "}
//                                             {data?.TotalFemaleEmployees || "0"}
//                                         </span>
//                                     </div>
//                                 </td>
//                                 <td style={{ border: "1px solid #ccc", padding: "8px" }}>
//                                     <div style={{ display: "flex", alignItems: "center" }}>
//                                         <span
//                                             style={{
//                                                 fontSize: "1.25rem",
//                                                 fontWeight: "bold",
//                                                 marginRight: "100px", // Increased from 15px to 100px
//                                                 minWidth: "60px", // Ensures consistent spacing
//                                             }}
//                                         >
//                                             {data?.TotalPresentToday || "-"}
//                                         </span>
//                                         <span style={{ fontSize: "1rem" }}>
//                                             Male / Female: {data?.TotalMalePresentToday || "0"} /{" "}
//                                             {data?.TotalFemalePresentToday || "0"}
//                                         </span>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="3" style={{ padding: "8px" }}>
//                                 No Departments Available
//                             </td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         );
//     };

//     const handleRefresh = () => {
//         if (loadingOn) loadingOn();

//         const userTypeId = storage?.UserTypeId;
//         const userId = storage?.UserId;
//         const companyId = storage?.Company_id;

//         fetchLink({
//             address: `masters/users/employee/dropDown?Company_id=${companyId}`,
//             headers: {
//                 Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
//             },
//         })
//             .then((data) => {
//                 if (data.success) {
//                     let filteredEmployees = [];

//                     if (
//                         Number(userTypeId) === 1 ||
//                         Number(userTypeId) === 0 ||
//                         Number(Add_Rights) === 1
//                     ) {
//                         filteredEmployees = data.data;
//                         setFilter((prev) => ({ ...prev, EmpId: 0, Name: "ALL" }));
//                         setIsDropdownDisabled(false);
//                         setDropdownPlaceholder("ALL");
//                     } else {
//                         filteredEmployees = data.data.filter(
//                             (employee) => employee.UserId === userId
//                         );
//                         setFilter((prev) => ({
//                             ...prev,
//                             EmpId: userId,
//                             Name: storage?.Name,
//                         }));
//                         setIsDropdownDisabled(true);
//                         setDropdownPlaceholder(storage?.Name);
//                     }

//                     setEmployees(filteredEmployees);
//                 }
//             })
//             .catch((e) => console.error("Error fetching employees:", e))
//             .finally(() => {
//                 if (loadingOff) loadingOff();
//                 setReload((prev) => !prev);
//             });
//     };

//     const handleRefreshData = () => {
//         window.location.reload();
//     };

//     const ExpendableComponent1 = ({ row }) => {
//         let departments = [];
//         let monthlyAttendance = [];

//         try {
//             departments =
//                 typeof row.Employees === "string"
//                     ? JSON.parse(row.Employees)
//                     : row.Employees || [];

//             monthlyAttendance =
//                 typeof row.MonthlyAverageAttendance === "string"
//                     ? JSON.parse(row.MonthlyAverageAttendance)
//                     : row.MonthlyAverageAttendance || [];
//         } catch (err) {
//             departments = [];
//             monthlyAttendance = [];
//         }

//         const currentYear = new Date().getFullYear();

//         const monthList = [
//             { name: "January", number: 1 },
//             { name: "February", number: 2 },
//             { name: "March", number: 3 },
//             { name: "April", number: 4 },
//             { name: "May", number: 5 },
//             { name: "June", number: 6 },
//             { name: "July", number: 7 },
//             { name: "August", number: 8 },
//             { name: "September", number: 9 },
//             { name: "October", number: 10 },
//             { name: "November", number: 11 },
//             { name: "December", number: 12 },
//         ];

//         const attendanceMap = new Map();
//         monthlyAttendance.forEach((item) => {
//             const key = `${item.MonthNumber}-${item.YearNumber}`;
//             attendanceMap.set(key, item.UniqueEmployeeDays ?? 0);
//         });

//         return (
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//                 <div style={{ display: "flex", gap: "20px" }}>
//                     <table
//                         style={{
//                             width: "60%",
//                             borderCollapse: "collapse",
//                             border: "1px solid #ccc",
//                         }}
//                     >
//                         <thead>
//                             <tr style={{ backgroundColor: "#f0f0f0" }}>
//                                 <th
//                                     style={{
//                                         border: "1px solid #ccc",
//                                         padding: "5px",
//                                         textAlign: "left",
//                                     }}
//                                 >
//                                     Emp_Name
//                                 </th>
//                                 <th
//                                     style={{
//                                         border: "1px solid #ccc",
//                                         padding: "8px",
//                                         textAlign: "left",
//                                     }}
//                                 >
//                                     Sex
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {departments && departments.length > 0 ? (
//                                 departments.map((data, index) => (
//                                     <tr key={index}>
//                                         <td style={{ border: "1px solid #ccc", padding: "8px" }}>
//                                             {data?.Emp_Name || "-"}
//                                         </td>
//                                         <td style={{ border: "1px solid #ccc", padding: "8px" }}>
//                                             {data?.Sex || "-"}
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="2" style={{ padding: "8px" }}>
//                                         No Employees Available
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>

//                     <div
//                         style={{
//                             flex: "1",
//                             border: "1px solid #ddd",
//                             borderRadius: "5px",
//                             padding: "10px",
//                             overflowX: "auto",
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         <h3 style={{ textAlign: "center" }}>Months & Attendance</h3>
//                         <div
//                             style={{
//                                 display: "flex",
//                                 gap: "10px",
//                             }}
//                         >
//                             {monthList.map((month) => {
//                                 const key = `${month.number}-${currentYear}`;
//                                 const uniqueEmployeeDays = attendanceMap.get(key) ?? 0;

//                                 return (
//                                     <div
//                                         key={month.number}
//                                         style={{
//                                             minWidth: "100px",
//                                             padding: "8px",
//                                             backgroundColor: "#f0f0f0",
//                                             color: "black",
//                                             borderRadius: "4px",
//                                             textAlign: "center",
//                                             userSelect: "none",
//                                         }}
//                                     >
//                                         <div style={{ fontWeight: "bold" }}>
//                                             {month.name} {currentYear}
//                                         </div>
//                                         <div
//                                             style={{
//                                                 marginTop: "6px",
//                                                 fontSize: "14px",
//                                                 color: "#555",
//                                             }}
//                                         >
//                                             {uniqueEmployeeDays}
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     useEffect(() => {
//         const userTypeId = storage?.UserTypeId;
//         const userId = storage?.UserId;
//         const companyId = storage?.Company_id;

//         fetchLink({
//             address: `masters/users/employee/dropDown?Company_id=${companyId}`,
//             headers: {
//                 Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
//             },
//         })
//             .then((data) => {
//                 if (data.success) {
//                     let filteredEmployees = [];

//                     if (
//                         Number(userTypeId) === 1 ||
//                         Number(userTypeId) === 0 ||
//                         Number(Add_Rights) === 1
//                     ) {
//                         filteredEmployees = data.data;
//                         setFilter((prev) => ({ ...prev, EmpId: 0, Name: "ALL" }));
//                         setIsDropdownDisabled(false);
//                         setDropdownPlaceholder("ALL");
//                     } else {
//                         filteredEmployees = data.data.filter(
//                             (employee) => employee.UserId === userId
//                         );
//                         setFilter((prev) => ({
//                             ...prev,
//                             EmpId: userId,
//                             Name: storage?.Name,
//                         }));
//                         setIsDropdownDisabled(true);
//                         setDropdownPlaceholder(storage?.Name);
//                     }

//                     setEmployees(filteredEmployees);
//                 }
//             })
//             .catch((e) => console.error("Error fetching employees:", e));
//     }, [
//         storage?.UserTypeId,
//         storage?.UserId,
//         storage?.Company_id,
//         storage?.Name,
//     ]);

//     useEffect(() => {
//         const companyId = storage?.Company_id;

//         fetchLink({
//             address: `empAttendance/department?Company_id=${companyId}`,
//             headers: {
//                 Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
//             },
//         })
//             .then((data) => {
//                 if (data.success) {
//                     if (data.others && data.others.department) {
//                         const deptOptions = data.others.department.map((dept) => ({
//                             value: dept.value,
//                             label: dept.label,
//                         }));
//                         setDepartments(deptOptions);
//                     }
//                 }
//             })
//             .catch((e) => console.error("Error fetching departments:", e));
//     }, [storage?.Company_id, reload]);

//     const handleDepartmentChange = (selected) => {
//         setSelectedDepartment(selected);

//         setEmployees([]);
//         setSelectedEmployee(null);

//         if (selected) {
//             fetchLink({
//                 address: `empAttendance/employeesByDepartment`,
//                 method: "POST",
//                 bodyData: { department: selected.value },
//             })
//                 .then((data) => {
//                     if (data.success && data.others?.employees) {
//                         const employeeOptions = data.others.employees.map((emp) => ({
//                             value: emp.id || emp.value || emp.Emp_Id,
//                             label: emp.name || emp.label || emp.Emp_Name,
//                         }));

//                         setEmployees(employeeOptions);
//                     } else {
//                         setEmployees([]);
//                     }
//                 })
//                 .catch((e) => {
//                     console.error("Error fetching employees:", e);
//                     setEmployees([]);
//                 });
//         } else {
//             setEmployees([]);
//         }
//     };

//     const departmentWiseCounts = React.useMemo(() => {
//         if (!saleOrders?.[0]?.DepartmentWiseCounts) return [];
//         try {
//             const parsed = JSON.parse(saleOrders[0].DepartmentWiseCounts);
//             return Array.isArray(parsed) ? parsed : [];
//         } catch (err) {
//             console.error("Failed to parse DepartmentWiseCounts JSON:", err);
//             return [];
//         }
//     }, [saleOrders]);

//     const filteredData = React.useMemo(() => {
//         if (!departmentWiseCounts || !departmentWiseCounts.length) return [];

//         const filteredDepartments = departmentWiseCounts.filter((item) => {
//             return selectedDepartment
//                 ? item.Department === selectedDepartment.label
//                 : true;
//         });

//         return filteredDepartments.map((dept) => {
//             const employeeList = dept.employees || dept.Employees || [];

//             const filteredEmployees = selectedEmployee
//                 ? employeeList.filter((emp) => {
//                     if (!emp.Emp_Name) return false;
//                     return (
//                         emp.Emp_Name.trim().toLowerCase() ===
//                         selectedEmployee.label.trim().toLowerCase()
//                     );
//                 })
//                 : employeeList;

//             return {
//                 ...dept,
//                 Employees: filteredEmployees,
//             };
//         });
//     }, [departmentWiseCounts, selectedDepartment, selectedEmployee]);

//     return (
//         <>
//             {Number(userTypeId) === 0 || Number(userTypeId) === 1 ? (
//                 <>
//                     {viewMode === "default" && (
//                         <FilterableTable
//                             title={
//                                 <div className="d-flex align-items-center">
//                                     <Button
//                                         size="small mx-2"
//                                         variant="outlined"
//                                         disabled
//                                         onClick={() => dashboard()}
//                                     >
//                                         Dashboard
//                                     </Button>
//                                     <Button
//                                         size="small mx-2"
//                                         variant="outlined"
//                                         onClick={() => data()}
//                                     >
//                                         Employee
//                                     </Button>
//                                     <Button
//                                         size="small mx-2"
//                                         variant="outlined"
//                                         onClick={() => dataDepartment()}
//                                     >
//                                         Department
//                                     </Button>

//                                     <div className="d-flex align-items-center justify-content-start gap-3">
//                                         <label>From Date</label>
//                                         <input
//                                             type="date"
//                                             onChange={(e) =>
//                                                 setFilters({ ...filters, FromDate: e.target.value })
//                                             }
//                                             value={filters?.FromDate}
//                                             className="cus-inpt w-auto p-1"
//                                         />
//                                     </div>

//                                     <div className="d-flex align-items-center justify-content-start gap-3">
//                                         <label>To Date</label>
//                                         <input
//                                             type="date"
//                                             onChange={(e) =>
//                                                 setFilters({ ...filters, ToDate: e.target.value })
//                                             }
//                                             value={filters?.ToDate}
//                                             className="cus-inpt w-auto p-1"
//                                         />
//                                     </div>

//                                     <div className="p-1">
//                                         <IconButton
//                                             onClick={() => setReload(!reload)}
//                                             variant="outlined"
//                                             size="small"
//                                         >
//                                             <Search />
//                                         </IconButton>
//                                     </div>
//                                 </div>
//                             }
//                             dataArray={saleOrders}
//                             EnableSerialNumber
//                             columns={[
//                                 {
//                                     isVisible: 1,
//                                     ColumnHeader: "Tot.Emp",
//                                     isCustomCell: true,
//                                     Cell: ({ row }) => {
//                                         const total = row?.TotalEmployees ?? 0;
//                                         const male = row?.TotalMaleEmployees ?? 0;
//                                         const female = row?.TotalFemaleEmployees ?? 0;
//                                         return (
//                                             <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
//                                                 <div>{total}</div>
//                                                 <div style={{ fontSize: "1rem", fontWeight: "normal" }}>
//                                                     Male / Female: {male} / {female}
//                                                 </div>
//                                             </div>
//                                         );
//                                     },
//                                 },
//                                 {
//                                     isVisible: 1,
//                                     ColumnHeader: "Tot.Pre.Today",
//                                     isCustomCell: true,
//                                     Cell: ({ row }) => {
//                                         const total = row?.TotalPresentToday ?? 0;
//                                         const male = row?.TotalMalePresentToday ?? 0;
//                                         const female = row?.TotalFemalePresentToday ?? 0;
//                                         return (
//                                             <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
//                                                 <div>{total}</div>
//                                                 <div style={{ fontSize: "1rem", fontWeight: "normal" }}>
//                                                     Male / Female: {male} / {female}
//                                                 </div>
//                                             </div>
//                                         );
//                                     },
//                                 },
//                             ]}
//                             isExpendable={true}
//                             tableMaxHeight={550}
//                             expandableComp={ExpendableComponent}
//                         />
//                     )}

//                     {viewMode === "employee" && (
//                         <>
//                             <Dialog
//                                 open={addEmployeeDialogOpen}
//                                 maxWidth="md"
//                                 PaperProps={{
//                                     style: { width: "500px", height: "500px" },
//                                 }}
//                             >
//                                 <DialogTitle>Add Employee</DialogTitle>
//                                 <DialogContent>
//                                     <Autocomplete
//                                         multiple
//                                         options={[
//                                             { UserId: "all", Name: "ALL" },
//                                             ...dropdownEmployees,
//                                         ]}
//                                         getOptionLabel={(option) => option.Name}
//                                         isOptionEqualToValue={(option, value) =>
//                                             option.UserId === value.UserId
//                                         }
//                                         onChange={(event, value) => {
//                                             if (value.some((selected) => selected.UserId === "all")) {
//                                                 setSelectedEmployees(dropdownEmployees);
//                                             } else {
//                                                 const uniqueValues = value.filter(
//                                                     (val, index, self) =>
//                                                         index ===
//                                                         self.findIndex((t) => t.UserId === val.UserId)
//                                                 );
//                                                 setSelectedEmployees(uniqueValues);
//                                             }
//                                         }}
//                                         value={
//                                             selectedEmployees.some((user) => user.UserId === "all")
//                                                 ? [{ UserId: "all", Name: "ALL" }]
//                                                 : selectedEmployees
//                                         }
//                                         renderInput={(params) => (
//                                             <TextField {...params} placeholder="Employees" />
//                                         )}
//                                     />
//                                 </DialogContent>
//                                 <DialogActions className="d-flex justify-content-between flex-wrap">
//                                     <Button
//                                         type="button"
//                                         variant="outlined"
//                                         onClick={() => setSelectedEmployees([])}
//                                     >
//                                         Clear
//                                     </Button>
//                                     <span>
//                                         <Button onClick={handleAddEmployeeClose}>Cancel</Button>
//                                         <Button onClick={handleOverallWithPunch}>Download</Button>
//                                     </span>
//                                 </DialogActions>
//                             </Dialog>
//                             <Card>
//                                 <CardContent sx={{ minHeight: "50vh" }}>
//                                     <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
//                                         <h6 className="fa-18">
//                                             <Button
//                                                 size="small mx-2"
//                                                 variant="outlined"
//                                                 onClick={() => dashboard()}
//                                             >
//                                                 Dashboard
//                                             </Button>
//                                             <Button
//                                                 size="small mx-2"
//                                                 variant="outlined"
//                                                 disabled
//                                                 onClick={() => data()}
//                                             >
//                                                 EMPLOYEE
//                                             </Button>
//                                             <Button
//                                                 size="small mx-2"
//                                                 variant="outlined"
//                                                 onClick={() => dataDepartment()}
//                                             >
//                                                 Department
//                                             </Button>
//                                         </h6>

//                                         <div className="d-flex align-items-center justify-content-start gap-3">
//                                             <Button
//                                                 onClick={handleDownload}
//                                                 variant="contained"
//                                                 disabled={filter?.EmpId === 0 || filter?.Name === "ALL"}
//                                             >
//                                                 Individual Report
//                                             </Button>
//                                             <Button
//                                                 onClick={() => {
//                                                     handleOverallDownload(filter?.From, filter?.To);
//                                                 }}
//                                             >
//                                                 Monthly Report
//                                             </Button>
//                                             <Button
//                                                 onClick={() => {
//                                                     setAddEmployeeDialogOpen(true);
//                                                 }}
//                                             >
//                                                 Cummulative Monthly Report
//                                             </Button>
//                                             <Button onClick={handleSummaryDownload}>Summary</Button>
//                                         </div>
//                                     </div>

//                                     <div className="px-2 row mb-4">
//                                         <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                                             <label>Employee</label>
//                                             <Select
//                                                 value={{ value: filter?.EmpId, label: filter?.Name }}
//                                                 onChange={(e) =>
//                                                     setFilter({
//                                                         ...filter,
//                                                         EmpId: e.value,
//                                                         Name: e.label,
//                                                     })
//                                                 }
//                                                 options={[
//                                                     { value: 0, label: `ALL` },
//                                                     ...employees.map((obj) => ({
//                                                         value: obj?.UserId,
//                                                         label: obj?.Name,
//                                                     })),
//                                                 ]}
//                                                 styles={customSelectStyles}
//                                                 isSearchable={true}
//                                                 placeholder={dropdownPlaceholder}
//                                             />
//                                         </div>

//                                         <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                                             <label>From</label>
//                                             <input
//                                                 type="month"
//                                                 className="cus-inpt"
//                                                 value={filter?.From?.slice(0, 7)}
//                                                 onChange={handleFromChange}
//                                             />
//                                         </div>
//                                         <div className="col-auto p-2 d-flex align-items-center">
//                                             <button
//                                                 className="btn btn-link ms-2 p-0 mt-3"
//                                                 onClick={handleRefresh}
//                                                 title="Refresh Departments & Employees"
//                                             >
//                                                 <Refresh fontSize="medium" />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     <FilterableTable
//                                         dataArray={attendanceData}
//                                         columns={[
//                                             {
//                                                 isCustomCell: true,
//                                                 Cell: ({ row }) => row.username,
//                                                 ColumnHeader: "Employee",
//                                                 isVisible: 1,
//                                                 width: "20%",
//                                                 CellProps: {
//                                                     sx: {
//                                                         padding: "10px",
//                                                         textAlign: "left",
//                                                         fontWeight: "bold",
//                                                     },
//                                                 },
//                                             },
//                                             {
//                                                 isCustomCell: true,
//                                                 Cell: ({ row }) =>
//                                                     formatAttendanceDate(row.LogDate || "--"),
//                                                 ColumnHeader: "Log Date",
//                                                 isVisible: 1,
//                                                 width: "20%",
//                                                 CellProps: {
//                                                     sx: {
//                                                         padding: "10px",
//                                                         textAlign: "center",
//                                                         color: "gray",
//                                                     },
//                                                 },
//                                             },
//                                             ...punchColumns,
//                                         ]}
//                                         EnableSerialNumber
//                                         CellSize="small"
//                                         disablePagination={false}
//                                     />
//                                 </CardContent>
//                             </Card>
//                         </>
//                     )}

//                     {viewMode === "department" && (
//                         <FilterableTable
//                             title={
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-3">
//                                         <Button
//                                             size="small mx-2"
//                                             variant="outlined"
//                                             onClick={() => dashboard()}
//                                         >
//                                             Dashboard
//                                         </Button>
//                                         <Button
//                                             size="small mx-2"
//                                             variant="outlined"
//                                             onClick={() => data()}
//                                         >
//                                             Employee
//                                         </Button>
//                                         <Button
//                                             size="small mx-2"
//                                             variant="outlined"
//                                             disabled
//                                             onClick={() => dataDepartment()}
//                                         >
//                                             Department
//                                         </Button>
//                                     </div>

//                                     <div className="row align-items-end">
//                                         <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                                             <label>Department</label>
//                                             <Select
//                                                 options={departments}
//                                                 isSearchable
//                                                 placeholder="ALL"
//                                                 value={selectedDepartment}
//                                                 styles={customSelectStyles}
//                                                 onChange={handleDepartmentChange}
//                                             />
//                                         </div>

//                                         <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                                             <label>Employee</label>
//                                             <Select
//                                                 options={employees}
//                                                 isSearchable
//                                                 placeholder="ALL"
//                                                 value={selectedEmployee}
//                                                 styles={customSelectStyles}
//                                                 onChange={setSelectedEmployee}
//                                                 isDisabled={!selectedDepartment}
//                                             />
//                                         </div>
//                                         <div className="col-auto p-2 d-flex align-items-center">
//                                             <button
//                                                 className="btn btn-link ms-2 p-0 mb-2"
//                                                 onClick={handleRefreshData}
//                                                 style={{ minWidth: "24px" }}
//                                                 title="Refresh Departments & Employees"
//                                             >
//                                                 <Refresh fontSize="small" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             }
//                             dataArray={filteredData}
//                             EnableSerialNumber
//                             columns={[
//                                 createCol("Department", "string", "Department"),
//                                 createCol(
//                                     "TotalMaleEmployees",
//                                     "number",
//                                     "Total Male Employees"
//                                 ),
//                                 createCol(
//                                     "TotalFemaleEmployees",
//                                     "number",
//                                     "Total Female Employees"
//                                 ),
//                                 createCol("TotalEmployees", "number", "Total Employees"),
//                                 createCol(
//                                     "TotalMalePresentToday",
//                                     "number",
//                                     "Total Male Present Today"
//                                 ),
//                                 createCol(
//                                     "TotalFemalePresentToday",
//                                     "number",
//                                     "Total Female Present Today"
//                                 ),
//                                 createCol("TotalPresentToday", "number", "Total Present Today"),
//                             ]}
//                             isExpendable={true}
//                             tableMaxHeight={550}
//                             expandableComp={ExpendableComponent1}
//                         />
//                     )}
//                 </>
//             ) : (
//                 <>
//                     <Dialog
//                         open={addEmployeeDialogOpen}
//                         maxWidth="md"
//                         PaperProps={{
//                             style: { width: "500px", height: "500px" },
//                         }}
//                     >
//                         <DialogTitle>Add Employee</DialogTitle>
//                         <DialogContent>
//                             <Autocomplete
//                                 multiple
//                                 options={[{ UserId: "all", Name: "ALL" }, ...dropdownEmployees]}
//                                 getOptionLabel={(option) => option.Name}
//                                 isOptionEqualToValue={(option, value) =>
//                                     option.UserId === value.UserId
//                                 }
//                                 value={
//                                     selectedEmployees.some((user) => user.UserId === "all")
//                                         ? [{ UserId: "all", Name: "ALL" }]
//                                         : selectedEmployees
//                                 }
//                                 onChange={(event, value) => {
//                                     if (value.some((selected) => selected.UserId === "all")) {
//                                         setSelectedEmployees(dropdownEmployees);
//                                     } else {
//                                         const uniqueValues = value.filter(
//                                             (val, index, self) =>
//                                                 index === self.findIndex((t) => t.UserId === val.UserId)
//                                         );
//                                         setSelectedEmployees(uniqueValues);
//                                     }
//                                 }}
//                                 renderInput={(params) => (
//                                     <TextField {...params} placeholder="Employees" />
//                                 )}
//                             />
//                         </DialogContent>
//                         <DialogActions className="d-flex justify-content-between flex-wrap">
//                             <Button
//                                 variant="outlined"
//                                 onClick={() => setSelectedEmployees([])}
//                             >
//                                 Clear
//                             </Button>
//                             <span>
//                                 <Button onClick={handleAddEmployeeClose}>Cancel</Button>
//                                 <Button onClick={handleOverallWithPunch}>Download</Button>
//                             </span>
//                         </DialogActions>
//                     </Dialog>

//                     <Card>
//                         <CardContent sx={{ minHeight: "50vh" }}>
//                             <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
//                                 <h6 className="fa-18">
//                                     <Button size="small" variant="outlined" className="mx-2">
//                                         EMPLOYEE
//                                     </Button>
//                                 </h6>

//                                 {(userTypeId === 1 || userTypeId === 0) && (
//                                     <div className="d-flex align-items-center justify-content-start gap-3">
//                                         <Button
//                                             onClick={handleDownload}
//                                             variant="contained"
//                                             disabled={filter?.EmpId === 0 || filter?.Name === "ALL"}
//                                         >
//                                             Individual Report
//                                         </Button>
//                                         <Button
//                                             onClick={() =>
//                                                 handleOverallDownload(filter?.From, filter?.To)
//                                             }
//                                         >
//                                             Monthly Report
//                                         </Button>
//                                         <Button onClick={() => setAddEmployeeDialogOpen(true)}>
//                                             Cumulative Monthly Report
//                                         </Button>
//                                         <Button onClick={handleSummaryDownload}>Summary</Button>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="px-2 row mb-4">
//                                 <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                                     <label>Employee</label>
//                                     <Select
//                                         value={{ value: filter?.EmpId, label: filter?.Name }}
//                                         onChange={(e) =>
//                                             setFilter({ ...filter, EmpId: e.value, Name: e.label })
//                                         }
//                                         options={[
//                                             { value: 0, label: "ALL" },
//                                             ...employees.map((obj) => ({
//                                                 value: obj.UserId,
//                                                 label: obj.Name,
//                                             })),
//                                         ]}
//                                         styles={customSelectStyles}
//                                         isSearchable
//                                         placeholder={dropdownPlaceholder}
//                                         isDisabled={isDropdownDisabled}
//                                     />
//                                 </div>

//                                 <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                                     <label>From</label>
//                                     <input
//                                         type="month"
//                                         className="cus-inpt"
//                                         value={filter?.From?.slice(0, 7)}
//                                         onChange={handleFromChange}
//                                     />
//                                 </div>
//                             </div>

//                             <FilterableTable
//                                 dataArray={attendanceData}
//                                 columns={[
//                                     {
//                                         isCustomCell: true,
//                                         Cell: ({ row }) => row.username,
//                                         ColumnHeader: "Employee",
//                                         isVisible: 1,
//                                         width: "20%",
//                                         CellProps: {
//                                             sx: {
//                                                 padding: "10px",
//                                                 textAlign: "left",
//                                                 fontWeight: "bold",
//                                             },
//                                         },
//                                     },
//                                     {
//                                         isCustomCell: true,
//                                         Cell: ({ row }) =>
//                                             formatAttendanceDate(row.LogDate || "--"),
//                                         ColumnHeader: "Log Date",
//                                         isVisible: 1,
//                                         width: "20%",
//                                         CellProps: {
//                                             sx: {
//                                                 padding: "10px",
//                                                 textAlign: "center",
//                                                 color: "gray",
//                                             },
//                                         },
//                                     },
//                                     ...punchColumns,
//                                 ]}
//                                 EnableSerialNumber
//                                 CellSize="small"
//                                 disablePagination={false}
//                             />
//                         </CardContent>
//                     </Card>
//                 </>
//             )}
//         </>
//     );
// };
// export default AttendanceNewScreen;













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
import { ISOString, isValidDate } from "../../Components/functions";
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
import * as XLSX from "xlsx";
import DefaultLeave from "./defaultLeave";
const useQuery = () => new URLSearchParams(useLocation().search);

const AttendanceNewScreen = ({ loadingOn, loadingOff }) => {
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
    To: getCurrentMonthYear(),
  };

  const [saleOrders, setSaleOrders] = useState([]);
  const [viewMode, setViewMode] = useState("default");
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

    const [year, month] = monthYear.split("-");

    return new Date(year, month, 0).getDate();
  };

  const [filters, setFilters] = useState({
    FromDate: new Date().toISOString().split("T")[0],
    ToDate: new Date().toISOString().split("T")[0],
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

    const today = new Date().toISOString().split("T")[0];
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

      const [year, month] = monthYear.split("-");

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
      address: `userModule/employeeActivity/summary?FromDate=${startDate}&ToDate=${endDate}`,
    });

    if (response.success) {
      const overallData = response.data;

      // Build all dates in month
      const getDateRange = (from, to) => {
        const allDates = [];
        const start = new Date(from);
        const end = new Date(to);
        let sundayCount = 0;

        while (start <= end) {
          const dateStr = start.toISOString().split("T")[0];
          allDates.push(dateStr);
          if (start.getDay() === 0) sundayCount++; // Sunday
          start.setDate(start.getDate() + 1);
        }

        return {
          days: allDates,
          sundayCount,
          totalDays: allDates.length,
        };
      };

      const { days: dateRange, sundayCount, totalDays } = getDateRange(startDate, endDate);

const summaryData = overallData.map((row) => {
  const punchDetails = Array.isArray(row.AttendanceDetails)
    ? row.AttendanceDetails
    : row.AttendanceDetails
    ? JSON.parse(row.AttendanceDetails)
    : [];

  let totalPresent = 0;
  let companyHoliday = 0;

  const workingDays = dateRange.filter(date => new Date(date).getDay() !== 0); // exclude Sundays

  workingDays.forEach(date => {
    const dayRecord = punchDetails.find(p => p.Date.startsWith(date));
    if (dayRecord) {
      if (dayRecord.AttendanceStatus === "P") {
        totalPresent++;
      } else if (dayRecord.AttendanceStatus === "H") {
        companyHoliday++;
      }
    }
  });

  const approvedLeave = row.ApprovedLeave || 0;
  const pendingLeave = row.PendingLeave || 0;
  const totalWorkingDays = workingDays.length;

  const totalAbsent =
    totalWorkingDays - (totalPresent + approvedLeave + companyHoliday);

  return {
    Name: row.Name,
    TotalPresent: totalPresent,
    ApprovedLeave: approvedLeave,
    PendingLeave: pendingLeave,
    CompanyHoliday: companyHoliday,
    TotalAbsent: totalAbsent < 0 ? 0 : totalAbsent,
    NumberOfSundays: sundayCount,
  };
});

// Create Excel Sheet
const ws = XLSX.utils.json_to_sheet(summaryData);

const headers = [
  "Name",
  "TotalPresent",
  "ApprovedLeave",
  "PendingLeave",
  "CompanyHoliday",
  "TotalAbsent",
  "NumberOfSundays",
];

// Add headers to the top
XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

// Create workbook and download
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary");

XLSX.writeFile(wb, `Attendance_Summary_${month}_${year}.xlsx`);

    }
  } catch (error) {
    console.error("Error downloading attendance summary:", error);
    toast.error("Failed to generate summary report");
  }
};



// const handleSummaryDownload = async () => {
//   try {
//     const fromDate = filter.From;
//     const [year, month] = fromDate.split("-");
//     const startDate = `${year}-${month}-01`;
//     const dayCount = getDaysInMonth(`${year}-${month}`);
//     const endDate = `${year}-${month}-${dayCount}`;

//     // Fetch all required data
//     const [attendanceRes, leaveRes, defaultLeaveRes] = await Promise.all([
//       fetchLink({ address: `userModule/employeActivity/employeeAttendanceModuledownload?FromDate=${startDate}&ToDate=${endDate}` }),
//       fetchLink({ address: `masters/leave?FromDate=${startDate}&ToDate=${endDate}` }),
//       fetchLink({ address: `masters/defaultLeave?FromDate=${startDate}&ToDate=${endDate}` }),
//     ]);

//     if (!attendanceRes.success) {
//       toast.error("Failed to fetch attendance data");
//       return;
//     }

//     const overallData = attendanceRes.data;
//     const allLeaves = leaveRes?.data ? leaveRes.data : [];
//     const defaultLeaves = defaultLeaveRes?.success ? defaultLeaveRes.data : [];

// const approvedLeaveMap = {};
// const pendingLeaveMap = {};

// allLeaves.forEach(leave => {
//   const userId = String(leave.User_Id);
//   if (!userId) return;

//   const status = leave.Status?.toLowerCase();
//   const from = new Date(leave.FromDate);
//   const to = new Date(leave.ToDate);

//   let current = new Date(from);
//   while (current <= to) {
//     const dateStr = current.toISOString().split("T")[0];

//     if (status === "approved") {
//       if (!approvedLeaveMap[userId]) approvedLeaveMap[userId] = {};
//       approvedLeaveMap[userId][dateStr] = true;
//       console.log(`✅ Approved leave set -> User: ${userId}, Date: ${dateStr}`);
//     } else {
//       if (!pendingLeaveMap[userId]) pendingLeaveMap[userId] = {};
//       pendingLeaveMap[userId][dateStr] = true;
//       console.log(`🕒 Pending leave set -> User: ${userId}, Date: ${dateStr}`);
//     }

//     current.setDate(current.getDate() + 1);
//   }
// });



//     const defaultLeaveDates = new Set(
//       defaultLeaves.map(d => d.Date?.split("T")[0]).filter(Boolean)
//     );

//     const getDateRange = (start, end) => {
//       const dates = [];
//       let current = new Date(start);
//       const endDate = new Date(end);
      
//       while (current <= endDate) {
//         dates.push(current.toISOString().split("T")[0]);
//         current.setDate(current.getDate() + 1);
//       }
//       return dates;
//     };

//     const dateRange = getDateRange(startDate, endDate);
//     const totalWorkingDays = dateRange.filter(date => new Date(date).getDay() !== 0).length;

//     const summaryData = overallData.map((employee) => {
//       const punchDetails = employee.AttendanceDetails ? JSON.parse(employee.AttendanceDetails) : [];
//       const userId = String(employee.EmployeeID);
      
//       let totalPresent = 0;
//       let totalApprovedLeave = 0;
//       let totalPendingLeave = 0;
//       let totalSundays = 0;
//       let totalDefaultLeave = 0;
//       let totalUnmarkedDays = 0;

//  dateRange.forEach(date => {
//   const dateObj = new Date(date);
//   const dateStr = dateObj.toISOString().split("T")[0];
//   const isSunday = dateObj.getDay() === 0;
//   const isDefaultLeave = defaultLeaveDates.has(dateStr);
//   const attendanceRecord = punchDetails.find(d => d.Date === dateStr);

//   const isApprovedLeave = approvedLeaveMap[userId]?.[dateStr] === true;
//   const isPendingLeave = pendingLeaveMap[userId]?.[dateStr] === true;

//   console.log(`📅 ${dateStr} - User ${String(userId)} | Approved: ${isApprovedLeave} | Pending: ${isPendingLeave}`);

//   if (isSunday) {
//     totalSundays++;
//     if (attendanceRecord?.AttendanceStatus === "P") totalPresent++;
//     return;
//   }

//   if (isDefaultLeave) {
//     totalDefaultLeave++;
//     if (attendanceRecord?.AttendanceStatus === "P") totalPresent++;
//     return;
//   }

//   if (isApprovedLeave) {
//     totalApprovedLeave++;
//     totalPresent++;
//     return;
//   }

//   if (isPendingLeave) {
//     totalPendingLeave++;
//     return;
//   }

//   if (attendanceRecord) {
//     if (attendanceRecord.AttendanceStatus === "P") {
//       totalPresent++;
//     } else {
//       totalUnmarkedDays++;
//     }
//   } else {
//     totalUnmarkedDays++;
//   }
// });



//       return {
//         EmployeeName: employee.Name,
//         EmployeeID: employee.EmployeeID,
//         Month: `${month}-${year}`,
//         Branch: employee.Branch,
//         TotalWorkingDays: totalWorkingDays,
//         TotalSundays: totalSundays,
//         TotalDefaultLeave: totalDefaultLeave,
//         TotalPresent: totalPresent,
//         TotalApprovedLeave: totalApprovedLeave,
//         TotalPendingLeave: totalPendingLeave,
//         TotalUnmarkedDays: totalUnmarkedDays,
//       };
//     });

//     const exportData = summaryData.map(item => ({
//       "Employee Name": item.EmployeeName,
//       "Employee ID": item.EmployeeID,
//       "Month": item.Month,
//       "Branch": item.Branch,
//       "Total Working Days": item.TotalWorkingDays,
//       "Sundays": item.TotalSundays,
//       "Company Holidays": item.TotalDefaultLeave,
//       "Present Days": item.TotalPresent,
//       "Approved Leave Days": item.TotalApprovedLeave,
//       "Pending Leave Days": item.TotalPendingLeave,
//       "Absent Days": item.TotalUnmarkedDays,
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary");
//     XLSX.writeFile(wb, `Attendance_Summary_${month}_${year}.xlsx`);

//   } catch (error) {
//     console.error("Error downloading summary report:", error);
//     toast.error("Failed to generate attendance report");
//   }
// };

  const handleDownload = () => {
    const maxPunches = 4;

    const exportData = attendanceData.map((row) => {
      const punchDetails = row.AttendanceDetails
        ? row.AttendanceDetails.split(",").filter((p) => p.trim() !== "")
        : [];

      let attendanceStatus = row.AttendanceStatus;

      if (!attendanceStatus) {
        attendanceStatus = punchDetails.length === 0 ? "A" : "P";
      }

      const punchColumns = {};
      for (let i = 0; i < maxPunches; i++) {
        punchColumns[`Punch${i + 1}`] = punchDetails[i]
          ? punchDetails[i].trim()
          : "--";
      }

      return {
        Employee: row.username || row.Employee,
        "Log Date": formatAttendanceDate(row.LogDate),
        "Attendance Status": attendanceStatus,
        ...punchColumns,
      };
    });

    const columnsOrder = [
      "Employee",
      "Log Date",
      "Attendance Status",
      "Punch1",
      "Punch2",
      "Punch3",
      "Punch4",
      "Punch5",
      "Punch6"
    ];

    const reorderedData = exportData.map((row) =>
      columnsOrder.reduce((acc, col) => {
        acc[col] = row[col] || "--";
        return acc;
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(reorderedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  const MAX_PUNCHES = 6;

  function formatToAmPm(timeString) {
    if (!timeString) return "--";
    const [hourStr, minuteStr] = timeString.split(":");
    if (!hourStr || !minuteStr) return "--";

    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  }

  const punchColumns = Array.from({ length: MAX_PUNCHES }, (_, index) => ({
    isCustomCell: true,
    ColumnHeader: `Punch ${index + 1}`,
    isVisible: 1,
    width: "13%",
    CellProps: {
      sx: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
      },
    },
    Cell: ({ row }) => {
      const punches = row.AttendanceDetails
        ? row.AttendanceDetails.split(",")
            .map((p) => p.trim())
            .filter((p) => p !== "")
        : [];

      const punch = punches[index] || "--";
      const rawTime = punch.split(":in(")[0];
      const formattedTime = punch !== "--" ? formatToAmPm(rawTime) : "--";

      return formattedTime !== "--" ? (
        <Chip
          label={formattedTime}
          variant="outlined"
          size="small"
          sx={{ color: "green", margin: "2px" }}
        />
      ) : (
        <div style={{ color: "gray" }}>--</div>
      );
    },
  }));

  const formatAttendanceDate = (logDateTime) => {
    if (!logDateTime) return "--";
    const [date] = logDateTime.split("T");
    return `${date} `;
  };


  
const handleOverallDownload = async () => {
  try {
    const fromDate = filter.From;
    const [year, month] = fromDate.split("-");
    const startDate = `${year}-${month}-01`;
    const dayCount = getDaysInMonth(`${year}-${month}`);
    const endDate = `${year}-${month}-${dayCount}`;

    const [attendanceRes, leaveRes, defaultLeaveRes] = await Promise.all([
      fetchLink({
        address: `userModule/employeActivity/employeeAttendanceModuledownload?FromDate=${startDate}&ToDate=${endDate}`,
      }),
      fetchLink({
        address: `masters/leave?FromDate=${startDate}&ToDate=${endDate}`,
      }),
      fetchLink({
        address: `masters/defaultLeave?FromDate=${startDate}&ToDate=${endDate}`,
      }),
    ]);

    if (!attendanceRes.success) throw new Error("Attendance data failed");

    const leaveMap = {};
    const defaultLeaveDates = new Set();

 
    (leaveRes?.data || []).forEach((leave) => {
      if (leave.Status?.toUpperCase() !== "APPROVED") return;

      const userId = leave.User_Id;
      if (!userId) return;

      let current = new Date(leave.FromDate);
      const leaveEnd = new Date(leave.ToDate);

      while (current <= leaveEnd) {
        const dateStr = current.toISOString().split("T")[0];
        if (!leaveMap[userId]) leaveMap[userId] = {};
        leaveMap[userId][dateStr] = true;
        current.setDate(current.getDate() + 1);
      }
    });

    (defaultLeaveRes?.data || []).forEach((defaultLeave) => {
      const dateStr = new Date(defaultLeave.Date).toISOString().split("T")[0];
      defaultLeaveDates.add(dateStr);
    });

    const { days: dateRange } = getDateRange(startDate, endDate);
    const exportData = attendanceRes.data.map((emp) => {
      const attendanceDetails = tryParseJSON(emp.AttendanceDetails) || [];
      const dailyStatus = {};
      let presentCount = 0;

       const attendanceLookup = {};
      attendanceDetails.forEach((record) => {
        const dateStr = new Date(record.Date).toISOString().split("T")[0];
        attendanceLookup[dateStr] = {
          status: record.AttendanceStatus,
          hasPunch: record.Punch1 !== "[]",
        };
      });

      dateRange.forEach((date, index) => {
        const dayKey = `Day ${index + 1}`;
        const userId = emp.User_Mgt_Id;
        const dateStr = new Date(date).toISOString().split("T")[0];
        const isSunday = new Date(date).getDay() === 0;

        const attendanceRecord = attendanceLookup[dateStr];
        const attendanceStatus = attendanceRecord?.status;
        const hasPunch = attendanceRecord?.hasPunch;
        if (defaultLeaveDates.has(dateStr)) {
          if (attendanceStatus === "P" && hasPunch) {
            dailyStatus[dayKey] = "P";
            presentCount++;
          } else {
            dailyStatus[dayKey] = "DL";
          }
        } else if (isSunday) {
          dailyStatus[dayKey] = "H";
        } else if (leaveMap[userId]?.[dateStr]) {
          dailyStatus[dayKey] = "L";
        } else if (attendanceStatus === "L") {
          dailyStatus[dayKey] = "L";
        } else if (attendanceStatus === "P") {
          dailyStatus[dayKey] = hasPunch ? "P" : "A";
          if (hasPunch) presentCount++;
        } else if (attendanceStatus === "H") {
          dailyStatus[dayKey] = "H";
        } else {
          dailyStatus[dayKey] = "A";
        }
      });

      return {
        EmployeeName: emp.username || emp.Name,
        TotalPresent: presentCount,
        ...dailyStatus,
      };
    });

    const headers = [
      "EmployeeName",
      "TotalPresent",
      ...dateRange.map((_, i) => `Day ${i + 1}`),
    ];
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${month}_${year}.xlsx`);
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to generate report");
  }
};

  
  
  function getDateRange(start, end) {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return { days: dates, count: dates.length };
  }

  function tryParseJSON(jsonString) {
    try {
      return jsonString ? JSON.parse(jsonString) : [];
    } catch {
      return [];
    }
  }

const handleOverallWithPunch = async () => {
  try {
    const maxPunches = 6;


    const firstLogDate = attendanceData[0]?.LogDate;
    if (!firstLogDate) {
      toast.error("No attendance data found");
      return;
    }

    const dateObj = new Date(firstLogDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  
    const defaultLeaveResponse = await fetchLink({
      address: `masters/defaultLeave?FromDate=${startDate}&ToDate=${endDate}`,
    });
  
    const defaultLeaveData = defaultLeaveResponse?.success ? defaultLeaveResponse.data : [];
  const defaultLeaveDates = new Set(
  defaultLeaveData
    .map(leave => leave.Date ? leave.Date.split('T')[0] : null)
    .filter(date => date !== null)
);
  
    const leaveResponse = await fetchLink({
      address: `masters/leave?FromDate=${startDate}&ToDate=${endDate}`,
    });
    const leaveData = leaveResponse.data || [];

    const leaveMap = {};
    leaveData.forEach((leave) => {
      if (leave.Status?.toLowerCase() !== "approved") return;

      const userId = String(leave.User_Id);
      if (!userId) return;

      const parseDate = (dateStr) => {
        const parts = dateStr.split(/[-/]/) || [];
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            return parts[0].length === 2
              ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
              : new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
          }
          return new Date(dateStr);
        }
        return new Date(dateStr);
      };

      const leaveStart = parseDate(leave.FromDate);
      const leaveEnd = parseDate(leave.ToDate);

      let currentDate = new Date(leaveStart);
      while (currentDate <= leaveEnd) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!leaveMap[userId]) leaveMap[userId] = {};
        
        if (currentDate.getDay() !== 0) { // Skip Sundays
          leaveMap[userId][dateStr] = true;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // 5. Filter and group attendance data
    const filteredAttendanceData = attendanceData.filter((row) =>
      selectedEmployees.some(
        (user) =>
          String(user.UserId) === String(row.User_Mgt_Id) ||
          user.UserId === "ALL"
      )
    );

    const groupedData = filteredAttendanceData.reduce((acc, row) => {
      acc[row.username] = acc[row.username] || [];
      acc[row.username].push(row);
      return acc;
    }, {});

    if (Object.keys(groupedData).length === 0) {
      toast.error("No attendance data found");
      return;
    }

    // 6. Generate Excel sheets
    const wb = XLSX.utils.book_new();

    Object.entries(groupedData).forEach(([username, userAttendance]) => {
      const exportData = userAttendance.map((row) => {
        const logDate = new Date(row.LogDate);
        const dateStr = logDate.toISOString().split("T")[0];
        const isSunday = logDate.getDay() === 0;
        const userId = String(row.User_Mgt_Id);

        // Attendance status priority:
        // 1. Default Leave (DL)
        // 2. Approved Leave (L)
        // 3. Sunday (H)
        // 4. Present/Absent based on punches
        let attendanceStatus;
        if (defaultLeaveDates.has(dateStr)) {
          attendanceStatus = "DL";
        } else if (leaveMap[userId]?.[dateStr]) {
          attendanceStatus = "L";
        } else if (isSunday) {
          attendanceStatus = "H";
        } else {
          const punches = row.AttendanceDetails?.split(",").map((d) => d.trim()) || [];
          attendanceStatus = punches.some((p) => p && p !== "--") ? "P" : "A";
        }

        // Punch columns
        const punchColumns = {};
        const punches = row.AttendanceDetails?.split(",").map((d) => d.trim()) || [];
        for (let i = 0; i < maxPunches; i++) {
          punchColumns[`Punch ${i + 1}`] = punches[i] || "--";
        }

        return {
          Employee: username,
          "Log Date": formatAttendanceDate(row.LogDate),
          "Attendance Status": attendanceStatus,
          ...punchColumns,
        };
      });

      // Reorder columns
      const columnsOrder = [
        "Employee",
        "Log Date",
        "Attendance Status",
        ...Array.from({ length: maxPunches }, (_, i) => `Punch ${i + 1}`),
      ];

      const reorderedData = exportData.map((row) =>
        columnsOrder.reduce((acc, col) => {
          acc[col] = row[col] || "--";
          return acc;
        }, {})
      );

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(reorderedData),
        username.slice(0, 31)
      );
    });

    // 7. Export Excel file
    const fileName = `Attendance_Report_${new Date().toLocaleString(
      "default",
      { month: "long" }
    )}_${year}.xlsx`;
    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error("Error generating report:", error);
    toast.error("Failed to generate report");
  }
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
        Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
      },
    })
      .then((data) => {
        if (data.success) {
          let filteredEmployees = [];

          if (
            Number(userTypeId) === 1 ||
            Number(userTypeId) === 0 ||
            Number(Add_Rights) === 1
          ) {
            filteredEmployees = data.data;
            setFilter((prev) => ({ ...prev, EmpId: 0, Name: "ALL" }));
            setIsDropdownDisabled(false);
            setDropdownPlaceholder("ALL");
          } else {
            filteredEmployees = data.data.filter(
              (employee) => employee.UserId === userId
            );
            setFilter((prev) => ({
              ...prev,
              EmpId: userId,
              Name: storage?.Name,
            }));
            setIsDropdownDisabled(true);
            setDropdownPlaceholder(storage?.Name);
          }

          setEmployees(filteredEmployees);
        }
      })
      .catch((e) => console.error("Error fetching employees:", e));
  }, [
    storage?.UserTypeId,
    storage?.UserId,
    storage?.Company_id,
    storage?.Name,
    reload,
  ]);

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
          Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
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

  const data = () => setViewMode("employee");
  const dataDepartment = () => setViewMode("department");
  const defaultLeave = () => setViewMode("defaultLeave");



  const dashboard = () => {
    setFilters((prev) => ({
      ...prev,
      FromDate: prev.FromDate || new Date().toISOString().split("T")[0],
      ToDate: prev.ToDate || new Date().toISOString().split("T")[0],
    }));
    setViewMode("default");
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
              Total Employees
            </th>
            <th
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Present Today
            </th>
          </tr>
        </thead>
        <tbody>
          {departments && departments.length > 0 ? (
            departments.map((data, index) => (
              <tr key={index} onClick={() => toggleExpand(data.Department)}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {data?.Department || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        marginRight: "100px", // Increased from 15px to 100px
                        minWidth: "60px", // Ensures consistent spacing
                      }}
                    >
                      {data?.TotalEmployees || "-"}
                    </span>
                    <span style={{ fontSize: "1rem" }}>
                      Male / Female: {data?.TotalMaleEmployees || "0"} /{" "}
                      {data?.TotalFemaleEmployees || "0"}
                    </span>
                  </div>
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        marginRight: "100px", // Increased from 15px to 100px
                        minWidth: "60px", // Ensures consistent spacing
                      }}
                    >
                      {data?.TotalPresentToday || "-"}
                    </span>
                    <span style={{ fontSize: "1rem" }}>
                      Male / Female: {data?.TotalMalePresentToday || "0"} /{" "}
                      {data?.TotalFemalePresentToday || "0"}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: "8px" }}>
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
        Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
      },
    })
      .then((data) => {
        if (data.success) {
          let filteredEmployees = [];

          if (
            Number(userTypeId) === 1 ||
            Number(userTypeId) === 0 ||
            Number(Add_Rights) === 1
          ) {
            filteredEmployees = data.data;
            setFilter((prev) => ({ ...prev, EmpId: 0, Name: "ALL" }));
            setIsDropdownDisabled(false);
            setDropdownPlaceholder("ALL");
          } else {
            filteredEmployees = data.data.filter(
              (employee) => employee.UserId === userId
            );
            setFilter((prev) => ({
              ...prev,
              EmpId: userId,
              Name: storage?.Name,
            }));
            setIsDropdownDisabled(true);
            setDropdownPlaceholder(storage?.Name);
          }

          setEmployees(filteredEmployees);
        }
      })
      .catch((e) => console.error("Error fetching employees:", e))
      .finally(() => {
        if (loadingOff) loadingOff();
        setReload((prev) => !prev);
      });
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

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
              width: "20%",
              borderCollapse: "collapse",
              border: "1px solid #ccc",
              height:'10px'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "2px",
                    textAlign: "left",
                  }}
                >
                  Emp_Name
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "2px",
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
const handleViewChange = (newView) => {
  setViewMode(newView);
};
  useEffect(() => {
    const userTypeId = storage?.UserTypeId;
    const userId = storage?.UserId;
    const companyId = storage?.Company_id;

    fetchLink({
      address: `masters/users/employee/dropDown?Company_id=${companyId}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
      },
    })
      .then((data) => {
        if (data.success) {
          let filteredEmployees = [];

          if (
            Number(userTypeId) === 1 ||
            Number(userTypeId) === 0 ||
            Number(Add_Rights) === 1
          ) {
            filteredEmployees = data.data;
            setFilter((prev) => ({ ...prev, EmpId: 0, Name: "ALL" }));
            setIsDropdownDisabled(false);
            setDropdownPlaceholder("ALL");
          } else {
            filteredEmployees = data.data.filter(
              (employee) => employee.UserId === userId
            );
            setFilter((prev) => ({
              ...prev,
              EmpId: userId,
              Name: storage?.Name,
            }));
            setIsDropdownDisabled(true);
            setDropdownPlaceholder(storage?.Name);
          }

          setEmployees(filteredEmployees);
        }
      })
      .catch((e) => console.error("Error fetching employees:", e));
  }, [
    storage?.UserTypeId,
    storage?.UserId,
    storage?.Company_id,
    storage?.Name,
  ]);

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
    if (!departmentWiseCounts || !departmentWiseCounts.length) return [];

    const filteredDepartments = departmentWiseCounts.filter((item) => {
      return selectedDepartment
        ? item.Department === selectedDepartment.label
        : true;
    });

    return filteredDepartments.map((dept) => {
      const employeeList = dept.employees || dept.Employees || [];

      const filteredEmployees = selectedEmployee
        ? employeeList.filter((emp) => {
            if (!emp.Emp_Name) return false;
            return (
              emp.Emp_Name.trim().toLowerCase() ===
              selectedEmployee.label.trim().toLowerCase()
            );
          })
        : employeeList;

      return {
        ...dept,
        Employees: filteredEmployees,
      };
    });
  }, [departmentWiseCounts, selectedDepartment, selectedEmployee]);

  return (
    <>
      {Number(userTypeId) === 0 || Number(userTypeId) === 1 ? (
        <>
          {viewMode === "default" && (
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
                  <Button
                    size="small mx-2"
                    variant="outlined"
                    onClick={() => defaultLeave()}
                  >
                    Defined Leave
                  </Button>
                  <div className="d-flex align-items-center justify-content-start gap-3">
                    <label>From Date</label>
                    <input
                      type="date"
                      onChange={(e) =>
                        setFilters({ ...filters, FromDate: e.target.value })
                      }
                      value={filters?.FromDate}
                      className="cus-inpt w-auto p-1"
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-start gap-3">
                    <label>To Date</label>
                    <input
                      type="date"
                      onChange={(e) =>
                        setFilters({ ...filters, ToDate: e.target.value })
                      }
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
                {
                  isVisible: 1,
                  ColumnHeader: "Tot.Emp",
                  isCustomCell: true,
                  Cell: ({ row }) => {
                    const total = row?.TotalEmployees ?? 0;
                    const male = row?.TotalMaleEmployees ?? 0;
                    const female = row?.TotalFemaleEmployees ?? 0;
                    return (
                      <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                        <div>{total}</div>
                        <div style={{ fontSize: "1rem", fontWeight: "normal" }}>
                          Male / Female: {male} / {female}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  isVisible: 1,
                  ColumnHeader: "Tot.Pre.Today",
                  isCustomCell: true,
                  Cell: ({ row }) => {
                    const total = row?.TotalPresentToday ?? 0;
                    const male = row?.TotalMalePresentToday ?? 0;
                    const female = row?.TotalFemalePresentToday ?? 0;
                    return (
                      <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                        <div>{total}</div>
                        <div style={{ fontSize: "1rem", fontWeight: "normal" }}>
                          Male / Female: {male} / {female}
                        </div>
                      </div>
                    );
                  },
                },
              ]}
              isExpendable={true}
              tableMaxHeight={550}
              expandableComp={ExpendableComponent}
            />
          )}

          {viewMode === "employee" && (
            <>
              <Dialog
                open={addEmployeeDialogOpen}
                maxWidth="md"
                PaperProps={{
                  style: { width: "500px", height: "500px" },
                }}
              >
                <DialogTitle>Add Employee</DialogTitle>
                <DialogContent>
                  <Autocomplete
                    multiple
                    options={[
                      { UserId: "all", Name: "ALL" },
                      ...dropdownEmployees,
                    ]}
                    getOptionLabel={(option) => option.Name}
                    isOptionEqualToValue={(option, value) =>
                      option.UserId === value.UserId
                    }
                    onChange={(event, value) => {
                      if (value.some((selected) => selected.UserId === "all")) {
                        setSelectedEmployees(dropdownEmployees);
                      } else {
                        const uniqueValues = value.filter(
                          (val, index, self) =>
                            index ===
                            self.findIndex((t) => t.UserId === val.UserId)
                        );
                        setSelectedEmployees(uniqueValues);
                      }
                    }}
                    value={
                      selectedEmployees.some((user) => user.UserId === "all")
                        ? [{ UserId: "all", Name: "ALL" }]
                        : selectedEmployees
                    }
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
                <CardContent sx={{ minHeight: "50vh" }}>
                  <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                    <h6 className="fa-18">
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
                        disabled
                        onClick={() => data()}
                      >
                        EMPLOYEE
                      </Button>
                      <Button
                        size="small mx-2"
                        variant="outlined"
                        onClick={() => dataDepartment()}
                      >
                        Department
                      </Button>
                       <Button
                    size="small mx-2"
                    variant="outlined"
                    onClick={() => defaultLeave()}
                  >
                        Defined Leave
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
                          setAddEmployeeDialogOpen(true);
                        }}
                      >
                        Cummulative Report
                      </Button>
                      <Button onClick={handleSummaryDownload}>Summary</Button>
                    </div>
                  </div>

                  <div className="px-2 row mb-4">
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                      <label>Employee</label>
                      <Select
                        value={{ value: filter?.EmpId, label: filter?.Name }}
                        onChange={(e) =>
                          setFilter({
                            ...filter,
                            EmpId: e.value,
                            Name: e.label,
                          })
                        }
                        options={[
                          { value: 0, label: `ALL` },
                          ...employees.map((obj) => ({
                            value: obj?.UserId,
                            label: obj?.Name,
                          })),
                        ]}
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
                        ColumnHeader: "Employee",
                        isVisible: 1,
                        width: "20%",
                        CellProps: {
                          sx: {
                            padding: "10px",
                            textAlign: "left",
                            fontWeight: "bold",
                          },
                        },
                      },
                      {
                        isCustomCell: true,
                        Cell: ({ row }) =>
                          formatAttendanceDate(row.LogDate || "--"),
                        ColumnHeader: "Log Date",
                        isVisible: 1,
                        width: "20%",
                        CellProps: {
                          sx: {
                            padding: "10px",
                            textAlign: "center",
                            color: "gray",
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
          )}

          {viewMode === "department" && (
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
                     <Button
                    size="small mx-2"
                    variant="outlined"
                    onClick={() => defaultLeave()}
                  >
                      Defined Leave
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
                        style={{ minWidth: "24px" }}
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
                createCol(
                  "TotalMaleEmployees",
                  "number",
                  "Total Male Employees"
                ),
                createCol(
                  "TotalFemaleEmployees",
                  "number",
                  "Total Female Employees"
                ),
                createCol("TotalEmployees", "number", "Total Employees"),
                createCol(
                  "TotalMalePresentToday",
                  "number",
                  "Total Male Present Today"
                ),
                createCol(
                  "TotalFemalePresentToday",
                  "number",
                  "Total Female Present Today"
                ),
                createCol("TotalPresentToday", "number", "Total Present Today"),
              ]}
              isExpendable={true}
              tableMaxHeight={550}
              expandableComp={ExpendableComponent1}
            />
          )}

         {viewMode === "defaultLeave" && (
  <DefaultLeave
    currentView={viewMode}
    onViewChange={handleViewChange}
    departments={departments}
    selectedDepartment={selectedDepartment}
    handleDepartmentChange={handleDepartmentChange}
    employees={employees}
    selectedEmployee={selectedEmployee}
    setSelectedEmployee={setSelectedEmployee}
    handleRefreshData={handleRefreshData}
  />
          )}
        </>
      ) : (
        <>
          <Dialog
            open={addEmployeeDialogOpen}
            maxWidth="md"
            PaperProps={{
              style: { width: "500px", height: "500px" },
            }}
          >
            <DialogTitle>Add Employee</DialogTitle>
            <DialogContent>
              <Autocomplete
                multiple
                options={[{ UserId: "all", Name: "ALL" }, ...dropdownEmployees]}
                getOptionLabel={(option) => option.Name}
                isOptionEqualToValue={(option, value) =>
                  option.UserId === value.UserId
                }
                value={
                  selectedEmployees.some((user) => user.UserId === "all")
                    ? [{ UserId: "all", Name: "ALL" }]
                    : selectedEmployees
                }
                onChange={(event, value) => {
                  if (value.some((selected) => selected.UserId === "all")) {
                    setSelectedEmployees(dropdownEmployees);
                  } else {
                    const uniqueValues = value.filter(
                      (val, index, self) =>
                        index === self.findIndex((t) => t.UserId === val.UserId)
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
              <Button
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
            <CardContent sx={{ minHeight: "50vh" }}>
              <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                <h6 className="fa-18">
                  <Button size="small" variant="outlined" className="mx-2">
                    EMPLOYEE
                  </Button>
                </h6>

                {(userTypeId === 1 || userTypeId === 0) && (
                  <div className="d-flex align-items-center justify-content-start gap-3">
                    <Button
                      onClick={handleDownload}
                      variant="contained"
                      disabled={filter?.EmpId === 0 || filter?.Name === "ALL"}
                    >
                      Individual Report
                    </Button>
                    <Button
                      onClick={() =>
                        handleOverallDownload(filter?.From, filter?.To)
                      }
                    >
                      Monthly Report
                    </Button>
                    <Button onClick={() => setAddEmployeeDialogOpen(true)}>
                      Cumulative Monthly Report
                    </Button>
                    <Button onClick={handleSummaryDownload}>Summary</Button>
                  </div>
                )}
              </div>

              <div className="px-2 row mb-4">
                <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                  <label>Employee</label>
                  <Select
                    value={{ value: filter?.EmpId, label: filter?.Name }}
                    onChange={(e) =>
                      setFilter({ ...filter, EmpId: e.value, Name: e.label })
                    }
                    options={[
                      { value: 0, label: "ALL" },
                      ...employees.map((obj) => ({
                        value: obj.UserId,
                        label: obj.Name,
                      })),
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
                    ColumnHeader: "Employee",
                    isVisible: 1,
                    width: "20%",
                    CellProps: {
                      sx: {
                        padding: "10px",
                        textAlign: "left",
                        fontWeight: "bold",
                      },
                    },
                  },
                  {
                    isCustomCell: true,
                    Cell: ({ row }) =>
                      formatAttendanceDate(row.LogDate || "--"),
                    ColumnHeader: "Log Date",
                    isVisible: 1,
                    width: "20%",
                    CellProps: {
                      sx: {
                        padding: "10px",
                        textAlign: "center",
                        color: "gray",
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
      )}
    </>
  );
};
export default AttendanceNewScreen;
