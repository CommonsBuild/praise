import { PraiseModel } from 'api/dist/praise/entities';
import { Message, GuildMember, MessageEmbed } from 'discord.js';
import { UserModel } from 'api/dist/user/entities';
import logger from 'jet-logger';
import { getSetting } from '../utils/getSettings';
import { getUserAccount } from '../utils/getUserAccount';
import { UserRole } from 'api/dist/user/types';
import {
  dmError,
  invalidReceiverError,
  missingReasonError,
  notActivatedDM,
  notActivatedError,
  praiseSuccessDM,
  roleMentionWarning,
  undefinedReceiverWarning,
} from '../utils/praiseEmbeds';

import { CommandHandler } from 'src/interfaces/CommandHandler';

export const forwardHandler: CommandHandler = async (
  interaction,
  responseUrl
) => {
  const { guild, channel, member } = interaction;

  if (!responseUrl) return;

  if (!guild || !member) {
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
      "You don't have the permission to use this command."
    );
    return;
  }

  const praiseGiver = interaction.options.getMember('giver') as GuildMember;

  const praiseGiverRoleID = await getSetting('PRAISE_GIVER_ROLE_ID');
  const praiseGiverRole = guild.roles.cache.find(
    (r) => r.id === praiseGiverRoleID
  );

  if (
    praiseGiverRole &&
    !praiseGiver?.roles.cache.find((r) => r.id === praiseGiverRole?.id)
  ) {
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `**❌ praiseGiver does not have \`${praiseGiverRole.name}\` role**\nPraise can only be dished by or forwarded from members with the <@&${praiseGiverRole.id}> role. Contact the praiseGiver, so that they can attend an onboarding-call, or ask a steward or guide for an Intro to Praise.`
          )
          .setColor('#f00'),
      ],
    });

    return;
  }
  const giverAccount = await getUserAccount(praiseGiver);

  const receivers = interaction.options.getString('receivers');
  const reason = interaction.options.getString('reason');

  const receiverData = {
    validReceiverIds: receivers?.match(/<@!([0-9]+)>/g),
    undefinedReceivers: receivers?.match(/@([a-z0-9]+)/gi),
    roleMentions: receivers?.match(/<@&([0-9]+)>/g),
  };

  if (
    !receivers ||
    receivers.length === 0 ||
    !receiverData.validReceiverIds ||
    receiverData.validReceiverIds?.length === 0
  ) {
    await interaction.editReply(await invalidReceiverError());
    return;
  }

  if (!reason || reason.length === 0) {
    await interaction.editReply(await missingReasonError());
    return;
  }

  if (!giverAccount.user) {
    await interaction.editReply(
      `**❌ praiseGiver Account Not Activated**\n<@!${giverAccount.accountId}>'s account is not activated in the praise system. Unactivated accounts can not praise users. The praiseGiver would have to use the \`/activate\` command to activate their praise account and to link their eth address.`
    );
    return;
  }

  const praised: string[] = [];
  const receiverIds = receiverData.validReceiverIds.map((id) =>
    id.substr(3, id.length - 4)
  );
  const Receivers = (await guild.members.fetch({ user: receiverIds })).map(
    (u) => u
  );

  const guildChannel = await guild.channels.fetch(channel?.id || '');

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
    const praiseObj = await PraiseModel.create({
      reason: reason,
      giver: giverAccount._id,
      forwarder: forwarderAccount._id,
      sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
      sourceName: `DISCORD:${encodeURIComponent(
        guild.name
      )}:${encodeURIComponent(guildChannel?.name || '')}`,
      receiver: receiverAccount._id,
    });
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
      logger.err(
        `Praise not registered for [${giverAccount.accountId}] -> [${receiverAccount.accountId}] for [${reason}]`
      );
    }
  }

  const msg = (await interaction.editReply(
    `✅  Forward praise from <@!${praiseGiver.user.id}> to ${praised
      .map((id) => `<@!${id}>`)
      .join(', ')} ${reason}`
  )) as Message;

  if (receiverData.undefinedReceivers) {
    await msg.reply(
      await undefinedReceiverWarning(
        receiverData.undefinedReceivers.join(', '),
        praiseGiver.user
      )
    );
  }
  if (receiverData.roleMentions) {
    await msg.reply(
      await roleMentionWarning(
        receiverData.roleMentions.join(', '),
        praiseGiver.user
      )
    );
  }

  return;
};
