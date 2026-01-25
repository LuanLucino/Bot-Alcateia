require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const db = require('./database/db.js');
const { anunciarRankingSemanal, anunciarRankingMensal } = require('./utils/rankingAnnouncements.js');

const CANAL_RANKING = '1461496157594189864';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
});

// Handler de comandos
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


/*
==========================================
 CRON: SOMA SEMANAL → MENSAL + RESET
 Domingo 23:55 BR (-03)
 UTC = 02:55 segunda
==========================================
*/
cron.schedule('55 2 * * 1', async () => {
  console.log('[CRON] Execução semanal iniciada.');

  db.all(`SELECT user_id, cogumelo, semente FROM users_farm`, [], (err, rows) => {
    if (err) return console.error('Erro ao ler weekly:', err);

    if (!rows || rows.length === 0) {
      console.log('[CRON] Nenhum registro semanal para somar.');
      return;
    }

    rows.forEach(r => {
      db.run(
        `INSERT INTO users_farm_monthly (user_id, cogumelo, semente)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           cogumelo = cogumelo + excluded.cogumelo,
           semente = semente + excluded.semente`,
        [r.user_id, r.cogumelo, r.semente]
      );
    });

    db.run(`UPDATE users_farm SET cogumelo = 0, semente = 0`, [], err => {
      if (err) return console.error('Erro ao resetar semanal:', err);
      console.log('[CRON] Semanal resetado.');
      anunciarRankingSemanal(client, CANAL_RANKING);
    });
  });
}, {
  timezone: 'America/Sao_Paulo'
});

/*
==========================================
 CRON: RESET MENSAL + ANÚNCIO
 Primeiro dia do mês 00:10 BR
==========================================
*/
cron.schedule('10 3 1 * *', async () => {
  console.log('[CRON] Execução mensal iniciada.');

  anunciarRankingMensal(client, CANAL_RANKING);

  db.run(`UPDATE users_farm_monthly SET cogumelo = 0, semente = 0`, [], err => {
    if (err) return console.error('Erro ao resetar mensal:', err);
    console.log('[CRON] Mensal resetado.');
  });

}, {
  timezone: 'America/Sao_Paulo'
});

client.login(process.env.TOKEN);
