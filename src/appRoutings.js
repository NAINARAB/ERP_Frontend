import { lazy } from 'react';
import './Pages/common.css'

// Dashboard
const CommonDashboard = lazy(() => import("./Pages/Dashboard/commonDashboard"));
// masters
const CompanyInfo = lazy(() => import('./Pages/Masters/CompanyInfo'))
const Users = lazy(() => import("./Pages/Masters/newUsers"))
const BranchInfo = lazy(() => import("./Pages/Masters/BranchInfo"))
const ProjectList = lazy(() => import("./Pages/Masters/ProjectList"))
const UserType = lazy(() => import("./Pages/Masters/UserType"))
// const BaseGroup = lazy(() => import("./Pages/Masters/BaseGroup"))
const TaskType = lazy(() => import("./Pages/Masters/TaskType"))
const ProductsMaster = lazy(() => import("./Pages/Masters/newProduct"))


// Authorization
const UserBased = lazy(() => import("./Pages/Authorization/userBased"))
const UserTypeBased = lazy(() => import("./Pages/Authorization/userTypeBased"))
// const CompanyAuth = lazy(() => import("./Pages/Authorization/compAuth"))
const MenuManagement = lazy(() => import("./Pages/Authorization/newMenuManagement"))



// Tasks
const TaskMaster = lazy(() => import("./Pages/Tasks/newTasksPage"))
const TaskParameter = lazy(() => import("./Pages/Tasks/taskParameters"))
const ActiveProjects = lazy(() => import("./Pages/CurrentProjects/projectsList"))
const ProjectDetails = lazy(() => import("./Pages/CurrentProjects/projectInfo"))
const TaskActivity = lazy(() => import("./Pages/CurrentProjects/taskActivity"))
const TodayTasks = lazy(() => import("./Pages/Tasks/todaytasks"))
// const WorkDoneHistory = lazy(() => import("./Pages/Tasks/employeeAbstract"))



// Discussion Forum
const Discussions = lazy(() => import("./Pages/Discussions/discussions"))
const ChatsDisplayer = lazy(() => import("./Pages/Discussions/chats"))


const ChangePassword = lazy(() => import("./Pages/changePassword"))

// Reports
const ReportCalendar = lazy(() => import("./Pages/Reports/calendar"))
const ReportTaskTypeBasedCalendar = lazy(() => import("./Pages/Reports/groupedReport"))
const ChartsReport = lazy(() => import("./Pages/Reports/chartReports"))
const EmployeeDayAbstract = lazy(() => import("./Pages/Reports/workDocument"))
const EmployeeAbstract = lazy(() => import("./Pages/Reports/employeeAbstract"))
const TallyReports = lazy(() => import("./Pages/Dashboard/tallyReport"))
const UserActivities = lazy(() => import("./Pages/Dashboard/userActivities"))
const DayBookOfERP = lazy(() => import("./Pages/Reports/dayBook"))
const DayBookDetails = lazy(() => import("./Pages/Reports/dayBookDetails"));
const TallyLolSyncDashboard = lazy(() => import("./Pages/Masters/TallyMasters/tallyLolSyncDashboard"))
const TallyLosSyncDashboard = lazy(() => import("./Pages/Masters/TallyMasters/tallyLosSyncDashboard"))

// Attendance
const AttendanceReportForEmployee = lazy(() => import("./Pages/Attendance/attendanceReportForEmp"))
const AttendanceReport = lazy(() => import("./Pages/Attendance/attendanceReport"))
const VisitedLogs = lazy(() => import("./Pages/Attendance/visitLogs"))
const FingerPrintAttendanceReport = lazy(() => import("./Pages/Attendance/fingerPrintAttendance"))


//User Module
const CustomerList = lazy(() => import("./Pages/UserModule/customerList"))
const EmployeeMaster = lazy(() => import("./Pages/UserModule/employee"))
const RetailersMaster = lazy(() => import("./Pages/UserModule/retailer/Retailer"))
const CostCategory = lazy(() => import("./Pages/UserModule/costCenterType"))

// Sales
const SalesReport = lazy(() => import("./Pages/Sales/LedgerTransaction"))
const SalesTransaction = lazy(() => import("./Pages/Analytics/SalesReport"))
const SaleOrderList = lazy(() => import("./Pages/Sales/saleOrder"))
const PartySalesReport = lazy(() => import("./Pages/Sales/partyWiseReport"))


// Inventry
const StockReport = lazy(() => import("./Pages/Inventry/stockReport"))
const LiveStockReport = lazy(() => import("./Pages/Inventry/liveStockReport"));
const TallyStockJournalList = lazy(() => import("./Pages/Inventry/tallyStockJournal"))
const StockJournal = lazy(() => import("./Pages/Inventry/stockJournal"))
const StockJournalEntry = lazy(() => import("./Pages/Inventry/stockJournalCreate"))
const TripSheets = lazy(() => import('./Pages/Inventry/TripMaster/TripSheets'))
const TripSheetGodownSearch = lazy(() => import('./Pages/Inventry/TripMaster/TripSheetGodownSearch'))

const DeliveryTripSheet=lazy(()=>import("./Pages/Sales/TripMaster/DeliveryTripSheet"))
const DeliveryTripSheetAdd=lazy(()=>import("./Pages/Sales/TripMaster/DeliveryTripSheetAdd"))
const SalesConvert=lazy(()=>import("./Pages/Sales/TripMaster/SalesDeliveryAdd") )


// Purchase
const PurchaseReport = lazy(() => import("./Pages/Purchase/purchaseReport"))
const PurchaseReportForCustomer = lazy(() => import("./Pages/Purchase/purchaseReportForCustomer"))
const PurchaseOrderList = lazy(() => import("./Pages/Purchase/PurchaseOrder/purchaseOrderList"))
const PurchaseOrderTallyBasedReport = lazy(() => import("./Pages/Purchase/tallyBasedReport"))
const PurchaseInvoiceManagement = lazy(() => import("./Pages/Purchase/purchaseInvoiceManagement"))
const PurchaseInvoces = lazy(() => import("./Pages/Purchase/purchaseInvoices"))


// Payments
const PendingInvoice = lazy(() => import("./Pages/Payments/pendingInvoice"))
const PaymentReport = lazy(() => import("./Pages/Payments/paymentReport"))


// Data Entry
const DriverActivities = lazy(() => import("./Pages/DataEntry/newDriverActivities"))
const GodownActivity = lazy(() => import("./Pages/DataEntry/godownActivity"))
const DeliveryActivity = lazy(() => import("./Pages/DataEntry/deliveryActivity"))
const StaffActivity = lazy(() => import("./Pages/DataEntry/staffActivity"))
const ActivityImagesUpload = lazy(() => import("./Pages/DataEntry/fileUploads"))
const WeightCheckActivity = lazy(() => import("./Pages/DataEntry/WeightCheckActivity"))
const DataEntryAttendance = lazy(() => import("./Pages/DataEntry/dataEntryAttendance"))
const PurchaseOrderEntries = lazy(() => import("./Pages/DataEntry/purchaseOrderEntry"))
const PurchaseOrderDataEntry = lazy(() => import("./Pages/DataEntry/purchaseOrderFormTemplate"))
const CostCenter = lazy(() => import("./Pages/DataEntry/costCenter"))



// Analytics
const DataEntryAbstract = lazy(() => import("./Pages/Analytics/entryInfo"))
const QPayReports = lazy(() => import("./Pages/Analytics/QPayReports2"))
// const ItemBasedReport = lazy(() => import("./Pages/Analytics/ItemBased"))
const ReportTemplateCreation = lazy(() => import("./Pages/Analytics/reportTemplateCreation"))
const ReportTemplates = lazy(() => import("./Pages/Analytics/reportTemplates"))
const ClosingStockReports = lazy(() => import("./Pages/UserModule/retailer/closingStockReport"));

// SubRouting
// const ERP_MasterData = lazy(() => import('./Pages/SubMenu/ERP/masterData'))
const DisplayNavigations = lazy(() => import('./Pages/SubMenu/DisplayNavigations'))
// const TSK_MasterData = lazy(() => import('./Pages/SubMenu/TaskManagement/masterData'))
const SalesDelivery = lazy(() => import("./Pages/Sales/SalesReportComponent/SalesDeliveryConvert"))


const ProjectReports = lazy(() => import("./Pages/ProjectReports/reports"))
const ActivityTracking = lazy(() => import("./Pages/UserModule/activityTracking"))
const RoutingArray = [


    { component: <ActivityTracking />, path: '/userControl/activityTracking' },
    { component: <ProjectReports />, path: '/taskManagement/report/projectReports' },
    // Dashboard
    { component: <CommonDashboard />, path: '/dashboard' },
    { component: <CommonDashboard />, path: '' },

    // Change password
    { component: <ChangePassword />, path: '/changePassword' },

    // Analytics
    { component: <QPayReports />, path: '/analytics/qPay' },
    { component: <SalesTransaction />, path: '/analytics/qPay/transaction' },
    { component: <ReportTemplates />, path: '/analytics/templates' },
    { component: <ReportTemplateCreation />, path: '/analytics/templates/create' },


    // Data Entry
    { component: <DriverActivities />, path: '/dataEntry/driverActivity' },
    { component: <GodownActivity />, path: '/dataEntry/godownActivity' },
    { component: <DeliveryActivity />, path: '/dataEntry/deliveryActivity' },
    { component: <StaffActivity />, path: '/dataEntry/staffActivity' },
    { component: <ActivityImagesUpload />, path: '/dataEntry/imageUpload' },
    { component: <WeightCheckActivity />, path: '/dataEntry/weightCheckingActivity' },
    { component: <DataEntryAttendance />, path: '/dataEntry/staffAttendance' },
    { component: <DataEntryAbstract />, path: '/dataEntry/report' },
    { component: <PurchaseOrderEntries />, path: '/dataEntry/purchaseOrder' },
    { component: <PurchaseOrderDataEntry />, path: '/dataEntry/purchaseOrder/create' },
    { component: <CostCenter />, path: '/dataEntry/costCenter' },


    // ERP 
    // ERP - master
    { component: <DisplayNavigations />, path: '/erp/master' },
    { component: <ProductsMaster />, path: '/erp/master/products' },
    { component: <RetailersMaster />, path: '/erp/master/retailers' },
    { component: <TallyLolSyncDashboard />, path: '/erp/master/tallyLOL' },
    { component: <TallyLosSyncDashboard />, path: '/erp/master/tallyLOS' },
    
    // ERP - sales
    { component: <DisplayNavigations />, path: '/erp/sales' },
    { component: <SalesReport />, path: '/erp/sales/salesReport' },
    { component: <SaleOrderList />, path: '/erp/sales/saleOrder' },
    { component: <PartySalesReport />, path: '/erp/sales/partyBasedReport' },
    // ERP - purchase
    { component: <DisplayNavigations />, path: '/erp/purchase' },
    { component: <PurchaseReport />, path: '/erp/purchase/purchaseReport' },
    { component: <PurchaseReportForCustomer />, path: '/erp/purchase/myPurchase' },
    { component: <PurchaseOrderList />, path: '/erp/purchase/purchaseOrder' },
    { component: <PurchaseOrderTallyBasedReport />, path: '/erp/purchase/tallyBasedReport' },
    { component: <PurchaseInvoiceManagement />, path: '/erp/purchase/invoice/create' },
    { component: <PurchaseInvoces />, path: '/erp/purchase/invoice' },
    // ERP - inventory
    { component: <DisplayNavigations />, path: '/erp/inventory' },
    { component: <StockReport />, path: '/erp/inventory/stockReport' },
    { component: <LiveStockReport />, path: '/erp/inventory/losStockReport' },
    { component: <TallyStockJournalList />, path: '/erp/inventory/tallyStockJournal' },
    { component: <StockJournal />, path: '/erp/inventory/stockJournal' },
    { component: <StockJournalEntry />, path: '/erp/inventory/stockJournal/create' },
    { component: <TripSheets />, path: '/erp/inventory/tripSheet' },
    { component: <TripSheetGodownSearch />, path: '/erp/inventory/tripSheet/searchGodown' },

    {component:<SalesConvert/>,path:'/erp/sales/Tripsheet/Tripsheetcreation/SaleOrderconvert'},
    { component: <DeliveryTripSheetAdd />, path: '/erp/sales/Tripsheet/Tripsheetcreation' },
    { component: <DeliveryTripSheet />, path: '/erp/sales/Tripsheet' },
    
    // ERP - payments
    { component: <DisplayNavigations />, path: '/erp/payments' },
    { component: <PendingInvoice />, path: '/erp/payments/pendingPayments' },
    { component: <PaymentReport />, path: '/erp/payments/paymentReport' },
    // ERP - CRM
    { component: <DisplayNavigations />, path: '/erp/crm' },
    { component: <VisitedLogs />, path: '/erp/crm/visitLogs' },   // TO BE ADDED
    { component: <ClosingStockReports />, path: '/erp/crm/closingStock' },


    // Task management
    // Task management - attendance
    { component: <DisplayNavigations />, path: '/taskManagement/attendance' },
    { component: <AttendanceReportForEmployee />, path: '/taskManagement/attendance/employee' },
    { component: <AttendanceReport />, path: '/taskManagement/attendance/salesPerson' },
    { component: <FingerPrintAttendanceReport />, path: '/taskManagement/attendance/fingerPrints' },
    // Task Management - discussions
    { component: <Discussions />, path: '/taskManagement/discussions' },
    { component: <ChatsDisplayer />, path: '/taskManagement/discussions/chats' },
    // Task Management - master
    { component: <DisplayNavigations />, path: '/taskManagement/master' },
    { component: <TaskType />, path: '/taskManagement/master/taskTypes' },
    { component: <TaskMaster />, path: '/taskManagement/master/tasks' },
    { component: <TaskParameter isOpened={true} disableCollapse={true} />, path: '/taskManagement/master/parameters' },
    { component: <ProjectList />, path: '/taskManagement/master/projects' },
    { component: <TodayTasks />, path: '/taskManagement/myTasks' },
    { component: <ActiveProjects />, path: '/taskManagement/projectActivity' },
    { component: <ProjectDetails />, path: '/taskManagement/projectActivity/projectDetails' },
    { component: <TaskActivity />, path: '/taskManagement/projectActivity/projectDetails/taskActivity' },
    // { component: <BaseGroup />, path: '' },
    // Task Management - reports
    { component: <DisplayNavigations />, path: '/taskManagement/report' },
    { component: <ReportCalendar />, path: '/taskManagement/report/calendar' },
    { component: <ReportTaskTypeBasedCalendar />, path: '/taskManagement/report/calendarTaskGroup' },
    { component: <EmployeeDayAbstract />, path: '/taskManagement/report/todayActivity' },
    { component: <TallyReports />, path: '/taskManagement/report/tallyActivity' },
    { component: <ChartsReport />, path: '/taskManagement/report/activityGraph' },
    { component: <EmployeeAbstract />, path: '/taskManagement/report/userDetails' },
    { component: <UserActivities />, path: '/taskManagement/report/userActivities' },
    { component: <DayBookOfERP />, path: '/erp/dayBook' },
    { component: <DayBookDetails />, path: '/erp/dayBook/details' },

    // User Control
    { component: <CompanyInfo />, path: '/userControl/company' },
    { component: <Users />, path: '/userControl/users' },
    { component: <BranchInfo />, path: '/userControl/branch' },
    { component: <UserType />, path: '/userControl/userType' },
    { component: <UserBased />, path: '/userControl/userRights' },
    { component: <UserTypeBased />, path: '/userControl/userTypeRights' },
    { component: <CustomerList />, path: '/userControl/customers' },
    { component: <EmployeeMaster />, path: '/userControl/employees' },
    { component: <MenuManagement />, path: '/userControl/appMenu' },
    { component: <CostCategory />, path: '/userControl/CostCategory' },
    // { component: <WorkDoneHistory />, path: '' }, // will not work
    // { component: <ItemBasedReport />, path: '' }, // will not work
    { component: <SalesDelivery />, path: '/erp/sales/salesDelivery' },
];

export default RoutingArray