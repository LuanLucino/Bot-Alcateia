const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra o ranking semanal de farm.'),

  async execute(interaction) {
    await interaction.deferReply();

    db.all(`
      SELECT user_id, cogumelo, semente,
        (cogumelo + semente) AS total
      FROM users_farm
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.editReply('Erro ao consultar ranking semanal.');
      }

      if (!rows || rows.length === 0) {
        return interaction.editReply('Nenhum dado registrado esta semana.');
      }

      // Medals para top3
      const medals = ['🥇', '🥈', '🥉'];

      // Monta o texto do ranking
      const rankingText = rows.map((r, i) => {
        if (i < 3) {
          return `${medals[i]} <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}**`;
        } else {
          return `${i + 1}. <@${r.user_id}> — 🍄 **${r.cogumelo}** | 🌱 **${r.semente}**`;
        }
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('RANKING SEMANAL')
        .setColor('#3498db')
        .setDescription(rankingText)
        .setTimestamp()
        .setFooter({ text: 'Ranking semanal atualizado' });

      return interaction.editReply({ embeds: [embed] });
    });
  }
};
