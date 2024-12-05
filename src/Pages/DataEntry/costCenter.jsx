import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from '../../Components/filterableTable2'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { Delete, Edit } from "@mui/icons-material";
import RequiredStar from "../../Components/requiredStar";
import Select from 'react-select'
import { customSelectStyles } from "../../Components/tablecolumn";
import { isEqualNumber } from "../../Components/functions";

const Td = (prop) => <td className="border-0 fa-14 p-2 vctr">{prop.children}</td>

const CostCenter = ({ loadingOn, loadingOff }) => {

    const initialInputValue = {
        Cost_Center_Id: '',
        Cost_Center_Name: '',
        User_Type: '',
        Is_Converted_To_User: '',
        User_Id: '',
    }
    const [costCenterData, setCostCenterData] = useState([]);
    const [inputValue, setInputValue] = useState(initialInputValue)
    const [others, setOthers] = useState({
        dialog: false,
        deleteDialog: false,
        refresh: false,
        filterText: ''
    });

    useEffect(() => {
        fetchLink({
            address: `dataEntry/costCenter`
        }).then(data => {
            if (data.success) {
                setCostCenterData(data.data);
            }
        }).catch(e => console.error(e));
    }, [others.refresh]);

    const closeDialog = () => {
        setOthers(pre => ({ ...pre, dialog: false, deleteDialog: false }));
        setInputValue(initialInputValue);
    }

    const refresh = () => setOthers(pre => ({ ...pre, refresh: !pre.refresh }))

    const OnSubmit = (e) => {
        e.preventDefault();
        if (loadingOn) loadingOn();
        fetchLink({
            address: `dataEntry/costCenter`,
            method: inputValue.Cost_Center_Id ? 'PUT' : 'POST',
            bodyData: inputValue
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                closeDialog();
                refresh();
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const showData = others.filterText 
    ? costCenterData.filter(fil => String(
        fil.Cost_Center_Name
    ).trim().toLowerCase().includes(
        String(others.filterText).trim().toLowerCase()
    )) 
    : costCenterData

    // const deleteRow = () => {
    //     fetchLink({
    //         address: `dataEntry/costCenter`,
    //         method: 'DELETE',
    //         bodyData: {
    //             Cost_Center_Id: inputValue.Cost_Center_Id
    //         }
    //     }).then(data => {
    //         if (data.success) {
    //             toast.success(data.message);
    //             closeDialog();
    //             refresh();
    //         } else {
    //             toast.error(data.message);
    //         }
    //     }).catch(e => console.error(e));
    // }

    return (
        <>
            <Card>
                <div className="p-2 d-flex justify-content-between align-items-center flex-wrap">
                    <h5 className="m-0">Cost Center</h5>
                    <Button
                        variant="outlined"
                        onClick={() => setOthers(pre => ({ ...pre, dialog: true }))}
                    >Add</Button>
                </div>
                <CardContent>
                    <div className="d-flex justiy-content-end align-items-center mb-2">
                        <label className="pe-2">Search: </label>
                        <div className="col-md-3 col-sm-4">
                        <Select
                            value={{ value: others.filterText, label: others.filterText }}
                            onChange={(e) => setOthers(pre => ({ ...pre, filterText: e.value }))}
                            options={[
                                { value: '', label: 'Search', isDisabled: true },
                                ...costCenterData.map(obj => ({
                                    value: obj?.Cost_Center_Name,
                                    label: obj?.Cost_Center_Name
                                }))
                            ]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            placeholder={"Search Cost Center"}
                            maxMenuHeight={200}
                        />
                        </div>
                    </div>
                    <FilterableTable
                        dataArray={showData}
                        EnableSerialNumber
                        columns={[
                            {
                                isVisible: 1,
                                Field_Name: 'Cost_Center_Name',
                                Fied_Data: 'string'
                            },
                            {
                                isVisible: 1,
                                Field_Name: 'UserTypeGet',
                                Fied_Data: 'string'
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'ERP User',
                                isCustomCell: true,
                                align: 'center',
                                Cell: ({row}) => (
                                    <span className={`cus-badge text-white ${isEqualNumber(row?.Is_Converted_To_User, 1) ? 'bg-success' : 'bg-danger'}`}>
                                        {isEqualNumber(row?.Is_Converted_To_User, 1) ? 'true' : 'false'}
                                    </span>
                                )
                            },
                            {
                                isVisible: 1,
                                Field_Name: 'UserGet',
                                Fied_Data: 'string'
                            },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Actions',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setInputValue(pre => Object.fromEntries(
                                                    Object.entries(pre).map(([key, value]) => [key, row[key] ?? value])
                                                ));
                                                setOthers(pre => ({ ...pre, dialog: true }));
                                            }}
                                        ><Edit /></IconButton>

                                        {/* <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setInputValue(pre => Object.fromEntries(
                                                    Object.entries(pre).map(([key, value]) => [key, row[key] ?? value])
                                                ));
                                                setOthers(pre => ({ ...pre, deleteDialog: true }));
                                            }}
                                        ><Delete /></IconButton> */}
                                    </>
                                )
                            }
                        ]}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={others.dialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>{inputValue.Cost_Center_Id ? 'Add Records' : 'Modify Records'}</DialogTitle>
                <form onSubmit={OnSubmit}>
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table m-0">
                                <tbody>
                                    <tr>
                                        <Td>Cost Center Name <RequiredStar /></Td>
                                        <Td>
                                            <input
                                                value={inputValue.Cost_Center_Name}
                                                onChange={e => setInputValue(pre => ({ ...pre, Cost_Center_Name: e.target.value }))}
                                                className="cus-inpt p-2"
                                                required maxLength={150}
                                            />
                                        </Td>
                                    </tr>
                                    <tr>
                                        <Td>User Type <RequiredStar /></Td>
                                        <Td>
                                            <select
                                                value={inputValue.User_Type}
                                                onChange={e => setInputValue(pre => ({ ...pre, User_Type: e.target.value }))}
                                                className="cus-inpt p-2"
                                                required
                                            >
                                                <option value="">select</option>
                                                <option value="2">Owners</option>
                                                <option value="5">Brokers</option>
                                            </select>
                                        </Td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                    <DialogActions className='d-flex justify-content-between flex-wrap'>
                        <Button type='button' variant="outlined" onClick={() => setInputValue(initialInputValue)}>Clear</Button>
                        <span>
                            <Button type="button" onClick={closeDialog}>cancel</Button>
                            <Button type="submit" variant='contained'>Submit</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default CostCenter;