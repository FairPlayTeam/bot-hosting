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

export async function createCandidateTicket(interaction, lang, formData, config) {
  const { age, position, detail, qualities, remunerated } = formData

  const channelOptions = {
    name: `📝${interaction.user.username}`,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] },
    ],
  }

  if (config?.categoryId) {
    channelOptions.parent = config.categoryId
  }

  const channel = await interaction.guild.channels.create(channelOptions)

  const content = t(lang, 'tickets.new.candidate', {
    userId: interaction.user.id,
    age,
    position,
    detail,
    qualities,
    remunerated,
  })

  const text = new TextDisplayBuilder().setContent(content)
  const buttonClose = new ButtonBuilder()
    .setCustomId(IDS.ticket.close)
    .setLabel(t(lang, 'tickets.buttons.close'))
    .setStyle(ButtonStyle.Danger)
    .setEmoji(EMOJIS.CLOSE)
  const buttonProcess = new ButtonBuilder()
    .setCustomId(IDS.ticket.process)
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
