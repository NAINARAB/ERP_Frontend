import React, { useState, useEffect } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Box, Typography, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import FilterableTable, { createCol } from '../../Components/filterableTable2';
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { fetchLink } from "../../Components/fetchComponent";
import {
  Addition, getSessionFiltersByPageId, ISOString, NumberFormat, setSessionFilters,
  toArray, toNumber
} from "../../Components/functions";
import {
  ClearAll, FilterAlt, Search, ExpandMore, Edit, Clear
} from "@mui/icons-material";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from "react-toastify";



const StockDetailsExpandable = ({ row }) => {
    return (
        <Box sx={{ padding: 2, backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#333', fontSize: '1.1rem', mb: 2 }}>
                Trip Details - {row.Trip_No}
            </Typography>
            
            {row.TripDetails && row.TripDetails.length > 0 ? (
                <Box sx={{ width: '100%' }}>
                    {row.TripDetails.map((tripDetail, tripIndex) => (
                        <Accordion key={tripDetail.TripDetailId || tripIndex} defaultExpanded={tripIndex === 0}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Invoice: {tripDetail.Do_Inv_No} | 
                                    Date: {tripDetail.Do_Date} | 
                                    Value: {NumberFormat(tripDetail.Total_Invoice_value)} | 
                                    Retailer: {tripDetail.Retailer_Name}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {/* Stock Details for this TripDetail */}
                                {tripDetail.StockDetails && tripDetail.StockDetails.length > 0 ? (
                                    <Box sx={{ overflowX: 'auto', mt: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            Stock Items ({tripDetail.StockDetails.length})
                                        </Typography>
                                        <table className="table" style={{ width: '100%', minWidth: '500px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#e3f2fd' }}>
                                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>S.No</th>
                                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Product Name</th>
                                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Amount</th>
                                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Item ID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tripDetail.StockDetails.map((stock, stockIndex) => (
                                                    <tr key={stock.Item_Id || stockIndex} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stockIndex + 1}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                                            {stock.Product_Name || 'N/A'}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                                                            {NumberFormat(stock.Amount) || '0.00'}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                            {stock.Item_Id || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Total row for this TripDetail */}
                                                <tr style={{ backgroundColor: '#e8f5e8' }}>
                                                    <td colSpan={2} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                                                        Total for {tripDetail.Do_Inv_No}:
                                                    </td>
                                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                                                        {NumberFormat(tripDetail.StockDetails.reduce((sum, item) => sum + (item.Amount || 0), 0))}
                                                    </td>
                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                                        No stock details available for this invoice.
                                    </Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    
                    {/* Grand Total for all TripDetails */}
                    {row.TripDetails.length > 0 && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#856404' }}>
                                Grand Total for Trip {row.Trip_No}: {NumberFormat(
                                    row.TripDetails.reduce((total, tripDetail) => 
                                        total + (tripDetail.StockDetails?.reduce((sum, item) => sum + (item.Amount || 0), 0) || 0), 0)
                                )}
                            </Typography>
                        </Box>
                    )}
                </Box>
            ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    No trip details available for this trip.
                </Typography>
            )}
        </Box>
    );
};

const LrReport = ({ loadingOn, loadingOff, AddRights, pageID }) => {
  const [tripData, setTripData] = useState({ rows: [], allEmpCategories: [] });
  const [filters, setFilters] = useState({
    Fromdate: ISOString(),
    Todate: ISOString(),
    voucherType_Filter: { label: 'ALL', value: '' },
    created_by_Filter: { label: 'ALL', value: '' },
    filterDialog: false
  });
  const [filterDropDown, setFilterDropDown] = useState({ voucherType: [], created_by: [] });
  const [editDialog, setEditDialog] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editPairs, setEditPairs] = useState([]);
  const [costCenterOptions, setCostCenterOptions] = useState([]);
  const [costCategoryOptions, setCostCategoryOptions] = useState([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const navigate = useNavigate();
const [reload, setReload] = useState(false);
  useEffect(() => {

    Promise.all([
      fetchLink({ address: `dataEntry/costCenter` }),
      fetchLink({ address: `dataEntry/costCenter/category` })
    ]).then(([ccRes, catRes]) => {
      setCostCenterOptions(
        (ccRes?.data || []).map(cc => ({
          id: cc.Cost_Center_Id,
          value: cc.Cost_Center_Name,
          label: cc.Cost_Center_Name
        }))
      );

      setCostCategoryOptions(
        (catRes?.data || []).map(cat => ({
          id: cat.Cost_Category_Id,
          value: cat.Cost_Category,
          label: cat.Cost_Category
        }))
      );
      
      setOptionsLoaded(true);
    }).catch(error => {
      console.error('Error loading options:', error);
      setOptionsLoaded(true); // Still set loaded to true even if there's an error
    });
  }, []);

  const addNewPair = () => {
    setEditPairs(prev => [
      ...prev,
      { 
        Involved_Emp_Id: '', 
        Cost_Center_Name: '', 
        Cost_Center_Type_Id: '', 
        Cost_Category: '',
        Cost_Center_Id: '',
        Cost_Category_Id: ''
      }
    ]);
  };

  const removePair = (index) => {
    setEditPairs(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const sessionFilterValues = getSessionFiltersByPageId(pageID);
    if (sessionFilterValues) setFilters(prev => ({ ...prev, ...sessionFilterValues }));
  }, [pageID]);

  const transformTripData = (data) => {
    const allEmpCategories = new Set();
    data.forEach(trip => {
      trip.Employees?.forEach(emp => allEmpCategories.add(emp.Cost_Category || 'Unknown'));
    });
    const empCategoriesArray = [...allEmpCategories];

    const rows = data.map(trip => {
      const empByCategory = {};
      empCategoriesArray.forEach(cat => empByCategory[cat] = []);
      trip.Employees?.forEach(emp => {
        const cat = emp.Cost_Category || 'Unknown';
        empByCategory[cat].push(emp.Cost_Center_Name);
      });
      const categoryColumns = {};
      empCategoriesArray.forEach(cat => categoryColumns[cat] = empByCategory[cat]?.join(', ') || '');
      const detail = trip.TripDetails?.[0] || {};
      return {
        ...trip,
        Delivery_Id: detail.Delivery_Id || null,
        Do_Inv_No: detail.Do_Inv_No || null,
        Do_Date: detail.Do_Date || null,
        Total_Invoice_value: detail.Total_Invoice_value || null,
        Retailer_Name: detail.Retailer_Name || trip.Retailer_Name || '',
        ...categoryColumns
      };
    });

    return { rows, allEmpCategories: empCategoriesArray };
  };

useEffect(() => {
  const { Fromdate, Todate, voucherType_Filter, created_by_Filter } = filters;

  fetchLink({
    address: `sales/lrReport?Fromdate=${Fromdate}&Todate=${Todate}&voucher=${voucherType_Filter.value}&createdBy=${created_by_Filter.value}`,
    loadingOff, 
    loadingOn
  }).then(res => {
    if (res.success) {
      const { rows, allEmpCategories } = transformTripData(res.data);
      setTripData({ rows, allEmpCategories });
    }
  }).catch(console.error);

}, [filters, reload]); 

  const closeDialog = () => setFilters(prev => ({ ...prev, filterDialog: false }));

  const handleEdit = (row) => {
    if (!optionsLoaded) {
      console.warn('Options not loaded yet');
      return;
    }

    setEditRow(row);
    
    const normalized = (row.Employees || []).map(emp => {

      const matchingCategory = costCategoryOptions.find(opt => 
        opt.value === emp.Cost_Category || opt.label === emp.Cost_Category
      );
      
      
      const matchingCenter = costCenterOptions.find(opt => 
        opt.value === emp.Cost_Center_Name || opt.label === emp.Cost_Center_Name
      );

      return {
        Involved_Emp_Id: emp.Involved_Emp_Id || '',
        Cost_Center_Name: emp.Cost_Center_Name || '',
        Cost_Center_Type_Id: emp.Cost_Center_Type_Id || '',
        Cost_Category: emp.Cost_Category || '',
        Cost_Center_Id: matchingCenter ? matchingCenter.id : '',
        Cost_Category_Id: matchingCategory ? matchingCategory.id : ''
      };
    });
    
    setEditPairs(normalized);
    setEditDialog(true);
  };

  const processedTrips = (tripData.rows || []).map(trip => ({
    ...trip,
    Total_Invoice_value: (trip.TripDetails || []).reduce((sum, d) => sum + (d.Total_Invoice_value || 0), 0)
  }));

  const totalAmount = processedTrips.reduce((sum, trip) => sum + (trip.Total_Invoice_value || 0), 0);

const saveEditedData = async () => {
  if (!editRow) return;

  try {
    const payload = {
      tripId: editRow.Trip_Id,
      employeeCostCenters: editPairs.map(pair => ({
        Involved_Emp_Id: pair.Involved_Emp_Id,
        Cost_Center_Type_Id: pair.Cost_Center_Type_Id || pair.Cost_Category_Id,
      })),
    };

    const response = await fetchLink({ 
      address: 'sales/lrReport',
      method: 'POST', 
      bodyData: payload 
    });

    if (response.success) {
      toast.success(response.message || 'Cost centers updated successfully');
      setEditDialog(false);

   
      setReload(true);
    } else {
      toast.error(response.message || 'Failed to update cost centers');
    }
  } catch (error) {
    console.error("Error saving cost centers:", error);
    toast.error('Error saving cost centers');
  }
};


useEffect(() => {
  if (reload) {
    const fetchData = async () => {
      try {
        const res = await fetchLink({ address: 'sales/lrReport' });
        if (res.success) {
        
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
     
        setReload(false);
      }
    };

    fetchData();
  }
}, [reload]);

  return (
    <>
      <FilterableTable
        title="Trips"
        headerFontSizePx={12}
        bodyFontSizePx={12}
        dataArray={processedTrips || []}
        columns={[
          createCol('Trip_No', 'string', 'Trip No'),
          createCol('TR_INV_ID', 'string', 'TR_INV_ID'),
          createCol('Trip_Date', 'date', 'TripDate'),
          createCol('StartTime', 'time', 'StartTime'),
          createCol('EndTime', 'time', 'EndTime'),
          createCol('Vehicle_No', 'string', 'Veh.No'),
          createCol('Do_Date', 'date', 'Deliv.Date'),
          createCol('Total_Invoice_value', 'number', 'Tot.Inv'),
          ...(tripData.allEmpCategories?.map(cat => createCol(cat, 'string', cat)) || []),
          {
            isVisible: 1,
            ColumnHeader: 'Action',
            isCustomCell: true,
            Cell: ({ row }) => (
              <IconButton size="small" onClick={() => handleEdit(row)}>
                <Edit />
              </IconButton>
            )
          }
        ]}
        isExpendable
        expandableComp={StockDetailsExpandable}
        EnableSerialNumber
        ButtonArea={
          <>
            <IconButton onClick={() => setFilters(prev => ({ ...prev, filterDialog: true }))} size="small" className="mx-1">
              <FilterAlt className="fa-20" />
            </IconButton>
            <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
              {toNumber(totalAmount) > 0 && (
                <h6 className="m-0 text-end text-muted px-3">
                  Total: {NumberFormat(totalAmount)}
                </h6>
              )}
            </span>
          </>
        }
      />

      {/* Filter Dialog */}
      <Dialog open={filters.filterDialog} onClose={closeDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <table className="table">
            <tbody>
              <tr>
                <td>From</td>
                <td><input type="date" value={filters.Fromdate} onChange={e => setFilters({ ...filters, Fromdate: e.target.value })} className="cus-inpt" /></td>
              </tr>
              <tr>
                <td>To</td>
                <td><input type="date" value={filters.Todate} onChange={e => setFilters({ ...filters, Todate: e.target.value })} className="cus-inpt" /></td>
              </tr>
              <tr>
                <td>Created By</td>
                <td>
                  <Select
                    value={filters.created_by_Filter}
                    onChange={e => setFilters({ ...filters, created_by_Filter: e })}
                    options={[{ value: '', label: 'ALL' }, ...filterDropDown.created_by]}
                    styles={customSelectStyles}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setFilters({ Fromdate: ISOString(), Todate: ISOString(), voucherType_Filter: { label: 'ALL', value: '' }, created_by_Filter: { label: 'ALL', value: '' }, filterDialog: false })}
            startIcon={<ClearAll />}
          >
            Clear
          </Button>
          <Button onClick={closeDialog}>Close</Button>
          <Button
            onClick={() => { setSessionFilters({ Fromdate: filters.Fromdate, Todate: filters.Todate, pageID, voucherType_Filter: filters.voucherType_Filter, created_by_Filter: filters.created_by_Filter }); closeDialog(); }}
            variant="contained"
            startIcon={<Search />}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Cost Center Details</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1">Trip No: {editRow?.Trip_No}</Typography>
            {editPairs.length === 0 && <Typography>No Cost Center info available. Please add.</Typography>}
            {editPairs.map((emp, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1, position: 'relative' }}>
                <Typography fontWeight="bold" mb={1}>Employee #{idx + 1}</Typography>
                <IconButton size="small" onClick={() => removePair(idx)} sx={{ position: 'absolute', top: 8, right: 8 }}><Clear /></IconButton>

                <Typography variant="body2" mb={0.5}>Cost Category</Typography>
                <Select
                  value={costCategoryOptions.find(opt => opt.id === emp.Cost_Category_Id) || null}
                  onChange={option => {
                    const updated = [...editPairs];
                    if (option) {
                      updated[idx].Cost_Category = option.value;
                      updated[idx].Cost_Category_Id = option.id;
                    } else {
                      updated[idx].Cost_Category = '';
                      updated[idx].Cost_Category_Id = '';
                    }
                    setEditPairs(updated);
                  }}
                  options={costCategoryOptions}
                  styles={customSelectStyles}
                  placeholder="Select Category"
                  isClearable
                />

                <Typography variant="body2" mt={2} mb={0.5}>Cost Center Name</Typography>
                <Select
                  value={costCenterOptions.find(opt => opt.id === emp.Cost_Center_Id) || null}
                  onChange={option => {
                    const updated = [...editPairs];
                    if (option) {
                      updated[idx].Cost_Center_Name = option.value;
                      updated[idx].Cost_Center_Id = option.id;
                      updated[idx].Cost_Center_Type_Id = option.id;
                      updated[idx].Involved_Emp_Id = option.id;
                    } else {
                      updated[idx].Cost_Center_Name = '';
                      updated[idx].Cost_Center_Id = '';
                      updated[idx].Cost_Center_Type_Id = '';
                      updated[idx].Involved_Emp_Id = '';
                    }
                    setEditPairs(updated);
                  }}
                  options={costCenterOptions}
                  styles={customSelectStyles}
                  placeholder="Select Center"
                  isClearable
                />
              </Box>
            ))}
            <Button variant="outlined" onClick={addNewPair} sx={{ mt: 2 }}>Add New Cost Center</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEditedData}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LrReport;