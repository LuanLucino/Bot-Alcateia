const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// CONFIGURAÇÕES
const CHANNEL_ID = '1461496157594189864'; // Exemplo

module.exports = function rankingAnnouncements(client) {
  console.log('[RANKING] Módulo de anúncios carregado');

  // Ranking semanal - todo domingo às 19:15 (horário BR)
  cron.schedule('15 19 * * 0', async () => {
    console.log('[RANKING] Enviando ranking semanal...');
    sendWeeklyRanking(client);
  }, { timezone: 'America/Sao_Paulo' });

  // Ranking mensal - dia 1 às 20:00
  cron.schedule('0 20 1 * *', async () => {
    console.log('[RANKING] Enviando ranking mensal...');
    sendMonthlyRanking(client);
  }, { timezone: 'America/Sao_Paulo' });
};

async function sendWeeklyRanking(client) {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) return console.error('[RANKING] Canal semanal não encontrado');

  db.all(`
    SELECT user_id, cogumelo, semente
    FROM users_farm
    ORDER BY cogumelo DESC, semente DESC
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro semanal para exibir.');
    }

    let texto = "";
    const medalhas = ["🥇", "🥈", "🥉"];

    rows.forEach((r, i) => {
      if (i < 3) {
        texto += `${medalhas[i]} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**\n`;
      } else {
        texto += `${i+1}. <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**\n`;
      }
    });

    const embed = new EmbedBuilder()
      .setTitle('Ranking Semanal')
      .setDescription(texto)
      .setColor('#2ecc71')
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  });
}

async function sendMonthlyRanking(client) {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) return console.error('[RANKING] Canal mensal não encontrado');

  db.all(`
    SELECT user_id, cogumelo, semente
    FROM users_farm_monthly
    ORDER BY cogumelo DESC, semente DESC
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro mensal para exibir.');
    }

    let texto = "";
    const medalhas = ["🥇", "🥈", "🥉"];

    rows.forEach((r, i) => {
      if (i < 3) {
        texto += `${medalhas[i]} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**\n`;
      } else {
        texto += `${i+1}. <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**\n`;
      }
    });

    const embed = new EmbedBuilder()
      .setTitle('Ranking Mensal')
      .setDescription(texto)
      .setColor('#3498db')
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  });
}
