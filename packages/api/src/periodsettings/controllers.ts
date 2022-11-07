import { Request } from 'express';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { removeFile, upload } from '@/shared/functions';
import { TypedRequestBody, TypedResponse } from '@/shared/types';
import { SettingSetInput } from '@/settings/types';
import { PeriodStatusType } from '@/period/types';
import { PeriodModel } from '@/period/entities';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import {
  periodSettingTransformer,
  periodsettingListTransformer,
} from './transformers';
import { PeriodSettingsModel } from './entities';
import { PeriodSettingDto } from './types';

/**
 * Fetch all PeriodSettings for a given Period
 *
 * @param {Request} req
 * @param {TypedResponse<PeriodSettingDto[]>} res
 * @returns {Promise<void>}
 */
export const all = async (
  req: Request,
  res: TypedResponse<PeriodSettingDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const settings = await PeriodSettingsModel.find({ period: period._id });

  res.status(200).json(periodsettingListTransformer(settings));
};

/**
 * Fetch single PeriodSetting
 *
 * @param {Request} req
 * @param {TypedResponse<PeriodSettingDto>} res
 * @returns {Promise<void>}
 */
export const single = async (
  req: Request,
  res: TypedResponse<PeriodSettingDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const setting = await PeriodSettingsModel.findOne({
    _id: req.params.settingId,
    period: period._id,
  });
  if (!setting) throw new NotFoundError('Periodsetting');
  res.status(200).json(periodSettingTransformer(setting));
};

/**
 * Update a PeriodSetting's value
 *
 * @param {TypedRequestBody<SettingSetInput>} req
 * @param {TypedResponse<PeriodSettingDto>} res
 * @returns {Promise<void>}
 */
export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: TypedResponse<PeriodSettingDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== PeriodStatusType.OPEN)
    throw new BadRequestError(
      'Period settings can only be changed when period status is OPEN.'
    );

  const setting = await PeriodSettingsModel.findOne({
    _id: req.params.settingId,
    period: period._id,
  });
  if (!setting) throw new NotFoundError('PeriodSettings');

  const originalValue = setting.value;
  if (setting.type === 'Image') {
    const uploadResponse = await upload(req, 'value');
    if (uploadResponse) {
      setting.value && (await removeFile(setting.value));
      setting.value = uploadResponse;
    }
  } else {
    if (typeof req.body.value === 'undefined') {
      throw new BadRequestError('Value is required field');
    }
    setting.value = req.body.value;
  }

  await setting.save();

  await logEvent(
    EventLogTypeKey.SETTING,
    `Updated period setting "${
      setting.label
    }" from ${originalValue} to ${setting.value.toString()} in period "${
      period.name
    }"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  res.status(200).json(periodSettingTransformer(setting));
};
