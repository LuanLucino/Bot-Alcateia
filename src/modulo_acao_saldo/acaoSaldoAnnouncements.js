const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const CANAL_DINHEIRO_SUJO = '1465739674483036274';

module.exports = function acaoSaldoAnnouncements(client) {
  console.log('[SALDO] Módulo carregado.');

  // Teste temporário: 28/01 às 12:20
  cron.schedule('20 12 28 1 *', async () => {
    console.log('[SALDO] Executando anúncio de teste...');
    await processSaldo(client);
  }, { timezone: 'America/Sao_Paulo' });
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
      return `${i+1}. <@${r.user_id}> — 💰 **R$ ${r.total.toLocaleString('pt-BR')}**`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle('SALDO DAS AÇÕES (Teste)')
      .setDescription(texto)
      .setColor('#f39c12')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Reset após anúncio
    db.run(`DELETE FROM acoes_registradas`);
    console.log('[SALDO] Reset realizado após anúncio.');
  });
}
