import React, { useState, useEffect, Fragment } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import api from "../../API";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Button as MuiButton,
} from "@mui/material";
import { Table } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";

const initialState = {
  Task_Type: "",
  Task_Type_Id: "",
};

function TaskType() {
  const [TaskTypeData, setTaskTypeData] = useState([]);
  const [reload, setReload] = useState();
  const [inputValue, setInputValue] = useState(initialState);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState([]);
  const [newChipType, setNewChipType] = useState("");
  const [openNewDialog, setOpenNewDialog] = useState(false);

  useEffect(() => {
    fetch(`${api}taskType`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTaskTypeData(data.data);
        }
      });
  }, [reload]);

  const handleDelete = () => {
    fetch(`${api}taskType`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Task_Type_Id: selectedTaskType.Task_Type_Id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReload(!reload); // Trigger data refresh
          setOpenDeleteDialog(false); // Close dialog
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

  const handleDeleteClick = (taskType) => {
    setSelectedTaskType(taskType);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleCreateChip = () => {
    console.log("newChipType: ", newChipType);

    fetch(`${api}taskType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        Task_Type: newChipType,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("data", data.message);
          setOpenNewDialog(false);
          setReload(!reload);
          toast.success(data.message);
        } else {
          console.log("data", data.error);
          toast.error(data.message);
        }
      });
  };

  const [editBase, setEditBase] = useState(false);
  const editRow = (group) => {
    setEditBase(true);
    setInputValue({
      Task_Type: group.Task_Type,
      Task_Type_Id: group.Task_Type_Id,
    });
  };

  const editFun = (Task_Type, Task_Type_Id) => {
    fetch(`${api}taskType`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({Task_Type, Task_Type_Id}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message);
          setReload(!reload);
          setEditBase(false);
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
          Task Types
          <div className="text-end">
            <Button
              className="rounded-5 px-3 py-1 fa-13 shadow"
              onClick={() => setOpenNewDialog(true)}
            >
              Create Task Type
            </Button>
          </div>
        </div>
        <div
          className="card-body overflow-scroll"
          style={{ maxHeight: "78vh" }}
        >
          <div className="table-responsive">
            <Table className="">
              <thead>
                <tr>
                  <th className="fa-14">Id No</th>
                  <th className="fa-14">Task Type</th>
                  <th className="fa-14">Action</th>
                </tr>
              </thead>
              <tbody>
                {TaskTypeData.map((obj, index) => (
                  <tr key={index}>
                    <td className="fa-14">{obj.Task_Type_Id}</td>
                    <td className="fa-14">{obj.Task_Type}</td>
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
                          handleDeleteClick(obj);
                        }}
                        size="small"
                      >
                        <Delete className="fa-in del-red" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog
        open={editBase}
        onClose={() => setEditBase(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Task Type"}
        </DialogTitle>
        <DialogContent>
          <div className="p-2">
            <label>Task Type</label>
            <input
              type="text"
              onChange={(event) => setInputValue({
                ...inputValue,
                Task_Type: event.target.value
              })}
              value={inputValue.Task_Type}
              className="cus-inpt"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setEditBase(false)}>Cancel</MuiButton>
          <MuiButton
            onClick={() =>
              editFun(inputValue.Task_Type, inputValue.Task_Type_Id)
            }
            autoFocus
            color="success"
          >
            Update
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Create new Task"}</DialogTitle>
        <DialogContent>
          <div className="py-2">
            <label>UserType Name</label>
            <input
              type="text"
              onChange={(event) => setNewChipType(event.target.value)}
              value={newChipType}
              className="cus-inpt"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenNewDialog(false)}>Cancel</MuiButton>
          <MuiButton onClick={() => handleCreateChip()} color="success">
            Create
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <b>Do you want to delete the Task Type?</b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => handleCloseDeleteDialog(false)}>
            Cancel
          </MuiButton>
          <MuiButton onClick={() => handleDelete()} autoFocus color="error">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default TaskType;
