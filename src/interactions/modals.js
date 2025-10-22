import { MessageFlags } from 'discord.js'
import { IDS } from '../constants.js'
import { extractLang } from '../utils/ui.js'
import { createCandidateTicket } from '../tickets/types/candidate.js'
import { handleCreateCategoryModal } from '../tickets/interactions/config.js'

export async function handleModal(interaction, context) {
  const { store } = context || {}
  if (interaction.customId.startsWith(IDS.tickets.modalGetUserInfosCandidate)) {
    const formData = {
      age: interaction.fields.getTextInputValue('age'),
      position: interaction.fields.getTextInputValue('position'),
      detail: interaction.fields.getTextInputValue('detail'),
      qualities: interaction.fields.getTextInputValue('qualities'),
      remunerated: interaction.fields.getTextInputValue('remunerated'),
    }
    const lang = extractLang(interaction.customId)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const config = store?.getTicketConfig(interaction.guild.id,lang)
    const channel = await createCandidateTicket(interaction, lang, formData, config)
    await interaction.editReply({ content: `👀 <#${channel.id}>` })
    return true
  }

  if (interaction.customId.startsWith(IDS.tickets.modalCreateCategory)) {
    return await handleCreateCategoryModal(interaction)
  }

  return false
}
