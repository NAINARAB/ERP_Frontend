import React, { Fragment } from "react";
import { useNavigate } from 'react-router-dom';
import "./MainComponent.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Accordion } from "react-bootstrap";

function MainComponent(props) {
  const nav = useNavigate();

  return (
    <Fragment>
      <div className="fullscreen-div">
        <aside className="fixed-fullheight-sidebar">
          <div className="sidebar-head">
            <h4 className="my-0 ps-3">SMT Task</h4>
          </div>
          <hr className="my-2" />
          <div className="sidebar-body-div">
            <button onClick={() => nav('/')}>Home</button>
            <button onClick={() => nav('/masters/company')}>Company</button>
            <button onClick={() => nav('/masters/users')}>User</button>
            <button onClick={() => nav('/masters/branch')}>Branches</button>
            <Accordion>
              <Accordion.Header>Master Data</Accordion.Header>
              <Accordion.Body>
                <li className="pb-2 pt-2"></li>
              </Accordion.Body>
            </Accordion>
          </div>
          <div className="sidebar-bottom">
            <h4 className="my-0">footer text</h4>
          </div>
        </aside>
        <div className="content-div">
          <div className="navbar-div">ERP</div>

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
    </Fragment>
  );
}

export default MainComponent;
