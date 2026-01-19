import { useEffect, useMemo, useState } from "react";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import { fetchLink } from "../../../Components/fetchComponent";
import DisplayArrayData from "./DataSetDisplay";

const LedgerDetails = ({ row, Fromdate, Todate, DB }) => {
    const [salesData, setSalesData] = useState([]);
    const [dataTypes, setDataTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchLink({
            address: `reports/salesReport/ledger/itemDetails?Fromdate=${Fromdate}&Todate=${Todate}&Ledger_Id=${row?.Ledger_Tally_Id}`,
            headers: {
                'Db': DB
            }
        }).then(({ success, data, others }) => {
            if (success) {
                const { dataTypeInfo } = others;
                setSalesData(data);
                setDataTypes(pre => ({ ...pre, salesInfo: Array.isArray(dataTypeInfo) ? dataTypeInfo : [] }))
            } else {
                setSalesData([]);
            }
        }).catch(e => console.error(e)).finally(() => {
            setLoading(false);
        });
    }, [row?.Ledger_Tally_Id, Fromdate, Todate])

    return (
        loading
            ? <h5 className="text-center text-primary ">Loading...</h5>
            : <DisplayArrayData dataArray={salesData} columns={dataTypes.salesInfo} />
    )
}

const LedgerBasedSalesReport = ({ dataArray, colTypes, DB, Fromdate, Todate }) => {

    // Convert colTypes to AppTableComponent columns format
    const columns = useMemo(() => {
        return colTypes.map((col, i) => ({
            Field_Name: col?.Column_Name,
            ColumnHeader: col?.Column_Name?.replace(/_/g, ' '),
            Fied_Data: col?.Data_Type,
            isVisible: i < 10 ? 1 : 0,
            OrderBy: i + 1,
            // Default Aggregation based on type
            Aggregation: col?.Data_Type === 'number' ? 'sum' :
                col?.Data_Type === 'date' ? 'max' : 'count'
        }));
    }, [colTypes]);

    return (
        <div className="p-2">
            <AppTableComponent
                title="Ledger Based Sales Report"
                dataArray={dataArray}
                columns={columns}

                // Features
                ExcelPrintOption={true}
                PDFPrintOption={true}
                maxHeightOption={true}
                EnableSerialNumber={true}
                headerFontSizePx={12}
                bodyFontSizePx={12}
                enableGlobalSearch={true}

                // Expandable Row (Leaf Rows)
                isExpendable={true}
                expandableComp={({ row }) => (
                    <LedgerDetails
                        row={row}
                        DB={DB}
                        Fromdate={Fromdate}
                        Todate={Todate}
                    />
                )}

                // State Management
                stateName="ledger_based_sales_report"
                stateUrl="/reports/salesReport/ledger" // Example URL
                stateGroup="sales_reports"
            />
        </div>
    );
};

export default LedgerBasedSalesReport;
