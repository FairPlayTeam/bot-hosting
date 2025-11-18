import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	MessageFlags,
} from 'discord.js'
import { store } from '../bot.js'
import { sanitizeInput } from '../utils/sanitizer.js'

export const data = new SlashCommandBuilder()
  .setName('add_an_auto-reply')
  .setDescription('Add a reaction that the bot will send when it detects a word')
  .addStringOption(option => option.setName('word')
                                 .setDescription('The word to detect')
								 .setRequired(true)
  )
  .addStringOption(option => option.setName('message')
                                 .setDescription('The message to send')
								 .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral })
	const word = sanitizeInput(interaction.options.getString('word'))
	const message = sanitizeInput(interaction.options.getString('message'))

	store.addAutoReply(interaction.guild.id, word, message)
	await interaction.editReply({ content: 'Successfully added!' })
}
