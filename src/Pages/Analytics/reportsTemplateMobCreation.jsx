// import React, { useContext, useEffect, useState } from 'react';
// import {
//   Card, CardContent, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
//   Box, IconButton, Grid, Typography
// } from '@mui/material';
// import { ArrowBackIosNewOutlined, KeyboardArrowLeft, RemoveRedEyeOutlined, Save } from '@mui/icons-material';
// import { isValidObject, Subraction, isEqualNumber } from '../../Components/functions';
// import { toast } from 'react-toastify';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { MyContext } from '../../Components/context/contextProvider';
// import { fetchLink } from '../../Components/fetchComponent';

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

//   const [inputValues, setInputValues] = useState(initialValue);
//   const [reportTables, setReportTables] = useState([]);

 
//   const [filterSlots, setFilterSlots] = useState([
//     { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//     { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//     { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
//   ]);


//   const [selectedListTypes, setSelectedListTypes] = useState([]); 


//   const [openConfigPreview, setOpenConfigPreview] = useState(false);


// useEffect(() => {
//   const stateValue = locationState?.ReportState;
//   if (isValidObject(stateValue)) {
//     setInputValues(prev => ({
//       ...prev,
//       Report_Type_Id: stateValue?.Report_Type_Id ?? '',
//       reportName: stateValue?.reportName ?? '',
//       tables: [...(stateValue?.tables || [])],
//       createdBy: stateValue?.createdBy ?? storage?.UserId
//     }));
//   }
// }, [locationState?.ReportState, storage?.UserId]);

//   useEffect(() => {

//     fetchLink({ address: `reports/tablesAndColumnsMobile` })
//       .then(data => {
//         if (data?.success) setReportTables(data?.data || []);
//       }).catch(e => console.error(e));
//   }, []);


// useEffect(() => {
//   if (!inputValues.tables || inputValues.tables.length === 0) return;

//   const assignments = [];
//   const allListTypes = new Set(); 
  
//   inputValues.tables.forEach(table => {
//     table.columns?.forEach(column => {
//       if (column.Type) {
//         const types = Array.isArray(column.Type) ? column.Type : [column.Type];
//         types.forEach(type => {
//           if (type) {
//             assignments.push({
//               type: Number(type),
//               tableId: table.Table_Id,
//               columnName: column.Column_Name,
//               listType: column.List_Type
//             });

//             // Process list types for this column
//             if (column.List_Type) {
//               const listTypes = String(column.List_Type)
//                 .split(',')
//                 .map(lt => Number(lt.trim()))
//                 .filter(lt => !isNaN(lt));
              
//               listTypes.forEach(lt => allListTypes.add(lt));
//             }
//           }
//         });
//       }
//     });
//   });

//   // Update filter slots
//   if (assignments.length > 0) {
//     setFilterSlots(prev => {
//       const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));
      
//       assignments.forEach(assignment => {
//         const slotIndex = newSlots.findIndex(slot => slot.type === assignment.type);
//         if (slotIndex !== -1) {
//           newSlots[slotIndex] = {
//             ...newSlots[slotIndex],
//             enabled: true,
//             tableId: assignment.tableId,
//             columnName: assignment.columnName
//           };
//         }
//       });
      
//       return newSlots;
//     });

//     // Set ALL collected list types for the checkboxes
//     if (allListTypes.size > 0) {
//       setSelectedListTypes(Array.from(allListTypes));
//     } else {
//       setSelectedListTypes([1]); 
//     }
//   }
// }, [inputValues.tables]);

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

//   const isColumnUsedInOtherSlot = (tableId, columnName, currentSlotIdx) => {
//     return filterSlots.some((s, idx) => {
//       if (!s.enabled) return false;
//       if (idx === currentSlotIdx) return false;
//       return String(s.tableId) === String(tableId) && String(s.columnName) === String(columnName);
//     });
//   };


//   const handleFilter1TableChange = (tableId) => {
//     setFilterSlots(prev => {
//       const newSlots = [...prev];
      

//       newSlots[0] = { 
//         ...newSlots[0], 
//         tableId: tableId, 
//         columnName: null
//       };
      

//       for (let i = 1; i < newSlots.length; i++) {
//         if (newSlots[i].enabled) {
//           newSlots[i] = {
//             ...newSlots[i],
//             tableId: tableId,
//             columnName: null 
//           };
//         }
//       }
      
//       return newSlots;
//     });
//   };


//   const handleFilterToggle = (idx) => {
//     setFilterSlots(prev => {
//       const arr = [...prev];
//       const newEnabledState = !arr[idx].enabled;
      
//       arr[idx] = { 
//         ...arr[idx], 
//         enabled: newEnabledState,
//         tableId: newEnabledState && idx > 0 ? arr[0].tableId : arr[idx].tableId,
//         columnName: newEnabledState ? null : null 
//       };
      
//       return arr;
//     });
//   };


//   const tablesSelectedCount = filterSlots.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
//   const columnsSelectedCount = filterSlots.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);


// const buildDetails = () => {
//   const details = [];

//   filterSlots.forEach(slot => {
//     if (!slot.enabled) return;
//     if (!slot.tableId || !slot.columnName) return;

   
//     const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

//     details.push({
//       Type: Number(slot.type),
//       Table_Id: Number(slot.tableId),
//       Column_Name: slot.columnName,
//       List_Type: listTypeToSave
//     });
//   });

//   return details;
// };

//   const saveTemplate = async () => {
//     const details = buildDetails();

//     if (!details.length) {
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
//       updatedBy:storage?.UserId,
//       details
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
//         setFilterSlots([
//           { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//           { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//           { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 }
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

//   const canPreview = filterSlots.some(s => s.enabled && s.tableId && s.columnName);

//   if (!isEqualNumber(contextObj?.Add_Rights, 1)) return null;

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
//             <select
//               className="cus-inpt w-auto"
//               value={inputValues.reportName}
//               onChange={e => setInputValues({ ...inputValues, reportName: e.target.value })}
//             >
//                <option value="" disabled>Select</option>
//               <option value="StockInhand">Stock Inhand</option>
//               <option value="Sales Invoice">Sales Invoice</option>
//             </select>
//           </div>

//           <div className="p-2 mt-3 border rounded-3 d-inline-block">
//             <table><tbody>
//               <tr><td className="border-end">Filters Assigned</td><td className="px-2 blue-text">{tablesSelectedCount}</td></tr>
//               <tr><td className="border-end">Columns Assigned</td><td className="px-2 blue-text">{columnsSelectedCount}</td></tr>
//             </tbody></table>
//           </div>

//           <Box className="mt-3 p-3 border rounded" sx={{ background: '#FBFCFD' }}>
//             <Typography variant="subtitle1" fontWeight={700} gutterBottom>Filters</Typography>

//             <Grid container spacing={2}>
//               {filterSlots.map((slot, idx) => {
//                 const label = `Filter ${slot.slot}`;
//                 return (
//                   <Grid item xs={12} md={6} key={slot.type}>
//                     <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1, borderRadius: 1, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.03) inset' }}>
//                       <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                         <input
//                           type="checkbox"
//                           checked={slot.enabled}
//                           onChange={() => handleFilterToggle(idx)}
//                         />
//                         <strong>{label}</strong>
//                       </label>

//                       {slot.enabled && (
//                         <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
//                           <select
//                             className="cus-inpt"
//                             value={slot.tableId ?? ''}
//                             onChange={(e) => {
//                               const val = e.target.value || null;
//                               if (idx === 0) {

//                                 handleFilter1TableChange(val);
//                               } else {
        
//                                 setFilterSlots(prev => {
//                                   const arr = [...prev];
//                                   arr[idx] = { ...arr[idx], tableId: val, columnName: null };
//                                   return arr;
//                                 });
//                               }
//                             }}
//                             disabled={idx > 0 && filterSlots[0].tableId} 
//                           >
//                             <option value="">Select table</option>
//                             {reportTables.map((t, ti) => (
//                               <option key={ti} value={t.Table_Id}>{t.AliasName || t.Table_Name}</option>
//                             ))}
//                           </select>
// <select
//   className="cus-inpt"
//   value={slot.columnName ?? ''}
//   disabled={!slot.tableId}
//   onChange={(e) => {
//     const val = e.target.value || null;
    
  
//     if (val && isColumnUsedInOtherSlot(slot.tableId, val, idx)) {
//       toast.error('Column already assigned to another filter slot. Choose a different column.');
//       return;
//     }
    
//     setFilterSlots(prev => {
//       const arr = [...prev];
//       arr[idx] = { ...arr[idx], columnName: val };
//       return arr;
//     });
//   }}
// >
//   <option value="">Select column</option>
//   {slot.tableId && getColumnsForTableId(slot.tableId).map((c, ci) => {
//     const isUsedInOtherSlot = isColumnUsedInOtherSlot(slot.tableId, c.Column_Name, idx);
//     const isCurrentlySelected = slot.columnName === c.Column_Name;

//     const isSelectable = isCurrentlySelected || !isUsedInOtherSlot;
    
//     return (
//       <option 
//         key={ci} 
//         value={c.Column_Name} 
//         disabled={!isSelectable} 
//         style={{ 
//           color: !isSelectable ? '#999' : 'inherit',
//           backgroundColor: !isSelectable ? '#f5f5f5' : 'inherit',
//           fontStyle: !isSelectable ? 'italic' : 'normal'
//         }}
//       >
//         {c.Column_Name} 
//         {c.Column_Data_Type ? ` (${c.Column_Data_Type})` : ''}
//         {!isSelectable && !isCurrentlySelected ? ' - Already used in another filter' : ''}
//       </option>
//     );
//   })}
// </select>
//                         </Box>
//                       )}
//                     </Box>
//                   </Grid>
//                 );
//               })}
//             </Grid>
//           </Box>

   
// <Box className="mt-3 d-flex align-items-center" sx={{ gap: 2 }}>
//   <Typography fontWeight={700}>List Type:</Typography>
//   <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//     <input 
//       type="checkbox" 
//       checked={selectedListTypes.includes(1)} 
//       onChange={(e) => {
//         if (e.target.checked) {
//           setSelectedListTypes(prev => [...prev, 1]);
//         } else {
//           setSelectedListTypes(prev => prev.filter(x => x !== 1));
//         }
//       }} 
//     /> 
//     <span>Sum</span>
//   </label>
//   <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//     <input 
//       type="checkbox" 
//       checked={selectedListTypes.includes(2)} 
//       onChange={(e) => {
//         if (e.target.checked) {
//           setSelectedListTypes(prev => [...prev, 2]);
//         } else {
//           setSelectedListTypes(prev => prev.filter(x => x !== 2));
//         }
//       }} 
//     /> 
//     <span>Avg</span>
//   </label>
// </Box>

//           <Box className="mt-4 d-flex justify-content-end" sx={{ gap: 2 }}>
//             <Button variant="outlined" onClick={() => { 
//               setFilterSlots([
//                 { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//                 { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//                 { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
//               ]); 
//               setSelectedListTypes([]); 
//             }}>
//               Reset
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
//             {filterSlots.filter(s => s.enabled && s.tableId && s.columnName).length === 0 && (
//               <Typography>No filter assigned yet.</Typography>
//             )}

//             {filterSlots.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
//               const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
//               const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
//               const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
//               const label = `Filter ${s.slot}`;
//               return (
//                 <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
//                   <Grid container alignItems="center">
//                     <Grid item xs={12} md={3}><strong>{label}</strong></Grid>
//                     <Grid item xs={12} md={4}>{tableLabel}</Grid>
//                     <Grid item xs={12} md={3}>{s.columnName}</Grid>
//                     <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
//                   </Grid>
//                 </Box>
//               );
//             })}
//           </Box>

//           <Typography variant="caption" color="textSecondary">
//             This preview shows the selected filters and the chosen List Type. It is a configuration review only — no data is fetched.
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











// import React, { useContext, useEffect, useState } from 'react';
// import {
//   Card, CardContent, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
//   Box, IconButton, Grid, Typography
// } from '@mui/material';
// import { ArrowBackIosNewOutlined, KeyboardArrowLeft, RemoveRedEyeOutlined, Save } from '@mui/icons-material';
// import { isValidObject, Subraction, isEqualNumber } from '../../Components/functions';
// import { toast } from 'react-toastify';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { MyContext } from '../../Components/context/contextProvider';
// import { fetchLink } from '../../Components/fetchComponent';

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

//   const [inputValues, setInputValues] = useState(initialValue);
//   const [reportTables, setReportTables] = useState([]);

//   const [filterSlots, setFilterSlots] = useState([
//     { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//     { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//     { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
//   ]);

//   const [selectedListTypes, setSelectedListTypes] = useState([]); 
//   const [openConfigPreview, setOpenConfigPreview] = useState(false);

//   useEffect(() => {
//     const stateValue = locationState?.ReportState;
//     if (isValidObject(stateValue)) {
//       setInputValues(prev => ({
//         ...prev,
//         Report_Type_Id: stateValue?.Report_Type_Id ?? '',
//         reportName: stateValue?.reportName ?? '',
//         tables: [...(stateValue?.tables || [])],
//         createdBy: stateValue?.createdBy ?? storage?.UserId
//       }));
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
//                 listType: column.List_Type
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

   
//     if (assignments.length > 0) {
//       setFilterSlots(prev => {
//         const newSlots = prev.map(slot => ({ ...slot, enabled: false, tableId: null, columnName: null }));
        
//         assignments.forEach(assignment => {
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

      
//       if (allListTypes.size > 0) {
//         setSelectedListTypes(Array.from(allListTypes));
//       } else {
//         setSelectedListTypes([1]); 
//       }
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

//   const isColumnUsedInOtherSlot = (tableId, columnName, currentSlotIdx) => {
//     return filterSlots.some((s, idx) => {
//       if (!s.enabled) return false;
//       if (idx === currentSlotIdx) return false;
//       return String(s.tableId) === String(tableId) && String(s.columnName) === String(columnName);
//     });
//   };



//   const handleFilterToggle = (idx) => {
//     setFilterSlots(prev => {
//       const arr = [...prev];
//       const newEnabledState = !arr[idx].enabled;
      
     
//       arr[idx] = { 
//         ...arr[idx], 
//         enabled: newEnabledState,
      
//         columnName: newEnabledState ? null : null 
//       };
      
//       return arr;
//     });
//   };

//   const tablesSelectedCount = filterSlots.reduce((acc, s) => acc + (s.enabled && s.tableId ? 1 : 0), 0);
//   const columnsSelectedCount = filterSlots.reduce((acc, s) => acc + (s.enabled && s.columnName ? 1 : 0), 0);

//   const buildDetails = () => {
//     const details = [];

//     filterSlots.forEach(slot => {
//       if (!slot.enabled) return;
//       if (!slot.tableId || !slot.columnName) return;

//       const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

//       details.push({
//         Type: Number(slot.type),
//         Table_Id: Number(slot.tableId),
//         Column_Name: slot.columnName,
//         List_Type: listTypeToSave
//       });
//     });

//     return details;
//   };

//   const saveTemplate = async () => {
//     const details = buildDetails();

//     if (!details.length) {
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
//       details
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
//         setFilterSlots([
//           { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//           { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//           { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 }
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

//   const canPreview = filterSlots.some(s => s.enabled && s.tableId && s.columnName);

//   if (!isEqualNumber(contextObj?.Add_Rights, 1)) return null;

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
//             <select
//               className="cus-inpt w-auto"
//               value={inputValues.reportName}
//               onChange={e => setInputValues({ ...inputValues, reportName: e.target.value })}
//             >
//               <option value="" disabled>Select</option>
//               <option value="StockInhand">Stock Inhand</option>
//               <option value="Sales Invoice">Sales Invoice</option>
//             </select>
//           </div>

//           <div className="p-2 mt-3 border rounded-3 d-inline-block">
//             <table><tbody>
//               <tr><td className="border-end">Filters Assigned</td><td className="px-2 blue-text">{tablesSelectedCount}</td></tr>
//               <tr><td className="border-end">Columns Assigned</td><td className="px-2 blue-text">{columnsSelectedCount}</td></tr>
//             </tbody></table>
//           </div>

//          <Box className="mt-3 p-3 border rounded" sx={{ background: '#FBFCFD' }}>
//   <Typography variant="subtitle1" fontWeight={700} gutterBottom>Level1 Filters</Typography>
  

//   <Grid container spacing={3}>
//     {filterSlots.map((slot, idx) => {
//       const label = `Filter ${slot.slot}`;
//       return (
//         <Grid item xs={4} key={slot.type}>
 
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             p: 1.5, 
//             mb: 1,
//             borderRadius: 1, 
//             background: '#fff', 
//             border: '1px solid #e0e0e0',
//             minHeight: '60px'
//           }}>
//             <label style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
//               <input
//                 type="checkbox"
//                 checked={slot.enabled}
//                 onChange={() => handleFilterToggle(idx)}
//                 style={{ width: '18px', height: '18px' }}
//               />
//               <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
//             </label>
//           </Box>
          
  
//           {slot.enabled ? (
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
   
//               <Box>
//                 <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
//                   Table
//                 </Typography>
//                 <select
//                   className="cus-inpt"
//                   value={slot.tableId ?? ''}
//                   onChange={(e) => {
//                     const val = e.target.value || null;
//                     setFilterSlots(prev => {
//                       const arr = [...prev];
//                       arr[idx] = { ...arr[idx], tableId: val, columnName: null };
//                       return arr;
//                     });
//                   }}
//                   style={{ width: '100%' }}
//                 >
//                   <option value="">Select table</option>
//                   {reportTables.map((t, ti) => (
//                     <option key={ti} value={t.Table_Id}>{t.AliasName || t.Table_Name}</option>
//                   ))}
//                 </select>
//               </Box>
              

//               <Box>
//                 <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
//                   Column
//                 </Typography>
//                 <select
//                   className="cus-inpt"
//                   value={slot.columnName ?? ''}
//                   disabled={!slot.tableId}
//                   onChange={(e) => {
//                     const val = e.target.value || null;
                    
//                     if (val && isColumnUsedInOtherSlot(slot.tableId, val, idx)) {
//                       toast.error('Column already assigned to another filter slot. Choose a different column.');
//                       return;
//                     }
                    
//                     setFilterSlots(prev => {
//                       const arr = [...prev];
//                       arr[idx] = { ...arr[idx], columnName: val };
//                       return arr;
//                     });
//                   }}
//                   style={{ width: '100%' }}
//                 >
//                   <option value="">Select column</option>
//                   {slot.tableId && getColumnsForTableId(slot.tableId).map((c, ci) => {
//                     const isUsedInOtherSlot = isColumnUsedInOtherSlot(slot.tableId, c.Column_Name, idx);
//                     const isCurrentlySelected = slot.columnName === c.Column_Name;

//                     const isSelectable = isCurrentlySelected || !isUsedInOtherSlot;
                    
//                     return (
//                       <option 
//                         key={ci} 
//                         value={c.Column_Name} 
//                         disabled={!isSelectable} 
//                         style={{ 
//                           color: !isSelectable ? '#999' : 'inherit',
//                           backgroundColor: !isSelectable ? '#f5f5f5' : 'inherit',
//                           fontStyle: !isSelectable ? 'italic' : 'normal'
//                         }}
//                       >
//                         {c.Column_Name} 
//                         {c.Column_Data_Type ? ` (${c.Column_Data_Type})` : ''}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </Box>
//             </Box>
//           ) : (
//             <Box sx={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               p: 3, 
//               borderRadius: 1, 
//               background: '#f8f9fa',
//               border: '1px dashed #dee2e6',
//               color: '#6c757d',
//               textAlign: 'center',
//               minHeight: '120px'
//             }}>
//               <Typography variant="body2">
//                 Enable {label} to configure
//               </Typography>
//             </Box>
//           )}
//         </Grid>
//       );
//     })}
//   </Grid>
// </Box>

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
//               setFilterSlots([
//                 { slot: 1, enabled: false, tableId: null, columnName: null, type: 1 },
//                 { slot: 2, enabled: false, tableId: null, columnName: null, type: 2 },
//                 { slot: 3, enabled: false, tableId: null, columnName: null, type: 3 },
//               ]); 
//               setSelectedListTypes([]); 
//             }}>
//               Reset
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
//             {filterSlots.filter(s => s.enabled && s.tableId && s.columnName).length === 0 && (
//               <Typography>No filter assigned yet.</Typography>
//             )}

//             {filterSlots.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
//               const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
//               const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
//               const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
//               const label = `Filter ${s.slot}`;
//               return (
//                 <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
//                   <Grid container alignItems="center">
//                     <Grid item xs={12} md={3}><strong>{label}</strong></Grid>
//                     <Grid item xs={12} md={4}>{tableLabel}</Grid>
//                     <Grid item xs={12} md={3}>{s.columnName}</Grid>
//                     <Grid item xs={12} md={2} style={{ textAlign: 'right' }}>{listType}</Grid>
//                   </Grid>
//                 </Box>
//               );
//             })}
//           </Box>

//           <Typography variant="caption" color="textSecondary">
//             {/* This preview shows the selected filters and the chosen List Type. It is a configuration review only — no data is fetched. */}
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









import React, { useContext, useEffect, useState } from 'react';
import {
  Card, CardContent, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, IconButton, Grid, Typography
} from '@mui/material';
import { ArrowBackIosNewOutlined, KeyboardArrowLeft, RemoveRedEyeOutlined, Save } from '@mui/icons-material';
import { isValidObject, Subraction, isEqualNumber } from '../../Components/functions';
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

  const[showDropdown,setShowDropdown]=useState([])
  const [inputValues, setInputValues] = useState(initialValue);
  const [reportTables, setReportTables] = useState([]);
  const[existingReportName,setExistingReportName]=useState([])
  const [loadingReports,setLoadingReports]=useState(false)
  
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
        
        // Convert to react-select format
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
      
      // If editing and report name exists but not in options, add it
      if (reportName && !reportOptions.some(opt => opt.value === reportName)) {
        const newOption = { value: reportName, label: reportName };
        setReportOptions(prev => [...prev, newOption]);
        setExistingReportName(prev => [...prev, reportName]);
      }
      
      const groupFilterFromState = stateValue?.GroupFilter || [];
      
      if (groupFilterFromState.length > 0) {
        setGroupFilterSlots(prev => {
          const newSlots = [...prev];
          
          groupFilterFromState.forEach((gf, index) => {
            if (index < newSlots.length) {
              newSlots[index] = {
                ...newSlots[index],
                enabled: true,
                tableId: gf.Table_Id,
                columnName: gf.Column_Name,
                type: gf.Type || 7
              };
            }
          });
          
          return newSlots;
        });
      }
    }
  }, [locationState?.ReportState, storage?.UserId]);

  useEffect(() => {
    fetchLink({ address: `reports/tablesAndColumnsMobile` })
      .then(data => {
        if (data?.success) setReportTables(data?.data || []);
      }).catch(e => console.error(e));
  }, []);

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
    const groupFilterAssignments = assignments.filter(a => a.type === 7);

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

  const isColumnUsedInOtherSlot = (tableId, columnName, currentSlotIdx, level, currentType) => {
    let currentLevelSlots;
    if (level === 'level1') {
      currentLevelSlots = filterSlotsLevel1;
    } else if (level === 'level2') {
      currentLevelSlots = filterSlotsLevel2;
    } else {
      currentLevelSlots = groupFilterSlots;
    }
    
    const usedInSameLevel = currentLevelSlots.some((s, idx) => {
      if (!s.enabled) return false;
      if (idx === currentSlotIdx) return false;
      return String(s.tableId) === String(tableId) && String(s.columnName) === String(columnName);
    });

    const otherLevelSlots = [
      ...(level === 'level1' ? [] : filterSlotsLevel1),
      ...(level === 'level2' ? [] : filterSlotsLevel2),
      ...(level === 'group' ? [] : groupFilterSlots)
    ];
    
    const usedInOtherLevel = otherLevelSlots.some(s => {
      if (!s.enabled) return false;
      return String(s.tableId) === String(tableId) && String(s.columnName) === String(columnName);
    });

    return usedInSameLevel || usedInOtherLevel;
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

  const buildDetails = () => {
    const details = [];
    const groupFilterDetails = [];

    // Regular filters (Level 1 & 2)
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

    // Group filter - separate array
    groupFilterSlots.forEach(slot => {
      if (!slot.enabled) return;
      if (!slot.tableId || !slot.columnName) return;

      const listTypeToSave = selectedListTypes.length === 0 ? "1" : selectedListTypes.join(',');

      groupFilterDetails.push({
        Type: Number(slot.type),
        Table_Id: Number(slot.tableId),
        Column_Name: slot.columnName,
        List_Type: listTypeToSave,
        Level: 3
      });
    });

    return { details, groupFilterDetails };
  };

  const saveTemplate = async () => {
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
          { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 }
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
          const label = level === 'group' ? 'Group Filter' : `Filter ${slot.slot}`;
    
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
                        
                        if (val && isColumnUsedInOtherSlot(slot.tableId, val, idx, level, slot.type)) {
                          toast.error('Column already assigned to another filter slot. Choose a different column.');
                          return;
                        }
                        
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
                        const isUsedInOtherSlot = isColumnUsedInOtherSlot(slot.tableId, c.Column_Name, idx, level, slot.type);
                        const isCurrentlySelected = slot.columnName === c.Column_Name;
                        const isSelectable = isCurrentlySelected || !isUsedInOtherSlot;
                        
                        return (
                          <option 
                            key={ci} 
                            value={c.Column_Name} 
                            disabled={!isSelectable} 
                            style={{ 
                              color: !isSelectable ? '#999' : 'inherit',
                              backgroundColor: !isSelectable ? '#f5f5f5' : 'inherit',
                              fontStyle: !isSelectable ? 'italic' : 'normal'
                            }}
                          >
                            {c.Column_Name} 
                            {c.Column_Data_Type ? ` (${c.Column_Data_Type})` : ''}
                            {isUsedInOtherSlot && !isCurrentlySelected ? ' (Already used)' : ''}
                          </option>
                        );
                      })}
                    </select>
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
                // Check if it already exists
                const alreadyExists = reportOptions.some(opt => 
                  opt.value.toLowerCase() === inputValue.toLowerCase()
                );
                
                if (!alreadyExists) {
                  const newOption = {
                    value: inputValue,
                    label: inputValue,
                  };
                  // Add to options
                  setReportOptions(prev => [...prev, newOption]);
                  setExistingReportName(prev => [...prev, inputValue]);
                }
                
                // Set the value
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
            <table><tbody>
              <tr><td className="border-end">Total Filters Assigned</td><td className="px-2 blue-text">{totalTablesSelected}</td></tr>
              <tr><td className="border-end">Total Columns Assigned</td><td className="px-2 blue-text">{totalColumnsSelected}</td></tr>
              <tr><td className="border-end">Level 1 Filters</td><td className="px-2 blue-text">{tablesSelectedCountLevel1}</td></tr>
              <tr><td className="border-end">Level 2 Filters</td><td className="px-2 blue-text">{tablesSelectedCountLevel2}</td></tr>
              <tr><td className="border-end">Group Filters</td><td className="px-2 blue-text">{tablesSelectedCountGroup}</td></tr>
            </tbody></table>
          </div>

          {renderFilterSection("Level 1 Filters", filterSlotsLevel1, 'level1')}
          {renderFilterSection("Level 2 Filters", filterSlotsLevel2, 'level2')}
          {renderFilterSection("Group Filter", groupFilterSlots, 'group')}

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
                { slot: 1, enabled: false, tableId: null, columnName: null, type: 7 }
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
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Group Filter:</Typography>
                {groupFilterSlots.filter(s => s.enabled && s.tableId && s.columnName).map((s, i) => {
                  const tableMeta = reportTables.find(t => String(t.Table_Id) === String(s.tableId));
                  const tableLabel = tableMeta ? (tableMeta.AliasName || tableMeta.Table_Name) : `Table ${s.tableId}`;
                  const listType = selectedListTypes.length === 0 ? '—' : (selectedListTypes.length === 2 ? 'Sum & Avg' : (selectedListTypes[0] === 1 ? 'Sum' : 'Avg'));
                  return (
                    <Box key={s.type} sx={{ p: 1, borderRadius: 1, background: '#F7F9FB', mb: 1 }}>
                      <Grid container alignItems="center">
                        <Grid item xs={12} md={3}><strong>Group Filter</strong></Grid>
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
            Note: Columns already used in other filter slots are disabled to prevent duplicates.
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