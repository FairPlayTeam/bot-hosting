require('dotenv').config()
const token = process.env.TOKEN

const {
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
} = require('discord.js')

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
        name: 'Watch tickets askings',
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
      "### <:flag_EN:1426254582937288846> Need to contact the staff? You're in the right place!\nYou've **two** available ticket types but select a language before (looks English for you)! <:pepewow:1400572079585362054>\n" +
      "### <:flag_FR:1426254585248616569> Besoin de contacter l'équipe ? Vous êtes au bon endroit !\n Vous avez le choix entre **deux** types de ticket mais séléctionnez une langue avant cela (cela semble être le français pour vous) ! <:PepeHappy:1400572075911020695>"
    )

    const optionEnglish = new StringSelectMenuOptionBuilder()
      .setEmoji('<:flag_EN:1426254582937288846>')
      .setLabel('English')
      .setValue('en')

    const optionFrench = new StringSelectMenuOptionBuilder()
      .setEmoji('<:flag_FR:1426254585248616569>')
      .setLabel('French')
      .setValue('fr')

    const menu = new StringSelectMenuBuilder()
      .setCutomId("tickets_lang-menu")
      .addOptions(
        optionEnglish,
        optionFrench
      )

    const actionRowMenu = new ActionRowBuilder().addComponents(menu)

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowMenu)

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    })
  }
})

client.login(token)
