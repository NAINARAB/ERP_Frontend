import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage/LoginPage";
import CircularProgress from "@mui/material/CircularProgress";
import MainComponent from "./Pages/MainComponent/MainComponent";
import { ContextDataProvider } from "./Components/context/contextProvider";
import { CompanyDataProvider } from "./Components/context/currentCompnayProvider";
import { fetchLink } from "./Components/fetchComponent";


import CompanyInfo from "./Pages/Masters/CompanyInfo"
import Users from "./Pages/Masters/newUsers";
import BranchInfo from "./Pages/Masters/BranchInfo";
import ProjectList from "./Pages/Masters/ProjectList";
import UserType from "./Pages/Masters/UserType";
import BaseGroup from "./Pages/Masters/BaseGroup";
import TaskType from "./Pages/Masters/TaskType";

import UserBased from "./Pages/Authorization/userBased";
import UserTypeBased from "./Pages/Authorization/userTypeBased";
import MenuManagement from "./Pages/Authorization/menuMangaement";

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
import TallyReports from "./Pages/Dashboard/tallyReport";
import ChangePassword from "./Pages/ERP/Home/changePassword";
import AttendanceReport from "./Pages/Attendance/attendanceReport";
import CustomerList from "./Pages/UserModule/customerList";
import CompanyAuth from "./Pages/Authorization/compAuth";
import StockReport from "./Pages/ERP/Report/stockReport";
import PurchaseReport from "./Pages/ERP/Report/purchaseReport";
import PurchaseReportForCustomer from "./Pages/ERP/Report/purchaseReportForCustomer";
import PendingInvoice from "./Pages/ERP/Payments/pendingInvoice";
import PaymentReport from "./Pages/ERP/Payments/paymentReport";
import AttendanceReportForEmployee from "./Pages/Attendance/attendanceReportForEmp";
import EmployeeMaster from "./Pages/UserModule/employee";
import DriverActivities from "./Pages/DataEntry/newDriverActivities";
import GodownActivity from "./Pages/DataEntry/godownActivity";
import DeliveryActivity from "./Pages/DataEntry/deliveryActivity";
import StaffActivity from "./Pages/DataEntry/staffActivity";
import ActivityImagesUpload from "./Pages/DataEntry/fileUploads";
import WeightCheckActivity from "./Pages/DataEntry/WeightCheckActivity";
import DataEntryAbstract from "./Pages/Analytics/entryInfo";
import QPayReports from "./Pages/Analytics/QPayReports2";
import SalesTransaction from "./Pages/Analytics/SalesReport";
import ItemBasedReport from "./Pages/Analytics/ItemBased";
import DataEntryAttendance from "./Pages/DataEntry/dataEntryAttendance";
import ReportTemplateCreation from "./Pages/Analytics/reportTemplateCreation";
import ReportTemplates from "./Pages/Analytics/reportTemplates";
import SalesReport from "./Pages/Sales/LedgerTransaction";
import RetailersMaster from "./Pages/UserModule/retailer/Retailer";
import ProductsMaster from "./Pages/Masters/Product";
import VisitedLogs from "./Pages/Attendance/visitLogs";
import SaleOrderList from "./Pages/Sales/saleOrder";
import ClosingStockReports from "./Pages/UserModule/retailer/closingStockReport";

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

            fetchLink({
                address: `authorization/userAuth?Auth=${Auth}`
            }).then(data => {

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

            }).catch(e => { console.error(e); setLoading(false); }).finally(() => clearQueryParameters())

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
                            <Route exact path="*" element={<LoginPage setLoginTrue={setLoginTrue} />} />
                        </Routes>
                    </>
                ) : (
                    <ContextDataProvider>
                        <CompanyDataProvider>
                            <MainComponent logout={logout}>
                                <Routes>

                                    {/* DASHBOARD */}
                                    <Route exact path="/dashboard" element={<CommonDashboard />} />

                                    {/* MASTERS */}
                                    <Route path="/masters/company" element={<CompanyInfo />} />
                                    <Route path="/masters/users" element={<Users />} />
                                    <Route path="/masters/branch" element={<BranchInfo />} />
                                    <Route path="/masters/project" element={<ProjectList />} />
                                    <Route path="/master/usertype" element={<UserType />} />
                                    <Route path="/master/basegroup" element={<BaseGroup />} />
                                    <Route path="/master/tasktype" element={<TaskType />} />
                                    <Route path="/masters/products" element={<ProductsMaster />} />

                                    {/* AUTHORIZATION */}
                                    <Route path="/authorization/user" element={<UserBased />} />
                                    <Route path="/authorization/usertype" element={<UserTypeBased />} />
                                    <Route path="/authorization/company" element={<CompanyAuth />} />
                                    <Route path="/authorization/menuManagement" element={<MenuManagement />} />

                                    {/* TASKS */}
                                    <Route path="/tasks/taskslist" element={<TaskMaster />} />
                                    <Route path="/tasks/activeproject" element={<ActiveProjects />} />
                                    <Route path="/tasks/activeproject/projectschedule" element={<ProjectDetails />} />
                                    <Route path="/tasks/activeproject/projectschedule/taskActivity" element={<TaskActivity />} />

                                    {/* DISCUSSION FORUM */}
                                    <Route path="/discussions" element={<Discussions />} />
                                    <Route path="/discussions/chats" element={<ChatsDisplayer />} />

                                    {/* MY TASKS */}
                                    <Route path="/mytasks/todaytasks" element={<TodayTasks />} />
                                    <Route path="/mytasks/alltasks" element={<WorkDoneHistory />} />

                                    {/* REPORTS */}
                                    <Route path="/reports/calendar" element={<ReportCalendar />} />
                                    <Route path="/reports/taskTypeBased" element={<ReportTaskTypeBasedCalendar />} />
                                    <Route path="/reports/graphs" element={<ChartsReport />} />
                                    <Route path="/reprots/dayAbstract" element={<EmployeeDayAbstract />} />
                                    <Route path="/reprots/employee" element={<EmployeeAbstract />} />
                                    <Route path="/reports/tally" element={<TallyReports />} />

                                    {/* ATTENDANCE */}
                                    <Route path="/attendance/salesPersons" element={<AttendanceReport />} />
                                    <Route path="/attendance/employee" element={<AttendanceReportForEmployee />} />
                                    <Route path="/attendance/visitLogs" element={<VisitedLogs />} />  {/* tes */}

                                    {/* USER MODULE */}
                                    <Route path="/userModule/customer" element={<CustomerList />} />
                                    <Route path="/userModule/employee" element={<EmployeeMaster />} />
                                    <Route path="/userModule/retailers" element={<RetailersMaster />} />


                                    {/* SALES */}
                                    <Route path='/sales/salesReport' element={<SalesReport />} />
                                    <Route path='/sales/closingStock' element={<ClosingStockReports />} />
                                    <Route path='/sales/saleOrders' element={<SaleOrderList />} />


                                    {/* PURCHASE */}
                                    <Route path='/purchase/purchaseReport' element={<PurchaseReport />} />
                                    <Route path='/purchase/myPruchase' element={<PurchaseReportForCustomer />} />


                                    {/* INVENTRY */}
                                    <Route path='/inventry/stockReport' element={<StockReport />} />


                                    {/* PAYMENTS */}
                                    <Route path='/payments/pendingInvoice' element={<PendingInvoice />} />
                                    <Route path='/payments/paymentReport' element={<PaymentReport />} />

                                    {/* CHANGE PASSWORD */}
                                    <Route path="/changePassword" element={<ChangePassword />} />

                                    {/* DATA ENTRY */}
                                    <Route path="/dataEntry/drivers" element={<DriverActivities />} />
                                    <Route path="/dataEntry/godown" element={<GodownActivity />} />
                                    <Route path="/dataEntry/delivery" element={<DeliveryActivity />} />
                                    <Route path="/dataEntry/staffs" element={<StaffActivity />} />
                                    <Route path="/dataEntry/fileUpload" element={<ActivityImagesUpload />} />
                                    <Route path="/dataEntry/wgCheck" element={<WeightCheckActivity />} />
                                    <Route path="/dataEntry/staffAttendance" element={<DataEntryAttendance />} />

                                    {/* ANALYTICS */}
                                    <Route path="/analytics/todayActiviy" element={<DataEntryAbstract />} />
                                    <Route path="/analytics/qPay" element={<QPayReports />} />
                                    <Route path="/analytics/qPay/SalesTransaction" element={<SalesTransaction />} />
                                    <Route path="/analytics/itemBasedReport" element={<ItemBasedReport />} />
                                    <Route path="/analytics/templates" element={<ReportTemplates />} />
                                    <Route path="/analytics/templates/create" element={<ReportTemplateCreation />} />

                                    {/* OTHERS */}
                                    <Route path="/invalid-credentials" element={<InvalidPageComp />} />
                                    <Route path="*" element={<InvalidPageComp message={'404 Page Not Found'} />} />

                                </Routes>
                            </MainComponent>
                        </CompanyDataProvider>
                    </ContextDataProvider>
                )}
            </BrowserRouter>
        </>
    );
}

export default App;
