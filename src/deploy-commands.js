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

// Pasta commands (farm, ranking, ajuda etc.)
const commandsPath = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of files) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data) commands.push(cmd.data.toJSON());
}

// Modulo Ação e Saldo
const acaoPath = path.join(__dirname, 'modulo_acao_saldo');
const acaoFiles = fs.readdirSync(acaoPath).filter(file => file.endsWith('.js'));
for (const file of acaoFiles) {
  const command = require(path.join(acaoPath, file));
  if (command.data) commands.push(command.data.toJSON());
}

// Modulo Drogas
const drogasPath = path.join(__dirname, 'modulo_drogas');
const drogasFiles = fs.readdirSync(drogasPath).filter(file => file.endsWith('.js'));
for (const file of drogasFiles) {
  const command = require(path.join(drogasPath, file));
  if (command.data) commands.push(command.data.toJSON());
}

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
