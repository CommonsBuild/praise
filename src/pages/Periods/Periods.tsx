import AdminOnly from "@/components/auth/AdminOnly";
import BreadCrumb from "@/components/BreadCrumb";
import { ActivePeriodMessage } from "@/components/periods/ActivePeriodMessage";
import { ActiveUserQuantificationsMessage } from "@/components/periods/ActiveUserQuantificationsMessage";
import PeriodsTable from "@/components/periods/Table";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Link } from "react-router-dom";

const PeriodsPage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
          <ActiveUserQuantificationsMessage />
        </React.Suspense>
      </div>

      <div className="w-2/3 praise-box">
        <AdminOnly>
          <div className="mb-2 text-right">
            <Link to="/periods/createupdate">
              <button className="praise-button" id="create-period-button">
                Create period
              </button>
            </Link>
          </div>
        </AdminOnly>
        <React.Suspense fallback="Loading…">
          <PeriodsTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodsPage;
