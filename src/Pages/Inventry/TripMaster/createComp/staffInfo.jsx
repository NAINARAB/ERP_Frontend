import { Button, IconButton } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../../../Components/tablecolumn";
import { tripStaffsColumns } from "../tableColumns";
import { checkIsNumber, isEqualNumber } from "../../../../Components/functions";
import { Delete } from "@mui/icons-material";


const TripSheetStaffInvolved = ({
    staffInvolvedList,
    setStaffInvolvedList,
    costCenter,
    costCenterCategory
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
                            onClick={() => setStaffInvolvedList([...staffInvolvedList, { ...tripStaffsColumns }])}
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
                            {staffInvolvedList.map((row, index) => (
                                <tr key={index}>
                                    <td className='fa-13 vctr text-center'>{index + 1}</td>
                                    <td className='fa-13 w-100 p-0'>
                                        <Select
                                            value={{
                                                value: row?.Involved_Emp_Id,
                                                label: row?.Emp_Name
                                            }}
                                            onChange={e => setStaffInvolvedList((prev) => {
                                                return prev.map((item, ind) => {
                                                    if (isEqualNumber(ind, index)) {
                                                        const staff = costCenter.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                        return {
                                                            ...item,
                                                            Cost_Center_Type_Id:
                                                                checkIsNumber(item.Cost_Center_Type_Id)
                                                                    ? item.Cost_Center_Type_Id
                                                                    : checkIsNumber(staff.User_Type)
                                                                        ? staff.User_Type
                                                                        : 0,
                                                            Involved_Emp_Id: e.value,
                                                            Emp_Name: staff.Cost_Center_Name ?? ''
                                                        }
                                                    }
                                                    return item;
                                                });
                                            })}
                                            options={
                                                [...costCenter.filter(fil => (
                                                    staffInvolvedList.findIndex(st => (
                                                        isEqualNumber(st.Involved_Emp_Id, fil.Cost_Center_Id)
                                                    )) === -1 ? true : false
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
                                    <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '80px' }}>
                                        <select
                                            value={row?.Cost_Center_Type_Id}
                                            onChange={e => setStaffInvolvedList((prev) => {
                                                return prev.map((item, ind) => {
                                                    if (isEqualNumber(ind, index)) {
                                                        return {
                                                            ...item,
                                                            Cost_Center_Type_Id: e.target.value
                                                        }
                                                    }
                                                    return item;
                                                });
                                            })}
                                            className="cus-inpt p-2"
                                        >
                                            <option value="">Select</option>
                                            {costCenterCategory.map((st, sti) =>
                                                <option value={st?.Cost_Category_Id} key={sti}>{st?.Cost_Category}</option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='fa-13 vctr p-0'>
                                        <IconButton
                                            onClick={() => {
                                                setStaffInvolvedList(prev => {
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

export default TripSheetStaffInvolved;