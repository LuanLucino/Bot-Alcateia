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

      // Top 3
      const top3 = rows.slice(0, 3);
      const resto = rows.slice(3);

      let descTop = '';
      top3.forEach((r, i) => {
        const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉';
        descTop += `${medal} <@${r.user_id}> — Cog: **${r.cogumelo}** | Sem: **${r.semente}** | Total: **${r.total}**\n`;
      });

      let descRest = '';
      resto.forEach((r, i) => {
        descRest += `**${i + 4}.** <@${r.user_id}> — Cog: **${r.cogumelo}** | Sem: **${r.semente}** | Total: **${r.total}**\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle('RANKING SEMANAL')
        .setColor('#3498db')
        .addFields(
          { name: 'Top 3', value: descTop || 'Nenhum' },
          { name: 'Demais Colocados', value: descRest || 'Nenhum' }
        )
        .setTimestamp()
        .setFooter({ text: 'Ranking semanal atualizado' });

      return interaction.editReply({ embeds: [embed] });
    });
  }
};
