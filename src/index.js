require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const rankingAnnouncements = require('./utils/rankingAnnouncements.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.User, Partials.Message, Partials.Channel]
});

// Carrega comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
  console.log(`[COMMAND] Carregado: ${cmd.data.name}`);
}

// Bot online
client.once('ready', () => {
  console.log(`[ONLINE] Logado como ${client.user.tag}`);
  rankingAnnouncements(client);
});

// Execução slash
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
