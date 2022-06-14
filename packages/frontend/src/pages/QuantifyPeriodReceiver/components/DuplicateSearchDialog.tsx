import ScrollableDialog from '@/components/ScrollableDialog';
import PraiseAutosuggest from './PraiseAutosuggest';
import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PeriodPageParams } from '@/model/periods';
import { PraiseDto } from 'types/dist/praise/types';
import { useParams } from 'react-router-dom';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';

interface Props {
  onClose(): void;
  onConfirm(duplicatePraise: string): void;
  open: boolean;
  selectedPraise: PraiseDto | undefined;
}

const DuplicateSearchDialog = ({
  onClose,
  onConfirm,
  open = false,
  selectedPraise,
}: Props): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();

  const duplicatePraisePercentage = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  ) as number;

  if (!selectedPraise) return null;

  return (
    <ScrollableDialog open={open} onClose={onClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <h2 className="text-center">Mark praise as duplicate</h2>
          {duplicatePraisePercentage && (
            <p className="text-center">
              Enter the original praise ID:
              <br />
              The duplicate will receive {duplicatePraisePercentage * 100}% of
              its value.
            </p>
          )}
          <div className="flex justify-center">
            <PraiseAutosuggest
              onSelect={onConfirm}
              onClose={onClose}
              praise={selectedPraise}
            />
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};

export default DuplicateSearchDialog;
