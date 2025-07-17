import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useGetAssets, Asset } from "../../hooks/useAssets"; // use correct shared type

const RecentAssets: React.FC = () => {
  const { data: assetData, isLoading } = useGetAssets();

  const recentAssets: Asset[] = (assetData?.assets || [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const columns: ColumnDef<Asset, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => {
        const value = info.getValue() as string;
        return (
          <span
            className="text-truncate d-inline-block"
            style={{ maxWidth: 180 }}
            title={value}
          >
            {value || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "serial_number",
      header: "Serial Number",
      cell: (info) => info.getValue() || "—",
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: (info) => info.getValue() || "—",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info) => info.getValue() || "—",
    },
    {
      accessorKey: "assigned_to",
      header: "Assigned To",
      cell: (info) => info.getValue() || "—",
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: (info) => info.getValue() || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => info.getValue() || "—",
    },
  ];

  const table = useReactTable({
    data: recentAssets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="h-100 border-0 shadow-sm">
      <CardHeader className="bg-light border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🆕 Recently Added Assets</h5>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover table-bordered mb-0">
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
        )}
      </CardBody>
    </Card>
  );
};

export default RecentAssets;
