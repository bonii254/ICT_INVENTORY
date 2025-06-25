import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useGetAssets } from "../../hooks/useAssets";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const AssetCategorySummary = () => {
  const { data: assetData, isLoading } = useGetAssets();

  const categoryCounts = (assetData?.assets || []).reduce(
    (acc: Record<string, number>, asset) => {
      const category = asset.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {},
  );

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  const categoryColumns: ColumnDef<any>[] = [
    { accessorKey: "category", header: "Category" },
    { accessorKey: "count", header: "Asset Count" },
  ];

  const categoryTable = useReactTable({
    data: sortedCategories,
    columns: categoryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="h-100">
      <CardHeader>
        <h5 className="card-title mb-0">Asset Count by Category</h5>
      </CardHeader>
      <CardBody style={{ maxHeight: "400px", overflowY: "auto" }}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-bordered table-hover">
              <thead className="table-light">
                {categoryTable.getHeaderGroups().map((headerGroup) => (
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
                {categoryTable.getRowModel().rows.map((row) => (
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

export default AssetCategorySummary;
