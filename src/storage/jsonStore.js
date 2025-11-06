import fs from 'fs'

import * as tools from './tools.js'

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
    const configActual = this.data[guildId].ticketConfig || {}
    const cfg = { ...configActual, [config["lang"]]: config }
    this.data[guildId].ticketConfig = cfg
    this.save()
  }
  isTicketChannel(guildId, channel) {
    const guildData = this.data[guildId] || {}
    const channelData = guildData[channel.id] || {}
    return !!channelData.isTicket // !! converts an entry to binairy
  }
  setTicketChannel(guildId, channel) {
    const guildData = this.data[guildId] || {}
    const channelData = guildData[channel.id] || {}
    channelData.isTicket = true
    return true
  }
  logDeletedMessage(guildId, message) {
    this.data[guildId] = this.data[guildId] || {}
    const channelId = message.channel.id
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []

    const entry = {
      author: message.author.displayName || message.author.username,
      content: message.content,
      avatar: message.author.displayAvatarURL({ extension: 'png', size: 128 }),
      time: tools.getDate(),
    }
    this.data[guildId].logChannel[channelId].push(entry)
    
    this.save()
  }
  addTicketMessage(message){
    this.data[message.guild.id] = this.data[message.guild.id] || {}
    this.data[message.guild.id].logChannel = this.data[message.guild.id].logChannel || {}
    this.data[message.guild.id].logChannel[message.channel.id] = this.data[message.guild.id].logChannel[message.channel.id] || []
    const entry = {
      author: message.author,
      content: message.content,
      avatar: message.author.displayAvatarURL({ dynamic: true, size: 2048 }),
      time: tools.getDate(),
      bot: message.bot,
      images: tools.getImagesFromAttachments(message.attachments),
    }
    this.data[message.guild.id].logChannel[message.channel.id].push(entry)

    this.save()
  }
  deleteTicketMessage(message){
    const channelId = message.channel.id
    const guildId = message.guild.id
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []

    const logs = this.data[guildId].logChannel[channelId] 
    const index = logs.findIndex(entry => entry.author === message.author && entry.content === message.content);
    logs.splice(index, 1);
    this.data[guildId].logChannel[channelId] = logs
    
    this.save()
  }
  deleteTicketLogs(guildId, channelId){
    delete this.data[guildId].logChannel[channelId];
    this.save()
  }
  getLogs(guildId, channelId){
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    return this.data[guildId].logChannel[channelId]
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
      time: tools.getDate(),
    })
    if (this.data[guildId].deletedMessages[channelId].length > 50 ) {
      this.data[guildId].deletedMessages[channelId].pop()
    }
    this.save()
  }
}
