import fs from 'fs'

import * as tools from './tools.js'

export class JsonStore {
  constructor(path = 'data.json', client) {
    this.path = path
    this.client = client
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({}))
    }
    this.data = JSON.parse(fs.readFileSync(this.path, 'utf8') || '{}')
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
  }

  ensureGuildUser(guildId, userId) {
    (this.data[guildId] ??= {});
    (this.data[guildId][userId] ??= {});
    return this.data[guildId][userId];
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
    this.data[guildId].channelConfig = this.data[guildId].channelConfig || {}
    this.data[guildId].channelConfig[channel.id] = this.data[guildId].channelConfig[channel.id]  || {}

    return !!this.data[guildId].channelConfig[channel.id].isTicket
  }
  setTicketChannel(guildId, channel, userId) {
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].channelConfig = this.data[guildId].channelConfig || {}
    this.data[guildId].channelConfig[channel.id] = this.data[guildId].channelConfig[channel.id]  || {}
    this.data[guildId].channelConfig[channel.id].isTicket = true
    this.data[guildId].channelConfig[channel.id].ticketUserId = userId

    this.save()
    return true
  } 

  async getTicketUser(guildId, channel){
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].channelConfig = this.data[guildId].channelConfig || {}
    this.data[guildId].channelConfig[channel.id] = this.data[guildId].channelConfig[channel.id]  || {}
    const userId= this.data[guildId].channelConfig[channel.id].ticketUserId
    const user = await this.client.users.fetch(userId);
    return user
  }
  async logMessageChannel(guildId, message) {
    if (message.content==="" && message.attachments?.size===0)return
    let attachementUrls=""
    if (message.attachments?.size>0) {attachementUrls=`\n[Attachments]\n${message.attachments.map(a => a.url).join("\n")}`}

    const channelId = message.channel.id
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    const cleanContent = await cleanMessage(message.content,this.client, message.guild.id)
    const content = `${cleanContent}${attachementUrls}`
    const entry = {
      author: message.author.tag,
      content: content,
      avatar: message.author.displayAvatarURL({ extension: 'png', size: 128 }),
      time: new Date().toLocaleTimeString(),
    }
    this.data[guildId].logChannel[channelId].push(entry)
    
    this.save()
  }
  async addLogMessageInChannel(guildId,channelId, author, content,avatar){
    this.data[guildId] = this.data[guildId] || {}
    this.data[guildId].logChannel = this.data[guildId].logChannel || {}
    this.data[guildId].logChannel[channelId] = this.data[guildId].logChannel[channelId] || []
    const cleanContent = await cleanMessage(content,this.client, guildId)
    const entry = {
      author: author,
      content: cleanContent,
      avatar: avatar,
      time: new Date().toLocaleTimeString(),
    }
    this.data[guildId].logChannel[channelId].push(entry)
    this.save()
  }
  async deleteLogMessageChannel(guildId, message){
    const channelId= message.channel.id
    let attachementUrls=""
    if (message.attachments?.size>0) {attachementUrls=`\n[Attachments]\n${message.attachments.map(a => a.url).join("\n")}`}
    const cleanContent = await cleanMessage(message.content,this.client, message.guild.id)
    const content = `${cleanContent}${attachementUrls}`
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

async function cleanMessage(text, client, guildId) {
    let content = text;
    const userIds = [...text.matchAll(/<@!?(\d+)>/g)].map(m => m[1]);
    const roleIds = [...text.matchAll(/<@&(\d+)>/g)].map(m => m[1]);

    const users = {};
    for (const id of userIds) {
        try {
            const user = await client.users.fetch(id);
            users[id] = user.username;
        } catch {
            users[id] = null;
        }
    }

    const roles = {};
    try {
        const guild = await client.guilds.fetch(guildId);
        for (const id of roleIds) {
            try {
                const role = await guild.roles.fetch(id);
                roles[id] = role?.name || null;
            } catch {
                roles[id] = null;
            }
        }
    } catch {
    }

    content = content.replace(/<@!?(\d+)>/g, (match, id) => {
        return users[id] ? `@${users[id]}` : match;
    });

    content = content.replace(/<@&(\d+)>/g, (match, id) => {
        return roles[id] ? `@${roles[id]}` : match;
    });

    content = content.replace(/<:([a-zA-Z0-9_]+):(\d+)>/g,
        (name, id) => `<img src="https://cdn.discordapp.com/emojis/${id}.png" alt="${name}" class="emoji" style="width:24px;height:24px;vertical-align:middle;display:inline-block;">`
    );

    content = content.replace(/<a:([a-zA-Z0-9_]+):(\d+)>/g,
        (name, id) => `<img src="https://cdn.discordapp.com/emojis/${id}.gif" alt="${name}" class="emoji" style="width:24px;height:24px;vertical-align:middle;display:inline-block;">`
    );

    return content;
}

