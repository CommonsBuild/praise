import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings/periodsettings';
import { PeriodQuantifierReceivers } from '@/model/periods/periods';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import { ActiveUserId } from '@/model/auth/auth';

interface Props {
  periodId: string;
  receiverId: string;
}
export const QuantifyBackNextLink = ({
  periodId,
  receiverId,
}: Props): JSX.Element | null => {
  const activeUserId = useRecoilValue(ActiveUserId);
  const receivers = useRecoilValue(
    PeriodQuantifierReceivers({ periodId, quantifierId: activeUserId || '' })
  );

  const usePseudonyms = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    })
  ) as boolean;

  let backReceiver, forwardReceiver;

  if (!receivers) return null;
  const i = receivers.findIndex((r) => r.receiver._id === receiverId);

  if (i > 0) {
    backReceiver = receivers[i - 1];
  }

  if (i < receivers.length - 1) {
    forwardReceiver = receivers[i + 1];
  }

  return (
    <div className="grid grid-cols-2 px-5 mt-5">
      <div className="text-left">
        {backReceiver && (
          <Link
            replace
            to={`/periods/${periodId}/quantify/receiver/${backReceiver.receiver._id}`}
          >
            <FontAwesomeIcon icon={faArrowLeft} size="1x" className="mr-2" />
            {usePseudonyms ? (
              <UserPseudonym
                userId={backReceiver.receiver._id}
                periodId={periodId}
              />
            ) : (
              backReceiver.receiver.name
            )}
          </Link>
        )}
      </div>
      <div className="text-right">
        {forwardReceiver && (
          <Link
            replace
            to={`/periods/${periodId}/quantify/receiver/${forwardReceiver.receiver._id}`}
          >
            {usePseudonyms ? (
              <UserPseudonym
                userId={forwardReceiver.receiver._id}
                periodId={periodId}
              />
            ) : (
              forwardReceiver.receiver.name
            )}
            <FontAwesomeIcon icon={faArrowRight} size="1x" className="ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
};
