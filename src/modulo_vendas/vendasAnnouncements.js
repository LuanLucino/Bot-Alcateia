const cron = require('node-cron');
const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');

const CANAL_VENDAS = '1465093834072391812';

module.exports = (client) => {
  // Teste: executa no dia 28/01 às 18:10
  cron.schedule('10 18 28 1 *', async () => {
    const canal = await client.channels.fetch(CANAL_VENDAS);

    db.all(`
      SELECT user_id, SUM(valor) AS total
      FROM vendas_pacotes
      GROUP BY user_id
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) return console.error(err);

      if (!rows || rows.length === 0) {
        return canal.send('Nenhuma venda registrada neste período de teste.');
      }

      const texto = rows.map((r, i) =>
        `${i+1}. <@${r.user_id}> — 📦 R$ ${r.total.toLocaleString('pt-BR')}`
      ).join("\n");

      const embed = new EmbedBuilder()
        .setTitle('TESTE: ENCERRAMENTO DE VENDAS DE PACOTES')
        .setDescription(texto)
        .setColor('#e67e22')
        .setTimestamp()
        .setFooter({ text: 'Reset de teste em 28/01 às 18:10' });

      await canal.send({ embeds: [embed] });

      // Reset da tabela
      db.run(`DELETE FROM vendas_pacotes`);
    });
  });
};
