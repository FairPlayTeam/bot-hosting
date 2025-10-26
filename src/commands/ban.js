import {
	Events,
	AttachmentBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
 MediaGalleryItemBuilder,
 MediaGalleryBuilder,
 TextDisplayBuilder,
 MessageFlags,
} from 'discord.js'
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
	const item = new MediaGalleryItemBuilder().setURL('https://raw.githubusercontent.com/mydkong/assets-for-my-website/refs/heads/main/cheh.gif')
	const gallery = new MediaGalleryBuilder().addItems(item)

 const text = new TextDisplayBuilder().setContent(`<@${user.id}> ${t(lang, 'commands.ban.success')}`)

	return interaction.editReply({
  flags: MessageFlags.IsComponentsV2,
  components: [text, gallery]
 })
}
