import {
	Events,
	AttachmentBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
    Webhook,
    MessageFlags,
} from 'discord.js'
import axios from 'axios'
import { t, getLangFromInteraction } from '../i18n/index.js'    

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
