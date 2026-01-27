const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// ENV
const CHANNEL_ID = process.env.CHANNEL_ID;

// Função principal
module.exports = function rankingAnnouncements(client) {
  console.log('[RANKING] Módulo carregado.');

  setTimeout(() => {

    // Semanal: domingo 23:59
    cron.schedule('59 23 * * 0', async () => {
      console.log('[RANKING] Executando semanal...');
      await processWeekly(client);
    }, { timezone: 'America/Sao_Paulo' });

    // Mensal: último dia do mês 23:59
    cron.schedule('59 23 28-31 * *', async () => {
      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      if (today.getDate() === lastDay) {
        console.log('[RANKING] Executando mensal...');
        await processMonthly(client);
      }
    }, { timezone: 'America/Sao_Paulo' });

  }, 3000);
};

async function processWeekly(client) {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) return console.error('[RANKING] Canal não encontrado');

  db.all(`
    SELECT user_id, cogumelo, semente, (cogumelo + semente) AS total
    FROM users_farm
    ORDER BY total DESC
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro semanal para exibir.');
    }

    const top5 = rows.slice(0, 5);

    // Soma no mensal
    top5.forEach(r => {
      db.run(`
        INSERT INTO users_farm_monthly (user_id, cogumelo, semente)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          cogumelo = cogumelo + ?,
          semente = semente + ?
      `, [r.user_id, r.cogumelo, r.semente, r.cogumelo, r.semente]);
    });

    const medalhas = ["🥇🏆", "🥈🏆", "🥉🏆"];

    const texto = rows.map((r, i) => {
      if (i < 3) {
        return `${medalhas[i]} <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}** | ⭐ **${r.total}**`;
      }
      return `${i+1}. <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}** | ⭐ **${r.total}**`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle('TOP FARM SEMANAL')
      .setDescription(`${texto}`)
      .setColor('#27ae60')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Reset semanal
    db.run(`DELETE FROM users_farm`);
  });
}

async function processMonthly(client) {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) return console.error('[RANKING] Canal não encontrado');

  db.all(`
    SELECT user_id, cogumelo, semente, (cogumelo + semente) AS total
    FROM users_farm_monthly
    ORDER BY total DESC
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro mensal para exibir.');
    }

    const medalhas = ["🥇🏆", "🥈🏆", "🥉🏆"];

    const texto = rows.map((r, i) => {
      if (i < 3) {
        return `${medalhas[i]} <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}** | ⭐ **${r.total}**`;
      }
      return `${i+1}. <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}** | ⭐ **${r.total}**`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle('TOP FARM MENSAL')
      .setDescription(`${texto}`)
      .setColor('#2980b9')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Reset mensal
    db.run(`DELETE FROM users_farm_monthly`);
  });
}
