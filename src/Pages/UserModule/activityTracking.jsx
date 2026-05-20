import { useEffect, useState } from 'react';
import { Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem } from '@mui/material';
import { fetchLink } from '../../Components/fetchComponent';
import { FilterAlt } from "@mui/icons-material";


const EmployeeMaster = () => {
  
    const [empData, setEmpData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        loginType: '',

    });

    useEffect(() => {
        fetchLink({
            address: `userModule/employeeActivity/trackinglistlogin`,
        }).then((data) => {
            if (data.success) {
                setEmpData(data.data);
            }
        }).catch(e => console.log(e));
    }, []);

    useEffect(() => {
        const filteredResults = empData.filter(item => {
            const matchesSearch = Object.values(item).some(value =>
                String(value).toLowerCase().includes(search.toLowerCase())
            );

            const matchesFilters =
                (filters.loginType === '' ||
                    (filters.loginType === 'MobileLogin' && item.MobileLogin_InTime) ||
                    (filters.loginType === 'WebLogin' && item.WebLogin_InTime)
                );

            return matchesSearch && matchesFilters;
        });



        setFilteredData(filteredResults);
    }, [search, empData, filters]);

    const closeDialog = () => setDialogOpen(false);

    const openDialog = () => setDialogOpen(true);

    return (
        <>
            <Card>
                <CardContent className='p-0'>
                    <div style={{ maxHeight: '74vh', overflowY: 'scroll' }} className='p-3 pe-2'>

                        <p>ACTIVITY TRACKING</p>

                        <div className='text-end mb-2'>

                            <Button onClick={openDialog}> <FilterAlt /></Button>

                            <input
                                className='cus-inpt w-auto'
                                type='search'
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* <div className="text-end mb-2">
                            <Button >Attendance</Button>
                        </div> */}

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Designation</th>
                                    <th>Branch</th>
                                    <th>WebLogin InTime</th>
                                    <th>Mobile Login InTime</th>
                                    <th>Last Attendance Date </th>
                                    <th>Last Attendance Time </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(filteredData && filteredData.length ? filteredData : search === '' ? empData : []).map(emp => {
                                    let webLoginDate = emp?.WebLogin_InTime ? emp.WebLogin_InTime.split('T')[0] : '--';
                                    let mobileLoginDate = emp?.MobileLogin_InTime ? emp.MobileLogin_InTime.split('T')[0] : '--';

                                    let attendance = emp?.LogDateTime ? emp?.LogDateTime.split('T')[0] : '--';
                                    let attendanceTime = emp?.LogDateTime ? emp?.LogDateTime.split('T')[1]?.substring(0, 5) : '';

                                    let fullAttendanceDate = attendance && attendanceTime ? `${attendance}T${attendanceTime}:00` : '';
                                    let formattedAttendanceTime = '';

                                    if (fullAttendanceDate) {

                                        let dateObj = new Date(fullAttendanceDate);

                                        formattedAttendanceTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                                    }

                                    let webLoginInTime = emp?.WebLogin_InTime
                                        ? emp.WebLogin_InTime.split('T')[1]?.substring(0, 5)
                                        : '';

                                    let mobileLoginInTime = emp?.MobileLogin_InTime
                                        ? emp.MobileLogin_InTime.split('T')[1]?.substring(0, 5)
                                        : '';

                                    let webLoginFull = `${webLoginDate} ${webLoginInTime}`;
                                    let mobileLoginFull = `${mobileLoginDate} ${mobileLoginInTime}`;
                              

                                    return (
                                        <tr key={emp.Emp_Id}>
                                            <td>{emp.username}</td>
                                            <td>{emp.Designation_Name}</td>
                                            <td>{emp.BranchName}</td>
                                            <td>{webLoginFull}</td>
                                            <td>{mobileLoginFull}</td>
                                            <td>{attendance}</td>
                                            <td>{formattedAttendanceTime}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={dialogOpen} fullWidth maxWidth='sm'>
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <label style={{ verticalAlign: 'middle' }}>Login Type</label>

                                    <Select
                                        value={filters.loginType}
                                        onChange={(e) => setFilters({ ...filters, loginType: e.target.value })}
                                        className="cus-inpt"
                                        displayEmpty
                                        placeholder="Select Login Type"
                                    >
                                        <MenuItem value="">ALL</MenuItem>
                                        <MenuItem value="MobileLogin">Mobile Login</MenuItem>
                                        <MenuItem value="WebLogin">Web Login</MenuItem>
                                    </Select>

                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default EmployeeMaster;
