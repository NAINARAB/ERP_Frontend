import { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Checkbox, Collapse, Box } from "@mui/material";
import { UnfoldMore } from '@mui/icons-material'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { customSelectStyles, MainMenu } from "../../Components/tablecolumn";
import { fetchLink } from "../../Components/fetchComponent";


const postCheck = (param, Menu_id, UserId, loadingOn, loadingOff) => {
    if (loadingOn) {
        loadingOn()
    }
    fetchLink({
        address: `authorization/userRights`,
        method: 'POST',
        bodyData: {
            MenuId: Menu_id,
            User: Number(UserId),
            ReadRights: param.readRights === true ? 1 : 0,
            AddRights: param.addRights === true ? 1 : 0,
            EditRights: param.editRights === true ? 1 : 0,
            DeleteRights: param.deleteRights === true ? 1 : 0,
            PrintRights: param.printRights === true ? 1 : 0
        },
        headers: { 'Content-Type': 'application/json' }
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

const TRow = ({ UserId, data, loadingOn, loadingOff }) => {
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
        setpFlag(false)
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserId, loadingOn, loadingOff)
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
                        checked={readRights} size='small'
                        onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={addRights} size='small'
                        onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={editRights} size='small'
                        onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={deleteRights} size='small'
                        onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={printRights} size='small'
                        onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell>
                    {(data?.SubMenu?.length > 0 || data?.SubRoutes?.length > 0) && (
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            <Dialog open={open} onClose={() => setOpen(!open)} maxWidth="lg" fullWidth>
                <DialogContent>
                    {data?.SubMenu?.length > 0 && (
                        <>
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
                                                    {obj.headname === "Action" ? 'Child Menu' : obj.headname}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.SubMenu?.map((obj, ind) => (
                                            <STrow
                                                key={ind}
                                                data={obj}
                                                UserId={UserId}
                                                loadingOn={loadingOn}
                                                loadingOff={loadingOff}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                    {data?.SubRoutes?.length > 0 && (
                        <>
                            {data?.SubMenu?.length > 0 && <br />}
                            <h3 style={{ paddingBottom: '0.5em' }}>
                                Sub Routings
                            </h3>
                            <DisplaySubRoutings dataSource={data} UserId={UserId} loadingOn={loadingOn} loadingOff={loadingOff} />
                        </>
                    )}
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

const STrow = ({ data, UserId, loadingOn, loadingOff }) => {
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
        setpFlag(false)
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserId, loadingOn, loadingOff)
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
                        checked={readRights} size='small'
                        onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={addRights} size='small'
                        onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={editRights} size='small'
                        onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={deleteRights} size='small'
                        onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={printRights} size='small'
                        onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell>
                    {(data?.ChildMenu?.length > 0 || data?.SubRoutes?.length > 0) && (
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            <Dialog open={open} onClose={() => setOpen(!open)} maxWidth="lg" fullWidth>
                <DialogContent>
                    {data?.ChildMenu?.length > 0 && (
                        <>
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
                                        {data?.ChildMenu?.map((obj, ind) => <CTrow key={ind} data={obj} UserId={UserId} loadingOn={loadingOn} loadingOff={loadingOff} />)}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                    {data?.SubRoutes?.length > 0 && (
                        <>
                            {data?.ChildMenu?.length > 0 && <br />}
                            <h3 style={{ paddingBottom: '0.5em' }}>
                                Sub Routings
                            </h3>
                            <DisplaySubRoutings dataSource={data} UserId={UserId} loadingOn={loadingOn} loadingOff={loadingOff} />
                        </>
                    )}
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

const CTrow = ({ data, UserId, loadingOn, loadingOff }) => {
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
        setpFlag(false)
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserId, loadingOn, loadingOff)
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
                        checked={readRights} size='small'
                        onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={addRights} size='small'
                        onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={editRights} size='small'
                        onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={deleteRights} size='small'
                        onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        checked={printRights} size='small'
                        onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell>
                    {data?.SubRoutes?.length > 0 && (
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            {data?.SubRoutes?.length > 0 && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <DisplaySubRoutings dataSource={data} UserId={UserId} loadingOn={loadingOn} loadingOff={loadingOff} />
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

const DisplaySubRoutings = ({ dataSource, UserId, loadingOn, loadingOff }) => (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table stickyHeader aria-label="simple table" size="small">
            <TableHead>
                <TableRow>
                    {MainMenu.map(obj => (
                        <TableCell
                            key={obj.id}
                            variant={obj.variant}
                            align={obj.align}
                            width={obj.width}
                            sx={{ backgroundColor: 'rgb(15, 11, 42)', color: 'white' }}>
                            {obj.headname === "Action" ? 'Sub Routings' : obj.headname}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {dataSource?.SubRoutes?.map((obj, ind) => (
                    <SubRoutingRow
                        key={ind}
                        data={obj}
                        UserId={UserId}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const SubRoutingRow = ({ data, UserId, loadingOn, loadingOff }) => {
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
        setpFlag(false)
    }, [data])

    useEffect(() => {
        if (pflag === true) {
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserId, loadingOn, loadingOff)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    return (
        <>
            <TableRow hover={true}>
                <TableCell>{data.id}</TableCell>
                <TableCell>{data.name}</TableCell>
                <TableCell>
                    <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} checked={readRights} size='small' onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} checked={addRights} size='small' onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} checked={editRights} size='small' onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} checked={deleteRights} size='small' onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} checked={printRights} size='small' onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell>
                    {data?.SubRoutes?.length > 0 && (
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <UnfoldMore />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            {data?.SubRoutes?.length > 0 && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <DisplaySubRoutings dataSource={data} UserId={UserId} loadingOn={loadingOn} loadingOff={loadingOff} />
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

const UserBased = (props) => {
    const [authData, setAuthData] = useState([]);
    const [users, setUsers] = useState([])
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [currentUserId, setCurrentUserId] = useState({ value: parseData?.UserId, label: parseData?.Name })

    useEffect(() => {
        fetchLink({
            address: `authorization/userRights/userBased?UserId=${currentUserId.value}`,
            loadingOn: props.loadingOn,
            loadingOff: props.loadingOff
        }).then(data => {
            if (data.success) {
                setAuthData(data.data);
            }
        })
    }, [currentUserId.value])

    useEffect(() => {
        fetchLink({
            address: `masters/users`
        }).then((data) => {
            if (data.success) {
                setUsers(data.data);
            }
        }).catch(e => console.log(e))
    }, [])

    return (
        <>
            {/* <ToastContainer /> */}
            <div className="row">
                <div className="col-sm-4 pt-1">
                    <Select
                        value={currentUserId}
                        onChange={(e) => setCurrentUserId(e)}
                        options={[...users.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select User"}
                    />
                </div>
            </div>
            <br />
            <h6 style={{ marginBottom: '0.5em', borderBottom: '2px solid blue', width: 'fit-content' }}>Menu Access Control</h6>

            <TableContainer component={Paper} sx={{ maxHeight: 650 }} title="Menu Access Control">
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
                        {authData.map((obj, index) => (
                            <TRow
                                key={index}
                                data={obj}
                                UserId={currentUserId.value}
                                loadingOn={props.loadingOn}
                                loadingOff={props.loadingOff}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default UserBased;