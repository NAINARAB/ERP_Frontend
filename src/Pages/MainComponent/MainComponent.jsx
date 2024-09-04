import React, { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IconButton, Collapse, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import {
    Menu, KeyboardArrowRight, KeyboardArrowDown, Circle, Logout, Dashboard, ManageAccounts, WorkHistory, Chat, TaskAlt,
    Tune, BarChart, SettingsAccessibility, Leaderboard, CurrencyRupee, VpnKey, AccountCircle, Settings, HowToReg, Keyboard,
    AutoGraph, KeyboardDoubleArrowRight, KeyboardDoubleArrowLeft
} from '@mui/icons-material'
import "./MainComponent.css";
import { GrMoney } from "react-icons/gr";
import { BsCart3 } from "react-icons/bs";
import { BsBoxes } from "react-icons/bs";
import { IoStorefrontOutline } from "react-icons/io5";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { MyContext } from "../../Components/context/contextProvider";
import { CurretntCompany } from "../../Components/context/currentCompnayProvider";
import InvalidPageComp from "../../Components/invalidCredential";
import { fetchLink } from "../../Components/fetchComponent";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const setLoclStoreage = (pageId, menu) => {
    localStorage.setItem('CurrentPage', JSON.stringify({ id: pageId, type: menu }));
}

const getIcon = (menuId) => {
    const icon = [
        {
            id: 6,
            IconComp: <Dashboard className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 7,
            IconComp: <Tune className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 8,
            IconComp: <SettingsAccessibility className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 9,
            IconComp: <WorkHistory className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 10,
            IconComp: <Chat className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        // {
        //     id: 11,
        //     IconComp: <TaskAlt className="me-2 fa-20" style={{ color: '#FDD017' }} />
        // },
        {
            id: 12,
            IconComp: <BarChart className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 13,
            IconComp: <HowToReg className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 14,
            IconComp: <ManageAccounts className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        // {
        //     id: 15,
        //     IconComp: <Leaderboard className="me-2 fa-20" style={{ color: '#FDD017' }} />
        // },
        {
            id: 16,
            IconComp: <CurrencyRupee className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 17,
            IconComp: <VpnKey className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 18,
            IconComp: <Keyboard className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 19,
            IconComp: <AutoGraph className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 21,
            IconComp: <GrMoney className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 22,
            IconComp: <BsCart3 className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
        {
            id: 23,
            IconComp: <IoStorefrontOutline className="me-2 fa-20" style={{ color: '#FDD017' }} />
        },
    ];

    const matchedIcon = icon.find(item => item.id === Number(menuId));
    return matchedIcon ? matchedIcon.IconComp : null;
}

const DispNavButtons = ({ mainBtn, subMenus, nav, sideClose, page, setPage, setCompanySettings }) => {
    const [open, setOpen] = useState(page.Main_Menu_Id === mainBtn.Main_Menu_Id);

    useEffect(() => setOpen(page.Main_Menu_Id === mainBtn.Main_Menu_Id), [page, page.Main_Menu_Id, mainBtn.Main_Menu_Id])

    const closeSide = () => {
        sideClose()
    }

    return Number(mainBtn.Read_Rights) === 1 && (
        <>
            <button className={page.Main_Menu_Id === mainBtn.Main_Menu_Id ? "sidebutton btn-active" : 'sidebutton'}
                onClick={
                    mainBtn?.PageUrl !== ""
                        ? () => {
                            nav(mainBtn?.PageUrl);
                            sideClose();
                            setPage(mainBtn);
                            setLoclStoreage(mainBtn.Main_Menu_Id, 1)
                            setCompanySettings(false)
                        }
                        : () => setOpen(!open)}
            >
                <span className="flex-grow-1 d-flex justify-content-start">
                    {getIcon(mainBtn.Main_Menu_Id)}
                    {mainBtn?.MenuName}
                </span>
                {mainBtn?.PageUrl === "" && <span className=" text-end">{open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}</span>}
            </button>
            {mainBtn?.PageUrl === ""
                && (
                    <Collapse in={open} timeout="auto" unmountOnExit >
                        {subMenus.map((obj, i) => (
                            Number(mainBtn?.Main_Menu_Id) === Number(obj?.Main_Menu_Id) && Number(obj?.Read_Rights) === 1
                                ? <SubMenu
                                    key={i}
                                    subBtn={obj}
                                    nav={nav}
                                    sideClose={closeSide}
                                    page={page}
                                    setPage={setPage}
                                    setCompanySettings={setCompanySettings}
                                />
                                : null
                        ))}
                    </Collapse>
                )}
        </>
    )
}

const SubMenu = ({ subBtn, nav, page, sideClose, setPage, setCompanySettings }) => {
    return (
        <>
            <button
                className={page.Sub_Menu_Id === subBtn.Sub_Menu_Id ? 'sidebutton sub-btn-active tes' : 'sidebutton tes'}
                onClick={() => {
                    nav(subBtn?.PageUrl);
                    sideClose();
                    setPage(subBtn);
                    setLoclStoreage(subBtn.Sub_Menu_Id, 2);
                    setCompanySettings(false)
                }}
            >
                <Circle sx={{ fontSize: '6px', color: '#FDD017', marginRight: '5px' }} />{' ' + subBtn?.SubMenuName}
            </button>
        </>
    );
}

function MainComponent(props) {
    const nav = useNavigate();
    const parseData = JSON.parse(localStorage.getItem("user"));
    const parseSessionData = JSON.parse(localStorage.getItem("session"));
    const [sidebar, setSidebar] = useState({ MainMenu: [], SubMenu: [] });

    const { contextObj, setContextObj } = useContext(MyContext);
    const { currentCompany, setCurrentCompany } = useContext(CurretntCompany);

    const [settings, setSettings] = useState(false);

    const [show, setShow] = useState(false);
    const [comp, setComp] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [desktopMenu, setDesktopMenu] = useState(true);

    useEffect(() => {
        fetchLink({
            address: `authorization/appMenu?Auth=${parseData?.Autheticate_Id}`
        }).then(data => {
            if (data.success) {
                data?.MainMenu?.sort((a, b) => (a?.OrderNo && b?.OrderNo) ? a?.OrderNo - b?.OrderNo : b?.OrderNo - a?.OrderNo);
                setSidebar({ MainMenu: data?.MainMenu, SubMenu: data?.SubMenu });

                let navigated = false;

                if (localStorage.getItem('CurrentPage')) {
                    const getPageId = JSON.parse(localStorage.getItem('CurrentPage'))
                    if (Number(getPageId?.type) === 1) {
                        for (let o of data.MainMenu) {
                            if (Number(o.Read_Rights) === 1 && o.PageUrl !== '' && (parseInt(getPageId?.id) === parseInt(o.Main_Menu_Id))) {
                                setContextObj(o); nav(o.PageUrl);
                                navigated = true;
                                break;
                            }
                        }
                    } else {
                        for (let o of data.SubMenu) {
                            if (Number(o.Read_Rights) === 1 && (parseInt(o?.Sub_Menu_Id) === parseInt(getPageId.id))) {
                                setContextObj(o); nav(o.PageUrl);
                                navigated = true;
                                break;
                            }
                        }
                    }
                }

                if (!navigated) {
                    for (let o of data.MainMenu) {
                        if (Number(o.Read_Rights) === 1 && o.PageUrl !== '' && !navigated) {
                            setLoclStoreage(o?.Main_Menu_Id, 1)
                            setContextObj(o); nav(o.PageUrl);
                            navigated = true;
                            break;
                        }
                    }
                }

                if (!navigated) {
                    for (let o of data.SubMenu) {
                        if (Number(o.Read_Rights) === 1 && o.PageUrl !== '' && !navigated) {
                            setLoclStoreage(o?.Sub_Menu_Id, 2)
                            setContextObj(o); nav(o.PageUrl);
                            navigated = true;
                            break;
                        }
                    }
                }

                if (!navigated) {
                    navigated = true;
                    nav('/invalid-credentials')
                }

            }
        }).catch(e => console.error(e));

    }, [parseData?.Autheticate_Id, parseData?.UserId])

    useEffect(() => {
        fetchLink({
            address: `authorization/companysAccess?Auth=${parseData?.Autheticate_Id}`
        }).then((data) => {
            if (data.success) {
                setComp(data.data);
                if (data?.data[0] && Number(data?.data[0]?.View_Rights) === 1) {
                    setCurrentCompany({
                        ...currentCompany,
                        id: data?.data[0]?.Company_Id,
                        CompName: data?.data[0]?.Company_Name,
                    });
                }
            } else {
                setComp([]);
            }
        }).catch(e => console.error('Fetch Error:', e));

    }, []);

    const companyOnChange = (e) => {
        const id = e.target.value;
        const matchingCompany = comp.find(obj => Number(obj?.Company_Id) === Number(id));
        setCurrentCompany({ ...currentCompany, id: matchingCompany?.Company_Id, CompName: matchingCompany?.Company_Name })
    };

    const changeCompanySettings = (val) => {
        setCurrentCompany({ ...currentCompany, CompanySettings: val })
    }


    return (
        <Fragment>
            <ToastContainer />
            <div className="fullscreen-div">

                {/* sidebar */}
                {desktopMenu && (
                    <aside className="fixed-fullheight-sidebar" >
                        <div className="sidebar-head">
                            <h4 className="my-0 ps-3">ERP</h4>
                        </div>
                        <hr className="my-2" />
                        <div className="sidebar-body-div" style={{ paddingBottom: '200px' }}>

                            {sidebar.MainMenu.map((o, i) => (
                                <DispNavButtons
                                    key={i}
                                    mainBtn={o}
                                    subMenus={sidebar.SubMenu}
                                    nav={nav}
                                    sideOpen={handleShow}
                                    sideClose={handleClose}
                                    page={contextObj}
                                    setPage={setContextObj}
                                    setCompanySettings={changeCompanySettings}
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

                <div className="content-div">
                    <div className="navbar-div" style={{ color: 'white', background: 'linear-gradient(to right, #f3e5f5, #fff9c4)' }}>

                        <div className="fa-16 fw-bold mb-0 d-flex align-items-center" >

                            <Tooltip title={desktopMenu ? 'Minimize Sidebar' : 'Expand Sidebar'}>
                                <IconButton
                                    onClick={() => setDesktopMenu(pre => !pre)}
                                    className="text-dark other-hide"
                                    size="small"
                                >
                                    {desktopMenu ? <KeyboardDoubleArrowLeft /> : <KeyboardDoubleArrowRight />}
                                </IconButton>
                            </Tooltip>

                            <span className="open-icon">
                                <IconButton onClick={handleShow} className="text-dark" size="small">
                                    <Menu />
                                </IconButton>
                            </span>

                            <div className="ms-2 flex-grow-1 d-flex flex-column">
                                <span className="flex-grow-1 text-dark" >Welcome {parseData?.Name + " !"}</span>
                                <span className="text-muted fa-12">Login Time: {new Date(parseSessionData?.InTime).toDateString()}</span>
                            </div>


                            <Tooltip title="Settings">
                                <IconButton onClick={() => setSettings(true)} color="primary" size="small"><Settings /></IconButton>
                            </Tooltip>

                            <Tooltip title="Logout">
                                <IconButton onClick={props.logout} color="primary" size="small"><Logout /></IconButton>
                            </Tooltip>

                        </div>
                    </div>

                    <div className="content-body">
                        <Breadcrumb>
                            {!contextObj?.Sub_Menu_Id ? (
                                <Breadcrumb.Item href="#">{contextObj?.MenuName}</Breadcrumb.Item>
                            ) : (
                                <>
                                    {sidebar?.MainMenu.map((o, i) => (
                                        parseInt(o?.Main_Menu_Id) === parseInt(contextObj?.Main_Menu_Id) && (
                                            <Breadcrumb.Item href="#" key={i}>{o?.MenuName}</Breadcrumb.Item>
                                        )
                                    ))}
                                    <Breadcrumb.Item href="#">{contextObj?.SubMenuName}</Breadcrumb.Item>
                                </>
                            )}
                        </Breadcrumb>
                        {Number(contextObj?.Read_Rights) === 1 ? props.children : <InvalidPageComp />}
                    </div>

                </div>
            </div>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header style={{ backgroundColor: '#333', color: 'white' }} closeButton>
                    <Offcanvas.Title >Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body style={{ backgroundColor: '#333' }}>

                    {sidebar.MainMenu.map((o, i) => (
                        <DispNavButtons
                            key={i}
                            mainBtn={o}
                            subMenus={sidebar.SubMenu}
                            nav={nav}
                            sideOpen={handleShow}
                            sideClose={handleClose}
                            page={contextObj}
                            setPage={setContextObj}
                            setCompanySettings={changeCompanySettings}
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

                    {currentCompany?.CompanySettings === true && (
                        <div className="row mb-3">
                            <div className="col-sm-4 ">
                                <TextField
                                    fullWidth
                                    select
                                    label="Company"
                                    variant="outlined"
                                    onChange={e => companyOnChange(e)}
                                    value={Number(currentCompany?.id)}
                                    placeholder='SELECT COMPANY'
                                    InputProps={{
                                        inputProps: {
                                            style: { padding: '26px' }
                                        }
                                    }}
                                >
                                    <MenuItem value=''>SELECT COMPANY</MenuItem>

                                    {comp.map((obj, i) =>
                                        Number(obj?.View_Rights) === 1 && (
                                            <MenuItem key={i} value={Number(obj?.Company_Id)} >
                                                {obj?.Company_Name}
                                            </MenuItem>
                                        )
                                    )}

                                </TextField>

                            </div>
                        </div>
                    )}

                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setSettings(false)}>Close</Button>
                </DialogActions>

            </Dialog>
        </Fragment>
    );
}

export default MainComponent;