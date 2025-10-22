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

  getTicketConfig(guildId) {
    this.data[guildId] = this.data[guildId] || {}
    return this.data[guildId].ticketConfig || null
  }

  setTicketConfig(guildId, config) {
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].ticketConfig = config
    this.save()
  }
  getDeletedMessage(channelId, number){
    this.data["deletedMessages"] = this.data["deletedMessages"] || {}
    this.data["deletedMessages"][channelId] = this.data["deletedMessages"][channelId] || []
    return this.data["deletedMessages"][channelId].slice(0,number)

  }
  addDeletedMessage(channelId, message){
    this.data["deletedMessages"] = this.data["deletedMessages"] || {}
    this.data["deletedMessages"][channelId] = this.data["deletedMessages"][channelId] || []
    this.data["deletedMessages"][channelId].unshift({
      author: message.author.tag,
      content: message.content,
      avatar: message.author.displayAvatarURL({
        dynamic: true,
        size: 128
      })
    })
    if (this.data["deletedMessages"][channelId] > 10 ) {
      this.data["deletedMessages"][channelId].pop()
    }
    this.save()
  }
}