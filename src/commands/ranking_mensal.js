const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking_mensal')
    .setDescription('Mostra o ranking mensal acumulado.'),

  async execute(interaction) {
    db.all(`
      SELECT user_id, cogumelo, semente
      FROM users_farm_monthly
      ORDER BY cogumelo DESC, semente DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply('Erro ao consultar o ranking mensal.');
      }

      if (!rows || rows.length === 0) {
        return interaction.reply('Ainda não existem registros no ranking mensal.');
      }

      let texto = rows.map((r, i) =>
        `#${i+1} <@${r.user_id}> — Cogumelos: **${r.cogumelo}**, Sementes: **${r.semente}**`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('Ranking Mensal')
        .setDescription(texto)
        .setColor('#3498db')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    });
  }
};
