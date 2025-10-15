import { ActionRowBuilder } from 'discord.js'
import { LANG } from '../constants.js'

export function wrapInRow(component) {
  return new ActionRowBuilder().addComponents(component)
}

export function extractLang(customId, startIndex = -2) {
  const parts = customId.split(/[-$]/)
  return parts[parts.length + startIndex] || LANG.DEFAULT
}
