import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
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
    <Card className="card-height-100 w-100 shadow-sm">
      <CardHeader className="align-items-center d-flex justify-content-between">
        <h4 className="card-title mb-0">Assets by Location</h4>
      </CardHeader>

      <CardBody style={{ position: "relative", height: "269px" }}>
        <div
          id="world_map_line_markers"
          className="custom-vector-map"
          style={{ height: "100%", zIndex: 1 }}
        >
          <VectorMap {...world} />
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px",
            overflowY: "auto",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: "8px",
              padding: "8px",
              maxHeight: "100%",
            }}
          >
            {Object.entries(locationCounts).map(([location, count]) => {
              const width = (count / maxCount) * 100;
              return (
                <div key={location}>
                  <p className="mt-3 mb-1">
                    {location} <span className="float-end">{count}</span>
                  </p>
                  <div className="progress mt-1" style={{ height: "6px" }}>
                    <div
                      className="progress-bar progress-bar-striped bg-primary"
                      role="progressbar"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SalesByLocations;
