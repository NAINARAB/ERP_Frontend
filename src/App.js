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
import MyTasks from "./Pages/Tasks/myTasks";

import ActiveProjects from "./Pages/CurrentProjects/projectsList";
import ProjectDetails from "./Pages/CurrentProjects/projectInfo";

import InvalidPageComp from "./Components/invalidCredential";
import TaskMaster from "./Pages/Tasks/newTasksPage";

import Discussions from "./Pages/Discussions/discussions";
import ChatsDisplayer from "./Pages/Discussions/chats";
import TaskActivity from "./Pages/CurrentProjects/taskActivity";
import Dashboard from "./Pages/Dashboard/Dashboard";
import TodayTasks from "./Pages/MyTasks/todaytasks";
import WorkDoneHistory from "./Pages/MyTasks/employeeAbstract";

function App() {
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);
      if (user.Autheticate_Id) {
        fetch(`${api}authentication?AuthId=${user.Autheticate_Id}`)
          .then((response) => response.json())
          .then((auth) => {
            setLoading(false);
            setLogin(auth?.isValidUser);
          })
          .catch((e) => {
            console.error(e);
            setLoading(false);
          });
      }
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
    window.location = '/'
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
              <Route
                exact
                path="/"
                element={<LoginPage setLoginTrue={setLoginTrue} />}
              ></Route>
            </Routes>
          </>
        ) : (
          <ContextDataProvider>
            <MainComponent logout={logout}>
              <Routes>
                
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}

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
                <Route path="/tasks/mytasks" element={<MyTasks />} />
                <Route path="/tasks/activeproject" element={<ActiveProjects />} />
                <Route path="/tasks/activeproject/projectschedule" element={<ProjectDetails />} />
                <Route path="/tasks/activeproject/projectschedule/taskActivity" element={<TaskActivity />} />

                <Route path="/discussions" element={<Discussions />} />
                <Route path="/discussions/chats" element={<ChatsDisplayer />} />

                <Route path="/mytasks/todaytasks" element={<TodayTasks />} />
                <Route path="/mytasks/alltasks" element={<WorkDoneHistory />} />

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
