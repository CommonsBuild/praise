import { GuildMember } from 'discord.js';
import { UserModel } from 'api/dist/user/entities';
import { EventLogTypeKey } from 'api/dist/eventlog/types';
import { logEvent } from 'api/dist/eventlog/utils';
import { UserRole } from 'api/dist/user/types';
import { settingValue } from 'api/dist/shared/settings';
import { logger } from 'api/dist/shared/logger';
import { getReceiverData } from '../utils/getReceiverData';
import { getUserAccount } from '../utils/getUserAccount';
import {
  dmError,
  invalidReceiverError,
  missingReasonError,
  notActivatedDM,
  notActivatedError,
  praiseSuccessDM,
  roleMentionWarning,
  undefinedReceiverWarning,
  forwardSuccess,
  giverNotActivatedError,
  selfPraiseWarning,
} from '../utils/embeds/praiseEmbeds';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { createPraise } from '../utils/createPraise';

/**
 * Execute command /firward
 *  Creates praises with a given giver, receiver, and reason
 *
 * @param  interaction
 * @param  responseUrl
 * @returns
 */
export const forwardHandler: CommandHandler = async (
  interaction,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, channel, member } = interaction;
  if (!guild || !member || !channel) {
    await interaction.editReply(await dmError());
    return;
  }

  const forwarderAccount = await getUserAccount(member as GuildMember);
  if (!forwarderAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }

  const forwarderUser = await UserModel.findOne({ _id: forwarderAccount.user });
  if (!forwarderUser?.roles.includes(UserRole.FORWARDER)) {
    await interaction.editReply(
      "**❌ You don't have the permission to use this command.**"
    );
    return;
  }

  if ((await assertPraiseAllowedInChannel(interaction)) === false) return;

  const praiseGiver = interaction.options.getMember('giver') as GuildMember;
  if (!praiseGiver) {
    await interaction.editReply('**❌ No Praise giver specified**');
    return;
  }

  if (!(await assertPraiseGiver(praiseGiver, interaction, true))) return;

  const receivers = interaction.options.getString('receivers');

  if (!receivers || receivers.length === 0) {
    await interaction.editReply(await invalidReceiverError());
    return;
  }

  const receiverData = getReceiverData(receivers);
  if (
    !receiverData.validReceiverIds ||
    receiverData.validReceiverIds?.length === 0
  ) {
    await interaction.editReply(await invalidReceiverError());
    return;
  }

  const reason = interaction.options.getString('reason');
  if (!reason || reason.length === 0) {
    await interaction.editReply(await missingReasonError());
    return;
  }

  const giverAccount = await getUserAccount(praiseGiver);
  if (!giverAccount.user) {
    await interaction.editReply(await giverNotActivatedError(praiseGiver.user));
    return;
  }

  const praised: string[] = [];
  const receiverIds = [
    ...new Set(
      receiverData.validReceiverIds.map((id: string) => id.replace(/\D/g, ''))
    ),
  ];

  const selfPraiseAllowed = (await settingValue(
    'SELF_PRAISE_ALLOWED'
  )) as boolean;

  let warnSelfPraise = false;
  if (!selfPraiseAllowed && receiverIds.includes(giverAccount.accountId)) {
    warnSelfPraise = true;
    receiverIds.splice(receiverIds.indexOf(giverAccount.accountId), 1);
  }
  const Receivers = (await guild.members.fetch({ user: receiverIds })).map(
    (u) => u
  );

  for (const receiver of Receivers) {
    const receiverAccount = await getUserAccount(receiver);

    if (!receiverAccount.user) {
      try {
        await receiver.send({ embeds: [await notActivatedDM(responseUrl)] });
      } catch (err) {
        logger.warn(
          `Can't DM user - ${receiverAccount.name} [${receiverAccount.accountId}]`
        );
      }
    }
    const praiseObj = await createPraise(
      interaction,
      giverAccount,
      receiverAccount,
      reason,
      forwarderAccount
    );

    await logEvent(
      EventLogTypeKey.PRAISE,
      'Created a new forwarded praise from discord',
      {
        userAccountId: forwarderAccount._id,
        userId: forwarderUser._id,
      }
    );

    if (praiseObj) {
      try {
        await receiver.send({ embeds: [await praiseSuccessDM(responseUrl)] });
      } catch (err) {
        logger.warn(
          `Can't DM user - ${receiverAccount.name} [${receiverAccount.accountId}]`
        );
      }
      praised.push(receiverAccount.accountId);
    } else {
      logger.error(
        `Praise not registered for [${giverAccount.accountId}] -> [${receiverAccount.accountId}] for [${reason}]`
      );
    }
  }

  if (Receivers.length !== 0) {
    await interaction.editReply(
      await forwardSuccess(
        praiseGiver.user,
        praised.map((id) => `<@!${id}>`),
        reason
      )
    );
  } else if (warnSelfPraise) {
    await interaction.editReply(await selfPraiseWarning());
  } else {
    await interaction.editReply(await invalidReceiverError());
  }

  const warningMsg =
    (receiverData.undefinedReceivers
      ? (await undefinedReceiverWarning(
          receiverData.undefinedReceivers.join(', '),
          praiseGiver.user
        )) + '\n'
      : '') +
    (receiverData.roleMentions
      ? (await roleMentionWarning(
          receiverData.roleMentions.join(', '),
          praiseGiver.user
        )) + '\n'
      : '') +
    (Receivers.length !== 0 && warnSelfPraise
      ? (await selfPraiseWarning()) + '\n'
      : '');

  if (warningMsg && warningMsg.length !== 0) {
    await interaction.followUp({ content: warningMsg, ephemeral: true });
  }
};
