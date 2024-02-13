import React, { Fragment, useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import api from "../../API";
import { Button } from "react-bootstrap";

function CompanyInfo() {
  const [companyData, setCompanyData] = useState([]);
  const [screen, setScreen] = useState(false);
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  console.log(parseData);
  useEffect(() => {
    fetch(
      `${api}company?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.table(data.data);
          setCompanyData(data.data);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <Fragment>
      <Button onClick={() => setScreen(!screen)}>{}</Button>
      {screen ? (
        <div className="table-responsive ">
          <Table className="">
            <thead>
              <tr>
                <th style={{ fontSize: "14px" }}>ID</th>
                <th style={{ fontSize: "14px" }}>Code</th>
                <th style={{ fontSize: "14px" }}>Name</th>
                <th style={{ fontSize: "14px" }}>Region</th>
                <th style={{ fontSize: "14px" }}>State</th>
                <th style={{ fontSize: "14px" }}>Pincode</th>
              </tr>
            </thead>
            <tbody>
              {companyData.map((obj, item) => (
                <tr key={item}>
                  <td style={{ fontSize: "12px" }}>{obj.Company_Code}</td>
                  <td style={{ fontSize: "12px" }}>{obj.Company_id}</td>
                  <td style={{ fontSize: "12px" }}>{obj.Company_Name}</td>
                  <td style={{ fontSize: "12px" }}>{obj.Region}</td>
                  <td style={{ fontSize: "12px" }}>{obj.State}</td>
                  <td style={{ fontSize: "12px" }}>{obj.Pincode}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div>hi</div>
      )}
    </Fragment>
  );
}

export default CompanyInfo;
