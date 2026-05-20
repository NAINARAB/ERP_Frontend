// import  { useContext, useEffect, useState } from 'react';
// import {
//   Card, CardContent, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
//   Box, Grid, Typography
// } from '@mui/material';
// import { ArrowBackIosNewOutlined, KeyboardArrowLeft, RemoveRedEyeOutlined, Save } from '@mui/icons-material';
// import { isValidObject, isEqualNumber } from '../../Components/functions';
// import { toast } from 'react-toastify';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { MyContext } from '../../Components/context/contextProvider';
// import { fetchLink } from '../../Components/fetchComponent';
// import Select from 'react-select';
// const ReportsTemplateMobCreation = () => {
//   const storage = JSON.parse(localStorage.getItem('user'));
//   const nav = useNavigate();
//   const { contextObj } = useContext(MyContext);
//   const locationState = useLocation().state;

//   const initialValue = {
//     Report_Type_Id: '',
//     reportName: '',
//     tables: [], 
//     tableJoins: [],
//     currentTab: '',
//     createdBy: storage?.UserId
//   };

//   // const[showDropdown,setShowDropdown]=useState([])
//   const [inputValues, setInputValues] = useState(initialValue);
//   const [reportTables, setReportTables] = useState([]);
//   const[existingReportName,setExistingReportName]=useState([])
//   const [loadingReports,setLoadingReports]=useState(false)
  
//   const [reportOptions, setReportOptions] = useState([]);
//   const [filterSlotsLevel1, setFilterSlotsLevel1] = useState([
//     { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//     { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//     { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
//   ]);

//   const [filterSlotsLevel2, setFilterSlotsLevel2] = useState([
//     { slot: 1, enabled: false, tableId: null, columnName: null, type: 4 },
//     { slot: 2, enabled: false, tableId: null, columnName: null, type: 5 },
//     { slot: 3, enabled: false, tableId: null, columnName: null, type: 6 },
//   ]);

//   const [groupFilterSlots, setGroupFilterSlots] = useState([
//     { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 },
//   ]);

//   const [selectedListTypes, setSelectedListTypes] = useState([]); 
//   const [openConfigPreview, setOpenConfigPreview] = useState(false);

//   const losTables = reportTables.filter(table => 
//     table.Table_Name?.toLowerCase().includes('los') || 
//     table.AliasName?.toLowerCase().includes('los')
//   );

//   useEffect(() => {
//     fetchExistingReportNames();
//   }, []);

//   const fetchExistingReportNames = async () => {
//     try {
//       setLoadingReports(true);
//       const response = await fetchLink({
//         address: 'reports/templateMobile',
//         method: 'GET'
//       });
      
//       if (response?.success) {
//         const reports = response?.data || [];
//         const uniqueReportNames = [...new Set(reports.map(report => report.Report_Name).filter(name => name))];
//         setExistingReportName(uniqueReportNames);
        
       
//         const options = uniqueReportNames.map(name => ({
//           value: name,
//           label: name
//         }));
//         setReportOptions(options);
//       }
//     } catch (error) {
//       console.error('Error fetching existing reports:', error);
//       toast.error('Failed to load existing reports');
//     } finally {
//       setLoadingReports(false);
//     }
//   };

//   useEffect(() => {
//     const stateValue = locationState?.ReportState;
//     if (isValidObject(stateValue)) {
//       const reportName = stateValue?.reportName ?? '';
      
//       setInputValues(prev => ({
//         ...prev,
//         Report_Type_Id: stateValue?.Report_Type_Id ?? '',
//         reportName: reportName,
//         tables: [...(stateValue?.tables || [])],
//         createdBy: stateValue?.createdBy ?? storage?.UserId
//       }));
      
    
//       if (reportName && !reportOptions.some(opt => opt.value === reportName)) {
//         const newOption = { value: reportName, label: reportName };
//         setReportOptions(prev => [...prev, newOption]);
//         setExistingReportName(prev => [...prev, reportName]);
//       }
      
//       const groupFilterFromState = stateValue?.GroupFilter || [];
      
//       if (groupFilterFromState.length > 0) {
//         setGroupFilterSlots(prev => {
//           const newSlots = [...prev];
          
//           groupFilterFromState.forEach((gf, index) => {
//             if (index < newSlots.length) {
//               newSlots[index] = {
//                 ...newSlots[index],
//                 enabled: true,
//                 tableId: gf.Table_Id,
//                 columnName: gf.Column_Name,
//                 type: gf.Type || 7
//               };
//             }
//           });
          
//           return newSlots;
//         });
//       }
//     }
//   }, [locationState?.ReportState, storage?.UserId]);

//   useEffect(() => {
//     fetchLink({ address: `reports/tablesAndColumnsMobile` })
//       .then(data => {
//         if (data?.success) setReportTables(data?.data || []);
//       }).catch(e => console.error(e));
//   }, []);

//   useEffect(() => {
//     if (!inputValues.tables || inputValues.tables.length === 0) return;

//     const assignments = [];
//     const allListTypes = new Set(); 
    
//     inputValues.tables.forEach(table => {
//       table.columns?.forEach(column => {
//         if (column.Type) {
//           const types = Array.isArray(column.Type) ? column.Type : [column.Type];
//           types.forEach(type => {
//             if (type) {
//               assignments.push({
//                 type: Number(type),
//                 tableId: table.Table_Id,
//                 columnName: column.Column_Name,
//                 listType: column.List_Type,
//                 level: column.Level 
//               });

//               if (column.List_Type) {
//                 const listTypes = String(column.List_Type)
//                   .split(',')
//                   .map(lt => Number(lt.trim()))
//                   .filter(lt => !isNaN(lt));
                
//                 listTypes.forEach(lt => allListTypes.add(lt));
//               }
//             }
//           });
//         }
//       });
//     });

//     const level1Assignments = assignments.filter(a => a.level === 1 || (a.type >= 1 && a.type <= 3));
//     const level2Assignments = assignments.filter(a => a.level === 2 || (a.type >= 4 && a.type <= 6));
//     const groupFilterAssignments = assignments.filter(a => a.type === 7);

//     if (level1Assignments.length > 0) {
//       setFilterSlotsLevel1(prev => {
//         const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));
        
//         level1Assignments.forEach(assignment => {
//           const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
//           if (slotIndex !== -1) {
//             newSlots[slotIndex] = {
//               ...newSlots[slotIndex],
//               enabled: true,
//               tableId: assignment.tableId,
//               columnName: assignment.columnName
//             };
//           }
//         });
        
//         return newSlots;
//       });
//     }

//     if (level2Assignments.length > 0) {
//       setFilterSlotsLevel2(prev => {
//         const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));
        
//         level2Assignments.forEach(assignment => {
//           const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
//           if (slotIndex !== -1) {
//             newSlots[slotIndex] = {
//               ...newSlots[slotIndex],
//               enabled: true,
//               tableId: assignment.tableId,
//               columnName: assignment.columnName
//             };
//           }
//         });
        
//         return newSlots;
//       });
//     }

//     if (groupFilterAssignments.length > 0) {
//       setGroupFilterSlots(prev => {
//         const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));
        
//         groupFilterAssignments.forEach(assignment => {
//           const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
//           if (slotIndex !== -1) {
//             newSlots[slotIndex] = {
//               ...newSlots[slotIndex],
//               enabled: true,
//               tableId: assignment.tableId,
//               columnName: assignment.columnName
//             };
//           }
//         });
        
//         return newSlots;
//       });
//     }
   
//     if (allListTypes.size > 0) {
//       setSelectedListTypes(Array.from(allListTypes));
//     } else {
//       setSelectedListTypes([1]); 
//     }
//   }, [inputValues.tables]);

//   const getColumnsForTableId = (tableId) => {
//     if (!tableId) return [];
//     const inSelected = inputValues.tables.find(t => String(t.Table_Id) === String(tableId));
//     if (inSelected && Array.isArray(inSelected.columns) && inSelected.columns.length) return inSelected.columns;

//     const meta = reportTables.find(t => String(t.Table_Id) === String(tableId));
//     if (meta && Array.isArray(meta.Columns)) return meta.Columns.map(c => ({
//       Column_Name: c.Column_Name,
//       Column_Data_Type: c.Column_Data_Type ?? c?.Column_Data_Type ?? 'string',
//       IS_Default: c.IS_Default ?? c?.IS_Default ?? 0,
//       IS_Join_Key: c.IS_Join_Key ?? c?.IS_Join_Key ?? 0
//     }));
//     return [];
//   };


//   const handleFilterToggle = (idx, level) => {
//     if (level === 'level1') {
//       setFilterSlotsLevel1(prev => {
//         const arr = [...prev];
//         const newEnabledState = !arr[idx].enabled;
        
//         arr[idx] = { 
//           ...arr[idx], 
//           enabled: newEnabledState,
//           tableId: newEnabledState ? arr[idx].tableId : null, 
//           columnName: newEnabledState ? arr[idx].columnName : null 
//         };
        
//         return arr;
//       });
//     } else if (level === 'level2') {
//       setFilterSlotsLevel2(prev => {
//         const arr = [...prev];
//         const newEnabledState = !arr[idx].enabled;
        
//         arr[idx] = { 
//           ...arr[idx], 
//           enabled: newEnabledState,
//           tableId: newEnabledState ? arr[idx].tableId : null, 
//           columnName: newEnabledState ? arr[idx].columnName : null 
//         };
        
//         return arr;
//       });
//     } else {
//       setGroupFilterSlots(prev => {
//         const arr = [...prev];
//         const newEnabledState = !arr[idx].enabled;
        
//         arr[idx] = { 
//           ...arr[idx], 
//           enabled: newEnabledState,
//           tableId: newEnabledState ? arr[idx].tableId : null, 
//           columnName: newEnabledState ? arr[idx].columnName : null 
//         };
        
//         return arr;
//       });
//     }
//   };

//   const tablesSelectedCountLevel1 = filterSlotsLevel1.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
//   const columnsSelectedCountLevel1 = filterSlotsLevel1.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);
  
//   const tablesSelectedCountLevel2 = filterSlotsLevel2.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
//   const columnsSelectedCountLevel2 = filterSlotsLevel2.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);

//   const tablesSelectedCountGroup = groupFilterSlots.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
//   const columnsSelectedCountGroup = groupFilterSlots.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);

//   const totalTablesSelected = tablesSelectedCountLevel1 + tablesSelectedCountLevel2 + tablesSelectedCountGroup;
//   const totalColumnsSelected = columnsSelectedCountLevel1 + columnsSelectedCountLevel2 + columnsSelectedCountGroup;

//   const buildDetails = () => {
//     const details = [];
//     const groupFilterDetails = [];

//     // Regular filters (Level 1 & 2)
//     filterSlotsLevel1.forEach(slot => {
//       if (!slot.enabled) return;
//       if (!slot.tableId || !slot.columnName) return;

//       const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

//       details.push({
//         Type: Number(slot.type),
//         Table_Id: Number(slot.tableId),
//         Column_Name: slot.columnName,
//         List_Type: listTypeToSave,
//         Level: 1
//       });
//     });

//     filterSlotsLevel2.forEach(slot => {
//       if (!slot.enabled) return;
//       if (!slot.tableId || !slot.columnName) return;

//       const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

//       details.push({
//         Type: Number(slot.type),
//         Table_Id: Number(slot.tableId),
//         Column_Name: slot.columnName,
//         List_Type: listTypeToSave,
//         Level: 2
//       });
//     });

//     // Group filter - separate array
//     groupFilterSlots.forEach(slot => {
//       if (!slot.enabled) return;
//       if (!slot.tableId || !slot.columnName) return;

//       const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

//       groupFilterDetails.push({
//         Type: Number(slot.type),
//         Table_Id: Number(slot.tableId),
//         Column_Name: slot.columnName,
//         List_Type: listTypeToSave,
//         Level: 3
//       });
//     });

//     return { details, groupFilterDetails };
//   };

// // Update validation function to allow same column in different filter levels
// const validateNoDuplicateColumns = () => {
//   // Only check for duplicates within the same level
//   // Group Filter can use the same columns as Level 1/2
  
//   // Check Level 1 for duplicates within Level 1 only
//   const level1Slots = filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName);
//   const level1Set = new Set();
//   for (const slot of level1Slots) {
//     const key = `${slot.tableId}_${slot.columnName}`;
//     if (level1Set.has(key)) {
//       const tableMeta = reportTables.find(t => String(t.Table_Id) === String(slot.tableId));
//       const tableName = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${slot.tableId}`;
//       return {
//         isValid: false,
//         message: `Column "${slot.columnName}" from "${tableName}" is used in multiple Level 1 filters`
//       };
//     }
//     level1Set.add(key);
//   }
  
//   // Check Level 2 for duplicates within Level 2 only
//   const level2Slots = filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName);
//   const level2Set = new Set();
//   for (const slot of level2Slots) {
//     const key = `${slot.tableId}_${slot.columnName}`;
//     if (level2Set.has(key)) {
//       const tableMeta = reportTables.find(t => String(t.Table_Id) === String(slot.tableId));
//       const tableName = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${slot.tableId}`;
//       return {
//         isValid: false,
//         message: `Column "${slot.columnName}" from "${tableName}" is used in multiple Level 2 filters`
//       };
//     }
//     level2Set.add(key);
//   }
  

//   for (const slot1 of level1Slots) {
//     for (const slot2 of level2Slots) {
//       if (String(slot1.tableId) === String(slot2.tableId) && 
//           String(slot1.columnName) === String(slot2.columnName)) {
//         const tableMeta = reportTables.find(t => String(t.Table_Id) === String(slot1.tableId));
//         const tableName = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${slot1.tableId}`;
//         return {
//           isValid: false,
//           message: `Column "${slot1.columnName}" from "${tableName}" cannot be used in both Level 1 and Level 2 filters`
//         };
//       }
//     }
//   }
  

  
//   return { isValid: true };
// };

//   const saveTemplate = async () => {
   
//     const validation = validateNoDuplicateColumns();
//     if (!validation.isValid) {
//       toast.error(validation.message);
//       return;
//     }
    
//     const { details, groupFilterDetails } = buildDetails();

    
//     if (details.length === 0 && groupFilterDetails.length === 0) {
//       toast.error("Assign at least one filter slot (table + column) before saving");
//       return;
//     }
//     if (!inputValues.reportName || String(inputValues.reportName).trim() === '') {
//       toast.error("Report name is required");
//       return;
//     }

    
//     const payload = {
//       Report_Type_Id: inputValues?.Report_Type_Id || null,
//       reportName: inputValues.reportName,
//       createdBy: inputValues.createdBy,
//       updatedBy: storage?.UserId,
//       details: details, 
//       ...(groupFilterDetails.length > 0 && {
//         GroupFilter: groupFilterDetails 
//       })
//     };

//     try {
//       const res = await fetchLink({
//         address: `reports/templateMobile`,
//         method: inputValues?.Report_Type_Id ? 'PUT' : 'POST',
//         bodyData: payload
//       });
//       if (res?.success) {
//         toast.success(res.message);
//         setInputValues(initialValue);
//         setFilterSlotsLevel1([
//           { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//           { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//           { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 }
//         ]);
//         setFilterSlotsLevel2([
//           { slot: 1, enabled: false, tableId: null, columnName: null, type: 4 },
//           { slot: 2, enabled: false, tableId: null, columnName: null, type: 5 },
//           { slot: 3, enabled: false, tableId: null, columnName: null, type: 6 }
//         ]);
//         setGroupFilterSlots([
//           { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 }
//         ]);
//         setSelectedListTypes([]);
//         nav(-1);
//       } else {
//         toast.error(res?.message || 'Failed to save');
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error('Error saving template');
//     }
//   };


//   const canPreview = 
//     filterSlotsLevel1.some(s => s.enabled && s.tableId && s.columnName) ||
//     filterSlotsLevel2.some(s => s.enabled && s.tableId && s.columnName) ||
//     groupFilterSlots.some(s => s.enabled && s.tableId && s.columnName);

//   if (!isEqualNumber(contextObj?.Add_Rights, 1)) return null;

//   const renderFilterSection = (title, filterSlots, level) => (
//     <Box className="mt-3 p-3 border rounded" sx={{ background: '#FBFCFD' }}>
//       <Typography variant="subtitle1" fontWeight={700} gutterBottom>{title}</Typography>
      
//       <Grid container spacing={3}>
//         {filterSlots.map((slot, idx) => {
//           const label = level === 'group' ? 'Group Filter' : `Filter ${slot.slot}`;
    
//           const tablesToShow = level === 'group' ? losTables : reportTables;
          
//           return (
//             <Grid item xs={4} key={slot.type}>
//               <Box sx={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 p: 1.5, 
//                 mb: 1,
//                 borderRadius: 1, 
//                 background: '#fff', 
//                 border: '1px solid #e0e0e0',
//                 minHeight: '60px'
//               }}>
//                 <label style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
//                   <input
//                     type="checkbox"
//                     checked={slot.enabled}
//                     onChange={() => handleFilterToggle(idx, level)}
//                     style={{ width: '18px', height: '18px' }}
//                   />
//                   <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
//                 </label>
//               </Box>
              
//               {slot.enabled ? (
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                   <Box>
//                     <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
//                       Table
//                     </Typography>
//                     <select
//                       className="cus-inpt"
//                       value={slot.tableId ?? ''}
//                       onChange={(e) => {
//                         const val = e.target.value || null;
//                         if (level === 'level1') {
//                           setFilterSlotsLevel1(prev => {
//                             const arr = [...prev];
//                             arr[idx] = { ...arr[idx], tableId: val, columnName: null };
//                             return arr;
//                           });
//                         } else if (level === 'level2') {
//                           setFilterSlotsLevel2(prev => {
//                             const arr = [...prev];
//                             arr[idx] = { ...arr[idx], tableId: val, columnName: null };
//                             return arr;
//                           });
//                         } else {
//                           setGroupFilterSlots(prev => {
//                             const arr = [...prev];
//                             arr[idx] = { ...arr[idx], tableId: val, columnName: null };
//                             return arr;
//                           });
//                         }
//                       }}
//                       style={{ width: '100%' }}
//                     >
//                       <option value="">Select table</option>
//                       {tablesToShow.map((t, ti) => (
//                         <option key={ti} value={t.Table_Id}>
//                           {t.AliasName || t.Table_Name}
//                           {level === 'group' && ' (LOS)'}
//                         </option>
//                       ))}
//                       {level === 'group' && tablesToShow.length === 0 && (
//                         <option value="" disabled>No LOS tables found</option>
//                       )}
//                     </select>
//                     {level === 'group' && (
//                       <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
//                         Only LOS tables are shown for group filter
//                       </Typography>
//                     )}
//                   </Box>
                  
//          <Box>
//   <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
//     Column
//   </Typography>
//   <select
//     className="cus-inpt"
//     value={slot.columnName ?? ''}
//     disabled={!slot.tableId}
//     onChange={(e) => {
//       const val = e.target.value || null;
      
//       if (level === 'level1') {
//         setFilterSlotsLevel1(prev => {
//           const arr = [...prev];
//           arr[idx] = { ...arr[idx], columnName: val };
//           return arr;
//         });
//       } else if (level === 'level2') {
//         setFilterSlotsLevel2(prev => {
//           const arr = [...prev];
//           arr[idx] = { ...arr[idx], columnName: val };
//           return arr;
//         });
//       } else {
//         setGroupFilterSlots(prev => {
//           const arr = [...prev];
//           arr[idx] = { ...arr[idx], columnName: val };
//           return arr;
//         });
//       }
//     }}
//     style={{ width: '100%' }}
//   >
//     <option value="">Select column</option>
//     {slot.tableId && getColumnsForTableId(slot.tableId).map((c, ci) => {
//       // For Group Filter: ALL columns are enabled regardless of whether they're used in Level 1/2
//       // For Level 1/2: Check if column is used in other slots of the same level
//       let isDisabled = false;
//       let disabledReason = '';
      
//       if (level === 'group') {
//         // In Group Filter, NO columns are disabled
//         isDisabled = false;
//       } else if (level === 'level1') {
//         // Check if column is used in other Level 1 slots
//         const usedInOtherLevel1 = filterSlotsLevel1.some((s, slotIdx) => {
//           if (!s.enabled || !s.tableId || !s.columnName) return false;
//           if (slotIdx === idx) return false; // Exclude current slot
//           return String(s.tableId) === String(slot.tableId) && 
//                  String(s.columnName) === String(c.Column_Name);
//         });
        
//         // Check if column is used in Level 2
//         const usedInLevel2 = filterSlotsLevel2.some(s => {
//           if (!s.enabled || !s.tableId || !s.columnName) return false;
//           return String(s.tableId) === String(slot.tableId) && 
//                  String(s.columnName) === String(c.Column_Name);
//         });
        
//         isDisabled = usedInOtherLevel1 || usedInLevel2;
//         if (usedInOtherLevel1) disabledReason = ' (Used in another Level 1 filter)';
//         else if (usedInLevel2) disabledReason = ' (Used in Level 2 filter)';
//       } else if (level === 'level2') {
//         // Check if column is used in other Level 2 slots
//         const usedInOtherLevel2 = filterSlotsLevel2.some((s, slotIdx) => {
//           if (!s.enabled || !s.tableId || !s.columnName) return false;
//           if (slotIdx === idx) return false; // Exclude current slot
//           return String(s.tableId) === String(slot.tableId) && 
//                  String(s.columnName) === String(c.Column_Name);
//         });
        
//         // Check if column is used in Level 1
//         const usedInLevel1 = filterSlotsLevel1.some(s => {
//           if (!s.enabled || !s.tableId || !s.columnName) return false;
//           return String(s.tableId) === String(slot.tableId) && 
//                  String(s.columnName) === String(c.Column_Name);
//         });
        
//         isDisabled = usedInOtherLevel2 || usedInLevel1;
//         if (usedInOtherLevel2) disabledReason = ' (Used in another Level 2 filter)';
//         else if (usedInLevel1) disabledReason = ' (Used in Level 1 filter)';
//       }
      
//       const isCurrentlySelected = slot.columnName === c.Column_Name;
//       // If it's currently selected, always enable it (so you can keep your selection)
//       const shouldDisable = !isCurrentlySelected && isDisabled;
      
//       return (
//         <option 
//           key={ci} 
//           value={c.Column_Name} 
//           disabled={shouldDisable} 
//           style={{ 
//             color: shouldDisable ? '#999' : 'inherit',
//             backgroundColor: shouldDisable ? '#f5f5f5' : 'inherit',
//             fontStyle: shouldDisable ? 'italic' : 'normal'
//           }}
//         >
//           {c.Column_Name} 
//           {c.Column_Data_Type ? ` (${c.Column_Data_Type})` : ''}
//           {shouldDisable ? disabledReason : ''}
//         </option>
//       );
//     })}
//   </select>
//   {level === 'group' && (
//     <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
//       Note: All columns are enabled in Group Filter, even if used in Level 1/2 filters.
//     </Typography>
//   )}
// </Box>
//                 </Box>
//               ) : (
//                 <Box sx={{ 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   justifyContent: 'center', 
//                   p: 3, 
//                   borderRadius: 1, 
//                   background: '#f8f9fa',
//                   border: '1px dashed #dee2e6',
//                   color: '#6c757d',
//                   textAlign: 'center',
//                   minHeight: '120px'
//                 }}>
//                   <Typography variant="body2">
//                     Enable {label} to configure
//                   </Typography>
//                 </Box>
//               )}
//             </Grid>
//           );
//         })}
//       </Grid>
//     </Box>
//   );

//   return (
//     <>
//       <Card>
//         <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
//           <span className="text-primary text-uppercase ps-3">{inputValues?.Report_Type_Id ? 'Modify Mobile Template' : 'Mobile Template Creation'}</span>
//           <Button variant="outlined" onClick={() => nav(-1)} startIcon={<KeyboardArrowLeft />}>Back</Button>
//         </div>

//         <CardContent>
//           <div>
//             <label className="w-100">Report Name</label>
//             <Select
//               value={
//                 inputValues.reportName
//                   ? {
//                       value: inputValues.reportName,
//                       label: inputValues.reportName,
//                     }
//                   : null
//               }
//               onChange={(selectedOption) => {
//                 setInputValues({ 
//                   ...inputValues, 
//                   reportName: selectedOption ? selectedOption.value : '' 
//                 });
//               }}
//               options={reportOptions}
//               placeholder={loadingReports ? "Loading reports..." : "Select or type to search..."}
//               isClearable={true}
//               isSearchable={true}
//               isLoading={loadingReports}
//               noOptionsMessage={({ inputValue }) => 
//                 inputValue ? `Press Enter to create "${inputValue}"` : "No options available"
//               }
//               formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
//               onCreateOption={(inputValue) => {
               
//                 const alreadyExists = reportOptions.some(opt => 
//                   opt.value.toLowerCase() === inputValue.toLowerCase()
//                 );
                
//                 if (!alreadyExists) {
//                   const newOption = {
//                     value: inputValue,
//                     label: inputValue,
//                   };
                 
//                   setReportOptions(prev => [...prev, newOption]);
//                   setExistingReportName(prev => [...prev, inputValue]);
//                 }
                
               
//                 setInputValues({ ...inputValues, reportName: inputValue });
//               }}
//               styles={{
//                 control: (base) => ({
//                   ...base,
//                   width: '600px',
//                   border: '1px solid #ccc',
//                   borderRadius: '4px',
//                   minHeight: '36px',
//                 }),
//                 menu: (base) => ({
//                   ...base,
//                   width: '300px',
//                 }),
//               }}
//             />
//           </div>

//           <div className="p-2 mt-3 border rounded-3 d-inline-block">
//             <table><tbody>
//               <tr><td className="border-end">Total Filters Assigned</td><td className="px-2 blue-text">{totalTablesSelected}</td></tr>
//               <tr><td className="border-end">Total Columns Assigned</td><td className="px-2 blue-text">{totalColumnsSelected}</td></tr>
//               <tr><td className="border-end">Level 1 Filters</td><td className="px-2 blue-text">{tablesSelectedCountLevel1}</td></tr>
//               <tr><td className="border-end">Level 2 Filters</td><td className="px-2 blue-text">{tablesSelectedCountLevel2}</td></tr>
//               <tr><td className="border-end">Group Filters</td><td className="px-2 blue-text">{tablesSelectedCountGroup}</td></tr>
//             </tbody></table>
//           </div>

//           {renderFilterSection("Level 1 Filters", filterSlotsLevel1, 'level1')}
//           {renderFilterSection("Level 2 Filters", filterSlotsLevel2, 'level2')}
//           {renderFilterSection("Group Filter", groupFilterSlots, 'group')}

//           <Box className="mt-3 d-flex align-items-center" sx={{ gap: 2 }}>
//             <Typography fontWeight={700}>List Type:</Typography>
//             <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <input 
//                 type="checkbox" 
//                 checked={selectedListTypes.includes(1)} 
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setSelectedListTypes(prev => [...prev, 1]);
//                   } else {
//                     setSelectedListTypes(prev => prev.filter(x => x !== 1));
//                   }
//                 }} 
//               /> 
//               <span>Sum</span>
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <input 
//                 type="checkbox" 
//                 checked={selectedListTypes.includes(2)} 
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setSelectedListTypes(prev => [...prev, 2]);
//                   } else {
//                     setSelectedListTypes(prev => prev.filter(x => x !== 2));
//                   }
//                 }} 
//               /> 
//               <span>Avg</span>
//             </label>
//           </Box>

//           <Box className="mt-4 d-flex justify-content-end" sx={{ gap: 2 }}>
//             <Button variant="outlined" onClick={() => { 
//               setFilterSlotsLevel1([
//                 { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//                 { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//                 { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
//               ]); 
//               setFilterSlotsLevel2([
//                 { slot: 1, enabled: false, tableId: null, columnName: null, type: 4 },
//                 { slot: 2, enabled: false, tableId: null, columnName: null, type: 5 },
//                 { slot: 3, enabled: false, tableId: null, columnName: null, type: 6 },
//               ]);
//               setGroupFilterSlots([
//                 { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 }
//               ]);
//               setSelectedListTypes([]); 
//             }}>
//               Reset All
//             </Button>

//             <Tooltip title={!canPreview ? 'Assign at least one slot to Preview' : ''}>
//               <span>
//                 <Button
//                   variant="outlined"
//                   startIcon={<RemoveRedEyeOutlined />}
//                   disabled={!canPreview}
//                   onClick={() => setOpenConfigPreview(true)}
//                 >
//                   Preview
//                 </Button>
//               </span>
//             </Tooltip>

//             <Button variant="contained" startIcon={<Save />} onClick={saveTemplate}>
//               Submit
//             </Button>
//           </Box>
//         </CardContent>
//       </Card>

//       <Dialog open={openConfigPreview} onClose={() => setOpenConfigPreview(false)} fullWidth maxWidth="md">
//         <DialogTitle>Preview - Template Configuration</DialogTitle>
//         <DialogContent dividers>
//           <Typography variant="subtitle1" fontWeight={700} gutterBottom>Report: {inputValues.reportName || '—'}</Typography>

//           <Box sx={{ mb: 2 }}>
//             {filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName).length === 0 &&
//              filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName).length === 0 &&
//              groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).length === 0 && (
//               <Typography>No filter assigned yet.</Typography>
//             )}

//             {filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName).length > 0 && (
//               <>
//                 <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Level 1 Filters:</Typography>
//                 {filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
//                   const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
//                   const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
//                   const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
//                   const label = `Filter ${s.slot}`;
//                   return (
//                     <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
//                       <Grid container alignItems="center">
//                         <Grid item xs={12} md={3}><strong>{label}</strong></Grid>
//                         <Grid item xs={12} md={4}>{tableLabel}</Grid>
//                         <Grid item xs={12} md={3}>{s.columnName}</Grid>
//                         <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
//                       </Grid>
//                     </Box>
//                   );
//                 })}
//               </>
//             )}

//             {filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName).length > 0 && (
//               <>
//                 <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Level 2 Filters:</Typography>
//                 {filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
//                   const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
//                   const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
//                   const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
//                   const label = `Filter ${s.slot}`;
//                   return (
//                     <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
//                       <Grid container alignItems="center">
//                         <Grid item xs={12} md={3}><strong>{label}</strong></Grid>
//                         <Grid item xs={12} md={4}>{tableLabel}</Grid>
//                         <Grid item xs={12} md={3}>{s.columnName}</Grid>
//                         <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
//                       </Grid>
//                     </Box>
//                   );
//                 })}
//               </>
//             )}

//             {groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).length > 0 && (
//               <>
//                 <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Group Filter:</Typography>
//                 {groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
//                   const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
//                   const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
//                   const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
//                   return (
//                     <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
//                       <Grid container alignItems="center">
//                         <Grid item xs={12} md={3}><strong>Group Filter</strong></Grid>
//                         <Grid item xs={12} md={4}>{tableLabel} {tableMeta && (tableMeta.Table_Name?.toLowerCase().includes('los') || tableMeta.AliasName?.toLowerCase().includes('los')) && '(LOS)'}</Grid>
//                         <Grid item xs={12} md={3}>{s.columnName}</Grid>
//                         <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
//                       </Grid>
//                     </Box>
//                   );
//                 })}
//               </>
//             )}
//           </Box>

//           <Typography variant="caption" color="textSecondary">
//             Note: Columns already used in other filter slots are disabled to prevent duplicates.
//           </Typography>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setOpenConfigPreview(false)} startIcon={<ArrowBackIosNewOutlined />}>Back</Button>
//           <Button variant="contained" onClick={() => { setOpenConfigPreview(false); saveTemplate(); }}>Submit</Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default ReportsTemplateMobCreation;







import { useContext, useEffect, useState } from 'react';
import {
  Card, CardContent, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Grid, Typography
} from '@mui/material';
import { ArrowBackIosNewOutlined, KeyboardArrowLeft, RemoveRedEyeOutlined, Save } from '@mui/icons-material';
import { isValidObject, isEqualNumber } from '../../Components/functions';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyContext } from '../../Components/context/contextProvider';
import { fetchLink } from '../../Components/fetchComponent';
import Select from 'react-select';

const ReportsTemplateMobCreation = () => {
  const storage = JSON.parse(localStorage.getItem('user'));
  const nav = useNavigate();
  const { contextObj } = useContext(MyContext);
  const locationState = useLocation().state;

  const initialValue = {
    Report_Type_Id: '',
    reportName: '',
    tables: [],
    tableJoins: [],
    currentTab: '',
    createdBy: storage?.UserId
  };

  const [inputValues, setInputValues] = useState(initialValue);
  const [reportTables, setReportTables] = useState([]);
  const [existingReportName, setExistingReportName] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [reportOptions, setReportOptions] = useState([]);
  const [filterSlotsLevel1, setFilterSlotsLevel1] = useState([
    { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
    { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
    { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
  ]);

  const [filterSlotsLevel2, setFilterSlotsLevel2] = useState([
    { slot: 1, enabled: false, tableId: null, columnName: null, type: 4 },
    { slot: 2, enabled: false, tableId: null, columnName: null, type: 5 },
    { slot: 3, enabled: false, tableId: null, columnName: null, type: 6 },
  ]);

  const [groupFilterSlots, setGroupFilterSlots] = useState([
    { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 },
    { slot: 2, enabled: false, tableId: null, columnName: null, type: 8 },
    { slot: 3, enabled: false, tableId: null, columnName: null, type: 9 },
  ]);

  const [selectedListTypes, setSelectedListTypes] = useState([]);
  const [openConfigPreview, setOpenConfigPreview] = useState(false);

  const losTables = reportTables.filter(table =>
    table.Table_Name?.toLowerCase().includes('los') ||
    table.AliasName?.toLowerCase().includes('los')
  );

  useEffect(() => {
    fetchExistingReportNames();
  }, []);

  const fetchExistingReportNames = async () => {
    try {
      setLoadingReports(true);
      const response = await fetchLink({
        address: 'reports/templateMobile',
        method: 'GET'
      });

      if (response?.success) {
        const reports = response?.data || [];
        const uniqueReportNames = [...new Set(reports.map(report => report.Report_Name).filter(name => name))];
        setExistingReportName(uniqueReportNames);

        const options = uniqueReportNames.map(name => ({
          value: name,
          label: name
        }));
        setReportOptions(options);
      }
    } catch (error) {
      console.error('Error fetching existing reports:', error);
      toast.error('Failed to load existing reports');
    } finally {
      setLoadingReports(false);
    }
  };

  // Load existing template data for editing
  useEffect(() => {
    const stateValue = locationState?.ReportState;
    if (isValidObject(stateValue)) {
      const reportName = stateValue?.reportName ?? '';

      setInputValues(prev => ({
        ...prev,
        Report_Type_Id: stateValue?.Report_Type_Id ?? '',
        reportName: reportName,
        tables: [...(stateValue?.tables || [])],
        createdBy: stateValue?.createdBy ?? storage?.UserId
      }));

      if (reportName && !reportOptions.some(opt => opt.value === reportName)) {
        const newOption = { value: reportName, label: reportName };
        setReportOptions(prev => [...prev, newOption]);
        setExistingReportName(prev => [...prev, reportName]);
      }

      // Load group filters with Level_Id to Type mapping
      const groupFilterFromState = stateValue?.GroupFilter || [];

      if (groupFilterFromState.length > 0) {
        setGroupFilterSlots(prev => {
          const newSlots = [...prev];

          groupFilterFromState.forEach((gf, index) => {
            if (index < newSlots.length) {
              // Determine type from either gf.Type or from Level_Id
              let type = gf.Type || (7 + index);
              
              // If Level_Id is present, map it back to Type (1->7, 2->8, 3->9)
              if (gf.Level_Id) {
                if (gf.Level_Id === 1) type = 7;
                else if (gf.Level_Id === 2) type = 8;
                else if (gf.Level_Id === 3) type = 9;
              }

              newSlots[index] = {
                ...newSlots[index],
                enabled: true,
                tableId: gf.Table_Id ? Number(gf.Table_Id) : null,
                columnName: gf.Column_Name,
                type: type
              };
            }
          });

          return newSlots;
        });
      }
    }
  }, [locationState?.ReportState, storage?.UserId]);

  // Fetch tables and columns
  useEffect(() => {
    fetchLink({ address: `reports/tablesAndColumnsMobile` })
      .then(data => {
        if (data?.success) setReportTables(data?.data || []);
      }).catch(e => console.error(e));
  }, []);

  // Process assignments from selected tables
  useEffect(() => {
    if (!inputValues.tables || inputValues.tables.length === 0) return;

    const assignments = [];
    const allListTypes = new Set();

    inputValues.tables.forEach(table => {
      table.columns?.forEach(column => {
        if (column.Type) {
          const types = Array.isArray(column.Type) ? column.Type : [column.Type];
          types.forEach(type => {
            if (type) {
              assignments.push({
                type: Number(type),
                tableId: table.Table_Id,
                columnName: column.Column_Name,
                listType: column.List_Type,
                level: column.Level
              });

              if (column.List_Type) {
                const listTypes = String(column.List_Type)
                  .split(',')
                  .map(lt => Number(lt.trim()))
                  .filter(lt => !isNaN(lt));

                listTypes.forEach(lt => allListTypes.add(lt));
              }
            }
          });
        }
      });
    });

    const level1Assignments = assignments.filter(a => a.level === 1 || (a.type >= 1 && a.type <= 3));
    const level2Assignments = assignments.filter(a => a.level === 2 || (a.type >= 4 && a.type <= 6));
    const groupFilterAssignments = assignments.filter(a =>
      a.type === 7 || a.type === 8 || a.type === 9
    );

    if (level1Assignments.length > 0) {
      setFilterSlotsLevel1(prev => {
        const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));

        level1Assignments.forEach(assignment => {
          const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
          if (slotIndex !== -1) {
            newSlots[slotIndex] = {
              ...newSlots[slotIndex],
              enabled: true,
              tableId: assignment.tableId,
              columnName: assignment.columnName
            };
          }
        });

        return newSlots;
      });
    }

    if (level2Assignments.length > 0) {
      setFilterSlotsLevel2(prev => {
        const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));

        level2Assignments.forEach(assignment => {
          const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
          if (slotIndex !== -1) {
            newSlots[slotIndex] = {
              ...newSlots[slotIndex],
              enabled: true,
              tableId: assignment.tableId,
              columnName: assignment.columnName
            };
          }
        });

        return newSlots;
      });
    }

    if (groupFilterAssignments.length > 0) {
      setGroupFilterSlots(prev => {
        const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));

        groupFilterAssignments.forEach(assignment => {
          const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
          if (slotIndex !== -1) {
            newSlots[slotIndex] = {
              ...newSlots[slotIndex],
              enabled: true,
              tableId: assignment.tableId,
              columnName: assignment.columnName
            };
          }
        });

        return newSlots;
      });
    }

    if (allListTypes.size > 0) {
      setSelectedListTypes(Array.from(allListTypes));
    } else {
      setSelectedListTypes([1]);
    }
  }, [inputValues.tables]);

  const getColumnsForTableId = (tableId) => {
    if (!tableId) return [];
    const inSelected = inputValues.tables.find(t => String(t.Table_Id) === String(tableId));
    if (inSelected && Array.isArray(inSelected.columns) && inSelected.columns.length) return inSelected.columns;

    const meta = reportTables.find(t => String(t.Table_Id) === String(tableId));
    if (meta && Array.isArray(meta.Columns)) return meta.Columns.map(c => ({
      Column_Name: c.Column_Name,
      Column_Data_Type: c.Column_Data_Type ?? c?.Column_Data_Type ?? 'string',
      IS_Default: c.IS_Default ?? c?.IS_Default ?? 0,
      IS_Join_Key: c.IS_Join_Key ?? c?.IS_Join_Key ?? 0
    }));
    return [];
  };

  const handleFilterToggle = (idx, level) => {
    if (level === 'level1') {
      setFilterSlotsLevel1(prev => {
        const arr = [...prev];
        const newEnabledState = !arr[idx].enabled;

        arr[idx] = {
          ...arr[idx],
          enabled: newEnabledState,
          tableId: newEnabledState ? arr[idx].tableId : null,
          columnName: newEnabledState ? arr[idx].columnName : null
        };

        return arr;
      });
    } else if (level === 'level2') {
      setFilterSlotsLevel2(prev => {
        const arr = [...prev];
        const newEnabledState = !arr[idx].enabled;

        arr[idx] = {
          ...arr[idx],
          enabled: newEnabledState,
          tableId: newEnabledState ? arr[idx].tableId : null,
          columnName: newEnabledState ? arr[idx].columnName : null
        };

        return arr;
      });
    } else {
      setGroupFilterSlots(prev => {
        const arr = [...prev];
        const newEnabledState = !arr[idx].enabled;

        arr[idx] = {
          ...arr[idx],
          enabled: newEnabledState,
          tableId: newEnabledState ? arr[idx].tableId : null,
          columnName: newEnabledState ? arr[idx].columnName : null
        };

        return arr;
      });
    }
  };

  const tablesSelectedCountLevel1 = filterSlotsLevel1.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
  const columnsSelectedCountLevel1 = filterSlotsLevel1.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);

  const tablesSelectedCountLevel2 = filterSlotsLevel2.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
  const columnsSelectedCountLevel2 = filterSlotsLevel2.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);

  const tablesSelectedCountGroup = groupFilterSlots.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
  const columnsSelectedCountGroup = groupFilterSlots.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);

  const totalTablesSelected = tablesSelectedCountLevel1 + tablesSelectedCountLevel2 + tablesSelectedCountGroup;
  const totalColumnsSelected = columnsSelectedCountLevel1 + columnsSelectedCountLevel2 + columnsSelectedCountGroup;

  // Build payload for API with proper Level_Id mapping
  const buildDetails = () => {
    const details = [];
    const groupFilterDetails = [];

    filterSlotsLevel1.forEach(slot => {
      if (!slot.enabled) return;
      if (!slot.tableId || !slot.columnName) return;

      const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

      details.push({
        Type: Number(slot.type),
        Table_Id: Number(slot.tableId),
        Column_Name: slot.columnName,
        List_Type: listTypeToSave,
        Level: 1
      });
    });

    filterSlotsLevel2.forEach(slot => {
      if (!slot.enabled) return;
      if (!slot.tableId || !slot.columnName) return;

      const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

      details.push({
        Type: Number(slot.type),
        Table_Id: Number(slot.tableId),
        Column_Name: slot.columnName,
        List_Type: listTypeToSave,
        Level: 2
      });
    });

    groupFilterSlots.forEach(slot => {
      if (!slot.enabled) return;
      if (!slot.tableId || !slot.columnName) return;

      const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

      // Map Type to Level_Id (7->1, 8->2, 9->3) for tbl_Group_Template
      let levelId = 3; // Default
      if (slot.type === 7) levelId = 1;
      else if (slot.type === 8) levelId = 2;
      else if (slot.type === 9) levelId = 3;

      groupFilterDetails.push({
        Type: Number(slot.type),
        Table_Id: Number(slot.tableId),
        Column_Name: slot.columnName,
        List_Type: listTypeToSave,
        Level: 3,
        Level_Id: levelId // Map Type to Level_Id (1,2,3) for database
      });
    });

    return { details, groupFilterDetails };
  };

  const validateNoDuplicateColumns = () => {
    const level1Slots = filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName);
    const level1Set = new Set();
    for (const slot of level1Slots) {
      const key = `${slot.tableId}_${slot.columnName}`;
      if (level1Set.has(key)) {
        const tableMeta = reportTables.find(t => String(t.Table_Id) === String(slot.tableId));
        const tableName = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${slot.tableId}`;
        return {
          isValid: false,
          message: `Column "${slot.columnName}" from "${tableName}" is used in multiple Level 1 filters`
        };
      }
      level1Set.add(key);
    }

    const level2Slots = filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName);
    const level2Set = new Set();
    for (const slot of level2Slots) {
      const key = `${slot.tableId}_${slot.columnName}`;
      if (level2Set.has(key)) {
        const tableMeta = reportTables.find(t => String(t.Table_Id) === String(slot.tableId));
        const tableName = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${slot.tableId}`;
        return {
          isValid: false,
          message: `Column "${slot.columnName}" from "${tableName}" is used in multiple Level 2 filters`
        };
      }
      level2Set.add(key);
    }

    for (const slot1 of level1Slots) {
      for (const slot2 of level2Slots) {
        if (String(slot1.tableId) === String(slot2.tableId) &&
          String(slot1.columnName) === String(slot2.columnName)) {
          const tableMeta = reportTables.find(t => String(t.Table_Id) === String(slot1.tableId));
          const tableName = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${slot1.tableId}`;
          return {
            isValid: false,
            message: `Column "${slot1.columnName}" from "${tableName}" cannot be used in both Level 1 and Level 2 filters`
          };
        }
      }
    }

    // Note: Group filters can have duplicate columns - no validation needed

    return { isValid: true };
  };

  const saveTemplate = async () => {
    const validation = validateNoDuplicateColumns();
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    const { details, groupFilterDetails } = buildDetails();

    if (details.length === 0 && groupFilterDetails.length === 0) {
      toast.error("Assign at least one filter slot (table + column) before saving");
      return;
    }
    if (!inputValues.reportName || String(inputValues.reportName).trim() === '') {
      toast.error("Report name is required");
      return;
    }

    const payload = {
      Report_Type_Id: inputValues?.Report_Type_Id || null,
      reportName: inputValues.reportName,
      createdBy: inputValues.createdBy,
      updatedBy: storage?.UserId,
      details: details,
      ...(groupFilterDetails.length > 0 && {
        GroupFilter: groupFilterDetails
      })
    };

    try {
      const res = await fetchLink({
        address: `reports/templateMobile`,
        method: inputValues?.Report_Type_Id ? 'PUT' : 'POST',
        bodyData: payload
      });
      if (res?.success) {
        toast.success(res.message);
        setInputValues(initialValue);
        setFilterSlotsLevel1([
          { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
          { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
          { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 }
        ]);
        setFilterSlotsLevel2([
          { slot: 1, enabled: false, tableId: null, columnName: null, type: 4 },
          { slot: 2, enabled: false, tableId: null, columnName: null, type: 5 },
          { slot: 3, enabled: false, tableId: null, columnName: null, type: 6 }
        ]);
        setGroupFilterSlots([
          { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 },
          { slot: 2, enabled: false, tableId: null, columnName: null, type: 8 },
          { slot: 3, enabled: false, tableId: null, columnName: null, type: 9 }
        ]);
        setSelectedListTypes([]);
        nav(-1);
      } else {
        toast.error(res?.message || 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving template');
    }
  };

  const canPreview =
    filterSlotsLevel1.some(s => s.enabled && s.tableId && s.columnName) ||
    filterSlotsLevel2.some(s => s.enabled && s.tableId && s.columnName) ||
    groupFilterSlots.some(s => s.enabled && s.tableId && s.columnName);

  if (!isEqualNumber(contextObj?.Add_Rights, 1)) return null;

  const renderFilterSection = (title, filterSlots, level) => (
    <Box className="mt-3 p-3 border rounded" sx={{ background: '#FBFCFD' }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>{title}</Typography>

      <Grid container spacing={3}>
        {filterSlots.map((slot, idx) => {
          const label = level === 'group' ? `Group Filter ${slot.slot}` : `Filter ${slot.slot}`;

          const tablesToShow = level === 'group' ? losTables : reportTables;

          return (
            <Grid item xs={4} key={slot.type}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                background: '#fff',
                border: '1px solid #e0e0e0',
                minHeight: '60px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => handleFilterToggle(idx, level)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
                </label>
              </Box>

              {slot.enabled ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
                      Table
                    </Typography>
                    <select
                      className="cus-inpt"
                      value={slot.tableId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        if (level === 'level1') {
                          setFilterSlotsLevel1(prev => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], tableId: val, columnName: null };
                            return arr;
                          });
                        } else if (level === 'level2') {
                          setFilterSlotsLevel2(prev => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], tableId: val, columnName: null };
                            return arr;
                          });
                        } else {
                          setGroupFilterSlots(prev => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], tableId: val, columnName: null };
                            return arr;
                          });
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select table</option>
                      {tablesToShow.map((t, ti) => (
                        <option key={ti} value={t.Table_Id}>
                          {t.AliasName || t.Table_Name}
                          {level === 'group' && ' (LOS)'}
                        </option>
                      ))}
                      {level === 'group' && tablesToShow.length === 0 && (
                        <option value="" disabled>No LOS tables found</option>
                      )}
                    </select>
                    {level === 'group' && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        Only LOS tables are shown for group filter
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
                      Column
                    </Typography>
                    <select
                      className="cus-inpt"
                      value={slot.columnName ?? ''}
                      disabled={!slot.tableId}
                      onChange={(e) => {
                        const val = e.target.value || null;

                        if (level === 'level1') {
                          setFilterSlotsLevel1(prev => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], columnName: val };
                            return arr;
                          });
                        } else if (level === 'level2') {
                          setFilterSlotsLevel2(prev => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], columnName: val };
                            return arr;
                          });
                        } else {
                          setGroupFilterSlots(prev => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], columnName: val };
                            return arr;
                          });
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select column</option>
                      {slot.tableId && getColumnsForTableId(slot.tableId).map((c, ci) => {
                        let isDisabled = false;
                        let disabledReason = '';

                        if (level === 'group') {
                          isDisabled = false;
                        } else if (level === 'level1') {
                          const usedInOtherLevel1 = filterSlotsLevel1.some((s, slotIdx) => {
                            if (!s.enabled || !s.tableId || !s.columnName) return false;
                            if (slotIdx === idx) return false;
                            return String(s.tableId) === String(slot.tableId) &&
                              String(s.columnName) === String(c.Column_Name);
                          });

                          const usedInLevel2 = filterSlotsLevel2.some(s => {
                            if (!s.enabled || !s.tableId || !s.columnName) return false;
                            return String(s.tableId) === String(slot.tableId) &&
                              String(s.columnName) === String(c.Column_Name);
                          });

                          isDisabled = usedInOtherLevel1 || usedInLevel2;
                          if (usedInOtherLevel1) disabledReason = ' (Used in another Level 1 filter)';
                          else if (usedInLevel2) disabledReason = ' (Used in Level 2 filter)';
                        } else if (level === 'level2') {
                          const usedInOtherLevel2 = filterSlotsLevel2.some((s, slotIdx) => {
                            if (!s.enabled || !s.tableId || !s.columnName) return false;
                            if (slotIdx === idx) return false;
                            return String(s.tableId) === String(slot.tableId) &&
                              String(s.columnName) === String(c.Column_Name);
                          });

                          const usedInLevel1 = filterSlotsLevel1.some(s => {
                            if (!s.enabled || !s.tableId || !s.columnName) return false;
                            return String(s.tableId) === String(slot.tableId) &&
                              String(s.columnName) === String(c.Column_Name);
                          });

                          isDisabled = usedInOtherLevel2 || usedInLevel1;
                          if (usedInOtherLevel2) disabledReason = ' (Used in another Level 2 filter)';
                          else if (usedInLevel1) disabledReason = ' (Used in Level 1 filter)';
                        }

                        const isCurrentlySelected = slot.columnName === c.Column_Name;
                        const shouldDisable = !isCurrentlySelected && isDisabled;

                        return (
                          <option
                            key={ci}
                            value={c.Column_Name}
                            disabled={shouldDisable}
                            style={{
                              color: shouldDisable ? '#999' : 'inherit',
                              backgroundColor: shouldDisable ? '#f5f5f5' : 'inherit',
                              fontStyle: shouldDisable ? 'italic' : 'normal'
                            }}
                          >
                            {c.Column_Name}
                            {c.Column_Data_Type ? ` (${c.Column_Data_Type})` : ''}
                            {shouldDisable ? disabledReason : ''}
                          </option>
                        );
                      })}
                    </select>
                    {level === 'group' && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                        Note: All columns are enabled in Group Filter, even if used in Level 1/2 filters.
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  borderRadius: 1,
                  background: '#f8f9fa',
                  border: '1px dashed #dee2e6',
                  color: '#6c757d',
                  textAlign: 'center',
                  minHeight: '120px'
                }}>
                  <Typography variant="body2">
                    Enable {label} to configure
                  </Typography>
                </Box>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <>
      <Card>
        <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
          <span className="text-primary text-uppercase ps-3">{inputValues?.Report_Type_Id ? 'Modify Mobile Template' : 'Mobile Template Creation'}</span>
          <Button variant="outlined" onClick={() => nav(-1)} startIcon={<KeyboardArrowLeft />}>Back</Button>
        </div>

        <CardContent>
          <div>
            <label className="w-100">Report Name</label>
            <Select
              value={
                inputValues.reportName
                  ? {
                    value: inputValues.reportName,
                    label: inputValues.reportName,
                  }
                  : null
              }
              onChange={(selectedOption) => {
                setInputValues({
                  ...inputValues,
                  reportName: selectedOption ? selectedOption.value : ''
                });
              }}
              options={reportOptions}
              placeholder={loadingReports ? "Loading reports..." : "Select or type to search..."}
              isClearable={true}
              isSearchable={true}
              isLoading={loadingReports}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? `Press Enter to create "${inputValue}"` : "No options available"
              }
              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
              onCreateOption={(inputValue) => {
                const alreadyExists = reportOptions.some(opt =>
                  opt.value.toLowerCase() === inputValue.toLowerCase()
                );

                if (!alreadyExists) {
                  const newOption = {
                    value: inputValue,
                    label: inputValue,
                  };

                  setReportOptions(prev => [...prev, newOption]);
                  setExistingReportName(prev => [...prev, inputValue]);
                }

                setInputValues({ ...inputValues, reportName: inputValue });
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  width: '600px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  minHeight: '36px',
                }),
                menu: (base) => ({
                  ...base,
                  width: '300px',
                }),
              }}
            />
          </div>

          <div className="p-2 mt-3 border rounded-3 d-inline-block">
            <table>
              <tbody>
                <tr><td className="border-end">Total Filters Assigned</td><td className="px-2 blue-text">{totalTablesSelected}</td></tr>
                <tr><td className="border-end">Total Columns Assigned</td><td className="px-2 blue-text">{totalColumnsSelected}</td></tr>
                <tr><td className="border-end">Level 1 Filters</td><td className="px-2 blue-text">{tablesSelectedCountLevel1}</td></tr>
                <tr><td className="border-end">Level 2 Filters</td><td className="px-2 blue-text">{tablesSelectedCountLevel2}</td></tr>
                <tr><td className="border-end">Group Filters</td><td className="px-2 blue-text">{tablesSelectedCountGroup}</td></tr>
              </tbody>
            </table>
          </div>

          {renderFilterSection("Level 1 Filters", filterSlotsLevel1, 'level1')}
          {renderFilterSection("Level 2 Filters", filterSlotsLevel2, 'level2')}
          {renderFilterSection("Group Filters", groupFilterSlots, 'group')}

          <Box className="mt-3 d-flex align-items-center" sx={{ gap: 2 }}>
            <Typography fontWeight={700}>List Type:</Typography>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={selectedListTypes.includes(1)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedListTypes(prev => [...prev, 1]);
                  } else {
                    setSelectedListTypes(prev => prev.filter(x => x !== 1));
                  }
                }}
              />
              <span>Sum</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={selectedListTypes.includes(2)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedListTypes(prev => [...prev, 2]);
                  } else {
                    setSelectedListTypes(prev => prev.filter(x => x !== 2));
                  }
                }}
              />
              <span>Avg</span>
            </label>
          </Box>

          <Box className="mt-4 d-flex justify-content-end" sx={{ gap: 2 }}>
            <Button variant="outlined" onClick={() => {
              setFilterSlotsLevel1([
                { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
                { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
                { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
              ]);
              setFilterSlotsLevel2([
                { slot: 1, enabled: false, tableId: null, columnName: null, type: 4 },
                { slot: 2, enabled: false, tableId: null, columnName: null, type: 5 },
                { slot: 3, enabled: false, tableId: null, columnName: null, type: 6 },
              ]);
              setGroupFilterSlots([
                { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 },
                { slot: 2, enabled: false, tableId: null, columnName: null, type: 8 },
                { slot: 3, enabled: false, tableId: null, columnName: null, type: 9 }
              ]);
              setSelectedListTypes([]);
            }}>
              Reset All
            </Button>

            <Tooltip title={!canPreview ? 'Assign at least one slot to Preview' : ''}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<RemoveRedEyeOutlined />}
                  disabled={!canPreview}
                  onClick={() => setOpenConfigPreview(true)}
                >
                  Preview
                </Button>
              </span>
            </Tooltip>

            <Button variant="contained" startIcon={<Save />} onClick={saveTemplate}>
              Submit
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openConfigPreview} onClose={() => setOpenConfigPreview(false)} fullWidth maxWidth="md">
        <DialogTitle>Preview - Template Configuration</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Report: {inputValues.reportName || '—'}</Typography>

          <Box sx={{ mb: 2 }}>
            {filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName).length === 0 &&
              filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName).length === 0 &&
              groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).length === 0 && (
                <Typography>No filter assigned yet.</Typography>
              )}

            {filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName).length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Level 1 Filters:</Typography>
                {filterSlotsLevel1.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
                  const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
                  const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
                  const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
                  const label = `Filter ${s.slot}`;
                  return (
                    <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
                      <Grid container alignItems="center">
                        <Grid item xs={12} md={3}><strong>{label}</strong></Grid>
                        <Grid item xs={12} md={4}>{tableLabel}</Grid>
                        <Grid item xs={12} md={3}>{s.columnName}</Grid>
                        <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </>
            )}

            {filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName).length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Level 2 Filters:</Typography>
                {filterSlotsLevel2.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
                  const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
                  const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
                  const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
                  const label = `Filter ${s.slot}`;
                  return (
                    <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
                      <Grid container alignItems="center">
                        <Grid item xs={12} md={3}><strong>{label}</strong></Grid>
                        <Grid item xs={12} md={4}>{tableLabel}</Grid>
                        <Grid item xs={12} md={3}>{s.columnName}</Grid>
                        <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </>
            )}

            {groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Group Filters:</Typography>
                {groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
                  const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
                  const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
                  const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
                  
                  // Determine Level_Id for display (1,2,3)
                  const levelId = s.type === 7 ? 1 : s.type === 8 ? 2 : 3;
                  
                  return (
                    <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
                      <Grid container alignItems="center">
                        <Grid item xs={12} md={3}><strong>Group Filter {s.slot} (Level {levelId})</strong></Grid>
                        <Grid item xs={12} md={4}>{tableLabel} {tableMeta && (tableMeta.Table_Name?.toLowerCase().includes('los') || tableMeta.AliasName?.toLowerCase().includes('los')) && '(LOS)'}</Grid>
                        <Grid item xs={12} md={3}>{s.columnName}</Grid>
                        <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>

          <Typography variant="caption" color="textSecondary">
            Note: Columns already used in other filter slots are disabled to prevent duplicates. Group Filters can use any column.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenConfigPreview(false)} startIcon={<ArrowBackIosNewOutlined />}>Back</Button>
          <Button variant="contained" onClick={() => { setOpenConfigPreview(false); saveTemplate(); }}>Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportsTemplateMobCreation;