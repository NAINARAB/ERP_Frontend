import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, DialogActions, IconButton } from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { NumberFormat } from '../../../Components/functions';

const PdfPreviewModal = ({ open, onClose, brokerData }) => {
    const printRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const items = brokerData?.Items || [];
    const totalBrokerage = items.reduce((sum, item) => sum + parseFloat(item.Brok_Amt || 0), 0);
    const totalCoolie = items.reduce((sum, item) => sum + parseFloat(item.Coolie_Amt || 0), 0);
    const totalAmount = parseFloat(brokerData?.Total_Amount || 0);
    const vilaivasi = parseFloat(brokerData?.VilaiVasi || 0);

    const netTotalRaw = totalAmount - totalBrokerage + totalCoolie - vilaivasi;
    const netTotalRounded = Math.round(netTotalRaw);
    const roundOff = netTotalRounded - netTotalRaw;



    const getPackSizeSummary = () => {
        const packQuantities = items.reduce((acc, item) => {
            const packSize = Math.round(parseFloat(item.KGS) / parseFloat(item.QTY));
            if (!isNaN(packSize)) {
                acc[packSize] = (acc[packSize] || 0) + parseFloat(item.QTY);
            }
            return acc;
        }, {});
        if (!packQuantities) return null;
        return Object.entries(packQuantities)
            .sort(([sizeA], [sizeB]) => sizeA - sizeB)
            .map(([size, qty]) => `${size}kg - ${qty}`)
            .join(' & ');
    };
    const packSizeSummary = getPackSizeSummary();

    function formatSignedNumber(value) {
        const n = Number(value) || 0;
        return `${n >= 0 ? '+' : ''}${NumberFormat(n)}`;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
            <DialogTitle>
                Broker Report: {brokerData?.Broker_Name}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent ref={printRef}>
                <div className="text-center mb-3">
                    <h4>Broker Report Page</h4>
                    <p className="mb-0">Date: {new Date().toLocaleDateString('en-IN')}</p>
                    <p className="mb-0">Broker: {brokerData?.Broker_Name}</p>
                    {packSizeSummary && (
                        <p className="mb-0">Pack Sizes: {packSizeSummary}</p>
                    )}
                </div>

                <table className="table table-bordered" style={{ fontSize: '12px' }}>
                    <thead>
                        <tr>
                            <th>PARTY NAME</th>
                            <th>ALIAS NAME</th>
                            <th className="text-end">BILL RATE</th>
                            <th className="text-end">BROKER EXP</th>
                            <th className="text-end">QTY</th>
                            <th className="text-end">KGS</th>
                            <th className="text-end">AMOUNT</th>
                            <th className="text-end">VILAIVAASI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.Retailer_Name || item.Ledger_Name}</td>
                                <td>{item.Short_Name}</td>
                                <td className="text-end">{item.Item_Rate}</td>
                                <td className="text-end">{NumberFormat(item.Brok_Amt || 0)}</td>
                                <td className="text-end">{item.QTY}</td>
                                <td className="text-end">{item.KGS}</td>
                                <td className="text-end">{NumberFormat(item.Amount)}</td>
                                <td className="text-end">{NumberFormat(item.Vilaivasi_Rate)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="4" className="text-end fw-bold">TOTAL</td>
                            <td className="text-end fw-bold">{brokerData?.Total_Qty || 0}</td>
                            <td className="text-end fw-bold">{brokerData?.Total_KGS || 0}</td>
                            <td className="text-end fw-bold">{NumberFormat(brokerData?.Total_Amount || 0)}</td>
                            <td className="text-end fw-bold">{NumberFormat(brokerData?.VilaiVasi || 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end fw-bold">{packSizeSummary}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="row mt-3">
                    <div className="col-6 offset-6">
                        <table className="table table-bordered" style={{ fontSize: '12px' }}>
                            <tbody>
                                <tr>
                                    <td className="fw-bold">COOLIE</td>
                                    <td className="text-end fw-bold">{NumberFormat(totalCoolie)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">BROKERAGE</td>
                                    <td className="text-end fw-bold">- {NumberFormat(totalBrokerage)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">VILAIVAASI</td>
                                    <td className="text-end fw-bold">- {NumberFormat(vilaivasi)}</td>
                                </tr>

                                <tr>
                                    <td className="fw-bold">ROUNDOFF</td>
                                    <td className="text-end fw-bold">{formatSignedNumber(roundOff)}</td>
                                </tr>

                                <tr className="bg-light">
                                    <td className="fw-bold">NET TOTAL</td>
                                    <td className="text-end fw-bold">{NumberFormat(netTotalRounded)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center mt-3 small">
                    <p>This is a computer generated report</p>
                </div>
            </DialogContent>

            <DialogActions>
                <Button startIcon={<Close />} variant='outlined' color='error' onClick={onClose}>
                    Close
                </Button>
                <Button
                    startIcon={<Download />}
                    variant='contained'
                    color='primary'
                    onClick={handlePrint}
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PdfPreviewModal;
