require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!CLIENT_ID || !GUILD_ID || !DISCORD_TOKEN) {
  console.error('[DEPLOY] Variáveis faltando.');
  process.exit(1);
}

console.log('[DEPLOY] Registrando comandos...');

const commands = [];

// Carrega comandos da pasta commands (parte 1)
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// Carrega comandos da pasta modulo_acao_saldo (parte 2)
const acaoPath = path.join(__dirname, 'modulo_acao_saldo');
const acaoFiles = fs.readdirSync(acaoPath).filter(f => f.endsWith('.js'));

for (const file of acaoFiles) {
  const command = require(path.join(acaoPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// Modulo Ação e Saldo Acima

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log(`[DEPLOY] Sucesso: ${data.length} comandos registrados.`);
  } catch (err) {
    console.error(err);
  }
})();
