import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js'
import { t, getLangFromInteraction } from '../i18n/index.js'

export const data = new SlashCommandBuilder()
  .setName('vanish')
  .setDescription('Hide your messages')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction, { store }) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
  const vanished = store.toggleVanish(interaction.guild.id, interaction.user.id)
  const lang = getLangFromInteraction(interaction)
  await interaction.editReply({
    content: vanished ? t(lang, 'commands.vanish.on') : t(lang, 'commands.vanish.off'),
  })
}
