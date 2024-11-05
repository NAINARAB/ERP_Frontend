import React, { useEffect, useState, useContext } from "react";
import { Card, CardContent, Paper, IconButton, Chip, Avatar } from '@mui/material';
import { MyContext } from "../../Components/context/contextProvider";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { AccountCircle, TaskAlt } from '@mui/icons-material';
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../Components/filterableTable2";
import { checkIsNumber, formatTime24 } from "../../Components/functions";

const EmployeeAbstract = ({ loadingOn, loadingOff }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [empData, setEmpData] = useState({});
    const { contextObj } = useContext(MyContext);
    const [userDropDown, setUserDropDown] = useState([]);
    const [filter, setFilter] = useState({
        UserId: parseData.UserId,
        Name: parseData.Name,
    });

    useEffect(() => {
        setEmpData({});
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: `dashboard/employeeAbstract?UserId=${filter?.UserId}`
        }).then(data => {
            if (data.success) {
                setEmpData(data.data[0])
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        })
    }, [filter?.UserId])

    useEffect(() => {
        if (Number(contextObj?.Print_Rights) === 1) {
            fetchLink({
                address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
            }).then(data => {
                if (data.success) {
                    setUserDropDown(data?.data?.sort((a, b) => String(a?.Name).localeCompare(b?.Name)))
                }
            }).catch(e => console.error(e))
        }
    }, [])

    return (
        <>
            <Card component={Paper}>

                <div className="p-3 m-0 border-bottom row align-items-center" >
                    <div style={{ fontSize: '24px' }} className="flex-grow-1 col-lg-8 col-md-7 col-sm-4 col-12">USER INFO</div>
                    <div className="col-lg-4 col-md-5 col-sm-8 col-12">
                        {Number(contextObj?.Print_Rights) === 1 && (
                            <Select
                                value={{ value: filter?.UserId, label: filter?.Name }}
                                onChange={(e) => setFilter({ ...filter, UserId: e.value, Name: e.label })}
                                options={[
                                    { value: parseData?.UserId, label: parseData?.Name },
                                    ...userDropDown.map(obj => ({ value: obj.UserId, label: obj.Name }))
                                ]}
                                styles={customSelectStyles}
                                isDisabled={Number(contextObj?.Print_Rights) === 0}
                                isSearchable={true}
                                placeholder={"User Name"}
                            />
                        )}
                    </div>
                </div>

                <CardContent className="py-2">

                    <div className="row">

                        <div className="col-md-6 p-2">
                            <div className="d-flex align-items-center rounded-4 p-2 border">

                                <div className="pe-3">
                                    <IconButton className="border p-1">
                                        <AccountCircle sx={{ fontSize: '50px' }} className="text-muted" />
                                    </IconButton>
                                </div>

                                <div className=" flex-grow-1">
                                    <h6 className="mb-0 text-primary">{empData?.Name}</h6>
                                    <p className="mb-0 fa-14">{empData?.UserType}</p>
                                </div>

                            </div>
                        </div>

                        <div className="col-md-6 p-2">

                            <div className="d-flex align-items-center rounded-4 p-2 border">

                                <div className="pe-3">
                                    <IconButton className="border p-1">
                                        <TaskAlt sx={{ fontSize: '50px' }} className="text-muted" />
                                    </IconButton>
                                </div>

                                <div className=" flex-grow-1">
                                    <p className="mb-0 fa-14 d-flex pe-2">
                                        <span className="flex-grow-1">Projects</span>
                                        {empData?.Projects?.length}
                                    </p>
                                    <p className="mb-0 fa-14 d-flex pe-2">
                                        <span className="flex-grow-1">Tasks</span>
                                        {empData?.AssignedTasks?.length}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                    <hr className="text-muted" />

                    <h6 className="mt-2 mb-3 ps-3">Projects ( {empData?.Projects?.length} )</h6>

                    <div className="px-3">
                        {empData?.Projects?.length > 0 && empData?.Projects?.map((o, i) => (
                            <Chip
                                key={i}
                                color="primary"
                                avatar={
                                    <Avatar className="text-uppercase">
                                        {o?.Project_Name[0]}
                                    </Avatar>
                                }
                                className="mx-1"
                                label={o?.Project_Name}
                            />
                        ))}
                    </div>

                    <br />

                    <h6 className="mt-2 mb-3 ps-3">Tasks ( {empData?.AssignedTasks?.length} )</h6>

                    <FilterableTable
                        columns={[
                            {
                                Field_Name: "Task_Name",
                                Fied_Data: "string",
                                isVisible: 1,
                                OrderBy: 1,
                            },
                            {
                                Field_Name: "Task_Desc",
                                ColumnHeader: 'Description',
                                Fied_Data: "string",
                                isVisible: 1,
                                OrderBy: 2,
                            },
                            {
                                Field_Name: "Est_Start_Dt",
                                ColumnHeader: 'From Date',
                                Fied_Data: "date",
                                isVisible: 1,
                                OrderBy: 3,
                            },
                            {
                                Field_Name: "Est_End_Dt",
                                ColumnHeader: 'To Date',
                                Fied_Data: "date",
                                isVisible: 1,
                                OrderBy: 4,
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => row?.Sch_Time ? formatTime24(row?.Sch_Time) : row?.Sch_Time,
                                ColumnHeader: 'Start Time',
                                isVisible: 1,
                                OrderBy: 1,
                            },
                            {
                                isCustomCell: true,
                                Cell: ({ row }) => row?.EN_Time ? formatTime24(row?.EN_Time) : row?.EN_Time,
                                ColumnHeader: 'End Time',
                                isVisible: 1,
                                OrderBy: 1,
                            },
                            {
                                Field_Name: "Sch_Period",
                                ColumnHeader: 'Duration',
                                Fied_Data: "string",
                                isVisible: 1,
                                OrderBy: 1,
                            },
                        ]}
                        dataArray={Array.isArray(empData.AssignedTasks) ? empData.AssignedTasks : []}
                        isExpendable={true}
                        EnableSerialNumber={true}
                        expandableComp={({ row }) => {
                            return (
                                <FilterableTable
                                    initialPageCount={15}
                                    dataArray={Array.isArray(row.Work_Details) ? row.Work_Details : []}
                                    EnableSerialNumber={true}
                                    columns={[
                                        {
                                            Field_Name: 'Work_Dt',
                                            isVisible: 1,
                                            Fied_Data: 'date',
                                        },
                                        {
                                            Field_Name: 'Start_Time',
                                            isVisible: 1,
                                            Fied_Data: 'string',
                                        },
                                        {
                                            Field_Name: 'End_Time',
                                            isVisible: 1,
                                            Fied_Data: 'string',
                                        },
                                        {
                                            Field_Name: 'Tot_Minutes',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                        {
                                            Field_Name: 'Work_Done',
                                            isVisible: 1,
                                            Fied_Data: 'string',
                                        },
                                        {
                                            Field_Name: 'Parameters',
                                            isVisible: 1,
                                            Fied_Data: 'string',
                                            isCustomCell: true,
                                            Cell: ({ row }) => (
                                                <div className=" d-flex align-items-center flex-wrap p-2 pb-0">
                                                    {Array.isArray(row.Parameter_Details) && row.Parameter_Details.map((oo, oi) => (
                                                        <div className="d-flex align-items-center me-2">
                                                            <p key={oi} className="me-2">
                                                                {oo?.Paramet_Name}:
                                                            </p>
                                                            <p className=" fw-bold px-3 py-1 border rounded-3 ">
                                                                {((!checkIsNumber(oo?.Current_Value) || oo?.Paramet_Data_Type !== 'number')
                                                                    ? oo?.Current_Value
                                                                    : Number(oo?.Current_Value).toLocaleString('en-IN'))
                                                                }
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        },
                                    ]}
                                />
                            )
                        }}
                        tableMaxHeight={5000}
                    />
                </CardContent>
            </Card>
        </>
    )
}

export default EmployeeAbstract;