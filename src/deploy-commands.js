require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.DISCORD_TOKEN;

if (!CLIENT_ID || !GUILD_ID || !TOKEN) {
  console.error('[DEPLOY] ERRO: CLIENT_ID, GUILD_ID ou DISCORD_TOKEN não foram encontrados no .env');
  process.exit(1);
}

console.log('[DEPLOY] Registrando comandos...');

// Carrega comandos
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`[DEPLOY] Comando carregado: ${command.data.name}`);
  } else {
    console.warn(`[DEPLOY] Comando inválido: ${file}`);
  }
}

// Registra
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log(`[DEPLOY] Sucesso! ${data.length} comandos atualizados.`);
  } catch (error) {
    console.error(error);
  }
})();
