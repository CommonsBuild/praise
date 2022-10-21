import { User, EmbedBuilder, Role } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';

/**
 * Generate success response message for commands/praise
 *
 * @param {string[]} praised
 * @param {string} reason
 * @returns {Promise<string>}
 */
export const praiseSuccess = async (
  praised: string[],
  reason: string
): Promise<string> => {
  const msg = (await settingValue('PRAISE_SUCCESS_MESSAGE')) as string;
  if (msg) {
    return msg
      .replace('{@receivers}', `${praised.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    return 'PRAISE SUCCESSFUL (message not set)';
  }
};

/**
 * Generate success response message for commands/forward
 *
 * @param {User} giver
 * @param {string[]} receivers
 * @param {string} reason
 * @returns   {Promise<string>}
 */
export const forwardSuccess = async (
  giver: User,
  receivers: string[],
  reason: string
): Promise<string> => {
  const msg = (await settingValue('FORWARD_SUCCESS_MESSAGE')) as string;
  if (msg) {
    return msg
      ?.replace('{@giver}', `<@!${giver.id}>`)
      .replace('{@receivers}', `${receivers.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    return 'PRAISE SUCCESSFUL (message not set)';
  }
};

/**
 * Generate response error message PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR
 *
 * @returns {Promise<string>}
 */
export const notActivatedError = async (): Promise<string> => {
  const msg = (await settingValue(
    'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR'
  )) as string;
  if (msg) {
    return msg;
  } else {
    return 'PRAISE ACCOUNT NOT ACTIVATED (message not set)';
  }
};

/**
 * Generate response error message PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR
 *
 * @returns {Promise<string>}
 */
export const alreadyActivatedError = async (): Promise<string> => {
  const msg = (await settingValue(
    'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR'
  )) as string;
  if (msg) {
    return msg;
  } else {
    return 'PRAISE ACCOUNT ALREADY ACTIVATED (message not set)';
  }
};

/**
 * Generate response error message FORWARD_FROM_UNACTIVATED_GIVER_ERROR
 *
 * @returns {Promise<string>}
 */
export const giverNotActivatedError = async (
  praiseGiver: User
): Promise<string> => {
  const msg = (await settingValue(
    'FORWARD_FROM_UNACTIVATED_GIVER_ERROR'
  )) as string;
  if (msg) {
    return msg
      .replace(
        '{giver}',
        `${praiseGiver.username}#${praiseGiver.discriminator}`
      )
      .replace('{@giver}', `<@!${praiseGiver.id}>`);
  } else {
    return "PRAISE GIVER'S ACCOUNT NOT ACTIVATED (message not set)";
  }
};

/**
 * Generate response error message DM_ERROR
 *
 * @returns {Promise<string>}
 */
export const dmError = async (): Promise<string> => {
  const msg = (await settingValue('DM_ERROR')) as string;
  if (msg) {
    return msg;
  } else {
    return 'COMMAND CAN NOT BE USED IN DM (message not set)';
  }
};

/**
 * Generate response error message PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR
 *
 * @returns {Promise<string>}
 */
export const praiseRoleError = async (
  praiseGiverRole: Role,
  user: User
): Promise<EmbedBuilder> => {
  const msg = (await settingValue(
    'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR'
  )) as string;
  if (msg) {
    return new EmbedBuilder().setColor('#ff0000').setDescription(
      msg
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
  }
  return new EmbedBuilder().setColor('#ff0000').setDescription(
    'USER DOES NOT HAVE {@role} role (message not set)'
      .replace('{role}', praiseGiverRole?.name || '...')
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
  );
};

/**
 * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
 *
 * @returns {Promise<string>}
 */
export const invalidReceiverError = async (): Promise<string> => {
  const msg = (await settingValue('PRAISE_INVALID_RECEIVERS_ERROR')) as string;
  if (msg) {
    return msg;
  }
  return 'VALID RECEIVERS NOT MENTIONED (message not set)';
};

/**
 * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
 *
 * @returns {Promise<string>}
 */
export const missingReasonError = async (): Promise<string> => {
  const msg = (await settingValue('PRAISE_REASON_MISSING_ERROR')) as string;
  if (msg) {
    return msg;
  }
  return 'REASON NOT MENTIONED (message not set)';
};

/**
 * Generate response error message PRAISE_UNDEFINED_RECEIVERS_WARNING
 *
 * @returns {Promise<string>}
 */
export const undefinedReceiverWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = (await settingValue(
    'PRAISE_UNDEFINED_RECEIVERS_WARNING'
  )) as string;
  if (msg) {
    return msg
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@user}', `<@!${user?.id || '...'}>`)
      .replace('{@receivers}', receivers);
  }
  return 'UNDEFINED RECEIVERS MENTIONED, UNABLE TO PRAISE THEM (message not set)';
};

/**
 * Generate response error message PRAISE_TO_ROLE_WARNING
 *
 * @returns {Promise<string>}
 */
export const roleMentionWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = (await settingValue('PRAISE_TO_ROLE_WARNING')) as string;
  if (msg) {
    return msg
      .replace('{@receivers}', receivers)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...');
  }
  return "ROLES MENTIONED AS PRAISE RECEIVERS, PRAISE CAN'T BE DISHED TO ROLES (message not set)";
};

/**
 * Generate response error message PRAISE_SUCCESS_DM
 *
 * @returns {Promise<string>}
 */
export const praiseSuccessDM = async (
  msgUrl: string
): Promise<EmbedBuilder> => {
  const msg = (await settingValue('PRAISE_SUCCESS_DM')) as string;
  if (msg) {
    return new EmbedBuilder()
      .setColor('#696969')
      .setDescription(msg.replace('{praiseURL}', msgUrl));
  }
  return new EmbedBuilder().setDescription(
    `[YOU HAVE BEEN PRAISED!!!](${msgUrl}) (message not set)`
  );
};

/**
 * Generate response error message PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM
 *
 * @returns {Promise<string>}
 */
export const notActivatedDM = async (msgUrl: string): Promise<EmbedBuilder> => {
  const msg = (await settingValue(
    'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM'
  )) as string;
  if (msg) {
    return new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('**⚠️  Praise Account Not Activated**')
      .setDescription(msg.replace('{praiseURL}', msgUrl));
  }
  return new EmbedBuilder().setDescription(
    `**[YOU HAVE BEEN PRAISED](${msgUrl})\nPRAISE ACCOUNT NOT ACTIVATED. USE \`/activate\` TO ACTIVATE YOUR ACCOUNT. (message not set)`
  );
};

/**
 * Generate response error message SELF_PRAISE_WARNING
 *
 * @returns {Promise<string>}
 */
export const selfPraiseWarning = async (): Promise<string> => {
  const msg = (await settingValue('SELF_PRAISE_WARNING')) as string;
  if (msg) {
    return msg;
  }
  return 'SELF-PRAISE NOT ALLOWED, PRAISE GIVERS UNABLE TO PRAISE THEMSELVES (message not set)';
};

/**
 * Generate response info message FIRST_TIME_PRAISER
 *
 * @returns {Promise<string>}
 */
export const firstTimePraiserInfo = async (): Promise<string> => {
  const msg = (await settingValue('FIRST_TIME_PRAISER')) as string;
  if (msg) {
    return msg;
  }
  return 'YOU ARE PRAISING FOR THE FIRST TIME. WELCOME TO PRAISE! (message not set)';
};
