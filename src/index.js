require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const db = require('./database/db.js');

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

/* ===========================================================
   CRON 1: TODO DOMINGO 23:55 (BR) → SOMAR TOP5 NA MENSAL
   =========================================================== */
cron.schedule('55 23 * * 0', async () => {
  try {
    const guild = client.guilds.cache.first();
    const canal = guild.channels.cache.get(CANAL_RANKING);
    if (!canal) return;

    db.all(`
      SELECT user_id, cogumelo, semente 
      FROM users_farm 
      ORDER BY (cogumelo + semente) DESC 
      LIMIT 5
    `, [], (err, rows) => {
      if (err || !rows) return;

      rows.forEach(r => {
        db.get(`SELECT * FROM users_farm_monthly WHERE user_id = ?`, [r.user_id], (err2, row) => {
          if (row) {
            db.run(
              `UPDATE users_farm_monthly SET cogumelo = ?, semente = ? WHERE user_id = ?`,
              [row.cogumelo + r.cogumelo, row.semente + r.semente, r.user_id]
            );
          } else {
            db.run(
              `INSERT INTO users_farm_monthly (user_id, cogumelo, semente) VALUES (?, ?, ?)`,
              [r.user_id, r.cogumelo, r.semente]
            );
          }
        });
      });

      canal.send('Top 5 semanal somado ao ranking mensal.');
    });

  } catch (e) {
    console.error('Erro no cron 23:55:', e);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

/* ===========================================================
   CRON 2: TODO DOMINGO 23:59 (BR) → ZERAR SEMANAL
   =========================================================== */
cron.schedule('59 23 * * 0', async () => {
  try {
    const guild = client.guilds.cache.first();
    const canal = guild.channels.cache.get(CANAL_RANKING);
    if (!canal) return;

    db.run(`DELETE FROM users_farm`);
    canal.send('Ranking semanal resetado para uma nova semana.');
  } catch (e) {
    console.error('Erro no cron 23:59:', e);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

/* ===========================================================
   CRON 3: ÚLTIMO DIA DO MÊS 19:00 (BR) → ANUNCIAR + RESETAR
   =========================================================== */
cron.schedule('0 19 L * *', async () => {
  try {
    const guild = client.guilds.cache.first();
    const canal = guild.channels.cache.get(CANAL_RANKING);
    if (!canal) return;

    db.all(`
      SELECT user_id, cogumelo, semente, (cogumelo + semente) as total
      FROM users_farm_monthly
      ORDER BY total DESC
      LIMIT 5
    `, [], async (err, rows) => {

      if (!rows || rows.length === 0) {
        canal.send('Sem dados para o ranking mensal.');
        return;
      }

      let pos = 1;
      let txt = '';

      for (const r of rows) {
        const m = await guild.members.fetch(r.user_id).catch(() => null);
        const nome = m ? (m.nickname || m.user.username) : 'Desconhecido';
        txt += `${pos}. ${nome} — 🍄 ${r.cogumelo} | 🌱 ${r.semente} (Total: ${r.total})\n`;
        pos++;
      }

      const embed = new EmbedBuilder()
        .setColor('#e09522')
        .setTitle('Ranking Mensal Finalizado')
        .setDescription('Top 5 jogadores do mês:')
        .addFields({ name: 'Classificação', value: txt })
        .setTimestamp();

      canal.send({ embeds: [embed] });

      setTimeout(() => {
        db.run(`DELETE FROM users_farm_monthly`);
        canal.send('Ranking mensal resetado para o próximo mês.');
      }, 3000);
    });

  } catch (e) {
    console.error('Erro no cron mensal:', e);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

/* ===========================================================
   INTERAÇÕES DISCORD
   =========================================================== */
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

client.login(process.env.TOKEN);
