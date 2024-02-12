import React, { Fragment } from "react";
import "./SideBar.css";
import { styled, useTheme } from "@mui/material/styles";

function SideBar() {
  

  return (
    <Fragment>
      <div className="fullscreen-div">
        <aside className="fixed-fullheight-sidebar" id="sidebar-div">
          <div className="sidebar-head">
            <h4 className="my-0 ps-3">ERP</h4>
          </div>
          <hr className="my-2" />
          <div className="sidebar-body-div">
            <p>body text00</p>
            <p>body text00</p>
            <p>body text00</p>
            <p>body text00</p>
            <p>body text00</p>
            <p>body text00</p>
            <p>body text00</p>
          </div>
          <div className="sidebar-bottom">
            <h4 className="my-0">footer text</h4>
          </div>
        </aside>
        <div className="content-div">
          <div className="navbar-div">

            ERP
          </div>

          <div className="content-body">
            <p>
              body text00body text00body text00body text00body text00body text00
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default SideBar;
