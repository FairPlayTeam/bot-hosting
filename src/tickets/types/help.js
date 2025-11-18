import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  TextDisplayBuilder,
} from 'discord.js'
import { IDS, EMOJIS } from '../../constants.js'
import { t } from '../../i18n/index.js'
import { store } from '../../bot.js'

export async function createHelpTicket(interaction, lang, config) {
  const channelOptions = {
    name: `❓${interaction.user.username}`,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] },
    ],
  }

  if (config?.categoryId) {
    channelOptions.parent = config.categoryId
  }

  const channel = await interaction.guild.channels.create(channelOptions)

  const content = t(lang, 'tickets.new.help', { userId: interaction.user.id })

  const text = new TextDisplayBuilder().setContent(content)
  store.setTicketChannel(interaction.guild.id, channel,interaction.user.id)
  await store.addLogMessageInChannel(interaction.guild.id,channel.id, "FairPlay", content,"https://fairplay.video/favicon.ico")
  const buttonClose = new ButtonBuilder()
    .setCustomId(`${IDS.ticket.close}-${lang}`)
    .setLabel(t(lang, 'tickets.buttons.close'))
    .setStyle(ButtonStyle.Danger)
    .setEmoji(EMOJIS.CLOSE)
  const buttonProcess = new ButtonBuilder()
    .setCustomId(`${IDS.ticket.process}-${lang}`)
    .setLabel(t(lang, 'tickets.buttons.process'))
    .setStyle(ButtonStyle.Success)
    .setEmoji(EMOJIS.PROCESS)

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(new ActionRowBuilder().addComponents(buttonClose, buttonProcess))

  await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] })

  if (config?.roleId) {
    const ghostpingText = `<@&${config.roleId}>`
    const ghostping = await channel.send(ghostpingText)
  }

  return channel
}




export async function createReportTicket(interaction, lang, config) {
  const channelOptions = {
    name: `🪲${interaction.user.username}`,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] },
    ],
  }

  if (config?.categoryId) {
    channelOptions.parent = config.categoryId
  }

  const channel = await interaction.guild.channels.create(channelOptions)

  let content = t(lang, 'tickets.new.help', { userId: interaction.user.id })

  if (config?.roleId) {
    content = `<@&${config.roleId}>\n\n${content}`
  }
  store.setTicketChannel(interaction.guild.id, channel,interaction.user.id)
  await store.addLogMessageInChannel(interaction.guild.id,channel.id, "FairPlay", content,"https://fairplay.video/favicon.ico")
  const text = new TextDisplayBuilder().setContent(content)
  const buttonClose = new ButtonBuilder()
    .setCustomId(`${IDS.ticket.close}-${lang}`)
    .setLabel(t(lang, 'tickets.buttons.close'))
    .setStyle(ButtonStyle.Danger)
    .setEmoji(EMOJIS.CLOSE)
  const buttonProcess = new ButtonBuilder()
    .setCustomId(`${IDS.ticket.process}-${lang}`)
    .setLabel(t(lang, 'tickets.buttons.process'))
    .setStyle(ButtonStyle.Success)
    .setEmoji(EMOJIS.PROCESS)

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(new ActionRowBuilder().addComponents(buttonClose, buttonProcess))

  await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] })

  return channel
}