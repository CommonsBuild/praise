import { SettingDto } from 'api/dist/settings/types';
import { PeriodSettingDto } from 'api/src/periodsettings/types';
import { AxiosError, AxiosResponse } from 'axios';
import find from 'lodash/find';
import { useState } from 'react';
import { Form } from 'react-final-form';

import { BooleanInput } from '@/components/form/BooleanInput';
import { ImageFileInput } from '@/components/form/ImageFileInput';
import { NumberInput } from '@/components/form/NumberInput';
import { StringInput } from '@/components/form/StringInput';
import { TextareaInput } from '@/components/form/TextareaInput';

import { SubmitButton } from '../form/SubmitButton';
import { Notice } from '../ui/Notice';

interface SettingsFormProps {
  settings: SettingDto[] | PeriodSettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto | PeriodSettingDto
  ): Promise<
    | AxiosResponse<SettingDto>
    | AxiosResponse<PeriodSettingDto>
    | AxiosError
    | undefined
  >;
  disabled?: boolean;
}

const FormFields = (
  settings: SettingDto[] | PeriodSettingDto[],
  apiResponse
): JSX.Element => {
  return (
    <div className="mb-2 space-y-4">
      {settings.map((setting) => {
        let field;
        if (setting.type === 'String' || setting.type === 'IntegerList')
          field = StringInput(setting.key, apiResponse);
        else if (setting.type === 'Float' || setting.type === 'Integer')
          field = NumberInput(setting.key, apiResponse);
        else if (
          setting.type === 'Textarea' ||
          setting.type === 'QuestionAnswerJSON'
        )
          field = TextareaInput(setting.key, apiResponse);
        else if (setting.type === 'Boolean')
          field = BooleanInput(setting.key, apiResponse);
        else if (setting.type === 'Image')
          field = ImageFileInput(setting.key, setting.valueRealized as string);

        if (!field) return null;

        return (
          <div key={setting.key}>
            <label className="block font-bold">{setting.label}</label>
            {setting.description && (
              <div className="mb-2 text-sm text-warm-gray-400">
                {setting.description}
              </div>
            )}
            {field}
          </div>
        );
      })}
    </div>
  );
};

const DisabledFormFields = (
  settings: SettingDto[] | PeriodSettingDto[]
): JSX.Element => (
  <>
    <Notice type="info" className="mb-8">
      <span>Settings locked for this period</span>
    </Notice>
    <div className="mb-2 space-y-4">
      {settings.map((setting: SettingDto | PeriodSettingDto) => (
        <div key={setting.key}>
          <label className="block font-bold">{setting.label}</label>
          {setting.description && (
            <div className="mb-2 text-sm text-warm-gray-400">
              {setting.description}
            </div>
          )}
          <div className="p-2 bg-warm-gray-200">{setting.value}</div>
        </div>
      ))}
    </div>
  </>
);

export const SettingsForm = ({
  settings,
  parentOnSubmit: onSubmitParent,
  disabled = false,
}: SettingsFormProps): JSX.Element | null => {
  const [apiResponse, setApiResponse] = useState<
    AxiosResponse<unknown> | AxiosError | undefined
  >(undefined);
  if (!Array.isArray(settings) || settings.length === 0) return null;

  // Is only called if validate is successful
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: Record<string, any>): Promise<void> => {
    for (const prop in values) {
      if (Object.prototype.hasOwnProperty.call(values, prop)) {
        const setting = find(
          settings,
          (s) => (s as SettingDto).key === prop
        ) as SettingDto;

        if (setting && values[prop].toString() !== setting.value) {
          const item =
            setting.type === 'Image' ? values[prop][0] : values[prop];

          const updatedSetting = {
            ...setting,
            value: item,
          };

          const response = await onSubmitParent(updatedSetting);
          setApiResponse(response);
        }
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialValues = {} as any;
  for (const setting of settings) {
    initialValues[setting.key] =
      setting.type === 'Boolean' ? setting.value === 'true' : setting.value;
  }

  return (
    <Form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      initialValues={initialValues}
      mutators={{
        setDate: (args, state, utils): void => {
          utils.changeValue(state, 'endDate', () => args);
        },
      }}
      render={({ handleSubmit }): JSX.Element => {
        if (disabled) {
          return DisabledFormFields(settings);
        } else {
          return (
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            <form onSubmit={handleSubmit} className="leading-loose">
              {FormFields(settings, apiResponse)}
              <div className="mt-4">
                <SubmitButton />
              </div>
            </form>
          );
        }
      }}
    />
  );
};
