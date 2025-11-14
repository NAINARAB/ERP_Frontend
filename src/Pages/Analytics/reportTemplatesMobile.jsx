import React, { useContext, useEffect, useState } from 'react';
import {
  Card, CardContent, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuList, MenuItem, ListItemIcon, ListItemText, Popover, InputBase, Typography
} from '@mui/material';
import {
  List as ListIcon, Visibility, FilterAlt, Edit, Delete, Close, Launch, Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FilterableTable from '../../Components/filterableTable2';
import DynamicMuiTable from '../../Components/dynamicMuiTable';
import { fetchLink } from '../../Components/fetchComponent';
import { MyContext } from '../../Components/context/contextProvider';
import { isEqualNumber, UTCDateWithTime } from '../../Components/functions';

const Actions = ({ row, onOpen, onFilters, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const popOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <ListIcon />
      </IconButton>

      <Popover
        open={popOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuList>
          <MenuItem onClick={() => { setAnchorEl(null); onOpen(row); }}>
            <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
            <ListItemText>Open</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => { setAnchorEl(null); onFilters(row); }}>
            <ListItemIcon><FilterAlt fontSize="small" /></ListItemIcon>
            <ListItemText>Filters</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => { setAnchorEl(null); onEdit(row); }}>
            <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => { setAnchorEl(null); onDelete(row); }}>
            <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};

const ReportTemplatesMobile = () => {
  const storage = JSON.parse(localStorage.getItem('user'));
  const { contextObj } = useContext(MyContext);
  const nav = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [reload, setReload] = useState(false);


  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openPreFilterDialog, setOpenPreFilterDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({});


useEffect(() => {
  fetchLink({ address: `reports/templateMobile` })
    .then(data => {
      if (data?.success) {
        const raw = data?.data || [];

        const mapped = raw.map(item => {
          const tableMap = {};

          (item.detailsList || []).forEach(d => {
            const tid = d?.Table_Id ?? 'unknown_table_' + (d?.Table_Name || Math.random());
            if (!tableMap[tid]) {
              tableMap[tid] = {
                Table_Id: tid,
                Table_Name: d?.Table_Name ?? d?.Table_Accronym ?? '',
                AliasName: d?.Table_Accronym ?? d?.Table_Name ?? '',
                columnsList: []
              };
            }

  
            tableMap[tid].columnsList.push({
              Column_Name: d?.Column_Name ?? '',
              Column_Data_Type: d?.Column_Data_Type ?? (typeof d?.Type === 'string' ? d.Type : (d?.Column_Data_Type || 'string')),
              IS_Default: d?.IS_Default ?? 0,
              IS_Join_Key: d?.IS_Join_Key ?? 0,
              Order_By: d?.Order_By ?? d?.OrderBy ?? '',
              Type: d?.Type ?? '',
              List_Type: d?.List_Type ?? null,
              List_Type_Display: d?.List_Type_Display ?? '—' 
            });
          });

          const tablesList = Object.values(tableMap);

          return {
            ...item,
            tablesList,
            CreatedAt: item?.Created_At ?? item?.CreatedAt ?? null,
            CreatedBy: item?.CreatedByGet ?? item?.CreatedBy ?? '',
            TotalTables: tablesList.length,
            TotalColumns: tablesList.reduce((s, t) => s + (t.columnsList?.length || 0), 0)
          };
        });

        setTemplates(mapped);
      }
    })
    .catch(e => console.error(e));
}, [reload]);


  const handleOpen = (row) => {
    setSelectedTemplate({
      Report_Type_Id: row?.Report_Type_Id ?? row?.Mob_Rpt_Id ?? row?.Mob_Rpt_Id,
      reportName: row?.Report_Name,
      tables: row?.tablesList || row?.tablesList || [],
      ReportState: row?.ReportState ?? ''
    });
    setFilters({});
    setOpenViewDialog(true);
  };

  const handleFilters = (row) => {
    setSelectedTemplate({
      Report_Type_Id: row?.Report_Type_Id ?? row?.Mob_Rpt_Id,
      reportName: row?.Report_Name,
      tables: row?.tablesList || [],
      ReportState: row?.ReportState ?? ''
    });
    setFilters({});
    setOpenPreFilterDialog(true);
  };

const handleEdit = async (row) => {
  const Mob_Rpt_Id = row?.Mob_Rpt_Id ?? row?.Report_Type_Id;

  try {
   
    const res = await fetchLink({
      address: `reports/templateMobile?Mob_Rpt_Id=${Mob_Rpt_Id}`,
      method: 'GET'
    });

    if (res?.success) {
      const { reportName, details } = res.data;
      
      const tablesMap = {};

      details.forEach(d => {
        const tableId = d.Table_Id;
        if (!tablesMap[tableId]) {
          tablesMap[tableId] = {
            Table_Id: tableId,
            Table_Name: d.Table_Name,
            AliasName: d.Table_Accronym || d.Table_Name,
            columns: []
          };
        }
        
        tablesMap[tableId].columns.push({
          Column_Name: d.Column_Name,
          Column_Data_Type: d.Column_Data_Type,
          IS_Default: d.IS_Default,
          IS_Join_Key: d.IS_Join_Key,
          Type: d.Type,
          List_Type: d.List_Type,
          // Add empty options array for dropdown columns
          options: d.List_Type === 1 || d.List_Type === '1' ? [] : undefined
        });
      });

      const tablesList = Object.values(tablesMap);

      // Now fetch dropdown values for columns that have List_Type = 1
      const dropdownPromises = [];

      tablesList.forEach(table => {
        table.columns.forEach(column => {
          if (column.List_Type === 1 || column.List_Type === '1') {
            // Fetch dropdown options for this column
            const dropdownPromise = fetchLink({
              address: `reports/mobileReportDropdowns?reportName=${encodeURIComponent(reportName)}`,
              method: 'GET'
            }).then(dropdownData => {
              if (dropdownData?.success) {
                // Find the dropdown data for this specific column
                const columnDropdown = dropdownData.data.find(item => 
                  item.columnName === column.Column_Name && 
                  item.tableName === table.Table_Name
                );
                
                if (columnDropdown && columnDropdown.options) {
                  column.options = columnDropdown.options;
                }
              }
              return column;
            }).catch(error => {
              console.error(`Error fetching dropdown for ${column.Column_Name}:`, error);
              return column;
            });

            dropdownPromises.push(dropdownPromise);
          }
        });
      });

      // Wait for all dropdown data to be fetched
      if (dropdownPromises.length > 0) {
        await Promise.all(dropdownPromises);
      }

      // Navigate to create page with all data including dropdown options
      nav('create', {
        state: {
          ReportState: {
            Report_Type_Id: Mob_Rpt_Id,
            reportName,
            tables: tablesList,
            createdBy: row?.CreatedBy ?? row?.CreatedByGet
          }
        }
      });
    } else {
      toast.error('Failed to load data');
    }
  } catch (err) {
    toast.error('Error fetching template');
    console.error(err);
  }
};



  const handleDelete = (row) => {
    setSelectedTemplate({
      Mob_Rpt_Id: row?.Mob_Rpt_Id ?? row?.Report_Type_Id,
      reportName: row?.Report_Name
    });
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    fetchLink({
      address: `reports/templateMobile`,
      method: 'DELETE',
      bodyData: { Mob_Rpt_Id: selectedTemplate.Mob_Rpt_Id }
    }).then(data => {
      if (data?.success) {
        toast.success(data.message);
        setReload(r => !r);
      } else {
        toast.error(data?.message || 'Failed to delete');
      }
    }).catch(e => console.error(e))
      .finally(() => setOpenDeleteDialog(false));
  };



  const handleFilterChange = (col, value) => {
    setFilters(prev => ({ ...prev, [col]: value }));
  };

  const filteredTemplates = !search ? templates : templates.filter(t => String(t?.Report_Name ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Card>
        <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
          <span className="text-primary text-uppercase ps-3">Mobile Report Templates</span>
          {isEqualNumber(contextObj?.Add_Rights, 1) && (
            <Button variant="outlined" onClick={() => nav('create')}>Add Template</Button>
          )}
        </div>

        <div className="d-flex justify-content-end p-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchIcon />
            <InputBase
              placeholder="Search Report Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <CardContent className="p-0">
          <FilterableTable
            dataArray={filteredTemplates}
            columns={[
              { Field_Name: 'Report_Name', ColumnHeader: 'Report Name', Fied_Data: 'string', isVisible: 1 },
            
              { ColumnHeader: 'Tables', isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.TotalTables ?? (row?.tablesList?.length ?? 0) },
              { ColumnHeader: 'Columns', isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.TotalColumns ?? row?.tablesList?.reduce((sum, item) => sum += Number(item?.columnsList?.length || 0), 0) },
           
              { Field_Name: 'CreatedBy', ColumnHeader: 'Created By', Fied_Data: 'string', isVisible: 1 },
      
              { ColumnHeader: 'CreatedAt', isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.CreatedAt ? UTCDateWithTime(row?.CreatedAt) : ' - ' },
              {
                ColumnHeader: 'Action', isVisible: 1, isCustomCell: true, Cell: ({ row }) => (
                  <Actions
                    row={row}
                    onOpen={handleOpen}
                    onFilters={handleFilters}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )
              }
            ]}
            EnableSerialNumber
            isExpendable
        expandableComp={({ row }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {['SNo', 'Table', 'Column', 'Type', 'List Type'].map(h => (
              <th key={h} className="border fa-14 text-center" style={{ backgroundColor: '#EDF0F7' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {row?.tablesList?.map((table, tableIdx) => (
            <React.Fragment key={tableIdx}>
              {table?.columnsList?.map((col, colIdx) => (
                <tr key={colIdx}>
                  {colIdx === 0 && (
                    <>
                      <td className="border fa-13 text-center vctr" rowSpan={table?.columnsList?.length}>
                        {tableIdx + 1}
                      </td>
                      <td className="border fa-13 text-center blue-text vctr" rowSpan={table?.columnsList?.length}>
                        {table?.AliasName || table?.Table_Name}
                      </td>
                    </>
                  )}
                  <td className={`border fa-13 vctr ${Boolean(Number(col?.IS_Default)) ? ' blue-text ' : ''} ${Boolean(Number(col?.IS_Join_Key)) ? ' fw-bold ' : ''}`}>
                    {col?.Column_Name}
                  </td>
                  <td className="border fa-13 vctr">{col?.Column_Data_Type ?? '-'}</td>
                  <td className="border fa-13 vctr">
                    {col?.List_Type_Display || 
                     (col?.List_Type === '1' ? 'Sum' : 
                      col?.List_Type === '2' ? 'Avg' : 
                      col?.List_Type === '1,2' ? 'Sum, Avg' : 
                      col?.List_Type === '2,1' ? 'Avg, Sum' : 
                      '—')}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}}
            tableMaxHeight={650}
          />
        </CardContent>
      </Card>

  
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} fullScreen>
        <DialogTitle className="d-flex justify-content-between align-items-center">
          <span>Report - <span className="blue-text">{selectedTemplate.reportName}</span></span>
          <span>
            <IconButton onClick={() => setOpenViewDialog(false)} color="error"><Close /></IconButton>
          </span>
        </DialogTitle>

        <DialogContent>
          {(selectedTemplate?.Report_Type_Id && storage?.Company_id) && (
            <DynamicMuiTable
              reportId={selectedTemplate.Report_Type_Id}
              company={storage?.Company_id}
              queryFilters={filters}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Back</Button>
        </DialogActions>
      </Dialog>

 
      <Dialog open={openPreFilterDialog} onClose={() => setOpenPreFilterDialog(false)} fullWidth maxWidth="md">
        <DialogTitle className="d-flex justify-content-between">
          <span>Filters For <span className="blue-text">{selectedTemplate.reportName}</span></span>
          <span><IconButton onClick={() => setOpenPreFilterDialog(false)} color="error"><Close /></IconButton></span>
        </DialogTitle>

        <DialogContent>
          <div className="row">
            {selectedTemplate?.tables?.map((table, ti) => (
              <div key={ti} className="col-12 mb-3">
                <Typography fontWeight={700}>{table?.AliasName}</Typography>
                <div className="row">
                  {(table?.columns || table?.columnsList || []).map((col, ci) => {
                    const colObj = col?.Column_Name ? col : (col?.Column_Name ? col : col);
                 
                    const dataType = (col?.Column_Data_Type || col?.ColumnType || 'string').toString().toLowerCase();

                    const isDefault = Boolean(Number(col?.IS_Default || col?.ISDEFAULT || 0));
                    const isJoinKey = Boolean(Number(col?.IS_Join_Key || col?.IS_JOIN_KEY || 0));

                    if (isDefault || isJoinKey) return null;

                    return (
                      <div key={ci} className="col-md-6 p-2">
                        <label className="mb-2 fw-bold text-muted">{col?.Column_Name}</label>

                        {dataType === 'number' && (
                          <div className="d-flex gap-2">
                            <input type="number" placeholder="Min" className="cus-inpt me-1" value={filters[col.Column_Name]?.min ?? ''} onChange={e => handleFilterChange(col.Column_Name, { ...filters[col.Column_Name], min: e.target.value ? Number(e.target.value) : undefined })} />
                            <input type="number" placeholder="Max" className="cus-inpt ms-1" value={filters[col.Column_Name]?.max ?? ''} onChange={e => handleFilterChange(col.Column_Name, { ...filters[col.Column_Name], max: e.target.value ? Number(e.target.value) : undefined })} />
                          </div>
                        )}

                        {dataType === 'date' && (
                          <div className="d-flex gap-2">
                            <input type="date" className="cus-inpt me-1" value={filters[col.Column_Name]?.start ?? ''} onChange={e => handleFilterChange(col.Column_Name, { ...filters[col.Column_Name], start: e.target.value || undefined })} />
                            <input type="date" className="cus-inpt ms-1" value={filters[col.Column_Name]?.end ?? ''} onChange={e => handleFilterChange(col.Column_Name, { ...filters[col.Column_Name], end: e.target.value || undefined })} />
                          </div>
                        )}

                        {dataType !== 'date' && dataType !== 'number' && (
                          <input type="text" placeholder="Search..." className="cus-inpt" value={filters[col.Column_Name]?.value ?? ''} onChange={e => handleFilterChange(col.Column_Name, { ...filters[col.Column_Name], value: String(e.target.value).toLowerCase() || '' })} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => { setFilters({}); setOpenPreFilterDialog(false); }}>Cancel</Button>
          <Button variant="contained" startIcon={<Launch />} onClick={() => { setOpenViewDialog(true); setOpenPreFilterDialog(false); }}>Open report</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          Do you want to delete the Template <span className="blue-text">{selectedTemplate.reportName}</span> permanently?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} startIcon={<Delete />} variant="outlined" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportTemplatesMobile;
