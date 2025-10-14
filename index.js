import dotenv from 'dotenv'
dotenv.config()
const token = process.env.TOKEN

import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
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
  ButtonStyle,
  StringSelectMenuBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from 'discord.js'

import { REST } from '@discordjs/rest'

import fs from 'fs'
import { text } from 'stream/consumers'

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
    activities: [
      {
        name: 'Watch tickets askings',
        type: ActivityType.Watching,
      }
    ]
  }
})

if (!fs.existsSync('data.json')) {
  fs.writeFileSync('data.json', JSON.stringify({}))
}
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'))

const commands = [
  new SlashCommandBuilder()
    .setName('tickets_show-container')
    .setDescription("Affiche l'embed dans le salon où la commande est exécutée")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('tickets_config')
    .setDescription("Configure la fonction ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map(command => command.toJSON())

const rest = new REST({
  version: '10'
}).setToken(token)

;(async appId => {
  try {
    await rest.put(Routes.applicationCommands(appId), { body: commands })
    console.log('Putting commands has been done!')
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

    const textEn1 = new TextDisplayBuilder().setContent("### <:flag_EN:1426254582937288846> Need to contact the staff? You're in the right place!")
    const textEn2 = new TextDisplayBuilder().setContent("You've **two** available ticket types! <:pepewow:1400572079585362054> Choose one!")
    const textFr1 = new TextDisplayBuilder().setContent("### <:flag_FR:1426254585248616569> Besoin de contacter l'équipe ? Vous êtes au bon endroit !")
    const textFr2 = new TextDisplayBuilder().setContent("Vous avez le choix entre **deux** types de ticket ! <:PepeHappy:1400572075911020695> Choisissez-en un !")

    const helpButtonEn = new ButtonBuilder()
      .setCustomId(`tickets_type-help-en`)
      .setLabel("Help")
      .setStyle(1)
      .setEmoji('❓')

    const candidateButtonEn = new ButtonBuilder()
      .setCustomId(`tickets_type-candidate-en`)
      .setLabel("Candidate")
      .setStyle(1)
      .setEmoji('📝')

    const helpButtonFr = new ButtonBuilder()
      .setCustomId(`tickets_type-help-fr`)
      .setLabel("Aide")
      .setStyle(1)
      .setEmoji('❓')

    const candidateButtonFr = new ButtonBuilder()
      .setCustomId(`tickets_type-candidate-fr`)
      .setLabel("Postuler")
      .setStyle(1)
      .setEmoji('📝')

    const sectionEn1 = new SectionBuilder()
      .addTextDisplayComponents(textEn1)
      .setButtonAccessory(helpButtonEn)

    const sectionEn2 = new SectionBuilder()
      .addTextDisplayComponents(textEn2)
      .setButtonAccessory(candidateButtonEn)

    const sectionFr1 = new SectionBuilder()
      .addTextDisplayComponents(textFr1)
      .setButtonAccessory(helpButtonFr)

    const sectionFr2 = new SectionBuilder()
      .addTextDisplayComponents(textFr2)
      .setButtonAccessory(candidateButtonFr)

    const separator = new SeparatorBuilder()
      .setDivider(true)
      .setSpacing(SeparatorSpacingSize.Small)
    
    const container = new ContainerBuilder()
      .addSectionComponents(sectionEn1)
      .addSectionComponents(sectionEn2)
      .addSeparatorComponents(separator)
      .addSectionComponents(sectionFr1)
      .addSectionComponents(sectionFr2)

    await interaction.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    })

    await interaction.editReply({
      content: 'The container has been sent!'
    })
  } else if (interaction.commandName === 'tickets_config') {
    await interaction.deferReply()
    if(!data[interaction.guild.id]) {
      const text = new TextDisplayBuilder().setContent("### Choose your language")
      const buttonEnglish = new ButtonBuilder()
      .setCustomId('tickets_config-step1$en')
      .setLabel('English')
      .setStyle(1)
      .setEmoji('1426254582937288846')
    
    const buttonFrench = new ButtonBuilder()
      .setCustomId('tickets_config-step1$fr')
      .setLabel('Français')
      .setStyle(1)
      .setEmoji('1426254585248616569')

    const actionRowLanguages = new ActionRowBuilder().addComponents(
      buttonEnglish,
      buttonFrench
    )

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowLanguages)

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      })
    }
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
  } else if (interaction.customId.substr(0, 12) === 'tickets_type') {
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

      const lang = interaction.customId.substr(18)

      const text = new TextDisplayBuilder().setContent(lang === 'en' ? 
        `### Welcome to your new ticket <@${interaction.user.id}>! <:Pepega:1400572073881112666>\nTicket type: \`help\`\n**__Please describe your problem in detail and the team will respond in time.__**`
        :
        `### Bienvenue dans votre nouveau ticket <@${interaction.user.id}>! <:Pepega:1400572073881112666>\nType de ticket : \`aide\`\n**__Veuillez décrire votre problème en détail et l'équipe vous répondra dans les temps.__**`
      )

      const buttonClose = new ButtonBuilder()
        .setCustomId(`ticket_close-${lang}`)
        .setLabel(lang === 'en' ? 'Close' : 'Fermer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒')

      const buttonProcess = new ButtonBuilder()
        .setCustomId(`ticket_process-${lang}`)
        .setLabel(lang === 'en' ? 'Process' : 'Traiter')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🙋‍♂️')

      const actionRowButtons = new ActionRowBuilder().addComponents(
        buttonClose,
        buttonProcess
      )
    
      const container = new ContainerBuilder()
        .addTextDisplayComponents(text)
        .addActionRowComponents(actionRowButtons)

      await channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
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
        .setMaxLength(1500)
      
      const qualitiesInput = new TextInputBuilder()
        .setCustomId("qualities")
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(interaction.customId.substr(23) === 'en' ? "What are your qualities and your defects?" : "Quelles sont vos qualités et vos défauts ?")
        .setPlaceholder(interaction.customId.substr(23) === 'en' ? "I am a team player, then I have good communication skills..." : "Je suis un joueur d'équipe, donc j'ai de bonnes compétences en communication...")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(1500)

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
  } else if (interaction.customId.substr(0,20) === 'tickets_config-step1') {
    await interaction.deferUpdate()

    const lang = interaction.customId.split('$')[1]

    const text = new TextDisplayBuilder().setContent(lang === 'en' ? "### In witch category would you like that the ticket will be created?" : "### Dans quelle catégorie souhaitez-vous que les tickets soit créés ?")
    
    const buttonCreateCategory = new ButtonBuilder()
      .setCustomId(`tickets_config-step2$${lang}$create-category`)
      .setLabel(lang === 'en' ? 'Create a category' : 'Créer une catégorie')
      .setStyle(1)
    
    const buttonUseACategory = new ButtonBuilder()
      .setCustomId(`tickets_config-step2$${lang}$use-a-category`)
      .setLabel(lang === 'en' ? 'Use an existing category' : 'Utiliser une catégorie existante')
      .setStyle(1)

    const buttonDontUseACategory = new ButtonBuilder()
      .setCustomId(`tickets_config-3$${lang}$dont-use-a-category$`)
      .setLabel(lang === 'en' ? 'Don\'t use a category' : 'Ne pas utiliser de catégorie')
      .setStyle(2)

    const actionRowButtons = new ActionRowBuilder().addComponents(
      buttonCreateCategory,
      buttonUseACategory,
      buttonDontUseACategory
    )

    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowButtons)

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    })
  } else if (interaction.customId.substr(0,20) === 'tickets_config-step2') {
    const lang = interaction.customId.split('$')[1]
    const categoryChoice = interaction.customId.split('$')[2]

    if (categoryChoice === 'create-category') {
      const modal = new ModalBuilder()
        .setCustomId(`tickets_modal-create-category$${lang}$${categoryChoice}`)
        .setTitle(lang === 'en' ? "Create a category" : "Créer une catégorie")

      const categoryNameInput = new TextInputBuilder()
        .setCustomId("category-name")
        .setStyle(TextInputStyle.Short)
        .setLabel(lang === 'en' ? "Category Name" : "Nom de la catégorie")
        .setPlaceholder(lang === 'en' ? "Enter category name" : "Entrez le nom de la catégorie")
        .setRequired(true)

      const inAnActionRow = component => {
        return new ActionRowBuilder().addComponents(component)
      }

      modal.addComponents(
        inAnActionRow(categoryNameInput)
      )
      await interaction.showModal(modal)
      return;
    } else {
      await interaction.deferUpdate()

      const text = new TextDisplayBuilder().setContent(lang === 'en' ? "### Please select a category" : "### Séléctionnez une catégorie")

      const categories = interaction.guild.channels.cache.filter(c => c.type === 4)

      const categoryMenu = new StringSelectMenuBuilder()
        .setCustomId(`tickets_config-step3$${lang}$${categoryChoice}`)
        .setPlaceholder(lang === 'en' ? "No category selected" : "Aucune catégorie séléctionnée")
        .setMinValues(1)
        .setMaxValues(1)

      categories.forEach(category => {
        categoryMenu.addOptions({
          label: category.name,
          value: category.id,
          emoji: '<a:iconTextChannel:843595665996906496>'
        })
      })

      const actionRowMenu = new ActionRowBuilder().addComponents(categoryMenu)

      const container = new ContainerBuilder()
        .addTextDisplayComponents(text)
        .addActionRowComponents(actionRowMenu)

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      })
    }
  } else if (interaction.customId.substr(0,12) === 'ticket_close') {
    await interaction.deferReply()
    const lang = interaction.customId.split('-')[1]

    const buttonYes = new ButtonBuilder()
      .setCustomId(`ticket_close-yes-${lang}`)
      .setLabel(lang === 'en' ? 'Yes' : 'Oui')
      .setStyle(ButtonStyle.Danger)

    const buttonNo = new ButtonBuilder()
      .setCustomId(`ticket_close-no-${lang}`)
      .setLabel(lang === 'en' ? 'No' : 'Non')
      .setStyle(ButtonStyle.Success)

    const actionRowButtons = new ActionRowBuilder().addComponents(
      buttonYes,
      buttonNo
    )

    await interaction.editReply({
      content: lang === 'en' ? "Are you sure to close this ticket?" : "Êtes-vous sûr de vouloir fermer ce ticket ?",
      components: [actionRowButtons]
    })
  } else if (interaction.customId.substr(0,14) === 'ticket_process') {
    await interaction.deferReply({ ephemeral: true })
    const lang = interaction.customId.split('-')[1]
    
    await interaction.channel.send({
      content: lang === 'en' ? `This ticket is now processed by <@${interaction.user.id}>!` : `Ce ticket est maintenant traité par <@${interaction.user.id}>!`
    })

    await interaction.editReply({
      content: lang === 'en' ? "You are now processing this ticket!" : "Vous traitez maintenant ce ticket !"
    })
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId.substr(0, 45) === 'tickets_modal-get-user-informations-candidate') {
    const age = interaction.fields.getTextInputValue('age')
    const position = interaction.fields.getTextInputValue('position')
    const detail = interaction.fields.getTextInputValue('detail')
    const qualities = interaction.fields.getTextInputValue('qualities')
    const remunerated = interaction.fields.getTextInputValue('remunerated')
    const lang = interaction.customId.substr(56)

    await interaction.deferReply({ ephemeral: true })

    const channel = await interaction.guild.channels.create({
      name: `📝${interaction.user.username}`,
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

    const text = new TextDisplayBuilder().setContent(lang === 'en' ? 
      `### Welcome to your new ticket <@${interaction.user.id}>! <:Pepega:1400572073881112666>\nTicket type: \`candidate\`\nTicket language: \`English\`\nAge: \`${age}\`\nPosition: \`${position}\`\nDetails: \`\`\`${detail}\`\`\`\nQualities/defects: \`\`\`${qualities}\`\`\`\nWants to be remunerated: \`${remunerated}\``
      :
      `### Bienvenue dans votre nouveau ticket <@${interaction.user.id}>! <:Pepega:1400572073881112666>\nType de ticket : \`postuler\`\nLangue du ticket : \`Français\`\nÂge : \`${age}\`\nPoste désiré : \`${position}\`\nDétails : \`\`\`${detail}\`\`\`\nQualités/défauts : \`\`\`${qualities}\`\`\`\nVeut être rémunéré ? : \`${remunerated}\``
    )

    const buttonClose = new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel(lang === 'en' ? 'Close' : 'Fermer')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')

    const buttonProcess = new ButtonBuilder()
      .setCustomId('ticket_process')
      .setLabel(lang === 'en' ? 'Process' : 'Traiter')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🙋‍♂️')

    const actionRowButtons = new ActionRowBuilder().addComponents(
      buttonClose,
      buttonProcess
    )
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowButtons)

    await channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    })

    await interaction.editReply({
      content: `👀 <#${channel.id}>`
    })
  } else if (interaction.customId.substr(0, 29) === 'tickets_modal-create-category') {
    await interaction.deferUpdate()

    const lang = interaction.customId.split('$')[1]
    const categoryChoice = interaction.customId.split('$')[2]
    const categoryName = interaction.fields.getTextInputValue('category-name')

    let category;

    try {
      category = await interaction.guild.channels.create({
        name: categoryName,
        type: 4
      })
    } catch (error) {
      console.error(error)
      await interaction.editReply({
        content: lang === 'en' ? 'An error occurred while creating the category. Please try again later or contact the developer' : 'Une erreur est survenue lors de la création de la catégorie. Veuillez réessayer plus tard ou contacter le développeur.',
        ephemeral: true
      })
      return;
    }

    const text = new TextDisplayBuilder().setContent(lang === 'en' ? "### Please select a staff role (to ping)" : "### Séléctionnez un rôle staff (à ping)")

    const roles = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id)
    
    const roleMenu = new StringSelectMenuBuilder()
      .setCustomId(`tickets_config-step4$${lang}$${categoryChoice}$${category.id}`)
      .setPlaceholder(lang === 'en' ? "No role selected" : "Aucun rôle séléctionné")
      .setMinValues(1)
      .setMaxValues(1)

    roles.forEach(role => {
      roleMenu.addOptions({
        label: role.name,
        value: role.id,
        emoji: '<a:iconMention:843530621951541249>'
      })
    })

    const actionRowMenu = new ActionRowBuilder().addComponents(roleMenu)
    
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
  if (interaction.customId.substr(0,20) === 'tickets_config-step3') {
    await interaction.deferUpdate()
    const lang = interaction.customId.split('$')[1]
    const categoryChoice = interaction.customId.split('$')[2]
    const categoryId = interaction.values[0]

    const text = new TextDisplayBuilder().setContent(lang === 'en' ? "### Please select a staff role (to ping)" : "### Séléctionnez un rôle staff (à ping)")

    const roles = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id)
    
    const roleMenu = new StringSelectMenuBuilder()
      .setCustomId(`tickets_config-step4$${lang}$${categoryChoice}$${categoryId}`)
      .setPlaceholder(lang === 'en' ? "No role selected" : "Aucun rôle séléctionné")
      .setMinValues(1)
      .setMaxValues(1)

    roles.forEach(role => {
      roleMenu.addOptions({
        label: role.name,
        value: role.id,
        emoji: '<a:iconMention:843530621951541249>'
      })
    })

    const actionRowMenu = new ActionRowBuilder().addComponents(roleMenu)
    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(text)
      .addActionRowComponents(actionRowMenu)
    
    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    })
  }
})

client.login(token)
