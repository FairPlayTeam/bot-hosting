import {
	SlashCommandBuilder,
	PermissionFlagsBits,
    MessageFlags,
} from 'discord.js'
import { store } from '../bot.js'

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

export const execute = async interaction => {
    await interaction.deferReply()
    const word = interaction.options.getString("word")
    const message = interaction.options.getString('message')
    store.addAutoReply(interaction.guild.id,word, message )
    await interaction.editReply({ content : "Successfully added !" })
    
    
    return
}
