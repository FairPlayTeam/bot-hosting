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
  .setName('tickets_config')
  .setDescription('Configure the ticket flow')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  await interaction.deferReply()

  const lang = getLangFromInteraction(interaction)
  const text = new TextDisplayBuilder().setContent(t(lang, 'commands.tickets_config.choose_lang'))
  const buttonEnglish = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.configStep1}$${LANG.EN}`)
    .setLabel(t(lang, 'commands.tickets_config.lang_en'))
    .setStyle(1)
    .setEmoji(EMOJIS.FLAG_EN)
  const buttonFrench = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.configStep1}$${LANG.FR}`)
    .setLabel(t(lang, 'commands.tickets_config.lang_fr'))
    .setStyle(1)
    .setEmoji(EMOJIS.FLAG_FR)

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(new ActionRowBuilder().addComponents(buttonEnglish, buttonFrench))

  await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
}
