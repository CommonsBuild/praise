import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  AllPeriods,
  SinglePeriod,
  useAssignQuantifiers,
  useClosePeriod,
  useExportPraise,
} from '@/model/periods';
import { formatDate } from '@/utils/date';
import { getPreviousPeriod } from '@/utils/periods';
import {
  faDownload,
  faTimesCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import 'react-day-picker/lib/style.css';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PeriodAssignDialog from './AssignDialog';
import PeriodCloseDialog from './CloseDialog';
import PeriodDateForm from './PeriodDateForm';

const PeriodDetails = () => {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  const allPeriods = useRecoilValue(AllPeriods);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { exportPraise } = useExportPraise();

  const assignDialogRef = React.useRef(null);
  const closeDialogRef = React.useRef(null);

  const { closePeriod } = useClosePeriod();
  const { assignQuantifiers } = useAssignQuantifiers();

  if (!period || !allPeriods) return null;

  const periodStartDate = getPreviousPeriod(allPeriods, period);
  const periodStart = periodStartDate
    ? formatDate(periodStartDate.endDate)
    : 'Dawn of time';

  const handleClosePeriod = () => {
    void closePeriod(periodId);
  };

  const handleAssign = () => {
    const promise = assignQuantifiers(periodId);
    void toast.promise(promise, {
      loading: 'Assigning quantifiers …',
      success: 'Quantifiers assigned',
      error: 'Assign failed',
    });
  };

  const handleExport = () => {
    void exportPraise(period);
  };

  if (!period) return <div>Period not found.</div>;

  return (
    <div>
      <div>Period start: {periodStart}</div>
      {!isAdmin ? (
        <div>Period end: {formatDate(period.endDate)}</div>
      ) : (
        <>
          <PeriodDateForm />
          <div className="mt-5">
            {period.status === 'OPEN' ? (
              <button
                className="praise-button"
                onClick={() => {
                  setIsAssignDialogOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faUsers} size="1x" className="mr-2" />
                Assign quantifiers
              </button>
            ) : null}
            {period.status === 'QUANTIFY' ? (
              <div className="flex justify-between">
                <button
                  className="hover:bg-red-600 praise-button"
                  onClick={() => setIsCloseDialogOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="1x"
                    className="mr-2"
                  />
                  Close period
                </button>
              </div>
            ) : null}
            {period.status === 'CLOSED' ? (
              <button className="praise-button" onClick={handleExport}>
                <FontAwesomeIcon icon={faDownload} size="1x" className="mr-2" />
                Export
              </button>
            ) : null}
          </div>
        </>
      )}

      <Dialog
        open={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={closeDialogRef}
      >
        <div ref={closeDialogRef}>
          <PeriodCloseDialog
            onClose={() => setIsCloseDialogOpen(false)}
            onRemove={() => handleClosePeriod()}
          />
        </div>
      </Dialog>

      {period.status === 'OPEN' && isAdmin ? (
        <Dialog
          open={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={assignDialogRef}
        >
          <div ref={assignDialogRef}>
            <PeriodAssignDialog
              onClose={() => setIsAssignDialogOpen(false)}
              onAssign={() => handleAssign()}
            />
          </div>
        </Dialog>
      ) : null}
    </div>
  );
};

export default PeriodDetails;
