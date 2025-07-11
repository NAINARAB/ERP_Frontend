import { useEffect, useMemo, useState } from "react";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { Addition, ISOString, NumberFormat, toArray } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import { Button, Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";

const PurchaseBrokerageReport = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Broker: { value: '', label: 'ALL Brokers' },
        refresh: false,
        filterDialog: false,
    });

    const [dropDown, setDropDown] = useState({
        broker: []
    })

    useEffect(() => {
        fetchLink({
            address: `reports/brokerageReport/purchaseInvoice/getInvolvedBroker`
        }).then(data => {
            if (data.success) {
                setDropDown(pre => ({
                    ...pre,
                    broker: toArray(data.data)
                }))
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        fetchLink({
            address: `reports/brokerageReport/purchaseInvoice?
            Fromdate=${filters.Fromdate}&
            Todate=${filters.Todate}&
            broker=${filters.Broker.value}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setReportData(toArray(data.data))
            }
        }).catch(e => console.error(e))
    }, [filters.refresh]);

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDialog: false }))
    }

    const totalBags = useMemo(() => {
        return reportData.reduce((acc, item) => Addition(acc, item.displayQuantity), 0)
    }, [reportData])

    return (
        <>
            <FilterableTable
                title={`Purchase Broker : ${reportData[0]?.CostCenterGet ? String(reportData[0]?.CostCenterGet) : filters.Broker.label} `}
                EnableSerialNumber
                headerFontSizePx={12}
                bodyFontSizePx={12}
                maxHeightOption
                ExcelPrintOption
                dataArray={reportData}
                columns={[
                    createCol('Retailer_Name', 'string', 'Party'),
                    createCol('Po_Entry_Date', 'date', 'Date'),
                    createCol('Product_Name', 'string', 'Item'),
                    createCol('displayQuantity', 'number', 'Bag'),
                    createCol('Item_Rate', 'number', 'Rate'),
                    createCol('Act_Qty', 'number'),
                    createCol('VoucherGet', 'string', 'Voucher'),
                ]}
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                        >
                            <FilterAlt />
                        </IconButton>
                        <span className="p-2">Total Bags: {NumberFormat(totalBags)}</span>
                    </>
                }
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                maxWidth="sm" fullWidth
            >
                <DialogContent>

                    <h5 className="d-flex justify-content-between px-2">
                        <span>Filters</span>
                        <span>
                            <IconButton size="small" onClick={closeDialog}>
                                <FilterAltOff />
                            </IconButton>
                        </span>
                    </h5>

                    <div className="table-responsive">
                        <table className="table m-0">
                            <tbody>

                                {/* Fromdate */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                {/* to date */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Broker</td>
                                    <td>
                                        <Select
                                            value={filters?.Broker}
                                            onChange={(e) => setFilters({ ...filters, Broker: e })}
                                            options={[
                                                { value: '', label: 'ALL Brokers' },
                                                ...dropDown.broker
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Broker Name"}
                                        />
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>
                        Close
                    </Button>
                    <Button
                        variant='outlined'
                        onClick={() => {
                            setFilters(pre => ({ ...pre, refresh: !pre.refresh }));
                            closeDialog();
                        }}
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PurchaseBrokerageReport;