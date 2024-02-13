import React, { useState, useEffect, Fragment } from "react";
import { Table } from "react-bootstrap";
import api from "../../API";

function ProjectList() {
  const [projectData, setProjectData] = useState([]);
  const localData = localStorage.getItem("loginResponse");
  const parseData = JSON.parse(localData);
  useEffect(() => {
    fetch(`${api}project`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.table(data.data);
          setProjectData(data.data);
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
              <th style={{ fontSize: "14px" }}>Name</th>
              <th style={{ fontSize: "14px" }}>Base Group</th>
              <th style={{ fontSize: "14px" }}>Project Head</th>
              <th style={{ fontSize: "14px" }}>Start Date</th>
              <th style={{ fontSize: "14px" }}>End Date</th>
            </tr>
          </thead>
          <tbody>
            {projectData.map((obj, item) => (
              <tr key={item}>
                <td style={{ fontSize: "12px" }}>{obj.Project_Id}</td>
                <td style={{ fontSize: "12px" }}>{obj.Project_Name}</td>
                <td style={{ fontSize: "12px" }}>{obj.Base_Group_Name}</td>
                <td style={{ fontSize: "12px" }}>{obj.Project_Head_Name}</td>
                <td style={{ fontSize: "12px" }}>
                  {new Date(obj.Est_Start_Dt).toLocaleDateString("en-IN")}
                </td>
                <td style={{ fontSize: "12px" }}>
                  {new Date(obj.Est_End_Dt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Fragment>
  );
}

export default ProjectList;
