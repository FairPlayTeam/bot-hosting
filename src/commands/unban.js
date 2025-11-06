import {
	Events,
	AttachmentBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	GatewayIntentBits,
	Partials,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js'
import { IDS, EMOJIS } from '../constants.js'
import axios from 'axios'
import { t, getLangFromInteraction } from '../i18n/index.js'

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	await interaction.deferReply()
	const lang = getLangFromInteraction(interaction)
	const bannedUsers= await interaction.guild.bans.fetch()
	
	if (bannedUsers.size === 0) {
		await interaction.editReply({content : t(lang, 'commands.unban.noUsers')})
		return true
	}


	const options = bannedUsers.map(ban => {
          const user = ban.user;
          return {
            label: user.username,
            value: user.id
          };
        });
	
	const select = new StringSelectMenuBuilder()
		  .setCustomId(IDS.select.banned_users)
		  .setPlaceholder(t(lang, 'commands.unban.select_placeholder'))
		  .addOptions(options);
	const selectorComponent = new ActionRowBuilder().addComponents(select);
	await interaction.editReply({ content: t(lang, 'commands.unban.select_title'), components: [selectorComponent] });
}
