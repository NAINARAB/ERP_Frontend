import { useEffect, useState, useContext } from "react"
import { Card, CardHeader, CardContent, Paper } from '@mui/material';
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from '../../Components/fetchComponent'


const TallyReports = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [tallyDetails, setTallyDetails] = useState([]);
    const [filters, setFileters] = useState({
        Emp_Id: parseData?.UserId,
        EmpGet: parseData?.Name,
        From: new Date().toISOString().split('T')[0],
        To: new Date().toISOString().split('T')[0],
    })
    const [users, setUsers] = useState([]);
    const { contextObj } = useContext(MyContext);


    useEffect(() => {
        fetchLink({
            address: `dashboard/getTallyData?UserId=${filters?.Emp_Id}&From=${filters?.From}&To=${filters?.To}`
        }).then(data => {
            if (data.success) {
                setTallyDetails(data.data);
            } else {
                setTallyDetails([])
            }
        }).catch(e => console.error(e))
    }, [filters?.Emp_Id, filters?.From, filters?.To]);

    useEffect(() => {
        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
        }).then(data => {
            setUsers(data.success ? data.data : []);
        }).catch(e => console.error(e))
    }, [])

    return (
        <>
            <Card component={Paper}>
                <CardHeader title="Tally Entries" sx={{ pb: 0 }} />
                <CardContent>

                    <div className="row">

                        {Number(contextObj?.Print_Rights) === 1 && (
                            <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                                <label>Employee Name</label>
                                <Select
                                    value={{ value: filters?.Emp_Id, label: filters?.EmpGet }}
                                    onChange={(e) => setFileters({ ...filters, Emp_Id: e.value, EmpGet: e.label })}
                                    options={[...users.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Employee Name"} />
                            </div>
                        )}

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <label>From Date</label>
                            <input
                                type="date"
                                onChange={e => setFileters({ ...filters, From: e.target.value })}
                                value={filters?.From}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <label>To Date</label>
                            <input
                                type="date"
                                onChange={e => setFileters({ ...filters, To: e.target.value })}
                                value={filters?.To}
                                className="cus-inpt"
                            />
                        </div>

                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="fa-13 border">Sno</th>
                                    <th className="fa-13 border">Particulars</th>
                                    <th className="fa-13 border">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tallyDetails?.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-13 border">{i + 1}</td>
                                        <td className="fa-13 border">{o?.Particulars}</td>
                                        <td className="fa-13 border">
                                            {isNaN(o?.Tally_Count) ? o?.Tally_Count : Number(o?.Tally_Count).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}


export default TallyReports