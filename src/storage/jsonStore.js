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
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].channeConfig = this.data[guildId].channeConfig || {}
    this.data[guildId].channeConfig[channel.id] = this.data[guildId].channeConfig[channel.id]  || {}

    return this.data[guildId].channeConfig[channel.id].isTicket
  }
  setTicketChannel(guildId, channel) {
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].channeConfig = this.data[guildId].channeConfig || {}
    this.data[guildId].channeConfig[channel.id] = this.data[guildId].channeConfig[channel.id]  || {}
    this.data[guildId].channeConfig[channel.id].isTicket = true
    this.save()
    return true
  }
  logMessageChannel(guildId, message) {
    if (message.content==="" && message.attachments?.size===0)return
    let attachementUrls=""
    if (message.attachments?.size>0) {attachementUrls=`\n[Attachments]\n${message.attachments.map(a => a.url).join("\n")}`}

    const channelId = message.channel.id
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    const content = `${message.content}${attachementUrls}`
    const entry = {
      author: message.author.tag,
      content: content,
      avatar: message.author.displayAvatarURL({ extension: 'png', size: 128 }),
      time: new Date().toLocaleTimeString(),
    }
    this.data[guildId].logChannel[channelId].push(entry)
    
    this.save()
  }
  addLogMessageInChannel(guildId,channelId, author, content,avatar){
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    const entry = {
      author: author,
      content: content,
      avatar: avatar,
      time: new Date().toLocaleTimeString(),
    }
    this.data[guildId].logChannel[channelId].push(entry)
    this.save()
  }
  deleteLogMessageChannel(guildId, message){
    const channelId= message.channel.id
    let attachementUrls=""
    if (message.attachments?.size>0) {attachementUrls=`\n[Attachments]\n${message.attachments.map(a => a.url).join("\n")}`}
    const content = `${message.content}${attachementUrls}`
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    const logs = this.data[guildId].logChannel[channelId] 
    const index = logs.findIndex(entry => entry.author === message.author && entry.content === content);
    logs.splice(index, 1);
    this.data[guildId].logChannel[channelId] =logs
    this.save()


  }
  deleteLogsChannel(guildId, channelId){
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
  getAutoReply(guildId){
    this.data[guildId]=this.data[guildId] || {}
    this.data[guildId].autoreply=this.data[guildId].autoreply ||{}
    return this.data[guildId].autoreply
  }
  addAutoReply(guildId, word, messageContent){
    this.data[guildId]=this.data[guildId] || {}
    this.data[guildId].autoreply=this.data[guildId].autoreply ||{}
    this.data[guildId].autoreply[word.toLowerCase()] = messageContent
    return this.save()
  }
  deleteAutoReply(guildId, word){
    this.data[guildId]=this.data[guildId] || {}
    this.data[guildId].autoreply=this.data[guildId].autoreply ||{}
    delete this.data[guildId].autoreply[word]
    return this.save()
  }
}