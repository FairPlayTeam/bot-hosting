import {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js'
import { IDS, EMOJIS } from '../constants.js'
import { t ,getLangFromInteraction} from '../i18n/index.js'

export async function handleSelect(interaction, context) {
  const { store } = context || {}
  if (interaction.customId.startsWith(IDS.tickets.configStep3)) {
    await interaction.deferUpdate()

    const lang = interaction.customId.split('$')[1]
    const categoryChoice = interaction.customId.split('$')[2]
    const categoryId = interaction.values[0]

    const text = new TextDisplayBuilder().setContent(t(lang, 'config.step3.select_role'))
    const roles = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id)
    const roleMenu = new StringSelectMenuBuilder()
      .setCustomId(`${IDS.tickets.configStep4}$${lang}$${categoryChoice}$${categoryId}`)
      .setPlaceholder(t(lang, 'config.select.placeholder_role'))
      .setMinValues(1)
      .setMaxValues(1)

    roles.forEach(role => {
      roleMenu.addOptions({
        label: role.name,
        value: role.id,
        emoji: EMOJIS.MENTION,
      })
    })

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(new ActionRowBuilder().addComponents(roleMenu))

    await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
    return true
  }

  if (interaction.customId.startsWith(IDS.tickets.configStep4)) {
    await interaction.deferUpdate()

    const lang = interaction.customId.split('$')[1]
    const categoryId = interaction.customId.split('$')[3]
    const roleId = interaction.values[0]

    if (store) {
      store.setTicketConfig(interaction.guild.id, {
        lang,
        categoryId: categoryId || null,
        roleId,
      })
    }

    const text = new TextDisplayBuilder().setContent(
      `### ✅ Configuration complete!\n\n**Language:** ${lang}\n**Category:** ${
        categoryId ? `<#${categoryId}>` : 'None'
      }\n**Staff Role:** <@&${roleId}>`
    )

    const container = new ContainerBuilder().addTextDisplayComponents(text)

    await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
    return true
  }
  if (interaction.customId.startsWith(IDS.select.banned_users)) {
    const lang=getLangFromInteraction(interaction)
    const userId=interaction.values[0]
    const buttonYes = new ButtonBuilder()
      .setCustomId(`${IDS.unban.yes}-${userId}`)
      .setLabel(t(lang, 'tickets.buttons.yes'))
      .setStyle(ButtonStyle.Danger)
    const buttonNo = new ButtonBuilder()
      .setCustomId(`${IDS.unban.no}-${userId}`)
      .setLabel(t(lang, 'tickets.buttons.no'))
      .setStyle(ButtonStyle.Success)

    await interaction.channel.send({
      content: t(lang, 'commands.unban.confirmation', {userId}),
      components: [new ActionRowBuilder().addComponents(buttonYes, buttonNo)],
    })
    return true
  }

  return false
}
