import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
} from "reactstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Printer, FileText } from "lucide-react";

interface AssetTransferViewModalProps {
  isOpen: boolean;
  toggle: () => void;
  assetTransfer: any;
}
const AssetTransferViewModal: React.FC<AssetTransferViewModalProps> = ({
  isOpen,
  toggle,
  assetTransfer,
}) => {
  if (!assetTransfer) return null;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Asset Transfer Details", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Field", "Value"]],
      body: [
        ["Asset", assetTransfer.asset],
        ["Serial Number", assetTransfer["asset serial number"] || "-"],
        ["From Location", assetTransfer.from_location],
        ["To Location", assetTransfer.to_location],
        ["Transferred From", assetTransfer.transferred_from],
        ["Transferred To", assetTransfer.transferred_to],
        ["Notes", assetTransfer.notes],
        ["Created At", assetTransfer.created_at],
        ["Updated At", assetTransfer.updated_at],
      ],
    });
    doc.save("asset-transfer.pdf");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Asset Transfer Details</ModalHeader>
      <ModalBody>
        <Table className="table-nowrap">
          <tbody>
            <tr>
              <th style={{ width: "200px" }}>Asset</th>
              <td>{assetTransfer.asset}</td>
            </tr>
            <tr>
              <th>Serial Number</th>
              <td>{assetTransfer["asset serial number"] || "-"}</td>
            </tr>
            <tr>
              <th>From Location</th>
              <td>{assetTransfer.from_location}</td>
            </tr>
            <tr>
              <th>To Location</th>
              <td>{assetTransfer.to_location}</td>
            </tr>
            <tr>
              <th>Transferred From</th>
              <td>{assetTransfer.transferred_from}</td>
            </tr>
            <tr>
              <th>Transferred To</th>
              <td>{assetTransfer.transferred_to}</td>
            </tr>
            <tr>
              <th>Notes</th>
              <td>{assetTransfer.notes}</td>
            </tr>
            <tr>
              <th>Created At</th>
              <td>{assetTransfer.created_at}</td>
            </tr>
            <tr>
              <th>Updated At</th>
              <td>{assetTransfer.updated_at}</td>
            </tr>
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-secondary" onClick={exportPDF}>
          <FileText size={14} className="me-1" /> Export PDF
        </Button>
        <Button color="outline-secondary" onClick={() => window.print()}>
          <Printer size={14} className="me-1" /> Print
        </Button>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssetTransferViewModal;
