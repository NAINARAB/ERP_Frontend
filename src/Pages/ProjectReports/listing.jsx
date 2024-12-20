import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tab,
  Chip,
  Typography,
  Box
} from '@mui/material';
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ISOString } from "../../Components/functions";

function ListingTask({ dialogOpen, setDialogOpen, projectid, reload, onReload, selectedProject }) {

  const [taskData, setTaskData] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user'));
  const companyId = userData?.Company_id;


  const [filters, setFilters] = useState({
    startDate: ISOString() || new Date().toISOString().split('T')[0]
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaskEmployees, setSelectedTaskEmployees] = useState([]);
  const [selectedTaskName, setSelectedTaskName] = useState('');

  const [selectedTab, setSelectedTab] = useState('1');
  const [scheduleTypes, setScheduleTypes] = useState([]);

  const [parsedTaskDetails, setParsedTaskDetails] = useState([]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (employees, taskName) => {
    setSelectedTaskEmployees(employees);
    setSelectedTaskName(taskName);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTaskEmployees([]);
    setSelectedTaskName('');
  };

  const Schtype = async () => {
    fetchLink({ address: `taskManagement/project/schedule/newscheduleType` }).then((data) => {
      if (data.success) {
        setScheduleTypes(data.data);
      } else {
        toast.error(data.message);
      }
    });
  };

  useEffect(() => {
    if (taskData.length > 0 && taskData[0].TaskDetails) {
      try {
        const taskDetails = JSON.parse(taskData[0].TaskDetails);
        setParsedTaskDetails(taskDetails);
      } catch (error) {
        console.error("Error parsing TaskDetails:", error);
      }
    }
  }, [taskData]);




  useEffect(() => {
    Schtype();
  }, [projectid]);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!filters.startDate || filters.startDate === '') {
        setFilters({ ...filters, startDate: new Date().toISOString().split('T')[0] });
      }

      try {
        const response = await fetchLink({
          address: `taskManagement/project/schedule/projectDetailsforReport?Project_Id=${projectid}&StartDate=${filters.startDate}`,
        });

        if (response.success) {
          setTaskData(response.data);
        } else {
          toast.error('Failed to fetch task details');
        }
      } catch (error) {
        toast.error('Error while fetching task details');
        console.error('Error while fetching task details:', error);
      }
    };

    if (projectid) {
      fetchTaskDetails();
    }
  }, [filters.startDate, projectid]);

  const setCloseTask = async () => {
    setDialogOpen(false);
  };

  return (
    <>
  
      <Dialog open={dialogOpen} fullWidth maxWidth="lg" PaperProps={{ style: { height: '75vh' } }}>
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedProject?.Project_Name}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}></div>
          </div>
        </DialogTitle>
        <Box sx={{ width: '100%', typography: 'body1' }}>
          {taskData.map((schedule, index) => {
            const scheduleTypes = JSON.parse(schedule.SchTypes);

            return (
              <TabContext value={selectedTab} key={index}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="Schedule Types">
                    {Array.isArray(scheduleTypes) && scheduleTypes.length > 0 ? (
                      scheduleTypes.map((sch, index) => (
                        <Tab
                          key={`${sch.SchTypeId || 'index'}-${index}`}
                          label={sch.SchType || 'No SchType'}
                          value={(sch.SchTypeId || index).toString()}
                          id={`tab-${sch.SchTypeId || index}`}
                          aria-controls={`tabpanel-${sch.SchTypeId || index}`}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ padding: 2 }}>
                        No Details Available for {scheduleTypes}
                      </Typography>
                    )}

                    <Tab label="Today" value="today" id="tab-today" aria-controls="tabpanel-today" />
                  </TabList>
                </Box>

                {Array.isArray(scheduleTypes) && scheduleTypes.map((sch, index) => (
                  <TabPanel
                    key={`${sch.SchTypeId || 'index'}-${index}`}
                    value={(sch.SchTypeId || index).toString()}
                    id={`tabpanel-${sch.SchTypeId || index}`}
                    aria-labelledby={`tab-${sch.SchTypeId || index}`}
                  >
                    <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      {Array.isArray(sch.TaskCountsInSchType) && sch.TaskCountsInSchType.length > 0 ? (
                        sch.TaskCountsInSchType.map((count, index) => (
                          <Typography key={index} variant="body1" display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              Schedule Type: <strong>{sch.SchType}</strong>
                            </Box>
                            <Box textAlign="right">
                              Total Tasks: <strong>{count.TotalTasks}</strong> / Completed Tasks: <strong>{count.CompletedTasks}</strong>
                            </Box>
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No tasks counted for this schedule type.
                        </Typography>
                      )}
                    </Box>

                    {Array.isArray(sch.Tasks) && sch.Tasks.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {sch.Tasks.map((taskItem) => (
                          <div
                            key={taskItem.Task_Id}
                            style={{
                              backgroundColor: '#f0f4ff',
                              boxShadow: 'black',
                              padding: '16px',
                              borderRadius: '8px',
                              display: 'flex',
                              margin: '8px 0',
                              width: '100%',
                              justifyContent: 'space-between', // Add this to space out content
                            }}
                          >
                            <Typography fontWeight="bold" style={{ marginBottom: '8px' }}>
                              {taskItem.Task_Name || 'DEFAULT TASK'}
                            </Typography>

                            {Array.isArray(taskItem.AssignedEmployees) && taskItem.AssignedEmployees.length > 0 ? (
                              <Button
                                onClick={() => handleOpenDialog(taskItem.AssignedEmployees, taskItem.Task_Name)}
                                sx={{ marginLeft: 'auto' }} // This moves the button to the right
                              >
                                <span style={{ textAlign: 'left' }}>View Employees</span>
                              </Button>
                            ) : (
                              <span style={{ marginLeft: '60px', textAlign: 'left' }}>
                                No employees assigned
                              </span>
                            )}
                          </div>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No tasks available for this task type.
                      </Typography>
                    )}

                  </TabPanel>
                ))}

           
                <TabPanel value="today" id="tabpanel-today" aria-labelledby="tab-today">
                  <Box sx={{ padding: 2 }}>
                    {Array.isArray(parsedTaskDetails) && parsedTaskDetails.length > 0 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="h6" gutterBottom style={{ margin: 0 }}>
                            Task Details for
                          </Typography>

                          {/* Date Picker */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ verticalAlign: 'middle' }}>From:</span>
                            <input
                              type="date"
                              value={filters.startDate}
                              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                              className="cus-inpt"
                              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No tasks available for today.
                      </Typography>
                    )}
                  </Box>

                  {Array.isArray(parsedTaskDetails) && parsedTaskDetails.length > 0 ? (
                    parsedTaskDetails.map((taskDetail) => (
                      <div
                        key={taskDetail.Task_Id}
                        style={{
                          backgroundColor: '#fff',
                          padding: '16px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50', marginRight: '16px' }}>
                          {taskDetail.Task_Name || 'DEFAULT TASK'}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {Array.isArray(taskDetail.AssignedEmployees) && taskDetail.AssignedEmployees.length > 0 ? (
                            <Button
                              onClick={() => handleOpenDialog(taskDetail.AssignedEmployees, taskDetail.Task_Name)}
                              sx={{ marginLeft: '8px' }}
                            >
                              View Employees
                            </Button>
                          ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '8px' }}>
                              No Employees Assigned
                            </Typography>
                          )}
                        </Box>
                      </div>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ padding: '16px' }}>
                      No tasks available for today.
                    </Typography>
                  )}
                </TabPanel>
              </TabContext>
            );
          })}
        </Box>

        <DialogActions sx={{ marginTop: 'auto', position: 'sticky', bottom: 0 }}>
          <Button variant="contained" color="primary" onClick={setCloseTask}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Employee Details for {selectedTaskName}</DialogTitle>
        <DialogContent>
          {selectedTaskEmployees.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {selectedTaskEmployees.map((employee, index) => (
                <Chip key={index} label={employee.Name} variant="outlined" size="small" sx={{ margin: '4px', color: 'green' }} />
              ))}
            </Box>
          ) : (
            <Typography variant="body1">No employees assigned to this task.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ListingTask;
