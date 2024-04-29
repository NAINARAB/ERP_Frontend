import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage/LoginPage";
import api from "./API";
import CircularProgress from "@mui/material/CircularProgress";
import MainComponent from "./Pages/MainComponent/MainComponent";
import { ContextDataProvider } from "./Components/context/contextProvider";

import CompanyInfo from "./Pages/Masters/CompanyInfo"
import Users from "./Pages/Masters/Users";
import BranchInfo from "./Pages/Masters/BranchInfo";
import ProjectList from "./Pages/Masters/ProjectList";
import UserType from "./Pages/Masters/UserType";
import BaseGroup from "./Pages/Masters/BaseGroup";
import TaskType from "./Pages/Masters/TaskType";

import UserBased from "./Pages/Authorization/userBased";
import UserTypeBased from "./Pages/Authorization/userTypeBased";

// import Tasks from "./Pages/Tasks/Tasks";
// import MyTasks from "./Pages/Tasks/myTasks";

import ActiveProjects from "./Pages/CurrentProjects/projectsList";
import ProjectDetails from "./Pages/CurrentProjects/projectInfo";

import InvalidPageComp from "./Components/invalidCredential";
import TaskMaster from "./Pages/Tasks/newTasksPage";

import Discussions from "./Pages/Discussions/discussions";
import ChatsDisplayer from "./Pages/Discussions/chats";
import TaskActivity from "./Pages/CurrentProjects/taskActivity";
import CommonDashboard from "./Pages/Dashboard/commonDashboard";
import TodayTasks from "./Pages/MyTasks/todaytasks";
import WorkDoneHistory from "./Pages/MyTasks/employeeAbstract";

import ReportCalendar from "./Pages/Reports/calendar";
import ReportTaskTypeBasedCalendar from "./Pages/Reports/groupedReport";
import ChartsReport from "./Pages/Reports/chartReports";
import EmployeeDayAbstract from "./Pages/Reports/workDocument";
import EmployeeAbstract from "./Pages/Reports/employeeAbstract";

function App() {
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearQueryParameters = () => {
    const newUrl = window.location.pathname;
    window.history.pushState({}, document.title, newUrl);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const Auth = queryParams.get('Auth') || parseData?.Autheticate_Id;

    if (Auth) {

      fetch(`${api}getUserByAuth?Auth=${Auth}`)
        .then(res => res.json())
        .then(data => {

          if (data.success) {

            const { Autheticate_Id, BranchId, BranchName, Company_id, Name, UserId, UserName, UserType, UserTypeId, session } = data.data[0]
            const user = {
              Autheticate_Id, BranchId, BranchName, Company_id, Name, UserId, UserName, UserType, UserTypeId
            }
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('session', JSON.stringify(session[0]));
            setLogin(true);
            setLoading(false);
          } else {
            setLoading(false);
          }
          
        }).catch(e => {console.error(e); setLoading(false);})
        .finally(() => clearQueryParameters())

    } else {
      setLoading(false);
    }

  }, []);

  const setLoginTrue = () => {
    setLogin(true);
  };

  const logout = () => {
    localStorage.clear();
    setLogin(false);
    // window.location = '/'
    window.location = process.env.REACT_APP_ERP_LOGOUT
  }

  return (
    <>
      <BrowserRouter>
        {loading ? (
          <div className="overlay">
            <CircularProgress className="spinner" />
          </div>
        ) : !login ? (
          <>
            <Routes>
              <Route exact path="/" element={<LoginPage setLoginTrue={setLoginTrue} />} />
            </Routes>
          </>
        ) : (
          <ContextDataProvider>
            <MainComponent logout={logout}>
              <Routes>

                <Route exact path="/dashboard" element={<CommonDashboard />} />

                <Route path="/masters/company" element={<CompanyInfo />} />
                <Route path="/masters/users" element={<Users />} />
                <Route path="/masters/branch" element={<BranchInfo />} />
                <Route path="/masters/project" element={<ProjectList />} />
                <Route path="/master/usertype" element={<UserType />} />
                <Route path="/master/basegroup" element={<BaseGroup />} />
                <Route path="/master/tasktype" element={<TaskType />} />

                <Route path="/authorization/user" element={<UserBased />} />
                <Route path="/authorization/usertype" element={<UserTypeBased />} />

                <Route path="/tasks/taskslist" element={<TaskMaster />} />
                <Route path="/tasks/activeproject" element={<ActiveProjects />} />
                <Route path="/tasks/activeproject/projectschedule" element={<ProjectDetails />} />
                <Route path="/tasks/activeproject/projectschedule/taskActivity" element={<TaskActivity />} />

                <Route path="/discussions" element={<Discussions />} />
                <Route path="/discussions/chats" element={<ChatsDisplayer />} />

                <Route path="/mytasks/todaytasks" element={<TodayTasks />} />
                <Route path="/mytasks/alltasks" element={<WorkDoneHistory />} />

                <Route path="/reports/calendar" element={<ReportCalendar />} />
                <Route path="/reports/taskTypeBased" element={<ReportTaskTypeBasedCalendar />} />
                <Route path="/reports/graphs" element={<ChartsReport />} />
                <Route path="/reprots/dayAbstract" element={<EmployeeDayAbstract />} />
                <Route path="/reprots/employee" element={<EmployeeAbstract />} />

                <Route path="/invalid-credentials" element={<InvalidPageComp />} />
                <Route path="*" element={<InvalidPageComp message={'404 Page Not Found'} />} />

              </Routes>
            </MainComponent>
          </ContextDataProvider>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
