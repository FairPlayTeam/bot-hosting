import { SlashCommandBuilder } from 'discord.js'
import { store } from '../bot.js'

export const data = new SlashCommandBuilder()
  .setName('show_auto-reply')
  .setDescription('Display all the words in the autoreply list')
  
export const execute = async interaction => {
    await interaction.deferReply()
    const dico = store.getAutoReply(interaction.guild.id)
    if(dico.size ===0) await interaction.editReply({content : "No autoreply saved"})
    
    const text = Object.entries(dico)
        .map(([key, value]) => `${key} → ${value}`)
        .join('\n');
    await interaction.editReply({ content : text })
    
    return
}
