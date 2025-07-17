import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
  Input,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { useApiGet } from "../../../../helpers/api_helper";
import DeleteTransactionModal from "./DeleteTransactionModal"; // ✅ import

interface Transaction {
  id: number;
  quantity: number;
  transaction_type: "IN" | "OUT";
  created_at: string;
  user: string | null;
  department: string | null;
  consumable: string | null;
}

interface PaginatedResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const columnHelper = createColumnHelper<Transaction>();

const TransactionsTable = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    fullname: "",
    department_name: "",
    transaction_type: "",
    consumable_name: "",
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useApiGet<PaginatedResponse>(
    ["transactions", page, filters],
    "/transaction/search",
    {
      page,
      per_page: 10,
      ...filters,
    },
    true,
  );

  const transactions = data?.transactions || [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("consumable", {
        header: "Consumable",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("transaction_type", {
        header: "Type",
        cell: (info) => (
          <span
            className={`badge rounded-pill ${
              info.getValue() === "IN" ? "bg-success" : "bg-danger"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("user", {
        header: "User",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: (info) =>
          new Date(info.getValue()).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              color="danger"
              onClick={() => {
                setSelectedId(row.original.id);
                setDeleteModal(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== page) setPage(newPage);
  };

  return (
    <>
      <Card>
        <CardBody>
          <Row className="align-items-center mb-3">
            <Col md={4}>
              <h5 className="mb-0">Stock Transactions</h5>
            </Col>
            <Col md={8}>
              <div className="d-flex gap-2">
                <Input
                  placeholder="User name"
                  value={filters.fullname}
                  onChange={(e) =>
                    handleFilterChange("fullname", e.target.value)
                  }
                />
                <Input
                  placeholder="Department"
                  value={filters.department_name}
                  onChange={(e) =>
                    handleFilterChange("department_name", e.target.value)
                  }
                />
                <Input
                  placeholder="Consumable"
                  value={filters.consumable_name}
                  onChange={(e) =>
                    handleFilterChange("consumable_name", e.target.value)
                  }
                />
                <Input
                  type="select"
                  value={filters.transaction_type}
                  onChange={(e) =>
                    handleFilterChange("transaction_type", e.target.value)
                  }
                >
                  <option value="">All</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </Input>
              </div>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center p-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-nowrap">
                  <thead className="table-light">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
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

              <Pagination className="justify-content-end mt-3">
                {Array.from({ length: data?.pages || 1 }, (_, i) => (
                  <PaginationItem key={i} active={i + 1 === page}>
                    <PaginationLink onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </Pagination>
            </>
          )}
        </CardBody>
      </Card>

      {/* ✅ Delete modal hooked in */}
      <DeleteTransactionModal
        isOpen={deleteModal}
        toggle={() => setDeleteModal(false)}
        transactionId={selectedId}
        onSuccess={() => {
          refetch();
          setDeleteModal(false);
        }}
      />
    </>
  );
};

export default TransactionsTable;
