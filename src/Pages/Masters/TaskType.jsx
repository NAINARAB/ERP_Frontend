import React, { useState, useEffect, Fragment } from "react";
import Chip from "@mui/material/Chip";
import { ToastContainer, toast } from "react-toastify";
import Button from "@mui/material/Button";
import api from "../../API";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button as MuiButton,
  TextField,
} from "@mui/material";

function TaskType() {
  const [TaskTypeData, setTaskTypeData] = useState([]);
  const [reload, setReload] = useState();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState([]);
  const [newChipType, setNewChipType] = useState("");
  const [screen, setScreen] = useState(false);
  // const localData = localStorage.g9etItem("user");
  // const parseData = JSON.parse(localData);
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

  return (
    <Fragment>
      <ToastContainer />
      {!screen ? (
        <div className="card">
          <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
            Task Types
            <div className="text-end">
              <Button
                color="primary"
                variant="outlined"
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
              {TaskTypeData.map((obj, index) => (
                <Chip
                  className="mx-1 "
                  size="medium"
                  key={index}
                  label={obj.Task_Type}
                  onDelete={() => handleDeleteClick(obj)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      <Dialog
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Create new Task"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="create-dialog-description">
            Enter the Tasktype:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="newChipType"
            label="UserId"
            type="text"
            value={newChipType}
            onChange={(event) => setNewChipType(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenNewDialog(false)}>Cancel</MuiButton>
          <MuiButton
            onClick={() => handleCreateChip()}
            autoFocus
            sx={{ color: "red" }}
          >
            Create
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <b>{`Do you want to delete the Task Type?`}</b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => handleCloseDeleteDialog(false)}>
            Cancel
          </MuiButton>
          <MuiButton
            onClick={() => handleDelete()}
            autoFocus
            sx={{ color: "red" }}
          >
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default TaskType;
