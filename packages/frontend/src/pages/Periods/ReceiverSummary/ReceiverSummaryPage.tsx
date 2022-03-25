import BreadCrumb from '@/components/BreadCrumb';
import { PeriodAndReceiverPageParams, SinglePeriod } from '@/model/periods';
import BackLink from '@/navigation/BackLink';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import {
  PeriodDetailsDto,
  PeriodDetailsReceiverDto,
} from 'api/dist/period/types';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PeriodReceiverTable from './components/ReceiverSummaryTable';

const getReceiver = (
  periodDetails: PeriodDetailsDto,
  receiverId: string
): PeriodDetailsReceiverDto | undefined => {
  return periodDetails.receivers?.find((r) => r._id === receiverId);
};

const PeriodReceiverMessage = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const periodDetails = useRecoilValue(SinglePeriod(periodId));

  if (!periodDetails) return null;
  const receiver = getReceiver(periodDetails, receiverId);
  return (
    <>
      <h2>{receiver?.userAccount?.name}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total praise score: {receiver?.score}
      </div>
    </>
  );
};

const QuantSummaryPeriodReceiverPage = (): JSX.Element => {
  const { periodId } = useParams<PeriodAndReceiverPageParams>();

  return (
    <>
      <BreadCrumb name={'Receiver summary for period'} icon={faCalendarAlt} />
      <BackLink to={`/period/${periodId}`} />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantSummaryPeriodReceiverPage;
