import { checkIsNumber, isEqualNumber, reactSelectFilterLogic } from "../../../../Components/functions";
import { initialStaffDetailsValue } from "../variable";
import Select from 'react-select';
import { customSelectStyles } from '../../../../Components/tablecolumn';
import { Button, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

const PurchseOrderStaffInvolved = ({
    StaffArray = [],
    costCenterData = [],
    costCenterCategoryData = [],
    setStaffArray,
}) => {
    return (
        <>
            <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                    <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                        <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                        <Button
                            variant="outlined"
                            color="primary"
                            type="button"
                            onClick={() => setStaffArray([...StaffArray, { ...initialStaffDetailsValue }])}
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
                            {StaffArray.map((row, index) => (
                                <tr key={index}>
                                    <td className='fa-13 vctr text-center'>{index + 1}</td>
                                    <td className='fa-13 w-100 p-0'>
                                        <Select
                                            value={{
                                                value: row?.EmployeeId,
                                                label: costCenterData.find(
                                                    c => isEqualNumber(c?.Cost_Center_Id, row?.EmployeeId)
                                                )?.Cost_Center_Name
                                            }}
                                            onChange={e => setStaffArray((prev) => {
                                                return prev.map((item, ind) => {
                                                    if (isEqualNumber(ind, index)) {
                                                        const staff = costCenterData.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                        return {
                                                            ...item,
                                                            CostType:
                                                                checkIsNumber(item.CostType)
                                                                    ? Number(item.CostType)
                                                                    : checkIsNumber(staff.User_Type)
                                                                        ? Number(staff.User_Type)
                                                                        : 0,
                                                            EmployeeId: Number(e.value),
                                                        }
                                                    }
                                                    return item;
                                                });
                                            })}
                                            options={
                                                [...costCenterData.filter(fil => (
                                                    StaffArray.findIndex(st => (
                                                        isEqualNumber(st.EmployeeId, fil.Cost_Center_Id)
                                                    )) === -1 ? true : false
                                                ))].map(st => ({
                                                    value: st.Cost_Center_Id,
                                                    label: st.Cost_Center_Name
                                                }))
                                            }
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Staff"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                    <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '100px' }}>
                                        <select
                                            value={row?.CostType}
                                            onChange={e => setStaffArray((prev) => {
                                                return prev.map((item, ind) => {
                                                    if (isEqualNumber(ind, index)) {
                                                        return {
                                                            ...item,
                                                            CostType: e.target.value
                                                        }
                                                    }
                                                    return item;
                                                });
                                            })}
                                            className="cus-inpt p-2 border-0"
                                        >
                                            <option value="">Select</option>
                                            {costCenterCategoryData.map((st, sti) =>
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
                </div>
            </div>
        </>
    )
}

export default PurchseOrderStaffInvolved;