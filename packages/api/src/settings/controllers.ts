import { BadRequestError, NotFoundError } from '@error/errors';
import { removeFile, upload } from '@shared/functions';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { EventLogTypeKey } from 'types/dist/eventlog';
import { logEvent } from '@eventlog/utils';
import { Request } from 'express';
import { SettingsModel } from './entities';
import { settingListTransformer, settingTransformer } from './transformers';
import { SettingDto, SettingSetInput } from 'types/dist/settings';

export const all = async (
  req: Request,
  res: TypedResponse<SettingDto[]>
): Promise<void> => {
  const settings = await SettingsModel.find({ period: { $exists: 0 } });
  res.status(200).json(settingListTransformer(settings));
};

export const single = async (
  req: Request,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const setting = await SettingsModel.findOne({
    _id: req.params.key,
    period: { $exists: 0 },
  });
  if (!setting) throw new NotFoundError('Settings');
  res.status(200).json(settingTransformer(setting));
};

export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const { value } = req.body;

  if (typeof value === 'undefined' && !req.files)
    throw new BadRequestError('Value is required field');

  const { id } = req.params;
  const setting = await SettingsModel.findOne({
    _id: id,
    period: { $exists: 0 },
  });
  if (!setting) throw new NotFoundError('Settings');

  const originalValue = setting.value;
  if (req.files) {
    await removeFile(setting.value);
    const uploadRespone = await upload(req, 'value');
    if (uploadRespone) {
      setting.value = uploadRespone;
    }
  } else {
    setting.value = req.body.value; //TODO validate input
  }

  await setting.save();

  await logEvent(
    EventLogTypeKey.SETTING,
    `Updated global setting "${setting.label}" from "${originalValue}" to "${setting.value}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  res.status(200).json(settingTransformer(setting));
};
