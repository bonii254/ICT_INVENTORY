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
} from 'reactstrap';
import { Plus, MoreVertical, Printer } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useApiGet } from '../../../helpers/api_helper';

import AddAssetLoanModal from '../../../Components/Common/Custom/AssetLoans/AddAssetLoanFormModal';
import AssetLoanViewModal from '../../../Components/Common/Custom/AssetLoans/AssetLoanViewModal';
import DeleteAssetLoanConfirmModal from '../../../Components/Common/Custom/AssetLoans/DeleteConfirmModal';
import ReturnAssetModal from '../../../Components/Common/Custom/AssetLoans/ReturnAssetModal';

import companylogo from '../../../assets/images/Logo1.jpg';

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

const AssetLoanTable = () => {
  const queryClient = useQueryClient();
  const [viewModal, setViewModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const allColumnKeys = [
    'asset',
    'borrower',
    'loan_date',
    'expected_return_date',
    'actual_return_date',
    'status',
    'condition_before',
    'condition_after',
    'remarks',
  ];

  const { data, isLoading } = useApiGet<any>(['asset_loans'], '/asset-loans', {}, true, {
    refetchInterval: 15000,
  });

  const loans = data?.asset_loans || [];

  const filteredData = useMemo(() => {
    return loans.filter((row: any) => {
      const globalMatch = globalFilter
        ? Object.values(row).join(' ').toLowerCase().includes(globalFilter.toLowerCase())
        : true;

      const columnMatch = Object.entries(columnFilters).every(
        ([key, value]) =>
          !value || row[key]?.toString().toLowerCase().includes(value.toLowerCase()),
      );

      return globalMatch && columnMatch;
    });
  }, [loans, columnFilters, globalFilter]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, pageIndex, perPage]);

  const pageCount = Math.ceil(filteredData.length / perPage);

  const columns = useMemo(() => {
    const baseColumns = [
      ...allColumnKeys.map((key) =>
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

            // Format date columns
            const formattedValue =
              ['loan_date', 'expected_return_date', 'actual_return_date'].includes(colId) && value
                ? new Date(value).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : value || '-';

            return <span>{highlightMatch(formattedValue, filter)}</span>;
          },
        }),
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
              <DropdownItem
                onClick={() => {
                  setSelectedLoan(row.original);
                  setViewModal(true);
                }}
              >
                View
              </DropdownItem>
              {row.original.status === 'BORROWED' && (
                <DropdownItem
                  onClick={() => {
                    setSelectedLoan(row.original);
                    setReturnModal(true);
                  }}
                >
                  Mark Returned
                </DropdownItem>
              )}
              <DropdownItem
                className="text-danger"
                onClick={() => {
                  setSelectedLoan(row.original);
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
  }, [columnFilters, globalFilter]);

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
    const worksheet = workbook.addWorksheet('Asset Loans');

    worksheet.addRow([
      'Asset',
      'Borrower',
      'Loan Date',
      'Expected Return',
      'Actual Return',
      'Status',
      'Condition Before',
      'Condition After',
      'Remarks',
    ]);

    loans.forEach((loan: any) => {
      worksheet.addRow([
        loan.asset,
        loan.borrower,
        loan.loan_date,
        loan.expected_return_date,
        loan.actual_return_date || '-',
        loan.status,
        loan.condition_before,
        loan.condition_after || '-',
        loan.remarks || '-',
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'asset_loans.xlsx');
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3 align-items-center">
          <Col>
            <h5 className="mb-0">Asset Loans</h5>
          </Col>
          <Col className="d-flex justify-content-end gap-2">
            <Button color="primary" onClick={() => setAddModal(true)}>
              <Plus size={16} className="me-1" /> Add Loan
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
              placeholder="Search loans..."
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

        <Row className="mt-3 align-items-center">
          <Col md="6">
            <div>
              Page {pageIndex + 1} of {pageCount} | Showing {paginatedData.length} of{' '}
              {filteredData.length} loans
            </div>
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
        <AddAssetLoanModal
          isOpen={addModal}
          onClose={() => {
            setAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['asset_loans'] });
          }}
        />

        <AssetLoanViewModal
          isOpen={viewModal}
          toggle={() => setViewModal(false)}
          loan={selectedLoan}
        />

        <ReturnAssetModal
          isOpen={returnModal}
          onClose={() => {
            setReturnModal(false);
            queryClient.invalidateQueries({ queryKey: ['asset_loans'] });
          }}
          assetLoanId={selectedLoan?.id}
          initialCondition={selectedLoan?.condition_before}
        />

        <DeleteAssetLoanConfirmModal
          isOpen={deleteModal}
          toggle={() => setDeleteModal(false)}
          loan={{
            id: selectedLoan?.id ?? 0,
            asset_name: selectedLoan?.asset,
            borrower_name: selectedLoan?.borrower,
          }}
          onDeleteSuccess={() => {
            setDeleteModal(false);
            queryClient.invalidateQueries({ queryKey: ['asset_loans'] });
          }}
        />
      </CardBody>
    </Card>
  );
};

export default AssetLoanTable;
