import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url' 
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
    
} from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('restart')
  .setDescription('Restart the bot (only for admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async interaction => {
    await interaction.reply({ content: 'Restarting the bot ...'})
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const scriptPath = path.join(__dirname, '../utils/restart.sh')
    const platform = os.platform()
    
    if (platform === 'win32') {
        spawn('cmd.exe', ['/c', 'utils\\update.bat'], { stdio: 'inherit' })
    } else {
        spawn('bash', [scriptPath], { stdio: 'inherit' })
    }
    process.exit(0)
    
}