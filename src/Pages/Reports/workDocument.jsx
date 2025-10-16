// import React, { useEffect, useState, useContext, useRef } from "react";
// import { Card, CardHeader, CardContent, Paper } from '@mui/material';
// import { MyContext } from "../../Components/context/contextProvider";
// import Select from 'react-select';
// import { customSelectStyles } from "../../Components/tablecolumn";
// import { AccessTime, FiberManualRecord, SmsOutlined } from '@mui/icons-material';
// import { useReactToPrint } from 'react-to-print';
// import { fetchLink } from "../../Components/fetchComponent";
// import { getPreviousDate, ISOString, LocalDate } from "../../Components/functions";

// const EmployeeDayAbstract = ({ loadingOn, loadingOff }) => {
//     const localData = localStorage.getItem("user");
//     const parseData = JSON.parse(localData);
//     const [workedDetails, setWorkedDetails] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [tasks, setTasks] = useState([]);
//     const [process,setProcess]=useState([])

//     const { contextObj } = useContext(MyContext);
//     const [filter, setFilter] = useState({
//         startDate: getPreviousDate(1),
//         endDate: ISOString(),
//         Emp_Id: parseData?.UserId,
//         Emp_Name: parseData?.Name,
//         Task_Id: '',
//         Task_Name: 'Select Task',
//         Id:'',
//         Process_Name:'Select Process'
//     });
//     const printRef = useRef()

//     useEffect(() => {
//         if (loadingOn) {
//             loadingOn();
//         }
//         fetchLink({
//             address: `taskManagement/task/work?Emp_Id=${filter?.Emp_Id}&from=${filter.startDate}&to=${filter.endDate}&Task_Id=${filter?.Task_Id}&Process_Id=${filter?.Id}`
//         }).then(data => {
//             if (data.success) {
//                 const groupedData = data?.data?.reduce((acc, current) => {
//                     const workDate = ISOString(current?.Work_Dt);
//                     if (!acc[workDate]) {
//                         acc[workDate] = [];
//                     }
//                     acc[workDate].push(current);
//                     return acc;
//                 }, {});
//                 setWorkedDetails(groupedData)
//             }
//         }).catch(e => console.error(e)).finally(() => {
//             if (loadingOff) {
//                 loadingOff();
//             }
//         })
//     }, [parseData?.UserId, filter])

//     useEffect(() => {
//         fetchLink({
//             address: `taskManagement/task/assignEmployee/task/dropDown`
//         }).then(data => {
//             if (data.success) {
//                 setTasks(data.data)
//             }
//         }).catch(e => console.error(e))
//     }, [])



//     useEffect(()=>{
//         fetchLink({
//             address:`masters/processMaster`
//         }).then(data=>{
//             if(data.success){
//                 setProcess(data.data)
//             }
//         }).catch(e=>console.error(e))
//     },[])
//     useEffect(() => {
//         if (Number(contextObj?.Print_Rights) === 1) {
//             fetchLink({
//                 address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
//             }).then(data => {
//                 if (data.success) {
//                     setUsers(data?.data?.sort((a, b) => String(a?.Name).localeCompare(b?.Name)))
//                 }
//             }).catch(e => console.error(e))
//         }
//     }, [contextObj?.Print_Rights, parseData?.Company_id])

//     const formatTime24 = (time24) => {
//         const [hours, minutes] = time24.split(':').map(Number);

//         let hours12 = hours % 12;
//         hours12 = hours12 || 12;
//         const period = hours < 12 ? 'AM' : 'PM';
//         const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
//         const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
//         const time12 = `${formattedHours}:${formattedMinutes} ${period}`;

//         return time12;
//     }

//     const handlePrint = useReactToPrint({
//         content: () => printRef.current,
//     });

//     const getColor = (status) => {
//         const numStatus = Number(status);
//         const color = ['', 'bg-primary', 'bg-warning', 'bg-success', 'bg-danger']

//         return color[numStatus]
//     }

//     const CardAndTableComp = () => {
//         return (
//             <div className="px-2">
//                 {Object.keys(workedDetails).map(workDate => (
//                     <div key={workDate} className="cus-card pb-0">
//                         <h6 className="p-3 mb-0 bg-light">
//                             Date:
//                             {LocalDate(workDate)}
//                             {" ( " + workedDetails[workDate]?.length + " Tasks )"}
//                         </h6>

//                         <hr className="m-0" />

//                         <div className="table-responsive day-abstract-table">
//                             <table className="table">
//                                 <tbody>
//                                     {workedDetails[workDate].map((taskDetail, oi) => (
//                                         <tr key={oi}>

//                                             <td style={{ verticalAlign: 'middle' }}><FiberManualRecord className='fa-in text-primary' /> {taskDetail.Task_Name}</td>
//                                             <td style={{ verticalAlign: 'middle' }}><AccessTime className="fa-15" /> {taskDetail.Tot_Minutes} Minutes</td>
//                                             <td className="fa-14 " style={{ verticalAlign: 'middle' }}>
//                                                 {formatTime24(taskDetail.Start_Time) + " - " + formatTime24(taskDetail.End_Time)}
//                                             </td>
//                                             <td style={{ verticalAlign: 'middle' }}>
//                                                 <span className={`badge fa-10 ms-2 p-1 ${getColor(taskDetail?.Work_Status)}`}>
//                                                     {taskDetail?.WorkStatus}
//                                                 </span>
//                                             </td>
//                                             <td style={{ verticalAlign: 'middle' }}>
//                                                 <p className="mb-0 fa-14 text-muted">
//                                                     <SmsOutlined className="fa-in" />
//                                                     <span>&emsp;{taskDetail.Work_Done}</span>
//                                                 </p>
//                                             </td>
//                                             <td style={{ verticalAlign: 'middle' }}>
//                                                 {taskDetail?.Work_Param?.length > 0 && (
//                                                     <div className="cus-card p-2 m-0">
//                                                         {taskDetail?.Work_Param?.map((o, i) => (
//                                                             <p className="mb-0 fa-14 d-flex" key={i}>
//                                                                 <span className="flex-grow-1">{o?.Paramet_Name}:</span>
//                                                                 <span className="text-primary">
//                                                                     {
//                                                                         (isNaN(o?.Current_Value) || (o?.Paramet_Data_Type) !== 'number')
//                                                                             ? o?.Current_Value
//                                                                             : Number(o?.Current_Value).toLocaleString('en-IN')
//                                                                     }
//                                                                 </span>
//                                                             </p>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="row mb-2 px-3 day-abstract-card d-none">

//                             {workedDetails[workDate].map(taskDetail => (

//                                 <div key={taskDetail.Work_Id} className="col-xl-3 col-lg-4 col-md-6 p-2 py-0">
//                                     <div className="cus-card shadow-sm p-3">

//                                         <p className="mb-2 fa-15 fw-bold text-secondary">
//                                             {taskDetail.Task_Name + " "}
//                                         </p>

//                                         <p className="mb-2 fa-14 text-secondary">
//                                             {formatTime24(taskDetail.Start_Time) + " - " + formatTime24(taskDetail.End_Time)}
//                                             <span className={`badge fa-10 ms-2 p-1 ${getColor(taskDetail?.Work_Status)}`}>
//                                                 {taskDetail?.WorkStatus}
//                                             </span>
//                                         </p>

//                                         <p className="mb-2 fa-14 text-secondary">
//                                             <AccessTime className="fa-15" /> {taskDetail.Tot_Minutes} Minutes
//                                         </p>

//                                         <p className="mb-0 fa-14 text-muted">
//                                             <span className="fw-bold">Summary : </span><br />
//                                             <span>&emsp;{taskDetail.Work_Done}</span>
//                                         </p>

//                                         {taskDetail?.Work_Param?.length > 0 && (
//                                             <p className="mb-1 text-secondary fa-14 fw-bold">Parameters ( {taskDetail?.Work_Param?.length} )</p>
//                                         )}

//                                         {taskDetail?.Work_Param?.length > 0 && <hr className="m-0" />}

//                                         {taskDetail?.Work_Param?.map((o, i) => (
//                                             <p className="mb-0 fa-14 d-flex flex-wrap" key={i}>
//                                                 <span className="flex-grow-1">{o?.Paramet_Name}:</span>
//                                                 <span> {o?.Current_Value}</span>
//                                             </p>
//                                         ))}

//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                     </div>
//                 ))}
//             </div>
//         )
//     }

//     return (
//         <>
//             <Card component={Paper} variant='elevation'>
//                 <CardHeader title='Work Abstract' className="pb-0" />

//                 <CardContent className="pt-2" style={{ minHeight: '500px' }}>

//                     <div className="row">

//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label className="pb-2">From: </label>
//                             <input
//                                 type="date"
//                                 className="cus-inpt"
//                                 value={filter.startDate}
//                                 onChange={e => setFilter({ ...filter, startDate: e.target.value })}
//                             />
//                         </div>

//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label className="pb-2">To: </label>
//                             <input
//                                 type="date"
//                                 className="cus-inpt"
//                                 value={filter.endDate}
//                                 onChange={e => setFilter({ ...filter, endDate: e.target.value })}
//                             />
//                         </div>

//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label className="pb-2">User </label>
//                             <Select
//                                 value={{ value: filter?.Emp_Id, label: filter?.Emp_Name }}
//                                 onChange={(e) => setFilter({ ...filter, Emp_Id: e.value, Emp_Name: e.label })}
//                                 options={[
//                                     { value: parseData?.UserId, label: parseData?.Name },
//                                     { value: '', label: "ALL EMPLOYEE" },
//                                     ...users.map(obj => ({ value: obj.UserId, label: obj.Name }))
//                                 ]}
//                                 styles={customSelectStyles}
//                                 isDisabled={Number(contextObj?.Print_Rights) === 0}
//                                 isSearchable={true}
//                                 placeholder={"User Name"} />
//                         </div>

//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label className="pb-2">Task </label>
//                             <Select
//                                 value={{ value: filter?.Task_Id, label: filter?.Task_Name }}
//                                 onChange={(e) => setFilter({ ...filter, Task_Id: e.value, Task_Name: e.label })}
//                                 options={[
//                                     { value: '', label: 'All Task' },
//                                     ...tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))
//                                 ]}
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 placeholder={"Task Name"} />
//                         </div>
//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label className="pb-2">Process </label>
//                             <Select
//                                 value={{ value: filter?.Id, label: filter?.Process_Name }}
//                                 onChange={(e) => setFilter({ ...filter, Id: e.value, Process_Name: e.label })}
//                                 options={[
//                                     { value: '', label: 'All Process' },
//                                     ...process.map(obj => ({ value: obj.Id, label: obj.Process_Name }))
//                                 ]}
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 placeholder={"Task Name"} />
//                         </div>
//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
//                             <label className="pb-2">Project </label>
//                             <Select
//                                 value={{ value: filter?.Id, label: filter?.Process_Name }}
//                                 onChange={(e) => setFilter({ ...filter, Id: e.value, Process_Name: e.label })}
//                                 options={[
//                                     { value: '', label: 'All Process' },
//                                     ...process.map(obj => ({ value: obj.Id, label: obj.Process_Name }))
//                                 ]}
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 placeholder={"Task Name"} />
//                         </div>

//                         <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 d-flex align-items-end p-2">
//                             <button className="btn btn-primary rounded-5 px-3" onClick={handlePrint}>Print PDF</button>
//                         </div>

//                     </div>

//                     <CardAndTableComp />

//                     <div className="d-none px-3">
//                         <div className="px-3" ref={printRef}>
//                             <h5>Work Abstract Of {filter.Emp_Name} </h5>
//                             <p className="mb-0">
//                                 From {LocalDate(filter.startDate)}
//                                 &nbsp; - To: {LocalDate(filter.endDate)}
//                             </p>
//                             <CardAndTableComp />
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </>
//     )
// }

// export default EmployeeDayAbstract;











import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Card,
  CardContent,
  Paper

} from "@mui/material";

import Select from "react-select";
import { useReactToPrint } from "react-to-print";
import { MyContext } from "../../Components/context/contextProvider";
import { customSelectStyles } from "../../Components/tablecolumn";
import { fetchLink } from "../../Components/fetchComponent";
import { getPreviousDate, ISOString, LocalDate } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { AccessTime, FiberManualRecord, SmsOutlined } from '@mui/icons-material';

const EmployeeDayAbstract = ({ loadingOn, loadingOff }) => {
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const { contextObj } = useContext(MyContext);
  const printRef = useRef();

  const initialFilter = {
    startDate: getPreviousDate(1),
    endDate: ISOString(),
    Emp_Id: parseData?.UserId,
    Emp_Name: parseData?.Name,
    Task_Id: "",
    Task_Name: "Select Task",
    Id: "",
    Process_Name: "Select Process",
    Project_Id: "",
    Project_Name: "Select Project",
  };

  const [workedDetails, setWorkedDetails] = useState({});
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [process, setProcess] = useState([]);
  const [project, setProject] = useState([]);
//   const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState(initialFilter);



  useEffect(() => {
    if (loadingOn) loadingOn();
    fetchLink({
      address: `taskManagement/task/work?Emp_Id=${appliedFilter?.Emp_Id}&from=${appliedFilter.startDate}&to=${appliedFilter.endDate}&Task_Id=${appliedFilter?.Task_Id}&Process_Id=${appliedFilter?.Id}&Project_Id=${appliedFilter?.Project_Id}`,
    })
      .then((data) => {
        if (data.success) {
          const groupedData = data?.data?.reduce((acc, current) => {
            const workDate = ISOString(current?.Work_Dt);
            if (!acc[workDate]) acc[workDate] = [];
            acc[workDate].push(current);
            return acc;
          }, {});
          setWorkedDetails(groupedData);
        }
      })
      .catch(console.error)
      .finally(() => loadingOff && loadingOff());
  }, [appliedFilter]);


  useEffect(() => {
    fetchLink({ address: `taskManagement/task/assignEmployee/task/dropDown` })
      .then((data) => data.success && setTasks(data.data))
      .catch(console.error);

    fetchLink({
      address: `taskManagement/tasks/project/dropdown?Company_id=${parseData?.Company_id}`,
    })
      .then((data) => data.success && setProject(data.data))
      .catch(console.error);

    fetchLink({ address: `masters/processMaster` })
      .then((data) => data.success && setProcess(data.data))
      .catch(console.error);

    if (Number(contextObj?.Print_Rights) === 1) {
      fetchLink({
        address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`,
      })
        .then((data) => {
          if (data.success) {
            setUsers(
              data.data.sort((a, b) => String(a?.Name).localeCompare(b?.Name))
            );
          }
        })
        .catch(console.error);
    }
  }, [contextObj?.Print_Rights, parseData?.Company_id]);


  const formatTime24 = (time24) => {
    if (!time24) return "-";
    const [hours, minutes] = time24.split(":").map(Number);
    let hours12 = hours % 12 || 12;
    const period = hours < 12 ? "AM" : "PM";
    return `${hours12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const getColor = (status) => {
    const color = ["", "bg-primary", "bg-warning", "bg-success", "bg-danger"];
    return color[Number(status)] || "bg-secondary";
  };



  const CardAndTableComp = () => {
        return (
            <div className="px-2">
                {Object.keys(workedDetails).map(workDate => (
                    <div key={workDate} className="cus-card pb-0">
                        <h6 className="p-3 mb-0 bg-light">
                            Date:
                            {LocalDate(workDate)}
                            {" ( " + workedDetails[workDate]?.length + " Tasks )"}
                        </h6>

                        <hr className="m-0" />

                        <div className="table-responsive day-abstract-table">
                            <table className="table">
                                <tbody>
                                    {workedDetails[workDate].map((taskDetail, oi) => (
                                        <tr key={oi}>

                                            <td style={{ verticalAlign: 'middle' }}><FiberManualRecord className='fa-in text-primary' /> {taskDetail.Task_Name}</td>
                                            <td style={{ verticalAlign: 'middle' }}><AccessTime className="fa-15" /> {taskDetail.Tot_Minutes} Minutes</td>
                                            <td className="fa-14 " style={{ verticalAlign: 'middle' }}>
                                                {formatTime24(taskDetail.Start_Time) + " - " + formatTime24(taskDetail.End_Time)}
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <span className={`badge fa-10 ms-2 p-1 ${getColor(taskDetail?.Work_Status)}`}>
                                                    {taskDetail?.WorkStatus}
                                                </span>
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <p className="mb-0 fa-14 text-muted">
                                                    <SmsOutlined className="fa-in" />
                                                    <span>&emsp;{taskDetail.Work_Done}</span>
                                                </p>
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {taskDetail?.Work_Param?.length > 0 && (
                                                    <div className="cus-card p-2 m-0">
                                                        {taskDetail?.Work_Param?.map((o, i) => (
                                                            <p className="mb-0 fa-14 d-flex" key={i}>
                                                                <span className="flex-grow-1">{o?.Paramet_Name}:</span>
                                                                <span className="text-primary">
                                                                    {
                                                                        (isNaN(o?.Current_Value) || (o?.Paramet_Data_Type) !== 'number')
                                                                            ? o?.Current_Value
                                                                            : Number(o?.Current_Value).toLocaleString('en-IN')
                                                                    }
                                                                </span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="row mb-2 px-3 day-abstract-card d-none">

                            {workedDetails[workDate].map(taskDetail => (

                                <div key={taskDetail.Work_Id} className="col-xl-3 col-lg-4 col-md-6 p-2 py-0">
                                    <div className="cus-card shadow-sm p-3">

                                        <p className="mb-2 fa-15 fw-bold text-secondary">
                                            {taskDetail.Task_Name + " "}
                                        </p>

                                        <p className="mb-2 fa-14 text-secondary">
                                            {formatTime24(taskDetail.Start_Time) + " - " + formatTime24(taskDetail.End_Time)}
                                            <span className={`badge fa-10 ms-2 p-1 ${getColor(taskDetail?.Work_Status)}`}>
                                                {taskDetail?.WorkStatus}
                                            </span>
                                        </p>

                                        <p className="mb-2 fa-14 text-secondary">
                                            <AccessTime className="fa-15" /> {taskDetail.Tot_Minutes} Minutes
                                        </p>

                                        <p className="mb-0 fa-14 text-muted">
                                            <span className="fw-bold">Summary : </span><br />
                                            <span>&emsp;{taskDetail.Work_Done}</span>
                                        </p>

                                        {taskDetail?.Work_Param?.length > 0 && (
                                            <p className="mb-1 text-secondary fa-14 fw-bold">Parameters ( {taskDetail?.Work_Param?.length} )</p>
                                        )}

                                        {taskDetail?.Work_Param?.length > 0 && <hr className="m-0" />}

                                        {taskDetail?.Work_Param?.map((o, i) => (
                                            <p className="mb-0 fa-14 d-flex flex-wrap" key={i}>
                                                <span className="flex-grow-1">{o?.Paramet_Name}:</span>
                                                <span> {o?.Current_Value}</span>
                                            </p>
                                        ))}

                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </div>
        )
    }

  const dataArray = Object.keys(workedDetails || {}).flatMap((workDate) =>
    workedDetails[workDate].map((task) => ({
      ...task,
      Work_Date: workDate,
    }))
  );

    function formatMinutesToHours(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}



  return (
    <>
     <Card component={Paper} variant="elevation">

  <div className="row align-items-center justify-content-between px-3 pt-3">
    <div className="col">
      <h5 className="mb-0 fw-bold">Work Abstract</h5>
    </div>

    <div className="col-auto d-flex align-items-center gap-2">
 
    

      <button
        className="btn btn-primary rounded-5 px-3"
        onClick={handlePrint}
      >
        Print PDF
      </button>
    </div>
  </div>


  <CardContent className="pt-2" style={{ minHeight: "500px" }}>
  <div className="row">

  <div className="col-xxl-2 col-lg-3 col-md-3 col-sm-6 p-2">
    <label className="pb-2">From:</label>
    <input
      type="date"
      className="cus-inpt"
      value={appliedFilter.startDate}
      onChange={(e) =>
        setAppliedFilter({ ...appliedFilter, startDate: e.target.value })
      }
    />
  </div>

  <div className="col-xxl-2 col-lg-3 col-md-3 col-sm-6 p-2">
    <label className="pb-2">To:</label>
    <input
      type="date"
      className="cus-inpt"
      value={appliedFilter.endDate}
      onChange={(e) =>
        setAppliedFilter({ ...appliedFilter, endDate: e.target.value })
      }
    />
  </div>


  <div className="col-xxl-2 col-lg-3 col-md-3 col-sm-6 p-2">
    <label className="pb-2">User</label>
    <Select
      value={{ value: appliedFilter.Emp_Id, label: appliedFilter.Emp_Name }}
      onChange={(e) =>
        setAppliedFilter({ ...appliedFilter, Emp_Id: e.value, Emp_Name: e.label })
      }
      options={[
        { value: parseData.UserId, label: parseData.Name },
        { value: "", label: "ALL EMPLOYEE" },
        ...users.map((u) => ({ value: u.UserId, label: u.Name })),
      ]}
      styles={customSelectStyles}
      isDisabled={Number(contextObj?.Print_Rights) === 0}
      isSearchable
      placeholder="User Name"
    />
  </div>


  <div className="col-xxl-2 col-lg-3 col-md-3 col-sm-6 p-2">
    <label className="pb-2">Project</label>
    <Select
      value={{ value: appliedFilter.Project_Id, label: appliedFilter.Project_Name }}
      onChange={(e) =>
        setAppliedFilter({ ...appliedFilter, Project_Id: e.value, Project_Name: e.label })
      }
      options={[
        { value: "", label: "All Project" },
        ...project.map((p) => ({ value: p.Project_Id, label: p.Project_Name })),
      ]}
      styles={customSelectStyles}
      isSearchable
      placeholder="Project Name"
      menuPortalTarget={document.body}
    />
  </div>


  <div className="col-xxl-2 col-lg-3 col-md-3 col-sm-6 p-2">
    <label className="pb-2">Process</label>
    <Select
      value={{ value: appliedFilter.Id, label: appliedFilter.Process_Name }}
      onChange={(e) =>
        setAppliedFilter({ ...appliedFilter, Id: e.value, Process_Name: e.label })
      }
      options={[
        { value: "", label: "All Process" },
        ...process.map((p) => ({ value: p.Id, label: p.Process_Name })),
      ]}
      styles={customSelectStyles}
      menuPortalTarget={document.body}
      isSearchable
      placeholder="Process Name"
    />
  </div>


  <div className="col-xxl-2 col-lg-3 col-md-3 col-sm-6 p-2">
    <label className="pb-2">Task</label>
    <Select
      value={{ value: appliedFilter.Task_Id, label: appliedFilter.Task_Name }}
      onChange={(e) =>
        setAppliedFilter({ ...appliedFilter, Task_Id: e.value, Task_Name: e.label })
      }
      options={[
        { value: "", label: "All Task" },
        ...tasks.map((t) => ({ value: t.Task_Id, label: t.Task_Name })),
      ]}
      styles={customSelectStyles}
      isSearchable
      placeholder="Task Name"
    />
  </div>
</div>

     <div className="d-none px-3">
                         <div className="px-3" ref={printRef}>
                             <h5>Work Abstract Of {appliedFilter.Emp_Name} </h5>
                             <p className="mb-0">
                                From {LocalDate(appliedFilter.startDate)}
                                 &nbsp; - To: {LocalDate(appliedFilter.endDate)}
                            </p>
                          <CardAndTableComp />
                        </div>
                     </div>

    <FilterableTable
      title="Work Abstract"
      dataArray={dataArray}
      EnableSerialNumber
      columns={[
          createCol("Project_Name", "string", "Project_Name"),
        createCol("Work_Date", "date", "Date"),
        createCol("Task_Name", "string", "Task"),
        createCol("Sub_Task_Name", "string", "Sub Task"),
        createCol("EmployeeName", "string", "Staff"),
        createCol("Work_Done", "string", "Comments"),
        {
          ColumnHeader: "Status",
          isVisible: 1,
          align: "center",
          isCustomCell: true,
          Cell: ({ row }) => (
            <span className={`badge fa-10 p-1 ${getColor(row?.Work_Status)}`}>
              {row?.WorkStatus || "-"}
            </span>
          ),
        },
      {
  ColumnHeader: "Duration",
  isVisible: 1,
  align: "center",
  isCustomCell: true,
  Cell: ({ row }) => (
    <div style={{ width: '100px', wordWrap: 'break-word', textAlign: 'center' }}>
      <span>{row?.Tot_Minutes ? `${row.Tot_Minutes} min` : "-"}</span>
      <br />
      <span>({row?.Tot_Minutes ? formatMinutesToHours(row?.Tot_Minutes) : "-"})</span>
    </div>
  ),
}
,
        {
          ColumnHeader: "Time",
          isVisible: 1,
          align: "center",
          isCustomCell: true,
          Cell: ({ row }) => (
            <span>
              {formatTime24(row?.Start_Time)} - {formatTime24(row?.End_Time)}
            </span>
          ),
        },
        {
          ColumnHeader: "Parameters",
          isVisible: 1,
          isCustomCell: true,
          Cell: ({ row }) =>
            row?.Work_Param?.length > 0 ? (
              <div className="text-start">
                {row.Work_Param.map((param, i) => (
                  <div key={i} className="d-flex justify-content-between small">
                    <span>{param.Paramet_Name}:</span>
                    <span className="text-primary">
                      {isNaN(param.Current_Value) ||
                      param.Paramet_Data_Type !== "number"
                        ? param.Current_Value
                        : Number(param.Current_Value).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              "-"
            ),
        },
      ]}
    />
  </CardContent>
</Card>


   
    </>
  );
};

export default EmployeeDayAbstract;
