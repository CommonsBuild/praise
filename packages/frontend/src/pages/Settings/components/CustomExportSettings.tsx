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

export const CustomExportSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup
          header="Custom Export Settings"
          description="Custom exports allow you to export Praise period data in a custom format for analytics, token distributions etc. The export system uses externally loaded transformers to produce csv or json files. The transformer is loaded from a URL and the data is passed to it as a JSON object. For more information about the transformer format, see the documentation: <a href='https://givepraise.xyz/docs/configuring/custom-export' target='_blank'>Docs – Custom export</a>"
        >
          <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
