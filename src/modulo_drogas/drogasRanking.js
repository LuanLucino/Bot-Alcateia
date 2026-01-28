const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db.js');

const CANAL_DROGAS = '1465744204637667360';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rankingdroga')
    .setDescription('Mostra o ranking dos membros que mais farmaram drogas'),

  async execute(interaction) {
    const canalId = interaction.channelId;
    if (canalId !== CANAL_DROGAS) {
      return interaction.reply({ content: 'Este comando só pode ser usado no canal de drogas.', ephemeral: true });
    }

    db.all(`
      SELECT user_id, SUM(valor) AS total
      FROM drogas_farmadas
      GROUP BY user_id
      ORDER BY total DESC
    `, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Erro ao consultar ranking.', ephemeral: true });
      }

      if (!rows || rows.length === 0) {
        return interaction.reply('Nenhum registro de farm de drogas encontrado.');
      }

      const texto = rows.map((r, i) => 
        `${i+1}. <@${r.user_id}> — 💊 R$ ${r.total.toLocaleString('pt-BR')}`
      ).join("\n");

      const embed = new EmbedBuilder()
        .setTitle('RANKING DE DROGAS')
        .setDescription(texto)
        .setColor('#9b59b6')
        .setTimestamp()
        .setFooter({ text: 'Ranking semanal de farm de drogas' });

      return interaction.reply({ embeds: [embed] });
    });
  }
};
