import React, { useState, useEffect, Fragment, useContext } from "react";
import { Table, Button } from "react-bootstrap";
import api from "../../API";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button as MuiButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";

const initialState = {
  BranchId: '',
  Company_id: '',
  BranchCode: '',
  BranchName: '',
  Tele_Code: '',
  Tele1_Code: '',
  BranchTel: '',
  BranchTel1: '',
  BranchAddress: '',
  E_Mail: '',
  BranchIncharge: '',
  BranchIncMobile: '',
  BranchCity: '',
  Pin_Code: '',
  State: '',
  BranchCountry: '',
  Entry_By: '',
};

function onlynum(e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
}

function BranchInfo() {
  const [branchData, setBranchData] = useState([]);
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const [inputValue, setInputValue] = useState(initialState);
  const [reload, setReload] = useState(false);
  const [company, setCompany] = useState([])
  const [screen, setScreen] = useState(false)
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { contextObj } = useContext(MyContext);

  useEffect(() => {
    fetch(
      `${api}branch?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBranchData(data.data);
        }
      });
  }, [reload]);

  useEffect(() => {
    fetch(`${api}companyDropDown`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCompany(data.data)
        }
      }).catch(e => console.log(e))
  }, [])

  const input = [
    {
      label: 'Company',
      elem: 'select',
      options: [...company.map(obj => ({ value: obj.ID, label: obj.Name }))],
      event: (e) => setInputValue({ ...inputValue, Company_id: e.target.value }),
      required: true,
      value: inputValue?.Company_id,
    },
    {
      label: 'Branch Name',
      elem: 'input',
      type: 'text',
      placeholder: "Enter Branch Name",
      event: (e) => setInputValue({ ...inputValue, BranchName: e.target.value }),
      required: true,
      value: inputValue?.BranchName,
    },
    {
      label: 'Branch Code',
      elem: 'input',
      type: 'text',
      placeholder: "Enter Branch Name",
      event: (e) => setInputValue({ ...inputValue, BranchCode: e.target.value }),
      required: true,
      value: inputValue?.BranchCode,
    },
    {
      label: 'Tele Code 1',
      elem: 'input',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, Tele_Code: e.target.value }),
      required: true,
      value: inputValue?.Tele_Code,
    },
    {
      label: 'Branch Telephone 1',
      elem: 'input',
      oninput: (e) => onlynum(e),
      event: (e) => setInputValue({ ...inputValue, BranchTel: e.target.value }),
      required: true,
      value: inputValue?.BranchTel,
    },
    {
      label: 'Tele Code 2',
      elem: 'input',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, Tele1_Code: e.target.value }),
      required: true,
      value: inputValue?.Tele1_Code,
    },
    {
      label: 'Branch Telephone 2',
      elem: 'input',
      oninput: (e) => onlynum(e),
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, BranchTel1: e.target.value }),
      required: true,
      value: inputValue?.BranchTel1,
    },
    {
      label: 'Email',
      elem: 'input',
      type: 'email',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, E_Mail: e.target.value }),
      required: true,
      value: inputValue?.E_Mail,
    },
    {
      label: 'Branch Incharge',
      elem: 'input',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, BranchIncharge: e.target.value }),
      required: true,
      value: inputValue?.BranchIncharge,
    },
    {
      label: 'Incharge Mobile',
      elem: 'input',
      oninput: (e) => onlynum(e),
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, BranchIncMobile: e.target.value }),
      required: true,
      value: inputValue?.BranchIncMobile,
    },
    {
      label: 'City',
      elem: 'input',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, BranchCity: e.target.value }),
      required: true,
      value: inputValue?.BranchCity,
    },
    {
      label: 'PinCode',
      elem: 'input',
      oninput: (e) => onlynum(e),
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, Pin_Code: e.target.value }),
      required: true,
      value: inputValue?.Pin_Code,
    },
    {
      label: 'State',
      elem: 'input',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, State: e.target.value }),
      required: true,
      value: inputValue?.State,
    },
    {
      label: 'Country',
      elem: 'input',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, BranchCountry: e.target.value }),
      required: true,
      value: inputValue?.BranchCountry,
    },
    {
      label: 'Address',
      elem: 'textarea',
      type: 'text',
      placeholder: "",
      event: (e) => setInputValue({ ...inputValue, BranchAddress: e.target.value }),
      required: true,
      value: inputValue?.BranchAddress,
    },
  ]

  const switchScreen = () => {
    setInputValue(initialState)
    setScreen(!screen); setIsEdit(false)
  }

  const createFun = () => {
    fetch(`${api}branch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(inputValue)
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          switchScreen(false);
          setReload(!reload)
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      })
  }

  const editFun = () => {
    fetch(`${api}branch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(inputValue)
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          switchScreen();
          setReload(!reload)
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      })
  }

  const setEditRow = (row) => {
    switchScreen(true); setInputValue(row); setIsEdit(true)
  }

  const setDeleteRow = (row) => {
    setDeleteDialog(!deleteDialog); setInputValue(row);
  }

  const deleteFun = () => {
    fetch(`${api}branch`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ BranchID: inputValue?.BranchId })
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          setReload(!reload);
          toast.success(data.message); setInputValue(initialState); setDeleteDialog(false)
        } else {
          toast.error(data.message);
        }
      })
  }

  return Number(contextObj?.Read_Rights) === 1 ? (
    <Fragment>
      <ToastContainer />
      {!screen ? (
        <div className="card">
          <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
            Branches
            <div className="text-end">
              <Button onClick={() => switchScreen(false)} className="rounded-5 px-3 py-1 fa-13 shadow">Create Branch</Button>
            </div>
          </div>
          <div className="card-body overflow-scroll" style={{ maxHeight: '78vh' }}>
            <div className="table-responsive">
              <Table className="">
                <thead>
                  <tr>
                    <th className="fa-14">ID</th>
                    <th className="fa-14">Code</th>
                    <th className="fa-14">Branch</th>
                    <th className="fa-14">Phone</th>
                    <th className="fa-14">State</th>
                    <th className="fa-14">City</th>
                    <th className="fa-14">Address</th>
                    {(Number(contextObj?.Edit_Rights) === 1 || Number(contextObj?.Delete_Rights) === 1) && <th className="fa-14">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {branchData.map((obj, item) => (
                    <tr key={item}>
                      <td className="fa-12">{obj.Company_id}</td>
                      <td className="fa-12">{obj.BranchCode}</td>
                      <td className="fa-12">{obj.BranchName}</td>
                      <td className="fa-12">{obj.BranchTel1}</td>
                      <td className="fa-12">{obj.State}</td>
                      <td className="fa-12">{obj.BranchCity}</td>
                      <td className="fa-12">{obj.BranchAddress}</td>
                      {(Number(contextObj?.Edit_Rights) === 1 || Number(contextObj?.Delete_Rights) === 1) && (
                        <td>
                          {Number(contextObj?.Edit_Rights) === 1 && (
                            <IconButton onClick={() => { setEditRow(obj) }} size='small'>
                              <Edit className="fa-in" />
                            </IconButton>
                          )}
                          {Number(contextObj?.Delete_Rights) === 1 && (
                            <IconButton onClick={() => { setDeleteRow(obj) }} size='small'>
                              <Delete className="fa-in del-red" />
                            </IconButton>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
            {isEdit ? 'Edit Branch' : 'Create Branch'}
            <div className="text-end">
              <Button onClick={() => { switchScreen(false) }} className="rounded-5 px-3 py-1 fa-13 shadow">Back</Button>
            </div>
          </div>
          {/* <div className="card-header bg-white fw-bold">
            {isEdit ? 'Edit Branch' : 'Create Branch'}
          </div> */}
          <div className="card-body">
            <div className="row">
              {input.map((field, index) => (
                <div key={index} className="col-lg-4 col-md-6 p-2 px-3">
                  <label>{field.label}</label>
                  {field.elem === 'input' ? (
                    <input
                      type={field.type || 'text'}
                      className={'cus-inpt'}
                      onChange={field.event}
                      onInput={field.oninput}
                      disabled={field.disabled}
                      value={field.value}

                    />
                  ) : field.elem === 'select' ? (
                    <select
                      className={'cus-inpt'}
                      onChange={field.event}
                      value={field.value}>
                      <option value={''}>select</option>
                      {field.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option.value} disabled={option.disabled} defaultValue={option.selected}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.elem === 'textarea' ? (
                    <textarea
                      className={'cus-inpt'}
                      onChange={field.event}
                      rows={4} value={field.value}>
                    </textarea>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer d-flex justify-content-end bg-white">
            <Button onClick={() => { switchScreen(false) }} className="rounded-5 px-4 mx-1 btn-light bg-white">{'Cancel'}</Button>
            <Button onClick={isEdit ? editFun : createFun} className="rounded-5 px-4 shadow mx-1">{isEdit ? 'Update' : 'Create Branch'}</Button>
          </div>
        </div>
      )}


      <Dialog
        open={deleteDialog}
        onClose={setDeleteRow}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <b  >{`Do you want to delete the ${inputValue?.BranchName && inputValue?.BranchName} Branch?`}</b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={setDeleteRow}>Cancel</MuiButton>
          <MuiButton onClick={deleteFun} autoFocus sx={{ color: 'red' }}>
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>

    </Fragment>
  ) : <InvalidPageComp />
}

export default BranchInfo;
