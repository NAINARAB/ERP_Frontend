import { Abc } from "@mui/icons-material";
import AppTableComponent from "../../../Components/appTable/appTableComponent";

const stockData = [
    {
        Godown_Name: 'Chennai',
        stock_item_name: 'Rice',
        quantity: 120,
        rate: 45,
        created_date: '2025-01-10',
        created_time: '2026-01-14 10:03:51.913',
    },
    {
        Godown_Name: 'Madurai',
        stock_item_name: 'Wheat',
        quantity: 80,
        rate: 50,
        created_date: '2025-01-12',
        created_time: '2026-01-14 15:03:51.913',
    },
    {
        Godown_Name: 'Chennai',
        stock_item_name: 'Wheat',
        quantity: 60,
        rate: 48,
        created_date: '2025-01-14',
        created_time: '2026-01-14 01:03:51.913',
    },

    // ---- additional data ----

    {
        Godown_Name: 'Coimbatore',
        stock_item_name: 'Rice',
        quantity: 150,
        rate: 44,
        created_date: '2025-01-15',
        created_time: '2026-01-14 09:03:51.913',
    },
    {
        Godown_Name: 'Salem',
        stock_item_name: 'Sugar',
        quantity: 90,
        rate: 42,
        created_date: '2025-01-16',
        created_time: '2026-01-14 07:03:51.913',
    },
    {
        Godown_Name: 'Madurai',
        stock_item_name: 'Rice',
        quantity: 110,
        rate: 46,
        created_date: '2025-01-17',
        created_time: '2026-01-14 05:03:51.913',
    },
    {
        Godown_Name: 'Chennai',
        stock_item_name: 'Sugar',
        quantity: 70,
        rate: 43,
        created_date: '2025-01-18',
        created_time: '2026-01-14 16:30:00.000',
    },
    {
        Godown_Name: 'Trichy',
        stock_item_name: 'Wheat',
        quantity: 95,
        rate: 49,
        created_date: '2025-01-19',
        created_time: '2026-01-14 09:20:00.000',
    },
    {
        Godown_Name: 'Coimbatore',
        stock_item_name: 'Maize',
        quantity: 130,
        rate: 38,
        created_date: '2025-01-20',
        created_time: '2026-01-14 13:45:00.000',
    },
    {
        Godown_Name: 'Salem',
        stock_item_name: 'Rice',
        quantity: 100,
        rate: 47,
        created_date: '2025-01-21',
        created_time: '2026-01-14 15:10:00.000',
    },
    {
        Godown_Name: 'Madurai',
        stock_item_name: 'Maize',
        quantity: 85,
        rate: 37,
        created_date: '2025-01-22',
        created_time: '2026-01-14 11:50:00.000',
    },
    {
        Godown_Name: 'Trichy',
        stock_item_name: 'Sugar',
        quantity: 60,
        rate: 41,
        created_date: '2025-01-23',
        created_time: '2026-01-14 10:40:00.000',
    },
    {
        Godown_Name: 'Chennai',
        stock_item_name: 'Maize',
        quantity: 140,
        rate: 39,
        created_date: '2025-01-24',
        created_time: '2026-01-14 17:00:00.000',
    },
    {
        Godown_Name: 'Coimbatore',
        stock_item_name: 'Wheat',
        quantity: 75,
        rate: 51,
        created_date: '2025-01-25',
        created_time: '2026-01-14 09:55:00.000',
    },
    {
        Godown_Name: 'Salem',
        stock_item_name: 'Wheat',
        quantity: 65,
        rate: 50,
        created_date: '2025-01-26',
        created_time: '2026-01-14 12:35:00.000',
    },
];

const stockColumns = [
    {
        Field_Name: 'Godown_Name',
        ColumnHeader: 'Godown',
        Fied_Data: 'string',
        isVisible: 1,
        OrderBy: 1,
    },
    {
        Field_Name: 'stock_item_name',
        ColumnHeader: 'Item Name',
        Fied_Data: 'string',
        isVisible: 1,
        OrderBy: 2,
    },
    {
        Field_Name: 'quantity',
        ColumnHeader: 'Quantity',
        Fied_Data: 'number',
        isVisible: 1,
        OrderBy: 3,
    },
    {
        Field_Name: 'rate',
        ColumnHeader: 'Rate',
        Fied_Data: 'number',
        isVisible: 1,
        OrderBy: 4,
    },
    {
        Field_Name: 'created_date',
        ColumnHeader: 'Created Date',
        Fied_Data: 'date',
        isVisible: 1,
        OrderBy: 5,
    },
    {
        Field_Name: 'created_time',
        ColumnHeader: 'Created Time',
        Fied_Data: 'time',
        isVisible: 1,
        OrderBy: 6,
    },
    {
        // Field_Name: 'created_time',
        ColumnHeader: 'custom cell',
        // Fied_Data: 'time',
        isCustomCell: true,
        Cell: ({ row }) => {
            console.log(row)
            return (
                <div>
                    {row.created_time}
                </div>
            )
        },
        isVisible: 1,
        OrderBy: 6,
    },
];

const StockInHandReport = () => {
    return (
        <div className="p-3">
            <AppTableComponent
                /* ================= DATA ================= */
                dataArray={[...stockData, ...stockData, ...stockData]}
                columns={stockColumns}

                /* ================= BASIC ================= */
                title="Stock In Hand"
                initialPageCount={20}
                disablePagination={false}

                /* ================= EXPORT ================= */
                PDFPrintOption={true}
                ExcelPrintOption={true}

                /* ================= UI OPTIONS ================= */
                EnableSerialNumber={true}
                CellSize="small"
                tableMaxHeight={550}
                maxHeightOption={true}
                bodyFontSizePx={13}
                headerFontSizePx={14}


                /* ================= STATE SAVE / RESTORE ================= */
                stateName="testStateName"
                stateUrl="/erp/test"
                stateGroup="testGrouping"
            />
        </div>
    );
};

export default StockInHandReport;