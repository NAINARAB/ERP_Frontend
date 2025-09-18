import RequiredStar from '../../../../Components/requiredStar';
import { initialSoruceValue } from './variables'
import Select from 'react-select';
import { customSelectStyles } from "../../../../Components/tablecolumn";
import { Addition, checkIsNumber, Division, isEqualNumber, Multiplication, onlynum, rid, toNumber } from '../../../../Components/functions';
import { Button, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { memo, useEffect } from 'react';
import { fetchLink } from '../../../../Components/fetchComponent';
import { useState } from 'react';

const SourceItems = memo(function SourceItems({
    row,
    index,
    products,
    uom,
    godown,
    changeSourceValue,
    removeRow,
}) {
    const [batchDetails, setBatchDetails] = useState([]);

    useEffect(() => {
        if (!checkIsNumber(row?.Sour_Item_Id)) return;
        fetchLink({
            address: `inventory/batchMaster/stockBalance?Product_Id=${row?.Sour_Item_Id}`
        }).then(
            data => setBatchDetails(data.success ? data.data : [])
        ).catch(() => setBatchDetails([]));
    }, [row?.Sour_Item_Id]);

    return (
        <tr>
            <td className='fa-13'>{index + 1}</td>
            <td className='fa-13 p-0' style={{ minWidth: '200px' }}>
                <Select
                    value={{ value: row?.Sour_Item_Id, label: row?.Sour_Item_Name }}
                    onChange={e => changeSourceValue(index, 'Sour_Item_Id', e.value)}
                    options={products.map(pro => ({ value: pro.Product_Id, label: pro.Product_Name }))}
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Select Item"
                    maxMenuHeight={300}
                />
            </td>

            <td className='fa-13 px-1 py-0 vctr'>
                <input
                    value={row?.Sour_Qty ?? ""}
                    required
                    onInput={onlynum}
                    onChange={e => changeSourceValue(index, 'Sour_Qty', e.target.value)}
                    className="cus-inpt p-2"
                />
            </td>

            <td className='fa-13 px-1 py-0 vctr'>
                <select
                    value={row?.Sour_Unit_Id ?? ""}
                    onChange={e => changeSourceValue(index, 'Sour_Unit_Id', e.target.value)}
                    className="cus-inpt p-2"
                    style={{ minWidth: '40px' }}
                >
                    <option value="" disabled>Select Unit</option>
                    {uom.map((u, ind) => (
                        <option key={u.Unit_Id ?? ind} value={u.Unit_Id}>{u.Units}</option>
                    ))}
                </select>
            </td>

            <td className='fa-13 px-1 py-0 vctr'>
                <input
                    value={row?.Sour_Rate ?? ""}
                    onInput={onlynum}
                    onChange={e => changeSourceValue(index, 'Sour_Rate', e.target.value)}
                    className="cus-inpt p-2"
                />
            </td>

            <td className='fa-13 px-1 py-0 vctr'>
                <input
                    value={row?.Sour_Amt ?? ""}
                    onInput={onlynum}
                    onChange={e => changeSourceValue(index, 'Sour_Amt', e.target.value)}
                    className="cus-inpt p-2"
                />
            </td>

            <td className='fa-13 p-0' style={{ minWidth: '200px' }}>
                <Select
                    value={{ value: row?.Sour_Goodown_Id, label: row?.Godown_Name }}
                    onChange={e => {
                        changeSourceValue(index, 'Sour_Goodown_Id', e.value);
                        changeSourceValue(index, 'Godown_Name', e.label);
                        changeSourceValue(index, 'Sour_Batch_Lot_No', '');
                    }}
                    options={godown.map(g => ({ value: g.Godown_Id, label: g.Godown_Name }))}
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Select Godown"
                    maxMenuHeight={300}
                />
            </td>

            <td className='fa-13 p-0' style={{ minWidth: '200px' }}>
                <Select
                    value={{ value: row?.Sour_Batch_Lot_No, label: row?.Sour_Batch_Lot_No }}
                    onChange={e => {
                        const selectedBatch = batchDetails.find(b => b.id === e.value);
                        changeSourceValue(index, 'Sour_Batch_Lot_No', selectedBatch?.batch || '');
                        changeSourceValue(index, 'Sour_Goodown_Id', selectedBatch?.godown_id || '');
                        changeSourceValue(index, 'Godown_Name', selectedBatch?.godownName || '');
                    }}
                    options={
                        batchDetails
                            .filter(b => 
                                checkIsNumber(row?.Sour_Goodown_Id, 1) 
                                ? isEqualNumber(b.godown_id, row?.Sour_Goodown_Id)
                                : true
                            )
                            .map(b => ({ value: b.id, label: `${b?.batch} (${toNumber(b?.pendingQuantity)})` }))
                    }
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Select Godown"
                    maxMenuHeight={300}
                />
            </td>

            <td className='fa-13 px-1 py-0 p-0 vctr text-center'>
                <IconButton color="error" size="small" onClick={removeRow}>
                    <Delete className="fa-20" />
                </IconButton>
            </td>
        </tr>
    );
});

const ConsumptionOfProcessing = ({
    sourceList = [],
    setSourceList,
    products = [],
    uom = [],
    godown = [],
}) => {

    const changeSourceValue = (rowIndex, key, value) => {
        setSourceList((prev) => {
            return prev.map((item, index) => {

                if (isEqualNumber(index, rowIndex)) {
                    switch (key) {
                        case 'Sour_Item_Id': {
                            const newItem = { ...item, Sour_Item_Id: value };
                            newItem.Sour_Item_Name = products?.find(pro =>
                                isEqualNumber(pro?.Product_Id, value)
                            )?.Product_Name ?? 'Not available';
                            return newItem;
                        }
                        case 'Sour_Unit_Id': {
                            const newItem = { ...item, Sour_Unit_Id: value };
                            newItem.Sour_Unit = uom?.find(uom =>
                                isEqualNumber(uom?.Unit_Id, value)
                            )?.Units ?? 'Not available';
                            return newItem;
                        }
                        case 'Sour_Qty': {
                            const newItem = { ...item, Sour_Qty: value };
                            if (item.Sour_Rate) {
                                newItem.Sour_Amt = Multiplication(item.Sour_Rate, value);
                            } else if (item.Sour_Amt) {
                                newItem.Sour_Rate = Division(item.Sour_Amt, value);
                            } else {
                                newItem.Sour_Amt = '';
                                newItem.Sour_Rate = '';
                            }
                            return newItem;
                        }
                        case 'Sour_Rate': {
                            const newItem = { ...item, Sour_Rate: value };
                            if (item.Sour_Qty) {
                                newItem.Sour_Amt = Multiplication(value, item.Sour_Qty);
                            } else if (item.Sour_Amt) {
                                newItem.Sour_Qty = Division(item.Sour_Amt, value);
                            } else {
                                newItem.Sour_Amt = '';
                                newItem.Sour_Qty = '';
                            }
                            return newItem;
                        }
                        case 'Sour_Amt': {
                            const newItem = { ...item, Sour_Amt: value };
                            if (checkIsNumber(item.Sour_Qty)) {
                                newItem.Sour_Rate = Division(value, item.Sour_Qty);
                            } else if (checkIsNumber(item.Sour_Rate)) {
                                newItem.Sour_Qty = Division(value, item.Sour_Rate);
                            } else {
                                newItem.Sour_Rate = '';
                                newItem.Sour_Qty = '';
                            }
                            return newItem;
                        }
                        default:
                            return { ...item, [key]: value };
                    }
                }
                return item;
            });
        });
    };

    const addRow = () => {
        setSourceList(prev => [
            ...prev,
            { _rowId: rid(), ...initialSoruceValue }
        ]);
    }

    return (
        <div className="col-12 p-2 mb-2">
            <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                <h5 className="flex-grow-1 ">
                    CONSUMPTION
                </h5>
                <Button
                    variant="outlined"
                    color="primary"
                    type="button"
                    onClick={addRow}
                >Add</Button>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th className="fa-13">Sno</th>
                            <th className="fa-13">Item <RequiredStar /></th>
                            <th className="fa-13">Quantity <RequiredStar /></th>
                            <th className="fa-13">Unit</th>
                            <th className="fa-13">Rate</th>
                            <th className="fa-13">Amount</th>
                            <th className="fa-13">Location <RequiredStar /></th>
                            <th className="fa-13">Batch Lot No</th>
                            <th className="fa-13">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sourceList.map((row, index) => (
                            <SourceItems
                                key={row._rowId ?? index}
                                row={row}
                                index={index}
                                products={products}
                                uom={uom}
                                godown={godown}
                                changeSourceValue={changeSourceValue}
                                removeRow={() =>
                                    setSourceList(list => list.filter((_, i) => i !== index))
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-end">
                <span className="rounded-2 border bg-light fw-bold text-primary fa-14 p-2">
                    <span className=" py-2 pe-2">Total Quantity: </span>
                    {sourceList.reduce((acc, item) => {
                        return checkIsNumber(item?.Sour_Item_Id) ? Addition(acc, item.Sour_Qty) : acc;
                    }, 0)}
                </span>
            </div>
        </div>
    )
}

export default ConsumptionOfProcessing;