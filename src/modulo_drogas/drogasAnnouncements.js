const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

const CANAL_DROGAS = '1465744204637667360';
const META_SEMANAL = 1500000;

module.exports = function drogasAnnouncements(client) {
  console.log('[DROGAS] Módulo carregado.');

  // Todo domingo às 23:59
  cron.schedule('59 23 * * 0', async () => {
    console.log('[DROGAS] Executando anúncio semanal...');
    await processSaldo(client);
  }, { timezone: 'America/Sao_Paulo' });
};

async function processSaldo(client) {
  const channel = client.channels.cache.get(CANAL_DROGAS);
  if (!channel) return console.error('[DROGAS] Canal não encontrado');

  db.all(`
    SELECT user_id, SUM(valor) AS total
    FROM drogas_farmadas
    GROUP BY user_id
    ORDER BY total DESC
  `, [], async (err, rows) => {
    if (err) return console.error(err);

    if (!rows || rows.length === 0) {
      return channel.send('Nenhum registro de farm de drogas para exibir.');
    }

    const totalGeral = rows.reduce((acc, r) => acc + r.total, 0);
    const progresso = ((totalGeral / META_SEMANAL) * 100).toFixed(1);

    const texto = rows.map((r, i) => {
      return `${i+1}. <@${r.user_id}> — 💊 R$ ${r.total.toLocaleString('pt-BR')}`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle('SALDO SEMANAL DE DROGAS')
      .setDescription(
        `Meta semanal: **R$ ${META_SEMANAL.toLocaleString('pt-BR')}**\n` +
        `Farmado até agora: **R$ ${totalGeral.toLocaleString('pt-BR')}**\n` +
        `Progresso: **${progresso}%**\n\n${texto}`
      )
      .setColor('#e74c3c')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Reset semanal
    db.run(`DELETE FROM drogas_farmadas`);
    console.log('[DROGAS] Reset realizado após anúncio.');
  });
}
