import React, { useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Spinner,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  Plus,
  Save,
  FileText,
  Printer,
  MoreVertical,
  Sliders,
} from "lucide-react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useApiGet } from "../../../helpers/api_helper";
import { useQueryClient } from "@tanstack/react-query";
import AddAssetTransfer from "../../../Components/Common/Custom/AssetTransfer/AddAssetTransferModal";
import AssetTransferViewModal from "Components/Common/Custom/AssetTransfer/ViewAssetTransferModal";
import DeleteAssetTransfer from "Components/Common/Custom/AssetTransfer/DeleteAssetTransferModal";
import EditAssetTransfer from "../../../Components/Common/Custom/AssetTransfer/EditAssetTransferModal";

const columnHelper = createColumnHelper<any>();

const AssetTransferTable = () => {
  const queryClient = useQueryClient();
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAssetTransfer, setSelectedAssetTransfer] = useState<any>(null);

  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {},
  );
  const [showColumnModal, setShowColumnModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 10;

  const { data, isLoading } = useApiGet<any>(
    ["assettransfers"],
    "/assettransfers",
    {},
    true,
    { refetchInterval: 10000 },
  );

  const assetTransfers = useMemo(() => data?.asset_transfers || [], [data]);

  const isAllSelected = assetTransfers
    .slice(currentPage * perPage, currentPage * perPage + perPage)
    .every((item: { id: number }) => selectedRows[item.id]);

  const toggleSelectRow = (id: number) =>
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSelectAll = useCallback(() => {
    const updated = { ...selectedRows };
    assetTransfers
      .slice(currentPage * perPage, currentPage * perPage + perPage)
      .forEach((item: { id: number }) => {
        isAllSelected ? delete updated[item.id] : (updated[item.id] = true);
      });
    setSelectedRows(updated);
  }, [assetTransfers, currentPage, perPage, selectedRows, isAllSelected]);

  const allColumnKeys = useMemo(
    () => [
      "asset",
      "from_location",
      "to_location",
      "transferred_from",
      "transferred_to",
      "notes",
      "created_at",
      "updated_at",
    ],
    [],
  );

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "select",
        header: () => (
          <Input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <Input
            type="checkbox"
            checked={!!selectedRows[row.original.id]}
            onChange={() => toggleSelectRow(row.original.id)}
          />
        ),
      }),
      ...allColumnKeys
        .filter((key) => visibleColumns[key] !== false)
        .map((key) =>
          columnHelper.accessor(key, {
            header: () => (
              <div>
                <div>
                  {key
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <Input
                  bsSize="sm"
                  placeholder="Filter..."
                  value={columnFilters[key] || ""}
                  onChange={(e) =>
                    setColumnFilters((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ),
            cell: (info) => info.getValue(),
          }),
        ),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="text-reset">
              <MoreVertical size={16} />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                onClick={() => {
                  setSelectedAssetTransfer(row.original);
                  setViewModal(true);
                }}
              >
                View
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSelectedAssetTransfer(row.original);
                  setEditModal(true);
                }}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                className="text-danger"
                onClick={() => {
                  setSelectedAssetTransfer(row.original);
                  setDeleteModal(true);
                }}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      }),
    ];
  }, [
    selectedRows,
    isAllSelected,
    columnFilters,
    visibleColumns,
    allColumnKeys,
    toggleSelectAll,
  ]);

  const filteredData = useMemo(() => {
    return assetTransfers.filter((row: any) =>
      Object.entries(columnFilters).every(([key, value]) =>
        row[key]?.toString().toLowerCase().includes(value.toLowerCase()),
      ),
    );
  }, [assetTransfers, columnFilters]);

  const paginatedData = useMemo(() => {
    const start = currentPage * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, currentPage]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    const headers = columns
      .filter((col) => col.id !== "actions" && col.id !== "select")
      .map((col) => (typeof col.header === "string" ? col.header : ""));
    const body = table.getRowModel().rows.map((row) =>
      row
        .getVisibleCells()
        .filter(
          (cell) => cell.column.id !== "actions" && cell.column.id !== "select",
        )
        .map((cell) => String(cell.getValue())),
    );

    autoTable(doc, {
      head: [headers],
      body: body as string[][],
    });

    doc.save("asset-transfers.pdf");
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="mb-0">AssetTransfer</h5>
          </Col>
          <Col className="text-end d-flex justify-content-end gap-2">
            <Button color="primary" onClick={() => setAddModal(true)}>
              <Plus size={16} className="me-1" /> Add
            </Button>
            <Button color="secondary" onClick={() => setShowColumnModal(true)}>
              <Sliders size={16} className="me-1" /> Columns
            </Button>
            <CSVLink
              data={table
                .getRowModel()
                .rows.map((row) =>
                  Object.fromEntries(
                    row
                      .getVisibleCells()
                      .map((cell) => [cell.column.id, cell.getValue()]),
                  ),
                )}
              filename="softwares.csv"
              className="btn btn-outline-secondary"
            >
              <Save size={14} className="me-1" /> CSV
            </CSVLink>
            <Button color="outline-secondary" onClick={exportPDF}>
              <FileText size={14} className="me-1" /> PDF
            </Button>
            <Button color="outline-secondary" onClick={() => window.print()}>
              <Printer size={14} className="me-1" /> Print
            </Button>
          </Col>
        </Row>

        <Modal
          isOpen={showColumnModal}
          toggle={() => setShowColumnModal(!showColumnModal)}
        >
          <ModalHeader toggle={() => setShowColumnModal(!showColumnModal)}>
            Select Columns
          </ModalHeader>
          <ModalBody>
            {allColumnKeys.map((col) => (
              <div className="form-check" key={col}>
                <Input
                  type="checkbox"
                  className="form-check-input"
                  id={col}
                  checked={visibleColumns[col] !== false}
                  onChange={() =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [col]: !(prev[col] !== false),
                    }))
                  }
                />
                <label className="form-check-label" htmlFor={col}>
                  {col
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
              </div>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowColumnModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>

        {isLoading ? (
          <div className="text-center p-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-centered table-nowrap">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted()
                          ? header.column.getIsSorted() === "asc"
                            ? " 🔼"
                            : " 🔽"
                          : ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Row className="mt-3">
          <Col className="d-flex justify-content-end gap-2">
            <Button
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  (prev + 1) * perPage < filteredData.length ? prev + 1 : prev,
                )
              }
              disabled={(currentPage + 1) * perPage >= filteredData.length}
            >
              Next
            </Button>
          </Col>
        </Row>
        <AddAssetTransfer
          isOpen={addModal}
          onClose={() => {
            setAddModal(false);
            queryClient.invalidateQueries({ queryKey: ["assettransfers"] });
          }}
        />
        <AssetTransferViewModal
          isOpen={viewModal}
          toggle={() => setViewModal(false)}
          assetTransfer={selectedAssetTransfer}
        />
        <DeleteAssetTransfer
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          transferId={selectedAssetTransfer?.id ?? null}
          onSuccess={() => setDeleteModal(false)}
        />
        {selectedAssetTransfer && (
          <EditAssetTransfer
            isOpen={editModal}
            onClose={() => setEditModal(false)}
            data={selectedAssetTransfer}
            onSuccess={() => {
              setEditModal(false);
              queryClient.invalidateQueries({ queryKey: ["assettransfers"] });
            }}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default AssetTransferTable;
