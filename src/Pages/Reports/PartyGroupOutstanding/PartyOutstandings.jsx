import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import AccountBalance from "../../Journal/JournalReport/accountBalance";


const PartyOutstandings = ({  row }) => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `journal/partyOutstanding?Group_Id=${row.Group_Id}`,
            // loadingOn, loadingOff
        }).then(res => {
            if (res.success) {
                setReportData(res.data);
            }
        }).catch(console.error)
    }, [row.Group_Id])

    return (
        <div>
            <AppTableComponent 
                title="Party Outstandings"
                EnableSerialNumber
                dataArray={reportData}
                tableMaxHeight={5000}
                initialPageCount={50}
                maxHeightOption={true}
                isExpendable={true}
                expandableComp={({ row }) => <AccountBalance propValue={row.Acc_Id} propLabel={row.Account_name} />}
                columns={[
                    {
                        Field_Name: "Account_name",
                        ColumnHeader: "Party",
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

export default PartyOutstandings;