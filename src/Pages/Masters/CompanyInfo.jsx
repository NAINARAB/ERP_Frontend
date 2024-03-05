import React, { Fragment, useEffect, useState, useContext } from "react";
import Table from "react-bootstrap/Table";
import api from "../../API";
import { Button } from "react-bootstrap";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button as MuiButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";

const initialState = {
  Company_Code: '',
  Company_Name: '',
  Company_Address: '',
  State: '',
  Region: '',
  Pincode: '',
  Country: '',
  VAT_TIN_Number: '',
  PAN_Number: '',
  CST_Number: '',
  CIN_Number: '',
  Service_Tax_Number: '',
  MSME_Number: '',
  NSIC_Number: '',
  Account_Number: '',
  IFC_Code: '',
  Bank_Branch_Name: '',
  Bank_Name: '',
  Telephone_Number: '',
  Support_Number: '',
  Mail: '',
  Website: '',
  Gst_number: '',
  State_Code: '',
  State_No: '',
};

function CompanyInfo() {
  const [companyData, setCompanyData] = useState([]);
  const [screen, setScreen] = useState(false);
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const [reload, setReload] = useState(false);
  const [inputValue, setInputValue] = useState(initialState);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { contextObj } = useContext(MyContext)

  useEffect(() => {
    fetch(
      `${api}company?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCompanyData(data.data);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [reload]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  const switchScreen = (scr) => {
    setInputValue(initialState)
    setScreen(!screen);
    setIsEdit(scr); setSelectedRow(null)
  }

  const setEditRow = (row) => {
    switchScreen(true); setSelectedRow(row);
    const fieldsToInclude = ['Company_Code', 'Company_Name', 'Company_Address', 'State', 'Region', 'Pincode', 'Country',
      'VAT_TIN_Number', 'PAN_Number', 'CST_Number', 'CIN_Number', 'Service_Tax_Number', 'MSME_Number', 'NSIC_Number',
      'Account_Number', 'IFC_Code', 'Bank_Branch_Name', 'Bank_Name', 'Telephone_Number', 'Support_Number', 'Mail',
      'Website', 'Gst_number', 'State_Code', 'State_No',];
    const filteredRow = Object.keys(row).reduce((acc, key) => {
      if (fieldsToInclude.includes(key)) {
        acc[key] = row[key];
      }
      return acc;
    }, {});
    setInputValue(filteredRow);
  }

  const setDeleteRow = (row, stat) => {
    setDeleteDialog(!deleteDialog);
    if (stat === true) {
      setSelectedRow(row);
    } else {
      setSelectedRow({});
    }
  }

  const createFun = () => {
    const postObj = {
      Company_Code: inputValue?.Company_Code,
      Company_Name: inputValue?.Company_Name,
      Company_Address: inputValue?.Company_Address,
      State: inputValue?.State,
      Region: inputValue?.Region,
      Pincode: inputValue?.Pincode,
      Country: inputValue?.Country,
      VAT_TIN_Number: inputValue?.VAT_TIN_Number,
      PAN_Number: inputValue?.PAN_Number,
      CST_Number: inputValue?.CST_Number,
      CIN_Number: inputValue?.CIN_Number,
      Service_Tax_Number: inputValue?.Service_Tax_Number,
      MSME_Number: inputValue?.MSME_Number,
      NSIC_Number: inputValue?.NSIC_Number,
      Account_Number: inputValue?.Account_Number,
      IFC_Code: inputValue?.IFC_Code,
      Bank_Branch_Name: inputValue?.Bank_Branch_Name,
      Bank_Name: inputValue?.Bank_Name,
      Telephone_Number: inputValue?.Telephone_Number,
      Support_Number: inputValue?.Support_Number,
      Mail: inputValue?.Mail,
      Website: inputValue?.Website,
      Gst_number: inputValue?.Gst_number,
      State_Code: inputValue?.State_Code,
      State_No: inputValue?.State_No,
      Entry_By: parseData?.UserId,
    }
    fetch(`${api}company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(postObj)
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
    const postObj = {
      Company_id: selectedRow?.Company_id,
      Company_Code: inputValue?.Company_Code,
      Company_Name: inputValue?.Company_Name,
      Company_Address: inputValue?.Company_Address,
      State: inputValue?.State,
      Region: inputValue?.Region,
      Pincode: inputValue?.Pincode,
      Country: inputValue?.Country,
      VAT_TIN_Number: inputValue?.VAT_TIN_Number,
      PAN_Number: inputValue?.PAN_Number,
      CST_Number: inputValue?.CST_Number,
      CIN_Number: inputValue?.CIN_Number,
      Service_Tax_Number: inputValue?.Service_Tax_Number,
      MSME_Number: inputValue?.MSME_Number,
      NSIC_Number: inputValue?.NSIC_Number,
      Account_Number: inputValue?.Account_Number,
      IFC_Code: inputValue?.IFC_Code,
      Bank_Branch_Name: inputValue?.Bank_Branch_Name,
      Bank_Name: inputValue?.Bank_Name,
      Telephone_Number: inputValue?.Telephone_Number,
      Support_Number: inputValue?.Support_Number,
      Mail: inputValue?.Mail,
      Website: inputValue?.Website,
      Gst_number: inputValue?.Gst_number,
      State_Code: inputValue?.State_Code,
      State_No: inputValue?.State_No,
      Entry_By: parseData?.UserId,
    }
    fetch(`${api}company`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(postObj)
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

  const deleteFun = () => {
    fetch(`${api}company`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ Company_id: selectedRow?.Company_id })
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          setReload(!reload);
          toast.success(data.message); setSelectedRow({});
        } else {
          toast.error(data.message);
        }
      })
  }

  return Number(contextObj.Read_Rights) === 1 ? (
    <Fragment>
      <ToastContainer />
      <div className="d-flex justify-content-end mb-2">
        <Button onClick={() => switchScreen(false)} className="rounded-5 px-4 shadow">{!screen ? 'Add Company' : 'Back'}</Button>
      </div>
      {!screen ? (
        <div className="table-responsive ">
          <Table className="">
            <thead>
              <tr>
                <th className="fa-14">ID</th>
                <th className="fa-14">Code</th>
                <th className="fa-14">Name</th>
                <th className="fa-14">Region</th>
                <th className="fa-14">State</th>
                <th className="fa-14">Pincode</th>
                {(Number(contextObj?.Edit_Rights) === 1 || Number(contextObj?.Delete_Rights) === 1) && <th className="fa-14">Action</th>}
              </tr>
            </thead>
            <tbody>
              {companyData.map((obj, index) => (
                <tr key={index}>
                  <td className="fa-12">{obj.Company_id}</td>
                  <td className="fa-12">{obj.Company_Code}</td>
                  <td className="fa-12">{obj.Company_Name}</td>
                  <td className="fa-12">{obj.Region}</td>
                  <td className="fa-12">{obj.State}</td>
                  <td className="fa-12">{obj.Pincode}</td>
                  {(Number(contextObj?.Edit_Rights) === 1 || Number(contextObj?.Delete_Rights) === 1) && (
                    <td className="fa-12" style={{ minWidth: '80px' }}>
                      {Number(contextObj?.Edit_Rights) === 1 && (
                        <IconButton onClick={() => { setEditRow(obj) }} size='small'><Edit className="fa-in" /></IconButton>
                      )}
                      {Number(contextObj?.Delete_Rights) === 1 && (
                        <IconButton onClick={() => { setDeleteRow(obj, true) }} size='small'><Delete className="fa-in del-red" /></IconButton>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="card mb-4">
          <div className="card-header bg-white">
            {isEdit ? 'Edit Company' : 'Add Company'}
          </div>
          <div className="card-body row">
            {Object.entries(inputValue).map(([key, val]) => (
              <div key={key} className="col-lg-4 col-md-6 p-2">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  className="cus-inpt"
                  type="text"
                  name={key}
                  value={val}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
          <div className="card-footer d-flex justify-content-end">
            <Button onClick={() => switchScreen(false)} className="rounded-5 px-4 mx-1 btn-light">{'Back'}</Button>
            <Button onClick={isEdit ? editFun : createFun} className="rounded-5 px-4 shadow mx-1">{isEdit ? 'Update' : 'Create Company'}</Button>
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
            <b  >{`Do you want to delete the ${selectedRow?.Company_Name} Company?`}</b>
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

export default CompanyInfo;
