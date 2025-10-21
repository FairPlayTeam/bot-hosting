import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from 'discord.js'
import { IDS, LANG, EMOJIS } from '../constants.js'
import { t, getLangFromInteraction } from '../i18n/index.js'

export const data = new SlashCommandBuilder()
  .setName('tickets_show-container')
  .setDescription('Post the tickets container in the current channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const lang = getLangFromInteraction(interaction)
  const text = new TextDisplayBuilder().setContent(t(lang, 'commands.tickets_show.heading'))
  const buttonEnglish = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.langPrefix}-${LANG.EN}`)
    .setLabel('English')
    .setStyle(1)
    .setEmoji(EMOJIS.FLAG_EN)
  const buttonFrench = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.langPrefix}-${LANG.FR}`)
    .setLabel('Français')
    .setStyle(1)
    .setEmoji(EMOJIS.FLAG_FR)
  
  const actionRow = new ActionRowBuilder().addComponents(buttonEnglish, buttonFrench)

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(actionRow)

  await interaction.channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] })
  await interaction.editReply({
    content: t(lang, 'commands.tickets_show.sent'),
  })
}
