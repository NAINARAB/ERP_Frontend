import React, { useState, useEffect, Fragment } from "react";
import { Button } from "react-bootstrap";
import api from "../../API";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Card, CardContent } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from 'react-data-table-component'

const initialState = {
    UserId: "",
    Name: "",
    UserName: "",
    UserTypeId: "",
    Password: "",
    BranchId: '',
    Company_Id: "",
};

const Users = () => {
    const [usersData, setUsersData] = useState([]);
    const [screen, setScreen] = useState(false);
    const parseData = JSON.parse(localStorage.getItem("user"));
    const [reload, setReload] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [dialog, setDialog] = useState(false);

    const [filterInput, setFilterInput] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const [userTypeDropDown, setUserTypeDropDown] = useState([]);
    const [userDropdown, setuserDropdown] = useState([]);
    const [companyData, setCompanyData] = useState([]);


    useEffect(() => {
        fetch(`${api}users?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}&Branch_Id=${2}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    data?.data?.sort((a, b) => a.Name.localeCompare(b.Name));
                    setUsersData(data.data);
                }
            }).catch(e => console.error(e))
    }, [reload]);

    useEffect(() => {
        fetch(`${api}userType`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUserTypeDropDown(data.data);
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

        fetch(`${api}companyDropDown?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCompanyData(data.data);
                }
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);

    const switchScreen = () => {
        setInputValue(initialState);
        setScreen(pre => !pre);
    };

    const saveUser = () => {
        fetch(`${api}users`, {
            method: inputValue.UserId ? 'PUT' : 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inputValue),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setReload(!reload);
                    toast.success(data.message);
                    switchScreen();
                } else {
                    toast.error(data.message);
                }
            });
    };

    const editRow = (user) => {
        const { UserId, Name, UserName, UserTypeId, Password, BranchId, Company_id } = user;
        setInputValue({ UserId, Name, UserName, UserTypeId, Password, BranchId, Company_Id: Company_id });
        setScreen(true);
    };

    const handleDeleteConfirm = () => {
        fetch(`${api}users`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                UserId: inputValue.UserId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setReload(!reload);
                    setDialog(pre => !pre);
                    setInputValue(initialState);
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
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

            <Card>
                <div className="px-3 py-2 fw-bold d-flex align-items-center justify-content-between border-bottom">
                    USERS
                    <div className="text-end">
                        <Button
                            onClick={switchScreen}
                            className="rounded-5 px-3 py-1 fa-13 shadow"
                        >
                            {!screen ? "Add User" : "Back"}
                        </Button>
                    </div>
                </div>

                <CardContent>


                    {!screen ? (
                        <>
                            <div className="d-flex justify-content-end">
                                <div className=" pb-2">
                                    <input
                                        value={filterInput}
                                        className="cus-inpt w-auto"
                                        placeholder="Search"
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <DataTable
                                data={filterInput ? filteredData.length > 0 ? filteredData : [] : usersData}
                                columns={[
                                    {
                                        name: 'Name',
                                        selector: val => val.Name,
                                        sortable: true,
                                    },
                                    {
                                        name: 'Type',
                                        selector: val => val.UserType,
                                        sortable: true,
                                    },
                                    {
                                        name: 'Mobile',
                                        selector: val => val.UserName,
                                        sortable: false,
                                    },
                                    {
                                        name: 'Company',
                                        selector: val => val.Company_Name,
                                        sortable: true,
                                    },
                                    {
                                        name: 'Company',
                                        selector: val => val.BranchName,
                                        sortable: true,
                                    },
                                    {
                                        name: 'Action',
                                        cell: val => (
                                            <>
                                                <IconButton
                                                    onClick={() => { editRow(val) }}
                                                    size="small"
                                                >
                                                    <Edit className="fa-in" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        const { UserId, Name, UserName, UserTypeId, Password, BranchId, Company_id } = val;
                                                        setInputValue({ UserId, Name, UserName, UserTypeId, Password, BranchId, Company_Id: Company_id });
                                                        setDialog(true);
                                                    }}
                                                    size="small"
                                                >
                                                    <Delete className="fa-in del-red" />
                                                </IconButton>
                                            </>
                                        )
                                    },
                                ]}
                                direction="auto"
                                fixedHeader
                                fixedHeaderScrollHeight="63dvh"
                                highlightOnHover
                                pagination
                                responsive
                                striped
                                subHeaderAlign="right"
                                subHeaderWrap
                            />
                        </>
                    ) : (
                        <>
                            <form onSubmit={e => {
                                e.preventDefault();
                                saveUser();
                            }}>
                                <div className="row p-3">

                                    <div className="col-lg-4 col-md-6 p-2">
                                        <label>Name</label>
                                        <input
                                            className="cus-inpt"
                                            value={inputValue.Name}
                                            required
                                            minLength={3}
                                            onChange={e =>
                                                setInputValue({ ...inputValue, Name: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="col-lg-4 col-md-6 p-2">
                                        <label>Password</label>
                                        <input
                                            className="cus-inpt"
                                            type="password"
                                            required
                                            minLength={6}
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
                                            required
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
                                            required
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
                                        <label>Company</label>
                                        <select
                                            className="cus-inpt"
                                            value={inputValue.Company_Id}
                                            required
                                            onChange={(e) =>
                                                setInputValue({ ...inputValue, Company_Id: e.target.value })
                                            }
                                        >
                                            <option value={""}>select</option>
                                            {companyData?.map((o, i) => (
                                                <option key={i} value={o.ID}>
                                                    {o.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-lg-4 col-md-6 p-2">
                                        <label>User Type</label>
                                        <select
                                            className="cus-inpt"
                                            value={inputValue.UserTypeId}
                                            required
                                            onChange={(e) =>
                                                setInputValue({ ...inputValue, UserTypeId: e.target.value })
                                            }
                                        >
                                            <option value=''>Select</option>
                                            {userTypeDropDown?.map((o, i) => (
                                                <option key={i} value={o.Id}>
                                                    {o.UserType}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="pe-3 d-flex justify-content-end">
                                    <Button
                                        className="rounded-5 px-4 mx-1 btn-light bg-white"
                                        onClick={switchScreen}
                                        type='button'
                                    >
                                        cancel
                                    </Button>
                                    <Button
                                        className="rounded-5 px-4 shadow mx-1"
                                        type='submit'
                                    >
                                        {inputValue.UserId ? "Update" : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                fullWidth maxWidth='sm'
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b className="text-muted">
                        Do you want to Delete the user <span className="blue-text">{inputValue.Name}</span>?
                    </b>
                </DialogContent>
                <DialogActions>
                    <Button
                        className=" btn-light"
                        onClick={() => {
                            setDialog(false);
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
