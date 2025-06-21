import { useEffect, useMemo, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, getDaysBetween, groupData, isEqualNumber, ISOString, isValidDate, stringCompare, toArray } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch } from "@mui/material";
import { FilterAlt, Search } from "@mui/icons-material";


const RetailerClosingWithLOL = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);

    const [groupingColumns, setGroupingColumns] = useState([
        { displayName: 'Sales Person', column: "salesPerson", isVisible: false, OrderBy: 1 },
        { displayName: 'Delivery Person', column: "deliveryPerson", isVisible: false, OrderBy: 2 },
        { displayName: 'Ledger Name', column: "Ledger_Name", isVisible: false, OrderBy: 3 },
        { displayName: 'Ledger Alias', column: "Ledger_Alias", isVisible: false, OrderBy: 4 },
        { displayName: 'Party with Brokers', column: "Actual_Party_Name_with_Brokers", isVisible: false, OrderBy: 5 },
        { displayName: 'Party Name', column: "Party_Name", isVisible: false, OrderBy: 6 },
        { displayName: 'Party Location', column: "Party_Location", isVisible: false, OrderBy: 7 },
        { displayName: 'Party Nature', column: "Party_Nature", isVisible: false, OrderBy: 8 },
        { displayName: 'Party Group', column: "Party_Group", isVisible: false, OrderBy: 9 },
        { displayName: 'Ref Brokers', column: "Ref_Brokers", isVisible: false, OrderBy: 10 },
        { displayName: 'Ref Owners', column: "Ref_Owners", isVisible: false, OrderBy: 11 },
        { displayName: 'Party District', column: "Party_District", isVisible: false, OrderBy: 12 },
        { displayName: 'Party Mailing Name', column: "Party_Mailing_Name", isVisible: false, OrderBy: 13 }
    ]);

    const [filters, setFilters] = useState({
        retailer: { value: '', label: 'Search Retailer' },
        Fromdate: ISOString(),
        Todate: ISOString(),
        reload: false,
        groupColumn: groupingColumns[0].column,
        settingsDialog: false,
    });

    useEffect(() => {
        fetchLink({
            address: `reports/customerClosingStock/retailerBased/withLOL?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const dataValue = toArray(data.data);
                setReportData(dataValue)
            }
        }).catch(e => console.error(e))
    }, [filters.reload]);

    const data = useMemo(() => {
        return checkIsNumber(filters.retailer.value)
            ? reportData.filter(
                row => isEqualNumber(row.Retailer_Id, filters.retailer.value)
            ) : reportData;
    }, [reportData, filters.retailer.value])

    const groupedSalesPersonData = useMemo(() => {

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
                totalValue: groupedData.reduce((acc, item) => Addition(acc, item.finalClosingStock), 0),
                entries: groupedData.length
            }
        }).sort((a, b) => String(a[filters.groupColumn]).localeCompare(b[filters.groupColumn]))
    }, [data, filters.groupColumn]);

    const closeDialog = () => setFilters(pre => ({ ...pre, settingsDialog: false }))

    return (
        <>
            <FilterableTable
                title="LOL Based"
                EnableSerialNumber
                headerFontSizePx={12}
                bodyFontSizePx={12}
                dataArray={groupedSalesPersonData}
                ButtonArea={
                    <>

                        {/* <div className="d-flex align-items-center">
                        <input
                            type="date"
                            value={filters.Fromdate}
                            onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                            className="cus-inpt p-2"
                        />
                        <span className="mx-1">{' to '}</span>
                        <input
                            type="date"
                            value={filters.Todate}
                            onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                            className="cus-inpt p-2"
                        />
                        <span className="mx-1"></span>
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, reload: !pre.reload }))}
                        ><Search /></IconButton>
                    </div> */}
                        {/* <IconButton */}
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, settingsDialog: true }))}
                        ><FilterAlt /></IconButton>
                    </>
                }
                columns={[
                    createCol(filters.groupColumn, 'string', 'Group'),
                    createCol('entries', 'number', 'Party   '),
                    createCol('entryDate', 'date', 'Entry Date'),
                    createCol('updateDate', 'date', 'Update Date'),
                    createCol('entryDays', 'number', 'Entry Days'),
                    createCol('updateDays', 'number', 'Update Days'),
                    createCol('totalValue', 'number', 'Stock Value'),
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <FilterableTable
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        dataArray={row.groupedData}
                        EnableSerialNumber
                        columns={[
                            createCol('Retailer_Name', 'string', 'Customer'),
                            createCol('deliveryDisplayDate', 'string', 'Entry Date'),
                            createCol('closingDisplayDate', 'string', 'Update Date'),
                            createCol('entryDays', 'number', 'Entry Days'),
                            createCol('updateDays', 'number', 'Update Days'),
                            createCol('finalClosingStock', 'number', 'Stock Value'),
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
                                    <td>Retailer Name</td>
                                    <td>
                                        <Select
                                            value={filters.retailer}
                                            menuPortalTarget={document.body}
                                            onChange={e => setFilters(pre => ({ ...pre, retailer: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...reportData.sort(
                                                    (a, b) => String(a?.Retailer_Name).localeCompare(String(b?.Retailer_Name))
                                                ).map(item => ({
                                                    value: item.Retailer_Id,
                                                    label: item.Retailer_Name
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            required
                                            placeholder={"Select Retailer"}
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

export default RetailerClosingWithLOL;