import { SlashCommandBuilder, MessageFlags,EmbedBuilder,PermissionFlagsBits } from 'discord.js'
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
  const guildId= interaction.guild.id
  const number = interaction.options.getInteger("number") || 1
  const messages = store.getDeletedMessage(guildId, channelId,number)

  if (messages.length === 0) {
    return interaction.reply({
      content: 'No messages deleted in this room',
      flags: MessageFlags.Ephemeral,
    })
  }

const embeds = messages.map((m, i) =>
    new EmbedBuilder()
      .setColor(0xff4444)
      .setAuthor({
        name: m.author,
        iconURL: m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
      })
      .setDescription(m.content || '')
      .setFooter({ text: `Deleted the ${m.time}` })
      .setTitle(`🕵️ Deleted Message #${i + 1}`)
  )

  await interaction.reply({ embeds })

}

