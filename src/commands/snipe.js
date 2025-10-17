import { client } from "../bot"
const deletedMessages = []



// Commande /deleted pour les afficher
export const execute = async interaction => {
  const list = deletedMessages
    .slice(0, 10)
    .map(m => `**${m.author}** (${m.channel}): ${m.content}`)
    .join('\n') || 'Aucun message supprimé récemment.'

  await interaction.reply({ content: list, flags: MessageFlags.Ephemeral })
}
