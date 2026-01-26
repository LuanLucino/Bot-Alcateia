require('dotenv').config();
const { REST, Routes } = require('discord.js');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!CLIENT_ID || !GUILD_ID || !DISCORD_TOKEN) {
  console.error('[CLEANUP] CLIENT_ID, GUILD_ID ou DISCORD_TOKEN faltando no .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('[CLEANUP] Removendo comandos da Guild...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log('[CLEANUP] Todos os comandos da Guild foram removidos.');
  } catch (err) {
    console.error(err);
  }
})();
