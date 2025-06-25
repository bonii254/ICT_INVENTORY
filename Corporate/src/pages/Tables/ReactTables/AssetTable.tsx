// File: src/pages/Assets/AssetTable.tsx
import React, { useMemo, useState } from "react";
import AssetViewModal from "../../../Components/Common/Assets/AssetViewModel";
import DeleteConfirmModal from "../../../Components/Common/Assets/DeleteConfirmModal";
import AddAssetModal from "../../../Components/Common/AssetForm";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
import type { SortingState } from "@tanstack/react-table";

const columnHelper = createColumnHelper<any>();

const AssetTable = () => {
  const queryClient = useQueryClient();
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {},
  );
  const [showColumnModal, setShowColumnModal] = useState(false);

  const { data, isLoading } = useApiGet<any>(
    ["assets", pageIndex, perPage],
    `/assets/search?page=${pageIndex + 1}&per_page=${perPage}`,
    {},
    true,
    { refetchInterval: 10000 },
  );

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllSelected = data?.assets?.every(
    (asset: any) => selectedRows[asset.id],
  );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const cleared = { ...selectedRows };
      data.assets.forEach((asset: any) => delete cleared[asset.id]);
      setSelectedRows(cleared);
    } else {
      const updated = { ...selectedRows };
      data.assets.forEach((asset: any) => (updated[asset.id] = true));
      setSelectedRows(updated);
    }
  };

  const allColumnKeys = [
    "name",
    "asset tag",
    "serial_number",
    "model",
    "category",
    "assigned_to",
    "location",
    "department",
    "status",
    "purchase_date",
    "warranty_expiry",
    "configuration",
  ];

  const columns = useMemo(() => {
    const baseColumns = [
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
                  setSelectedAsset(row.original);
                  setViewModal(true);
                }}
              >
                View
              </DropdownItem>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem
                className="text-danger"
                onClick={() => {
                  setSelectedAsset(row.original);
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
    return baseColumns;
  }, [selectedRows, isAllSelected, columnFilters, visibleColumns]);

  const filteredData = useMemo(() => {
    if (!data?.assets) return [];
    return data.assets.filter((row: any) => {
      return Object.entries(columnFilters).every(([key, value]) => {
        return row[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, columnFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.pages || 1,
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

    doc.save("assets.pdf");
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="mb-0">Assets</h5>
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
              filename="assets.csv"
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
          <>
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

            <Row className="mt-3 align-items-center">
              <Col md="6">
                <div>
                  Page {pageIndex + 1} of {data?.pages || 1} | Showing{" "}
                  {filteredData?.length || 0} of {data?.total || 0} assets
                </div>
              </Col>
              <Col md="6" className="text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    onClick={() =>
                      setPageIndex((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={pageIndex === 0}
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setPageIndex((prev) =>
                        prev + 1 < (data?.pages || 1) ? prev + 1 : prev,
                      )
                    }
                    disabled={pageIndex + 1 >= (data?.pages || 1)}
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        )}
        <AssetViewModal
          isOpen={viewModal}
          toggle={() => setViewModal(false)}
          asset={selectedAsset}
        />

        <DeleteConfirmModal
          isOpen={deleteModal}
          toggle={() => setDeleteModal(false)}
          asset={selectedAsset}
          onDeleteSuccess={() => {
            setDeleteModal(false);
          }}
        />
        <AddAssetModal
          isOpen={addModal}
          onClose={() => {
            setAddModal(false);
            queryClient.invalidateQueries({ queryKey: ["assets"] });
          }}
        />
      </CardBody>
    </Card>
  );
};

export default AssetTable;
