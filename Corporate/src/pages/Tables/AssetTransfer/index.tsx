import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import AssetTransferTable from "./AssetTransferTable";

const MyAssetTransferTable = () => {
  document.title = "FRESHA AssetTransfer Table";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">AssetTransfer Table</h5>
                </CardHeader>
                <CardBody>
                  <AssetTransferTable />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MyAssetTransferTable;
