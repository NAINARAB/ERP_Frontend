import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../Components/filterableTable2";
import { MyContext } from "../../Components/context/contextProvider";
// import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    CardContent,
    Button,
    // Autocomplete,
    // TextField,
} from "@mui/material";

import { toast } from "react-toastify";
// import { Search, Refresh, Tune } from "@mui/icons-material";
import { useContext } from "react";
function LeaveMaster({ loadingOn, loadingOff }) {
    const initialValue = {
        FromDate: new Date().toISOString().split("T")[0],
        ToDate: new Date().toISOString().split("T")[0],
        EmpId: "0",
        Name: "ALL",
    };

    const storage = JSON.parse(localStorage.getItem("user"));
    // const navigate = useNavigate();
    // const location = useLocation();
    // const stateDetails = location.state;
    const [reload, setReload] = useState(false);
    // const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);

    const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
    // const [dropdownEmployees, setDropdownEmployees] = useState([]);

    // const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [filter, setFilter] = useState(initialValue);
    const [employees, setEmployees] = useState([]);

    const { contextObj } = useContext(MyContext);
    const Add_Rights = contextObj?.Add_Rights;

    const [dropdownPlaceholder, setDropdownPlaceholder] = useState("ALL");
    const [openDialogApply, setopenDialogApply] = useState(false);

    const [fromDate, setFromDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
    const [noOfDays, setNoOfDays] = useState(0.5);
    const [session, setSession] = useState("FN");
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
    const [leaveType, setLeaveType] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [reason, setReason] = useState("");
    const [approverReason, setApproverReason] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedInCharge, setSelectedInCharge] = useState(null);
    const [userData, setUserData] = useState([]);
    const [approveDialog, setApproveDialog] = useState(false);
    const [approveData, setApproveData] = useState([]);
    const [selectedEditData, setSelectedEditData] = useState(null);
    const [status, setStatus] = useState("");
    const [employeeList, setEmployeeList] = useState([]);
    const [employeeApply, setEmployeeApply] = useState({ EmpId: null, Name: "" });

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
                    const userOptions = data.data.map((user) => ({
                        value: user.UserId,
                        label: user.Name,
                    }));
                    setUsers(userOptions);
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
                    setEmployeeList(filteredEmployees);
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

    const applyLeave = () => {
        setopenDialogApply(true);
    };

    useEffect(() => {
        fetchLink({ address: `masters/leaveType/dropDown` }).then((data) => {
            if (data.success) {
                setLeaveTypeOptions(data);
            }
        });
    }, []);

    useEffect(() => {
        const selectedUserId = storage?.UserId;

        fetchLink({
            address: `masters/approveData?userId=${selectedUserId}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
            },
        })
            .then((data) => {
                if (data.success) {
                    setApproveData(data.data);
                }
            })
            .catch((e) => console.error("Error fetching departments:", e));
    }, [approveDialog, reload]);

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

    const handleDateChange = (type, value) => {
        if (type === "from") {
            setFromDate(value);
            calculateDays(value, toDate, session);
        } else {
            setToDate(value);
            calculateDays(fromDate, value, session);
        }
    };
    const handleSessionChange = (value) => {
        setSession(value);
        calculateDays(fromDate, toDate, value);
    };

    const resetForm = () => {
        setEmployeeApply({ EmpId: "", Name: "" });
        setFromDate(new Date().toISOString().split("T")[0]);
        setToDate(new Date().toISOString().split("T")[0]);
        setSession("Full");
        setNoOfDays(1);
        setLeaveType(null);
        setSelectedDepartment(null);
        setSelectedInCharge(null);
        setReason("");
        setApproverReason("");
    };

    const fetchLeaveList = () => {
        const userTypeId = storage?.UserTypeId;
        const selectedUserId = filter?.EmpId || storage?.UserId;

        fetchLink({
            address: `masters/leave?UserId=${selectedUserId}&UserTypeId=${userTypeId}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
            },
        })
            .then((data) => {
                if (data.success) {
                    setUserData(data.data);
                }
            })
            .catch((e) => console.error("Error fetching departments:", e));
    };

    useEffect(() => {
        fetchLeaveList();
    }, [storage?.Company_id, reload]);

    const calculateDays = (from, to, sessionVal) => {
        const start = new Date(from);
        const end = new Date(to);

        const sameDay = start.toDateString() === end.toDateString();

        if (sameDay) {
            if (sessionVal === "Full") {
                setNoOfDays(1);
            } else {
                setNoOfDays(0.5);
            }
        } else {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setNoOfDays(diffDays);
        }
    };

    const onsubmit = () => {
        try {
            const isEdit = !!selectedEditData?.Id;

            const body = {
                User_Id: Number(employeeApply.EmpId),
                FromDate: fromDate,
                ToDate: toDate,
                Session: session,
                NoOfDays: parseFloat(noOfDays),
                LeaveType_Id: Number(leaveType?.Id),
                Department: selectedDepartment?.label || "",
                InCharge: Number(selectedInCharge?.value || selectedInCharge?.Id),
                Reason: reason,
                Created_By: storage ? storage?.UserId : null,
                Approved_By: storage ? storage?.UserId : null,

                Status: status,
                Approver_Reason: approverReason,
            };

            if (isEdit) {
                body.Id = Number(selectedEditData.Id);
            }

            fetchLink({
                address: `masters/leave`,
                method: isEdit ? "PUT" : "POST",
                bodyData: body,
            })
                .then((data) => {
                    if (data.success) {
                        resetForm();
                        setopenDialogApply(false);
                        setReload(!reload);
                        setSelectedEditData(null);
                    } else {
                        toast.error(data.message);
                    }
                })
                .catch((e) => console.error(e));
        } catch (e) {
            console.error("Failed to submit", e);
        }
    };

    useEffect(() => {
        const selectedUserId = filter?.EmpId === "0" ? "" : filter?.EmpId;
        const fromDate = filter?.FromDate;
        const toDate = filter?.ToDate;

        if (!fromDate || !toDate) return;

        fetchLink({
            address: `masters/leave?UserId=${selectedUserId}&FromDate=${fromDate}&ToDate=${toDate}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("Autheticate_Id")}`,
            },
        })
            .then((data) => {
                if (data.success) {
                    setUserData(data.data || []);
                }
            })
            .catch((e) => console.error("Error fetching leave data:", e));
    }, [filter?.EmpId, filter?.FromDate, filter?.ToDate, reload]);

    useEffect(() => {
        if (noOfDays >= 1) {
            setSession("Full");
        }
    }, [noOfDays]);

    const listingData = () => {
        setApproveDialog(true);
    };

    const handleEdit = (row) => {
        setSelectedEditData(row);

        // const matchedEmployee = employees.find(
        //   (emp) =>
        //     emp.UserId == row.User_Id || emp.Id == row.User_Id
        // );

        setEmployeeApply({
            EmpId: Number(row.User_Id),
            Name: row.UserName,
        });

        setFromDate(row.FromDate?.split("T")[0]);
        setToDate(row.ToDate?.split("T")[0]);
        setSession(row.Session);
        setNoOfDays(row.NoOfDays);

        const matchedLeaveType = leaveTypeOptions.data?.find(
            (lt) => lt.Id?.toString() === row.LeaveType_Id?.toString()
        );
        setLeaveType(matchedLeaveType || null);

        const matchedDepartment = departments.find(
            (d) => d.label === row.Department
        );
        setSelectedDepartment(matchedDepartment || null);

        const matchedInCharge = users.find(
            (u) => u.value === Number(row.InCharge) || u.Id === Number(row.InCharge)
        );
        setStatus(row.Status);

        setSelectedInCharge(
            matchedInCharge || {
                value: Number(row.InCharge),
                label: row.InChargeName,
            }
        );

        setReason(row.Reason);
        setApproverReason(row.Approver_Reason);
        setopenDialogApply(true);
    };

    return (
        <>
            {/* <Dialog
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
          <span></span>
        </DialogActions>
      </Dialog> */}
            <Card>
                <CardContent sx={{ minHeight: "50vh" }}>
                    <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
                        <h6 className="fa-18">Leave Master</h6>
                    </div>

                    <div
                        className="mb-3"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                        }}
                    >
                        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
                            <div style={{ width: "200px", marginRight: "10px" }}>
                                <label>Employee</label>
                                <Select
                                    className="w-100"
                                    classNamePrefix="react-select"
                                    value={{ value: filter?.EmpId, label: filter?.Name }}
                                    onChange={(e) =>
                                        setFilter({ ...filter, EmpId: e.value, Name: e.label })
                                    }
                                    options={[
                                        { value: 0, label: "ALL" },
                                        ...employees.map((obj) => ({
                                            value: obj?.UserId,
                                            label: obj?.Name,
                                        })),
                                    ]}
                                    isSearchable={true}
                                    isDisabled={isDropdownDisabled}
                                    styles={customSelectStyles}
                                    placeholder={dropdownPlaceholder}
                                />
                            </div>

                            <div style={{ width: "140px", marginRight: "10px" }}>
                                <label>From Date</label>
                                <input
                                    type="date"
                                    onChange={(e) =>
                                        setFilter({ ...filter, FromDate: e.target.value })
                                    }
                                    value={filter?.FromDate}
                                    className="form-control"
                                />
                            </div>

                            <div style={{ width: "140px", marginRight: "10px" }}>
                                <label>To Date</label>
                                <input
                                    type="date"
                                    onChange={(e) =>
                                        setFilter({ ...filter, ToDate: e.target.value })
                                    }
                                    value={filter?.ToDate}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div
                            style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
                        >
                            <div style={{ width: "100px" }}>
                                <label style={{ visibility: "hidden" }}>Apply</label>
                                <button className="btn btn-primary w-100" onClick={applyLeave}>
                                    Apply
                                </button>
                            </div>
                            <button
                                className="btn btn-primary w-50"
                                onClick={() => {
                                    if (approveDialog) {
                                        setApproveDialog(false);
                                    } else {
                                        listingData();
                                    }
                                }}
                            >
                                {approveDialog ? "Home" : "Approve"}
                            </button>
                        </div>
                    </div>

                    {approveDialog ? (
                        <FilterableTable
                            dataArray={approveData}
                            columns={[
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.UserName || "--",
                                    ColumnHeader: "UserName",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.FromDate.split("T")[0],
                                    ColumnHeader: "FromDate",
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
                                    Cell: ({ row }) => row.ToDate.split("T")[0],
                                    ColumnHeader: "ToDate",
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
                                    Cell: ({ row }) => row.LeaveType || "--",
                                    ColumnHeader: "Leave Type",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.NoOfDays || "--",
                                    ColumnHeader: "NoOfDays",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Session || "--",
                                    ColumnHeader: "Session",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Department || "--",
                                    ColumnHeader: "Department",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Reason || "--",
                                    ColumnHeader: "Reason",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Approver_Reason || "--",
                                    ColumnHeader: "Approver_Reason",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.ApproverName || "--",
                                    ColumnHeader: "Approver",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Status || "--",
                                    ColumnHeader: "Status",
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
                                {
                                    isCustomCell: true,
                                    ColumnHeader: "Actions",
                                    isVisible: 1,
                                    width: "10%",
                                    Cell: ({ row }) => (
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleEdit(row)}
                                        >
                                            Edit
                                        </button>
                                    ),
                                    CellProps: {
                                        sx: {
                                            padding: "10px",
                                            textAlign: "center",
                                        },
                                    },
                                },
                            ]}
                            EnableSerialNumber
                            CellSize="small"
                            disablePagination={false}
                        />
                    ) : (
                        <FilterableTable
                            dataArray={userData}
                            columns={[
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.UserName || "--",
                                    ColumnHeader: "UserName",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.FromDate.split("T")[0],
                                    ColumnHeader: "FromDate",
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
                                    Cell: ({ row }) => row.ToDate.split("T")[0],
                                    ColumnHeader: "ToDate",
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
                                    Cell: ({ row }) => row.LeaveType || "--",
                                    ColumnHeader: "Leave Type",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.NoOfDays || "--",
                                    ColumnHeader: "NoOfDays",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Session || "--",
                                    ColumnHeader: "Session",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Department || "--",
                                    ColumnHeader: "Department",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Reason || "--",
                                    ColumnHeader: "Reason",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Approver_Reason || "--",
                                    ColumnHeader: "Approver_Reason",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.ApproverName || "--",
                                    ColumnHeader: "Approver",
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
                                {
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Status || "--",
                                    ColumnHeader: "Status",
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
                            ]}
                            EnableSerialNumber
                            CellSize="small"
                            disablePagination={false}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={openDialogApply}
                onClose={() => {
                    setopenDialogApply(false);
                    resetForm();
                    setSelectedEditData(null);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {selectedEditData ? "Approve Form" : "Leave Apply Form"}
                </DialogTitle>

                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>
                                        <label>Employee</label>
                                    </td>
                                    <td>
                                        <Select
                                            value={
                                                employeeApply.EmpId
                                                    ? {
                                                        value: employeeApply.EmpId,
                                                        label: employeeApply.Name,
                                                    }
                                                    : null
                                            }
                                            onChange={(e) =>
                                                setEmployeeApply({ EmpId: e.value, Name: e.label })
                                            }
                                            options={employees.map((obj) => ({
                                                value: obj.UserId,
                                                label: obj.Name,
                                            }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            className="cus-inpt"
                                            value={fromDate}
                                            onChange={(e) => handleDateChange("from", e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            className="cus-inpt"
                                            value={toDate}
                                            onChange={(e) => handleDateChange("to", e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Session</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="session"
                                                    value="FN"
                                                    checked={session === "FN"}
                                                    onChange={() => handleSessionChange("FN")}
                                                    disabled={noOfDays >= 1}
                                                />{" "}
                                                FN
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="session"
                                                    value="AN"
                                                    checked={session === "AN"}
                                                    onChange={() => handleSessionChange("AN")}
                                                    disabled={noOfDays >= 1}
                                                />{" "}
                                                AN
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="session"
                                                    value="Full"
                                                    checked={session === "Full"}
                                                    onChange={() => handleSessionChange("Full")}
                                                />{" "}
                                                Full
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>No of Days</td>
                                    <td>
                                        <input
                                            className="cus-inpt"
                                            value={noOfDays}
                                            disabled
                                            placeholder="No of Days"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Leave Type</td>
                                    <td>
                                        <Select
                                            value={
                                                leaveType
                                                    ? { value: leaveType.Id, label: leaveType.LeaveType }
                                                    : null
                                            }
                                            onChange={(selectedOption) => {
                                                setLeaveType({
                                                    Id: selectedOption.value,
                                                    LeaveType: selectedOption.label,
                                                });
                                            }}
                                            options={
                                                Array.isArray(leaveTypeOptions.data)
                                                    ? leaveTypeOptions.data.map((lt) => ({
                                                        value: lt.Id,
                                                        label: lt.LeaveType,
                                                    }))
                                                    : []
                                            }
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder="Leave Type"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Department</td>
                                    <td>
                                        <Select
                                            value={
                                                selectedDepartment?.label ? selectedDepartment : null
                                            }
                                            onChange={(selectedOption) => {
                                                setSelectedDepartment(selectedOption);
                                            }}
                                            options={departments}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder="Select Department"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>InCharge</td>
                                    <td>
                                        <Select
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder="Select InCharge"
                                            options={users}
                                            value={selectedInCharge}
                                            onChange={(selectedOption) =>
                                                setSelectedInCharge(selectedOption)
                                            }
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Reason</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="cus-inpt"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    {selectedEditData && (
                                        <>
                                            <td style={{ verticalAlign: "middle" }}>Status</td>
                                            <td>
                                                <Select
                                                    value={
                                                        status ? { value: status, label: status } : null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        setStatus(selectedOption.value);
                                                    }}
                                                    options={[
                                                        { value: "Pending", label: "Pending" },
                                                        { value: "Approved", label: "Approved" },
                                                        { value: "Rejected", label: "Rejected" },
                                                    ]}
                                                    styles={customSelectStyles}
                                                    isSearchable={false}
                                                    placeholder="Select Status"
                                                />
                                            </td>
                                        </>
                                    )}
                                </tr>
                                <tr>
                                    {selectedEditData && (
                                        <>
                                            <td style={{ verticalAlign: "middle" }}>
                                                Approver Reason
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="cus-inpt"
                                                    value={approverReason}
                                                    onChange={(e) => setApproverReason(e.target.value)}
                                                />
                                            </td>
                                        </>
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setopenDialogApply(false);
                            resetForm();
                            setSelectedEditData(null);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button onClick={onsubmit}>Apply</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default LeaveMaster;