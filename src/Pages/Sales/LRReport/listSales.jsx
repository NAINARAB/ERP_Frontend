import { useState, useEffect, useMemo } from "react";
import { isEqualNumber, LocalDate, toArray, toNumber } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../Components/functions";
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, PersonAdd, Search } from "@mui/icons-material";
import { toast } from "react-toastify";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const SalesInvoiceListLRReport = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [costCenterData, setCostCenterData] = useState([]);
    const [costTypes, setCostTypes] = useState([]);
    const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
    const [columnFilters, setColumnFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const dataArray = filteredData.length > 0 ? filteredData : salesInvoices;
    const [filters, setFilters] = useState({
        reqDate: '2025-11-11',
        assignDialog: false,
        filterDialog: false,
        selectedInvoice: null,
        fetchTrigger: 0
    });
    const columns = [
        { Field_Name: "Do_Inv_No", Fied_Data: "string" },
        { Field_Name: "voucherTypeGet", Fied_Data: "string" },
        { Field_Name: "retailerNameGet", Fied_Data: "string" },
    ]

    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/lrReport?reqDate=${filters.reqDate}`,
            loadingOn, loadingOff
        }).then(data => {
            setSalesInvoices(data.data);
            setCostTypes(toArray(data?.others?.costTypes));
            setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
        }).catch(console.error);
    }, [filters.fetchTrigger]);

    useEffect(() => {
        fetchLink({
            address: 'masters/erpCostCenter/dropDown'
        }).then(data => setCostCenterData(toArray(data.data))).catch(console.error);
    }, [])

    const costTypeColumns = useMemo(() => {

        return costTypes.filter(
            costType => uniqueInvolvedCost.includes(
                toNumber(costType.Cost_Category_Id)
            )
        ).map(costType => {
            return {
                isVisible: 1,
                ColumnHeader: costType.Cost_Category,
                isCustomCell: true,
                Cell: ({ row }) => {
                    const invoiceEmployee = toArray(row?.involvedStaffs);
                    const costTypeEmployee = invoiceEmployee.filter(
                        emp => isEqualNumber(
                            emp.Emp_Type_Id, costType.Cost_Category_Id
                        )
                    ).map(emp => emp.Emp_Name).join(", ");
                    return <span>{costTypeEmployee || '-'}</span>;
                }
            }
        })
    }, [costTypes, salesInvoices]);

    const fetchSalesInvoices = () => setFilters(pre => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));

    const onCloseAssignDialog = () => setFilters(prev => ({ ...prev, assignDialog: false, selectedInvoice: null }));

    const onCloseFilterDialog = () => setFilters(prev => ({ ...prev, filterDialog: false }));

    const onChangeEmployee = (invoice, selectedOptions, costType) => {

        setFilters(prev => {
            const updatedInvolvedStaffs = toArray(prev.selectedInvoice?.involvedStaffs).filter(
                emp => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id)
            ).concat(selectedOptions);

            return {
                ...prev,
                selectedInvoice: {
                    ...invoice,
                    involvedStaffs: updatedInvolvedStaffs
                }
            }
        })
    }

    const postAssignCostCenters = async (e) => {
        e.preventDefault();
        fetchLink(({
            address: 'sales/salesInvoice/lrReport',
            method: 'POST',
            bodyData: {
                Do_Id: filters.selectedInvoice?.Do_Id,
                involvedStaffs: filters.selectedInvoice?.involvedStaffs,
                staffInvolvedStatus: toNumber(filters.selectedInvoice?.staffInvolvedStatus)
            },
            loadingOn, loadingOff
        })).then(data => {
            if (data.success) {
                toast.success(data.message);
                onCloseAssignDialog();
                fetchSalesInvoices();
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.log(e));
    }

    // filters

    useEffect(() => {
        applyFilters();
    }, [columnFilters]);

    const handleFilterChange = (column, value) => {
        setColumnFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...salesInvoices];
        for (const column of columns) {
            if (columnFilters[column.Field_Name]) {
                if (columnFilters[column.Field_Name].type === 'range') {
                    const { min, max } = columnFilters[column.Field_Name];
                    filtered = filtered.filter(item => {
                        const value = item[column.Field_Name];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                } else if (columnFilters[column.Field_Name].type === 'date') {
                    const { start, end } = columnFilters[column.Field_Name].value;
                    filtered = filtered.filter(item => {
                        const dateValue = new Date(item[column.Field_Name]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                } else if (Array.isArray(columnFilters[column.Field_Name])) {
                    filtered = columnFilters[column.Field_Name]?.length > 0 ? filtered.filter(item => columnFilters[column.Field_Name].includes(item[column.Field_Name]?.toLowerCase().trim())) : filtered
                }
            }
        }
        setFilteredData(filtered);
    };

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data } = column;
        if (Fied_Data === 'number') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.min ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...columnFilters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.max ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...columnFilters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                </div>
            );
        } else if (Fied_Data === 'date') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...columnFilters[Field_Name]?.value, start: e.target.value || undefined } })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...columnFilters[Field_Name]?.value, end: e.target.value || undefined } })}
                    />
                </div>
            );
        } else if (Fied_Data === 'string') {
            const distinctValues = [...new Set(salesInvoices.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
            return (
                <Autocomplete
                    multiple
                    id={`${Field_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={columnFilters[Field_Name] || []}
                    onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={Field_Name}
                            placeholder={`Select ${Field_Name?.replace(/_/g, ' ')}`}
                        />
                    )}
                />
            );
        }
    };

    return (
        <>
            <FilterableTable
                title={"Sales Invoice: " + LocalDate(filters.reqDate)}
                columns={[
                    createCol("Do_Inv_No", "string", "Invoice"),
                    createCol("voucherTypeGet", "string", "Voucher"),
                    createCol("retailerNameGet", "string", "Customer"),
                    ...costTypeColumns,
                    {
                        Field_Name: 'Action',
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return AddRights && EditRights ? (
                                <>

                                    <IconButton
                                        size='small'
                                        onClick={() => {
                                            setFilters(prev => ({ ...prev, assignDialog: true, selectedInvoice: row }));
                                        }}
                                    ><PersonAdd fontSize="small" color="primary" /></IconButton>
                                </>
                            ) : <></>;
                        },
                    },
                ]}
                dataArray={dataArray}
                EnableSerialNumber
                ButtonArea={
                    <>

                        <IconButton
                            size='small'
                            onClick={() => setFilters(prev => ({ ...prev, filterDialog: true }))}
                        ><FilterAlt /></IconButton>

                        <IconButton
                            size='small'
                            onClick={fetchSalesInvoices}
                        ><Search /></IconButton>

                        <input
                            type="date"
                            className="cus-inpt w-auto"
                            value={filters.reqDate}
                            onChange={e => setFilters(prev => ({ ...prev, reqDate: e.target.value }))}
                        />
                    </>
                }
            />

            <Dialog
                open={filters.assignDialog}
                onClose={onCloseAssignDialog}
                maxWidth='lg'
                fullWidth
            >
                <DialogTitle>Assign Cost Centers: <span className="text-primary">{filters.selectedInvoice?.Do_Inv_No}</span></DialogTitle>
                <form onSubmit={postAssignCostCenters}>
                    <DialogContent>
                        <div className="row">
                            {costTypes.map((costType, index) => {
                                const invoiceEmployee = toArray(filters.selectedInvoice?.involvedStaffs);
                                const empCostType = invoiceEmployee.filter(
                                    emp => isEqualNumber(
                                        emp.Emp_Type_Id, costType.Cost_Category_Id
                                    )
                                ).map(emp => ({ value: emp.Emp_Id, label: emp.Emp_Name }));
                                return (
                                    <div className="col-lg-4 col-md-6 p-2" key={index}>
                                        <label>{costType.Cost_Category}</label>

                                        <Select
                                            value={empCostType}
                                            isMulti
                                            styles={customSelectStyles}
                                            options={costCenterData}
                                            onChange={e => {
                                                const values = e.map(option => ({
                                                    Do_Id: filters?.selectedInvoice?.Do_Id,
                                                    Emp_Id: option.value,
                                                    Emp_Name: option.label,
                                                    Emp_Type_Id: costType.Cost_Category_Id,
                                                    Involved_Emp_Type: costType.Cost_Category
                                                }));
                                                onChangeEmployee(filters.selectedInvoice, values, costType);
                                            }}
                                            // closeMenuOnSelect={false}
                                            placeholder={`Select ${costType.Cost_Category}`}
                                            filterOption={reactSelectFilterLogic}
                                            menuPortalTarget={document.body}
                                        />
                                    </div>
                                )
                            })}
                            <div className="col-lg-4 col-md-6 p-2 d-flex align-items-end">
                                <input
                                    className="form-check-input shadow-none pointer mx-2"
                                    style={{ padding: '0.7em' }}
                                    type="checkbox"
                                    id="removeFromList"
                                    checked={isEqualNumber(filters.selectedInvoice?.staffInvolvedStatus, 1)}
                                    onChange={() => {
                                        if (isEqualNumber(filters.selectedInvoice?.staffInvolvedStatus, 1))
                                            setFilters(pre => ({ ...pre, selectedInvoice: { ...pre.selectedInvoice, staffInvolvedStatus: 0 } }))
                                        else
                                            setFilters(pre => ({ ...pre, selectedInvoice: { ...pre.selectedInvoice, staffInvolvedStatus: 1 } }))
                                    }}
                                />
                                <label htmlFor="removeFromList" className="fw-bold">Remove invoice from this page</label>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseAssignDialog} variant='outlined'>Close</Button>
                        <Button variant='contained' type="submit">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={filters.filterDialog}
                onClose={onCloseFilterDialog}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle>Filter Options</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {columns.map((column, index) => (
                            <div className="col-12 p-2" key={index}>
                                {renderFilter(column)}
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseFilterDialog} variant='outlined'>Close</Button>
                    <Button variant='contained' type="submit">Apply</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default SalesInvoiceListLRReport;