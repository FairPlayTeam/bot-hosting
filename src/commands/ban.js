import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder
} from 'discord.js'
import { t, getLangFromInteraction } from '../i18n/index.js'
import { IDS } from '../constants.js'

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user')
  .addUserOption(option => option.setName('user')
                                 .setDescription('The user to ban')
								 .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	await interaction.deferReply()
	const user = interaction.options.getUser('user')
	const lang=getLangFromInteraction(interaction)
	const userId=user.id
	const buttonYes = new ButtonBuilder()
		.setCustomId(`${IDS.ban.yes}-${userId}`)
		.setLabel(t(lang, 'tickets.buttons.yes'))
		.setStyle(ButtonStyle.Danger)
	const buttonNo = new ButtonBuilder()
		.setCustomId(`${IDS.ban.no}-${userId}`)
		.setLabel(t(lang, 'tickets.buttons.no'))
		.setStyle(ButtonStyle.Success)

	await interaction.channel.send({
		content: t(lang, 'commands.ban.confirmation', {userId}),
		components: [new ActionRowBuilder().addComponents(buttonYes, buttonNo)],
})
	
}
