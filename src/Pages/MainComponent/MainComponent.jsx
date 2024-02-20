import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IconButton, Collapse } from '@mui/material';
import { Menu, KeyboardArrowRight, KeyboardArrowDown, Circle, Logout } from '@mui/icons-material'
import "./MainComponent.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import api from "../../API";
import Offcanvas from 'react-bootstrap/Offcanvas';


const DispNavButtons = ({ mainBtn, subMenus, nav, sideClose }) => {
  const [open, setOpen] = useState(false);

  const closeSide = () => {
    sideClose()
  }

  return Number(mainBtn.Read_Rights) === 1 && (
    <>
      <button className="sidebutton" 
        onClick={
          mainBtn?.PageUrl !== ""
            ? () => {nav(mainBtn?.PageUrl); sideClose();}
            : () => setOpen(!open)}

      >
        {mainBtn?.MenuName}
        {mainBtn?.PageUrl === "" && <span className=" text-end">{open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}</span>}
      </button>
      {mainBtn?.PageUrl === ""
        && (
          <Collapse in={open} timeout="auto" unmountOnExit >
            {subMenus.map((obj, i) => (
              Number(mainBtn?.Main_Menu_Id) === Number(obj?.Main_Menu_Id) && Number(obj?.Read_Rights) === 1
                ? <SubMenu key={i} subBtn={obj} nav={nav} sideClose={closeSide} />
                : null
            ))}
          </Collapse>
        )}
    </>
  )
}

const SubMenu = ({ subBtn, nav, sideClose }) => {
  return (
    <>
      <button
        className={'sidebutton'}
        onClick={() => {nav(subBtn?.PageUrl); sideClose()}} >
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
  const [pageInfo, setPageInfo] = useState({});
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  useEffect(() => {
    fetch(`${api}appMenu?Auth=${parseData?.Autheticate_Id}`).then(res => res.json())
      .then(data => {
        if (data.success) {
          setSidebar({ MainMenu: data?.MainMenu, SubMenu: data?.SubMenu })
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
              <DispNavButtons key={i} mainBtn={o} subMenus={sidebar.SubMenu} nav={nav} sideOpen={handleShow} sideClose={handleClose} />
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
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="#">Task</Breadcrumb.Item>
              <Breadcrumb.Item href="#" active>
                Overview
              </Breadcrumb.Item>
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
            <DispNavButtons key={i} mainBtn={o} subMenus={sidebar.SubMenu} nav={nav} sideOpen={handleShow} sideClose={handleClose} />
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </Fragment>
  );
}

export default MainComponent;
