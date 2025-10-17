import {
	SlashCommandBuilder,
	PermissionFlagsBits,
    MessageFlags,
} from 'discord.js'
  

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Send a message by the bot')
  .addStringOption(option => option.setName('message')
                                 .setDescription('The message to send')
								 .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	const message = interaction.options.getString('message')
    await interaction.channel.send(message)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    await interaction.deleteReply()
    
    return
}
