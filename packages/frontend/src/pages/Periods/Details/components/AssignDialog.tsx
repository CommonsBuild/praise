import { useVerifyQuantifierPoolSize } from '@/model/periods';
import {
  faCheckSquare,
  faTimes,
  faTimesCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

interface PeriodAssignDialogProps {
  onClose(): any;
  onAssign(): any;
}

const DialogMessage = ({ onClose, onAssign }: PeriodAssignDialogProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const { location } = useHistory();
  const poolRequirements = useVerifyQuantifierPoolSize(periodId, location.key);

  const quantPoolBigEnough = poolRequirements
    ? poolRequirements.quantifierPoolSize >= poolRequirements.requiredPoolSize
    : false;

  return (
    <>
      <div className="text-center mb-7">
        <div>
          The quantifier pool has{' '}
          {poolRequirements ? poolRequirements.quantifierPoolSize : '#'}{' '}
          members.
        </div>
        <div className="mb-3">
          Members needed for quantification:{' '}
          {poolRequirements ? poolRequirements.requiredPoolSize : '#'}
        </div>
        <div>
          {quantPoolBigEnough ? (
            <>
              <FontAwesomeIcon className="text-green" icon={faCheckSquare} />{' '}
              Quantifier pool requirements are met.
            </>
          ) : (
            <>
              <FontAwesomeIcon className="text-green" icon={faTimesCircle} />{' '}
              Quantifier pool requirements are not met.
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        {quantPoolBigEnough ? (
          <button
            className="mt-4 praise-button"
            onClick={() => {
              onAssign();
              onClose();
            }}
          >
            Assign
          </button>
        ) : (
          <button
            className="mt-4 praise-button"
            onClick={() => {
              onClose();
            }}
          >
            Close
          </button>
        )}
      </div>
    </>
  );
};

const PeriodAssignDialog = ({ onClose, onAssign }: PeriodAssignDialogProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-gray-800 opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Assign quantifiers
          </Dialog.Title>
          <React.Suspense fallback="Loading…">
            <DialogMessage onAssign={onAssign} onClose={onClose} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default PeriodAssignDialog;
