import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import {
  PeriodAndReceiverPageParams,
  usePeriodReceiverPraise,
} from '@/model/periods';
import { AllPraiseList } from '@/model/praise';
import { periodReceiverPraiseListKey } from '@/utils/periods';

export const ReceiverSummaryTable = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  usePeriodReceiverPraise(periodId, receiverId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodReceiverPraiseListKey(periodId, receiverId))
  );

  if (!praiseList) return null;
  return (
    <div className="p-0 praise-box">
      <ul>
        {praiseList?.map((praise) => (
          <PraiseRow praise={praise} key={praise?._id}>
            <Praise praise={praise} className="p-5" />
          </PraiseRow>
        ))}
      </ul>
    </div>
  );
};
