import React, { useState, useEffect } from 'react';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import { fetchLink } from '../../../Components/fetchComponent';
import { toArray } from '../../../Components/functions';
import { CircularProgress, Box } from '@mui/material';

// Helper to auto-generate columns if needed, but we will define specific ones.
const generateColumns = (data) => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]).filter(k => !k.startsWith('__'));
    return keys.map((key) => ({
        Field_Name: key,
        ColumnHeader: key.replace(/_/g, ' ').toUpperCase(),
        isVisible: 1,
        Fied_Data: typeof data[0][key] === 'number' ? 'number' : 'string',
    }));
};

const getQty = (row, key) => {
    // Attempt to safely get value regardless of exact casing, defaulting to 0
    const val = row[key] !== undefined ? row[key] : (row[key.toLowerCase()] !== undefined ? row[key.toLowerCase()] : 0);
    return Number(val || 0);
};

const commonQtyColumns = [
    { Field_Name: 'OB_Qty', ColumnHeader: 'OB', isVisible: 1, Fied_Data: 'number', isCustomCell: true, Cell: ({ row }) => getQty(row, 'OB_Qty').toLocaleString() },
    { Field_Name: 'IN_Qty', ColumnHeader: 'STOCK IN', isVisible: 1, Fied_Data: 'number', isCustomCell: true, Cell: ({ row }) => getQty(row, 'IN_Qty').toLocaleString() },
    { Field_Name: 'Process_IN_OUT_Qty', ColumnHeader: 'PROCESS', isVisible: 1, Fied_Data: 'number', isCustomCell: true, Cell: ({ row }) => getQty(row, 'Process_IN_OUT_Qty').toLocaleString() },
    { Field_Name: 'Out_Qty', ColumnHeader: 'STOCK OUT', isVisible: 1, Fied_Data: 'number', isCustomCell: true, Cell: ({ row }) => getQty(row, 'Out_Qty').toLocaleString() },
    {
        Field_Name: 'CL_QTY', ColumnHeader: 'CLOSING', isVisible: 1, Fied_Data: 'number', isCustomCell: true,
        Cell: ({ row }) => <span style={{ color: '#15803d', fontWeight: 'bold' }}>{getQty(row, 'CL_QTY').toLocaleString()}</span>
    }
];

const BatchDetailsTable = ({ row, parentGodownId, Fromdate, Todate }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatchData = async () => {
            try {
                // Determine Item_Id from the row
                const itemId = row.Item_Id || row.item_id || row.Product_Id || row.product_id || 0;
                // Determine Godown_Id (prefer row's Godown_Id, fallback to parentGodownId)
                const godownId = row.Godown_Id || row.godown_id || parentGodownId || 0;

                const response = await fetchLink({
                    address: `reports/storageStock/godownStockBatchItemWise?Fromdate=${Fromdate}&Todate=${Todate}&Godown_Id=${godownId}&Item_Id=${itemId}`
                });

                if (response.success) {
                    setData(toArray(response.data));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatchData();
    }, [Fromdate, Todate, row, parentGodownId]);

    if (loading) return <Box p={2} display="flex" justifyContent="center"><CircularProgress size={24} /></Box>;
    if (!data.length) return <Box p={2}>No Batch Details Found</Box>;

    return (
        <AppTableComponent
            dataArray={data}
            columns={[
                { Field_Name: 'Batch_Name', ColumnHeader: 'BATCH NAME', isVisible: 1, Fied_Data: 'string', isCustomCell: true, Cell: ({ row }) => row.Batch_Name || row.batch_name || '-' },
                ...commonQtyColumns
            ]}
            EnableSerialNumber={true}
            dynamicHeight={false}
            tableMaxHeight={600}
            maxHeightOption={true}
            title="Batch Details"
            headerFontSizePx={11}
            bodyFontSizePx={11}
        />
    );
};

const GodownProcessTable = ({ row, Fromdate, Todate }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [godownId, setGodownId] = useState(0);

    useEffect(() => {
        const fetchProcessData = async () => {
            try {
                const id = row.godown_id;
                setGodownId(id);

                const response = await fetchLink({
                    address: `reports/storageStock/godownInOutProcess?Fromdate=${Fromdate}&Todate=${Todate}&Godown_Id=${id}`
                });

                if (response.success) {
                    setData(toArray(response.data));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProcessData();
    }, [Fromdate, Todate, row]);

    if (loading) return <Box p={2} display="flex" justifyContent="center"><CircularProgress size={24} /></Box>;
    if (!data.length) return <Box p={2}>No Process Details Found</Box>;

    return (
        <AppTableComponent
            dataArray={data}
            columns={[
                { Field_Name: 'Brand', ColumnHeader: 'BRAND NAME', isVisible: 1, Fied_Data: 'string' },
                { Field_Name: 'stock_item_name', ColumnHeader: 'PRODUCT NAME', isVisible: 1, Fied_Data: 'string' },
                { Field_Name: 'OB_Bal_Qty', ColumnHeader: 'OPENING STOCK', isVisible: 1, Fied_Data: 'number' },
                { Field_Name: 'IN_Qty', ColumnHeader: 'STOCK IN', isVisible: 1, Fied_Data: 'number' },
                { Field_Name: 'Process_IN_OUT_Qty', ColumnHeader: 'PROCESS', isVisible: 1, Fied_Data: 'number' },
                { Field_Name: 'Out_Qty', ColumnHeader: 'STOCK OUTWARDS', isVisible: 1, Fied_Data: 'number' },
                { Field_Name: 'CL_QTY', ColumnHeader: 'CLOSING STOCK', isVisible: 1, Fied_Data: 'number' }
            ]}
            EnableSerialNumber={true}
            dynamicHeight={false}
            maxHeightOption={true}
            tableMaxHeight={600}
            title="Process Details"
            isExpendable={true}
            expandableComp={({ row: innerRow }) => (
                <BatchDetailsTable
                    row={innerRow}
                    parentGodownId={godownId}
                    Fromdate={Fromdate}
                    Todate={Todate}
                />
            )}
            headerFontSizePx={11}
            bodyFontSizePx={11}
        />
    );
};

const StockAbstract = ({ Fromdate, Todate, loadingOn, loadingOff }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbstractData = async () => {
            try {
                if (loadingOn) loadingOn();
                const response = await fetchLink({
                    address: `reports/storageStock/stockAbstract?Fromdate=${Fromdate}&Todate=${Todate}`
                });

                if (response.success) {
                    setData(toArray(response.data));
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (loadingOff) loadingOff();
                setLoading(false);
            }
        };

        if (Fromdate && Todate) {
            fetchAbstractData();
        }
    }, [Fromdate, Todate]);

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress size={32} /></Box>;

    return (
        <Box sx={{ mt: 2 }}>
            <AppTableComponent
                dataArray={data}
                columns={[
                    {
                        Field_Name: 'godown_name',
                        ColumnHeader: 'GODOWN NAME',
                        isVisible: 1,
                        Fied_Data: 'string',
                        isCustomCell: true, Cell: ({ row }) => row.godown_name || row.Godown_Name || '-'
                    },
                    ...commonQtyColumns
                ]}
                EnableSerialNumber={true}
                title="Stock Abstract"
                isExpendable={true}
                expandableComp={({ row }) => (
                    <GodownProcessTable
                        row={row}
                        Fromdate={Fromdate}
                        Todate={Todate}
                    />
                )}
                enableGlobalSearch={true}
                tableMaxHeight={600}
                maxHeightOption={true}
            />
        </Box>
    );
};

export default StockAbstract;
