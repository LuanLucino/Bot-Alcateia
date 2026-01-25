require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');
const fs = require('fs');

// Utils
const rankingAnnouncements = require('./utils/rankingAnnouncements.js');

// Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.User,
    Partials.GuildMember,
    Partials.Message,
    Partials.Channel
  ]
});

// Carrega comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`[COMMAND] Carregado: ${command.data.name}`);
  } else {
    console.log(`[AVISO] Comando ${file} está faltando "data" ou "execute"`);
  }
}

// Quando o bot estiver online
client.once('ready', async () => {
  console.log(`[ONLINE] Bot logado como: ${client.user.tag}`);

  // Inicia o anúncio do ranking (CRON)
  rankingAnnouncements(client);
});

// Listener de comandos slash
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ content: 'Comando não encontrado.', ephemeral: true });
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Erro ao executar o comando.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
    }
  }
});

// Login
client.login(process.env.TOKEN);
