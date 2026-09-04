import { useState, useEffect } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { checkIsNumber, isEqualNumber, LocalDate, reactSelectFilterLogic, stringCompare, toArray, toNumber } from "../../../Components/functions";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, FilterAlt, Search } from "@mui/icons-material";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { getSessionUser } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const PAGE_SIZE = 10;

const ChooseBatch = ({
    loadingOn,
    loadingOff,
    api,
    postApi,
    compareGodown,
    dateFilter,
    setDateFilter
}) => {

    const [journalData, setJournalData] = useState([]);
    const [batchData, setBatchData] = useState([]);
    const [search, setSearch] = useState({
        item: { value: '', label: 'select' },
        fromGodown: { value: '', label: 'select' },
        toGodown: { value: '', label: 'select' },
        searchDialog: false,
        reloadData: false
    });
    const [page, setPage] = useState(1);
    const [inputs, setInputs] = useState([]);
    const [reload, setReload] = useState(false);
    const [uniqueFromGodown, setUniqueFromGodown] = useState([]);
    const [uniqueToGodown, setUniqueToGodown] = useState([]);
    const [uniqueProduct, setUniqueProduct] = useState([]);
    const [bulkSelect, setBulkSelect] = useState({ value: '', label: '' })

    const userDetails = getSessionUser().user;

    const setData = (data) => {
        if (data.success) {
            setJournalData(toArray(data.data));
            setUniqueFromGodown(toArray(data.others.fromGodowns));
            setUniqueToGodown(toArray(data.others.toGodowns));
            setUniqueProduct(toArray(data.others.items));
        } else {
            setJournalData([]);
            setUniqueFromGodown([]);
            setUniqueToGodown([]);
            setUniqueProduct([]);
        }
        setPage(1);
    }

    useEffect(() => {
        fetchLink({
            address: `${api}?
            Fromdate=${dateFilter.Fromdate}&
            Todate=${dateFilter.Todate}&
            fromGodown=${search.fromGodown.value}&
            toGodown=${search.toGodown.value}&
            item=${search.item.value}`,
            loadingOn, loadingOff
        }).then(data => {
            setData(data);
        }).catch(e => console.error(e));
    }, [api, reload, search.reloadData, dateFilter.Fromdate, dateFilter.Todate]);

    useEffect(() => {
        fetchLink({
            address: 'inventory/batchMaster/stockBalance',
        }).then(data => {
            if (data.success) setBatchData(data.data);
            else setBatchData([]);
        }).catch(e => console.error(e));
    }, [reload])

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return journalData.slice(start, start + PAGE_SIZE);
    }, [journalData, page]);

    const totalPages = Math.ceil(journalData.length / PAGE_SIZE);

    const handleInputChange = (row, e) => {
        setInputs(prev => {
            const newInputs = [...prev].filter(item => String(item?.id).length > 0);

            const index = newInputs.findIndex(
                item => (
                    isEqualNumber(item.uniquId, row.uniquId)
                    && stringCompare(item.moduleName, row.moduleName)
                )
            );

            if (index === -1) {
                newInputs.push({ ...row, batch: e?.batchIdString || e?.value || '', batch_alias: e?.batchAliasString || e?.value || '', batch_id: e?.__isNew__ ? '' : e?.value || '' });
            } else {
                newInputs[index].batch = e?.batchIdString || e?.value || '';
                newInputs[index].batch_alias = e?.batchAliasString || e?.value || '';
                newInputs[index].batch_id = e?.__isNew__ ? '' : e?.value || '';
            }
            return newInputs.filter(item => String(item?.batch).length > 0);
        });
    };

    const sendToBackend = () => {
        if (inputs.length === 0) return;

        fetchLink({
            address: postApi,
            method: 'POST',
            bodyData: {
                itemBatch: inputs,
                createdBy: checkIsNumber(userDetails?.UserId) ? userDetails?.UserId : ''
            },
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setInputs([]);
                setReload(!reload);
            } else {
                toast.error(data.message);
            }
        })
    };

    const batchDropdownData = useMemo(() => {

        if (!journalData.length === 0 || !batchData.length === 0) return [];

        const godownId = journalData[0]?.[compareGodown];
        const itemId = journalData[0]?.productId;

        const isSameProduct = journalData.every(item => (
            isEqualNumber(item.productId, itemId)
            && isEqualNumber(item.godownId, godownId)
        ));

        if (!isSameProduct) return [];

        const totalQuantity = journalData.reduce(
            (acc, itm) => {
                if (isEqualNumber(itm.productId, itemId) && isEqualNumber(itm.godownId, godownId)) {
                    return acc + toNumber(itm.quantity);
                }
                return acc;
            }, 0
        );

        return batchData.filter(
            batch => (
                isEqualNumber(batch.item_id, itemId)
                && isEqualNumber(batch.godown_id, godownId)
                && toNumber(batch.pendingQuantity) !== 0
            )
        ).sort((a, b) => new Date(a.trans_date) - new Date(b.trans_date)).map(batch => ({
            value: batch.id,
            label: (toNumber(batch.packValue) > 0) ? `${batch.batch}: ${toNumber(batch.pendingQuantity)}(${toNumber(batch.pendingQuantity) / toNumber(batch.packValue)})` : `${batch.batch}: ${toNumber(batch.pendingQuantity)}`,
            batchIdString: batch.batch,
            batchAliasString: batch.batch_alias
        }));

    }, [journalData, batchData]);

    const onChangeSelect = (e) => {
        setBulkSelect(e);
        setInputs(journalData.map(item => ({
            ...item,
            batch: e?.batchIdString || e?.value || '',
            batch_alias: e?.batchAliasString || e?.value || '',
            id: e?.__isNew__ ? '' : e?.value || ''
        })))
    }

    return (
        <>
            <Card className="rounded-2xl shadow-md p-4">

                <div className="d-flex align-items-center mb-4">
                    <h5 className="text-xl font-bold m-0 flex-grow-1">
                        Create Batch {inputs.length}
                    </h5>

                    <IconButton
                        size="small"
                        onClick={() => setSearch(pre => ({ ...pre, searchDialog: true }))}
                    ><FilterAlt /></IconButton>

                    <div style={{ minWidth: '300px' }}>
                        <CreatableSelect
                            value={bulkSelect}
                            options={[
                                { value: '', label: 'select' },
                                ...batchDropdownData
                            ]}
                            menuPortalTarget={document.body}
                            isDisabled={batchDropdownData.length === 0}
                            onChange={onChangeSelect}
                            styles={customSelectStyles}
                            isSearchable={true}
                            isClearable={true}
                            filterOption={reactSelectFilterLogic}
                        />
                    </div>

                    <Button
                        onClick={sendToBackend}
                        variant="contained"
                        className="mx-1"
                        disabled={inputs.some(inpt => String(inpt?.id)?.length === 0) || inputs.length === 0}
                    >Save</Button>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered border">
                        <thead>
                            <tr>
                                {[
                                    'Sno', 'Date', 'Product', 'voucher',
                                    'From', 'To', 'Qty',
                                    'Rate', 'Amount', 'Batch',
                                ].map(
                                    (col, colI) => (
                                        <th key={colI} className="vctr fa-12">{col}</th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((item, iInd) => {

                                const batchDropDown = batchData.filter(
                                    batch => (
                                        isEqualNumber(batch.item_id, item.productId)
                                        && isEqualNumber(batch.godown_id, item[compareGodown])
                                        && toNumber(batch.pendingQuantity) !== 0
                                    )
                                ).sort((a, b) => new Date(a.trans_date) - new Date(b.trans_date)).map(batch => ({
                                    value: batch.id,
                                    label: (toNumber(batch.packValue) > 0) ? `${batch.batch}: ${toNumber(batch.pendingQuantity)}(${toNumber(batch.pendingQuantity) / toNumber(batch.packValue)})` : `${batch.batch}: ${toNumber(batch.pendingQuantity)}`,
                                    batchIdString: batch.batch,
                                    batchAliasString: batch.batch_alias
                                }));

                                return (
                                    <tr key={iInd}>
                                        <td className="vctr fa-12">{iInd + 1}</td>
                                        <td className="vctr fa-12">{LocalDate(item.eventDate)}</td>
                                        {[
                                            'productNameGet', 'voucherNumber',
                                            'fromGodownGet', 'toGodownGet', 'quantity',
                                            'rate', 'amount'
                                        ].map(
                                            (col, colI) => (
                                                <td key={colI} className="vctr fa-12">{item[col]}</td>
                                            )
                                        )}
                                        <td className="vctr fa-12 p-0">
                                            <CreatableSelect
                                                value={{
                                                    value: inputs.find(input =>
                                                        isEqualNumber(input.uniquId, item.uniquId))?.batch_id ||
                                                        inputs.find(input => isEqualNumber(input.uniquId, item.uniquId))?.batch ||
                                                        '',
                                                    label: inputs.find(input =>
                                                        isEqualNumber(input.uniquId, item.uniquId))?.batch_id ?
                                                        inputs.find(input => isEqualNumber(input.uniquId, item.uniquId))?.batch : (
                                                            inputs.find(input => isEqualNumber(input.uniquId, item.uniquId))?.batch_alias ||
                                                            inputs.find(input => isEqualNumber(input.uniquId, item.uniquId))?.batch || ''
                                                        )
                                                }}
                                                options={[
                                                    { value: '', label: 'select' },
                                                    ...batchDropDown
                                                ]}
                                                menuPortalTarget={document.body}
                                                onChange={e => handleInputChange(item, e)}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                isClearable={true}
                                                isDisabled={batchDropDown.length === 0}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs">Page {page} of {totalPages}</span>
                        <Button variant="outline" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </Card>

            <Dialog
                open={search.searchDialog}
                onClose={() => setSearch(pre => ({ ...pre, searchDialog: false }))}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                {/* date filter */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            id='from'
                                            className='cus-inpt p-2 w-auto me-2'
                                            value={dateFilter.Fromdate}
                                            onChange={e => setDateFilter(pre => ({ ...pre, Fromdate: e.target.value }))}
                                        />
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            id='to'
                                            className='cus-inpt p-2 w-auto'
                                            value={dateFilter.Todate}
                                            onChange={e => setDateFilter(pre => ({ ...pre, Todate: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                {/* item filter */}
                                <tr>
                                    <td>Item</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={{
                                                value: search.item.value,
                                                label: search.item.label
                                            }}
                                            options={[
                                                { value: '', label: 'select' },
                                                ...uniqueProduct
                                            ]}
                                            menuPortalTarget={document.body}
                                            onChange={e => setSearch(pre => ({ ...pre, item: e }))}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>
                                {/* from godown */}
                                <tr>
                                    <td>From godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={{
                                                value: search.fromGodown.value,
                                                label: search.fromGodown.label
                                            }}
                                            options={[
                                                { value: '', label: 'select' },
                                                ...uniqueFromGodown
                                            ]}
                                            menuPortalTarget={document.body}
                                            onChange={e => setSearch(pre => ({ ...pre, fromGodown: e }))}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>
                                {/* to godown */}
                                <tr>
                                    <td>To Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={{
                                                value: search.toGodown.value,
                                                label: search.toGodown.label
                                            }}
                                            options={[
                                                { value: '', label: 'select' },
                                                ...uniqueToGodown
                                            ]}
                                            menuPortalTarget={document.body}
                                            onChange={e => setSearch(pre => ({ ...pre, toGodown: e }))}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSearch(pre => ({ ...pre, searchDialog: false }))}
                    >close</Button>
                    <Button
                        startIcon={<Search />}
                        onClick={() => setSearch(pre => ({ ...pre, reloadData: !pre.reloadData, searchDialog: false }))}
                        variant="outlined" sx={{ ml: 1 }}
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ChooseBatch;