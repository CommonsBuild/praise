import { EmbedBuilder } from 'discord.js';
import format from 'date-fns/format';
import { UserState } from '../../interfaces/UserState';

const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

/**
 * Generate message outlining user's current activation status
 *
 * @param {UserState} state
 * @returns {EmbedBuilder}
 */
export const getStateEmbed = (state: UserState): EmbedBuilder => {
  let userStateDescription: string;
  if (state.activated && state.hasPraiseGiverRole) {
    userStateDescription = 'Your account is activated and has praise powers.';
  } else if (state.hasPraiseGiverRole) {
    userStateDescription =
      "You have praise powers, however your account isn't activated(use `/activate` command).";
  } else if (state.activated) {
    userStateDescription =
      "Your account is activated, however you don't have praise powers.";
  } else {
    userStateDescription =
      "You don't have praise powers, and your account isn't activated(use `/activate` command).";
  }
  const embed = new EmbedBuilder()
    .setTitle(state.username)
    .setDescription(userStateDescription);
  if (state.avatar) {
    embed.setThumbnail(
      `https://cdn.discordapp.com/avatars/${state.id}/${state.avatar}`
    );
  }
  if (state.activated) {
    embed.addFields({
      name: 'User Roles',
      value: state.praiseRoles?.join(' | ') || 'No Roles assigned to user.',
    });
    embed.addFields({
      name: 'Ethereum Address',
      value: state.address || 'No ethereum address found for user.',
    });
    embed.addFields({
      name: 'Activations',
      value:
        state.activations
          ?.map(
            (account) =>
              `> ${account.platform}\n> Account: ${
                account.user
              }\n> Date of Activation: ${formatDate(
                account.activationDate
              )}\n> Last Active: ${formatDate(account.latestUsageDate)}`
          )
          .join('\n\n') ||
        'No activated useraccounts associated with this User.',
    });
  }

  return embed;
};
