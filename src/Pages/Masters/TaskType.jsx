import React, { useState, useEffect, Fragment } from "react";
import { Table } from "react-bootstrap";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import api from "../../API";

function TaskType() {
  const [TaskTypeData, setTaskTypeData] = useState([]);
  const localData = localStorage.getItem("loginResponse");
  const parseData = JSON.parse(localData);
  useEffect(() => {
    fetch(`${api}taskType`)
      .then((res) => res.json())
      .then((data) => {
        console.log("hi, hello, how ");
        if (data.success) {
          console.table(data.data);
          setTaskTypeData(data.data);
        }
      });
  }, []);

  return (
    <Fragment>
      <div className="table-responsive">
        {TaskTypeData.map((obj, index) => (
          <Chip key={index} label={obj.Task_Type} onDelete={() => {}} />
        ))}
      </div>
    </Fragment>
  );
}

export default TaskType;
