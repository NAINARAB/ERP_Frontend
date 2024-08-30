import React, { useEffect, useState, useContext, Fragment } from "react";
import api from "../../API";
import { Card, CardContent, Paper, IconButton, Chip, Avatar, Collapse } from '@mui/material';
import { MyContext } from "../../Components/context/contextProvider";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { AccountCircle, Add, Remove, TaskAlt } from '@mui/icons-material';


const EmployeeAbstract = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [empData, setEmpData] = useState({});
    const { contextObj } = useContext(MyContext);
    const [userDropDown, setUserDropDown] = useState([]);
    const [filter, setFilter] = useState({
        UserId: parseData.UserId,
        Name: parseData.Name,
    });
    const sty = {
        verticalAlign: 'middle',
    }

    useEffect(() => {
        setEmpData({})
        fetch(`${api}employeeAbstract?UserId=${filter?.UserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEmpData(data.data[0])
                }
            }).catch(e => console.error(e))
    }, [filter?.UserId])

    useEffect(() => {
        fetch(`${api}userName?AllUser=true`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUserDropDown(data.data)
                }
            }).catch(e => console.error(e))
    }, [])

    const locDate = (inp) => {
        return new Date(inp).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const ExtendableRow = ({ o, sno }) => {
        const [open, setOpen] = useState(false)

        return (
            <>
                <tr>
                    <td className="fa-13 h-b border">

                        <div className="d-flex align-items-center justify-content-center flex-column">
                            <span>{sno}</span>
                            {o?.Work_Details?.length > 0 && (
                                <IconButton size="small" className="border" onClick={() => setOpen(!open)}>
                                    {open ? <Remove /> : <Add />}
                                </IconButton>
                            )}
                        </div>

                    </td>
                    <td className="h-b fa-13" style={{ ...sty, maxWidth: '550px' }}>
                        <span className="fw-bold text-muted">{o?.Task_Name}</span>
                        <br />
                        <span className="text-muted">&emsp;{o?.Task_Desc}</span>
                    </td>
                    <td className="fa-13 h-b" style={sty}>
                        {locDate(o?.Est_Start_Dt)} - {locDate(o?.Est_End_Dt)}
                    </td>
                    <td className="fa-13 h-b" style={sty}>
                        {o?.Sch_Time} - {o?.EN_Time}
                    </td>
                    <td className="fa-13 h-b" style={sty}>{o?.Sch_Period}</td>
                </tr>


                <tr>
                    <td colSpan={5} className="p-0 border-0">
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <div className="table-responsive p-2">
                                <table className="table ">
                                    <thead>
                                        <tr>
                                            <th className="fa-13 border">SNo</th>
                                            <th className="fa-13 border">Date</th>
                                            <th className="fa-13 border">Time</th>
                                            <th className="fa-13 border">Duration</th>
                                            <th className="fa-13 border">Status</th>
                                            <th className="fa-13 border">Discribtion</th>
                                            {/* {o?.Task_Param?.map((oo, oi) => (
                                                <th className="fa-12 border" key={oi}>{oo?.Paramet_Name}</th>
                                            ))} */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o?.Work_Details?.map((ob, i) => (
                                            <Fragment key={i}>
                                                <tr>
                                                    <td className="fa-13 h-b border" style={sty}>{++i}</td>
                                                    <td className="fa-13 h-b border" style={sty}>{locDate(ob?.Work_Dt)}</td>
                                                    <td className="fa-13 h-b border" style={sty}>
                                                        {ob?.Start_Time} - {ob?.End_Time}
                                                    </td>
                                                    <td className="fa-13 h-b border" style={sty}>{ob?.Tot_Minutes}</td>
                                                    <td className="fa-13 h-b border" style={sty}>{ob?.StatusGet}</td>
                                                    <td className="fa-13 h-b border" style={sty}>{ob?.Work_Done}</td>
                                                    {/* {ob?.Parameter_Details?.map((oo, oi) => (
                                                    <td className="fa-13 h-b border" key={oi} style={sty}>{oo?.Current_Value}</td>
                                                ))} */}
                                                </tr>
                                                {ob?.Parameter_Details.length > 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="border">
                                                            {ob?.Parameter_Details?.map((oo, oi) => (
                                                                <Chip
                                                                    key={oi}
                                                                    className="m-2"
                                                                    label={
                                                                        oo?.Paramet_Name +
                                                                            ": " +
                                                                            ((isNaN(oo?.Current_Value) || (oo?.Paramet_Data_Type) !== 'number')
                                                                            ? oo?.Current_Value
                                                                            : Number(oo?.Current_Value).toLocaleString('en-IN'))
                                                                    }
                                                                    component={Paper}
                                                                    sx={{ margin: '0px 5px' }}
                                                                />
                                                            ))}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Collapse>
                    </td>
                </tr>

            </>
        )
    }

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

                    {empData?.AssignedTasks?.length > 0 && (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="fa-13 border">SNo</th>
                                        <th className="fa-13 border">TaskName</th>
                                        <th className="fa-13 border">From - To</th>
                                        <th className="fa-13 border">Time</th>
                                        <th className="fa-13 border">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empData?.AssignedTasks?.map((o, i) => (
                                        <ExtendableRow key={i} sno={++i} o={o} className="h-b" />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}

export default EmployeeAbstract;