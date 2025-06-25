import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useApiGet } from "../../helpers/api_helper";

const COLORS = [
  "#556ee6",
  "#34c38f",
  "#f46a6a",
  "#f1b44c",
  "#50a5f1",
  "#ff6f61",
  "#6f42c1",
  "#e83e8c",
  "#20c997",
  "#343a40",
];

interface Consumable {
  name: string;
  quantity: number;
}

interface ChartData {
  name: string;
  value: number;
}

const ConsumableQuantityPie = () => {
  const { data, isLoading, isError } = useApiGet<{ consumables: Consumable[] }>(
    ["consumables"],
    "consumables",
  );

  const consumables: Consumable[] = data?.consumables || [];

  const chartData: ChartData[] = consumables
    .map(
      (item: Consumable): ChartData => ({
        name: item.name,
        value: item.quantity,
      }),
    )
    .filter((item: ChartData) => item.value > 0);

  return (
    <Col xl={4}>
      <Card className="card-height-100">
        <CardHeader className="align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">
            Consumable Quantity Distribution
          </h4>
          <div className="flex-shrink-0">
            <UncontrolledDropdown className="card-header-dropdown">
              <DropdownToggle
                tag="a"
                className="text-reset dropdown-btn"
                role="button"
              >
                <span className="text-muted">
                  Options <i className="mdi mdi-chevron-down ms-1"></i>
                </span>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end" end>
                <DropdownItem>Download Report</DropdownItem>
                <DropdownItem>Export</DropdownItem>
                <DropdownItem>Import</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p>Failed to load consumables.</p>
          ) : chartData.length === 0 ? (
            <p className="text-muted text-center">
              No consumable quantities available.
            </p>
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry: ChartData, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default ConsumableQuantityPie;
