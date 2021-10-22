import AdminOnly from "@/components/auth/AdminOnly";
import BreadCrumb from "@/components/BreadCrumb";
import PeriodsTable from "@/components/periods/Table";
import { useAuthRecoilValue } from "@/store/api";
import { AllPeriodsQuery } from "@/store/periods";
import { formatDate } from "@/utils/date";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { compareDesc } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";

const ActivePeriodMessage = () => {
  const allPeriods = useAuthRecoilValue(AllPeriodsQuery({}));

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return <div>There is no active quantification period.</div>;

  const exists =
    compareDesc(
      new Date(),
      new Date(allPeriods[allPeriods.length - 1].endDate)
    ) >= 0;

  if (!exists) return <div>There is no active quantification period.</div>;

  return (
    <div>
      Current quantification period ends at {formatDate(allPeriods[0].endDate)}
    </div>
  );
};

const PeriodsPage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <AdminOnly>
          <div className="mb-2 text-right">
            <Link to="/periods/createupdate">
              <button className="praise-button">Create period</button>
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
