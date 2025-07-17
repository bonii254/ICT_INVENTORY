import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useUser } from "../../context/UserContext";

const FlatpickrComponent = Flatpickr as unknown as React.ComponentType<any>;

const Section: React.FC = () => {
  const [greeting, setGreeting] = useState("");
  const { data: user } = useUser();

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    if (day === 0) return "Relax, it's Sunday";
    if (day === 6) return "Enjoy your Saturday";
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreeting());
    updateGreeting();

    const now = new Date();
    const msToNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      updateGreeting();
      const interval = setInterval(updateGreeting, 60 * 1000);
      (window as any).greetingInterval = interval;
    }, msToNextMinute);

    return () => {
      clearTimeout(timeout);
      if ((window as any).greetingInterval) {
        clearInterval((window as any).greetingInterval);
      }
    };
  }, []);

  return (
    <Row className="mb-3 pb-1">
      <Col xs={12}>
        <div className="d-flex align-items-lg-center flex-lg-row flex-column">
          <div className="flex-grow-1">
            <h4 className="fs-16 mb-1">
              {greeting}, {user?.fullname || "Guest"}!
            </h4>
            <p className="text-muted mb-0">
              Here's what's happening with our inventory today.
            </p>
          </div>

          <div className="mt-3 mt-lg-0 d-flex align-items-center gap-3">
            <div className="input-group">
              <FlatpickrComponent
                className="form-control border-0 dash-filter-picker shadow"
                options={{
                  mode: "range",
                  dateFormat: "d M, Y",
                  defaultDate: [new Date(), new Date()],
                }}
              />
              <div className="input-group-text bg-primary border-primary text-white">
                <i className="ri-calendar-2-line"></i>
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Section;
