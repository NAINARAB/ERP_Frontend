import { lazy } from 'react';
import './Pages/common.css';

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------
const CommonDashboard = lazy(() => import('./Pages/Dashboard/commonDashboard'));
const TallyReports = lazy(() => import('./Pages/Dashboard/tallyReport'));
const UserActivities = lazy(() => import('./Pages/Dashboard/userActivities'));

// -----------------------------------------------------------------------------
// Common
// -----------------------------------------------------------------------------
const ChangePassword = lazy(() => import('./Pages/changePassword'));
const DisplayNavigations = lazy(() => import('./Pages/SubMenu/DisplayNavigations'));
const BankDetails = lazy(() => import('./Pages/BankDetails/bank'));
const BankDetailsConvert=lazy(()=>import('./Pages/BankDetails/convertScreen'));
// -----------------------------------------------------------------------------
// Masters
// -----------------------------------------------------------------------------
const CompanyInfo = lazy(() => import('./Pages/Masters/CompanyInfo'));
const Users = lazy(() => import('./Pages/Masters/newUsers'));
const BranchInfo = lazy(() => import('./Pages/Masters/BranchInfo'));
const ProjectList = lazy(() => import('./Pages/Masters/ProjectList'));
const UserType = lazy(() => import('./Pages/Masters/UserType'));
const TaskType = lazy(() => import('./Pages/Masters/TaskType'));
const ProductsMaster = lazy(() => import('./Pages/Masters/newProduct'));
const PosMaster = lazy(() => import('./Pages/Masters/posMaster'));
const POSProductList = lazy(() => import('./Pages/Masters/posproductListing'));
const UomMaster = lazy(() => import('./Pages/Masters/uomMaster'));
const RateMaster = lazy(() => import('./Pages/Masters/rateMaster'));
const LeaveMaster = lazy(() => import('./Pages/Masters/LeaveMaster'));
const LeaveType = lazy(() => import('./Pages/Masters/LeaveType'));
const DefaultAccountMaster = lazy(() =>
    import('./Pages/Masters/defaultAccountMaster/listDefaultAccountMaster')
);
const Lom = lazy(() => import('./Pages/Masters/Lom'));
const Lollist = lazy(() => import('./Pages/Masters/lollist'));
const Loslist = lazy(() => import('./Pages/Masters/loslist'));
const ProductGroup = lazy(() => import('./Pages/Masters/ProductGroup'));
const ExpenseReport = lazy(() => import('./Pages/Masters/ExpenseReport'));
const CostCenterMap = lazy(() => import('./Pages/Masters/CostCenterMap'));
const AccountMaster = lazy(() => import('./Pages/Masters/AccountMaster'));
const AccountingGroup = lazy(() => import('./Pages/Masters/AccountingGroup'));
const StateMaster = lazy(() => import('./Pages/Masters/State'));
const GodownMaster = lazy(() => import('./Pages/Masters/Godown'));
const BrandMaster = lazy(() => import('./Pages/Masters/Brand'));
const DistrictMaster = lazy(() => import('./Pages/Masters/DistrictMaster'));
const TallyLolSyncDashboard = lazy(() => import('./Pages/Masters/TallyMasters/tallyLolSyncDashboard'));
const TallyLosSyncDashboard = lazy(() => import('./Pages/Masters/TallyMasters/tallyLosSyncDashboard'));
const AccountMasterSales = lazy(() => import('./Pages/Masters/AccountMasterSales'));
const ModuleParameters = lazy(() => import('./Pages/Masters/moduleParameters'));
const ItemGroupMaster=lazy(()=>import('./Pages/Masters/itemGroupMaster'));

const ItemGroupMasterCreate=lazy(()=>import('./Pages/Masters/itemGroupMasterCreate'))


const VoucherGroup=lazy(()=>import('./Pages/Masters/VoucherGroup'));
const VoucherGroupCreate=lazy(()=>import('./Pages/Masters/VoucherGroupCreate'))

// -----------------------------------------------------------------------------
// Authorization
// -----------------------------------------------------------------------------
const UserBased = lazy(() => import('./Pages/Authorization/userBased'));
const UserTypeBased = lazy(() => import('./Pages/Authorization/userTypeBased'));
const UserBasedBranch = lazy(() => import('./Pages/Authorization/userBasedBranch'));
const MenuManagement = lazy(() => import('./Pages/Authorization/newMenuManagement'));

// -----------------------------------------------------------------------------
// Tasks / Current Projects
// -----------------------------------------------------------------------------
const TaskMaster = lazy(() => import('./Pages/Tasks/newTasksPage'));
const TaskParameter = lazy(() => import('./Pages/Tasks/taskParameters'));
const TodayTasks = lazy(() => import('./Pages/Tasks/todaytasks'));
const ProcessMaster = lazy(() => import('./Pages/Tasks/processMaster'));
const ProjectSchedule = lazy(() => import('./Pages/Tasks/projectSchedules'));

const ActiveProjects = lazy(() => import('./Pages/CurrentProjects/projectsList'));
const ProjectDetails = lazy(() => import('./Pages/CurrentProjects/projectInfo'));
const TaskActivity = lazy(() => import('./Pages/CurrentProjects/taskActivity'));

// -----------------------------------------------------------------------------
// Discussion Forum
// -----------------------------------------------------------------------------
const Discussions = lazy(() => import('./Pages/Discussions/discussions'));
const ChatsDisplayer = lazy(() => import('./Pages/Discussions/chats'));

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------
const ReportCalendar = lazy(() => import('./Pages/Reports/calendar'));
const ReportTaskTypeBasedCalendar = lazy(() => import('./Pages/Reports/groupedReport'));
const ChartsReport = lazy(() => import('./Pages/Reports/chartReports'));
const EmployeeDayAbstract = lazy(() => import('./Pages/Reports/workDocument'));
const EmployeeAbstract = lazy(() => import('./Pages/Reports/employeeAbstract'));
const DayBookOfERP = lazy(() => import('./Pages/Reports/dayBook/dayBook'));
const DayBookDetails = lazy(() => import('./Pages/Reports/dayBook/dayBookDetails'));
const TripReports = lazy(() => import('./Pages/Reports/tripReports'));
const CostCenterReports = lazy(() => import('./Pages/Reports/costCenterReports'));
const ClosingStockReportsProduct = lazy(() => import('./Pages/Reports/productclosingStockReports'));
const OutStanding = lazy(() => import('./Pages/Reports/outstanding'));
const DeliveryReports = lazy(() => import('./Pages/Reports/deliveryReports'));
const StockInHand = lazy(() => import('./Pages/Reports/storageClosingStock/stockInHand'));
const ItemGroupWiseStockValue = lazy(() =>
    import('./Pages/Reports/storageClosingStock/itemGroupBasedStockValue')
);
const PurchaseBrokerageReport = lazy(() =>
    import('./Pages/Reports/CostCenterReports/purchaseBrokerageReport')
);
const NakalReports = lazy(() => import('./Pages/Reports/NakalReports/nakalReports'));
const PendingDetails = lazy(() => import('./Pages/Reports/PendingDetails'));
const OutstandingNew = lazy(() => import('./Pages/Reports/outStandingNew'));
const StockPaper = lazy(() => import('./Pages/Reports/smtstockPaper'));
const PaymentCollectionReport = lazy(() => import('./Pages/Reports/paymentCollectionReport'));
const CustomerClosingStockReport = lazy(() => import('./Pages/Reports/CRM/customerClosingStockReport'));
const ClosingStockReportTwo = lazy(() => import('./Pages/Reports/CRM/closingStockReport2'));
const ReturnSales = lazy(() => import('./Pages/Reports/returnSales'));
const PartyGroupOutstanding = lazy(() => import('./Pages/Reports/PartyGroupOutstanding/groupOutstanding'));

// -----------------------------------------------------------------------------
// Attendance
// -----------------------------------------------------------------------------
const AttendanceReportForEmployee = lazy(() => import('./Pages/Attendance/attendanceReportForEmp'));
const AttendanceReport = lazy(() => import('./Pages/Attendance/attendanceReport'));
const VisitedLogs = lazy(() => import('./Pages/Attendance/visitLogs'));
const FingerPrintAttendanceReport = lazy(() => import('./Pages/Attendance/fingerPrintAttendance'));

// -----------------------------------------------------------------------------
// User Module
// -----------------------------------------------------------------------------
const CustomerList = lazy(() => import('./Pages/UserModule/customerList'));
const EmployeeMaster = lazy(() => import('./Pages/UserModule/employee'));
const RetailersMaster = lazy(() => import('./Pages/UserModule/retailer/Retailer'));
const CostCategory = lazy(() => import('./Pages/UserModule/costCenterType'));
const VoucherType = lazy(() => import('./Pages/UserModule/voucherMaster'));
const RouteMaster = lazy(() => import('./Pages/UserModule/routeMaster'));
const AreaMaster = lazy(() => import('./Pages/UserModule/areaMaster'));
const ActivityTracking = lazy(() => import('./Pages/UserModule/activityTracking'));

// -----------------------------------------------------------------------------
// Sales
// -----------------------------------------------------------------------------
const SalesReport = lazy(() => import('./Pages/Sales/salesReports'));
const SaleOrderList = lazy(() => import('./Pages/Sales/SaleOrder/saleOrderList'));
const SaleOrderCreation = lazy(() => import('./Pages/Sales/SaleOrder/saleOrderCreation'));
const PartySalesReport = lazy(() => import('./Pages/Sales/partyWiseReport'));
const SalesInvoiceList = lazy(() => import('./Pages/Sales/SalesInvoice/salesInvoiceList'));
const SalesInvoiceCreation = lazy(() => import('./Pages/Sales/SalesInvoice/salesInvoiceCreation'));
const PreSaleorder = lazy(() => import('./Pages/Sales/PreSaleOrder/orderList'));
const SalesInvoiceListLRReport = lazy(() => import('./Pages/Sales/LRReport/listSales'));
const SalesInvoicePaper = lazy(() => import('./Pages/Sales/SalesPeper/salesPaper'));
const SalesPendingDetails = lazy(() => import('./Pages/Sales/SaleOrder/SalesPendingDetails'));
const SalesDelivery = lazy(() => import('./Pages/Sales/SalesReportComponent/SalesDeliveryConvert'));
const SalesReportBranch = lazy(() => import('./Pages/Sales/salesInvoiceReportBranch'));
const SalesOrderBranch = lazy(() => import('./Pages/Sales/salesOrderReportBranch'));
const LrReport = lazy(() => import('./Pages/Sales/lrReport'));
const Whatsapp = lazy(() => import('./Pages/Sales/SaleOrder/Whatsapp'));

const DeliveryTripSheet = lazy(() => import('./Pages/Sales/TripMaster/DeliveryTripSheet'));
const DeliveryTripSheetAdd = lazy(() => import('./Pages/Sales/TripMaster/DeliveryTripSheetAdd'));
const SalesConvert = lazy(() => import('./Pages/Sales/TripMaster/SalesDeliveryAdd'));

// -----------------------------------------------------------------------------
// Credit Note / Debit Note
// -----------------------------------------------------------------------------
const CreditNoteList = lazy(() => import('./Pages/CreditNote/listCreditNote'));
const CreditNoteCreation = lazy(() => import('./Pages/CreditNote/CreationComp/CreditNoteCreation'));

const DebitNoteList = lazy(() => import('./Pages/DebitNote/listDebitNote'));
const DebitNoteCreation = lazy(() => import('./Pages/DebitNote/CreationComp/DebitNoteCreation'));

// -----------------------------------------------------------------------------
// Inventory
// -----------------------------------------------------------------------------
const StockReport = lazy(() => import('./Pages/Inventry/stockReport'));
const LiveStockReport = lazy(() => import('./Pages/Inventry/liveStockReport'));
const TallyStockJournalList = lazy(() => import('./Pages/Inventry/tallyStockJournal'));
const StockJournal = lazy(() => import('./Pages/Inventry/stockJournal'));
const StockJournalEntry = lazy(() => import('./Pages/Inventry/stockJournalCreate'));
const TripSheets = lazy(() => import('./Pages/Inventry/TripMaster/TripSheets'));
const TripSheetCreation = lazy(() => import('./Pages/Inventry/TripMaster/TripSheetCreation'));
const StockInwards = lazy(() => import('./Pages/Inventry/stockInward'));
const StockMangement = lazy(() => import('./Pages/Inventry/Processing/listProcessing'));
const StockManagementCreate = lazy(() => import('./Pages/Inventry/Processing/AddProcessing'));
const ArrivalMaster = lazy(() => import('./Pages/Inventry/TripMaster/arrivalMaster'));
const BatchAssign = lazy(() => import('./Pages/Inventry/BatchManagement/batchAssign'));
const BatchListing = lazy(() => import('./Pages/Inventry/BatchManagement/batchList'));
const InventoryTrunoverReport = lazy(() => import('./Pages/Inventry/turnOverReport'));

const StockJournalAdjustmentCreate = lazy(() => import('./Pages/Inventry/StockJournalAdjustmentCreate'));
const StockJournalAdjustment = lazy(() => import('./Pages/Inventry/StockJournalAdjustment')); 


// -----------------------------------------------------------------------------
// Journal
// -----------------------------------------------------------------------------
const JournalListing = lazy(() => import('./Pages/Journal/JournalMaster/journalList'));
const JournalCreate = lazy(() => import('./Pages/Journal/JournalMaster/journalCreate'));
const AccountBalance = lazy(() => import('./Pages/Journal/JournalReport/accountBalance'));

// -----------------------------------------------------------------------------
// Purchase
// -----------------------------------------------------------------------------
const PurchaseOrderEntries = lazy(() => import('./Pages/Purchase/PurchaseOrder/purchaseOrderList'));
const PurchaseOrderDataEntry = lazy(() => import('./Pages/Purchase/PurchaseOrder/purchaseOrderCreation'));
const PurchaseReport = lazy(() => import('./Pages/Purchase/purchaseReport'));
const PurchaseReportForCustomer = lazy(() => import('./Pages/Purchase/purchaseReportForCustomer'));
const PurchaseOrderTallyBasedReport = lazy(() => import('./Pages/Purchase/tallyBasedReport'));
const PurchaseInvoiceCreate = lazy(() => import('./Pages/Purchase/PurchaseInvoice/purchaseInvoiceCreate'));
const PurchaseInvoces = lazy(() => import('./Pages/Purchase/purchaseInvoices'));
const PurchasePaymentDue = lazy(() => import('./Pages/Purchase/PurchaseReport/paymentDue'));

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------
const PendingInvoice = lazy(() => import('./Pages/Payments/pendingInvoice'));
const PaymentReport = lazy(() => import('./Pages/Payments/paymentReport'));
const PaymentsMasterList = lazy(() => import('./Pages/Payments/PaymentMaster/listPayments'));
const AddPaymentMaster = lazy(() => import('./Pages/Payments/PaymentMaster/addPayments'));
const AddPaymentReference = lazy(() => import('./Pages/Payments/PaymentMaster/addReference'));
const PaymentReference = lazy(() => import('./Pages/Payments/PaymentReport/pendingReference'));
const PaymentAccountTransaction = lazy(() => import('./Pages/Payments/PaymentReport/accountTransaction'));
const ItemPaymentExpences = lazy(() => import('./Pages/Payments/PaymentReport/itemExpences'));
const PaymentOutstanding = lazy(() => import('./Pages/Payments/PaymentReport/paymentOutstanding'));
const PaymentDue = lazy(() => import('./Pages/Payments/PaymentReport/paymentDue'));

// -----------------------------------------------------------------------------
// Receipts
// -----------------------------------------------------------------------------
const PaymentCollectionList = lazy(() => import('./Pages/Receipts/collcetionModule/listReceipts'));
const PaymentCollectionCreate = lazy(() => import('./Pages/Receipts/collcetionModule/createReceipts'));
const TallyPendingReceipt = lazy(() => import('./Pages/Receipts/outstandingReports/tallyPendingReceipt'));
const ReceiptList = lazy(() => import('./Pages/Receipts/ReceiptMaster/listReceipts'));
const ReceiptsCreate = lazy(() => import('./Pages/Receipts/ReceiptMaster/addReceipt'));
const ReceiptReferenceCreation = lazy(() => import('./Pages/Receipts/ReceiptMaster/addReference'));
const CustomerPendingReceipt = lazy(() => import('./Pages/Receipts/outstandingReports/customerPendingReceipt'));

// -----------------------------------------------------------------------------
// Contra
// -----------------------------------------------------------------------------
const ContraList = lazy(() => import('./Pages/Contra/master/ListContra'));
const ContraCreate = lazy(() => import('./Pages/Contra/master/ContraCreate'));

// -----------------------------------------------------------------------------
// Data Entry
// -----------------------------------------------------------------------------
const DriverActivities = lazy(() => import('./Pages/DataEntry/newDriverActivities'));
const GodownActivity = lazy(() => import('./Pages/DataEntry/godownActivity'));
const DeliveryActivity = lazy(() => import('./Pages/DataEntry/deliveryActivity'));
const StaffActivity = lazy(() => import('./Pages/DataEntry/staffActivity'));
const ActivityImagesUpload = lazy(() => import('./Pages/DataEntry/fileUploads'));
const WeightCheckActivity = lazy(() => import('./Pages/DataEntry/WeightCheckActivity'));
const DataEntryAttendance = lazy(() => import('./Pages/DataEntry/dataEntryAttendance'));
const CostCenter = lazy(() => import('./Pages/DataEntry/costCenter'));

// -----------------------------------------------------------------------------
// Analytics
// -----------------------------------------------------------------------------
const DataEntryAbstract = lazy(() => import('./Pages/Analytics/entryInfo'));
const QPayReports = lazy(() => import('./Pages/Analytics/QPayReports2'));
const SalesTransaction = lazy(() => import('./Pages/Analytics/SalesReport'));
const SalesComparisonTabs = lazy(() =>
    import('./Pages/Analytics/dataComparison/SalesComparison/salesTabs')
);
const PurchaseComparisonTabs = lazy(() =>
    import('./Pages/Analytics/dataComparison/PurchaseComparison/purchaseTabs')
);
const ReportTemplateCreation = lazy(() => import('./Pages/Analytics/reportTemplateCreation'));
const ReportTemplates = lazy(() => import('./Pages/Analytics/reportTemplates'));
const ReportTemplatesMobile = lazy(() => import('./Pages/Analytics/reportTemplatesMobile'));
const ReportsTemplateMobCreation = lazy(() => import('./Pages/Analytics/reportsTemplateMobCreation'));

// -----------------------------------------------------------------------------
// Project Reports
// -----------------------------------------------------------------------------
const ProjectReports = lazy(() => import('./Pages/ProjectReports/reports'));


const RoutingArray = [
    // ---------------------------------------------------------------------------
    // Root
    // ---------------------------------------------------------------------------
    { component: <CommonDashboard />, path: '/' },
    { component: <CommonDashboard />, path: '/dashboard' },
    { component: <ChangePassword />, path: '/changePassword' },

    // ---------------------------------------------------------------------------
    // Analytics
    // ---------------------------------------------------------------------------
    { component: <QPayReports />, path: '/analytics/qPay' },
    { component: <SalesTransaction />, path: '/analytics/qPay/transaction' },
    { component: <DisplayNavigations />, path: '/analytics/syncStatus' },
    { component: <PurchaseComparisonTabs />, path: '/analytics/syncStatus/purchaseInvoiceSync' },
    { component: <SalesComparisonTabs />, path: '/analytics/syncStatus/salesSync' },
    { component: <ReportTemplates />, path: '/analytics/templates' },
    { component: <ReportTemplateCreation />, path: '/analytics/templates/create' },
    { component: <ReportTemplatesMobile />, path: '/analytics/templates-mobile' },
    { component: <ReportsTemplateMobCreation />, path: '/analytics/templates-mobile/create' },

    // ---------------------------------------------------------------------------
    // Data Entry
    // ---------------------------------------------------------------------------
    { component: <CostCenter />, path: '/dataEntry/costCenter' },
    { component: <DeliveryActivity />, path: '/dataEntry/deliveryActivity' },
    { component: <DriverActivities />, path: '/dataEntry/driverActivity' },
    { component: <GodownActivity />, path: '/dataEntry/godownActivity' },
    { component: <ActivityImagesUpload />, path: '/dataEntry/imageUpload' },
    { component: <DataEntryAbstract />, path: '/dataEntry/report' },
    { component: <StaffActivity />, path: '/dataEntry/staffActivity' },
    { component: <DataEntryAttendance />, path: '/dataEntry/staffAttendance' },
    { component: <WeightCheckActivity />, path: '/dataEntry/weightCheckingActivity' },

    // ---------------------------------------------------------------------------
    // ERP - Bank
    // ---------------------------------------------------------------------------
    { component: <BankDetails />, path: '/erp/bankReports/bankList' },
    { component: <BankDetailsConvert />, path: '/erp/bankReports/bankList/convertScreen' },

    // ---------------------------------------------------------------------------
    // ERP - Batch Management
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/batchManagement' },
    { component: <BatchAssign />, path: '/erp/batchManagement/batchCreation' },
    { component: <BatchListing />, path: '/erp/batchManagement/batchList' },

    // ---------------------------------------------------------------------------
    // ERP - Contra
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/contra' },
    { component: <ContraList />, path: '/erp/contra/contraList' },
    { component: <ContraCreate />, path: '/erp/contra/contraList/create' },

    // ---------------------------------------------------------------------------
    // ERP - CRM
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/crm' },
    { component: <ClosingStockReportTwo />, path: '/erp/crm/closingStockReport' },
    { component: <CustomerClosingStockReport />, path: '/erp/crm/closingStock' },
    { component: <PaymentCollectionList />, path: '/erp/crm/paymentCollection' },
    { component: <PaymentCollectionCreate />, path: '/erp/crm/paymentCollection/create' },
    { component: <VisitedLogs />, path: '/erp/crm/visitLogs' },

    // ---------------------------------------------------------------------------
    // ERP - Day Book
    // ---------------------------------------------------------------------------
    { component: <DayBookOfERP />, path: '/erp/dayBook' },
    { component: <DayBookDetails />, path: '/erp/dayBook/details' },

    // ---------------------------------------------------------------------------
    // ERP - Inventory
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/inventory' },
    { component: <ArrivalMaster />, path: '/erp/inventory/arrivalEntry' },
    { component: <LiveStockReport />, path: '/erp/inventory/losStockReport' },
    { component: <StockInwards />, path: '/erp/inventory/stockInward' },
    { component: <StockJournal />, path: '/erp/inventory/stockJournal' },
    { component: <StockJournalEntry />, path: '/erp/inventory/stockJournal/create' },
    { component: <StockMangement />, path: '/erp/inventory/stockProcessing' },
    { component: <StockManagementCreate />, path: '/erp/inventory/stockProcessing/create' },
    { component: <StockReport />, path: '/erp/inventory/stockReport' },
    { component: <TallyStockJournalList />, path: '/erp/inventory/tallyStockJournal' },
    { component: <TripSheets />, path: '/erp/inventory/tripSheet' },
    { component: <TripSheetCreation />, path: '/erp/inventory/tripSheet/searchGodown' },
    { component: <InventoryTrunoverReport />, path: '/erp/inventory/trunOverReport' },
    { component: <StockJournalAdjustmentCreate />, path :'/erp/inventory/StockJournalAdjustment/Create'},
    
    {component : <StockJournalAdjustment/> ,path : '/erp/inventory/StockJournalAdjustment'},
    // ---------------------------------------------------------------------------
    // ERP - Journal
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/journal' },
    { component: <AccountBalance />, path: '/erp/journal/accountBalance' },
    { component: <JournalListing />, path: '/erp/journal/journalList' },
    { component: <JournalCreate />, path: '/erp/journal/journalList/create' },

    // ---------------------------------------------------------------------------
    // ERP - Master
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/master' },
    { component: <AccountMaster />, path: '/erp/master/accountMaster' },
    { component: <AccountingGroup />, path: '/erp/master/accountingGroup' },
    { component: <AccountMasterSales />, path: '/erp/master/AccountMasterSales' },
    { component: <ModuleParameters />, path: '/erp/master/moduleParameters' },
    { component: <AreaMaster />, path: '/erp/master/areaMaster' },
    { component: <BrandMaster />, path: '/erp/master/brand' },
    { component: <CostCenterMap />, path: '/erp/master/CostCenterMap' },
    { component: <DefaultAccountMaster />, path: '/erp/master/defaultAccountMaster' },
    { component: <DistrictMaster />, path: '/erp/master/district' },
    { component: <ExpenseReport />, path: '/erp/master/ExpenseReport' },
    { component: <GodownMaster />, path: '/erp/master/godown' },
    { component: <Lollist />, path: '/erp/master/lollist' },
    { component: <Lom />, path: '/erp/master/lom' },
    { component: <Loslist />, path: '/erp/master/loslist' },
    { component: <POSProductList />, path: '/erp/master/POSProductList' },
    { component: <PosMaster />, path: '/erp/master/posMaster' },
    { component: <ProductGroup />, path: '/erp/master/productGroup' },
    { component: <ProductsMaster />, path: '/erp/master/products' },
    { component: <RateMaster />, path: '/erp/master/RateMaster' },
    { component: <RetailersMaster />, path: '/erp/master/retailers' },
    { component: <RouteMaster />, path: '/erp/master/routeMaster' },
    { component: <StateMaster />, path: '/erp/master/state' },
    { component: <TallyLolSyncDashboard />, path: '/erp/master/tallyLOL' },
    { component: <TallyLosSyncDashboard />, path: '/erp/master/tallyLOS' },
    { component: <UomMaster />, path: '/erp/master/uomMaster' },
    { component: <VoucherType />, path: '/erp/master/voucherMaster' },
    { component: <ItemGroupMaster />, path: '/erp/master/itemGroupMaster' },
    { component: <ItemGroupMasterCreate/>, path: '/erp/master/itemGroupMaster/Create' },

    {component :<VoucherGroup/>,path: '/erp/master/VoucherGroup'},
    {component: <VoucherGroupCreate/>, path: '/erp/master/VoucherGroup/Create' },
    
 
    // ---------------------------------------------------------------------------
    // ERP - Payments
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/payments' },
    { component: <PaymentAccountTransaction />, path: '/erp/payments/accountTransaction' },
    { component: <ItemPaymentExpences />, path: '/erp/payments/itemExpences' },
    { component: <PaymentOutstanding />, path: '/erp/payments/paymentOutstanding' },
    { component: <PaymentsMasterList />, path: '/erp/payments/paymentList' },
    { component: <AddPaymentReference />, path: '/erp/payments/paymentList/addReference' },
    { component: <AddPaymentMaster />, path: '/erp/payments/paymentList/create' },
    { component: <PaymentReference />, path: '/erp/payments/pendingReference' },
    { component: <PendingInvoice />, path: '/erp/payments/pendingPayments' },
    { component: <PaymentReport />, path: '/erp/payments/paymentReport' },

    // ---------------------------------------------------------------------------
    // ERP - Purchase
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/purchase' },
    { component: <PurchaseInvoiceCreate />, path: '/erp/purchase/invoice/create' },
    { component: <PurchaseInvoces />, path: '/erp/purchase/invoice' },
    { component: <PurchaseReportForCustomer />, path: '/erp/purchase/myPurchase' },
    { component: <PurchaseOrderEntries />, path: '/erp/purchase/purchaseOrder' },
    { component: <PurchaseOrderDataEntry />, path: '/erp/purchase/purchaseOrder/create' },
    { component: <PurchasePaymentDue />, path: '/erp/purchase/purchasePayemntDue' },
    { component: <PurchaseReport />, path: '/erp/purchase/purchaseReport' },
    { component: <PaymentDue />, path: '/erp/purchase/paymentdure' },
    { component: <PurchaseOrderTallyBasedReport />, path: '/erp/purchase/tallyBasedReport' },

    // ---------------------------------------------------------------------------
    // ERP - Receipt / Receipts
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/receipt' },
    { component: <CustomerPendingReceipt />, path: '/erp/receipt/customerPendingReceipt' },
    { component: <TallyPendingReceipt />, path: '/erp/receipt/tallyPendingReceipt' },

    { component: <ReceiptsCreate />, path: '/erp/receipts/listReceipts/create' },
    { component: <ReceiptReferenceCreation />, path: '/erp/receipts/listReceipts/addReference' },
    { component: <ReceiptList />, path: '/erp/receipts/listReceipts' },

    // ---------------------------------------------------------------------------
    // ERP - Reports
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/reports' },
    { component: <ClosingStockReportsProduct />, path: '/erp/reports/ClosingStock' },
    { component: <CostCenterReports />, path: '/erp/reports/costCenter' },
    { component: <DeliveryReports />, path: '/erp/reports/deliveryReports' },
    { component: <ItemGroupWiseStockValue />, path: '/erp/reports/itemBasedStockValue' },
    { component: <NakalReports />, path: '/erp/reports/nakalReports' },
    { component: <OutstandingNew />, path: '/erp/reports/OutstandingNew' },
    { component: <OutStanding />, path: '/erp/reports/outstanding' },
    { component: <PaymentCollectionReport />, path: '/erp/reports/paymentCollectionReport' },
    { component: <PendingDetails />, path: '/erp/reports/PendingDetails' },
    { component: <PurchaseBrokerageReport />, path: '/erp/reports/purchaseBrokerage' },
    { component: <ReturnSales />, path: '/erp/reports/returnSales' },
    { component: <PartyGroupOutstanding />, path: '/erp/reports/groupOutstanding' },
    { component: <StockInHand />, path: '/erp/reports/stockInHand' },
    { component: <StockPaper />, path: '/erp/reports/smstockPaper' },
    { component: <TripReports />, path: '/erp/reports/tripReports' },

    // ---------------------------------------------------------------------------
    // ERP - Sales
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/sales' },
    { component: <SalesPendingDetails />, path: '/erp/Sales/SalesPendingDetails' },
    { component: <Whatsapp />, path: '/erp/Sales/Whatsapp' },
    { component: <SalesInvoiceList />, path: '/erp/sales/invoice' },
    { component: <SalesInvoiceCreation />, path: '/erp/sales/invoice/create' },
    { component: <SalesInvoiceListLRReport />, path: '/erp/sales/lrReport' },
    { component: <PartySalesReport />, path: '/erp/sales/partyBasedReport' },
    { component: <PreSaleorder />, path: '/erp/sales/PreSaleorder' },
    { component: <SaleOrderList />, path: '/erp/sales/saleOrder' },
    { component: <SaleOrderCreation />, path: '/erp/sales/saleOrder/create' },
    { component: <SalesDelivery />, path: '/erp/sales/salesDelivery' },
    { component: <SalesInvoicePaper />, path: '/erp/sales/salesInvoicePaper' },
    { component: <SalesReport />, path: '/erp/sales/salesReport' },
    { component: <SalesReportBranch />, path: '/erp/sales/salesReportBranch' },
    { component: <SalesOrderBranch />, path: '/erp/sales/salesOrderReport' },
    { component: <DeliveryTripSheet />, path: '/erp/sales/Tripsheet' },
    { component: <DeliveryTripSheetAdd />, path: '/erp/sales/Tripsheet/Tripsheetcreation' },
    { component: <SalesConvert />, path: '/erp/sales/Tripsheet/Tripsheetcreation/SaleOrderconvert' },


    // ---------------------------------------------------------------------------
    // Debit Note
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/debitNote' },
    { component: <DebitNoteList />, path: '/erp/debitNote/list' },
    { component: <DebitNoteCreation />, path: '/erp/debitNote/list/create' },

    // ---------------------------------------------------------------------------
    // Credit Note
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/erp/creditNote' },
    { component: <CreditNoteList />, path: '/erp/creditNote/list' },
    { component: <CreditNoteCreation />, path: '/erp/creditNote/list/create' },


    // ---------------------------------------------------------------------------
    // Task Management
    // ---------------------------------------------------------------------------
    { component: <DisplayNavigations />, path: '/taskManagement/attendance' },
    { component: <AttendanceReportForEmployee />, path: '/taskManagement/attendance/employee' },
    { component: <FingerPrintAttendanceReport />, path: '/taskManagement/attendance/fingerPrints' },
    { component: <AttendanceReport />, path: '/taskManagement/attendance/salesPerson' },

    { component: <Discussions />, path: '/taskManagement/discussions' },
    { component: <ChatsDisplayer />, path: '/taskManagement/discussions/chats' },

    { component: <DisplayNavigations />, path: '/taskManagement/master' },
    { component: <LeaveMaster />, path: '/taskManagement/master/leaveMaster' },
    { component: <LeaveType />, path: '/taskManagement/master/leaveType' },
    { component: <TaskParameter isOpened={true} disableCollapse={true} />, path: '/taskManagement/master/parameters' },
    { component: <ProcessMaster />, path: '/taskManagement/master/processMaster' },
    { component: <ProjectList />, path: '/taskManagement/master/projects' },
    { component: <ProjectSchedule />, path: '/taskManagement/master/projectSchedules' },
    { component: <TaskMaster />, path: '/taskManagement/master/tasks' },
    { component: <TaskType />, path: '/taskManagement/master/taskTypes' },

    { component: <TodayTasks />, path: '/taskManagement/myTasks' },

    { component: <ProjectDetails />, path: '/taskManagement/projectActivity/projectDetails' },
    { component: <TaskActivity />, path: '/taskManagement/projectActivity/projectDetails/taskActivity' },
    { component: <ActiveProjects />, path: '/taskManagement/projectActivity' },

    { component: <DisplayNavigations />, path: '/taskManagement/report' },
    { component: <ChartsReport />, path: '/taskManagement/report/activityGraph' },
    { component: <ReportCalendar />, path: '/taskManagement/report/calendar' },
    { component: <ReportTaskTypeBasedCalendar />, path: '/taskManagement/report/calendarTaskGroup' },
    { component: <ProjectReports />, path: '/taskManagement/report/projectReports' },
    { component: <TallyReports />, path: '/taskManagement/report/tallyActivity' },
    { component: <EmployeeDayAbstract />, path: '/taskManagement/report/todayActivity' },
    { component: <UserActivities />, path: '/taskManagement/report/userActivities' },
    { component: <EmployeeAbstract />, path: '/taskManagement/report/userDetails' },

    // ---------------------------------------------------------------------------
    // User Control
    // ---------------------------------------------------------------------------
    { component: <ActivityTracking />, path: '/userControl/activityTracking' },
    { component: <MenuManagement />, path: '/userControl/appMenu' },
    { component: <BranchInfo />, path: '/userControl/branch' },
    { component: <CompanyInfo />, path: '/userControl/company' },
    { component: <CostCategory />, path: '/userControl/CostCategory' },
    { component: <CustomerList />, path: '/userControl/customers' },
    { component: <EmployeeMaster />, path: '/userControl/employees' },
    { component: <UserBasedBranch />, path: '/userControl/userBasedBranchRights' },
    { component: <UserBased />, path: '/userControl/userRights' },
    { component: <UserType />, path: '/userControl/userType' },
    { component: <UserTypeBased />, path: '/userControl/userTypeRights' },
    { component: <Users />, path: '/userControl/users' },
];

export default RoutingArray;