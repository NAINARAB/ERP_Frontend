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
const PosMaster = lazy(() => import("./Pages/Masters/posMaster"))
const POSProductList = lazy(() => import("./Pages/Masters/posproductListing"))
const UomMaster = lazy(() => import("./Pages/Masters/uomMaster"))
const RateMaster = lazy(() => import("./Pages/Masters/rateMaster"))
const LeaveMaster = lazy(() => import("./Pages/Masters/LeaveMaster"))
const LeaveType = lazy(() => import("./Pages/Masters/LeaveType"));
const DefaultAccountMaster = lazy(() => import("./Pages/Masters/defaultAccountMaster/listDefaultAccountMaster"));
const Lom = lazy(() => import("./Pages/Masters/Lom"));
const Lollist = lazy(() => import("./Pages/Masters/lollist"));
const Loslist = lazy(() => import("./Pages/Masters/loslist"));
const ProductGroup = lazy(() => import("./Pages/Masters/ProductGroup"))

const AccountMaster = lazy(() => import("./Pages/Masters/AccountMaster"))
const AccountingGroup = lazy(() => import("./Pages/Masters/AccountingGroup"))
const StateMaster = lazy(() => import("./Pages/Masters/State"))
const GodownMaster = lazy(() => import("./Pages/Masters/Godown"))
const BrandMaster = lazy(() => import("./Pages/Masters/Brand"))
const DistrictMaster = lazy(() => import("./Pages/Masters/DistrictMaster"))

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
const DayBookOfERP = lazy(() => import("./Pages/Reports/dayBook/dayBook"))
const DayBookDetails = lazy(() => import("./Pages/Reports/dayBook/dayBookDetails"));
const TallyLolSyncDashboard = lazy(() => import("./Pages/Masters/TallyMasters/tallyLolSyncDashboard"))
const TallyLosSyncDashboard = lazy(() => import("./Pages/Masters/TallyMasters/tallyLosSyncDashboard"))
const TripReports = lazy(() => import("./Pages/Reports/tripReports"))
const CostCenterReports = lazy(() => import("./Pages/Reports/costCenterReports"))
const ClosingStockReportsProduct = lazy(() => import("./Pages/Reports/productclosingStockReports"))
const OutStanding = lazy(() => import("./Pages/Reports/outstanding"))
const DeliveryReports = lazy(() => import("./Pages/Reports/deliveryReports"));
const StockInHand = lazy(() => import("./Pages/Reports/storageClosingStock/stockInHand"));
const ItemGroupWiseStockValue = lazy(() => import("./Pages/Reports/storageClosingStock/itemGroupBasedStockValue"));
const PurchaseBrokerageReport = lazy(() => import("./Pages/Reports/CostCenterReports/purchaseBrokerageReport"));
const NakalReports = lazy(() => import("./Pages/Reports/NakalReports/nakalReports"));

// Attendance
const AttendanceReportForEmployee = lazy(() => import("./Pages/Attendance/attendanceReportForEmp"))
const AttendanceReport = lazy(() => import("./Pages/Attendance/attendanceReport"))
const VisitedLogs = lazy(() => import("./Pages/Attendance/visitLogs"))
const FingerPrintAttendanceReport = lazy(() => import("./Pages/Attendance/fingerPrintAttendance"))


//User Module
const CustomerList = lazy(() => import("./Pages/UserModule/customerList"))
const EmployeeMaster = lazy(() => import("./Pages/UserModule/employee"))
const RetailersMaster = lazy(() => import("./Pages/UserModule/retailer/Retailer"))
const CostCategory = lazy(() => import("./Pages/UserModule/costCenterType"));
const VoucherType = lazy(() => import("./Pages/UserModule/voucherMaster"));
const RouteMaster = lazy(() => import("./Pages/UserModule/routeMaster"))
const AreaMaster = lazy(() => import("./Pages/UserModule/areaMaster"))

// Sales
const SalesReport = lazy(() => import("./Pages/Sales/salesReports"))
const SalesTransaction = lazy(() => import("./Pages/Analytics/SalesReport"))
const SaleOrderList = lazy(() => import("./Pages/Sales/SaleOrder/saleOrderList"))
// const SaleOrderCreate = lazy(() => import("./Pages/Sales/SaleOrder/saleOrderCreation"))
const SaleOrderCreation = lazy(() => import("./Pages/Sales/SaleOrder/saleOrderCreation"))
const PartySalesReport = lazy(() => import("./Pages/Sales/partyWiseReport"))
const SalesInvoiceList = lazy(() => import("./Pages/Sales/SalesInvoice/salesInvoiceList"))
const SalesInvoiceCreation = lazy(() => import("./Pages/Sales/SalesInvoice/salesInvoiceCreation"))
const PreSaleorder = lazy(() => import("./Pages/Sales/PreSaleOrder/orderList"));

// Inventry
const StockReport = lazy(() => import("./Pages/Inventry/stockReport"))
const LiveStockReport = lazy(() => import("./Pages/Inventry/liveStockReport"));
const TallyStockJournalList = lazy(() => import("./Pages/Inventry/tallyStockJournal"));
const StockJournal = lazy(() => import("./Pages/Inventry/stockJournal"))
const StockJournalEntry = lazy(() => import("./Pages/Inventry/stockJournalCreate"))
const TripSheets = lazy(() => import('./Pages/Inventry/TripMaster/TripSheets'))
const TripSheetCreation = lazy(() => import('./Pages/Inventry/TripMaster/TripSheetCreation'));
const StockInwards = lazy(() => import('./Pages/Inventry/stockInward'))
// const StockProcess = lazy(() => import('./Pages/Inventry/stockProcess'));
const StockMangement = lazy(() => import('./Pages/Inventry/Processing/listProcessing'));
const StockManagementCreate = lazy(() => import('./Pages/Inventry/Processing/AddProcessing'));
const ArrivalList = lazy(() => import("./Pages/Inventry/TripMaster/arivalList"));
const ArrivalMaster = lazy(() => import("./Pages/Inventry/TripMaster/arrivalMaster"));
const BatchAssign = lazy(() => import("./Pages/Inventry/BatchManagement/batchAssign"));
const BatchListing = lazy(() => import("./Pages/Inventry/BatchManagement/batchList"));


const DeliveryTripSheet = lazy(() => import("./Pages/Sales/TripMaster/DeliveryTripSheet"))
const DeliveryTripSheetAdd = lazy(() => import("./Pages/Sales/TripMaster/DeliveryTripSheetAdd"))
const SalesConvert = lazy(() => import("./Pages/Sales/TripMaster/SalesDeliveryAdd"))


// Purchase
const PurchaseReport = lazy(() => import("./Pages/Purchase/purchaseReport"))
const PurchaseReportForCustomer = lazy(() => import("./Pages/Purchase/purchaseReportForCustomer"))
// const PurchaseOrderList = lazy(() => import("./Pages/Purchase/PurchaseOrder/purchaseOrderList"))
const PurchaseOrderTallyBasedReport = lazy(() => import("./Pages/Purchase/tallyBasedReport"))
const PurchaseInvoiceManagement = lazy(() => import("./Pages/Purchase/purchaseInvoiceManagement"))
const PurchaseInvoces = lazy(() => import("./Pages/Purchase/purchaseInvoices"))


// Payments
const PendingInvoice = lazy(() => import("./Pages/Payments/pendingInvoice"))
const PaymentReport = lazy(() => import("./Pages/Payments/paymentReport"));
const PaymentsMasterList = lazy(() => import("./Pages/Payments/PaymentMaster/listPayments"));
const AddPaymentMaster = lazy(() => import("./Pages/Payments/PaymentMaster/addPayments"));
const AddPaymentReference = lazy(() => import("./Pages/Payments/PaymentMaster/addReference"));
const PaymentReference = lazy(() => import('./Pages/Payments/PaymentReport/pendingReference'));
const PaymentAccountTransaction = lazy(() => import('./Pages/Payments/PaymentReport/accountTransaction'));
const ItemPaymentExpences = lazy(() => import('./Pages/Payments/PaymentReport/itemExpences'));

// Receipts
const PaymentCollectionList = lazy(() => import("./Pages/Receipts/collcetionModule/listReceipts"))
const PaymentCollectionCreate = lazy(() => import("./Pages/Receipts/collcetionModule/createReceipts"));
const TallyPendingReceipt = lazy(() => import("./Pages/Receipts/outstandingReports/tallyPendingReceipt"))
const ReceiptList = lazy(() => import("./Pages/Receipts/ReceiptMaster/listReceipts"));
const ReceiptsCreate = lazy(() => import("./Pages/Receipts/ReceiptMaster/addReceipt"));
const ReceiptReferenceCreation = lazy(() => import("./Pages/Receipts/ReceiptMaster/addReference"));
const PaymentCollectionReport = lazy(() => import("./Pages/Reports/paymentCollectionReport"));
const CustomerPendingReceipt = lazy(() => import("./Pages/Receipts/outstandingReports/customerPendingReceipt"));


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
const SalesComparisonTabs = lazy(() => import("./Pages/Analytics/dataComparison/SalesComparison/salesTabs"))
const PurchaseComparisonTabs = lazy(() => import("./Pages/Analytics/dataComparison/PurchaseComparison/purchaseTabs"))
// const ItemBasedReport = lazy(() => import("./Pages/Analytics/ItemBased"))
const ReportTemplateCreation = lazy(() => import("./Pages/Analytics/reportTemplateCreation"))
const ReportTemplates = lazy(() => import("./Pages/Analytics/reportTemplates"))
// const ClosingStockReports = lazy(() => import("./Pages/UserModule/retailer/closingStockReport"));
// const RetailerClosingStock = lazy(() => import('./Pages/UserModule/retailer/closingStockRetailerBasedReport'))
const CustomerClosingStockReport = lazy(() => import('./Pages/Reports/CRM/customerClosingStockReport'))

// SubRouting
// const ERP_MasterData = lazy(() => import('./Pages/SubMenu/ERP/masterData'))
const DisplayNavigations = lazy(() => import('./Pages/SubMenu/DisplayNavigations'))
// const TSK_MasterData = lazy(() => import('./Pages/SubMenu/TaskManagement/masterData'))
const SalesDelivery = lazy(() => import("./Pages/Sales/SalesReportComponent/SalesDeliveryConvert"))


const ProjectReports = lazy(() => import("./Pages/ProjectReports/reports"))
const ActivityTracking = lazy(() => import("./Pages/UserModule/activityTracking"));

const RoutingArray = [

    { component: <ActivityTracking />, path: '/userControl/activityTracking' },
    { component: <ProjectReports />, path: '/taskManagement/report/projectReports' },
    // Dashboard
    { component: <CommonDashboard />, path: '/dashboard' },
    { component: <CommonDashboard />, path: '' },

    // Change password
    { component: <ChangePassword />, path: '/changePassword' },

    // Analytics
    { component: <DisplayNavigations />, path: '/analytics/syncStatus' },
    { component: <QPayReports />, path: '/analytics/qPay' },
    { component: <SalesTransaction />, path: '/analytics/qPay/transaction' },
    { component: <ReportTemplates />, path: '/analytics/templates' },
    { component: <ReportTemplateCreation />, path: '/analytics/templates/create' },
    { component: <SalesComparisonTabs />, path: '/analytics/syncStatus/salesSync' },
    { component: <PurchaseComparisonTabs />, path: '/analytics/syncStatus/purchaseInvoiceSync' },


    // Data Entry
    { component: <DriverActivities />, path: '/dataEntry/driverActivity' },
    { component: <GodownActivity />, path: '/dataEntry/godownActivity' },
    { component: <DeliveryActivity />, path: '/dataEntry/deliveryActivity' },
    { component: <StaffActivity />, path: '/dataEntry/staffActivity' },
    { component: <ActivityImagesUpload />, path: '/dataEntry/imageUpload' },
    { component: <WeightCheckActivity />, path: '/dataEntry/weightCheckingActivity' },
    { component: <DataEntryAttendance />, path: '/dataEntry/staffAttendance' },
    { component: <DataEntryAbstract />, path: '/dataEntry/report' },
    { component: <CostCenter />, path: '/dataEntry/costCenter' },



    // ERP 
    // ERP - master
    { component: <DisplayNavigations />, path: '/erp/master' },
    { component: <ProductsMaster />, path: '/erp/master/products' },
    { component: <RetailersMaster />, path: '/erp/master/retailers' },
    { component: <TallyLolSyncDashboard />, path: '/erp/master/tallyLOL' },
    { component: <TallyLosSyncDashboard />, path: '/erp/master/tallyLOS' },
    { component: <RateMaster />, path: '/erp/master/RateMaster' },
    { component: <UomMaster />, path: '/erp/master/uomMaster' },
    { component: <PosMaster />, path: '/erp/master/posMaster' },
    { component: <POSProductList />, path: '/erp/master/POSProductList' },
    { component: <DefaultAccountMaster />, path: '/erp/master/defaultAccountMaster' },
    { component: <Loslist />, path: '/erp/master/loslist' },
    { component: <Lollist />, path: '/erp/master/lollist' },
    { component: <Lom />, path: '/erp/master/lom' },
    { component: <DistrictMaster />, path: '/erp/master/district' },
    { component: <BrandMaster />, path: '/erp/master/brand' },
    { component: <GodownMaster />, path: '/erp/master/godown' },
    { component: <StateMaster />, path: '/erp/master/state' },
    { component: <AccountingGroup />, path: '/erp/master/accountingGroup' },
    { component: <AccountMaster />, path: '/erp/master/accountMaster' },
    { component: <ProductGroup />, path: '/erp/master/productGroup' },
    
    //ERP - BATCH MANAGEMENT
    { component: <DisplayNavigations />, path: '/erp/batchManagement' },
    { component: <BatchListing />, path: '/erp/batchManagement/batchList' },
    { component: <BatchAssign />, path: '/erp/batchManagement/batchCreation' },

    // ERP - reports
    { component: <TripReports />, path: '/erp/reports/tripReports' },
    { component: <DeliveryReports />, path: '/erp/reports/deliveryReports' },
    { component: <StockInHand />, path: '/erp/reports/stockInHand' },
    { component: <ItemGroupWiseStockValue />, path: '/erp/reports/itemBasedStockValue' },
    { component: <PurchaseBrokerageReport />, path: '/erp/reports/purchaseBrokerage' },
    { component: <NakalReports />, path: '/erp/reports/nakalReports' },

    // ERP - sales
    { component: <DisplayNavigations />, path: '/erp/sales' },
    { component: <SalesReport />, path: '/erp/sales/salesReport' },
    { component: <SaleOrderList />, path: '/erp/sales/saleOrder' },
    { component: <SaleOrderCreation />, path: '/erp/sales/saleOrder/create' },
    { component: <PartySalesReport />, path: '/erp/sales/partyBasedReport' },
    { component: <SalesInvoiceList />, path: '/erp/sales/invoice' },
    { component: <SalesInvoiceCreation />, path: '/erp/sales/invoice/create' },
    { component: <PreSaleorder />, path: '/erp/sales/PreSaleorder' },
    // ERP - purchase
    { component: <DisplayNavigations />, path: '/erp/purchase' },
    { component: <PurchaseReport />, path: '/erp/purchase/purchaseReport' },
    { component: <PurchaseReportForCustomer />, path: '/erp/purchase/myPurchase' },
    { component: <PurchaseOrderEntries />, path: '/erp/purchase/purchaseOrder' },
    { component: <PurchaseOrderDataEntry />, path: '/erp/purchase/purchaseOrder/create' },
    // { component: <PurchaseOrderEntries />, path: '/dataEntry/purchaseOrder' },
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
    { component: <TripSheetCreation />, path: '/erp/inventory/tripSheet/searchGodown' },
    { component: <StockInwards />, path: '/erp/inventory/stockInward' },
    { component: <StockMangement />, path: '/erp/inventory/stockProcessing' },
    { component: <StockManagementCreate />, path: '/erp/inventory/stockProcessing/create' },
    { component: <ArrivalList />, path: '/erp/inventory/arrivalList' },
    { component: <ArrivalMaster />, path: '/erp/inventory/arrivalEntry' },

    { component: <SalesConvert />, path: '/erp/sales/Tripsheet/Tripsheetcreation/SaleOrderconvert' },
    { component: <DeliveryTripSheetAdd />, path: '/erp/sales/Tripsheet/Tripsheetcreation' },
    { component: <DeliveryTripSheet />, path: '/erp/sales/Tripsheet' },

    // ERP - payments
    { component: <DisplayNavigations />, path: '/erp/payments' },
    { component: <PendingInvoice />, path: '/erp/payments/pendingPayments' },
    { component: <PaymentReport />, path: '/erp/payments/paymentReport' },
    { component: <PaymentsMasterList />, path: '/erp/payments/paymentList' },
    { component: <AddPaymentMaster />, path: '/erp/payments/paymentList/create' },
    { component: <AddPaymentReference />, path: '/erp/payments/paymentList/addReference' },
    { component: <PaymentReference />, path: '/erp/payments/pendingReference' },
    { component: <PaymentAccountTransaction />, path: '/erp/payments/accountTransaction' },
    { component: <ItemPaymentExpences />, path: '/erp/payments/itemExpences' },

    // ERP - receipts
    { component: <DisplayNavigations />, path: '/erp/receipt' },
    { component: <PaymentCollectionList />, path: '/erp/crm/paymentCollection' },
    { component: <PaymentCollectionCreate />, path: '/erp/crm/paymentCollection/create' },
    { component: <ReceiptList />, path: '/erp/receipts/listReceipts' },
    { component: <ReceiptsCreate />, path: '/erp/receipts/listReceipts/create' },
    { component: <ReceiptReferenceCreation />, path: '/erp/receipts/listReceipts/addReference' },
    { component: <TallyPendingReceipt />, path: '/erp/receipt/tallyPendingReceipt' },
    { component: <CustomerPendingReceipt />, path: '/erp/receipt/customerPendingReceipt' },
    { component: <PaymentCollectionReport />, path: '/erp/reports/paymentCollectionReport' },

    // ERP - CRM
    { component: <DisplayNavigations />, path: '/erp/crm' },
    { component: <VisitedLogs />, path: '/erp/crm/visitLogs' },   // TO BE ADDED
    { component: <CustomerClosingStockReport />, path: '/erp/crm/closingStock' },

    { component: <DisplayNavigations />, path: '/erp/reports' },
    { component: <CostCenterReports />, path: '/erp/reports/costCenter' },
    { component: <ClosingStockReportsProduct />, path: '/erp/reports/ClosingStock' },
    { component: <OutStanding />, path: '/erp/reports/outstanding' },


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
    { component: <LeaveType />, path: '/taskManagement/master/leaveType' },
    { component: <LeaveMaster />, path: '/taskManagement/master/leaveMaster' },

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
    { component: <VoucherType />, path: '/erp/master/voucherMaster' },
    { component: <AreaMaster />, path: '/erp/master/areaMaster' },
    { component: <RouteMaster />, path: '/erp/master/routeMaster' },
    // { component: <WorkDoneHistory />, path: '' }, // will not work
    // { component: <ItemBasedReport />, path: '' }, // will not work
    { component: <SalesDelivery />, path: '/erp/sales/salesDelivery' },
];

export default RoutingArray