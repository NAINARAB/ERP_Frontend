import { useMemo } from "react";
import AppTableComponent from "../../../Components/appTable/appTableComponent";

const ItemBasedSalesReport = ({ dataArray, colTypes, loadingOn, loadingOff }) => {

    const columns = useMemo(() => {
        return colTypes.map((col, i) => ({
            Field_Name: col?.Column_Name,
            ColumnHeader: col?.Column_Name?.replace(/_/g, ' '),
            Fied_Data: col?.Data_Type,
            isVisible: i < 10 ? 1 : 0,
            OrderBy: i + 1,
            // Aggregation: col?.Data_Type === 'number' ? 'sum' : col?.Data_Type === 'date' ? 'max' : 'count'
        }));
    }, [colTypes]);

    return (
        <div className="p-2">
            <AppTableComponent
                title="Item Based Sales Report"
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
                loadingOn={loadingOn}
                loadingOff={loadingOff}
                // State Management
                stateName="item_based_sales_report"
                stateUrl="/reports/salesReport/"
                stateGroup="sales_reports_item_based"
            />
        </div>
    );
};

export default ItemBasedSalesReport;
