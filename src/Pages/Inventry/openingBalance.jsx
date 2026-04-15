import React, { useState, useRef } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import UploadIcon from '@mui/icons-material/Upload';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import Spinner from '@mui/material/CircularProgress';
import * as XLSX from 'xlsx';
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';

const OpeningBalance = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const fileInputRef = useRef(null);

  // Convert Excel serial number to date string (YYYY-MM-DD)
  const excelSerialDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // FIXED: Aggressive date parsing for Excel .xls issues
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    // Handle JS Date objects
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Handle Excel serial number (wider range)
    if (typeof dateValue === 'number' && dateValue > 30000) {
      return excelSerialDateToJSDate(dateValue);
    }
    
    // Handle string dates with Excel formats
    if (typeof dateValue === 'string') {
      const str = dateValue.trim();
      if (!str || str.toLowerCase().includes('day') || str === '#N/A' || str === '#VALUE!') {
        return null;
      }
      
      // Try direct parsing first
      let parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      // Excel DD/MM/YYYY or DD-MM-YYYY -> YYYY-MM-DD
      const dateMatch = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
      if (dateMatch) {
        let [_, day, month, year] = dateMatch;
        year = year.length === 2 ? `20${year}` : year;
        parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(parsed.getTime())) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
     
      parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  };


  const mapColumnNames = (row) => {
    const mappedRow = {};
    
    const columnMappings = {
      ledger_name: ['ledger_name', 'ledgername', 'ledger name', 'ledger', 'account_name', 'accountname', 'account name'],
      bill_no: ['bill_no', 'billno', 'bill number', 'bill_number', 'invoice_no', 'invoiceno', 'invoice number', 'inv_no'],
      bill_date: ['bill_date', 'billdate', 'bill date', 'invoice_date', 'invoicedate', 'invoice date', 'date'],
      due_date: ['due_date', 'duedate', 'due date', 'payment_date', 'paymentdate', 'payment date'],
      amount: ['amount', 'total', 'total_amount', 'totalamount', 'invoice_amount'],
      dr_amount: ['dr_amount', 'dramount', 'dr amount', 'debit_amount', 'debitamount', 'debit'],
      cr_amount: ['cr_amount', 'cramount', 'cr amount', 'credit_amount', 'creditamount', 'credit']
    };
    
    for (const [targetField, possibleNames] of Object.entries(columnMappings)) {
      for (const possibleName of possibleNames) {
        if (row[possibleName] !== undefined) {
          mappedRow[targetField] = row[possibleName];
          break;
        }
      }
      if (mappedRow[targetField] === undefined && row[targetField] !== undefined) {
        mappedRow[targetField] = row[targetField];
      }
    }
    
    return mappedRow;
  };

  const validateRow = (row, index) => {
    const errors = [];
    
    if (!row.ledger_name?.trim()) {
      errors.push(`Row ${index + 1}: Missing ledger name`);
    }
 
    
    const billDate = parseDate(row.bill_date);
    if (!billDate || !isValidDate(billDate)) {
      errors.push(`Row ${index + 1}: Invalid bill date`);
    }
    
   
    const dueDate = parseDate(row.due_date);
    if (dueDate && !isValidDate(dueDate)) {
      errors.push(`Row ${index + 1}: Invalid due date`);
    }
    
    if (isNaN(parseFloat(row.amount || 0))) {
      errors.push(`Row ${index + 1}: Invalid amount`);
    }
    if (isNaN(parseFloat(row.dr_amount || 0))) {
      errors.push(`Row ${index + 1}: Invalid dr_amount`);
    }
    if (isNaN(parseFloat(row.cr_amount || 0))) {
      errors.push(`Row ${index + 1}: Invalid cr_amount`);
    }
    
    return errors;
  };

  const downloadTemplate = () => {
    const template = [
      { ledger_name: 'Example Ledger', bill_date: '2024-01-01', bill_no: 'INV-001', due_date: '2024-01-31', amount: 1000, dr_amount: 1000, cr_amount: 0 },
      { ledger_name: 'Another Ledger', bill_date: '2024-01-15', bill_no: 'INV-002', due_date: '2024-02-15', amount: 500, dr_amount: 0, cr_amount: 500 }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Opening Balance Template');
    ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.writeFile(wb, 'opening_balance_template.xlsx');
    toast.success('Template downloaded!');
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { 
            type: 'array', 
            cellDates: true,
            dateNF: 'yyyy-mm-dd',
            raw: false 
          });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          let jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });
          

          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }
          
          jsonData = jsonData.map(row => mapColumnNames(row));
          
      
          jsonData = jsonData.map(row => ({
            ...row,
            bill_date: parseDate(row.bill_date),
            due_date: parseDate(row.due_date)
          }));
          
         
          const validData = [];
          const filteredRows = [];
          let debugCount = 0;
          
          jsonData.forEach((row, idx) => {
            const hasValidBillDate = row.bill_date !== null && row.bill_date !== undefined && isValidDate(row.bill_date);
            
   
            if (idx < 10 && debugCount < 10) {
            
              debugCount++;
            }
            
            if (hasValidBillDate) {
              validData.push(row);
            } else {
              filteredRows.push(row);
            }
          });
          
        const validationErrors = [];
          validData.forEach((row, index) => {
            const errors = validateRow(row, index);
            validationErrors.push(...errors);
          });
          
          if (validationErrors.length > 0) {
            const errorMessage = validationErrors.slice(0, 10).join('\n');
            const moreErrors = validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more` : '';
            reject(new Error(errorMessage + moreErrors));
          } else {
            resolve(validData);
          }
        } catch (err) {
          console.error('Parse error:', err);
          reject(new Error('Failed to parse Excel: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Rest of component unchanged...
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFileName(file.name);
    setLoading(true);
    setError('');
    
    try {
      const data = await parseExcelFile(file);
      setExcelData(data);
      toast.success(`✅ Loaded ${data.length} valid records!`);
      setError('');
    } catch (err) {
      console.error('File parsing error:', err);
      setError(err.message);
      setExcelData([]);
      setFileName('');
      toast.error('Failed to parse file.');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = () => {
    setDialogOpen(true);
    setError(''); setSuccess(''); setExcelData([]); setFileName(''); setSelectedDate('');
  };
  
  const closeDialog = () => {
    setDialogOpen(false); setSelectedDate(''); setExcelData([]); setFileName(''); 
    setError(''); setSuccess(''); setPreviewOpen(false);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setError('');
  };

const handleSubmit = async () => {
  if (!selectedDate) { 
    setError('Please select an opening date'); 
    return; 
  }
  if (excelData.length === 0) { 
    setError('Please upload valid data'); 
    return; 
  }
  
  setLoading(true); 
  setError(''); 
  setSuccess('');

  try {
    const payload = {
      ob_date: selectedDate,  
      ledger_data: excelData.map(row => ({  
        ledger_name: String(row.ledger_name ?? '').trim() || '',
        bill_no: String(row.bill_no ?? '').trim() || '',
        bill_date: row.bill_date || null,
        due_date: row.due_date || null,
        amount: parseFloat(row.amount) || 0,
        dr_amount: parseFloat(row.dr_amount) || 0,
        cr_amount: parseFloat(row.cr_amount) || 0,
        bill_company: String(row.bill_company ?? '') || null  
      }))
    };
    



    const response = await fetchLink({
      address: `inventory/uploadLedgerOpening`, 
      method: 'POST',
      bodyData: payload,  
    });


    if (response.statusCode === 200 || response.success) {
      setSuccess(`✅ Uploaded ${excelData.length} records!`);
      toast.success(`${excelData.length} records uploaded!`);
      setTimeout(closeDialog, 2000);
    } else {
      throw new Error(response.message || 'Upload failed');
    }
  } catch (err) {
    console.error('Upload Error:', err);
    setError(err.message || 'Upload failed');
    toast.error('Upload failed: ' + (err.message || err));
  } finally {
    setLoading(false);
  }
};
  const handlePreview = () => {
    if (excelData.length === 0) { setError('No data'); return; }
    setPreviewOpen(true);
  };

  const hasDate = Boolean(selectedDate);
  const hasFile = excelData.length > 0;
  const isSubmitEnabled = hasDate && hasFile && !loading;

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card">
            <div className="card-header bg-white fw-bold border-0">
              <span className="h4 mb-0">OPENING BALANCE UPLOAD</span>
            </div>
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <UploadIcon className="display-3 text-primary mb-3" style={{ fontSize: '48px' }} />
              </div>
              <h3 className="fw-bold text-dark mb-3">Ledger Opening Balance</h3>
              <p className="text-muted mb-4">Upload opening balance data from Excel</p>
              
              <button className="btn btn-primary btn-lg px-5 py-3 fw-bold" onClick={openDialog}>
                <UploadIcon className="me-2" /> UPLOAD LEDGER DATA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog and Preview modals - UNCHANGED from original */}
      {dialogOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDialog}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><UploadIcon className="me-2" /> Ledger Opening Balance Upload</h5>
                <button className="btn-close btn-close-white" onClick={closeDialog} />
              </div>
              <div className="modal-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3">
                    <ErrorIcon className="me-2" />
                    <div className="flex-grow-1" style={{ whiteSpace: 'pre-line' }}>{error}</div>
                  </div>
                )}
                {success && (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <CheckCircleIcon className="me-2" /> {success}
                  </div>
                )}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Opening Date *</label>
                    <input type="date" className="form-control" value={selectedDate} onChange={handleDateChange} max={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-bold">Excel File *</label>
                    <div className={`border border-dashed p-4 text-center rounded ${!loading ? 'cursor-pointer hover:bg-light' : 'opacity-50'}`} 
                         onClick={() => !loading && fileInputRef.current?.click()} 
                         style={{ borderColor: '#0d6efd', cursor: !loading ? 'pointer' : 'not-allowed' }}>
                      {loading ? (
                        <>
                          <Spinner size={24} className="me-2 text-primary" />
                          <span>Processing...</span>
                        </>
                      ) : fileName ? (
                        <div className="text-success fw-bold">
                          <CheckCircleIcon className="me-2" />
                          {fileName}<br/>
                          <small className="text-muted">({excelData.length} valid records)</small>
                          {excelData.length > 0 && (
                            <button className="btn btn-sm btn-info mt-2 ms-2" onClick={(e) => { e.stopPropagation(); handlePreview(); }}>
                              <VisibilityIcon className="me-1" style={{ fontSize: '16px' }} /> Preview
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <UploadIcon className="display-4 text-primary mb-2 d-block" style={{ fontSize: '36px', margin: '0 auto' }} />
                          <h6 className="fw-bold text-primary mb-1">Click to upload Excel</h6>
                          <small className="text-muted">(.xlsx/.xls, max 5MB)</small>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="d-none" onChange={handleFileUpload} disabled={loading} />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <button className="btn btn-outline-secondary" onClick={downloadTemplate} disabled={loading}>
                    📥 Download Template
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-between">
                <button className="btn btn-secondary" onClick={closeDialog} disabled={loading}>Cancel</button>
                <button className="btn btn-primary px-4" onClick={handleSubmit} disabled={!isSubmitEnabled || loading}>
                  {loading ? (
                    <>
                      <Spinner size={20} className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="me-2" />
                      Upload & Save ({excelData.length} records)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title"><VisibilityIcon className="me-2" /> Data Preview ({excelData.length} records)</h5>
                <button className="btn-close btn-close-white" onClick={() => setPreviewOpen(false)} />
              </div>
              <div className="modal-body p-0">
                <div className="table-responsive" style={{ maxHeight: '500px' }}>
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>#</th><th>Ledger Name</th><th>Bill No</th><th>Bill Date</th><th>Due Date</th>
                        <th>Amount</th><th>DR Amount</th><th>CR Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.slice(0, 100).map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{row.ledger_name || 'N/A'}</td>
                          <td>{row.bill_no || 'N/A'}</td>
                          <td>{row.bill_date || 'N/A'}</td>
                          <td>{row.due_date || 'N/A'}</td>
                          <td>{(parseFloat(row.amount) || 0).toFixed(2)}</td>
                          <td>{(parseFloat(row.dr_amount) || 0).toFixed(2)}</td>
                          <td>{(parseFloat(row.cr_amount) || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelData.length > 100 && (
                    <div className="alert alert-info m-3">Showing first 100 of {excelData.length}</div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setPreviewOpen(false)}>
                  <CloseIcon className="me-2" /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningBalance;