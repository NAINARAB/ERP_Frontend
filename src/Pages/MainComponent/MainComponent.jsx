import React, { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IconButton, Collapse } from '@mui/material';
import { Menu, KeyboardArrowRight, KeyboardArrowDown, Circle, Logout } from '@mui/icons-material'
import "./MainComponent.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import api from "../../API";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { MyContext } from "../../Components/context/contextProvider";


const DispNavButtons = ({ mainBtn, subMenus, nav, sideClose, page, setPage }) => {
  const [open, setOpen] = useState(page.Main_Menu_Id === mainBtn.Main_Menu_Id);

  useEffect(() => setOpen(page.Main_Menu_Id === mainBtn.Main_Menu_Id), [page])

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
              setPage(mainBtn) 
            }
            : () => setOpen(!open)}

      >
        <span className="flex-grow-1 d-flex justify-content-start">{mainBtn?.MenuName}</span>
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
          setPage(subBtn) 
          }} >
        <Circle sx={{ fontSize: '6px', color: 'white', marginRight: '5px' }} />{' ' + subBtn?.SubMenuName}
      </button>
    </>
  );
}

function MainComponent(props) {
  const nav = useNavigate();
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const [sidebar, setSidebar] = useState({ MainMenu: [], SubMenu: [] });
  const { contextObj, setContextObj } = useContext(MyContext);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  useEffect(() => {
    fetch(`${api}appMenu?Auth=${parseData?.Autheticate_Id}`).then(res => res.json())
      .then(data => {
        if (data.success) {
          setSidebar({ MainMenu: data?.MainMenu, SubMenu: data?.SubMenu });
          let navigated = false;
          for (let o of data.MainMenu) {
            if (Number(o.Read_Rights) === 1 && o.PageUrl !== '' && !navigated) {
              setContextObj(o); nav(o.PageUrl);
              navigated = true;
              break;
            }
          }
          if (!navigated) {
            for (let o of data.SubMenu) {
              if (Number(o.Read_Rights) === 1 && o.PageUrl !== '' && !navigated) {
                setContextObj(o); nav(o.PageUrl);
                navigated = true;
                break;
              }
            }
          }

          if (!navigated) {
            nav('/invalid-credentials')
          }

        }
      })
  }, [])


  return (
    <Fragment>
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
            <button className="btn btn-dark text-uppercase w-100" onClick={props.logout}>
              loguout <Logout className="fa-in" />
            </button>
          </div>
        </aside>

        <div className="content-div">
          <div className="navbar-div">
            <p className="fa-16 fw-bold mb-0" >
              <span className="open-icon">
                <IconButton onClick={handleShow} size="small">
                  <Menu />
                </IconButton>
              </span>
              Task Management
            </p>
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
            {props.children}
          </div>
        </div>
      </div>


      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
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
    </Fragment>
  );
}

export default MainComponent;
