import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount, UserAccountDocument } from 'api/dist/useraccount/types';
import { GuildMember } from 'discord.js';

/**
 * Fetch UserAccount from database associated with Discord user
 *
 * @param {GuildMember} member
 * @returns {Promise<UserAccountDocument>}
 */
export const getUserAccount = async (
  member: GuildMember
): Promise<UserAccountDocument> => {
  const ua = {
    accountId: member.user.id,
    name: member.user.username + '#' + member.user.discriminator,
    avatarId: member.user.avatar,
    platform: 'DISCORD',
  } as UserAccount;

  const userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: ua.accountId },
    ua,
    { upsert: true, new: true }
  );
  return userAccount;
};
