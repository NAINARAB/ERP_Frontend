import { Button, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { salesInvoiceStaffInfo } from "./variable";
import { checkIsNumber, isEqualNumber, reactSelectFilterLogic, toArray } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import Select from "react-select";

const InvolvedStaffs = ({ StaffArray = [], setStaffArray, costCenter = [], costCategory = [] }) => {
    

    const getAllStaffs = (currentIndex) => {
        return toArray(costCenter)
            .filter(staff => 
       
                !StaffArray.some((st, idx) => 
                    idx !== currentIndex && 
                    isEqualNumber(st.Emp_Id, staff.Cost_Center_Id)
                )
            )
            .map(st => ({
                value: st.Cost_Center_Id,
                label: st.Cost_Center_Name,
                userType: st.User_Type 
            }));
    };


    const getFilteredStaffs = (categoryId, currentIndex) => {
        if (!checkIsNumber(categoryId)) return [];
        
        return toArray(costCenter)
            .filter(staff => 
                isEqualNumber(staff.User_Type, categoryId) && 
          
                !StaffArray.some((st, idx) => 
                    idx !== currentIndex && 
                    isEqualNumber(st.Emp_Id, staff.Cost_Center_Id)
                )
            )
            .map(st => ({
                value: st.Cost_Center_Id,
                label: st.Cost_Center_Name,
                userType: st.User_Type
            }));
    };


    const handleStaffChange = (selectedOption, index) => {
        setStaffArray(prev => 
            prev.map((staffRow, idx) => {
                if (idx === index) {
                    const selectedStaff = toArray(costCenter).find(
                        st => isEqualNumber(st.Cost_Center_Id, selectedOption.value)
                    );
                    
                    return {
                        ...staffRow,
                        Emp_Id: Number(selectedOption.value),
                        Emp_Name: selectedOption.label,
                     
                        Emp_Type_Id: selectedStaff?.User_Type || ""
                    };
                }
                return staffRow;
            })
        );
    };


    const handleCategoryChange = (e, index) => {
        const newCategoryId = e.target.value;
        setStaffArray(prev => 
            prev.map((staffRow, idx) => {
                if (idx === index) {
           
                    const currentStaff = toArray(costCenter).find(
                        st => isEqualNumber(st.Cost_Center_Id, staffRow.Emp_Id)
                    );
                    
                    const shouldClearStaff = currentStaff && 
                        !isEqualNumber(currentStaff.User_Type, newCategoryId);
                    
                    return {
                        ...staffRow,
                        Emp_Type_Id: newCategoryId,
                        ...(shouldClearStaff ? {
                            Emp_Id: "",
                            Emp_Name: ""
                        } : {})
                    };
                }
                return staffRow;
            })
        );
    };

    
    const getStaffOptions = (row, index) => {
        if (checkIsNumber(row?.Emp_Type_Id)) {
            
            return getFilteredStaffs(row.Emp_Type_Id, index);
        } else {
  
            return getAllStaffs(index);
        }
    };


    const getCategoryName = (categoryId) => {
        const category = toArray(costCategory).find(
            cat => isEqualNumber(cat.Cost_Category_Id, categoryId)
        );
        return category?.Cost_Category || "";
    };

    return (
        <>
            <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                <Button
                    variant="outlined"
                    color="primary"
                    type="button"
                    onClick={() => setStaffArray(pre => [...pre, { ...salesInvoiceStaffInfo }])}
                >
                    Add
                </Button>
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th className="fa-13">Sno</th>
                        <th className="fa-13">Category</th>
                        <th className="fa-13">Staff Name</th>
                        <th className="fa-13">#</th>
                    </tr>
                </thead>

                <tbody>
                    {toArray(StaffArray).map((row, index) => (
                        <tr key={index}>
                            <td className='fa-13 vctr text-center'>{index + 1}</td>
                            
                         
                          
                       
                            <td className='fa-13 w-100 p-0'>
                                <Select
                                    value={checkIsNumber(row?.Emp_Id) ? {
                                        value: row?.Emp_Id,
                                        label: row?.Emp_Name,
                                    } : null}
                                    onChange={(e) => handleStaffChange(e, index)}
                                    options={getStaffOptions(row, index)}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder="Select Staff"
                                    filterOption={reactSelectFilterLogic}
                                    noOptionsMessage={() => {
                                        if (checkIsNumber(row?.Emp_Type_Id)) {
                                            return "No staff available for this category";
                                        }
                                        return "No staff available";
                                    }}
                                />
                            </td>
                              <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '100px' }}>
                                <select
                                    value={row?.Emp_Type_Id || ""}
                                    onChange={(e) => handleCategoryChange(e, index)}
                                    className="cus-inpt p-2 border-0 w-100"
                                >
                                    <option value="">Select Category</option>
                                    {toArray(costCategory).map((category, idx) => (
                                        <option value={category?.Cost_Category_Id} key={idx}>
                                            {category?.Cost_Category}
                                        </option>
                                    ))}
                                </select>
                            </td>
                           
                            <td className='fa-13 vctr p-0'>
                                <IconButton
                                    onClick={() => {
                                        setStaffArray(prev => 
                                            prev.filter((_, filIndex) => index !== filIndex)
                                        );
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
    );
}

export default InvolvedStaffs;