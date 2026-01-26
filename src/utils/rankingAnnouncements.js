const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// CANAL DOS ANÚNCIOS
const CHANNEL_ID = '1461496157594189864';

module.exports = function rankingAnnouncements(client) {
  console.log('[RANKING] Módulo de anúncios carregado');

  // Aguarda cache dos canais do Discord
  setTimeout(() => {

    // SEMANAL — todo domingo 22:00
    cron.schedule('10 22 * * 0', async () => {
      console.log('[RANKING] Disparando ranking semanal...');
      await processWeekly(client);
    }, { timezone: 'America/Sao_Paulo' });

    // MENSAL — último dia do mês às 23:59
    cron.schedule('59 23 L * *', async () => {
      console.log('[RANKING] Disparando ranking mensal...');
      await processMonthly(client);
    }, { timezone: 'America/Sao_Paulo' });

  }, 3000);
};

async function processWeekly(client) {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) return console.error('[RANKING] Canal semanal não encontrado');

  db.all(`
    SELECT user_id, cogumelo, semente
    FROM users_farm
    ORDER BY cogumelo DESC, semente DESC
    LIMIT 5
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro semanal para exibir.');
    }

    // SOMAR NO MENSAL
    rows.forEach((r) => {
      db.run(`
        INSERT INTO users_farm_monthly (user_id, cogumelo, semente)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET
          cogumelo = cogumelo + excluded.cogumelo,
          semente = semente + excluded.semente
      `, [r.user_id, r.cogumelo, r.semente]);
    });

    // MONTAR EMBED E ENVIAR
    const medalhas = ["🥇", "🥈", "🥉"];
    let texto = rows.map((r, i) => {
      return (i < 3)
        ? `${medalhas[i]} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`
        : `${i+1}. <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('T O P  F A R M  S E M A N A L')
      .setDescription(`Os maiores agricultores da semana:\n\n${texto}`)
      .setColor('#2ecc71')
      .setFooter({ text: 'Ranking semanal atualizado automaticamente' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    console.log('[RANKING] Ranking semanal enviado. Resetando dados...');

    // RESETAR TABELA SEMANAL
    db.run(`DELETE FROM users_farm`);
  });
}

async function processMonthly(client) {
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
      return (i < 3)
        ? `${medalhas[i]} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`
        : `${i+1}. <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('T O P  F A R M  M E N S A L')
      .setDescription(`Os maiores agricultores do mês:\n\n${texto}`)
      .setColor('#3498db')
      .setFooter({ text: 'Ranking mensal atualizado automaticamente' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    console.log('[RANKING] Ranking mensal enviado. Resetando dados...');

    // RESETAR TABELA MENSAL
    db.run(`DELETE FROM users_farm_monthly`);
  });
}
