import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits,
  ActivityType,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  Events,
} from 'discord.js'

const token = process.env.TOKEN

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildEmojisAndStickers, // 'GuildEmojisAndStickers' is deprecated
    GatewayIntentBits.GuildMessageReactions,
  ],
  presence: {
    status: 'online',
    activities: [
      {
        name: 'Regarde les demandes de tickets',
        type: ActivityType.Watching,
      },
    ],
  },
})

// tickets categ roles and queues are unused but ill leave it here also i suggest using a db instead of json :p
// if the jsons were missing they throwd an error but use a db please
if (!fs.existsSync('tickets.json')) {
  fs.writeFileSync('tickets.json', JSON.stringify({}))
}
const dataTickets = fs.readFileSync('tickets.json', 'utf8')
let tickets = JSON.parse(dataTickets)

if (!fs.existsSync('categories.json')) {
  fs.writeFileSync('categories.json', JSON.stringify({}))
}
const dataCategories = fs.readFileSync('categories.json', 'utf8')
let categories = JSON.parse(dataCategories)

if (!fs.existsSync('roles.json')) {
  fs.writeFileSync('roles.json', JSON.stringify({}))
}
const dataRoles = fs.readFileSync('roles.json', 'utf8')
let roles = JSON.parse(dataRoles)

if (!fs.existsSync('queue.json')) {
  fs.writeFileSync('queue.json', JSON.stringify({}))
}
const dataQueue = fs.readFileSync('queue.json', 'utf8')
let queue = JSON.parse(dataQueue)

const commands = [
  new SlashCommandBuilder()
    .setName('tickets_show-container')
    .setDescription("Affiche l'embed dans le salon où la commande est exécutée")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

;(async appId => {
  try {
    await rest.put(Routes.applicationCommands(appId), { body: commands })
    console.log('Commandes enregistrées avec succès !')
  } catch (error) {
    console.error(error)
  }
})('1425714937547984947')

client.on(Events.ClientReady, () => {
  console.log('The bot is connected!')
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'tickets_show-container') {
    await interaction.deferReply({ ephemeral: true })

    const text = new TextDisplayBuilder().setContent(
      "### Want to contact the staff? You're in the right place!\nYou've **four** available ticket types.\nChoose one to create a ticket <:pepewow:1400572079585362054>!"
    )

    const option1 = new StringSelectMenuOptionBuilder()
      .setEmoji('<:FancyPepe:1412127458894942329>')
      .setLabel('Type 1')
      .setValue('type1')

    const option2 = new StringSelectMenuOptionBuilder()
      .setEmoji('<:FancyPepe:1412127458894942329>')
      .setLabel('Type 2')
      .setValue('type2')

    const option3 = new StringSelectMenuOptionBuilder()
      .setEmoji('<:FancyPepe:1412127458894942329>')
      .setLabel('Type 3')
      .setValue('type3')

    const option4 = new StringSelectMenuOptionBuilder()
      .setEmoji('<:FancyPepe:1412127458894942329>')
      .setLabel('Type 4')
      .setValue('type4')

    const menu = new StringSelectMenuBuilder()
      .setCutomId("tickets_types-menu")
      .addOptions(
        option1,
        option2,
        option3,
        option4
      )

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(
        new ActionRowBuilder()
          .addComponents(menu)
      )

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    })
  }
})

client.login(token)
