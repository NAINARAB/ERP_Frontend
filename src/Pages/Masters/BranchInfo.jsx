import React, { useState, useEffect, Fragment } from "react";
import { Table } from "react-bootstrap";
import api from "../../API";

function BranchInfo() {
  const [branchData, setBranchData] = useState([]);
  const localData = localStorage.getItem("loginResponse");
  const parseData = JSON.parse(localData);
  useEffect(() => {
    fetch(
      `${api}branch?User_Id=${parseData.data.userId}&Company_id=${parseData.data.Company_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.table(data.data);
          setBranchData(data.data);
        }
      });
  }, []);

  return (
    <Fragment>
      <div className="table-responsive">
        <Table className="">
          <thead>
            <tr>
              <th style={{ fontSize: "14px" }}>ID</th>
              <th style={{ fontSize: "14px" }}>Code</th>
              <th style={{ fontSize: "14px" }}>Branch</th>
              <th style={{ fontSize: "14px" }}>Phone</th>
              <th style={{ fontSize: "14px" }}>State</th>
              <th style={{ fontSize: "14px" }}>City</th>
              <th style={{ fontSize: "14px" }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {branchData.map((obj, item) => (
              <tr key={item}>
                <td style={{ fontSize: "12px" }}>{obj.Company_id}</td>
                <td style={{ fontSize: "12px" }}>{obj.BranchCode}</td>
                <td style={{ fontSize: "12px" }}>{obj.BranchName}</td>
                <td style={{ fontSize: "12px" }}>{obj.BranchTel1}</td>
                <td style={{ fontSize: "12px" }}>{obj.State}</td>
                <td style={{ fontSize: "12px" }}>{obj.BranchCity}</td>
                <td style={{ fontSize: "12px" }}>{obj.BranchAddress}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Fragment>
  );
}

export default BranchInfo;
