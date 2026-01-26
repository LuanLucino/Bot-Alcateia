const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking_mensal')
    .setDescription('Mostra o ranking mensal acumulado.'),

  async execute(interaction) {
    db.all(`
      SELECT user_id, cogumelo, semente,
      (cogumelo + semente) AS total
      FROM users_farm_monthly
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply('Erro ao consultar o ranking mensal.');
      }

      if (!rows || rows.length === 0) {
        return interaction.reply('Ainda não existem registros no ranking mensal.');
      }

      let texto = rows.map((r, i) => {
        const pos = i + 1;
        const medal = pos === 1 ? ':crown:' : pos === 2 ? ':second_place:' : pos === 3 ? ':third_place:' : `**#${pos}**`;
        return `${medal} <@${r.user_id}> — Cog: **${r.cogumelo}** | Sem: **${r.semente}** | Total: **${r.total}**`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('RANKING MENSAL')
        .setDescription(texto)
        .setColor('#9b59b6')
        .setTimestamp()
        .setFooter({ text: 'Ranking mensal' });

      await interaction.reply({ embeds: [embed] });
    });
  }
};
