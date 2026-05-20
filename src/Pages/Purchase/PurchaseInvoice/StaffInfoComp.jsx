import { Button, IconButton } from "@mui/material";
import { checkIsNumber, isEqualNumber, reactSelectFilterLogic } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from 'react-select';
import { Delete } from "@mui/icons-material";

const PurchaseInvoiceStaffInvolved = ({
    baseData,
    StaffArray,
    setStaffArray,
    staffRowDetails
}) => {
    return (
        <>

            {/* staff info */}
            <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                    <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                        <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                        <Button
                            variant="outlined"
                            color="primary"
                            type="button"
                            onClick={() => setStaffArray([...StaffArray, { ...staffRowDetails }])}
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
                                                value: row?.Involved_Emp_Id,
                                                label: row?.Involved_Emp_Name,
                                            }}
                                            onChange={e => setStaffArray((prev) => {
                                                return prev.map((item, ind) => {
                                                    if (isEqualNumber(ind, index)) {
                                                        const staff = baseData.staff.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                        return {
                                                            ...item,
                                                            Cost_Center_Type_Id:
                                                                checkIsNumber(item.Cost_Center_Type_Id)
                                                                    ? Number(item.Cost_Center_Type_Id)
                                                                    : checkIsNumber(staff.User_Type)
                                                                        ? Number(staff.User_Type)
                                                                        : 0,
                                                            Involved_Emp_Id: Number(e.value),
                                                            Involved_Emp_Name: e.label
                                                        }
                                                    }
                                                    return item;
                                                });
                                            })}
                                            options={
                                                [...baseData.staff.filter(fil => (
                                                    !StaffArray.some(st => (
                                                        isEqualNumber(st.Involved_Emp_Id, fil.Cost_Center_Id)
                                                    ))
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
                                            value={row?.Cost_Center_Type_Id}
                                            onChange={e => setStaffArray((prev) => {
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
                                            className="cus-inpt p-2 border-0"
                                        >
                                            <option value="">Select</option>
                                            {baseData.staffType.map((st, sti) =>
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

export default PurchaseInvoiceStaffInvolved;