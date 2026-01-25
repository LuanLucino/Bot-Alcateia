require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Ignorar arquivos que não exportam slash
  if (!command.data) {
    console.log(`[DEPLOY] Ignorando arquivo: ${file} (não possui data)`);
    continue;
  }

  commands.push(command.data.toJSON());
}

console.log('[DEPLOY] Registrando comandos...');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('[DEPLOY] Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();
