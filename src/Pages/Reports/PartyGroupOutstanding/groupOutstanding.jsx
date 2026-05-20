import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import PartyOutstandings from "./PartyOutstandings";
import { ISOString } from "../../../Components/functions";
import { Button, IconButton } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const PartyGroupOutstanding = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        fetchTrigger: 0
    })

    useEffect(() => {
        fetchLink({
            address: `journal/groupOutstandings?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn, loadingOff
        }).then(res => {
            if (res.success) {
                setReportData(res.data);
            }
        }).catch(console.error)
    }, [filters.fetchTrigger])

    return (
        <div>
            <AppTableComponent
                title="Party Group Outstandings"
                EnableSerialNumber
                isExpendable={true}
                ButtonArea={
                    <>
                        <input
                            className="cus-inpt"
                            type="date"
                            value={filters.Fromdate}
                            onChange={(e) => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                        />
                        <label>-</label>
                        <input
                            className="cus-inpt"
                            type="date"
                            value={filters.Todate}
                            onChange={(e) => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                        />
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }))}
                        ><Refresh /></IconButton>
                    </>
                }
                expandableComp={({ row }) => (
                    <PartyOutstandings row={row} />
                )}
                dataArray={reportData}
                columns={[
                    {
                        Field_Name: "Group_Name",
                        ColumnHeader: "Group Name",
                        Fied_Data: "string",
                        isVisible: 1,
                        OrderBy: 1
                    },
                    {
                        Field_Name: "OB_Amount",
                        ColumnHeader: "Opening Balance",
                        Fied_Data: "number",
                        isVisible: 1,
                        OrderBy: 2
                    },
                    {
                        Field_Name: "Debit_Amt",
                        ColumnHeader: "Debit",
                        Fied_Data: "number",
                        isVisible: 1,
                        OrderBy: 3
                    },
                    {
                        Field_Name: "Credit_Amt",
                        ColumnHeader: "Credit",
                        Fied_Data: "number",
                        isVisible: 1,
                        OrderBy: 4
                    },
                    {
                        Field_Name: "Bal_Amount",
                        ColumnHeader: "Balance",
                        Fied_Data: "number",
                        isVisible: 1,
                        OrderBy: 5
                    },
                    {
                        Field_Name: "CR_DR",
                        ColumnHeader: "DR / CR",
                        Fied_Data: "string",
                        isVisible: 1,
                        OrderBy: 6,
                        Aggregation: ''

                    },
                    {
                        Field_Name: "Dr_Amount",
                        ColumnHeader: "Dr Amount",
                        Fied_Data: "number",
                        isVisible: 1,
                        OrderBy: 7
                    },
                    {
                        Field_Name: "Cr_Amount",
                        ColumnHeader: "Cr Amount",
                        Fied_Data: "number",
                        isVisible: 1,
                        OrderBy: 8
                    }
                ]}
            />
        </div>
    );
};

export default PartyGroupOutstanding;