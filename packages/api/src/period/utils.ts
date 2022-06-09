import { NotFoundError } from '@error/errors';
import { PraiseModel } from '@praise/entities';
import { calculateReceiverCompositeScore } from '@praise/utils/score';
import { periodsettingListTransformer } from '@periodsettings/transformers';
import { PeriodSettingsModel } from '@periodsettings/entities';
import { settingValue } from '@shared/settings';
import { some } from 'lodash';
import { PeriodModel } from './entities';
import {
  periodDetailsReceiverListTransformer,
  periodDocumentTransformer,
} from './transformers';
import {
  PeriodDocument,
  PeriodDetailsDto,
  PeriodDetailsQuantifierDto,
  PeriodDetailsQuantifier,
  PeriodDetailsReceiver,
  PeriodDateRange,
  PeriodStatusType,
} from 'shared/dist/period/types';
import { isQuantificationCompleted } from '@praise/utils/core';

// Returns previous period end date or 1970-01-01 if no previous period
export const getPreviousPeriodEndDate = async (
  period: PeriodDocument
): Promise<Date> => {
  const previousPeriod = await PeriodModel.findOne({
    _id: { $ne: period._id },
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });

  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);

  return previousEndDate;
};

const receiversWithScores = async (
  receivers: PeriodDetailsReceiver[]
): Promise<PeriodDetailsReceiver[]> => {
  const receiversWithQuantificationScores = await Promise.all(
    receivers.map(async (r) => {
      const scoreRealized = await calculateReceiverCompositeScore(r);

      return {
        ...r,
        scoreRealized,
        quantifications: undefined,
      };
    })
  );

  return receiversWithQuantificationScores;
};

const quantifiersWithCounts = (
  quantifiers: PeriodDetailsQuantifier[]
): PeriodDetailsQuantifierDto[] => {
  const quantifiersWithQuantificationCounts = quantifiers.map((q) => {
    const finishedCount = q.quantifications.filter((quantification) =>
      isQuantificationCompleted(quantification)
    ).length;

    return {
      _id: q._id,
      praiseCount: q.praiseCount,
      finishedCount,
    };
  });

  return quantifiersWithQuantificationCounts;
};

export const findPeriodDetailsDto = async (
  id: string
): Promise<PeriodDetailsDto> => {
  const period = await PeriodModel.findById(id);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const [quantifiers, receivers]: [
    PeriodDetailsQuantifier[],
    PeriodDetailsReceiver[]
  ] = await Promise.all([
    PraiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      { $unwind: '$quantifications' },
      {
        $group: {
          _id: '$quantifications.quantifier',
          praiseCount: { $count: {} },
          quantifications: {
            $push: '$quantifications',
          },
        },
      },
    ]),
    PraiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      {
        $lookup: {
          from: 'useraccounts',
          localField: 'receiver',
          foreignField: '_id',
          as: 'userAccounts',
        },
      },
      {
        $group: {
          _id: '$receiver',
          praiseCount: { $count: {} },
          quantifications: {
            $push: '$quantifications',
          },
          userAccounts: { $first: '$userAccounts' },
        },
      },
    ]),
  ]);

  const quantifiersWithCountsData = quantifiersWithCounts(quantifiers);
  const receiversWithScoresData = await receiversWithScores(receivers);

  const periodsettings = await PeriodSettingsModel.find({ period: period._id });

  const response = {
    ...periodDocumentTransformer(period),
    receivers: await periodDetailsReceiverListTransformer(
      receiversWithScoresData
    ),
    quantifiers: [...quantifiersWithCountsData],
    settings: periodsettingListTransformer(periodsettings),
  };
  return response;
};

/**
 * Find all Periods where status = QUANTIFY
 * @param match Any paramaters to add to mongoose find query
 * @returns
 */
export const findActivePeriods = async (
  match: object = {}
): Promise<PeriodDocument[]> => {
  let periods: PeriodDocument[] | PeriodDocument = await PeriodModel.find({
    status: PeriodStatusType.QUANTIFY,
    ...match,
  });
  if (!Array.isArray(periods)) periods = [periods];

  return periods;
};

/**
 * Get mongoose query object representing date range of Period
 * @param period
 * @returns
 */
export const getPeriodDateRangeQuery = async (
  period: PeriodDocument
): Promise<PeriodDateRange> => ({
  $gt: await getPreviousPeriodEndDate(period),
  $lte: period.endDate,
});

/**
 * Check if any praise in the given period has already been assigned to quantifiers
 *
 * @param period
 * @returns
 */
export const verifyAnyPraiseAssigned = async (
  period: PeriodDocument
): Promise<boolean> => {
  const periodDateRangeQuery = await getPeriodDateRangeQuery(period);

  const praises = await PraiseModel.find({
    createdAt: periodDateRangeQuery,
  });

  const quantifiersPerPraiseReceiver = (await settingValue(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    period._id
  )) as number;

  const praisesAssigned = praises.map(
    (praise) => praise.quantifications.length === quantifiersPerPraiseReceiver
  );

  return some(praisesAssigned);
};

/**
 * Does period have the latest endDate of all periods?
 * @param period
 * @returns
 */
export const isPeriodLatest = async (
  period: PeriodDocument
): Promise<boolean> => {
  const latestPeriods = await PeriodModel.find({})
    .sort({ endDate: -1 })
    .orFail();

  if (latestPeriods.length === 0) return true;
  if (latestPeriods[0]._id.toString() === period._id.toString()) return true;

  return false;
};
