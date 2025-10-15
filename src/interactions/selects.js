import {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
} from 'discord.js'
import { IDS, EMOJIS } from '../constants.js'
import { t } from '../i18n/index.js'

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
    const categoryChoice = interaction.customId.split('$')[2]
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

  return false
}
