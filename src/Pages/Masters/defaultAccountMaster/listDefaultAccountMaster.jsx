import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { Edit } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { checkIsNumber, isEqualNumber, toArray, toNumber } from "../../../Components/functions";
import Select from "react-select";
import { customSelectStyles, erpModules } from "../../../Components/tablecolumn";
import { toast } from "react-toastify";
import RequiredStar from "../../../Components/requiredStar";

const initialValue = {
    Id: '',
    Acc_Id: '',
    Account_Name: '',
    AC_Reason: '',
    Type: '',
};

const DefaultAccountMaster = ({ loadingOn, loadingOff }) => {
    const [defaultAccount, setDefaultAccount] = useState([]);
    const [defaultAccountInput, setDefaultAccountInput] = useState(initialValue);
    const [accountMaster, setAccountMaster] = useState([]);
    const [filters, setFilters] = useState({
        dialog: false,
        refresh: false,
        searchValue: { value: '', label: 'Search Account' }
    });

    useEffect(() => {
        fetchLink({
            address: `masters/accounts`
        }).then(data => {
            if (data.success) {
                setAccountMaster(toArray(data.data))
            }
        }).catch(e => console.error(e));
    }, [])

    useEffect(() => {
        fetchLink({
            address: `masters/defaultAccountMaster`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setDefaultAccount(data.data);
            } else {
                setDefaultAccount([]);
            }
        }).catch(e => console.error(e));
    }, [filters.refresh])

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, dialog: false }));
        setDefaultAccountInput(initialValue);
    }

    const saveAccount = () => {
        fetchLink({
            address: `masters/defaultAccountMaster`,
            loadingOn, loadingOff,
            method: checkIsNumber(defaultAccountInput.Id) ? 'PUT' : 'POST',
            bodyData: defaultAccountInput
        }).then(data => {
            if (data.success) {
                setFilters(pre => ({ ...pre, dialog: false, refresh: !pre.refresh }));
                toast.success(data.message);
                setDefaultAccountInput(initialValue);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    }

    return (
        <>
            <FilterableTable
                title="Default Accounts"
                EnableSerialNumber
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            // size="small"
                            className="mx-1"
                            onClick={() => setFilters(pre => ({ ...pre, dialog: true }))}
                        >Add account</Button>
                        <div style={{ minWidth: '270px' }}>
                            <Select
                                value={filters.searchValue}
                                options={[
                                    { value: '', label: 'ALL' },
                                    ...defaultAccount.map(acc => ({
                                        value: acc.Acc_Id,
                                        label: acc.Account_Name
                                    }))
                                ]}
                                menuPortalTarget={document.body}
                                onChange={e => setFilters(pre => ({
                                    ...pre, searchValue: e
                                }))}
                                styles={customSelectStyles}
                                isSearchable={true}
                            />
                        </div>
                    </>
                }
                dataArray={
                    checkIsNumber(filters.searchValue.value)
                        ? defaultAccount.filter(
                            acc => String(acc?.Account_Name).includes(filters.searchValue.label)
                        )
                        : defaultAccount
                }
                columns={[
                    createCol('Account_Name', 'string'),
                    createCol('Group_Name', 'string'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <>
                                <ButtonActions
                                    buttonsData={[
                                        {
                                            name: 'Edit',
                                            icon: <Edit />,
                                            onclick: () => {
                                                setDefaultAccountInput(row);
                                                setFilters(pre => ({ ...pre, dialog: true }));
                                            },
                                            disabled: toNumber(row.Id) < 11
                                        }
                                    ]}
                                />
                            </>
                        )
                    }
                ]}
            />


            <Dialog
                open={filters.dialog}
                onClose={closeDialog}
                maxWidth='sm' fullWidth
            >

                <DialogTitle>
                    {checkIsNumber(defaultAccountInput.Id)
                        ? 'Modify Default Account'
                        : 'Add Default Accounts'}
                </DialogTitle>

                <form onSubmit={e => {
                    e.preventDefault();
                    if (defaultAccountInput.Acc_Id) {
                        saveAccount();
                    } else {
                        toast.warn('Select Account');
                    }
                }}>

                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table fa-13">
                                <tbody>
                                    <tr>
                                        <td className="vctr">Account<RequiredStar /></td>
                                        <td>
                                            <Select
                                                value={{
                                                    value: defaultAccountInput.Acc_Id,
                                                    label: defaultAccountInput.Account_Name
                                                }}
                                                options={[
                                                    { value: '', label: 'select' },
                                                    ...accountMaster.map(acc => ({
                                                        value: acc.Acc_Id,
                                                        label: acc.Account_name
                                                    }))
                                                ]}
                                                menuPortalTarget={document.body}
                                                onChange={e => setDefaultAccountInput(pre => ({
                                                    ...pre,
                                                    Acc_Id: e.value,
                                                    Account_Name: e.label
                                                }))}
                                                styles={customSelectStyles}
                                                isSearchable={true}
                                                isDisabled={defaultAccountInput.Type === 'DEFAULT'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="vctr">Type<RequiredStar /></td>
                                        <td>
                                            <select
                                                value={defaultAccountInput.Type}
                                                className="cus-inpt p-2"
                                                onChange={e => setDefaultAccountInput(pre => ({
                                                    ...pre, Type: e.target.value
                                                }))}
                                                required
                                                disabled={defaultAccountInput.Type === 'DEFAULT'}
                                            >
                                                <option value={''} disabled>{'select'}</option>
                                                <option value={'DEFAULT'} disabled>{'DEFAULT'}</option>
                                                {erpModules.map((module, ind) => (
                                                    <option value={module.name} key={ind}>{module.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="vctr">Reason<RequiredStar /></td>
                                        <td>
                                            <input
                                                value={defaultAccountInput.AC_Reason}
                                                className="cus-inpt p-2"
                                                required
                                                onChange={e => setDefaultAccountInput(pre => ({
                                                    ...pre, AC_Reason: e.target.value
                                                }))}
                                                maxLength={150}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            size="small"
                            onClick={() => {
                                closeDialog();
                                setDefaultAccountInput(initialValue);
                            }}
                            type="button"
                        >cancel</Button>
                        <Button
                            size="small"
                            type="submit"
                            variant="contained"
                        >Save</Button>
                    </DialogActions>
                </form >
            </Dialog>
        </>
    )
}

export default DefaultAccountMaster;