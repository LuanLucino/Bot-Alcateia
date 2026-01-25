const { EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

async function anunciarRankingSemanal(client, canalId) {
  const canal = await client.channels.fetch(canalId).catch(() => null);
  if (!canal) return;

  db.all(`
    SELECT user_id, cogumelo, semente
    FROM users_farm_monthly
    ORDER BY cogumelo DESC, semente DESC
  `, [], async (err, rows) => {
    if (err || !rows || rows.length === 0) {
      canal.send('Fechamento semanal concluído, porém sem registros válidos.');
      return;
    }

    let texto = rows.map((r, i) =>
      `#${i+1} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Fechamento Semanal')
      .setDescription(texto)
      .setColor('#9b59b6')
      .setTimestamp();

    canal.send({ embeds: [embed] });
  });
}

async function anunciarRankingMensal(client, canalId) {
  const canal = await client.channels.fetch(canalId).catch(() => null);
  if (!canal) return;

  db.all(`
    SELECT user_id, cogumelo, semente
    FROM users_farm_monthly
    ORDER BY cogumelo DESC, semente DESC
  `, [], async (err, rows) => {
    if (err || !rows || rows.length === 0) {
      canal.send('Fechamento mensal concluído, porém sem registros para exibir.');
      return;
    }

    let texto = rows.map((r, i) =>
      `#${i+1} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Fechamento Mensal')
      .setDescription(texto)
      .setColor('#e67e22')
      .setTimestamp();

    canal.send({ embeds: [embed] });
  });
}

module.exports = {
  anunciarRankingSemanal,
  anunciarRankingMensal
};
