import React, { useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getSortedRowModel, createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
} from 'reactstrap';
import { Plus, Printer, MoreVertical, Sliders } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import companylogo from '../../../assets/images/Logo1.jpg';
import { useApiGet } from '../../../helpers/api_helper';

import AddAssetTransfer from '../../../Components/Common/Custom/AssetTransfer/AddAssetTransferModal';
import AssetTransferViewModal from '../../../Components/Common/Custom/AssetTransfer/ViewAssetTransferModal';
import DeleteAssetTransfer from '../../../Components/Common/Custom/AssetTransfer/DeleteAssetTransferModal';
import EditAssetTransfer from '../../../Components/Common/Custom/AssetTransfer/EditAssetTransferModal';

const columnHelper = createColumnHelper<any>();

const highlightMatch = (text: string, filter: string) => {
  if (!filter || !text) return text;
  const regex = new RegExp(`(${filter})`, 'gi');
  return text
    .toString()
    .split(regex)
    .map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ backgroundColor: 'yellow', padding: 0 }}>{part}</mark> : part
    );
};

const AssetTransferTable = () => {
  const queryClient = useQueryClient();

  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumnModal, setShowColumnModal] = useState(false);

  const allColumnKeys = [
    'asset_name',
    'asset_serial',
    'transferred_from',
    'from_payroll',
    'transferred_to',
    'to_payroll',
    'from_location', 
    'to_location',
    'notes',
    'created_at',
    'updated_at',
  ];

  const defaultHiddenColumns = ['notes', 'created_at', 'updated_at'];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('visibleColumns');
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(defaultHiddenColumns.map((c) => [c, false]));
  });

  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const { data, isLoading } = useApiGet<any>(
    ['assettransfers'],
    '/assettransfers',
    {},
    true,
    { refetchInterval: 10000 }
  );

  useEffect(() => {
    setPageIndex(0);
  }, [columnFilters, globalFilter]);

  const toggleSelectRow = (id: number) => setSelectedRows(prev => ({ ...prev, [id]: !prev[id] }));
  const isAllSelected = data?.asset_transfers?.every((t: any) => selectedRows[t.id]);
  const toggleSelectAll = () => {
    if (!data?.asset_transfers) return;
    if (isAllSelected) {
      const cleared = { ...selectedRows };
      data.asset_transfers.forEach((t: any) => delete cleared[t.id]);
      setSelectedRows(cleared);
    } else {
      const updated = { ...selectedRows };
      data.asset_transfers.forEach((t: any) => (updated[t.id] = true));
      setSelectedRows(updated);
    }
  };

  const filteredData = useMemo(() => {
    if (!data?.asset_transfers) return [];
    return data.asset_transfers.filter((row: any) => {
      const globalMatch = globalFilter
        ? Object.values(row)
            .join(' ')
            .toLowerCase()
            .includes(globalFilter.toLowerCase())
        : true;

      const columnMatch = Object.entries(columnFilters).every(([key, value]) =>
        !value ? true : (row[key] ?? '').toString().toLowerCase().includes(value.toLowerCase())
      );

      return globalMatch && columnMatch;
    });
  }, [data, columnFilters, globalFilter]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, pageIndex, perPage]);

  const pageCount = Math.ceil(filteredData.length / perPage);

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: 'select',
        header: () => <Input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />,
        cell: ({ row }) => (
          <Input type="checkbox" checked={!!selectedRows[row.original.id]} onChange={() => toggleSelectRow(row.original.id)} />
        ),
      }),
      ...allColumnKeys.filter(key => visibleColumns[key] !== false).map(key =>
        columnHelper.accessor(key, {
          header: () => (
            <div>
              <div>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
              <Input
                bsSize="sm"
                placeholder="Filter..."
                value={columnFilters[key] || ''}
                onChange={(e) => setColumnFilters(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ),
          cell: (info) => {
            const value = info.getValue();
            const filter = columnFilters[info.column.id] || globalFilter;
            return <span>{highlightMatch(value, filter)}</span>;
          },
        })
      ),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="text-reset">
              <MoreVertical size={16} />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => { setSelectedTransfer(row.original); setViewModal(true); }}>View</DropdownItem>
              <DropdownItem onClick={() => { setSelectedTransfer(row.original); setEditModal(true); }}>Edit</DropdownItem>
              <DropdownItem className="text-danger" onClick={() => { setSelectedTransfer(row.original); setDeleteModal(true); }}>Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      }),
    ];
    return baseColumns;
  }, [selectedRows, isAllSelected, columnFilters, visibleColumns, globalFilter]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount,
  });

  const ColumnToggleModal = () => {
    return (
      <Modal isOpen={showColumnModal} toggle={() => setShowColumnModal(false)}>
        <ModalHeader toggle={() => setShowColumnModal(false)}>Select Columns</ModalHeader>
        <ModalBody>
          {allColumnKeys.map((key) => (
            <FormGroup check key={key} className="mb-2">
              <Input
                type="checkbox"
                checked={visibleColumns[key] !== false}
                onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                id={`col-${key}`}
              />
              <Label for={`col-${key}`} check style={{ marginLeft: '0.5rem' }}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Label>
            </FormGroup>
          ))}
        </ModalBody>
      </Modal>
    );
  };
  const exportExcel = async () => {
    if (!data?.asset_transfers) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asset Transfers');

    try {
      const response = await fetch(companylogo);
      const logoBuffer = await response.arrayBuffer();
      const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
      worksheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 80, height: 40 } });

      worksheet.mergeCells('B1:F3');
      const cell = worksheet.getCell('B1');
      cell.value = 'Githunguri Dairy Farmers Cooperative Society';
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.font = { size: 14, bold: true };
    } catch (err) {
      console.warn('⚠️ Failed to load logo:', err);
    }

    const exportableCols = columns.filter(col => col.id !== 'actions' && col.id !== 'select');
    const headers = exportableCols.map(col => {
      if (typeof col.header === 'string') return col.header;
      if ('accessorKey' in col && col.accessorKey) {
        return String(col.accessorKey).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return String(col.id);
    });

    worksheet.addRow(headers);
    const headerRow = worksheet.lastRow;
    if (headerRow) {
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
      });
    }

    data.asset_transfers.forEach((row: any) => {
      const rowData = exportableCols.map(col => {
        const key = (col as any).accessorKey || col.id;
        return row[key] ?? '';
      });
      worksheet.addRow(rowData);
    });

    worksheet.columns?.forEach(col => {
      let maxLength = 10;
      col.eachCell?.({ includeEmpty: true }, cell => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLength) maxLength = len;
      });
      col.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'asset_transfers.xlsx');
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col><h5 className="mb-0">Asset Transfers</h5></Col>
          <Col className="text-end d-flex gap-2 justify-content-end">
            <Button color="primary" onClick={() => setAddModal(true)}><Plus size={16} className="me-1" /> Add</Button>
            <Button color="secondary" onClick={() => setShowColumnModal(true)}><Sliders size={16} className="me-1" /> Columns</Button>
            <Button color="outline-secondary" onClick={exportExcel}><Printer size={14} className="me-1" /> Export Excel</Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Input
              bsSize="sm"
              placeholder="Search asset transfers..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ width: '30%' }}
            />
          </Col>
        </Row>

        <div className="table-responsive">
          {isLoading ? (
            <div className="text-center p-5"><Spinner color="primary" /></div>
          ) : (
            <table className="table table-centered table-nowrap">
              <thead className="table-light">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽') : ''}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.original.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Row className="mt-3 align-items-center">
          <Col md="6">Page {pageIndex + 1} of {pageCount} | Showing {paginatedData.length} of {filteredData.length}</Col>
          <Col md="6" className="text-end">
            <div className="d-flex gap-2 justify-content-end">
              <Button onClick={() => setPageIndex(prev => Math.max(prev - 1, 0))} disabled={pageIndex === 0} size="sm">Previous</Button>
              <Button onClick={() => setPageIndex(prev => (prev + 1 < pageCount ? prev + 1 : prev))} disabled={pageIndex + 1 >= pageCount} size="sm">Next</Button>
            </div>
          </Col>
        </Row>

        {/* Modals */}
        <AddAssetTransfer isOpen={addModal} onClose={() => { setAddModal(false); queryClient.invalidateQueries({ queryKey: ['assettransfers'] }); }} />
        <AssetTransferViewModal isOpen={viewModal} toggle={() => setViewModal(false)} assetTransfer={selectedTransfer} />
        <DeleteAssetTransfer isOpen={deleteModal} onClose={() => setDeleteModal(false)} transferId={selectedTransfer?.id ?? null} onSuccess={() => setDeleteModal(false)} />
        {selectedTransfer && <EditAssetTransfer isOpen={editModal} onClose={() => setEditModal(false)} data={selectedTransfer} onSuccess={() => { setEditModal(false); queryClient.invalidateQueries({ queryKey: ['assettransfers'] }); }} />}

        {/* Column toggle modal */}
        <ColumnToggleModal />
      </CardBody>
    </Card>
  );
};

export default AssetTransferTable;