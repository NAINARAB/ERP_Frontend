import React, { useState, useEffect, Fragment } from "react";
import { Table } from "react-bootstrap";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import api from "../../API";

function UserType() {
  const [UserTypeData, setUserTypeData] = useState([]);
  const localData = localStorage.getItem("loginResponse");
  const parseData = JSON.parse(localData);
  useEffect(() => {
    fetch(`${api}userType`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.table(data.data);
          setUserTypeData(data.data);
        }
      });
  }, []);

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <Fragment>
      <div className="table-responsive">
        {UserTypeData.map((obj, index) => (
          <Chip key={index} label={obj.UserType} onDelete={handleClickOpen} />
        ))}
        <Dialog
          open={open}
          onClose={handleClickOpen}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Alert!"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Hey everyone
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClickOpen}>Disagree</Button>
            <Button onClick={handleClickOpen} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Fragment>
  );
}

export default UserType;
