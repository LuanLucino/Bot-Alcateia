const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const CANAL_DINHEIRO_SUJO = '1465739674483036274';

module.exports = function acaoSaldoAnnouncements(client) {
  console.log('[SALDO] Módulo carregado.');

  setTimeout(() => {
    // Último dia do mês às 23:59
    cron.schedule('59 23 28-31 * *', async () => {
      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      if (today.getDate() === lastDay) {
        console.log('[SALDO] Executando anúncio mensal...');
        await processSaldo(client);
      }
    }, { timezone: 'America/Sao_Paulo' });
  }, 3000);
};

async function processSaldo(client) {
  const channel = client.channels.cache.get(CANAL_DINHEIRO_SUJO);
  if (!channel) return console.error('[SALDO] Canal não encontrado');

  db.all(`
    SELECT user_id, SUM(ganhos) AS total
    FROM acoes_registradas
    GROUP BY user_id
    ORDER BY total DESC
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro de ações para exibir.');
    }

    const texto = rows.map((r, i) => {
      return `${i+1}. <@${r.user_id}> — 💰 **R$ ${r.total}**`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle('SALDO MENSAL DAS AÇÕES')
      .setDescription(texto)
      .setColor('#f39c12')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Reset mensal
    db.run(`DELETE FROM acoes_registradas`);
  });
}
