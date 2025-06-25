import React from "react";
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
} from "reactstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Printer } from "lucide-react";

const AssetViewModal = ({ isOpen, toggle, asset }: any) => {
  const printableRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && printableRef.current) {
      printWindow.document.write(
        "<html><head><title>Asset Details</title></head><body>",
      );
      printWindow.document.write(printableRef.current.innerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const rows = Object.entries(asset || {}).map(([key, value]) => [
      key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      String(value),
    ]);

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: rows,
    });

    doc.save("asset_details.pdf");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Asset Details</ModalHeader>
      <ModalBody>
        <div ref={printableRef}>
          <Card className="shadow-sm border">
            <CardBody>
              <Row>
                {Object.entries(asset || {}).map(([key, value]) => (
                  <Col md="6" key={key} className="mb-3">
                    <div>
                      <span className="fw-semibold text-muted d-block small text-uppercase">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-dark">{String(value)}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </div>
      </ModalBody>
      <ModalFooter className="justify-content-between">
        <div className="d-flex gap-2">
          <Button color="outline-secondary" onClick={exportPDF}>
            <FileText size={14} className="me-1" />
            Export PDF
          </Button>
          <Button color="outline-secondary" onClick={handlePrint}>
            <Printer size={14} className="me-1" />
            Print
          </Button>
        </div>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssetViewModal;
