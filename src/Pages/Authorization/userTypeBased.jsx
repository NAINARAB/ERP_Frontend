import React, { useState, useEffect, useContext } from "react";
import { Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Checkbox } from "@mui/material";
import { UnfoldMore } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { MainMenu, customSelectStyles } from "../../Components/tablecolumn";
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";


const postCheck = (param, Menu_id, UserType, loadingOn, loadingOff) => {
    if (loadingOn) {
        loadingOn()
    }
    fetchLink({
        address: `authorization/userTypeRights`,
        method: 'POST',
        bodyData: {
            MenuId: Menu_id,
            UserType: Number(UserType),
            ReadRights: param.readRights === true ? 1 : 0,
            AddRights: param.addRights === true ? 1 : 0,
            EditRights: param.editRights === true ? 1 : 0,
            DeleteRights: param.deleteRights === true ? 1 : 0,
            PrintRights: param.printRights === true ? 1 : 0
        },
    }).then(data => {
        if (!data.success) {
            toast.error(data.message)
        }
    }).catch(e => console.error(e)).finally(() => {
        if (loadingOff) {
            loadingOff()
        }
    })
}

const TRow = ({ UserTypeId, data, loadingOn, loadingOff }) => {
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
        setpFlag(false);
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserTypeId, loadingOn, loadingOff)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    return (
        <>
            <TableRow hover={true}>
                <TableCell>{data.id}</TableCell>
                <TableCell>{data.name}</TableCell>
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
                    {data.SubMenu.length > 0 && (
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>
                    )}
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
                                {data.SubMenu.map((obj, index) => (
                                    <STrow
                                        key={index}
                                        data={obj}
                                        UserTypeId={UserTypeId}
                                        loadingOff={loadingOff}
                                        loadingOn={loadingOn}
                                    />))}
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

const STrow = ({ data, UserTypeId, loadingOn, loadingOff }) => {
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
        setpFlag(false);
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserTypeId, loadingOn, loadingOff)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    return (
        <>
            <TableRow hover={true}>
                <TableCell>{data.id}</TableCell>
                <TableCell>{data.name}</TableCell>
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
                    {data.ChildMenu.length > 0 && (
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            <Dialog open={open} onClose={() => setOpen(!open)} maxWidth="lg" fullWidth>
                <DialogContent>
                    <h3 style={{ paddingBottom: '0.5em' }}>
                        Child Menu
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
                                {data?.ChildMenu?.map((obj, ind) => (
                                    <CTrow
                                        key={ind}
                                        data={obj}
                                        UserTypeId={UserTypeId}
                                        loadingOff={loadingOff}
                                        loadingOn={loadingOn}
                                    />
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

const CTrow = (props) => {
    const { data, UserTypeId, loadingOn, loadingOff } = props;
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
        setpFlag(false);
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserTypeId, loadingOn, loadingOff)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    return (
        <>
            <TableRow hover={true}>
                <TableCell>{data.id}</TableCell>
                <TableCell>{data.name}</TableCell>
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
                </TableCell>
            </TableRow>
        </>
    );
}

const UserTypeBased = ({ loadingOn, loadingOff }) => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [authData, setAuthData] = useState([]);
    const [subRoutings, setSubRoutings] = useState([])
    const [usersType, setUserTypes] = useState([])
    const { contextObj } = useContext(MyContext);
    const [currentTypeId, setCurrentTypeId] = useState({ value: parseData?.UserTypeId, label: parseData?.UserType });

    useEffect(() => {
        fetchLink({
            address: `authorization/userTypeRights?UserType=${currentTypeId?.value}`
        }).then(data => {
            if (data.success) {
                setAuthData(data?.data);
                setSubRoutings(data?.others?.subRoutings ?? [])
            }
        }).catch(e => console.error(e));
    }, [currentTypeId])

    useEffect(() => {
        fetchLink({
            address: `masters/userType`
        }).then((data) => {
            if (data.success) {
                setUserTypes(data.data);
            }
        }).catch(e => console.error(e));
    }, [])

    return (
        <>
            <ToastContainer />
            <div className="row">
                <div className="col-sm-4 pt-1">
                    <Select
                        value={currentTypeId}
                        onChange={(e) => setCurrentTypeId({ value: e.value, label: e.label })}
                        options={[...usersType.map(obj => ({ value: obj?.Id, label: obj?.UserType }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select UserType"}
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
                        {authData?.map((obj, index) => (
                            <TRow
                                key={index}
                                data={obj}
                                UserTypeId={currentTypeId.value}
                                loadingOff={loadingOff}
                                loadingOn={loadingOn}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <br />
            <h6 style={{ marginBottom: '0.5em', borderBottom: '2px solid blue', width: 'fit-content' }}>Sub-Routings Access Control</h6>

            <TableContainer component={Paper} sx={{ maxHeight: 650 }} title="Sub-Routings Access Control">
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
                                    {obj.headname === "Action" ? 'Sub Menu' : obj.headname}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subRoutings.map((obj, index) => (
                            <CTrow
                                key={index}
                                data={obj}
                                UserTypeId={currentTypeId.value}
                                loadingOff={loadingOff}
                                loadingOn={loadingOn}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </>
    )
}

export default UserTypeBased;