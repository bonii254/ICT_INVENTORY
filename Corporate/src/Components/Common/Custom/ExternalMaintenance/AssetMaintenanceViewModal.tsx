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

interface AssetMaintenanceViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  maintenance: Record<string, any> | null;
}

const AssetMaintenanceViewModal: React.FC<AssetMaintenanceViewModalProps> = ({
  isOpen,
  toggle,
  maintenance,
}) => {
  if (!maintenance) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

    doc.setFontSize(12);
    doc.text(`Receipt Number: ${maintenance.receipt_number || '—'}`, 50, 28);

    doc.setFontSize(14);
    doc.text('Asset Maintenance Record', 14, 45);

    const rows = [
      ['Asset Name', maintenance.asset?.name || '—'],
      ['Serial Number', maintenance.asset?.serial_no || '—'],
      ['Parent Asset', maintenance.asset?.parent_asset?.name || '—'],
      ['Provider', maintenance.provider?.name || '—'],
      ['Maintenance Type', maintenance.maintenance_type || '—'],
      ['Description', maintenance.description || '—'],
      ['Expected Return Date', formatDate(maintenance.expected_return_date)],
      ['Actual Return Date', formatDate(maintenance.actual_return_date)],
      ['Status', maintenance.status || '—'],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [60, 141, 188] },
      styles: { cellWidth: 'wrap' },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 120 },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    // Signature Section
    doc.setFontSize(12);
    doc.text('TECHNICIAN SENDING FOR MAINTENANCE:', 14, finalY + 15);
    doc.text('Name: ____________________________________________', 14, finalY + 25);
    doc.text('Signature: ____________________________________________', 14, finalY + 35);
    doc.text('Date Sent: ____________________________________________', 14, finalY + 45);
    doc.text('Date Received Back: ____________________________________________', 14, finalY + 55);

    doc.text('SUPERVISOR APPROVAL:', 14, finalY + 75);
    doc.text('Name: ____________________________________________', 14, finalY + 85);
    doc.text('Signature: ____________________________________________', 14, finalY + 95);
    doc.text('Approval Date: ____________________________________________', 14, finalY + 105);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const statusColor =
    maintenance.status === 'RETURNED'
      ? 'success'
      : maintenance.status === 'IN_PROGRESS'
        ? 'warning'
        : maintenance.status === 'SENT'
          ? 'secondary'
          : 'dark';

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Asset Out for Maintenance
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
            <p className="text-muted mb-0">Asset Maintenance Record</p>
            <p className="mb-0">
              <strong>Receipt Number:</strong> {maintenance.receipt_number || '—'}
            </p>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-3">
          <CardBody>
            <Row className="mb-2">
              <Col md="6">
                <strong>Asset:</strong> {maintenance.asset?.name || '—'}
                <br />
                <span style={{ marginLeft: '1rem' }}>
                  <strong>Serial Number:</strong> {maintenance.asset?.serial_no || '—'}
                </span>
              </Col>
              <Col md="6">
                <strong>Parent Asset:</strong> {maintenance.asset?.parent_asset?.name || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="6">
                <strong>Provider:</strong> {maintenance.provider?.name || '—'}
              </Col>
              <Col md="6">
                <strong>Maintenance Type:</strong> {maintenance.maintenance_type || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="6">
                <strong>Expected Return Date:</strong>{' '}
                {formatDate(maintenance.expected_return_date)}
              </Col>
              <Col md="6">
                <strong>Actual Return Date:</strong> {formatDate(maintenance.actual_return_date)}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="12">
                <strong>Description:</strong> {maintenance.description || '—'}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md="4">
                <strong>Status:</strong>{' '}
                <Badge color={statusColor}>{maintenance.status || '—'}</Badge>
              </Col>
            </Row>

            {/* Signature Section */}
            <Row className="mt-5">
              <Col md="6">
                <p>
                  <strong>Technician Sending for Maintenance:</strong>
                </p>
                <p>Name: ____________________________________________</p>
                <p>Signature: ____________________________________________</p>
                <p>Date Sent: ____________________________________________</p>
                <p>Date Received Back: ____________________________________________</p>
              </Col>

              <Col md="6">
                <p>
                  <strong>Supervisor Approval:</strong>
                </p>
                <p>Name: ____________________________________________</p>
                <p>Signature: ____________________________________________</p>
                <p>Approval Date: ____________________________________________</p>
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

export default AssetMaintenanceViewModal;
