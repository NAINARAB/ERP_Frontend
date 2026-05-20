import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { fetchLink } from "../../Components/fetchComponent";
import { moment } from "moment";
import { Edit } from "@mui/icons-material";
const LeaveCalendar = ({
  currentView,
  onViewChange
}) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyLeaves, setMonthlyLeaves] = useState([]);
  const [filter, setFilter] = useState({
    FromDate: new Date().toISOString().split("T")[0],
    Description: "",
    display: 2,
    Created_By: "",
  });
  const [description, setDesctiption] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);
  const fetchLeaves = async () => {
    try {
      const res = await fetchLink({ address: `masters/defaultLeave` });
      if (res.success) {
        setAttendanceData(res.data);

        const currentMonth = calendarViewDate.getMonth();
        const currentYear = calendarViewDate.getFullYear();

        const filtered = res.data.filter((item) => {
          const itemDate = new Date(item.Date);
          return (
            itemDate.getMonth() === currentMonth &&
            itemDate.getFullYear() === currentYear
          );
        });

        setMonthlyLeaves(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);
  const closeDialg = () => {
    setAddDialog(false);
    setFilter({});
    setDesctiption("");
    setEditMode(false);
    setEditIndex(null);
  };

  const onsubmit = ({ filter, description }) => {
    const User_Id = parseData?.UserId;
    const bodyData = {
      FromDate: filter?.FromDate,
      Description: description,
      Created_By: User_Id,
    };

    fetchLink({
      address: `masters/addLeave`,
      method: "POST",
      bodyData,
    })
      .then((data) => {
        if (!data.success) {
          toast.error(data.message);
        } else {
          toast.success("Leave added successfully");
          setAddDialog(false);
          setFilter({
            FromDate: new Date().toISOString().split("T")[0],
            Description: "",
            display: 2,
            Created_By: 1,
          });
          setDesctiption("");
          fetchLeaves();
        }
      })
      .catch((e) => console.error(e));
  };

  const onUpdate = async ({ index, filter, description, id, Modified_By }) => {
    const updatedList = [...attendanceData];
    const User_Id = Number(parseData?.UserId);

    const bodyData = {
      Id: id,
      FromDate: filter?.FromDate,
      Description: description,
      Modified_By: User_Id || Modified_By,
    };

    try {
      const data = await fetchLink({
        address: "masters/defaultLeave",
        method: "PUT",
        bodyData: bodyData,
      });

      if (data.success) {
        updatedList[index] = {
          ...updatedList[index],
          Date: filter.FromDate,
          Description: description,
        };

        setAttendanceData(updatedList);

        const currentMonth = calendarViewDate.getMonth();
        const currentYear = calendarViewDate.getFullYear();

        const filtered = updatedList.filter((item) => {
          const itemDate = new Date(item.Date);
          return (
            itemDate.getMonth() === currentMonth &&
            itemDate.getFullYear() === currentYear
          );
        });

        setMonthlyLeaves(filtered);
        closeDialg();
        toast.success("Leave updated successfully");
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating leave:", error);
      toast.error("Update failed: " + error.message);
    }
  };

  const formatForInputDate = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="d-flex flex-column">
      <Card>
        <CardContent sx={{ minHeight: "50vh" }}>
          <div className="d-flex align-items-center mb-3">
            {["default", "employee", "department", "defaultLeave"].map(
              (view) => (
                <Button
                  key={view}
                  size="small mx-2"
                  variant="outlined"
                  onClick={() => onViewChange(view)}
                  disabled={currentView === view}
                >
                  {view === "defaultLeave"
                    ? "Defined Leave"
                    : view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              )
            )}
          </div>
          <div className="ps-3 pb-2 pt-0 d-flex align-items-center justify-content-between border-bottom mb-3">
            <h6 className="fa-18">Leave Details</h6>
            <div>
              <select
                className="cus-inpt w-auto"
                value={filter?.display}
                disabled
                onChange={(e) =>
                  setFilter((pre) => ({
                    ...pre,
                    display: Number(e.target.value),
                  }))
                }
              >
                <option disabled value={2}>
                  Calendar
                </option>
                {/* <option value={1}>Table</option> */}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-5 mb-3">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h6 className="mb-0">Month Leave List</h6>
                </div>
                <div
                  className="card-body"
                  style={{ maxHeight: "800px", overflowY: "auto" }}
                >
                  {monthlyLeaves.length === 0 ? (
                    <p>No data</p>
                  ) : (
                    monthlyLeaves.map((item, index) => (
                      <div
                        key={index}
                        className="mb-2 border-bottom pb-2 position-relative"
                      >
                        <small>{item.Description}</small>
                        <br />
                        <small>Date: {formatDate(item.Date)}</small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8 col-md-7">
              <FullCalendar
                plugins={[
                  timeGridPlugin,
                  listPlugin,
                  dayGridPlugin,
                  interactionPlugin,
                ]}
                initialView="dayGridMonth"
                initialDate={new Date()}
                events={attendanceData.map((o) => ({
                  title: ` ${o?.Description}`,
                start: new Date(o?.Date).toISOString().split("T")[0],
                  objectData: o,
                }))}
                headerToolbar={{
                  left: "prev next",
                  center: "title",
                  right: "dayGridMonth",
                }}
                // slotDuration={"00:30:00"}
                // slotMinTime={"08:00:00"}
                // slotMaxTime={"22:00:00"}
                showNonCurrentDates={false}
                editable={false}
                selectable
                selectMirror
                height={800}
                eventClick={(eventInfo) => {
                  const leave = eventInfo.event.extendedProps.objectData;
                  const date = leave?.Date;

                  const index = attendanceData.findIndex(
                    (item) =>
                      item.Date === date &&
                      item.Description === leave.Description
                  );

                  setEditMode(true);
                  setEditIndex(index);
                  setFilter({ FromDate: date });
                  setDesctiption(leave.Description);
                  setAddDialog(true);
                }}
                dateClick={(info) => {
                  setSelectedDate(info.dateStr);
                  setFilter({ ...filter, FromDate: info.dateStr });
                  setAddDialog(true);
                }}
                datesSet={(date) => {
                  const viewDate = new Date(date.start);
                  setCalendarViewDate(viewDate);

                  const currentMonth = viewDate.getMonth();
                  const currentYear = viewDate.getFullYear();

                  const filtered = attendanceData.filter((item) => {
                    const itemDate = new Date(item.Date);
                    
                    return (
                      itemDate.getMonth() === currentMonth &&
                      itemDate.getFullYear() === currentYear
                    );
                  });

                  setMonthlyLeaves(filtered);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addDialog} onClose={closeDialg} fullWidth maxWidth="sm">
        <DialogTitle className="d-flex justify-content-between">
          <span> {editMode ? "UPDATE" : "ADD"}</span>
          <IconButton onClick={closeDialg}>
            <Close sx={{ color: "black" }} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <div className="table-responsive pb-4">
            <table className="table">
              <tbody>
                <tr>
                  <td>From</td>
                  <td>
                    <input
                      type="date"
                      className="cus-inpt"
                      value={formatForInputDate(filter?.FromDate || "")}
                      onChange={(e) =>
                        setFilter({ ...filter, FromDate: e.target.value })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>
                    <input
                      type="text"
                      className="cus-inpt"
                      value={description}
                      onChange={(e) => setDesctiption(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialg}>Cancel</Button>

          <Button
            onClick={() => {
              if (editMode) {
            
                const currentRow = attendanceData[editIndex];
                const id = currentRow?.SNo;
                const User_Id = parseData?.UserId;
                onUpdate({
                  index: editIndex,
                  filter,
                  description,
                  id,
                  User_Id,
                });
              } else {
                onsubmit({ filter, description });
              }
            }}
          >
            {editMode ? "UPDATE" : "ADD"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeaveCalendar;
