// DestinationOfProcessing.jsx
import { memo } from "react";
import RequiredStar from "../../../../Components/requiredStar";
import Select from "react-select";
import { Button, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { customSelectStyles } from "../../../../Components/tablecolumn";
import {
    Addition,
    checkIsNumber,
    Division,
    isEqualNumber,
    Multiplication,
    onlynum,
} from "../../../../Components/functions";
import { initialDestinationValue } from "./variables";


const DestinationRow = memo(function DestinationRow({
    row,
    index,
    products = [], uom = [], godown = [],
    changeDestinationValues,
    removeRow,
}) {

    return (
        <tr>
            <td className="fa-13">{index + 1}</td>

            <td className="fa-13 p-0" style={{ minWidth: "200px" }}>
                <Select
                    value={{ value: row?.Dest_Item_Id, label: row?.Dest_Item_Name }}
                    onChange={(e) => changeDestinationValues(index, "Dest_Item_Id", e.value)}
                    options={
                        products.map((pro) => ({
                            value: pro.Product_Id,
                            label: pro.Product_Name
                        }))
                    }
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Select Item"
                    maxMenuHeight={300}
                />
            </td>

            <td className="fa-13 px-1 py-0 vctr">
                <input
                    value={row?.Dest_Batch_Lot_No ?? ""}
                    onChange={(e) =>
                        changeDestinationValues(index, "Dest_Batch_Lot_No", e.target.value)
                    }
                    className="cus-inpt p-2"
                />
            </td>

            <td className="fa-13 px-1 py-0 vctr">
                <input
                    value={row?.Dest_Qty ?? ""}
                    required
                    onInput={onlynum}
                    onChange={(e) => changeDestinationValues(index, "Dest_Qty", e.target.value)}
                    className="cus-inpt p-2"
                />
            </td>

            <td className="fa-13 px-1 py-0 vctr">
                <select
                    value={row?.Dest_Unit_Id ?? ""}
                    onChange={(e) =>
                        changeDestinationValues(index, "Dest_Unit_Id", e.target.value)
                    }
                    className="cus-inpt p-2"
                    style={{ minWidth: "40px" }}
                >
                    <option value="" disabled>
                        Select Unit
                    </option>
                    {uom.map((u, ind) => (
                        <option key={u.Unit_Id ?? ind} value={u.Unit_Id}>
                            {u.Units}
                        </option>
                    ))}
                </select>
            </td>

            <td className="fa-13 px-1 py-0 vctr">
                <input
                    value={row?.Dest_Rate ?? ""}
                    onInput={onlynum}
                    onChange={(e) => changeDestinationValues(index, "Dest_Rate", e.target.value)}
                    className="cus-inpt p-2"
                />
            </td>

            <td className="fa-13 px-1 py-0 vctr">
                <input
                    value={row?.Dest_Amt ?? ""}
                    onInput={onlynum}
                    onChange={(e) => changeDestinationValues(index, "Dest_Amt", e.target.value)}
                    className="cus-inpt p-2"
                />
            </td>

            <td className='fa-13 p-0' style={{ minWidth: '200px' }}>
                <Select
                    value={{ value: row?.Dest_Goodown_Id, label: row?.Godown_Name }}
                    onChange={e => {
                        changeDestinationValues(index, 'Dest_Goodown_Id', e.value);
                        changeDestinationValues(index, 'Godown_Name', e.label);
                    }}
                    options={godown.map(g => ({ value: g.Godown_Id, label: g.Godown_Name }))}
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Select Godown"
                    maxMenuHeight={300}
                />
            </td>

            <td className="fa-13 px-1 py-0 p-0 vctr text-center">
                <IconButton color="error" size="small" onClick={removeRow}>
                    <Delete className="fa-20" />
                </IconButton>
            </td>
        </tr>
    );
});


const ProductionOfProcessing = ({
    destinationList = [],
    setDestinationList,
    products = [],
    uom = [],
    godown = [],
}) => {

    const addRow = () => {
        const _rowId =
            (typeof crypto !== "undefined" &&
                crypto.randomUUID &&
                crypto.randomUUID()) ||
            String(Date.now()) + Math.random().toString(36).slice(2);

        setDestinationList((prev) => [
            ...prev,
            { _rowId, ...initialDestinationValue },
        ]);
    };

    const changeDestinationValues = (rowIndex, key, value) => {
        setDestinationList((prev) =>
            prev.map((item, index) => {
                if (!isEqualNumber(index, rowIndex)) return item;

                switch (key) {
                    case "Dest_Item_Id": {
                        const newItem = { ...item, Dest_Item_Id: value };
                        newItem.Dest_Item_Name =
                            products?.find((pro) =>
                                isEqualNumber(pro?.Product_Id, value)
                            )?.Product_Name ?? "Not available";
                        return newItem;
                    }

                    case "Dest_Unit_Id": {
                        const newItem = { ...item, Dest_Unit_Id: value };
                        newItem.Dest_Unit =
                            uom?.find((u) => isEqualNumber(u?.Unit_Id, value))
                                ?.Units ?? "Not available";
                        return newItem;
                    }

                    case "Dest_Qty": {
                        const newItem = { ...item, Dest_Qty: value };
                        if (item.Dest_Rate) {
                            newItem.Dest_Amt = Multiplication(item.Dest_Rate, value);
                        } else if (item.Dest_Amt) {
                            newItem.Dest_Rate = Division(item.Dest_Amt, value);
                        } else {
                            newItem.Dest_Amt = "";
                            newItem.Dest_Rate = "";
                        }
                        return newItem;
                    }

                    case "Dest_Rate": {
                        const newItem = { ...item, Dest_Rate: value };
                        if (item.Dest_Qty) {
                            newItem.Dest_Amt = Multiplication(value, item.Dest_Qty);
                        } else if (item.Dest_Amt) {
                            newItem.Dest_Qty = Division(item.Dest_Amt, value);
                        } else {
                            newItem.Dest_Amt = "";
                            newItem.Dest_Qty = "";
                        }
                        return newItem;
                    }

                    case "Dest_Amt": {
                        const newItem = { ...item, Dest_Amt: value };
                        if (checkIsNumber(item.Dest_Qty)) {
                            newItem.Dest_Rate = Division(value, item.Dest_Qty);
                        } else if (checkIsNumber(item.Dest_Rate)) {
                            newItem.Dest_Qty = Division(value, item.Dest_Rate);
                        } else {
                            newItem.Dest_Rate = "";
                            newItem.Dest_Qty = "";
                        }
                        return newItem;
                    }

                    default:
                        return { ...item, [key]: value };
                }
            })
        );
    };

    return (
        <div className="col-12 p-2 mb-2">
            <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                <h5 className="flex-grow-1 ">PRODUCTION</h5>
                <Button variant="outlined" color="primary" type="button" onClick={addRow}>
                    Add
                </Button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered ">
                    <thead>
                        <tr>
                            <th className="fa-13">Sno</th>
                            <th className="fa-13">
                                Item <RequiredStar />
                            </th>
                            <th className="fa-13">Batch Lot No</th>
                            <th className="fa-13">
                                Quantity <RequiredStar />
                            </th>
                            <th className="fa-13">Unit</th>
                            <th className="fa-13">Rate</th>
                            <th className="fa-13">Amount</th>
                            <th className="fa-13">
                                Location <RequiredStar />
                            </th>
                            <th className="fa-13">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {destinationList.map((row, index) => (
                            <DestinationRow
                                key={row._rowId ?? index}
                                row={row}
                                index={index}
                                products={products}
                                uom={uom}
                                godown={godown}
                                destinationList={destinationList}
                                changeDestinationValues={changeDestinationValues}
                                removeRow={() =>
                                    setDestinationList((list) => list.filter((_, i) => i !== index))
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-end">
                <span className="rounded-2 border bg-light fw-bold text-primary fa-14 p-2">
                    <span className="py-2 pe-2">Total Quantity: </span>
                    {destinationList.reduce((acc, item) => {
                        return checkIsNumber(item?.Dest_Item_Id)
                            ? Addition(acc, item.Dest_Qty)
                            : acc;
                    }, 0)}
                </span>
            </div>
        </div>
    );
}


export default ProductionOfProcessing;