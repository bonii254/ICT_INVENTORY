// File: src/components/Dashboard/Widgets.tsx

import React from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { Card, CardBody, Col } from "reactstrap";
import { ecomWidgets } from "../../common/data";
import { useApiGet } from "../../helpers/api_helper";

const Widgets = () => {
  const { data: inventoryCounts, isLoading } = useApiGet<any>(
    ["inventoryCounts"],
    "/count/assets",
    {},
    true,
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    },
  );

  const getCounterValue = (id: number): number => {
    if (isLoading || !inventoryCounts) return 0;
    switch (id) {
      case 1:
        return inventoryCounts.totalAssets;
      case 2:
        return inventoryCounts.totalConsumables;
      case 3:
        return inventoryCounts.totalSoftware;
      case 4:
        return (
          inventoryCounts.totalAssets +
          inventoryCounts.totalConsumables +
          inventoryCounts.totalSoftware
        );
      default:
        return 0;
    }
  };

  return (
    <>
      {ecomWidgets.map((item, key) => (
        <Col xl={3} md={6} key={key}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    {item.label}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={`fs-14 mb-0 text-${item.badgeClass}`}>
                    {item.badge && (
                      <i className={`fs-13 align-middle ${item.badge}`}></i>
                    )}{" "}
                    {item.percentage}
                  </h5>
                </div>
              </div>

              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-20 fw-semibold ff-secondary mb-4">
                    <CountUp
                      start={0}
                      end={getCounterValue(item.id)}
                      duration={4}
                      decimals={item.decimals}
                      prefix={item.prefix}
                      suffix={item.suffix}
                      separator={item.separator}
                    />
                  </h4>
                  {item.link && item.linkPath && (
                    <Link
                      to={item.linkPath}
                      className="text-decoration-underline"
                    >
                      {item.link}
                    </Link>
                  )}
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={`avatar-title rounded fs-3 bg-${item.bgcolor}-subtle`}
                  >
                    <i className={`text-${item.bgcolor} ${item.icon}`}></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </>
  );
};

export default Widgets;
