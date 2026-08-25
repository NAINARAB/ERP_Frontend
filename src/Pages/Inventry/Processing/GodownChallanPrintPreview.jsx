import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import { LocalDate, NumberFormat, toArray } from '../../../Components/functions';
import { useReactToPrint } from 'react-to-print';


export const GodownChallanPrintTemplate = ({ entryDetails, download, actionOpen, clearDetails, children }) => {

    const [pageSize, setPageSize] = useState('A5');
    const [open, setOpen] = useState(false);
    const printRef = useRef(null);

    const a4Styles = {
        width: '200mm',
        minHeight: '290mm',
        padding: '10mm',
        backgroundColor: '#fff',
        fontSize: '9px',
        boxSizing: 'border-box',
        boxShadow: '0 0 5mm rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.2,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        margin: '0 auto',
    };

    const a5Styles = {
        width: '200mm',
        minHeight: '146mm',
        padding: '8mm',
        backgroundColor: '#fff',
        fontSize: '7px',
        boxSizing: 'border-box',
        boxShadow: '0 0 5mm rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.1,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        margin: '0 auto',
    };

    useEffect(() => {
        if (actionOpen) {
            setOpen(true);
        }
    }, [actionOpen]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        if (clearDetails) {
            clearDetails();
        }
    };

    const handleToggle = () => {
        setPageSize((prev) => (prev === 'A5' ? 'A4' : 'A5'));
    };

    const getInlineStyles = () => (pageSize === 'A4' ? a4Styles : a5Styles);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        pageStyle: `
    @page {
      size: ${pageSize === 'A4' ? 'A4' : 'A5'};
      margin-top: 10px;
      margin-right: 0;
      margin-bottom: 0;
      margin-left: 0;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
        margin-top: 10px;
      }

      .MuiDialog-root,
      .MuiDialog-container,
      .MuiPaper-root,
      .MuiDialogTitle-root {
        display: none !important;
      }

      .print-content {
        padding-top: 0;
        margin-top: 10px;
      }
    }
  `
    });

    const source = toArray(entryDetails?.SourceDetails);
    const destination = toArray(entryDetails?.DestinationDetails);
    const staffs = toArray(entryDetails?.StaffsDetails);

    const totalSourceQty = source.reduce((sum, item) => sum + (Number(item?.Sour_Qty) || 0), 0);
    const totalDestinationQty = destination.reduce((sum, item) => sum + (Number(item?.Dest_Qty) || 0), 0);
    const maxRows = Math.max(source.length, destination.length, 2);
    const rowIndices = Array.from({ length: maxRows }, (_, i) => i);


    const normalizeType = (val) => (val || '').trim().toLowerCase();

    const KNOWN_STAFF_SLOTS = {
        supervisor: ['supervisor'],
        owners: ['owner', 'owners'],
        taken: ['taken', 'taken by'],
        checked: ['checked', 'checked by'],
        loadman: ['load man', 'loadman', 'load-man'],
        ladiescoolie:['Ladies Coolie','LadiesCoolie','ladiescoolie','ladies coolie'],
        hindiboysName:['Hindi Boys','HindiBoys','hindiboys','hindi boys']
    };

    const getStaffNamesForSlot = (slotKey) => staffs
        .filter(s => KNOWN_STAFF_SLOTS[slotKey].includes(normalizeType(s?.EmpTypeGet)))
        .map(s => s?.EmpNameGet)
        .filter(Boolean)
        .join(', ');

    const supervisorNames = getStaffNamesForSlot('supervisor');
    const ownersNames = getStaffNamesForSlot('owners');
    const takenNames = getStaffNamesForSlot('taken');
    const checkedNames = getStaffNamesForSlot('checked');
    const loadmanNames = getStaffNamesForSlot('loadman');
const ladiescoolieNames = getStaffNamesForSlot('ladiescoolie');
const hindiboysname = getStaffNamesForSlot('hindiboysName');



    return (
        <>
            <span onClick={handleOpen}>{children}</span>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="xl"
                sx={{
                    '& .MuiDialog-container': {
                        alignItems: 'flex-start',
                        padding: '20px 0',
                        overflow: 'auto',
                    },
                    '& .MuiPaper-root': {
                        width: 'auto',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        margin: 0,
                        overflow: 'visible',
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    width: '100%',
                    position: 'sticky',
                    marginTop: '2px',
                    backgroundColor: 'white',
                    zIndex: 1,
                }}>
                    Print Preview
                </DialogTitle>

                <DialogContent
                    ref={printRef}
                    sx={{
                        padding: 0,
                        margin: 0,
                        overflow: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        '@media print': {
                            overflow: 'visible',
                            display: 'block',
                            height: 'auto',
                            marginTop: '2px'
                        }
                    }}
                >
                    <div
                        style={getInlineStyles()}
                        className="print-container"
                    >
                        <h3 className='text-center mb-2 mt-0' style={{ letterSpacing: '1px',fontSize:'20px' }}>GODOWN INTERNAL ADJUSTMENT CHALLAN</h3>

                        {/* Header Info */}
                        <table className="table m-0 mb-2">
                            <tbody>
                                <tr>
                                    <td className="border fw-bold fa-13" style={{ width: '13%' }}>Voucher No</td>
                                    <td className="border fa-13">{entryDetails?.PR_Inv_Id}</td>
                                    <td className="border fw-bold fa-13" style={{ width: '13%' }}>Voucher Type</td>
                                    <td className="border fa-13">{entryDetails?.VoucherTypeGet}</td>
                                    <td className="border fw-bold fa-13" style={{ width: '10%' }}>Date</td>
                                    <td className="border fa-13">{LocalDate(entryDetails?.Process_date)}</td>
                                </tr>
                                <tr>
                                    <td className="border fw-bold fa-13">Entry By</td>
                                    <td className="border fa-13">{entryDetails?.createdByGet}</td>
                                    <td className="border fw-bold fa-13">Supervisor</td>
                                    <td className="border fa-13">{supervisorNames || <>&nbsp;</>}</td>
                                    <td className="border fw-bold fa-13">Owners</td>
                                    <td className="border fa-13">{ownersNames || <>&nbsp;</>}</td>
                                </tr>
                                <tr>
                                    <td className="border fw-bold fa-13">Taken</td>
                                    <td className="border fa-13">{takenNames || <>&nbsp;</>}</td>
                                    <td className="border fw-bold fa-13">Checked</td>
                                    <td className="border fa-13">{checkedNames || <>&nbsp;</>}</td>
                                    <td className="border fw-bold fa-13">Ladies Coolie</td>
                                    <td className="border fa-13">{ ladiescoolieNames || <>&nbsp;</>}</td>
                                </tr>
                                <tr>
                                    <td className="border fw-bold fa-13">Hindi Boys</td>
                                    <td className="border fa-13" colSpan={5}>{hindiboysname}</td>
                                    
                                    
                                </tr>
                                 <tr>
                                    <td className="border fw-bold fa-13">Remarks</td>
                                    <td className="border fa-13" colSpan={5}>{entryDetails?.Narration}</td>
                                    
                                    
                                </tr>
                            </tbody>
                        </table>

                        {/* Source / Destination */}
                        <div className="row">
                            <div className="col-6 p-0 pe-1">
                                <table className="table m-0">
                                    <thead>
                                        <tr>
                                            <td className="border bg-light fa-13 fw-bold text-center" colSpan={3}>SOURCE</td>
                                        </tr>
                                        <tr>
                                            <td className="border bg-light fa-13 text-center" style={{ width: '15%' }}>S.No</td>
                                            <td className="border bg-light fa-13">Stock Item</td>
                                            <td className="border bg-light fa-13 text-end" style={{ width: '25%' }}>Qty</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowIndices.map((i) => (
                                            <tr key={i}>
                                                <td className="border fa-13 text-center">{i + 1}.</td>
                                                <td className="border fa-13">{source[i]?.Product_Name || ''}</td>
                                                <td className="border fa-13 text-end">
                                                    {checkIsNumberSafe(source[i]?.Sour_Qty) ? NumberFormat(source[i]?.Sour_Qty) : ''}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="border fa-13"></td>
                                            <td className="border fa-13 fw-bold">TOTAL</td>
                                            <td className="border fa-13 fw-bold text-end">{NumberFormat(totalSourceQty)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-6 p-0 ps-1">
                                <table className="table m-0">
                                    <thead>
                                        <tr>
                                            <td className="border bg-light fa-13 fw-bold text-center" colSpan={3}>DESTINATION</td>
                                        </tr>
                                        <tr>
                                            <td className="border bg-light fa-13 text-center" style={{ width: '15%' }}>S.No</td>
                                            <td className="border bg-light fa-13">Stock Item</td>
                                            <td className="border bg-light fa-13 text-end" style={{ width: '25%' }}>Qty</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowIndices.map((i) => (
                                            <tr key={i}>
                                                <td className="border fa-13 text-center">{i + 1}.</td>
                                                <td className="border fa-13">{destination[i]?.Product_Name || ''}</td>
                                                <td className="border fa-13 text-end">
                                                    {checkIsNumberSafe(destination[i]?.Dest_Qty) ? NumberFormat(destination[i]?.Dest_Qty) : ''}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="border fa-13"></td>
                                            <td className="border fa-13 fw-bold">TOTAL</td>
                                            <td className="border fa-13 fw-bold text-end">{NumberFormat(totalDestinationQty)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                     
                    </div>
                </DialogContent>

                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="godownChallanPageSizeSwitch"
                            checked={pageSize === 'A4'}
                            onChange={handleToggle}
                        />
                        <label className="form-check-label" htmlFor="godownChallanPageSizeSwitch">
                            {pageSize} selected
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Button
                            startIcon={<Close />}
                            variant="outlined"
                            color="error"
                            onClick={handleClose}
                        >
                            Close
                        </Button>

                        {download && (
                            <Button
                                startIcon={<Download />}
                                variant="outlined"
                                onClick={handlePrint}
                            >
                                Download
                            </Button>
                        )}
                    </div>
                </DialogActions>
            </Dialog>
        </>
    )
}


const checkIsNumberSafe = (val) => val !== undefined && val !== null && val !== '' && !isNaN(Number(val));

export default GodownChallanPrintTemplate;