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
} from 'reactstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';
import companyLogo from '../../../../assets/images/Logo1.jpg';

interface AssetTransferViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  assetTransfer: Record<string, any> | null;
}

const AssetTransferViewModal: React.FC<AssetTransferViewModalProps> = ({
  isOpen,
  toggle,
  assetTransfer,
}) => {
  if (!assetTransfer) return null;

  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const exportPDF = async () => {
    const doc = new jsPDF();

    // Logo
    doc.addImage(companyLogo, 'JPEG', 14, 10, 30, 30);

    doc.setFontSize(16);
    doc.text('GITHUNGURI DAIRY FARMERS COOPERATIVE SOCIETY', 50, 20);

    doc.setFontSize(14);
    doc.text('Asset Transfer Form', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: [
        ['Asset Name', assetTransfer.asset_name || '—'],
        ['Serial Number', assetTransfer.asset_serial || '—'],
        ['Asset Tag', assetTransfer.asset_tag || '—'],
        ['From Location', assetTransfer.from_location || '—'],
        ['From Payroll', assetTransfer.from_payroll || '—'],
        ['To Location', assetTransfer.to_location || '—'],
        ['To Payroll', assetTransfer.to_payroll || '—'],
        ['Handing Over (From)', assetTransfer.transferred_from || '—'],
        ['Receiving (To)', assetTransfer.transferred_to || '—'],
        ['Transfer Date', assetTransfer.created_at || today],
        ['Notes', assetTransfer.notes || '—'],
      ],
      theme: 'grid',
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Signature section
    doc.setFontSize(12);

    doc.text('Handing Over (Current Custodian)', 14, finalY + 15);
    doc.text(`Name: ${assetTransfer.transferred_from || '—'}`, 14, finalY + 25);
    doc.text(`Payroll No: ${assetTransfer.from_payroll || '—'}`, 14, finalY + 35);
    doc.text('Signature: _______________________________', 14, finalY + 45);
    doc.text(`Date: ${today}`, 14, finalY + 55);

    doc.text('Receiving (New Custodian)', 14, finalY + 75);
    doc.text(`Name: ${assetTransfer.transferred_to || '—'}`, 14, finalY + 85);
    doc.text(`Payroll No: ${assetTransfer.to_payroll || '—'}`, 14, finalY + 95);
    doc.text('Signature: _______________________________', 14, finalY + 105);
    doc.text(`Date: ${today}`, 14, finalY + 115);

    window.open(URL.createObjectURL(doc.output('blob')), '_blank');
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Asset Transfer Details
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
            <p className="text-muted mb-0">Asset Transfer Record</p>
          </Col>
        </Row>

        <Card className="shadow-sm border-0">
          <CardBody>
            <Row className="mb-2">
              <Col md="6">
                <strong>Asset Name:</strong> {assetTransfer.asset_name || '—'}
              </Col>
              <Col md="6">
                <strong>Serial No:</strong> {assetTransfer.asset_serial || '—'}
              </Col>
              <Col md="6">
                <strong>Asset Tag:</strong> {assetTransfer.asset_tag || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="6">
                <strong>From Location:</strong> {assetTransfer.from_location || '—'}
              </Col>
              <Col md="6">
                <strong>To Location:</strong> {assetTransfer.to_location || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="6">
                <strong>From Payroll:</strong> {assetTransfer.from_payroll || '—'}
              </Col>
              <Col md="6">
                <strong>To Payroll:</strong> {assetTransfer.to_payroll || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="6">
                <strong>Handing Over:</strong> {assetTransfer.transferred_from || '—'}
              </Col>
              <Col md="6">
                <strong>Receiving:</strong> {assetTransfer.transferred_to || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="12">
                <strong>Transfer Date:</strong> {assetTransfer.created_at || today}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="12">
                <strong>Notes:</strong> {assetTransfer.notes || '—'}
              </Col>
            </Row>

            {/* Signature Section */}
            <Row className="mt-5">
              <Col md="6">
                <p><strong>Handing Over (Current Custodian)</strong></p>
                <p>Name: {assetTransfer.transferred_from || '—'}</p>
                <p>Payroll No: {assetTransfer.from_payroll || '—'}</p>
                <p>Signature: _______________________________</p>
                <p>Date: {today}</p>
              </Col>

              <Col md="6">
                <p><strong>Receiving (New Custodian)</strong></p>
                <p>Name: {assetTransfer.transferred_to || '—'}</p>
                <p>Payroll No: {assetTransfer.to_payroll || '—'}</p>
                <p>Signature: _______________________________</p>
                <p>Date: {today}</p>
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

export default AssetTransferViewModal;