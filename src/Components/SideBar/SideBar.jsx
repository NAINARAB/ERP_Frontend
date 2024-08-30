import React, { Fragment, useState } from "react";
import "./SideBar.css";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Accordion } from "react-bootstrap";

function MainComponent({ component, currentPage }) {
  // const [currentPage, setcurrentPage] = useState(1);
  return (
    <Fragment>
      <div className="fullscreen-div">
        <aside className="fixed-fullheight-sidebar" id="sidebar-div">
          <div className="sidebar-head">
            <h4 className="my-0 ps-3">SMT Task</h4>
          </div>
          <hr className="my-2" />
          <div className="sidebar-body-div">
            <p>DashBoard</p>
            <p>Projct Overview</p>
            <p>Task Overview</p>
            <p>Calender</p>
            <Accordion>
              <Accordion.Header>Master Data</Accordion.Header>
              <Accordion.Body>
                  <li className="pb-2 pt-2">
                    
                  </li>

                  
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
            {component}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default MainComponent;
