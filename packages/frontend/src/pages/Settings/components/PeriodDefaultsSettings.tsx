import { PeriodSettingDto } from 'api/dist/periodsettings/types';
import { SettingDto } from 'api/dist/settings/types';
import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSubgroup } from './SettingsSubgroup';

interface Params {
  settings: SettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto | PeriodSettingDto
  ): Promise<
    | AxiosResponse<SettingDto>
    | AxiosResponse<PeriodSettingDto>
    | AxiosError
    | undefined
  >;
}

export const PeriodDefaultsSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup
          header="Period Defaults"
          description="The period defaults are used as template when creating new periods. Changing these settings will not affect existing periods. Read more about quantifiers in the documentation: <a href='https://givepraise.xyz/docs/configuring/period-defaults' target='_blank'>Docs – Period Defaults</a>"
        >
          <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
