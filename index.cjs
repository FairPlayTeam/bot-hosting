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
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('discord.js')

const fs=require('fs')

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

    const buttonEnglish = new ButtonBuilder()
      .setCustomId('tickets_lang-en')
      .setLabel('English')
      .setStyle(1)
      .setEmoji('1426254582937288846')
    
    const buttonFrench = new ButtonBuilder()
      .setCustomId('tickets_lang-fr')
      .setLabel('Français')
      .setStyle(1)
      .setEmoji('1426254585248616569')

    const actionRowMenu = new ActionRowBuilder().addComponents(buttonEnglish, buttonFrench)

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowMenu)

    await interaction.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    })

    await interaction.editReply({
      content: 'The container has been sent!'
    })
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId.substr(0,12) === 'tickets_lang') {
    await interaction.deferReply({ ephemeral: true })

    let textStr=""
    let menuTab=[]

    if (interaction.customId === 'tickets_lang-en') {
      textStr = "### Choose a ticket type\nIf you want to do a partnership, please contact a staff member directly in DM."
      menuTab = ["Help", "Candidate"]
      menuTab["placeholder"] = "Select a ticket type"
    } else {
      textStr = "### Choisissez un type de ticket\nSi vous souhaitez faire un partenariat, veuillez contacter un membre du personnel directement en MP."
      menuTab = ["Aide", "Postuler"]
      menuTab["placeholder"] = "Sélectionnez un type de ticket"
    }

    const text = new TextDisplayBuilder().setContent(textStr)

    const helpOption = new StringSelectMenuOptionBuilder()
      .setLabel(menuTab[0])
      .setValue('help')
      .setEmoji('❓')

    const candidateOption = new StringSelectMenuOptionBuilder()
      .setLabel(menuTab[1])
      .setValue('candidate')
      .setEmoji('📝')
    
    const menu = new StringSelectMenuBuilder()
      .setCustomId("tickets_type-menu")
      .setPlaceholder(menuTab["placeholder"])
      .addOptions(
        helpOption,
        candidateOption
      )
    
    const actionRowMenu = new ActionRowBuilder().addComponents(menu)

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowMenu)

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    })
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'tickets_type-menu') {
    await interaction.deferUpdate() // we will never update the message just create a new channel

    const selected = interaction.values[0]

    const channel=await interaction.guild.channels.create({
      name: `${selected === "help" ? "❓" : "📝"}${interaction.user.username}`,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [ PermissionFlagsBits.ViewChannel ]
        },
        {
          id: interaction.user.id,
          allow: [ PermissionFlagsBits.ViewChannel ]
        }
      ]
    })

    await channel.send({
      content: `<@${interaction.user.id}>`
    })
  }
})

client.login(token)
