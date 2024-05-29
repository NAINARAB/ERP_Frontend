import React, { useEffect, useState } from "react";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidenav/sidebar";
import "../com.css";
import { apihost } from "../../backendAPI";
import { NavigateNext } from "@mui/icons-material";
import { pageRights } from "../../components/rightsCheck";
import DataTable from "react-data-table-component";
import { customStyles, empMyAttendance } from "../../components/tablecolumn";
import CurrentPage from '../../components/currentPage'


const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}

const formatTime = (inputTime) => {
    const [hours, minutes, seconds] = inputTime.split(':');
    const dateObj = new Date(2000, 0, 1, hours, minutes, seconds);
    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return formattedTime;
}

const EmpMyAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('')
   

    useEffect(() => {
        pageRights(2, 1015).then((per) => {
            fetch(`${apihost}/api/attendance/MyAttendance?UserId=${localStorage.getItem("UserId")}`, { headers: { Authorization: per.token } })
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === 'Success' && data.data.length > 0) {
                        data.data.map((obj) => {
                            obj.Start_Date = obj.Start_Date ? formatDate(obj.Start_Date) : ' - ';
                            obj.OutDate = obj.OutDate ? formatDate(obj.OutDate) : ' - ';
                            // obj.InTime = obj.InTime ? formatTime(obj.InTime) : ' - ';
                            // obj.OutTime = obj.OutTime ? formatTime(obj.OutTime) : ' - '
                            return obj;
                        });
                        setAttendanceData(data.data);
                    }
                });
        });
    }, []);

    function handleSearchChange(event) {
        const term = event.target.value;
        setSearch(term);
        const filteredResults = attendanceData.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(term.toLowerCase())
            );
        });

        setFilteredData(filteredResults);
    }

    

    

    return (
        <> 
            <div className="row">
                <div className="col-md-12">
                    <Header />
                </div>
                <div className="col-md-2">
                    <Sidebar mainMenuId={"DASHBOARD"} subMenuId={"MY ATTENDANCE"} />
                </div>
                <div className="col-md-10 p-3">
                    <CurrentPage MainMenu={'DASHBOARD'} SubMenu={'MY ATTENDANCE'} />
                    <div className="p-3" >
                        <h2 className='h5 mb-5'>
                            <span className="float-start p-2">
                                Attendance {'( ' + attendanceData.length + ' - Days)'}
                            </span>
                            <span className='float-end col-lg-4'>
                                <input className='form-control p-3' type='search' placeholder="Search..." value={search} onChange={handleSearchChange} />
                            </span>
                        </h2><br />
                        <div className={((filteredData && filteredData.length) || (attendanceData && attendanceData.length)) ? 'box mt-5' : 'mt-5'}>
                            <DataTable
                                columns={empMyAttendance}
                                data={filteredData && filteredData.length ? filteredData : search === '' ? attendanceData : []}
                                pagination
                                highlightOnHover={true}
                                fixedHeader={true}
                                fixedHeaderScrollHeight={'70vh'}
                                customStyles={customStyles}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmpMyAttendance;
