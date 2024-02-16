import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IconButton, Collapse } from '@mui/material';
import { Menu, KeyboardArrowRight, KeyboardArrowDown, Circle } from '@mui/icons-material'
import "./MainComponent.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import api from "../../API";


const DispNavButtons = ({ mainBtn, subMenus, nav }) => {
  const [open, setOpen] = useState(false)

  return Number(mainBtn.Read_Rights) === 1 && (
    <>
      <button className="sidebutton"
        onClick={
          mainBtn?.PageUrl !== ""
            ? () => nav(mainBtn?.PageUrl)
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
                ? <SubMenu key={i} subBtn={obj} nav={nav} />
                : null
            ))}
          </Collapse>
        )}
    </>
  )
}

const SubMenu = ({ subBtn, nav }) => {
  return (
    <>
      <button
        className={'sidebutton'}
        onClick={() => nav(subBtn?.PageUrl)} >
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
  const [pageInfo, setPageInfo] = useState({})

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
        <aside className="fixed-fullheight-sidebar">
          <div className="sidebar-head">
            <h4 className="my-0 ps-3">SMT Task</h4>
          </div>
          <hr className="my-2" />
          <div className="sidebar-body-div">
            {sidebar.MainMenu.map((o, i) => (
              <DispNavButtons key={i} mainBtn={o} subMenus={sidebar.SubMenu} nav={nav} />
            ))}
          </div>
          <div className="sidebar-bottom">
            <h4 className="my-0">footer text</h4>
          </div>
        </aside>
        <div className="content-div">
          <div className="navbar-div">
            <p className="fa-16 fw-bold mb-0" >
              <span className="open-icon">
                <IconButton data-bs-toggle="offcanvas" data-bs-target="#sidenav" size="small">
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
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="sidenav" aria-labelledby="Label">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="Label">Menu</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-0">
          <div style={{ paddingRight: '5px' }}>
            {sidebar.MainMenu.map((o, i) => (
              <DispNavButtons key={i} mainBtn={o} subMenus={sidebar.SubMenu} nav={nav} />
            ))}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default MainComponent;
