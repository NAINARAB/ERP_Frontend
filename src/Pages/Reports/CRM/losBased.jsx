import { useEffect, useMemo, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, getDaysBetween, groupData, isEqualNumber, ISOString, isValidDate, NumberFormat, reactSelectFilterLogic, stringCompare, toArray, toNumber } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";


const LosBasedClosingReport = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [reportData, setReportData] = useState([]);

    const [groupingColumns, setGroupingColumns] = useState([
        { displayName: 'Brand', column: "Brand_Name", isVisible: false, OrderBy: 1 },
        { displayName: 'Stock Item', column: "Stock_Item", isVisible: false, OrderBy: 2 },
        { displayName: 'Group ST', column: "Group_ST", isVisible: false, OrderBy: 3 },
        { displayName: 'Bag', column: "Bag", isVisible: false, OrderBy: 4 },
        { displayName: 'Stock Group', column: "Stock_Group", isVisible: false, OrderBy: 5 },
        { displayName: 'S Sub Group 1', column: "S_Sub_Group_1", isVisible: false, OrderBy: 6 },
        { displayName: 'Grade Item Group', column: "Grade_Item_Group", isVisible: false, OrderBy: 7 },
        { displayName: 'Item Name Modified', column: "Item_Name_Modified", isVisible: false, OrderBy: 8 },
        { displayName: 'POS Group', column: "POS_Group", isVisible: false, OrderBy: 9 },
        { displayName: 'POS Item Name', column: "POS_Item_Name", isVisible: false, OrderBy: 10 },
    ]);

    const [filters, setFilters] = useState({
        product: { value: '', label: 'Search Item' },
        groupColumn: groupingColumns[0].column,
        settingsDialog: false,
    });

    useEffect(() => {
        fetchLink({
            address: `reports/customerClosingStock/withLOS?Fromdate=${Fromdate}&Todate=${Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const dataValue = toArray(data.data);
                setReportData(dataValue)
            }
        }).catch(e => console.error(e))
    }, [Fromdate, Todate]);

    const data = useMemo(() => {
        return checkIsNumber(filters.product.value)
            ? reportData.filter(
                row => isEqualNumber(row.Product_Id, filters.product.value)
            ) : reportData;
    }, [reportData, filters.product.value])

    const groupedArray = useMemo(() => {

        const groupSalesPersonWise = groupData(data, filters.groupColumn);

        return groupSalesPersonWise.map(lolData => {

            const groupedData = toArray(lolData?.groupedData);

            const deliveryDates = groupedData
                .map(party => party?.Latest_Delivery_Date ? ISOString(party?.Latest_Delivery_Date) : '')
                .filter(d => isValidDate(d));
            const closingDates = groupedData
                .map(party => party?.Latest_Closing_Date ? ISOString(party?.Latest_Closing_Date) : '')
                .filter(d => isValidDate(d));

            const entryDate = deliveryDates.length
                ? new Date(Math.max(...deliveryDates.map(d => new Date(d))))
                : '';
            const updateDate = closingDates.length
                ? new Date(Math.max(...closingDates.map(d => new Date(d))))
                : '';

            return {
                ...lolData,
                entryDate: entryDate ? ISOString(entryDate) : '',
                updateDate: updateDate ? ISOString(updateDate) : '',
                entryDays: entryDate ? getDaysBetween(entryDate, ISOString()) : '',
                updateDays: updateDate ? getDaysBetween(updateDate, ISOString()) : '',
                liveStockValue: groupedData.reduce((acc, item) => Addition(acc, item.StockValueOfItem), 0),
                StockQuantityOfItem: groupedData.reduce((acc, item) => Addition(acc, item.StockQuantityOfItem), 0),
                entries: groupedData.length
            }
        }).sort((a, b) => String(a[filters.groupColumn]).localeCompare(b[filters.groupColumn]))
    }, [data, filters.groupColumn]);

    const closeDialog = () => setFilters(pre => ({ ...pre, settingsDialog: false }));

    const sumValue = useMemo(() => {
        return reportData.reduce(
            (acc, item) => Addition(acc, item?.StockValueOfItem), 0
        )
    }, [reportData])

    return (
        <>
            <FilterableTable
                title={`LOS Based `}
                EnableSerialNumber
                headerFontSizePx={12}
                bodyFontSizePx={12}
                dataArray={groupedArray}
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, settingsDialog: true }))}
                        ><FilterAlt /></IconButton>
                        <span>Total: <span className="text-primary">{NumberFormat(sumValue)}</span></span>
                    </>
                }
                columns={[
                    createCol(filters.groupColumn, 'string', 'Group'),
                    createCol('entries', 'number', 'Items'),
                    createCol('entryDate', 'date', 'Entry Date'),
                    createCol('updateDate', 'date', 'Update Date'),
                    createCol('entryDays', 'number', 'Entry Days'),
                    createCol('updateDays', 'number', 'Update Days'),
                    createCol('StockQuantityOfItem', 'number', 'Quantity'),
                    createCol('liveStockValue', 'number', 'Stock Value'),
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <FilterableTable
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        dataArray={row.groupedData}
                        EnableSerialNumber
                        columns={[
                            createCol('Product_Name', 'string', 'Product'),
                            createCol('deliveryDisplayDate', 'string', 'Entry Date'),
                            createCol('closingDisplayDate', 'string', 'Update Date'),
                            createCol('entryDays', 'number', 'Entry Days'),
                            createCol('updateDays', 'number', 'Update Days'),
                            createCol('StockQuantityOfItem', 'number', 'Quantity'),
                            createCol('StockValueOfItem', 'number', 'Stock Value'),
                            ...groupingColumns.filter(
                                col => col.isVisible
                            ).sort(
                                (a, b) => toNumber(a.OrderBy) - toNumber(b.OrderBy)
                            ).map(
                                col => createCol(col.column, 'string', col.displayName)
                            )
                        ]}
                    />
                )}
            />

            <Dialog
                open={filters.settingsDialog}
                onClose={closeDialog}
                maxWidth='md' fullWidth
            >
                <DialogTitle>Column Settings</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>Product Name</td>
                                    <td>
                                        <Select
                                            value={filters.product}
                                            menuPortalTarget={document.body}
                                            onChange={e => setFilters(pre => ({ ...pre, product: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...reportData.sort(
                                                    (a, b) => String(a?.Product_Name).localeCompare(String(b?.Product_Name))
                                                ).map(item => ({
                                                    value: item.Product_Id,
                                                    label: item.Product_Name
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            required
                                            placeholder={"Select Product"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Group By</td>
                                    <td>
                                        <select
                                            className="cus-inpt p-2 w-auto me-2"
                                            value={filters.groupColumn}
                                            onChange={e => setFilters(pre => ({ ...pre, groupColumn: e.target.value }))}
                                        >
                                            {groupingColumns.map((col, colKey) => (
                                                <option value={col.column} key={colKey}>{col.displayName}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row p-2">
                        {groupingColumns.filter(
                            col => !stringCompare(col.column, filters.groupColumn)
                        ).map((col, colInd) => (
                            <div className="col-lg-4 col-md-6 p-2" key={colInd}>
                                <Card
                                    component={Paper}
                                    className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${colInd % 2 !== 0 ? 'bg-light' : ''}`}
                                >
                                    <div className='d-flex justify-content-between align-items-center flex-wrap'>
                                        <Switch
                                            checked={Boolean(col.isVisible)}
                                            onChange={e =>
                                                setGroupingColumns(prevColumns =>
                                                    prevColumns.map(preCol =>
                                                        stringCompare(preCol.column, col?.column)
                                                            ? { ...preCol, isVisible: e.target.checked }
                                                            : preCol
                                                    )
                                                )
                                            }
                                        />

                                        <h6 className='fa-13 mb-0 fw-bold '>{col?.displayName}</h6>
                                    </div>
                                    <input
                                        type='number'
                                        value={checkIsNumber(col.OrderBy) ? col.OrderBy : ''}
                                        onChange={e =>
                                            setGroupingColumns(prevColumns =>
                                                prevColumns.map(preCol =>
                                                    stringCompare(preCol.column, col.column)
                                                        ? { ...preCol, OrderBy: e.target.value }
                                                        : preCol
                                                )
                                            )
                                        }
                                        label={'Order Value'}
                                        className='mt-2 p-1 border-0 cus-inpt'
                                        style={{ width: '80px' }}
                                        placeholder='Order'
                                    />
                                </Card>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default LosBasedClosingReport;