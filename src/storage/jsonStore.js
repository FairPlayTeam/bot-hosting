import fs from 'fs'

export class JsonStore {
  constructor(path = 'data.json') {
    this.path = path
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({}))
    }
    this.data = JSON.parse(fs.readFileSync(this.path, 'utf8') || '{}')
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
  }

  ensureGuildUser(guildId, userId) {
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId][userId] = this.data[guildId][userId] || {}
    return this.data[guildId][userId]
  }

  toggleVanish(guildId, userId) {
    const u = this.ensureGuildUser(guildId, userId)
    u.vanished = !u.vanished
    this.save()
    return u.vanished
  }

  isVanished(guildId, userId) {
    return !!((this.data[guildId] || {})[userId] || {}).vanished
  }

  getWebhookId(guildId, userId) {
    return ((this.data[guildId] || {})[userId] || {}).webhookId
  }

  setWebhookId(guildId, userId, webhookId) {
    const u = this.ensureGuildUser(guildId, userId)
    u.webhookId = webhookId
    this.save()
  }

  getTicketConfig(guildId, lang) {
    this.data[guildId] = this.data[guildId] || {}
    const ticketConfig = this.data[guildId].ticketConfig || {}
    return ticketConfig[lang] || null
  }

  setTicketConfig(guildId, config) {
    this.data[guildId] = this.data[guildId] || {}
    console.log(config["lang"])
    const configActual = this.data[guildId].ticketConfig || {}
    const cfg = { ...configActual, [config["lang"]]: config }
    this.data[guildId].ticketConfig = cfg
    this.save()
  }
    isTicketChannel(guildId, channel) {
    const configs =  this.data[guildId].ticketConfig || {}
  
    for (const config of Object.values(configs)) {
      
      if (config && config.categoryId === channel.parent?.id) {
        return true
      }
    }
    return false
  }
  logMessageChannel(guildId, message) {
    this.data[guildId] = this.data[guildId] || {}
    const channelId = message.channel.id
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    const entry = {
      author: message.author.tag,
      content: message.content,
      avatar: message.author.displayAvatarURL({ extension: 'png', size: 128 }),
      time: new Date().toLocaleTimeString(),
    }
    this.data[guildId].logChannel[channelId].push(entry)
    
    this.save()
  }
  getDeletedMessage(guildId, channelId, number){
    this.data[guildId].deletedMessages = this.data[guildId].deletedMessages || {}
    this.data[guildId].deletedMessages[channelId] = this.data[guildId].deletedMessages[channelId] || []
    return this.data[guildId].deletedMessages[channelId].slice(0,number)

  }
  addDeletedMessage(channelId, message){
    
    const guildId= message.guild.id
    this.data[guildId].deletedMessages = this.data[guildId].deletedMessages || {}
    this.data[guildId].deletedMessages[channelId] = this.data[guildId].deletedMessages[channelId] || []
    this.data[guildId].deletedMessages[channelId].unshift({
      author: message.author.tag,
      content: message.content,
      avatar: message.author.displayAvatarURL({ extension: 'png', size: 128 }),
      time: new Date().toLocaleTimeString(),
    })
    if (this.data[guildId].deletedMessages[channelId].length > 50 ) {
      this.data[guildId].deletedMessages[channelId].pop()
    }
    this.save()
  }
}
