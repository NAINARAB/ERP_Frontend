import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, Paper } from '@mui/material'
import SOAComp from "./erp/SOA";
import AttendanceComp from "../Attendance/attendanceComp";
import ManagementDashboard from "./managementDashboard";
import { fetchLink } from '../../Components/fetchComponent'
import StaffInvolvedCostCenterDetails from "./staffInvolvedCostCenter";

const CommonDashboard = ({ loadingOn, loadingOff }) => {
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [tallyDetails, setTallyDetails] = useState([]);
    const isAdmin = Number(parseData?.UserTypeId) === 0 || Number(parseData?.UserTypeId) === 1
    const isMangement = Number(parseData?.UserTypeId) === 2
    const isEmp = Number(parseData?.UserTypeId) === 6 || Number(parseData?.UserTypeId) === 3;
    const isCustomer = Number(parseData?.UserTypeId) === 4 || Number(parseData?.UserTypeId) === 5;

    useEffect(() => {
        if (isEmp) {
            fetchLink({
                address: `dashboard/getTallyData?UserId=${parseData?.UserId}`
            }).then(data => {
                if (data.success) {
                    setTallyDetails(data.data);
                } else {
                    setTallyDetails([])
                }
            }).catch(e => console.error(e))
        }
    }, [isEmp])

    return (
        <>
            {isCustomer && <SOAComp />}

            {(isMangement || isAdmin) && <ManagementDashboard />}

            <br />

            {isEmp && <AttendanceComp />}

            <br />

            <StaffInvolvedCostCenterDetails loadingOn={loadingOn} loadingOff={loadingOff} />

            <br />

            {(isEmp && tallyDetails?.length > 0) && (
                <Card component={Paper}>
                    <CardHeader title="Tally Entries" sx={{ pb: 0 }} />
                    <CardContent>
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
                                            <td className="fa-13 border">{o?.Tally_Count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

        </>
    )
}


export default CommonDashboard