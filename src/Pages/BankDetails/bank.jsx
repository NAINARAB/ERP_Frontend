import React, { useState, useEffect } from "react";
import { Card, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import { Edit, Delete } from "@mui/icons-material";
import FilterableTable, { createCol } from '../../Components/filterableTable2';
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { customSelectStyles } from "../../Components/tablecolumn";
import FilterDialog from "../../Components/tableComp/FilterDialog";
const Bank = ({ loadingOn, loadingOff }) => {
  const today = new Date().toISOString().split('T')[0];

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fromDate: today, toDate: today, FilterDialog: false });
  const [accountNo, setAccountNo] = useState('002700150950519');

  const fetchBankStatement = async () => {
    try {
      setLoading(true);
      if (loadingOn) loadingOn();

      const response = await fetchLink({
        address: `payment/getBankStatement?FromDate=${filters.fromDate}&ToDate=${filters.toDate}`
      });

      if (response.success) {
        setTransactions(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch bank statement');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching bank statement');
    } finally {
      // setLoading(false);
          setFilters(prev => ({ ...prev, FilterDialog: false }));
      if (loadingOff) loadingOff();
    }
  };


  const syncStatement = async () => {
    try {
      if (loadingOn) loadingOn();
      const payload = {
        accountNo,
        startDate: filters.fromDate.split('-').reverse().join('-'), 
        endDate: filters.toDate.split('-').reverse().join('-')
      };

      const response = await fetchLink({
        address: 'payment/syncStatement',
        method: 'POST',
        bodyData: payload,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success) {
        toast.success(response.message || 'Sync successful');
        fetchBankStatement();
        setFilters(prev => ({ ...prev, FilterDialog: false }));
      } else {
        toast.error(response.message || 'Sync failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error during sync');
    } finally {
      if (loadingOff){
loadingOff();
    setFilters(prev => ({ ...prev, FilterDialog: false }));
      } 
    }
  };

  useEffect(() => {
    fetchBankStatement();
  }, []);


  const formatAmount = (amount) => !amount ? '-' : amount.replace('Rs.', '₹').replace('DR', ' (Debit)').replace('CR', ' (Credit)');
  const formatBalance = (balance) => !balance ? '-' : balance.replace('Rs.', '₹').replace('DR', ' (Dr)').replace('CR', ' (Cr)');


  const editRow = (row) => {
    toast.info(`Edit row with Ref: ${row.Refno}`);
  };

  return (
    <>
      <Card component={Paper} sx={{ p: 2 }}>
        <FilterableTable
          dataArray={transactions}
          EnableSerialNumber={true}
          tableMaxHeight={650}
          maxHeightOption
          loading={loading}
          noDataText="No transactions found for selected date range."
          columns={[
            createCol("TranDate", "string", "Date"),
            createCol("TranParticulars", "string", "Particulars"),
            createCol("ChequeNum", "string", "Cheque No", { render: row => row.ChequeNum || '-' }),
            createCol("TranType", "string", "Type", { render: row => row.TranType === 'C' ? 'Credit' : 'Debit' }),
            createCol("Amount", "string", "Amount", { render: row => formatAmount(row.Amount), align: 'right' }),
            createCol("AcctBal", "string", "Balance", { render: row => formatBalance(row.AcctBal), align: 'right' }),
            createCol("Refno", "string", "Reference", { render: row => row.Refno || '-' }),
            {
              ColumnHeader: "Actions",
              isVisible: 1,
              isCustomCell: true,
              Cell: ({ row }) => (
                <td style={{ minWidth: "80px" }}>
                  <IconButton onClick={() => editRow(row)} size="small">
                    <Edit />
                  </IconButton>
                </td>
              ),
            },
          ]}
          ButtonArea={
            <IconButton size="small" onClick={() => setFilters(prev => ({ ...prev, FilterDialog: true }))}>
              <FilterAlt />
            </IconButton>
          }
        />
      </Card>


      <Dialog
        open={filters.FilterDialog}
        onClose={() => setFilters(prev => ({ ...prev, FilterDialog: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Filter & Sync Bank Statement</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="From Date"
            type="date"
            value={filters.fromDate}
            onChange={e => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
               styles={customSelectStyles}
          />
          <TextField
            label="To Date"
            type="date"
            value={filters.toDate}
            onChange={e => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
               styles={customSelectStyles}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilters(prev => ({ ...prev, FilterDialog: false }))}>Cancel</Button>
          <Button variant="contained" onClick={fetchBankStatement}>Search</Button>
          <Button variant="contained" color="secondary" onClick={syncStatement}>Sync</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Bank;
