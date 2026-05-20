// import {
//     Button,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     IconButton,
//     Tooltip,
// } from "@mui/material";
// import {
//     ISOString,
//     isValidDate,
//     NumberFormat,
//     toArray,
//     Addition,
// } from "../../Components/functions";
// import { fetchLink } from "../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../Components/filterableTable2";
// import Select from "react-select";
// import { useEffect, useState, useMemo } from "react";
// import { FilterAlt, Search, FilterAltOff } from "@mui/icons-material";
// import { useLocation, useNavigate } from "react-router-dom";
// import { customSelectStyles } from "../../Components/tablecolumn";

// const useQuery = () => new URLSearchParams(useLocation().search);

// const defaultFilters = {
//     fromDate: ISOString(),
//     toDate: ISOString(),
// };

// const defaultFilterDropDown = {
//     voucherType: [],
//     retailers: [],
//     collectionType: [],
//     paymentStatus: [],
//     collectedBy: [],
// };

// const Outstanding = ({ loadingOn, loadingOff }) => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const query = useQuery();
//     const storage = JSON.parse(localStorage.getItem("user"));

//     const [allAccounts, setAllAccounts] = useState([]);
//     const [viewType, setViewType] = useState("debtors");

//     const [accountOptions, setAccountOptions] = useState([]);
//     const [groupOptions, setGroupOptions] = useState([]);

//     const [filters, setFilters] = useState({
//         fromDate: defaultFilters.fromDate,
//         toDate: defaultFilters.toDate,
//         fetchFrom: defaultFilters.fromDate,
//         fetchTo: defaultFilters.toDate,
//         Account_Id: "",
//         Group_Name: "",
//         filterDialog: false,
//         refresh: false,
//     });

//     const [drowDownValues, setDropDownValues] = useState(defaultFilterDropDown);

//     useEffect(() => {
//         fetchLink({ address: `receipt/filterValues` })
//             .then((data) => {
//                 if (data.success) {
//                     setDropDownValues({
//                         voucherType: toArray(data?.others?.voucherType),
//                     });
//                 }
//             })
//             .catch(console.error);

//         fetchAllAccounts();
//     }, [storage?.Company_id]);

//     const resetFilters = () => {
//         setFilters({
//             ...defaultFilters,
//             fetchFrom: defaultFilters.fromDate,
//             fetchTo: defaultFilters.toDate,
//             Account_Id: "",
//             Group_Name: "",
//             filterDialog: false,
//             refresh: false,
//         });

//         updateQueryString({
//             fromDate: defaultFilters.fromDate,
//             toDate: defaultFilters.toDate,
//             Account_Id: "",
//             Group_Name: "",
//         });

//         fetchAllAccounts();
//     };

//     const fetchAllAccounts = () => {
//         if (loadingOn) loadingOn();
//         fetchLink({
//             address: `payment/getDebtorDetails?fromDate=${filters?.fromDate}&toDate=${filters?.toDate}`,
//             method: "GET",
//         })
//             .then((data) => {
//                 if (data.success) setAllAccounts(data.data || []);
//             })
//             .finally(() => loadingOff && loadingOff())
//             .catch(console.error);
//     };

//     useEffect(() => {
//         if (Array.isArray(allAccounts)) {
//             const accOpts = allAccounts.map((a) => ({
//                 value: a.Acc_Id,
//                 label: a.Account_name,
//             }));

//             const grpOpts = [
//                 ...new Map(
//                     allAccounts.map((a) => [
//                         a.Group_Name,
//                         { value: a.Group_Name, label: a.Group_Name },
//                     ])
//                 ).values(),
//             ];

//             setAccountOptions([{ value: "", label: "ALL" }, ...accOpts]);
//             setGroupOptions([{ value: "", label: "ALL" }, ...grpOpts]);
//         }
//     }, [allAccounts]);

//     const tableData = useMemo(() => {
//         if (!Array.isArray(allAccounts)) return [];

//         return allAccounts.filter((item) => {
//             const balance = parseFloat(item?.Bal_Amount || 0);

//             // Skip zero balances
//             if (balance === 0) return false;

//             // Filter by account type
//             if (viewType === "debtors" && item.Account_Types !== "Debtor") return false;
//             if (viewType === "creditors" && item.Account_Types !== "Creditor") return false;

//             if (filters.Account_Id && item.Acc_Id !== filters.Account_Id)
//                 return false;
//             if (filters.Group_Name && item.Group_Name !== filters.Group_Name)
//                 return false;

//             return true;
//         });
//     }, [allAccounts, viewType, filters.Account_Id, filters.Group_Name]);

//     const Total_Debit = useMemo(() => {
//         return tableData.reduce((acc, item) => Addition(acc, parseFloat(item?.Dr_Amount || 0)), 0);
//     }, [tableData]);

//     const Total_Credit = useMemo(() => {
//         return tableData.reduce((acc, item) => Addition(acc, parseFloat(item?.Cr_Amount || 0)), 0);
//     }, [tableData]);

//     const Total_Outstanding = useMemo(() => {
//         return Total_Debit - Total_Credit;
//     }, [Total_Debit, Total_Credit]);

//     useEffect(() => {
//         const queryFilters = {
//             fromDate:
//                 query.get("fromDate") && isValidDate(query.get("fromDate"))
//                     ? query.get("fromDate")
//                     : defaultFilters.fromDate,
//             toDate:
//                 query.get("toDate") && isValidDate(query.get("toDate"))
//                     ? query.get("toDate")
//                     : defaultFilters.toDate,
//         };
//         setFilters((pre) => ({
//             ...pre,
//             fetchFrom: queryFilters.fromDate,
//             fetchTo: queryFilters.toDate,
//         }));
//     }, [location.search]);

//     const updateQueryString = (newFilters) => {
//         const params = new URLSearchParams(newFilters);
//         navigate(`?${params.toString()}`, { replace: true });
//     };

//     const closeDialog = () => {
//         setFilters((pre) => ({ ...pre, filterDialog: false }));
//     };

//     return (
//         <>
//             <FilterableTable
//                 title={
//                     viewType === "debtors"
//                         ? "Debtors Outstanding"
//                         : "Creditors Outstanding"
//                 }
//                 ButtonArea={
//                     <div className="d-flex justify-content-between align-items-center w-100">
//                         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                             <Button
//                                 variant={viewType === "debtors" ? "contained" : "outlined"}
//                                 onClick={() => setViewType("debtors")}
//                                 size="small"
//                             >
//                                 Debtors
//                             </Button>
//                             <Button
//                                 variant={viewType === "creditors" ? "contained" : "outlined"}
//                                 onClick={() => setViewType("creditors")}
//                                 size="small"
//                             >
//                                 Creditors
//                             </Button>
//                             <div className="d-flex align-items-center">
//                                 <Tooltip title="Filters">
//                                     <IconButton
//                                         size="small"
//                                         onClick={() => setFilters({ ...filters, filterDialog: true })}
//                                     >
//                                         <FilterAlt />
//                                     </IconButton>
//                                 </Tooltip>
//                                 <Tooltip title="Reset Filters">
//                                     <IconButton size="small" onClick={resetFilters}>
//                                         <FilterAltOff />
//                                     </IconButton>
//                                 </Tooltip>
//                             </div>
//                         </div>

//                         <div className="d-flex flex-column align-items-end">
//                             <div className="d-flex align-items-center">
//                                 <span className="text-muted me-2">Total {viewType === "debtors" ? "Debtors" : "Creditors"} Debit:</span>
//                                 <strong>{NumberFormat(Total_Debit)}</strong>
//                             </div>
//                             <div className="d-flex align-items-center">
//                                 <span className="text-muted me-2">Total {viewType === "debtors" ? "Debtors" : "Creditors"} Credit:</span>
//                                 <strong>{NumberFormat(Total_Credit)}</strong>
//                             </div>
//                             <div className="d-flex align-items-center">
//                                 <span className="text-muted me-2">Total Outstanding:</span>
//                                 <strong className={Total_Outstanding >= 0 ? "text-danger" : "text-success"}>
//                                     {NumberFormat(Math.abs(Total_Outstanding))} {Total_Outstanding >= 0 ? "DR" : "CR"}
//                                 </strong>
//                             </div>
//                         </div>
//                     </div>
//                 }
//                 EnableSerialNumber
//                 ExcelPrintOption={true}
//                 dataArray={tableData}
//                 headerFontSizePx={14}
//                 bodyFontSizePx={13}
//                 columns={[
//                     // createCol("Acc_Id", "string", "Account ID"),
                    
//                     createCol("Account_name", "string", "Account Name"),
//                     createCol("Group_Name", "string", "Group"),
//                     {
//                         ...createCol("Account_Types", "string", "Account Type"),
//                         isVisible: 1
//                     },
//                     {
//                         ...createCol("OB_Amount", "number", "Opening Balance"),
//                         format: (value) => NumberFormat(value || 0)
//                     },
//                     {
//                         ...createCol("Dr_Amount", "number", "Debit Amount"),
//                         format: (value) => NumberFormat(value || 0)
//                     },
//                     {
//                         ...createCol("Cr_Amount", "number", "Credit Amount"),
//                         format: (value) => NumberFormat(value || 0)
//                     },
//                     createCol("CR_DR", "string", "Type"),
//                     {
//                         Field_Name: "Bal_Amount",
//                         isVisible: 1,
//                         Fied_Data: "number",
//                         isCustomCell: true,
//                         Header: "Balance Amount",
//                         Cell: ({ row }) => (
//                             <span className={row?.CR_DR === "DR" ? "text-danger" : "text-success"}>
//                                 {NumberFormat(Math.abs(row?.Bal_Amount || 0))} {row?.CR_DR}
//                             </span>
//                         ),
//                     },
//                 ]}
//             />

//             {/* Filter Dialog */}
//             <Dialog
//                 open={filters.filterDialog}
//                 onClose={closeDialog}
//                 fullWidth
//                 maxWidth="md"
//             >
//                 <DialogTitle>Filters</DialogTitle>
//                 <DialogContent>
//                     <table className="table table-borderless w-100">
//                         <tbody>
//                             <tr>
//                                 <td style={{ verticalAlign: "middle", width: "150px" }}>
//                                     From
//                                 </td>
//                                 <td>
//                                     <input
//                                         type="date"
//                                         value={filters.fromDate || ""}
//                                         onChange={(e) =>
//                                             setFilters({ ...filters, fromDate: e.target.value })
//                                         }
//                                         className="cus-inpt"
//                                     />
//                                 </td>
//                             </tr>

//                             <tr>
//                                 <td style={{ verticalAlign: "middle" }}>To</td>
//                                 <td>
//                                     <input
//                                         type="date"
//                                         value={filters.toDate || ""}
//                                         onChange={(e) =>
//                                             setFilters({ ...filters, toDate: e.target.value })
//                                         }
//                                         className="cus-inpt"
//                                     />
//                                 </td>
//                             </tr>

//                             <tr>
//                                 <td style={{ verticalAlign: "middle" }}>Account Name</td>
//                                 <td>
//                                     <Select
//                                         styles={customSelectStyles}
//                                         value={
//                                             accountOptions.find(
//                                                 (a) => a.value === filters.Account_Id
//                                             ) || { value: "", label: "ALL" }
//                                         }
//                                         options={accountOptions}
//                                         onChange={(selected) =>
//                                             setFilters({
//                                                 ...filters,
//                                                 Account_Id: selected?.value || "",
//                                             })
//                                         }
//                                     />
//                                 </td>
//                             </tr>

//                             <tr>
//                                 <td style={{ verticalAlign: "middle" }}>Group Name</td>
//                                 <td>
//                                     <Select
//                                         styles={customSelectStyles}
//                                         value={
//                                             groupOptions.find(
//                                                 (g) => g.value === filters.Group_Name
//                                             ) || { value: "", label: "ALL" }
//                                         }
//                                         options={groupOptions}
//                                         onChange={(selected) =>
//                                             setFilters({
//                                                 ...filters,
//                                                 Group_Name: selected?.value || "",
//                                             })
//                                         }
//                                     />
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </DialogContent>

//                 <DialogActions>
//                     <Button onClick={closeDialog}>Close</Button>
//                     <Button
//                         onClick={() => {
//                             const updatedFilters = {
//                                 fromDate: filters?.fromDate,
//                                 toDate: filters?.toDate,
//                                 Account_Id: filters?.Account_Id,
//                                 Group_Name: filters?.Group_Name,
//                             };

//                             setFilters((prev) => ({
//                                 ...prev,
//                                 fetchFrom: filters.fromDate,
//                                 fetchTo: filters.toDate,
//                             }));

//                             updateQueryString(updatedFilters);
//                             fetchAllAccounts();
//                             closeDialog();
//                         }}
//                         startIcon={<Search />}
//                         variant="outlined"
//                     >
//                         Search
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// };

// export default Outstanding;


import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    CircularProgress,
    Box,
} from "@mui/material";
import {
    ISOString,
    isValidDate,
    NumberFormat,
    toArray,
    Addition,
} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState, useMemo, useRef } from "react";
import { FilterAlt, Search, FilterAltOff, Visibility, PictureAsPdf } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { customSelectStyles } from "../../Components/tablecolumn";
import jsPDF from "jspdf";
import "jspdf-autotable";

const useQuery = () => new URLSearchParams(useLocation().search);

const defaultFilters = {
    fromDate: ISOString(),
    toDate: ISOString(),
};

const defaultFilterDropDown = {
    voucherType: [],
    retailers: [],
    collectionType: [],
    paymentStatus: [],
    collectedBy: [],
};

// Dialog for showing transaction details
const AccountTransactionsDialog = ({ open, onClose, accountId, accountName, fromDate, toDate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (open && accountId) {
            fetchTransactionDetails();
        }
    }, [open, accountId]);

    const fetchTransactionDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchLink({
                address: `payment/transactions?Acc_Id=${accountId}&fromDate=${fromDate}&toDate=${toDate}`,
                method: "GET",
            });
            
            if (data.success) {
                setTransactions(data.data || []);
            } else {
                setError(data.message || "Failed to fetch transactions");
            }
        } catch (err) {
            setError("Error fetching transaction details");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Group transactions by month-year
    const getGroupedTransactions = () => {
        if (!transactions.length) {
            return { groups: [], grandTotals: { debit: 0, credit: 0 } };
        }
        
        const groups = [];
        let currentMonth = null;
        let currentYear = null;
        let currentGroup = null;
        let monthTotals = { debit: 0, credit: 0 };
        let grandTotals = { debit: 0, credit: 0 };

        // Sort transactions by date
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.Ledger_Date) - new Date(b.Ledger_Date)
        );

        sortedTransactions.forEach((txn, index) => {
            const date = new Date(txn.Ledger_Date);
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            
            // Check if we need to start a new month group
            if (currentMonth !== month || currentYear !== year) {
                // Add previous month totals if exists
                if (currentGroup) {
                    currentGroup.transactions.push({
                        isTotalRow: true,
                        debit: monthTotals.debit,
                        credit: monthTotals.credit,
                        balance: monthTotals.credit - monthTotals.debit,
                    });
                    
                    // Reset month totals
                    monthTotals = { debit: 0, credit: 0 };
                }
                
                // Start new group
                currentMonth = month;
                currentYear = year;
                currentGroup = {
                    monthYear: `${month} ${year}`,
                    transactions: [],
                    monthTotal: { debit: 0, credit: 0 }
                };
                groups.push(currentGroup);
            }
            
            // Add transaction to current group
            currentGroup.transactions.push({
                ...txn,
                isTransaction: true,
                formattedInvoice: `${txn.invoice_no}/${year}`, // Invoice format with year
                displayDate: date.toLocaleDateString('en-GB') // Format: dd/mm/yyyy
            });
            
            // Add to month totals
            const debit = parseFloat(txn.Debit_Amt || 0);
            const credit = parseFloat(txn.Credit_Amt || 0);
            monthTotals.debit += debit;
            monthTotals.credit += credit;
            grandTotals.debit += debit;
            grandTotals.credit += credit;
            
            // Update current group totals
            currentGroup.monthTotal.debit = monthTotals.debit;
            currentGroup.monthTotal.credit = monthTotals.credit;
            
            // If last transaction, add final month totals
            if (index === sortedTransactions.length - 1) {
                currentGroup.transactions.push({
                    isTotalRow: true,
                    debit: monthTotals.debit,
                    credit: monthTotals.credit,
                    balance: monthTotals.credit - monthTotals.debit,
                });
            }
        });

        return { groups, grandTotals };
    };

    const { groups, grandTotals } = getGroupedTransactions();
    const grandBalance = grandTotals.credit - grandTotals.debit;

    const generatePDF = () => {
        if (groups.length === 0) return;

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;
        
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("Transaction Details", pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        
        // Account Name
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Account: ${accountName}`, 20, yPos);
        yPos += 6;
        
        // Date Range
        const fromDateStr = new Date(fromDate).toLocaleDateString();
        const toDateStr = new Date(toDate).toLocaleDateString();
        doc.text(`Period: ${fromDateStr} to ${toDateStr}`, 20, yPos);
        yPos += 15;
        
        // Add each month section
        groups.forEach((group, groupIndex) => {
            // Check if we need a new page
            if (yPos > pageHeight - 50) {
                doc.addPage();
                yPos = 20;
            }
            
            // Month Header
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(33, 150, 243); // Blue background
            doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
            doc.text(group.monthYear, pageWidth / 2, yPos, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            yPos += 12;
            
            // Prepare table data
            const tableData = group.transactions.map((txn) => {
                if (txn.isTotalRow) {
                    // Month Total Row - simpler format without styles
                    return [
                        { content: `${group.monthYear} Total`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                        NumberFormat(txn.debit),
                        NumberFormat(txn.credit),
                        `${NumberFormat(Math.abs(txn.balance))} ${txn.balance >= 0 ? 'CR' : 'DR'}`
                    ];
                }
                
                // Regular Transaction Row
                return [
                    txn.displayDate,
                    txn.formattedInvoice,
                    txn.Particulars || '',
                    NumberFormat(txn.Debit_Amt || 0),
                    NumberFormat(txn.Credit_Amt || 0),
                    txn.Ledger_Desc || ''
                ];
            });
            
            // Create table with simpler formatting
            doc.autoTable({
                head: [['Date', 'Invoice No', 'Particulars', 'Debit', 'Credit', 'Description']],
                body: tableData,
                startY: yPos,
                margin: { left: 15, right: 15 },
                theme: 'grid',
                headStyles: { 
                    fillColor: [66, 66, 66], 
                    textColor: [255, 255, 255], 
                    fontStyle: 'bold',
                    fontSize: 10
                },
                bodyStyles: { 
                    fontSize: 9,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 28 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 22, halign: 'right' },
                    4: { cellWidth: 22, halign: 'right' },
                    5: { cellWidth: 40 }
                },
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                didDrawPage: function(data) {
                    yPos = data.cursor.y + 10;
                }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
        });
        
        // Add grand total section
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }
        
        // Grand Total Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(51, 51, 51);
        doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
        doc.text("GRAND TOTAL", pageWidth / 2, yPos, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 12;
        
        // Grand Total Table
        const grandTotalData = [
            [
                { content: '', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                NumberFormat(grandTotals.debit),
                NumberFormat(grandTotals.credit),
                `${NumberFormat(Math.abs(grandBalance))} ${grandBalance >= 0 ? 'CR' : 'DR'}`
            ]
        ];
        
        doc.autoTable({
            body: grandTotalData,
            startY: yPos,
            margin: { left: 15, right: 15 },
            theme: 'grid',
            bodyStyles: { 
                fontSize: 11, 
                fillColor: [51, 51, 51], 
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 28 },
                2: { cellWidth: 45 },
                3: { cellWidth: 22, halign: 'right' },
                4: { cellWidth: 22, halign: 'right' },
                5: { cellWidth: 40 }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
        
        // Add summary section
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("SUMMARY", 20, yPos);
        yPos += 10;
        
        // Summary boxes
        const summaryWidth = 55;
        const summaryHeight = 20;
        const spacing = 5;
        
        // Total Debit
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(255, 255, 255);
        doc.rect(20, yPos, summaryWidth, summaryHeight, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text("Total Debit", 20 + summaryWidth/2, yPos + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 53, 69); // Red color
        doc.text(NumberFormat(grandTotals.debit), 20 + summaryWidth/2, yPos + 16, { align: 'center' });
        
        // Total Credit
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(255, 255, 255);
        doc.rect(20 + summaryWidth + spacing, yPos, summaryWidth, summaryHeight, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text("Total Credit", 20 + summaryWidth + spacing + summaryWidth/2, yPos + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 167, 69); // Green color
        doc.text(NumberFormat(grandTotals.credit), 20 + summaryWidth + spacing + summaryWidth/2, yPos + 16, { align: 'center' });
        
        // Net Balance
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(248, 249, 250);
        doc.rect(20 + (summaryWidth + spacing) * 2, yPos, summaryWidth, summaryHeight, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text("Net Balance", 20 + (summaryWidth + spacing) * 2 + summaryWidth/2, yPos + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        // Set text color based on balance
        if (grandBalance >= 0) {
            doc.setTextColor(40, 167, 69); // Green for positive
        } else {
            doc.setTextColor(220, 53, 69); // Red for negative
        }
        doc.text(`${NumberFormat(Math.abs(grandBalance))} ${grandBalance >= 0 ? 'CR' : 'DR'}`, 
                 20 + (summaryWidth + spacing) * 2 + summaryWidth/2, yPos + 16, { align: 'center' });
        
        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        const generatedDate = new Date().toLocaleString();
        doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Account ID: ${accountId}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        
        // Save the PDF
        const fileName = `Transaction_Details_${accountName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            scroll="paper"
        >
            <DialogTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                        Transaction Details - {accountName}
                        <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', ml: 2 }}>
                            (From: {new Date(fromDate).toLocaleDateString()} To: {new Date(toDate).toLocaleDateString()})
                        </Box>
                    </span>
                    <Tooltip title="Download PDF">
                        <IconButton 
                            onClick={generatePDF} 
                            disabled={loading || groups.length === 0}
                            color="primary"
                            sx={{ ml: 2 }}
                        >
                            <PictureAsPdf />
                        </IconButton>
                    </Tooltip>
                </div>
            </DialogTitle>
            <DialogContent dividers ref={contentRef}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box color="error.main" textAlign="center" py={4}>
                        {error}
                    </Box>
                ) : groups.length === 0 ? (
                    <Box textAlign="center" py={4} color="text.secondary">
                        No transactions found for this period
                    </Box>
                ) : (
                    <Box sx={{ mb: 3 }}>
                        {groups.map((group, groupIndex) => (
                            <Box key={groupIndex} sx={{ mb: 4 }}>
                                {/* Month Header */}
                                <Box 
                                    sx={{ 
                                        bgcolor: 'primary.main', 
                                        color: 'white',
                                        p: 1.5,
                                        borderRadius: '4px 4px 0 0',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {group.monthYear}
                                </Box>
                                
                                {/* Transactions Table */}
                                <table className="table table-bordered table-hover w-100 mb-0">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Invoice No</th>
                                            <th>Particulars</th>
                                            <th>Debit Amount</th>
                                            <th>Credit Amount</th>
                                            <th>Ledger Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.transactions.map((txn, txnIndex) => {
                                            if (txn.isTotalRow) {
                                                // Month Total Row
                                                return (
                                                    <tr key={`total-${groupIndex}-${txnIndex}`} style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                                        <td colSpan="3" style={{ textAlign: 'right', paddingRight: '20px' }}>
                                                            {group.monthYear} Total
                                                        </td>
                                                        <td className="text-danger" style={{ fontWeight: 'bold' }}>
                                                            {NumberFormat(txn.debit)}
                                                        </td>
                                                        <td className="text-success" style={{ fontWeight: 'bold' }}>
                                                            {NumberFormat(txn.credit)}
                                                        </td>
                                                        <td style={{ color: txn.balance >= 0 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                                            {NumberFormat(Math.abs(txn.balance))} {txn.balance >= 0 ? 'CR' : 'DR'}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            
                                            // Regular Transaction Row
                                            return (
                                                <tr key={`${groupIndex}-${txnIndex}`}>
                                                    <td>{txn.displayDate}</td>
                                                    <td>{txn.formattedInvoice}</td>
                                                    <td>{txn.Particulars}</td>
                                                    <td className="text-danger">{NumberFormat(txn.Debit_Amt || 0)}</td>
                                                    <td className="text-success">{NumberFormat(txn.Credit_Amt || 0)}</td>
                                                    <td>{txn.Ledger_Desc}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Box>
                        ))}
                        
                        {/* Grand Total Section */}
                        <Box 
                            sx={{ 
                                mt: 3,
                                border: '2px solid #333',
                                borderRadius: '4px',
                                backgroundColor: '#e8f4fd'
                            }}
                        >
                            <table className="table mb-0">
                                <tbody>
                                    <tr style={{ backgroundColor: '#333', color: 'white' }}>
                                        <td colSpan="3" style={{ textAlign: 'right', paddingRight: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            GRAND TOTAL
                                        </td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>
                                            {NumberFormat(grandTotals.debit)}
                                        </td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>
                                            {NumberFormat(grandTotals.credit)}
                                        </td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: grandBalance >= 0 ? '#28a745' : '#dc3545' }}>
                                            {NumberFormat(Math.abs(grandBalance))} {grandBalance >= 0 ? 'CR' : 'DR'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Box>
                        
                        {/* Summary Cards */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box 
                                sx={{ 
                                    flex: 1,
                                    minWidth: '200px',
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Debit</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                    {NumberFormat(grandTotals.debit)}
                                </div>
                            </Box>
                            <Box 
                                sx={{ 
                                    flex: 1,
                                    minWidth: '200px',
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Credit</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                    {NumberFormat(grandTotals.credit)}
                                </div>
                            </Box>
                            <Box 
                                sx={{ 
                                    flex: 1,
                                    minWidth: '200px',
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Net Balance</div>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: grandBalance >= 0 ? '#28a745' : '#dc3545' 
                                }}>
                                    {NumberFormat(Math.abs(grandBalance))} {grandBalance >= 0 ? 'CR' : 'DR'}
                                </div>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {groups.length > 0 && (
                    <Button 
                        onClick={generatePDF} 
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        disabled={loading}
                        sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                    >
                        Download PDF
                    </Button>
                )}
                <Button 
                    onClick={fetchTransactionDetails} 
                    variant="outlined"
                    startIcon={<Search />}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const Outstanding = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const storage = JSON.parse(localStorage.getItem("user"));

    const [allAccounts, setAllAccounts] = useState([]);
    const [viewType, setViewType] = useState("debtors");

    const [accountOptions, setAccountOptions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);

    const [filters, setFilters] = useState({
        fromDate: defaultFilters.fromDate,
        toDate: defaultFilters.toDate,
        fetchFrom: defaultFilters.fromDate,
        fetchTo: defaultFilters.toDate,
        Account_Id: "",
        Group_Name: "",
        filterDialog: false,
        refresh: false,
    });

    // State for transaction dialog
    const [transactionDialog, setTransactionDialog] = useState({
        open: false,
        accountId: null,
        accountName: "",
        fromDate: filters.fromDate,
        toDate: filters.toDate,
    });

    const [drowDownValues, setDropDownValues] = useState(defaultFilterDropDown);

    useEffect(() => {
        fetchLink({ address: `receipt/filterValues` })
            .then((data) => {
                if (data.success) {
                    setDropDownValues({
                        voucherType: toArray(data?.others?.voucherType),
                    });
                }
            })
            .catch(console.error);

        fetchAllAccounts();
    }, [storage?.Company_id]);

    const resetFilters = () => {
        setFilters({
            ...defaultFilters,
            fetchFrom: defaultFilters.fromDate,
            fetchTo: defaultFilters.toDate,
            Account_Id: "",
            Group_Name: "",
            filterDialog: false,
            refresh: false,
        });

        updateQueryString({
            fromDate: defaultFilters.fromDate,
            toDate: defaultFilters.toDate,
            Account_Id: "",
            Group_Name: "",
        });

        fetchAllAccounts();
    };

    const fetchAllAccounts = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `payment/getDebtorDetails?fromDate=${filters?.fromDate}&toDate=${filters?.toDate}`,
            method: "GET",
        })
            .then((data) => {
                if (data.success) setAllAccounts(data.data || []);
            })
            .finally(() => loadingOff && loadingOff())
            .catch(console.error);
    };

    useEffect(() => {
        if (Array.isArray(allAccounts)) {
            const accOpts = allAccounts.map((a) => ({
                value: a.Acc_Id,
                label: a.Account_name,
            }));

            const grpOpts = [
                ...new Map(
                    allAccounts.map((a) => [
                        a.Group_Name,
                        { value: a.Group_Name, label: a.Group_Name },
                    ])
                ).values(),
            ];

            setAccountOptions([{ value: "", label: "ALL" }, ...accOpts]);
            setGroupOptions([{ value: "", label: "ALL" }, ...grpOpts]);
        }
    }, [allAccounts]);

    const tableData = useMemo(() => {
        if (!Array.isArray(allAccounts)) return [];

        return allAccounts.filter((item) => {
            const balance = parseFloat(item?.Bal_Amount || 0);

            // Skip zero balances
            if (balance === 0) return false;

            // Filter by account type
            if (viewType === "debtors" && item.Account_Types !== "Debtor") return false;
            if (viewType === "creditors" && item.Account_Types !== "Creditor") return false;

            if (filters.Account_Id && item.Acc_Id !== filters.Account_Id)
                return false;
            if (filters.Group_Name && item.Group_Name !== filters.Group_Name)
                return false;

            return true;
        });
    }, [allAccounts, viewType, filters.Account_Id, filters.Group_Name]);

    const Total_Debit = useMemo(() => {
        return tableData.reduce((acc, item) => Addition(acc, parseFloat(item?.Dr_Amount || 0)), 0);
    }, [tableData]);

    const Total_Credit = useMemo(() => {
        return tableData.reduce((acc, item) => Addition(acc, parseFloat(item?.Cr_Amount || 0)), 0);
    }, [tableData]);

    const Total_Outstanding = useMemo(() => {
        return Total_Debit - Total_Credit;
    }, [Total_Debit, Total_Credit]);

    useEffect(() => {
        const queryFilters = {
            fromDate:
                query.get("fromDate") && isValidDate(query.get("fromDate"))
                    ? query.get("fromDate")
                    : defaultFilters.fromDate,
            toDate:
                query.get("toDate") && isValidDate(query.get("toDate"))
                    ? query.get("toDate")
                    : defaultFilters.toDate,
        };
        setFilters((pre) => ({
            ...pre,
            fetchFrom: queryFilters.fromDate,
            fetchTo: queryFilters.toDate,
        }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters((pre) => ({ ...pre, filterDialog: false }));
    };

    const openTransactionDialog = (accountId, accountName) => {
        setTransactionDialog({
            open: true,
            accountId,
            accountName,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
        });
    };

    const closeTransactionDialog = () => {
        setTransactionDialog({
            open: false,
            accountId: null,
            accountName: "",
            fromDate: "",
            toDate: "",
        });
    };

    return (
        <>
            <FilterableTable
                title={
                    viewType === "debtors"
                        ? "Debtors Outstanding"
                        : "Creditors Outstanding"
                }
                ButtonArea={
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Button
                                variant={viewType === "debtors" ? "contained" : "outlined"}
                                onClick={() => setViewType("debtors")}
                                size="small"
                            >
                                Debtors
                            </Button>
                            <Button
                                variant={viewType === "creditors" ? "contained" : "outlined"}
                                onClick={() => setViewType("creditors")}
                                size="small"
                            >
                                Creditors
                            </Button>
                            <div className="d-flex align-items-center">
                                <Tooltip title="Filters">
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({ ...filters, filterDialog: true })}
                                    >
                                        <FilterAlt />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reset Filters">
                                    <IconButton size="small" onClick={resetFilters}>
                                        <FilterAltOff />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="d-flex flex-column align-items-end">
                            <div className="d-flex align-items-center">
                                <span className="text-muted me-2">Total {viewType === "debtors" ? "Debtors" : "Creditors"} Debit:</span>
                                <strong>{NumberFormat(Total_Debit)}</strong>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="text-muted me-2">Total {viewType === "debtors" ? "Debtors" : "Creditors"} Credit:</span>
                                <strong>{NumberFormat(Total_Credit)}</strong>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="text-muted me-2">Total Outstanding:</span>
                                <strong className={Total_Outstanding >= 0 ? "text-danger" : "text-success"}>
                                    {NumberFormat(Math.abs(Total_Outstanding))} {Total_Outstanding >= 0 ? "DR" : "CR"}
                                </strong>
                            </div>
                        </div>
                    </div>
                }
                EnableSerialNumber
                ExcelPrintOption={true}
                dataArray={tableData}
                headerFontSizePx={14}
                bodyFontSizePx={13}
                columns={[
                    {
                        ...createCol("Acc_Id", "string", "View Details"),
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <Tooltip title="View Transaction Details">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Visibility />}
                                    onClick={() => openTransactionDialog(row.Acc_Id, row.Account_name)}
                                    sx={{ minWidth: 'auto', padding: '2px 8px' }}
                                >
                                    View
                                </Button>
                            </Tooltip>
                        ),
                    },
                    createCol("Account_name", "string", "Account Name"),
                    createCol("Group_Name", "string", "Group"),
                    {
                        ...createCol("Account_Types", "string", "Account Type"),
                        isVisible: 1
                    },
                    {
                        ...createCol("OB_Amount", "number", "Opening Balance"),
                        format: (value) => NumberFormat(value || 0)
                    },
                    {
                        ...createCol("Dr_Amount", "number", "Debit Amount"),
                        format: (value) => NumberFormat(value || 0)
                    },
                    {
                        ...createCol("Cr_Amount", "number", "Credit Amount"),
                        format: (value) => NumberFormat(value || 0)
                    },
                    createCol("CR_DR", "string", "Type"),
                    {
                        Field_Name: "Bal_Amount",
                        isVisible: 1,
                        Fied_Data: "number",
                        isCustomCell: true,
                        Header: "Balance Amount",
                        Cell: ({ row }) => (
                            <span className={row?.CR_DR === "DR" ? "text-danger" : "text-success"}>
                                {NumberFormat(Math.abs(row?.Bal_Amount || 0))} {row?.CR_DR}
                            </span>
                        ),
                    },
                ]}
            />

            {/* Filter Dialog */}
            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <table className="table table-borderless w-100">
                        <tbody>
                            <tr>
                                <td style={{ verticalAlign: "middle", width: "150px" }}>
                                    From
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        value={filters.fromDate || ""}
                                        onChange={(e) =>
                                            setFilters({ ...filters, fromDate: e.target.value })
                                        }
                                        className="cus-inpt"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>To</td>
                                <td>
                                    <input
                                        type="date"
                                        value={filters.toDate || ""}
                                        onChange={(e) =>
                                            setFilters({ ...filters, toDate: e.target.value })
                                        }
                                        className="cus-inpt"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Account Name</td>
                                <td>
                                    <Select
                                        styles={customSelectStyles}
                                        value={
                                            accountOptions.find(
                                                (a) => a.value === filters.Account_Id
                                            ) || { value: "", label: "ALL" }
                                        }
                                        options={accountOptions}
                                        onChange={(selected) =>
                                            setFilters({
                                                ...filters,
                                                Account_Id: selected?.value || "",
                                            })
                                        }
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Group Name</td>
                                <td>
                                    <Select
                                        styles={customSelectStyles}
                                        value={
                                            groupOptions.find(
                                                (g) => g.value === filters.Group_Name
                                            ) || { value: "", label: "ALL" }
                                        }
                                        options={groupOptions}
                                        onChange={(selected) =>
                                            setFilters({
                                                ...filters,
                                                Group_Name: selected?.value || "",
                                            })
                                        }
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button
                        onClick={() => {
                            const updatedFilters = {
                                fromDate: filters?.fromDate,
                                toDate: filters?.toDate,
                                Account_Id: filters?.Account_Id,
                                Group_Name: filters?.Group_Name,
                            };

                            setFilters((prev) => ({
                                ...prev,
                                fetchFrom: filters.fromDate,
                                fetchTo: filters.toDate,
                            }));

                            updateQueryString(updatedFilters);
                            fetchAllAccounts();
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Transaction Details Dialog */}
            <AccountTransactionsDialog
                open={transactionDialog.open}
                onClose={closeTransactionDialog}
                accountId={transactionDialog.accountId}
                accountName={transactionDialog.accountName}
                fromDate={transactionDialog.fromDate}
                toDate={transactionDialog.toDate}
            />
        </>
    );
};

export default Outstanding;