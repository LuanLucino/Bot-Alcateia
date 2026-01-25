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

      let texto = rows.map((r, i) => {
        let pos = i + 1;
        let icon;

        if (pos === 1) icon = ':crown:';
        else if (pos === 2) icon = ':second_place:';
        else if (pos === 3) icon = ':third_place:';
        else icon = '•';

        return `${icon} **#${pos}** <@${r.user_id}> — Cogumelos: **${r.cogumelo}** | Sementes: **${r.semente}**`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('RANKING MENSAL')
        .setDescription(texto)
        .setColor('#9b59b6')
        .setTimestamp()
        .setFooter({ text: 'Atualizado automaticamente • Ranking Mensal' });

      await interaction.reply({ embeds: [embed] });
    });
  }
};
