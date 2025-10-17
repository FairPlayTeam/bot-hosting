import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url' 
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
    MessageFlags
} from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('update')
  .setDescription('Update the bot (only for admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
    await interaction.reply({ content: 'Updating the bot ...'})
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const scriptPath = path.join(__dirname, '../utils/update.sh')
    const platform = os.platform()
    
    if (platform === 'win32') {
        spawn('start "" "../utils/update.bat"')
    } else {
        spawn('bash', [scriptPath], { stdio: 'inherit' })
    }
    process.exit(0)
    
}