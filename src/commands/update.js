import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url' 
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
    
} from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('update')
  .setDescription('Update the bot (only for admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
  console.log("Updating the bot")
    await interaction.deferReply();
    await interaction.editReply('Updating the bot...');
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const scriptPath = path.join(__dirname, '../utils/update.sh')
  
    

    spawn(scriptPath, { shell: true, stdio: 'inherit' })
    
    setTimeout(() => process.exit(0), 5000)
    
}
