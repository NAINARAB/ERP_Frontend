import { useEffect, useMemo, useState } from "react";
import { checkIsNumber, isEqualNumber, ISOString, Subraction } from '../../../Components/functions';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { FilterAlt, Search, ToggleOff, ToggleOn } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { getSessionUser } from "../../../Components/functions";
import { toast } from "react-toastify";

const transformStockJournalData = (data) => {
    let transformedData = [];

    data.forEach((entry, entryIndex) => {
        const maxRows = Math.max(entry?.SourceDetails?.length || 0, entry?.DestinationDetails?.length || 0);

        const totalSourceQty = (entry?.SourceDetails || []).reduce((sum, item) => sum + (item.Sour_Qty || 0), 0);
        const totalDestinationQty = (entry?.DestinationDetails || []).reduce((sum, item) => sum + (item.Dest_Qty || 0), 0);

        const diffPercentage = totalSourceQty !== 0
            ? ((totalDestinationQty - totalSourceQty) / totalSourceQty) * 100
            : 0;

        transformedData.push({
            SNo: entryIndex + 1,
            Date: ISOString(entry.Process_date),
            VoucherType: entry.VoucherTypeGet,
            VoucherNo: entry.PR_Inv_Id,
            SourceItem: "",
            SourceGodown: "",
            SourceQty: totalSourceQty,
            SourceBatchObj: null,
            DestinationItem: "",
            DestinationGodown: "",
            DestinationQty: totalDestinationQty,
            DestinationBatchObj: null,
            DifferentQTY: Subraction(totalDestinationQty, totalSourceQty),
            DifferentPercentage: diffPercentage,
            createdBy: entry?.createdByGet,
            isGroupHeader: true
        });

        for (let i = 0; i < maxRows; i++) {
            const sourceItem = entry?.SourceDetails?.[i];
            const destItem = entry?.DestinationDetails?.[i];
            transformedData.push({
                SNo: '',
                Date: '',
                VoucherType: '',
                VoucherNo: '',
                
                SourceItem: sourceItem?.Product_Name || "",
                SourceGodown: sourceItem?.Godown_Name || "",
                SourceQty: sourceItem?.Sour_Qty || "",
                SourceBatchObj: sourceItem || null,

                DestinationItem: destItem?.Product_Name || "",
                DestinationGodown: destItem?.Godown_Name || "",
                DestinationQty: destItem?.Dest_Qty || "",
                DestinationBatchObj: destItem || null,

                DifferentQTY: "",
                DifferentPercentage: "",
                createdBy: '',
                isGroupHeader: false
            });
        }
    });

    return transformedData;
};

const UnAssignedProcessing = ({ loadingOn, loadingOff }) => {
    const [responseData, setResponseData] = useState([]);
    const [batchData, setBatchData] = useState([]);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        FilterFromDate: ISOString(),
        FilterTodate: ISOString(),
        filterDialog: false,
        pagination: false,
    });
    const [refresh, setRefresh] = useState(false);
    const [sourceBatches, setSourceBatches] = useState([]);
    const [destBatches, setDestBatches] = useState([]);

    const userDetails = getSessionUser().user;

    useEffect(() => {
        fetchLink({
            address: `inventory/batchMaster/processingCombined?Fromdate=${dateFilter.Fromdate}&Todate=${dateFilter.Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setResponseData(data.data);
            } else {
                setResponseData([]);
            }
        }).catch(e => console.error(e));
        
        fetchLink({
            address: 'inventory/batchMaster/stockBalance',
        }).then(data => {
            if (data.success) setBatchData(data.data);
            else setBatchData([]);
        }).catch(e => console.error(e));

    }, [dateFilter.Fromdate, dateFilter.Todate, refresh]);

    const displayData = useMemo(() => {
        return transformStockJournalData(responseData);
    }, [responseData]);

    const handleSourceBatchChange = (rowObj, e) => {
        setSourceBatches(prev => {
            const newInputs = [...prev].filter(item => String(item?.batch)?.length > 0);
            const index = newInputs.findIndex(item => isEqualNumber(item.uniquId, rowObj.PRS_Id));

            if (!e) {
                if (index !== -1) newInputs.splice(index, 1);
                return newInputs;
            }

            const batchVal = e.batchIdString || e.label || e.value;
            const aliasVal = e.label;
            const idVal = e.value;

            if (index !== -1) {
                newInputs[index] = {
                    ...newInputs[index],
                    batch: batchVal,
                    batch_alias: aliasVal,
                    id: idVal
                };
            } else {
                newInputs.push({
                    uniquId: rowObj.PRS_Id,
                    moduleId: rowObj.PR_Id,
                    productId: rowObj.Sour_Item_Id,
                    fromGodownId: rowObj.Sour_Goodown_Id,
                    godownId: rowObj.Sour_Goodown_Id,
                    quantity: rowObj.Sour_Qty,
                    rate: rowObj.Sour_Rate,
                    batch: batchVal,
                    batch_alias: aliasVal,
                    id: idVal
                });
            }
            return newInputs;
        });
    };

    const handleDestBatchChange = (rowObj, e) => {
        setDestBatches(prev => {
            const newInputs = [...prev].filter(item => String(item?.batch_alias || item?.batch)?.length > 0);
            const index = newInputs.findIndex(item => isEqualNumber(item.uniquId, rowObj.PRD_Id));

            if (!e) {
                if (index !== -1) newInputs.splice(index, 1);
                return newInputs;
            }

            const isExisting = !!e.batchIdString;
            const batchVal = isExisting ? e.batchIdString : (rowObj.suggestBatchName || `PRD_${rowObj.Dest_Item_Id}_${Date.now()}`);
            const aliasVal = e.label;
            const idVal = isExisting ? e.value : '';

            if (index !== -1) {
                newInputs[index] = {
                    ...newInputs[index],
                    batch: batchVal,
                    batch_alias: aliasVal,
                    id: idVal
                };
            } else {
                newInputs.push({
                    uniquId: rowObj.PRD_Id,
                    moduleId: rowObj.PR_Id,
                    productId: rowObj.Dest_Item_Id,
                    godownId: rowObj.Dest_Goodown_Id,
                    quantity: rowObj.Dest_Qty,
                    rate: rowObj.Dest_Rate,
                    batch: batchVal,
                    batch_alias: aliasVal,
                    id: idVal
                });
            }
            return newInputs;
        });
    };

    const saveChanges = () => {
        const modifiedSource = sourceBatches.filter(b => String(b?.batch || '').trim().length > 0);
        const modifiedDest = destBatches.filter(b => String(b?.batch || b?.batch_alias || '').trim().length > 0);

        if (modifiedSource.length === 0 && modifiedDest.length === 0) {
            toast.warn('No batches modified to save');
            return;
        }
        
        fetchLink({
            address: 'inventory/batchMaster/processingCombined',
            method: 'POST',
            bodyData: {
                sourceBatches: modifiedSource,
                destBatches: modifiedDest,
                createdBy: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : '',
            },
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setSourceBatches([]);
                setDestBatches([]);
                setRefresh(r => !r);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const closeDialog = () => {
        setDateFilter(pre => ({ ...pre, filterDialog: false }));
    };

    const ButtonArea = () => (
        <>
            <Tooltip title='Filters'>
                <IconButton
                    size="small"
                    onClick={() => setDateFilter(pre => ({
                        ...pre,
                        FilterFromDate: pre.Fromdate,
                        FilterTodate: pre.Todate,
                        filterDialog: true
                    }))}
                ><FilterAlt /></IconButton>
            </Tooltip>

            <Button
                variant="outlined"
                disabled={sourceBatches.length === 0 && destBatches.length === 0}
                onClick={saveChanges}
            >Save Batches</Button>
        </>
    );

    const columns = useMemo(() => [
        { Field_Name: 'SNo', Fied_Data: 'string', ColumnHeader: 'Sno', isVisible: 1, OrderBy: 1 },
        { Field_Name: 'Date', Fied_Data: 'date', ColumnHeader: 'Date', isVisible: 1, OrderBy: 2 },
        { Field_Name: 'VoucherNo', Fied_Data: 'string', ColumnHeader: 'Vch.No', isVisible: 1, OrderBy: 3 },
        { Field_Name: 'SourceItem', Fied_Data: 'string', ColumnHeader: 'Consumption', isVisible: 1, OrderBy: 5 },
        { Field_Name: 'SourceGodown', Fied_Data: 'string', ColumnHeader: 'From', isVisible: 1, OrderBy: 6 },
        { Field_Name: 'SourceQty', Fied_Data: 'number', ColumnHeader: 'C.Qty', isVisible: 1, OrderBy: 7 },
        {
            Field_Name: 'SourceBatch',
            ColumnHeader: 'Source Batch',
            isVisible: 1,
            isCustomCell: true,
            OrderBy: 8,
            Cell: ({ row }) => {
                if (row.isGroupHeader || !row.SourceBatchObj) return null;
                const srcObj = row.SourceBatchObj;
                const existingBatch = String(srcObj.Sour_Batch_Lot_No || '').trim();
                if (existingBatch && existingBatch !== 'null' && existingBatch !== 'undefined') {
                    return <span>{existingBatch}</span>;
                }

                const sDropDown = batchData.filter(b => 
                    isEqualNumber(b.item_id, srcObj.Sour_Item_Id) && 
                    isEqualNumber(b.godown_id, srcObj.Sour_Goodown_Id)
                ).map(b => ({
                    value: b.id,
                    label: b.batch_alias || b.batch,
                    batchIdString: b.batch
                }));

                const val = sourceBatches.find(b => isEqualNumber(b.uniquId, srcObj.PRS_Id));
                
                return (
                    <div style={{ minWidth: '150px' }}>
                        <Select
                            isClearable
                            placeholder="Select Batch"
                            options={sDropDown}
                            value={val ? { value: val.id || val.batch, label: val.batch_alias || val.batch } : null}
                            onChange={e => handleSourceBatchChange(srcObj, e)}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                        />
                    </div>
                );
            }
        },
        { Field_Name: 'DestinationItem', Fied_Data: 'string', ColumnHeader: 'Productions', isVisible: 1, OrderBy: 9 },
        { Field_Name: 'DestinationGodown', Fied_Data: 'string', ColumnHeader: 'To', isVisible: 1, OrderBy: 10 },
        { Field_Name: 'DestinationQty', Fied_Data: 'number', ColumnHeader: 'P.Qty', isVisible: 1, OrderBy: 11 },
        {
            Field_Name: 'DestBatch',
            ColumnHeader: 'Dest Batch',
            isVisible: 1,
            isCustomCell: true,
            OrderBy: 12,
            Cell: ({ row }) => {
                if (row.isGroupHeader || !row.DestinationBatchObj) return null;
                const destObj = row.DestinationBatchObj;
                const existingBatch = String(destObj.Dest_Batch_Lot_No || '').trim();
                if (existingBatch && existingBatch !== 'null' && existingBatch !== 'undefined') {
                    return <span>{existingBatch}</span>;
                }

                const dDropDown = batchData.filter(b => 
                    isEqualNumber(b.item_id, destObj.Dest_Item_Id) && 
                    isEqualNumber(b.godown_id, destObj.Dest_Goodown_Id)
                ).map(b => ({
                    value: b.id,
                    label: b.batch_alias || b.batch,
                    batchIdString: b.batch
                }));

                const val = destBatches.find(b => isEqualNumber(b.uniquId, destObj.PRD_Id));
                
                return (
                    <div style={{ minWidth: '150px' }}>
                        <CreatableSelect
                            isClearable
                            placeholder={destObj.suggestBatchName || 'Batch'}
                            options={dDropDown}
                            value={val ? { value: val.id || val.batch, label: val.batch_alias || val.batch } : null}
                            onChange={e => handleDestBatchChange(destObj, e)}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                        />
                    </div>
                );
            }
        },
        { Field_Name: 'VoucherType', Fied_Data: 'string', ColumnHeader: 'Voucher', isVisible: 1, OrderBy: 13 },
    ].map(cel => ({
        ...cel,
        tdClass: ({ row }) => row?.isGroupHeader ? 'fw-bold bg-light' : ''
    })), [batchData, sourceBatches, destBatches]);

    return (
        <div className="container-fluid p-2">
            <AppTableComponent
                title="PROCESSING BATCH CREATION"
                headerFontSizePx={11}
                bodyFontSizePx={11}
                dataArray={displayData}
                columns={columns}
                maxHeightOption
                ButtonArea={<ButtonArea />}
                ExcelPrintOption
                PDFPrintOption
                disablePagination={!dateFilter.pagination}
                MenuButtons={[{
                    name: 'Pagination',
                    icon: dateFilter.pagination
                        ? <ToggleOn fontSize="small" color='primary' />
                        : <ToggleOff fontSize="small" />,
                    onclick: () => setDateFilter(pre => ({ ...pre, pagination: !pre.pagination }))
                }]}
            />

            <Dialog open={dateFilter.filterDialog} onClose={closeDialog} fullWidth maxWidth='sm'>
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td className="py-1">
                                        <input
                                            type="date"
                                            value={dateFilter.FilterFromDate}
                                            onChange={e => setDateFilter(pre => ({ ...pre, FilterFromDate: e.target.value }))}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td className="py-1">
                                        <input
                                            type="date"
                                            value={dateFilter.FilterTodate}
                                            onChange={e => setDateFilter(pre => ({ ...pre, FilterTodate: e.target.value }))}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                    <Button
                        onClick={() => {
                            setDateFilter(pre => ({
                                ...pre,
                                Fromdate: pre.FilterFromDate,
                                Todate: pre.FilterTodate,
                                filterDialog: false,
                            }));
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UnAssignedProcessing;
