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
}

const AssetLoanViewModal: React.FC<AssetLoanViewModalProps> = ({ isOpen, toggle, loan }) => {
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

  const exportPDF = () => {
    const doc = new jsPDF();

    // Company Logo
    const img = new Image();
    img.src = companyLogo;
    doc.addImage(img, 'JPEG', 14, 10, 30, 30);

    // Company Name
    doc.setFontSize(16);
    doc.text('GITHUNGURI DAIRY FARMERS COOPERATIVE SOCIETY', 50, 20);

    // Title
    doc.setFontSize(14);
    doc.text('Asset Loan Details', 14, 45);

    const rows = [
      ['Asset', loan.asset || '—'],
      ['Borrower', loan.borrower || '—'],
      ['Loan Date', formatDate(loan.loan_date)],
      ['Expected Return', formatDate(loan.expected_return_date)],
      ['Actual Return', formatDate(loan.actual_return_date)],
      ['Status', loan.status || '—'],
      ['Condition Before', loan.condition_before || '—'],
      ['Condition After', loan.condition_after || '—'],
      ['Remarks', loan.remarks || '—'],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [60, 141, 188] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    // Signature Section (extra spacing for handwriting)
    doc.setFontSize(12);
    doc.text('Borrower:', 14, finalY + 15);
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

    // Instead of saving — open in new tab for preview
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
                <strong>Asset:</strong> {loan.asset || '—'}
              </Col>
              <Col md="6">
                <strong>Borrower:</strong> {loan.borrower || '—'}
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
            <Row className="mb-2">
              <Col md="12">
                <strong>Condition Before:</strong> {loan.condition_before || '—'}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md="12">
                <strong>Condition After:</strong> {loan.condition_after || '—'}
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <strong>Remarks:</strong> {loan.remarks || '—'}
              </Col>
            </Row>

            {/* Signature Section */}
            <Row className="mt-5">
              <Col md="6">
                <p>
                  <strong>Borrower:</strong>
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
