import React, { useState } from 'react';
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { NumberFormat, LocalDate, toArray } from '../../../Components/functions';
import { fetchLink } from '../../../Components/fetchComponent';
import { Card, Col, Row, Form, Button } from 'react-bootstrap';

const VoucherInfo = ({ loadingOn, loadingOff }) => {
    const [voucherNo, setVoucherNo] = useState('');
    const [reportData, setReportData] = useState({ basicDetails: null, references: [] });

    const fetchVoucherInfo = () => {
        if (!voucherNo.trim()) return;

        setReportData({ basicDetails: null, references: [] });
        fetchLink({
            address: `journal/voucherInfo?VoucherNo=${encodeURIComponent(voucherNo)}`,
            loadingOn, loadingOff
        }).then(({ success, others }) => {
            if (success) {
                setReportData({
                    basicDetails: others?.basicDetails || null,
                    references: toArray(others?.references)
                });
            }
        }).catch(console.error);
    };

    const getStatusText = (status) => {
        switch (Number(status)) {
            case 0: return 'Canceled';
            case 1: return 'New';
            case 2: return 'In Progress';
            case 3: return 'Completed';
            case 4: return 'Canceled';
            default: return 'Unknown';
        }
    };

    const columns = [
        createCol('ref_type', 'string', 'Reference Type'),
        createCol('ref_voucher_no', 'string', 'Voucher No'),
        createCol('party_name', 'string', 'Account / Party Name'),
        createCol('ref_date', 'date', 'Entry Date'),
        createCol('ref_amount', 'number', 'Amount'),
    ];

    return (
        <div className="container-fluid p-3">
            <h4 className="mb-3">Voucher Info Search</h4>
            <div className="d-flex mb-4 gap-2 align-items-center">
                <Form.Control
                    type="text"
                    placeholder="Enter Voucher Number (e.g. OMS/009628/26-27)"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchVoucherInfo()}
                    style={{ maxWidth: '300px' }}
                />
                <Button variant="primary" onClick={fetchVoucherInfo}>
                    Search
                </Button>
            </div>

            {reportData.basicDetails ? (
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Header className="bg-light">
                        <h5 className="m-0 text-primary">Basic Details: {reportData.basicDetails.VoucherNo}</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Party / Account Name</span>
                                <span className="fa-14">{reportData.basicDetails.party_name || '-'}</span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Voucher Type</span>
                                <span className="fa-14">{reportData.basicDetails.Voucher_type || '-'}</span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Entry Date</span>
                                <span className="fa-14">{LocalDate(reportData.basicDetails.entry_date) || '-'}</span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Amount</span>
                                <span className="fa-14 fw-bold text-success">{NumberFormat(reportData.basicDetails.amount)}</span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Status</span>
                                <span className="fa-14">
                                    <span className={`badge ${[0, 4].includes(Number(reportData.basicDetails.status)) ? 'bg-danger' : 'bg-success'}`}>
                                        {getStatusText(reportData.basicDetails.status)}
                                    </span>
                                </span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Narration</span>
                                <span className="fa-14">{reportData.basicDetails.narration || '-'}</span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Created By</span>
                                <span className="fa-14">
                                    {reportData.basicDetails.created_by || '-'} 
                                    {reportData.basicDetails.created_date ? ` (${LocalDate(reportData.basicDetails.created_date)})` : ''}
                                </span>
                            </Col>
                            <Col md={6} lg={4} className="mb-3">
                                <span className="text-muted d-block fw-bold fa-12">Modified By</span>
                                <span className="fa-14">
                                    {reportData.basicDetails.modified_by || '-'} 
                                    {reportData.basicDetails.modified_date ? ` (${LocalDate(reportData.basicDetails.modified_date)})` : ''}
                                </span>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <div className="text-center text-muted mt-5">
                    {reportData.basicDetails === null ? '' : 'No basic details found for this voucher.'}
                </div>
            )}

            {reportData.basicDetails && (
                <FilterableTable
                    title='Voucher References'
                    dataArray={reportData.references}
                    columns={columns}
                    headerFontSizePx={12}
                    bodyFontSizePx={12}
                    EnableSerialNumber
                    ExcelPrintOption
                    PDFPrintOption
                />
            )}
        </div>
    );
};

export default VoucherInfo;
