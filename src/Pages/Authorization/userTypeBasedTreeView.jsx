import { useState, useEffect, Fragment } from "react";
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Checkbox, IconButton } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customSelectStyles, MainMenu } from "../../Components/tablecolumn";
import { fetchLink } from "../../Components/fetchComponent";
import { isEqualNumber } from '../../Components/functions';

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

const TreeRow = ({ data, UserTypeId, level, loadingOn, loadingOff, appType }) => {
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
            postCheck({ readRights, addRights, editRights, deleteRights, printRights }, data.id, UserTypeId, loadingOn, loadingOff)
        }
    }, [readRights, addRights, editRights, deleteRights, printRights])

    const paddingLeft = level * 35;
    const hasChildren = data?.SubMenu?.length > 0 || data?.ChildMenu?.length > 0 || data?.SubRoutes?.length > 0;
    const showToggle = hasChildren && level < 3;

    return isEqualNumber(appType, data?.is_active) && (
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
                        <TreeRow 
                            key={`sm-${child.id}-${ind}`} 
                            data={child} 
                            UserTypeId={UserTypeId} 
                            level={level + 1} 
                            loadingOn={loadingOn} 
                            loadingOff={loadingOff} 
                            appType={appType}
                        />
                    ))}
                    {data?.ChildMenu?.map((child, ind) => (
                        <TreeRow 
                            key={`cm-${child.id}-${ind}`} 
                            data={child} 
                            UserTypeId={UserTypeId} 
                            level={level + 1} 
                            loadingOn={loadingOn} 
                            loadingOff={loadingOff} 
                            appType={appType}
                        />
                    ))}
                    {data?.SubRoutes?.map((child, ind) => (
                        <TreeRow 
                            key={`sr-${child.id}-${ind}`} 
                            data={child} 
                            UserTypeId={UserTypeId} 
                            level={level + 1} 
                            loadingOn={loadingOn} 
                            loadingOff={loadingOff} 
                            appType={appType}
                        />
                    ))}
                </Fragment>
            )}
        </Fragment>
    );
}

const UserTypeBasedTreeView = (props) => {
    const [authData, setAuthData] = useState([]);
    const [usersType, setUserTypes] = useState([])
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [currentTypeId, setCurrentTypeId] = useState({ value: parseData?.UserTypeId, label: parseData?.UserType });
    const [appType, setAppType] = useState({ value: 1, label: 'ERP' })

    useEffect(() => {
        fetchLink({
            address: `authorization/userTypeRights?UserType=${currentTypeId?.value}`,
            loadingOn: props.loadingOn,
            loadingOff: props.loadingOff
        }).then(data => {
            if (data.success) {
                setAuthData(data?.data);
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
                    <label className="w-100 fw-bold fa-14">User Type</label>
                    <Select
                        value={currentTypeId}
                        onChange={(e) => setCurrentTypeId({ value: e.value, label: e.label })}
                        options={[...usersType.map(obj => ({ value: obj?.Id, label: obj?.UserType }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select UserType"}
                    />
                </div>
                <div className="col-sm-4 pt-1">
                    <label className="w-100 fw-bold fa-14">App Name</label>
                    <Select
                        value={appType}
                        onChange={(e) => setAppType(e)}
                        options={[
                            { value: 1, label: 'ERP' },
                            { value: 2, label: 'Task Management' },
                            { value: 3, label: 'Reports App' }
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select App type"}
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
                        {authData?.filter(obj => isEqualNumber(obj.is_active, appType.value)).map((obj, index) => (
                            <TreeRow
                                key={index}
                                data={obj}
                                UserTypeId={currentTypeId?.value}
                                level={0}
                                loadingOn={props.loadingOn}
                                loadingOff={props.loadingOff}
                                appType={appType.value}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default UserTypeBasedTreeView;
