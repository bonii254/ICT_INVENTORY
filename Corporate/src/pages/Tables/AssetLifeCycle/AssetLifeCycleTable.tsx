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
import { Plus, MoreVertical, FileText, Settings } from 'lucide-react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Correct import
import { useApiGet } from '../../../helpers/api_helper';

import AddAssetLifecycleModal from '../../../Components/Common/Custom/AssetLifeCycle/AddAssetLifecycleModal';
import EditAssetLifecycleModal from '../../../Components/Common/Custom/AssetLifeCycle/EditAssetLifecycleModal';
import DeleteAssetLifecycleModal from '../../../Components/Common/Custom/AssetLifeCycle/DeleteModal';
import AssetLifecycleViewModal from '../../../Components/Common/Custom/AssetLifeCycle/AssetLifecycleViewModal';

const columnHelper = createColumnHelper<any>();

// 🔍 Highlight search matches
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
      )
    );
};

const AssetLifecycleTable = () => {
  const queryClient = useQueryClient();
  const [viewModal, setViewModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'asset',
    'event',
    'notes',
    'created_at',
    'updated_at',
  ]);

  const allColumnKeys = ['asset', 'event', 'notes', 'created_at', 'updated_at'];

  const { data, isLoading } = useApiGet<any>(
    ['asset_lifecycle'],
    '/asset-lifecycles',
    {},
    true,
    { refetchInterval: 15000 }
  );

  const records = data || [];

  // 🧮 Filtering
  const filteredData = useMemo(() => {
    return records.filter((row: any) => {
      const globalMatch = globalFilter
        ? Object.values(row)
            .map((v) =>
              typeof v === 'object' && v !== null ? Object.values(v).join(' ') : v
            )
            .join(' ')
            .toLowerCase()
            .includes(globalFilter.toLowerCase())
        : true;

      const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const val = row[key];
        return val
          ? typeof val === 'object'
            ? Object.values(val)
                .join(' ')
                .toLowerCase()
                .includes(value.toLowerCase())
            : val.toString().toLowerCase().includes(value.toLowerCase())
          : false;
      });

      return globalMatch && columnMatch;
    });
  }, [records, columnFilters, globalFilter]);

  // 🧾 Pagination
  const paginatedData = useMemo(() => {
    const start = pageIndex * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, pageIndex, perPage]);

  const pageCount = Math.ceil(filteredData.length / perPage);

  // 🧱 Columns
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

            if (colId === 'asset') {
              const asset = value || {};
              const display =
                asset.name || asset.id
                  ? `${asset.name || '-'} - ${asset.serial_no || '-'}` 
                  : '-';
              return <span>{highlightMatch(display, filter)}</span>;
            }

            if (['created_at', 'updated_at'].includes(colId) && value) {
              const formatted = new Date(value).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return <span>{highlightMatch(formatted, filter)}</span>;
            }

            return <span>{highlightMatch(value || '-', filter)}</span>;
          },
        })
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
                  setSelectedEvent(row.original);
                  setViewModal(true);
                }}
              >
                View
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSelectedEvent(row.original);
                  setEditModal(true);
                }}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                className="text-danger"
                onClick={() => {
                  setSelectedEvent(row.original);
                  setDeleteModal(true);
                }}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      })
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

  // 📄 Export PDF (fixed)
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Asset Lifecycle Report', 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 60);

    const headers = visibleColumns.map((col) =>
      col.replace(/_/g, ' ').toUpperCase()
    );

    const dataRows = filteredData.map((rec: any) =>
      visibleColumns.map((col) => {
        const val = rec[col];
        if (col === 'asset') {
          const asset = val || {};
          return asset.name ? `${asset.name} - ${asset.serial_no}` : '-';
        }
        if (['created_at', 'updated_at'].includes(col) && val)
          return new Date(val).toLocaleString('en-GB');
        return val || '-';
      })
    );

    autoTable(doc, {
      head: [headers],
      body: dataRows,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 9, halign: 'left', valign: 'middle' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        doc.setFontSize(9);
        doc.text(
          `Page ${doc.internal.pages.length}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save('asset_lifecycle_report.pdf');
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="mb-0">Asset Lifecycle Events</h5>
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
                            setVisibleColumns(
                              visibleColumns.filter((c) => c !== col)
                            );
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
              <Plus size={16} className="me-1" /> Add Lifecycle Event
            </Button>

            <Button color="outline-secondary" onClick={exportPDF}>
              <FileText size={14} className="me-1" /> Export PDF
            </Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Input
              bsSize="sm"
              placeholder="Search lifecycle events..."
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
                onClick={() =>
                  setPageIndex((prev) =>
                    prev + 1 < pageCount ? prev + 1 : prev
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

        {/* Modals */}
        <AddAssetLifecycleModal
          isOpen={addModal}
          onClose={() => {
            setAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['asset_lifecycle'] });
          }}
        />

        <EditAssetLifecycleModal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          lifecycle={selectedEvent}
        />

        <AssetLifecycleViewModal
          isOpen={viewModal}
          toggle={() => setViewModal(false)}
          asset={selectedEvent?.asset || null}
          lifecycles={selectedEvent ? [selectedEvent] : []}
        />

        <DeleteAssetLifecycleModal
          isOpen={deleteModal}
          toggle={() => setDeleteModal(false)}
          eventId={selectedEvent?.id || null}
          onSuccess={() => {
            setDeleteModal(false);
            queryClient.invalidateQueries({ queryKey: ['asset_lifecycle'] });
          }}
        />
      </CardBody>
    </Card>
  );
};

export default AssetLifecycleTable;