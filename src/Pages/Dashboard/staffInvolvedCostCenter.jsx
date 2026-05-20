import { Addition, checkIsNumber, getSessionUser, ISOString, isValidDate } from "../../Components/functions";
import { useState, useEffect } from 'react'
import { fetchLink } from "../../Components/fetchComponent";
import { Card, CardContent } from "@mui/material";

const StaffInvolvedCostCenterDetails = ({ loadingOn, loadingOff, reqDate = ISOString() }) => {
    const { user } = getSessionUser()
    const [staffData, setStaffData] = useState([]);
    const [filters, setFilters] = useState({
        fetchReqDate: reqDate
    });

    useEffect(() => {
        if (isValidDate(filters.fetchReqDate) && checkIsNumber(user.UserId)) {
            setStaffData([])
            if (loadingOn) loadingOn();
            fetchLink({
                address: `dataEntry/costCenter/report/employee?userid=${user.UserId}&reqDate=${filters.fetchReqDate}`
            }).then(data => {
                if (data.success) {
                    setStaffData(data.data)
                }
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }, [filters.fetchReqDate, user.UserId])

    return (
        <>
            <Card>
                <div className="d-flex flex-wrap align-items-center border-bottom px-3 py-2">
                    <span className="flex-grow-1 fa-16">ERP Activity</span>
                    <input
                        type="date"
                        value={filters.fetchReqDate}
                        onChange={e => setFilters(pre => ({ ...pre, fetchReqDate: e.target.value }))}
                        className="cus-inpt w-auto p-2"
                    />
                </div>
                <div className="d-flex flex-wrap align-items-center px-3 py-2 fa-15">

                    <Card className="mx-2" style={{ minWidth: 200}}>
                        <CardContent className="d-flex flex-column align-items-center">
                            <h4>
                                {staffData.reduce((sTacc, staff) => Addition(sTacc, staff.StockJournalTotal), 0)}
                            </h4>
                            <h6>Stock Handled KGs</h6>
                        </CardContent>
                    </Card>

                    <Card className="mx-2" style={{ minWidth: 200}}>
                        <CardContent className="d-flex flex-column align-items-center">
                            <h4>
                                {staffData.reduce((sTacc, staff) => Addition(sTacc, staff?.Stock_Journals?.length), 0)}
                            </h4>
                            <h6>Movement Activity</h6>
                        </CardContent>
                    </Card>

                    <Card className="mx-2" style={{ minWidth: 200}}>
                        <CardContent className="d-flex flex-column align-items-center">
                            <h4>
                                {staffData.reduce((sTacc, staff) => Addition(sTacc, staff.TripSheetTotal), 0)}
                            </h4>
                            <h6>Trip Sheet KGs</h6>
                        </CardContent>
                    </Card>
                    
                    <Card className="mx-2" style={{ minWidth: 200}}>
                        <CardContent className="d-flex flex-column align-items-center">
                            <h4>
                                {staffData.reduce((sTacc, staff) => Addition(sTacc, staff?.Trip_Sheet?.length), 0)}
                            </h4>
                            <h6>Total Trips</h6>
                        </CardContent>
                    </Card>
                </div>
            </Card>
        </>
    )
}

export default StaffInvolvedCostCenterDetails;