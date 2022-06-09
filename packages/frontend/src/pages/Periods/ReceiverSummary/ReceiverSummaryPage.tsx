import BreadCrumb from '@/components/BreadCrumb';
import { PeriodAndReceiverPageParams, SinglePeriod } from '@/model/periods';
import { useAllPeriodSettingsQuery } from '@/model/periodsettings';
import BackLink from '@/navigation/BackLink';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import {
  PeriodDetailsDto,
  PeriodDetailsReceiverDto,
} from 'shared/dist/period/types';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import ReceiverSummaryTable from './components/ReceiverSummaryTable';

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
  if (!receiver || !receiver.userAccount) return null;

  return (
    <div className="praise-box">
      <h2>{receiver.userAccount.name}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total Score: {receiver.scoreRealized}
      </div>
    </div>
  );
};

const QuantSummaryPeriodReceiverPage = (): JSX.Element => {
  const { periodId } = useParams<PeriodAndReceiverPageParams>();
  useAllPeriodSettingsQuery(periodId);

  return (
    <>
      <BreadCrumb name={'Receiver summary for period'} icon={faCalendarAlt} />
      <BackLink to={`/periods/${periodId}`} />

      <React.Suspense fallback="Loading…">
        <PeriodReceiverMessage />
      </React.Suspense>

      <React.Suspense fallback="Loading…">
        <ReceiverSummaryTable />
      </React.Suspense>
    </>
  );
};

export default QuantSummaryPeriodReceiverPage;
