import React, { useState, useEffect, Fragment } from "react";
import { Button, Table } from "react-bootstrap";
import api from "../../API";
import { IconButton } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { json } from "react-router-dom";

function Users() {
  const [usersData, setUsersData] = useState([]);
  const [screen, serScreen] = useState(false);
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const [dropdown, setDropDown] = useState([]);
  const [userDropdown, setuserDropdown] = useState([]);

  const [reload, setReload] = useState(false);
  const [inptValue, setInptValue] = useState({
    Id: "",
    Name: "",
    UserName: "",
    UserTypeId: "",
    Password: "",
    BranchId: "",
  });

  useEffect(() => {
    fetch(
      `${api}users?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}&Branch_Id=${parseData?.BranchId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(data.data);
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
    fetch(
      `${api}branch?User_Id=${parseData.UserId}&Company_id=${parseData.Company_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setuserDropdown(data.data);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  const validation = () => {
    if (!inptValue.Name) {
      return "Name is  required";
    }

    if (!inptValue.UserName) {
      return "Mobile number is required";
    }

    if (!inptValue.Password) {
      return "Password is required";
    }

    if (!inptValue.BranchId) {
      return "Select Branch";
    }

    if (!inptValue.UserTypeId) {
      return "Select User Type";
    }

    return "Success";
  };

  // post
  const createUser = () => {
    if (validation() === "Success") {
      fetch(`${api}users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: inptValue.Name,
          UserName: inptValue.UserName,
          UserTypeId: inptValue.UserTypeId,
          Password: inptValue.Password,
          BranchId: inptValue.BranchId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log(data.data);
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
        });
    } else {
      toast.error(validation());
    }
  };

  const clearValues = () => {
    setInptValue({
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
    serScreen(!screen);
  };


  const [editUser, setEditUser] = useState(false);
  const editRow = (user) => {
    
    console.log(user.Name)
    setEditUser(true);
    setInptValue({
      Id: user.UserId,
      Name: user.Name,
      UserName: user.UserName,
      UserTypeId: user.UserTypeId,
      Password: user.Password,
      BranchId: user.BranchId,
    });
    serScreen(true);
  };

  return (
    <Fragment>
      <ToastContainer />
      <div className="float-end">
        <Button onClick={switchScreen}>{screen ? "back" : "Add"}</Button>
      </div>
      <br />
      <br />
      {!screen ? (
        <div className="table-responsive">
          <Table>
            <thead>
              <tr>
                <th style={{ fontSize: "14px" }}>ID</th>
                <th style={{ fontSize: "14px" }}>Name</th>
                <th style={{ fontSize: "14px" }}>User Type</th>
                <th style={{ fontSize: "14px" }}>Mobile</th>
                <th style={{ fontSize: "14px" }}>Company</th>
                <th style={{ fontSize: "14px" }}>Branch</th>
                <th style={{ fontSize: "14px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((obj, item) => (
                <tr key={item}>
                  <td style={{ fontSize: "12px" }}>{obj.UserId}</td>
                  <td style={{ fontSize: "12px" }}>{obj.Name}</td>
                  <td style={{ fontSize: "12px" }}>{obj.UserType}</td>
                  <td style={{ fontSize: "12px" }}>{obj.UserName}</td>
                  <td style={{ fontSize: "12px" }}>{obj.Company_Name}</td>
                  <td style={{ fontSize: "12px" }}>{obj.BranchName}</td>
                  <td style={{ fontSize: "12px" }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        editRow(obj);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Delete sx={{ color: "#FF6865" }} />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-white">
            {editUser ? "Edit User" : "Add Employee"}
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-4 p-2">
                <label>Name</label>
                <input
                  className="form-control"
                  value={inptValue.Name}
                  onChange={(e) =>
                    setInptValue({ ...inptValue, Name: e.target.value })
                  }
                />
              </div>
              <div className="col-lg-4 p-2">
                <label>Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={inptValue.Password}
                  onChange={(e) =>
                    setInptValue({ ...inptValue, Password: e.target.value })
                  }
                />
              </div>
              <div className="col-lg-4 p-2">
                <label>Mobile</label>
                <input
                  className="form-control"
                  type={"tel"}
                  value={inptValue.UserName}
                  onChange={(e) =>
                    setInptValue({ ...inptValue, UserName: e.target.value })
                  }
                />
              </div>
              <div className="col-lg-4 p-2">
                <label>Branch</label>
                <select
                  className="form-control"
                  value={inptValue.BranchId}
                  onChange={(e) =>
                    setInptValue({ ...inptValue, BranchId: e.target.value })
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
              <div className="col-lg-4 p-2">
                <label>User Type</label>
                <select
                  className="form-control"
                  value={inptValue.UserTypeId}
                  onChange={(e) =>
                    setInptValue({ ...inptValue, UserTypeId: e.target.value })
                  }
                >
                  <option value={1}>select</option>
                  {/* <option value="2">admin</option> */}
                  {dropdown?.map((o, i) => (
                    <option key={i} value={o.Id}>
                      {o.UserType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <Button
              className="px-2"
              onClick={() => {
                // switchScreen;
                createUser();
              }}
            >
              {!editUser ? "Create User" : "Edit User"}
            </Button>
            {editUser && (
              <Button
                className="px-2 ms-2"
                variant="secondary"
                onClick={() => setEditUser(null)}
              >
                Cancel Edit
              </Button>
            )}  
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default Users;
