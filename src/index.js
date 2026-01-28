require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const db = require('./database/db.js');
const rankingAnnouncements = require('./utils/rankingAnnouncements.js');
const acaoSaldoAnnouncements = require('./modulo_acao_saldo/acaoSaldoAnnouncements.js');
const drogasAnnouncements = require('./modulo_drogas/drogasAnnouncements.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

// Carrega comandos da pasta commands (parte 1 - farm/ranking)
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// Carrega comandos da pasta modulo_acao_saldo (parte 2 - ação/saldo)
const acaoPath = path.join(__dirname, 'modulo_acao_saldo');
const acaoFiles = fs.readdirSync(acaoPath).filter(f => f.endsWith('.js'));

for (const file of acaoFiles) {
  const command = require(path.join(acaoPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// Carrega comandos da pasta modulo_drogas (parte 3 - drogas)
const drogasPath = path.join(__dirname, 'modulo_drogas');
const drogasFiles = fs.readdirSync(drogasPath).filter(f => f.endsWith('.js'));

for (const file of drogasFiles) {
  const command = require(path.join(drogasPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`[ONLINE] Logado como ${client.user.tag}`);

  // inicia os cron jobs
  rankingAnnouncements(client);       // parte 1
  acaoSaldoAnnouncements(client);     // parte 2
  drogasAnnouncements(client);        // parte 3
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    return interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
