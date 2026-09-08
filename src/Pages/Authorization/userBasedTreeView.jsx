import { useState, useEffect, Fragment } from "react";
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Checkbox, IconButton } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const TreeRow = ({ data, UserId, level, loadingOn, loadingOff }) => {
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

    const paddingLeft = level * 35;
    const hasChildren = data?.SubMenu?.length > 0 || data?.ChildMenu?.length > 0 || data?.SubRoutes?.length > 0;
    const showToggle = hasChildren && level < 3;

    return (
        <Fragment>
            <TableRow hover={true} sx={{ backgroundColor: level === 0 ? '#f5f5f5' : 'inherit' }}>
                <TableCell>{data.id}</TableCell>
                <TableCell style={{ paddingLeft: `${paddingLeft + 16}px` }}>
                    {level > 0 && <span style={{ marginRight: '8px', color: '#a0a0a0' }}>↳</span>}
                    {showToggle ? (
                        <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0, mr: 1 }}>
                            {open ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
                        </IconButton>
                    ) : (
                        <span style={{ display: 'inline-block', width: '28px' }}></span>
                    )}
                    <span style={{ fontWeight: level === 0 ? 'bold' : 'normal' }}>
                        {data.name}
                    </span>
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        checked={readRights} size='small'
                        onChange={() => { setpFlag(true); setReadRights(!readRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        checked={addRights} size='small'
                        onChange={() => { setpFlag(true); setAddRights(!addRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        checked={editRights} size='small'
                        onChange={() => { setpFlag(true); setEditRights(!editRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        checked={deleteRights} size='small'
                        onChange={() => { setpFlag(true); setDeleteRights(!deleteRights) }} />
                </TableCell>
                <TableCell>
                    <Checkbox
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        checked={printRights} size='small'
                        onChange={() => { setpFlag(true); setPrintRights(!printRights) }} />
                </TableCell>
                <TableCell></TableCell>
            </TableRow>
            {open && (
                <Fragment>
                    {data?.SubMenu?.map((child, ind) => (
                        <TreeRow key={`sm-${child.id}-${ind}`} data={child} UserId={UserId} level={level + 1} loadingOn={loadingOn} loadingOff={loadingOff} />
                    ))}
                    {data?.ChildMenu?.map((child, ind) => (
                        <TreeRow key={`cm-${child.id}-${ind}`} data={child} UserId={UserId} level={level + 1} loadingOn={loadingOn} loadingOff={loadingOff} />
                    ))}
                    {data?.SubRoutes?.map((child, ind) => (
                        <TreeRow key={`sr-${child.id}-${ind}`} data={child} UserId={UserId} level={level + 1} loadingOn={loadingOn} loadingOff={loadingOff} />
                    ))}
                </Fragment>
            )}
        </Fragment>
    );
}

const UserBasedTreeView = (props) => {
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

            <TableContainer component={Paper} sx={{ maxHeight: '1200px' }}>
                <Table stickyHeader aria-label="tree table" size="small">
                    <TableHead>
                        <TableRow>
                            {MainMenu.map(obj => (
                                <TableCell
                                    key={obj.id}
                                    variant={obj.variant}
                                    align={obj.align}
                                    width={obj.width}
                                    sx={{ backgroundColor: 'rgb(15, 11, 42)', color: 'white', fontWeight: 'bold' }}>
                                    {obj.headname === "Action" ? '' : obj.headname}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {authData.map((obj, index) => (
                            <TreeRow
                                key={index}
                                data={obj}
                                UserId={currentUserId.value}
                                level={0}
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

export default UserBasedTreeView;
