require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const db = require('./database/db.js'); // ✅ caminho ajustado
const rankingAnnouncements = require('./utils/rankingAnnouncements.js'); // ✅ caminho ajustado
const acaoSaldoAnnouncements = require('./modulo_acao_saldo/acaoSaldoAnnouncements.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`[ONLINE] Logado como ${client.user.tag}`);

  // inicia o cron
  rankingAnnouncements(client);
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

// Modulo Ação e Saldo

client.once('ready', () => {
  console.log(`[ONLINE] Logado como ${client.user.tag}`);
  rankingAnnouncements(client);      // parte 1
  acaoSaldoAnnouncements(client);    // parte 2
});


client.login(process.env.DISCORD_TOKEN);
