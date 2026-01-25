require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const db = require('./database/db.js');

// ID do canal onde o ranking será postado (se necessário futuramente)
const CANAL_RANKING = '1461496157594189864';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// =========================================================
// Carregar comandos dinâmicos da pasta /commands
// =========================================================

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// =========================================================
// Evento: bot online
// =========================================================

client.once('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
});

// =========================================================
// Evento: execução de comandos
// =========================================================

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Erro ao executar comando.', ephemeral: true });
  }
});

// =========================================================
// CRON - EXECUÇÃO AUTOMÁTICA SEMANAL
// =========================================================
//
// SUA REQUISIÇÃO:
// "Todo domingo 23:55 BR"
//
// Conversão:
// - Brasil geralmente UTC-3
// - Logo 23:55 BR → 02:55 UTC da SEGUNDA
// - Cron no Node usa UTC
//
// Cron para: 02:55 UTC toda segunda-feira
//
// Formato: min hora dia mes diaSemana
// Ex.: 55 2 * * 1
//
// =========================================================

cron.schedule('55 2 * * 1', async () => {
  console.log('[CRON] Executando tarefa semanal equivalente a domingo 23:55 BR...');

  // Aqui futuramente entra:
  // - somar semanal → mensal
  // - reset semanal

}, {
  scheduled: true
});

// =========================================================
// LOGIN DO BOT
// =========================================================

client.login(process.env.TOKEN);
