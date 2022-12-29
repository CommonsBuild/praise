import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { SettingsService } from '@/settings/settings.service';
import { Setting } from '@/settings/schemas/settings.schema';

@Injectable()
export class SettingsSeeder {
  SettingsModel = this.SettingsService.getModel();
  constructor(private readonly SettingsService: SettingsService) {}

  /**
   * Generate and save a fake Settings
   *
   * @param {Object} [SettingsData={}]
   * @returns {Promise<Settings>}
   */
  seedSettings = async (
    SettingsData: Record<string, unknown> = {},
  ): Promise<Setting> => {
    const Setting = await this.SettingsModel.create({
      period: SettingsData.period || null,
      key: SettingsData.key || faker.random.word(),
      value: SettingsData.value || faker.random.word(),
      type: SettingsData.type || faker.random.word(),
      label: SettingsData.label || faker.random.word(),
      description: SettingsData.description || faker.random.word(),
      group: SettingsData.group || SettingGroup.PERIOD_DEFAULT,
      subgroup: SettingsData.subgroup || faker.random.numeric(),
      ...SettingsData,
    });

    return Setting;
  };
}
