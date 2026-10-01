import { Button, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { salesInvoiceStaffInfo } from "./variable";
import { checkIsNumber, isEqualNumber, toArray, toNumber } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import Select from "react-select";

const InvolvedStaffs = ({ StaffArray = [], setStaffArray, costCenter = [], costCategory = [] }) => {

    const getStaffOrderBy = (staff) => {
        if (checkIsNumber(staff?.Order_By)) {
            return Number(staff.Order_By);
        }
        const category = toArray(costCategory).find(
            cat => isEqualNumber(cat.Cost_Category_Id, staff?.Emp_Type_Id)
        );
        if (checkIsNumber(category?.Order_By)) {
            return Number(category.Order_By);
        }
        return null;
    };

    const sortStaffs = (list) => {
        return [...list].sort((a, b) => {
            const aOrder = getStaffOrderBy(a);
            const bOrder = getStaffOrderBy(b);
            if (aOrder === null && bOrder === null) return 0;
            if (aOrder === null) return 1;
            if (bOrder === null) return -1;
            return aOrder - bOrder;
        });
    };

    useEffect(() => {
        if (costCategory.length > 0 && StaffArray.length > 0) {
            let hasChanges = false;
            const updated = StaffArray.map(staff => {
                const category = toArray(costCategory).find(
                    cat => isEqualNumber(cat.Cost_Category_Id, staff.Emp_Type_Id)
                );
                const correctOrderBy = (category && checkIsNumber(category.Order_By))
                    ? category.Order_By
                    : (staff.Order_By ?? "");

                if (staff.Order_By !== correctOrderBy) {
                    hasChanges = true;
                    return { ...staff, Order_By: correctOrderBy };
                }
                return staff;
            });

            const sorted = sortStaffs(updated);
            const isDifferentOrder = sorted.some((item, idx) => item !== StaffArray[idx]);

            if (hasChanges || isDifferentOrder) {
                setStaffArray(sorted);
            }
        }
    }, [costCategory]);

    const getAllStaffs = (currentIndex, currentRow) => {
        return toArray(costCenter)
            .filter(staff =>
                !StaffArray.some((st, idx) =>
                    (currentRow ? st !== currentRow : idx !== currentIndex) &&
                    isEqualNumber(st.Emp_Id, staff.Cost_Center_Id)
                )
            )
            .map(st => ({
                value: st.Cost_Center_Id,
                label: st.Allias_Name,
                costCenterName: st.Cost_Center_Name,
                userType: st.User_Type
            }));
    };

    const getFilteredStaffs = (categoryId, currentIndex, currentRow) => {
        if (!checkIsNumber(categoryId)) return [];

        return toArray(costCenter)
            .filter(staff =>
                isEqualNumber(staff.User_Type, categoryId) &&
                !StaffArray.some((st, idx) =>
                    (currentRow ? st !== currentRow : idx !== currentIndex) &&
                    isEqualNumber(st.Emp_Id, staff.Cost_Center_Id)
                )
            )
            .map(st => ({
                value: st.Cost_Center_Id,
                label: st.Allias_Name,
                costCenterName: st.Cost_Center_Name,
                userType: st.User_Type
            }));
    };

    const handleStaffChange = (selectedOption, index, targetRow) => {
        setStaffArray(prev => {
            const selectedStaff = toArray(costCenter).find(
                st => isEqualNumber(st.Cost_Center_Id, selectedOption.value)
            );
            const userType = selectedStaff?.User_Type || "";
            const category = toArray(costCategory).find(
                cat => isEqualNumber(cat.Cost_Category_Id, userType)
            );
            const orderBy = (category && checkIsNumber(category.Order_By)) ? category.Order_By : "";

            const targetIndex = (targetRow && prev.indexOf(targetRow) !== -1) ? prev.indexOf(targetRow) : index;

            const updated = prev.map((staffRow, idx) => {
                if (idx === targetIndex) {
                    return {
                        ...staffRow,
                        Emp_Id: Number(selectedOption.value),
                        Emp_Name: selectedOption.label,
                        Emp_Type_Id: userType,
                        Order_By: orderBy
                    };
                }
                return staffRow;
            });

            return sortStaffs(updated);
        });
    };

    const handleCategoryChange = (e, index, targetRow) => {
        const newCategoryId = e.target.value;
        const category = toArray(costCategory).find(
            cat => isEqualNumber(cat.Cost_Category_Id, newCategoryId)
        );
        const orderBy = (category && checkIsNumber(category.Order_By)) ? category.Order_By : "";

        setStaffArray(prev => {
            const targetIndex = (targetRow && prev.indexOf(targetRow) !== -1) ? prev.indexOf(targetRow) : index;

            const updated = prev.map((staffRow, idx) => {
                if (idx === targetIndex) {
                    const currentStaff = toArray(costCenter).find(
                        st => isEqualNumber(st.Cost_Center_Id, staffRow.Emp_Id)
                    );

                    const shouldClearStaff = currentStaff &&
                        !isEqualNumber(currentStaff.User_Type, newCategoryId);

                    return {
                        ...staffRow,
                        Emp_Type_Id: newCategoryId,
                        Order_By: orderBy,
                        ...(shouldClearStaff ? {
                            Emp_Id: "",
                            Emp_Name: ""
                        } : {})
                    };
                }
                return staffRow;
            });

            return sortStaffs(updated);
        });
    };

    const getStaffOptions = (row, index) => {
        if (checkIsNumber(row?.Emp_Type_Id)) {
            return getFilteredStaffs(row.Emp_Type_Id, index, row);
        } else {
            return getAllStaffs(index, row);
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
                        {/* <th className="fa-13">Sno</th> */}
                        <th className="fa-13">Category</th>
                        <th className="fa-13">Staff Name</th>
                        <th className="fa-13">#</th>
                    </tr>
                </thead>

                <tbody>
                    {sortStaffs(toArray(StaffArray)).map((row, index) => (
                        <tr key={index}>
                            {/* <td className='fa-13 vctr text-center'>{index + 1}</td> */}
                            <td className='fa-13 w-100 p-0'>
                                <Select
                                    value={checkIsNumber(row?.Emp_Id) ? {
                                        value: row?.Emp_Id,
                                        label: row?.Emp_Name,
                                    } : null}
                                    onChange={(e) => handleStaffChange(e, index, row)}
                                    options={getStaffOptions(row, index)}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder="Select Staff"
                                    filterOption={(option, inputValue) => {
                                        const normalize = (str) => String(str).replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
                                        const normalizedInput = normalize(inputValue);
                                        if (!normalizedInput) return true;
                                        const normalizedLabel = normalize(option.label);
                                        const normalizedName = normalize(option.data?.costCenterName || '');
                                        return normalizedLabel.includes(normalizedInput) || normalizedName.includes(normalizedInput);
                                    }}
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
                                    onChange={(e) => handleCategoryChange(e, index, row)}
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
                                        setStaffArray(prev => {
                                            const targetIndex = prev.indexOf(row) !== -1 ? prev.indexOf(row) : index;
                                            return prev.filter((_, filIndex) => targetIndex !== filIndex);
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
    );
}

export default InvolvedStaffs;