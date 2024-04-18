import React, { useState, useEffect, Fragment } from "react";
import { Table, Button } from "react-bootstrap";
import api from "../../API";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialState = {
  Id: "",
  Name: "",
  UserName: "",
  UserTypeId: "",
  Password: "",
  BranchId: "",
  UserId: "",
};

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [screen, setScreen] = useState(false);
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const [reload, setReload] = useState(false);
  const [inputValue, setInputValue] = useState(initialState);
  const [editUser, setEditUser] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [filterInput, setFilterInput] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const [dropdown, setDropDown] = useState([]);
  const [userDropdown, setuserDropdown] = useState([]);

  useEffect(() => {
    fetch(`${api}users?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}&Branch_Id=${2}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          data?.data?.sort((a, b) => a.Name.localeCompare(b.Name));
          setUsersData(data.data);
        }
      });
  }, [reload]);

  useEffect(() => {
    fetch(`${api}userType`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDropDown(data.data);
        }
      })
      .catch((e) => console.log(e));

    fetch(`${api}branch?User_Id=${parseData.UserId}&Company_id=${parseData.Company_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setuserDropdown(data.data);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  const createUser = () => {
    const postObj = {
      Id: inputValue.UserId,
      UserId: inputValue.UserId,
      Name: inputValue.Name,
      UserName: inputValue.UserName,
      UserTypeId: inputValue.UserTypeId,
      Password: inputValue.Password,
      BranchId: inputValue.BranchId,
    };
    if (validation() === "Success") {
      fetch(`${api}users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postObj),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log(data.data);
            setReload(!reload);
            switchScreen();
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
        });
    } else {
      toast.error(validation());
    }
  };

  const validation = () => {
    if (!inputValue?.Name && inputValue.Name.length === 0) {
      return "Name can not be empty";
    }

    if (!inputValue.UserName && inputValue?.UserName?.match("[0-9]{10}")) {
      return "Please provide valid phone number";
    }

    if (!inputValue?.Password && inputValue?.Password.length < 6) {
      return "Password must contain greater than or equal to 6 characters.";
    }

    if (!inputValue.BranchId) {
      return "Select Branch";
    }

    if (!inputValue.UserTypeId) {
      return "Select User Type";
    }
    return "Success";
  };

  const clearValues = () => {
    setInputValue({
      Id: "",
      Name: "",
      UserName: "",
      UserTypeId: "",
      Password: "",
      BranchId: "",
    });
  };

  const switchScreen = () => {
    clearValues();
    setScreen(!screen);
  };

  const editUserFn = () => {
    const postObj = {
      Id: inputValue.UserId,
      UserId: inputValue.UserId,
      Name: inputValue.Name,
      UserName: inputValue.UserName,
      UserTypeId: inputValue.UserTypeId,
      Password: inputValue.Password,
      BranchId: inputValue.BranchId,
    };
    fetch(`${api}users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postObj),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          switchScreen();
          setReload(!reload);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      });
  };

  const editRow = (user) => {
    console.log(user.Name);
    setEditUser(true);
    setInputValue({
      Id: user.UserId,
      UserId: user.UserId,
      Name: user.Name,
      UserName: user.UserName,
      UserTypeId: user.UserTypeId,
      Password: user.Password,
      BranchId: user.BranchId,
    });
    setScreen(true);
  };

  const deleteRow = (user, stat) => {
    setIsDialogOpen(!isDialogOpen);
    if (stat === true) {
      setSelectedRow(user);
    }
  };

  const handleDeleteConfirm = () => {
    fetch(`${api}users`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: selectedRow.UserId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReload(!reload);
          setIsDialogOpen(!isDialogOpen);
          toast.success("User deleted successfully!");
          setSelectedRow({});
        } else {
          toast.error("Failed to delete user:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        toast.error("An error occurred. Please try again later.");
      });
  };

  function handleSearchChange(event) {
    const term = event.target.value;
    setFilterInput(term);
    const filteredResults = usersData.filter(item => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(term.toLowerCase())
      );
    });

    setFilteredData(filteredResults);
  }

  return (
    <Fragment>
      <ToastContainer />

      {!screen ? (
        <>
          <div className="card">

            <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
              Users
              <div className="text-end">
                <Button
                  onClick={() => switchScreen(false)}
                  className="rounded-5 px-3 py-1 fa-13 shadow"
                >
                  {!screen ? "Add User" : "Back"}
                </Button>
              </div>
            </div>

            <div
              className="card-body overflow-scroll"
              style={{ maxHeight: "78vh" }}
            >

              <div className="d-flex justify-content-end">
                <div className="col-md-4 pb-2">
                  <input
                    type="search"
                    value={filterInput}
                    className="cus-inpt"
                    placeholder="Search"
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <Table className="">
                  <thead>
                    <tr>
                      <th className="fa-14">ID</th>
                      <th className="fa-14">Name</th>
                      <th className="fa-14">User Type</th>
                      <th className="fa-14">Mobile</th>
                      <th className="fa-14">Company</th>
                      <th className="fa-14">Branch</th>
                      <th className="fa-14">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredData && filteredData.length ? filteredData : filterInput === '' ? usersData : []).map((obj, index) => (
                      <tr key={index}>
                        <td className="fa-14">{obj.UserId}</td>
                        <td className="fa-14">{obj.Name}</td>
                        <td className="fa-14">{obj.UserType}</td>
                        <td className="fa-14">{obj.UserName}</td>
                        <td className="fa-14">{obj.Company_Name}</td>
                        <td className="fa-14">{obj.BranchName}</td>
                        <td className="fa-12" style={{ minWidth: "80px" }}>
                          <IconButton
                            onClick={() => { editRow(obj) }}
                            size="small"
                          >
                            <Edit className="fa-in" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              deleteRow(obj, true);
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
        </>
      ) : (
        <div className="card">
          <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
            {editUser ? "Edit User" : "Add User"}
            <div className="text-end">
              <Button
                onClick={() => {
                  switchScreen(false);
                }}
                className="rounded-5 px-3 py-1 fa-13 shadow"
              >
                Back
              </Button>
            </div>
          </div>
          <div className="card-body">

            <div className="row">

              <div className="col-lg-4 col-md-6 p-2">
                <label>Name</label>
                <input
                  className="cus-inpt"
                  value={inputValue.Name}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, Name: e.target.value })
                  }
                />
              </div>

              <div className="col-lg-4 col-md-6 p-2">
                <label>Password</label>
                <input
                  className="cus-inpt"
                  type="password"
                  value={inputValue.Password}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, Password: e.target.value })
                  }
                />
              </div>

              <div className="col-lg-4 col-md-6 p-2">
                <label>Mobile</label>
                <input
                  className="cus-inpt"
                  type={"number"}
                  value={inputValue.UserName}
                  maxLength={10}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, UserName: e.target.value })
                  }
                />
              </div>

              <div className="col-lg-4 col-md-6 p-2">
                <label>Branch</label>
                <select
                  className="cus-inpt"
                  value={inputValue.BranchId}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, BranchId: e.target.value })
                  }
                >
                  <option value={""}>select</option>
                  {userDropdown?.map((o, i) => (
                    <option key={i} value={o.BranchId}>
                      {o.BranchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-4 col-md-6 p-2">
                <label>User Type</label>
                <select
                  className="cus-inpt"
                  value={inputValue.UserTypeId}
                  onChange={(e) =>
                    setInputValue({ ...inputValue, UserTypeId: e.target.value })
                  }
                >
                  <option value=''>Select</option>
                  {dropdown?.map((o, i) => (
                    <option key={i} value={o.Id}>
                      {o.UserType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-end bg-white">
            <Button
              className="rounded-5 px-4 mx-1 btn-light bg-white"
              onClick={() => {
                switchScreen(false);
              }}
            >
              Back
            </Button>
            <Button
              className="rounded-5 px-4 shadow mx-1"
              onClick={editUser ? editUserFn : createUser}
            >
              {editUser ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <b style={{ color: "black", padding: "0px 20px" }}>
              Do you Want to Delete?
            </b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default Users;
