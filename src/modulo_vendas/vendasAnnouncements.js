const cron = require('node-cron');
const db = require('../database/db.js');
const { EmbedBuilder } = require('discord.js');

const CANAL_VENDAS = '1465093834072391812';

module.exports = (client) => {
  // Reset no último dia do mês às 23:59
  cron.schedule('59 23 L * *', async () => {
    const canal = await client.channels.fetch(CANAL_VENDAS);

    db.all(`
      SELECT user_id, SUM(valor) AS total
      FROM vendas_pacotes
      GROUP BY user_id
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) return console.error(err);

      if (!rows || rows.length === 0) {
        return canal.send('Nenhuma venda registrada este mês.');
      }

      const texto = rows.map((r, i) =>
        `${i+1}. <@${r.user_id}> — 📦 R$ ${r.total.toLocaleString('pt-BR')}`
      ).join("\n");

      const embed = new EmbedBuilder()
        .setTitle('ENCERRAMENTO MENSAL DE VENDAS DE PACOTES')
        .setDescription(texto)
        .setColor('#e67e22')
        .setTimestamp()
        .setFooter({ text: 'Ranking mensal de vendas de pacotes' });

      await canal.send({ embeds: [embed] });

      // Reset da tabela
      db.run(`DELETE FROM vendas_pacotes`);
    });
  });
};
