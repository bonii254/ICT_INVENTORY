// File: src/pages/Assets/AssetTable.tsx
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useApiGet } from "../../helpers/api_helper";
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
} from "reactstrap";
import { Plus, Save, FileText, Printer, MoreVertical } from "lucide-react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const columnHelper = createColumnHelper<any>();

const AssetTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading } = useApiGet<any>(
    ["assets"],
    "/assets/search",
    {},
    true,
    {
      refetchInterval: 10000,
    },
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("asset_tag", { header: "Asset Tag" }),
      columnHelper.accessor("serial_number", { header: "Serial Number" }),
      columnHelper.accessor("model_number", { header: "Model Number" }),
      columnHelper.accessor("category.name", { header: "Category" }),
      columnHelper.accessor("assigned_to.fullname", { header: "Assigned To" }),
      columnHelper.accessor("location.name", { header: "Location" }),
      columnHelper.accessor("department.name", { header: "Department" }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="text-reset">
              <MoreVertical size={16} />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>View</DropdownItem>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem className="text-danger">Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.assets || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    const headers = columns
      .filter((col) => col.id !== "actions")
      .map((col) => (typeof col.header === "string" ? col.header : ""));
    const body = table.getRowModel().rows.map((row) =>
      row
        .getVisibleCells()
        .slice(0, -1)
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
            <Button color="primary">
              <Plus size={16} className="me-1" /> Add
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
          </Col>
          <Col md="6" className="text-end">
            <div className="d-flex gap-2 justify-content-end">
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                size="sm"
              >
                Next
              </Button>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default AssetTable;
