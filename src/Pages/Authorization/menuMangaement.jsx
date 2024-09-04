import { useEffect, useState } from "react";
import { fetchLink } from '../../Components/fetchComponent';
import { checkIsNumber, isEqualNumber } from '../../Components/functions';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { toast } from "react-toastify";

const menuInitialValue = {
    Id: '',
    MenuName: '',
    PageUrl: '',
    ParentId: 0,
    isActive: 1,
    OrderNo: 1,
    menuType: 'MainMenu',
}

const MenuManagement = () => {
    const [menuData, setMenuData] = useState([]);
    const [reload, setReload] = useState(false);
    const [inputValue, setInputValue] = useState(menuInitialValue);
    const [dialog, setDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `authorization/menuMaster`,
        }).then(data => {
            if (data.success) {
                const sorted = data?.data?.sort((a, b) => (a.OrderNo && b.OrderNo) ? a.OrderNo - b.OrderNo : b.OrderNo - a.OrderNo)
                setMenuData(sorted);
            }
        }).catch(e => console.error(e))
    }, [reload])

    const closeDialog = () => {
        setInputValue(menuInitialValue);
        setDialog(false);
        setIsLoading(false)
    }

    const saveData = () => {
        setIsLoading(true)
        fetchLink({
            address: `authorization/menuMaster`,
            method: checkIsNumber(inputValue.Id) ? 'PUT' : 'POST',
            bodyData: inputValue
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setReload(pre => !pre)
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(closeDialog)
    }

    const RowComp = ({ o, i }) => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <tr>
                    <td className="fa-13 border text-center">
                        {Number(o?.SubMenu?.length) !== 0 && (
                            <IconButton size="small" className="p-1" onClick={() => setOpen(pre => !pre)} >
                                {open ? <KeyboardArrowUp sx={{ fontSize: '18px' }} /> : <KeyboardArrowDown sx={{ fontSize: '18px' }} />}
                            </IconButton>
                        )}
                    </td>
                    <td className="fa-13 border text-center">{i + 1}</td>
                    <td className="fa-13 border">{o?.MenuName}</td>
                    <td className="fa-13 border">{o?.PageUrl}</td>
                    <td className="fa-13 border text-center">{o.OrderNo ?? '-'}</td>
                    <td className="fa-12  border text-center">
                        {isEqualNumber(o?.Active, 1) ? (
                            <span className="px-3 py-1 rounded-3 text-white bg-success">Active</span>
                        ) : (
                            <span className="px-3 py-1 rounded-3 text-white bg-danger">In-Active</span>
                        )}
                    </td>
                    <td className="fa-13 border text-center">
                        <IconButton
                            size="small"
                            className="p-1"
                            onClick={() => {
                                setInputValue(pre => ({
                                    ...pre,
                                    Id: o.Id,
                                    MenuName: o.MenuName,
                                    PageUrl: o.PageUrl,
                                    isActive: o.Active,
                                    OrderNo: Number(o.OrderNo),
                                    ParentId: '',
                                    menuType: 'MainMenu',
                                }));
                                setDialog(true);
                            }}
                        >
                            <Edit sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </td>
                </tr>

                {open && (
                    <tr>
                        <td className="p-2" colSpan={7}>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['Sno', 'MainMenu', 'Address', 'OrderNo', 'Status', 'Action'].map((o, i) => (
                                                <th className="fa-13 border text-center" key={i}>{o}</th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {o?.SubMenu?.map((oo, ii) => (
                                            <tr key={ii}>
                                                <td className="fa-13 border text-center">{ii + 1}</td>
                                                <td className="fa-13 border">{oo?.SubMenuName}</td>
                                                <td className="fa-13 border">{oo?.PageUrl}</td>
                                                <td className="fa-13 border text-center">{oo.OrderNo ?? '-'}</td>
                                                <td className="fa-12  border text-center">
                                                    {isEqualNumber(oo?.Active, 1) ? (
                                                        <span className="px-3 py-1 rounded-3 text-white bg-success">Active</span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-3 text-white bg-danger">In-Active</span>
                                                    )}
                                                </td>
                                                <td className="fa-13 border text-center">
                                                    <IconButton
                                                        size="small"
                                                        className="p-1"
                                                        onClick={() => {
                                                            setInputValue(pre => ({
                                                                ...pre,
                                                                Id: oo?.Id,
                                                                MenuName: oo?.SubMenuName,
                                                                PageUrl: oo?.PageUrl,
                                                                isActive: oo?.Active,
                                                                OrderNo: 0,
                                                                ParentId: o?.Id,
                                                                menuType: 'SubMenu',
                                                            }));
                                                            setDialog(true);
                                                        }}
                                                    >
                                                        <Edit sx={{ fontSize: '18px' }} />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                )}
            </>
        )
    }

    return (
        <>
            <Card>
                <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                    <h5>Menu Management</h5>
                    <Button variant="outlined" onClick={() => { setInputValue(menuInitialValue); setDialog(true); }}>Add Menu</Button>
                </div>
                <CardContent>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {['#', 'Sno', 'MainMenu', 'Address', 'OrderNo', 'Status', 'Action'].map((o, i) => (
                                        <th className="fa-13 border text-center" key={i}>{o}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {menuData.map((o, i) => <RowComp o={o} i={i} key={i} />)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={dialog}
                onClose={closeDialog}
                fullWidth
                maxWidth='lg'
            >
                <DialogTitle>{inputValue.Id ? 'Update Menu' : 'Create Menu'}</DialogTitle>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        saveData();
                    }}>
                    <DialogContent>
                        <div className="row">

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Menu Type</label>
                                <select
                                    value={inputValue.menuType}
                                    onChange={e => setInputValue(pre => ({ ...pre, menuType: e.target.value }))}
                                    className="cus-inpt"
                                    required
                                >
                                    <option value="MainMenu">Main Menu</option>
                                    <option value="SubMenu">Sub Menu</option>
                                </select>
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Menu Name</label>
                                <input
                                    className="cus-inpt "
                                    value={inputValue.MenuName}
                                    onChange={e => setInputValue(pre => ({ ...pre, MenuName: e.target.value }))}
                                    maxLength={15}
                                    required
                                />
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Page Url</label>
                                <input
                                    className="cus-inpt "
                                    value={inputValue.PageUrl}
                                    onChange={e => setInputValue(pre => ({ ...pre, PageUrl: e.target.value }))}
                                    maxLength={100}
                                    required={false}
                                />
                            </div>

                            {inputValue.menuType === 'MainMenu' && (
                                <div className="col-lg-4 col-md-6 p-2">
                                    <label>Order No</label>
                                    <input
                                        className="cus-inpt "
                                        type='number'
                                        value={inputValue.OrderNo}
                                        onChange={e => setInputValue(pre => ({ ...pre, OrderNo: e.target.value }))}
                                        min={0}
                                    />
                                </div>
                            )}

                            {inputValue.menuType === 'SubMenu' && (
                                <div className="col-lg-4 col-md-6 p-2">
                                    <label>Main Menu</label>
                                    <select
                                        value={inputValue.ParentId}
                                        onChange={e => setInputValue(pre => ({ ...pre, ParentId: e.target.value }))}
                                        className="cus-inpt"
                                        required
                                    >
                                        <option value={0}> - Select -</option>
                                        {menuData.map((o, i) => !o.PageUrl && (
                                            <option value={Number(o?.Id)} key={i}>{o?.MenuName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {inputValue.Id && (
                                <div className="col-lg-4 col-md-6 p-2">
                                    <label>Active Status</label>
                                    <select
                                        value={Number(inputValue.isActive)}
                                        onChange={e => setInputValue(pre => ({ ...pre, isActive: Number(e.target.value) }))}
                                        className="cus-inpt"
                                        required
                                    >
                                        <option value=""> - Select -</option>
                                        <option value={Number(1)}>Active</option>
                                        <option value={Number(0)}>In-Active</option>
                                    </select>
                                </div>
                            )}

                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={closeDialog}>cancel</Button>
                        <Button
                            variant="outlined"
                            type='submit'
                            disabled={isLoading}
                        >
                            {inputValue.Id ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>

            </Dialog>
        </>
    )
}

export default MenuManagement;