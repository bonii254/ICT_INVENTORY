import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
} from 'reactstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';
import companyLogo from '../../../../assets/images/Logo1.jpg';

interface AssetLoanViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  loan: Record<string, any> | null;
  visibleColumns?: string[]; // list of columns to show in PDF
}

const AssetLoanViewModal: React.FC<AssetLoanViewModalProps> = ({
  isOpen,
  toggle,
  loan,
  visibleColumns = [
    'assetName',
    'assetSerial',
    'assetTag',
    'borrowerName',
    'borrowerPayroll',
    'loanDate',
    'expectedReturn',
    'actualReturn',
    'status',
    'conditionBefore',
    'conditionAfter',
    'remarks',
  ],
}) => {
  if (!loan) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Convert image to base64 safely
  const toBase64 = (img: string) =>
    new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.src = img;
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      image.onerror = (err) => reject(err);
    });

  const exportPDF = async () => {
    const doc = new jsPDF();

    const imgBase64 = await toBase64(companyLogo);
    doc.addImage(imgBase64, 'JPEG', 14, 10, 30, 30);

    doc.setFontSize(16);
    doc.text('GITHUNGURI DAIRY FARMERS COOPERATIVE SOCIETY', 50, 20);

    doc.setFontSize(14);
    doc.text('Asset Loan Details', 14, 45);

    const allRows: Record<string, [string, string]> = {
      assetName: ['Asset Name', loan.asset?.name || '—'],
      assetSerial: ['Asset Serial No', loan.asset?.serial_no || '—'],
      assetTag: ['Asset Tag', loan.asset?.asset_tag || '—'],
      borrowerName: ['Receiver Name', loan.borrower?.full_name || '—'],
      borrowerPayroll: ['Receiver Payroll No', loan.borrower?.payroll_no || '—'],
      loanDate: ['Loan Date', formatDate(loan.loan_date)],
      expectedReturn: ['Expected Return', formatDate(loan.expected_return_date)],
      actualReturn: ['Actual Return', formatDate(loan.actual_return_date)],
      status: ['Status', loan.status || '—'],
      conditionBefore: ['Condition Before', loan.condition_before || '—'],
      conditionAfter: ['Condition After', loan.condition_after || '—'],
      remarks: ['Remarks', loan.remarks || '—'],
    };

    // Map visible columns
    const rows = visibleColumns.map((col) => allRows[col as keyof typeof allRows]).filter(Boolean);

    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [60, 141, 188] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    // Signature Section
    doc.setFontSize(12);
    doc.text('Receiver:', 14, finalY + 15);
    doc.text(
      'Name: ____________________________________________   Signature: ____________________________________________',
      14,
      finalY + 25,
    );
    doc.text('Date Collected: ____________________________________________', 14, finalY + 35);
    doc.text('Place Collected: ____________________________________________', 14, finalY + 45);
    doc.text('Date Returned: ____________________________________________', 14, finalY + 55);

    doc.text('Person In Charge (Rendered Asset):', 14, finalY + 70);
    doc.text(
      'Name: ____________________________________________   Signature: ____________________________________________',
      14,
      finalY + 80,
    );
    doc.text('Render Date: ____________________________________________', 14, finalY + 90);
    doc.text('Receiving Date: ____________________________________________', 14, finalY + 100);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const statusColor =
    loan.status === 'RETURNED' ? 'success' : loan.status === 'OVERDUE' ? 'danger' : 'warning';

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Asset Loan Details
      </ModalHeader>
      <ModalBody>
        <Row className="align-items-center mb-4">
          <Col xs="2">
            <img src={companyLogo} alt="Company Logo" style={{ width: '100%' }} />
          </Col>
          <Col>
            <h4 className="text-primary fw-bold mb-0">
              GITHUNGURI DAIRY FARMERS COOPERATIVE SOCIETY
            </h4>
            <p className="text-muted mb-0">Asset Loan Record</p>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-3">
          <CardBody>
            <Row className="mb-2">
              <Col md="6">
                <strong>Asset:</strong> {loan.asset?.name || '—'} (Serial:{' '}
                {loan.asset?.serial_no || '—'}) (Asset Tag:{' '}
                {loan.asset?.asset_tag || '—'})
              </Col>
              <Col md="6">
                <strong>Receiver:</strong> {loan.borrower?.full_name || '—'} (Payroll No:{' '}
                {loan.borrower?.payroll_no || '—'})
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md="4">
                <strong>Loan Date:</strong> {formatDate(loan.loan_date)}
              </Col>
              <Col md="4">
                <strong>Expected Return:</strong> {formatDate(loan.expected_return_date)}
              </Col>
              <Col md="4">
                <strong>Actual Return:</strong> {formatDate(loan.actual_return_date)}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md="4">
                <strong>Status:</strong> <Badge color={statusColor}>{loan.status}</Badge>
              </Col>
            </Row>

            {visibleColumns.includes('conditionBefore') && (
              <Row className="mb-2">
                <Col md="12">
                  <strong>Condition Before:</strong> {loan.condition_before || '—'}
                </Col>
              </Row>
            )}
            {visibleColumns.includes('conditionAfter') && (
              <Row className="mb-2">
                <Col md="12">
                  <strong>Condition After:</strong> {loan.condition_after || '—'}
                </Col>
              </Row>
            )}
            {visibleColumns.includes('remarks') && (
              <Row>
                <Col md="12">
                  <strong>Remarks:</strong> {loan.remarks || '—'}
                </Col>
              </Row>
            )}

            {/* Signature Section */}
            <Row className="mt-5">
              <Col md="6">
                <p>
                  <strong>Receiver:</strong>
                </p>
                <p>Name: ____________________________________________</p>
                <p>Signature: ____________________________________________</p>
                <p>Date Collected: ____________________________________________</p>
                <p>Place Collected: ____________________________________________</p>
                <p>Date Returned: ____________________________________________</p>
              </Col>
              <Col md="6">
                <p>
                  <strong>Person In Charge (Rendered Asset):</strong>
                </p>
                <p>Name: ____________________________________________</p>
                <p>Signature: ____________________________________________</p>
                <p>Render Date: ____________________________________________</p>
                <p>Receiving Date: ____________________________________________</p>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter className="justify-content-between">
        <Button color="outline-primary" onClick={exportPDF}>
          <FileText size={14} className="me-1" />
          Preview / Export PDF
        </Button>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssetLoanViewModal;
