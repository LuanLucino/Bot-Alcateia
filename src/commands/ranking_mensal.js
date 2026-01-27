const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking_mensal')
    .setDescription('Mostra o ranking mensal acumulado.'),

  async execute(interaction) {
    await interaction.deferReply();

    db.all(`
      SELECT user_id, cogumelo, semente,
      (cogumelo + semente) AS total
      FROM users_farm_monthly
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.editReply('Erro ao consultar o ranking mensal.');
      }

      if (!rows || rows.length === 0) {
        return interaction.editReply('Ainda não existem registros no ranking mensal.');
      }

      const medals = ['🥇', '🥈', '🥉'];

      const rankingText = rows.map((r, i) => {
        if (i < 3) {
          return `${medals[i]} <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}**`;
        } else {
          return `${i + 1}. <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}**`;
        }
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('RANKING MENSAL')
        .setDescription(rankingText)
        .setColor('#9b59b6')
        .setTimestamp()
        .setFooter({ text: 'Ranking mensal acumulado' });

      return interaction.editReply({ embeds: [embed] });
    });
  }
};
