import { SettingsModel } from '@settings/entities';

const settings = [
  { key: 'NAME', value: process.env.NAME },
  { key: 'LOGO', value: process.env.LOGO },
  { key: 'DESCRIPTION', value: process.env.DESCRIPTION },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    value: process.env.PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER || 3,
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER_TOLERANCE',
    value: process.env.PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER_TOLERANCE || 1.2,
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    value: process.env.PRAISE_PER_QUANTIFIER || 50,
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    value: process.env.PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS || false,
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    value: process.env.PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE || 0.1,
  },
  { key: 'DISCORD_ACTIVATION', value: process.env.DISCORD_ACTIVATION },
  { key: 'DISCORD_MESSAGE', value: process.env.DISCORD_MESSAGE },
  { key: 'DISCORD_LOGO', value: process.env.DISCORD_LOGO },
  { key: 'TELEGRAM_ACTIVATION', value: process.env.TELEGRAM_ACTIVATION },
  { key: 'TELEGRAM_MESSAGE', value: process.env.TELEGRAM_MESSAGE },
  { key: 'TELEGRAM_LOGO', value: process.env.TELEGRAM_LOGO },
];

const seedSettings = async (): Promise<void> => {
  for (const s of settings) {
    const document = await SettingsModel.findOne({ key: s.key });
    if (!document && s.value) {
      await SettingsModel.create(s);
    }
  }
};

export { seedSettings };
