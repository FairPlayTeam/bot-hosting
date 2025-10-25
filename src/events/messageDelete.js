export function onMessageDelete(store) {
  return async function (message) {
    if (!message?.content || message.author?.bot) return
    const channelId = message.channel.id
    store.addDeletedMessage(channelId, message)

    if(store.isTicketChannel(message.guild.id, message.channel)){
      store.deleteLogMessageChannel(message.guild.id,message)
    }
    
  }
}