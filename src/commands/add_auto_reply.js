import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	MessageFlags,
} from 'discord.js'
import { store } from '../bot.js'

// sanitize
function sanitizeInput(input) {
	return input
		.replace(/@everyone/gi, '[everyone]')
		.replace(/@here/gi, '[here]')
		.replace(/<@!?(\d+)>/g, '[user]')
		.replace(/<@&(\d+)>/g, '[role]')
		.trim()
}

export const data = new SlashCommandBuilder()
  .setName('add_an_auto-reply')
  .setDescription('Add a reaction that the bot will send when it detects a word')
  .addStringOption(option => option.setName('word')
                                 .setDescription('The word to be detected')
								 .setRequired(true)
  )
  .addStringOption(option => option.setName('message')
                                 .setDescription('The message to send')
								 .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral })
	const rawWord = interaction.options.getString('word')
	const rawMessage = interaction.options.getString('message')

	const word = sanitizeInput(rawWord)
	const message = sanitizeInput(rawMessage)

	store.addAutoReply(interaction.guild.id, word, message)
	await interaction.editReply({ content: 'Successfully added!' })
}
