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
  Table,
  Badge,
} from 'reactstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';
import companyLogo from '../../../../assets/images/Logo1.jpg';

interface AssetLifecycleViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  asset: Record<string, any> | null; // asset info
  lifecycles: Record<string, any>[]; // lifecycle events list
  visibleColumns?: string[];
}

const AssetLifecycleViewModal: React.FC<AssetLifecycleViewModalProps> = ({
  isOpen,
  toggle,
  asset,
  lifecycles = [],
  visibleColumns = ['event', 'notes', 'domain', 'created_at', 'updated_at'],
}) => {
  if (!asset) return null;

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
    const doc = new jsPDF({ orientation: 'landscape' });
    const imgBase64 = await toBase64(companyLogo);

    doc.addImage(imgBase64, 'JPEG', 14, 10, 30, 30);
    doc.setFontSize(16);
    doc.text('GITHUNGURI DAIRY FARMERS COOPERATIVE SOCIETY', 50, 20);
    doc.setFontSize(14);
    doc.text('Asset Lifecycle Records', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Event', 'Notes', 'Domain', 'Created At', 'Updated At']],
      body: lifecycles.map((lc) => [
        lc.event || '—',
        lc.notes || '—',
        lc.domain || '—',
        formatDate(lc.created_at),
        formatDate(lc.updated_at),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [60, 141, 188] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    doc.setFontSize(12);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Asset Lifecycle Details
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
            <p className="text-muted mb-0">Asset Lifecycle Record Summary</p>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-3">
          <CardBody>
            <Row className="mb-2">
              <Col md="6">
                <strong>Asset:</strong> {asset.name || '—'} (Serial: {asset.serial_no || '—'})
              </Col>
              <Col md="6">
                <strong>Asset ID:</strong> {asset.id || '—'}
              </Col>
            </Row>
            <hr />
            <Table striped responsive bordered className="align-middle text-center">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  {visibleColumns.includes('event') && <th>Event</th>}
                  {visibleColumns.includes('notes') && <th>Notes</th>}
                  {visibleColumns.includes('domain') && <th>Domain</th>}
                  {visibleColumns.includes('created_at') && <th>Created At</th>}
                  {visibleColumns.includes('updated_at') && <th>Updated At</th>}
                </tr>
              </thead>
              <tbody>
                {lifecycles.length > 0 ? (
                  lifecycles.map((lc, index) => (
                    <tr key={lc.id || index}>
                      <td>{index + 1}</td>
                      {visibleColumns.includes('event') && (
                        <td>
                          <Badge color="info">{lc.event || '—'}</Badge>
                        </td>
                      )}
                      {visibleColumns.includes('notes') && <td>{lc.notes || '—'}</td>}
                      {visibleColumns.includes('domain') && <td>{lc.domain || '—'}</td>}
                      {visibleColumns.includes('created_at') && (
                        <td>{formatDate(lc.created_at)}</td>
                      )}
                      {visibleColumns.includes('updated_at') && (
                        <td>{formatDate(lc.updated_at)}</td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="text-muted">
                      No lifecycle records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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

export default AssetLifecycleViewModal;
