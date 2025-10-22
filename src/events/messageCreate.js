export function onMessageCreate(store) {
  return async function (message) {
    if ((store.data[message.guild.id] || {})[message.author.id]?.vanished) {
      await message.delete()
      const webhooks = await message.channel.fetchWebhooks()
      let webhook = webhooks.find(
        w => w.id === store.getWebhookId(message.guild.id, message.author.id)
      )
      const names = [
        'ù*$@&$^%µ',
        'ù$@#Øµ^ù$',
        '*ế$ù$^ù$@#Øµ^ù$',
        'ế$ù$^ù$@#Øµ^ù$*',
        'ế$ù$^ù$@#Øµ^ù$*ế',
        'ế$ù$^ù$@#Øµ^ù$*ế$',
      ]
      if (!webhook) {
        webhook = await message.channel.createWebhook({
          name: names[Math.floor(Math.random() * names.length)],
          avatar: 'https://wallpapercave.com/wp/wp5709615.jpg', //holy skid
        })
        store.setWebhookId(message.guild.id, message.author.id, webhook.id)
      }
      await webhook.send({ content: message.content })
    }
    if(store.isTicketChannel(message.guild.id, message.channel)){
      store.logMessageChannel(message.guild.id, message)
    }
  }
}
