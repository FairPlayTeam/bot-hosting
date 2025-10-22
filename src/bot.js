import dotenv from 'dotenv'
dotenv.config({ quiet: true })
const token = process.env.TOKEN
const clientId = process.env.CLIENT_ID

import { Client, GatewayIntentBits, ActivityType, Events, Routes } from 'discord.js'
import { REST } from '@discordjs/rest'

import { JsonStore } from './storage/jsonStore.js'
import { t } from './i18n/index.js'
import { LANG } from './constants.js'

import * as vanish from './commands/vanish.js'
import * as ticketsShow from './commands/tickets_show-container.js'
import * as ticketsConfig from './commands/tickets_config.js'
import * as ban from './commands/ban.js'
import * as say from './commands/say.js'
import * as update from './commands/update.js'
import * as restart from './commands/restart.js'
import * as snipe from './commands/snipe.js'
import * as unban from './commands/unban.js'


import { routeInteraction } from './interactions/router.js'
import { onMessageCreate } from './events/messageCreate.js'
import { onMessageDelete } from './events/messageDelete.js'
import { onGuildMemberAdd } from './events/guildMemberAdd.js'

if (!token) {
  console.error('TOKEN is not set; cannot start bot')
  process.exit(1)
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  presence: {
    status: 'online',
    activities: [{ name: t(LANG.DEFAULT, 'presence.watching'), type: ActivityType.Watching }],
  },
})

export const store = new JsonStore('data.json')

const commandModules = [vanish, ticketsShow, ticketsConfig, ban, say, update, restart, snipe, unban]
const commands = commandModules.map(c => c.data.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

async function registerCommands() {
  if (!clientId) {
    console.warn('CLIENT_ID is not set; skipping command registration')
    return
  }
  await rest.put(Routes.applicationCommands(clientId), { body: commands })
  console.log('Commands registered')
}

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const mod = commandModules.find(m => m.data.name === interaction.commandName)
    if (mod?.execute) {
      await mod.execute(interaction, { store })
    }
    return
  }
  await routeInteraction(interaction, { store })
})

client.on(Events.MessageCreate, onMessageCreate(store))
client.on(Events.MessageDelete, onMessageDelete(store))
client.on(Events.GuildMemberAdd, onGuildMemberAdd())

registerCommands().catch(console.error)
client.login(token)