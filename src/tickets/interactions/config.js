import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  MessageFlags,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { IDS, EMOJIS } from '../../constants.js'
import { t } from '../../i18n/index.js'
import { wrapInRow } from '../../utils/ui.js'

export async function handleConfigStep1(interaction) {
  await interaction.deferUpdate()
  const lang = interaction.customId.split('$')[1]

  const text = new TextDisplayBuilder().setContent(t(lang, 'config.step1.title'))
  const buttonCreateCategory = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.configStep2}$${lang}$create-category`)
    .setLabel(t(lang, 'config.step1.create'))
    .setStyle(1)
  const buttonUseACategory = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.configStep2}$${lang}$use-a-category`)
    .setLabel(t(lang, 'config.step1.use'))
    .setStyle(1)
  const buttonDontUseACategory = new ButtonBuilder()
    .setCustomId(`${IDS.tickets.configStep3}$${lang}$dont-use-a-category$`)
    .setLabel(t(lang, 'config.step1.none'))
    .setStyle(2)

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        buttonCreateCategory,
        buttonUseACategory,
        buttonDontUseACategory
      )
    )

  await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
  return true
}

export async function handleConfigStep2(interaction) {
  const lang = interaction.customId.split('$')[1]
  const categoryChoice = interaction.customId.split('$')[2]

  if (categoryChoice === 'create-category') {
    const modal = new ModalBuilder()
      .setCustomId(`${IDS.tickets.modalCreateCategory}$${lang}$${categoryChoice}`)
      .setTitle(t(lang, 'config.modal.create_category.title'))
    const categoryNameInput = new TextInputBuilder()
      .setCustomId('category-name')
      .setStyle(TextInputStyle.Short)
      .setLabel(t(lang, 'config.modal.create_category.name'))
      .setPlaceholder(t(lang, 'config.modal.create_category.placeholder'))
      .setRequired(true)

    modal.addComponents(wrapInRow(categoryNameInput))
    await interaction.showModal(modal)
    return true
  }

  await interaction.deferUpdate()

  const text = new TextDisplayBuilder().setContent(t(lang, 'config.step2.select_category'))
  const categories = interaction.guild.channels.cache.filter(c => c.type === 4)
  const categoryMenu = new StringSelectMenuBuilder()
    .setCustomId(`${IDS.tickets.configStep3}$${lang}$${categoryChoice}`)
    .setPlaceholder(t(lang, 'config.select.placeholder_category'))
    .setMinValues(1)
    .setMaxValues(1)

  categories.forEach(category => {
    categoryMenu.addOptions({
      label: category.name,
      value: category.id,
      emoji: EMOJIS.CATEGORY,
    })
  })

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(new ActionRowBuilder().addComponents(categoryMenu))
  await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
  return true
}

export async function handleConfigStep3(interaction) {
  await interaction.deferUpdate()

  const lang = interaction.customId.split('$')[1]
  const categoryChoice = interaction.customId.split('$')[2]
  const categoryId = interaction.customId.split('$')[3] || ''

  const text = new TextDisplayBuilder().setContent(t(lang, 'config.step3.select_role'))
  const roles = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id)
  const roleMenu = new StringSelectMenuBuilder()
    .setCustomId(`${IDS.tickets.configStep4}$${lang}$${categoryChoice}$${categoryId}`)
    .setPlaceholder(t(lang, 'config.select.placeholder_role'))
    .setMinValues(1)
    .setMaxValues(1)

  roles.forEach(role => {
    roleMenu.addOptions({
      label: role.name,
      value: role.id,
      emoji: EMOJIS.MENTION,
    })
  })

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(new ActionRowBuilder().addComponents(roleMenu))

  await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
  return true
}

export async function handleCreateCategoryModal(interaction) {
  await interaction.deferUpdate()

  const lang = interaction.customId.split('$')[1]
  const categoryChoice = interaction.customId.split('$')[2]
  const categoryName = interaction.fields.getTextInputValue('category-name')

  let category
  try {
    category = await interaction.guild.channels.create({ name: categoryName, type: 4 })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ content: t(lang, 'config.error'), flags: MessageFlags.Ephemeral })
    return true
  }

  const text = new TextDisplayBuilder().setContent(t(lang, 'config.step3.select_role'))
  const roles = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id)
  const roleMenu = new StringSelectMenuBuilder()
    .setCustomId(`${IDS.tickets.configStep4}$${lang}$${categoryChoice}$${category.id}`)
    .setPlaceholder(t(lang, 'config.select.placeholder_role'))
    .setMinValues(1)
    .setMaxValues(1)

  roles.forEach(role => {
    roleMenu.addOptions({
      label: role.name,
      value: role.id,
      emoji: EMOJIS.MENTION,
    })
  })

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text)
    .addActionRowComponents(new ActionRowBuilder().addComponents(roleMenu))

  await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
  return true
}
