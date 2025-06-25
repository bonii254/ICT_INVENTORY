import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useGetAssets } from "../../hooks/useAssets";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const RecentAssets = () => {
  const { data: assetData, isLoading } = useGetAssets();
  const recentAssets =
    assetData?.assets
      ?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5) || [];

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "serial_number", header: "Serial Number" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "assigned_to", header: "Assigned To" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "status", header: "Status" },
  ];

  const table = useReactTable({
    data: recentAssets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="h-100">
      <CardHeader>
        <h5 className="card-title mb-0">Recently Added Assets</h5>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-bordered table-hover">
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
