import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Button, Card, CardBody, Col, Row, Spinner, Input, FormGroup, Label } from 'reactstrap';

import { useApiGet } from '../../../helpers/api_helper';
import AddConsumableModal from '../../../Components/Common/Custom/Consumable/AddConsumableModal';
import DeleteConsumableModal from '../../../Components/Common/Custom/Consumable/DeleteConsumableModal';
import EditConsumableModal from '../../../Components/Common/Custom/Consumable/EditConsumableModal';
import StockTransactionModal from '../../../Components/Common/Custom/Consumable/StockTransactionModal';
import TransactionsTable from '../../../Components/Common/Custom/Consumable/TransactionsTable';

interface Consumable {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  quantity: number;
  unit_of_measure: string;
  reorder_level: number;
}

interface Location {
  id: number;
  name: string;
}

const columnHelper = createColumnHelper<Consumable>();

const ConsumableTable = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [transactionModal, setTransactionModal] = useState(false);
  const [selected, setSelected] = useState<Consumable | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  
  const { data: locationsData } = useApiGet<Location[]>(
    ['locations'],
    '/locations', 
    {},
    true,
  );

  const { data, isLoading, refetch } = useApiGet<any>(
    ['consumables', selectedLocation],
    selectedLocation ? `/consumables/${selectedLocation}` : '',
    {},
    !!selectedLocation, 
    { refetchInterval: 10000 },
  );

  const consumables: Consumable[] = data?.consumables || [];

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('model', {
        header: 'Model',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('unit_of_measure', {
        header: 'Unit',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('reorder_level', {
        header: 'Reorder Level',
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: 'checkout',
        header: 'Checkout',
        cell: ({ row }) => (
          <Button
            size="sm"
            color="info"
            onClick={() => {
              setSelected(row.original);
              setTransactionModal(true);
            }}
          >
            Transaction
          </Button>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              color="warning"
              onClick={() => {
                setSelected(row.original);
                setEditModal(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              onClick={() => {
                setSelected(row.original);
                setDeleteModal(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      }),
    ];
  }, []);

  const table = useReactTable({
    data: consumables,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <Card>
        <CardBody>
          <Row className="mb-3 align-items-center">
            <Col xs="12" md="4">
              <FormGroup>
                <Label for="locationSelect">Select Location</Label>
                <Input
                  id="locationSelect"
                  type="select"
                  value={selectedLocation ?? ''}
                  onChange={(e) => setSelectedLocation(Number(e.target.value))}
                >
                  <option value="">-- Choose Location --</option>
                  {locationsData?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>

            <Col className="text-end d-flex justify-content-end gap-2">
              <Button
                color="secondary"
                disabled={!selectedLocation}
                onClick={() => setShowTransactions(!showTransactions)}
              >
                {showTransactions ? 'Hide Transactions' : 'View Transactions'}
              </Button>
              <Button
                color="primary"
                disabled={!selectedLocation}
                onClick={() => setAddModal(true)}
              >
                + Add
              </Button>
            </Col>
          </Row>

          {!selectedLocation ? (
            <div className="text-center text-muted py-5">
              Please select a location to view consumables.
            </div>
          ) : isLoading ? (
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
                        <th key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
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

          <AddConsumableModal isOpen={addModal} onClose={() => setAddModal(false)} />

          <EditConsumableModal
            isOpen={editModal}
            toggle={() => setEditModal(false)}
            consumable={selected}
          />

          <DeleteConsumableModal
            isOpen={deleteModal}
            toggle={() => setDeleteModal(false)}
            consumable={selected}
          />

          {selected && (
            <StockTransactionModal
              isOpen={transactionModal}
              toggle={() => setTransactionModal(false)}
              consumable={selected}
              onSuccess={() => {
                refetch();
                setTransactionModal(false);
              }}
            />
          )}
        </CardBody>
      </Card>

      {/* ✅ Conditionally render Transactions Table for same location */}
      {showTransactions && selectedLocation && (
        <div className="mt-4">
          <TransactionsTable locationId={selectedLocation} />
        </div>
      )}
    </>
  );
};

export default ConsumableTable;
