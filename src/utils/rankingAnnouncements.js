const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// CONFIGURAÇÕES
const CHANNEL_ID = '1461496157594189864'; // Exemplo

module.exports = function rankingAnnouncements(client) {
  console.log('[RANKING] Módulo de anúncios carregado');

  // Aguarda cache do Discord
  setTimeout(() => {

    // SEMANAL — Domingo 21:15 (horário BR)
    cron.schedule('15 21 * * 0', async () => {
      console.log('[RANKING] Disparando ranking semanal...');
      sendWeeklyRanking(client);
    }, { timezone: 'America/Sao_Paulo' });

    // MENSAL — Dia 1 às 21:15 (horário BR)
    cron.schedule('15 21 1 * *', async () => {
      console.log('[RANKING] Disparando ranking mensal...');
      sendMonthlyRanking(client);
    }, { timezone: 'America/Sao_Paulo' });

  }, 3000);
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

    const medalhas = ["🥇", "🥈", "🥉"];
    let texto = rows.map((r, i) => {
      if (i < 3) {
        return `${medalhas[i]} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`;
      } else {
        return `${i+1}. <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`;
      }
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('T O P  F A R M  S E M A N A L')
      .setDescription(`Os maiores agricultores da semana estão aqui:\n\n${texto}`)
      .setColor('#2ecc71')
      .setFooter({ text: 'Ranking atualizado automaticamente' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log('[RANKING] Ranking semanal enviado com sucesso.');
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

    const medalhas = ["🥇", "🥈", "🥉"];
    let texto = rows.map((r, i) => {
      if (i < 3) {
        return `${medalhas[i]} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`;
      } else {
        return `${i+1}. <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`;
      }
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('T O P  F A R M  M E N S A L')
      .setDescription(`Os maiores agricultores do mês estão aqui:\n\n${texto}`)
      .setColor('#3498db')
      .setFooter({ text: 'Ranking atualizado automaticamente' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log('[RANKING] Ranking mensal enviado com sucesso.');
  });
}
