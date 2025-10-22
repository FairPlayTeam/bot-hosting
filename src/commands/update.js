import * as os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('update')
  .setDescription('Update the bot (only for admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const execute = async (interaction) => {
  await interaction.reply({ content: '🔄 Updating the bot...' })

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const scriptPath = path.join(__dirname, '../utils/update.sh')

  const platform = os.platform()
  console.log(`Running update script on ${platform}...`)

  const updateProcess = spawn(scriptPath, {
    shell: true,
    stdio: 'inherit'
  })

  updateProcess.on('close', (code) => {
    console.log(`Update script exited with code ${code}`)
    process.exit(code)
  })

  updateProcess.on('error', (err) => {
    console.error('Failed to start update script:', err)
    interaction.followUp({ content: '❌ Failed to start update script.' })
  })
}
