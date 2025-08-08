import { useState, useEffect } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { checkIsNumber, isEqualNumber, LocalDate, stringCompare, toNumber } from "../../../Components/functions";
import { Button, Card } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { getSessionUser } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from "react-select";

const PAGE_SIZE = 10;

const ChooseBatch = ({
    loadingOn,
    loadingOff,
    api,
    postApi,
    compareGodown
}) => {

    const [journalData, setJournalData] = useState([]);
    const [batchData, setBatchData] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [inputs, setInputs] = useState([]);
    const [reload, setReload] = useState(false);
    const userDetails = getSessionUser().user;

    useEffect(() => {
        fetchLink({
            address: api,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) setJournalData(data.data);
            else setJournalData([]);
        }).catch(e => console.error(e));
    }, [api, reload]);

    useEffect(() => {
        fetchLink({
            address: 'inventory/batchMaster/stockBalance',
        }).then(data => {
            if (data.success) setBatchData(data.data);
            else setBatchData([]);
        }).catch(e => console.error(e));
    }, [reload])

    const filtered = useMemo(() => {
        if (!search) return journalData;
        return journalData.filter((item) =>
            Object.values(item).some((v) =>
                String(v).toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [journalData, search]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const handleInputChange = (row, value) => {
        setInputs(prev => {
            const newInputs = [...prev];
            const index = newInputs.findIndex(
                item => (
                    isEqualNumber(item.uniquId, row.uniquId)
                    && stringCompare(item.moduleName, row.moduleName)
                )
            );

            const batchDetails = batchData.find(
                batch => 
                // isEqualNumber(batch.item_id, row.productId) && 
                // isEqualNumber(batch.godown_id, row.godownId) && 
                stringCompare(batch.id, value)
            );

            if (index === -1) {
                newInputs.push({ ...row, batch: batchDetails?.batch || '', id: batchDetails?.id || '' });
            } else {
                newInputs[index].batch = batchDetails?.batch || '';
                newInputs[index].id = batchDetails?.id || '';
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

    return (
        <>
            <Card className="rounded-2xl shadow-md p-4">

                <div className="d-flex align-items-center mb-4">
                    <h5 className="text-xl font-bold m-0 flex-grow-1">
                        Create Batch {inputs.length}
                    </h5>
                    <Button 
                        onClick={sendToBackend} 
                        variant="contained" 
                        className="mx-1"
                        disabled={inputs.length === 0}
                    >Save</Button>
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="cus-inpt w-auto p-2"
                    />
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
                            {paginated.map((item, iInd) => (
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
                                        <Select
                                            value={{ 
                                                value: inputs.find(input => isEqualNumber(input.uniquId, item.uniquId))?.id || '',
                                                label: inputs.find(input => isEqualNumber(input.uniquId, item.uniquId))?.batch || ''
                                            }}
                                            options={[
                                                { value: '', label: 'select' },
                                                ...batchData.filter(
                                                    batch => (
                                                        isEqualNumber(batch.item_id, item.productId)
                                                        && isEqualNumber(batch.godown_id, item[compareGodown])
                                                        && (toNumber(batch.pendingQuantity) >= toNumber(item.quantity))
                                                    )
                                                ).map(batch => ({
                                                    value: batch.id,
                                                    label: batch.batch
                                                }))
                                            ]}
                                            menuPortalTarget={document.body}
                                            onChange={e => handleInputChange(item, e.value)}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                        />
                                    </td>
                                </tr>
                            ))}
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
        </>
    )
}

export default ChooseBatch;