import React, { useState, useEffect, Fragment } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { ToastContainer, toast } from "react-toastify";
import api from "../../API";
import { Button, Table } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";

const initialState = {
  Id: "",
  UserType: "",
};

function UserType() {
  const [UserTypeData, setUserTypeData] = useState([]);
  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false); // Dialog state

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChipType, setNewChipType] = useState("");
  const [inputValue, setInputValue] = useState(initialState);
  const [editUser, setEditUser] = useState(false);

  useEffect(() => {
    fetch(`${api}userType`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserTypeData(data.data);
        }
      });
  }, [reload]);

  const handleDelete = () => {
    fetch(`${api}userType`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id: inputValue.Id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReload(!reload);
          setOpen(false);
          toast.success("Chip deleted successfully!");
        } else {
          toast.error("Failed to delete chip:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error deleting chip:", error);
        toast.error("An error occurred. Please try again later.");
      });
  };

  const handleCreate = () => {
    fetch(`${api}userType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserType: newChipType,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsCreateDialogOpen(false);
          setNewChipType("");
          setReload(!reload);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => {
        console.error("Error creating chip:", error);
        toast.error("An error occurred. Please try again later.");
      });
  };



  const editRow = (user) => {
    setEditUser(true);
    setInputValue({
      Id: user.Id,
      UserType: user.UserType,
    });
  };

  const editFun = (Id, UserType) => {
    fetch(`${api}userType`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Id, UserType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message);
          setReload(!reload);
          setEditUser(false);
        } else {
          toast.error(data.message);
        }
      });
  };

  return (
    <Fragment>
      <ToastContainer />
      <div className="card">
        <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
          UserType
          <div className="text-end">
            <Button
              className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create UserType
            </Button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <Table className="">
              <thead>
                <tr>
                  <th className="fa-14">Id</th>
                  <th className="fa-14">UserType</th>
                  <th className="fa-14">Action</th>
                </tr>
              </thead>
              <tbody>
                {UserTypeData.map((obj, index) => (
                  <tr key={index}>
                    <td className="fa-14">{obj.Id}</td>
                    <td className="fa-14">{obj.UserType}</td>
                    <td className="fa-12" style={{ minWidth: "80px" }}>
                      <IconButton
                        onClick={() => {
                          editRow(obj);
                        }}
                        size="small"
                      >
                        <Edit className="fa-in" />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setOpen(true);
                          setInputValue({ Id: obj.Id });
                        }}
                        size="small"
                      >
                        <Delete className="fa-in del-red" />
                      </IconButton>
                    </td>
                  </tr>
                  // <Chip
                  //   key={index}
                  //   className="m-1"
                  //   label={obj.UserType}
                  //   onDelete={obj.Id > 3 ? () => {
                  //     setOpen(true);
                  //     setInputValue({ Id: obj.Id });
                  //   } : undefined}
                  // />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        aria-labelledby="create-dialog-title"
        aria-describedby="create-dialog-description"
      >
        <DialogTitle id="create-dialog-title">UserType Creation</DialogTitle>
        <DialogContent>
          <div className="p-2">
            <label>UserType Name</label>
            <input
              type="text"
              onChange={(event) => setNewChipType(event.target.value)}
              placeholder="Ex: Admin"
              value={newChipType}
              className="cus-inpt"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </MuiButton>
          <MuiButton onClick={() => handleCreate()} color="success">
            CREATE
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editUser}
        onClose={() => setEditUser(false)}
        aria-labelledby="create-dialog-title"
        aria-describedby="create-dialog-description"
      >
        <DialogTitle id="create-dialog-title">UserType</DialogTitle>
        <DialogContent>
          <div className="p-2">
            <label>UserType </label>
            <input
              type="text"
              onChange={(event) =>
                setInputValue({
                  ...inputValue,
                  UserType: event.target.value,
                })
              }
              placeholder={inputValue.UserType}
              value={inputValue.UserType}
              className="cus-inpt"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
          <MuiButton onClick={() => editFun(inputValue.Id, inputValue.UserType)} color="success">
            Update
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <b>Do you want to delete the UserType?</b>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
          <MuiButton onClick={handleDelete} autoFocus color="error">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default UserType;
