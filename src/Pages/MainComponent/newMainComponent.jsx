import React, { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { IconButton, Collapse, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import {
    Menu, KeyboardArrowDown, Circle, Logout, Dashboard,
    BarChart, SettingsAccessibility, VpnKey, AccountCircle, Settings, Keyboard,
    AutoGraph, KeyboardDoubleArrowRight, KeyboardDoubleArrowLeft,
    TaskAlt, KeyboardArrowUp
} from '@mui/icons-material'
import "./MainComponent.css";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";
import { fetchLink } from "../../Components/fetchComponent";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { checkIsNumber, isEqualNumber, LocalDateWithTime } from "../../Components/functions";

const setLoclStoreage = (pageId, menu) => {
    localStorage.setItem('CurrentPage', JSON.stringify({ id: pageId, type: menu }));
}

const getIcon = (menuId) => {
    const icon = [
        {
            id: 1,
            IconComp: <Dashboard className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 2,
            IconComp: <SettingsAccessibility className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 3,
            IconComp: <TaskAlt className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 4,
            IconComp: <BarChart className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 5,
            IconComp: <AutoGraph className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 6,
            IconComp: <Keyboard className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 63,
            IconComp: <VpnKey className="me-2 fa-20" style={{ color: '#FDD017' }} />
        }
    ];

    const matchedIcon = icon.find(item => item.id === Number(menuId));
    return matchedIcon ? matchedIcon.IconComp : null;
}

const DispNavButtons = ({ mainBtn, nav, sideClose, page }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {

        const getSubRoute = (menu, path) => {
            if (Array.isArray(menu)) {
                for (let menuObj of menu) {
                    if (isEqualNumber(menuObj.Read_Rights, 1) && menuObj.url === path) {
                        return true;
                    }
                    if (Array.isArray(menuObj?.SubRoutes) && menuObj?.SubRoutes?.length > 0) {
                        const isFound = getSubRoute(menuObj?.SubRoutes, path);
                        if (isFound) {
                            return isFound
                        }
                    }
                }
                return false;
            }
        }

        const findMenuItem = (menuObj, path) => {
            if (path === menuObj.url) {
                return true
            }

            if (Array.isArray(menuObj.SubRoutes) && menuObj.SubRoutes.length > 0) {
                const isFound = getSubRoute(menuObj.SubRoutes, path);
                if (isFound) {
                    return isFound
                }
            }

            for (let subItem of menuObj.SubMenu) {
                if (subItem.url === path) {
                    return true;
                }

                if (Array.isArray(subItem.SubRoutes) && subItem.SubRoutes.length > 0) {
                    const isFound = getSubRoute(subItem.SubRoutes, path);
                    if (isFound) {
                        return isFound
                    }
                }

                if (subItem.ChildMenu) {
                    for (let childItem of subItem.ChildMenu) {
                        if (childItem.url === path) {
                            return true;
                        }

                        if (Array.isArray(childItem.SubRoutes) && childItem.SubRoutes.length > 0) {
                            const isFound = getSubRoute(childItem.SubRoutes, path);
                            if (isFound) {
                                return isFound
                            }
                        }
                    }
                }
            }
            return false;
        };

        const matchedItem = findMenuItem(mainBtn, page);
        setOpen(matchedItem);
    }, [page, mainBtn]);

    const closeSide = () => {
        sideClose()
    }

    return isEqualNumber(mainBtn.Read_Rights, 1) && (
        <>
            <button className={`sidebutton ${open && " btn-active "}`}
                onClick={
                    mainBtn?.url ? () => {
                        nav(mainBtn?.url);
                        sideClose();
                        setLoclStoreage(mainBtn.id, 1);
                    } : () => setOpen(!open)
                }
            >
                <span className="flex-grow-1 d-flex justify-content-start align-items-center ">
                    {getIcon(mainBtn.id)}
                    {mainBtn?.name}
                </span>
                {!mainBtn?.url && <span className=" text-end">{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</span>}
            </button>
            {!mainBtn?.url && (
                <Collapse in={open} timeout="auto" unmountOnExit >
                    {mainBtn.SubMenu.map((obj, i) => (
                        isEqualNumber(obj?.Read_Rights, 1) && (
                            <SubMenu
                                key={i}
                                subBtn={obj}
                                nav={nav}
                                sideClose={closeSide}
                                page={page}
                            />
                        )
                    ))}
                </Collapse>
            )}
        </>
    )
}

const SubMenu = ({ subBtn, nav, page, sideClose }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {

        const getSubRoute = (menu, path) => {
            if (Array.isArray(menu)) {
                for (let menuObj of menu) {
                    if (isEqualNumber(menuObj.Read_Rights, 1) && menuObj.url === path) {
                        return true;
                    }
                    if (Array.isArray(menuObj?.SubRoutes) && menuObj?.SubRoutes?.length > 0) {
                        const isFound = getSubRoute(menuObj?.SubRoutes, path);
                        if (isFound) {
                            return isFound
                        }
                    }
                }
                return false;
            }
        }

        const findMenuItem = (menuObj, path) => {
            if (path === menuObj.url) {
                return true
            }

            if (Array.isArray(menuObj.SubRoutes) && menuObj.SubRoutes.length > 0) {
                const isFound = getSubRoute(menuObj.SubRoutes, path);
                if (isFound) {
                    return isFound
                }
            }

            for (let childItem of menuObj.ChildMenu) {
                if (childItem.url === path) {
                    return true;
                }

                if (Array.isArray(childItem.SubRoutes) && childItem.SubRoutes.length > 0) {
                    const isFound = getSubRoute(childItem.SubRoutes, path);
                    if (isFound) {
                        return isFound
                    }
                }
            }
            return false;
        };
        const matchedItem = findMenuItem(subBtn, page);
        setOpen(matchedItem);
    }, [page, subBtn]);

    return (
        <>
            <button
                className={`rounded-0 sidebutton tes ${open ? ' sub-btn-active ' : ' sidebutton '}`}
                onClick={() => {
                    nav(subBtn?.url);
                    sideClose();
                    setLoclStoreage(subBtn.id, 2);
                }}
            >
                <span className="flex-grow-1 d-flex justify-content-start align-items-center">
                    <Circle sx={{ fontSize: '6px', color: '#FDD017', marginRight: '10px' }} /> {' ' + subBtn?.name}
                </span>
            </button>
        </>
    );
}

const MainComponent = (props) => {
    const nav = useNavigate();
    const location = useLocation();
    const parseData = JSON.parse(localStorage.getItem("user"));
    const loginAt = localStorage.getItem('loginAt')
    const [sidebar, setSidebar] = useState([]);
    const { contextObj, setContextObj } = useContext(MyContext);
    const [settings, setSettings] = useState(false);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [desktopMenu, setDesktopMenu] = useState(true);

    useEffect(() => {

        const getSubRoute = (menu, path) => {
            if (Array.isArray(menu)) {
                for (let menuObj of menu) {
                    if (isEqualNumber(menuObj.Read_Rights, 1) && menuObj.url === path) {
                        setLoclStoreage(menuObj?.id, 0);
                        return menuObj;
                    }
                    if (Array.isArray(menuObj?.SubRoutes) && menuObj?.SubRoutes?.length > 0) {
                        const isFound = getSubRoute(menuObj?.SubRoutes, path);
                        if (isFound) {
                            return isFound
                        }
                    }
                }
                return false;
            }
        }

        const findMenuItem = (menuArray, path) => {
            for (let item of menuArray) {

                if (item.url === path) {
                    setLoclStoreage(item?.id, 1);
                    return item;
                }

                if (Array.isArray(item.SubRoutes) && item.SubRoutes.length > 0) {
                    const subRouteData = getSubRoute(item.SubRoutes, path);
                    if (subRouteData) {
                        return { ...subRouteData, MainMenuData: item }
                    }
                }

                if (item.SubMenu) {
                    for (let subItem of item.SubMenu) {

                        if (subItem.url === path) {
                            setLoclStoreage(subItem?.id, 2);
                            return { ...subItem, MainMenuData: item };
                        }

                        if (Array.isArray(subItem.SubRoutes) && subItem.SubRoutes.length > 0) {
                            const subRouteData = getSubRoute(subItem.SubRoutes, path);
                            if (subRouteData) {
                                return { ...subRouteData, MainMenuData: item, SubMenuData: subItem }
                            }
                        }

                        if (subItem.ChildMenu) {
                            for (let childItem of subItem.ChildMenu) {

                                if (childItem.url === path) {
                                    setLoclStoreage(childItem?.id, 3);
                                    return { ...childItem, MainMenuData: item, SubMenuData: subItem };
                                }

                                if (Array.isArray(childItem.SubRoutes) && childItem.SubRoutes.length > 0) {
                                    const subRouteData = getSubRoute(childItem.SubRoutes, path);
                                    if (subRouteData) {
                                        return { ...subRouteData, MainMenuData: item, SubMenuData: subItem, ChildMenuData: childItem }
                                    }
                                }

                            }
                        }

                    }
                }
            }
            return null;
        };

        const matchedItem = findMenuItem(sidebar, location.pathname);

        if (matchedItem) {
            setContextObj(matchedItem);
        } else {
            setContextObj({});
        }

    }, [location.pathname, sidebar]);

    useEffect(() => {

        const navigateToPage = (menuItem) => {
            nav(menuItem.url);
        };

        const navToSubRoute = (menu) => {
            if (Array.isArray(menu)) {
                for (let menuObj of menu) {
                    if (isEqualNumber(menuObj.Read_Rights, 1) && menuObj.url) {
                        navigateToPage(menuObj.url);
                        setLoclStoreage(menuObj?.id, 0);
                        return true;
                    }
                    if (Array.isArray(menuObj?.SubRoutes) && menuObj?.SubRoutes?.length > 0) {
                        const isNavigated = navToSubRouteIfMenuId(menuObj?.SubRoutes);
                        if (isNavigated) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }

        const navToSubRouteIfMenuId = (menuId, menu) => {
            if (Array.isArray(menu) && checkIsNumber(menuId)) {
                for (let menuObj of menu) {
                    if (isEqualNumber(menuObj.Read_Rights, 1) && menuObj.url && isEqualNumber(menuId, menuObj.id)) {
                        navigateToPage(menuObj.url);
                        return true;
                    }
                    if (Array.isArray(menuObj?.SubRoutes) && menuObj?.SubRoutes?.length > 0) {
                        const isNavigated = navToSubRouteIfMenuId(menuId, menuObj?.SubRoutes);
                        if (isNavigated) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }

        const findAndNavigate = (menuData, getPageId) => {
            for (let o of menuData) {
                if (isEqualNumber(o.Read_Rights, 1) && o.url !== '' && isEqualNumber(getPageId?.id, o.id)) {
                    navigateToPage(o);
                    return true;
                }


                if (Array.isArray(o?.SubRoutes) && o?.SubRoutes?.length > 0) {
                    const navigatedDone = navToSubRouteIfMenuId(getPageId?.id, o?.SubRoutes);
                    if (navigatedDone) {
                        return true;
                    }
                }

                for (let oo of o.SubMenu || []) {
                    if (isEqualNumber(oo.Read_Rights, 1) && isEqualNumber(getPageId?.id, oo.id)) {
                        navigateToPage(oo);
                        return true;
                    }

                    if (Array.isArray(oo?.SubRoutes) && oo?.SubRoutes?.length > 0) {
                        const navigatedDone = navToSubRouteIfMenuId(getPageId?.id, oo?.SubRoutes);
                        if (navigatedDone) {
                            return true;
                        }
                    }

                    for (let ooo of oo.ChildMenu || []) {
                        if (isEqualNumber(ooo.Read_Rights, 1) && isEqualNumber(getPageId?.id, ooo.id)) {
                            navigateToPage(ooo);
                            return true;
                        }

                        if (Array.isArray(ooo?.SubRoutes) && ooo?.SubRoutes?.length > 0) {
                            const navigatedDone = navToSubRouteIfMenuId(getPageId?.id, ooo?.SubRoutes);
                            if (navigatedDone) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        };

        const findFirstNavigablePage = (menuData) => {
            for (let o of menuData) {
                if (isEqualNumber(o.Read_Rights, 1) && o.url !== '') {
                    navigateToPage(o);
                    return true;
                }

                if (Array.isArray(o?.SubRoutes) && o?.SubRoutes?.length > 0) {
                    const isNavigateDone = navToSubRoute(o?.SubRoutes);
                    if (isNavigateDone) {
                        return true;
                    }
                }

                for (let oo of o.SubMenu || []) {
                    if (isEqualNumber(oo.Read_Rights, 1) && oo.url !== '') {
                        navigateToPage(oo);
                        return true;
                    }

                    if (Array.isArray(oo?.SubRoutes) && oo?.SubRoutes?.length > 0) {
                        const isNavigateDone = navToSubRoute(oo?.SubRoutes);
                        if (isNavigateDone) {
                            return true;
                        }
                    }

                    for (let ooo of oo.ChildMenu || []) {
                        if (isEqualNumber(ooo.Read_Rights, 1) && ooo.url !== '') {
                            navigateToPage(ooo);
                            return true;
                        }

                        if (Array.isArray(ooo?.SubRoutes) && ooo?.SubRoutes?.length > 0) {
                            const isNavigateDone = navToSubRoute(ooo?.SubRoutes);
                            if (isNavigateDone) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        };

        fetchLink({
            address: `authorization/newAppMenu?Auth=${parseData?.Autheticate_Id}`
        }).then(data => {
            if (data.success) {
                setSidebar(data.data);

                const getPageId = localStorage.getItem('CurrentPage')
                    ? JSON.parse(localStorage.getItem('CurrentPage'))
                    : null;

                let navigated = false;

                if (getPageId) {
                    navigated = findAndNavigate(data.data, getPageId);
                }

                if (!navigated) {
                    navigated = findFirstNavigablePage(data.data);
                }

                if (!navigated) {
                    nav('/invalid-credentials');
                }
            }
        }).catch(e => console.error(e));

    }, []);

    return (
        <Fragment>
            <div className="fullscreen-div">
                <ToastContainer />

                {/* sidebar */}
                {desktopMenu && (
                    <aside className="fixed-fullheight-sidebar" >
                        <div className="sidebar-head">
                            <h4 className="my-0 ps-3">ERP  <span className="fa-10">v{process.env.REACT_APP_VERSION}</span></h4>
                        </div>
                        <hr className="my-2" />
                        <div className="sidebar-body-div">

                            {sidebar.map((o, i) => (
                                <DispNavButtons
                                    key={i}
                                    mainBtn={o}
                                    nav={nav}
                                    sideClose={handleClose}
                                    page={location.pathname}
                                />
                            ))}

                        </div>
                        <div className="sidebar-bottom">
                            <button className="btn btn-dark w-100 d-flex align-items-center " onClick={props.logout}>
                                <span className=" flex-grow-1 text-start">Logout</span>
                                <Logout className="fa-in" />
                            </button>
                        </div>
                    </aside>
                )}

                {/* main area */}
                <div className="content-div">

                    {/* header */}
                    <div className="navbar-div" style={{ color: 'white', background: 'linear-gradient(to right, #f3e5f5, #fff9c4)' }}>

                        <div className="fa-16 fw-bold mb-0 d-flex align-items-center" >

                            <Tooltip title={desktopMenu ? 'Minimize Sidebar' : 'Expand Sidebar'}>
                                <span>
                                    <IconButton
                                        onClick={() => setDesktopMenu(pre => !pre)}
                                        className="text-dark other-hide"
                                        size="small"
                                    >
                                        {desktopMenu ? <KeyboardDoubleArrowLeft /> : <KeyboardDoubleArrowRight />}
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <span className="open-icon">
                                <IconButton onClick={handleShow} className="text-dark" size="small">
                                    <Menu />
                                </IconButton>
                            </span>

                            <div className="ms-2 flex-grow-1 d-flex flex-column">
                                <span className="flex-grow-1 text-dark" >Welcome {parseData?.Name}</span>
                                <span className="text-muted fa-12">Login Time: {LocalDateWithTime(loginAt)}</span>
                            </div>


                            <Tooltip title="Settings">
                                <span>
                                    <IconButton onClick={() => setSettings(true)} color="primary" size="small"><Settings /></IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Logout">
                                <span>
                                    <IconButton onClick={props.logout} color="primary" size="small"><Logout /></IconButton>
                                </span>
                            </Tooltip>

                        </div>
                    </div>

                    {/* body content */}
                    <div className="content-body">
                        <p className="linkColor mb-2 text-uppercase">
                            {contextObj?.MainMenuData && (
                                <span
                                    className={!contextObj?.MainMenuData?.url ? " text-dark" : 'fw-bold fa-15 pointer'}
                                    onClick={() => contextObj?.MainMenuData?.url && nav(contextObj?.MainMenuData?.url)}> / {contextObj?.MainMenuData?.name}
                                </span>
                            )}
                            {contextObj?.SubMenuData && (
                                <span
                                    className="fw-bold fa-15 pointer"
                                    onClick={() => nav(contextObj?.SubMenuData?.url)}> / {contextObj?.SubMenuData?.name}
                                </span>
                            )}
                            {contextObj?.ChildMenuData && (
                                <span
                                    className="fw-bold fa-15 pointer"
                                    onClick={() => nav(contextObj?.ChildMenuData?.url)}> / {contextObj?.ChildMenuData?.name}
                                </span>
                            )}
                            {contextObj?.name && (
                                <span
                                    className={!contextObj.url ? " text-dark" : 'fw-bold fa-15 pointer'}
                                    onClick={() => contextObj.url && nav(contextObj.url)}> / {contextObj?.name}
                                </span>
                            )}
                        </p>

                        {isEqualNumber(contextObj?.Read_Rights, 1) ? props.children : (
                            <InvalidPageComp message={'Invalid Credential'} />
                        )}

                    </div>

                </div>
            </div>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header style={{ backgroundColor: '#333', color: 'white' }} closeButton>
                    <Offcanvas.Title >
                        <h4 className="my-0 ps-3">ERP  <span className="fa-12">v{process.env.REACT_APP_VERSION}</span></h4>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body style={{ backgroundColor: '#333' }}>

                    {sidebar.map((o, i) => (
                        <DispNavButtons
                            key={i}
                            mainBtn={o}
                            nav={nav}
                            sideClose={handleClose}
                            page={location.pathname}
                        />
                    ))}
                </Offcanvas.Body>
            </Offcanvas>

            <Dialog
                open={settings}
                onClose={() => setSettings(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Settings</DialogTitle>

                <DialogContent>

                    <center>
                        <AccountCircle sx={{ fontSize: '100px' }} />
                        <br />
                        <h4>{parseData?.Name}</h4>
                    </center>

                    <hr />

                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setSettings(false)}>Close</Button>
                </DialogActions>

            </Dialog>
        </Fragment>
    );
}

export default MainComponent;