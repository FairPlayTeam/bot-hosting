import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
  MediaGalleryItemBuilder,
  MediaGalleryBuilder
} from 'discord.js'
import { IDS, EMOJIS } from '../constants.js'
import { t ,getLangFromInteraction} from '../i18n/index.js'
import { wrapInRow, extractLang } from '../utils/ui.js'
import { createHelpTicket, createReportTicket } from '../tickets/types/help.js'
import {
  handleConfigStep1,
  handleConfigStep2,
  handleConfigStep3,
} from '../tickets/interactions/config.js'
import fs from 'fs'

function getButtonType(customId) {
  if (customId.startsWith(IDS.tickets.langPrefix)) return 'TICKETS_LANG'
  if (customId.startsWith(IDS.tickets.typeHelp)) return 'TICKETS_TYPE_HELP'
  if (customId.startsWith(IDS.tickets.typeReportPrefix)) return 'TICKETS_TYPE_REPORT'
  if (customId.startsWith(IDS.tickets.typeCandidatePrefix)) return 'TICKETS_TYPE_CANDIDATE'
  if (customId.startsWith(IDS.ticket.close)) return 'TICKET_CLOSE'
  if (customId.startsWith(IDS.ticket.process)) return 'TICKET_PROCESS'
  if (customId.startsWith(IDS.ticket.noClose)) return 'TICKET_NO_CLOSE'
  if (customId.startsWith(IDS.ticket.yesClose)) return 'TICKET_YES_CLOSE'
  if (customId.startsWith(IDS.tickets.configStep1)) return 'CONFIG_STEP1'
  if (customId.startsWith(IDS.tickets.configStep2)) return 'CONFIG_STEP2'
  if (customId.startsWith(IDS.tickets.configStep3)) return 'CONFIG_STEP3'
  if (customId.startsWith(IDS.unban.no)) return 'UNBAN_NO'
  if (customId.startsWith(IDS.unban.yes)) return 'UNBAN_YES'
  if (customId.startsWith(IDS.ban.no)) return 'BAN_NO'
  if (customId.startsWith(IDS.ban.yes)) return 'BAN_YES'
  return null
}

export async function handleButton(interaction, context) {
  const buttonType = getButtonType(interaction.customId)
  const { store } = context || {}

  switch (buttonType) {
    case 'TICKETS_LANG': {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      const lang = extractLang(interaction.customId,-1)
      

      const text = new TextDisplayBuilder().setContent(t(lang, 'tickets.type.menu_title'))
      const helpButton = new ButtonBuilder()
        .setCustomId(`${IDS.tickets.typeHelp}-${lang}`)
        .setLabel(t(lang, 'tickets.type.help'))
        .setStyle(1)
        .setEmoji(EMOJIS.HELP)
      const reportButton = new ButtonBuilder()
        .setCustomId(`${IDS.tickets.typeReportPrefix}-${lang}`)
        .setLabel(t(lang, 'tickets.type.report'))
        .setStyle(1)
        .setEmoji(EMOJIS.CANDIDATE)
      const candidateButton = new ButtonBuilder()
        .setCustomId(`${IDS.tickets.typeCandidatePrefix}-${lang}`)
        .setLabel(t(lang, 'tickets.type.candidate'))
        .setStyle(1)
        .setEmoji(EMOJIS.CANDIDATE)

      const container = new ContainerBuilder()
        .addTextDisplayComponents(text)
        .addActionRowComponents(new ActionRowBuilder().addComponents(helpButton,reportButton, candidateButton))

      await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] })
      return true
    }

    case 'TICKETS_TYPE_HELP': {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      
      const lang = extractLang(interaction.customId, -1)

      const config = store?.getTicketConfig(interaction.guild.id,lang)
      
      const channel = await createHelpTicket(interaction, lang, config)
      await interaction.editReply({ content: `👀 <#${channel.id}>` })
      return true
    }

    case 'TICKETS_TYPE_REPORT': {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      const lang = extractLang(interaction.customId)

      const config = store?.getTicketConfig(interaction.guild.id,lang)
      const channel = await createReportTicket(interaction, lang, config)
      await interaction.editReply({ content: `👀 <#${channel.id}>` })
      return true
    }

    case 'TICKETS_TYPE_CANDIDATE': {
      const lang = extractLang(interaction.customId,-1)

      const modal = new ModalBuilder()
        .setCustomId(`${IDS.tickets.modalGetUserInfosCandidate}-${lang}`)
        .setTitle(t(lang, 'tickets.modal.candidate_title'))

      const ageInput = new TextInputBuilder()
        .setCustomId('age')
        .setStyle(TextInputStyle.Short)
        .setLabel(t(lang, 'tickets.modal.age_label'))
        .setPlaceholder(t(lang, 'tickets.modal.age_placeholder'))
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(12)
      const positionInput = new TextInputBuilder()
        .setCustomId('position')
        .setStyle(TextInputStyle.Short)
        .setLabel(t(lang, 'tickets.modal.position_label'))
        .setPlaceholder(t(lang, 'tickets.modal.position_placeholder'))
        .setRequired(true)
        .setMinLength(5)
        .setMaxLength(25)
      const detailInput = new TextInputBuilder()
        .setCustomId('detail')
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(t(lang, 'tickets.modal.detail_label'))
        .setPlaceholder(t(lang, 'tickets.modal.detail_placeholder'))
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(1500)
      const qualitiesInput = new TextInputBuilder()
        .setCustomId('qualities')
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(t(lang, 'tickets.modal.qualities_label'))
        .setPlaceholder(t(lang, 'tickets.modal.qualities_placeholder'))
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(1500)
      const remuneratedInput = new TextInputBuilder()
        .setCustomId('remunerated')
        .setStyle(TextInputStyle.Short)
        .setLabel(t(lang, 'tickets.modal.remunerated_label'))
        .setPlaceholder(t(lang, 'tickets.modal.remunerated_placeholder'))
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(3)

      modal.addComponents(
        wrapInRow(ageInput),
        wrapInRow(positionInput),
        wrapInRow(detailInput),
        wrapInRow(qualitiesInput),
        wrapInRow(remuneratedInput)
      )
      await interaction.showModal(modal)
      return true
    }

    case 'TICKET_CLOSE': {
      await interaction.deferReply()
      const lang = extractLang(interaction.customId)

      const buttonYes = new ButtonBuilder()
        .setCustomId(`${IDS.ticket.yesClose}-${lang}`)
        .setLabel(t(lang, 'tickets.buttons.yes'))
        .setStyle(ButtonStyle.Danger)
      const buttonNo = new ButtonBuilder()
        .setCustomId(`${IDS.ticket.noClose}-${lang}`)
        .setLabel(t(lang, 'tickets.buttons.no'))
        .setStyle(ButtonStyle.Success)

      await interaction.editReply({
        content: t(lang, 'tickets.close.confirm'),
        components: [new ActionRowBuilder().addComponents(buttonYes, buttonNo)],
      })
      return true
    }

    case 'TICKET_PROCESS': {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      const lang = extractLang(interaction.customId)

      await interaction.channel.send({
        content: t(lang, 'tickets.processed.notice', { userId: interaction.user.id }),
      })
      await interaction.editReply({ content: t(lang, 'tickets.processed.reply') })
      return true
    }

    case 'TICKET_NO_CLOSE': {
      await interaction.deferUpdate()
      await interaction.message.delete()
      return true
    }

    case 'TICKET_YES_CLOSE': {
      await interaction.deferReply()
      const lang = extractLang(interaction.customId, -1)

      await interaction.editReply({ content: t(lang, 'tickets.close.soon') })
      const user= await store.getTicketUser(interaction.guild.id,interaction.channel)
      const logs=store.getLogs(interaction.guild.id,interaction.channel.id)
      
      await user.send(t(lang, 'tickets.close.mpLog', {channelId: interaction.channel.id}));
      const dir = "./logfiles";
      const path=`./${dir}/${interaction.channel.id}.json`
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(path, JSON.stringify(logs, null, 2))
      store.deleteLogsChannel(interaction.guild.id,interaction.channel.id)
      await interaction.channel.delete()
      return true
    }

    case 'CONFIG_STEP1': {
      return await handleConfigStep1(interaction)
    }

    case 'CONFIG_STEP2': {
      return await handleConfigStep2(interaction)
    }

    case 'CONFIG_STEP3': {
      return await handleConfigStep3(interaction)
    }
    
    case 'UNBAN_NO': {
      await interaction.deferUpdate()
      await interaction.message.delete()
      return true
    }

    case 'UNBAN_YES': {
      await interaction.deferReply()
      const lang=getLangFromInteraction(interaction)
      const parts = interaction.customId.split(/[-$]/)
      const userId = parts[parts.length-1]
      await interaction.guild.members.unban(userId);
      await interaction.editReply({ content: t(lang, 'commands.unban.success', {userId}) })
      return true
    }
    case 'BAN_NO': {
      await interaction.deferUpdate()
      await interaction.message.delete()
      return true
    }

    case 'BAN_YES': {
      await interaction.deferReply()
      const lang=getLangFromInteraction(interaction)
      const parts = interaction.customId.split(/[-$]/)
      const userId = parts[parts.length-1]
      try {
        await interaction.guild.members.ban(userId, { reason: `${t(lang, 'commands.ban.by')} ${interaction.user.globalname || interaction.user.username}` });
      } catch {
        return interaction.editReply({ content: `${t(lang, 'commands.ban.error1')} <@${userId}>. ${t(lang, 'commands.ban.error2')}` });
      }
      const item = new MediaGalleryItemBuilder().setURL('https://raw.githubusercontent.com/mydkong/assets-for-my-website/refs/heads/main/cheh.gif')
      const gallery = new MediaGalleryBuilder().addItems(item)

    const text = new TextDisplayBuilder().setContent(`<@${userId}> ${t(lang, 'commands.ban.success')}`)

      return interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [text, gallery]
    })
    }
    default:
      return false
  }
}
