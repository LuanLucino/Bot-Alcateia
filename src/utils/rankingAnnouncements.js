const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

// ENV
const CHANNEL_ID = process.env.CHANNEL_ID;

// Função principal
module.exports = function rankingAnnouncements(client) {
  console.log('[RANKING] Módulo carregado.');

  // Delay para o bot carregar o cache
  setTimeout(() => {

    // Semanal: domingo 22:00
    cron.schedule('45 22 * * 0', async () => {
      console.log('[RANKING] Executando semanal...');
      await processWeekly(client);
    }, { timezone: 'America/Sao_Paulo' });

    // Mensal: último dia 23:59
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

  db.all(`SELECT user_id, valor FROM users_farm ORDER BY valor DESC`, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro semanal para exibir.');
    }

    const top5 = rows.slice(0, 5);

    // Soma no mensal
    top5.forEach(r => {
      db.run(`
        INSERT INTO users_farm_monthly (user_id, valor)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET valor = valor + ?
      `, [r.user_id, r.valor, r.valor]);
    });

    // Gera ranking visual
    const medalhas = ["🥇", "🥈", "🥉"];
    rows.map((r, i) => {
    const valor = Number(r.valor) || 0;
    return `${medalhas[i]} <@${r.user_id}> — R$ **${valor.toFixed(2)}**`;
}).join("\n");


    const embed = new EmbedBuilder()
      .setTitle('TOP FARM SEMANAL')
      .setDescription(`Resultado dos maiores agricultores da semana:\n\n${texto}`)
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

  db.all(`SELECT user_id, valor FROM users_farm_monthly ORDER BY valor DESC`, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro mensal para exibir.');
    }

    const medalhas = ["🥇", "🥈", "🥉"];
    const texto = rows.map((r, i) =>
      (i < 3)
        ? `${medalhas[i]} <@${r.user_id}> — R$ **${r.valor.toFixed(2)}**`
        : `${i+1}. <@${r.user_id}> — R$ **${r.valor.toFixed(2)}**`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('TOP FARM MENSAL')
      .setDescription(`Ranking final do mês:\n\n${texto}`)
      .setColor('#2980b9')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Reset mensal
    db.run(`DELETE FROM users_farm_monthly`);
  });
}
