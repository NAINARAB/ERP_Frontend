import React, { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IconButton, Collapse, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Menu, KeyboardArrowRight, KeyboardArrowDown, Circle, Logout, Dashboard, ManageAccounts, WorkHistory, Chat, TaskAlt, Tune, Notifications, Add } from '@mui/icons-material'
import "./MainComponent.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import api from "../../API";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";
import Dropdown from 'react-bootstrap/Dropdown';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const setLoclStoreage = (pageId, menu) => {
  localStorage.setItem('CurrentPage', JSON.stringify({ id: pageId, type: menu }));
}

const DispNavButtons = ({ mainBtn, subMenus, nav, sideClose, page, setPage }) => {
  const [open, setOpen] = useState(page.Main_Menu_Id === mainBtn.Main_Menu_Id);

  useEffect(() => setOpen(page.Main_Menu_Id === mainBtn.Main_Menu_Id), [page, page.Main_Menu_Id, mainBtn.Main_Menu_Id])

  const closeSide = () => {
    sideClose()
  }

  const getIcon = () => {
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
        IconComp: <ManageAccounts className="me-2 fa-20" style={{ color: '#FDD017' }} />
      },
      {
        id: 9,
        IconComp: <WorkHistory className="me-2 fa-20" style={{ color: '#FDD017' }} />
      },
      {
        id: 10,
        IconComp: <Chat className="me-2 fa-20" style={{ color: '#FDD017' }} />
      },
      {
        id: 11,
        IconComp: <TaskAlt className="me-2 fa-20" style={{ color: '#FDD017' }} />
      }
    ];

    const matchedIcon = icon.find(item => item.id === mainBtn.Main_Menu_Id);
    return matchedIcon ? matchedIcon.IconComp : null;
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
            }
            : () => setOpen(!open)}

      >
        <span className="flex-grow-1 d-flex justify-content-start">
          {getIcon()}
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
                  setPage={setPage} />
                : null
            ))}
          </Collapse>
        )}
    </>
  )
}

const SubMenu = ({ subBtn, nav, page, sideClose, setPage }) => {
  return (
    <>
      <button
        className={page.Sub_Menu_Id === subBtn.Sub_Menu_Id ? 'sidebutton sub-btn-active tes' : 'sidebutton tes'}
        onClick={() => {
          nav(subBtn?.PageUrl);
          sideClose();
          setPage(subBtn);
          setLoclStoreage(subBtn.Sub_Menu_Id, 2)
        }} >
        <Circle sx={{ fontSize: '6px', color: '#FDD017', marginRight: '5px' }} />{' ' + subBtn?.SubMenuName}
      </button>
    </>
  );
}

function MainComponent(props) {
  const nav = useNavigate();
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const localSessionData = localStorage.getItem("session");
  const parseSessionData = JSON.parse(localSessionData);
  const [sidebar, setSidebar] = useState({ MainMenu: [], SubMenu: [] });
  const { contextObj, setContextObj } = useContext(MyContext);
  const [notificationData, setNotificationData] = useState([]);
  const [users, setUsers] = useState([])
  const [notificationInput, setNotificationInput] = useState({
    Title: '',
    Desc_Note: '',
    Emp_Id: parseData?.UserId,
    notificationDialog: false,
  })

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    fetch(`${api}appMenu?Auth=${parseData?.Autheticate_Id}`).then(res => res.json())
      .then(data => {
        if (data.success) {
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
      })
    fetch(`${api}notification?UserId=${parseData?.UserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotificationData(data.data)
        }
      })
    fetch(`${api}userName?AllUser=true&BranchId=1`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.data);
        }
      })
  }, [parseData?.Autheticate_Id, parseData?.UserId])

  const openNotificationDialog = () => {
    setNotificationInput({
      Title: '',
      Desc_Note: '',
      Emp_Id: parseData?.UserId,
      notificationDialog: true,
    })
  }

  const postNotification = (e) => {
    e.preventDefault()
    fetch(`${api}notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(notificationInput)
    }).then(res => res.json())
    .then(data => {
      if (data.success) {
          toast.success(data.message);
          setNotificationInput({ ...notificationInput, notificationDialog: false })
      } else {
        toast.error(data.message)
      }
    }).catch(e => console.error(e))
  }

  return (
    <Fragment>
      <ToastContainer />
      <div className="fullscreen-div">

        {/* sidebar */}

        <aside className="fixed-fullheight-sidebar">
          <div className="sidebar-head">
            <h4 className="my-0 ps-3">SMT Task</h4>
          </div>
          <hr className="my-2" />
          <div className="sidebar-body-div">
            {sidebar.MainMenu.map((o, i) => (
              <DispNavButtons
                key={i}
                mainBtn={o}
                subMenus={sidebar.SubMenu}
                nav={nav}
                sideOpen={handleShow}
                sideClose={handleClose}
                page={contextObj}
                setPage={setContextObj} />
            ))}
          </div>
          <div className="sidebar-bottom">
            <button className="btn btn-dark w-100" onClick={props.logout}>
              <Logout className="fa-in" /> Logout
            </button>
          </div>
        </aside>

        <div className="content-div">
          <div className="navbar-div">

            <div className="fa-16 fw-bold mb-0 d-flex align-items-center" >

              <span className="open-icon">
                <IconButton onClick={handleShow} className="text-dark" size="small">
                  <Menu />
                </IconButton>
              </span>

              <div className="ms-2 flex-grow-1 d-flex flex-column">
                <span className="flex-grow-1 text-muted">Welcome {parseData?.Name + " !"}</span>
                <span className="text-muted fa-12">Login Time: {new Date(parseSessionData?.InTime).toDateString()}</span>
              </div>

              <Dropdown>
                <Dropdown.Toggle
                  variant="success"
                  id="actions"
                  className="rounded-5 bg-transparent text-dark border-0 btn"
                >
                  <IconButton
                    color="primary" size="small">
                    <Notifications />
                  </IconButton>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <h5 className="px-3 border-bottom pb-2 mb-0 d-flex align-items-center">
                    <span className="flex-grow-1">Notifications</span>
                    <Tooltip title='Push Notification'>
                      <IconButton size="small" onClick={openNotificationDialog}>
                        <Add />
                      </IconButton>
                    </Tooltip>
                  </h5>

                  {notificationData?.map((o, i) => (
                    <div key={i} className="border-bottom px-3 pt-2 pb-0" style={{ cursor: 'default', minWidth: '330px' }}>
                      <p className="mb-1 fa-16 fw-bold d-flex align-items-center">
                        <span className="flex-grow-1 pe-1">{o?.Title}</span>
                        <span className="fa-13 text-primary">
                          {new Date(o?.Created_AT).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                      <p className="mb-0 fa-12 text-muted overflow-x-scroll" style={{ textAlign: 'justify' }}>
                        {o?.Desc_Note}
                      </p>
                    </div>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

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
              setPage={setContextObj} />
          ))}
        </Offcanvas.Body>
      </Offcanvas>

      <Dialog
        open={notificationInput?.notificationDialog}
        onClose={() => setNotificationInput({ ...notificationInput, notificationDialog: false })}
        maxWidth='sm' fullWidth>
        <DialogTitle>Push Notification</DialogTitle>
        <form onSubmit={postNotification}>
          <DialogContent>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <td className="border-0">Title</td>
                    <td className="border-0">
                      <input
                        className="cus-inpt"
                        onChange={e => setNotificationInput(pre => ({ ...pre, Title: e.target.value }))}
                        value={notificationInput?.Title} required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border-0">Description</td>
                    <td className="border-0">
                      <textarea
                        className="cus-inpt"
                        rows={4} required
                        onChange={e => setNotificationInput(pre => ({ ...pre, Desc_Note: e.target.value }))}
                        value={notificationInput?.Desc_Note}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border-0">Sent To</td>
                    <td className="border-0">
                      <select
                        className="cus-inpt"
                        required
                        onChange={e => setNotificationInput(pre => ({ ...pre, Emp_Id: e.target.value }))}
                        value={notificationInput?.Emp_Id}
                      >
                        {users?.map((o, i) => (
                          <option key={i} value={o?.UserId}>{o?.Name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DialogContent>
          <DialogActions>
            <Button type='button' onClick={() => setNotificationInput({ ...notificationInput, notificationDialog: false })}>cancel</Button>
            <Button type='submit'>send</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Fragment>
  );
}

export default MainComponent;
