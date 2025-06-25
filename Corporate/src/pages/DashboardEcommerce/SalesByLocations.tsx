import React from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { VectorMap } from "@south-paw/react-vector-maps";
import world from "../../common/world.svg.json";

import { useGetAssets } from "../../hooks/useAssets";

const SalesByLocations = () => {
  const { data, isLoading, isError } = useGetAssets();

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data?.assets) return <p>Failed to load assets</p>;

  const assetList = data.assets;

  const locationCounts = assetList.reduce(
    (acc, asset) => {
      const loc = asset.location || "Unknown";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const maxCount = Math.max(...Object.values(locationCounts));

  return (
    <React.Fragment>
      <Col xl={4}>
        <Card className="card-height-100">
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Assets by Location</h4>
            <div className="flex-shrink-0">
              <button type="button" className="btn btn-soft-secondary btn-sm">
                Export Report
              </button>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ height: "269px" }} dir="ltr">
              <div id="world_map_line_markers" className="custom-vector-map">
                <VectorMap {...world} />
              </div>
            </div>

            <div className="px-2 py-2 mt-1">
              {Object.entries(locationCounts).map(([location, count]) => {
                const width = (count / maxCount) * 100;
                return (
                  <div key={location}>
                    <p className="mt-3 mb-1">
                      {location} <span className="float-end">{count}</span>
                    </p>
                    <div className="progress mt-2" style={{ height: "6px" }}>
                      <div
                        className="progress-bar progress-bar-striped bg-primary"
                        role="progressbar"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default SalesByLocations;
