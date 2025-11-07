import {
	SlashCommandBuilder,
	PermissionFlagsBits,
    MessageFlags,
} from 'discord.js'
import { store } from '../bot.js'

export const data = new SlashCommandBuilder()
  .setName('delete_an_auto-reply')
  .setDescription('Add a reaction that the bot will send when it detects a word')
  .addStringOption(option => option.setName('word')
                                 .setDescription('The word to be detected')
								 .setRequired(true)
  )
 

export const execute = async interaction => {
    await interaction.deferReply()
    const word = interaction.options.getString("word")
    store.deleteAutoReply(interaction.guild.id,word )
    await interaction.editReply({ content : "Successfully deleted !" })
    
    
    return
}
