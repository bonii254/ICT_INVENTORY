// File: src/pages/Assets/AssetTable.tsx
import React, { useMemo, useState, useEffect } from "react";
import AssetViewModal from "../../../Components/Common/Assets/AssetViewModel";
import DeleteConfirmModal from "../../../Components/Common/Assets/DeleteConfirmModal";
import AddAssetModal from "../../../Components/Common/AssetForm";
import EditAssetModal from "Components/Common/Custom/Asset/EditAssetModal";
import companylogo from "../../../assets/images/Logo1.jpg";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
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
import { Plus, Printer, MoreVertical, Sliders } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useApiGet } from "../../../helpers/api_helper";
import type { SortingState } from "@tanstack/react-table";

const columnHelper = createColumnHelper<any>();

// highlight helper
const highlightMatch = (text: string, filter: string) => {
  if (!filter || !text) return text;
  const regex = new RegExp(`(${filter})`, "gi");
  return text
    .toString()
    .split(regex)
    .map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
};

const AssetTable = () => {
  const queryClient = useQueryClient();
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [showColumnModal, setShowColumnModal] = useState(false);

  // Define all possible columns
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

  // Define which should be hidden by default
  const defaultHiddenColumns = [
    "asset_tag",
    "status",
    "purchase_date",
    "warranty_expiry",
    "configuration",
  ];

  // Persist column visibility in localStorage
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("visibleColumns");
      if (saved) return JSON.parse(saved);
      return Object.fromEntries(defaultHiddenColumns.map((c) => [c, false]));
    },
  );

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const { data, isLoading } = useApiGet<any>(
    ["assets"],
    `/assets/search?all=true`, // fetch full dataset
    {},
    true,
    { refetchInterval: 10000 },
  );

  // Reset to first page whenever filters or global search change
  useEffect(() => {
    setPageIndex(0);
  }, [columnFilters, globalFilter]);

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

  // Filtered + repaginated data
  const filteredData = useMemo(() => {
    if (!data?.assets) return [];

    return data.assets.filter((row: any) => {
      // global filter across all fields
      const globalMatch = globalFilter
        ? Object.values(row)
            .join(" ")
            .toLowerCase()
            .includes(globalFilter.toLowerCase())
        : true;

      // per-column filters
      const columnMatch = Object.entries(columnFilters).every(
        ([key, value]) =>
          !value ||
          row[key]?.toString().toLowerCase().includes(value.toLowerCase()),
      );

      return globalMatch && columnMatch;
    });
  }, [data, columnFilters, globalFilter]);

  // Manual pagination on filtered data
  const paginatedData = useMemo(() => {
    const start = pageIndex * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, pageIndex, perPage]);

  const pageCount = Math.ceil(filteredData.length / perPage);

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
            cell: (info) => {
              const value = info.getValue();
              const colId = info.column.id;
              const filter = columnFilters[colId] || globalFilter;
              return <span>{highlightMatch(value, filter)}</span>;
            },
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
              <DropdownItem
                className="text-danger"
                onClick={() => {
                  setSelectedAsset(row.original);
                  setEditModal(true);
                }}
              >
                Edit
              </DropdownItem>
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
  }, [
    selectedRows,
    isAllSelected,
    columnFilters,
    visibleColumns,
    globalFilter,
  ]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
  });

  // ✅ Export current filtered data to Excel
  // ✅ Export current filtered data to Excel
  // ✅ Export current filtered data to Excel with logo + company name
  // ✅ Export current filtered data to Excel with logo + company name
  // ✅ Export current filtered data to Excel with logo + company name
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assets");

    // ===== 1. Insert Logo (only col A) =====
    try {
      const response = await fetch(companylogo);
      const logoBuffer = await response.arrayBuffer();

      const imageId = workbook.addImage({
        buffer: logoBuffer,
        extension: "png",
      });

      worksheet.mergeCells("A1:A3"); // logo in col A
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 80, height: 40 },
      });
    } catch (err) {
      console.warn("⚠️ Failed to load logo:", err);
    }

    // ===== 2. Prepare Headers =====
    const exportableCols = columns.filter(
      (col: any) => col.id !== "actions" && col.id !== "select",
    );

    const headers = exportableCols.map((col: any) => {
      if (typeof col.header === "string" && col.header.trim() !== "") {
        return col.header;
      }
      const id = col.accessorKey || col.id || "";
      return id
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str: string) => str.toUpperCase());
    });

    // ===== 3. Company Name (dynamic merge) =====
    const lastColLetter = worksheet.getColumn(headers.length + 1).letter;
    // +1 because col A is logo, headers start from col B
    worksheet.mergeCells(`B1:${lastColLetter}3`);

    const companyCell = worksheet.getCell("B1");
    companyCell.value = "GITHUNGURI DAIRY FARMERS COOPERATIVE SOCIETY";
    companyCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    companyCell.font = { size: 18, bold: true };
    companyCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" },
    };
    companyCell.border = { bottom: { style: "thin" } };

    worksheet.addRow([]);

    // ===== 4. Table Headers =====
    worksheet.addRow(headers);

    const headerRow = worksheet.lastRow;
    if (headerRow) {
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDDDDD" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      worksheet.views = [{ state: "frozen", ySplit: headerRow.number }];
    }

    // ===== 5. Data Rows =====
    if (filteredData && filteredData.length > 0) {
      filteredData.forEach((row: any) => {
        const rowData = exportableCols.map((col: any) => {
          const key = col.accessorKey || col.id;
          const val = row[key];
          return val !== undefined && val !== null ? val : "";
        });
        worksheet.addRow(rowData);
      });
    } else {
      worksheet.addRow(["⚠️ No data available"]);
    }

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // ===== 6. Auto-fit columns (capped) =====
    worksheet.columns?.forEach((col) => {
      let maxLength = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLength) maxLength = len;
      });
      col.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    // ===== 7. Save File =====
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "assets.xlsx");
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="mb-0">Assets</h5>
          </Col>
          <Col className="d-flex justify-content-end gap-2">
            <Button color="primary" onClick={() => setAddModal(true)}>
              <Plus size={16} className="me-1" /> Add
            </Button>
            <Button color="secondary" onClick={() => setShowColumnModal(true)}>
              <Sliders size={16} className="me-1" /> Columns
            </Button>
            <Button color="outline-secondary" onClick={exportExcel}>
              <Printer size={14} className="me-1" /> Export Excel
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Input
              bsSize="sm"
              placeholder="Search assets..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ width: "30%" }}
            />
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
                  Page {pageIndex + 1} of {pageCount} | Showing{" "}
                  {paginatedData.length} of {filteredData.length} filtered
                  assets
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
                        prev + 1 < pageCount ? prev + 1 : prev,
                      )
                    }
                    disabled={pageIndex + 1 >= pageCount}
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

        <EditAssetModal
          isOpen={editModal}
          toggle={() => setEditModal(false)}
          asset={selectedAsset}
          onEditSuccess={() => {
            setEditModal(false);
            queryClient.invalidateQueries({ queryKey: ["assets"] });
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
