import {
	Events,
	AttachmentBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from 'discord.js'
import axios from 'axios'
import { t, getLangFromInteraction } from '../i18n/index.js'

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user')
  .addUserOption(option => option.setName('user')
                                 .setDescription('The user to unban')
								 .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	await interaction.deferReply()
	const user = interaction.options.getUser('user')
	const lang = getLangFromInteraction(interaction)
	try {
		await interaction.guild.members.unban(user.id);
	} catch {
		return interaction.editReply({ content: `${t(lang, 'commands.unban.error1')} ${user.tag}. ${t(lang, 'commands.unban.error2')}` });
	}
	return interaction.editReply({ content: `<@${user.id}> ${t(lang, 'commands.unban.success')}`});
}
