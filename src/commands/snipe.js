import {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SectionBuilder,
  PermissionFlagsBits
} from 'discord.js'
import { store } from '../bot.js'


export const data = new SlashCommandBuilder()
  .setName('snipe')
  .setDescription('Display the last deleted messages')
  .addIntegerOption(option => option.setName('number')
                                 .setDescription('Number of messages to display')
								 .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
  const channelId = interaction.channel.id

  const number = interaction.options.getInteger("number") || 10
  const messages = store.getDeletedMessage(channelId,number)

  if (messages.length === 0) {
    return interaction.reply({
      content: 'No messages deleted in this room',
      flags: MessageFlags.Ephemeral,
    })
  }

  const containers = messages.map((m, i) => {
    const text = new TextDisplayBuilder().setContent(`Message is deleted:\n${m.content || '(no content)'}`)
    const thumbnail = new ThumbnailBuilder().setURL(m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')

    const section = new SectionBuilder()
      .addTextDisplayComponents(text)
      .setThumbnailAccessory(thumbnail)

    const container = new ContainerBuilder()
      .addSectionComponents(section)

    return container
  })

  await interaction.reply({
    flags: MessageFlags.IsComponentsV2,
    components: [containers[0]]
  })

  for (let i = 1; i < containers.length-1; i++) {
    await interaction.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [containers[i+1]]
    })
  }

}