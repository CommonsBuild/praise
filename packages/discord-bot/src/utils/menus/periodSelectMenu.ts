import { MessageSelectMenu } from 'discord.js';
import { PeriodDocument } from 'api/dist/period/types';

export const periodSelectMenu = (
  periods: PeriodDocument[]
): MessageSelectMenu => {
  const periodMenu = new MessageSelectMenu()
    .setCustomId('period-menu')
    .setPlaceholder('Select period');

  for (const period of periods) {
    periodMenu.addOptions([
      {
        label: period['name'],
        description: `End date: ${period.endDate.toDateString()}`,
        value: period['name'],
      },
    ]);
  }
  return periodMenu;
};
