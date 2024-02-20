import React, { useState, useEffect } from "react";
import api from "../../API";
import { Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Checkbox} from "@mui/material";
import { UnfoldMore } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { MainMenu, customSelectStyles } from "../../Components/tablecolumn";

const localData = localStorage.getItem("user");
const parseData = JSON.parse(localData);

const validate = (values) => {
    const errors = {};
    if (!values.name) {
        errors.name = 'Name is required';
    }
    if (!values.mtype) {
        errors.type = 'Select Menu Type';
    }
    if ((values.mtype === 2 && !values.mmenu) || (values.mtype === 3 && !values.mmenu)) {
        errors.mmenu = 'Select Main Menu';
    }
    if (values.mtype === 3 && !values.smenu) {
        errors.smenu = 'Select Sub-Menu'
    }
    if (values.mtype === 3 && !values.link) {
        errors.link = 'Page Link Is Required';
    }
    return errors;
};

const postCheck = (param, Menu_id, Menu_Type, UserId) => {
    fetch(`${api}/userBasedRights`, {
        method: 'POST',
        body: JSON.stringify({
            MenuId: Menu_id,
            MenuType: Menu_Type,
            User: Number(UserId),
            ReadRights: param.readRights === true ? 1 : 0,
            AddRights: param.addRights === true ? 1 : 0,
            EditRights: param.editRights === true ? 1 : 0,
            DeleteRights: param.deleteRights === true ? 1 : 0,
            PrintRights: param.printRights === true ? 1 : 0
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
        .then(data => {
            if (!data.success) {
                toast.error(data.message)
            }
        }).catch(e => console.error(e));
}

const TRow = ({ UserId, subMenu, data }) => {
    const [open, setOpen] = useState(false);
    const [readRights, setReadRights] = useState(data.Read_Rights === 1)
    const [addRights, setAddRights] = useState(data.Add_Rights === 1)
    const [editRights, setEditRights] = useState(data.Edit_Rights === 1)
    const [deleteRights, setDeleteRights] = useState(data.Delete_Rights === 1)
    const [printRights, setPrintRights] = useState(data.Print_Rights === 1)
    const [pflag, setpFlag] = useState(false);

    useEffect(() => {
        setReadRights(data.Read_Rights === 1);
        setAddRights(data.Add_Rights === 1);
        setEditRights(data.Edit_Rights === 1);
        setDeleteRights(data.Delete_Rights === 1);
        setPrintRights(data.Print_Rights === 1);
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.Main_Menu_Id, 1, UserId)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    return (
        <>
            <TableRow key={data.Main_Menu_Id} hover={true}>
                <TableCell>{data.Main_Menu_Id}</TableCell>
                <TableCell>{data.MenuName}</TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={readRights}
                        onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={addRights}
                        onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={editRights}
                        onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={deleteRights}
                        onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={printRights}
                        onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell>
                    {data.PageUrl === ""
                        && <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>}
                </TableCell>
            </TableRow>
            <Dialog open={open} onClose={() => setOpen(!open)} maxWidth="lg" fullWidth>
                <DialogContent>
                    <h3 style={{ paddingBottom: '0.5em' }}>
                        Sub Menu
                    </h3>
                    <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
                        <Table stickyHeader aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {MainMenu.map(obj => (
                                        <TableCell
                                            key={obj.id}
                                            variant={obj.variant}
                                            align={obj.align}
                                            width={obj.width}
                                            sx={{ backgroundColor: 'rgb(15, 11, 42)', color: 'white' }}>
                                            {obj.headname}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subMenu.map(obj => (
                                    obj.Main_Menu_Id === data.Main_Menu_Id && obj.headname !== 'Action'
                                        ? <STrow key={obj.Sub_Menu_Id} data={obj} UserId={UserId} />
                                        : null
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(!open)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


const STrow = (props) => {
    const [open, setOpen] = useState(false);
    const { data, UserId } = props;
    const [readRights, setReadRights] = useState(data.Read_Rights === 1)
    const [addRights, setAddRights] = useState(data.Add_Rights === 1)
    const [editRights, setEditRights] = useState(data.Edit_Rights === 1)
    const [deleteRights, setDeleteRights] = useState(data.Delete_Rights === 1)
    const [printRights, setPrintRights] = useState(data.Print_Rights === 1)
    const [pflag, setpFlag] = useState(false);

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.Sub_Menu_Id, 2, UserId)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    return (
        <>
            <TableRow key={data.Sub_Menu_Id} hover={true}>
                <TableCell>{data.Sub_Menu_Id}</TableCell>
                <TableCell>{data.SubMenuName}</TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={readRights}
                        onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={addRights}
                        onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={editRights}
                        onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={deleteRights}
                        onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={printRights}
                        onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell>
                    {data.PageUrl === ""
                        && <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>}
                </TableCell>
            </TableRow>
        </>
    );
}



const UserBased = () => {
    const [authData, setAuthData] = useState({ MainMenu: [], SubMenu: [] });
    const [users, setUsers] = useState([])
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [currentAuthId, setCurrentAuthId] = useState({ value: parseData?.Autheticate_Id, label: parseData?.Name });
    const [currentUserId, setCurrentUserId] = useState(parseData?.UserId)

    useEffect(() => {
        fetch(`${api}appMenu?Auth=${currentAuthId.value}`).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAuthData({ MainMenu: data?.MainMenu, SubMenu: data?.SubMenu })
                }
            })
    }, [currentAuthId])

    useEffect(() => {
        fetch(`${api}users?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}&Branch_Id=${parseData?.BranchId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUsers(data.data);
                }
            });
    }, [])

    const handleUserChange = (selectedOption) => {
        if (selectedOption) {
            const selectedUser = users.find(user => user.Autheticate_Id === selectedOption.value);
            setCurrentAuthId({ value: selectedUser?.Autheticate_Id, label: selectedUser.Name } || { value: parseData?.Autheticate_Id, label: parseData?.Name });
            setCurrentUserId(selectedUser?.UserId || parseData.UserId);
        }
    };


    return (
        <>
            <ToastContainer />
            <div className="row">
                <div className="col-sm-4 pt-1">
                    <Select
                        value={currentAuthId}
                        onChange={(e) => handleUserChange(e)}
                        options={[...users.map(obj => ({ value: obj.Autheticate_Id, label: obj.Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select User"}
                    />
                </div>
            </div>
            <br />
            <h6 style={{ marginBottom: '0.5em', borderBottom: '2px solid blue', width: 'fit-content' }}>Main Menu</h6>
            <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {MainMenu.map(obj => (
                                <TableCell
                                    key={obj.id}
                                    variant={obj.variant}
                                    align={obj.align}
                                    width={obj.width}
                                    sx={{ backgroundColor: 'rgb(15, 11, 42)', color: 'white' }}>
                                    {obj.headname}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {authData.MainMenu.map((obj, index) => (
                            <TRow
                                key={index}
                                data={obj}
                                UserId={currentUserId}
                                subMenu={authData.SubMenu} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default UserBased;