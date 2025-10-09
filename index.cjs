require('dotenv').config()
const token=process.env.TOKEN
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, MessageFlags, InteractionType, TextDisplayBuilder, ContainerBuilder } = require('discord.js');
const fs = require('fs');
const marked=require('marked');
const client=new Client({
	intents: [
	  GatewayIntentBits.Guilds,
	  GatewayIntentBits.GuildMessages,
	  GatewayIntentBits.GuildMembers,
	  GatewayIntentBits.MessageContent,
	  GatewayIntentBits.GuildEmojisAndStickers,
	  GatewayIntentBits.GuildMessageReactions
	],
	presence: {
		status: 'online', // status online (green icon)
		activities: [{
			name: 'Regarde les demandes de tickets',
			type: ActivityType.Watching // watch (...)
		}]
	}
});

const dataTickets=fs.readFileSync('tickets.json', 'utf8');
var tickets=JSON.parse(dataTickets);
const dataCategories=fs.readFileSync('categories.json', 'utf8');
var categories=JSON.parse(dataCategories);
const dataRoles=fs.readFileSync('roles.json', 'utf8');
var roles=JSON.parse(dataRoles);
const dataQueue=fs.readFileSync('queue.json', 'utf8');
var queue=JSON.parse(dataQueue)

const commands=[
  new SlashCommandBuilder()
    .setName('show-embed')
    .setDescription('Affiche l\'embed dans le salon où la commande est exécutée')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only admins can see that
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async aid=>{
	try {
		await rest.put(
                        Routes.applicationCommands(aid),
                        {
                                body: commands
                        }
                );
		console.log(btna, 'Commandes enregistrées avec succès !');
	} catch (error) {
		console.error(error);
	}
})('1425714937547984947'); // auto-executed function to put the following commands

client.login(token)
