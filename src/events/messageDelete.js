export function onMessageDelete(store) {
    return async function (message) {
    if (!message?.content || message.author?.bot) return
    const channelId = message.channel.id
    store.addDeletedMessage(channelId, message)
  
  }
}