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
  /*.addUserOption(option => option.setName('user')
                                 .setDescription('The user to unban')
								 .setRequired(true)
  )*/
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
	await interaction.deferReply()
	const user = interaction.options.getUser('user')
	const lang = getLangFromInteraction(interaction)
	const bannedUsers= await interaction.guild.bans.fetch()


	const options = bannedUsers.map(ban => {
          const user = ban.user;
          return {
            label: user.username,
            value: user.id
          };
        });
	
	const select = new StringSelectMenuBuilder()
		  .setCustomId(IDS.select.banned_users)
		  .setPlaceholder('Sélectionne un utilisateur banni...')
		  .addOptions(options);
	const selectorComponent = new ActionRowBuilder().addComponents(select);
	await interaction.editReply({ content: "Liste des users ban", components: [selectorComponent] });
	/*
	try {
		await interaction.guild.members.unban(user.id);
	} catch {
		return interaction.editReply({ content: `${t(lang, 'commands.unban.error1')} ${user.tag}. ${t(lang, 'commands.unban.error2')}` });
	}
	return interaction.editReply({ content: `<@${user.id}> ${t(lang, 'commands.unban.success')}`});*/
}
