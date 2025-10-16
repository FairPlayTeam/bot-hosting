import {
	Events,
	AttachmentBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from 'discord.js'
import axios from 'axios'
import { t, getLangFromInteraction } from '../i18n/index.js'

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
	const lang = getLangFromInteraction(interaction)
	try {
		await interaction.guild.members.ban(user.id, { reason: `${t(lang, 'commands.ban.by')} ${interaction.user.globalname || interaction.user.username}` });
	} catch {
		return interaction.editReply({ content: `${t(lang, 'commands.ban.error1')} ${user.tag}. ${t(lang, 'commands.ban.error2')}` });
	}
	const imageBuffer = await axios.get('https://raw.githubusercontent.com/mydkong/assets-for-my-website/refs/heads/main/cheh.gif', { responseType: 'arraybuffer' })
	const attachmentCheh = new AttachmentBuilder(imageBuffer.data, { name: 'cheh.gif' })
	return interaction.editReply({ content: `<@${user.id}> ${t(lang, 'commands.ban.success')}`, files: [attachmentCheh] });
}
