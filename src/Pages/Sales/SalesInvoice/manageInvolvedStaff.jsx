import { Button, IconButton } from "@mui/material";
import { useState } from "react";
import { salesInvoiceStaffInfo } from "./variable";
import { checkIsNumber, isEqualNumber, toArray } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import Select from "react-select";

const InvolvedStaffs = ({ StaffArray = [], setStaffArray, costCenter = [], costCategory = [], }) => {

    return (
        <>

            <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                <Button
                    variant="outlined"
                    color="primary"
                    type="button"
                    onClick={() => setStaffArray(pre => [...pre, { ...salesInvoiceStaffInfo }])}
                >Add</Button>
            </div>

            <table className="table table-bordered">

                <thead>
                    <tr>
                        <th className="fa-13">Sno</th>
                        <th className="fa-13">Staff Name</th>
                        <th className="fa-13">Category</th>
                        <th className="fa-13">#</th>
                    </tr>
                </thead>

                <tbody>
                    {toArray(StaffArray).map((row, index) => (
                        <tr key={index}>
                            <td className='fa-13 vctr text-center'>{index + 1}</td>
                            <td className='fa-13 w-100 p-0'>
                                <Select
                                    value={{
                                        value: row?.Emp_Id,
                                        label: row?.Emp_Name,
                                    }}
                                    onChange={e => setStaffArray(prev => {
                                        return prev.map((staffRow, ind) => {
                                            if (isEqualNumber(ind, index)) {
                                                const staff = toArray(costCenter).find(c => isEqualNumber(c?.Cost_Center_Id, e.value))
                                                return {
                                                    ...staffRow,
                                                    Emp_Type_Id:
                                                        checkIsNumber(staffRow?.Emp_Type_Id)
                                                            ? Number(staffRow?.Emp_Type_Id)
                                                            : checkIsNumber(staff.User_Type)
                                                                ? Number(staff.User_Type)
                                                                : 0,
                                                    Emp_Id: Number(e.value),
                                                    Emp_Name: e.label
                                                }
                                            }
                                            return staffRow;
                                        });
                                    })}
                                    options={
                                        [...toArray(costCenter).filter(fil => (
                                            !StaffArray.some(st => (
                                                isEqualNumber(st.Emp_Id, fil.Cost_Center_Id)
                                            ))
                                        ))].map(st => ({
                                            value: st.Cost_Center_Id,
                                            label: st.Cost_Center_Name
                                        }))
                                    }
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Staff"}
                                />
                            </td>
                            <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '100px' }}>
                                <select
                                    value={row?.Emp_Type_Id}
                                    onChange={e => setStaffArray((prev) => {
                                        return prev.map((staffRow, ind) => {
                                            if (isEqualNumber(ind, index)) {
                                                return {
                                                    ...staffRow,
                                                    Emp_Type_Id: e.target.value
                                                }
                                            }
                                            return staffRow;
                                        });
                                    })}
                                    className="cus-inpt p-2 border-0"
                                >
                                    <option value="">Select</option>
                                    {toArray(costCategory).map((st, sti) =>
                                        <option value={st?.Cost_Category_Id} key={sti}>{st?.Cost_Category}</option>
                                    )}
                                </select>
                            </td>
                            <td className='fa-13 vctr p-0'>
                                <IconButton
                                    onClick={() => {
                                        setStaffArray(prev => {
                                            return prev.filter((_, filIndex) => index !== filIndex);
                                        });
                                    }}
                                    size='small'
                                >
                                    <Delete color='error' />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </>
    )
}

export default InvolvedStaffs;