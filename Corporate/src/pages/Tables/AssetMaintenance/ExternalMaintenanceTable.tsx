import React, { useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Input,
  Spinner,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
} from 'reactstrap';
import { Plus, MoreVertical, Printer, Settings } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useApiGet } from '../../../helpers/api_helper';

import AddExternalMaintenanceModal from '../../../Components/Common/Custom/ExternalMaintenance/AddExternalMaintenanceModal';
import AssetMaintenanceViewModal from '../../../Components/Common/Custom/ExternalMaintenance/AssetMaintenanceViewModal';
import UpdateExternalMaintenanceModal from '../../../Components/Common/Custom/ExternalMaintenance/UpdateExternalMaintenanceModal';
import DeleteMaintenanceConfirmModal from '../../../Components/Common/Custom/ExternalMaintenance/DeleteMaintenanceConfirmModal';
import ReturnMaintenanceModal from '../../../Components/Common/Custom/ExternalMaintenance/ReturnMaintenanceModal';

const columnHelper = createColumnHelper<any>();

const highlightMatch = (text: string, filter: string) => {
  if (!filter || !text) return text;
  const regex = new RegExp(`(${filter})`, 'gi');
  return text
    .toString()
    .split(regex)
    .map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ backgroundColor: 'yellow', padding: 0 }}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
};

const AssetMaintenanceTable = () => {
  const queryClient = useQueryClient();
  const [viewModal, setViewModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'asset',
    'provider',
    'maintenance_type',
    'sent_date',
    'expected_return_date',
    'actual_return_date',
    'status',
    'cost_estimate',
    'actual_cost',
  ]);

  const allColumnKeys = [
    'asset',
    'provider',
    'maintenance_type',
    'description',
    'sent_date',
    'expected_return_date',
    'actual_return_date',
    'status',
    'cost_estimate',
    'actual_cost',
    'collected_by',
    'received_by',
  ];

  const { data, isLoading } = useApiGet<any>(['external_maintenance'], '/maintenance', {}, true, {
    refetchInterval: 15000,
  });

  const records = data || [];

  const filteredData = useMemo(() => {
    return records.filter((row: any) => {
      const globalMatch = globalFilter
        ? Object.values(row)
            .map((v) => (typeof v === 'object' && v !== null ? Object.values(v).join(' ') : v))
            .join(' ')
            .toLowerCase()
            .includes(globalFilter.toLowerCase())
        : true;

      const columnMatch = Object.entries(columnFilters).every(
        ([key, value]) =>
          !value ||
          (row[key]
            ? typeof row[key] === 'object'
              ? Object.values(row[key]).join(' ').toLowerCase().includes(value.toLowerCase())
              : row[key].toString().toLowerCase().includes(value.toLowerCase())
            : false),
      );

      return globalMatch && columnMatch;
    });
  }, [records, columnFilters, globalFilter]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, pageIndex, perPage]);

  const pageCount = Math.ceil(filteredData.length / perPage);

  const columns: ColumnDef<any, any>[] = useMemo(() => {
    const baseColumns: ColumnDef<any, any>[] = allColumnKeys
      .filter((key) => visibleColumns.includes(key))
      .map((key) =>
        columnHelper.accessor(key, {
          header: () => (
            <div>
              <div>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
              <Input
                bsSize="sm"
                placeholder="Filter..."
                value={columnFilters[key] || ''}
                onChange={(e) => setColumnFilters((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ),
          cell: (info) => {
            const value = info.getValue();
            const colId = info.column.id;
            const filter = columnFilters[colId] || globalFilter;

            const formattedValue =
              ['sent_date', 'expected_return_date', 'actual_return_date'].includes(colId) && value
                ? new Date(value).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : value;

            if (colId === 'asset') {
              const asset = value || {};
              const display =
                asset.name || asset.id ? `${asset.name || '-'} - ${asset.serial_no || '-'}` : '-';
              return <span>{highlightMatch(display, filter)}</span>;
            }

            // Leave provider column exactly as it was
            if (colId === 'provider') return <span>{value?.name || '-'}</span>;

            return <span>{highlightMatch(formattedValue || '-', filter)}</span>;
          },
        }),
      );

    baseColumns.push(
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="text-reset">
              <MoreVertical size={16} />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                onClick={() => {
                  setSelectedMaintenance(row.original);
                  setViewModal(true);
                }}
              >
                View
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSelectedMaintenance(row.original);
                  setUpdateModal(true);
                }}
              >
                Update
              </DropdownItem>
              {row.original.status === 'SENT' && (
                <DropdownItem
                  onClick={() => {
                    setSelectedMaintenance(row.original);
                    setReturnModal(true);
                  }}
                >
                  Receive Returned Asset
                </DropdownItem>
              )}
              <DropdownItem
                className="text-danger"
                onClick={() => {
                  setSelectedMaintenance(row.original);
                  setDeleteModal(true);
                }}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      }),
    );

    return baseColumns;
  }, [columnFilters, globalFilter, visibleColumns]);

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

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asset Maintenance');

    worksheet.addRow([...visibleColumns.map((key) => key.replace(/_/g, ' ').toUpperCase())]);

    paginatedData.forEach((record: any) => {
      const row = visibleColumns.map((col) => {
        const val = record[col];
        if (col === 'asset') {
          const asset = val || {};
          return asset.name ? `${asset.name} - ${asset.serial_no}` : '-';
        }
        if (col === 'provider') return val?.name || '-';
        if (['sent_date', 'expected_return_date', 'actual_return_date'].includes(col) && val)
          return new Date(val).toLocaleDateString('en-GB');
        return val || '-';
      });
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'asset_maintenance.xlsx');
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="mb-0">External Asset Maintenance</h5>
          </Col>
          <Col className="d-flex justify-content-end gap-2">
            <UncontrolledDropdown>
              <DropdownToggle color="secondary" caret>
                <Settings size={16} className="me-1" /> Columns
              </DropdownToggle>
              <DropdownMenu>
                {allColumnKeys.map((col) => (
                  <DropdownItem key={col} toggle={false}>
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={visibleColumns.includes(col)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns([...visibleColumns, col]);
                          } else {
                            setVisibleColumns(visibleColumns.filter((c) => c !== col));
                          }
                        }}
                      />{' '}
                      {col.replace(/_/g, ' ').toUpperCase()}
                    </Label>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>

            <Button color="primary" onClick={() => setAddModal(true)}>
              <Plus size={16} className="me-1" /> Add Maintenance
            </Button>
            <Button color="outline-secondary" onClick={exportExcel}>
              <Printer size={14} className="me-1" /> Export
            </Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Input
              bsSize="sm"
              placeholder="Search maintenance..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ width: '30%' }}
            />
          </Col>
        </Row>

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
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted()
                          ? header.column.getIsSorted() === 'asc'
                            ? ' 🔼'
                            : ' 🔽'
                          : ''}
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Row className="mt-3 align-items-center">
          <Col md="6">
            Page {pageIndex + 1} of {pageCount} | Showing {paginatedData.length} of{' '}
            {filteredData.length} records
          </Col>
          <Col md="6" className="text-end">
            <div className="d-flex gap-2 justify-content-end">
              <Button
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPageIndex((prev) => (prev + 1 < pageCount ? prev + 1 : prev))}
                disabled={pageIndex + 1 >= pageCount}
                size="sm"
              >
                Next
              </Button>
            </div>
          </Col>
        </Row>

        {/* Modals */}
        <AddExternalMaintenanceModal
          isOpen={addModal}
          onClose={() => {
            setAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['external_maintenance'] });
          }}
        />

        <AssetMaintenanceViewModal
          isOpen={viewModal}
          toggle={() => setViewModal(false)}
          maintenance={selectedMaintenance}
        />

        <UpdateExternalMaintenanceModal
          isOpen={updateModal}
          onClose={() => setUpdateModal(false)}
          maintenanceId={selectedMaintenance?.id}
          initialData={{
            asset_id: selectedMaintenance?.asset_id,
            provider_id: selectedMaintenance?.provider_id,
            maintenance_type: selectedMaintenance?.maintenance_type,
            description: selectedMaintenance?.description,
            cost_estimate: selectedMaintenance?.cost_estimate,
            actual_cost: selectedMaintenance?.actual_cost,
            expected_return_date: selectedMaintenance?.expected_return_date,
            actual_return_date: selectedMaintenance?.actual_return_date,
            status: selectedMaintenance?.status,
            collected_by: selectedMaintenance?.collected_by,
            received_by: selectedMaintenance?.received_by,
          }}
          onSuccess={() => {
            setUpdateModal(false);
            queryClient.invalidateQueries({ queryKey: ['external_maintenance'] });
          }}
        />

        <ReturnMaintenanceModal
          isOpen={returnModal}
          onClose={() => {
            setReturnModal(false);
            queryClient.invalidateQueries({ queryKey: ['external_maintenance'] });
          }}
          maintenanceId={selectedMaintenance?.id}
          initialCondition={selectedMaintenance?.condition_before}
        />

        <DeleteMaintenanceConfirmModal
          isOpen={deleteModal}
          toggle={() => setDeleteModal(false)}
          maintenance={{
            id: selectedMaintenance?.id ?? 0,
            asset_name: selectedMaintenance?.asset
              ? `${selectedMaintenance.asset.name} - ${selectedMaintenance.asset.serial_no}`
              : '-',
            provider_name: selectedMaintenance?.provider?.name,
          }}
          onDeleteSuccess={() => {
            setDeleteModal(false);
            queryClient.invalidateQueries({ queryKey: ['external_maintenance'] });
          }}
        />
      </CardBody>
    </Card>
  );
};

export default AssetMaintenanceTable;
