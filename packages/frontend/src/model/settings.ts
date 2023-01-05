import { AxiosError, AxiosResponse } from 'axios';
import { atom, selectorFamily, useRecoilCallback } from 'recoil';
import { isEmpty } from 'lodash';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from './api';
import { SettingDto } from './settings/dto/setting.dto';
import { SetInputDto } from './settings/dto/set-input.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfSetting = (object: any): object is SettingDto => {
  return '_id' in object;
};

/**
 * Atom that fetches all global settings when initialised.
 */
export const AllSettings = atom<SettingDto[] | undefined>({
  key: 'AllSettings',
  default: undefined,
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: '/settings',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const periodSettings = response.data as SettingDto[];
            if (Array.isArray(periodSettings) && periodSettings.length > 0)
              return periodSettings;
          }
        })
      );
    },
  ],
});

/**
 * Selector to get a single setting.
 */
export const SingleSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (key: string) =>
    ({ get }): SettingDto | undefined => {
      const allSettings = get(AllSettings);
      if (!allSettings) return;
      return allSettings.find((setting) => setting.key === key);
    },
  set:
    (key: string) =>
    ({ get, set }, newSetting): void => {
      const oldSetting = get(SingleSetting(key));
      const allSettings = get(AllSettings);
      if (!instanceOfSetting(newSetting) || !oldSetting || !allSettings) return;
      set(
        AllSettings,
        allSettings.map((s) => (s._id === newSetting._id ? newSetting : s))
      );
    },
});

type useSetSettingReturn = {
  setSetting: (
    setting: SettingDto
  ) => Promise<AxiosResponse<SettingDto> | AxiosError | undefined>;
};

/**
 * Returns function to set one individual setting.
 */
export const useSetSetting = (): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();

  const reqData = (setting: SettingDto): SetInputDto | FormData => {
    if (setting.type === 'Image') {
      if (
        setting.value &&
        !isEmpty(setting.value) &&
        setting.value.length > 0
      ) {
        const formData = new FormData();
        formData.append('value', setting.value[0]);
        return formData;
      }
      throw new Error('No file chosen.');
    } else {
      return { value: setting.value || '' };
    }
  };

  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (
        setting: SettingDto
      ): Promise<AxiosResponse<SettingDto> | AxiosError | undefined> => {
        if (!instanceOfSetting(setting)) return;
        const response: AxiosResponse<SettingDto> = await apiAuthClient.patch(
          `/settings/${setting._id}/set`,
          reqData(setting)
        );
        if (isResponseOk(response)) {
          const setting = response.data;
          set(SingleSetting(setting.key), setting);
        }
        return response;
      }
  );

  return { setSetting };
};
