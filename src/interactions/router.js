import { handleButton } from './buttons.js'
import { handleModal } from './modals.js'
import { handleSelect } from './selects.js'

export async function routeInteraction(interaction, context) {
  if (interaction.isButton()) {
    if (await handleButton(interaction, context)) return
  }
  if (interaction.isModalSubmit()) {
    if (await handleModal(interaction, context)) return
  }
  if (interaction.isStringSelectMenu()) {
    if (await handleSelect(interaction, context)) return
  }
}
