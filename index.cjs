import dotenv from 'dotenv'
dotenv.config()
const token = process.env.TOKEN

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
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
} from 'discord.js'

import fs from 'fs'

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

    const helpButton = new ButtonBuilder()
      .setCustomId('tickets_type-help')
      .setLabel(menuTab[0])
      .setStyle(1)
      .setEmoji('❓')

    const candidateButton = new ButtonBuilder()
      .setCustomId(`tickets_type-candidate-${interaction.customId.substr(13)}`)
      .setLabel(menuTab[1])
      .setStyle(1)
      .setEmoji('📝')

    const actionRowMenu = new ActionRowBuilder().addComponents(
      helpButton,
      candidateButton
    )

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
  if (!interaction.isButton()) return;

  if (interaction.customId.substr(0, 12) === 'tickets_type') {
    if (interaction.customId.substr(0, 17) === 'tickets_type-help') {
      await interaction.deferReply({ ephemeral: true })
      const channel = await interaction.guild.channels.create({
        name: `❓${interaction.user.username}`,
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

      await interaction.editReply({
        content: `👀 <#${channel.id}>`
      })
    } else {
      const modal = new ModalBuilder()
        .setCustomId(`tickets_modal-get-user-informations-candidate-${interaction.customId.substr(13)}`)
        .setTitle(interaction.customId.substr(23) === 'en' ? "Become staff of FairPlay" : "Faire partie de l'équipe de FairPlay")

      const ageInput = new TextInputBuilder()
        .setCustomId("age")
        .setStyle(TextInputStyle.Short)
        .setLabel(interaction.customId.substr(23) === 'en' ? "How old are you?" : "Quel âge avez-vous ?")
        .setPlaceholder(interaction.customId.substr(23) === 'en' ? "16 years old" : "16 ans")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(12)
      
      const positionInput = new TextInputBuilder()
        .setCustomId("position")
        .setStyle(TextInputStyle.Short)
        .setLabel(interaction.customId.substr(23) === 'en' ? "What position are you applying for?" : "Quel poste voulez-vous occuper ?")
        .setPlaceholder(interaction.customId.substr(23) === 'en' ? "Developer" : "Développeur")
        .setRequired(true)
        .setMinLength(5)
        .setMaxLength(25)
      
      const detailInput = new TextInputBuilder()
        .setCustomId("detail")
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(interaction.customId.substr(23) === 'en' ? "Why do you want to do this in detail?" : "Que voulez vous faire ?")
        .setPlaceholder(interaction.customId.substr(23) === 'en' ? "I want to be developer in FairPlay because I want to create a bot to become the server active" : "Je veux être développeur chez FairPlay car je souhaite créer un bot pour rendre le serveur actif")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(4000)
      
      const qualitiesInput = new TextInputBuilder()
        .setCustomId("qualities")
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(interaction.customId.substr(23) === 'en' ? "What are your qualities and your defects?" : "Quelles sont vos qualités et vos défauts ?")
        .setPlaceholder(interaction.customId.substr(23) === 'en' ? "I am a team player, then I have good communication skills..." : "Je suis un joueur d'équipe, donc j'ai de bonnes compétences en communication...")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(4000)

      const remuneratedInput = new TextInputBuilder()
        .setCustomId("remunerated")
        .setStyle(TextInputStyle.Short)
        .setLabel(interaction.customId.substr(23) === 'en' ? "I want to be remunerated" : "Je veux être rémunéré")
        .setPlaceholder(interaction.customId.substr(23) === 'en' ? "Yes" : "Oui")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(3)

      const inAnActionRow = component => {
        return new ActionRowBuilder().addComponents(component)
      }

      modal.addComponents(
        inAnActionRow(ageInput),
        inAnActionRow(positionInput),
        inAnActionRow(detailInput),
        inAnActionRow(qualitiesInput),
        inAnActionRow(remuneratedInput)
      )

      await interaction.showModal(modal)
      return
    }
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId.substr(0, 39) === 'tickets_modal-get-user-informations') {
    const age = interaction.fields.getTextInputValue('age')
    const position = interaction.fields.getTextInputValue('position')
    const detail = interaction.fields.getTextInputValue('detail')
    const qualities = interaction.fields.getTextInputValue('qualities')
    const remunerated = interaction.fields.getTextInputValue('remunerated')


  }
})

client.login(token)
