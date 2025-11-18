import {
	SlashCommandBuilder,
	PermissionFlagsBits
} from 'discord.js'
import { store } from '../bot.js'

export const data = new SlashCommandBuilder()
  .setName('delete_an_auto-reply')
  .setDescription('Remove a reaction that the bot sends when it detects a word')
  .addStringOption(option => option.setName('word')
                                 .setDescription('The word to detect')
								 .setRequired(true)
  )
 .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
    await interaction.deferReply()
    const word = interaction.options.getString("word")
    store.deleteAutoReply(interaction.guild.id,word )
    await interaction.editReply({ content : "Successfully deleted !" })
    
    return
}