import React, { useEffect, useState, useContext } from "react";
import {
    Card,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";
import DataTable from "react-data-table-component";
import DescriptionIcon from '@mui/icons-material/Description';
const UserActivities = ({ loadingOn, loadingOff }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [empData, setEmpData] = useState({ Projects: [] });
    const { contextObj } = useContext(MyContext);
    const [userDropDown, setUserDropDown] = useState([]);
    const [filter, setFilter] = useState({
        UserId: parseData.UserId,
        Name: parseData.Name,
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogData, setDialogData] = useState([]);
    const [dialogTitle, setDialogTitle] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [workDetailsDialog, setWorkDetailsDialog] = useState(false);
    const [workDetails, setWorkDetails] = useState([]);

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `dashboard/usernewEmployeeAbstract?UserId=${filter?.UserId}`,
        })
            .then((data) => {
                if (data.success) {
                    setEmpData(data);
                } else {
                    setErrorMessage(data.message || "Failed to fetch user data.");
                }
            })
            .catch(() => setErrorMessage("An error occurred while fetching data."))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    }, [filter?.UserId]);

    useEffect(() => {
        if (Number(contextObj?.Print_Rights) === 1) {
            fetchLink({
                address: `masters/users/employee/employeeAllDropDown?Company_id=${parseData?.Company_id}`,
            })
                .then((data) => {
                    if (data.success) {
                        setUserDropDown(data?.data?.sort((a, b) => String(a?.Name).localeCompare(b?.Name)));
                    }
                })
                .catch(() => setErrorMessage("An error occurred while fetching employee data."));
        }
    }, [contextObj?.Print_Rights]);

    const handleOpenDialog = (tasks, title) => {
        setDialogData(JSON.parse(tasks));
        setDialogTitle(title);
        setOpenDialog(true);
    };

    const handleWorkDialog = (tasks) => {

        setWorkDetails(JSON.parse(tasks.Work_Details));
        setWorkDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogData([]);
        setDialogTitle("");
    };

    const handleWorkDetailsClose = () => {
        setWorkDetailsDialog(false);
    };

    const userOptions = [
        { value: parseData?.UserId, label: parseData?.Name },
        ...userDropDown.map((obj) => ({ value: obj.UserId, label: obj.Name })),
    ];

    const mainTableColumns = [
        { name: "Project Name", selector: (row) => row.Project_Name, sortable: true, width: '350px' },
        { name: "Description", selector: (row) => row.Project_Desc, sortable: true },
        {
            name: "Start Date",
            selector: (row) => row.ProjectStartDate,
            sortable: true,
            format: (row) => new Date(row.ProjectStartDate).toLocaleDateString("en-GB"),
            width: '150px'
        },
        {
            name: "End Date",
            selector: (row) => row.ProjectEndDate,
            sortable: true,
            format: (row) => new Date(row.ProjectEndDate).toLocaleDateString("en-GB")
        },
        { name: "Project Head", selector: (row) => row.HeadName, sortable: true },
        { name: "Task Count", selector: (row) => row.TaskCount, sortable: true },
        {
            name: "Actions",
            cell: (row) => (
                <Button
                    color="primary"
                    onClick={() => handleOpenDialog(row.Tasks, `${row.Project_Name} - Task Details`)}
                >
                    <DescriptionIcon />
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    const dialogTableColumns = [
        { name: "Task Name", selector: (row) => row.Task_Name, sortable: true },
        { name: "Description", selector: (row) => row.Task_Desc, sortable: true },
        {
            name: "Estimated Start",
            selector: (row) => row.Est_Start_Dt,
            sortable: true,
            format: (row) => new Date(row.Est_Start_Dt).toLocaleDateString("en-GB"),
        },
        {
            name: "Estimated End",
            selector: (row) => row.Est_End_Dt,
            sortable: true,
            format: (row) => new Date(row.Est_End_Dt).toLocaleDateString("en-GB"),
        },
        { name: "Start Time", selector: (row) => row.Sch_Time, sortable: true },
        { name: "End Time", selector: (row) => row.EN_Time, sortable: true },
        {
            name: "Actions",
            cell: (row) => (
                <Button
                    color="primary"
                    onClick={() => handleWorkDialog(row)}
                >
                    <DescriptionIcon />
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    const workDetailsColumns = [
        {
            name: "Work Dt",
            selector: (row) => row.Work_Dt,
            sortable: true,
            format: (row) => new Date(row.Work_Dt).toLocaleDateString("en-GB"),
            width: '100px'
        },
        {
            name: "Start_Time",
            selector: (row) => row.Start_Time,
            sortable: true,
            width: '100px'
        },
        {
            name: "End_Time",
            selector: (row) => row.End_Time,
            sortable: true,
            width: '100px'
        },
        {
            name: "Status",
            selector: (row) => row.StatusGet,
            sortable: true,
            width: '100px'
        },
        {
            name: "Tot_Minutes",
            selector: (row) => row.Tot_Minutes,
            sortable: true,
            width: '200px'
        },
        {
            name: "Work Done",
            selector: (row) => row.Work_Done,
            sortable: true,
            width: '100px'

        },
        {
            name: 'Parameter_Details',
            isVisible: true,
            selector: (row) => {



                const parsedParameters = JSON.parse(row?.Parameter_Details).map((parameter) => {

                    return {
                        ...parameter,
                        Paramet_Name: parameter.Paramet_Name.toUpperCase(),
                        Current_Value: parameter.Current_Value,
                        Default_Value: parameter.Default_Value,
                        Paramet_Data_Type: parameter.Paramet_Data_Type,
                    };
                });


                return (
                    <div className="d-flex align-items-center flex-wrap p-2 pb-0">
                        {parsedParameters.map((parameter, index) => (
                            <div key={index} className="d-flex align-items-center me-2">
                                <p className="me-2">{parameter.Paramet_Name}:</p>

                                <p className="fw-bold px-3 py-1 border rounded-3">
                                    {parameter.Paramet_Data_Type === 'number'
                                        ? new Date(parameter.Current_Value).toLocaleDateString()
                                        : parameter.Current_Value || 'No value'}
                                </p>

                            </div>
                        ))}
                    </div>
                );
            },
        }

    ];



    return (
        <>


            <Card component={Paper}>
                <div className="p-3 m-0 row align-items-center">
                    <div style={{ fontSize: "24px" }} className="flex-grow-1 col-lg-8 col-md-7 col-sm-4 col-12">
                        User Activities
                    </div>
                    <div className="col-lg-4 col-md-5 col-sm-8 col-12">
                        {Number(contextObj?.Print_Rights) === 1 && (
                            <Select
                                value={{ value: filter?.UserId, label: filter?.Name }}
                                onChange={(e) => setFilter({ ...filter, UserId: e.value, Name: e.label })}
                                options={userOptions}
                                styles={customSelectStyles}
                                isDisabled={Number(contextObj?.Print_Rights) === 0}
                                isSearchable={true}
                                placeholder={"User Name"}
                            />
                        )}
                    </div>
                </div>

                <div className="card-body p-0 table-container">
                    <DataTable
                        columns={mainTableColumns}
                        data={Array.isArray(empData.data) ? empData.data : []}
                        pagination
                        highlightOnHover
                        fixedHeader
                        paginationPerPage={15}
                        responsive
                        persistTableHead
                        customStyles={{
                            headCells: {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    padding: '10px',
                                    backgroundColor: '#2c3e50',
                                    color: '#ecf0f1',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                },
                            },
                            cells: {
                                style: {
                                    padding: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#f9f9f9',
                                    color: '#2c3e50',
                                },
                            },
                            rows: {
                                style: {
                                    borderBottom: '1px solid #ddd',
                                },
                            },
                        }}
                        style={{
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 200px)',
                        }}
                    />
                </div>
            </Card>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="lg">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DataTable
                        columns={dialogTableColumns}
                        data={dialogData}
                        pagination
                        highlightOnHover
                        fixedHeader
                        paginationPerPage={15}
                        responsive
                        persistTableHead
                        customStyles={{
                            headCells: {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    padding: '10px',
                                    backgroundColor: '#2c3e50',
                                    color: '#ecf0f1',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                },
                            },
                            cells: {
                                style: {
                                    padding: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#f9f9f9',
                                    color: '#2c3e50',
                                },
                            },
                            rows: {
                                style: {
                                    borderBottom: '1px solid #ddd',
                                },
                            },
                        }}
                        style={{
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 200px)',
                        }}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>


            <Dialog open={workDetailsDialog} onClose={handleWorkDetailsClose} fullWidth maxWidth="lg">



                <DataTable
                    columns={workDetailsColumns}
                    data={Array.isArray(workDetails) ? workDetails : []}
                    pagination
                    highlightOnHover
                    fixedHeader
                    paginationPerPage={15}
                    responsive
                    persistTableHead
                    customStyles={{
                        headCells: {
                            style: {
                                fontSize: '16px',
                                fontWeight: 'bold',
                                padding: '10px',
                                backgroundColor: '#2c3e50',
                                color: '#ecf0f1',
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                            },
                        },
                        cells: {
                            style: {
                                padding: '8px',
                                fontSize: '14px',
                                backgroundColor: '#f9f9f9',
                                color: '#2c3e50',
                            },
                        },
                        rows: {
                            style: {
                                borderBottom: '1px solid #ddd',
                            },
                        },
                    }}
                    style={{
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 200px)',
                    }}
                />



                <DialogActions>
                    <Button onClick={handleWorkDetailsClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserActivities;
