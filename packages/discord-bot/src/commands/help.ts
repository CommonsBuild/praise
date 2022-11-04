import { SlashCommandBuilder } from '@discordjs/builders';
import { helpHandler } from '../handlers/help';
import { HelpCommandBuilder, Command } from '../interfaces/Command';
import { handleErrors } from '../utils/handleErrors';

export const help: HelpCommandBuilder = (commands) => {
  return {
    help: {
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help text for praise')
        .addStringOption((option) =>
          option
            .setName('command')
            .setDescription('The command you want to look up')
            .setAutocomplete(true)
            .setRequired(false)
        ),

      async execute(interaction) {
        try {
          if (!interaction.isCommand() || interaction.commandName !== 'help')
            return;

          const msg = await interaction.deferReply({
            fetchReply: true,
          });
          if (msg === undefined) return;
          await helpHandler(interaction, commands);
        } catch (err) {
          await handleErrors(interaction, err as Error);
        }
      },
    } as Command,
  };
};
